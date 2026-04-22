---
title: "Smoke test run-vsc-task.sh v5.4"
session: S100
priority: P3
type: infrastructure
budget: $1
agents: cc-only
---

# Smoke Test: run-vsc-task.sh v5.4

## Context
This is a quick smoke test to verify that:
1. The KB-009 fix works (no crash on missing page dir)
2. The --full-auto flag works for Codex (KB-002 fix)
3. CC can run basic commands successfully

## Steps

### Step 1: Confirm script version
```bash
echo "Smoke test started at $(date)"
echo "Current dir: $(pwd)"
echo "Git status:"
git status --short | head -10
```

### Step 2: Check repo health
```bash
git log --oneline -5
echo "---"
ls pages/ | head -10
```

### Step 3: Write results
Write a brief summary of what you found to the progress file.
Report: "SMOKE TEST PASSED" if everything works, or describe any issues.

## Expected result
- Script runs without crashing
- CC reports results
- Task completes with .done file
