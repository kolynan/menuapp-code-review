# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-132142-8b8a

## Findings

### Fix 1 — PM-122: Detail card must open as bottom drawer, NOT fullscreen

1. **[P2] Detail card uses Dialog (modal) instead of Drawer (bottom sheet)** (lines 3665-3729)
   The detail card is rendered using `<Dialog>` + `<DialogContent>` which creates a centered modal overlay, not a bottom drawer. The app already imports and uses `<Drawer>` + `<DrawerContent>` for CartView (line 3417-3500), so the component is available.

   **Current code** (line 3665-3666):
   ```jsx
   <Dialog open={!!detailDish} onOpenChange={(open) => !open && setDetailDish(null)}>
     <DialogContent className="max-w-md p-0 overflow-hidden">
   ```

   **FIX:** Replace `<Dialog>` with `<Drawer>`, `<DialogContent>` with `<DrawerContent>`, `<DialogHeader>` with `<DrawerHeader>`, `<DialogTitle>` with `<DrawerTitle>`. Apply `max-h-[88vh]` on DrawerContent (same pattern as CartView at line 3422 which uses `max-h-[85vh]`). Add `overflow-y-auto` for scrollable content. The Drawer component already provides the drag handle and swipe-to-dismiss behavior natively.

   **Specific changes:**
   - Line 3665: `<Dialog open={!!detailDish} onOpenChange={...}>` → `<Drawer open={!!detailDish} onOpenChange={...}>`
   - Line 3666: `<DialogContent className="max-w-md p-0 overflow-hidden">` → `<DrawerContent className="max-h-[88vh] p-0 overflow-hidden">`
   - Line 3679: `<DialogHeader>` → `<DrawerHeader className="p-0">`
   - Line 3680: `<DialogTitle ...>` → `<DrawerTitle ...>`
   - Closing tags correspondingly: `</DialogTitle>` → `</DrawerTitle>`, `</DialogHeader>` → `</DrawerHeader>`, `</DialogContent>` → `</DrawerContent>`, `</Dialog>` → `</Drawer>`
   - Add a close/chevron button: `<button>` with `˅` icon positioned absolute top-right over the photo, `min-w-[44px] min-h-[44px]` for touch target, `onClick={() => setDetailDish(null)}`
   - Content area should be wrapped in a scrollable div: `<div className="overflow-y-auto">`

   **Risk:** The Drawer component from shadcn/ui may have different props or internal behavior than Dialog. The `onOpenChange` callback pattern should be compatible (both use boolean `open`). CartView at line 3417-3420 confirms the same open/onOpenChange pattern works.

---

### Fix 2 — PM-123: Detail card layout order

2. **[P2] Content order incorrect: Price appears before Description** (lines 3678-3716)
   Current order: Title (line 3680-3682) → Price+discount (lines 3684-3704) → Rating (lines 3706-3711) → Description (lines 3712-3715).
   Required Wolt-style order: Title → Description → Price+discount → Rating.

   **FIX:** Move the description block (lines 3712-3716) to BEFORE the price block (line 3684). Specifically:
   - After `</DrawerHeader>` (closing of title), insert the description block:
     ```jsx
     {getDishDescription(detailDish) && (
       <p className="text-sm text-slate-500">
         {getDishDescription(detailDish)}
       </p>
     )}
     ```
   - Remove the original description block from its current position (lines 3712-3716).
   - Final order in JSX: Title → Description → Price+discount → Rating → Add button.

---

### Fix 3 — PM-118: Discount badge in detail card — WRONG data source

3. **[P1] Detail card uses item-level discount fields that likely don't exist; MenuView uses partner-level** (line 3685)
   **Critical mismatch:** The detail card checks `detailDish.discount_enabled === true && detailDish.original_price` — these are item-level fields. However, MenuView.jsx (line 100, 142, 219, 278) uses **partner-level** discount: `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` and calculates the discounted price as `dish.price * (1 - partner.discount_percent / 100)`.

   This means the detail card's discount display NEVER triggers because `detailDish.discount_enabled` is likely `undefined` (the actual field is `partner.discount_enabled`, not `dish.discount_enabled`). Similarly, `detailDish.original_price` is likely undefined — MenuView doesn't use `original_price` at all; it calculates the discounted price from `dish.price` and `partner.discount_percent`.

   **FIX:** Replace the detail card discount logic to match MenuView's partner-level pattern:

   **Current** (line 3684-3704):
   ```jsx
   <div className="flex items-baseline gap-2">
     {detailDish.discount_enabled === true && detailDish.original_price ? (
       <>
         <span ...>{formatPrice(detailDish.price)}</span>
         <span ... line-through>{formatPrice(detailDish.original_price)}</span>
         <span ...>-{Math.round((1 - detailDish.price / detailDish.original_price) * 100)}%</span>
       </>
     ) : (
       <span ...>{formatPrice(detailDish.price)}</span>
     )}
   </div>
   ```

   **Should be** (matching MenuView line 100-113):
   ```jsx
   <div className="flex items-baseline gap-2">
     {partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
       <>
         <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
           {formatPrice(Math.round(detailDish.price * (1 - partner.discount_percent / 100)))}
         </span>
         <span className="text-sm text-slate-400 line-through">
           {formatPrice(detailDish.price)}
         </span>
         <span
           className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
           style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}
         >
           -{partner.discount_percent}%
         </span>
       </>
     ) : (
       <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
         {formatPrice(detailDish.price)}
       </span>
     )}
   </div>
   ```

   **Key changes:**
   - Condition: `detailDish.discount_enabled === true && detailDish.original_price` → `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`
   - Discounted price: `detailDish.price` (assumed pre-calculated) → `Math.round(detailDish.price * (1 - partner.discount_percent / 100))` (calculated from original)
   - Original price: `detailDish.original_price` → `detailDish.price` (dish.price IS the original; discount is partner-level percentage)
   - Badge: `Math.round(...)` calculation → simple `partner.discount_percent`

   **Severity raised to P1** because the discount display is completely broken (never shows), not just a styling issue.

---

## Summary
Total: 3 findings (0 P0, 1 P1, 2 P2, 0 P3)

- Fix 1 (PM-122, P2): Replace Dialog → Drawer component for bottom-sheet behavior. Drawer already imported and used by CartView.
- Fix 2 (PM-123, P2): Reorder JSX: move Description above Price+discount block.
- Fix 3 (PM-118, P1): **Wrong data source** — detail card uses nonexistent item-level discount fields; must use partner-level fields matching MenuView.jsx pattern. This is why discount never shows.

## ⛔ Prompt Clarity
- Overall clarity: **4/5** — well-structured with clear grep hints and file locations.
- Ambiguous Fix descriptions:
  - Fix 3: Task says "Fields: `item.discount_enabled`, `item.discount_percent`, `item.original_price`" but MenuView.jsx actually uses `partner.discount_enabled` and `partner.discount_percent` — NOT item-level fields. The field names in the task are **incorrect** and would lead to the same broken behavior. The instruction to "use SAME pattern as MenuView.jsx" saved this — without that cross-reference instruction, the wrong fields would have been used.
- Missing context: None significant — Wolt reference and code grep hints were very helpful.
- Scope questions: None — all 3 fixes clearly scope to the detail card section.
