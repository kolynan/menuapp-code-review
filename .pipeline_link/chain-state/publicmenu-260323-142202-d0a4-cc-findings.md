# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-142202-d0a4

## Findings

### 1. [P1] PM-107: popOverlay causes cascading sheet close (regression) — x.jsx lines 1306-1311, 2372-2401

**Description:** When a user programmatically closes a sheet (swipe down, × button, overlay tap), `popOverlay(name)` is called. This function (1) removes the overlay name from `overlayStackRef`, then (2) calls `window.history.back()`. The `history.back()` triggers the `popstate` event listener at line 2374. Inside `handlePopState`, it reads `overlayStackRef.current` — but the target overlay was ALREADY removed in step 1. So `handlePopState` finds the NEXT overlay in the stack (e.g., 'cart') and closes that too.

The `isPopStateClosingRef` flag (line 1299) is only used to prevent `popOverlay` from calling `history.back()` when already inside a popstate handler. It does NOT prevent `handlePopState` from acting on a programmatic `history.back()` call.

**Root cause:** Missing `isProgrammaticCloseRef` flag to gate the popstate listener when the close was initiated programmatically.

**FIX:**
1. Add `const isProgrammaticCloseRef = useRef(false);` near line 1299.
2. In `popOverlay` (line 1306-1311): before calling `window.history.back()`, set `isProgrammaticCloseRef.current = true`.
3. In `handlePopState` (line 2374): at the top, check `if (isProgrammaticCloseRef.current) { isProgrammaticCloseRef.current = false; return; }` — skip handler since `popOverlay` already handled the state change.
4. Keep all existing `pushOverlay`/`popOverlay`/stack logic intact.

This preserves hardware Back behavior (which does NOT go through `popOverlay`) and prevents cascading closes on programmatic close.

---

### 2. [P2] PM-103: Toast z-index too low, may render behind overlays — MenuView.jsx line 377

**Description:** The custom toast at line 377 uses `z-50`. The Vaul drawer and other overlays in x.jsx use `z-[60]`. When a dish is added while the menu is visible alongside a drawer or bottom sheet, the toast at z-50 can render behind higher z-index elements, appearing as a thin line or completely hidden.

Additionally, the `animate-in fade-in slide-in-from-bottom-2` classes depend on `tailwindcss-animate`. If the animation library's CSS doesn't properly initialize on Android browsers, the element may render with partial opacity or transform, contributing to the "thin line" appearance.

**FIX:**
1. Change `z-50` to `z-[200]` on the toast div (line 377) to ensure it renders above all overlays.
2. Add explicit fallback styles: remove animation classes that may not resolve, or add `opacity-100` as a safety net.
3. Verify `min-h-[32px]` or similar to prevent zero-height rendering.

Suggested replacement for toast div classes:
```
className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-800 text-white text-sm rounded-lg px-4 py-2 shadow-lg pointer-events-none"
```
(Removing animation classes in favor of reliable rendering; adding `pointer-events-none` so toast doesn't block taps.)

---

### 3. [P2] PM-102: Dish detail "Add to cart" button text may be invisible due to shadcn variant conflict — x.jsx lines 3699-3705

**Description:** The dish detail dialog Button at line 3699 has `className="w-full text-white"` with `style={{ backgroundColor: partner?.primary_color || '#1A1A1A' }}`. The text `{t('menu.add_to_cart', 'Добавить в корзину')}` IS present in the code.

However, the shadcn `<Button>` component uses the `default` variant which sets `bg-primary text-primary-foreground`. The Tailwind `text-white` class may be overridden by shadcn's `text-primary-foreground` if that CSS variable resolves to a dark color. Combined with the inline `backgroundColor` overriding the Tailwind `bg-primary`, the button could show the correct background but wrong (dark) text color, making text invisible on a dark background.

**FIX:**
1. Add `variant="ghost"` to the Button to strip shadcn's default colors: `<Button variant="ghost" className="w-full text-white hover:text-white min-h-[44px]"`.
2. Or use inline `style={{ backgroundColor: ..., color: '#FFFFFF' }}` to ensure text color is explicitly white regardless of variant.
3. Add `min-h-[44px]` for 44px touch target compliance.

---

### 4. [P2] PM-108: List-mode "+" button potentially clipped by Card overflow-hidden — MenuView.jsx lines 81-187

**Description:** In `renderListCard`, the Card element has `overflow-hidden` (line 87). The "+" button (`w-11 h-11` = 44px, line 156) is inside the flex flow and should normally be visible. However, on narrow screens (375px), the right column (`flex-1 min-w-0 h-24`) combined with text content that pushes the `justify-between` layout could cause the button to be positioned at the very edge of the card.

The button uses `rounded-lg` (not circular/rounded-full), and it's positioned via `flex justify-end`. If the card's total width minus image (96px) minus gap (12px) minus left padding (12px) minus right padding (12px) leaves a narrow column, the 44px button fits but is flush with the edge.

Current code does not show the button as `absolute` or extending outside bounds, so clipping may not actually occur with the current layout. If clipping IS confirmed on device:

**FIX:**
1. Add `overflow-visible` to the Card in `renderListCard` specifically, or
2. Add `pr-1` to the button wrapper (`flex justify-end`) to give breathing room: `className="flex justify-end pr-1"`, or
3. Reduce button to `w-10 h-10` with `min-w-[44px] min-h-[44px]` for touch target while smaller visual.

**Note:** Need device confirmation — in current code, the button is inside the flex flow with adequate padding. Clipping may be a regression from a different version or CSS stacking context issue.

---

### 5. [P2] PM-096: Tile-mode stepper buttons — ALREADY FIXED

**Description:** The task asks to ensure tile-mode stepper buttons are ≥44px. Looking at `renderTileCard` (lines 266-299):
- Initial "+" button: `w-11 h-11` (44px) ✅ — line 271
- Stepper −/+ buttons: `w-11 h-11` (44px) ✅ — lines 283, 293

This was already fixed in chain publicmenu-260323-103001-5842 (session S164), as confirmed in BUGS.md: "FIX-PM-096-068-84-CHAIN-5842". No additional changes needed.

**FIX:** None — already at 44px.

---

### 6. [P2] PM-discount-check: Discount badge guard — ALREADY FIXED

**Description:** The task asks to add `partner.discount_enabled` guard before rendering the discount badge. Looking at current code:
- renderListCard line 107: `{partner?.discount_enabled && partner?.discount_percent > 0 && (` ✅
- renderTileCard line 217: `{partner?.discount_enabled && partner?.discount_percent > 0 && (` ✅
- Price rendering lines 126, 240: Both check `partner?.discount_enabled && partner?.discount_percent > 0` ✅

Already guarded. No changes needed.

**FIX:** None — already checks `discount_enabled`.

---

### 7. [P2] #84b: Discount badge color — ALREADY FIXED

**Description:** The task asks to use `partner.discount_color` for the badge. Looking at current code:
- renderListCard line 110: `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` ✅
- renderTileCard line 220: `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}` ✅

Already using `discount_color` with `#C92A2A` fallback. No changes needed.

**FIX:** None — already uses `partner.discount_color`.

---

### 8. [P3] PM-104: ChevronDown not rendered in cart drawer header — x.jsx

**Description:** The task asks to fix chevron alignment in the cart drawer header. However, `ChevronDown` is imported at line 28 but NOT rendered anywhere in x.jsx JSX (no `<ChevronDown` found). The cart drawer at line 3405-3413 has:
- `DrawerContent` with `[&>[data-vaul-handle-hitarea]]:hidden` — drag handle is hidden
- `DrawerHeader className="sr-only"` — header is visually hidden

The chevron/gray line visual is likely inside `CartView.jsx`, which is NOT a target file. Since the task says "Do NOT look in CartView.jsx", the fix cannot be applied in x.jsx.

**FIX:** The `ChevronDown` import is unused in x.jsx (dead import). The visual misalignment issue is in CartView.jsx which is out of scope. Within x.jsx, the only possible improvement is removing the unused `ChevronDown` import, but that's outside the task scope (Fix-only-what-asked rule F4). No actionable fix in x.jsx for this visual issue.

**Alternative:** If the intent is to ADD a visible chevron to the drawer header in x.jsx (replacing the sr-only header), that would be a new feature, not a bugfix. Would need task clarification.

---

## Summary
Total: 8 findings (1 P1, 4 P2 — 3 already fixed, 1 P3)

**Need code changes:**
- Fix 1 (PM-107): P1 — popOverlay cascading close regression. **MUST FIX.**
- Fix 2 (PM-103): P2 — toast z-index too low. **MUST FIX.**
- Fix 3 (PM-102): P2 — dish detail button text invisible. **MUST FIX.**
- Fix 4 (PM-108): P2 — list-mode button clipping. **Conditional — may already be OK, needs device test.**
- Fix 8 (PM-104): P3 — chevron not in x.jsx, out of scope for this file.

**Already fixed (no changes needed):**
- Fix 5 (PM-096): Already 44px ✅
- Fix 6 (PM-discount-check): Already guarded ✅
- Fix 7 (#84b): Already uses discount_color ✅

---

## ⛔ Prompt Clarity (MANDATORY)
- **Overall clarity: 4/5** — Task is well-structured with clear Fix descriptions, file locations, and verification steps.
- **Ambiguous Fix descriptions:**
  - Fix 4 (PM-108): Description says "circular + FAB button" but list-mode uses `rounded-lg` (not circular). Unclear if the bug was observed in current code or a previous version.
  - Fix 8 (PM-104): Says to search for ChevronDown near cart drawer in x.jsx, but ChevronDown is not rendered anywhere in x.jsx JSX. The visual issue is likely in CartView.jsx which is out of scope.
- **Missing context:**
  - Fix 2 (PM-103): Would help to know which Android browser/version and specific scroll position when toast appears as thin line.
  - Fix 3 (PM-102): Would help to know the exact shadcn Button variant behavior in the Base44 setup — is `text-primary-foreground` a light or dark color?
- **Scope questions:**
  - Fix 8 (PM-104): If ChevronDown is NOT in x.jsx, should we add it? Or is this a CartView-only issue that was accidentally included in x.jsx scope?
  - Fixes 5/6/7: Already fixed in prior chains — should we confirm and mark as "no-op" or re-verify the fixes?
