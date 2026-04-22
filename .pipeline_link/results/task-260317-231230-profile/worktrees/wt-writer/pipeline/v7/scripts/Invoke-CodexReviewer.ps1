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
$bundlePath = Join-Path $promptsDir 'codex-reviewer.bundle.md'
$findingStreamPath = Get-V7FindingStreamPath -ArtifactsDir $artifactsDir -WorkerName 'codex-reviewer'
Write-V7TextFile -Path $findingStreamPath -Content ''
$preflightStartedAt = Get-V7Timestamp

$codeFilePath = [string]$task.paths.code_file
$bugsFilePath = [string]$task.paths.bugs_file
$readmeFilePath = [string]$task.paths.readme_file

if (-not (Test-Path -LiteralPath $codeFilePath)) {
    $errorMessage = 'Codex reviewer target code file not found: ' + $codeFilePath
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
        bundle_file = $bundlePath
        output_file = ''
        findings_count = 0
        resolved_command = ''
        error_message = $errorMessage
    }
    Write-V7Json -Path $workerResultPath -Data $skippedResult
    exit 0
}

$codeContent = Read-V7TextFile -Path $codeFilePath
$bugsContent = 'No BUGS.md found'
if (-not [string]::IsNullOrWhiteSpace($bugsFilePath) -and (Test-Path -LiteralPath $bugsFilePath)) {
    $bugsContent = Read-V7TextFile -Path $bugsFilePath
}

$readmeContent = 'No README.md found'
if (-not [string]::IsNullOrWhiteSpace($readmeFilePath) -and (Test-Path -LiteralPath $readmeFilePath)) {
    $readmeContent = Read-V7TextFile -Path $readmeFilePath
}

$bundleLines = @(
    '# Review Bundle'
    ''
    '## Target Code: ' + (Split-Path -Leaf $codeFilePath)
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
Write-V7TextFile -Path $bundlePath -Content ($bundleLines -join "`n")

$prompt = @"
You are the independent reviewer in MenuApp pipeline V7.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Page: $($task.metadata.page)

IMPORTANT: A pre-built review bundle has been prepared for you at: $bundlePath
This bundle contains the target code, BUGS.md, and README.md already assembled.
Live findings stream: $findingStreamPath

Instructions:
1. Read the review bundle file FIRST. It contains all primary context you need.
2. Do NOT scan the repository for files. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if the code imports or references them directly.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Report only NEW issues that are NOT already listed in the Known Bugs section of the bundle.
6. Each time you confirm a NEW finding, append one JSON line to $findingStreamPath immediately.
7. Use worker='codex-reviewer', worker_key='codex_reviewer', and sequence numbers starting at 1.
8. Keep summary text short enough for Telegram and stream at most 8 entries total.
9. Do not rewrite or delete earlier stream lines.
10. Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
11. Do not edit any files.
12. Return JSON that matches the provided schema.

Task instructions:
$($task.task.body)
"@

Write-V7TextFile -Path $promptPath -Content $prompt

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
        bundle_file = $bundlePath
        output_file = ''
        findings_count = 0
        resolved_command = ''
        error_message = $errorMessage
    }
    Write-V7Json -Path $workerResultPath -Data $skippedResult
    exit 0
}

$codexArgs = @('exec', '-C', $worktree, '--full-auto', '--json', '-o', $resultPath, '--output-schema', $schemaPath, '-')
$startedAt = Get-V7Timestamp
$exitCode = 1
$errorMessage = ''

try {
    $exitCode = Invoke-V7CommandToFiles -CommandPrefix $codexPrefix -Arguments $codexArgs -WorkingDirectory $worktree -StdOutPath $stdoutPath -StdErrPath $stderrPath -InputText $prompt
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
    if ($reviewPayload -and $reviewPayload.findings) {
        Sync-V7ReviewFindingsToStream -Path $findingStreamPath -ReviewPayload $reviewPayload -TaskId $task.task_id
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
    bundle_file = $bundlePath
    output_file = if (Test-Path -LiteralPath $resultPath) { $resultPath } else { '' }
    findings_count = $findingsCount
    resolved_command = if ($codexPrefix.Count -gt 0) { ($codexPrefix -join ' ') } else { '' }
    error_message = $errorMessage
}
Write-V7Json -Path $workerResultPath -Data $result

if ($exitCode -ne 0) {
    exit $exitCode
}
