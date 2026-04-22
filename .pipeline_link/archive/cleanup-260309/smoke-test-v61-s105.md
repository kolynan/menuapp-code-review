---
task_id: smoke-test-v61-s105
page: Profile
budget: 10
session: S105
purpose: "Smoke test run-vsc-task.sh v6.1 — verify Codex --full-auto flag works. CC+Codex parallel review of Profile."
---

# Task: Smoke test v6.1 — Profile review

## Context
This is a smoke test for run-vsc-task.sh v6.1 (fixed Codex flag: --full-auto instead of --ask-for-approval never).
Previous run (v6.0): CC worked OK, Codex failed due to unsupported flag.

## File to review
`pages/Profile/base/profile.jsx`

## What to do
1. Review profile.jsx for any remaining bugs or improvements
2. Check if PR-S104-01..05 fixes (from the previous CC run) are properly implemented
3. If you find new issues, list them in `pages/Profile/BUGS.md` under "Open Bugs" section
4. Do NOT make code changes unless you find a clear P1 bug

## Important rules
- This is primarily a REVIEW task, not a fix task
- Do NOT use `git add .` or `git add -A`
- Only commit if you update BUGS.md with new findings

## Git commit (only if BUGS.md updated):
```bash
git add pages/Profile/BUGS.md
git commit -m "review: Profile smoke test v6.1 — update BUGS.md"
git push
```
