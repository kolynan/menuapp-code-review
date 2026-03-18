param(
    [Parameter(Mandatory = $true)][string]$TaskJsonPath
)

$commonPath = Join-Path $PSScriptRoot 'V7.Common.ps1'
. $commonPath

function Get-ConsensusCommitInfo {
    param(
        [string]$ResultPath,
        [string]$WorktreePath,
        [string]$BaseCommit,
        [string]$Label
    )

    $result = Read-V7Json -Path $ResultPath
    $commit = Get-V7StateText -Object $result -Name 'commit_hash'
    if ([string]::IsNullOrWhiteSpace($commit) -and (Test-Path -LiteralPath $WorktreePath)) {
        $candidate = (Invoke-V7Git -RepoRoot $WorktreePath -Arguments @('rev-parse', 'HEAD') -FailureMessage ('Unable to resolve ' + $Label + ' HEAD')).stdout.Trim()
        if (-not [string]::IsNullOrWhiteSpace($candidate) -and ($candidate -ne $BaseCommit)) {
            $commit = $candidate
        }
    }
    if ([string]::IsNullOrWhiteSpace($commit)) {
        throw ($Label + ' did not produce a commit hash.')
    }

    return [ordered]@{
        result = $result
        commit = $commit
    }
}

function Get-ConsensusStatusMap {
    param(
        [string]$RepoRoot,
        [string]$BaseCommit,
        [string]$HeadRef
    )

    $map = @{}
    if ([string]::IsNullOrWhiteSpace($BaseCommit)) {
        return $map
    }

    $result = Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('diff', '--no-renames', '--name-status', "$BaseCommit..$HeadRef") -FailureMessage 'Unable to inspect changed files for consensus compare'
    foreach ($line in ($result.stdout -split "`r?`n")) {
        if ([string]::IsNullOrWhiteSpace([string]$line)) {
            continue
        }
        $parts = $line -split "`t"
        if ($parts.Count -lt 2) {
            continue
        }
        $status = $parts[0].Trim().ToUpperInvariant()
        $path = $parts[$parts.Count - 1].Trim()
        if (-not [string]::IsNullOrWhiteSpace($path)) {
            $map[$path] = $status
        }
    }
    return $map
}

function Get-ConsensusPatchExcerpt {
    param(
        [string]$RepoRoot,
        [string]$BaseCommit,
        [string]$HeadRef,
        [string]$FilePath
    )

    if ([string]::IsNullOrWhiteSpace($FilePath)) {
        return ''
    }

    $patch = (Invoke-V7Git -RepoRoot $RepoRoot -Arguments @('diff', "$BaseCommit..$HeadRef", '--', $FilePath) -FailureMessage ('Unable to diff ' + $FilePath)).stdout
    $trimmed = $patch.Trim()
    if ($trimmed.Length -le 2400) {
        return $trimmed
    }
    return $trimmed.Substring(0, 2400) + "`n...[truncated]"
}

$task = Read-V7Json -Path $TaskJsonPath
$artifactsDir = $task.paths.artifacts_dir
$writerWorktree = $task.paths.writer_worktree
$codexWorktree = $task.paths.review_worktree
$baseCommit = [string]$task.git.base_commit
$resultPath = Join-Path $artifactsDir 'consensus-compare.result.json'
$startedAt = Get-V7Timestamp

if ([string]::IsNullOrWhiteSpace($baseCommit)) {
    throw 'Consensus compare requires git.base_commit.'
}

# --- Single-writer fallback (KB-069): if one writer has no commit, use the other ---
$writerInfo = $null
$codexInfo = $null
try {
    $writerInfo = Get-ConsensusCommitInfo -ResultPath (Join-Path $artifactsDir 'claude-writer.result.json') -WorktreePath $writerWorktree -BaseCommit $baseCommit -Label 'CC writer'
} catch {
    Write-Host "[Comparator] CC writer has no commit: $_"
}
try {
    $codexInfo = Get-ConsensusCommitInfo -ResultPath (Join-Path $artifactsDir 'codex-writer.result.json') -WorktreePath $codexWorktree -BaseCommit $baseCommit -Label 'Codex writer'
} catch {
    Write-Host "[Comparator] Codex writer has no commit: $_"
}

if ($null -eq $writerInfo -and $null -eq $codexInfo) {
    throw 'Neither CC writer nor Codex writer produced a commit. Cannot compare.'
}

$writerCommit = $(if ($null -ne $writerInfo) { [string]$writerInfo.commit } else { '' })
$codexCommit = $(if ($null -ne $codexInfo) { [string]$codexInfo.commit } else { '' })

# Skip status map for writers with no commit (single-writer fallback)
$writerStatusMap = $(if ([string]::IsNullOrWhiteSpace($writerCommit)) { @{} } else { Get-ConsensusStatusMap -RepoRoot $writerWorktree -BaseCommit $baseCommit -HeadRef $writerCommit })
$codexStatusMap = $(if ([string]::IsNullOrWhiteSpace($codexCommit)) { @{} } else { Get-ConsensusStatusMap -RepoRoot $codexWorktree -BaseCommit $baseCommit -HeadRef $codexCommit })
$allFiles = @((@($writerStatusMap.Keys) + @($codexStatusMap.Keys)) | Sort-Object -Unique)
$agreements = New-Object System.Collections.Generic.List[object]
$disagreements = New-Object System.Collections.Generic.List[object]

foreach ($file in $allFiles) {
    $ccStatus = if (Test-V7HasProperty -InputObject $writerStatusMap -Name $file) { [string]$writerStatusMap[$file] } else { '' }
    $codexStatus = if (Test-V7HasProperty -InputObject $codexStatusMap -Name $file) { [string]$codexStatusMap[$file] } else { '' }
    $ccChanged = -not [string]::IsNullOrWhiteSpace($ccStatus)
    $codexChanged = -not [string]::IsNullOrWhiteSpace($codexStatus)
    $entryId = 'consensus-' + (Get-V7HashFragment -Value $file -Length 10)

    if ($ccChanged -and $codexChanged) {
        $ccPatch = Get-ConsensusPatchExcerpt -RepoRoot $writerWorktree -BaseCommit $baseCommit -HeadRef $writerCommit -FilePath $file
        $codexPatch = Get-ConsensusPatchExcerpt -RepoRoot $codexWorktree -BaseCommit $baseCommit -HeadRef $codexCommit -FilePath $file
        if ($ccPatch -eq $codexPatch) {
            $agreements.Add([ordered]@{
                id = $entryId
                file = $file
                kind = 'matching_patch'
                selected_source = 'cc'
                cc_status = $ccStatus
                codex_status = $codexStatus
                summary = 'Both writers produced the same patch.'
            })
            continue
        }

        $disagreements.Add([ordered]@{
            id = $entryId
            file = $file
            kind = 'overlapping_change'
            status = 'open'
            resolved_source = ''
            cc_status = $ccStatus
            codex_status = $codexStatus
            cc_patch_excerpt = $ccPatch
            codex_patch_excerpt = $codexPatch
            rounds = @()
        })
        continue
    }

    $agreements.Add([ordered]@{
        id = $entryId
        file = $file
        kind = $(if ($ccChanged) { 'cc_only' } else { 'codex_only' })
        selected_source = $(if ($ccChanged) { 'cc' } else { 'codex' })
        cc_status = $ccStatus
        codex_status = $codexStatus
        summary = $(if ($ccChanged) { 'Only CC writer changed this file.' } else { 'Only Codex writer changed this file.' })
    })
}

$result = [ordered]@{
    status = 'completed'
    started_at = $startedAt
    ended_at = Get-V7Timestamp
    writer_commit = $writerCommit
    codex_commit = $codexCommit
    writer_files = @($writerStatusMap.Keys | Sort-Object)
    codex_files = @($codexStatusMap.Keys | Sort-Object)
    compared_files = $allFiles
    agreements = @($agreements)
    disagreements = @($disagreements)
    consensus_reached = ($disagreements.Count -eq 0)
}
Write-V7Json -Path $resultPath -Data $result
