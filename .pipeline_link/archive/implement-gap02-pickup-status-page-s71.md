---
type: implementation
budget: 12
session: S71
priority: P0
created: "2026-03-03"
---

# Implement: Pickup/Delivery Order Status Page (GAP-02)

## Problem

After a pickup or delivery guest submits their order, they have **zero visibility** into what
happens next. They see only a short toast. They cannot:
- Confirm their order was actually received
- Track whether it's being prepared
- Know when it's ready for pickup

The `public_token` field already exists on the `Order` entity (UUID, generated at creation) but
is never used. This task builds a simple status page accessible via that token.

Reference: GAP-02 in `pages/StaffOrdersMobile/DeepAnalysis_S70.md`

## What to Implement

A new **Order Status Page** accessible via: `/orderstatus?token=<public_token>`

This page is **public** (no auth), accessible by anyone with the link.

### Screen Content

```
+------------------------------------------+
|  [Restaurant Name + Logo]                |
|  ----------------------------------------|
|                                          |
|  Заказ #СВ-042                           |
|                                          |
|  [====●-----------] Готовится...         |
|  (progress-style status bar)             |
|                                          |
|    ○ Принят        ✓ (filled)            |
|    ○ Готовится     ● (current)           |
|    ○ Готов к выдаче                      |
|                                          |
|  ----------------------------------------|
|  Ваш заказ:                              |
|    Бургер x1                  2,200 ₸   |
|    Картошка фри x1            1,000 ₸   |
|  ----------------------------------------|
|  Итого:                       3,200 ₸   |
|  ----------------------------------------|
|                                          |
|  Вопросы? Позвоните нам:                 |
|  📞 +7 777 123 45 67   (tap to call)     |
|                                          |
+------------------------------------------+
```

### Status Pipeline (Pickup/Delivery)

Map existing order statuses to user-friendly labels:
- `new` → "Принят" (grey/blue badge)
- `accepted` / `in_progress` → "Готовится" (orange badge, show animation)
- `ready` → "Готов к выдаче!" (green badge, bold, ring animation)
- `served` / `completed` → "Выдан" (grey, final state)
- `cancelled` → "Отменён" (red badge)

### Polling

- Poll for order status every **10 seconds** (same as hall mode polling interval)
- Stop polling once status is `ready`, `served`, `completed`, or `cancelled`
- Show "Последнее обновление: N секунд назад" timestamp

### Data to Show

1. **Order number** — from `Order.order_number` field
2. **Status** — from `Order.status` (mapped to labels above)
3. **Items list** — from `OrderItem` entities linked to this Order (load once on page init)
4. **Total price** — calculated from OrderItems
5. **Restaurant phone** — from `Partner.contact_phone` or `Partner.contacts`
6. **Restaurant name + logo** — from `Partner` entity (resolve via `Order.partner_id`)

### Error States

- Invalid token (order not found): "Заказ не найден. Проверьте ссылку."
- Order too old (>24h): "Заказ завершён."
- Network error: "Не удалось загрузить статус. Попробуйте обновить страницу."

### Entry Point

This page is linked from the **order confirmation screen (GAP-01)**:
- The "Отслеживать заказ" button passes `order.public_token` as a URL param
- URL format: `/orderstatus?token=<public_token>`

## Files to Create/Modify

1. **NEW: `pages/OrderStatus/base/orderstatus.jsx`** — the new status page
   - Reads `?token=` param from URL
   - Fetches `Order` by `public_token` field
   - Fetches `OrderItem[]` by `order_id`
   - Fetches `Partner` by `partner_id`
   - Polls every 10s for status updates

2. **`pages/PublicMenu/base/x.jsx`** — already modified in GAP-01 task, but if not:
   - The "Отслеживать заказ" button in the confirmation screen should navigate to
     `/orderstatus?token=${order.public_token}`

## Technical Notes

- This is a **standalone page** — no session, no cart, no auth required
- Use the same `OrderStatusBadge` component pattern as in StaffOrdersMobile if available
- The `public_token` is generated at Order creation in `processPickupOrder()` / similar — verify
  it exists in the Order entity before deploying
- Keep it simple: no real-time websocket, polling is sufficient
- Mobile-first layout (guests on phones)

## Verification

After implementation:
1. Submit pickup order → get confirmation screen with "Отслеживать заказ" button
2. Click button → opens `/orderstatus?token=<uuid>`
3. Status page shows: order number, status "Принят", items, total, restaurant phone
4. In StaffOrdersMobile, accept the order → status page updates to "Готовится" within 10s
5. Mark order as Ready → status page shows "Готов к выдаче!" with green badge
6. Test invalid token → shows error message, no crash
7. Test on mobile (375px width) → layout looks correct

## Output

RELEASE file: `pages/OrderStatus/260303-01 orderstatus RELEASE.jsx`

## Instructions

- git add -A && git commit -m "S71: add pickup/delivery order status page (GAP-02)" && git push
- Check that `public_token` field exists on Order entity before building the fetch logic
- If `public_token` is not on Order entity: add it as a generated UUID in the order creation flow
  (in `pages/PublicMenu/base/x.jsx` pickup/delivery submit handler)
- Create the new page file at `pages/OrderStatus/base/orderstatus.jsx`
- Also create `pages/OrderStatus/README.md` with brief description
- git add -A && git commit -m "S71: GAP-02 status page complete" && git push
