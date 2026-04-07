# Comparison Report — PublicMenu
Chain: publicmenu-260324-205343-7865

## Agreed (both found)

### 1. [P2] PM-128: Table code drawer pushOverlay timing conflict
- **CC:** `requestAnimationFrame(() => pushOverlay('tableConfirm'))` after `setShowTableConfirmSheet(true)`. Swap order + defer pushOverlay.
- **Codex:** Same diagnosis — pushOverlay synchronous before setState causes vaul animation failure. Suggests `requestAnimationFrame`/short timeout or `onOpenChange(open===true)` or `useEffect` watching `showTableConfirmSheet`.
- **Consensus:** Both agree on root cause (synchronous pushState before Drawer open) and solution approach (defer pushOverlay). CC's `requestAnimationFrame` wrap is the simplest and most precise. **Use CC's patch.**

### 2. [P2] PM-129: Bell icon visibility — too restrictive condition
- **CC:** Change `view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart'` → `view === "menu" && isHallMode && drawerMode !== 'cart'`. Drops `isTableVerified`, `currentTableId`, and redundant `orderMode === "hall"`.
- **Codex:** Same fix — switch guard to `isHallMode` without `isTableVerified` dependency.
- **Consensus:** Identical fix. **Use CC's patch** (includes additional detail about HelpFab at line 3639 being out of scope, and notes that help drawer submit already has `disabled={!currentTableId}` safety).

### 3. [P3] PM-130: Help drawer missing chevron close button
- **CC:** Insert chevron button (same style as table code drawer: `w-11 h-11 rounded-full bg-gray-200 text-gray-500`) as first child of `DrawerContent`. Also notes need to add `relative` to `DrawerContent` className for `absolute` positioning to work.
- **Codex:** Same fix — copy table-confirm drawer chevron pattern, wire to `closeHelpDrawer`.
- **Consensus:** Both agree. CC's patch is more complete — includes the `relative` className addition to `DrawerContent`. **Use CC's patch.**

## CC Only (Codex missed)

### 1. `relative` className on help drawer DrawerContent
- CC noted that `DrawerContent` at line 3651 lacks `relative` class, needed for `absolute` positioning of the chevron button. Table code drawer's `DrawerContent` has `relative`.
- Codex did not mention this detail.
- **Verdict: ACCEPTED** — valid observation, without `relative` the `absolute top-3 right-3` positioning won't anchor correctly.

## Codex Only (CC missed)

None. Codex found the same 3 issues with no additional findings.

## Disputes (disagree)

None. Both reviewers agree on all 3 fixes with compatible approaches.

### Minor difference on Fix 1 approach:
- CC: specifically recommends `requestAnimationFrame` (one approach).
- Codex: lists 3 options (rAF, short timeout, `onOpenChange`/`useEffect`).
- Not a dispute — CC's `requestAnimationFrame` is the simplest and both include it as an option.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P2] PM-128** — Table code drawer timing — Source: **agreed** — Swap order at lines 2749-2753: call `setShowTableConfirmSheet(true)` first, then `requestAnimationFrame(() => pushOverlay('tableConfirm'))`. Keep existing close/popstate logic unchanged.

2. **[P2] PM-129** — Bell icon visibility — Source: **agreed** — At line 3838, change condition from `view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart'` to `view === "menu" && isHallMode && drawerMode !== 'cart'`.

3. **[P3] PM-130** — Help drawer chevron — Source: **agreed** — (a) Add `relative` to `DrawerContent` className at line 3651. (b) Insert chevron button (`w-11 h-11 rounded-full bg-gray-200 text-gray-500`, onClick=`closeHelpDrawer`) as first child inside `DrawerContent`, before `DrawerHeader`.

## Summary
- Agreed: 3 items
- CC only: 1 item (1 accepted — `relative` className detail)
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 3
