# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-130431-1152

## Findings

### Fix 1 — PM-121: Double drag handle strip in CartView

1. **[P3] Custom drag handle div duplicates native B44 Bottom Sheet handle** (line ~428) — CartView.jsx has a custom `<div className="w-12 h-1.5 bg-gray-300 rounded-full" />` at line 428 inside the sticky header row. The B44 `<DrawerContent>` component (from `@/components/ui/drawer`, based on Vaul) already renders its own drag handle bar at the top. This produces two visible gray strips.

   **FIX:** Remove the custom drag handle div at line 428 (`<div className="w-12 h-1.5 bg-gray-300 rounded-full" />`). Also remove the spacer `<div className="w-9" />` at line 427 which was there to balance the layout against the handle. The header row should become just the chevron close button aligned to the right. Update the `flex justify-between` container accordingly — since only the chevron remains, change to `flex justify-end` or keep `justify-between` with only the chevron on the right.

   Suggested replacement for lines 426-438:
   ```jsx
   <div className="sticky top-0 z-10 bg-white px-4 pt-3 pb-1 flex items-center justify-end">
     <button
       className="w-11 h-11 flex items-center justify-center -mr-2"
       onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
       aria-label="Close cart"
     >
       <ChevronDown
         className={`w-9 h-9 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
       />
     </button>
   </div>
   ```

### Fix 2 — PM-104: Chevron alignment in CartView header

2. **[P3] Chevron alignment depends on Fix 1 resolution** (line ~426-438) — After Fix 1 removes the custom drag handle, the current `flex justify-between` layout with spacer + handle + chevron no longer applies. With Fix 1 applied (removing handle + spacer), the chevron will be right-aligned via `justify-end`, which is correct per spec (chevron must stay RIGHT).

   **FIX:** This is effectively resolved by Fix 1. Once the custom drag handle and spacer are removed, the chevron sits alone in the header row, right-aligned. The native B44 drag handle (from DrawerContent) appears above this row. No additional changes needed beyond Fix 1. The chevron size `w-9 h-9` (36px) is already correct per spec.

   **Verification note:** The visual alignment of the native B44 handle and the chevron row below it should look like they're in a natural top section of the bottom sheet: native handle centered at very top, chevron row below it flush right. This is standard Drawer UX.

### Fix 3 — PM-120: Floating point prices in cart

3. **[P2] Floating point artifacts in cart line item subtotals — CartView.jsx** (line ~800) — `formatPrice(item.price * item.quantity)` passes a raw JS multiplication result to `formatPrice`. When `item.price = 55.93` and `item.quantity = 3`, JS computes `167.78999999999998` instead of `167.79`. While `formatPrice` does call `.toFixed(2)` for non-integer numbers, the issue is that `.toFixed(2)` is applied in `formatPrice` only when `!Number.isInteger(num)` — and `167.78999...` is indeed not integer, so `.toFixed(2)` produces `"167.79"` correctly. **However**, the `cartTotalAmount` in x.jsx is accumulated via `reduce` (line 2001) and may accumulate floating point errors across multiple items that `.toFixed(2)` on individual display won't catch.

   **FIX (CartView.jsx, line 800):** Round the multiplication result before passing to formatPrice:
   ```jsx
   <span className="font-semibold text-slate-900">{formatPrice(Math.round(item.price * item.quantity * 100) / 100)}</span>
   ```

4. **[P2] Floating point artifacts in cart total calculation — x.jsx** (line ~2001) — `cart.reduce((acc, item) => acc + item.price * item.quantity, 0)` accumulates floating point errors. Each `item.price * item.quantity` may have FP error, and summing them makes it worse. `cartTotalAmount` is then passed to CartView and displayed at line 903 as `formatPrice(Number(cartTotalAmount) || 0)`.

   **FIX (x.jsx, line 2001):** Round each line item before accumulation:
   ```jsx
   const cartTotalAmount = cart.reduce((acc, item) => acc + Math.round(item.price * item.quantity * 100) / 100, 0);
   ```

5. **[P2] Floating point in order item `line_total` sent to DB — x.jsx** (lines ~2588, ~2967) — `line_total: item.price * item.quantity` is written to the database without rounding. If `item.price * item.quantity` produces `167.78999...`, that value gets stored in the DB.

   **FIX (x.jsx, lines 2588 and 2967):** Round line_total:
   ```jsx
   line_total: Math.round(item.price * item.quantity * 100) / 100,
   ```

6. **[P2] Floating point in confirmation screen line items — x.jsx** (line ~716) — `formatPrice(item.price * item.quantity)` in the order confirmation screen has the same FP issue. While `formatPrice` applies `.toFixed(2)`, applying rounding before display is more defensive.

   **FIX (x.jsx, line 716):**
   ```jsx
   {formatPrice(Math.round(item.price * item.quantity * 100) / 100)}
   ```

## Summary
Total: 6 findings (0 P0, 0 P1, 4 P2, 2 P3)

- Fix 1 (PM-121): 1 finding — remove custom drag handle div (P3)
- Fix 2 (PM-104): 1 finding — resolved as part of Fix 1 (P3)
- Fix 3 (PM-120): 4 findings — floating point rounding needed in CartView.jsx line 800, x.jsx lines 716, 2001, 2588, 2967 (all P2)

## ⛔ Prompt Clarity

- **Overall clarity: 5/5**
- **Ambiguous Fix descriptions:** None — all 3 fixes had clear "Сейчас / Должно быть / НЕ должно быть" structure with file locations and prior attempt context.
- **Missing context:** None significant. The FROZEN UX section was very helpful for avoiding regressions. The `formatPrice` function behavior was important to verify (it does apply `.toFixed(2)` for non-integers), which I confirmed by reading the code.
- **Scope questions:** Fix 2 and Fix 1 are tightly coupled — once Fix 1 removes the custom handle, Fix 2 is essentially resolved. This interdependency was clearly implied by the task description ("if Fix 1 removed the custom drag handle, verify the chevron row layout still looks correct").
