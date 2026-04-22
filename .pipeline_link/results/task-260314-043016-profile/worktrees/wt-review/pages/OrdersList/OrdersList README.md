# OrdersList

Order history list page with search, filters, and tabs.

## Description

Displays a paginated list of orders with:
- "All orders" / "My orders" tab switcher
- Search by order number or client name
- Status filter dropdown (7 statuses)
- Order type filter dropdown (hall, pickup, delivery)
- Clickable table rows that navigate to OrderDetails

## Entities

- **Order** — loaded via `Order.list('-created_date', 100)` (sorted by newest, limit 100)

## Key Patterns

- `useQuery` with `data: orders = []` default (safe empty array without masking loading state)
- `base44.auth.me()` for currentUser (used in "My orders" tab filter)
- `createPageUrl` for navigation to OrderDetails
- `getStatusLabel()` and `getTypeLabel()` for i18n-compliant labels
- `getStatusColor()` for status badge coloring
- `String()` coercion on `order_number` for safe `.toLowerCase()` in search
- Error state with `AlertCircle` icon

## RELEASE History

| Version | Date | Description |
|---------|------|-------------|
| 260225-00 | 2025-02-25 | Initial review: 8 P1 bugs fixed (initialData masking, error handling, i18n, status/type labels, guest fallback, NaN guard, search crash) |

## UX Changelog

- **260225-00**: Loading spinner now shows correctly on first load (was previously hidden by `initialData: []`). Added error state with AlertCircle icon for API failures. All text translatable via i18n — no more mixed Russian/English. Status badges and order type cells show translated labels instead of raw DB values. "Guest" fallback is now translatable.
