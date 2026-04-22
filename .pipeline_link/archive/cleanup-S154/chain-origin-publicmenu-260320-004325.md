---
chain_template: consensus-with-discussion
page: PublicMenu
code_file: pages/PublicMenu/base/CartView.jsx
budget_per_step: 3
---
Fix BUG-PM-031: Cart can be closed while order is being submitted.

## Problem
When the user presses "Send to waiter" (submit order), the cart drawer can still be closed (swiped down or closed via button) while the async submit request is in progress. This can cause:
- A submitted order that the user doesn't see confirmation for (they already closed the cart)
- Potential duplicate submissions if the user re-opens the cart and presses submit again
- React state updates on unmounted/hidden component

## Reproduction
1. Open the public menu at https://menu-app-mvp-49a4f5b2.base44.app/x
2. Add items to the cart
3. Enter the table code
4. Press "Send to waiter" — immediately try to swipe down or close the cart drawer
5. The cart closes mid-submission

## Expected Behavior
While an order submission is in progress (loading state), the cart drawer should be non-closeable:
- Swipe-to-close gesture should be disabled
- Close button (if any) should be disabled or hidden
- UI should show a clear loading indicator
- Drawer closes automatically only after successful submission (or stays open on error)

## Context
- File: pages/PublicMenu/base/CartView.jsx
- Related state: likely an `isSubmitting` / `isLoading` boolean flag already exists for the submit button
- The fix should use this existing flag to gate close gestures
- Check if the drawer close handler is passed as a prop (e.g., `onClose`) — it should be wrapped: `if (!isSubmitting) onClose()`
- Also check the drag handle / swipe gesture handler for the same guard
- Do NOT change the overall drawer architecture — minimal targeted fix only
