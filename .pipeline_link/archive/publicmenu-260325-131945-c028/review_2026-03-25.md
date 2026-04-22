# Codex Writer Findings - PublicMenu Chain: publicmenu-260325-133629-74b9

## Findings
1. [P2] Discount math diverges between list and tile cards - `renderListCard` rounds the discounted value to 2 decimals at `pages/PublicMenu/MenuView.jsx:100-103`, but `renderTileCard` still uses `Math.round(dish.price * (1 - partner.discount_percent / 100))` at `pages/PublicMenu/MenuView.jsx:278-281`, which rounds to a whole unit. That means the same dish can show a different discounted price after switching layouts and does not match the required `Math.round(... * 100) / 100` formula from Fix 1. FIX: compute one shared discounted value with `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100` and use it in both `renderListCard` and `renderTileCard`, keeping the existing `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` guard.
2. [P3] The photo-edge overlay position is still not implemented in either mode - the list photo wrapper still has `overflow-hidden` at `pages/PublicMenu/MenuView.jsx:127`, and both control wrappers are still `absolute bottom-2 right-2` at `pages/PublicMenu/MenuView.jsx:151` and `pages/PublicMenu/MenuView.jsx:229`. That leaves the `+` button and stepper fully inside the photo instead of half-overlapping the edge as required by Fix 2. FIX: make the photo wrapper overflow visible and move the control wrapper in both list and tile cards to the same negative edge offset so `+` and the stepper sit on the photo edge.
3. [P3] The shared Glovo-style control chrome is incomplete - list mode still uses 36px controls (`w-9 h-9`, `h-9`) at `pages/PublicMenu/MenuView.jsx:156-178`, and neither floating `+` button adds the required white border/ring styling (`pages/PublicMenu/MenuView.jsx:156-160`, `pages/PublicMenu/MenuView.jsx:234-239`). This misses Fix 2's "same style in list and tile" requirement and leaves the list control below the stated 44px spec. FIX: standardize both modes on the same edge control styling: `w-11 h-11` tap targets, matching stepper wrapper sizing, and a white border/ring on the floating `+` button.

## Summary
Total: 3 findings (0 P0, 0 P1, 1 P2, 2 P3)

## Prompt Clarity (MANDATORY - do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): None.
