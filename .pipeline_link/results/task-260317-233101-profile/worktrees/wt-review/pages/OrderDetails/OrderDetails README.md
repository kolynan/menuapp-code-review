# OrderDetails

Single order detail view page. Shows order info, client info, and order items with prices.

## Description

Displays a detailed view of a single order, loaded via URL parameter `?id=`. The page shows:
- Order header with number, date, and status badge
- Order info card: type, payment status, partner ID, comment
- Client info card: name, phone, email, delivery address
- Order items table: dish name, comment, price, quantity, line total
- Grand total amount

## Entities

- **Order** — main entity, loaded via `Order.filter({ id })` (returns array, takes first)
- **OrderItem** — line items, loaded via `OrderItem.filter({ order: id })`

## Key Patterns

- `useQuery` for both Order and OrderItem fetches
- `enabled: !!orderId` to prevent fetch when no ID
- `formatPrice()` helper with `?? 0` guard for NaN protection
- `getStatusLabel()`, `getTypeLabel()`, `getPaymentStatusLabel()` for i18n-compliant labels
- Error states with `AlertCircle` icon for both queries
- `useI18n` with `t()` for all user-facing strings

## RELEASE History

| Version | Date | Description |
|---------|------|-------------|
| 260225-00 | 2025-02-25 | Initial review: 7 P1 bugs fixed (i18n, error handling, NaN prices, status labels, type labels, error order, total guard) |

## UX Changelog

- **260225-00**: Added error state UI (red text + AlertCircle icon) for failed API loads. Status badges now show human-readable translated labels instead of raw DB values. Order type and payment status fields translated. Total footer row hidden during loading/error. All text translatable via i18n.
