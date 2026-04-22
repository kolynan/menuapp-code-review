---
pipeline: v7
type: bugfix
page: Pipeline
budget: $12
---

START
Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

# CRITICAL FIX: Worktree stale branch cleanup (KB-040 final)

## Context
Every V7 pipeline task FAILS with: `Unable to create worktree: Preparing worktree (new branch 'task/...-writer')`.
Previous fix attempt (commit `e263b9a`) changed `-b` to `-B` in test code but the REAL production code in `V7.Common.ps1` still has `-b` on line 283. This has been blocking the pipeline for ~20 sessions.

## Requirements — THREE changes in `pipeline/v7/scripts/V7.Common.ps1`:

### 1. Add `Clear-V7StaleWorktrees` function (NEW)
Add this function BEFORE `New-V7Worktree`:

```powershell
function Clear-V7StaleWorktrees {
    param([Parameter(Mandatory = $true)][string]$RepoRoot)

    # Prune orphaned worktree references
    & git -C $RepoRoot worktree prune 2>$null

    # Delete ALL task/* branches (leftovers from previous failed runs)
    $staleBranches = & git -C $RepoRoot branch --list "task/*" 2>$null
    if ($staleBranches) {
        foreach ($raw in $staleBranches) {
            $branch = $raw.Trim().TrimStart('* ')
            if ($branch) {
                & git -C $RepoRoot branch -D $branch 2>$null
            }
        }
    }
}
```

### 2. Fix `New-V7Worktree` — change `-b` to `-B`
Find the line (currently ~283):
```powershell
& git -C $RepoRoot worktree add $Path -b $BranchName $BaseCommit | Out-Null
```
Change to:
```powershell
& git -C $RepoRoot worktree add $Path --force -B $BranchName $BaseCommit | Out-Null
```

### 3. Fix `Remove-V7Worktree` — also delete the branch
Current code only removes the worktree directory. It must ALSO delete the branch.
Replace the entire function with:

```powershell
function Remove-V7Worktree {
    param(
        [Parameter(Mandatory = $true)][string]$RepoRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    # Extract branch name before removing worktree
    $branchName = $null
    try {
        $wtList = & git -C $RepoRoot worktree list --porcelain 2>$null
        $found = $false
        foreach ($line in $wtList) {
            if ($line -eq "worktree $Path") { $found = $true }
            if ($found -and $line -match '^branch refs/heads/(.+)$') {
                $branchName = $Matches[1]
                break
            }
            if ($found -and $line -eq '') { break }
        }
    } catch {}

    # Remove worktree
    if (Test-Path -LiteralPath $Path) {
        try {
            & git -C $RepoRoot worktree remove --force $Path 2>$null
        } catch {}
    }

    # Delete the branch
    if ($branchName) {
        & git -C $RepoRoot branch -D $branchName 2>$null
    }
}
```

### 4. Call `Clear-V7StaleWorktrees` in `Start-TaskSupervisor.ps1`
Find the PREPARING section (around line 273-275, before `New-V7Worktree` calls). Add this line BEFORE the first `New-V7Worktree`:

```powershell
Clear-V7StaleWorktrees -RepoRoot $repoRootPath
```

It should go right after the line `Send-V7Telegram ... 'PREPARING' ...` and before the `if ($workflow -eq 'code-review')` block.

### 5. Update test
In `Test-V7Pipeline.ps1`, add a test for `Clear-V7StaleWorktrees`:

```powershell
# Test Clear-V7StaleWorktrees
git branch "task/test-stale-branch-1" 2>$null
git branch "task/test-stale-branch-2" 2>$null
Clear-V7StaleWorktrees -RepoRoot $repoRoot
$remaining = git branch --list "task/test-stale*" 2>$null
if ($remaining) {
    Write-Host "FAIL: Clear-V7StaleWorktrees did not remove stale branches"
    $failCount++
} else {
    Write-Host "PASS: Clear-V7StaleWorktrees cleans up stale branches"
    $passCount++
}
```

## Validation — run ALL of these:

```powershell
# 1. Parser sweep
Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }

# 2. Unit tests
powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1

# 3. Parallel-write mock tests
powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7ParallelWrite.ps1

# 4. Verify the actual fix in code
Select-String -Path pipeline/v7/scripts/V7.Common.ps1 -Pattern 'worktree add.*-b ' | ForEach-Object { Write-Host "FAIL: Still using -b (not -B): $_" }
Select-String -Path pipeline/v7/scripts/V7.Common.ps1 -Pattern 'worktree add.*-B ' | ForEach-Object { Write-Host "OK: Using -B: $_" }

# 5. Verify Clear-V7StaleWorktrees exists
Select-String -Path pipeline/v7/scripts/V7.Common.ps1 -Pattern 'function Clear-V7StaleWorktrees' | ForEach-Object { Write-Host "OK: Clear function exists" }
Select-String -Path pipeline/v7/scripts/Start-TaskSupervisor.ps1 -Pattern 'Clear-V7StaleWorktrees' | ForEach-Object { Write-Host "OK: Clear called in supervisor" }
```

ALL must pass. If any FAIL — fix and re-run.

## Git
```bash
git add pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/Test-V7Pipeline.ps1
git commit -m "fix: nuclear worktree cleanup - Clear-V7StaleWorktrees + -B flag + branch deletion (KB-040 final) S130"
git push
```

## Permissions Requested
(fill in at the end)

END
