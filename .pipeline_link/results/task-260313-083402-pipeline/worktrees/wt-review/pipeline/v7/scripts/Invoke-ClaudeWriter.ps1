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
Budget: $$budget
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
    $reviewJson = Get-Content -LiteralPath $reviewFindingsPath -Raw -Encoding UTF8
    $prompt += @"

Reviewer findings to address:
$reviewJson

For reconcile mode, focus only on applying the reviewer findings that are supported by the code and task scope.
"@
}

[System.IO.File]::WriteAllText($promptPath, $prompt, [System.Text.Encoding]::UTF8)

$args = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-cost-dollars', $budget)
if (Test-Path -LiteralPath $rulesPath) {
    $args += @('--append-system-prompt-file', $rulesPath)
}

$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $args -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath
$endedAt = Get-V7Timestamp

$headCommit = (git -C $worktree rev-parse HEAD).Trim()
$dirty = @(git -C $worktree status --porcelain)
$autoCommitted = $false

if ($headCommit -eq $baseCommit -and $dirty.Count -gt 0) {
    git -C $worktree add -A | Out-Null
    git -C $worktree commit -m $commitMessage | Out-Null
    $headCommit = (git -C $worktree rev-parse HEAD).Trim()
    $autoCommitted = $true
}

$changedFiles = @(git -C $worktree diff --name-only $baseCommit..HEAD)
$result = [ordered]@{
    worker = if ($Mode -eq 'writer') { 'claude-writer' } else { 'claude-reconcile' }
    mode = $Mode
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    worktree = $worktree
    summary_file = $summaryPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    commit_hash = if ($headCommit -ne $baseCommit) { $headCommit } else { '' }
    auto_committed = $autoCommitted
    changed_files = $changedFiles
}
Write-V7Json -Path $resultPath -Data $result

if ($exitCode -ne 0) {
    exit $exitCode
}
