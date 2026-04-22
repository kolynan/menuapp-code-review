param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$artifactsDir = $task.paths.artifacts_dir
$logsDir = $task.paths.logs_dir
$mergeResultPath = Join-Path $artifactsDir 'merge.result.json'
$mergeReportPath = Join-Path $artifactsDir 'merge-report.md'
$writerResultPath = Join-Path $artifactsDir 'claude-writer.result.json'
$reviewResultPath = Join-Path $artifactsDir 'codex-review-findings.json'
$reconcileResultPath = Join-Path $artifactsDir 'claude-reconcile.result.json'
$mergeWorktree = $task.paths.merge_worktree
$baseCommit = [string]$task.git.base_commit
$writerResult = Read-V7Json -Path $writerResultPath
$writerCommit = ''
if ($writerResult -and $writerResult.commit_hash) {
    $writerCommit = [string]$writerResult.commit_hash
}

if ([string]::IsNullOrWhiteSpace($writerCommit) -and -not [string]::IsNullOrWhiteSpace([string]$task.paths.writer_worktree) -and (Test-Path -LiteralPath $task.paths.writer_worktree)) {
    $writerHead = (Invoke-V7Git -RepoRoot $task.paths.writer_worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Claude writer worktree HEAD').stdout.Trim()
    if (-not [string]::IsNullOrWhiteSpace($writerHead) -and ([string]::IsNullOrWhiteSpace($baseCommit) -or $writerHead -ne $baseCommit)) {
        $writerCommit = $writerHead
    }
}

if ([string]::IsNullOrWhiteSpace($writerCommit)) {
    # Writer made no changes - skip cherry-pick, produce clean merge result
    $mergeCommit = (Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve merge worktree HEAD').stdout.Trim()
    $reportLines = @(
        '# Merge Report',
        '',
        "Task: $($task.task_id)",
        "Workflow: $($task.workflow)",
        "Writer commit: (none - no changes)",
        "Merge commit: $mergeCommit",
        "Reviewer findings: 0",
        '',
        'No writer changes to merge.'
    )
    Write-V7TextFile -Path $mergeReportPath -Content (($reportLines -join "`n") + "`n")
    $result = [ordered]@{
        status = 'completed'
        writer_commit = ''
        merge_commit = $mergeCommit
        reviewer_findings = 0
        reconcile_result = ''
        changed_files = @()
        report_file = $mergeReportPath
    }
    Write-V7Json -Path $mergeResultPath -Data $result
    exit 0
}

$mergeCommand = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments @('-C', $mergeWorktree, 'cherry-pick', $writerCommit) -WorkingDirectory $mergeWorktree
$mergeOutputParts = @()
if (-not [string]::IsNullOrWhiteSpace([string]$mergeCommand.stdout)) {
    $mergeOutputParts += [string]$mergeCommand.stdout
}
if (-not [string]::IsNullOrWhiteSpace([string]$mergeCommand.stderr)) {
    $mergeOutputParts += [string]$mergeCommand.stderr
}
$mergeLogContent = @()
if ($mergeOutputParts.Count -gt 0) { $mergeLogContent = $mergeOutputParts }
Write-V7TextFile -Path (Join-Path $logsDir 'merge-cherry-pick.log') -Content $(if ($mergeLogContent.Count -gt 0) { (($mergeLogContent -join "`n").TrimEnd() + "`n") } else { '' })
if ($mergeCommand.exit_code -ne 0) {
    $mergeFailureDetails = @($mergeCommand.stderr, $mergeCommand.stdout) | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
    $mergeFailureSuffix = if (@($mergeFailureDetails).Count -gt 0) { ': ' + (($mergeFailureDetails -join [Environment]::NewLine).Trim()) } else { '' }
    throw ('Cherry-pick failed during merge' + $mergeFailureSuffix)
}

$reviewJson = $null
$needsReconcile = $false
if (Test-Path -LiteralPath $reviewResultPath) {
    $reviewJson = Read-V7Json -Path $reviewResultPath
    if ($reviewJson -and $reviewJson.findings -and $reviewJson.findings.Count -gt 0) {
        $needsReconcile = $true
    }
}

if ($needsReconcile -and $config.pipeline.auto_reconcile) {
    & $env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'Invoke-ClaudeWriter.ps1') -TaskJsonPath $TaskJsonPath -Mode reconcile 1> (Join-Path $logsDir 'claude-reconcile.launcher.stdout.log') 2> (Join-Path $logsDir 'claude-reconcile.launcher.stderr.log')
    if ($LASTEXITCODE -ne 0) {
        throw 'Claude reconcile pass failed.'
    }
}

$mergeCommit = (Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve merge worktree HEAD').stdout.Trim()
if ([string]::IsNullOrWhiteSpace($baseCommit)) {
    $changedFiles = @()
} else {
    $changedFiles = @(Get-V7ChangedFiles -RepoRoot $mergeWorktree -BaseCommit $baseCommit)
}
$reviewCount = 0
if ($reviewJson -and $reviewJson.findings) {
    $reviewCount = $reviewJson.findings.Count
}

$reportLines = @(
    '# Merge Report',
    '',
    "Task: $($task.task_id)",
    "Workflow: $($task.workflow)",
    "Writer commit: $writerCommit",
    "Merge commit: $mergeCommit",
    "Reviewer findings: $reviewCount",
    '',
    'Changed files:',
    ($changedFiles | ForEach-Object { "- $_" })
)
Write-V7TextFile -Path $mergeReportPath -Content (($reportLines -join "`n") + "`n")

$result = [ordered]@{
    status = 'completed'
    writer_commit = $writerCommit
    merge_commit = $mergeCommit
    reviewer_findings = $reviewCount
    reconcile_result = $(if (Test-Path -LiteralPath $reconcileResultPath) { $reconcileResultPath } else { '' })
    changed_files = $changedFiles
    report_file = $mergeReportPath
}
Write-V7Json -Path $mergeResultPath -Data $result
