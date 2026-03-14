param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

function Get-UxRepoRelativePath {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    $repoRootFull = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd([char[]]'\\/')
    $pathFull = [System.IO.Path]::GetFullPath($Path)
    if ($pathFull.StartsWith($repoRootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $pathFull.Substring($repoRootFull.Length).TrimStart([char[]]'\\/') -replace '\\', '/'
    }
    return $Path -replace '\\', '/'
}

function Invoke-UxClaudeRound {
    param(
        [Parameter(Mandatory = $true)][string]$WorkerName,
        [Parameter(Mandatory = $true)][string]$PromptPath,
        [Parameter(Mandatory = $true)][string]$StdoutPath,
        [Parameter(Mandatory = $true)][string]$StderrPath,
        [Parameter(Mandatory = $true)][string]$Prompt,
        [Parameter(Mandatory = $true)][string]$OutputFile,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string[]]$ClaudePrefix,
        [Parameter(Mandatory = $true)][string]$Budget,
        [string]$RulesPath,
        [Parameter(Mandatory = $true)][string]$AgentName,
        [Parameter(Mandatory = $true)][string]$ArtifactsDir,
        [Parameter(Mandatory = $true)][string]$RoundLabel
    )

    Write-V7TextFile -Path $PromptPath -Content $Prompt
    $args = @('-p', $Prompt, '--allowedTools', 'Bash,Read,Edit,Write', '--max-budget-usd', $Budget, '--agent', $AgentName)
    if (-not [string]::IsNullOrWhiteSpace($RulesPath) -and (Test-Path -LiteralPath $RulesPath)) {
        $args += @('--append-system-prompt-file', $RulesPath)
    }

    $startedAt = Get-V7Timestamp
    $exitCode = Invoke-V7CommandToFiles -CommandPrefix $ClaudePrefix -Arguments $args -WorkingDirectory $WorkingDirectory -StdOutPath $StdoutPath -StdErrPath $StderrPath
    $endedAt = Get-V7Timestamp

    $result = [ordered]@{
        worker = $WorkerName
        status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
        exit_code = $exitCode
        started_at = $startedAt
        ended_at = $endedAt
        output_file = $OutputFile
        stdout_log = $StdoutPath
        stderr_log = $StderrPath
        prompt_file = $PromptPath
        agent = $AgentName
    }
    Write-V7Json -Path (Join-Path $ArtifactsDir ($WorkerName + '.result.json')) -Data $result

    if ($exitCode -ne 0) {
        throw ($RoundLabel + ' failed with exit code ' + $exitCode)
    }
    if (-not (Test-Path -LiteralPath $OutputFile)) {
        throw ($RoundLabel + ' did not create output file: ' + $OutputFile)
    }
}

function Invoke-UxCodexRound {
    param(
        [Parameter(Mandatory = $true)][string]$WorkerName,
        [Parameter(Mandatory = $true)][string]$PromptPath,
        [Parameter(Mandatory = $true)][string]$StdoutPath,
        [Parameter(Mandatory = $true)][string]$StderrPath,
        [Parameter(Mandatory = $true)][string]$Prompt,
        [Parameter(Mandatory = $true)][string]$OutputFile,
        [Parameter(Mandatory = $true)][string]$WorkingDirectory,
        [Parameter(Mandatory = $true)][string[]]$CodexPrefix,
        [string[]]$ImagePaths,
        [Parameter(Mandatory = $true)][string]$ArtifactsDir,
        [Parameter(Mandatory = $true)][string]$RoundLabel
    )

    Write-V7TextFile -Path $PromptPath -Content $Prompt
    $args = @('exec', '-C', $WorkingDirectory, '--full-auto', '-o', $OutputFile)
    foreach ($imagePath in @($ImagePaths)) {
        if (-not [string]::IsNullOrWhiteSpace([string]$imagePath)) {
            $args += @('--image', [string]$imagePath)
        }
    }
    $args += '-'

    $startedAt = Get-V7Timestamp
    $exitCode = Invoke-V7CommandToFiles -CommandPrefix $CodexPrefix -Arguments $args -WorkingDirectory $WorkingDirectory -StdOutPath $StdoutPath -StdErrPath $StderrPath -InputText $Prompt
    $endedAt = Get-V7Timestamp

    $result = [ordered]@{
        worker = $WorkerName
        status = if ($exitCode -eq 0) { 'completed' } else { 'failed' }
        exit_code = $exitCode
        started_at = $startedAt
        ended_at = $endedAt
        output_file = $OutputFile
        stdout_log = $StdoutPath
        stderr_log = $StderrPath
        prompt_file = $PromptPath
        images = @($ImagePaths)
    }
    Write-V7Json -Path (Join-Path $ArtifactsDir ($WorkerName + '.result.json')) -Data $result

    if ($exitCode -ne 0) {
        throw ($RoundLabel + ' failed with exit code ' + $exitCode)
    }
    if (-not (Test-Path -LiteralPath $OutputFile)) {
        throw ($RoundLabel + ' did not create output file: ' + $OutputFile)
    }
}

$task = Read-V7Json -Path $TaskJsonPath
$config = Get-V7Config -ConfigPath $task.paths.config_path
$claudePrefix = Get-V7ClaudeCommandPrefix -RawPath $config.paths.claude_cli
$codexPrefix = Get-V7CodexCommandPrefix -RawPath ([string]$config.paths.codex_cli)
$artifactsDir = $task.paths.artifacts_dir
$promptsDir = $task.paths.prompts_dir
$logsDir = $task.paths.logs_dir
$repoRoot = $task.paths.repo_root
$topic = [string]$task.metadata.topic
$budget = [string]$task.metadata.budget
$claudeAgent = if ($task.metadata.agent) { [string]$task.metadata.agent } else { 'discussion-moderator' }
$rulesPath = $task.paths.cc_rules_path
$codexAgentPath = Join-Path $repoRoot '.github/agents/codex-review.agent.md'

if ([string]::IsNullOrWhiteSpace($topic)) {
    throw 'UX discussion tasks require metadata.topic.'
}

$topicSlug = ConvertTo-V7Slug -Value $topic
$sessionCore = ConvertTo-V7Slug -Value ($task.task_id -replace '^task-', '')
if ([string]::IsNullOrWhiteSpace($sessionCore)) {
    $sessionCore = Get-Date -Format 'yyyyMMdd-HHmmss'
}
$sessionName = 'S' + $sessionCore
$finalFileName = ('UX_Discussion_{0}_{1}.md' -f $topicSlug, $sessionName)
$round1Path = Join-Path $artifactsDir 'claude-round1-discussion.md'
$round2Path = Join-Path $artifactsDir 'codex-round2-discussion.md'
$finalArtifactPath = Join-Path $artifactsDir $finalFileName
$repoOutputDir = Ensure-V7Directory -Path (Join-Path $repoRoot 'pages/_ux-discussions')
$repoOutputPath = Join-Path $repoOutputDir $finalFileName
$referencePaths = @(Get-V7ReferenceDocuments -RepoRoot $repoRoot)
$referenceList = if ($referencePaths.Count -gt 0) {
    ($referencePaths | ForEach-Object { '- ' + $_ }) -join "`n"
} else {
    '- None found in references/.'
}
$imagePaths = @()
if ($task.task.images) {
    $imagePaths = @($task.task.images)
}
$imageList = if ($imagePaths.Count -gt 0) {
    ($imagePaths | ForEach-Object { '- ' + $_ }) -join "`n"
} else {
    '- None attached.'
}
$codexAgentReference = if (Test-Path -LiteralPath $codexAgentPath) { $codexAgentPath } else { 'Not found.' }
$startedAt = Get-V7Timestamp

$round1Prompt = @"
You are Claude Round 1 analyst for a MenuApp UX discussion.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Topic: $topic
Project: MenuApp
Output file: $round1Path

Task body:
$($task.task.body)

Reference documents under references/:
$referenceList

Local screenshots or source images:
$imageList

Round instructions:
- Use the discussion-moderator role as the Round 1 analyst.
- Ground the discussion in MenuApp product context and the provided reference documents when they exist.
- Do not edit application code.
- Write your analysis to $round1Path and stop.

Required sections:
1. Topic framing
2. User goals and constraints
3. Current friction points
4. Recommendations
5. Tradeoffs and risks
6. Open questions
"@
Invoke-UxClaudeRound -WorkerName 'claude-ux-round1' -PromptPath (Join-Path $promptsDir 'claude-ux-round1.prompt.md') -StdoutPath (Join-Path $logsDir 'claude-ux-round1.stdout.log') -StderrPath (Join-Path $logsDir 'claude-ux-round1.stderr.log') -Prompt $round1Prompt -OutputFile $round1Path -WorkingDirectory $repoRoot -ClaudePrefix $claudePrefix -Budget $budget -RulesPath $rulesPath -AgentName $claudeAgent -ArtifactsDir $artifactsDir -RoundLabel 'Claude round 1 analysis'

$round1Content = Read-V7TextFile -Path $round1Path
$round2Prompt = @"
You are Codex Round 2 reviewer for a MenuApp UX discussion.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Topic: $topic
Project: MenuApp
Output file: $round2Path

Task body:
$($task.task.body)

Reference documents under references/:
$referenceList

Role baseline file:
- $codexAgentReference

Claude Round 1 analysis:
$round1Content

Attached screenshots or source images:
$imageList

Your job:
- Act as an independent second opinion.
- Confirm strong points from Claude when you agree.
- Add missed UX risks, edge cases, and implementation cautions.
- Disagree clearly when Claude is overconfident or under-scoped.
- Focus on user flow, information hierarchy, mobile ergonomics, accessibility, state feedback, notification behavior, and operational tradeoffs.
- Do not edit application code.
- Write markdown to $round2Path and stop.

Required sections:
1. Agreements with Claude
2. Counterpoints
3. Additional opportunities
4. Risks and implementation cautions
5. Recommendation
"@
Invoke-UxCodexRound -WorkerName 'codex-ux-round2' -PromptPath (Join-Path $promptsDir 'codex-ux-round2.prompt.md') -StdoutPath (Join-Path $logsDir 'codex-ux-round2.stdout.log') -StderrPath (Join-Path $logsDir 'codex-ux-round2.stderr.log') -Prompt $round2Prompt -OutputFile $round2Path -WorkingDirectory $repoRoot -CodexPrefix $codexPrefix -ImagePaths $imagePaths -ArtifactsDir $artifactsDir -RoundLabel 'Codex round 2 review'

$round2Content = Read-V7TextFile -Path $round2Path
$round3Prompt = @"
You are Claude Round 3 synthesizer for a MenuApp UX discussion.

Task ID: $($task.task_id)
Workflow: $($task.workflow)
Topic: $topic
Project: MenuApp
Final output file: $finalArtifactPath

Task body:
$($task.task.body)

Reference documents under references/:
$referenceList

Claude Round 1 analysis:
$round1Content

Codex Round 2 analysis:
$round2Content

Synthesis instructions:
- Use the discussion-moderator role as the Round 3 synthesizer.
- Keep the output practical for a MenuApp product owner.
- Resolve disagreements when possible; when they remain unresolved, name the tradeoff explicitly.
- Do not edit application code.
- Write the final markdown document to $finalArtifactPath and stop.

Required sections:
1. Title
2. Executive summary
3. Key agreements
4. Key disagreements and tradeoffs
5. Final recommendations
6. Suggested experiments or next steps
"@
Invoke-UxClaudeRound -WorkerName 'claude-ux-round3' -PromptPath (Join-Path $promptsDir 'claude-ux-round3.prompt.md') -StdoutPath (Join-Path $logsDir 'claude-ux-round3.stdout.log') -StderrPath (Join-Path $logsDir 'claude-ux-round3.stderr.log') -Prompt $round3Prompt -OutputFile $finalArtifactPath -WorkingDirectory $repoRoot -ClaudePrefix $claudePrefix -Budget $budget -RulesPath $rulesPath -AgentName $claudeAgent -ArtifactsDir $artifactsDir -RoundLabel 'Claude round 3 synthesis'

Copy-V7FileWithRetry -SourcePath $finalArtifactPath -DestinationPath $repoOutputPath
$repoRelativeOutput = Get-UxRepoRelativePath -RepoRoot $repoRoot -Path $repoOutputPath
Invoke-V7Git -RepoRoot $repoRoot -Arguments @('add', '--', $repoRelativeOutput) -FailureMessage 'Unable to stage UX discussion output' | Out-Null
$pathStatus = Invoke-V7Git -RepoRoot $repoRoot -Arguments @('status', '--porcelain', '--', $repoRelativeOutput) -FailureMessage 'Unable to inspect UX discussion git status'
$commitCreated = $false
if (-not [string]::IsNullOrWhiteSpace([string]$pathStatus.stdout)) {
    $commitMessage = ('ux-discussion({0}): {1} final summary' -f $topicSlug, $task.task_id)
    Invoke-V7Git -RepoRoot $repoRoot -Arguments @('commit', '--only', '-m', $commitMessage, '--', $repoRelativeOutput) -FailureMessage 'Unable to commit UX discussion output' | Out-Null
    $commitCreated = $true
}
$mergeCommit = (Invoke-V7Git -RepoRoot $repoRoot -Arguments @('rev-parse', 'HEAD') -FailureMessage 'Unable to resolve UX discussion commit').stdout.Trim()
$endedAt = Get-V7Timestamp

$result = [ordered]@{
    worker = 'ux-discussion'
    status = 'completed'
    exit_code = 0
    started_at = $startedAt
    ended_at = $endedAt
    topic = $topic
    output_file = $finalArtifactPath
    repo_output_file = $repoOutputPath
    merge_commit = $mergeCommit
    commit_created = $commitCreated
    changed_files = @($repoRelativeOutput)
    round_outputs = [ordered]@{
        claude_round1 = $round1Path
        codex_round2 = $round2Path
        claude_round3 = $finalArtifactPath
    }
    prompt_files = [ordered]@{
        claude_round1 = (Join-Path $promptsDir 'claude-ux-round1.prompt.md')
        codex_round2 = (Join-Path $promptsDir 'codex-ux-round2.prompt.md')
        claude_round3 = (Join-Path $promptsDir 'claude-ux-round3.prompt.md')
    }
}
Write-V7Json -Path (Join-Path $artifactsDir 'ux-discussion.result.json') -Data $result