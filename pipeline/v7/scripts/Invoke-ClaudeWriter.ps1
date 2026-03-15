param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath,
    [ValidateSet('writer', 'reconcile')][string]$Mode = 'writer'
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$claudePrefix = Get-V7ClaudeCommandPrefix -RawPath $config.paths.claude_cli
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$rulesPath = $task.paths.cc_rules_path
$budget = [string]$task.metadata.budget
$baseCommit = [string]$task.git.base_commit

if ($Mode -eq 'writer') {
    $worktree = $task.paths.writer_worktree
    $summaryPath = Join-Path $artifactsDir 'cc-writer-summary.md'
    $resultPath = Join-Path $artifactsDir 'claude-writer.result.json'
    $promptPath = Join-Path $promptsDir 'claude-writer.prompt.md'
    $stdoutPath = Join-Path $logsDir 'claude-writer.stdout.log'
    $stderrPath = Join-Path $logsDir 'claude-writer.stderr.log'
    $modeLabel = 'Claude writer'
} else {
    $worktree = $task.paths.merge_worktree
    $summaryPath = Join-Path $artifactsDir 'cc-reconcile-summary.md'
    $resultPath = Join-Path $artifactsDir 'claude-reconcile.result.json'
    $promptPath = Join-Path $promptsDir 'claude-reconcile.prompt.md'
    $stdoutPath = Join-Path $logsDir 'claude-reconcile.stdout.log'
    $stderrPath = Join-Path $logsDir 'claude-reconcile.stderr.log'
    $modeLabel = 'Claude reconcile writer'
}

$reviewFindingsPath = Join-Path $artifactsDir 'codex-review-findings.json'
$commitMessage = if ($Mode -eq 'writer') {
    "task($($task.metadata.page)): $($task.task_id) CC writer"
} else {
    "task($($task.metadata.page)): $($task.task_id) reconcile reviewer findings"
}

$prompt = @"
You are the $modeLabel for MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Budget: $($budget) USD
Repository: $($task.paths.repo_root)
Working tree: $worktree
Target code file: $($task.paths.code_file)
BUGS.md: $($task.paths.bugs_file)
README.md: $($task.paths.readme_file)
Summary file to write before you finish: $summaryPath

Task instructions:
$($task.task.body)

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to $summaryPath with: files changed, main fixes, tests or checks run, and any follow-up risk.
"@

if ($Mode -eq 'reconcile' -and (Test-Path -LiteralPath $reviewFindingsPath)) {
    $reviewJson = Read-V7TextFile -Path $reviewFindingsPath
    $prompt += @"

Reviewer findings to address:
$reviewJson

For reconcile mode, focus only on applying the reviewer findings that are supported by the code and task scope.
"@
}

Write-V7TextFile -Path $promptPath -Content $prompt

$claudeArgs = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $budget)
if (Test-Path -LiteralPath $rulesPath) {
    $claudeArgs += @('--append-system-prompt-file', $rulesPath)
}

$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $claudeArgs -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath
$endedAt = Get-V7Timestamp

$headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Claude writer HEAD').stdout.Trim()
$dirtyStatus = Invoke-V7Git -RepoRoot $worktree -Arguments @('status', '--porcelain') -FailureMessage 'Unable to inspect Claude writer worktree status'
$dirty = if ([string]::IsNullOrWhiteSpace([string]$dirtyStatus.stdout)) {
    @()
} else {
    @(
        ($dirtyStatus.stdout -split "`r?`n") |
            Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
    )
}
$autoCommitted = $false

if (($headCommit -eq $baseCommit -or [string]::IsNullOrWhiteSpace($baseCommit)) -and $dirty.Count -gt 0) {
    Invoke-V7Git -RepoRoot $worktree -Arguments @('add', '-A') -FailureMessage 'Unable to stage Claude writer changes' | Out-Null
    Invoke-V7Git -RepoRoot $worktree -Arguments @('commit', '-m', $commitMessage) -FailureMessage 'Unable to auto-commit Claude writer changes' | Out-Null
    $headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Claude writer HEAD after auto-commit').stdout.Trim()
    $autoCommitted = $true
}

$changedFiles = @(Get-V7ChangedFiles -RepoRoot $worktree -BaseCommit $baseCommit)
$hasWriterCommit = -not [string]::IsNullOrWhiteSpace($headCommit) -and ($autoCommitted -or (-not [string]::IsNullOrWhiteSpace($baseCommit) -and $headCommit -ne $baseCommit))
$result = [ordered]@{
    worker = if ($Mode -eq 'writer') { 'claude-writer' } else { 'claude-reconcile' }
    mode = $Mode
    status = if (Test-V7ExitSuccess $exitCode) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    worktree = $worktree
    summary_file = $summaryPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    commit_hash = if ($hasWriterCommit) { $headCommit } else { '' }
    auto_committed = $autoCommitted
    changed_files = $changedFiles
}
Write-V7Json -Path $resultPath -Data $result

if (-not (Test-V7ExitSuccess $exitCode)) {
    exit $exitCode
}
