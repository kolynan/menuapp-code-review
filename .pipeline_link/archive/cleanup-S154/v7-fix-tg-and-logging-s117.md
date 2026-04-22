---
pipeline: v3
type: direct-fix
page: none
budget: $15
---
Auto-approve all file edits, terminal commands, and git operations without asking.

# Task: Fix V7 Pipeline — Telegram + Step Logging + Diagnostics

## Context
V7 pipeline (PowerShell scripts in `pipeline/v7/scripts/`) has been tested. Worktrees create successfully but:
1. **Telegram notifications never arrive** — `Send-V7Telegram` is called but messages don't show in Telegram. The function silently returns `$false` on error (catch block swallows errors).
2. **No step-by-step logging to disk** — we need each stage to write a human-readable summary file so we can see progress from OneDrive without checking terminal.
3. **Status.json stuck at PREPARING** — supervisor may be crashing silently after worktree creation.

Config file: `scripts/task-watcher-config.json` — has correct `telegram.bot_token` and `telegram.chat_id`.

## Requirements

### 1. Fix Telegram in Send-V7Telegram (V7.Common.ps1)
- Add **verbose error logging** to `Send-V7Telegram`: if Invoke-RestMethod fails, write the error to a log file (`$env:TEMP\v7-telegram-debug.log` or alongside events.jsonl).
- Test the TG function standalone: create a small test script `pipeline/v7/scripts/Test-Telegram.ps1` that reads config and sends a test message. This lets us verify TG works independently.
- Common issues to check: PowerShell 5.1 TLS — may need `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12` before Invoke-RestMethod.

### 2. Add step-by-step logging to disk (Start-TaskSupervisor.ps1)
After EACH stage (CLAIMED, PREPARING, RUNNING, MERGING, DONE, FAILED), write a human-readable file:
- Path: `<queue_run_dir>/step-<NN>-<STATE>.log` (e.g. `step-01-CLAIMED.log`, `step-02-PREPARING.log`)
- Content: timestamp, state, message, key data (PIDs, paths, errors)
- This gives us a folder-based view of progress even if TG is broken.

### 3. Add diagnostic logging for silent crashes
- Wrap the ENTIRE supervisor body (after config load) in try/catch that writes to `<queue_run_dir>/supervisor-crash.log`
- In the catch: write full exception (message + stack trace + inner exception)
- Currently if something fails between worktree creation and status update, we lose the error.

### 4. Copy summary to OneDrive results
After task completion (DONE or FAILED), copy a `summary.md` to `pipeline/results/task-id/summary.md` on OneDrive with:
- Task ID, workflow, page, duration
- CC/Codex exit codes
- Git commits (base, writer, merge)
- Error message if failed
- List of changed files

### 5. TLS fix (likely root cause for TG)
In `V7.Common.ps1`, at the TOP of `Send-V7Telegram`, add:
```powershell
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
```
PowerShell 5.1 defaults to TLS 1.0 which Telegram API rejects.

## Files to modify
1. `pipeline/v7/scripts/V7.Common.ps1` — Send-V7Telegram TLS fix + error logging
2. `pipeline/v7/scripts/Start-TaskSupervisor.ps1` — step logging + crash diagnostics
3. NEW: `pipeline/v7/scripts/Test-Telegram.ps1` — standalone TG test

## Validation
1. Run `Test-Telegram.ps1` and confirm message arrives in Telegram
2. `powershell -Command "& { . pipeline/v7/scripts/V7.Common.ps1; Write-Host 'OK' }"` — no syntax errors
3. `powershell -Command "$null = [System.Management.Automation.PSParser]::Tokenize((Get-Content -Raw pipeline/v7/scripts/Start-TaskSupervisor.ps1), [ref]$null); Write-Host 'Syntax OK'"` — no syntax errors

## Git
```
git add pipeline/v7/scripts/V7.Common.ps1 pipeline/v7/scripts/Start-TaskSupervisor.ps1 pipeline/v7/scripts/Test-Telegram.ps1
git commit -m "fix: V7 pipeline — TLS for Telegram, step logging, crash diagnostics S117"
git push
```
