# CC Writer Summary: BUG-PM-040

**Task:** task-260314-001642-partnerloyalty
**Date:** 2026-03-14
**Commit:** `db191b7` on branch `task/task-260314-001642-partnerloyalty-writer`

## Problem

Loyalty points were deducted (LoyaltyAccount balance reduced + LoyaltyTransaction created) BEFORE `Order.create` was called. If `Order.create` failed (network error, validation error, etc.), the deducted points were never restored. The user lost their points without receiving an order.

This affected two independent code paths in `pages/PublicMenu/base/x.jsx`:
1. **Hall order flow** (`processHallOrder`, ~line 2443)
2. **Pickup/delivery flow** (`handleSubmitOrder`, ~line 2817)

## Fix

Added a rollback pattern to both flows:
- Track whether points were deducted via `pointsDeducted` flag
- Wrap `Order.create` in its own try/catch
- On `Order.create` failure, if points were deducted:
  - Restore `LoyaltyAccount.balance` and `total_spent` to original values
  - Create a `type: 'rollback'` LoyaltyTransaction to maintain audit trail
  - If rollback itself fails, log error but still propagate the original error

## Files Changed

| File | Change |
|------|--------|
| `pages/PublicMenu/base/x.jsx` | Added rollback logic in both order flows |
| `pages/PartnerLoyalty/BUGS.md` | Added BUG-PM-040 to Fixed section |
| `pages/PartnerLoyalty/README.md` | Added 260314-00 release entry |

## Tests / Checks

- Verified both code paths have matching rollback logic
- Confirmed rollback restores original balance (not a computed value)
- Confirmed rollback errors are caught separately to avoid masking original error

## Follow-up Risks

- **Rollback is not atomic:** If the rollback itself fails (e.g., second network failure), points remain deducted. A server-side transaction would be the ideal solution, but Base44 does not support multi-entity transactions.
- **Audit trail:** The `type: 'rollback'` transaction type may need to be added to any admin UI or reporting that filters by transaction type.
- **No matching fix in partnerloyalty.jsx:** The PartnerLoyalty page is a settings-only page and does not process orders or deduct points. The actual bug was entirely in PublicMenu/base/x.jsx.
