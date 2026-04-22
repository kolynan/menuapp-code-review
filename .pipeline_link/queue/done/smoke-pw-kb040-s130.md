---
pipeline: v7
type: smoke-test
page: Profile
budget: $10
---

START
Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

# Smoke Test: Parallel-Write KB-040 Regression

## Goal
Verify that KB-040 fix (commit `e263b9a`) works: stale worktree branches no longer block parallel-write.

## Pre-test setup
1. First, **create a stale branch** to simulate a previous failed run:
   ```powershell
   git branch "task/smoke-stale-branch-writer" 2>$null
   ```
   This should NOT block the parallel-write that follows.

2. Run `git worktree list` and `git branch -l` — log the output as "BEFORE" state.

## Test
3. Run the V7 pipeline in parallel-write mode on the Profile page:
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Invoke-V7Supervisor.ps1 -TaskId "smoke-kb040-s130" -PageName "Profile" -Mode "parallel-write"
   ```

4. If parallel-write starts (both writers begin working) — **KB-040 fix is confirmed working**.

5. After completion (success or failure), run:
   ```powershell
   git worktree list
   git branch -l | Select-String "task/"
   ```
   Log as "AFTER" state. Stale branches should be cleaned up.

## Expected result
- Parallel-write should NOT fail due to stale branch
- Both writers should start and produce commits
- After cleanup, no `task/*` branches should remain

## On completion
- `git add` and `git commit -m "test: smoke parallel-write KB-040 regression S130"` any test artifacts
- `git push`

## Permissions Requested
(fill in at the end)

END
