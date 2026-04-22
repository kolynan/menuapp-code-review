param(
    [Parameter(Mandatory = $true)][string]$TaskFile,
    [string]$TaskId,
    [string]$ConfigPath,
    [string]$RepoRoot,
    [string]$TaskType,
    [string]$TaskPage,
    [string]$TaskTopic,
    [string]$TaskBudget,
    [string]$TaskAgent
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath
$script:SupervisorStepCounter = 0

function New-StageSummary {
    param([string]$TaskId, [string]$Workflow, [string]$State, [string]$Message)
    return "[$State] $TaskId [$Workflow] $Message"
}

function Convert-V7StepDataToText {
    param($Data)

    if ($null -eq $Data) {
        return ''
    }

    try {
        return ($Data | ConvertTo-Json -Depth 12)
    } catch {
        return [string]$Data
    }
}

function Write-SupervisorStepLog {
    param(
        [string]$QueueRunDir,
        [string]$State,
        [string]$Message,
        $Data
    )

    if ([string]::IsNullOrWhiteSpace($QueueRunDir)) {
        return
    }
    Ensure-V7Directory -Path $QueueRunDir | Out-Null

    if ($null -eq $script:SupervisorStepCounter) {
        $script:SupervisorStepCounter = 0
    }
    $script:SupervisorStepCounter++

    $stateSlug = (ConvertTo-V7Slug -Value $State).ToUpperInvariant()
    if ([string]::IsNullOrWhiteSpace($stateSlug)) {
        $stateSlug = 'STEP'
    }
    $stepPath = Join-Path $QueueRunDir ('step-{0:D2}-{1}.log' -f $script:SupervisorStepCounter, $stateSlug)
    $lines = @(
        ('timestamp: ' + (Get-V7Timestamp)),
        ('state: ' + $State),
        ('message: ' + $Message)
    )
    if ($null -ne $Data) {
        $lines += @('data:', (Convert-V7StepDataToText -Data $Data))
    }

    Write-V7TextFile -Path $stepPath -Content (($lines -join "`n") + "`n")
}

function Add-SupervisorStage {
    param(
        [string]$QueueRunDir,
        [string]$EventsPath,
        [string]$State,
        [string]$Message,
        $Data
    )

    if (-not [string]::IsNullOrWhiteSpace($EventsPath)) {
        Add-V7Event -EventsPath $EventsPath -State $State -Message $Message -Data $Data
    }
    Write-SupervisorStepLog -QueueRunDir $QueueRunDir -State $State -Message $Message -Data $Data
}
function Ensure-V7TelegramState {
    param([hashtable]$Status)

    if ($null -eq $Status) {
        return $null
    }

    if (-not $Status.Contains('telegram') -or -not ($Status['telegram'] -is [System.Collections.IDictionary])) {
        $Status['telegram'] = [ordered]@{}
    }

    $telegramState = $Status['telegram']
    if (-not $telegramState.Contains('message_id') -or $null -eq $telegramState['message_id']) {
        $telegramState['message_id'] = ''
    }
    if (-not $telegramState.Contains('status_segments') -or $null -eq $telegramState['status_segments']) {
        $telegramState['status_segments'] = @()
    }
    if (-not $telegramState.Contains('current_message') -or $null -eq $telegramState['current_message']) {
        $telegramState['current_message'] = ''
    }
    if (-not $telegramState.Contains('last_text') -or $null -eq $telegramState['last_text']) {
        $telegramState['last_text'] = ''
    }
    if (-not $telegramState.Contains('last_delivery') -or $null -eq $telegramState['last_delivery']) {
        $telegramState['last_delivery'] = ''
    }
    if (-not $telegramState.Contains('fallback_count') -or $null -eq $telegramState['fallback_count']) {
        $telegramState['fallback_count'] = 0
    }
    if (-not $telegramState.Contains('worker_lines') -or $null -eq $telegramState['worker_lines']) {
        $telegramState['worker_lines'] = @()
    }
    return $telegramState
}

function Get-V7TelegramDisplayTitle {
    param(
        [hashtable]$Status,
        [string]$TaskId,
        [string]$Workflow
    )

    $resolvedTaskId = ''
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $resolvedTaskId = $TaskId
    } elseif ($Status -and $Status.Contains('task_id') -and -not [string]::IsNullOrWhiteSpace([string]$Status['task_id'])) {
        $resolvedTaskId = [string]$Status['task_id']
    }

    $resolvedWorkflow = ''
    if (-not [string]::IsNullOrWhiteSpace($Workflow)) {
        $resolvedWorkflow = $Workflow
    } elseif ($Status -and $Status.Contains('workflow') -and -not [string]::IsNullOrWhiteSpace([string]$Status['workflow'])) {
        $resolvedWorkflow = [string]$Status['workflow']
    }

    $resolvedPage = $resolvedTaskId
    if ($Status -and $Status.Contains('page') -and -not [string]::IsNullOrWhiteSpace([string]$Status['page'])) {
        $resolvedPage = [string]$Status['page']
    }

    $parts = @()
    if (-not [string]::IsNullOrWhiteSpace($resolvedWorkflow)) {
        $parts += ('[' + $resolvedWorkflow + ']')
    }
    if (-not [string]::IsNullOrWhiteSpace($resolvedPage)) {
        $parts += $resolvedPage
    }
    return ($parts -join ' ').Trim()
}

function Get-V7TelegramDurationText {
    param([hashtable]$Status)

    if ($null -eq $Status -or -not $Status.Contains('started_at') -or [string]::IsNullOrWhiteSpace([string]$Status['started_at'])) {
        return 'n/a'
    }

    try {
        $startedAt = [DateTimeOffset]::Parse([string]$Status['started_at']).LocalDateTime
    } catch {
        return 'n/a'
    }

    $durationMinutes = [int][Math]::Max(0, [Math]::Round(((Get-Date) - $startedAt).TotalMinutes))
    return ($durationMinutes.ToString() + ' min')
}

function Get-V7TelegramCommitText {
    param([hashtable]$Status)

    $commit = ''
    if ($Status -and $Status.Contains('git') -and $Status['git'] -is [System.Collections.IDictionary]) {
        $gitState = $Status['git']
        foreach ($key in @('merge_commit', 'writer_commit', 'base_commit')) {
            if ($gitState.Contains($key) -and -not [string]::IsNullOrWhiteSpace([string]$gitState[$key])) {
                $commit = [string]$gitState[$key]
                break
            }
        }
    }

    if ([string]::IsNullOrWhiteSpace($commit)) {
        return 'n/a'
    }
    if ($commit.Length -gt 7) {
        return $commit.Substring(0, 7)
    }
    return $commit
}

function Set-V7TelegramSegment {
    param(
        [object[]]$Segments,
        [string]$Value,
        [string]$MatchPrefix
    )

    $items = @($Segments)
    if ($items.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace($MatchPrefix) -and [string]$items[$items.Count - 1] -like ($MatchPrefix + '*')) {
        $items[$items.Count - 1] = $Value
    } elseif ($items.Count -eq 0 -or [string]$items[$items.Count - 1] -ne $Value) {
        $items += $Value
    }
    return @($items)
}

function Update-V7TelegramProgress {
    param(
        [hashtable]$Status,
        [string]$State,
        [string]$Message
    )

    $telegramState = Ensure-V7TelegramState -Status $Status
    if ($null -eq $telegramState) {
        return
    }

    $segments = @($telegramState['status_segments'])
    $normalizedState = if ([string]::IsNullOrWhiteSpace($State)) { '' } else { $State.ToUpperInvariant() }
    $normalizedMessage = if ([string]::IsNullOrWhiteSpace($Message)) { '' } else { $Message.Trim() }

    switch ($normalizedState) {
        'CLAIMED' {
            if ($segments.Count -eq 0) {
                $segments = @('Claimed')
            } else {
                $segments[0] = 'Claimed'
            }
        }
        'PREPARING' {
            $segments = Set-V7TelegramSegment -Segments $segments -Value 'Preparing' -MatchPrefix 'Preparing'
        }
        'RUNNING' {
            $segments = Set-V7TelegramSegment -Segments $segments -Value 'Running' -MatchPrefix 'Running'
        }
        'HEARTBEAT' {
            $runningSegment = 'Running'
            if ($normalizedMessage -match '\((\d+)m elapsed\)') {
                $runningSegment = ('Running (' + $matches[1] + 'm)')
            }
            $segments = Set-V7TelegramSegment -Segments $segments -Value $runningSegment -MatchPrefix 'Running'
        }
        'MERGING' {
            $segments = Set-V7TelegramSegment -Segments $segments -Value 'Merging' -MatchPrefix 'Merging'
        }
        'DONE' {
            $segments = Set-V7TelegramSegment -Segments $segments -Value (([string][char]0x2705) + ' DONE') -MatchPrefix ([string][char]0x2705)
        }
        'FAILED' {
            $segments = Set-V7TelegramSegment -Segments $segments -Value (([string][char]0x274C) + ' FAILED') -MatchPrefix ([string][char]0x274C)
        }
    }

    $telegramState['status_segments'] = @($segments)
    if ($normalizedState -eq 'DONE' -or $normalizedState -eq 'FAILED') {
        $telegramState['current_message'] = ''
    } elseif (-not [string]::IsNullOrWhiteSpace($normalizedMessage)) {
        $telegramState['current_message'] = $normalizedMessage
    }
}

function Get-V7TelegramValue {
    param(
        $Object,
        [string]$Name
    )

    if ($null -eq $Object -or [string]::IsNullOrWhiteSpace($Name)) {
        return $null
    }
    if ($Object -is [System.Collections.IDictionary] -and $Object.Contains($Name)) {
        return $Object[$Name]
    }

    $property = $Object.PSObject.Properties[$Name]
    if ($property) {
        return $property.Value
    }
    return $null
}

function Get-V7CodeReviewProcessInfo {
    param(
        [hashtable]$Status,
        [string]$WorkerKey
    )

    if ($null -eq $Status -or -not $Status.Contains('processes') -or -not ($Status['processes'] -is [System.Collections.IDictionary])) {
        return $null
    }

    $processes = $Status['processes']
    if ($processes.Contains($WorkerKey)) {
        return $processes[$WorkerKey]
    }
    return $null
}

function Get-V7TelegramLocalDateTime {
    param([string]$Timestamp)

    if ([string]::IsNullOrWhiteSpace($Timestamp)) {
        return $null
    }

    try {
        return [DateTimeOffset]::Parse($Timestamp).ToLocalTime().DateTime
    } catch {
        return $null
    }
}

function Get-V7TelegramClockText {
    param([string]$Timestamp)

    $resolvedTime = Get-V7TelegramLocalDateTime -Timestamp $Timestamp
    if ($null -eq $resolvedTime) {
        return (Get-Date).ToString('HH:mm')
    }
    return $resolvedTime.ToString('HH:mm')
}

function Get-V7TelegramDurationBetween {
    param(
        [string]$StartedAt,
        [string]$EndedAt
    )

    $startTime = Get-V7TelegramLocalDateTime -Timestamp $StartedAt
    if ($null -eq $startTime) {
        return ''
    }

    $endTime = Get-V7TelegramLocalDateTime -Timestamp $EndedAt
    if ($null -eq $endTime) {
        $endTime = Get-Date
    }

    $minutes = [int][Math]::Max(0, [Math]::Round(($endTime - $startTime).TotalMinutes))
    return ($minutes.ToString() + ' min')
}

function Get-V7TelegramShortCommit {
    param([string]$Commit)

    if ([string]::IsNullOrWhiteSpace($Commit)) {
        return 'n/a'
    }
    if ($Commit.Length -gt 7) {
        return $Commit.Substring(0, 7)
    }
    return $Commit
}

function Get-V7TelegramWorkerLabel {
    param([string]$WorkerKey)

    switch ($WorkerKey) {
        'claude_writer' { return 'CC Writer' }
        'codex_reviewer' { return 'Codex Reviewer' }
        'merge' { return 'Merge' }
        default { return $WorkerKey }
    }
}

function Get-V7TelegramWorkerSortOrder {
    param([string]$WorkerKey)

    switch ($WorkerKey) {
        'claude_writer' { return 1 }
        'codex_reviewer' { return 2 }
        'merge' { return 3 }
        default { return 99 }
    }
}

function Get-V7TelegramWorkerIcon {
    param([string]$State)

    $normalizedState = if ([string]::IsNullOrWhiteSpace($State)) { '' } else { $State.Trim().ToLowerInvariant() }
    switch ($normalizedState) {
        'running' { return [System.Char]::ConvertFromUtf32(0x1F535) }
        'success' { return ([string][char]0x2705) }
        'error' { return ([string][char]0x274C) }
        'skipped' { return (([string][char]0x23ED) + ([string][char]0xFE0F)) }
        default { return [System.Char]::ConvertFromUtf32(0x1F535) }
    }
}

function Get-V7TelegramWorkerEntry {
    param(
        [hashtable]$Status,
        [string]$WorkerKey
    )

    $telegramState = Ensure-V7TelegramState -Status $Status
    if ($null -eq $telegramState -or -not $telegramState.Contains('worker_lines')) {
        return $null
    }

    foreach ($entry in @($telegramState['worker_lines'])) {
        if ($entry -is [System.Collections.IDictionary] -and [string]$entry['key'] -eq $WorkerKey) {
            return $entry
        }
    }
    return $null
}

function Set-V7TelegramWorkerLine {
    param(
        [hashtable]$Status,
        [string]$WorkerKey,
        [string]$State,
        [string]$Text
    )

    $telegramState = Ensure-V7TelegramState -Status $Status
    if ($null -eq $telegramState -or [string]::IsNullOrWhiteSpace($WorkerKey)) {
        return
    }

    $updated = @()
    $entry = $null
    foreach ($item in @($telegramState['worker_lines'])) {
        if ($item -is [System.Collections.IDictionary] -and [string]$item['key'] -eq $WorkerKey) {
            $entry = $item
        } elseif ($null -ne $item) {
            $updated += $item
        }
    }

    if ($null -eq $entry) {
        $entry = [ordered]@{
            key = $WorkerKey
            name = Get-V7TelegramWorkerLabel -WorkerKey $WorkerKey
            sort_order = Get-V7TelegramWorkerSortOrder -WorkerKey $WorkerKey
            state = ''
            text = ''
        }
    }

    $entry['name'] = Get-V7TelegramWorkerLabel -WorkerKey $WorkerKey
    $entry['sort_order'] = Get-V7TelegramWorkerSortOrder -WorkerKey $WorkerKey
    if (-not [string]::IsNullOrWhiteSpace($State)) {
        $entry['state'] = $State
    }
    if ($PSBoundParameters.ContainsKey('Text')) {
        $entry['text'] = if ([string]::IsNullOrWhiteSpace($Text)) { '' } else { $Text.Trim() }
    }

    $updated += $entry
    $telegramState['worker_lines'] = @(
        $updated | Sort-Object {
            if ($_ -is [System.Collections.IDictionary] -and $_.Contains('sort_order')) {
                [int]$_['sort_order']
            } else {
                99
            }
        }
    )
}

function Get-V7TelegramFirstLogLine {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path -LiteralPath $Path)) {
        return ''
    }

    $content = Read-V7TextFile -Path $Path
    foreach ($line in ($content -split "`r?`n")) {
        if (-not [string]::IsNullOrWhiteSpace([string]$line)) {
            return $line.Trim()
        }
    }
    return ''
}

function Get-V7TelegramWorkerFallbackLogs {
    param([string]$WorkerKey)

    switch ($WorkerKey) {
        'claude_writer' { return @('claude-writer.stderr.log', 'claude-writer.launcher.stderr.log') }
        'codex_reviewer' { return @('codex-reviewer.stderr.log', 'codex-reviewer.launcher.stderr.log') }
        'merge' { return @('merge.stderr.log') }
        default { return @() }
    }
}

function Get-V7TelegramResultState {
    param([string]$StatusText)

    $normalizedStatus = if ([string]::IsNullOrWhiteSpace($StatusText)) { '' } else { $StatusText.Trim().ToLowerInvariant() }
    switch ($normalizedStatus) {
        'completed' { return 'success' }
        'succeeded' { return 'success' }
        'success' { return 'success' }
        'running' { return 'running' }
        'skipped' { return 'skipped' }
        'failed' { return 'error' }
        default {
            if ([string]::IsNullOrWhiteSpace($normalizedStatus)) {
                return ''
            }
            return 'error'
        }
    }
}

function Get-V7TelegramResultErrorText {
    param($Result)

    foreach ($key in @('error_message', 'message', 'error')) {
        $value = Get-V7TelegramValue -Object $Result -Name $key
        if (-not [string]::IsNullOrWhiteSpace([string]$value)) {
            return [string]$value
        }
    }

    foreach ($logKey in @('stderr_log', 'stdout_log')) {
        $logPath = [string](Get-V7TelegramValue -Object $Result -Name $logKey)
        $line = Get-V7TelegramFirstLogLine -Path $logPath
        if (-not [string]::IsNullOrWhiteSpace($line)) {
            return $line
        }
    }

    $exitCode = Get-V7TelegramValue -Object $Result -Name 'exit_code'
    if ($null -ne $exitCode -and -not [string]::IsNullOrWhiteSpace([string]$exitCode)) {
        return ('exit code ' + $exitCode)
    }
    return ''
}

function Get-V7TelegramWorkerErrorText {
    param(
        [hashtable]$Status,
        [string]$WorkerKey,
        $Result,
        [string]$FallbackMessage
    )

    $errorText = Get-V7TelegramResultErrorText -Result $Result
    if (-not [string]::IsNullOrWhiteSpace($errorText)) {
        return $errorText
    }

    $logsDir = ''
    if ($Status -and $Status.Contains('paths') -and $Status['paths'] -is [System.Collections.IDictionary] -and $Status['paths'].Contains('logs_dir')) {
        $logsDir = [string]$Status['paths']['logs_dir']
    }
    if (-not [string]::IsNullOrWhiteSpace($logsDir)) {
        foreach ($fileName in @(Get-V7TelegramWorkerFallbackLogs -WorkerKey $WorkerKey)) {
            $line = Get-V7TelegramFirstLogLine -Path (Join-Path $logsDir $fileName)
            if (-not [string]::IsNullOrWhiteSpace($line)) {
                return $line
            }
        }
    }

    $processInfo = Get-V7CodeReviewProcessInfo -Status $Status -WorkerKey $WorkerKey
    $exitCode = Get-V7TelegramValue -Object $processInfo -Name 'exit_code'
    if ($null -ne $exitCode -and -not [string]::IsNullOrWhiteSpace([string]$exitCode)) {
        return ('exit code ' + $exitCode)
    }
    if ($Status -and [string]$Status.current_step -eq 'timeout') {
        return 'timeout'
    }
    if (-not [string]::IsNullOrWhiteSpace($FallbackMessage)) {
        return $FallbackMessage.Trim()
    }
    return 'failed'
}

function Get-V7TelegramWorkerTextFromResult {
    param(
        [hashtable]$Status,
        [string]$WorkerKey,
        $Result
    )

    $resultState = Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $Result -Name 'status'))
    $duration = Get-V7TelegramDurationBetween -StartedAt ([string](Get-V7TelegramValue -Object $Result -Name 'started_at')) -EndedAt ([string](Get-V7TelegramValue -Object $Result -Name 'ended_at'))

    switch ($WorkerKey) {
        'claude_writer' {
            if ($resultState -eq 'success') {
                $changedFiles = @(Get-V7TelegramValue -Object $Result -Name 'changed_files')
                $fileCount = $changedFiles.Count
                $fileLabel = if ($fileCount -eq 1) { 'file' } else { 'files' }
                $parts = @("$fileCount $fileLabel")
                $commitHash = Get-V7TelegramShortCommit -Commit ([string](Get-V7TelegramValue -Object $Result -Name 'commit_hash'))
                if ($commitHash -ne 'n/a') {
                    $parts += ('commit ' + $commitHash)
                }
                $text = $parts -join ', '
                if (-not [string]::IsNullOrWhiteSpace($duration)) {
                    $text += ' (' + $duration + ')'
                }
                return $text
            }
        }
        'codex_reviewer' {
            if ($resultState -eq 'success') {
                $findingsCount = [int](Get-V7TelegramValue -Object $Result -Name 'findings_count')
                $text = "$findingsCount findings"
                if (-not [string]::IsNullOrWhiteSpace($duration)) {
                    $text += ' (' + $duration + ')'
                }
                return $text
            }
        }
    }

    if ($resultState -eq 'running') {
        return 'started...'
    }
    if ($resultState -eq 'skipped') {
        $skippedText = Get-V7TelegramWorkerErrorText -Status $Status -WorkerKey $WorkerKey -Result $Result -FallbackMessage 'skipped'
        if ([string]::IsNullOrWhiteSpace($skippedText)) {
            return 'skipped'
        }
        return $skippedText
    }

    return Get-V7TelegramWorkerErrorText -Status $Status -WorkerKey $WorkerKey -Result $Result -FallbackMessage 'failed'
}

function Update-CodeReviewWorkerLinesFromArtifacts {
    param(
        [hashtable]$Status,
        [string]$ArtifactsDir
    )

    if ($null -eq $Status -or [string]::IsNullOrWhiteSpace($ArtifactsDir) -or -not (Test-Path -LiteralPath $ArtifactsDir)) {
        return
    }

    $writerResult = Read-V7Json -Path (Join-Path $ArtifactsDir 'claude-writer.result.json')
    if ($writerResult) {
        $writerState = Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $writerResult -Name 'status'))
        if ([string]::IsNullOrWhiteSpace($writerState)) {
            $writerState = 'success'
        }
        Set-V7TelegramWorkerLine -Status $Status -WorkerKey 'claude_writer' -State $writerState -Text (Get-V7TelegramWorkerTextFromResult -Status $Status -WorkerKey 'claude_writer' -Result $writerResult)
    }

    $reviewerResult = Read-V7Json -Path (Join-Path $ArtifactsDir 'codex-reviewer.result.json')
    if ($reviewerResult) {
        $reviewerState = Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $reviewerResult -Name 'status'))
        if ([string]::IsNullOrWhiteSpace($reviewerState)) {
            $reviewerState = 'success'
        }
        Set-V7TelegramWorkerLine -Status $Status -WorkerKey 'codex_reviewer' -State $reviewerState -Text (Get-V7TelegramWorkerTextFromResult -Status $Status -WorkerKey 'codex_reviewer' -Result $reviewerResult)
    }

    $mergeResult = Read-V7Json -Path (Join-Path $ArtifactsDir 'merge.result.json')
    if ($mergeResult) {
        $mergeState = Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $mergeResult -Name 'status'))
        if ([string]::IsNullOrWhiteSpace($mergeState)) {
            $mergeState = 'success'
        }

        if ($mergeState -eq 'success') {
            $mergeProcess = Get-V7CodeReviewProcessInfo -Status $Status -WorkerKey 'merge'
            $mergeDuration = Get-V7TelegramDurationBetween -StartedAt ([string](Get-V7TelegramValue -Object $mergeProcess -Name 'started_at')) -EndedAt ([string](Get-V7TelegramValue -Object $mergeProcess -Name 'ended_at'))
            $mergeText = 'commit ' + (Get-V7TelegramShortCommit -Commit ([string](Get-V7TelegramValue -Object $mergeResult -Name 'merge_commit')))
            $details = @()
            if (-not [string]::IsNullOrWhiteSpace($mergeDuration)) {
                $details += $mergeDuration
            }
            $reviewerEntry = Get-V7TelegramWorkerEntry -Status $Status -WorkerKey 'codex_reviewer'
            if ($reviewerEntry -and @('skipped', 'error') -contains [string]$reviewerEntry['state']) {
                $details += 'no review'
            }
            if ($details.Count -gt 0) {
                $mergeText += ' (' + ($details -join ', ') + ')'
            }
            Set-V7TelegramWorkerLine -Status $Status -WorkerKey 'merge' -State 'success' -Text $mergeText
        } elseif ($mergeState -eq 'skipped') {
            Set-V7TelegramWorkerLine -Status $Status -WorkerKey 'merge' -State 'skipped' -Text (Get-V7TelegramWorkerErrorText -Status $Status -WorkerKey 'merge' -Result $mergeResult -FallbackMessage 'skipped')
        } else {
            Set-V7TelegramWorkerLine -Status $Status -WorkerKey 'merge' -State 'error' -Text (Get-V7TelegramWorkerErrorText -Status $Status -WorkerKey 'merge' -Result $mergeResult -FallbackMessage 'failed')
        }
    }
}

function Finalize-CodeReviewTelegramFailure {
    param(
        [hashtable]$Status,
        [string]$ArtifactsDir,
        [string]$ErrorMessage
    )

    if ($null -eq $Status) {
        return
    }

    Update-CodeReviewWorkerLinesFromArtifacts -Status $Status -ArtifactsDir $ArtifactsDir

    foreach ($workerKey in @('claude_writer', 'codex_reviewer', 'merge')) {
        $entry = Get-V7TelegramWorkerEntry -Status $Status -WorkerKey $workerKey
        $currentState = if ($entry) { [string]$entry['state'] } else { '' }
        if ($currentState -eq 'success' -or $currentState -eq 'error' -or $currentState -eq 'skipped') {
            continue
        }

        $processInfo = Get-V7CodeReviewProcessInfo -Status $Status -WorkerKey $workerKey
        $processState = [string](Get-V7TelegramValue -Object $processInfo -Name 'state')
        $shouldError = $false
        if ($currentState -eq 'running' -or $processState -eq 'running' -or $processState -eq 'failed') {
            $shouldError = $true
        }
        if ($workerKey -eq 'merge' -and ([string]$Status.current_step -eq 'merge' -or [string]$Status.current_step -eq 'failed')) {
            $shouldError = $true
        }

        if ($shouldError) {
            $errorText = Get-V7TelegramWorkerErrorText -Status $Status -WorkerKey $workerKey -Result $null -FallbackMessage $ErrorMessage
            Set-V7TelegramWorkerLine -Status $Status -WorkerKey $workerKey -State 'error' -Text $errorText
        } else {
            Set-V7TelegramWorkerLine -Status $Status -WorkerKey $workerKey -State 'skipped' -Text 'skipped'
        }
    }
}

function New-V7GenericTelegramMessageText {
    param(
        [hashtable]$Status,
        [string]$TaskId,
        [string]$Workflow,
        [string]$State,
        [string]$Message,
        [string]$ArtifactsDir
    )

    $telegramState = Ensure-V7TelegramState -Status $Status
    $title = Get-V7TelegramDisplayTitle -Status $Status -TaskId $TaskId -Workflow $Workflow
    $arrow = [string][char]0x2192
    $hourglass = [string][char]0x23F3
    $segments = @()
    if ($telegramState -and $telegramState.Contains('status_segments') -and $null -ne $telegramState['status_segments']) {
        $segments = @($telegramState['status_segments'])
    }

    $lines = @()
    if (-not [string]::IsNullOrWhiteSpace($title)) {
        $lines += $title
    }
    if ($segments.Count -gt 0) {
        $lines += ($hourglass + ' ' + (($segments | ForEach-Object { [string]$_ }) -join (' ' + $arrow + ' ')))
    }

    $normalizedState = if ([string]::IsNullOrWhiteSpace($State)) { '' } else { $State.ToUpperInvariant() }
    if ($normalizedState -eq 'DONE' -or $normalizedState -eq 'FAILED') {
        $changedFiles = @(Get-SupervisorChangedFiles -ArtifactsDir $ArtifactsDir)
        $lines += ('Commit: ' + (Get-V7TelegramCommitText -Status $Status))
        $lines += ('Files: ' + $changedFiles.Count + ' changed')
        $lines += ('Duration: ' + (Get-V7TelegramDurationText -Status $Status))
        if ($normalizedState -eq 'FAILED' -and -not [string]::IsNullOrWhiteSpace($Message)) {
            $lines += ('Error: ' + $Message.Trim())
        }
    } elseif ($telegramState -and $telegramState.Contains('current_message')) {
        $currentMessage = [string]$telegramState['current_message']
        if (-not [string]::IsNullOrWhiteSpace($currentMessage)) {
            $titleText = if ([string]::IsNullOrWhiteSpace($title)) { '' } else { $title.Trim() }
            if ($currentMessage.Trim() -ne $titleText) {
                $lines += ('Current: ' + $currentMessage.Trim())
            }
        }
    }

    return (($lines | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }) -join "`n")
}

function New-V7CodeReviewTelegramMessageText {
    param(
        [hashtable]$Status,
        [string]$TaskId,
        [string]$Workflow,
        [string]$State
    )

    $telegramState = Ensure-V7TelegramState -Status $Status
    $title = Get-V7TelegramDisplayTitle -Status $Status -TaskId $TaskId -Workflow $Workflow
    $segments = @()
    if ($telegramState -and $telegramState.Contains('status_segments') -and $null -ne $telegramState['status_segments']) {
        $segments = @($telegramState['status_segments'])
    }
    $workerEntries = @()
    if ($telegramState -and $telegramState.Contains('worker_lines') -and $null -ne $telegramState['worker_lines']) {
        $workerEntries = @($telegramState['worker_lines'] | Where-Object { $_ -is [System.Collections.IDictionary] })
    }

    $resolvedState = if ([string]::IsNullOrWhiteSpace($State)) { [string]$Status.state } else { $State }
    $normalizedState = if ([string]::IsNullOrWhiteSpace($resolvedState)) { '' } else { $resolvedState.ToUpperInvariant() }
    $startClock = Get-V7TelegramClockText -Timestamp ([string](Get-V7TelegramValue -Object $Status -Name 'started_at'))
    $arrow = ([string][char]0x2192)
    $hourglass = ([string][char]0x23F3)
    $check = ([string][char]0x2705)
    $cross = ([string][char]0x274C)
    $warning = ([string][char]0x26A0) + ([string][char]0xFE0F)

    $lines = @()
    if (-not [string]::IsNullOrWhiteSpace($title)) {
        $lines += $title
    }

    if ($normalizedState -eq 'DONE' -or $normalizedState -eq 'FAILED') {
        $endedAt = [string](Get-V7TelegramValue -Object $Status -Name 'ended_at')
        if ([string]::IsNullOrWhiteSpace($endedAt)) {
            $endedAt = Get-V7Timestamp
        }
        $endClock = Get-V7TelegramClockText -Timestamp $endedAt
        $durationText = Get-V7TelegramDurationBetween -StartedAt ([string](Get-V7TelegramValue -Object $Status -Name 'started_at')) -EndedAt $endedAt
        $isPartial = $false
        if ($normalizedState -eq 'DONE') {
            foreach ($entry in $workerEntries) {
                if (@('error', 'skipped') -contains [string]$entry['state']) {
                    $isPartial = $true
                    break
                }
            }
        }

        $statusLabel = if ($normalizedState -eq 'FAILED') {
            $cross + ' FAILED'
        } elseif ($isPartial) {
            $warning + ' DONE (partial)'
        } else {
            $check + ' DONE'
        }

        $summaryLine = $statusLabel + ' | ' + $startClock + ' ' + $arrow + ' ' + $endClock
        if (-not [string]::IsNullOrWhiteSpace($durationText)) {
            $summaryLine += ' (' + $durationText + ')'
        }
        $lines += $summaryLine
    } elseif ($segments.Count -gt 0) {
        $lines += ($hourglass + ' ' + $startClock + ' ' + (($segments | ForEach-Object { [string]$_ }) -join (' ' + $arrow + ' ')))
    }

    foreach ($entry in $workerEntries) {
        $workerName = if ($entry.Contains('name')) { [string]$entry['name'] } else { [string]$entry['key'] }
        $workerState = if ($entry.Contains('state')) { [string]$entry['state'] } else { '' }
        $workerText = if ($entry.Contains('text')) { [string]$entry['text'] } else { '' }
        if ([string]::IsNullOrWhiteSpace($workerText)) {
            switch ($workerState) {
                'running' { $workerText = 'started...' }
                'skipped' { $workerText = 'skipped' }
                'error' { $workerText = 'failed' }
                default { $workerText = 'done' }
            }
        }
        $lines += ((Get-V7TelegramWorkerIcon -State $workerState) + ' ' + $workerName + ': ' + $workerText)
    }

    return (($lines | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }) -join "`n")
}

function New-V7TelegramMessageText {
    param(
        [hashtable]$Status,
        [string]$TaskId,
        [string]$Workflow,
        [string]$State,
        [string]$Message,
        [string]$ArtifactsDir
    )

    $resolvedWorkflow = $Workflow
    if ([string]::IsNullOrWhiteSpace($resolvedWorkflow) -and $Status -and $Status.Contains('workflow')) {
        $resolvedWorkflow = [string]$Status['workflow']
    }
    $normalizedWorkflow = if ([string]::IsNullOrWhiteSpace($resolvedWorkflow)) { '' } else { $resolvedWorkflow.Trim().ToLowerInvariant() }

    if ($normalizedWorkflow -eq 'code-review') {
        return New-V7CodeReviewTelegramMessageText -Status $Status -TaskId $TaskId -Workflow $resolvedWorkflow -State $State
    }
    return New-V7GenericTelegramMessageText -Status $Status -TaskId $TaskId -Workflow $resolvedWorkflow -State $State -Message $Message -ArtifactsDir $ArtifactsDir
}

function Invoke-V7TelegramScript {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [hashtable]$Status,
        [string]$StatusPath,
        [string]$State,
        [string]$Message,
        [string]$EventsPath,
        [string]$QueueRunDir,
        [string]$ArtifactsDir,
        [string]$TaskId,
        [string]$Workflow,
        [string]$WarningMessage,
        $WarningData
    )

    $telegramState = $null
    $text = if ([string]::IsNullOrWhiteSpace($Message)) { '' } else { $Message }
    if ($Status) {
        $telegramState = Ensure-V7TelegramState -Status $Status
        Update-V7TelegramProgress -Status $Status -State $State -Message $Message
        $text = New-V7TelegramMessageText -Status $Status -TaskId $TaskId -Workflow $Workflow -State $State -Message $Message -ArtifactsDir $ArtifactsDir
    }

    $previousMessageId = ''
    if ($telegramState -and $telegramState.Contains('message_id') -and -not [string]::IsNullOrWhiteSpace([string]$telegramState['message_id'])) {
        $previousMessageId = [string]$telegramState['message_id']
    }

    $result = $null
    if (-not [string]::IsNullOrWhiteSpace($previousMessageId)) {
        $result = Edit-V7TelegramMessage -Config $Config -MessageId $previousMessageId -Text $text -EventsPath $EventsPath
        if (-not $result.ok) {
            $result = Send-V7TelegramMessage -Config $Config -Text $text -EventsPath $EventsPath
            if ($result.ok -and $telegramState) {
                $telegramState['fallback_count'] = [int]$telegramState['fallback_count'] + 1
                $telegramState['last_delivery'] = 'fallback_send'
            }
        } elseif ($telegramState) {
            $telegramState['last_delivery'] = 'edit'
        }
    } else {
        $result = Send-V7TelegramMessage -Config $Config -Text $text -EventsPath $EventsPath
        if ($result.ok -and $telegramState) {
            $telegramState['last_delivery'] = 'send'
        }
    }

    $ok = ($result -and $result.ok)
    if ($ok -and $telegramState) {
        if (-not [string]::IsNullOrWhiteSpace([string]$result.message_id)) {
            $telegramState['message_id'] = [string]$result.message_id
        }
        $telegramState['last_text'] = $text
        if ($StatusPath) {
            Set-V7Status -StatusPath $StatusPath -Status $Status
        }
    }
    if (-not $ok -and $WarningMessage) {
        Add-SupervisorStage -QueueRunDir $QueueRunDir -EventsPath $EventsPath -State 'WARNING' -Message $WarningMessage -Data $WarningData
    }
    return $ok
}

function Write-SupervisorCrashLog {
    param(
        [string]$QueueRunDir,
        [string]$TaskId,
        [string]$TaskFile,
        $ErrorRecord
    )

    if ([string]::IsNullOrWhiteSpace($QueueRunDir)) {
        return ''
    }
    Ensure-V7Directory -Path $QueueRunDir | Out-Null

    $crashPath = Join-Path $QueueRunDir 'supervisor-crash.log'
    $lines = @(
        ('timestamp: ' + (Get-V7Timestamp)),
        ('task_id: ' + $TaskId),
        ('task_file: ' + $TaskFile),
        ('message: ' + $ErrorRecord.Exception.Message),
        ('script_stack_trace: ' + $ErrorRecord.ScriptStackTrace),
        ('position_message: ' + $ErrorRecord.InvocationInfo.PositionMessage),
        'error_record:',
        ($ErrorRecord | Out-String).TrimEnd()
    )
    Write-V7TextFile -Path $crashPath -Content (($lines -join "`n") + "`n")
    return $crashPath
}

function Get-SupervisorChangedFiles {
    param([string]$ArtifactsDir)

    if ([string]::IsNullOrWhiteSpace($ArtifactsDir) -or -not (Test-Path -LiteralPath $ArtifactsDir)) {
        return @()
    }

    $changedFiles = @()
    foreach ($resultName in @('merge.result.json', 'claude-writer.result.json', 'ux-discussion.result.json')) {
        $resultPath = Join-Path $ArtifactsDir $resultName
        $result = Read-V7Json -Path $resultPath
        if ($result -and $result.changed_files) {
            $changedFiles += @($result.changed_files)
        }
    }
    return @($changedFiles | Where-Object { $_ } | Select-Object -Unique)
}

function Write-SupervisorSummary {
    param(
        [string]$ResultsDir,
        [string]$TaskId,
        [string]$Workflow,
        [datetime]$StartedAt,
        [hashtable]$Status,
        [string]$ArtifactsDir,
        [string]$ErrorMessage
    )

    if ([string]::IsNullOrWhiteSpace($ResultsDir)) {
        return
    }

    Ensure-V7Directory -Path $ResultsDir | Out-Null
    $summaryPath = Join-Path $ResultsDir 'summary.md'
    $endedAt = Get-Date
    $durationMinutes = [Math]::Round(($endedAt - $StartedAt).TotalMinutes, 2)
    $changedFiles = @(Get-SupervisorChangedFiles -ArtifactsDir $ArtifactsDir)
    $lines = @(
        '# V7 Task Summary',
        '',
        ('Task ID: ' + $TaskId),
        ('Workflow: ' + $Workflow),
        ('Started: ' + $StartedAt.ToString('o')),
        ('Finished: ' + $endedAt.ToString('o')),
        ('Duration Minutes: ' + $durationMinutes),
        ('State: ' + $(if ($Status) { $Status.state } else { 'unknown' })),
        ('Current Step: ' + $(if ($Status) { $Status.current_step } else { '' }))
    )
    $lines += @(
        '',
        '## Git Commits',
        ('- base_commit: ' + $(if ($Status -and $Status.git -and $Status.git.base_commit) { $Status.git.base_commit } else { 'n/a' })),
        ('- writer_commit: ' + $(if ($Status -and $Status.git -and $Status.git.writer_commit) { $Status.git.writer_commit } else { 'n/a' })),
        ('- merge_commit: ' + $(if ($Status -and $Status.git -and $Status.git.merge_commit) { $Status.git.merge_commit } else { 'n/a' }))
    )
    $lines += @('', '## Exit Codes')
    if ($Status -and $Status.processes -and $Status.processes.Count -gt 0) {
        foreach ($name in @($Status.processes.Keys)) {
            $processInfo = $Status.processes[$name]
            $exitCode = if ($processInfo -and $null -ne $processInfo.exit_code) { $processInfo.exit_code } else { 'n/a' }
            $state = if ($processInfo -and $processInfo.state) { $processInfo.state } else { 'unknown' }
            $lines += ('- {0}: state={1}, exit_code={2}' -f $name, $state, $exitCode)
        }
    } else {
        $lines += '- none'
    }
    $lines += @('', '## Errors')
    if ($ErrorMessage) {
        $lines += $ErrorMessage
    } elseif ($Status -and $Status.error) {
        $lines += $Status.error
    } else {
        $lines += 'none'
    }
    $lines += @('', '## Changed Files')
    if ($changedFiles.Count -gt 0) {
        $lines += ($changedFiles | ForEach-Object { '- ' + $_ })
    } else {
        $lines += '- none'
    }

    Write-V7TextFile -Path $summaryPath -Content (($lines -join "`n") + "`n")
}
function Start-V7WorkerLauncher {
    param(
        [string]$ScriptPath,
        [string]$TaskJsonPath,
        [string]$Name,
        [string]$LogsDir,
        [string]$Mode
    )

    $stdoutPath = Join-Path $LogsDir "$Name.launcher.stdout.log"
    $stderrPath = Join-Path $LogsDir "$Name.launcher.stderr.log"
    $args = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ScriptPath, '-TaskJsonPath', $TaskJsonPath)
    if ($Mode) {
        $args += @('-Mode', $Mode)
    }
    return Start-Process -FilePath $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -ArgumentList $args -WorkingDirectory (Split-Path -Parent $TaskJsonPath) -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru -WindowStyle Hidden
}

function Wait-V7Launchers {
    param(
        [System.Diagnostics.Process[]]$Processes,
        [int]$TimeoutMinutes,
        [string]$StatusPath,
        [hashtable]$Status,
        [string]$EventsPath,
        [string]$QueueRunDir,
        [hashtable]$Config,
        [string]$HeartbeatLabel
    )

    $startedAt = Get-Date
    $deadline = $startedAt.AddMinutes($TimeoutMinutes)
    $nextHeartbeat = $startedAt.AddMinutes(5)

    while ($true) {
        $allExited = $true
        $alivePids = @()
        foreach ($proc in $Processes) {
            if (-not $proc.HasExited) {
                $allExited = $false
                $alivePids += $proc.Id
            }
        }

        $stageName = if ($HeartbeatLabel) { $HeartbeatLabel } elseif ($Status.current_step) { [string]$Status.current_step } else { 'stage' }

        if ($allExited) {
            return $true
        }
        if ((Get-Date) -gt $deadline) {
            foreach ($proc in $Processes) {
                if (-not $proc.HasExited) {
                    Stop-V7ProcessTree -ProcessId $proc.Id
                }
            }
            $Status.state = 'FAILED'
            $Status.current_step = 'timeout'
            Set-V7Status -StatusPath $StatusPath -Status $Status
            Add-SupervisorStage -QueueRunDir $QueueRunDir -EventsPath $EventsPath -State 'FAILED' -Message 'Worker timeout' -Data @{ stage = $stageName; pids = ($Processes | ForEach-Object { $_.Id }); timeout_minutes = $TimeoutMinutes }
            return $false
        }
        if ((Get-Date) -ge $nextHeartbeat) {
            $elapsedMinutes = [int][Math]::Floor(((Get-Date) - $startedAt).TotalMinutes)
            $heartbeatText = "$([char]0x23F3) [$stageName] running... (${elapsedMinutes}m elapsed)"
            Add-SupervisorStage -QueueRunDir $QueueRunDir -EventsPath $EventsPath -State 'HEARTBEAT' -Message $heartbeatText -Data @{ stage = $stageName; pids = $alivePids; elapsed_minutes = $elapsedMinutes }
            Invoke-V7TelegramScript -Config $Config -Status $Status -StatusPath $StatusPath -State 'HEARTBEAT' -Message $heartbeatText -EventsPath $EventsPath -QueueRunDir $QueueRunDir -WarningMessage 'Telegram heartbeat failed' -WarningData @{ stage = $stageName; elapsed_minutes = $elapsedMinutes; pids = $alivePids } | Out-Null
            $nextHeartbeat = $nextHeartbeat.AddMinutes(5)
        }

        Start-Sleep -Seconds 5
        Set-V7Status -StatusPath $StatusPath -Status $Status
    }
}

function Invoke-V7Stage {
    param(
        [string]$ScriptPath,
        [string]$TaskJsonPath,
        [string]$Name,
        [string]$LogsDir,
        [int]$TimeoutMinutes,
        [string]$StatusPath,
        [hashtable]$Status,
        [string]$EventsPath,
        [string]$QueueRunDir,
        [string]$Mode,
        [hashtable]$Config,
        [string]$Workflow
    )

    $stdoutPath = Join-Path $LogsDir "$Name.launcher.stdout.log"
    $stderrPath = Join-Path $LogsDir "$Name.launcher.stderr.log"
    $proc = Start-V7WorkerLauncher -ScriptPath $ScriptPath -TaskJsonPath $TaskJsonPath -Name $Name -LogsDir $LogsDir -Mode $Mode
    $Status.processes[$Name] = [ordered]@{ pid = $proc.Id; state = 'running' }
    $Status.current_step = $Name
    Set-V7Status -StatusPath $StatusPath -Status $Status
    Add-SupervisorStage -QueueRunDir $QueueRunDir -EventsPath $EventsPath -State 'RUNNING' -Message "Started $Name" -Data @{ pid = $proc.Id; workflow = $Workflow; script_path = $ScriptPath; stdout_log = $stdoutPath; stderr_log = $stderrPath; mode = $Mode }
    $ok = Wait-V7Launchers -Processes @($proc) -TimeoutMinutes $TimeoutMinutes -StatusPath $StatusPath -Status $Status -EventsPath $EventsPath -QueueRunDir $QueueRunDir -Config $Config -HeartbeatLabel $Name
    $exitCode = if ($proc.HasExited) { $proc.ExitCode } else { $null }
    $Status.processes[$Name].state = if ($proc.HasExited -and $proc.ExitCode -eq 0) { 'completed' } elseif ($proc.HasExited) { 'failed' } else { 'failed' }
    if ($null -ne $exitCode) {
        $Status.processes[$Name].exit_code = $exitCode
    }
    Set-V7Status -StatusPath $StatusPath -Status $Status
    $stageSuccess = $ok -and $proc.HasExited -and $proc.ExitCode -eq 0
    $completionState = if ($stageSuccess) { 'RUNNING' } else { 'WARNING' }
    Add-SupervisorStage -QueueRunDir $QueueRunDir -EventsPath $EventsPath -State $completionState -Message "$Name completed" -Data @{ pid = $proc.Id; exit_code = $exitCode; success = $stageSuccess; stdout_log = $stdoutPath; stderr_log = $stderrPath }
    return $stageSuccess
}

$resolvedConfigPath = $ConfigPath
if (-not $resolvedConfigPath) {
    $resolvedConfigPath = Join-Path (Join-Path (Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))) 'scripts') 'task-watcher-config.json'
}
$config = Get-V7Config -ConfigPath $resolvedConfigPath
$supervisorStartedAt = Get-Date
$queueRunDir = Split-Path -Parent $TaskFile
$eventsPath = if ($queueRunDir) { Join-Path $queueRunDir 'events.jsonl' } else { '' }
$statusPath = if ($queueRunDir) { Join-Path $queueRunDir 'status.json' } else { '' }
$repoRootPath = ''
$localRunDir = ''
$logsDir = ''
$artifactsDir = ''
$promptsDir = ''
$worktreesDir = ''
$resultsDir = ''
$taskJsonLocal = ''
$taskJsonQueue = ''
$workerRoot = $PSScriptRoot
$status = $null
$workflow = ''
$success = $false
$supervisorError = ''
$finalQueueDir = $queueRunDir
try {
    $repoRootPath = if ($RepoRoot) { $RepoRoot } else { $config.paths.repo_dir }
    $repoRootPath = [System.IO.Path]::GetFullPath($repoRootPath)
    $localRunRoot = Ensure-V7Directory -Path $config.pipeline.local_run_root
    $parts = Get-V7TaskParts -TaskFile $TaskFile
    $meta = $parts.metadata
    $workflow = if ($TaskType) { $TaskType } elseif ($meta.Contains('type')) { $meta['type'] } else { 'code-review' }
    if ([string]::IsNullOrWhiteSpace([string]$workflow)) {
        $workflow = 'code-review'
    } else {
        $workflow = ([string]$workflow).Trim().ToLowerInvariant()
    }
    switch ($workflow) {
        'bugfix' { $workflow = 'code-review' }
        'feature' { $workflow = 'code-review' }
    }
    $taskPage = if ($TaskPage) { $TaskPage } elseif ($meta.Contains('page')) { $meta['page'] } else { '' }
    $taskTopic = if ($TaskTopic) { $TaskTopic } elseif ($meta.Contains('topic')) { $meta['topic'] } else { '' }
    $budgetSource = if ($TaskBudget) { $TaskBudget } elseif ($meta.Contains('budget')) { $meta['budget'] } else { '10' }
    $taskBudget = ($budgetSource -replace '[$"'']', '').Trim()
    if ([string]::IsNullOrWhiteSpace($taskBudget)) {
        $taskBudget = '10'
    }
    $taskAgent = if ($TaskAgent) { $TaskAgent } elseif ($meta.Contains('agent')) { $meta['agent'] } else { '' }

    if (-not $TaskId) {
        $stem = [System.IO.Path]::GetFileNameWithoutExtension($TaskFile)
        $TaskId = 'task-' + (Get-Date -Format 'yyMMdd-HHmmss') + '-' + (ConvertTo-V7Slug -Value $stem)
    }

    $localRunDir = Ensure-V7Directory -Path (Join-Path $localRunRoot $TaskId)
    $logsDir = Ensure-V7Directory -Path (Join-Path $localRunDir 'logs')
    $artifactsDir = Ensure-V7Directory -Path (Join-Path $localRunDir 'artifacts')
    $promptsDir = Ensure-V7Directory -Path (Join-Path $localRunDir 'prompts')
    $worktreesDir = Ensure-V7Directory -Path (Join-Path $localRunDir 'worktrees')
    $resultsDir = Join-Path (Get-V7ResultsRoot -Config $config) $TaskId
    $taskJsonLocal = Join-Path $localRunDir 'task.json'
    $taskJsonQueue = Join-Path $queueRunDir 'task.json'
    $imagePaths = Get-V7TaskImages -TaskDir $queueRunDir -Metadata $meta -Body $parts.body
    $ccRulesPath = Join-Path (Join-Path $repoRootPath 'scripts') 'cc-system-rules.txt'
    $reviewSchemaPath = Join-Path (Join-Path $repoRootPath 'pipeline\v7\schemas') 'review-findings.schema.json'

    $pageDir = if ($taskPage) { Join-Path $repoRootPath (Join-Path 'pages' $taskPage) } else { '' }
    $codeFile = ''
    $bugsFile = ''
    $readmeFile = ''
    if ($taskPage -and (Test-Path -LiteralPath $pageDir)) {
        $baseDir = Join-Path $pageDir 'base'
        if (Test-Path -LiteralPath $baseDir) {
            $candidate = Get-ChildItem -Path $baseDir -Filter '*.jsx' -File | Select-Object -First 1
            if ($candidate) { $codeFile = $candidate.FullName }
        }
        if (-not $codeFile) {
            $candidate = Get-ChildItem -Path $pageDir -Filter '*.jsx' -File | Select-Object -First 1
            if ($candidate) { $codeFile = $candidate.FullName }
        }
        $bugsPath = Join-Path $pageDir 'BUGS.md'
        if (Test-Path -LiteralPath $bugsPath) { $bugsFile = $bugsPath }
        $readmePath = Join-Path $pageDir 'README.md'
        if (Test-Path -LiteralPath $readmePath) { $readmeFile = $readmePath }
    }

    $status = New-V7StatusObject -TaskId $TaskId -Workflow $workflow -QueueRunDir $queueRunDir -LocalRunDir $localRunDir -Metadata @{ page = $taskPage; topic = $taskTopic; budget = $taskBudget }
    $status.paths.results_dir = $resultsDir
    $status.paths.logs_dir = $logsDir
    $status.paths.artifacts_dir = $artifactsDir
    $status.artifacts.task_file = $TaskFile
    $status.artifacts.task_json = $taskJsonQueue
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'CLAIMED' -Message 'Task claimed by V7 supervisor' -Data @{ task_file = $TaskFile; queue_run_dir = $queueRunDir; local_run_dir = $localRunDir; config_path = $resolvedConfigPath }
    Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'CLAIMED' -Message (($taskPage + ' ' + $taskTopic).Trim()) -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram claim notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

    $taskManifest = [ordered]@{
        task_id = $TaskId
        workflow = $workflow
        metadata = [ordered]@{
            type = $workflow
            page = $taskPage
            topic = $taskTopic
            budget = $taskBudget
            agent = $taskAgent
        }
        task = [ordered]@{
            body = $parts.body
            raw = $parts.raw
            images = $imagePaths
        }
        paths = [ordered]@{
            task_file = $TaskFile
            queue_run_dir = $queueRunDir
            local_run_dir = $localRunDir
            logs_dir = $logsDir
            artifacts_dir = $artifactsDir
            prompts_dir = $promptsDir
            worktrees_dir = $worktreesDir
            results_dir = $resultsDir
            repo_root = $repoRootPath
            cc_rules_path = $ccRulesPath
            review_schema_path = $reviewSchemaPath
            config_path = $resolvedConfigPath
            code_file = $codeFile
            bugs_file = $bugsFile
            readme_file = $readmeFile
        }
        git = [ordered]@{}
    }

    $status.state = 'PREPARING'
    $status.current_step = 'prepare'
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'PREPARING' -Message 'Preparing task context' -Data @{ workflow = $workflow; page = $taskPage; topic = $taskTopic; results_dir = $resultsDir }
    Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'PREPARING' -Message 'Preparing task context' -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram preparing notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

    if ($workflow -eq 'code-review') {
        $baseCommit = Get-V7RepoHead -RepoRoot $repoRootPath
        $writerWorktree = Join-Path $worktreesDir 'wt-writer'
        $reviewWorktree = Join-Path $worktreesDir 'wt-review'
        $mergeWorktree = Join-Path $worktreesDir 'wt-merge'
        New-V7Worktree -RepoRoot $repoRootPath -Path $writerWorktree -BaseCommit $baseCommit -BranchName ("task/{0}-writer" -f $TaskId)
        New-V7Worktree -RepoRoot $repoRootPath -Path $reviewWorktree -BaseCommit $baseCommit -BranchName ("task/{0}-review" -f $TaskId)
        New-V7Worktree -RepoRoot $repoRootPath -Path $mergeWorktree -BaseCommit $baseCommit -BranchName ("task/{0}-merge" -f $TaskId)
        $taskManifest.git.base_commit = $baseCommit
        $taskManifest.paths.writer_worktree = $writerWorktree
        $taskManifest.paths.review_worktree = $reviewWorktree
        $taskManifest.paths.merge_worktree = $mergeWorktree
        $status.git.base_commit = $baseCommit
        $status.paths.writer_worktree = $writerWorktree
        $status.paths.review_worktree = $reviewWorktree
        $status.paths.merge_worktree = $mergeWorktree
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'PREPARING' -Message 'Worktrees prepared' -Data @{ base_commit = $baseCommit; writer_worktree = $writerWorktree; review_worktree = $reviewWorktree; merge_worktree = $mergeWorktree }
    }

    Write-V7Json -Path $taskJsonLocal -Data $taskManifest
    Write-V7Json -Path $taskJsonQueue -Data $taskManifest
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'PREPARING' -Message 'Task manifest written' -Data @{ task_json_local = $taskJsonLocal; task_json_queue = $taskJsonQueue; image_count = @($imagePaths).Count; workflow = $workflow }

    $codeReviewTimeout = [int]$config.pipeline.code_review_timeout_minutes
    $uxTimeout = [int]$config.pipeline.ux_discussion_timeout_minutes
    if ($workflow -eq 'code-review') {
        $status.state = 'RUNNING'
        $status.current_step = 'parallel-review-and-fix'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Starting Claude writer and Codex reviewer' -Data @{ task_json = $taskJsonLocal; logs_dir = $logsDir; timeout_minutes = $codeReviewTimeout }

        $writerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeWriter.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-writer' -LogsDir $logsDir -Mode 'writer'
        $reviewerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-CodexReviewer.ps1') -TaskJsonPath $taskJsonLocal -Name 'codex-reviewer' -LogsDir $logsDir -Mode ''
        $workerStartedAt = Get-V7Timestamp
        $status.processes['claude_writer'] = [ordered]@{ pid = $writerProc.Id; state = 'running'; started_at = $workerStartedAt }
        $status.processes['codex_reviewer'] = [ordered]@{ pid = $reviewerProc.Id; state = 'running'; started_at = $workerStartedAt }
        Set-V7TelegramWorkerLine -Status $status -WorkerKey 'claude_writer' -State 'running' -Text 'started...'
        Set-V7TelegramWorkerLine -Status $status -WorkerKey 'codex_reviewer' -State 'running' -Text 'started...'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Worker launchers started' -Data @{ claude_writer_pid = $writerProc.Id; codex_reviewer_pid = $reviewerProc.Id; logs_dir = $logsDir }
        Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'RUNNING' -Message 'Claude writer + Codex reviewer' -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram parallel stage notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $parallelOk = Wait-V7Launchers -Processes @($writerProc, $reviewerProc) -TimeoutMinutes $codeReviewTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -HeartbeatLabel $status.current_step
        $workerEndedAt = Get-V7Timestamp
        $status.processes['claude_writer'].state = if ($writerProc.HasExited -and $writerProc.ExitCode -eq 0) { 'completed' } elseif ($writerProc.HasExited) { 'failed' } else { 'failed' }
        $status.processes['claude_writer'].exit_code = if ($writerProc.HasExited) { $writerProc.ExitCode } else { $null }
        $status.processes['claude_writer'].ended_at = $workerEndedAt
        $status.processes['codex_reviewer'].state = if ($reviewerProc.HasExited -and $reviewerProc.ExitCode -eq 0) { 'completed' } elseif ($reviewerProc.HasExited) { 'failed' } else { 'failed' }
        $status.processes['codex_reviewer'].exit_code = if ($reviewerProc.HasExited) { $reviewerProc.ExitCode } else { $null }
        $status.processes['codex_reviewer'].ended_at = $workerEndedAt

        $writerResult = Read-V7Json -Path (Join-Path $artifactsDir 'claude-writer.result.json')
        if ((Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $writerResult -Name 'status'))) -eq 'skipped') {
            $status.processes['claude_writer'].state = 'skipped'
        }
        $reviewerResult = Read-V7Json -Path (Join-Path $artifactsDir 'codex-reviewer.result.json')
        if ((Get-V7TelegramResultState -StatusText ([string](Get-V7TelegramValue -Object $reviewerResult -Name 'status'))) -eq 'skipped') {
            $status.processes['codex_reviewer'].state = 'skipped'
        }

        Update-CodeReviewWorkerLinesFromArtifacts -Status $status -ArtifactsDir $artifactsDir
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Parallel review stage completed' -Data @{ parallel_ok = $parallelOk; claude_writer_exit_code = $status.processes['claude_writer'].exit_code; codex_reviewer_exit_code = $status.processes['codex_reviewer'].exit_code; claude_writer_state = $status.processes['claude_writer'].state; codex_reviewer_state = $status.processes['codex_reviewer'].state }
        if (-not $parallelOk) {
            throw 'Parallel worker timeout'
        }

        $status.state = 'MERGING'
        $status.current_step = 'merge'
        $mergeStartedAt = Get-V7Timestamp
        $status.processes['merge'] = [ordered]@{ state = 'running'; started_at = $mergeStartedAt }
        Set-V7TelegramWorkerLine -Status $status -WorkerKey 'merge' -State 'running' -Text 'started...'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'MERGING' -Message 'Running merge step' -Data @{ task_json = $taskJsonLocal; logs_dir = $logsDir }
        Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'MERGING' -Message 'Integrating writer and reviewer results' -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram merge notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $mergeStdout = Join-Path $logsDir 'merge.stdout.log'
        $mergeStderr = Join-Path $logsDir 'merge.stderr.log'
        & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $workerRoot 'Merge-TaskResult.ps1') -TaskJsonPath $taskJsonLocal 1> $mergeStdout 2> $mergeStderr
        $mergeExitCode = $LASTEXITCODE
        $mergeEndedAt = Get-V7Timestamp
        $status.processes['merge'].exit_code = $mergeExitCode
        $status.processes['merge'].ended_at = $mergeEndedAt
        if ($mergeExitCode -ne 0) {
            $status.processes['merge'].state = 'failed'
            Set-V7Status -StatusPath $statusPath -Status $status
            Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'WARNING' -Message 'Merge step failed' -Data @{ exit_code = $mergeExitCode; stdout_log = $mergeStdout; stderr_log = $mergeStderr }
            throw 'Merge step failed'
        }

        $mergeResult = Read-V7Json -Path (Join-Path $artifactsDir 'merge.result.json')
        if ($mergeResult -and $mergeResult.merge_commit) {
            $status.git.merge_commit = $mergeResult.merge_commit
        }
        if ($mergeResult -and $mergeResult.writer_commit) {
            $status.git.writer_commit = $mergeResult.writer_commit
        }
        $status.processes['merge'].state = 'completed'
        Update-CodeReviewWorkerLinesFromArtifacts -Status $status -ArtifactsDir $artifactsDir
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'MERGING' -Message 'Merge step completed' -Data @{ merge_commit = $status.git.merge_commit; writer_commit = $status.git.writer_commit; result_path = (Join-Path $artifactsDir 'merge.result.json') }
    } elseif ($workflow -eq 'ux-discussion') {
        $status.state = 'RUNNING'
        $status.current_step = 'ux-discussion'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Starting UX discussion workflow' -Data @{ task_json = $taskJsonLocal; logs_dir = $logsDir; timeout_minutes = $uxTimeout; topic = $taskTopic }
        Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'RUNNING' -Message 'Claude + Codex + Claude synthesis' -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram UX discussion notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $uxDiscussionOk = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-UxDiscussion.ps1') -TaskJsonPath $taskJsonLocal -Name 'ux-discussion' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -Workflow $workflow -Mode ''
        if (-not $uxDiscussionOk) { throw 'UX discussion workflow failed' }

        $uxDiscussionResultPath = Join-Path $artifactsDir 'ux-discussion.result.json'
        $uxDiscussionResult = Read-V7Json -Path $uxDiscussionResultPath
        if ($uxDiscussionResult -and $uxDiscussionResult.merge_commit) {
            $status.git.merge_commit = [string]$uxDiscussionResult.merge_commit
        }
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'UX discussion workflow completed' -Data @{ merge_commit = $status.git.merge_commit; result_path = $uxDiscussionResultPath; output_file = $(if ($uxDiscussionResult) { $uxDiscussionResult.output_file } else { '' }); repo_output_file = $(if ($uxDiscussionResult) { $uxDiscussionResult.repo_output_file } else { '' }) }
    } else {
        throw ('Unsupported workflow type: ' + $workflow)
    }

    $success = $true
    if ($workflow -eq 'code-review') {
        Update-CodeReviewWorkerLinesFromArtifacts -Status $status -ArtifactsDir $artifactsDir
    }
    $status.ended_at = Get-V7Timestamp
    $status.state = 'DONE'
    $status.current_step = 'done'
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'DONE' -Message 'Task completed' -Data @{ merge_commit = $status.git.merge_commit; results_dir = $resultsDir; local_run_dir = $localRunDir }
    Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
    $finalCommit = if ([string]::IsNullOrWhiteSpace([string]$status.git.merge_commit)) { 'n/a' } else { [string]$status.git.merge_commit }
    Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'DONE' -Message ('Completed. Commit: ' + $finalCommit) -EventsPath $eventsPath -QueueRunDir $queueRunDir -ArtifactsDir $artifactsDir -WarningMessage 'Telegram completion notification failed' -WarningData @{ task_id = $TaskId; merge_commit = $finalCommit } | Out-Null
} catch {
    $supervisorError = $_.Exception.Message
    $crashPath = Write-SupervisorCrashLog -QueueRunDir $queueRunDir -TaskId $TaskId -TaskFile $TaskFile -ErrorRecord $_
    if ($status -and $statusPath) {
        if ($workflow -eq 'code-review') {
            Finalize-CodeReviewTelegramFailure -Status $status -ArtifactsDir $artifactsDir -ErrorMessage $supervisorError
        }
        $status.ended_at = Get-V7Timestamp
        $status.state = 'FAILED'
        $status.current_step = 'failed'
        $status.error = $supervisorError
        Set-V7Status -StatusPath $statusPath -Status $status
    }
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'FAILED' -Message $supervisorError -Data @{ crash_log = $crashPath; task_json = $taskJsonLocal; stack_trace = $_.ScriptStackTrace }
    if ($localRunDir -and $resultsDir -and (Test-Path -LiteralPath $localRunDir)) {
        Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
    }
    $failureWorkflow = if ($workflow) { $workflow } else { 'unknown' }
    $failureTaskId = if ($TaskId) { $TaskId } else { [System.IO.Path]::GetFileNameWithoutExtension($TaskFile) }
    Invoke-V7TelegramScript -Config $config -Status $status -StatusPath $statusPath -State 'FAILED' -Message $supervisorError -EventsPath $eventsPath -QueueRunDir $queueRunDir -ArtifactsDir $artifactsDir -TaskId $failureTaskId -Workflow $failureWorkflow -WarningMessage 'Telegram failure notification failed' -WarningData @{ task_id = $failureTaskId; error = $supervisorError } | Out-Null
} finally {
    $finalState = if ($success) { 'done' } else { 'failed' }
    if ($queueRunDir -and (Test-Path -LiteralPath $queueRunDir)) {
        $finalQueueDir = Move-V7QueueRunDir -QueueRunDir $queueRunDir -State $finalState
    }
    $finalEventsPath = if ($finalQueueDir) { Join-Path $finalQueueDir 'events.jsonl' } else { $eventsPath }

    try {
        if ($taskJsonLocal -and (Test-Path -LiteralPath $taskJsonLocal)) {
            $cleanupStdout = Join-Path $logsDir 'cleanup.stdout.log'
            $cleanupStderr = Join-Path $logsDir 'cleanup.stderr.log'
            Add-SupervisorStage -QueueRunDir $finalQueueDir -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Starting task cleanup' -Data @{ task_json = $taskJsonLocal; local_run_dir = $localRunDir; worktrees_dir = $worktreesDir }
            & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $workerRoot 'Cleanup-TaskRun.ps1') -TaskJsonPath $taskJsonLocal 1> $cleanupStdout 2> $cleanupStderr
            $cleanupExitCode = $LASTEXITCODE
            if ($cleanupExitCode -eq 0) {
                Add-SupervisorStage -QueueRunDir $finalQueueDir -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Task cleanup completed' -Data @{ task_json = $taskJsonLocal; exit_code = 0; stdout_log = $cleanupStdout; stderr_log = $cleanupStderr }
            } else {
                Add-SupervisorStage -QueueRunDir $finalQueueDir -EventsPath $finalEventsPath -State 'WARNING' -Message 'Task cleanup failed' -Data @{ task_json = $taskJsonLocal; exit_code = $cleanupExitCode; stdout_log = $cleanupStdout; stderr_log = $cleanupStderr }
                if (-not $supervisorError) {
                    $supervisorError = 'Cleanup failed with exit code ' + $cleanupExitCode
                }
            }
        } else {
            Add-SupervisorStage -QueueRunDir $finalQueueDir -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Task cleanup skipped: task manifest not found' -Data @{ task_json = $taskJsonLocal }
        }
    } catch {
        $cleanupError = $_.Exception.Message
        Add-SupervisorStage -QueueRunDir $finalQueueDir -EventsPath $finalEventsPath -State 'WARNING' -Message 'Task cleanup threw an exception' -Data @{ task_json = $taskJsonLocal; error = $cleanupError; stack_trace = $_.ScriptStackTrace }
        if (-not $supervisorError) {
            $supervisorError = $cleanupError
        }
    }

    $summaryTaskId = if ($TaskId) { $TaskId } else { [System.IO.Path]::GetFileNameWithoutExtension($TaskFile) }
    $summaryWorkflow = if ($workflow) { $workflow } else { 'unknown' }
    Write-SupervisorSummary -ResultsDir $resultsDir -TaskId $summaryTaskId -Workflow $summaryWorkflow -StartedAt $supervisorStartedAt -Status $status -ArtifactsDir $artifactsDir -ErrorMessage $supervisorError
}

if (-not $success) {
    exit 1
}
