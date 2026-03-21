# Merge Report — PublicMenu
Chain: publicmenu-260321-093745

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-093745
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-093745`

## Applied Fixes
1. [P0] Loyalty side effects before order items — Source: agreed — DONE (x.jsx, both hall+pickup paths)
2. [P1] Hall confirmation shows wrong total — Source: agreed — DONE (x.jsx, finalTotal)
3. [P1] Cart survives mode switches — Source: agreed — DONE (x.jsx, isDishEnabledForMode filter + toast)
4. [P2] Terracotta palette completion — Source: agreed — DONE (ModeTabs, MenuView, CheckoutView — 9+ indigo/green replacements)
5. [P2] Draft items need steppers — Source: CC — DONE (CartView.jsx, -/count/+ stepper)
6. [P2] Console.warn removed — Source: CC — DONE (x.jsx, 8 locations)
7. [P2] Touch targets below 44px — Source: agreed (Codex scope) — DONE (list add 40→44, checkout steppers 26→32, mode tabs py-1→py-2.5)
8. [P2] Checkout submit button terracotta — Source: agreed — DONE (CheckoutView, green→terracotta)

## Skipped — Requires Architectural Refactoring
These fixes require substantial restructuring of CartView.jsx (1291 lines) and/or x.jsx (3462 lines) that cannot be done safely via targeted edits:

- [P1] Drawer layout: 3 visit-state layouts (Fix #5 from plan) — Needs `drawerLayout` variable, conditional section ordering, collapsible bill. Registered as BUG-PM-056.
- [P1] CTA text: 7-state matrix (Fix #6) — Depends on drawer restructure. Registered as BUG-PM-057.
- [P1] Visual separation sent vs draft (Fix #7) — Partially addressed by stepper fix. Full differentiation needs layout restructure. Part of BUG-PM-056.
- [P1] "Заказать ещё" CTA for no-draft state (Fix #8) — Depends on drawer restructure. Part of BUG-PM-057.
- [P1] StickyCartBar 7-state visibility matrix (Fix #9) — Needs tableSession integration for paid/closed states. Registered as BUG-PM-058.
- [P1] StickyCartBar text modes (Fix #10) — Two text formats: draft mode and visit mode. Registered as BUG-PM-059.
- [P1] Pickup/delivery checkout drops loyalty (Fix #4 from plan) — CheckoutView doesn't accept loyalty props. Remains BUG-PM-052.
- [P2] Section rendering order (Fix #13) — Sections render in wrong order, but physically moving 500+ lines of JSX risks regression. Registered as BUG-PM-060.
- [P2] StickyCartBar count bump animation (Fix #15) — CSS/JS animation. Registered as BUG-PM-061.
- [P2] StickyCartBar enter animation (Fix #16) — CSS/JS animation. Part of BUG-PM-061.
- [P3] Localization fallback improvement (Fix #18) — Platform convention, low priority.
- [P3] CategoryChips indigo check (Fix #19) — Imported component, needs separate check. Registered as BUG-PM-062.

## Skipped — Unresolved Disputes (for Arman)
None. All items were agreed or resolved by Comparator.

## Git
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-093745
- Fix commit: 3b65762
- Docs commit: a99d6a8
- Files changed: 5 (x.jsx, CartView.jsx, CheckoutView.jsx, MenuView.jsx, ModeTabs.jsx) + BUGS.md

## Summary
- Applied: 8 fixes (1 P0, 2 P1, 5 P2)
- Skipped (architectural): 11 items (5 P1, 4 P2, 2 P3) — registered as BUG-PM-056 through BUG-PM-062
- Skipped (unresolved): 0 disputes
- Total from fix plan: 19 items
