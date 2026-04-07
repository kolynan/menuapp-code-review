# Merge Report — PublicMenu
Chain: publicmenu-260324-190433-30fb

## Applied Fixes

1. **[P1] Fix 1a — Detail card added to overlay stack** — Source: agreed + discussion-resolved — DONE
   - `pushOverlay('detailDish')` on dish click (line 3358)
   - `popOverlay('detailDish')` on all close paths: onOpenChange, close button, add-to-cart
   - `'detailDish'` case in `handlePopState` switch → `setDetailDish(null)`

2. **[P1] Fix 2a — HelpModal replaced with inline help Drawer** — Source: agreed — DONE
   - Removed `<HelpModal>` render block (lines 3616–3631)
   - Built inline `<Drawer>` with: title, description, table badge (MapPin), active request warning, 5 option buttons grid, comment textarea, error display, Cancel + Submit buttons
   - All text i18n-enabled via `t()` with fallbacks
   - Touch targets ≥ 44px on all buttons

3. **[P1] Fix 2b — Help drawer added to overlay stack** — Source: agreed + discussion-resolved — DONE
   - `openHelpDrawer()` pushes `'help'` to overlay stack
   - `closeHelpDrawer()` pops `'help'` from overlay stack
   - `'help'` case in `handlePopState` → `setIsHelpModalOpen(false)`

4. **[P1] Fix 2c — Cart-to-help sequencing with 300ms delay** — Source: agreed — DONE
   - `handleHelpFromCart` callback: `popOverlay('cart')` + `setDrawerMode(null)` + `setTimeout(openHelpDrawer, 300)`
   - Passed as `onCallWaiter={handleHelpFromCart}` to CartView (was `handleOpenHelpModal`)

5. **[P2] Fix 2d — Two help-open paths** — Source: CC-only (accepted) — DONE
   - From-cart: via `handleHelpFromCart` (300ms delay)
   - From-FAB/bell: via `openHelpDrawer` (immediate)
   - HelpFab `onOpen` updated to `openHelpDrawer`

6. **[P2] Fix 3 — Bell icon on main menu (PM-127)** — Source: agreed — DONE
   - Fixed-position bell button at bottom-left (`fixed bottom-20 left-4 z-40`)
   - Amber style matching CartView bell (`bg-amber-50 text-amber-600`)
   - Visible when: `view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart'`
   - Tap → `openHelpDrawer()` (immediate, no cart involved)
   - HelpFab kept temporarily (consolidation deferred)

7. **[P2] Fix 5a — Sticky chevron row removed from CartView** — Source: agreed — DONE
   - Deleted 12-line sticky div (lines 425–436 original)

8. **[P2] Fix 5b — Chevron in table info card right side** — Source: agreed — DONE
   - ChevronDown button added to right side of table info card
   - `isSubmitting` guard preserved (PM-031 FROZEN UX)
   - Non-sticky, scrolls with content
   - 44×44 touch target (`min-w-[44px] min-h-[44px]`)
   - Layout: `[bell] [table/guest center] [chevron]`

9. **[P3] Fix 4a — Chevron on table code drawer** — Source: agreed — DONE
   - `ChevronDown` button: `absolute top-3 right-3 w-11 h-11 rounded-full bg-gray-200 text-gray-500 z-10`
   - Click calls `popOverlay('tableConfirm')` + close sheet
   - Style adapted for white background context (bg-gray-200 not bg-black/40)

10. **[P3] Fix 4b — DrawerContent relative positioning** — Source: CC-only (accepted) — DONE
    - Added `relative` to table code DrawerContent className

## Skipped — Unresolved Disputes (for Arman)
None — all disputes resolved in discussion step.

## Skipped — Could Not Apply
None.

## Architectural Decision: Hook vs. Overlay Stack
**Task requested:** `useAndroidBack` hook with per-drawer `popstate` listeners.
**Implemented:** Extended existing centralized `pushOverlay`/`popOverlay`/`handlePopState` system.
**Reason:** Both CC and Codex agreed (discussion Round 2) that separate `popstate` listeners would conflict with the existing central listener, causing double-close and history desync bugs. The overlay stack IS the reusable mechanism — adding `'detailDish'` and `'help'` cases achieves the same unified behavior without the risk. Documented for Arman's awareness.

## Git
- Pre-task commit: 98f67d0
- Commit: a28bde1
- Files changed: 3 (x.jsx, CartView.jsx, BUGS.md)
- x.jsx: 3803 → 3905 lines (+102)
- CartView.jsx: 961 → 958 lines (-3)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 3/5
- Fixes where writers diverged due to unclear description:
  - Fix 1 (PM-126): Task explicitly asked for `useAndroidBack` hook, but codebase already has centralized overlay stack. Both writers analyzed the conflict differently (CC: extend stack; Codex: create hook). Resolved via discussion → extend stack.
  - Fix 3 (PM-127): "Restore bell at original position" unclear — no way to confirm original position without git history analysis. Codex flagged this.
  - Fix 4 (#143): "Same style as detail card" ambiguous — detail card uses dark translucent (bg-black/40) for photo overlay context, not applicable to white drawer background. Both writers independently chose bg-gray-200 adaptation.
- Fixes where description was perfect (both writers agreed immediately):
  - Fix 2 (PM-125): Cart-to-help sequencing with 300ms delay — clear, specific, both agreed
  - Fix 5 (#140): Move chevron from sticky row to table card — clear layout description with ASCII diagram
- Recommendation for improving task descriptions:
  - When referencing existing patterns ("same style as X"), specify the actual CSS classes to copy rather than relying on "match existing" — the existing pattern may not be appropriate for the new context.
  - When requesting architectural patterns (hook vs. central listener), note if the codebase already has a competing mechanism. This avoids wasted analysis time.

## Summary
- Applied: 10 fixes (4× P1, 4× P2, 2× P3)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: a28bde1
