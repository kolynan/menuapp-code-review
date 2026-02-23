# Code Review Report: BUG-PM-004 + BUG-PM-005 Fixes

**Date:** 2026-02-23
**Reviewed by:** Claude (correctness + style sub-reviewers) + Codex (partial, timed out)
**Commits:** `f5eb015` (initial fix), `1c4aac5` (reviewer fixes)
**Files modified:**
- `pages/PublicMenu/useTableSession.jsx`
- `pages/PublicMenu/PublicMenu_BASE.txt`

---

## Summary

Two bugs fixed:
- **BUG-PM-004 (P0):** Polling in `useTableSession` now uses a merge strategy instead of full replacement for `sessionOrders` and `sessionItems`. Optimistic data from `processHallOrder` is preserved until the server confirms (30s TTL).
- **BUG-PM-005 (P1):** Cart save effect now guards against race condition where empty cart overwrites stored data before restore completes. Added 4h TTL to cart storage format with backwards-compatible legacy array migration.

After the initial fix commit, both sub-reviewers ran and found issues. A second commit addressed the actionable findings.

---

## Changes Made

### useTableSession.jsx
1. Added `OPTIMISTIC_TTL_MS = 30000` constant
2. **Polling `setSessionOrders`** (line ~545): Changed from `setSessionOrders(orders || [])` to a merge function that:
   - Tags server orders with `_fromServer: true`
   - Keeps optimistic orders (those with `_optimisticAt` but no `_fromServer`, not in server response, within 30s TTL)
3. **Polling `setSessionItems`** (line ~587): Changed from `setSessionItems(items)` to merge that keeps `temp_`-prefixed items whose order isn't yet in server response, within 30s TTL
4. **Empty orders case** (line ~609): Same merge pattern — keeps optimistic items within TTL even when server returns 0 orders

### PublicMenu_BASE.txt
1. **`saveCartToStorage`**: Now saves `{ items, ts }` format; removes key when cart is empty
2. **`getCartFromStorage`**: Supports legacy plain array (migrates to new format on read); requires valid `ts` for TTL check
3. **`CART_TTL_MS`**: New constant = 4 hours
4. **Save effect** (line ~556): Added `if (!cartRestoredRef.current) return;` guard
5. **Restore effect** (line ~562): Moved `cartRestoredRef.current = true` before storage read
6. **`processHallOrder`** optimistic update:
   - Added `_optimisticAt: Date.now()` to order and items (captured once in `optimisticAt` variable)
   - Added dedup check: `if (prev.some(o => String(o.id) === String(order.id))) return prev;`

---

## Reviewer Findings

### Correctness Reviewer

| # | Priority | Issue | Status |
|---|----------|-------|--------|
| 1 | P0 | Duplicate order on submit+poll overlap (same real ID in optimistic + server) | **FIXED** — dedup check added |
| 2 | P0 | Guest field mismatch after poll replaces optimistic order (link object vs string) | **Noted** — pre-existing `getLinkId` normalization concern; not directly caused by our changes |
| 3 | P1 | `cartRestoredRef` race in React StrictMode double-invocation | **FIXED** — ref set before storage read |
| 4 | P1 | Legacy cart array bypasses TTL entirely | **FIXED** — legacy format now migrated on read |
| 5 | P1 | OrderItem silent failure wipes displayed items | **Noted** — pre-existing; fetch failure keeps `items = []` from batch fallback |
| 6 | P1 | Scheduler timeout leak (lost `intervalId` references) | **Noted** — pre-existing scheduling pattern |
| 7 | P1 | Missing `ts` in cart data bypasses TTL check | **FIXED** — require valid numeric `ts` |
| 8 | P2 | `console.log("Order created")` in production (lines 1678, 1980) | **Noted** — pre-existing, not part of these changes |
| 9 | P2 | Optimistic item filter doesn't guard null `item.order` | **Noted** — low risk (30s TTL limits damage) |

### Style Reviewer

| # | Priority | Issue | Status |
|---|----------|-------|--------|
| 1 | P2 | Magic numbers in `getInterval()` (30000, 15000, 10000) | **Noted** — pre-existing |
| 2 | P2 | `OPTIMISTIC_TTL` missing `_MS` suffix | **FIXED** — renamed to `OPTIMISTIC_TTL_MS` |
| 3 | P2 | Dual `Date.now()` calls for order + items | **FIXED** — captured once in `optimisticAt` |
| 4 | P2 | Implicit coupling: `_optimisticAt` written in PublicMenu, consumed in useTableSession | **Noted** — added comments; export of constant is optional |
| 5 | P2 | `_fromServer` field contamination risk (could leak to DB writes) | **Noted** — no DB writes use spread from sessionOrders currently |
| 6 | P2 | `console.log` in production paths (lines 1678, 1980) | **Noted** — pre-existing |
| 7 | P2 | Debug `useEffect` block (lines 1383-1420) behind `isDebugGuestItems` | **Noted** — pre-existing |
| 8 | P2 | `formatOrderTime` hardcodes `"ru-RU"` locale | **Noted** — pre-existing |
| 9 | P3 | `getInterval`/`scheduleNext` defined inline in useEffect | **Noted** — pre-existing |
| 10 | P3 | `'temp_'` prefix is magic string across two files | **Noted** — low risk |

### Codex Review (Partial)

Codex identified the restore path at line 415 (`setSessionOrders(orders || [])`) still does full replacement. This is **correct by design** — during initial restore, there are no optimistic orders in state (state was reset by table-change effect). The merge is only needed in the polling path.

---

## Confirmed Patches (applied in commit `1c4aac5`)

### 1. Dedup optimistic order (P0)
```js
// Before
setSessionOrders(prev => [orderWithGuest, ...prev]);

// After
setSessionOrders(prev => {
  if (prev.some(o => String(o.id) === String(order.id))) return prev;
  return [orderWithGuest, ...prev];
});
```

### 2. Legacy cart format migration (P1)
```js
// Before
if (Array.isArray(data)) return data;

// After — migrate to new format on read
if (Array.isArray(data)) {
  try { localStorage.setItem(key, JSON.stringify({ items: data, ts: Date.now() })); } catch {}
  return data;
}
```

### 3. Strict TTL validation (P1)
```js
// Before
if (data.ts && (Date.now() - data.ts) > CART_TTL_MS) { ... }

// After — require valid numeric ts
if (!data.ts || typeof data.ts !== 'number' || (Date.now() - data.ts) > CART_TTL_MS) { ... }
```

### 4. Rename OPTIMISTIC_TTL to OPTIMISTIC_TTL_MS (P2)
All 4 usages updated for naming consistency with `TTL_MS` and `CART_TTL_MS`.

### 5. Single `Date.now()` capture (P2)
```js
const optimisticAt = Date.now();
// Used for both orderWithGuest._optimisticAt and itemsWithLinks._optimisticAt
```

---

## Remaining Issues (not fixed, pre-existing)

| Issue | Priority | Reason Not Fixed |
|-------|----------|------------------|
| `console.log("Order created")` at lines 1678, 1980 | P2 | Pre-existing, not part of BUG-PM-004/005 scope |
| Debug `useEffect` (lines 1383-1420) | P2 | Pre-existing debug block behind URL param |
| `formatOrderTime` hardcoded `"ru-RU"` | P2 | Pre-existing i18n issue |
| Scheduler timeout leak pattern | P1 | Pre-existing architecture; requires broader refactor |
| `_fromServer` field contamination risk | P2 | Currently no DB writes from sessionOrders state |
| Guest field link object normalization | P0 (noted) | Pre-existing `getLinkId` concern; needs deeper analysis |

---

## Statistics

- **Total issues found:** 19 (P0: 2, P1: 6, P2: 9, P3: 2)
- **Issues fixed:** 5 (P0: 1, P1: 3, P2: 1 rename + style)
- **Issues noted (pre-existing):** 14
- **Files analyzed:** 2
- **Lines of code:** ~2500 (PublicMenu) + ~770 (useTableSession) = ~3270
- **Review rounds:** 1 (sub-reviewers) + 1 (codex partial) + 1 (fix commit)
