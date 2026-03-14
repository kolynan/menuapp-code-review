param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

function Convert-V7CodexPathToCommandPrefix {
    param([string]$ResolvedPath)

    if ([string]::IsNullOrWhiteSpace($ResolvedPath)) {
        return @()
    }

    if ($ResolvedPath.EndsWith('.cmd', [System.StringComparison]::OrdinalIgnoreCase) -or $ResolvedPath.EndsWith('.bat', [System.StringComparison]::OrdinalIgnoreCase)) {
        return @($env:ComSpec, '/d', '/s', '/c', $ResolvedPath)
    }
    if ($ResolvedPath.EndsWith('.ps1', [System.StringComparison]::OrdinalIgnoreCase)) {
        return @((Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'), '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ResolvedPath)
    }
    return @($ResolvedPath)
}

function Get-V7CodexCommandPrefix {
    param([string]$RawPath)

    $absoluteCandidates = @()
    if (-not [string]::IsNullOrWhiteSpace($RawPath) -and [System.IO.Path]::IsPathRooted($RawPath)) {
        $absoluteCandidates += $RawPath
        if ([string]::IsNullOrWhiteSpace([System.IO.Path]::GetExtension($RawPath))) {
            $absoluteCandidates += @($RawPath + '.exe', $RawPath + '.cmd', $RawPath + '.ps1')
        }
    }

    foreach ($candidate in @($absoluteCandidates | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate)) {
            continue
        }
        $resolvedCandidate = (Resolve-Path -LiteralPath $candidate).Path
        if ($resolvedCandidate.EndsWith('.ps1', [System.StringComparison]::OrdinalIgnoreCase)) {
            $cmdSibling = [System.IO.Path]::ChangeExtension($resolvedCandidate, '.cmd')
            if (Test-Path -LiteralPath $cmdSibling) {
                return @(Convert-V7CodexPathToCommandPrefix -ResolvedPath (Resolve-Path -LiteralPath $cmdSibling).Path)
            }
        }
        return @(Convert-V7CodexPathToCommandPrefix -ResolvedPath $resolvedCandidate)
    }

    $commandNames = @()
    if (-not [string]::IsNullOrWhiteSpace($RawPath)) {
        $commandNames += $RawPath
    }
    $commandNames += @('codex.cmd', 'codex.exe', 'codex')

    foreach ($name in @($commandNames | Select-Object -Unique)) {
        $command = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $command) {
            continue
        }

        $source = ''
        if ($command.Source) {
            $source = [string]$command.Source
        } elseif ($command.Path) {
            $source = [string]$command.Path
        }
        if ([string]::IsNullOrWhiteSpace($source)) {
            continue
        }

        if ($source.EndsWith('.ps1', [System.StringComparison]::OrdinalIgnoreCase)) {
            $cmdSibling = [System.IO.Path]::ChangeExtension($source, '.cmd')
            if (Test-Path -LiteralPath $cmdSibling) {
                return @(Convert-V7CodexPathToCommandPrefix -ResolvedPath (Resolve-Path -LiteralPath $cmdSibling).Path)
            }
        }
        return @(Convert-V7CodexPathToCommandPrefix -ResolvedPath $source)
    }

    $defaultExe = 'C:\Users\ASUS\AppData\Local\Programs\codex-cli\codex.exe'
    if (Test-Path -LiteralPath $defaultExe) {
        return @(Convert-V7CodexPathToCommandPrefix -ResolvedPath (Resolve-Path -LiteralPath $defaultExe).Path)
    }

    return @()
}

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$codexPrefix = Get-V7CodexCommandPrefix -RawPath ([string]$config.paths.codex_cli)
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

Write-V7TextFile -Path $promptPath -Content $prompt

$preflightStartedAt = Get-V7Timestamp
if ($codexPrefix.Count -eq 0) {
    $configuredPath = [string]$config.paths.codex_cli
    $errorMessage = 'Codex CLI not found. Checked configured path "' + $configuredPath + '" plus PATH resolution via Get-Command codex/codex.cmd.'
    Write-V7TextFile -Path $stdoutPath -Content ''
    Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
    [Console]::Error.WriteLine($errorMessage)

    $skippedResult = [ordered]@{
        worker = 'codex-reviewer'
        status = 'skipped'
        exit_code = 0
        started_at = $preflightStartedAt
        ended_at = Get-V7Timestamp
        stdout_log = $stdoutPath
        stderr_log = $stderrPath
        prompt_file = $promptPath
        output_file = ''
        findings_count = 0
        resolved_command = ''
        error_message = $errorMessage
    }
    Write-V7Json -Path $workerResultPath -Data $skippedResult
    exit 0
}

$args = @('exec', '-C', $worktree, '--full-auto', '--json', '-o', $resultPath, '--output-schema', $schemaPath, $prompt)
$startedAt = Get-V7Timestamp
$exitCode = 1
$errorMessage = ''

try {
    $exitCode = Invoke-V7CommandToFiles -CommandPrefix $codexPrefix -Arguments $args -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath
} catch {
    $errorMessage = $_.Exception.Message
    Write-V7TextFile -Path $stderrPath -Content ($errorMessage + "`n")
    [Console]::Error.WriteLine($errorMessage)
    $exitCode = 1
}

$endedAt = Get-V7Timestamp
$findingsCount = 0
if (Test-Path -LiteralPath $resultPath) {
    $reviewPayload = Read-V7Json -Path $resultPath
    if ($reviewPayload -and $reviewPayload.findings) {
        $findingsCount = @($reviewPayload.findings).Count
    }
}

if ([string]::IsNullOrWhiteSpace($errorMessage) -and $exitCode -ne 0 -and (Test-Path -LiteralPath $stderrPath)) {
    $stderrText = (Read-V7TextFile -Path $stderrPath).Trim()
    if (-not [string]::IsNullOrWhiteSpace($stderrText)) {
        $errorMessage = (($stderrText -split "`r?`n") | Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } | Select-Object -First 1)
    }
}
if ([string]::IsNullOrWhiteSpace($errorMessage) -and $exitCode -ne 0) {
    $errorMessage = 'Codex reviewer exited with code ' + $exitCode
}

$result = [ordered]@{
    worker = 'codex-reviewer'
    status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
    exit_code = $exitCode
    started_at = $startedAt
    ended_at = $endedAt
    stdout_log = $stdoutPath
    stderr_log = $stderrPath
    prompt_file = $promptPath
    output_file = if (Test-Path -LiteralPath $resultPath) { $resultPath } else { '' }
    findings_count = $findingsCount
    resolved_command = if ($codexPrefix.Count -gt 0) { ($codexPrefix -join ' ') } else { '' }
    error_message = $errorMessage
}
Write-V7Json -Path $workerResultPath -Data $result

if ($exitCode -ne 0) {
    exit $exitCode
}
