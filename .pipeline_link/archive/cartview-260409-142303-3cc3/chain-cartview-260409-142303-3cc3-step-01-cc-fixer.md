---
chain: cartview-260409-142303-3cc3
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: CartView
budget: 1.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: cartview-260409-142303-3cc3
Page: CartView

You are the CC Fixer — a standalone step for quick bug fixes.
No Codex, no comparison — just analyze and fix.

INSTRUCTIONS:
1. Read the code file for CartView in pages/CartView/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Find ALL bugs and apply fixes directly
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. After applying fixes:
   a. Update BUGS.md in pages/CartView/
   b. Update README.md if needed
6. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(CartView): N bugs fixed (quick-fix chain cartview-260409-142303-3cc3)"
   - git push

=== TASK CONTEXT ===
# Smoke Test: CartView File Integrity

**Goal:** Verify task-watcher-multi.py worktree isolation works correctly.
This is a TEST task — minimal scope, minimal cost.

## Instructions

1. Read `pages/PublicMenu/CartView.jsx`
2. Count the total number of lines
3. Find all `export default` statements and report their line numbers
4. Report the first 3 function/component names you see
5. Write a brief summary to `pages/PublicMenu/smoke-test-cartview-result.md`:
   ```
   # Smoke Test Result — CartView
   Date: [current date/time]
   Lines: [count]
   Export default at: line [N]
   Top 3 functions: [names]
   Worktree: [current working directory]
   ```
6. Commit with message: "smoke-test: CartView file integrity check (multi.py test S251)"

**IMPORTANT:** Do NOT modify any .jsx files. Read-only check + write result file only.
=== END ===
