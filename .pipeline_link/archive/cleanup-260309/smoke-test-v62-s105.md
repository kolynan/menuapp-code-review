---
task_id: smoke-test-v62-s105
page: Profile
budget: 10
session: S105
purpose: "Smoke test run-vsc-task.sh v6.2 — removed --model flag, added -C repo path. Verify Codex works with default config.toml model."
---

# Task: Smoke test v6.2 — Profile review

## Context
v6.0: Codex failed (--ask-for-approval not supported)
v6.1: Codex failed (codex-mini-latest not available for ChatGPT auth)
v6.2: removed --model flag, added -C path, keep --full-auto

## File to review
`pages/Profile/base/profile.jsx`

## What to do
1. Review profile.jsx for any remaining bugs
2. If new issues found, list them in `pages/Profile/BUGS.md`
3. Do NOT make code changes unless clear P1 bug found

## Important rules
- Do NOT use `git add .` or `git add -A`
- Only commit if you update BUGS.md

## Git commit (only if BUGS.md updated):
```bash
git add pages/Profile/BUGS.md
git commit -m "review: Profile smoke test v6.2"
git push
```
