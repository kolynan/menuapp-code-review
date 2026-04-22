param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath,
    [Parameter(Mandatory = $true)][int]$RoundNumber,
    [Parameter(Mandatory = $true)][string]$InputResultPath,
    [Parameter(Mandatory = $true)][string]$OutputResultPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

function Read-ConsensusAgentResponse {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return $null
    }

    try {
        return (Read-V7TextFile -Path $Path) | ConvertFrom-Json
    } catch {
        return $null
    }
}

function Get-ConsensusResponseMap {
    param($ResponseObject)

    $map = @{}
    if ($null -eq $ResponseObject -or $null -eq $ResponseObject.responses) {
        return $map
    }

    foreach ($item in @($ResponseObject.responses | Where-Object { $null -ne $_ })) {
        $id = [string](Get-V7StateText -Object $item -Name 'id')
        if (-not [string]::IsNullOrWhiteSpace($id)) {
            $map[$id] = $item
        }
    }
    return $map
}

function Invoke-ConsensusClaudeRound {
    param(
        [string[]]$ClaudePrefix,
        [string]$Prompt,
        [string]$PromptPath,
        [string]$StdoutPath,
        [string]$StderrPath,
        [string]$WorkingDirectory,
        [string]$RulesPath,
        [string]$Budget
    )

    Write-V7TextFile -Path $PromptPath -Content $Prompt
    $claudeArgs = @('-p', $Prompt, '--allowedTools', 'Read,Write', '--max-budget-usd', $Budget)
    if (-not [string]::IsNullOrWhiteSpace($RulesPath) -and (Test-Path -LiteralPath $RulesPath)) {
        $claudeArgs += @('--append-system-prompt-file', $RulesPath)
    }
    return Invoke-V7CommandToFiles -CommandPrefix $ClaudePrefix -Arguments $claudeArgs -WorkingDirectory $WorkingDirectory -StdOutPath $StdoutPath -StdErrPath $StderrPath
}

function Invoke-ConsensusCodexRound {
    param(
        [string[]]$CodexPrefix,
        [string]$Prompt,
        [string]$StdoutPath,
        [string]$StderrPath,
        [string]$WorkingDirectory,
        [string]$OutputPath
    )

    $codexArgs = @('exec', '-C', $WorkingDirectory, '--full-auto', '-o', $OutputPath, '-')
    return Invoke-V7CommandToFiles -CommandPrefix $CodexPrefix -Arguments $codexArgs -WorkingDirectory $WorkingDirectory -StdOutPath $StdoutPath -StdErrPath $StderrPath -InputText $Prompt
}

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$claudePrefix = Get-V7ClaudeCommandPrefix -RawPath $config.paths.claude_cli
$codexPrefix = Get-V7CodexCommandPrefix -RawPath ([string]$config.paths.codex_cli)
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$repoRoot = $task.paths.repo_root
$budget = [string]$task.metadata.budget
$rulesPath = $task.paths.cc_rules_path
$inputResult = Read-V7Json -Path $InputResultPath
$startedAt = Get-V7Timestamp

if (-not $inputResult) {
    throw 'Consensus round input result was not found.'
}

$openDisagreements = @($inputResult.disagreements | Where-Object { $null -ne $_ -and (Get-V7StateText -Object $_ -Name 'status' -Default 'open') -ne 'resolved' })
if ($openDisagreements.Count -eq 0) {
    $passthrough = [ordered]@{
        status = 'completed'
        round = $RoundNumber
        started_at = $startedAt
        ended_at = Get-V7Timestamp
        agreements = @($inputResult.agreements | Where-Object { $null -ne $_ })
        disagreements = @($inputResult.disagreements | Where-Object { $null -ne $_ })
        resolved_count = @($inputResult.disagreements | Where-Object { $null -ne $_ -and (Get-V7StateText -Object $_ -Name 'status') -eq 'resolved' }).Count
        unresolved_count = 0
        consensus_reached = $true
    }
    Write-V7Json -Path $OutputResultPath -Data $passthrough
    exit 0
}

$summaryBlocks = @()
foreach ($item in $openDisagreements) {
    $id = [string](Get-V7StateText -Object $item -Name 'id')
    $file = [string](Get-V7StateText -Object $item -Name 'file')
    $ccStatus = [string](Get-V7StateText -Object $item -Name 'cc_status')
    $codexStatus = [string](Get-V7StateText -Object $item -Name 'codex_status')
    $rounds = @($item.rounds | Where-Object { $null -ne $_ })
    $lastRound = if ($rounds.Count -gt 0) { $rounds[-1] } else { $null }
    $previousForClaude = if ($lastRound) { [string](Get-V7StateText -Object (Get-V7StateValue -Object $lastRound -Name 'codex') -Name 'reason') } else { '' }
    $previousForCodex = if ($lastRound) { [string](Get-V7StateText -Object (Get-V7StateValue -Object $lastRound -Name 'cc') -Name 'reason') } else { '' }

    $summaryBlocks += @(
        ('ID: ' + $id),
        ('File: ' + $file),
        ('CC status: ' + $ccStatus),
        ('Codex status: ' + $codexStatus),
        'CC patch excerpt:',
        [string](Get-V7StateText -Object $item -Name 'cc_patch_excerpt'),
        'Codex patch excerpt:',
        [string](Get-V7StateText -Object $item -Name 'codex_patch_excerpt'),
        ('Codex previous reason for Claude: ' + $(if ([string]::IsNullOrWhiteSpace($previousForClaude)) { 'None yet.' } else { $previousForClaude })),
        ('CC previous reason for Codex: ' + $(if ([string]::IsNullOrWhiteSpace($previousForCodex)) { 'None yet.' } else { $previousForCodex })),
        ''
    )
}
$disagreementSummary = ($summaryBlocks -join "`n").Trim()

$claudeOutputPath = Join-Path $artifactsDir ('consensus-round' + $RoundNumber + '.claude.json')
$codexOutputPath = Join-Path $artifactsDir ('consensus-round' + $RoundNumber + '.codex.json')
$claudePromptPath = Join-Path $promptsDir ('consensus-round' + $RoundNumber + '.claude.prompt.md')
$claudeStdoutPath = Join-Path $logsDir 'consensus-round.claude.stdout.log'
$claudeStderrPath = Join-Path $logsDir 'consensus-round.claude.stderr.log'
$codexStdoutPath = Join-Path $logsDir 'consensus-round.codex.stdout.log'
$codexStderrPath = Join-Path $logsDir 'consensus-round.codex.stderr.log'

$claudePrompt = @"
You are CC Writer in MenuApp consensus round $RoundNumber.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Repository: $repoRoot
Output file: $claudeOutputPath

Open disagreements:
$disagreementSummary

Respond by writing ONLY valid JSON to $claudeOutputPath using this schema:
{
  "responses": [
    {
      "id": "disagreement-id",
      "preferred_source": "cc|codex|unresolved",
      "reason": "short justification"
    }
  ]
}

Rules:
- Choose ONLY `cc`, `codex`, or `unresolved`.
- Use `unresolved` if you still do not agree with a single-source choice.
- Do not edit repository code.
"@

$codexPrompt = @"
You are Codex Writer in MenuApp consensus round $RoundNumber.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Repository: $repoRoot
Output file: $codexOutputPath

Open disagreements:
$disagreementSummary

Respond with ONLY valid JSON and save it to $codexOutputPath using this schema:
{
  "responses": [
    {
      "id": "disagreement-id",
      "preferred_source": "cc|codex|unresolved",
      "reason": "short justification"
    }
  ]
}

Rules:
- Choose ONLY `cc`, `codex`, or `unresolved`.
- Use `unresolved` if you still do not agree with a single-source choice.
- Do not edit repository code.
"@

$claudeExitCode = Invoke-ConsensusClaudeRound -ClaudePrefix $claudePrefix -Prompt $claudePrompt -PromptPath $claudePromptPath -StdoutPath $claudeStdoutPath -StderrPath $claudeStderrPath -WorkingDirectory $repoRoot -RulesPath $rulesPath -Budget $budget
if (-not (Test-V7ExitSuccess $claudeExitCode)) {
    throw ('Consensus Claude round failed with exit code ' + $claudeExitCode)
}
if (-not (Test-Path -LiteralPath $claudeOutputPath)) {
    throw 'Consensus Claude round did not produce a response file.'
}

$codexExitCode = Invoke-ConsensusCodexRound -CodexPrefix $codexPrefix -Prompt $codexPrompt -StdoutPath $codexStdoutPath -StderrPath $codexStderrPath -WorkingDirectory $repoRoot -OutputPath $codexOutputPath
if (-not (Test-V7ExitSuccess $codexExitCode)) {
    throw ('Consensus Codex round failed with exit code ' + $codexExitCode)
}
if (-not (Test-Path -LiteralPath $codexOutputPath)) {
    throw 'Consensus Codex round did not produce a response file.'
}

$claudeResponse = Read-ConsensusAgentResponse -Path $claudeOutputPath
$codexResponse = Read-ConsensusAgentResponse -Path $codexOutputPath
if ($null -eq $claudeResponse) {
    throw 'Consensus Claude response was not valid JSON.'
}
if ($null -eq $codexResponse) {
    throw 'Consensus Codex response was not valid JSON.'
}
$claudeMap = Get-ConsensusResponseMap -ResponseObject $claudeResponse
$codexMap = Get-ConsensusResponseMap -ResponseObject $codexResponse
$updatedDisagreements = New-Object System.Collections.Generic.List[object]

foreach ($item in @($inputResult.disagreements | Where-Object { $null -ne $_ })) {
    $status = [string](Get-V7StateText -Object $item -Name 'status' -Default 'open')
    if ($status -eq 'resolved') {
        $updatedDisagreements.Add($item)
        continue
    }

    $id = [string](Get-V7StateText -Object $item -Name 'id')
    $ccReply = if (Test-V7HasProperty -InputObject $claudeMap -Name $id) { $claudeMap[$id] } else { $null }
    $codexReply = if (Test-V7HasProperty -InputObject $codexMap -Name $id) { $codexMap[$id] } else { $null }
    $ccChoice = ([string](Get-V7StateText -Object $ccReply -Name 'preferred_source')).Trim().ToLowerInvariant()
    $codexChoice = ([string](Get-V7StateText -Object $codexReply -Name 'preferred_source')).Trim().ToLowerInvariant()
    if (-not (@('cc', 'codex') -contains $ccChoice)) { $ccChoice = 'unresolved' }
    if (-not (@('cc', 'codex') -contains $codexChoice)) { $codexChoice = 'unresolved' }

    $resolvedSource = if ($ccChoice -eq $codexChoice -and @('cc', 'codex') -contains $ccChoice) { $ccChoice } else { '' }
    $existingRounds = @($item.rounds | Where-Object { $null -ne $_ })
    $existingRounds += [ordered]@{
        round = $RoundNumber
        cc = [ordered]@{
            preferred_source = $ccChoice
            reason = [string](Get-V7StateText -Object $ccReply -Name 'reason')
        }
        codex = [ordered]@{
            preferred_source = $codexChoice
            reason = [string](Get-V7StateText -Object $codexReply -Name 'reason')
        }
    }

    $updatedDisagreements.Add([ordered]@{
        id = $id
        file = [string](Get-V7StateText -Object $item -Name 'file')
        kind = [string](Get-V7StateText -Object $item -Name 'kind')
        status = $(if ([string]::IsNullOrWhiteSpace($resolvedSource)) { 'open' } else { 'resolved' })
        resolved_source = $resolvedSource
        cc_status = [string](Get-V7StateText -Object $item -Name 'cc_status')
        codex_status = [string](Get-V7StateText -Object $item -Name 'codex_status')
        cc_patch_excerpt = [string](Get-V7StateText -Object $item -Name 'cc_patch_excerpt')
        codex_patch_excerpt = [string](Get-V7StateText -Object $item -Name 'codex_patch_excerpt')
        rounds = $existingRounds
    })
}

$resolvedCount = @($updatedDisagreements | Where-Object { [string](Get-V7StateText -Object $_ -Name 'status') -eq 'resolved' }).Count
$unresolvedCount = @($updatedDisagreements | Where-Object { [string](Get-V7StateText -Object $_ -Name 'status') -ne 'resolved' }).Count
$result = [ordered]@{
    status = 'completed'
    round = $RoundNumber
    started_at = $startedAt
    ended_at = Get-V7Timestamp
    agreements = @($inputResult.agreements | Where-Object { $null -ne $_ })
    disagreements = @($updatedDisagreements)
    resolved_count = $resolvedCount
    unresolved_count = $unresolvedCount
    consensus_reached = ($unresolvedCount -eq 0)
    claude_output_file = $claudeOutputPath
    codex_output_file = $codexOutputPath
}
Write-V7Json -Path $OutputResultPath -Data $result
