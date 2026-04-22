# Pipeline V7

Pipeline V7 replaces the nested CC -> Codex control flow with a deterministic PowerShell supervisor.

## Layout

- `pipeline/v7/scripts/Start-TaskSupervisor.ps1`
  - main orchestrator
- `pipeline/v7/scripts/V7.Common.ps1`
  - shared helpers for config, task parsing, status, Telegram, worktrees, and process control
- `pipeline/v7/scripts/Invoke-ClaudeWriter.ps1`
  - code-review writer and reconcile worker
- `pipeline/v7/scripts/Invoke-CodexReviewer.ps1`
  - independent code reviewer
- `pipeline/v7/scripts/Invoke-ClaudeAnalyst.ps1`
  - UX discussion round 1
- `pipeline/v7/scripts/Invoke-CodexAnalyst.ps1`
  - UX discussion round 2
- `pipeline/v7/scripts/Invoke-ClaudeSynthesizer.ps1`
  - UX discussion round 3
- `pipeline/v7/scripts/Merge-TaskResult.ps1`
  - cherry-pick writer result into merge worktree and optionally reconcile reviewer findings
- `pipeline/v7/scripts/Send-Telegram.ps1`
  - Telegram helper entry point
- `pipeline/v7/scripts/Cleanup-TaskRun.ps1`
  - worktree cleanup helper
- `pipeline/v7/schemas/`
  - review schema and task/status examples
- `scripts/task-watcher.py`
  - thin queue dispatcher only
- `scripts/cc-system-rules.txt`
  - shared Claude rules compatible with V7

## Process Flow

```text
queue/*.md
  -> task-watcher.py claims task into queue/running/<task-id>/task.md
  -> Start-TaskSupervisor.ps1
      -> parse frontmatter and task body
      -> create local run dir under C:\Dev\menuapp-code-review\.pipeline\runs\<task-id>
      -> write task.json, status.json, events.jsonl
      -> code-review: create writer/review/merge worktrees
      -> launch workers
          -> code-review: Claude writer + Codex reviewer in parallel
          -> ux-discussion: Claude round1 -> Codex round2 -> Claude round3
      -> merge/report
      -> copy artifacts to OneDrive results/<task-id>
      -> move queue/running/<task-id> to queue/done or queue/failed
      -> send Telegram state updates
```

## Task State Machine

- `QUEUED`
- `CLAIMED`
- `PREPARING`
- `RUNNING`
- `MERGING`
- `DONE`
- `FAILED`

Each task run writes:
- `status.json`
- `events.jsonl`
- `task.json`

## Code-Review Workflow

Roles:
- Claude = writer
- Codex = reviewer
- Supervisor = merge gate

Flow:
1. Supervisor creates `wt-writer`, `wt-review`, `wt-merge` from the same base commit.
2. Claude works only in `wt-writer`.
3. Codex reviews only from `wt-review` and outputs structured JSON findings.
4. Supervisor cherry-picks the Claude writer commit into `wt-merge`.
5. If reviewer findings exist and `auto_reconcile` is enabled, Claude gets one short reconcile pass in `wt-merge`.
6. Final artifacts and commit hash are published.

## UX Discussion Workflow

Roles:
- Claude round 1 = analyst
- Codex round 2 = counter-analysis
- Claude round 3 = synthesizer

This flow is sequential. It uses the same task/status system but does not create git worktrees.

## Images In Codex

Codex CLI can accept local images through `--image <path>` on `codex exec`.
V7 discovers image files in the running task directory and passes them to the Codex discussion worker.
Best practice:
- put screenshots in the same task run directory as `task.md`, or
- reference absolute paths in the task body/frontmatter
- still mention each image in the prompt so the model knows what it is looking at
