---
type: code-fix
page: none
budget: $5
agent: ""
priority: P1
session: S111
cc_only: true
description: Fix Codex detection for discussion tasks + verify agent workflow
---

# Fix: Codex not detected in discussion tasks (task-watcher.py v3.0)

## Problem Summary
When task-watcher.py runs a UX discussion task with `agent: discussion-moderator`, the final TG report always shows `Codex: skipped` even if Codex participated. Two related issues:

## Issue 1: detect_codex_status() can't find discussion files

**File:** `C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/scripts/task-watcher.py`
**Function:** `detect_codex_status()` (around line 735)

Current code searches for `codex-round*-discussion.md` in `ctx.work_dir` (repo root: `C:/Dev/menuapp-code-review`).

But when CC runs with `--agent`, it may use a worktree under `.claude/worktrees/agent-*/`. Codex output files end up INSIDE the worktree, not in repo root. Detection fails.

**Evidence:**
```
# All codex-round files are in worktree, not root:
.claude/worktrees/agent-a6c767bb/codex-round1-discussion.md ← EXISTS
.claude/worktrees/agent-a6c767bb/codex-round2-discussion.md ← EXISTS
codex-round1-discussion.md ← DOES NOT EXIST in root
```

**Known issue:** KB-016 (S108) documented the same class of bug in run-vsc-task.sh v6.3. Fix was applied there but NOT carried over to task-watcher.py v3.0.

**Fix needed:** In `detect_codex_status()`, also search in `.claude/worktrees/agent-*/codex-round*-discussion.md` (newest worktree only), with same mtime >= start_epoch filter.

## Issue 2: Smoke test inconclusive (CC found cached results)

In S111 we ran 3 tests:
1. **task-260311-152845** — agent flag NOT passed (old watcher in memory). CC ran without discussion-moderator. Wrote result. Codex: skipped.
2. **task-260311-154738** — agent flag PASSED (verified in .debug: `Agent: discussion-moderator`). But task was trivial echo test. Codex: skipped (expected).
3. **task-260311-155605** — agent flag PASSED. But CC found existing result from test 1 (`UX_Discussion_WorkingHours_S111.md`) and said "already completed". Exited without invoking Codex. Codex: skipped.

**Result:** We confirmed `--agent` flag is passed correctly, but never got a CLEAN end-to-end test where discussion-moderator actually invokes Codex.

## What to fix

### Change 1: Expand detect_codex_status() to search worktrees
In `detect_codex_status()`, after the existing `ctx.work_dir.glob('codex-round*-discussion.md')` check, add:
```python
# Also check agent worktrees (CC with --agent may write files there)
for worktree_dir in sorted(ctx.work_dir.glob('.claude/worktrees/agent-*/'), key=lambda d: d.stat().st_mtime, reverse=True):
    for cdx_file in worktree_dir.glob('codex-round*-discussion.md'):
        if cdx_file.stat().st_size > 0 and int(cdx_file.stat().st_mtime) >= ctx.start_epoch:
            return 'done'
    break  # only check newest worktree
```

### Change 2: Update KB-017 status
In `KNOWLEDGE_BASE_VSC.md`, KB-017 status should be `✅ Решено (task-watcher.py v3.0, S109)` — the Popen refactoring fixed the nohup issue.

## Test
After fix, create a NEW discussion task (fresh topic, not previously discussed):
```yaml
---
type: ux-discussion
page: PartnerHome
topic: new-topic-here
budget: $3
agent: discussion-moderator
---
```
Expected: TG shows `Codex: done` (not `skipped`) if discussion-moderator invokes Codex.

## Constraints
- Do NOT change any other behavior
- Keep backward compatible — code-review tasks (without agent) must work as before
- ОБЯЗАТЕЛЬНО: git add scripts/task-watcher.py KNOWLEDGE_BASE_VSC.md && git commit -m "fix: detect codex output in agent worktrees (KB-016 v3.0)" && git push
