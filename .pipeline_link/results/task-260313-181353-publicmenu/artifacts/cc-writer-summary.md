# CC Writer Summary: PublicMenu Code Review S120

**Task:** task-260313-181353-publicmenu
**Date:** 2026-03-13
**Workflow:** code-review
**Page:** PublicMenu (all base files)

## Files Changed

| File | Changes |
|---|---|
| `pages/PublicMenu/base/CartView.jsx` | BUG-PM-026: tableCodeLength default 5->4 |
| `pages/PublicMenu/base/useTableSession.jsx` | P0: cancellation guard in scheduleNext polling timer |
| `pages/PublicMenu/base/x.jsx` | P1: try/catch for isBillOnCooldown/setBillCooldownStorage; P2: redirect banner timeout cleanup; P2: removed console.log from order submission |
| `pages/PublicMenu/BUGS.md` | Added 5 new bugs (BUG-PM-040..044), moved BUG-PM-026 to Fixed |
| `pages/PublicMenu/README.md` | Added S120 changelog entry |

## Fixes Applied (5)

1. **BUG-PM-026 (P1):** tableCodeLength default reverted from 5 to 4 (CartView.jsx:101). Regression from S81.
2. **P0 polling timer leak:** `scheduleNext` in useTableSession.jsx now checks `cancelled` flag before scheduling next poll. Prevents state updates on unmounted component.
3. **P1 localStorage crash:** `isBillOnCooldown` and `setBillCooldownStorage` now wrapped in try/catch. Prevents crash in Safari private browsing mode.
4. **P2 timeout leak:** Redirect banner setTimeout now returns cleanup from useEffect.
5. **P2 console.log:** Removed two `console.log("Order created"...)` and one `console.error(err)` from production order submission paths.

## New Bugs Documented (5)

| Bug ID | Priority | Summary |
|---|---|---|
| BUG-PM-040 | P0 | Loyalty points deducted before order created - no rollback on failure |
| BUG-PM-041 | P1 | OrderItem.bulkCreate failure leaves orphan order + skipped order number |
| BUG-PM-042 | P1 | handleRateDish race condition on saving guard (closure snapshot) |
| BUG-PM-043 | P2 | getOrderStatus not memoized - invalidates consumer memos every render |
| BUG-PM-044 | P2 | Parallel restore + polling causes double DB reads on mount |

## Review Coverage

- **Correctness reviewer:** 2 P0, 7 P1, 4 P2 issues found across 6 files
- **Style reviewer:** launched (results pending at commit time)
- **Files analyzed:** CartView.jsx, CheckoutView.jsx, MenuView.jsx, ModeTabs.jsx, useTableSession.jsx, x.jsx

## Follow-up Risks

1. **BUG-PM-040 (P0)** is the highest risk: loyalty points can be permanently lost if order creation fails. Should be fixed before next RELEASE.
2. **BUG-PM-041 (P1)** can cause orphan orders in DB and order number gaps visible to kitchen staff.
3. 13 active bugs from S116 (BUG-PM-027..039) remain unfixed.
