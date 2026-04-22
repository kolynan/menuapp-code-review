---
type: fix
budget: 10
session: S71
priority: P0
created: "2026-03-03"
---

# Fix: GAP-01 OrderConfirmationScreen Not Showing

## Bug

After deploying `260303-01 x RELEASE.jsx`, the new OrderConfirmationScreen does NOT appear
after order submission. Instead, the app shows the old behavior: cart drawer opens with
"Ваши заказы (1)".

Tested in hall mode: added Стейк (56 ₸) → "Отправить официанту" → drawer opened directly
with order list. No confirmation screen, no animated checkmark.

## What Should Happen

After `handleSubmitOrder()` succeeds → `OrderConfirmationScreen` renders as a full-screen
overlay or view replacement, showing animated checkmark + order summary. Drawer should NOT
open automatically.

## Likely Causes to Investigate

1. The state variable triggering the confirmation screen (`showConfirmation` or similar)
   is not being set to `true` after successful submit
2. The component is rendered but immediately hidden/overridden by the drawer opening
3. The trigger is inside a code path that isn't reached for hall mode
4. The 10s auto-dismiss fires before the screenshot was taken (unlikely — 10s is long)

## Files to Fix

- `pages/PublicMenu/260303-01 x RELEASE.jsx` — find `OrderConfirmationScreen` component
  and trace why it doesn't render after submit

## Verification

After fix:
1. Add any item to cart on hall mode → "Оформить заказ" → "Отправить официанту"
2. **OrderConfirmationScreen appears immediately** — full screen, animated checkmark visible
3. Cart drawer does NOT open automatically
4. After 10 seconds (or clicking "Смотреть меню") → returns to menu view

## Output

Update RELEASE: `pages/PublicMenu/260303-02 x RELEASE.jsx`

## Instructions

- git add -A && git commit -m "S71: fix GAP-01 confirmation screen not showing" && git push
- Read the RELEASE file, find OrderConfirmationScreen and the submit handler
- The fix should be minimal — just make sure the state is set correctly on submit success
- git add -A && git commit -m "S71: GAP-01 fix complete" && git push
