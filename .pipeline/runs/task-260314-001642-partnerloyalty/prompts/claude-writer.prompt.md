You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260314-001642-partnerloyalty
Workflow: code-review
Page: PartnerLoyalty
Budget: 10 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-001642-partnerloyalty\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\base\partnerloyalty.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-001642-partnerloyalty\artifacts\cc-writer-summary.md

Task instructions:
Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## BUG-PM-040 (P0): Loyalty points lost on Order.create failure

**Problem:** When Order.create fails (network error, validation error, etc.), loyalty points that were already deducted are NOT restored. The user loses their points without getting an order.

**Expected behavior:** If Order.create fails after loyalty points have been deducted, the points should be restored (rolled back) to the customer's balance.

**Files to review:** pages/PartnerLoyalty/base/partnerloyalty.jsx — and any related order processing logic that handles loyalty point deduction.

**What to do:**
1. Read the code in pages/PartnerLoyalty/base/ and understand the loyalty points deduction flow
2. Find where loyalty points are deducted in relation to Order.create
3. Add error handling: if Order.create fails AFTER points were deducted, restore the points
4. Use try/catch or transaction-like pattern to ensure atomicity
5. Update BUGS.md with the fix details
6. Update README.md with changes summary

IMPORTANT — git commit at the end:
git add pages/PartnerLoyalty/base/*.jsx pages/PartnerLoyalty/BUGS.md pages/PartnerLoyalty/README.md
git commit -m "fix: BUG-PM-040 restore loyalty points on Order.create failure S121"
git push

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-001642-partnerloyalty\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.