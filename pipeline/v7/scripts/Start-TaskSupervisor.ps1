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

function New-StageSummary {
    param([string]$TaskId, [string]$Workflow, [string]$State, [string]$Message)
    return "[$State] $TaskId [$Workflow] $Message"
}

function Invoke-V7TelegramScript {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [string]$ConfigPath,
        [string]$EventsPath,
        [string]$WarningMessage,
        [hashtable]$WarningData
    )

    $scriptPath = Join-Path $PSScriptRoot 'Send-Telegram.ps1'
    $args = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $scriptPath, '-Text', $Text)
    if ($ConfigPath) {
        $args += @('-ConfigPath', $ConfigPath)
    }

    $warningPayload = if ($WarningData) { $WarningData.Clone() } else { @{} }
    $warningPayload.telegram_text = $Text

    try {
        & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe @args
        $exitCode = $LASTEXITCODE
    } catch {
        if ($EventsPath -and $WarningMessage) {
            $warningPayload.error = $_.Exception.Message
            Add-V7Event -EventsPath $EventsPath -State 'WARNING' -Message $WarningMessage -Data $warningPayload
        }
        return $false
    }

    if ($exitCode -eq 0) {
        return $true
    }

    if ($EventsPath -and $WarningMessage) {
        $warningPayload.telegram_exit_code = $exitCode
        Add-V7Event -EventsPath $EventsPath -State 'WARNING' -Message $WarningMessage -Data $warningPayload
    }
    return $false
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
        [hashtable]$Config,
        [string]$ConfigPath,
        [string]$TaskId,
        [string]$Workflow,
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
            Add-V7Event -EventsPath $EventsPath -State 'FAILED' -Message 'Worker timeout' -Data @{ pids = ($Processes | ForEach-Object { $_.Id }) }
            return $false
        }
        if ((Get-Date) -ge $nextHeartbeat) {
            $elapsedMinutes = [int][Math]::Floor(((Get-Date) - $startedAt).TotalMinutes)
            $stageName = if ($HeartbeatLabel) { $HeartbeatLabel } elseif ($Status.current_step) { [string]$Status.current_step } else { 'stage' }
            $heartbeatText = "⏳ [$stageName] running... (${elapsedMinutes}m elapsed)"
            Add-V7Event -EventsPath $EventsPath -State 'HEARTBEAT' -Message $heartbeatText -Data @{ stage = $stageName; pids = $alivePids; elapsed_minutes = $elapsedMinutes }
            Invoke-V7TelegramScript -Text $heartbeatText -ConfigPath $ConfigPath -EventsPath $EventsPath -WarningMessage 'Telegram heartbeat failed' -WarningData @{ stage = $stageName; elapsed_minutes = $elapsedMinutes; pids = $alivePids } | Out-Null
            $nextHeartbeat = $nextHeartbeat.AddMinutes(5)
        }
        Start-Sleep -Seconds 5
        $Status.current_step = 'running'
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
        [string]$Mode,
        [hashtable]$Config,
        [string]$ConfigPath,
        [string]$TaskId,
        [string]$Workflow
    )

    $proc = Start-V7WorkerLauncher -ScriptPath $ScriptPath -TaskJsonPath $TaskJsonPath -Name $Name -LogsDir $LogsDir -Mode $Mode
    $Status.processes[$Name] = [ordered]@{ pid = $proc.Id; state = 'running' }
    $Status.current_step = $Name
    Set-V7Status -StatusPath $StatusPath -Status $Status
    Add-V7Event -EventsPath $EventsPath -State 'RUNNING' -Message "Started $Name" -Data @{ pid = $proc.Id }
    $ok = Wait-V7Launchers -Processes @($proc) -TimeoutMinutes $TimeoutMinutes -StatusPath $StatusPath -Status $Status -EventsPath $EventsPath -Config $Config -ConfigPath $ConfigPath -TaskId $TaskId -Workflow $Workflow -HeartbeatLabel $Name
    $Status.processes[$Name].state = if ($proc.HasExited) { 'completed' } else { 'failed' }
    $Status.processes[$Name].exit_code = $proc.ExitCode
    Set-V7Status -StatusPath $StatusPath -Status $Status
    return $ok -and $proc.ExitCode -eq 0
}

$resolvedConfigPath = $ConfigPath
if (-not $resolvedConfigPath) {
    $resolvedConfigPath = Join-Path (Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) 'scripts') 'task-watcher-config.json'
}
$config = Get-V7Config -ConfigPath $resolvedConfigPath

$repoRootPath = if ($RepoRoot) { $RepoRoot } else { $config.paths.repo_dir }
$repoRootPath = [System.IO.Path]::GetFullPath($repoRootPath)
$localRunRoot = Ensure-V7Directory -Path $config.pipeline.local_run_root
$queueRunDir = Split-Path -Parent $TaskFile
$parts = Get-V7TaskParts -TaskFile $TaskFile
$meta = $parts.metadata
$workflow = if ($TaskType) { $TaskType } elseif ($meta.Contains('type')) { $meta['type'] } else { 'code-review' }
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
$eventsPath = Join-Path $queueRunDir 'events.jsonl'
$statusPath = Join-Path $queueRunDir 'status.json'
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
Add-V7Event -EventsPath $eventsPath -State 'CLAIMED' -Message 'Task claimed by V7 supervisor' -Data @{ task_file = $TaskFile }
Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'CLAIMED' -Message ($taskPage + ' ' + $taskTopic).Trim()) | Out-Null

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
Add-V7Event -EventsPath $eventsPath -State 'PREPARING' -Message 'Preparing task context' -Data @{ workflow = $workflow }
Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'PREPARING' -Message 'Preparing task context') | Out-Null

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
}

Write-V7Json -Path $taskJsonLocal -Data $taskManifest
Write-V7Json -Path $taskJsonQueue -Data $taskManifest
Set-V7Status -StatusPath $statusPath -Status $status

$codeReviewTimeout = [int]$config.pipeline.code_review_timeout_minutes
$uxTimeout = [int]$config.pipeline.ux_discussion_timeout_minutes
$workerRoot = $PSScriptRoot
$success = $false
$finalQueueDir = $queueRunDir

try {
    if ($workflow -eq 'code-review') {
        $status.state = 'RUNNING'
        $status.current_step = 'parallel-review-and-fix'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-V7Event -EventsPath $eventsPath -State 'RUNNING' -Message 'Starting Claude writer and Codex reviewer' -Data $null
        Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude writer + Codex reviewer') | Out-Null

        $writerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeWriter.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-writer' -LogsDir $logsDir -Mode 'writer'
        $reviewerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-CodexReviewer.ps1') -TaskJsonPath $taskJsonLocal -Name 'codex-reviewer' -LogsDir $logsDir -Mode ''
        $status.processes['claude_writer'] = [ordered]@{ pid = $writerProc.Id; state = 'running' }
        $status.processes['codex_reviewer'] = [ordered]@{ pid = $reviewerProc.Id; state = 'running' }
        Set-V7Status -StatusPath $statusPath -Status $status

        $parallelOk = Wait-V7Launchers -Processes @($writerProc, $reviewerProc) -TimeoutMinutes $codeReviewTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -Config $config -ConfigPath $resolvedConfigPath -TaskId $TaskId -Workflow $workflow -HeartbeatLabel $status.current_step
        $status.processes['claude_writer'].state = if ($writerProc.HasExited) { 'completed' } else { 'failed' }
        $status.processes['claude_writer'].exit_code = $writerProc.ExitCode
        $status.processes['codex_reviewer'].state = if ($reviewerProc.HasExited) { 'completed' } else { 'failed' }
        $status.processes['codex_reviewer'].exit_code = $reviewerProc.ExitCode
        Set-V7Status -StatusPath $statusPath -Status $status
        if (-not $parallelOk) {
            throw 'Parallel worker timeout'
        }

        $status.state = 'MERGING'
        $status.current_step = 'merge'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-V7Event -EventsPath $eventsPath -State 'MERGING' -Message 'Running merge step' -Data $null
        Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'MERGING' -Message 'Integrating writer and reviewer results') | Out-Null

        & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $workerRoot 'Merge-TaskResult.ps1') -TaskJsonPath $taskJsonLocal 1> (Join-Path $logsDir 'merge.stdout.log') 2> (Join-Path $logsDir 'merge.stderr.log')
        if ($LASTEXITCODE -ne 0) {
            throw 'Merge step failed'
        }

        $mergeResult = Read-V7Json -Path (Join-Path $artifactsDir 'merge.result.json')
        if ($mergeResult -and $mergeResult.merge_commit) {
            $status.git.merge_commit = $mergeResult.merge_commit
        }
        if ($mergeResult -and $mergeResult.writer_commit) {
            $status.git.writer_commit = $mergeResult.writer_commit
        }
    } else {
        $status.state = 'RUNNING'
        $status.current_step = 'claude-round1'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-V7Event -EventsPath $eventsPath -State 'RUNNING' -Message 'Starting UX discussion rounds' -Data $null
        Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude round 1 analyst') | Out-Null

        $round1Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeAnalyst.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-round1' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -Config $config -ConfigPath $resolvedConfigPath -TaskId $TaskId -Workflow $workflow -Mode ''
        if (-not $round1Ok) { throw 'Claude round 1 failed' }

        Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Codex round 2 analyst') | Out-Null
        $round2Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-CodexAnalyst.ps1') -TaskJsonPath $taskJsonLocal -Name 'codex-round1' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -Config $config -ConfigPath $resolvedConfigPath -TaskId $TaskId -Workflow $workflow -Mode ''
        if (-not $round2Ok) { throw 'Codex round 2 failed' }

        Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude round 3 synthesis') | Out-Null
        $round3Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeSynthesizer.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-round3' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -Config $config -ConfigPath $resolvedConfigPath -TaskId $TaskId -Workflow $workflow -Mode ''
        if (-not $round3Ok) { throw 'Claude round 3 failed' }
    }

    $success = $true
    $status.state = 'DONE'
    $status.current_step = 'done'
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-V7Event -EventsPath $eventsPath -State 'DONE' -Message 'Task completed' -Data @{ merge_commit = $status.git.merge_commit }
    Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
    $finalCommit = if ([string]::IsNullOrWhiteSpace([string]$status.git.merge_commit)) { 'n/a' } else { [string]$status.git.merge_commit }
    Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'DONE' -Message ("Completed. Commit: " + $finalCommit)) | Out-Null
} catch {
    $status.state = 'FAILED'
    $status.current_step = 'failed'
    $status.error = $_.Exception.Message
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-V7Event -EventsPath $eventsPath -State 'FAILED' -Message $_.Exception.Message -Data $null
    Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
    Send-V7Telegram -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'FAILED' -Message $_.Exception.Message) | Out-Null
    throw
} finally {
    $finalState = if ($success) { 'done' } else { 'failed' }
    if (Test-Path -LiteralPath $queueRunDir) {
        $finalQueueDir = Move-V7QueueRunDir -QueueRunDir $queueRunDir -State $finalState
    }
    $finalEventsPath = Join-Path $finalQueueDir 'events.jsonl'
    try {
        if (Test-Path -LiteralPath $taskJsonLocal) {
            Add-V7Event -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Starting task cleanup' -Data @{ task_json = $taskJsonLocal }
            & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $workerRoot 'Cleanup-TaskRun.ps1') -TaskJsonPath $taskJsonLocal 1> (Join-Path $logsDir 'cleanup.stdout.log') 2> (Join-Path $logsDir 'cleanup.stderr.log')
            if ($LASTEXITCODE -eq 0) {
                Add-V7Event -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Task cleanup completed' -Data @{ task_json = $taskJsonLocal; exit_code = 0 }
            } else {
                Add-V7Event -EventsPath $finalEventsPath -State 'WARNING' -Message 'Task cleanup failed' -Data @{ task_json = $taskJsonLocal; exit_code = $LASTEXITCODE }
            }
        } else {
            Add-V7Event -EventsPath $finalEventsPath -State 'CLEANUP' -Message 'Task cleanup skipped: task manifest not found' -Data @{ task_json = $taskJsonLocal }
        }
    } catch {
        Add-V7Event -EventsPath $finalEventsPath -State 'WARNING' -Message 'Task cleanup threw an exception' -Data @{ task_json = $taskJsonLocal; error = $_.Exception.Message }
    }
}


