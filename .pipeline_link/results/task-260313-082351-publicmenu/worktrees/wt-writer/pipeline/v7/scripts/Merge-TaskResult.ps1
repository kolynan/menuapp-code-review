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
$baseCommit = $task.git.base_commit
$writerResult = Read-V7Json -Path $writerResultPath
$writerCommit = ''
if ($writerResult -and $writerResult.commit_hash) {
    $writerCommit = [string]$writerResult.commit_hash
}

if (-not $writerCommit) {
    throw 'Claude writer did not produce a commit hash.'
}

$mergeOutput = & git -C $mergeWorktree cherry-pick $writerCommit 2>&1
$mergeOutput | Set-Content -LiteralPath (Join-Path $logsDir 'merge-cherry-pick.log') -Encoding UTF8
if ($LASTEXITCODE -ne 0) {
    throw 'Cherry-pick failed during merge.'
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

$mergeCommit = (git -C $mergeWorktree rev-parse HEAD).Trim()
$changedFiles = @(git -C $mergeWorktree diff --name-only $baseCommit..HEAD)
$reviewCount = 0
if ($reviewJson -and $reviewJson.findings) {
    $reviewCount = $reviewJson.findings.Count
}

$reportLines = @(
    "# Merge Report",
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
[System.IO.File]::WriteAllText($mergeReportPath, ($reportLines -join "`n"), [System.Text.Encoding]::UTF8)

$result = [ordered]@{
    status = 'completed'
    writer_commit = $writerCommit
    merge_commit = $mergeCommit
    reviewer_findings = $reviewCount
    reconcile_result = if (Test-Path -LiteralPath $reconcileResultPath) { $reconcileResultPath } else { '' }
    changed_files = $changedFiles
    report_file = $mergeReportPath
}
Write-V7Json -Path $mergeResultPath -Data $result
