# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-190433-30fb

## Findings

### Fix 1 — PM-126 (P2): Android Back → unified pushState pattern for ALL drawers

**Current state analysis:**

The existing code in `x.jsx` already has a partial overlay stack system (lines 1300–1316):
- `overlayStackRef` (ref-based stack)
- `pushOverlay(name)` → pushes to stack + `history.pushState`
- `popOverlay(name)` → removes from stack + `history.back()` (with `isProgrammaticCloseRef` guard)
- `handlePopState` listener (lines 2380–2414) handles `popstate` event for `'tableConfirm'` and `'cart'` overlays

**Issues found:**

1. **[P1] Detail card drawer is NOT integrated into the overlay stack.** The detail card drawer (`<Drawer open={!!detailDish}>` at line 3666) uses `setDetailDish(null)` to close but never calls `pushOverlay`/`popOverlay`. Android Back will NOT close this drawer — it will skip to the previous overlay or exit the page.

   FIX: When `detailDish` is set (i.e., detail card opens), call `pushOverlay('detailDish')`. When it closes (via chevron click at line 3683 or `onOpenChange` at line 3666), call `popOverlay('detailDish')`. Add a `'detailDish'` case in the `handlePopState` switch (line 2395) that calls `setDetailDish(null)`.

2. **[P1] Table code BS is partially integrated but the `handlePopState` case has a subtle issue.** The `'tableConfirm'` case (lines 2396–2399) correctly closes the sheet, but `pushOverlay('tableConfirm')` is only called at line 2725. The `Drawer` component's `onOpenChange` (line 3507) calls `popOverlay('tableConfirm')` + `setShowTableConfirmSheet(false)` — this is correct for programmatic/swipe close. However, there is no guard against closing during table code verification (unlike cart which guards `isSubmitting`). This is acceptable as-is for now.

3. **[P1] Help modal/drawer is NOT in the overlay stack.** `HelpModal` (line 3617) opens via `handleOpenHelpModal` and closes via `setIsHelpModalOpen(false)`. No `pushOverlay`/`popOverlay` calls exist for it. After Fix 2 converts it to a Drawer, it MUST be added to the overlay stack with a `'help'` entry.

   FIX: The task specifies creating a `useAndroidBack` hook. However, the codebase already has a working overlay stack system (`pushOverlay`/`popOverlay`/`handlePopState`). Two approaches are possible:

   **Option A (Recommended — matches existing pattern):** Extend the existing overlay stack with new cases (`'detailDish'`, `'help'`) in `handlePopState`. No new hook needed — this is already the established pattern in the codebase.

   **Option B (As specified in task):** Create `useAndroidBack(isOpen, onClose)` hook. This hook would internally manage `pushState`/`popstate` per-drawer. Risk: multiple independent `popstate` listeners could conflict with the existing central listener at line 2381. The central listener would need to be removed or refactored to avoid double-handling.

   **CRITICAL RECOMMENDATION:** If implementing `useAndroidBack` as a hook, the existing `handlePopState` listener (lines 2380–2414) MUST be removed or refactored into the hook pattern. Otherwise, both the hook's listener AND the existing listener will fire on the same `popstate` event, causing double-close bugs. The safest approach is Option A — extend the existing overlay stack.

4. **[P2] Cart drawer in CartView.jsx does NOT need its own pushState logic.** Cart opening/closing is already managed by `x.jsx` via `pushOverlay('cart')`/`popOverlay('cart')` at the parent level (lines 3399, 3421, 3488, 3767, 3770). The `CartView` component just receives `onClose` prop. This is correct and should NOT be changed — the hook approach would only apply at the x.jsx level for cart.

5. **[P1] `isProgrammaticCloseRef` is a single shared ref.** If two drawers close in rapid succession (e.g., help drawer closes, then its `history.back()` triggers before the flag is cleared), the guard could fail. The current code works for single-overlay scenarios but could race with multiple overlays.

   FIX: Instead of a boolean ref, use a counter ref: increment on programmatic close, decrement in popstate handler. This handles rapid sequential closes. OR keep the existing boolean approach but ensure all drawers use the central `popOverlay` function (which already manages the flag correctly).

### Fix 2 — PM-125 (P2): «Нужна помощь?» Dialog → Drawer + auto-close cart

**Current state analysis:**

- `HelpModal` is imported from `@/components/publicMenu/HelpModal` (line 97) — this is an EXTERNAL component, not defined in `x.jsx`.
- It's rendered conditionally at line 3616–3631 and receives props like `onClose`, `onSelectHelpType`, `helpComment`, etc.
- The `useHelpRequests` hook (line 1632–1646) manages help state including `isHelpModalOpen`, `setIsHelpModalOpen`, `handleOpenHelpModal`.
- Cart calls waiter via `onCallWaiter={handleOpenHelpModal}` (line 3489).

**Issues found:**

1. **[P1] HelpModal is an external component — cannot be converted to Drawer here.** `HelpModal` is imported from `@/components/publicMenu/HelpModal`. The task says to convert Dialog → Drawer in `x.jsx`, but the Dialog component is inside `HelpModal.jsx` (external file not in scope).

   FIX: Two approaches:
   - **Option A (In-scope):** Replace the `<HelpModal>` usage in `x.jsx` with an inline Drawer implementation that replicates the help UI (title, 5 option buttons, comment textarea, Cancel + Submit). This keeps changes within the target files.
   - **Option B (Requires external file):** Modify `HelpModal` to use Drawer instead of Dialog. This file is NOT in the target files list.

   **Recommendation:** Option A — build the help Drawer inline in `x.jsx` using the existing `useHelpRequests` hook state, replacing the `<HelpModal>` render block (lines 3616–3631).

2. **[P1] Cart close → help open sequencing.** Currently `onCallWaiter={handleOpenHelpModal}` (line 3489) directly opens the help modal while cart is still open. The task requires: (1) close cart first, (2) wait 300ms, (3) open help.

   FIX: Create a new handler in `x.jsx` (e.g., `handleHelpFromCart`) that:
   ```js
   const handleHelpFromCart = useCallback(() => {
     popOverlay('cart');
     setDrawerMode(null);
     setTimeout(() => {
       setIsHelpModalOpen(true);
       pushOverlay('help');
     }, 300);
   }, []);
   ```
   Pass this as `onCallWaiter` to CartView instead of `handleOpenHelpModal`.

3. **[P2] Help Drawer needs overlay stack integration.** After conversion to Drawer, add `pushOverlay('help')` on open and `popOverlay('help')` on close. Add `'help'` case in `handlePopState` switch.

4. **[P2] HelpFab (line 3604–3612) also opens help.** The floating action button calls `handleOpenHelpModal` directly (not from cart). This path should open the help Drawer directly without the 300ms delay. Ensure both paths work: from-cart (with delay) and from-FAB (immediate).

### Fix 3 — PM-127 (P2): Restore bell icon to main menu

**Current state analysis:**

- `Bell` is imported from `lucide-react` at line 25.
- `HelpFab` component (lines 3604–3612) is rendered only when `orderMode === "hall" && isTableVerified && currentTableId`. This is a floating action button that appears only after table verification.
- There is NO standalone bell icon on the main menu screen outside of `HelpFab` and `CartView`.

**Issues found:**

1. **[P2] Bell icon is only visible via HelpFab, which requires table verification.** Before table verification, there is NO way to call for help from the main menu. The task says the bell was likely removed by a recent KS run.

   FIX: Add a bell icon near the header or StickyCartBar area in the `view === "menu"` section. The bell should be visible regardless of table verification status (but help submission may still require a table). When tapped, it opens the help Drawer from Fix 2 (using `handleOpenHelpModal` or a direct `setIsHelpModalOpen(true)` + `pushOverlay('help')`).

   Suggested placement: Near the `StickyCartBar` render block (line 3747+). Add a fixed-position bell button that appears when `view === "menu"`. Style: `min-w-[44px] min-h-[44px]` touch target, amber color to match CartView's bell style.

   Alternative placement: Inside the header area. However, `PublicMenuHeader` is an external component, so adding it adjacent to StickyCartBar is more contained.

2. **[P2] If the bell opens help while cart is closed, the 300ms delay from Fix 2 is NOT needed.** Ensure the direct-open path (no cart involved) doesn't have the delay.

### Fix 4 — #143 (P3): Chevron ˅ on table code input drawer

**Current state analysis:**

- Table code BS (lines 3505–3602): `<Drawer open={showTableConfirmSheet}>` with `<DrawerContent>` containing `<DrawerHeader>` with title + helper text, then code input cells, verification UI, motivation text, and submit button.
- The DrawerHeader (lines 3519–3527) has title and subtitle but NO close button/chevron.
- The detail card drawer has a chevron at line 3682–3688: `<button className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-black/40 text-white">`.

**Issues found:**

1. **[P3] Table code drawer has no visible close button.** Only swipe-down or Android back (overlay stack) closes it.

   FIX: Add a `ChevronDown` button in the top-right corner of the table code drawer, inside the `<DrawerHeader>` area. Match detail card drawer style BUT adapt background for white drawer context (use `bg-gray-200` instead of `bg-black/40`):
   ```jsx
   <button
     onClick={() => {
       pendingSubmitRef.current = false;
       popOverlay('tableConfirm');
       setShowTableConfirmSheet(false);
     }}
     className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-gray-200 text-gray-500"
     aria-label={t('common.close', 'Закрыть')}
   >
     <ChevronDown className="w-6 h-6" />
   </button>
   ```

   NOTE: The `DrawerContent` at line 3518 needs `relative` positioning for the absolute button to work. Currently it has `className="max-h-[85dvh] rounded-t-3xl z-[60]"`. Add `relative` to this className.

2. **[P3] Touch target verification.** The proposed `w-11 h-11` (44×44px) meets the minimum touch target requirement. ✓

### Fix 5 — #140 (P3): Chevron ˅ → right side of table info card in CartView (not sticky)

**Current state analysis:**

- CartView lines 425–436: Separate sticky chevron row at top:
  ```jsx
  <div className="sticky top-0 z-10 bg-white px-4 pt-3 pb-1 flex items-center justify-end">
    <button ... onClick={onClose}>
      <ChevronDown className="w-9 h-9 ..." />
    </button>
  </div>
  ```
- Table info card lines 438–487: Contains bell icon (left), table/guest info (center), and an empty right side (comment at line 485: "Right: Close button removed — replaced by chevron-down above").

**Issues found:**

1. **[P2] Separate sticky chevron row wastes vertical space.** Lines 425–436 should be removed entirely.

   FIX:
   - **DELETE** the sticky chevron div (lines 425–436).
   - **ADD** ChevronDown button to the RIGHT side of the table info card (line 484, replacing the comment). Use:
   ```jsx
   {/* Right: Chevron close (non-sticky, #140) */}
   <button
     onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
     className="min-w-[44px] min-h-[44px] flex items-center justify-center"
     aria-label="Close cart"
   >
     <ChevronDown
       className={`w-7 h-7 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400'}`}
     />
   </button>
   ```

2. **[P3] Layout of table info card after change.** The card already uses `flex items-center justify-between` (line 439). With bell on left, info in center, and chevron on right, the layout will be balanced. The `flex-1 mx-2` on the center div (line 452) ensures proper spacing.

3. **[P2] The `isSubmitting` guard must be preserved.** The current chevron has `if (isSubmitting) return;` guard (line 429). This MUST carry over to the new position to prevent cart closure during order submission (PM-031 FROZEN UX).

## Summary
Total: 14 findings (0 P0, 6 P1, 6 P2, 2 P3)

- Fix 1: 5 findings (3 P1, 1 P2, 1 P1) — overlay stack extension needed for detail card + help; potential conflict between hook approach and existing central listener
- Fix 2: 4 findings (2 P1, 2 P2) — HelpModal is external component; cart-to-help sequencing; overlay integration
- Fix 3: 2 findings (2 P2) — bell placement near StickyCartBar; no-delay path for direct open
- Fix 4: 2 findings (2 P3) — add chevron button + relative positioning on DrawerContent
- Fix 5: 3 findings (2 P2, 1 P3) — remove sticky row, move chevron into table card, preserve isSubmitting guard

## Key Architectural Recommendation

The task specifies creating a `useAndroidBack(isOpen, onClose)` hook. However, the codebase already has a **working centralized overlay stack** (`pushOverlay`/`popOverlay`/`handlePopState` at lines 1300–1316, 2380–2414).

**Strongly recommend extending the existing pattern** instead of introducing a per-drawer hook, because:
1. Multiple independent `popstate` listeners will conflict with the existing central listener
2. The `isProgrammaticCloseRef` guard is shared and central
3. The cart drawer already uses the overlay stack — adding a hook would create two competing systems

If the hook approach is chosen, the existing `handlePopState` listener (lines 2380–2414) MUST be fully replaced by hook-based logic for ALL drawers (including cart and tableConfirm that already work). This is a larger refactor with higher regression risk.

---

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Very detailed task with clear acceptance criteria. Minor ambiguities noted below.
- **Ambiguous Fix descriptions:**
  - Fix 1: The task says "implement `useAndroidBack` hook" but the code already has a centralized overlay stack. Should the hook replace the existing system or coexist? The "Do NOT implement separate pushState logic copy-pasted in 4 places — use the hook" instruction conflicts with the existing non-hook pattern. Clarity needed on whether to refactor existing cart/tableConfirm to use the hook too.
  - Fix 2: "Convert Dialog → Drawer in `pages/PublicMenu/x.jsx`" — but HelpModal is an external component (`@/components/publicMenu/HelpModal`). The Dialog is inside that external file, not in x.jsx. Should we build an inline replacement Drawer in x.jsx or modify the external file?
  - Fix 3: "Restore bell icon at its original position" — git history doesn't clearly show a bell removal from the main menu area (it was always inside HelpFab which is conditional on table verification). The bell may never have been on the main menu unconditionally.
- **Missing context:**
  - HelpModal.jsx source code would help understand what UI to replicate in the Drawer conversion.
  - The `useHelpRequests` hook internals (what `handleOpenHelpModal` does exactly).
- **Scope questions:**
  - Fix 2 says to add `onHelpRequest` callback prop — but the existing `onCallWaiter` prop already serves this purpose. Should we rename it or add a new prop?
  - Is modifying HelpFab behavior in-scope (it also opens help but from main menu, not cart)?
