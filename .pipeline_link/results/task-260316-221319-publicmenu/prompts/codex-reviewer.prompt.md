You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260316-221319-publicmenu
Workflow: code-review
Page: PublicMenu

IMPORTANT: A pre-built review bundle has been prepared for you at: C:\Dev\menuapp-code-review\.pipeline\runs\task-260316-221319-publicmenu\prompts\codex-reviewer.bundle.md
This bundle contains the target code, BUGS.md, and README.md already assembled.

Instructions:
1. Read the review bundle file FIRST. It contains all primary context you need.
2. Do NOT scan the repository for files. Do NOT explore directories.
3. You may read UP TO 5 additional files ONLY if the code imports or references them directly.
4. Do NOT read anything in versions/, archive/, screenshots/, or .pipeline/ folders.
5. Report only NEW issues that are NOT already listed in the Known Bugs section of the bundle.
6. Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
7. Do not edit any files.
8. Return JSON that matches the provided schema.

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