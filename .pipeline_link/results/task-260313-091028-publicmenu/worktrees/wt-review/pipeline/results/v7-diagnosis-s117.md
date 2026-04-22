# V7 Diagnosis S117

## Task Investigated
- Task ID: `task-260312-172608-publicmenu`
- Queue run dir: `C:\Users\ASUS\OneDrive\002 Menu\Claude AI Cowork\pipeline\queue\running\task-260312-172608-publicmenu`
- Local run dir: `C:\Dev\menuapp-code-review\.pipeline\runs\task-260312-172608-publicmenu`

## Queue Findings
- `status.json` was still `state: PREPARING` with `current_step: prepare`.
- `started_at` and `updated_at` were both `2026-03-12T17:26:54+05:00`, so the supervisor never advanced status after the initial prepare step.
- `processes` was empty.
- `git.base_commit`, `git.merge_commit`, and `git.writer_commit` were all `null`.
- `events.jsonl` only contained two events:
  - `CLAIMED` — Task claimed by V7 supervisor
  - `PREPARING` — Preparing task context
- The queue run dir only contained `events.jsonl`, `status.json`, and `task.md`.
- There was no queue-side `task.json`.

## Local Run Findings
- The local run directory already existed with `artifacts`, `logs`, `prompts`, and `worktrees`.
- `worktrees` had been created successfully, including the expected V7 worktree directories.
- `logs` existed but had no worker launcher logs, no stderr logs, and no merge logs.
- There was no local `task.json` at the top level of the run dir.

## Telegram Test
- Manual Telegram API test succeeded when TLS 1.2 was forced first:
  - `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12`
  - API response returned `ok: true`
- Conclusion: Telegram credentials and connectivity were valid at test time.
- This means the lack of Telegram updates during the stuck run was not the primary stall cause.

## PowerShell Processes
- `Get-Process powershell -ErrorAction SilentlyContinue` returned four PowerShell processes at the time of inspection:
  - `4248`
  - `4740`
  - `11900`
  - `17920`
- A follow-up command-line inspection timed out, so these could not be tied conclusively to the stuck task.

## Diagnosis
The smoke test most likely stalled because `Start-TaskSupervisor.ps1` hit an unhandled exception after worktree creation but before the task manifest was written and before the execution-stage `try/catch` was entered.

Evidence for that conclusion:
- Worktrees were present, so preparation had already progressed beyond the earliest setup steps.
- `status.json` never moved past `PREPARING`.
- `events.jsonl` stopped after `CLAIMED` and `PREPARING`.
- No `task.json` existed in either the queue run dir or the local run dir.
- No launcher logs or stderr logs existed, so no worker stage actually started.

The Telegram silence was a secondary observability problem. The original Telegram path had weak diagnostics, so a Telegram failure would not explain the stuck `PREPARING` state by itself. The actual blocker was missing crash coverage around the supervisor body, which allowed the supervisor to die without writing enough failure evidence.

A separate V7 config-loading bug also surfaced during validation: `Get-V7Config` was merging JSON overrides into ordered dictionaries incorrectly, so the supervisor could keep the default empty Telegram bot token even when `scripts/task-watcher-config.json` had valid credentials. That bug explains the missing Telegram notifications, but it does not explain the stuck `PREPARING` state by itself.

## Fix Direction Applied
- Added full-body supervisor crash logging to `supervisor-crash.log`.
- Added per-stage step logs in the queue run dir.
- Added explicit cleanup logging in `finally`.
- Added TLS 1.2 and Telegram diagnostic file output for send failures.
- Added a standalone Telegram test script for fast validation.
