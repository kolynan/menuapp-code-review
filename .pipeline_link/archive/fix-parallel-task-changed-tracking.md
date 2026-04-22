---
type: script fix
file: scripts/run-vsc-task.sh
budget: 2.00
session: 60
backlog: п.19
---

# Task: Fix "Changed" field cross-contamination in parallel tasks

## Problem

When two tasks run in parallel, the "Changed:" field in TG messages and result files
shows files from BOTH tasks mixed together.

Root cause (confirmed by log analysis):
- `claude -p` outputs only a final single-line JSON (no intermediate tool call traces)
- So `"filePath"` grep in the log always returns empty
- Falls back to `git log --name-only --since="${START_EPOCH}"`
- When Task A and Task B both run from 14:05, git log catches commits from BOTH

## Goal

Make "Changed:" in TG messages and result files show ONLY files changed by THIS task.

## Instructions

git add . && git commit -m "pre-task: fix parallel task changed tracking" && git push

### Step 1: Understand current git tracking logic

Read `scripts/run-vsc-task.sh`, find the section `# Git: find changed files`.
It currently:
1. Tries `grep -oP '"filePath":' from log` → always empty (log is single-line final JSON)
2. Fallback: `git log --name-only --since="${START_EPOCH}"` → cross-contaminated
3. Fallback 2: `git diff --name-only HEAD` → worst

### Step 2: Implement fix — use task-specific git commit marker

The cleanest fix that doesn't require worktrees:

Before CC runs, record the current git HEAD commit hash:
```bash
PRE_TASK_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo '')
```

After CC finishes, get only commits AFTER that hash:
```bash
if [[ -n "$PRE_TASK_COMMIT" ]]; then
    GIT_DIFF_NAMES=$(git log --name-only --format='' "${PRE_TASK_COMMIT}..HEAD" 2>/dev/null | sort -u | grep -v '^$')
fi
```

This way:
- Parallel Task A: captures only commits A made after its own PRE_TASK_COMMIT
- Parallel Task B: captures only commits B made after its own PRE_TASK_COMMIT
- No cross-contamination because each task has its own baseline commit

### Step 3: Place PRE_TASK_COMMIT capture

Find where `START_EPOCH` is captured (just before CC launch).
Add `PRE_TASK_COMMIT=$(git -C "${WORK_DIR}" rev-parse HEAD 2>/dev/null || echo '')` right there.

### Step 4: Replace fallback chain

Replace the entire `# Git: find changed files` section with:
```bash
# Git: find changed files since task started (uses pre-task commit hash, not timestamp)
GIT_DIFF_NAMES=''
if [[ -n "${PRE_TASK_COMMIT}" ]]; then
    GIT_DIFF_NAMES=$(git -C "${WORK_DIR}" log --name-only --format='' "${PRE_TASK_COMMIT}..HEAD" 2>/dev/null | sort -u | grep -v '^$' || echo '')
fi
# Fallback: git diff (if no commits were made)
if [[ -z "$GIT_DIFF_NAMES" ]]; then
    GIT_DIFF_NAMES=$(git -C "${WORK_DIR}" diff --name-only HEAD 2>/dev/null || echo '')
fi
```

### Step 5: Test logic manually

Review the script logic. Verify:
- `PRE_TASK_COMMIT` is captured before CC runs
- `${PRE_TASK_COMMIT}..HEAD` syntax works with git log
- Fallback still handles case where CC made no commits

### Step 6: Commit

git add scripts/run-vsc-task.sh
git commit -m "fix: use pre-task commit hash for Changed field (fixes parallel task contamination)"
git push

## Notes
- Do NOT change anything else in the script
- This is a targeted single-fix change
- Target file: `scripts/run-vsc-task.sh` in the OneDrive root scripts/ folder
  (NOT in menuapp-code-review — CC needs to navigate up from work_dir)
- Hint: use `cd "${WORK_DIR}/../scripts"` or just use absolute path with git -C
