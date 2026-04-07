# Merge Report — PublicMenu
Chain: publicmenu-260323-223605-98ba

## Applied Fixes
1. **[P2] Remove Math.round from discounted prices (MenuView.jsx)** — Source: AGREED (CC+Codex) — DONE. Replaced `Math.round(dish.price * (1 - partner.discount_percent / 100))` with `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))` in both renderListCard (line 103) and renderTileCard (line 283).

2. **[P2] Remove Math.round from discounted prices (x.jsx detail view)** — Source: AGREED (CC+Codex) — DONE. Same replacement in x.jsx line 3690 for `detailDish.price` discount calculation.

3. **[P2] Fix local formatPrice in OrderStatusScreen (x.jsx)** — Source: CC only (accepted by comparator) — DONE. Changed `num.toFixed(1)` to `parseFloat(num.toFixed(2)).toString()` at line 992. Now preserves 2 significant decimal places instead of truncating to 1.

4. **[P3] Move list-mode stepper to image overlay (MenuView.jsx)** — Source: AGREED (CC+Codex) — DONE. Removed stepper from text column (lines 124-145). Added stepper as absolute overlay (bottom-1 right-1) inside the image container, using the same pill/rounded-full pattern as tile-mode (PM-111). Card height no longer changes when dish is in cart.

5. **[P3] Enlarge ChevronDown + add tap target + drag handle bar (CartView.jsx)** — Source: AGREED (CC+Codex) + discussion-resolved — DONE. Changed ChevronDown from `w-7 h-7` to `w-9 h-9`. Wrapped in `<button>` with `min-w-[44px] min-h-[44px]` for proper tap target. Added `w-10 h-1 rounded-full bg-gray-300` drag handle bar in flex row with chevron. Layout changed to `flex items-center justify-center gap-3`.

## Skipped — Unresolved Disputes (for Arman)
None — all disputes resolved in discussion (Round 1).

## Skipped — Could Not Apply
1. **[P2] useCurrency formatPrice may truncate decimals internally** — Source: CC — SKIPPED. This is a B44 internal hook (`useCurrency`). Page-level code cannot fix internal rounding in the hook. Needs a B44 prompt to inspect and fix. Recorded for BUGS_MASTER.

## Skipped — Not in Scope
None.

## Git
- Pre-task commit: 23a43c0
- Commit: 687feac
- Files changed: 3 (MenuView.jsx, x.jsx, CartView.jsx)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description: None — all 3 fixes were clearly described with file locations, current vs expected behavior, and code patterns.
- Fixes where description was perfect (both writers agreed immediately): Fix 1 (Math.round), Fix 2 (list stepper overlay), Fix 3 (ChevronDown size)
- Recommendation for improving task descriptions: The formatPrice/useCurrency distinction (local vs hook) could have been clearer in the task — both writers spent time analyzing whether the hook itself needed changes. Explicitly stating "only fix Math.round on discounted prices, not the useCurrency hook" would have saved analysis time.

## Summary
- Applied: 5 fixes (2x P2 Math.round, 1x P2 formatPrice, 1x P3 stepper overlay, 1x P3 chevron)
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (useCurrency hook — needs B44 prompt)
- MUST-FIX not applied: 0 (all 3 MUST-FIX items applied successfully)
- Commit: 687feac
