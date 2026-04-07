# Comparison Report — PublicMenu
Chain: publicmenu-260329-232408-0279

## Agreed (both found)

### Fix 1 — [P2] Move review banners inside served bucket
- **CC**: Remove blocks at lines 671–737. Insert inside V8 path (lines 866–897) and normal path (lines 912–944), gated on `expandedStatuses.served`.
- **Codex**: Same diagnosis — remove top-level blocks at lines 671/680, render inside served bucket after header button, gated on `expandedStatuses.served === true` in both branches.
- **Verdict**: AGREED. CC provides more granular line-by-line plan; use CC's approach with V8 and normal path locations.

### Fix 2 — [P3] Collapsed bucket header padding
- **CC**: Change `p-3` → `px-3 py-2` on lines 868 and 914.
- **Codex**: Same — change `CardContent className="p-3"` → `px-3 py-2` at lines 868 and 914.
- **Verdict**: AGREED. Identical fix.

### Fix 3 — [P3] Spacing between "Новый заказ" card and footer
- **CC**: Change `mb-2` → `mb-4` on line 951. Notes footer already has `border-t border-slate-200` at line 1015.
- **Codex**: Same — change `mb-2` → `mb-4` at line 951. Also confirms footer border already present.
- **Verdict**: AGREED. Both confirm only the margin change is needed.

### Fix 5 — [P3] Replace ✅ emoji with "Оценено" text
- **CC**: Replace at lines 880 and 927 with `<span className="ml-1 text-xs text-green-600 font-medium">{tr('review.all_rated', 'Оценено')}</span>`.
- **Codex**: Same replacement at same lines, same className and i18n pattern.
- **Verdict**: AGREED. Identical fix.

## Disputes (disagree on approach)

### Fix 4 — [P3] Gap between bucket header and items
- **CC**: Change `className="space-y-1 mt-3 pt-3"` → `className="space-y-1 mt-2 pt-2"` at line 543 inside `renderBucketOrders()`. Reduces gap from 24px to 16px. Simple, single-location change affecting all buckets uniformly.
- **Codex**: Suggests wrapping expanded bucket content in a new container with `pt-2 px-3 pb-3` and removing `mt-3 pt-3` entirely. More structural change.
- **Analysis**: The task description says "Change the bucket content padding from `p-3` to `pt-2 px-3 pb-3`". CC found the actual padding is `mt-3 pt-3` (not `p-3`) inside `renderBucketOrders` at line 543. CC's approach is more minimal — a single class change in one location. Codex's wrapper approach adds unnecessary structural complexity and risks breaking the bucket layout. The task's intent is to reduce the top gap, which CC achieves directly.
- **Verdict**: Use CC's approach — `mt-3 pt-3` → `mt-2 pt-2` at line 543. Minimal, targeted, achieves the same visual result.

## CC Only (Codex missed)

### Fix 6 — [P2] PM-162 MenuView formatPrice — ALREADY FIXED
- CC verified both list card (line 103) and tile card (line 281) in MenuView.jsx already use `formatPrice(parseFloat((...).toFixed(2)))`.
- Codex did not mention Fix 6 or Fix 7 — likely did not check or implicitly agreed no changes needed.
- **Verdict**: ACCEPTED (no action needed). CC's verification is valuable — confirms PM-162 is already resolved in MenuView.

### Fix 7 — [P2] PM-162 x.jsx formatPrice — ALREADY FIXED
- CC verified at line 3902 in x.jsx: `formatPrice(parseFloat((...).toFixed(2)))` already present from PM-155 fix.
- Codex did not mention this either.
- **Verdict**: ACCEPTED (no action needed). CC's verification confirms PM-162 is already resolved in x.jsx.

## Codex Only (CC missed)

None. Codex found a subset (5 of 7) of CC's findings. No new issues raised by Codex.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] Fix 1** — Move review banners inside served bucket — Source: **Agreed** — Remove `shouldShowReviewRewardHint` block (lines 671–677) and `shouldShowReviewRewardNudge` block (lines 680–737) from top-level. Insert both inside V8 served path (after line 894 header) and normal served path (after line 941 header), gated on `expandedStatuses.served`.
2. **[P3] Fix 2** — Collapsed bucket header padding — Source: **Agreed** — Change `p-3` → `px-3 py-2` on `<CardContent>` at lines 868 and 914.
3. **[P3] Fix 3** — "Новый заказ" card bottom margin — Source: **Agreed** — Change `mb-2` → `mb-4` on `<Card>` at line 951. Footer border already exists.
4. **[P3] Fix 4** — Reduce header-to-items gap — Source: **CC (dispute resolved)** — Change `space-y-1 mt-3 pt-3` → `space-y-1 mt-2 pt-2` at line 543 in `renderBucketOrders()`.
5. **[P3] Fix 5** — Replace ✅ emoji with text — Source: **Agreed** — Replace emoji span at lines 880 and 927 with `<span className="ml-1 text-xs text-green-600 font-medium">{tr('review.all_rated', 'Оценено')}</span>`.
6. **[P2] Fix 6** — PM-162 MenuView — Source: **CC verification** — ALREADY FIXED, no action needed.
7. **[P2] Fix 7** — PM-162 x.jsx — Source: **CC verification** — ALREADY FIXED, no action needed.

## Summary
- Agreed: 4 items (Fix 1, 2, 3, 5)
- CC only: 2 items (Fix 6, 7 — both verified as already fixed, 2 accepted)
- Codex only: 0 items
- Disputes: 1 item (Fix 4 — resolved in favor of CC's minimal approach)
- **Total fixes to apply: 5** (Fixes 1–5 in CartView.jsx only)
- **Files needing changes: 1** (CartView.jsx — MenuView.jsx and x.jsx already correct)
