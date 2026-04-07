# Codex Writer Findings — PublicMenu Chain: publicmenu-260327-065807-c24f
## Findings
1. [P3] PM-148 still present in `ModeTabs.jsx` — `pages/PublicMenu/ModeTabs.jsx:55-65` still renders the green verified-table banner when `isHallMode && isTableVerified && currentTableId` is truthy, so the menu screen will continue showing `Стол X подтверждён` after table confirmation. FIX: delete the entire verified badge block, including the comment and wrapper at lines 55-65, and leave the amber invalid-code warning block at lines 67+ unchanged.
2. [P3] PM-149 still present in `CartView.jsx` — `pages/PublicMenu/CartView.jsx:307-309` still builds `guestDisplay` as ``${guestBaseName} #${effectiveGuestCode}``, and `pages/PublicMenu/CartView.jsx:578` renders that value in the cart header, so guests will keep seeing the internal `#N` suffix. FIX: change `guestDisplay` to `const guestDisplay = guestBaseName;` and keep `effectiveGuestCode` itself intact for backend/state usage.

## Summary
Total: 2 findings (0 P0, 0 P1, 0 P2, 2 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
