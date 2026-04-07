# Comparison Report — PublicMenu
Chain: publicmenu-260324-210501-4504

## Agreed (both found)

### 1. [P2] PM-128: Table code drawer doesn't open — pushOverlay timing conflict (lines 2749-2753)
- **CC:** Confirmed `pushOverlay('tableConfirm')` before `setShowTableConfirmSheet(true)` disrupts vaul Drawer animation. Noted that `openHelpDrawer` (lines 1649-1652) does it in the correct order as evidence. Fix: reverse order, wrap `pushOverlay` in `requestAnimationFrame`.
- **Codex:** Same finding — `pushOverlay` runs `pushState` before Drawer mounts. Same fix: `setShowTableConfirmSheet(true)` first, defer `pushOverlay` with `requestAnimationFrame`.
- **Verdict:** FULL AGREEMENT. Both propose identical fix with `requestAnimationFrame`. CC's cross-reference to `openHelpDrawer` as correct-order evidence is a nice validation.

### 2. [P2] PM-129: Bell icon not visible on main menu — overly restrictive condition (line 3838)
- **CC:** Confirmed condition requires `isTableVerified && currentTableId` which is too restrictive. Fix: replace with `view === "menu" && isHallMode && drawerMode !== 'cart'`. Notes help drawer already handles null `currentTable`.
- **Codex:** Same finding and same fix. Replace condition to remove `isTableVerified` / `currentTableId` requirements.
- **Verdict:** FULL AGREEMENT. Identical condition replacement proposed by both.

### 3. [P3] PM-130: Help drawer missing close chevron (lines 3650-3722)
- **CC:** Two changes: (a) add `relative` to DrawerContent className at line 3651, (b) add ChevronDown button after DrawerContent opening tag, using `closeHelpDrawer` and matching table code drawer style exactly (lines 3546-3552).
- **Codex:** Same two changes: add `relative` to DrawerContent, insert gray circular chevron button wired to `closeHelpDrawer`.
- **Verdict:** FULL AGREEMENT. Both specify the same two-part fix with identical styling.

## CC Only (Codex missed)
None.

## Codex Only (CC missed)
None.

## Disputes (disagree)
None.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] PM-128 — Table code drawer timing** — Source: AGREED — In `handleSubmitOrder` (lines 2749-2753), reverse order: `setShowTableConfirmSheet(true)` first, then `requestAnimationFrame(() => pushOverlay('tableConfirm'))`. Do NOT change the `onOpenChange` close handler.

2. **[P2] PM-129 — Bell icon visibility** — Source: AGREED — At line 3838, replace condition with `{view === "menu" && isHallMode && drawerMode !== 'cart' && (`. Remove `isTableVerified && currentTableId` requirements.

3. **[P3] PM-130 — Help drawer chevron** — Source: AGREED — (a) Add `relative` to DrawerContent className at line 3651. (b) Add ChevronDown button (`absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10`) after DrawerContent opening tag, using `closeHelpDrawer` onClick and `t('common.close', 'Закрыть')` aria-label.

## Summary
- Agreed: 3 items
- CC only: 0 items
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 3

## Prompt Clarity Notes
- CC rated clarity 5/5, Codex rated 4/5
- Codex noted minor friction: task references `BUGS_MASTER.md` and `ACCEPTANCE_CRITERIA_publicmenu.md` but scope restriction limits reading. Inline fix descriptions were sufficient.
- Both confirmed no ambiguity in fix descriptions.
