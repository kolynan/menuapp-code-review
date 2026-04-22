param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
if (-not (Test-Path -LiteralPath $commonPath)) {
    throw ('V7.Common.ps1 not found at: ' + $commonPath + ' (PSScriptRoot=' + $PSScriptRoot + ')')
}
. $commonPath

function Get-ConsensusCommitInfo {
    param(
        [string]$ResultPath,
        [string]$WorktreePath,
        [string]$BaseCommit,
        [string]$Label
    )

    if (-not (Test-Path -LiteralPath $ResultPath)) {
        throw ($Label + ' result file not found: ' + $ResultPath)
    }
    $result = Read-V7Json -Path $ResultPath
    if ($null -eq $result) {
        throw ($Label + ' result file is empty or invalid JSON: ' + $ResultPath)
    }
    # Extract commit_hash from JSON result (PSCustomObject) without Get-V7StateText
    # which is only available in the parent supervisor process.
    $commit = ''
    $prop = $result.PSObject.Properties['commit_hash']
    if ($null -ne $prop -and $null -ne $prop.Value) {
        $commit = [string]$prop.Value
    }
    if ([string]::IsNullOrWhiteSpace($commit) -and (Test-Path -LiteralPath $WorktreePath)) {
        $candidate = (Invoke-V7Git -RepoRoot $WorktreePath -Arguments @('rev-parse', 'HEAD') -FailureMessage ('Unable to resolve ' + $Label + ' HEAD')).stdout.Trim()
        if (-not [string]::IsNullOrWhiteSpace($candidate) -and ($candidate -ne $BaseCommit)) {
            $commit = $candidate
        }
    }
    if ([string]::IsNullOrWhiteSpace($commit)) {
        throw ($Label + ' did not produce a commit hash.')
    }

    return [ordered]@{
        result = $result
        commit = $commit
    }
}

function Get-ConsensusStatusMap {
    param(
        [string]$RepoRoot,
        [string]$BaseCommit,
        [string]$HeadRef
    )

    $map = @{}
    if ([string]::IsNullOrWhiteSpace($BaseCommit)) {
        return $map
    }

    $result = Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('diff', '--no-renames', '--name-status', "$BaseCommit..$HeadRef") -FailureMessage 'Unable to inspect changed files for consensus compare'
    foreach ($line in ($result.stdout -split "`r?`n")) {
        if ([string]::IsNullOrWhiteSpace([string]$line)) {
            continue
        }
        $parts = $line -split "`t"
        if ($parts.Count -lt 2) {
            continue
        }
        $status = $parts[0].Trim().ToUpperInvariant()
        $path = $parts[$parts.Count - 1].Trim()
        if (-not [string]::IsNullOrWhiteSpace($path)) {
            $map[$path] = $status
        }
    }
    return $map
}

function Get-ConsensusPatchExcerpt {
    param(
        [string]$RepoRoot,
        [string]$BaseCommit,
        [string]$HeadRef,
        [string]$FilePath
    )

    if ([string]::IsNullOrWhiteSpace($FilePath)) {
        return ''
    }

    $patch = (Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('diff', "$BaseCommit..$HeadRef", '--', $FilePath) -FailureMessage ('Unable to diff ' + $FilePath)).stdout
    $trimmed = $patch.Trim()
    if ($trimmed.Length -le 2400) {
        return $trimmed
    }
    return $trimmed.Substring(0, 2400) + "`n...[truncated]"
}

# Main body wrapped in try/catch to ensure readable error output in stderr log.
# Without this, PS5.1 child process errors can appear as blank messages in the
# supervisor's crash log due to stderr redirect encoding issues.
try {

$task = Read-V7Json -Path $TaskJsonPath
if ($null -eq $task) {
    throw ('Task JSON not found or invalid: ' + $TaskJsonPath)
}
$artifactsDir = $task.paths.artifacts_dir
$writerWorktree = $task.paths.writer_worktree
$codexWorktree = $task.paths.review_worktree
$baseCommit = [string]$task.git.base_commit
$resultPath = Join-Path $artifactsDir 'consensus-compare.result.json'
$startedAt = Get-V7Timestamp

if ([string]::IsNullOrWhiteSpace($baseCommit)) {
    throw 'Consensus compare requires git.base_commit.'
}

# --- Single-writer fallback (KB-069): if one writer has no commit, use the other ---
$ccResultFile = Join-Path $artifactsDir 'claude-writer.result.json'
$codexResultFile = Join-Path $artifactsDir 'codex-writer.result.json'

$writerInfo = $null
$codexInfo = $null
$writerError = $null
$codexError = $null
try {
    $writerInfo = Get-ConsensusCommitInfo -ResultPath $ccResultFile -WorktreePath $writerWorktree -BaseCommit $baseCommit -Label 'CC writer'
} catch {
    $writerError = $_.Exception.Message
}
try {
    $codexInfo = Get-ConsensusCommitInfo -ResultPath $codexResultFile -WorktreePath $codexWorktree -BaseCommit $baseCommit -Label 'Codex writer'
} catch {
    $codexError = $_.Exception.Message
}

if ($null -eq $writerInfo -and $null -eq $codexInfo) {
    $detail = 'CC: ' + $(if ($writerError) { $writerError } else { 'no result' }) + '; Codex: ' + $(if ($codexError) { $codexError } else { 'no result' })
    throw ('Neither CC writer nor Codex writer produced a commit. ' + $detail)
}

$writerCommit = $(if ($null -ne $writerInfo) { [string]$writerInfo.commit } else { '' })
$codexCommit = $(if ($null -ne $codexInfo) { [string]$codexInfo.commit } else { '' })

# Skip status map for writers with no commit (single-writer fallback)
$writerStatusMap = $(if ([string]::IsNullOrWhiteSpace($writerCommit)) { @{} } else { Get-ConsensusStatusMap -RepoRoot $writerWorktree -BaseCommit $baseCommit -HeadRef $writerCommit })
$codexStatusMap = $(if ([string]::IsNullOrWhiteSpace($codexCommit)) { @{} } else { Get-ConsensusStatusMap -RepoRoot $codexWorktree -BaseCommit $baseCommit -HeadRef $codexCommit })
$allFiles = @((@($writerStatusMap.Keys) + @($codexStatusMap.Keys)) | Sort-Object -Unique)
$agreements = New-Object System.Collections.Generic.List[object]
$disagreements = New-Object System.Collections.Generic.List[object]

foreach ($file in $allFiles) {
    $ccStatus = if (Test-V7HasProperty -InputObject $writerStatusMap -Name $file) { [string]$writerStatusMap[$file] } else { '' }
    $codexStatus = if (Test-V7HasProperty -InputObject $codexStatusMap -Name $file) { [string]$codexStatusMap[$file] } else { '' }
    $ccChanged = -not [string]::IsNullOrWhiteSpace($ccStatus)
    $codexChanged = -not [string]::IsNullOrWhiteSpace($codexStatus)
    $entryId = 'consensus-' + (Get-V7HashFragment -Value $file -Length 10)

    if ($ccChanged -and $codexChanged) {
        $ccPatch = Get-ConsensusPatchExcerpt -RepoRoot $writerWorktree -BaseCommit $baseCommit -HeadRef $writerCommit -FilePath $file
        $codexPatch = Get-ConsensusPatchExcerpt -RepoRoot $codexWorktree -BaseCommit $baseCommit -HeadRef $codexCommit -FilePath $file
        if ($ccPatch -eq $codexPatch) {
            $agreements.Add([ordered]@{
                id = $entryId
                file = $file
                kind = 'matching_patch'
                selected_source = 'cc'
                cc_status = $ccStatus
                codex_status = $codexStatus
                summary = 'Both writers produced the same patch.'
            })
            continue
        }

        $disagreements.Add([ordered]@{
            id = $entryId
            file = $file
            kind = 'overlapping_change'
            status = 'open'
            resolved_source = ''
            cc_status = $ccStatus
            codex_status = $codexStatus
            cc_patch_excerpt = $ccPatch
            codex_patch_excerpt = $codexPatch
            rounds = @()
        })
        continue
    }

    $agreements.Add([ordered]@{
        id = $entryId
        file = $file
        kind = $(if ($ccChanged) { 'cc_only' } else { 'codex_only' })
        selected_source = $(if ($ccChanged) { 'cc' } else { 'codex' })
        cc_status = $ccStatus
        codex_status = $codexStatus
        summary = $(if ($ccChanged) { 'Only CC writer changed this file.' } else { 'Only Codex writer changed this file.' })
    })
}

$result = [ordered]@{
    status = 'completed'
    started_at = $startedAt
    ended_at = Get-V7Timestamp
    writer_commit = $writerCommit
    codex_commit = $codexCommit
    writer_files = @($writerStatusMap.Keys | Sort-Object)
    codex_files = @($codexStatusMap.Keys | Sort-Object)
    compared_files = $allFiles
    agreements = @($agreements)
    disagreements = @($disagreements)
    consensus_reached = ($disagreements.Count -eq 0)
}
Write-V7Json -Path $resultPath -Data $result

} catch {
    # Re-throw with explicit message to prevent blank errors in stderr log.
    # PS5.1 child processes with 2> redirect can lose the original error text.
    $msg = 'Comparator failed: ' + $_.Exception.Message
    if ($_.ScriptStackTrace) {
        $msg += ' | Stack: ' + ($_.ScriptStackTrace -replace "`r?`n", ' << ')
    }
    throw $msg
}
