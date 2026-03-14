param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$promptPath = Join-Path $promptsDir 'codex-round1.prompt.md'
$stdoutPath = Join-Path $logsDir 'codex-round1.stdout.log'
$stderrPath = Join-Path $logsDir 'codex-round1.stderr.log'
$resultPath = Join-Path $artifactsDir 'codex-round1-discussion.md'
$workerResultPath = Join-Path $artifactsDir 'codex-round1.result.json'
$ccRound1Path = Join-Path $artifactsDir 'cc-round1-discussion.md'
$codexPrefix = Get-V7CodexCommandPrefix -RawPath ([string]$config.paths.codex_cli)

$ccRound1 = if (Test-Path -LiteralPath $ccRound1Path) { Read-V7TextFile -Path $ccRound1Path } else { 'Claude round 1 analysis was not found.' }
$imageList = if ($task.task.images.Count -gt 0) { ($task.task.images -join "`n- ") } else { 'None attached.' }
$prompt = @"
You are Codex Round 2 analyst for a MenuApp UX discussion.

Task ID: $($task.task_id)
Page: $($task.metadata.page)
Topic: $($task.metadata.topic)
Task body:
$($task.task.body)

Claude Round 1 analysis:
$ccRound1

Attached screenshots or source images:
- $imageList

Write a structured counter-analysis in markdown with these sections:
1. Agreement with Claude
2. Differences from Claude
3. Additional evidence or examples
4. Your recommendation
5. Open questions

Be specific. If images are attached, use them directly in your analysis.
"@

Write-V7TextFile -Path $promptPath -Content $prompt
$codexArgs = @('exec', '-C', $task.paths.repo_root, '--full-auto', '--json', '-o', $resultPath)
foreach ($imagePath in $task.task.images) {
    $codexArgs += @('--image', [string]$imagePath)
}
$codexArgs += '-'
$startedAt = Get-V7Timestamp
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $codexPrefix -Arguments $codexArgs -WorkingDirectory $task.paths.repo_root -StdOutPath $stdoutPath -StdErrPath $stderrPath -InputText $prompt
$endedAt = Get-V7Timestamp

$result = [ordered]@{
    worker = 'codex-round1'
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    output_file = $resultPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    images = $task.task.images
}
Write-V7Json -Path $workerResultPath -Data $result
if ($exitCode -ne 0) { exit $exitCode }
