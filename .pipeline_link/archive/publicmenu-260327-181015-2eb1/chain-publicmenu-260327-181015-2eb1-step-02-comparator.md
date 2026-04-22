---
chain: publicmenu-260327-181015-2eb1
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260327-181015-2eb1
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260327-181015-2eb1-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260327-181015-2eb1-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260327-181015-2eb1-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260327-181015-2eb1

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# UX Batch 13: MenuView точечные фиксы + detail card star (#183)

Reference: `BUGS_MASTER.md` (PM-119, PM-132, PM-147, PM-124), `DECISIONS_INDEX.md §3,§5`, `STYLE_GUIDE.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** 4 targeted fixes across MenuView.jsx and x.jsx. Fix 1 (PM-119) touches both files.
Fix 2 and Fix 3 are MenuView.jsx only. Fix 4 (PM-124) is x.jsx only.

**TARGET FILES (modify):**
- `pages/PublicMenu/MenuView.jsx` — Fix 1 (PM-119 list+tile cards), Fix 2 (PM-132 list stepper), Fix 3 (PM-147 list description)
- `pages/PublicMenu/x.jsx` — Fix 1 (PM-119 detail card), Fix 4 (PM-124 detail card star icon)

**CONTEXT FILES (read-only):**
- `pages/PublicMenu/BUGS.md`
- `pages/PublicMenu/README.md`

---

## Fix 1 — PM-119 (P2) [MUST-FIX]: Discounted price uses Math.round — wrong formatter

### Current behavior
In list/tile cards (MenuView.jsx) and detail card (x.jsx), the discounted price is calculated as:
```
formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100)
```
This causes the discounted price to display as an integer (e.g., `30 ₸`) while the original price shows
with decimals (e.g., `32.01 ₸`). The formats mismatch and the discounted price is visually incorrect.

### Expected behavior
Discounted price MUST use the SAME formatter as original price — no Math.round wrapping.
Replace with: `formatPrice(dish.price * (1 - partner.discount_percent / 100))`
Let `formatPrice` handle all rounding/formatting (it uses toFixed(2) + thousands separator — Kaspi-style).
Ref: DECISIONS_INDEX.md §3 "Форматирование — toFixed(2), НЕ Math.round".

### Must NOT
- No `Math.round()` wrapping when calling `formatPrice` for discounted price.
- Do NOT change how original price (`formatPrice(dish.price)`) is displayed.
- Do NOT change the discount badge (–X%) logic or colors.

### File and location
**pages/PublicMenu/MenuView.jsx:**
- renderListCard ~line 103: `formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100)`
  → replace with: `formatPrice(dish.price * (1 - partner.discount_percent / 100))`
- renderTileCard ~line 281: same pattern, same fix.

**pages/PublicMenu/x.jsx:**
- Detail card drawer ~line 3893: `formatPrice(Math.round(detailDish.price * (1 - partner.discount_percent / 100) * 100) / 100)`
  → replace with: `formatPrice(detailDish.price * (1 - partner.discount_percent / 100))`
- Search for: `Math.round(dish.price` and `Math.round(detailDish.price` to locate all occurrences.

### Previously tried
Chain 74b9 S178: used `Math.round` — confirmed WRONG. The fix is to REMOVE Math.round entirely.

### Verification
1. Enable discount in partner settings. View menu in list mode.
   Discounted price (e.g. `30.41 ₸`) must match format of original price (`32.01 ₸`). No integer display.
2. Open dish detail card drawer → discounted price must use the same format.

---

## Fix 2 — PM-132 (P2) [MUST-FIX]: List mode stepper buttons too small (36px, must be 44px)

### Current behavior
In list mode (`renderListCard` in MenuView.jsx), the stepper container and buttons use `w-9 h-9` = 36px.
This is below the required 44px minimum touch target.

### Expected behavior
All stepper elements in `renderListCard` must use `w-11 h-11` = 44px — matching tile mode.
Ref: STYLE_GUIDE.md "Min touch target: 44×44px (h-11 w-11)". DECISIONS_INDEX.md §10 "icon 44×44".

### Must NOT
- Do NOT change tile mode stepper (`renderTileCard`, ~lines 234–256, uses `w-11 h-11`) — it is already correct (PM-096 ✅ Tested FROZEN).
- Do NOT change the round "+" overlay button on the card image — that is a separate button (PM-108/PM-110 ✅ Tested FROZEN).
- Do NOT reposition, restyle, or restructure the stepper pill — only update size classes.

### File and location
**pages/PublicMenu/MenuView.jsx, renderListCard, ~lines 156–178:**
- Search `renderListCard` for all `w-9 h-9` occurrences — there are 3 buttons + 1 container:
  - ~line 156: main "+" button container → `w-9 h-9` → `w-11 h-11`
  - ~line 164: stepper pill container → `h-9 px-1` → `h-11 px-1.5`
  - ~line 168: "−" button → `w-9 h-9` → `w-11 h-11`
  - ~line 178: "+" button → `w-9 h-9` → `w-11 h-11`

### Verification
Open menu in list mode. Add item. Stepper buttons (–/+) must be clearly tappable ≥44px.
Visually matches tile-mode stepper size.

---

## Fix 3 — PM-147 (P3) [MUST-FIX]: List mode dish description truncated to 1 line

### Current behavior
In list mode (`renderListCard` in MenuView.jsx), dish description uses `line-clamp-1` — only 1 line shows.
For longer RU/KK descriptions this is too little context.

### Expected behavior
Change to `line-clamp-2` — show up to 2 lines. Standard: Wolt/Uber Eats.
Ref: STYLE_GUIDE.md line-clamp rule. DECISIONS_INDEX.md §5 "Описание в list mode — PM-147".

### Must NOT
- Do NOT change the description in `renderTileCard` (~line 272) — leave it as-is.
- Do NOT change dish name truncation (~line 94, `line-clamp-2`) — leave as-is.

### File and location
**pages/PublicMenu/MenuView.jsx, renderListCard, ~line 96:**
```
<p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
```
→ change `line-clamp-1` to `line-clamp-2`. ONE character change on ONE line.

### Verification
Open menu in list mode. A dish with long description must show 2 lines instead of being cut at 1.

---

## Fix 4 — PM-124 (P3) [MUST-FIX]: Detail card (БКБ) missing star icon next to rating

### Current behavior
In the dish detail drawer (`pages/PublicMenu/x.jsx`, ~lines 3911–3915), the rating block renders:
```jsx
<div className="flex items-center gap-1 text-sm text-slate-500">
  <span>{dishRatings[detailDish.id]?.avg?.toFixed(1)}</span>
  <span>({dishRatings[detailDish.id]?.count})</span>
</div>
```
Result: displays `4.8 (6)` — NO star icon. Inconsistent with list/tile mode.

In MenuView.jsx (list/tile mode), ratings are shown via `<DishRating avgRating=... reviewCount=... />`
which includes the star icon.

### Expected behavior
Replace the raw span block with `<DishRating>` component — same as MenuView.jsx uses.
Result: `⭐ 4.8 (6)` with star icon. Consistent with list/tile mode.

### Must NOT
- Do NOT change the `Rating` import on line ~94 (`import Rating from "@/components/Rating"`) — that is a DIFFERENT component for a different feature. Leave it.
- Do NOT change the position/order of sections in detail card.
  Section order is FROZEN (PM-123 ✅): Photo → Name → Description → Price+Discount → Rating → Add button.
- Do NOT add an onClick handler to DishRating — reviews are read-only from the detail card (no drill-down needed here).

### File and location
**pages/PublicMenu/x.jsx:**

1. Add import near top of file (around line 94, after existing imports):
   ```jsx
   import DishRating from "@/components/publicMenu/DishRating";
   ```
   NOTE: x.jsx currently does NOT have DishRating imported. Confirmed via grep. Add it.
   NOTE: `import Rating from "@/components/Rating"` (line ~94) is a DIFFERENT component — leave it.

2. Replace the rating block at ~lines 3911–3915:
   ```jsx
   {showReviews && dishRatings?.[detailDish.id] && (
     <div className="flex items-center gap-1 text-sm text-slate-500">
       <span>{dishRatings[detailDish.id]?.avg?.toFixed(1)}</span>
       <span>({dishRatings[detailDish.id]?.count})</span>
     </div>
   )}
   ```
   Replace with:
   ```jsx
   {showReviews && dishRatings?.[detailDish.id] && (
     <DishRating
       avgRating={dishRatings[detailDish.id]?.avg}
       reviewCount={dishRatings[detailDish.id]?.count}
     />
   )}
   ```

NOTE on context: `detailDish` is the state for the dish detail bottom drawer (line ~1339, `const [detailDish, setDetailDish] = useState(null)`).
This is NOT the same as `selectedDishId` (which controls `DishReviewsModal`). Do not confuse them.

### Verification
Tap any dish card → dish detail drawer opens. Rating section must show star + number (e.g. ⭐ 4.8 (6)).
Must match appearance of rating in list/tile mode cards.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested. Do NOT modify, remove, reposition, or restyle:
- **PM-108 ✅**: List card — horizontal flex layout, photo 96px on the right, rounded-xl
- **PM-110 ✅**: List card — "+" button as absolute overlay bottom-right OF THE PHOTO (not separate row)
- **PM-111 ✅**: Tile card — "+" button overlay on image
- **PM-096 ✅**: Tile mode stepper — `w-11 h-11` (44px) in renderTileCard — DO NOT change
- **PM-122 ✅**: Detail card opens as bottom drawer (not inline), via `detailDish` state
- **PM-123 ✅**: Detail card section order — Photo → Name → Description → Price+Discount → Rating → Add button
- **PM-118 ✅**: Discount display in detail card uses partner-level fields (not item-level)
Any change to a FROZEN element = task FAILURE.

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Modify ONLY the code described in Fix 1–4 sections above.
- Do NOT change ANY other styling, layout, colors, behavior, or UX patterns.
- If you notice a bug outside this task — IGNORE it completely.
- Locked UX elements listed in FROZEN UX — FORBIDDEN to modify.

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/x.jsx`
- Do NOT break: tile stepper (PM-096), card layout (PM-108/110/111), detail card layout (PM-122/123)
- git add `pages/PublicMenu/MenuView.jsx` `pages/PublicMenu/x.jsx` && git commit -m "fix: PM-119 discount formatter, PM-132 list stepper 44px, PM-147 desc 2-line, PM-124 detail star" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] List mode stepper: touch targets visibly ≥44×44px after w-9→w-11 change
- [ ] List card with 2-line description doesn't break layout or create excessive card height on small screens
- [ ] Detail card rating star renders correctly inline, doesn't overflow
- [ ] No duplicate visual indicators anywhere
- [ ] All touch targets ≥44×44px (h-11 w-11)

## Regression Check (MANDATORY after implementation)
These must continue to work after all changes:
- [ ] Tile mode stepper still `w-11 h-11` (PM-096 FROZEN — grep: `renderTileCard` → `w-11 h-11`)
- [ ] Discount badge (–X%) still visible in list, tile, and detail card
- [ ] Original price format unchanged (`formatPrice(dish.price)` — no Math.round added)
- [ ] Detail card drawer still opens on card tap and closes correctly
- [ ] `Rating` component import (line ~94) unchanged

## E3 FROZEN UX grep verification
Before committing, run these greps to confirm FROZEN elements are untouched:

```bash
# PM-096: tile stepper must still be w-11 h-11 in renderTileCard
grep -A5 "renderTileCard" pages/PublicMenu/MenuView.jsx | grep "w-11"

# PM-108/110: list card photo still has w-24 h-24 right-side
grep -n "w-24 h-24" pages/PublicMenu/MenuView.jsx

# PM-123: detail card section order (photo → name → desc → price → rating → button)
grep -n "getDishName\|getDishDescription\|formatPrice.*detailDish\|showReviews.*dishRatings\|add_to_cart" pages/PublicMenu/x.jsx | head -10
```
=== END ===
