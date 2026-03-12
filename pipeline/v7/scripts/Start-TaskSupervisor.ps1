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

    [System.IO.File]::WriteAllText($stepPath, ($lines -join "`n"), [System.Text.Encoding]::UTF8)
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
function Invoke-V7TelegramScript {
    param(
        [Parameter(Mandatory = $true)][hashtable]$Config,
        [Parameter(Mandatory = $true)][string]$Text,
        [string]$EventsPath,
        [string]$QueueRunDir,
        [string]$WarningMessage,
        $WarningData
    )

    $ok = Send-V7Telegram -Config $Config -Text $Text -EventsPath $EventsPath
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
    [System.IO.File]::WriteAllText($crashPath, ($lines -join "`n"), [System.Text.Encoding]::UTF8)
    return $crashPath
}

function Get-SupervisorChangedFiles {
    param([string]$ArtifactsDir)

    if ([string]::IsNullOrWhiteSpace($ArtifactsDir) -or -not (Test-Path -LiteralPath $ArtifactsDir)) {
        return @()
    }

    $changedFiles = @()
    foreach ($resultName in @('merge.result.json', 'claude-writer.result.json')) {
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

    [System.IO.File]::WriteAllText($summaryPath, ($lines -join "`n"), [System.Text.Encoding]::UTF8)
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
            Invoke-V7TelegramScript -Config $Config -Text $heartbeatText -EventsPath $EventsPath -QueueRunDir $QueueRunDir -WarningMessage 'Telegram heartbeat failed' -WarningData @{ stage = $stageName; elapsed_minutes = $elapsedMinutes; pids = $alivePids } | Out-Null
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
    Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'CLAIMED' -Message (($taskPage + ' ' + $taskTopic).Trim())) -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram claim notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

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
    Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'PREPARING' -Message 'Preparing task context') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram preparing notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

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
        Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude writer + Codex reviewer') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram parallel stage notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $writerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeWriter.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-writer' -LogsDir $logsDir -Mode 'writer'
        $reviewerProc = Start-V7WorkerLauncher -ScriptPath (Join-Path $workerRoot 'Invoke-CodexReviewer.ps1') -TaskJsonPath $taskJsonLocal -Name 'codex-reviewer' -LogsDir $logsDir -Mode ''
        $status.processes['claude_writer'] = [ordered]@{ pid = $writerProc.Id; state = 'running' }
        $status.processes['codex_reviewer'] = [ordered]@{ pid = $reviewerProc.Id; state = 'running' }
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Worker launchers started' -Data @{ claude_writer_pid = $writerProc.Id; codex_reviewer_pid = $reviewerProc.Id; logs_dir = $logsDir }

        $parallelOk = Wait-V7Launchers -Processes @($writerProc, $reviewerProc) -TimeoutMinutes $codeReviewTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -HeartbeatLabel $status.current_step
        $status.processes['claude_writer'].state = if ($writerProc.HasExited -and $writerProc.ExitCode -eq 0) { 'completed' } elseif ($writerProc.HasExited) { 'failed' } else { 'failed' }
        $status.processes['claude_writer'].exit_code = if ($writerProc.HasExited) { $writerProc.ExitCode } else { $null }
        $status.processes['codex_reviewer'].state = if ($reviewerProc.HasExited -and $reviewerProc.ExitCode -eq 0) { 'completed' } elseif ($reviewerProc.HasExited) { 'failed' } else { 'failed' }
        $status.processes['codex_reviewer'].exit_code = if ($reviewerProc.HasExited) { $reviewerProc.ExitCode } else { $null }
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Parallel review stage completed' -Data @{ parallel_ok = $parallelOk; claude_writer_exit_code = $status.processes['claude_writer'].exit_code; codex_reviewer_exit_code = $status.processes['codex_reviewer'].exit_code }
        if (-not $parallelOk) {
            throw 'Parallel worker timeout'
        }

        $status.state = 'MERGING'
        $status.current_step = 'merge'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'MERGING' -Message 'Running merge step' -Data @{ task_json = $taskJsonLocal; logs_dir = $logsDir }
        Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'MERGING' -Message 'Integrating writer and reviewer results') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram merge notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $mergeStdout = Join-Path $logsDir 'merge.stdout.log'
        $mergeStderr = Join-Path $logsDir 'merge.stderr.log'
        & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $workerRoot 'Merge-TaskResult.ps1') -TaskJsonPath $taskJsonLocal 1> $mergeStdout 2> $mergeStderr
        $mergeExitCode = $LASTEXITCODE
        if ($mergeExitCode -ne 0) {
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
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'MERGING' -Message 'Merge step completed' -Data @{ merge_commit = $status.git.merge_commit; writer_commit = $status.git.writer_commit; result_path = (Join-Path $artifactsDir 'merge.result.json') }
    } else {
        $status.state = 'RUNNING'
        $status.current_step = 'claude-round1'
        Set-V7Status -StatusPath $statusPath -Status $status
        Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'RUNNING' -Message 'Starting UX discussion rounds' -Data @{ task_json = $taskJsonLocal; logs_dir = $logsDir; timeout_minutes = $uxTimeout }
        Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude round 1 analyst') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram UX round 1 notification failed' -WarningData @{ task_id = $TaskId } | Out-Null

        $round1Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeAnalyst.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-round1' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -Workflow $workflow -Mode ''
        if (-not $round1Ok) { throw 'Claude round 1 failed' }

        Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Codex round 2 analyst') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram UX round 2 notification failed' -WarningData @{ task_id = $TaskId } | Out-Null
        $round2Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-CodexAnalyst.ps1') -TaskJsonPath $taskJsonLocal -Name 'codex-round1' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -Workflow $workflow -Mode ''
        if (-not $round2Ok) { throw 'Codex round 2 failed' }

        Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'RUNNING' -Message 'Claude round 3 synthesis') -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram UX round 3 notification failed' -WarningData @{ task_id = $TaskId } | Out-Null
        $round3Ok = Invoke-V7Stage -ScriptPath (Join-Path $workerRoot 'Invoke-ClaudeSynthesizer.ps1') -TaskJsonPath $taskJsonLocal -Name 'claude-round3' -LogsDir $logsDir -TimeoutMinutes $uxTimeout -StatusPath $statusPath -Status $status -EventsPath $eventsPath -QueueRunDir $queueRunDir -Config $config -Workflow $workflow -Mode ''
        if (-not $round3Ok) { throw 'Claude round 3 failed' }
    }

    $success = $true
    $status.state = 'DONE'
    $status.current_step = 'done'
    Set-V7Status -StatusPath $statusPath -Status $status
    Add-SupervisorStage -QueueRunDir $queueRunDir -EventsPath $eventsPath -State 'DONE' -Message 'Task completed' -Data @{ merge_commit = $status.git.merge_commit; results_dir = $resultsDir; local_run_dir = $localRunDir }
    Copy-V7ArtifactsToResults -LocalRunDir $localRunDir -ResultsDir $resultsDir
    $finalCommit = if ([string]::IsNullOrWhiteSpace([string]$status.git.merge_commit)) { 'n/a' } else { [string]$status.git.merge_commit }
    Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $TaskId -Workflow $workflow -State 'DONE' -Message ("Completed. Commit: " + $finalCommit)) -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram completion notification failed' -WarningData @{ task_id = $TaskId; merge_commit = $finalCommit } | Out-Null
} catch {
    $supervisorError = $_.Exception.Message
    $crashPath = Write-SupervisorCrashLog -QueueRunDir $queueRunDir -TaskId $TaskId -TaskFile $TaskFile -ErrorRecord $_
    if ($status -and $statusPath) {
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
    Invoke-V7TelegramScript -Config $config -Text (New-StageSummary -TaskId $failureTaskId -Workflow $failureWorkflow -State 'FAILED' -Message $supervisorError) -EventsPath $eventsPath -QueueRunDir $queueRunDir -WarningMessage 'Telegram failure notification failed' -WarningData @{ task_id = $failureTaskId; error = $supervisorError } | Out-Null
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
