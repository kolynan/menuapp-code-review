# AdminPartners

Admin page for managing restaurant partners. Accessible only to ADMIN_EMAILS users.

## Features
- List all partners with stats (dishes, orders, readiness, plan, status)
- Toggle partner active/inactive status
- Toggle partner plan (free/paid)
- Rate-limit detection with recovery UI
- Responsive: mobile (card grid) + desktop (table)

## UX Changelog

### S35 — Codex-round fixes (2026-02-26)
- **Error state for failed partner load:** When the partners API returns a non-429 error, users now see a red error card with retry button instead of the misleading "Нет ресторанов" empty state.
- **Secondary query error display:** If dishes/orders/tables/staff queries fail, stats show "—" instead of fake zeros. Readiness badge shows "—" when underlying data is unreliable.
- **Scoped query invalidation:** Cancel/invalidate operations now target only this page's 5 query keys instead of wiping the entire query cache.

## File Structure
- `adminpartners.jsx` — Main page component (single file)
- `BUGS.md` — Bug tracker (3 fixed, 9 active)
- `README.md` — This file
