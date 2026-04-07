# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-153540-d45d

## Findings

### 1. [P2] Fix 1 — PM-122: Detail card uses Dialog (fullscreen) instead of Drawer (bottom sheet)

**Current state (lines 3664-3729):** The detail card is rendered using `<Dialog>` + `<DialogContent>` — this creates a centered modal overlay that behaves like a fullscreen page on mobile. There is no drag handle, no slide-up animation, and the background is fully obscured.

**Problem:** The `Dialog` component from shadcn/ui renders as a centered overlay modal with a backdrop. On mobile (375px), this covers the entire screen, making it feel like a page navigation rather than a contextual detail card.

**FIX:** Replace `<Dialog>` / `<DialogContent>` / `<DialogHeader>` / `<DialogTitle>` with `<Drawer>` / `<DrawerContent>` / `<DrawerHeader>` / `<DrawerTitle>` — the same component already imported at line 91 and used for CartView (line 3417) and table verification (line 3504).

Specific changes at lines 3665-3729:
```jsx
// BEFORE (line 3665):
<Dialog open={!!detailDish} onOpenChange={(open) => !open && setDetailDish(null)}>
  <DialogContent className="max-w-md p-0 overflow-hidden">

// AFTER:
<Drawer open={!!detailDish} onOpenChange={(open) => !open && setDetailDish(null)}>
  <DrawerContent className="max-h-[88vh] rounded-t-2xl overflow-hidden p-0">
```

Key implementation details:
- Use `max-h-[88vh]` for ~88% screen height (between 85-90% as spec requires).
- Add `rounded-t-2xl` for the rounded top corners (matches CartView pattern).
- The Drawer component from `@/components/ui/drawer` already includes a drag handle by default.
- Add a close chevron button (top-right overlay on photo):
```jsx
<button
  onClick={() => setDetailDish(null)}
  className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white"
  aria-label={t('common.close')}
>
  <ChevronDown className="w-5 h-5" />
</button>
```
Note: `ChevronDown` needs to be added to the lucide-react import at line 28. Alternatively, use `XIcon` which is already imported (line 37).

- Replace closing `</DialogContent></Dialog>` with `</DrawerContent></Drawer>`.
- Replace inner `<DialogHeader>` / `<DialogTitle>` with `<DrawerHeader>` / `<DrawerTitle>` or remove the header wrapper entirely and use a plain `<h2>` since the title is part of the card content (not a modal header). A sr-only DrawerTitle is also acceptable (same pattern as CartView line 3423).
- Make the content area scrollable: wrap the content section in a `<div className="overflow-y-auto flex-1">`.
- Make the bottom "Add to cart" button sticky: wrap in `<div className="sticky bottom-0 bg-white p-4 border-t border-slate-100">`.

**Verification:** Tap dish → card slides up from bottom, ~88vh height, top ~12% shows menu behind, drag handle visible, swipe down to dismiss works.

---

### 2. [P2] Fix 2 — PM-123: Detail card content order is wrong (Price before Description)

**Current order (lines 3678-3716):**
1. Title (DialogHeader, line 3679-3683)
2. Price + discount (line 3684-3704)
3. Rating (line 3706-3711)
4. Description (line 3712-3716)

**Required order (Wolt-style):**
1. Title
2. Description
3. Price + discount
4. Rating
5. Add button (sticky bottom)

**FIX:** Reorder the JSX blocks inside the content area. Move the description block (lines 3712-3716) to immediately after the title, before the price block.

```jsx
// After title, BEFORE price:
{getDishDescription(detailDish) && (
  <p className="text-sm text-slate-500">
    {getDishDescription(detailDish)}
  </p>
)}
// Then price block (lines 3684-3704)
// Then rating block (lines 3706-3711)
```

Remove the duplicate description block from its current position (after rating).

**Verification:** Open detail card → content reads: Photo → Title → Description → Price → Rating → Add button.

---

### 3. [P2] Fix 3 — PM-118: Discount display inconsistent with MenuView pattern

**Current state (lines 3685-3704):** The detail card uses **per-dish** discount fields:
```jsx
detailDish.discount_enabled === true && detailDish.original_price
```
And calculates percentage dynamically: `Math.round((1 - detailDish.price / detailDish.original_price) * 100)`.

**Problem:** MenuView.jsx uses **partner-level** discount fields:
```jsx
partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0
```
And calculates discounted price from original: `dish.price * (1 - partner.discount_percent / 100)`.

This means the detail card and menu list/tile display discounts using completely different logic and different data sources. If `partner.discount_enabled` is true but individual dishes don't have `discount_enabled` set, the detail card won't show any discount — while the list/tile views will.

**FIX:** Align the detail card discount logic with MenuView. Use partner-level discount fields (same pattern as MenuView lines 100-113 and 278-291):

```jsx
{partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0 ? (
  <div className="flex items-baseline gap-2">
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
  </div>
) : (
  <span className="text-lg font-bold" style={{ color: partner?.primary_color || '#1A1A1A' }}>
    {formatPrice(detailDish.price)}
  </span>
)}
```

This uses:
- `partner?.discount_enabled === true` — strict boolean check (PM-109 guard)
- `partner?.discount_percent` — percentage from partner settings
- `partner?.discount_color` — badge color from partner settings
- `detailDish.price` as the original (pre-discount) price, with calculated discounted price — same as MenuView
- `Math.round()` — same rounding as MenuView tile card (line 281)

**Important note:** The current code treats `detailDish.price` as the already-discounted price and `detailDish.original_price` as the pre-discount price. MenuView treats `dish.price` as the ORIGINAL price and calculates the discount. This is a fundamental data model question — the fix above assumes MenuView is correct (price = original, discount calculated at display time). If the data model actually stores pre-computed discounted prices, the detail card's current approach might be correct but then MenuView is wrong. Given that MenuView is the established tested pattern, aligning with MenuView is the safer choice.

**Verification:** Find a dish with partner discount enabled → open detail card → see: discounted price (bold) + ~~original price~~ (strikethrough) + `-X%` badge.

---

## Summary
Total: 3 findings (0 P0, 0 P1, 3 P2, 0 P3)

All three fixes are scoped to the same section of x.jsx (lines 3664-3729 — the detail card Dialog). They should be applied together:
1. Fix 1: Dialog → Drawer conversion (structural change)
2. Fix 2: Reorder content blocks (within the new Drawer)
3. Fix 3: Replace discount logic (within the reordered Price block)

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Task is well-structured with clear before/after descriptions and grep hints.
- **Ambiguous Fix descriptions:**
  - Fix 3: The stated field names (`item.discount_enabled`, `item.discount_percent`, `item.original_price`) suggest per-item fields, but the instruction also says "use SAME pattern as MenuView.jsx" which uses **partner-level** fields (`partner.discount_enabled`, `partner.discount_percent`). These are contradictory. The current detail card code (line 3685) already uses per-dish fields (`detailDish.discount_enabled`, `detailDish.original_price`), so it's unclear whether the task wants to keep per-dish fields or switch to partner-level fields. I chose to align with MenuView (partner-level) since the task explicitly says "use SAME pattern as MenuView."
- **Missing context:** Confirmation of which discount data model is authoritative — per-dish or per-partner. This matters for Fix 3 correctness.
- **Scope questions:** None — scope is clear with the FROZEN UX list.
