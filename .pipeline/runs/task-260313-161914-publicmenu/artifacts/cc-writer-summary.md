# CC Writer Summary: PublicMenu Code Review S120

## Task
Full code review of all PublicMenu base files (CartView.jsx, x.jsx, MenuView.jsx, ModeTabs.jsx, CheckoutView.jsx, useTableSession.jsx).

## Files Changed
- `pages/PublicMenu/base/CartView.jsx` — 8 bug fixes
- `pages/PublicMenu/base/x.jsx` — 2 fixes (drawer guard + console.log removal)
- `pages/PublicMenu/BUGS.md` — Updated: 8 bugs moved from Active to Fixed, 1 new bug added
- `pages/PublicMenu/README.md` — Updated with S120 changelog

## Main Fixes (8 bugs fixed)

| Bug ID | Priority | Fix |
|--------|----------|-----|
| BUG-PM-026 | P1 | tableCodeLength default 5 -> 4 (regression) |
| BUG-PM-027 | P1 | Loyalty section now visible via `showLoyaltySection` (not just after rating) |
| BUG-PM-030 | P1 | Review reward hint gated on `reviewableItems.length > 0` |
| BUG-PM-031 | P1 | Close button disabled + drawer blocked during `isSubmitting` |
| BUG-PM-032 | P2 | `getSafeStatus()` now handles `accepted` and `served` statuses |
| BUG-PM-034-R | P2 | Guest code hidden from header when `hallGuestCodeEnabled` is off |
| BUG-PM-036 | P2 | Removed hardcoded `ru-RU` locale and `₸`; uses `formatPrice()` |
| BUG-PM-040 | P2 | Removed `console.log("Order created")` from production code |

## Files Reviewed (no changes needed)
- `MenuView.jsx` — Clean. Good use of mapping objects for Tailwind, lazy loading on images, proper i18n via `t()`.
- `ModeTabs.jsx` — Clean. Simple presentational component, no hooks issues.
- `CheckoutView.jsx` — Clean. Proper form validation UX, error states, sticky submit button.
- `useTableSession.jsx` — Complex but well-structured. Proper cleanup patterns, optimistic merge strategy, polling with dynamic intervals.

## Remaining Active Bugs (7)
- BUG-PM-028 (P1): Failed rating saves lock dishes permanently
- BUG-PM-029 (P1): Table-code auto-verify cannot retry same code
- BUG-PM-033 (P2): Scroll position not reset after verification
- BUG-PM-035 (P2): Duplicate verified-table header, small touch targets
- BUG-PM-037 (P2): Email saved without validation
- BUG-PM-038 (P2): Submit error says "order saved" when it may not be
- BUG-PM-039 (P2): 8-digit table codes overflow narrow phones

## Follow-up Risks
- BUG-PM-028 requires architectural decision: roll back draft on failure vs. only lock from server-confirmed reviews
- BUG-PM-029 needs `lastSentVerifyCodeRef` clearing logic on failure/unlock
- x.jsx is 3462 lines — consider further extraction into hooks/components
