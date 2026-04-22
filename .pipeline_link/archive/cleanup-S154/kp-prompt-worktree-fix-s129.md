START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Fix stale worktree branches blocking parallel-write + add cleanup test (KB-040)

### Problem

When a parallel-write task fails (or any V7 task), the git branches `task/{TaskId}-writer`, `task/{TaskId}-review`, `task/{TaskId}-merge` are left behind. On the next run, `New-V7Worktree` in `V7.Common.ps1` calls `git worktree add $Path -b $BranchName` — the `-b` flag fails if the branch already exists. Result: instant FAIL with "Unable to create worktree".

This is a repeat-failure pattern — every failed run makes the NEXT run fail too.

### Known PowerShell 5.1 Pitfalls (MUST READ)

- NEVER use .Contains() or .ContainsKey() on ANY object. Use Test-V7HasProperty from V7.Common.ps1.
- NEVER use [System.Text.Encoding]::UTF8 — it adds BOM. Use [System.Text.UTF8Encoding]::new($false).
- NEVER use raw `& git` or `git -C` — use Invoke-V7Git from V7.Common.ps1.
- NEVER use $args as variable name — reserved in PowerShell.
- NEVER use --max-cost-dollars for Claude CLI — correct flag is --max-budget-usd.
- ConvertFrom-Json returns PSCustomObject (NOT Hashtable) in PS 5.1.
- $PSBoundParameters is PSBoundParametersDictionary (NOT Hashtable).
- Initialize ALL $script: variables before first use.
- Use Write-V7FileWithRetry for file writes in queue/ and results/ dirs (OneDrive lock protection).

### Fix (3 parts)

#### Part 1: Fix `New-V7Worktree` in `pipeline/v7/scripts/V7.Common.ps1`

Find the `New-V7Worktree` function. Currently it does:
```powershell
& git -C $RepoRoot worktree add $Path -b $BranchName $BaseCommit
```

Change to: before creating the worktree, delete the branch if it already exists. Use `-B` (force-create) instead of `-b`:
```powershell
if ($BranchName) {
    # Force-create branch even if it exists from a previous failed run (KB-040)
    & git -C $RepoRoot worktree add $Path -B $BranchName $BaseCommit | Out-Null
}
```

IMPORTANT: Use Invoke-V7Git if that wrapper is available in V7.Common.ps1. If `New-V7Worktree` is called BEFORE Invoke-V7Git is defined, then raw `& git` is acceptable here — but add a comment explaining why.

#### Part 2: Add cleanup in `Remove-V7Worktree`

Find `Remove-V7Worktree` in V7.Common.ps1. After removing the worktree, also delete the associated branch. Add:
```powershell
# Also clean up the branch to prevent KB-040 stale branch issue
$branchOutput = & git -C $RepoRoot branch --list $BranchName 2>$null
if ($branchOutput) {
    & git -C $RepoRoot branch -D $BranchName 2>$null | Out-Null
}
```

Note: `Remove-V7Worktree` may not currently receive a `$BranchName` parameter. If not, you'll need to:
- Either add an optional `$BranchName` parameter
- Or extract it from the worktree info: `git -C $RepoRoot worktree list --porcelain` and parse the branch

Choose the simpler approach.

#### Part 3: Add test to `Test-V7Pipeline.ps1`

Add a test that verifies `New-V7Worktree` handles pre-existing branches:
1. Create a temp branch name like `task/test-kb040-cleanup`
2. Create the branch: `git branch task/test-kb040-cleanup HEAD`
3. Call `New-V7Worktree` with that branch name — it should NOT fail (because we now use `-B`)
4. Clean up: remove worktree and branch
5. Assert: no error thrown

### Validation (MUST pass before commit)

1. PowerShell parser check:
   Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }

2. Runtime test (MANDATORY):
   powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1
   ALL tests must pass. If any fail — fix and re-run.

3. Runtime test parallel-write:
   powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7ParallelWrite.ps1
   ALL tests must pass.

4. Grep audit:
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.Contains\(|\.ContainsKey\(' | Where-Object { $_.Line -notmatch 'function Test-V7HasProperty' -and $_.Line -notmatch '\$InputObject' -and $_.Line -notmatch '#' } | ForEach-Object { Write-Host "FAIL: $_" }

### Git

```
git add pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/scripts/Test-V7Pipeline.ps1
git commit -m "fix: handle stale worktree branches with -B flag (KB-040) S129"
git push
```

END
