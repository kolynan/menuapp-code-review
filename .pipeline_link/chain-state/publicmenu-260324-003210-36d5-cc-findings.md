# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-003210-36d5

## Findings

1. **[P3] Fix 1 — PM-117: Detail card photo not square (aspect ratio)**
   - **File:** `pages/PublicMenu/x.jsx`, line ~3667
   - **Current:** The image container uses `class="w-full h-48 bg-slate-100"` — a fixed height of `h-48` (192px). The image inside uses `w-full h-full object-cover`, which fills this non-square rectangle. On most phones, the dialog is ~384px wide but the image is only 192px tall → 2:1 ratio, not square.
   - **FIX:** Change the container from `w-full h-48` to `w-full aspect-square` (remove `h-48`, add `aspect-square`). The `<img>` already has `object-cover` so it will fill the square without distortion. The container class should be: `"w-full aspect-square bg-slate-100"`.
   - **Note:** The conditional render `{detailDish.image && (...)}` means if no image exists, no container is shown at all — this is fine, no square placeholder needed for missing images.

2. **[P2] Fix 2 — PM-118: Detail card missing discount price display + badge**
   - **File:** `pages/PublicMenu/x.jsx`, lines ~3686-3700
   - **Current:** The discount section (lines 3687-3700) shows discounted price + strikethrough original price when `discount_enabled === true && discount_percent > 0`, but:
     - (a) **Missing discount badge** — no `-X%` pill/badge is rendered. The menu cards (tile/list in MenuView.jsx) show a colored badge with `-{percent}%` text, but the detail dialog has none.
     - (b) **Layout order is wrong per spec** — Current order: Name → Description → Price → Reviews. Spec requires: Name → Price+discount → Reviews → Description. The description (`DialogDescription`) is inside `DialogHeader` before the price, and reviews come after price. Need to reorder.
   - **FIX:**
     - (a) Add discount badge after the price spans. Badge markup: `<span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}>-{Math.round((1 - detailDish.price / detailDish.original_price) * 100)}%</span>`. **However**, note that the current code uses `partner.discount_percent` (a global partner-level discount), NOT per-dish `item.original_price`. The task spec says to use `Math.round((1 - item.price / item.original_price) * 100)` — this assumes per-dish original_price field exists. The current codebase uses `partner.discount_percent` everywhere (MenuView tiles, list cards, and detail dialog). **Decision:** Follow the task spec — use `detailDish.original_price` if it exists for the badge percent calculation. If `original_price` is not available on the dish, fall back to `partner.discount_percent` for the badge text.
     - (b) Reorder the detail card content inside `<div className="p-4 space-y-3">`:
       1. Item Name (DialogTitle) — keep as-is
       2. Price line with discount + badge (move UP, before description)
       3. Reviews (keep after price)
       4. Description (move DOWN, after reviews, outside DialogHeader)
       5. Add to Cart button — NO CHANGES
     - The discount guard condition should remain `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` for consistency with the rest of the codebase.

3. **[P3] Fix 3 — PM-115: List-mode stepper position — center instead of bottom-right**
   - **File:** `pages/PublicMenu/MenuView.jsx`, line 151
   - **Current:** `<div className="absolute bottom-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>` — positions the stepper at bottom-right corner of the photo.
   - **FIX:** Change the container classes from `"absolute bottom-1 right-1 z-10"` to `"absolute inset-0 flex items-center justify-center z-10"`. This centers the stepper (and the "+" add button) over the photo. The `onClick={(e) => e.stopPropagation()}` must remain to prevent card navigation when interacting with the stepper.
   - **Note:** This will also center the initial "+" add button (not just the stepper). Both should appear centered per the task description ("stepper overlay position: center of photo"). The task says to only change positioning, not visual style/size — the `w-9 h-9` button and stepper sizes remain unchanged.

## Summary
Total: 3 findings (0 P0, 1 P1, 1 P2, 1 P3)

Note: Correcting — all findings map to the 3 fixes requested. Actual priorities from BUGS_MASTER: PM-117=P3, PM-118=P2, PM-115=P3.
Total: 3 findings (0 P0, 0 P1, 1 P2, 2 P3)

## Prompt Clarity

- **Overall clarity: 5**
- **Ambiguous Fix descriptions:** None. All 3 fixes have clear "current state", "target state", file locations, and verification steps.
- **Missing context:**
  - Fix 2: Minor ambiguity about whether dishes have per-item `original_price` field or only the global `partner.discount_percent`. The spec references `item.original_price` but the current codebase only uses `partner.discount_percent`. This is a data model question — the CC writer assumes the code should follow existing codebase pattern (partner-level discount) unless `original_price` is confirmed to exist on dish records. The badge text can use `partner.discount_percent` directly.
  - Fix 2: The layout order (Name → Price → Reviews → Description) differs from current code order (Name → Description → Price → Reviews). The spec is clear, just noting it requires reordering existing elements.
- **Scope questions:** None — scope lock is explicit and clear. Only detail card in x.jsx (Fix 1+2) and stepper position in MenuView.jsx renderListCard (Fix 3).
