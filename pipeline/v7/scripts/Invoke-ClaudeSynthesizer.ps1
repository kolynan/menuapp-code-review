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
$promptPath = Join-Path $promptsDir 'claude-round3.prompt.md'
$stdoutPath = Join-Path $logsDir 'claude-round3.stdout.log'
$stderrPath = Join-Path $logsDir 'claude-round3.stderr.log'
$ccRound1Path = Join-Path $artifactsDir 'cc-round1-discussion.md'
$codexRound1Path = Join-Path $artifactsDir 'codex-round1-discussion.md'
$slug = ConvertTo-V7Slug -Value $task.metadata.topic -MaxLength 80
$sessionName = 'S' + ($task.task_id -replace '^task-', '')
$resultPath = Join-Path $artifactsDir ("UX_Discussion_{0}_{1}.md" -f $slug, $sessionName)
$workerResultPath = Join-Path $artifactsDir 'claude-round3.result.json'
$budget = [string]$task.metadata.budget

$ccRound1 = if (Test-Path -LiteralPath $ccRound1Path) { Read-V7TextFile -Path $ccRound1Path } else { 'Claude round 1 analysis missing.' }
$codexRound1 = if (Test-Path -LiteralPath $codexRound1Path) { Read-V7TextFile -Path $codexRound1Path } else { 'Codex round 2 analysis missing.' }

$prompt = @"
You are Claude Round 3 synthesizer for a MenuApp UX discussion.

Task ID: $($task.task_id)
Page: $($task.metadata.page)
Topic: $($task.metadata.topic)
Final output path: $resultPath

Task body:
$($task.task.body)

Claude Round 1:
$ccRound1

Codex Round 2:
$codexRound1

Write the final decision document to $resultPath using this structure:
- Title
- Summary
- Decisions table
- Agreed points
- Remaining tradeoffs
- Recommendation
- Next steps

Do not call Codex. This is the final synthesis only.
"@

Write-V7TextFile -Path $promptPath -Content $prompt
$claudeArgs = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $budget)
if (Test-Path -LiteralPath $task.paths.cc_rules_path) {
    $claudeArgs += @('--append-system-prompt-file', $task.paths.cc_rules_path)
}
if ($task.metadata.agent) {
    $claudeArgs += @('--agent', [string]$task.metadata.agent)
}
$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $claudeArgs -WorkingDirectory $task.paths.repo_root -StdOutPath $stdoutPath -StdErrPath $stderrPath
$endedAt = Get-V7Timestamp

$result = [ordered]@{
    worker = 'claude-round3'
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
