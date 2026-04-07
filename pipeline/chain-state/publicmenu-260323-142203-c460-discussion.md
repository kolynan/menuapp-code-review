# Discussion Report — PublicMenu
Chain: publicmenu-260323-142203-c460

## Result
No disputes found. All items agreed or resolved by Comparator. Skipping discussion.

## Summary from Comparator
- **Agreed:** 2 items (PM-107, PM-103 — with Codex's timer+text improvements merged)
- **CC only accepted:** 3 real fixes (PM-102, PM-108, PM-104) + 3 no-ops (PM-096, PM-discount-check, #84b)
- **Codex only:** 0 new items (2 detail improvements merged into PM-103)
- **Disputes:** 0
- **Total fixes to apply:** 5 (1 P1 + 3 P2 + 1 P3)

## Updated Fix Plan
No changes needed — Comparator's Final Fix Plan stands as-is:

1. **[P1] PM-107 — Programmatic BS close cascade** — Source: AGREED — Add `isProgrammaticCloseRef` flag to `x.jsx`. Set before `history.back()` in `popOverlay`, short-circuit in `handlePopState`.
2. **[P2] PM-103 — Toast thin line on Android** — Source: AGREED (merged) — In `MenuView.jsx`: z-index `z-[200]`, bottom-24, timer 2000ms, text `'Добавлено в корзину'`, pointer-events-none.
3. **[P2] PM-102 — Dish detail button text invisible** — Source: CC only (accepted) — In `x.jsx`: inline style `color: '#FFFFFF'` + `min-h-[44px]`.
4. **[P2] PM-108 — "+" button clipped in list-mode** — Source: CC only (accepted) — In `MenuView.jsx`: add `pr-1` to button container in `renderListCard`.
5. **[P3] PM-104 — Cart drawer handle artifact** — Source: CC only (accepted) — In `x.jsx`: `[&_[data-vaul-handle]]:hidden` + remove unused `ChevronDown` import.

## Unresolved (for Arman)
None.
