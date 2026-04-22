---
chain: publicmenu-260409-214156-d4f4
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: PublicMenu
budget: 1.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: publicmenu-260409-214156-d4f4
Page: PublicMenu

You are the CC Fixer — a standalone step for quick bug fixes.
No Codex, no comparison — just analyze and fix.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Find ALL bugs and apply fixes directly
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/
   b. Update README.md if needed
6. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(PublicMenu): N bugs fixed (quick-fix chain publicmenu-260409-214156-d4f4)"
   - git push

=== TASK CONTEXT ===
# Smoke Test — multi.py #278 (CartView / PublicMenu)

This is a minimal smoke test for task-watcher-multi.py parallel execution.

## Task

Write a smoke-test result file to verify parallel execution works correctly.

**Steps:**
1. Run: `date` to get current timestamp
2. Create the file `pages/PublicMenu/smoke-test-cartview-result.md` with this content:
   ```
   # Smoke Test Result — CartView (PublicMenu)
   Task: multi-test-cv-s251
   Status: PASS
   Timestamp: <current date/time>
   Note: Written by task-watcher-multi.py parallel execution test
   ```
3. Git commit and push:
   ```
   git add pages/PublicMenu/smoke-test-cartview-result.md
   git commit -m "test(CV): multi.py smoke test #278"
   git push
   ```

## SCOPE LOCK
Only create/edit `pages/PublicMenu/smoke-test-cartview-result.md`.
Do NOT touch any .jsx files.
=== END ===
