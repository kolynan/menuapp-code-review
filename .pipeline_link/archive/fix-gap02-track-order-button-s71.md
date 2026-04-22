---
type: fix
budget: 12
session: S71
priority: P1
created: "2026-03-03"
---

# Fix: GAP-02 confirmation.track_order Button Navigates to Menu Instead of OrderStatusScreen

## Problem

After deploying `260303-03 x RELEASE.jsx` (which embedded `OrderStatusScreen` as a STATE
inside x.jsx), the `confirmation.track_order` button does NOT show `OrderStatusScreen`.

**Observed behavior:**
1. User submits pickup order → `OrderConfirmationScreen` appears ✅
2. User clicks `confirmation.track_order` button
3. A product detail popup for "Стейк" briefly appears (wrong!)
4. After closing popup → app returns to main menu (wrong!)
5. `OrderStatusScreen` never shown ❌

**Expected behavior:**
1. User clicks `confirmation.track_order` → app switches to `OrderStatusScreen` state
2. `OrderStatusScreen` shows order status, items, total, order number, restaurant phone
3. User can see live polling of order status (every 10s)

## Root Cause Hypothesis

The `confirmation.track_order` button's `onClick` handler likely:
- Does NOT set the view state to `{ view: 'orderstatus', token: xxx }` as intended
- Instead calls some navigation function that re-opens the menu (or navigates to a menu item)
- The product popup "Стейк" appearing suggests the click is somehow being interpreted as a
  product click or the handler is incorrectly wired

## Files to Read

1. `menuapp-code-review/pages/PublicMenu/260303-03 x RELEASE.jsx` — find the `OrderConfirmationScreen`
   component and specifically the `confirmation.track_order` button handler
2. Find how the `OrderStatusScreen` state is set up in x.jsx — what state variable controls it?
3. Verify the token is passed correctly from `OrderConfirmationScreen` to `OrderStatusScreen`

## What to Fix

1. Find the `confirmation.track_order` button's `onClick` in the `OrderConfirmationScreen` component
2. Ensure it correctly sets the view state to show `OrderStatusScreen` (not navigate to menu)
3. Ensure the order token is passed: `setView('orderstatus')` + `setOrderToken(token)` or similar
4. Verify `OrderStatusScreen` is rendered when the correct state is set
5. The `OrderStatusScreen` should show: status badge, items+prices, total, order number, phone, "Back to menu" link

## Context

- `OrderConfirmationScreen` was added in `260303-01 x RELEASE.jsx` (GAP-01)
- `OrderStatusScreen` was embedded as STATE in `260303-03 x RELEASE.jsx` (this is the fix to verify)
- Test URL: `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=pickup`
- Test flow: Add item → Checkout → Fill Name + Phone → Submit → Click track_order button

## Output

RELEASE: new `pages/PublicMenu/260303-04 x RELEASE.jsx` (next index after 260303-03).

## Instructions

- git add -A && git commit -m "S71: start fix-gap02-track-order-button" && git push
- Read 260303-03 x RELEASE.jsx BEFORE making any changes
- Fix only the track_order button handler and OrderStatusScreen state logic
- Do not touch StaffOrdersMobile or unrelated files
- git add -A && git commit -m "S71: fix track_order button — show OrderStatusScreen" && git push
