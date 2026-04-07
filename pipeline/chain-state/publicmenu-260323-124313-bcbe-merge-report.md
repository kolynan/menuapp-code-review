# Merge Report — PublicMenu
Chain: publicmenu-260323-124313-bcbe

## Applied Fixes
1. [P1] Introduce ref-based overlay stack (`overlayStackRef`, `pushOverlay`, `popOverlay`) — Source: agreed (CC 1.3 + Codex 3, CC scope) — DONE
2. [P1] Fix popstate handler to use stack-based close order — Source: agreed (CC 1.1 + Codex 1) — DONE. Replaced hardcoded if/else chain with stack pop + switch. `isPopStateClosingRef` guard prevents double-pop.
3. [P1] Add guarded `history.back()` to all programmatic sheet closes — Source: agreed (CC 1.2 + Codex 2) — DONE. 6 locations updated:
   - Line ~2143: `popOverlay('tableConfirm')` before `setShowTableConfirmSheet(false)` after verification
   - Line ~3494: table confirm Drawer `onOpenChange` — added `popOverlay('tableConfirm')`
   - Line ~3405: cart Drawer `onOpenChange` — added `popOverlay('cart')`
   - Line ~1490: `showConfirmation` callback — added `popOverlay('cart')`
   - Line ~3472: CartView `onClose` — added `popOverlay('cart')`
   - Line ~3673: StickyCartBar toggle off — added `popOverlay('cart')`
4. [P1] Replace raw `pushState` calls with `pushOverlay()` — Source: agreed (CC 1.3) — DONE. 3 locations:
   - Line ~2710: `pushOverlay('tableConfirm')` (was `history.pushState({ overlay: 'tableConfirm' })`)
   - Line ~3383: `pushOverlay('cart')` (was `history.pushState({ overlay: 'cart' })`)
   - Line ~3670: `pushOverlay('cart')` in StickyCartBar toggle on

## Skipped — Unresolved Disputes (for Arman)
None. Single dispute (scope: sheets-only vs all-views) was resolved in Round 1 — both CC and Codex agreed on narrow scope (overlay sheets only).

## Skipped — Could Not Apply
None.

## Git
- Commit: 4da1dc4
- Files changed: 2 (x.jsx, BUGS.md)
- Lines: 3672 → 3706 (+34 lines)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 4/5
- Fixes where writers diverged due to unclear description: Dispute 1 (scope of overlay stack) — the task description listed a priority stack including checkout/confirmation/orderstatus alongside overlay sheets, which made Codex interpret it as all-views. The distinction between "overlay sheets" and "view transitions" could have been clearer in the task.
- Fixes where description was perfect (both writers agreed immediately): Core bug description (priority order inverted in popstate handler), programmatic close paths missing history.back().
- Recommendation for improving task descriptions: When listing a "priority stack" of UI layers, explicitly mark which are overlay sheets (that stack on top of each other) and which are full view transitions (that replace the page). This prevents scope ambiguity.

## Summary
- Applied: 4 fixes (all P1)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes (P2 items CC 1.4 and 1.5 were correctly subsumed by the 4 core fixes)
- MUST-FIX not applied: 0
- Commit: 4da1dc4
