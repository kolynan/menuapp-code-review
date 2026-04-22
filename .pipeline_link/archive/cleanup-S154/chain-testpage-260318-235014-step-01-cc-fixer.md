---
chain: testpage-260318-235014
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: TestPage
budget: 2.00
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: testpage-260318-235014
Page: TestPage

You are the CC Fixer — a standalone step for quick bug fixes.
No Codex, no comparison — just analyze and fix.

INSTRUCTIONS:
1. Read the code file for TestPage in pages/TestPage/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Find ALL bugs and apply fixes directly
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. After applying fixes:
   a. Update BUGS.md in pages/TestPage/
   b. Update README.md if needed
6. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(TestPage): N bugs fixed (quick-fix chain testpage-260318-235014)"
   - git push

=== TASK CONTEXT ===
Review TestPage for bugs. The file is small (~40 lines). Find and fix all bugs. Keep it quick.
=== END ===
