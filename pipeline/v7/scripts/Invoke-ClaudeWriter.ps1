param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath,
    [ValidateSet('writer', 'reconcile')][string]$Mode = 'writer'
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

function Get-V7WorktreeMirrorPath {
    param(
        [string]$RepoRoot,
        [string]$WorktreeRoot,
        [string]$SourcePath
    )

    if ([string]::IsNullOrWhiteSpace($SourcePath)) {
        return ''
    }

    $fullSource = [System.IO.Path]::GetFullPath($SourcePath)
    if ([string]::IsNullOrWhiteSpace($RepoRoot) -or [string]::IsNullOrWhiteSpace($WorktreeRoot)) {
        return $fullSource
    }

    $fullRepoRoot = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd([char[]]'\/')
    if ($fullSource.StartsWith($fullRepoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        $relative = $fullSource.Substring($fullRepoRoot.Length).TrimStart([char[]]'\/')
        return Join-Path $WorktreeRoot $relative
    }

    return $fullSource
}

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
    $bundleName = 'claude-writer.bundle.md'
} else {
    $worktree = $task.paths.merge_worktree
    $summaryPath = Join-Path $artifactsDir 'cc-reconcile-summary.md'
    $resultPath = Join-Path $artifactsDir 'claude-reconcile.result.json'
    $promptPath = Join-Path $promptsDir 'claude-reconcile.prompt.md'
    $stdoutPath = Join-Path $logsDir 'claude-reconcile.stdout.log'
    $stderrPath = Join-Path $logsDir 'claude-reconcile.stderr.log'
    $modeLabel = 'Claude reconcile writer'
    $bundleName = 'claude-reconcile.bundle.md'
}

$reviewFindingsPath = Join-Path $artifactsDir 'codex-review-findings.json'
$bundlePath = Join-Path $promptsDir $bundleName
$preflightStartedAt = Get-V7Timestamp
$commitMessage = if ($Mode -eq 'writer') {
    "task($($task.metadata.page)): $($task.task_id) CC writer"
} else {
    "task($($task.metadata.page)): $($task.task_id) reconcile reviewer findings"
}

$repoRootPath = [string]$task.paths.repo_root
$codeWorktreePath = Get-V7WorktreeMirrorPath -RepoRoot $repoRootPath -WorktreeRoot $worktree -SourcePath ([string]$task.paths.code_file)
$bugsWorktreePath = Get-V7WorktreeMirrorPath -RepoRoot $repoRootPath -WorktreeRoot $worktree -SourcePath ([string]$task.paths.bugs_file)
$readmeWorktreePath = Get-V7WorktreeMirrorPath -RepoRoot $repoRootPath -WorktreeRoot $worktree -SourcePath ([string]$task.paths.readme_file)

if ([string]::IsNullOrWhiteSpace($codeWorktreePath) -or -not (Test-Path -LiteralPath $codeWorktreePath)) {
    $errorMessage = 'Claude writer target code file not found in worktree: ' + $codeWorktreePath
    Write-V7TextFile -Path $stdoutPath -Content ''
    Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
    [Console]::Error.WriteLine($errorMessage)

    $skippedResult = [ordered]@{
        worker = if ($Mode -eq 'writer') { 'claude-writer' } else { 'claude-reconcile' }
        mode = $Mode
        status = 'skipped'
        exit_code = 0
        started_at = $preflightStartedAt
        ended_at = Get-V7Timestamp
        worktree = $worktree
        summary_file = $summaryPath
        stdout_log = $stdoutPath
        stderr_log = $stderrPath
        prompt_file = $promptPath
        bundle_file = $bundlePath
        commit_hash = ''
        auto_committed = $false
        changed_files = @()
        error_message = $errorMessage
    }
    Write-V7Json -Path $resultPath -Data $skippedResult
    exit 0
}

$codeContent = Read-V7TextFile -Path $codeWorktreePath
$bugsContent = 'No BUGS.md found'
if (-not [string]::IsNullOrWhiteSpace($bugsWorktreePath) -and (Test-Path -LiteralPath $bugsWorktreePath)) {
    $bugsContent = Read-V7TextFile -Path $bugsWorktreePath
}

$readmeContent = 'No README.md found'
if (-not [string]::IsNullOrWhiteSpace($readmeWorktreePath) -and (Test-Path -LiteralPath $readmeWorktreePath)) {
    $readmeContent = Read-V7TextFile -Path $readmeWorktreePath
}

$bundleLines = @(
    '# Writer Bundle'
    ''
    '## Target Code: ' + (Split-Path -Leaf $codeWorktreePath)
    '```'
    $codeContent
    '```'
    ''
    '## Known Bugs (BUGS.md)'
    $bugsContent
    ''
    '## Page Context (README.md)'
    $readmeContent
)

if ($Mode -eq 'reconcile') {
    $reviewJson = if (Test-Path -LiteralPath $reviewFindingsPath) { Read-V7TextFile -Path $reviewFindingsPath } else { 'No reviewer findings file found.' }
    $bundleLines += @(
        ''
        '## Reviewer Findings'
        $reviewJson
    )
}

Write-V7TextFile -Path $bundlePath -Content (($bundleLines -join "`n") + "`n")

$prompt = @"
You are the $modeLabel for MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)
Budget: $budget USD
Working tree: $worktree
Target code inside worktree: $codeWorktreePath
Summary file to write before you finish: $summaryPath
Bundle file: $bundlePath

Instructions:
1. Read the bundle file FIRST. It contains the target code, BUGS.md, and README.md.
2. Do NOT scan the repository. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if they are directly imported by the target code or named explicitly in the task.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Work only inside the assigned worktree.
6. Update the target page, BUGS.md, and README.md only when this task requires it.
7. Keep changes scoped to the task.
8. Before finishing, write a concise markdown summary to $summaryPath with: files changed, main fixes, tests or checks run, and any follow-up risk.

Task instructions:
$($task.task.body)
"@

Write-V7TextFile -Path $promptPath -Content $prompt

$claudeArgs = @('-p', $prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $budget)
if (Test-Path -LiteralPath $rulesPath) {
    $claudeArgs += @('--append-system-prompt-file', $rulesPath)
}

$startedAt = Get-V7Timestamp
$exitCode = 1
$errorMessage = ''

try {
    $exitCode = Invoke-V7CommandToFiles -CommandPrefix $claudePrefix -Arguments $claudeArgs -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath
} catch {
    $errorMessage = $_.Exception.Message
    Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
    [Console]::Error.WriteLine($errorMessage)
    $exitCode = 1
}

$endedAt = Get-V7Timestamp
$headCommit = ''
$dirty = @()
$autoCommitted = $false

try {
    $headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Claude writer HEAD').stdout.Trim()
    $dirtyStatus = Invoke-V7Git -RepoRoot $worktree -Arguments @('status', '--porcelain') -FailureMessage 'Unable to inspect Claude writer worktree status'
    if (-not [string]::IsNullOrWhiteSpace([string]$dirtyStatus.stdout)) {
        $dirty = @(
            ($dirtyStatus.stdout -split "`r?`n") |
                Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) }
        )
    }
} catch {
    if ([string]::IsNullOrWhiteSpace($errorMessage)) {
        $errorMessage = $_.Exception.Message
    }
}

if (($headCommit -eq $baseCommit -or [string]::IsNullOrWhiteSpace($baseCommit)) -and $dirty.Count -gt 0) {
    Invoke-V7Git -RepoRoot $worktree -Arguments @('add', '-A') -FailureMessage 'Unable to stage Claude writer changes' | Out-Null
    Invoke-V7Git -RepoRoot $worktree -Arguments @('commit', '-m', $commitMessage) -FailureMessage 'Unable to auto-commit Claude writer changes' | Out-Null
    $headCommit = (Invoke-V7Git -RepoRoot $worktree -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve Claude writer HEAD after auto-commit').stdout.Trim()
    $autoCommitted = $true
}

$changedFiles = @(Get-V7ChangedFiles -RepoRoot $worktree -BaseCommit $baseCommit)
$hasWriterCommit = -not [string]::IsNullOrWhiteSpace($headCommit) -and ($autoCommitted -or (-not [string]::IsNullOrWhiteSpace($baseCommit) -and $headCommit -ne $baseCommit))

if ([string]::IsNullOrWhiteSpace($errorMessage) -and (-not (Test-V7ExitSuccess $exitCode)) -and (Test-Path -LiteralPath $stderrPath)) {
    $stderrText = (Read-V7TextFile -Path $stderrPath).Trim()
    if (-not [string]::IsNullOrWhiteSpace($stderrText)) {
        $errorMessage = (($stderrText -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -First 1)
    }
}
if ([string]::IsNullOrWhiteSpace($errorMessage) -and (-not (Test-V7ExitSuccess $exitCode))) {
    $errorMessage = 'Claude writer exited with code ' + $exitCode
}

$result = [ordered]@{
    worker = if ($Mode -eq 'writer') { 'claude-writer' } else { 'claude-reconcile' }
    mode = $Mode
    status = if (Test-V7ExitSuccess $exitCode) { 'completed' } else { 'failed' }
    exit_code = (Get-V7NormalizedExitCode $exitCode)
    started_at = $startedAt
    ended_at = $endedAt
    worktree = $worktree
    summary_file = $summaryPath
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    bundle_file = $bundlePath
    commit_hash = if ($hasWriterCommit) { $headCommit } else { '' }
    auto_committed = $autoCommitted
    changed_files = $changedFiles
    error_message = $errorMessage
}
Write-V7Json -Path $resultPath -Data $result

if (-not (Test-V7ExitSuccess $exitCode)) {
    exit $exitCode
}
