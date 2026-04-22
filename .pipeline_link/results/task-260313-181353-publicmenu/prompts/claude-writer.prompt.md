You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260313-181353-publicmenu
Workflow: code-review
Page: PublicMenu
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-181353-publicmenu\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\PublicMenu\base\CartView.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PublicMenu\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PublicMenu\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-181353-publicmenu\artifacts\cc-writer-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

Review the PublicMenu page code — all files in pages/PublicMenu/base/.

Focus on:
1. React best practices — hooks usage, missing deps in useEffect, stale closures
2. UX bugs — broken navigation, missing error states, incorrect translations
3. Performance — unnecessary re-renders, missing memoization
4. Base44 platform patterns — correct entity usage, proper SDK calls

Update BUGS.md with any new findings. Update README.md with changes summary.

IMPORTANT — git commit at the end:
git add pages/PublicMenu/base/*.jsx pages/PublicMenu/BUGS.md pages/PublicMenu/README.md
git commit -m "fix: PublicMenu code review V7 smoke test 6 S120"
git push

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260313-181353-publicmenu\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.