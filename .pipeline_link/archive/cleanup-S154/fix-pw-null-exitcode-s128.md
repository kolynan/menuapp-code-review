START

Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## Task: Fix parallel-write supervisor — null exit_code kills reconciler (KB-039)

### Problem

In `Start-TaskSupervisor.ps1`, the parallel-write workflow launches two writers (Claude CC + Codex). Both writers complete successfully, produce commits, and the supervisor logs `parallel_ok: true`. But the reconciler never starts because there is a secondary check around line 2054 that throws:

```
throw 'Parallel-write requires both writers to complete successfully'
```

**Root cause:** On PS 5.1, process exit codes are sometimes `$null` instead of `0` when the process completes normally. The supervisor sets `parallel_ok: true` (step 9 in events), but then a later guard clause checks exit codes directly and `$null -eq 0` is `$false` in PS 5.1.

**Evidence from failed task `task-260315-050726-partnersettings`:**
- events.jsonl step 9: `{"parallel_ok":true, "claude_writer_exit_code":null, "codex_writer_exit_code":null}`
- events.jsonl step 10: FAILED with throw at line 2054
- Both workers show OK in Telegram with commits (CC: `0e7af26`, Codex: `da21047`)
- Reconciler: SKIPPED (not started)

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
- **NEW: Process exit codes can be $null on PS 5.1** even when process completed normally. Always treat $null exit_code the same as exit code 0 when other success indicators (commits, output files) are present.

### What to fix

1. **Find the throw on line ~2054** in `Start-TaskSupervisor.ps1` that checks writer exit codes for the parallel-write workflow.

2. **Fix the check** so that `$null` exit code is treated as success when:
   - The worker's status/state indicates OK, OR
   - The worker produced a commit (check worktree for new commits vs base_commit)

   The simplest safe fix: treat `$null` as `0` in the exit code comparison. Example:
   ```powershell
   # Instead of:  if ($exitCode -ne 0) { ... }
   # Use:         if ($exitCode -and $exitCode -ne 0) { ... }
   # Or:          if (($exitCode -as [int]) -ne 0) { ... }  # $null -as [int] = 0
   ```

3. **Search the ENTIRE file for similar patterns** — any place that checks exit_code with `-ne 0` or `-eq 0` must handle `$null`. This is not limited to line 2054 — audit the whole file.

4. **Also check these files for the same pattern:**
   - `Merge-ParallelWrite.ps1`
   - `Invoke-CodexWriter.ps1`
   - `V7.Common.ps1`

5. **Update `Test-V7Pipeline.ps1`** — add test cases:
   - Test: `$null -as [int]` equals 0 (verifying the fix approach works)
   - Test: the exit code normalization function (if you create one)

### Validation (MUST pass before commit)

1. PowerShell parser check:
   ```powershell
   Get-ChildItem pipeline/v7/scripts/*.ps1 | ForEach-Object { $errs = $null; $null = [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errs); if ($errs) { Write-Host "FAIL: $($_.Name) - $($errs[0].Message)" } else { Write-Host "OK: $($_.Name)" } }
   ```

2. Runtime test (MANDATORY):
   ```powershell
   powershell.exe -ExecutionPolicy Bypass -File pipeline/v7/scripts/Test-V7Pipeline.ps1
   ```
   ALL tests must pass. If any fail — fix and re-run.

3. Grep audit:
   ```powershell
   Select-String -Path pipeline/v7/scripts/*.ps1 -Pattern '\.Contains\(|\.ContainsKey\(' | Where-Object { $_.Line -notmatch 'function Test-V7HasProperty' -and $_.Line -notmatch '\$InputObject' -and $_.Line -notmatch '#' } | ForEach-Object { Write-Host "FAIL: $_" }
   ```

### Git

```
git add pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/Merge-ParallelWrite.ps1 pipeline/v7/scripts/Invoke-CodexWriter.ps1 pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/scripts/Test-V7Pipeline.ps1
git commit -m "fix: handle null exit_code in parallel-write supervisor (KB-039) S128"
git push
```

END
