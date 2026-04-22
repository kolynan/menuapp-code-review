# Migration Guide: V3 to V7

## What Changes

V3:
- `task-watcher.py` owns queue polling, Telegram, prompt building, Claude launch, Codex delegation, result parsing, and recovery.
- Claude is responsible for starting Codex.

V7:
- `task-watcher.py` only claims tasks and launches the supervisor.
- `Start-TaskSupervisor.ps1` owns all orchestration.
- Claude and Codex are sibling workers, never parent/child LLMs.

## Steps

1. Put the real Telegram config in `scripts/task-watcher-config.json`.
2. Keep dropping task markdown files into `OneDrive\pipeline\queue\` as before.
3. Start the watcher with Python from the repo root.
4. Confirm the supervisor scripts exist under `pipeline/v7/scripts/`.
5. Stop using `scripts/run-vsc-task.sh` and any nohup-based launch path.
6. For UX tasks, keep using markdown frontmatter. The supervisor reads the same format.

## Backward Compatibility

Existing task files still work:
- markdown body remains the main instruction payload
- YAML frontmatter still uses `type`, `page`, `topic`, `budget`, `agent`

The watcher still watches `pipeline/queue/` for `.md` files.

## Operational Notes

- Keep active runs on local disk under `C:\Dev\menuapp-code-review\.pipeline\runs`.
- Keep queue and final reports in OneDrive.
- Do not point worktrees into OneDrive.
- Do not reintroduce CC-driven Codex subprocess calls inside Claude prompts or agents.
