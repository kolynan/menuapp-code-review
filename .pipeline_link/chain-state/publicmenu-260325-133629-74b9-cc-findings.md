# CC Writer Findings — PublicMenu
Chain: publicmenu-260325-133629-74b9

## Findings

### Fix 1 — PM-119: Tile/list price — discount calculation inconsistency

1. **[P2] Tile mode discount formula rounds to integer** (line 281) — `Math.round(dish.price * (1 - partner.discount_percent / 100))` drops all decimals. E.g. price=35, discount=15% → `Math.round(35*0.85)` = `Math.round(29.75)` = **30** instead of **29.75**. This makes the discounted price HIGHER than expected and produces a misleading display. FIX: Change to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100` to preserve 2 decimal places.

2. **[P2] List mode discount formula uses different pattern than tile** (line 103) — List mode uses `parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2))` which is functionally correct but uses a different pattern than tile. Both should use the same formula for consistency and maintainability. FIX: Standardize both to `Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100`.

3. **[P2] Format mismatch between tile and list when discount active** — Because tile rounds to integer and list keeps 2 decimals, the same dish at the same discount shows different prices in different view modes (e.g. tile shows "30 ₸", list shows "29.75 ₸"). FIX: Both findings #1 and #2 above resolve this — once both use the same formula, formats will be consistent.

### Fix 2 — #141: "+" button on photo EDGE (Glovo style)

4. **[P3] List mode: photo container `overflow-hidden` clips button at edge position** (line 127) — `className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100"`. The `overflow-hidden` will clip any button positioned outside the container boundary. FIX: Remove `overflow-hidden` from the container div. Change to `overflow-visible`. Move `rounded-xl` to the `<img>` tag (line 130→ add `rounded-xl`) and to the no-image placeholder div (line 137→ add `rounded-xl`), so the image itself is still rounded but the container doesn't clip the button. Keep `bg-slate-100 rounded-xl` on container for background shape.

5. **[P3] List mode: "+" button position `bottom-2 right-2` is 8px inside photo** (line 151) — `className="absolute bottom-2 right-2 z-10"`. This places the button fully inside the photo. FIX: Change to `absolute bottom-[-10px] right-[-10px] z-10` (or use `style={{bottom: '-10px', right: '-10px'}}` if Tailwind arbitrary values aren't supported). This positions the button on the edge — half inside, half outside the photo.

6. **[P3] List mode: "+" button missing white border ring** (line 156) — The "+" button has no white border ring to visually separate it from the photo when on the edge. FIX: Add `border-2 border-white` to the `<button>` className on line 156. Also add same border to the stepper pill container div on line 164 (`border-2 border-white`).

7. **[P3] Tile mode: Card `overflow-hidden` clips button at edge position** (line 199) — `className="relative overflow-hidden hover:shadow-md ..."`. The Card's `overflow-hidden` will clip a button positioned at `right-[-10px]` because 10px extends beyond the Card boundary to the right. FIX: Remove `overflow-hidden` from the Card className. To maintain rounded image corners, add `rounded-t-xl` to the `<img>` tag (line 208) and the no-image placeholder div (line 213). The Card component already has its own rounded border from shadcn — image needs explicit rounding to match.

8. **[P3] Tile mode: "+" button position `bottom-2 right-2` is 8px inside photo** (line 229) — Same issue as list mode. FIX: Change to `absolute bottom-[-10px] right-[-10px] z-10`.

9. **[P3] Tile mode: "+" button missing white border ring** (line 234) — Same as list mode. FIX: Add `border-2 border-white` to the `<button>` className on line 234. Also add `border-2 border-white` to the stepper pill container div on line 242.

10. **[P3] Tile mode: discount badge may be clipped after removing Card overflow-hidden** — After removing `overflow-hidden` from Card (finding #7), the discount badge (line 219-226) positioned `absolute top-2 left-2` inside the photo div is fine since it's within bounds. No action needed — just noting for regression awareness.

### Regression Concerns

11. **[INFO] Card tap area after overflow change** — Removing `overflow-hidden` from Card (tile) and photo container (list) should NOT break card tap-to-open-detail behavior, because `onClick` is on the Card/CardContent elements, not on the overflow container. The `e.stopPropagation()` on the button wrapper (lines 151, 229) correctly prevents button taps from triggering card open. No fix needed — just confirming.

12. **[INFO] Cart payload unaffected by Fix 1** — Fix 1 changes only the DISPLAY formula. The `addToCart(dish)` call (lines 59, 154, 232) passes the full `dish` object — the cart receives `dish.price` (original DB value) regardless of display formatting. No fix needed — confirming Fix 1 is display-only.

## Summary
Total: 9 actionable findings (0 P0, 0 P1, 3 P2, 6 P3) + 2 INFO notes

- Fix 1 (PM-119): 3 findings — tile formula rounds to integer (P2), list uses different pattern (P2), format mismatch between modes (P2, resolved by fixing #1+#2)
- Fix 2 (#141): 6 findings — overflow-hidden clips button in both modes (P3×2), button position 8px inside in both modes (P3×2), missing white border ring in both modes (P3×2)

## ⛔ Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. Both Fix 1 and Fix 2 are exceptionally detailed with exact line numbers, expected behavior, formulas, CSS classes, and verification steps.
- Missing context: None. The FROZEN UX section and implementation notes are very helpful.
- Scope questions: None. SCOPE LOCK is crystal clear. The only minor note: the task mentions "If photo has `rounded-xl` that clips via overflow — consider moving `rounded-xl` to the img tag" which is exactly what's needed for list mode (line 127 has `rounded-xl overflow-hidden`).
