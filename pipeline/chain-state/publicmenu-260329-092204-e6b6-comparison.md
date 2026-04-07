# Comparison Report — PublicMenu
Chain: publicmenu-260329-092204-e6b6

## Agreed (both found)

All 11 fixes were identified by BOTH CC and Codex. High confidence — apply all.

| # | Fix ID | Priority | Description | Agreement |
|---|--------|----------|-------------|-----------|
| 1 | CV-28 | P1 | Flat dish list inside status buckets (group by name) | ✅ Both agree on replacing `renderBucketOrders()` with bucket-level aggregation by dish name, removing per-order timestamps/chevrons/`expandedOrders` |
| 2 | CV-29 | P2 | Remove separator lines between dish rows inside buckets | ✅ Both agree: remove `border-b` from dish rows and `border-t` from bucket body |
| 3 | CV-30 | P2 | Drawer header "N заказа · X ₸" format | ✅ Both agree: use `todayMyOrders.length` + Russian plural + `· formatPrice(ordersSum)` |
| 4 | CV-31 | P2 | Table + guest on one line | ✅ Both agree: combine into single flex row with `·` separator, remove "Вы:" prefix |
| 5 | CV-32 | P2 | Auto-collapse "Подано" when cart non-empty | ✅ Both agree: add `useEffect` that sets `served: false` when `cart.length > 0` |
| 6 | CV-33 | P2 | Remove "Для кого заказ" section | ✅ Both agree: remove `splitExpanded` state, `splitSummary` computation, and entire UI block ~L1009-1076. Keep `splitType` prop from parent untouched |
| 7 | CV-34 | P2 | Hide "price × 1" when qty=1 | ✅ Both agree: wrap with `item.quantity > 1 &&` conditional |
| 8 | CV-35 | P2 | Reduce padding in "Новый заказ" | ✅ Both agree: `mb-4` → `mb-2`, `p-4` → `p-3` or `px-3 py-2` |
| 9 | PM-156 | P2 | Remove duplicate bell icon from x.jsx | ✅ Both agree: remove the floating bell block entirely (Approach B) |
| 10 | PM-152 | P2 | Guest name not cleared when table changes | ✅ Both agree: ref-based comparison is fragile after Chrome kill |
| 11 | PM-153 | P1 | Guest name fallback — use guestNameInput | ✅ Both agree: insert `guestNameInput` before `getGuestDisplayName()` in both branches |

## CC Only (Codex missed)

**None.** Both writers found all 11 issues.

## Codex Only (CC missed)

**None.** Both writers found all 11 issues.

## Disputes (disagree on implementation approach)

### Dispute 1: Fix 1 (CV-28) — Rating rows in "served" bucket

- **CC:** Explicitly addresses the rating complexity — says to visually group by name BUT keep per-`itemId` rating rows for the served bucket. Proposes: "show individual rating rows under the grouped display name."
- **Codex:** Says "replace `renderBucketOrders()` with bucket-level item aggregation" and mentions removing `expandedOrders`, `getOrderSummary()`, `getOrderTime()`, but does NOT explicitly address how per-item ratings should work in the grouped view.

**Resolution:** CC's approach is more thorough. Ratings MUST be per-item (each `itemId` gets its own stars). The merger should follow CC's guidance: group display by name, but expand individual rating rows in served bucket. **Use CC approach.**

### Dispute 2: Fix 10 (PM-152) — Guest name clearing mechanism

- **CC:** Proposes `localStorage.getItem('menuapp_last_table')` approach — persist previous table code in localStorage itself, so it survives Chrome kill. On mount: compare stored table vs URL param → clear if different.
- **Codex:** Identifies the same root cause (ref-based comparison fragile after fresh mount) but does NOT propose a specific alternative mechanism — just says "replace the current ref-based check with a table-code change effect that reliably clears state/localStorage."

**Resolution:** CC's localStorage-based approach (`menuapp_last_table`) is concrete and addresses the Chrome kill scenario correctly. The ref resets on mount; localStorage does not. **Use CC approach.**

### Dispute 3: Fix 8 (CV-35) — Exact padding values

- **CC:** `px-3 py-2` for CardContent, `mb-2` for Card.
- **Codex:** `p-3` or equivalent tighter padding.

**Resolution:** Minor difference. CC's `px-3 py-2` is tighter than `p-3`. Either works. **Use CC approach** (`px-3 py-2`) for maximum compactness.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Fix 1 — CV-28:** Flat dish list in status buckets — Source: **agreed** — Replace `renderBucketOrders()` with bucket-level aggregation by dish name. Keep per-item rating rows in served bucket. Remove per-order timestamps/chevrons. File: `CartView.jsx` ~L520-614.

2. **[P1] Fix 11 — PM-153:** Guest name fallback — Source: **agreed** — Insert `guestNameInput` as fallback in `guestBaseName` computation. File: `CartView.jsx` ~L309-312.

3. **[P2] Fix 2 — CV-29:** Remove separator lines — Source: **agreed** — Remove `border-b` from dish rows and `border-t` from bucket body in new Fix 1 code. File: `CartView.jsx`.

4. **[P2] Fix 3 — CV-30:** Header format "N заказа · X ₸" — Source: **agreed** — Replace L664-668 with count + plural + sum. File: `CartView.jsx` ~L664-668.

5. **[P2] Fix 4 — CV-31:** Table + guest one line — Source: **agreed** — Combine into single flex row with `·` separator. File: `CartView.jsx` ~L634-663.

6. **[P2] Fix 5 — CV-32:** Auto-collapse "Подано" — Source: **agreed** — Add `useEffect` after L99. File: `CartView.jsx` ~L92-99.

7. **[P2] Fix 6 — CV-33:** Remove split-order section — Source: **agreed** — Remove `splitExpanded` state, `splitSummary`, UI block L1009-1076. File: `CartView.jsx`.

8. **[P2] Fix 7 — CV-34:** Hide "price × 1" — Source: **agreed** — Conditional render when qty > 1. File: `CartView.jsx` ~L981.

9. **[P2] Fix 8 — CV-35:** Reduce padding — Source: **agreed** — `p-4` → `px-3 py-2`, `mb-4` → `mb-2`. File: `CartView.jsx` ~L967-968.

10. **[P2] Fix 9 — PM-156:** Remove floating bell — Source: **agreed** — Remove entire block L3952-3961. File: `x.jsx`.

11. **[P2] Fix 10 — PM-152:** Guest name table change — Source: **agreed (CC approach)** — Replace `prevTableRef` logic with `localStorage.getItem('menuapp_last_table')` comparison. File: `x.jsx` ~L2464-2473.

## Prompt Clarity Comparison

| Aspect | CC | Codex |
|--------|-----|-------|
| Overall clarity | 5/5 | 3/5 |
| Ambiguous fixes noted | None | Fix 2 line ref to ~978 (Новый заказ section), Fix 11 omitted from TARGET summary |
| Missing context | None | splitType parent plumbing, post-restart URL hydration |
| Scope questions | Fix 1 rating rows, Fix 10 root cause | Fix 11 in target files, context-file rule |

**Codex raised valid prompt clarity concerns** — Fix 2 did reference line 978 which is in "Новый заказ" section (not status buckets). However, the primary target (line 528) is correct. Fix 11 was listed in the fix descriptions but not in the TARGET FILES summary — minor omission since CartView.jsx was already listed.

## Summary
- **Agreed: 11 items** (all 11 fixes found by both)
- CC only: 0 items
- Codex only: 0 items
- **Disputes: 3 items** (implementation detail differences, all resolved in favor of CC's more specific approach)
- **Total fixes to apply: 11**
