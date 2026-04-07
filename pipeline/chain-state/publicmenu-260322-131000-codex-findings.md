# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-131000

## Findings
1. [P2] Mobile grid setting is still ignored on phones — `MenuView.jsx:15-18` only supports `menu_grid_mobile` values `1` and `2`, and `MenuView.jsx:294` hardcodes `grid-cols-2` whenever `isMobile` is true. Partners configured for `1` or `3` columns still render two columns. FIX: add `3: 'grid-cols-3'` to `MOBILE_GRID`, keep the fallback at `2`, and use the computed mobile grid class in the render branch instead of the hardcoded `grid-cols-2`.
2. [P2] Add-to-cart feedback regressed — `MenuView.jsx:113` and `MenuView.jsx:173` call `addToCart(dish)` directly, but this component has no toast/animation state, timer, or UI path for confirmation. `BUGS.md:332-336` says AC-09 was already fixed, so the current file has regressed. FIX: add a local `handleAddToCart(dish)` wrapper that calls `addToCart`, shows one non-stacking localized toast/animation, auto-dismisses after about `1.5s`, and clears/resets its timer on repeat taps and unmount.
3. [P2] Tile CTA is anchored to the photo, not the dish card — `MenuView.jsx:152-170` positions the `+`/stepper inside the image wrapper. On cards with longer text, the control sits around the middle of the full card instead of the locked bottom-right corner of the card. FIX: make the full card `relative`, anchor the CTA container to the card’s bottom-right corner, and reserve bottom padding so the floating control does not overlap content.
4. [P2] Discount badge/original-price UI is missing, so `partner.discount_color` cannot be applied — both card variants only render one price (`MenuView.jsx:95-97`, `MenuView.jsx:218-221`). There is no `-X%` badge or struck-through old price in this component, even though `README.md:88` documents discount badges on dish cards. FIX: restore the discount badge and original-price markup in `MenuView.jsx`, and style the badge with `backgroundColor: partner?.discount_color || '#C92A2A'` plus white text.
5. [P3] List-mode icon buttons still miss accessible/i18n labels — the icon-only add/remove controls in `MenuView.jsx:112-135` have no `aria-label`, while tile mode does. `BUGS.md:122-123` already flags missing aria labels in MenuView, and this remains a mobile accessibility issue. FIX: add localized `aria-label` values such as `t('menu.add')` / `t('menu.remove')` to all icon-only list-mode controls.

## Summary
Total: 5 findings (0 P0, 0 P1, 4 P2, 1 P3)

## Prompt Clarity
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix #4 referenced `CartView.jsx` even though the top-level instruction said to inspect only 3 files; the discount data fields needed to render the badge were not named inside the allowed files.
- Missing context (what info would have helped): Whether `CartView.jsx` was intentionally out of scope; the exact dish fields for original price / discount percent.
- Scope questions (anything you weren't sure if it's in scope): The prompt says `pages/PublicMenu/*.jsx` but also says "ONLY these 3 files"; this folder contains multiple `.jsx` files, so I constrained the review to `MenuView.jsx`, `README.md`, and `BUGS.md`.
