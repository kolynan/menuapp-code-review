# Comparison Report — PublicMenu
Chain: publicmenu-260330-161543-9b4e

## Agreed (both found)

All 10 fixes were identified by both CC and Codex with consistent analysis. HIGH confidence — apply all.

### Fix 1 — CV-05-v2 (P1): View mode — remove empty stars, show rating status text
- **CC:** Add `isRatingMode` state, restructure `renderBucketOrders` lines 553-584 into view mode (text: `⭐{rating}` / `Оценить`) vs rating mode (inline `<Rating>` stars). View mode text goes inline with dish name/price row.
- **Codex:** Same — add `isRatingMode` state near other `useState` (~line 93-117), split served rendering into view mode text vs rating mode stars.
- **Agreement:** Full. Both identify the same lines, same approach, same two-mode pattern.

### Fix 2 — CV-05-chip (P1): Rating chip — counter + mode toggle
- **CC:** Compute `unratedServedCount` via `useMemo`, replace chip in V8 (813-817) and normal (925-929) paths. Three states: `Оценить (N)` / `Готово` / `✓ Оценено`. Remove `e.stopPropagation()` from `Оценить` chip, keep it for `Готово`. Add `data-first-unrated` attribute for auto-scroll. Notes nested button HTML issue — recommend `<span role="button">`.
- **Codex:** Same core changes — compute counter, three chip states, remove `e.stopPropagation()`, add micro-label and scroll-to-first-unrated.
- **Agreement:** Full on behavior. CC adds extra detail on nested button issue and auto-scroll implementation — valid additions.

### Fix 3 — CV-37 (P2): Bonus subline below header — replace inline amber banner
- **CC:** Remove amber banners from V8 (829-834) and normal (941-946) paths. Add muted subline after header button, outside expand conditional. Wording `можно получить`.
- **Codex:** Same — remove in-content amber banner, render subline under served header outside `expandedStatuses.served` block.
- **Agreement:** Full.

### Fix 4 — CV-39 (P1): Autosave per row — remove re-rating guard
- **CC:** Replace guard `if (draftRating > 0 || hasReview) return;` → `if (ratingSavingByItemId?.[item.itemId] === true) return;`. Update `readonly` prop similarly. Improve save state display (saving/saved/error). Notes that `ratingSavingByItemId` may only support boolean.
- **Codex:** Same — only block while saving, branch status text for saving/saved/error. Notes that truthy `'error'` value would currently render as "saving" (incorrect behavior).
- **Agreement:** Full. Both flag the `ratingSavingByItemId` error state limitation.

### Fix 5 — CV-36 (P2): `✓ Оценено` chip + auto-exit rating mode
- **CC:** Add `✓` prefix, change i18n key to `review.all_rated_chip`, add `useEffect` for auto-exit when `allServedRated` becomes true.
- **Codex:** Same — render `✓ Оценено` read-only indicator, add auto-exit logic.
- **Agreement:** Full.

### Fix 6 — CV-38 (P2): Email bottom sheet after `Готово`
- **CC:** Remove inline reward nudge from V8 (835-890) and normal (947-1001) paths. Add `showPostRatingEmailSheet` state. Bottom sheet with email input, submit, skip, muted note. Compute `ratedCount`. Notes no standalone `handleRewardEmailSubmit` function — logic is inline, needs extraction or duplication.
- **Codex:** Same — delete inline green nudge block, add dedicated post-rating sheet triggered from `Готово`, reuse existing email submit logic.
- **Agreement:** Full. CC provides more implementation detail (JSX template, ratedCount computation).

### Fix 7 — CV-40 (P2): Re-entry in rating mode — pre-filled stars
- **CC:** `draftRating` from `safeDraftRatings` should already persist for re-entry. Main fix is removing readonly guard (Fix 4). Notes `safeReviewedItems` is a Set (no rating values) — items reviewed in previous sessions won't show original star count unless parent populates `safeDraftRatings`.
- **Codex:** Same — feed `Rating` from draft-or-existing review value, allow edits when not saving. Identifies `value={draftRating}` doesn't include existing reviews.
- **Agreement:** Full. Both flag the `safeReviewedItems` Set limitation.

### Fix 8 — CV-42 (P2): Star tap targets ≥ 44×44px
- **CC:** Change `py-1` → `min-h-[44px]` at line 557.
- **Codex:** Same — change row container to `min-h-[44px]`.
- **Agreement:** Full.

### Fix 9 — PM-164 (P3): Header gap — guest name button height
- **CC:** Change `min-h-[44px]` → `min-h-[32px]` at line 637 only. Caution: don't change save/cancel buttons on lines 631-632.
- **Codex:** Same — change only that button to `min-h-[32px]`.
- **Agreement:** Full.

### Fix 10 — PM-165 (P3): Remove pt-1 gap
- **CC:** Remove `pt-1` from `className="space-y-1 mt-1 pt-1"` at line 543.
- **Codex:** Same.
- **Agreement:** Full.

## CC Only (Codex missed)
None — all findings matched.

**CC provided additional implementation details not in Codex:**
1. **Nested button HTML issue (Fix 2):** CC flagged that `<button>` inside `<button>` is invalid HTML, recommending `<span role="button">` for the chip. Valid point — should be included in implementation.
2. **Auto-scroll implementation detail (Fix 2):** CC specified `data-first-unrated` attribute + `setTimeout` + `scrollIntoView`. Codex mentioned the behavior but not the implementation approach.
3. **Email submit function naming (Fix 6):** CC noted that `handleRewardEmailSubmit` doesn't exist as a standalone function — the logic is inline (lines 868-880). This is important for the implementer to know.
4. **Full JSX template for bottom sheet (Fix 6):** CC provided complete JSX for the email bottom sheet including `ratedCount` computation. Useful for implementation.
5. **`ratingSavingByItemId` error state caveat (Fix 4):** CC noted this depends on parent changes. Both flagged it but CC was more explicit.

## Codex Only (CC missed)
None — all findings matched.

**Codex noted a scope limitation:** Reference files (`ux-concepts/`, `references/`, `BUGS_MASTER.md`) were mentioned in the task but reading was limited to page-local files. This didn't affect findings quality.

## Disputes (disagree)
**None.** Both CC and Codex fully agree on all 10 fixes — priorities, approach, and locations.

Minor differences in detail level (CC more detailed) but no disagreements on what to change or how.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] Fix 1 — CV-05-v2: View mode** — Source: AGREED — Add `isRatingMode` state, restructure `renderBucketOrders` to show text indicators in view mode, stars in rating mode.
2. **[P1] Fix 2 — CV-05-chip: Rating chip counter + toggle** — Source: AGREED — Compute `unratedServedCount`, three chip states (`Оценить (N)` / `Готово` / `✓ Оценено`), remove `e.stopPropagation()` from Оценить, add micro-label, auto-scroll. Use `<span role="button">` for chip (CC recommendation).
3. **[P1] Fix 4 — CV-39: Autosave guard removal** — Source: AGREED — Replace `draftRating > 0 || hasReview` guard with `ratingSavingByItemId === true` check. Improve save state display. Note: error state depends on parent.
4. **[P2] Fix 3 — CV-37: Bonus subline** — Source: AGREED — Remove amber banner from inside expanded content, add muted subline below header button.
5. **[P2] Fix 5 — CV-36: `✓ Оценено` + auto-exit** — Source: AGREED — Add `✓` prefix, change i18n key, add useEffect for auto-exit.
6. **[P2] Fix 6 — CV-38: Email bottom sheet** — Source: AGREED — Remove inline email form, add `showPostRatingEmailSheet` state, add bottom sheet triggered by `Готово`. Extract inline email logic. Add `ratedCount` computation.
7. **[P2] Fix 7 — CV-40: Re-entry pre-filled stars** — Source: AGREED — Use `value={draftRating || existingRating || 0}`, remove readonly guard (covered by Fix 4). Note: `safeReviewedItems` is Set-only limitation.
8. **[P2] Fix 8 — CV-42: Star tap targets** — Source: AGREED — Change `py-1` → `min-h-[44px]` at line 557.
9. **[P3] Fix 9 — PM-164: Header gap** — Source: AGREED — Change `min-h-[44px]` → `min-h-[32px]` at line 637 (guest name button only).
10. **[P3] Fix 10 — PM-165: Remove pt-1 gap** — Source: AGREED — Remove `pt-1` from line 543 className.

## Implementation Notes for Merger
- **Both V8 and normal bucket paths** must be updated for Fixes 1, 2, 3, 5, 6 (easy to miss one path).
- **Nested button issue** (Fix 2): Change chip from `<button>` to `<span role="button" tabIndex={0}>` inside the header `<button>`.
- **Email submit logic** (Fix 6): No standalone `handleRewardEmailSubmit` exists — inline logic at lines 868-880 needs extraction or replication.
- **`safeReviewedItems`** (Fix 7): Is a Set of item IDs only — no rating values. Previous-session ratings won't pre-fill unless parent populates `safeDraftRatings`.
- **`ratingSavingByItemId` error state** (Fix 4): May only support boolean. Implement error UI but it depends on parent changes.

## Summary
- Agreed: 10 items
- CC only: 0 items (0 accepted, 0 rejected)
- Codex only: 0 items (0 accepted, 0 rejected)
- Disputes: 0 items
- Total fixes to apply: 10
- Confidence: HIGH (full consensus between CC and Codex on all fixes)
