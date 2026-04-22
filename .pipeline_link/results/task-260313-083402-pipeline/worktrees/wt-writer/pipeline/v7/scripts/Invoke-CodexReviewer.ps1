param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$codexPrefix = @($config.paths.codex_cli)
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$worktree = $task.paths.review_worktree
$promptPath = Join-Path $promptsDir 'codex-reviewer.prompt.md'
$stdoutPath = Join-Path $logsDir 'codex-reviewer.stdout.log'
$stderrPath = Join-Path $logsDir 'codex-reviewer.stderr.log'
$resultPath = Join-Path $artifactsDir 'codex-review-findings.json'
$workerResultPath = Join-Path $artifactsDir 'codex-reviewer.result.json'
$schemaPath = $task.paths.review_schema_path

$prompt = @"
You are the independent reviewer in MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Code file: $($task.paths.code_file)
BUGS.md: $($task.paths.bugs_file)
README.md: $($task.paths.readme_file)
Repository root: $($task.paths.repo_root)

Task instructions:
$($task.task.body)

Your job:
- Review the target page and nearby context files.
- Report only NEW issues that are NOT already listed in BUGS.md.
- Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
- Do not edit files.
- Return JSON that matches the provided schema.
"@

[System.IO.File]::WriteAllText($promptPath, $prompt, [System.Text.Encoding]::UTF8)

$args = @('exec', '-C', $worktree, '--full-auto', '--json', '-o', $resultPath, '--output-schema', $schemaPath, '-')
$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $codexPrefix -Arguments $args -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath -InputText $prompt
$endedAt = Get-V7Timestamp

$result = [ordered]@{
    worker = 'codex-reviewer'
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    output_file = $resultPath
}
Write-V7Json -Path $workerResultPath -Data $result

if ($exitCode -ne 0) {
    exit $exitCode
}
