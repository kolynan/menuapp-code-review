# V8 Consensus Pipeline Review

Date: 2026-03-17
Commit: `4442792`

## Scope

- Routed `pipeline: v8` tasks through `scripts/task-watcher.py` into the existing V7 supervisor path.
- Added a new `consensus` workflow to `pipeline/v7/scripts/Start-TaskSupervisor.ps1`.
- Added `pipeline/v7/scripts/Merge-ConsensusCompare.ps1` for deterministic file-level disagreement detection.
- Added `pipeline/v7/scripts/Invoke-ConsensusRound.ps1` for up to three CC/Codex discussion rounds with machine-readable outcomes.

## Supervisor Changes

- Workflow normalization now recognizes `consensus`.
- Consensus tasks prepare the same writer/review/merge worktrees used by `parallel-write`.
- Telegram workflow layout, artifact-driven status rendering, heartbeat refresh, cleanup, and final-state handling now support `consensus`.
- Final consensus outcomes can end in `DONE`, `DISPUTE`, or `FAILED`.

## Validation

- PowerShell parser check passed for:
  - `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
  - `pipeline/v7/scripts/Merge-ConsensusCompare.ps1`
  - `pipeline/v7/scripts/Invoke-ConsensusRound.ps1`
- `python -m py_compile scripts/task-watcher.py` passed.
- `Select-String -Path 'pipeline/v7/scripts/*.ps1' -Pattern 'consensus'` found supervisor and new-script entries.
- `Select-String -Path 'scripts/task-watcher.py' -Pattern 'v8'` found the new V8 routing logic.
- `Test-Path` confirmed both new scripts exist.
- `Select-String -Path 'pipeline/v7/scripts/Start-TaskSupervisor.ps1' -Pattern 'parallel-write' | Measure-Object` returned `25`.

## Notes

- No smoke tests were run, per task instruction.
- `scripts/task-watcher.py` had unrelated pre-existing path changes in the working tree; those were intentionally left unstaged and out of commit `4442792`.
