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
$mergeWorktree = $task.paths.merge_worktree
$writerWorktree = $task.paths.writer_worktree
$codexWorktree = $task.paths.review_worktree
$baseCommit = [string]$task.git.base_commit
$budget = [string]$task.metadata.budget
$rulesPath = $task.paths.cc_rules_path
$mergeResultPath = Join-Path $artifactsDir 'merge.result.json'
$reportPath = Join-Path $artifactsDir 'parallel-write-report.md'
$promptPath = Join-Path $promptsDir 'parallel-write-reconcile.prompt.md'
$stdoutPath = Join-Path $logsDir 'parallel-write-reconcile.stdout.log'
$stderrPath = Join-Path $logsDir 'parallel-write-reconcile.stderr.log'
$diffPath = Join-Path $artifactsDir 'parallel-write-codex.diff'

$writerResult = Read-V7Json -Path (Join-Path $artifactsDir 'claude-writer.result.json')
$codexResult = Read-V7Json -Path (Join-Path $artifactsDir 'codex-writer.result.json')
$writerCommit = Get-V7StateText -Object $writerResult -Name 'commit_hash'
$codexCommit = Get-V7StateText -Object $codexResult -Name 'commit_hash'

if ([string]::IsNullOrWhiteSpace($writerCommit) -and (Test-Path -LiteralPath $writerWorktree)) {
    $candidate = (Invoke-V7Git -RepoRoot $writerWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve CC writer HEAD').stdout.Trim()
    if (-not [string]::IsNullOrWhiteSpace($candidate) -and ([string]::IsNullOrWhiteSpace($baseCommit) -or $candidate -ne $baseCommit)) {
        $writerCommit = $candidate
    }
}
if ([string]::IsNullOrWhiteSpace($codexCommit) -and (Test-Path -LiteralPath $codexWorktree)) {
    $candidate = (Invoke-V7Git -RepoRoot $codexWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Codex writer HEAD').stdout.Trim()
    if (-not [string]::IsNullOrWhiteSpace($candidate) -and ([string]::IsNullOrWhiteSpace($baseCommit) -or $candidate -ne $baseCommit)) {
        $codexCommit = $candidate
    }
}

if ([string]::IsNullOrWhiteSpace($writerCommit)) {
    throw 'CC writer did not produce a commit hash.'
}
if ([string]::IsNullOrWhiteSpace($codexCommit)) {
    throw 'Codex writer did not produce a commit hash.'
}

$cherryPick = Invoke-V7CapturedCommand -CommandPrefix @('git') -Arguments @('-C', $mergeWorktree, 'cherry-pick', $writerCommit) -WorkingDirectory $mergeWorktree
$cherryLines = @()
if (-not [string]::IsNullOrWhiteSpace([string]$cherryPick.stdout)) { $cherryLines += [string]$cherryPick.stdout }
if (-not [string]::IsNullOrWhiteSpace([string]$cherryPick.stderr)) { $cherryLines += [string]$cherryPick.stderr }
Write-V7TextFile -Path (Join-Path $logsDir 'parallel-write-cherry-pick.log') -Content (if ($cherryLines.Count -gt 0) { (($cherryLines -join "`n").TrimEnd() + "`n") } else { '' })
if ((Get-V7NormalizedExitCode $cherryPick.exit_code) -ne 0) {
    throw 'Unable to cherry-pick CC writer commit into merge worktree.'
}

$preReconcileHead = (Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve merge HEAD after cherry-pick').stdout.Trim()
if ([string]::IsNullOrWhiteSpace($baseCommit)) {
    $codexDiff = (Invoke-V7Git -RepoRoot $codexWorktree -Arguments @('show', '--stat', '--patch', $codexCommit) -FailureMessage 'Unable to collect Codex writer patch').stdout
} else {
    $codexDiff = (Invoke-V7Git -RepoRoot $codexWorktree -Arguments @('diff', "$baseCommit..$codexCommit") -FailureMessage 'Unable to diff Codex writer changes').stdout
}
Write-V7TextFile -Path $diffPath -Content $codexDiff

$prompt = @"
You are the reconciler for a parallel-write task.
Two AI agents independently wrote code for the same task.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Budget: $budget USD
Merge worktree: $mergeWorktree
Report path: $reportPath
Codex diff file: $diffPath

CC Writer commit: $writerCommit (already applied to this worktree)
Codex Writer commit: $codexCommit (in review worktree)

Your job:
1. Read the CC writer changes already present in this worktree.
2. Read the Codex writer patch from $diffPath.
3. Compare both approaches.
4. If Codex has better solutions for specific parts, apply them.
5. Write a reconciliation report to $reportPath with:
   - Which parts came from CC vs Codex
   - Any conflicts resolved
   - Final assessment
6. At the TOP of the report include these exact metadata lines:
   SourcePreference: CC|Codex|both
   FinalSource: CC only|Codex only|merged from both
7. Commit the final merged result before finishing.
"@
Write-V7TextFile -Path $promptPath -Content $prompt

$claudePrefix = Get-V7ClaudeCommandPrefix -RawPath $config.paths.claude_cli
$claudeArgs = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $budget)
if (-not [string]::IsNullOrWhiteSpace($RulesPath) -and (Test-Path -LiteralPath $RulesPath)) {
    $claudeArgs += @('--append-system-prompt-file', $RulesPath)
}
$exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $claudeArgs -WorkingDirectory $mergeWorktree -StdOutPath $stdoutPath -StdErrPath $stderrPath
if ((Get-V7NormalizedExitCode $exitCode) -ne 0) {
    throw 'Parallel-write reconcile pass failed.'
}
if (-not (Test-Path -LiteralPath $reportPath)) {
    throw 'Parallel-write reconcile report was not created.'
}

$headCommit = (Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve parallel-write merge HEAD').stdout.Trim()
$dirtyStatus = Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('status', '--porcelain') -FailureMessage 'Unable to inspect parallel-write merge worktree status'
$dirty = if ([string]::IsNullOrWhiteSpace([string]$dirtyStatus.stdout)) { @() } else { @(($dirtyStatus.stdout -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }) }
$autoCommitted = $false
if ($headCommit -eq $preReconcileHead -and $dirty.Count -gt 0) {
    Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('add', '-A') -FailureMessage 'Unable to stage parallel-write reconcile changes' | Out-Null
    Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('commit', '-m', ('task({0}): {1} parallel-write reconcile' -f $task.metadata.page, $task.task_id)) -FailureMessage 'Unable to commit parallel-write reconcile changes' | Out-Null
    $headCommit = (Invoke-V7Git -RepoRoot $mergeWorktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve merge HEAD after reconcile commit').stdout.Trim()
    $autoCommitted = $true
}

$reportContent = Read-V7TextFile -Path $reportPath
$usedSource = 'both'
$finalSource = 'merged from both'
if ($reportContent -match '(?im)^SourcePreference:\s*(.+)$') {
    $usedSource = $matches[1].Trim()
}
if ($reportContent -match '(?im)^FinalSource:\s*(.+)$') {
    $finalSource = $matches[1].Trim()
}
$changedFiles = @(Get-V7ChangedFiles -RepoRoot $mergeWorktree -BaseCommit $baseCommit)

$result = [ordered]@{
    status = 'completed'
    writer_commit = $writerCommit
    codex_commit = $codexCommit
    merge_commit = $headCommit
    changed_files = $changedFiles
    report_file = $reportPath
    codex_diff_file = $diffPath
    used_source = $usedSource
    source = $finalSource
    auto_committed = $autoCommitted
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
}
Write-V7Json -Path $mergeResultPath -Data $result
