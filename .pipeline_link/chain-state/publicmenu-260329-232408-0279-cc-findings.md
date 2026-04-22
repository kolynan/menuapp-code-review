# CC Writer Findings — PublicMenu
Chain: publicmenu-260329-232408-0279

## Findings

1. **[P2] Fix 1 — Review banners are top-level, not inside served bucket** — Both `shouldShowReviewRewardHint` (lines 671–677) and `shouldShowReviewRewardNudge` (lines 680–737) render at top-level drawer body, above all bucket sections. They push "Новый заказ" below fold.
   FIX: Remove both banner blocks from their current position (lines 671–737). Insert them inside the served bucket in TWO places:
   - **V8 path** (lines 866–897): After the `<button>` header (line 894), add `{expandedStatuses.served && (<>` + hint banner + nudge banner + `</>)}` BEFORE `{expandedStatuses.served && renderBucketOrders(...)}` at line 895.
   - **Normal path** (lines 912–944): After the `<button>` header (line 941), add same banners gated on `isServed && expandedStatuses.served` BEFORE `{isExpanded && renderBucketOrders(...)}` at line 942.
   Both banners must be wrapped in `expandedStatuses.served` (or `isExpanded && isServed`) so they only show when the served bucket is expanded.

2. **[P3] Fix 2 — Collapsed bucket header padding too tall** — `<CardContent className="p-3">` at line 868 (V8 path) and line 914 (normal path) uses 12px padding all sides for bucket headers.
   FIX: Change `className="p-3"` to `className="px-3 py-2"` on both lines (868 and 914). This reduces vertical padding from 12px to 8px on collapsed headers. Note: the expanded content padding is handled separately by `renderBucketOrders` so this change only affects the header area.

3. **[P3] Fix 3 — Spacing between "Новый заказ" card and submit footer** — Line 951: `<Card className="mb-2">` — only 8px bottom margin. The footer at line 1015 already has `border-t border-slate-200` so the top border is already present. The footer uses sticky positioning, and the spacer at line 1001 (`h-20`) handles the gap.
   FIX: Change `mb-2` to `mb-4` on line 951 (`<Card className="mb-4">`). The footer zone at line 1015 already has `border-t border-slate-200`, so no additional border change needed. However, the motivation text line at line 1022 (`<p className="text-sm text-gray-500 text-center mt-1 mb-1">`) could use `mt-0` since it's at the top of the footer — but this is outside the "Новый заказ" card scope. Minimal fix: just change `mb-2` → `mb-4` on line 951.

4. **[P3] Fix 4 — Gap between bucket header and items too large** — `renderBucketOrders` at line 543 returns `<div className="space-y-1 mt-3 pt-3">`. The `mt-3` (12px margin) + `pt-3` (12px padding) = 24px total gap from header to first item. This feels too loose on mobile.
   FIX: Change `className="space-y-1 mt-3 pt-3"` to `className="space-y-1 mt-2 pt-2"` at line 543. This reduces the gap from 24px to 16px total, which is the intended 8px reduction. Note: since `renderBucketOrders` is shared by all buckets (V8 and normal paths), changing it once fixes all buckets.

5. **[P3] Fix 5 — ✅ emoji should be text "Оценено"** — Two locations:
   - Line 880 (V8 path): `<span className="ml-1 text-xs text-green-600">✅</span>`
   - Line 927 (normal path): `<span className="ml-1 text-xs text-green-600">✅</span>`
   FIX: Replace both instances with `<span className="ml-1 text-xs text-green-600 font-medium">{tr('review.all_rated', 'Оценено')}</span>`. Uses i18n with fallback per project rules.

6. **[P2] Fix 6 — PM-162: formatPrice on discounted price in MenuView — ALREADY FIXED** — Verified both locations:
   - List card (line 103): `{formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}`
   - Tile card (line 281): `{formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}`
   Both already use the correct `formatPrice(parseFloat((...).toFixed(2)))` pattern. PM-162 is NOT reproducible in the current MenuView.jsx code. **No fix needed.**

7. **[P2] Fix 7 — PM-162: formatPrice on discounted price in x.jsx detail card — ALREADY FIXED** — Verified at line 3902: `{formatPrice(parseFloat((detailDish.price * (1 - partner.discount_percent / 100)).toFixed(2)))}`. The PM-155 fix (commit df5df03) already applied `formatPrice` wrapper here. **No fix needed.**

## Summary
Total: 7 findings (0 P0, 2 P2, 5 P3)

- Fix 1: CONFIRMED — banners must be moved inside served bucket (2 render paths)
- Fix 2: CONFIRMED — `p-3` → `px-3 py-2` on bucket headers (2 locations)
- Fix 3: CONFIRMED — `mb-2` → `mb-4` on "Новый заказ" card; footer border already exists
- Fix 4: CONFIRMED — `mt-3 pt-3` → `mt-2 pt-2` in renderBucketOrders (1 location, shared)
- Fix 5: CONFIRMED — `✅` emoji → `tr('review.all_rated', 'Оценено')` text (2 locations)
- Fix 6: ALREADY FIXED — MenuView already uses formatPrice on discounted price
- Fix 7: ALREADY FIXED — x.jsx already uses formatPrice on discounted price

Actionable fixes: 5 out of 7 (Fixes 1–5 need changes, Fixes 6–7 are already done)

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None — all fixes had clear "Сейчас" / "Должно быть" / exact file locations
- Missing context: Fix 6 and Fix 7 describe a bug that appears to already be fixed in the current code. The task description references PM-162 as "parseFloat(toFixed(2)) strips trailing zeros" but the current code already wraps in formatPrice(). It's possible the bug was fixed in an earlier batch and PM-162 was filed against a stale version.
- Scope questions: None — scope lock and frozen UX sections were comprehensive
