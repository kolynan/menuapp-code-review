# Discussion Report — CartView
Chain: cartview-260415-225026-8ace
Mode: CC-Only (v2)

## Disputes Analyzed
Total: 2 disputes from Comparator

### Dispute 1: Fix 3 — Scope of `getSafeStatus` refactor

**CC Solution (403a — earlier):** Only extend `oldInProgressLabels` with `'Готово'` — conservative label-only approach.

**CC Solution (8ace — evolved):** Both `internal_code` early-check AND label extension — matches the Codex-inspired merged approach.

**Codex Solution (from Cowork synthesis):** Map by `internal_code` first, label as fallback.

**CC Analysis:**
Verified at lines 300-338: `getSafeStatus` currently has NO `internal_code` check. It relies entirely on label pattern matching, which breaks with custom partner stage names.

The `internal_code`-first approach is architecturally correct because:
1. `internal_code` is a stable enum from the order pipeline — it doesn't change with partner customization.
2. Label matching is inherently fragile: adding individual Russian strings (`'Готово'`, `'Готов'`, etc.) to arrays is whack-a-mole.
3. The existing `statusBuckets` at :434-441 already uses `internal_code` via `getOrderStatus` — this aligns `getSafeStatus` with the same principle.

Keeping the label fallback (with `'Готово'` added) is still necessary for legacy orders that may lack `internal_code`. Both layers are complementary, not redundant.

One concern: the new `internal_code` branches in the spec use `icon: '⏳'`/`color: '#64748b'` while existing code uses `icon: '🔵'`/`color: '#6B7280'`. The `internal_code` path will return different visual styling than the label-fallback path for the same semantic state. However, since `internal_code` branches fire first (when available), and legacy data without `internal_code` falls through to old styling, this is acceptable — the `internal_code` values from the spec are more semantically appropriate (checkmark for served, hourglass for in-progress).

**Verdict:** Compromise (already reflected in Cowork spec)

**Reasoning:** CC evolved to match Codex's `internal_code`-first insight. The merged approach (internal_code first + label fallback with `'Готово'`) is the correct solution. Not a true dispute — positions converged.

---

### Dispute 2: Fix 4 — Header guard condition at :754

**CC Solution (8ace):** Flagged as scope question — `(ordersSum > 0 || cart.length > 0)` guard at :754 won't fire on Stol tab when user has no personal orders. Recommends extending to `|| (cartTab === 'table' && submittedTableTotal > 0)`.

**Codex Solution:** Not addressed (Codex didn't analyze the guard condition).

**Cowork Spec:** Does not address this gap. Shows only the inner content change (conditional by `cartTab`), not the outer guard.

**CC Analysis:**
Verified at line 754: `{(ordersSum > 0 || cart.length > 0) && (() => {`

This is a **real gap**. The scenario:
- Guest joins a table session but hasn't ordered yet (empty cart, no personal orders)
- Other guests have submitted orders → `submittedTableTotal > 0`
- Guest switches to Stol tab
- `ordersSum === 0` (no personal orders) AND `cart.length === 0` (empty cart)
- Guard evaluates to `false` → header doesn't render at all
- The new `cartTab === 'table'` branch inside never executes
- Result: Stol tab header shows nothing — no "Заказано на стол: X ₸"

This defeats the purpose of Fix 4's header change for Stol tab.

The fix is straightforward and safe:
```diff
- {(ordersSum > 0 || cart.length > 0) && (() => {
+ {(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0)) && (() => {
```

Risk assessment: LOW. The added condition only fires when `cartTab === 'table'` AND there are actual submitted orders. It cannot cause false renders or layout issues. The inner IIFE already handles the `totalDishCount > 0` null-return check for the `my` branch, and the new `table` branch will show `submittedTableTotal` which we know is > 0 from the guard.

**Verdict:** CC (extend the guard)

**Reasoning:** Spec gap confirmed by code inspection. Without this fix, the Stol-tab header is invisible for guests who haven't personally ordered — directly contradicting the intent of Fix 4 (CV-50: "Заказано на стол" in header). Low-risk, 1-line change.

---

## Resolution Summary

| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Fix 3 — `getSafeStatus` scope | Compromise (merged approach) | CC and Codex positions converged: `internal_code` first (Codex) + label fallback with `'Готово'` (CC). Already in spec. |
| 2 | Fix 4 — Header guard at :754 | CC (extend guard) | Spec gap: without guard extension, Stol-tab header invisible for guests with no personal orders. 1-line fix, low risk. |

## Updated Fix Plan

Based on discussion results, the following updates apply to disputed items only (agreed items from Comparator remain unchanged):

1. [P1] Fix 3 — `getSafeStatus` merged refactor — Source: discussion-resolved (Compromise) — Add `internal_code` early-check (Codex idea) + extend `oldInProgressLabels` with `'Готово'` (CC idea). Use spec values for icon/color in new branches.

2. [P1] Fix 4 — Header guard extension — Source: discussion-resolved (CC) — Extend guard at :754 to `(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0))`. This is an ADDITION to the existing Fix 4 spec, not a replacement.

## Skipped (for Arman)

None. Both disputes resolved technically with clear rationale.
