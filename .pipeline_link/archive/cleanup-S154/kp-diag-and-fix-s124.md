---
type: infrastructure
budget: 10
page: Pipeline
---
START
Auto-approve all file edits, terminal commands, git operations, and network access without asking. Do not ask for confirmation on any step. Execute autonomously until the task is fully complete. At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

# Task: Diagnose and fix V7 pipeline bugs (3 issues)

You are working in `C:\Dev\menuapp-code-review`. All V7 pipeline scripts are in `pipeline/v7/scripts/`.

## Context

The V7 pipeline (task-watcher.py + PowerShell supervisor + worker launchers) has 3 bugs found during S124 testing. A code-review task for PartnerTables ran: CC Writer completed successfully (11 min, commit 44bd594), but Codex Reviewer produced 0 bytes of output (stdout AND stderr both empty) and the supervisor kept heartbeating for 60+ minutes on the dead process.

Additionally, EVERY task in the Bash log shows a PowerShell property error from Start-TaskSupervisor.ps1.

## Bug 1: Codex Reviewer silent death — 0 bytes output

**Evidence:**
- `codex-reviewer.stdout.log` = 0 bytes
- `codex-reviewer.stderr.log` = 0 bytes
- `codex-reviewer.launcher.stdout.log` = 0 bytes
- `codex-reviewer.launcher.stderr.log` = 0 bytes
- CC Writer worked fine for the same task (467 bytes stdout)
- Previous task (Profile, task-260314-043016) had Codex Reviewer working: 199KB stdout

**Likely cause:** The recent commit `ce078cb` changed Codex CLI invocation from stdin pipe to positional argument. But something in the change may have broken the actual Codex launch. Or the `Invoke-V7CommandToFiles` function has an issue with the pipe operator when stdin is empty or when Codex CLI exits immediately.

**Your job:**
1. Read `Invoke-CodexReviewer.ps1` — check how it invokes Codex CLI. Is it using `-` (stdin) with `-InputText`? Or positional argument? Compare with how `Invoke-ClaudeWriter.ps1` invokes Claude (which WORKS).
2. Read `V7.Common.ps1` function `Invoke-V7CommandToFiles` — check if the `$InputText | & command` pattern can silently fail when the command exits immediately (e.g., bad args, missing schema).
3. Read `Invoke-CodexAnalyst.ps1` and `Invoke-UxDiscussion.ps1` (the other Codex launchers from ce078cb) — check for same pattern.
4. Check if the `-o` and `--output-schema` flags are correct for `codex exec`. Run `codex exec --help` and verify valid flags.
5. Check if `$args` variable name conflicts with PowerShell automatic variable `$args`. This is a KNOWN PowerShell gotcha — `$args` is a reserved automatic variable. If the script uses `$args = @(...)`, it may silently break because PowerShell treats it specially.
6. Fix ALL issues found. If `$args` is the problem, rename to `$codexArgs` in ALL scripts that use it.

## Bug 2: Supervisor property errors in EVERY task

**Evidence from Bash log:**
```
Start-TaskSupervisor.ps1 : The property 'error' cannot be found on this object. Verify that the property exists.
```
This appears for EVERY code-review task. For ux-discussion tasks, a different error:
```
Start-TaskSupervisor.ps1 : The property 'exit_code' cannot be found on this object. Verify that the property exists.
```
All tasks finish with rc=1 but some produce results anyway.

**Your job:**
1. Read `Start-TaskSupervisor.ps1` and find where `.error` and `.exit_code` properties are accessed.
2. These are likely accessed on a result object from worker scripts (codex-reviewer.result.json, claude-writer.result.json, etc.) that may not have these properties if the worker crashed before creating them.
3. Fix: use safe access pattern. In PowerShell 5.1 with StrictMode, you CANNOT access `.property` on an object that lacks it. Use `$obj.PSObject.Properties['error']` pattern or check with `.PSObject.Properties.Match('error').Count -gt 0` before accessing.
4. Apply the fix to ALL property accesses on worker result objects — not just 'error' and 'exit_code'.

## Bug 3: Supervisor does not detect dead processes

**Evidence:**
- Codex Reviewer PID 16652 died (not in Task Manager), but supervisor kept heartbeating for 60+ minutes.
- Heartbeat events show PID in `pids` array even though process is dead.

**Your job:**
1. Read `Start-TaskSupervisor.ps1` — find the heartbeat/wait loop.
2. Check how it determines if worker processes are still alive. It likely uses `Get-Process -Id $pid` or checks PID existence, but may not handle the case where the process exited cleanly (exit code captured) but appears dead.
3. Fix: add `$process.HasExited` check or use `Get-Process -Id $pid -ErrorAction SilentlyContinue` and treat null result as dead. When ALL workers are dead, proceed to next step (merge or fail) instead of continuing heartbeat.
4. Add a maximum wait timeout as safety net (e.g., 90 minutes from `pipeline.code_review_timeout_minutes` config).

## Diagnostic step (do this FIRST before fixing)

Before making any changes, run a full diagnostic:
1. `codex exec --help` — capture valid flags
2. Check if `$args` variable name is used in any `pipeline/v7/scripts/*.ps1` files: `Select-String -Path "pipeline\v7\scripts\*.ps1" -Pattern '\$args\s*=' -SimpleMatch:$false`
3. Check all property accesses on worker result objects in Start-TaskSupervisor.ps1: `Select-String -Path "pipeline\v7\scripts\Start-TaskSupervisor.ps1" -Pattern '\.(error|exit_code|status|worker)' -SimpleMatch:$false`
4. Check how the heartbeat loop works — does it check process aliveness?
5. Write diagnostic results to `pipeline/v7/DIAGNOSTIC_S124.md`

## Validation (MANDATORY before commit)

After ALL fixes:
1. PowerShell parser check on every modified file:
   ```powershell
   Get-ChildItem pipeline\v7\scripts\*.ps1 | ForEach-Object { $errors = $null; [System.Management.Automation.Language.Parser]::ParseFile($_.FullName, [ref]$null, [ref]$errors); if ($errors) { Write-Error "$($_.Name): $($errors[0].Message)" } else { Write-Host "$($_.Name): OK" } }
   ```
2. Grep verification — confirm zero remaining instances of:
   - `\$args\s*=` in pipeline/v7/scripts/ (if renamed)
   - Raw `.error` or `.exit_code` access without null-check on worker results
3. Read back `Invoke-CodexReviewer.ps1` lines 40-50 and `Start-TaskSupervisor.ps1` heartbeat section to confirm correctness.
4. Write a summary of ALL changes to `pipeline/v7/CHANGELOG_S124.md`

## Git

After validation passes:
```
git add pipeline/v7/scripts/Invoke-CodexReviewer.ps1 pipeline/v7/scripts/Invoke-CodexAnalyst.ps1 pipeline/v7/scripts/Invoke-UxDiscussion.ps1 pipeline/v7/scripts/Invoke-CodexWriter.ps1 pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/DIAGNOSTIC_S124.md pipeline/v7/CHANGELOG_S124.md
git commit -m "fix: 3 V7 bugs — Codex silent death, supervisor property errors, dead process detection S124"
git push
```
Only add files you actually modified. Do NOT use `git add .` or `git add -A`.

END
