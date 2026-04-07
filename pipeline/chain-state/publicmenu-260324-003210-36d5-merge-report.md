# Merge Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

## Applied Fixes

1. **[P3] PM-117 — Square photo** — Source: AGREED — DONE
   - x.jsx line 3667: `w-full h-48` → `w-full aspect-square` on detail card image container.

2. **[P2] PM-118a — Discount badge** — Source: AGREED — DONE
   - x.jsx detail card: added `-X%` pill badge with `partner.discount_color` background after price spans.

3. **[P2] PM-118b — Discount guard (item-level)** — Source: CODEX (discussion-confirmed) — DONE
   - Changed condition from `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` to `detailDish.discount_enabled === true && detailDish.original_price`.
   - Strikethrough now shows `detailDish.original_price` (not computed partner discount).
   - Badge percent: `Math.round((1 - detailDish.price / detailDish.original_price) * 100)`.
   - `partner?.discount_color` kept for badge background only.

4. **[P2] PM-118c — Layout reorder** — Source: AGREED — DONE
   - Reordered: Name → Price+discount+badge → Reviews → Description (was: Name → Description → Price → Reviews).
   - Description moved from `DialogDescription` inside `DialogHeader` to standalone `<p>` after reviews.

5. **[P3] PM-115 — Stepper center** — Source: AGREED — DONE
   - MenuView.jsx line 151: `absolute bottom-1 right-1 z-10` → `absolute inset-0 flex items-center justify-center z-10`.

## Skipped — Unresolved Disputes (for Arman)

None — all disputes resolved in discussion step.

## Skipped — Could Not Apply

None.

## Git
- Pre-task commit: b7dc1ac
- Commit: d60a9b3
- Files changed: 2 (x.jsx, MenuView.jsx)
- Lines: x.jsx 3779→3785 (+6), MenuView.jsx 384→384 (0)

## Prompt Feedback
- CC clarity score: 5/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description: Fix 2 (PM-118) — CC used partner-level discount fields (existing codebase pattern), Codex used item-level fields (task spec). The spec was actually clear ("discount_enabled === true" on item + "item.original_price"), but CC defaulted to codebase consistency. Minor ambiguity: spec said "reference MenuView.jsx for discount_color" which CC interpreted more broadly.
- Fixes where description was perfect (both writers agreed immediately): PM-117 (square photo), PM-115 (stepper center), PM-118 layout order.
- Recommendation: When task spec differs from existing codebase pattern, add explicit note like "NOTE: use item-level fields, NOT the partner-level pattern used elsewhere".

## Summary
- Applied: 5 fixes (across 3 bug IDs)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: d60a9b3
