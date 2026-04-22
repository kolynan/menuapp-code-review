You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260316-133809-profile
Workflow: code-review
Page: Profile
Budget: 5 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-133809-profile\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\Profile\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\Profile\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-133809-profile\artifacts\cc-writer-summary.md

Task instructions:
# Smoke Test: V7 merge pipeline (KB-045 fix verification, S133)

This is a MINIMAL smoke test. Do NOT spend time on deep analysis.

## Task

Review `pages/Profile/base/profile.jsx` and fix ONE trivial issue (e.g., add a missing comment, fix a minor style issue, or improve a variable name). The goal is to verify that the full V7 pipeline works end-to-end:
1. Worktree creation (KB-044)
2. Claude writer produces a commit
3. Codex reviewer runs
4. Merge step completes (KB-045)

Keep changes minimal — this is a PIPELINE test, not a code review.

## Git

```
git add pages/Profile/base/profile.jsx
git commit -m "smoke-test: verify V7 merge pipeline S133"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-133809-profile\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.