# CC Writer Findings — PublicMenu
Chain: publicmenu-260325-204116-f888

## Findings

### Fix 1 — PM-139: Guest name ✓ button does nothing + name not persisted

1. **[P1] Silent failure when currentGuest has no id** (x.jsx ~line 3143) — `handleUpdateGuestName` starts with `if (!currentGuest?.id || !guestNameInput.trim()) return;`. When `currentGuest` is null or has no `.id` (e.g., first-time guest before session creation), the function exits silently — no toast, no visual feedback. The ✓ button appears unresponsive.

   FIX: Split the guard into two paths:
   - If `guestNameInput.trim()` is empty → return (button is already `disabled`, so this is just safety).
   - If `currentGuest?.id` exists → call `SessionGuest.update()` as now.
   - In ALL cases (whether DB update succeeded or not) → save `guestNameInput.trim()` to `localStorage.setItem("menuapp_guest_name", ...)`, call `setIsEditingName(false)`, and show `toast.success(...)`.
   - After saving, set `guestNameInput('')` (existing line 3155 already does this).

2. **[P1] Name not persisted across sessions — no localStorage read on init** (x.jsx ~line 1356) — `guestNameInput` is initialized as `useState('')`. There is no code to read from `localStorage.getItem("menuapp_guest_name")` on mount, so even if we add localStorage write in Fix 1, the name won't pre-fill on reload.

   FIX: Add a `useEffect` (or lazy initializer) near line 1356–1358 to read `menuapp_guest_name` from localStorage on mount. If a value exists and `currentGuest` has no `.name`:
   - Set `guestNameInput` to the stored value.
   - Optionally call `setCurrentGuest(prev => ({ ...prev, name: storedName }))` so `guestDisplay` shows the name immediately without requiring edit mode.

3. **[P1] isEditingName never switches to read-only display after save** (CartView.jsx ~line 444–469) — The task requires: after tapping ✓, switch to read-only display (name as text + pencil icon for edit). Currently `handleUpdateGuestName` calls `setIsEditingName(false)` (line 3154) which does toggle the UI. However, it also calls `setGuestNameInput('')` (line 3155), which means `guestNameInput` is cleared. Next time user taps the pencil, `setGuestNameInput(currentGuest?.name || '')` at line 463 will pre-fill correctly ONLY if the DB update succeeded and `currentGuest.name` was updated. If only localStorage was saved (no `currentGuest.id`), the field would be empty again.

   FIX: In the localStorage-only path (no `currentGuest?.id`), update local state: `setCurrentGuest(prev => prev ? { ...prev, name: guestNameInput.trim() } : prev)` so the name persists in component state even without a DB record.

### Fix 2 — PM-140: Empty white area after order submit — no CTA

4. **[P2] No CTA when cart is empty but orders exist** (CartView.jsx ~line 777–779) — After `SECTION 3: YOUR ORDERS` (ending ~line 777) and before `SECTION 2: NEW ORDER` (line 779–904 wrapped in `{cart.length > 0 && (...)}`), there is no fallback content. When `cart.length === 0` and `myOrders.length > 0`, the user sees orders and then blank space.

   FIX: After the `SECTION 3` Card closing tag (line 777) and before `SECTION 2` (line 779), add:
   ```jsx
   {/* CTA: Add more items when cart is empty but has orders */}
   {cart.length === 0 && myOrders.length > 0 && (
     <div className="mt-4 px-1">
       <button
         type="button"
         onClick={() => { onClose ? onClose() : setView("menu"); }}
         className="w-full min-h-[44px] py-3 rounded-lg border text-sm font-medium"
         style={{ borderColor: primaryColor, color: primaryColor }}
       >
         {tr('cart.add_more', 'Добавить к заказу')}
       </button>
     </div>
   )}
   ```
   Notes:
   - Uses `onClose` prop (line 71) for consistency with chevron close behavior (line 476).
   - `min-h-[44px]` meets mobile touch target requirement.
   - Outlined style (border + transparent bg) as specified.
   - i18n key `cart.add_more` with Russian fallback.

### Fix 3 — PM-141: Star rating touch targets too small on mobile

5. **[P2] Rating size="sm" gives stars < 44px touch target** (CartView.jsx ~line 738) — The `<Rating size="sm" />` renders small stars. On mobile 375px, each star is approximately 16–20px, well below the 44px minimum touch target.

   FIX: Change `size="sm"` to `size="md"` at line 738. Additionally, add vertical padding to the rating wrapper div (line 722) to ensure the tap area is at least 44px tall:
   ```jsx
   <div className="flex items-center gap-2 pl-2 py-2">
   ```
   The `py-2` adds 8px top + 8px bottom padding, combined with the larger star size should meet the 44px requirement.

   Note: This change is ONLY in CartView.jsx (order ratings section). MenuView.jsx tile/list ratings are NOT touched per scope lock.

## Summary
Total: 5 findings (0 P0, 3 P1, 2 P2, 0 P3)

- Fix 1 (PM-139): 3 findings — silent failure guard, localStorage persistence, state consistency
- Fix 2 (PM-140): 1 finding — missing CTA block
- Fix 3 (PM-141): 1 finding — star size + padding

## Prompt Clarity

- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. All three fixes had clear "current → expected" descriptions with exact line numbers and code references.
- Missing context: None significant. The `Rating` component's available `size` prop values (`sm`, `md`, `lg`?) aren't documented, but `size="md"` is a reasonable assumption for any UI component.
- Scope questions: None — scope lock was explicit and clear. FROZEN UX section well-defined.
