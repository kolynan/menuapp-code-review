param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$codexPrefix = Get-V7CodexCommandPrefix -RawPath ([string]$config.paths.codex_cli)
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$worktree = $task.paths.review_worktree
$budget = [string]$task.metadata.budget
$baseCommit = [string]$task.git.base_commit
$summaryPath = Join-Path $artifactsDir 'codex-writer-summary.md'
$resultPath = Join-Path $artifactsDir 'codex-writer.result.json'
$promptPath = Join-Path $promptsDir 'codex-writer.prompt.md'
$stdoutPath = Join-Path $logsDir 'codex-writer.stdout.log'
$stderrPath = Join-Path $logsDir 'codex-writer.stderr.log'
$commitMessage = "task($($task.metadata.page)): $($task.task_id) Codex writer"

$prompt = @"
You are the Codex writer for MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Budget: $budget USD
Repository: $($task.paths.repo_root)
Working tree: $worktree
Target code file: $($task.paths.code_file)
BUGS.md: $($task.paths.bugs_file)
README.md: $($task.paths.readme_file)
Summary file to write before you finish: $summaryPath

Task instructions:
$($task.task.body)

Your job:
- Write code to fix the described issue.
- Work only in the assigned working tree.
- Keep changes scoped to the task.
- Commit your changes before finishing.
- Before finishing, write a concise markdown summary to $summaryPath with: files changed, main fixes, tests or checks run, and any follow-up risk.
"@
Write-V7TextFile -Path $promptPath -Content $prompt

$startedAt = Get-V7Timestamp
$exitCode = 1
$errorMessage = ''

if ($codexPrefix.Count -eq 0) {
    $errorMessage = 'Codex CLI not found for parallel-write codex writer.'
    Write-V7TextFile -Path $stdoutPath -Content ''
    Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
    [Console]::Error.WriteLine($errorMessage)
} else {
    try {
        $codexArgs = @('exec', '-C', $worktree, '--full-auto', '-')
        $exitCode = Invoke-V7CommandToFiles -CommandPrefix $codexPrefix -Arguments $codexArgs -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath -InputText $prompt
    } catch {
        $errorMessage = $_.Exception.Message
        Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
        [Console]::Error.WriteLine($errorMessage)
        $exitCode = 1
    }
}

$endedAt = Get-V7Timestamp
$headCommit = ''
$dirty = @()
$autoCommitted = $false

try {
    $headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Codex writer HEAD').stdout.Trim()
    $dirtyStatus = Invoke-V7Git -RepoRoot $worktree -Arguments @('status', '--porcelain') -FailureMessage 'Unable to inspect Codex writer worktree status'
    if (-not [string]::IsNullOrWhiteSpace([string]$dirtyStatus.stdout)) {
        $dirty = @(($dirtyStatus.stdout -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) })
    }
} catch {
    if ([string]::IsNullOrWhiteSpace($errorMessage)) {
        $errorMessage = $_.Exception.Message
    }
}

if (($headCommit -eq $baseCommit -or [string]::IsNullOrWhiteSpace($baseCommit)) -and $dirty.Count -gt 0) {
    Invoke-V7Git -RepoRoot $worktree -Arguments @('add', '-A') -FailureMessage 'Unable to stage Codex writer changes' | Out-Null
    Invoke-V7Git -RepoRoot $worktree -Arguments @('commit', '-m', $commitMessage) -FailureMessage 'Unable to auto-commit Codex writer changes' | Out-Null
    $headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Codex writer HEAD after auto-commit').stdout.Trim()
    $autoCommitted = $true
}

$changedFiles = @(Get-V7ChangedFiles -RepoRoot $worktree -BaseCommit $baseCommit)
$hasCommit = -not [string]::IsNullOrWhiteSpace($headCommit) -and ($autoCommitted -or (-not [string]::IsNullOrWhiteSpace($baseCommit) -and $headCommit -ne $baseCommit))
if ([string]::IsNullOrWhiteSpace($errorMessage) -and $exitCode -ne 0 -and (Test-Path -LiteralPath $stderrPath)) {
    $stderrText = (Read-V7TextFile -Path $stderrPath).Trim()
    if (-not [string]::IsNullOrWhiteSpace($stderrText)) {
        $errorMessage = (($stderrText -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -First 1)
    }
}
if ([string]::IsNullOrWhiteSpace($errorMessage) -and $exitCode -ne 0) {
    $errorMessage = 'Codex writer exited with code ' + $exitCode
}

$result = [ordered]@{
    worker = 'codex-writer'
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    worktree = $worktree
    summary_file = $summaryPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    commit_hash = if ($hasCommit) { $headCommit } else { '' }
    auto_committed = $autoCommitted
    changed_files = $changedFiles
    error_message = $errorMessage
    resolved_command = if ($codexPrefix.Count -gt 0) { ($codexPrefix -join ' ') } else { '' }
}
Write-V7Json -Path $resultPath -Data $result

if ($exitCode -ne 0) {
    exit $exitCode
}
