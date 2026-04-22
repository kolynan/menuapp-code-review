---
page: StaffOrdersMobile
task_type: simple-review
budget: 1
chain_template: simple-review
runner: cc
topic: "multi.py smoke test — SOM file integrity check"
---

# Smoke Test: StaffOrdersMobile File Integrity

**Goal:** Verify task-watcher-multi.py worktree isolation works correctly.
This is a TEST task — minimal scope, minimal cost.

## Instructions

1. Read `pages/StaffOrdersMobile/staffordersmobile.jsx`
2. Count the total number of lines
3. Find all `export default` statements and report their line numbers
4. Report the first 3 function/component names you see
5. Write a brief summary to `pages/StaffOrdersMobile/smoke-test-result.md`:
   ```
   # Smoke Test Result — SOM
   Date: [current date/time]
   Lines: [count]
   Export default at: line [N]
   Top 3 functions: [names]
   Worktree: [current working directory]
   ```
6. Commit with message: "smoke-test: SOM file integrity check (multi.py test S251)"

**IMPORTANT:** Do NOT modify any .jsx files. Read-only check + write result file only.
