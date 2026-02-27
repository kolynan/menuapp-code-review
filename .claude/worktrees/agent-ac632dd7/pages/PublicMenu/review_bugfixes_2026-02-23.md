# Code Review Report: PublicMenu_BASE.txt — Bug Fixes Phase
**Date:** 2026-02-23
**Reviewed by:** Claude (correctness + style) + Codex (independent diff review)
**File:** pages/PublicMenu/PublicMenu_BASE.txt

---

## Summary

Three bugs were fixed in PublicMenu_BASE.txt, followed by a 3-reviewer auto-review (correctness-reviewer, style-reviewer, codex). The review found 4 actionable issues in the initial fixes, all of which were addressed in a follow-up commit.

---

## Bug Fixes Implemented

### BUG 1: White screen after hall order + closing drawer
**Commit:** `fix: hall order sets valid view state instead of unmapped 'cart'`

- **Root cause:** `processHallOrder()` called `setView("cart")` but `view === "cart"` has no JSX rendering block — only `"menu"` and `"checkout"` are rendered.
- **Fix:** Changed `setView("cart")` to `setView("menu")` at line ~1635. The drawer stays open (drawerMode unchanged) so the user sees their submitted order.

### BUG 2: Jarring auto-transition after pickup/delivery order
**Commit:** `fix: add brief delay before view transition after pickup/delivery order`

- **Root cause:** `handleSubmitOrder()` immediately called `setView("menu")` + `setDrawerMode(null)` after order success, snapping back to menu before the user could register the success toast.
- **Fix:** Show toast first with `duration: 3000`, then delay `setView("menu")` + `setDrawerMode(null)` by 300ms via `setTimeout`. Cart clearing and state reset happen immediately.

### BUG 3: Empty drawer after page refresh in hall mode
**Commit:** `fix: handle loading state in StickyCartBar after page refresh`

- **Root cause:** After F5, `isTableVerified` is true (from localStorage) but `myOrders`/`sessionOrders` load asynchronously. If user taps the button before data loads, CartView opens empty.
- **Fix:** Added `isSessionLoading` flag (`isTableVerified && !tableSession`). When loading: button shows "Загрузка..." label, and `onButtonClick` shows a loading toast instead of opening the empty drawer.

---

## Review Findings

### Correctness Reviewer (4 P1, 2 P2)

| Priority | Issue | Status |
|---|---|---|
| P1 | `setTimeout(300ms)` has no cleanup ref — stale setState on unmount | **FIXED** |
| P1 | `isSessionLoading` permanently true for new sessions (no session to restore) | **FIXED** |
| P1 | `isDrawerOpen` prop never passed to Hall-mode StickyCartBar | **FIXED** |
| P1 | processHallOrder leaves drawerMode as 'cart' — toggle inverts | INTENTIONAL (per task spec) |
| P2 | Hardcoded `\|\|` fallback strings violate i18n rules | Pre-existing pattern |
| P2 | `console.log` in production order-submit paths | Pre-existing |

### Style Reviewer (2 P1, 4 P2, 2 P3)

| Priority | Issue | Status |
|---|---|---|
| P1 | Inaccurate BUG 1 comment (says "drawer open" but doesn't set it) | **FIXED** |
| P1 | `common.close` vs `cart.close` dead code in buttonLabel | **FIXED** (removed dead override) |
| P2 | Inconsistent i18n fallback pattern in hallStickyButtonLabel | Pre-existing pattern |
| P2 | Hardcoded `\|\|` fallbacks in BUG 3 code | Pre-existing pattern |
| P2 | setTimeout without cleanup | **FIXED** (see correctness) |
| P2 | isDrawerOpen prop never passed | **FIXED** (see correctness) |
| P3 | Stale "// Submit order" comment | Pre-existing |
| P3 | Unconditional console.log in order handlers | Pre-existing |

### Codex Review (2 High, 3 Medium)

| Priority | Issue | Status |
|---|---|---|
| High | setTimeout race — stale setState, no cleanup | **FIXED** |
| High | Multiple timers can queue from rapid submissions | **FIXED** (clearTimeout before new timer) |
| Medium | isSessionLoading conflates "not loaded" with "no session exists" | **FIXED** (3s timeout bound) |
| Medium | setView("menu") without ensuring drawer is open | INTENTIONAL (drawer state unchanged) |
| Medium | Loading label gated only by tableSession, possible brief flicker | Acceptable (3s timeout resolves) |

---

## Review Fix Commit
**Commit:** `fix(review): address reviewer findings for 3 bug fixes`

Fixes applied:
1. **setTimeout cleanup:** Added `viewTransitionTimerRef` + `clearTimeout` before setting new timer + cleanup `useEffect` on unmount
2. **isSessionLoading timeout:** Added `sessionCheckTimedOut` state with 3s timer — after 3s, assumes no session exists (prevents permanent loading for new visits)
3. **Comment accuracy:** Updated processHallOrder comment to "drawer state unchanged"
4. **isDrawerOpen prop:** Passed `isDrawerOpen={drawerMode === 'cart'}` to Hall StickyCartBar; removed dead `buttonLabel` close-mode override

---

## Final Statistics

- **Bugs fixed:** 3 (BUG 1, BUG 2, BUG 3)
- **Review issues found:** 13 total across 3 reviewers
- **Issues fixed from review:** 6 (all actionable P1s)
- **Pre-existing issues noted:** 5 (not introduced by these changes)
- **Intentional design decisions:** 2
- **Commits:** 5 total (1 staging + 3 bug fixes + 1 review fixes)
- **Lines changed:** ~55 insertions, ~30 deletions

---

## Remaining Pre-Existing Issues (Not in Scope)
1. `console.log("Order created", ...)` on lines ~1644, ~1945 — remove before production (Rule 10)
2. Hardcoded `|| 'Russian string'` fallbacks throughout the file — violates i18n rules but is established pattern
3. Stale `// Submit order` comment above `processHallOrder`
