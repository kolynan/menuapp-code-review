You are the Claude writer for MenuApp pipeline V7.

Task ID: task-260316-221319-publicmenu
Workflow: code-review
Page: PublicMenu
Budget: 12 USD
Repository: C:\Dev\menuapp-code-review
Working tree: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-221319-publicmenu\worktrees\wt-writer
Target code file: C:\Dev\menuapp-code-review\pages\PublicMenu\base\CartView.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PublicMenu\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PublicMenu\README.md
Summary file to write before you finish: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-221319-publicmenu\artifacts\cc-writer-summary.md

Task instructions:
# Fix Android back button behavior on PublicMenu (PM-S81-15)

## Bug: PM-S81-15 (P1)

### What happens
On Android devices, pressing the hardware/gesture "Back" button on the public menu page (/x) navigates away from the menu entirely (exits the app or goes to browser history). This is a bad UX for restaurant customers.

### Expected behavior
The Back button should:
1. If a drawer/modal is open (cart, order details, etc.) -> close the drawer/modal
2. If navigated into a sub-view (dish details, category) -> go back to the main menu
3. If already on the main menu root -> allow normal back navigation (exit)

### Technical approach
This is a browser history / navigation issue. Common solutions:
- Use `window.history.pushState()` when opening drawers/modals, then listen to `popstate` event to close them on back
- Or use React Router's navigation hooks to intercept back navigation
- Check if the app already uses any history manipulation and follow the same pattern

### Important
- Test that drawer close on back does NOT break normal navigation
- The fix should work on both Android Chrome and in-app WebView (B44 uses WebView)
- Do not break iOS behavior (iOS does not have a hardware back button, but has swipe-back gesture)

## Git

```
git add pages/PublicMenu/base/x.jsx
git commit -m "fix(PublicMenu): handle Android back button for drawers (PM-S81-15)"
git push
```

Rules:
- Work only inside the assigned working tree.
- Do not launch Codex or any other external AI tool. The supervisor owns orchestration.
- Update the target page, BUGS.md, and README.md when appropriate for this task.
- Keep changes scoped to the task.
- Prefer one clean git commit in this worktree. If you do not commit, the supervisor may auto-commit your final diff.
- Before finishing, write a concise markdown summary to C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-221319-publicmenu\artifacts\cc-writer-summary.md with: files changed, main fixes, tests or checks run, and any follow-up risk.