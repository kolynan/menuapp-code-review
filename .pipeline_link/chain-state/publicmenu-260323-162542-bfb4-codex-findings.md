# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-162542-bfb4

## Findings
1. [P1] Non-strict discount guard remains in both menu card renderers — `pages/PublicMenu/MenuView.jsx:107`, `:126`, `:217`, and `:240` still gate the badge and struck-through original price with `partner?.discount_enabled && partner?.discount_percent > 0` instead of the required `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`. That means the fix is not fully applied to the scoped `renderListCard` and `renderTileCard` paths and can still render discount UI for truthy non-boolean values. FIX: in both renderers, use one shared guard such as `const hasDiscount = partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0;` and reuse it for both the badge and the discounted/strikethrough price branch.
2. [P3] Cart drawer header still uses the rejected “hide the handle” workaround — `pages/PublicMenu/x.jsx:3419` sets `[&>[data-vaul-handle-hitarea]]:hidden [&_[data-vaul-handle]]:hidden` on the cart `DrawerContent`, while the cart `DrawerHeader` at `:3420-3422` is `sr-only`. In this state the gray pill is explicitly hidden and there is no visible shared header container in `x.jsx` to align the chevron with it, so Fix 2’s required visible alignment cannot be satisfied. FIX: remove the handle-hiding classes from the cart drawer and add a visible header block in `x.jsx` above the scroll container that places the drag handle and chevron inside the same `flex items-center justify-center` row.

## Summary
Total: 2 findings (0 P0, 1 P1, 0 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
