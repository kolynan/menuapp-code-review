---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion
---

# Батч 11 — StickyCartBar Redesign + Detail Card (BACKLOG #147)

StickyCartBar → Uber Eats style (вся панель = кнопка) + звёздочка в detail card.
Файл: `x.jsx` only.

## CONTEXT
StickyCartBar is the bottom panel that shows cart summary and opens the cart drawer. Currently it has a cart icon + two lines of text + a separate button — cluttered and small tap target. Redesign to Uber Eats style: entire panel = one big tappable button.

## TARGET
- `pages/PublicMenu/x.jsx` — StickyCartBar component/section + detail card drawer

## Fix 1 — #144 (P3) [MUST-FIX]: StickyCartBar → Uber Eats style (вся панель = одна кнопка)

### Сейчас
Current StickyCartBar layout:
```
┌─────────────────────────────────────────────┐
│ 🛒  КОРЗИНА: 6 ПОЗИЦИЙ  │  Оформить заказ  │
│      14 496.76 ₸        │                  │
└─────────────────────────────────────────────┘
```
Problems: ALL CAPS text, verbose "КОРЗИНА: 6 ПОЗИЦИЙ", cart icon doesn't match terracotta theme, price shows kopecks (14496.76), separate button area (small tap target), two-line text layout is cramped.

### Должно быть
New layout — entire panel is ONE tappable area:
```
┌─────────────────────────────────────────────┐
│  ⑥    Оформить заказ            14 497 ₸   │
└─────────────────────────────────────────────┘
```

Specifications:
1. **Entire panel is clickable** — any tap anywhere opens the cart. No separate button.
2. **Left: count badge** — circle with item count (e.g. "6"), white text on primary_color background
3. **Center: "Оформить заказ"** — regular weight text, white color
4. **Right: total price** — bold, white, rounded to integer (no kopecks). Use `Math.round()`.
5. **Background**: solid `primary_color` (terracotta/dark red from partner settings), full width
6. **Height**: ~56px, comfortable touch target
7. **Price formatting**: thousands separator (space), no decimals. `14 497 ₸` not `14496.76 ₸`
8. **Responsive**: when price has many digits (e.g. `1 114 497 ₸`), center text compresses, price never truncates

### НЕ должно быть
- Separate "Оформить заказ" button (the WHOLE bar is the button)
- Cart icon (🛒) — replaced by count badge
- ALL CAPS text ("КОРЗИНА: 6 ПОЗИЦИЙ")
- Two lines of text
- Decimal kopecks in price (14496.76 → 14 497)
- Purple/lavender accent (use primary_color from partner)

### Файл и локация
- `x.jsx` — search for "StickyCartBar" or "КОРЗИНА" or "Оформить заказ" in the bottom panel section
- The entire bar component/div should become a single `onClick` handler that opens cart
- Remove internal button component, make the outer container the interactive element

### Проверка
1. Add items to cart → bottom bar shows: badge "3" + "Оформить заказ" + "14 497 ₸"
2. Tap anywhere on the bar → cart opens
3. Price is rounded (no decimals): 14496.76 → 14 497
4. Badge shows correct count
5. No ALL CAPS, no cart icon, no two-line text

---

## Fix 2 — PM-124 (P3) [MUST-FIX]: Звёздочка ⭐ у рейтинга в detail card

### Сейчас
In detail card (БКБ, dish detail drawer), the rating shows as plain text `4.8 (6)` without a star icon. In MenuView (list and tile cards), the star ⭐ is present: `⭐ 4.8 (6)`.

### Должно быть
Detail card rating display: `⭐ 4.8 (6)` — yellow star icon before the number, matching the style in MenuView.jsx cards. Use the same star component/icon as MenuView uses (likely `Star` from lucide-react filled yellow, or a text emoji ⭐, or an SVG).

### НЕ должно быть
- Rating without star icon in detail card
- Different star style between MenuView cards and detail card

### Файл и локация
- `x.jsx` — detail card drawer section (search for rating display near PM-122/PM-123 fix area)
- Look at how rating is rendered in `MenuView.jsx` (renderListCard / renderTileCard) and replicate the star icon in detail card
- The rating section is likely after price+discount and before the "Добавить в корзину" button

### Проверка
1. Open detail card for a dish with reviews → see `⭐ 4.8 (6)` with yellow star
2. Compare with list/tile card → star looks the same

---

## ⛔ SCOPE LOCK
Only change what is described in Fix 1-2. Do NOT:
- Change StickyCartBar visibility logic or state management (PM-058/059/065/066 — separate batch)
- Change StickyCartBar animation behavior (PM-061/067 — separate batch)
- Modify cart drawer content or layout
- Change dish card rendering in MenuView
- Modify Android Back behavior (that's Batch 9)
- Alter drawer open/close mechanisms

## FROZEN UX (DO NOT CHANGE)
⚠️ НС: заполнить из BUGS_MASTER (все 🟢 Fixed+Tested элементы для x.jsx)

## Implementation Notes
- StickyCartBar redesign is the heaviest task. The current component likely has complex conditional rendering for different states. This fix only changes the VISUAL layout, not the state logic.
- For price rounding: `Math.round(total)` then format with thousands separator. The existing `useCurrency` hook may already handle formatting — check if it can be configured to skip decimals.
- Badge circle: simple `flex items-center justify-center rounded-full w-7 h-7 bg-white/20 text-white text-sm font-bold` or similar.
