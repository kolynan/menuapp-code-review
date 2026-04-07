# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-131000

## Findings

### Fix 1 — PM-077: "+" button position on tile cards

1. [P2] "+" button is on image area, not card bottom-right (line ~170) — The `renderTileCard` function places the add/stepper overlay inside the image `<div className="relative w-full h-36 sm:h-48">` at `absolute bottom-2 right-2`. This means the "+" is at bottom-right of the IMAGE, not the bottom-right of the entire CARD. Per LOCK-PM-001, the "+" should be at the bottom-right corner of the dish card itself. When the card has a tall content section (long dish name + description + price), the "+" sits in the middle of the card visually, not at the bottom.

   **FIX:** Move the `<div className="absolute bottom-2 right-2">` block out of the image container and into the `<CardContent>` section. Make the Card itself `relative` and position the button at `absolute bottom-3 right-3` of the Card. Specifically:
   - Add `relative` to the Card className (line 152): `className="overflow-hidden hover:shadow-md transition-shadow border-slate-200 flex flex-col relative"`
   - Move the entire add/stepper block (lines 170-203) from inside the image div to after `</CardContent>` (but still inside `<Card>`), changing positioning to `absolute bottom-3 right-3`.
   - Keep the same button styling: `w-11 h-11 rounded-full shadow-md` with `primaryColor` background.

   **Alternative (simpler, less disruptive):** Keep the "+" overlaid on the image at bottom-right. Many food delivery apps (Uber Eats, DoorDash) use this exact pattern. The task description says "bottom-right corner of each dish card" — if the image takes up the top portion, the overlay IS at the bottom-right of the image section which is a standard pattern. **Recommend discussing with Arman** which interpretation is correct before moving the button, since moving it to absolute card-level bottom-right may overlap with price text.

### Fix 2 — PM-072: Mobile grid ignores partner.menu_grid_mobile

2. [P2] Hardcoded `grid-cols-2` on mobile (line 294) — The grid rendering line reads:
   ```jsx
   <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : gridColsClass}`}>
   ```
   When `isMobile` is true, it ignores `gridColsClass` (which correctly uses `MOBILE_GRID[mobileCols]`) and hardcodes `grid-cols-2`. The `MOBILE_GRID` mapping and `mobileCols` computation (lines 15-18, 57) already exist and work correctly for desktop path but are bypassed on mobile.

   **FIX:** Replace line 294:
   ```jsx
   // Before:
   <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : gridColsClass}`}>
   // After:
   <div className={`grid gap-3 ${isMobile ? MOBILE_GRID[mobileCols] : gridColsClass}`}>
   ```
   This uses the already-computed `mobileCols` (which defaults to 2 if `partner.menu_grid_mobile` is not set). No new code needed — just reference the existing mapping.

### Fix 3 — AC-09: No toast/feedback on add to cart

3. [P2] No visual feedback when adding dish to cart — The `addToCart(dish)` function is called on "+" button click (lines 113, 173) but there is zero visual confirmation. The user taps "+" and sees no feedback until they notice the cart count change (if visible). This is particularly bad on mobile where the StickyCartBar may not be immediately visible.

   **FIX:** Add a brief toast notification state to MenuView. Since MenuView is a child component (receives `addToCart` as prop), two approaches:

   **Option A (component-level toast — recommended):**
   - Add local state: `const [toastText, setToastText] = React.useState(null);`
   - Add a ref for timeout cleanup: `const toastTimerRef = React.useRef(null);`
   - Wrap addToCart call:
     ```jsx
     const handleAdd = (dish) => {
       addToCart(dish);
       if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
       setToastText(t('menu.added_to_cart') || 'Добавлено');
       toastTimerRef.current = setTimeout(() => setToastText(null), 1500);
     };
     ```
   - Add cleanup useEffect: `React.useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);`
   - Replace `addToCart(dish)` calls with `handleAdd(dish)` on both list and tile "+" buttons.
   - Render toast at bottom of the component return:
     ```jsx
     {toastText && (
       <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white text-sm rounded-lg px-4 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
         {toastText}
       </div>
     )}
     ```
   - Note: `bottom-20` positions it above the StickyCartBar. Adjust if needed.

   **Option B (button animation — simpler):**
   - On click, briefly scale-pulse the "+" button via a CSS class toggle. Less informative but simpler. May not be noticeable enough.

   Recommend Option A.

### Fix 4 — #84: Discount badges missing / not using partner.discount_color

4. [P2] No discount badge rendering in MenuView — MenuView.jsx has ZERO references to `discount`, `old_price`, or discount percentage. The S75 changelog mentions discount badges were added, but they are not present in the current code. If dishes have discount fields (e.g., `dish.discount_percent`, `dish.old_price`), no badge is rendered on dish cards.

   **FIX (for MenuView tile card):** Add discount badge to `renderTileCard`, inside the image container (top-left corner, standard pattern):
   ```jsx
   {/* Discount badge — top-left of image */}
   {dish.discount_percent > 0 && (
     <span
       className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
       style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
     >
       -{dish.discount_percent}%
     </span>
   )}
   ```
   Place this inside the `<div className="relative w-full h-36 sm:h-48 bg-slate-100">` block, after the image/placeholder.

   **FIX (for MenuView list card):** Similarly, add a small badge to `renderListCard`, inside the image container:
   ```jsx
   {dish.discount_percent > 0 && (
     <span
       className="absolute top-1 left-1 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full"
       style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
     >
       -{dish.discount_percent}%
     </span>
   )}
   ```
   The list card image div (line 72) needs `relative` added: `className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative"`.

   **FIX (for CartView):** CartView.jsx lines 1012-1019 show discount text but don't use `partner.discount_color` for styling. If there are any colored discount elements in CartView, they should use `partner.discount_color || '#C92A2A'`. However, looking at the code, the discount in CartView is shown as text, not as a colored badge — so no color change needed in CartView unless there's a visual badge element.

   **IMPORTANT NOTE:** Need to verify what discount fields exist on dish objects. The entity may use `dish.discount_percent` or `dish.discount` or similar. Check the data model before implementing. If the discount is calculated at cart level (not per-dish), then per-dish badges may not apply. The current CartView code suggests discount is at partner level (`partner.discount_percent`), not per-dish. If so, the badge approach changes — show partner-level discount on ALL dishes, or only on discounted dishes if there's a per-dish flag.

### Additional Findings (in-scope observations)

5. [P3] Toast i18n key needed — Fix 3 introduces `t('menu.added_to_cart')`. This key likely doesn't exist yet. Use `tr('menu.added_to_cart', 'Добавлено')` with fallback to ensure it displays correctly even without the translation key.

6. [P3] MOBILE_GRID only supports 1 and 2 columns (line 15-18) — The task says `menu_grid_mobile` can be 1, 2, or 3, but `MOBILE_GRID` only maps 1 and 2. If partner sets 3, it falls back to 2 (via `mobileCols` computation). Should add `3: "grid-cols-3"` to `MOBILE_GRID` mapping. FIX: Add `3: "grid-cols-3"` to the `MOBILE_GRID` object at line 18.

## Out-of-Scope Observations (NOT fixing, just noting)

- BUG-PM-076 (already recorded): `console.error` calls still present in other files — out of scope for this task.
- The `darkenColor` function (lines 20-26) could have edge cases with very dark colors but is not broken — no change needed.
- List card stepper (lines 122-136) uses different styling than tile card stepper (lines 183-200) — minor inconsistency but not in scope.

## Summary
Total: 6 findings (0 P0, 0 P1, 4 P2, 2 P3)

- Fix 1: P2 — "+" button position (image-level vs card-level) — needs clarification
- Fix 2: P2 — Mobile grid hardcoded `grid-cols-2` bypasses partner setting — clear fix
- Fix 3: P2 — No toast on add-to-cart — clear fix with code provided
- Fix 4: P2 — Discount badges missing in MenuView, no `discount_color` usage — fix provided but depends on dish data model
- Finding 5: P3 — Toast i18n key needs `tr()` fallback
- Finding 6: P3 — `MOBILE_GRID` missing `3: "grid-cols-3"` entry

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: "bottom-right corner of each dish card" is ambiguous — does it mean bottom-right of the entire card (absolute to card) or bottom-right of the image area (current position)? The current code already has bottom-right on the image. If the intent is card-level positioning, that could overlap with price/rating text. Score: 3/5
  - Fix 4: Unclear whether discount is per-dish or partner-level. Current CartView code suggests partner-level discount (`partner.discount_percent`), but the task describes per-dish badges (`-20%`). Need to know the dish entity fields. Score: 3/5
- Missing context: Dish entity field names for discount (is it `dish.discount_percent`? `dish.old_price`? partner-level only?)
- Scope questions: If discount is partner-level (applies to all dishes equally), should badges appear on every dish card or not at all?
