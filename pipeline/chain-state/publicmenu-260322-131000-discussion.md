# Discussion Report — PublicMenu
Chain: publicmenu-260322-131000

## Result
No unresolved disputes found. The Comparator identified 2 minor interpretation differences but resolved both inline with clear reasoning:

1. **Fix 1 — Button position interpretation:** Resolved in favor of Codex. Task explicitly says "bottom-right corner of each dish card" = card level, not image level. LOCK-PM-001 confirms.
2. **Fix 4 — Scope of CartView changes:** Resolved in favor of CC's broader analysis. CartView is a TARGET FILE per task spec; implementer should check it for colored discount elements.

All 4 agreed items + 1 accepted CC-only item remain unchanged. No rounds of CC↔Codex discussion needed.

## Disputes Discussed
Total: 0 unresolved disputes from Comparator (2 were pre-resolved by Comparator)

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | PM-077 button position (image vs card) | 0 | pre-resolved by Comparator | Codex |
| 2 | CartView discount scope | 0 | pre-resolved by Comparator | CC |

## Updated Fix Plan
No changes to the Comparator's Final Fix Plan. All items carry forward as-is:

1. **[P2] PM-072: Dynamic grid columns** — Source: AGREED — Add `3: "grid-cols-3"` to `MOBILE_GRID`. Replace hardcoded `grid-cols-2` on mobile path (line 294) with `MOBILE_GRID[mobileCols]`.

2. **[P2] PM-077: Move "+" to card bottom-right** — Source: AGREED (dispute resolved → card level) — Make Card `relative`. Move CTA block from image container to card-level `absolute bottom-3 right-3`. Add bottom padding to CardContent to prevent overlap with price.

3. **[P2] AC-09: Toast on add to cart** — Source: AGREED (+ CC-only P3 merged) — Add `handleAddToCart` wrapper with local toast state. Use `tr('menu.added_to_cart', 'Добавлено')`. Non-stacking, 1.5s auto-dismiss, cleanup on unmount. Fixed position above StickyCartBar.

4. **[P2] #84: Discount badges with partner.discount_color** — Source: AGREED — Add discount badge to tile and list cards (top-left of image). Use `partner?.discount_color || '#C92A2A'` for background. White text. Check dish entity for correct field name. Also check CartView for any colored discount elements.

## Unresolved (for Arman)
None. All items resolved.
