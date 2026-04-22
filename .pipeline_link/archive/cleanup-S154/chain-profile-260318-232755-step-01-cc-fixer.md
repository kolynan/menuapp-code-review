---
chain: profile-260318-232755
chain_step: 1
chain_total: 1
chain_step_name: cc-fixer
page: Profile
budget: 2.00
type: chain-step
---
=== CHAIN STEP: CC Fixer (1/1) ===
Chain: profile-260318-232755
Page: Profile

You are the CC Fixer — a standalone step for quick bug fixes.
No Codex, no comparison — just analyze and fix.

INSTRUCTIONS:
1. Read the code file for Profile in pages/Profile/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Find ALL bugs and apply fixes directly
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. After applying fixes:
   a. Update BUGS.md in pages/Profile/
   b. Update README.md if needed
6. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(Profile): N bugs fixed (quick-fix chain profile-260318-232755)"
   - git push

=== TASK CONTEXT ===
Quick smoke test of chain constructor v2. Review Profile for any obvious bugs — focus on imports and error handling. This is a test run, keep it minimal.
=== END ===
