# Discussion Report — PublicMenu
Chain: publicmenu-260329-092204-e6b6

## Disputes Discussed
Total: 3 disputes from Comparator

## Round 1

### Dispute 1: CV-28 — Rating rows in "served" bucket when dishes are grouped by name
**CC Position:** Group dishes by name in each status bucket for display, BUT keep per-itemId rating rows expanded in the "served" (Подано) bucket. Ratings are per-item — each `itemId` gets its own stars. This means the served bucket shows grouped names (e.g., "New York Steak ×2") but also expands individual rating rows underneath so each order's item can be rated independently.

**Codex Position:** Codex's Round 1 finding (#1) says: "replace `renderBucketOrders()` with bucket-level item aggregation by dish name, render one flat row per grouped dish, and remove `expandedOrders`, `getOrderSummary()`, and `getOrderTime()`." Codex does NOT explicitly address per-item ratings in the served bucket. Finding #9 mentions a D3 served-only empty state but does not cover the rating mechanism within grouped rows.

**Analysis:** Codex does not contest CC's approach — it simply omits the rating detail. CC's approach is more thorough and preserves critical rating functionality. Grouping by name for display while keeping per-item rating capability is the correct behavior.

**Status:** ✅ Resolved — CC approach (group by name, keep per-item rating rows in served bucket)

### Dispute 2: PM-152 — Guest name clearing mechanism after Chrome kill
**CC Position:** Use `localStorage.getItem('menuapp_last_table')` to persist the previous table code. On mount, compare stored table vs URL param → clear guest name if different. This survives Chrome kill because localStorage persists, unlike React refs which reset to `undefined` on fresh mount.

**Codex Position:** Finding #10 says: "replace the current ref-based check with a table-code change effect that reliably clears state/localStorage when the table code changes between tables, while skipping the true initial load." Codex agrees on the root cause (ref fragility after fresh mount) and the general direction (reliable table-code change detection) but does not propose a specific mechanism.

**Analysis:** CC's localStorage-based approach (`menuapp_last_table`) is concrete and directly addresses the Chrome kill scenario. The ref approach failed in S190 Android testing. Codex's general recommendation aligns with CC's specific solution. No counter-arguments raised.

**Status:** ✅ Resolved — CC approach (localStorage `menuapp_last_table` comparison)

### Dispute 3: CV-35 — Exact padding values for "Новый заказ" section
**CC Position:** `px-3 py-2` for CardContent, `mb-2` for Card wrapper. This gives tighter vertical padding (8px top/bottom) while keeping 12px horizontal.

**Codex Position:** Finding #8 says: "reduce the new-order card spacing to `mb-2` and `p-3` or equivalent tighter padding." Codex agrees on `mb-2` and suggests `p-3` (12px all sides) as one option.

**Analysis:** Minor implementation detail. Both are acceptable for mobile. CC's `px-3 py-2` is slightly tighter vertically, which better serves the goal of reducing whitespace on small screens. Codex does not push back — it offers `p-3` as one option alongside "equivalent tighter padding."

**Status:** ✅ Resolved — CC approach (`px-3 py-2`, `mb-2`)

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | CV-28 rating rows in served bucket | 1 | resolved | CC |
| 2 | PM-152 guest name clearing mechanism | 1 | resolved | CC |
| 3 | CV-35 exact padding values | 1 | resolved | CC |

## Updated Fix Plan
Based on discussion results, the disputed items are confirmed with CC's approach:

1. **[P1] Fix 1 — CV-28:** Flat dish list in status buckets — Source: discussion-resolved (CC) — Group dishes by name within each bucket. In served bucket, keep per-itemId rating rows expandable so each item can be rated individually. Remove per-order timestamps/chevrons/expandedOrders.

2. **[P2] Fix 10 — PM-152:** Guest name table change — Source: discussion-resolved (CC) — Replace `prevTableRef` comparison with `localStorage.getItem('menuapp_last_table')` mechanism. On mount/change: compare stored table vs `tableCodeParam`, clear guest name if different, update stored table.

3. **[P2] Fix 8 — CV-35:** Reduce padding — Source: discussion-resolved (CC) — Use `px-3 py-2` for CardContent, `mb-2` for Card wrapper.

All other fixes (2-7, 9, 11) remain unchanged from Comparator's agreed plan.

## Unresolved (for Arman)
None. All 3 disputes resolved in Round 1.
