# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-205343-7865

## Findings

### 1. [P2] PM-128: Table code drawer does not open — pushOverlay timing conflict

**Description:** At line 2751, `pushOverlay('tableConfirm')` calls `window.history.pushState(...)` synchronously BEFORE `setShowTableConfirmSheet(true)` at line 2752. When the cart Drawer is already open, this pushState call interferes with vaul's animation of the second Drawer — the overlay darkens but DrawerContent never slides up.

**Evidence:** The `openHelpDrawer` function (line 1649-1652) does `setIsHelpModalOpen(true)` then `pushOverlay('help')` — same order issue, but help opens from a non-drawer context so it works. For `tableConfirm`, it opens ON TOP of the already-open cart Drawer, making timing critical.

**FIX:** Swap the order: call `setShowTableConfirmSheet(true)` FIRST, then defer `pushOverlay('tableConfirm')` to the next animation frame so vaul initiates the Drawer open animation before pushState fires.

At lines 2749-2753, change:
```jsx
// BEFORE (broken):
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  pushOverlay('tableConfirm');
  setShowTableConfirmSheet(true);
  return;
}

// AFTER (fixed):
if (orderMode === "hall" && !isTableVerified) {
  pendingSubmitRef.current = true;
  setShowTableConfirmSheet(true);
  requestAnimationFrame(() => {
    pushOverlay('tableConfirm');
  });
  return;
}
```

**Why `requestAnimationFrame`:** It allows React to process the state update and vaul to begin its open animation before pushState fires. `setTimeout(..., 50)` also works but `requestAnimationFrame` is more precise — it fires at the next paint frame.

**Verification:**
- Open cart → tap "Отправить официанту" (without verified table) → table code drawer slides up on top of cart ✓
- Enter code → verify → submit works ✓
- Android Back while table code drawer is open → drawer closes, cart remains ✓ (popstate handler at line 2416-2418 unchanged)

---

### 2. [P2] PM-129: Bell icon only visible when table is verified — should show in all hall mode

**Description:** At line 3838, the bell icon condition is:
```jsx
view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart'
```
This requires `isTableVerified` (which needs `resolvedTable?.id || verifiedByCode`, line 1616) AND `currentTableId`. The bell is invisible until the user verifies their table code. But a user at a table might want to call the waiter BEFORE entering the table code.

**Also:** `orderMode === "hall"` is redundant with `isTableVerified` (which already checks `isHallMode`), but the real issue is requiring verification.

**Note about HelpFab (line 3639):** There's also a `HelpFab` component with condition `orderMode === "hall" && isTableVerified && currentTableId`. This is a SEPARATE rendering that appears on non-menu views (e.g., order status). The bell at 3838 is menu-view specific. Fix 2 only changes the bell at line 3838 — HelpFab condition is outside scope.

**FIX:** At line 3838, change the condition to use `isHallMode` instead of `orderMode === "hall" && isTableVerified && currentTableId`:

```jsx
// BEFORE:
{view === "menu" && orderMode === "hall" && isTableVerified && currentTableId && drawerMode !== 'cart' && (

// AFTER:
{view === "menu" && isHallMode && drawerMode !== 'cart' && (
```

**Why this is safe:** `isHallMode` is a prop from `useHallTable` (line 1559) that is `true` when URL has `mode=hall`. The bell opens `openHelpDrawer` which opens the help drawer. The help drawer's submit button already has `disabled={!currentTableId}` (line 3713), so even if table is not verified, user can browse help options — they just can't submit until verified. This is good UX.

**Verification:**
- Hall mode, table NOT verified → bell visible ✓
- Hall mode, table verified → bell visible ✓
- Pickup/delivery mode → no bell ✓ (isHallMode = false)
- Bell tap → help drawer opens ✓

---

### 3. [P3] PM-130: Help drawer missing chevron close button

**Description:** The help drawer (line 3650-3722) has no ChevronDown close button. The table code drawer (line 3546-3552) and detail card drawer both have one — grey circle, top-right. Help drawer only has "Отмена" text button at the bottom (line 3706).

**FIX:** Add a ChevronDown close button as the FIRST child inside `<DrawerContent>` at line 3651. Copy exact style from table code drawer (line 3546-3552), change onClick to `closeHelpDrawer`:

```jsx
// Insert AFTER line 3651 (<DrawerContent className="max-h-[85vh] rounded-t-2xl">):
<button
  onClick={closeHelpDrawer}
  className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 z-10"
  aria-label={t('common.close', 'Закрыть')}
>
  <ChevronDown className="w-6 h-6" />
</button>
```

**Note:** `DrawerContent` at line 3651 does NOT have `relative` in its className. The table code drawer's `DrawerContent` (line 3544) has `relative`. We need to add `relative` to the help drawer's DrawerContent for `absolute` positioning to work:

```jsx
// BEFORE:
<DrawerContent className="max-h-[85vh] rounded-t-2xl">

// AFTER:
<DrawerContent className="max-h-[85vh] rounded-t-2xl relative">
```

**Verification:**
- Open help drawer → grey circle chevron visible in top-right ✓
- Tap chevron → help drawer closes ✓
- "Отмена" button still works ✓
- Chevron matches table code drawer style exactly ✓

---

## Summary
Total: 3 findings (0 P0, 0 P1, 2 P2, 1 P3)

All 3 findings correspond directly to Fix 1, Fix 2, Fix 3 in the task. No extra findings added (scope lock respected).

## Prompt Clarity

- **Overall clarity: 5/5**
- **Ambiguous Fix descriptions:** None. All 3 fixes include exact line numbers, before/after code, root cause analysis, and verification steps. Excellent.
- **Missing context:** None. The root cause for Fix 1 was identified and explained clearly. Fix 2 included the tricky `isTableVerified` dependency analysis. Fix 3 was straightforward.
- **Scope questions:** Fix 2 had a subtlety: should the HelpFab at line 3639 also change? The task only mentions line 3838 (bell icon), so I scoped to that. The prompt could have explicitly noted that HelpFab condition is unchanged — but this was inferrable from the scope lock.
