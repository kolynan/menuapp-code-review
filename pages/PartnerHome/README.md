# PartnerHome

**Route:** `/partnerhome`
**Type:** Partner dashboard (inside PartnerShell)
**Lines:** ~294

## Description
Dashboard page showing today's KPIs: open tables, order count, revenue by channel (hall/pickup/delivery). Simple read-only page with 3 useQuery calls and useMemo for stats computation.

## Entities Used
- `Partner` — restaurant config
- `TableSession` — active table sessions
- `Order` — orders (filtered client-side for today)

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PH-001 (usePartnerAccess pattern) + BUG-PH-002 (session double-count). |

## UX Changelog
- **260224:** Fixed "open tables" counter that was inflated by counting expired sessions as open.
