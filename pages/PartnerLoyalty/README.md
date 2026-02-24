# PartnerLoyalty

**Route:** `/partnerloyalty`
**Type:** Partner settings page (inside PartnerShell)
**Lines:** ~397

## Description
Loyalty program configuration: bonus point earn rates, review rewards, redemption rules, expiry settings, instant discount toggle. Also shows loyalty statistics. useEffect syncs form with Partner data, batch save via single useMutation.

## Entities Used
- `Partner` — stores all loyalty configuration fields
- `LoyaltyAccount` — for statistics
- `DishFeedback` — for review count statistics

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PL-001 thru PL-003: form reset on refetch, hasChanges detection, NaN validation. |

## UX Changelog
- **260224:** Fixed form that silently lost unsaved edits when browser tab regained focus. Save button now correctly enables for all field changes. Invalid numeric values are now blocked before save.
