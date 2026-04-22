# CC Writer Summary — PublicMenu Code Review

**Task:** task-260313-091028-publicmenu
**Date:** 2026-03-13
**Session:** S119
**Reviewer:** Claude Code (correctness + style sub-reviewers)
**Files reviewed:** 6 (CartView.jsx, CheckoutView.jsx, MenuView.jsx, ModeTabs.jsx, useTableSession.jsx, x.jsx)

---

## Review Results

### Existing bugs confirmed (S116)
All 14 active bugs from S116 (BUG-PM-026 through BUG-PM-039) are confirmed still present in the base code.

### New bugs found: 8

| Bug ID | Priority | File | Issue |
|--------|----------|------|-------|
| BUG-PM-040 | P0 | x.jsx:2443,2817 | Loyalty points debited before Order.create — no rollback on failure. Points permanently lost on transient errors. |
| BUG-PM-041 | P0 | useTableSession.jsx:670-685 | Polling scheduleNext() fires after cleanup, leaking orphaned timers and causing spurious state updates. |
| BUG-PM-042 | P1 | x.jsx:283-288 | isBillOnCooldown() has no try/catch — crashes component in private/incognito mode. |
| BUG-PM-043 | P2 | x.jsx:973,1206 | formatOrderTime and OrderStatusScreen.formatPrice hardcode ru-RU locale, ignoring app language. |
| BUG-PM-044 | P2 | CartView.jsx:925 | loyalty_redeem_rate uses `|| 1` instead of `?? 1` — rate of 0 shows inflated value. |
| BUG-PM-045 | P2 | x.jsx:2589,2917 | console.log("Order created") left in production submission paths. |
| BUG-PM-046 | P2 | x.jsx:1871 | Redirect banner setTimeout not cleaned up on unmount — stale setState warning. |
| BUG-PM-047 | P3 | CartView/MenuView | Multiple icon-only buttons missing aria-label (bell, name editor, info, list-mode stepper). |

### Additional observations (not bugs, quality notes)

- `hasAnyRating` useMemo in CartView depends on raw props instead of `safe*` versions (minor dep inconsistency)
- `getOrderStatus` in useTableSession is a plain function, not memoized with useCallback
- `getDishDescription` called twice per dish in MenuView (once for check, once for render)
- Dynamic Tailwind classes in MenuView/ModeTabs use ternary-in-template instead of mapping objects
- `getLinkId` missing from useTableSession restore effect dependency array (stable ref, low risk)

### Files with no new issues
- **CheckoutView.jsx** — clean, uses t() consistently, no console statements
- **ModeTabs.jsx** — clean (minor Tailwind pattern noted above)

---

## Priority Summary

| Priority | Existing (S116) | New (S119) | Total Active |
|----------|-----------------|------------|--------------|
| P0 | 0 | 2 | 2 |
| P1 | 6 | 1 | 7 |
| P2 | 8 | 4 | 12 |
| P3 | 0 | 1 | 1 |
| **Total** | **14** | **8** | **22** |

## Recommended fix order
1. **BUG-PM-040** (P0) — Loyalty points loss is a data integrity issue affecting real money
2. **BUG-PM-041** (P0) — Polling leak causes cascading issues after table changes
3. **BUG-PM-026** (P1, S116) — tableCodeLength=5 blocks all hall orders for unconfigured partners
4. **BUG-PM-028** (P1, S116) — Locked star ratings after save failure
5. **BUG-PM-042** (P1) — Crash in restricted environments

## Artifacts updated
- `pages/PublicMenu/BUGS.md` — version 22.0, 8 new bugs added
- `pages/PublicMenu/README.md` — version 7.0, S119 changelog added
