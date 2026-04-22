You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260314-191354-profile
Workflow: parallel-write
Page: Profile
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-191354-profile\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\Profile\base\profile.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\Profile\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\Profile\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-191354-profile\artifacts\cc-writer-summary.md

Task instructions:
## Smoke Test: parallel-write workflow S126

**Purpose:** Verify that the new parallel-write workflow works end-to-end — both CC and Codex write code independently, then CC reconciler merges.

**What to do:**

Add a JSDoc comment block above EVERY exported function in `pages/Profile/base/profile.jsx` that does not already have one. Each comment should describe:
- What the function does
- Its parameters (if any)
- Its return value (if any)

Also update `pages/Profile/README.md` — add a line: "S126: Smoke test parallel-write — added JSDoc comments."

IMPORTANT — git commit at the end:
```
git add pages/Profile/base/profile.jsx pages/Profile/README.md
git commit -m "docs: parallel-write smoke test — JSDoc comments for Profile S126"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-191354-profile\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.