# Comparison Report — PublicMenu
Chain: publicmenu-260323-103001-5842

## Agreed (both found)

### 1. [P2] PM-096: Tile-mode stepper buttons below 44px touch target
- **CC**: Change `w-8 h-8` to `w-11 h-11` on both Minus and Plus buttons in `renderTileCard` (lines ~280, ~290). Keep icon sizes `w-4 h-4`. Notes container `h-11` matches so no container change needed.
- **Codex**: Same fix — `w-8 h-8` → `w-11 h-11` on tile-mode stepper buttons only. Keep icons and list-mode unchanged.
- **Verdict**: Full agreement on location, fix, and scope. Apply as described.

### 2. [P3] PM-068: Hardcoded English aria-labels in CheckoutView
- **CC**: Replace `aria-label="Decrease"` → `aria-label={t('cart.decrease', 'Уменьшить')}` and `aria-label="Increase"` → `aria-label={t('cart.increase', 'Увеличить')}` at lines ~60, ~64.
- **Codex**: Identical fix, identical keys and fallback strings.
- **Verdict**: Full agreement. Apply as described.

### 3. [P2] #84: Discount price text color — discount_color → primaryColor
- **CC**: Change `style={{ color: partner?.discount_color || '#C92A2A' }}` to `style={{ color: primaryColor }}` on line ~126 (list-mode) and line ~239 (tile-mode). Keep badge background on discount_color. Keep crossed-out price unchanged.
- **Codex**: Identical fix, same two locations, same `primaryColor` variable.
- **Verdict**: Full agreement. Apply as described.

## CC Only (Codex missed)
None.

## Codex Only (CC missed)
None.

## Disputes (disagree)
None.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P2] PM-096** — Tile stepper touch targets — Source: **agreed** — In `MenuView.jsx` `renderTileCard()`, change `w-8 h-8` to `w-11 h-11` on both Minus and Plus stepper buttons (~lines 280, 290). Keep `w-4 h-4` icon sizes. Do not touch list-mode or initial add button.

2. **[P2] #84** — Discount price color separation — Source: **agreed** — In `MenuView.jsx`, change discounted price `<span>` from `style={{ color: partner?.discount_color || '#C92A2A' }}` to `style={{ color: primaryColor }}` at two locations (~line 126 list-mode, ~line 239 tile-mode). Keep badge background on `discount_color`. Keep crossed-out price styling.

3. **[P3] PM-068** — Aria-label i18n in CheckoutView — Source: **agreed** — In `CheckoutView.jsx`, replace `aria-label="Decrease"` with `aria-label={t('cart.decrease', 'Уменьшить')}` and `aria-label="Increase"` with `aria-label={t('cart.increase', 'Увеличить')}` (~lines 60, 64).

## Summary
- Agreed: 3 items
- CC only: 0 items
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 3
