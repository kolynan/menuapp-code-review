---
page: PublicMenu
code_file: pages/PublicMenu/MenuView.jsx
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion
---

# Батч 10 — Menu Cards (BACKLOG #146)

Карточки блюд: цена со скидкой, кнопка «+» на фото, stepper touch targets.
Файл: `MenuView.jsx` only.

## CONTEXT
MenuView.jsx renders dish cards in two modes: list (horizontal card, photo on right) and tile (grid card, photo on top). Three fixes improve card UX: proper discount price calculation, "+" button repositioned to photo edge, and larger touch targets for steppers.

## TARGET
- `pages/PublicMenu/MenuView.jsx` — `renderListCard` and `renderTileCard` functions

## Fix 1 — PM-119 (P2) [MUST-FIX]: Tile/list цена: вычислять скидку, не брать из DB

### Сейчас
Tile and list cards show `item.price` directly from database (integer, e.g. `30`). When discount is enabled, the discounted price should be calculated as `original_price × (1 - discount_percent/100)`. Currently shows `30 ₸` crossed-out `32.01 ₸` — formats don't match and the discount doesn't correspond to the badge percentage.

### Должно быть
Price display logic:
1. If `partner.discount_enabled === true` AND `partner.discount_percent > 0`:
   - Original price = `item.price` (from DB)
   - Discounted price = `item.price × (1 - partner.discount_percent / 100)`
   - Display: **`discounted ₸`** ~~`original ₸`~~ with `-X%` badge
   - Both prices formatted with same precision (e.g. both with decimals or both rounded)
2. If no discount: show `item.price ₸` normally

### НЕ должно быть
- `item.price` shown as discounted price (it's the ORIGINAL price)
- Mismatched number formats between original and discounted (e.g. `30 ₸` vs `32.01 ₸`)
- Discount shown when `discount_enabled !== true` (guard from PM-109 КС must remain)

### Файл и локация
- `MenuView.jsx` → `renderTileCard` function — price section
- `MenuView.jsx` → `renderListCard` function — price section
- Discount check guard: `partner?.discount_enabled === true && partner?.discount_percent > 0`

### Уже пробовали
First reported S171. Not attempted in КС yet — this is the first try. Related: PM-109 КС (S168) added `discount_enabled === true` guard in 5 places — this guard must remain.

### Проверка
1. Enable discount 5% in PartnerSettings → open menu
2. Tile mode: each card shows discounted price bold + original crossed out + `-5%` badge
3. List mode: same display pattern
4. Disable discount → prices show normally, no badge

---

## Fix 2 — #141 (P3) [MUST-FIX]: Кнопка «+» на краю фото — list + tile mode

### Сейчас
The "+" button and stepper (−/count/+) sit inside the card content area, overlapping/covering the dish photo. In list mode, the stepper is in the bottom-right of the card. In tile mode, the "+" is in the bottom-right of the card below the photo.

### Должно быть
"+" button and stepper positioned at the EDGE of the photo (partially overlapping photo, partially outside), with a white border ring. Like Glovo / Bolt Food style.

CSS concept:
```css
position: absolute;
bottom: -10px;
right: -10px;
border: 2.5px solid white;
border-radius: 50%;
```

Both list and tile mode should use the same style. Photo container needs `position: relative; overflow: visible`.

A visual concept exists: `outputs/plus-button-concept.html` (if present).

### НЕ должно быть
- "+" button fully inside the card content area (below photo)
- "+" button fully inside the photo (too much overlap)
- Different styles between list and tile mode
- Stepper (when item count > 0) in a different position than "+" button

### Файл и локация
- `MenuView.jsx` → `renderTileCard` → photo section + "+" button
- `MenuView.jsx` → `renderListCard` → photo section + "+" button/stepper
- Photo container div needs `relative` + `overflow-visible`

### Проверка
1. Tile mode: "+" sits on bottom-right edge of photo with white border
2. List mode: "+" sits on bottom-right edge of photo with white border
3. Add item → stepper replaces "+" in same position on photo edge
4. White border visible around the circle (contrast with photo)

---

## Fix 3 — PM-096 (P3) [MUST-FIX]: Stepper touch targets 32px → 44px

### Сейчас
The "−" and "+" buttons in tile-mode stepper have `w-8 h-8` (32px). This is too small for comfortable mobile touch. Apple HIG recommends minimum 44px.

### Должно быть
Both "−" and "+" buttons: `w-11 h-11` (44px). Counter text between them can remain same size. Apply to both tile and list mode steppers.

### НЕ должно быть
- Buttons smaller than 44px (w-11 h-11)
- Only tile mode updated (list mode must match)

### Файл и локация
- `MenuView.jsx` → `renderTileCard` → stepper buttons (search for `w-8 h-8` or similar small dimensions)
- `MenuView.jsx` → `renderListCard` → stepper buttons

### Уже пробовали
КС-1 S164 included this (w-8→w-11), but subsequent КС runs may have overwritten. Check current value.

### Проверка
1. Add item in tile mode → stepper buttons are large enough to tap comfortably (44px)
2. Add item in list mode → same comfortable size
3. Buttons don't overflow the card boundaries

---

## ⛔ SCOPE LOCK
Only change what is described in Fix 1-3. Do NOT:
- Change category chips, tabs, or navigation
- Modify dish card layout structure (photo position, text order)
- Change detail card (БКБ) — that's in x.jsx, not MenuView
- Alter any CartView, StickyCartBar, or checkout logic
- Remove the `discount_enabled === true` guard added by PM-109

## FROZEN UX (DO NOT CHANGE)
⚠️ НС: заполнить из BUGS_MASTER (все 🟢 Fixed+Tested элементы для MenuView.jsx)

## Implementation Notes
- For Fix 1: partner discount data should already be available in MenuView via props or context (it was used for badge rendering). Check how discount_percent is accessed in existing badge code and use the same source.
- For Fix 2: if photo container currently has `overflow: hidden`, changing to `overflow: visible` may affect photo clipping — test with both photos that fit and photos that don't.
