# Merge Report — PublicMenu
Chain: publicmenu-260320-173330
Task: Batch 1 — Apply Terracotta Primary + Semantic Palette

## Version Tag
- Pre-fix tag: `PublicMenu-pre-publicmenu-260320-173330`
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260320-173330`

## Applied Fixes

### x.jsx (11 fixes)
1. [P1] Loader spinner indigo→terracotta (line 1013) — Source: CC only — DONE
2. [P1] Track Order button indigo→terracotta (line 759) — Source: agreed — DONE
3. [P1] Phone icon indigo→terracotta (line 1145) — Source: CC only — DONE
4. [P1] Phone number text indigo→terracotta (line 1146) — Source: CC only — DONE
5. [P1] Main page loader indigo→terracotta (line 2983) — Source: agreed — DONE
6. [P2] OrderConfirmation bg-white→warm surface (line 618) — Source: CC only — DONE
7. [P2] OrderStatus loading bg-white→warm (line 1011) — Source: CC only — DONE
8. [P2] OrderStatus invalid-token bg-white→warm (line 993) — Source: CC only — DONE
9. [P2] OrderStatus error bg-white→warm (line 1022) — Source: CC only — DONE
10. [P2] OrderStatus expired bg-white→warm (line 1040) — Source: CC only — DONE
11. [P2] Confirmation "Back to menu" button→terracotta (line 740-744) — Source: CC only — DONE

### CartView.jsx (6 fixes)
12. [P1] Guest name edit link indigo→terracotta (line 469) — Source: agreed — DONE
13. [P1] Guest name edit link 2nd→terracotta (line 506) — Source: agreed — DONE
14. [P1] Radio button accents indigo→terracotta (lines 850, 860) — Source: CC only — DONE
15. [P1] Loyalty info box bg-indigo-50→primary light #F5E6E0 (line 940) — Source: agreed — DONE
16. [P1] Submit CTA green→terracotta #B5543A + conditional style (line 1254) — Source: agreed — DONE

## Skipped — Unresolved Disputes (for Arman)
- **D2:** Should status "new"/"accepted" change from blue to amber? STYLE_GUIDE says sent=amber, but task says "do NOT change status colors." Needs Arman decision.

## Skipped — Out of Scope (deferred to BUGS_MASTER)
- **D1:** MenuView.jsx, CheckoutView.jsx, ModeTabs.jsx have indigo colors → Batch 2
- **Codex #1:** Order creation race condition (P0) — logic bug, not color
- **Codex #3:** Cart survives mode switches with invalid dishes (P1) — logic bug
- **Codex #4:** Pickup/delivery checkout drops loyalty UI (P1) — feature gap
- **Codex #5:** Hall confirmation shows wrong total (P1) — logic bug
- **Codex #7-9:** UX issues (table block, scroll, backdrop) — layout/UX
- **Codex #10:** i18n leaks (toast fallback, email placeholder) — i18n

## Integrity Checks
- x.jsx: 3444→3446 lines (+2, from new style attribute lines) ✅
- CartView.jsx: 1276→1279 lines (+3, from new style attribute lines) ✅
- Zero `indigo` references remaining in both files ✅
- Function count unchanged (106 in x.jsx, 28 in CartView.jsx) ✅

## Git
- Pre-fix tag: `PublicMenu-pre-publicmenu-260320-173330`
- Commit: a829e02
- Files changed: 2 (x.jsx, CartView.jsx)
- Insertions: 23, Deletions: 18

## Summary
- **Applied:** 17 fixes (11 in x.jsx, 6 in CartView.jsx)
- **Skipped (unresolved):** 1 dispute (D2 — status color semantics)
- **Skipped (out of scope):** 8 items (logic bugs + extra files for Batch 2)
- **Commit:** a829e02
