---
pipeline: v7
type: parallel-write
page: Profile
budget: $10
---

## Smoke Test: KB-044 verification (S132, post commit 029970a)

KB-044: `Invoke-V7Git` treated informational stderr from `git worktree add` as failure.
Fix (commit `029970a`): exit-code-only success check — stderr is informational.

This smoke test verifies the fix works end-to-end in a real parallel-write run.

### What to verify

1. **Worktree creation succeeds** — `git worktree add --force -B task/...` should NOT throw despite stderr message "Preparing worktree (new branch ...)"
2. **Both writers complete** — CC and Codex both get worktrees and run
3. **Reconciler runs** — merges both writers' output

### Task for both writers

Review `pages/Profile/base/profile.jsx` and fix any issues:

1. **React best practices** — hooks usage, missing deps, stale closures
2. **i18n** — raw keys or missing translations
3. **Code quality** — unused imports, dead code, console.log leftovers

Each writer: update BUGS.md with findings, fix issues in code.

### Expected outcome

- Worktree created WITHOUT false stderr failure
- CC writer completes with commit
- Codex writer completes with commit
- Reconciler merges both

### Git

```bash
git add pages/Profile/base/profile.jsx pages/Profile/BUGS.md pages/Profile/README.md
git commit -m "fix: Profile smoke test KB-044 verification S132"
git push
```
