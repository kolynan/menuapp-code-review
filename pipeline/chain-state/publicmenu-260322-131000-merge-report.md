# Merge Report — PublicMenu
Chain: publicmenu-260322-131000

## Applied Fixes
1. [P2] PM-072: Dynamic grid columns from partner.menu_grid_mobile — Source: agreed — DONE
   - Added `3: "grid-cols-3"` to MOBILE_GRID mapping
   - Replaced hardcoded `grid-cols-2` with `MOBILE_GRID[mobileCols] || 'grid-cols-2'` on mobile path (line 353)
2. [P2] PM-077: Move "+" button to card bottom-right (LOCK-PM-001) — Source: agreed (dispute pre-resolved by Comparator) — DONE
   - Made Card `relative`
   - Moved CTA from image container to card-level `absolute bottom-3 right-3 z-10`
   - Added `pb-14` to CardContent to prevent overlap with price text
3. [P2] AC-09: Toast feedback on add to cart — Source: agreed (+ CC-only i18n merged) — DONE
   - Added `handleAddToCart` wrapper with local toast state
   - Non-stacking: clears previous timer on re-tap
   - 1.5s auto-dismiss, cleanup on unmount
   - Toast: `fixed bottom-20` above StickyCartBar, `bg-slate-800 text-white text-sm rounded-lg`
   - Uses `t('menu.added_to_cart') || 'Добавлено'` for i18n with fallback
4. [P2] #84: Discount badges with partner.discount_color — Source: agreed — DONE
   - Added discount badge to both tile and list card image areas (top-left)
   - Style: `backgroundColor: partner?.discount_color || '#C92A2A'`, white text
   - Condition: `partner?.discount_enabled && partner?.discount_percent > 0`
   - Added discounted price display: bold discounted price + struck-through original price
   - CartView checked: discount shown as text only (green/amber info), no colored badge — no changes needed

## Skipped — Unresolved Disputes (for Arman)
None. All disputes pre-resolved by Comparator.

## Skipped — Could Not Apply
- [P3] Codex Finding 6 (aria-label on list-mode icon buttons) — Out of scope per SCOPE LOCK. Already in BUGS.md.

## Git
- Commit: a4f4f4f (fixes) + 0cc046e (BUGS.md)
- Files changed: 2 (MenuView.jsx, BUGS.md)
- Lines: 307 → 373 (+66 lines in MenuView.jsx)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description:
  - PM-077: CC hedged on image-level vs card-level, but task description was actually clear ("bottom-right corner of each dish card"). Minor ambiguity.
  - #84: Both flagged uncertainty about dish entity field names. Task could have specified that discount is partner-level (`partner.discount_percent`), not per-dish.
- Fixes where description was perfect (both writers agreed immediately):
  - PM-072: Clear, with code examples. Both writers proposed identical fix.
  - AC-09: Clear requirements (toast, 1.5s, non-blocking). Both converged on same approach.
- Recommendation for improving task descriptions:
  - For #84: Specify exact entity field names and conditions (e.g., "show badge when `partner.discount_enabled && partner.discount_percent > 0`")
  - For PM-077: "card-level" was clear enough but adding "not image-level" would prevent hedging

## Summary
- Applied: 4 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (out of scope)
- MUST-FIX not applied: 0
- Commit: a4f4f4f + 0cc046e
