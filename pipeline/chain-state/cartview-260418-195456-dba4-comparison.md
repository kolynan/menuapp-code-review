# Comparison Report — CartView
Chain: cartview-260418-195456-dba4
Date: 2026-04-18
Comparator task: task-260418-201845-059

## Source Status

| Writer | Status | Findings |
|--------|--------|----------|
| CC (task-260418-195457-021) | COMPLETED | 14 findings (0 P0, 9 P1, 5 P2). Detailed file lost (worktree cleaned up before push — KB-158). Summary available in cc-analysis-task-260418-195457-021.txt |
| Codex (task-260418-195457-022) | SKIPPED | 0 findings. Codex writer was skipped (progress shows "Codex: skipped", cost $0.00) |

> **Note:** CC findings reconstructed from cc-analysis summary + task spec validation against source code (all grep checks confirmed). Codex unavailable — comparison is CC-only.

## Agreed (both found)

N/A — Codex was skipped, no cross-validation possible.

## CC Only (Codex missed)

All 14 CC findings listed below. Since Codex was skipped (not that it disagreed), these are treated as **validated by CC** against spec and source code.

### Fix 1 — Header Attribution (9 items: 5 P1, 4 P2)

**1. [P1] isCancelledOrder helper missing** (before line 425)
- `todayMyOrders` uses inline cancelled check that misses `internal_code === 'cancelled'` (past-tense form).
- FIX: Add `isCancelledOrder(o)` helper BEFORE `todayMyOrders` useMemo. Covers both `'cancel'` and `'cancelled'` internal_codes + fallback string check.

**2. [P1] todayMyOrders inline filter not normalized** (line ~430)
- Second `.filter()` in `todayMyOrders` has inline cancelled check that doesn't use shared helper.
- FIX: Replace second `.filter()` with `.filter(o => !isCancelledOrder(o))`.

**3. [P1] No rendered-data aggregates for header** (after line ~523)
- Header uses `submittedTableTotal` (single sum from `o.status === 'submitted'`) instead of actual rendered order data.
- FIX: Add 3 useMemo blocks: `renderedTableTotal`, `renderedTableDishCount`, `renderedTableGuestCount` — computed from `ordersByGuestId` across all guests.

**4. [P1] submittedTableTotal is stale/incorrect** (lines 525-531)
- `submittedTableTotal` only counts submitted orders, not all active orders. Misleading header total.
- FIX: Delete entire `submittedTableTotal` useMemo block.

**5. [P1] Header lacks attribution** (lines 787-807)
- Header shows generic "Заказано на стол: X ₸" without "Вы:"/"Стол:" attribution per R2 spec.
- FIX: Replace header render block with attributed version: "Стол: N гостя · M блюд · X ₸" / "Вы: N блюд · X ₸".

**6. [P2] Header dish count doesn't include cart items** (line ~793)
- "Мои" header should show `todayMyOrders` dishes + cart items combined.
- FIX: Included in header rewrite (Fix 1 Step 1.3).

**7. [P2] pluralizeRu needed for guest/dish counts** (header)
- Russian pluralization rules (1 гость / 2 гостя / 5 гостей) require `pluralizeRu()`.
- FIX: Included in header rewrite using existing `pluralizeRu()` function.

**8. [P2] Header condition should use renderedTableTotal** (line 788)
- Condition `submittedTableTotal > 0` should become `renderedTableTotal > 0`.
- FIX: Part of header rewrite block.

**9. [P2] formatPrice used consistently** (header)
- Price formatting should use `formatPrice()` not raw number.
- FIX: Already used in spec — confirmed correct.

### Fix 2 — Pending Bucket (5 items: 3 P1, 2 P2 — mapped to steps 2.1-2.6)

**10. [P1] statusBuckets missing pending_unconfirmed group** (line ~456)
- Only `served` and `in_progress` groups exist. Submitted orders fall into `in_progress`.
- FIX: Add `pending_unconfirmed: []` group. Route `submitted` orders (no stageInfo) to it.

**11. [P1] Multiple locations need pending_unconfirmed awareness** (lines ~470, ~481, ~574, ~928, ~1005)
- `currentGroupKeys`, `otherGroupsExist`, `bucketDisplayNames`, `isV8`, `bucketOrder` all ignore pending bucket.
- FIX: Update all 5 locations to include `pending_unconfirmed` per spec steps 2.2-2.4c.

**12. [P1] No amber styling for pending bucket** (line ~1023)
- All buckets share `text-slate-800` heading. Pending should be `text-amber-600`.
- FIX: Conditional className on bucket header span (step 2.5).

**13. [P2] No pending badge in Table tab per-item** (lines ~880-901)
- Other-guest orders in Table tab don't show pending status badge.
- FIX: Add `isOrderPending` check + amber "⏳ Ожидает" badge per item (step 2.6).

**14. [P2] isCancelledOrder not used in statusBuckets** (line ~456)
- statusBuckets uses its own inline cancelled check instead of shared helper.
- FIX: Replace with `isCancelledOrder(o)` call (step 2.1).

### Fix 4 — Self-block (implicit in CC analysis, 0 separate findings)

CC analysis confirms Fix 4 is valid: "Self-block Card needed before SECTION 5 in Table tab. Uses isCancelledOrder for filtering, shows only active orders, always expanded."

Fix 4 is a single NEW CODE block insertion (no existing bugs to find) — CC validated the approach:
- Insert self-block Card BEFORE SECTION 5 comment (line 833)
- Filter with `isCancelledOrder`, show only active orders
- Always expanded per CV-16
- Pending badge for submitted self-orders

## Codex Only (CC missed)

N/A — Codex was skipped.

## Disputes (disagree)

N/A — Single reviewer (CC only).

## Final Fix Plan

Ordered list of all fixes to apply, strictly following spec application order (Fix 1 → Fix 2 → Fix 4):

### Fix 1 — Header Attribution
1. **[P1] Step 1.0** — Add `isCancelledOrder` helper — Source: CC — Insert helper function before `todayMyOrders` (line 425)
2. **[P1] Step 1.0b** — Normalize todayMyOrders filter — Source: CC — Replace inline cancelled check with `!isCancelledOrder(o)`
3. **[P1] Step 1.1** — Add 3 rendered-data aggregates — Source: CC — Insert `renderedTableTotal`, `renderedTableDishCount`, `renderedTableGuestCount` after `tableOrdersTotal` useMemo
4. **[P1] Step 1.2** — Delete submittedTableTotal — Source: CC — Remove entire useMemo block (lines 525-531)
5. **[P1] Step 1.3** — Replace header render — Source: CC — Replace lines 787-807 with attributed header

### Fix 2 — Pending Bucket
6. **[P1] Step 2.1** — Update statusBuckets — Source: CC — Add `pending_unconfirmed` group, use `isCancelledOrder`
7. **[P1] Step 2.2** — Update currentGroupKeys — Source: CC — Add 'P' key for pending
8. **[P1] Step 2.3** — Update bucketDisplayNames — Source: CC — Add `pending_unconfirmed` entry
9. **[P1] Step 2.4** — Update bucketOrder — Source: CC — Add `'pending_unconfirmed'` to array
10. **[P1] Step 2.4b** — Update isV8 — Source: CC — Include `pending_unconfirmed.length === 0`
11. **[P1] Step 2.4c** — Update otherGroupsExist — Source: CC — Include `pending_unconfirmed.length > 0`
12. **[P2] Step 2.5** — Amber styling — Source: CC — Conditional `text-amber-600` on pending bucket header
13. **[P2] Step 2.6** — Badge in Table tab — Source: CC — Add `isOrderPending` + amber badge per-item in `guestOrders.map`

### Fix 4 — Self-block
14. **[P1] Step 4.1** — Insert self-block Card — Source: CC — New Card before SECTION 5, always expanded, with pending badge

## Summary
- Agreed: 0 items (Codex unavailable)
- CC only: 14 items (14 accepted, 0 rejected)
- Codex only: 0 items (Codex skipped)
- Disputes: 0 items
- **Total fixes to apply: 14** (across 3 Fix blocks, 14 steps)

## Verified Code Anchors (grep confirmed in comparator)
- `todayMyOrders =` → line 425 ✓
- `'submitted'` literal → line 528 ✓
- `submittedTableTotal` → lines 525, 788, 799 ✓
- `bucketDisplayNames` → lines 574, 950, 1023 ✓
- `bucketOrder` → line 1005 ✓
- `SECTION 5:` → line 833 ✓
- `groupLabels` → 0 hits ✓ (confirmed absent)

## Recommendation

All 14 fixes are well-specified with exact code patches in the task spec. CC validated all identifiers and line locations. The applier (step 3) should follow the spec's application order strictly (Fix 1 → Fix 2 → Fix 4) and use grep-based location (not line numbers) since Fix 1 shifts subsequent lines by ~23.
