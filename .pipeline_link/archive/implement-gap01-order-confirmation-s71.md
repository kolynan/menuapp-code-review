---
type: implementation
budget: 12
session: S71
priority: P0
created: "2026-03-03"
---

# Implement: Order Confirmation Screen (GAP-01)

## Problem

After guest submits an order (`handleSubmitOrder()` success), the current behavior is:
- A toast notification "Заказ отправлен" appears for ~3 seconds
- Cart clears, drawer stays open
- Guest has to manually open the cart drawer to see their order
- No order number is shown, no clear confirmation that order was received

This is especially bad for **pickup/delivery** where the guest has no table context — they
submit their order and have zero confirmation it was placed.

Reference: BUG-S61-05 in Design_Implementation_Backlog_S61.md, P0-2.

## What to Implement

Replace the current post-order behavior with an **Order Confirmation Screen** that appears
immediately after successful order submission.

### Screen Content

```
+------------------------------------------+
|                                          |
|         [Animated checkmark ✓]           |
|                                          |
|         Заказ принят!                    |
|                                          |
|  ----------------------------------------|
|  Ваш заказ:                              |
|    Бургер x1                  2,200 ₸   |
|    Картошка x1                1,000 ₸   |
|  ----------------------------------------|
|  Итого:                       3,200 ₸   |
|  Ваш номер: Гость #3                     |
|  ----------------------------------------|
|                                          |
|  [  Смотреть меню  ]   (primary button)  |
|  [  Мои заказы     ]   (secondary link)  |
|                                          |
|  (For pickup/delivery only:)             |
|  [  Отслеживать заказ  ] (secondary)    |
|                                          |
+------------------------------------------+
```

### Behavior

1. **Trigger:** Show this screen immediately after `handleSubmitOrder()` resolves successfully
2. **Animated checkmark:** CSS-only animation, 1-2 seconds, respect `prefers-reduced-motion`
3. **Order summary:** Show items that were just ordered + total price
4. **Auto-dismiss:** Screen auto-returns to menu view after **10 seconds** with a fade transition
5. **"Смотреть меню":** Returns to menu view (most common next action)
6. **"Мои заказы":** Opens cart drawer with orders section
7. **"Отслеживать заказ"** (pickup/delivery only): navigates to order status page (see GAP-02 task)
   - URL: `/orderstatus?token=<order.public_token>`
   - Only show this button in pickup/delivery modes (`mode !== 'hall'`)

### Hall Mode vs Pickup/Delivery

- **Hall mode:** Show confirmation screen with "Смотреть меню" + "Мои заказы" buttons
- **Pickup/Delivery mode:** Same screen + "Отслеживать заказ" button with `public_token` link
  - Also show guest's name/phone in the summary (they entered it at checkout)

### Technical Notes

- The confirmation screen should be a new view state in the component, not a separate page
- Cart data for the summary is still in memory when order submits — save it to a local variable
  before calling `cartItems.clear()` or similar
- After the screen is shown and dismissed, cart should be cleared (same as current behavior)
- Do NOT show this screen on failure — keep current error handling

## Files to Modify

- `pages/PublicMenu/base/x.jsx` — main component (add new view state + confirmation screen)

## Verification

After implementation:
1. Submit order in hall mode → confirmation screen appears with checkmark animation
2. Confirmation screen shows correct items and total
3. Click "Смотреть меню" → returns to menu, cart cleared
4. Wait 10 seconds → auto-dismisses to menu
5. Submit order in pickup mode → confirmation screen shows "Отслеживать заказ" button
6. Pickup confirmation screen shows guest name (entered at checkout)

## Output

RELEASE file: `pages/PublicMenu/260303-01 x RELEASE.jsx`

## Instructions

- git add -A && git commit -m "S71: add order confirmation screen (GAP-01)" && git push
- Read `pages/PublicMenu/base/x.jsx` carefully before editing — it is a large file (2000+ lines)
- Focus only on: (1) adding the confirmation view state, (2) the CSS animation, (3) triggering
  it after successful submit. Do not refactor other areas.
- Preserve all existing functionality: cart persistence, session restore, polling, help modal
- git add -A && git commit -m "S71: GAP-01 order confirmation complete" && git push
