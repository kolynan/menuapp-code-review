---
page: PublicMenu
code_file: pages/PublicMenu/MenuView.jsx
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion
---

# Feature + Fix: Batch 10 — Menu Cards (#146, PM-119, #141)

Reference: `BUGS_MASTER.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app (PublicMenu / MenuView.jsx).

**Context:** Two card improvements in MenuView.jsx: (1) discount price shown in tile/list cards is taken from DB integer instead of calculated — causing format mismatch with the discount badge; (2) the "+" button sits 8px inside the photo instead of on the edge (Glovo/Bolt Food style). Note: PM-096 (stepper 44px) is ALREADY FIXED (confirmed w-11 h-11 in code) — do NOT touch stepper sizes.

TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
CONTEXT FILES (read-only): `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

---

## Fix 1 — PM-119 (P2) [MUST-FIX]: Tile/list price — calculate discount, don't use DB integer

Search for `renderListCard` and `renderTileCard` in `pages/PublicMenu/MenuView.jsx`.

### Current behavior
Tile and list cards display `item.price` directly from database (integer, e.g. `30`). When discount is active, the page shows `30 ₸` crossed-out with `32.01 ₸` as "original" — formats don't match and the discounted price is wrong.

### Expected behavior
Price display logic (apply to BOTH `renderTileCard` and `renderListCard`):

1. If `partner?.discount_enabled === true` AND `partner?.discount_percent > 0`:
   - Original price = `item.price` (from DB, display crossed-out)
   - Discounted price = `Math.round(item.price * (1 - partner.discount_percent / 100) * 100) / 100`
   - Display: **`discounted ₸`** ~~`original ₸`~~ with `-X%` badge
   - Both prices use the same number format (consistent decimals)
2. If no discount active: show `item.price ₸` normally (no change)

Check how `partner.discount_percent` is accessed in the existing badge rendering code — use the SAME source (props or context).

### НЕ должно быть
- `item.price` shown as the DISCOUNTED price (it is the original price)
- Mismatched number formats: e.g. `30 ₸` vs `32.01 ₸`
- Discount shown when `discount_enabled !== true` (the guard from PM-109 КС must stay intact)
- Any change to the `-X%` badge itself — badge already works correctly

### Файл и локация
- `MenuView.jsx` → `renderTileCard` — price section
- `MenuView.jsx` → `renderListCard` — price section
- Guard: `partner?.discount_enabled === true && partner?.discount_percent > 0` (search this string)

### Проверка
1. Enable 10% discount in PartnerSettings → open menu
2. Tile mode: card shows `discounted ₸` bold + `~~original ₸~~` + `-10%` badge, formats consistent
3. List mode: same pattern
4. Disable discount → prices show normally, no badge, no strikethrough

---

## Fix 2 — #141 (P3) [MUST-FIX]: "+" button on photo EDGE — list + tile mode (Glovo style)

Search for `PM-108+PM-110` (list mode) and `PM-111` (tile mode) comments in `pages/PublicMenu/MenuView.jsx`.

### Current behavior
Both list and tile mode: "+" button is `absolute bottom-2 right-2` (8px from photo edge, fully INSIDE the photo boundary). Photo container has `overflow-hidden` which clips the button edge.

### Expected behavior
"+" button (and stepper when count > 0) positioned at the EDGE of the photo, partially overlapping photo and partially outside — Glovo / Bolt Food style:

```
Photo container:
  position: relative
  overflow: visible   ← change from overflow-hidden

"+" button wrapper div:
  absolute bottom-[-10px] right-[-10px]   (or: style={{bottom: '-10px', right: '-10px'}})

"+" button:
  white border ring: border-2 border-white  (or: ring-2 ring-white)
  Keep: rounded-full, w-11 h-11, shadow-md, primaryColor background
```

Apply the SAME style to both list mode and tile mode. When count > 0, the stepper pill replaces the "+" in the same edge position.

### НЕ должно быть
- Button fully inside photo (bottom-2 right-2 with overflow-hidden)
- Button fully outside/below photo (bottom offset too large)
- Different positioning between list and tile mode
- Loss of white border ring
- `overflow-hidden` remaining on photo container div (it clips the button)
- Stepper moving to a different position than where "+" was

### Файл и локация
- List mode: `pages/PublicMenu/MenuView.jsx` → `renderListCard` → photo wrapper div (currently `overflow-hidden`, ~line 127) + button div (~line 151: `absolute bottom-2 right-2`)
- Tile mode: `pages/PublicMenu/MenuView.jsx` → `renderTileCard` → photo wrapper div + button div (~line 229: `absolute bottom-2 right-2`)

### Проверка
1. Tile mode: "+" sits on bottom-right EDGE of photo, half inside / half outside, with white border ring
2. List mode: same edge positioning with white border ring
3. Add item in tile → stepper pill in same edge position (not shifted inside the photo)
4. Add item in list → stepper pill in same edge position
5. Photo still displays correctly (no clipping of the photo itself)

---

## FROZEN UX (DO NOT CHANGE)

These elements are confirmed working and tested in MenuView.jsx — do NOT modify:
- `discount_enabled === true && discount_percent > 0` guard present in 5 places (PM-109 ✅) — Fix 1 must keep this guard, never use `discount_enabled` without `=== true`
- Stepper button sizes: `w-11 h-11` on all −/+ buttons, tile and list mode (PM-092, PM-096 ✅) — DO NOT change
- Tapping a dish card opens the detail drawer (PM-102 ✅) — Fix 2 must not break card tap
- Toast on add-to-cart: visible, top-center, correct timing (AC-09, PM-103 ✅) — do not touch toast logic
- Category chips use `primaryColor` (PM-062 ✅) — do not touch
- "+" button position = bottom-right of photo (PM-077 ✅) — Fix 2 keeps this direction, only changes offset/overflow

## ⛔ SCOPE LOCK — modify ONLY what is described in Fix 1 and Fix 2 above
- Do NOT touch CartView.jsx, x.jsx, or any file other than `pages/PublicMenu/MenuView.jsx`
- Do NOT change stepper sizes (already w-11 h-11, correct)
- Do NOT change category chips, tabs, or header
- Do NOT modify detail card logic (that is in x.jsx)
- Do NOT alter discount badge rendering (only price calculation)
- If you see another issue outside Fix 1-2 scope — SKIP it, do not fix

## Regression Check (MANDATORY after implementation)
Confirm these STILL work correctly after your changes:
- [ ] Tapping a dish card opens the detail drawer (not broken by Fix 2 photo container change)
- [ ] Discount badge `-X%` still displays correctly (not broken by Fix 1 price logic)
- [ ] Cart still receives correct item.price (Fix 1 must only affect DISPLAY, not cart payload)
- [ ] Stepper buttons still 44px touch targets (w-11 h-11 unchanged)
- [ ] Toast appears when adding a dish to cart

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Tile mode: "+" button visible on photo edge, not clipped
- [ ] List mode: "+" button visible on photo edge, not clipped
- [ ] Discount price display fits in card without text overflow
- [ ] Touch targets >= 44x44px for all +/− buttons
- [ ] No layout shift in card when discount is active vs inactive

## Implementation Notes
- For Fix 1: check how discount_percent is already used in the badge rendering code — it must be accessible from the same scope as `renderTileCard` / `renderListCard`. Use that exact same variable.
- For Fix 2: `overflow: visible` on photo container should not affect photo display (the image itself is bounded by width/height). But if photo has `rounded-xl` that clips via overflow — consider moving `rounded-xl` to the img tag instead of the container.
- FROZEN UX grep — run before commit to confirm unchanged:
  - `grep -n "w-11 h-11" pages/PublicMenu/MenuView.jsx` → must return multiple results (stepper buttons)
  - `grep -n "discount_enabled === true" pages/PublicMenu/MenuView.jsx` → must return ≥1 result
  - `grep -n "bottom-2 right-2" pages/PublicMenu/MenuView.jsx` → must return 0 results after Fix 2
- `git add pages/PublicMenu/MenuView.jsx && git commit -m "feat: batch10 — discount price calc + photo-edge plus button" && git push`
