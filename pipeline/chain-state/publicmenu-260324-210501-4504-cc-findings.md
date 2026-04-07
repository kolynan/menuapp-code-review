# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-210501-4504

## Findings

### 1. [P2] PM-128: Table code drawer doesn't open — pushOverlay timing conflict (line 2749-2753)

**Description:** In `handleSubmitOrder`, `pushOverlay('tableConfirm')` (line 2751) calls `window.history.pushState()` synchronously BEFORE `setShowTableConfirmSheet(true)` (line 2752). The vaul Drawer library needs the React state to trigger component mount/animation before pushState fires. Since pushState fires first, the Drawer animation gets disrupted — the overlay darkens but the Bottom Sheet never appears.

**Confirmed:** Code at lines 2749-2753 shows:
```js
pushOverlay('tableConfirm');        // line 2751 — pushState FIRST (broken)
setShowTableConfirmSheet(true);     // line 2752 — state SECOND (too late)
```

Compare with `openHelpDrawer` (lines 1649-1652) which does it in the CORRECT order: `setIsHelpModalOpen(true)` first, then `pushOverlay('help')`. The tableConfirm path has them reversed.

**FIX:** Reverse the order: set state first, then use `requestAnimationFrame` to delay `pushOverlay` until after React renders the Drawer:
```js
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);     // open Drawer FIRST
  requestAnimationFrame(() => {
    pushOverlay('tableConfirm');      // push history AFTER Drawer mounts
  });
  return;
}
```

**Do NOT change:** The `onOpenChange` handler at lines 3531-3542 (popOverlay logic for close) — it's correct.

---

### 2. [P2] PM-129: Bell icon not visible on main menu — overly restrictive condition (line 3838)

**Description:** The bell icon condition at line 3838 requires `isTableVerified && currentTableId`:
```js
{view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart' && (
```
`isTableVerified` is `true` only after the user enters a table code (line 1616: `isHallMode && (!!resolvedTable?.id || verifiedByCode)`). Users need help BEFORE entering their table code (e.g., "where is my table code?"), so the bell should be visible as soon as the user is in hall mode.

**Confirmed:** The help drawer itself (lines 3657-3661) already handles the null `currentTable` case — it conditionally shows table info only when `currentTable` exists. So removing the table verification check from the bell visibility condition is safe.

**FIX:** Replace line 3838 condition with:
```js
{view === "menu" && isHallMode && drawerMode !== 'cart' && (
```
Use `isHallMode` (already defined at line 1559, derived from `orderMode === "hall"`) instead of the full chain. Remove `isTableVerified && currentTableId` — the bell should appear in hall mode regardless of table verification status.

**Do NOT change:** The `isHallMode` definition, bell icon styling, help drawer content, or submission logic.

---

### 3. [P3] PM-130: Help drawer missing close chevron (lines 3650-3722)

**Description:** The help drawer (opened via bell icon) has no ChevronDown close button. Users can only close it by swiping down or tapping "Отмена" button. Other drawers have a grey circle chevron in top-right:
- Table code drawer: lines 3546-3552 — has chevron with `absolute top-3 right-3 w-11 h-11 ... rounded-full bg-gray-200 text-gray-500 z-10`
- Detail card drawer: also has close button

**FIX:** Two changes needed:

**(a)** Add `relative` to DrawerContent className at line 3651 (needed for absolute positioning of chevron):
```jsx
<DrawerContent className="max-h-[85vh] rounded-t-2xl relative">
```

**(b)** Add ChevronDown button immediately after the `<DrawerContent>` opening tag (after line 3651), before `<DrawerHeader>`:
```jsx
<button
  onClick={closeHelpDrawer}
  className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
  aria-label={t('common.close', 'Закрыть')}
>
  <ChevronDown className="w-6 h-6" />
</button>
```

This reuses the existing `closeHelpDrawer` (line 1654) which already handles `popOverlay('help')` + state cleanup. Style is copied exactly from table code drawer chevron (lines 3546-3552).

**Do NOT change:** The closeHelpDrawer function, other drawer chevrons, or add a custom drag handle (PM-099 FROZEN).

---

## Summary
Total: 3 findings (0 P0, 0 P1, 2 P2, 1 P3)

All 3 findings correspond exactly to Fix 1, Fix 2, Fix 3 from the task. No additional issues reported per SCOPE RESTRICTION.

## Prompt Clarity

- **Overall clarity: 5/5**
- **Ambiguous Fix descriptions:** None — all 3 fixes had clear root cause analysis, exact line numbers, code snippets, and proposed patches.
- **Missing context:** None — task provided all necessary line references, the pushOverlay/popOverlay system explanation, and FROZEN UX list.
- **Scope questions:** None — scope lock was explicit and clear. The "Must NOT" sections for each fix were helpful for avoiding over-engineering.
