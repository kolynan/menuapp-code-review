# V7 Test Plan

## Smoke Test 1: Code Review Task

Create a task file in `pipeline/queue/`:

```yaml
---
type: code-review
page: PublicMenu
budget: $10
---
Review the page, fix bugs, update BUGS.md and README.md, and produce a release-ready result.
```

Expect:
- watcher moves task to `queue/running/<task-id>/task.md`
- supervisor creates local run dir under `.pipeline/runs/<task-id>`
- Claude writer and Codex reviewer logs appear in `logs/`
- `codex-review-findings.json` is created
- merge report exists
- queue item ends in `queue/done/<task-id>` or `queue/failed/<task-id>`
- results copied to `pipeline/results/<task-id>`

## Smoke Test 2: UX Discussion Task

Create a task file in `pipeline/queue/`:

```yaml
---
type: ux-discussion
page: StaffOrdersMobile
topic: waiter-workflow-improvements
budget: $5
agent: discussion-moderator
---
Analyze waiter workflow improvements for the mobile staff experience.
```

Add screenshots next to the task file if needed.

Expect:
- Claude round 1 artifact exists
- Codex round 2 artifact exists
- final `UX_Discussion_*` file exists
- task lands in done/failed with full event trail

## Negative Tests

- Missing page path for code-review task -> task should fail cleanly with status and Telegram error.
- Invalid Telegram token -> task should still run; only notifications fail.
- Codex CLI unavailable -> reviewer stage fails and task is marked failed with logs.
- Claude exits without commit -> writer launcher auto-commits remaining diff in the writer worktree.

## Manual Verification

- Open `status.json` during a run and confirm state transitions.
- Confirm `events.jsonl` appends one line per major transition.
- Confirm worktrees are created under the local run dir, not OneDrive.
- Confirm screenshots are attached to Codex with `--image` in UX runs.
