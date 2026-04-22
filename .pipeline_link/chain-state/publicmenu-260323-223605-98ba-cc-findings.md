# CC Writer Findings — PublicMenu
Chain: publicmenu-260323-223605-98ba

## Findings

### Fix 1 — PM-101: formatPrice truncates significant decimals

1. **[P2] formatPrice from useCurrency is external — cannot inspect directly.** The `formatPrice` function passed to MenuView.jsx (line 46) comes from `useCurrency` hook (`@/components/publicMenu/refactor/hooks/useCurrency`), which is a Base44 internal module not available in this repo. The bug report says prices like `32.50` display as `32`. Since the hook source isn't available, the fix must either: (a) wrap/override `formatPrice` before passing it to MenuView, or (b) fix it inside the `useCurrency` hook via a B44 prompt. FIX: In x.jsx, after destructuring `formatPrice` from `useCurrency` (line 1864), create a wrapper function that preserves significant decimals: `const safeFormatPrice = (price) => { const num = parseFloat(price); if (isNaN(num)) return formatPrice(price); return formatPrice(num % 1 === 0 ? num : parseFloat(num.toFixed(10))); };` — then pass `safeFormatPrice` instead of `formatPrice` to MenuView. However, this approach may not work if `formatPrice` itself does rounding internally. The cleanest fix is to modify the `useCurrency` hook via B44 prompt.

2. **[P2] Math.round on discounted prices destroys decimal precision (MenuView.jsx lines 103, 283).** Both tile and list cards use `formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100)))` — `Math.round` always returns an integer, so a discounted price of `27.50` becomes `28`. This is a separate issue from the formatPrice function itself. FIX: Replace `Math.round(...)` with a decimal-preserving rounding: `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))`. This preserves cents while avoiding floating-point noise. Apply in both `renderListCard` (line 103) and `renderTileCard` (line 283).

3. **[P2] Local formatPrice in OrderStatusScreen (x.jsx line 986-994) uses toFixed(1) — truncates to 1 decimal.** The local `formatPrice` in `OrderStatusScreen` component does `num.toFixed(1)` for non-integer amounts. This means `32.55` would display as `32.6` (rounded to 1 decimal). FIX: Change `num.toFixed(1)` to `parseFloat(num.toFixed(2)).toString()` to preserve 2 decimal places while removing trailing zeros. Line 992: `const formatted = Number.isInteger(num) ? num.toLocaleString() : parseFloat(num.toFixed(2)).toString();`

### Fix 2 — PM-115: List-mode stepper stretches below card instead of overlaying image

4. **[P3] List-mode stepper is inside text column, not overlaid on image (MenuView.jsx lines 124-145).** When a dish is in cart, the stepper `(-N+)` renders as a block inside the text column (`flex-1` div, lines 92-146). This causes the card to grow taller. The stepper should instead be positioned as an absolute overlay on the image container (the `relative` div at line 149), matching the pattern already used in `renderTileCard` (lines 230-264). FIX: (a) Move the stepper block (lines 125-144) from inside the text column to inside the image container div (line 149), after the `{!inCart && ...}` "+" button block. (b) Replace the `{!inCart && ...}` condition: when `inCart`, show stepper overlay; when `!inCart`, show "+" button overlay. (c) Style the stepper overlay similar to tile-mode: `absolute bottom-1 right-1 z-10`, compact pill shape with `bg-white rounded-full shadow-md`, smaller button targets (`w-8 h-8` or `w-9 h-9`) to fit within 96px image. (d) Remove the stepper from the text column entirely so card height stays constant.

### Fix 3 — PM-104: ChevronDown too small and misaligned with drag handle

5. **[P3] ChevronDown in CartView.jsx is 28px (w-7 h-7), should be 36px (CartView.jsx line 427-428).** The `ChevronDown` at line 427 has `className="w-7 h-7 ..."` which is 28px. Task requires 36px (`w-9 h-9`). Also, it uses `ml-auto` which pushes it to the right edge — there's no visual alignment with a drag handle bar (no drag handle bar element exists in CartView.jsx currently). FIX: Change `w-7 h-7` to `w-9 h-9` on the ChevronDown. Wrap it in a button with `min-w-[44px] min-h-[44px]` for proper touch target. Add a centered drag handle bar element above/alongside the chevron for visual consistency: a `<div className="w-10 h-1 rounded-full bg-gray-300 mx-auto" />` centered in the sticky header, with ChevronDown positioned via flex layout.

6. **[P3] No ChevronDown or drag handle found in x.jsx.** Searched x.jsx for ChevronDown and drag handle patterns — no matching elements found. The bottom sheet / drawer in x.jsx does not have its own ChevronDown close button or drag handle bar. FIX: No changes needed in x.jsx for Fix 3 — the issue is only in CartView.jsx.

## Summary
Total: 6 findings (0 P0, 0 P1, 3 P2, 3 P3)
- Fix 1 (PM-101): 3 findings — useCurrency formatPrice is external (may need B44 prompt), Math.round on discounts destroys decimals, local formatPrice in OrderStatusScreen uses toFixed(1)
- Fix 2 (PM-115): 1 finding — stepper in wrong location, needs to overlay image like tile-mode
- Fix 3 (PM-104): 2 findings — ChevronDown too small in CartView.jsx, no ChevronDown in x.jsx

## ⛔ Prompt Clarity
- Overall clarity: 4
- Ambiguous Fix descriptions: Fix 1 — task says "Find formatPrice in MenuView.jsx" but formatPrice is a PROP received from x.jsx (via useCurrency hook). The actual function is not IN MenuView.jsx. The suggested fix `num % 1 === 0 ? num.toString() : num.toString()` is a no-op (both branches are identical). Minor confusion but overall intent was clear.
- Missing context: The actual `useCurrency` hook source code would help — it's a B44 internal import not available in this repo. Without seeing it, we can't be sure what formatPrice actually does internally.
- Scope questions: Fix 1 mentions modifying formatPrice in MenuView.jsx, but the function lives in useCurrency hook (external). Should we modify the wrapper in x.jsx instead? Or is a B44 prompt needed?
