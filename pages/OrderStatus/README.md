# OrderStatus Page

Public order status tracking page for pickup/delivery guests.

## Route
`/orderstatus?token=<public_token>`

## How It Works
1. Guest submits pickup/delivery order on PublicMenu
2. Confirmation screen (GAP-01) shows "Track order" button
3. Button opens this page with the order's `public_token`
4. Page polls every 10s for status updates until terminal state

## Status Pipeline
| Order Status | Display | Color |
|---|---|---|
| `new` | Received | Blue |
| `accepted` / `in_progress` | Preparing | Orange |
| `ready` | Ready for pickup! | Green |
| `served` / `completed` | Served | Grey |
| `cancelled` | Cancelled | Red |

## Entities Used
- `Order` — filtered by `public_token`
- `OrderItem` — filtered by `order` (loaded once)
- `Partner` — restaurant name, logo, currency
- `PartnerContactLink` — phone number for "Call us"

## Error States
- No token → "Check your link"
- Order not found → "Order not found"
- Order >24h old → "Order completed"
- Network error → Standard query retry

## RELEASE History
| Date | Version | Description |
|---|---|---|
| 2026-03-03 | 260303-01 | Initial implementation (GAP-02, S71) |
| 2026-03-11 | 260311-00 | Code review S110: closed status, network error separation, touch target, itemsTotal falsy, aria-label, lastUpdated reset |

## UX Changelog
| Date | Change |
|---|---|
| 2026-03-03 | New: page for tracking pickup/delivery order status |
| 2026-03-11 | Fix: добавлен статус closed, разделены ошибки сети и "не найден", кнопка 44px, расчет бесплатных позиций, aria-label, сброс таймера при смене заказа |
