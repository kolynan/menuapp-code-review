You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260316-204219-publicmenu
Workflow: code-review
Page: PublicMenu
Budget: 12 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-204219-publicmenu\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\PublicMenu\base\CartView.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PublicMenu\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PublicMenu\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-204219-publicmenu\artifacts\cc-writer-summary.md

Task instructions:
# Fix 2 UI bugs on PublicMenu (AC-09, PM-S87-03)

## Bugs to fix

### AC-09 (P2): No toast when adding dish to cart
- **What happens:** User taps "Add" on a menu item, the dish is added to the cart, but there is NO visual confirmation (no toast, no animation, nothing).
- **Expected:** A brief toast notification like "Added to cart" should appear confirming the action.
- **Where to look:** The add-to-cart handler. Add a toast notification (use the same toast pattern already used elsewhere in the app, e.g., in order submission).

### PM-S87-03 (P2): Submit button looks active when disabled
- **What happens:** The "Send to waiter" button appears GREEN (active-looking) even when it should be disabled (no table code entered).
- **Expected:** When disabled, the button should look visually disabled (gray/muted color, reduced opacity).
- **Where to look:** The CTA button in the cart/order drawer. The `disabled` prop is set but the styling does not change appearance. Add proper disabled styling (e.g., `opacity-50` or gray background when disabled).

## Rules
- Fix ONLY these 2 bugs. Do not refactor or change anything else.
- Check existing toast implementation in the codebase for consistency.
- Both bugs are on the same page: `pages/PublicMenu/base/x.jsx`

## Git

```
git add pages/PublicMenu/base/x.jsx
git commit -m "fix(PublicMenu): add cart toast + disabled button styling (AC-09, PM-S87-03)"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-204219-publicmenu\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.