You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260314-081433-partnertables
Workflow: code-review
Page: PartnerTables
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-081433-partnertables\worktrees\wt-writer
Target code file: 
BUGS.md: C:\Dev\menuapp-code-review\pages\PartnerTables\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PartnerTables\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-081433-partnertables\artifacts\cc-writer-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, git operations, and network access without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## Quick cleanup: PartnerTables unused imports and minor code quality

**Purpose:** Quick code-review task to test new TG message format (S123).

**What to do:**
1. Read pages/PartnerTables/base/partnertables.jsx
2. Find and remove any unused imports (React hooks, components, utilities that are imported but never used)
3. If there are no unused imports, add JSDoc comments to the 2-3 most important functions
4. Update BUGS.md if any issues are found
5. Update README.md with a one-line note: "S123: Code quality cleanup — unused imports / JSDoc"

IMPORTANT — git commit at the end:
git add pages/PartnerTables/base/partnertables.jsx pages/PartnerTables/BUGS.md pages/PartnerTables/README.md
git commit -m "chore: PartnerTables code quality cleanup S123"
git push

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-081433-partnertables\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.