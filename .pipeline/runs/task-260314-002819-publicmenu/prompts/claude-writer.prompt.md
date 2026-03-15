You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260314-002819-publicmenu
Workflow: code-review
Page: PublicMenu
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-002819-publicmenu\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\PublicMenu\base\CartView.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PublicMenu\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PublicMenu\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-002819-publicmenu\artifacts\cc-writer-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## AC-09 (P2): No toast when adding dish to cart

**Problem:** When a user taps "Add to cart" on a dish in the public menu, the dish is added to the cart correctly, BUT there is no visual confirmation (no toast notification, no animation, no feedback). The user cannot tell if the action was successful.

**Expected behavior:** After adding a dish to the cart, show a brief toast/snackbar notification like "Added to cart" or the equivalent i18n key. The toast should auto-dismiss after 2-3 seconds.

**Files to review:** pages/PublicMenu/base/ — specifically CartView.jsx and any component handling the "add to cart" action.

**What to do:**
1. Read the code in pages/PublicMenu/base/ and find the "add to cart" handler
2. Add a toast notification after successful cart addition (use existing toast infrastructure if available, or Base44 toast pattern)
3. Ensure the toast uses i18n key (not hardcoded text)
4. Update BUGS.md with the fix details
5. Update README.md with changes summary

IMPORTANT — git commit at the end:
git add pages/PublicMenu/base/*.jsx pages/PublicMenu/BUGS.md pages/PublicMenu/README.md
git commit -m "fix: AC-09 add toast on cart item addition S121"
git push

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-002819-publicmenu\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.