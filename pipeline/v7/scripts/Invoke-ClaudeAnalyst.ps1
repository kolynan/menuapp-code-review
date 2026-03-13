param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$claudePrefix = Get-V7ClaudeCommandPrefix -RawPath $config.paths.claude_cli
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$promptPath = Join-Path $promptsDir 'claude-round1.prompt.md'
$stdoutPath = Join-Path $logsDir 'claude-round1.stdout.log'
$stderrPath = Join-Path $logsDir 'claude-round1.stderr.log'
$resultPath = Join-Path $artifactsDir 'cc-round1-discussion.md'
$workerResultPath = Join-Path $artifactsDir 'claude-round1.result.json'
$budget = [string]$task.metadata.budget

$imageList = if ($task.task.images.Count -gt 0) { ($task.task.images -join "`n- ") } else { 'None attached.' }
$prompt = @"
You are Claude Round 1 analyst for a MenuApp UX discussion.

Task ID: $($task.task_id)
Page: $($task.metadata.page)
Topic: $($task.metadata.topic)
Task body:
$($task.task.body)

Local screenshots or source images:
- $imageList

Write a structured first-pass analysis to $resultPath with these sections:
1. Framing
2. Current friction
3. Recommendations
4. Open questions
5. Risks and tradeoffs

Rules:
- Do not call Codex or any external AI tool.
- Keep this as your own Round 1 position only.
- If screenshots are referenced but not directly inspectable in your tool context, say so explicitly and reason from the task materials you can read.
"@

Write-V7TextFile -Path $promptPath -Content $prompt
$args = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $budget)
if (Test-Path -LiteralPath $task.paths.cc_rules_path) {
    $args += @('--append-system-prompt-file', $task.paths.cc_rules_path)
}
if ($task.metadata.agent) {
    $args += @('--agent', [string]$task.metadata.agent)
}
$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $args -WorkingDirectory $task.paths.repo_root -StdOutPath $stdoutPath -StdErrPath $stderrPath
$endedAt = Get-V7Timestamp

$result = [ordered]@{
    worker = 'claude-round1'
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    output_file = $resultPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
}
Write-V7Json -Path $workerResultPath -Data $result
if ($exitCode -ne 0) { exit $exitCode }
