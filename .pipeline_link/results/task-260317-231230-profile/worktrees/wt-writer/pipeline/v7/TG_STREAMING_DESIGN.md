# Telegram Findings Streaming Design

## Architecture

Use one JSONL stream file per worker under `artifacts/streams/`:

- `claude-writer.jsonl`
- `codex-reviewer.jsonl`

Do not use a single shared `findings-stream.jsonl` file. Two workers can run at the same time during `code-review`, and cross-process append contention on Windows PowerShell 5.1 is avoidable if each worker owns its own file.

The supervisor keeps stream state inside `status.telegram`:

- `finding_cursors`: last consumed line number per worker stream
- `finding_lines`: last N rendered Telegram lines
- `finding_hidden_count`: number of older lines not shown
- `finding_totals`: total streamed findings per worker

Telegram still uses one message per task. We do not send new messages for findings. The existing edit flow updates the same task message, and the renderer gains a `--- Findings ---` section.

For real-time behavior, the stream reader should run in the existing 15-second progress refresh loop. The 2-minute heartbeat should call the same helper as a safety net, but 2 minutes alone is too slow for "as discovered" feedback.

## How It Works

```text
Start-TaskSupervisor
  -> launches Claude Writer and Codex Reviewer
  -> creates empty stream files in artifacts/streams/
  -> stores finding cursors in status.telegram

Claude Writer / Codex Reviewer
  -> confirm a meaningful finding, fix, or blocker
  -> append one JSON line to their own stream file
  -> continue working without waiting for Telegram

Wait-V7Launchers loop
  -> every 15 seconds: read new JSONL lines after each worker cursor
  -> ignore blank lines and incomplete final JSON line
  -> merge new entries by timestamp, worker, seq
  -> update status.telegram.finding_lines
  -> Invoke-V7TelegramScript edits the existing Telegram message

Task completion
  -> final worker result files still determine worker OK/FAILED/SKIPPED state
  -> reviewer result JSON can backfill any missed reviewer stream entries
  -> final Telegram message keeps the findings section plus DONE/FAILED result
```

## File Format For Findings Stream

One JSON object per line, UTF-8, newline terminated.

Required fields:

- `version`: integer, start with `1`
- `timestamp`: `Get-V7Timestamp` value
- `worker`: `claude-writer` or `codex-reviewer`
- `worker_key`: `claude_writer` or `codex_reviewer`
- `seq`: per-worker integer starting at `1`
- `kind`: `finding`, `fix`, `blocker`, or `note`
- `summary`: short Telegram-safe text
- `task_id`: task id

Optional fields:

- `severity`: `P0`..`P3` for reviewer findings
- `file`: repo-relative file path
- `line`: source line number
- `commit_hash`: for writer commit milestones
- `details`: longer free text kept for artifacts, not shown in Telegram by default

Example:

```json
{"version":1,"timestamp":"2026-03-17T10:12:04.5519213+05:00","worker":"claude-writer","worker_key":"claude_writer","seq":1,"kind":"fix","summary":"Added null guard before cart total render","task_id":"task-260317-101155-publicmenu","file":"pages/PublicMenu/base/x.jsx","line":418,"commit_hash":"","details":""}
{"version":1,"timestamp":"2026-03-17T10:14:19.0137842+05:00","worker":"codex-reviewer","worker_key":"codex_reviewer","seq":1,"kind":"finding","summary":"Missing t('public_menu.empty.title') on empty state","task_id":"task-260317-101155-publicmenu","severity":"P1","file":"pages/PublicMenu/base/x.jsx","line":530,"commit_hash":"","details":"Hardcoded user-facing string remains in empty state block."}
```

## How Findings Integrate Into Existing TG Message Layout

Current message shape already has:

- title
- running/done line
- worker lines
- result lines

Add one section between worker lines and result lines:

```text
Code Review: PublicMenu
RUNNING | 10:11 (19 min)
--- Workers ---
CC Writer: running... (19 min)
Codex Reviewer: OK, 2 findings (7 min)
Merge: waiting
--- Findings ---
[CC Writer] Finding #1: Added null guard before cart total render
[Codex Reviewer] Finding #1: Missing t('public_menu.empty.title') on empty state
[CC Writer] Finding #2: Revoked preview object URL on unmount
(3 earlier findings hidden)
```

Rules:

- show newest 8 lines only
- keep older findings counted via `finding_hidden_count`
- use per-worker sequence number from the JSONL entry
- do not show `details` unless the team later adds a verbose mode

## Proposed Code Changes

### Changes To `Start-TaskSupervisor.ps1` (heartbeat section)

```powershell
# Ensure-V7TelegramState additions
if (-not (Test-V7HasProperty -InputObject $telegramState -Name 'finding_cursors') -or -not ($telegramState['finding_cursors'] -is [System.Collections.IDictionary])) {
    $telegramState['finding_cursors'] = [ordered]@{}
}
if (-not (Test-V7HasProperty -InputObject $telegramState -Name 'finding_lines') -or $null -eq $telegramState['finding_lines']) {
    $telegramState['finding_lines'] = @()
}
if (-not (Test-V7HasProperty -InputObject $telegramState -Name 'finding_hidden_count') -or $null -eq $telegramState['finding_hidden_count']) {
    $telegramState['finding_hidden_count'] = 0
}
if (-not (Test-V7HasProperty -InputObject $telegramState -Name 'finding_totals') -or -not ($telegramState['finding_totals'] -is [System.Collections.IDictionary])) {
    $telegramState['finding_totals'] = [ordered]@{}
}

function Update-V7TelegramFindingStreamState {
    param(
        [hashtable]$Status,
        [string]$ArtifactsDir
    )

    if ([string]::IsNullOrWhiteSpace($ArtifactsDir)) {
        return
    }

    $telegramState = Ensure-V7TelegramState -Status $Status
    $newEntries = @()

    foreach ($workerName in @('claude-writer', 'codex-reviewer')) {
        $cursor = 0
        if ((Test-V7HasProperty -InputObject $telegramState['finding_cursors'] -Name $workerName)) {
            $cursor = [int]$telegramState['finding_cursors'][$workerName]
        }

        $streamResult = Read-V7FindingStreamEntries -Path (Get-V7FindingStreamPath -ArtifactsDir $ArtifactsDir -WorkerName $workerName) -SkipLines $cursor
        $telegramState['finding_cursors'][$workerName] = [int]$streamResult.next_line
        $newEntries += @($streamResult.entries)
    }

    if (@($newEntries).Count -eq 0) {
        return
    }

    $allLines = @($telegramState['finding_lines'])
    foreach ($entry in @($newEntries | Sort-Object timestamp, worker, seq)) {
        $workerLabel = switch ([string]$entry.worker_key) {
            'claude_writer' { 'CC Writer' }
            'codex_reviewer' { 'Codex Reviewer' }
            default { [string]$entry.worker }
        }

        $line = '[' + $workerLabel + '] Finding #' + [string]$entry.seq + ': ' + [string]$entry.summary
        $allLines += $line

        $total = 0
        if ((Test-V7HasProperty -InputObject $telegramState['finding_totals'] -Name ([string]$entry.worker_key))) {
            $total = [int]$telegramState['finding_totals'][[string]$entry.worker_key]
        }
        $telegramState['finding_totals'][[string]$entry.worker_key] = $total + 1
    }

    $maxVisible = 8
    if ($allLines.Count -gt $maxVisible) {
        $telegramState['finding_hidden_count'] = $allLines.Count - $maxVisible
        $telegramState['finding_lines'] = @($allLines | Select-Object -Last $maxVisible)
    } else {
        $telegramState['finding_hidden_count'] = 0
        $telegramState['finding_lines'] = $allLines
    }
}

# New-V7WorkflowTelegramMessageText additions, after worker lines and before result lines
$findingLines = @($telegramState['finding_lines'])
if ($findingLines.Count -gt 0) {
    $lines += '--- Findings ---'
    $lines += $findingLines
    if ([int]$telegramState['finding_hidden_count'] -gt 0) {
        $lines += '(' + [string]$telegramState['finding_hidden_count'] + ' earlier findings hidden)'
    }
}

# Wait-V7Launchers changes
if ((Get-Date) -ge $nextHeartbeat) {
    if ($Workflow -eq 'code-review') {
        Update-V7TelegramCodeReviewStateFromArtifacts -Status $Status -ArtifactsDir $ArtifactsDir -OverallState 'RUNNING' -ErrorMessage ''
        Update-V7TelegramFindingStreamState -Status $Status -ArtifactsDir $ArtifactsDir
        Set-V7Status -StatusPath $StatusPath -Status $Status
    }

    Invoke-V7TelegramScript -Config $Config -Status $Status -StatusPath $StatusPath -State 'HEARTBEAT' -Message $heartbeatText -EventsPath $EventsPath -QueueRunDir $QueueRunDir -ArtifactsDir $ArtifactsDir -TaskId $Status.task_id -Workflow $Workflow -WarningMessage 'Telegram heartbeat failed' -WarningData $heartbeatData | Out-Null
    $nextHeartbeat = $nextHeartbeat.AddMinutes(2)
}

if (-not [string]::IsNullOrWhiteSpace($Workflow) -and (Get-Date) -ge $nextProgressRefresh) {
    if ($Workflow -eq 'code-review') {
        Update-V7TelegramFindingStreamState -Status $Status -ArtifactsDir $ArtifactsDir
        Set-V7Status -StatusPath $StatusPath -Status $Status
    }

    Invoke-V7TelegramScript -Config $Config -Status $Status -StatusPath $StatusPath -State $Status.state -Message $stageName -EventsPath $EventsPath -QueueRunDir $QueueRunDir -ArtifactsDir $ArtifactsDir -TaskId $Status.task_id -Workflow $Workflow -WarningMessage 'Telegram progress refresh failed' -WarningData @{ stage = $stageName; pids = $alivePids } | Out-Null
    $nextProgressRefresh = (Get-Date).AddSeconds(15)
}
```

Notes:

- The 15-second refresh becomes the actual streaming path.
- The 2-minute heartbeat remains the durable safety sweep.
- Completed worker states are still driven by result files, not by the stream.

### Changes To `Invoke-ClaudeWriter.ps1` (findings output)

```powershell
$findingStreamPath = Get-V7FindingStreamPath -ArtifactsDir $artifactsDir -WorkerName (if ($Mode -eq 'writer') { 'claude-writer' } else { 'claude-reconcile' })
Write-V7TextFile -Path $findingStreamPath -Content ''

$prompt = @"
You are the $modeLabel for MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Bundle file: $bundlePath
Summary file: $summaryPath
Live findings stream: $findingStreamPath

Instructions:
1. Read the bundle file FIRST.
2. Do NOT scan the repository. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if they are directly imported by the target code or named explicitly in the task.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Whenever you confirm a meaningful fix, blocker, or important implementation decision, append one JSON line to $findingStreamPath.
6. Use worker='claude-writer', worker_key='claude_writer', and sequence numbers starting at 1.
7. Keep summary text short enough for Telegram.
8. Stream at most 8 entries total.
9. Do not rewrite or delete earlier stream lines.
10. Before finishing, write a concise markdown summary to $summaryPath.

Example stream append:
powershell.exe -NoProfile -Command "& { Add-Content -LiteralPath '$findingStreamPath' -Value '{""version"":1,""timestamp"":""' + (Get-Date).ToString('o') + '"",""worker"":""claude-writer"",""worker_key"":""claude_writer"",""seq"":1,""kind"":""fix"",""summary"":""Added null guard before total render"",""task_id"":""$($task.task_id)""}' }"

Task instructions:
$($task.task.body)
"@

# Optional safety backfill after Claude exits successfully
if (Test-V7ExitSuccess $exitCode -and -not [string]::IsNullOrWhiteSpace($headCommit)) {
    Add-V7FindingStreamEntry -Path $findingStreamPath -Worker 'claude-writer' -WorkerKey 'claude_writer' -Sequence 9999 -Kind 'note' -Summary ('Committed ' + $headCommit.Substring(0, 7)) -TaskId $task.task_id -CommitHash $headCommit
}
```

Why this design:

- the model streams only meaningful milestones, not every shell command
- stream writes are tiny and infrequent
- reconcile mode can use its own file later without affecting code-review streaming

### Changes To `Invoke-CodexReviewer.ps1` (findings output)

```powershell
$findingStreamPath = Get-V7FindingStreamPath -ArtifactsDir $artifactsDir -WorkerName 'codex-reviewer'
Write-V7TextFile -Path $findingStreamPath -Content ''

$prompt = @"
You are the independent reviewer in MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Review bundle: $bundlePath
Live findings stream: $findingStreamPath

Instructions:
1. Read the review bundle file FIRST.
2. Do NOT scan the repository. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if the code imports or references them directly.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Report only NEW issues that are NOT already listed in the Known Bugs section of the bundle.
6. Each time you confirm a NEW finding, append one JSON line to $findingStreamPath immediately.
7. Use worker='codex-reviewer', worker_key='codex_reviewer', and sequence numbers starting at 1.
8. Keep summary text short enough for Telegram.
9. Stream at most 8 entries total.
10. Return final JSON that matches the schema.

Task instructions:
$($task.task.body)
"@

# Final safety backfill so Telegram does not miss findings if Codex skipped streaming any line.
if (Test-Path -LiteralPath $resultPath) {
    $reviewPayload = Read-V7Json -Path $resultPath
    Sync-V7ReviewFindingsToStream -Path $findingStreamPath -ReviewPayload $reviewPayload -TaskId $task.task_id
}
```

Why this design:

- reviewer findings already exist in structured JSON at the end, so final backfill is reliable
- live stream still gives visibility while the worker is running
- the backfill step prevents a silent empty stream if the model forgets to emit one item live

### Changes To `Send-Telegram.ps1` (if needed)

```powershell
# No functional changes required.
# Send-Telegram.ps1 already edits the existing Telegram message when EditMessageId is present.
# The streamed findings appear automatically once Start-TaskSupervisor.ps1 renders them into the message text.
```

### New Helper Functions For `V7.Common.ps1` (if needed)

```powershell
function Get-V7FindingStreamPath {
    param(
        [Parameter(Mandatory = $true)][string]$ArtifactsDir,
        [Parameter(Mandatory = $true)][string]$WorkerName
    )

    $streamDir = Ensure-V7Directory -Path (Join-Path $ArtifactsDir 'streams')
    return Join-Path $streamDir ($WorkerName + '.jsonl')
}

function Add-V7FindingStreamEntry {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Worker,
        [Parameter(Mandatory = $true)][string]$WorkerKey,
        [Parameter(Mandatory = $true)][int]$Sequence,
        [Parameter(Mandatory = $true)][string]$Kind,
        [Parameter(Mandatory = $true)][string]$Summary,
        [string]$TaskId = '',
        [string]$Severity = '',
        [string]$File = '',
        [int]$Line = 0,
        [string]$CommitHash = '',
        [string]$Details = ''
    )

    $entry = [ordered]@{
        version = 1
        timestamp = Get-V7Timestamp
        worker = $Worker
        worker_key = $WorkerKey
        seq = $Sequence
        kind = $Kind
        summary = $Summary
        task_id = $TaskId
        severity = $Severity
        file = $File
        line = $Line
        commit_hash = $CommitHash
        details = $Details
    }

    Append-V7TextFile -Path $Path -Content (($entry | ConvertTo-Json -Compress -Depth 6) + "`n")
}

function Read-V7FindingStreamEntries {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [int]$SkipLines = 0
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return [ordered]@{
            entries = @()
            next_line = $SkipLines
        }
    }

    $lines = (Read-V7TextFile -Path $Path) -split "`r?`n"
    $entries = @()
    $nextLine = $SkipLines

    for ($i = $SkipLines; $i -lt $lines.Count; $i++) {
        $line = [string]$lines[$i]
        if ([string]::IsNullOrWhiteSpace($line)) {
            $nextLine = $i + 1
            continue
        }

        try {
            $entries += ,($line | ConvertFrom-Json)
            $nextLine = $i + 1
        } catch {
            # Likely a partial final line while the worker is still writing.
            break
        }
    }

    return [ordered]@{
        entries = $entries
        next_line = $nextLine
    }
}

function Sync-V7ReviewFindingsToStream {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)]$ReviewPayload,
        [string]$TaskId = ''
    )

    $existing = Read-V7FindingStreamEntries -Path $Path -SkipLines 0
    $seen = @{}
    foreach ($entry in @($existing.entries)) {
        $seen[[string]$entry.seq] = $true
    }

    $sequence = 1
    foreach ($finding in @($ReviewPayload.findings)) {
        if (-not $seen.ContainsKey([string]$sequence)) {
            Add-V7FindingStreamEntry -Path $Path -Worker 'codex-reviewer' -WorkerKey 'codex_reviewer' -Sequence $sequence -Kind 'finding' -Summary ([string]$finding.title) -TaskId $TaskId -Severity ([string]$finding.severity) -File ([string]$finding.file) -Line ([int]$finding.line) -Details ([string]$finding.description)
        }
        $sequence++
    }
}
```

## Risk Assessment

- Low: file append overhead is tiny because each worker writes only on meaningful findings.
- Low: Telegram traffic does not increase in message count because the system still edits one message.
- Medium: Claude or Codex may forget to emit live entries. Mitigation: reviewer backfill from final JSON, and optional writer final milestone backfill.
- Medium: message text can grow too large on long tasks. Mitigation: keep only the newest 8 lines visible and show hidden count.
- Low: worker crash while writing a line is safe. The reader stops on the first invalid JSON line and retries on the next refresh.
- Low: concurrent writes are isolated because each worker owns its own JSONL file.

## Estimated Effort

- Small to medium: `V7.Common.ps1` helper functions and supervisor render/cursor plumbing
- Medium: prompt updates for Claude Writer and Codex Reviewer
- Small: reviewer backfill helper
- Medium: end-to-end testing with one long-running task and one forced worker crash

Rough total: 1 working day for implementation and manual verification, or 1.5 days if the team wants tests added to `Test-V7Pipeline.ps1`.
