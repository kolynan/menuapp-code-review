# CC Writer Findings — PublicMenu
Chain: publicmenu-260329-121355-a291

## Findings

### Fix 1 — PM-157 (P1): Floating point in StickyCartBar "МОЙ СЧЁТ" amount

**Confirmed.** File `x.jsx` line 2283-2288. Current code passes raw `myBill.total` and `tableTotal` directly to `formatPrice()` without rounding. JS floating point arithmetic produces values like `189.039999...`.

**Current code (line 2283-2288):**
```jsx
const hallStickyBillTotal =
  hallStickyMode === "myBill"
    ? formatPrice(myBill.total)
    : hallStickyMode === "tableOrders"
      ? formatPrice(tableTotal)
      : "";
```

**FIX:** Wrap each value with `parseFloat((value || 0).toFixed(2))` before `formatPrice()`, consistent with PM-155 and PM-151 fixes already applied elsewhere:
```jsx
const hallStickyBillTotal =
  hallStickyMode === "myBill"
    ? formatPrice(parseFloat((myBill.total || 0).toFixed(2)))
    : hallStickyMode === "tableOrders"
      ? formatPrice(parseFloat((tableTotal || 0).toFixed(2)))
      : "";
```

---

### Fix 2 — #197 (P2): OrderConfirmationScreen — remove "Ваш заказ" header and guest label

**Confirmed.** File `x.jsx`, function `OrderConfirmationScreen`.

**Location 1 — lines 702-704:** The `<p>` tag with `confirmation.your_order` text is redundant — the items list immediately below is self-evident.
```jsx
<p className="text-sm font-medium text-slate-600 mb-3">
  {tr("confirmation.your_order", "Ваш заказ")}
</p>
```
**FIX:** Remove these 3 lines entirely.

**Location 2 — lines 737-741:** The `guestLabel` block showing "Гость: Гость 1" is redundant for hall mode guests.
```jsx
{guestLabel && (
  <p className="text-sm text-slate-500 mt-3">
    {tr("confirmation.guest_label", "Гость")}: {guestLabel}
  </p>
)}
```
**FIX:** Remove these 5 lines entirely. Note: the `clientName` block (lines 744-748) for pickup/delivery mode must remain untouched.

**Verification note:** After removal, the Card content flows: items list → divider → "Итого" total → client name (pickup/delivery only). The i18n keys `confirmation.your_order` and `confirmation.guest_label` (line 431 in translations) become unused but can stay — removing translation keys is out of scope.

---

### Fix 3 — PM-159 (P3): Extra whitespace between "Новый заказ" card and submit button

**Analysis:** File `CartView.jsx`. The "Новый заказ" section (lines 949-997) uses `<Card className="mb-2">` and `<CardContent className="px-3 py-2">`. Below it, there's a spacer `<div className="h-20" />` (line 1000) that ensures content doesn't hide behind the sticky footer. The submit button is in a sticky footer (line 1013-1014): `<div className="sticky bottom-0 ... p-4 -mx-4">`.

The `h-20` spacer is what creates the visual gap when there's only 1 item. However, this spacer is needed to prevent the sticky footer from overlapping the last card. The gap appears larger with 1 item because the card itself is shorter, making the spacer more prominent.

**FIX:** SKIP. A clean fix would require conditional height logic (`h-20` vs smaller) based on item count, which introduces layout fragility. The task description explicitly says "If a clean fix is not obvious without introducing conditional layout logic, SKIP this fix." The current `h-20` spacer is functional — it prevents content overlap with the sticky footer. The visual gap is cosmetic and acceptable.

---

### Fix 4 — #193 (P2): MenuView list-mode — revert description to line-clamp-1

**Confirmed.** File `MenuView.jsx`, function `renderListCard`.

**Location 1 — line 94:** Dish name uses `line-clamp-2`.
```jsx
<h3 className="font-semibold text-base text-slate-900 line-clamp-2">{getDishName(dish)}</h3>
```
**FIX:** Change `line-clamp-2` → `line-clamp-1`.

**Location 2 — line 96:** Description uses `line-clamp-2`.
```jsx
<p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
```
**FIX:** Change `line-clamp-2` → `line-clamp-1`.

**Important:** Tile-mode cards (lines 267, 272) already have the correct values (`line-clamp-2` for name, `line-clamp-1` for description) and must NOT be changed. Only the list-mode `renderListCard` function is modified.

---

### Fix 5 — #144 (P3): StickyCartBar visual redesign — Uber Eats style

**Analysis:** File `StickyCartBar.jsx` (61 lines). Current layout: left icon circle + text div + right Button. The component receives `cartTotalItems`, `formattedCartTotal`, `formattedBillTotal`, `showBillAmount`, `buttonLabel`, `hallModeLabel`, `onButtonClick` as props.

The task asks for: entire panel = one tappable button, single row layout with `[ badge ] [ centered label ] [ price → ]`.

**Current issues:**
1. The current `<Button>` is only part of the bar — tapping the left side (icon + text area) does nothing.
2. The `{/* ...content unchanged... */}` comment on line 42 suggests the text content div was stripped or placeholder — actual text rendering may be missing.

**FIX:** Redesign the render of `StickyCartBar.jsx`:
1. Replace the outer `<div className="max-w-2xl mx-auto flex items-center justify-between">` with a single `<button>` that spans the full width and triggers `onButtonClick`.
2. Layout inside the button (single row, flex):
   - Left: circular badge showing `cartTotalItems` count (or `ClipboardList` icon when in bill modes)
   - Center: `buttonLabel` or `hallModeLabel` text (flex-1, text-center, truncate)
   - Right: formatted price + "›" chevron (shrink-0, never truncated)
3. In close mode (`isDrawerOpen`), show `ChevronDown` icon + close label.
4. Remove the separate `<Button>` component — the entire bar is the interactive element.
5. Keep the same outer fixed-bottom container with `safe-area-pb z-30`.

**x.jsx changes needed:** None — `onButtonClick` is already passed as a prop and handles all toggle logic. No wiring changes needed.

**Note:** This is [NICE-TO-HAVE]. The redesign is self-contained within StickyCartBar.jsx. Risk is low since the component is purely visual and all logic (visibility, mode switching) remains in x.jsx.

## Summary
Total: 5 findings (0 P0, 1 P1, 2 P2, 2 P3)
- Fix 1: CONFIRMED — floating point fix in x.jsx line 2283-2288
- Fix 2: CONFIRMED — remove 2 blocks in x.jsx lines 702-704 and 737-741
- Fix 3: SKIPPED — no clean fix without conditional layout logic
- Fix 4: CONFIRMED — 2 line-clamp changes in MenuView.jsx lines 94, 96
- Fix 5: CONFIRMED — StickyCartBar.jsx full redesign (61-line file, safe to rewrite)

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None. All 5 fixes had exact file paths, line numbers, current/expected code, and verification steps.
- Missing context: None. The `{/* ...content unchanged... */}` comment in StickyCartBar.jsx (line 42) is slightly confusing — unclear if this is actual production code or was stripped during export. However, the task description provides sufficient info to proceed.
- Scope questions: Fix 5 says "If the redesign requires changes to click handler wiring in x.jsx, make minimal changes." After analysis, no x.jsx changes are needed — the existing `onButtonClick` prop is sufficient.
