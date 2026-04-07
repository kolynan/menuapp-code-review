# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-103001-5842

## Findings

1. [P2] PM-096: Tile-mode stepper buttons below 44px touch target — In `MenuView.jsx` lines 280 and 290, the tile-mode quantity stepper Minus and Plus buttons use `w-8 h-8` (32×32px), which is below the 44px WCAG 2.5.5 minimum touch target. The list-mode stepper already uses `min-w-[44px] min-h-[44px]` (lines 166, 174). The initial "+" add button is already `w-11 h-11` (line 268). FIX: Change `w-8 h-8` to `w-11 h-11` on both stepper buttons in `renderTileCard` (lines 280 and 290). Keep icon sizes `w-4 h-4` unchanged. Note: the parent container `h-11` (line 276) may also need adjustment since two `w-11 h-11` buttons + quantity text won't fit in `h-11` height — but since the container uses `flex items-center` and `h-11` only constrains height (not min-height), the buttons at `w-11 h-11` = 44px will match the container's 44px height exactly, so no container change needed.

2. [P3] PM-068: Hardcoded English aria-labels in CheckoutView — In `CheckoutView.jsx` line 60, `aria-label="Decrease"` and line 64, `aria-label="Increase"` are hardcoded English strings not using the i18n system. The `t` function is already available as a prop (line 8). FIX: Replace `aria-label="Decrease"` with `aria-label={t('cart.decrease', 'Уменьшить')}` and `aria-label="Increase"` with `aria-label={t('cart.increase', 'Увеличить')}`.

3. [P2] #84: Discount price text uses discount_color instead of primary_color — In `MenuView.jsx`, both the discount badge and the discounted price text use `partner?.discount_color || '#C92A2A'`. The badge (lines 108, 217) correctly uses discount_color to signal "sale". But the discounted price text (line 126 in list-mode, line 239 in tile-mode) also uses discount_color, creating visual confusion. The `primaryColor` variable is already declared at line 51: `const primaryColor = partner?.primary_color || '#1A1A1A'`. FIX: Change `style={{ color: partner?.discount_color || '#C92A2A' }}` to `style={{ color: primaryColor }}` on line 126 (list-mode discounted price) and line 239 (tile-mode discounted price). Do NOT change the badge background color (lines 108, 217). Do NOT change the crossed-out original price styling.

## Summary
Total: 3 findings (0 P0, 0 P1, 2 P2, 1 P3)

## ⛔ Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None. All three fixes have precise line numbers, before/after expectations, and anti-patterns clearly listed.
- Missing context: None. File paths, variable names (`primaryColor`), and existing patterns (list-mode stepper sizes) were all provided.
- Scope questions: None. Scope lock section is explicit about which files to modify and which to leave alone.
