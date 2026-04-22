---
type: code-review
pipeline: v7
page: PublicMenu
budget: 12
---

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
