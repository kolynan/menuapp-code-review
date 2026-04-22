You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260316-044700-profile
Workflow: parallel-write
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-044700-profile\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\Profile\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\Profile\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-044700-profile\artifacts\cc-writer-summary.md

Task instructions:
## Smoke Test: KB-044 v3 verification (S132, post commit 2773f0d)

All .pipeline/runs/ artifacts untracked from git. Worktree creation should now succeed on Windows.

### Task for both writers

Review `pages/Profile/base/profile.jsx` and fix any issues:

1. **React best practices** — hooks usage, missing deps, stale closures
2. **i18n** — raw keys or missing translations
3. **Code quality** — unused imports, dead code, console.log leftovers

Each writer: update BUGS.md with findings, fix issues in code.

### Expected outcome

- Worktree created successfully (no long-path errors)
- CC writer completes with commit
- Codex writer completes with commit
- Reconciler merges both

### Git

```bash
git add pages/Profile/base/profile.jsx pages/Profile/BUGS.md pages/Profile/README.md
git commit -m "fix: Profile smoke test KB-044 v3 verification S132"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-044700-profile\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.