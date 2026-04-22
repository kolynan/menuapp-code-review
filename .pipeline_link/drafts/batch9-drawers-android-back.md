---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 15
agent: cc+codex
chain_template: consensus-with-discussion
---

# Батч 9 — Drawers & Android Back (BACKLOG #145)

Единый паттерн Android Back для всех drawers + колокольчик + шевроны.
Файлы: `x.jsx` (primary) + `CartView.jsx` (secondary).

## CONTEXT
All drawers in the app must behave consistently: Android hardware back button should close the topmost drawer instead of navigating back in browser. Pattern: `history.pushState` on drawer open + `popstate` listener to close.

The app has 4 drawers that need this pattern:
1. БКБ (detail card) — opens when user taps a dish card
2. Cart (CartView) — opens from StickyCartBar
3. Table code input — opens when user submits order without table code
4. "Нужна помощь?" (help) — opens from bell icon. Currently a Dialog, must become a Drawer.

## TARGET
- `pages/PublicMenu/x.jsx` — detail card drawer, table code BS, help dialog, bell icon on main menu
- `pages/PublicMenu/CartView.jsx` — cart drawer, chevron in table info card

## Fix 1 — PM-126 (P2) [MUST-FIX]: Android Back → единый pushState паттерн для ВСЕХ drawers

### Сейчас
When any drawer is open (detail card, cart, table code, help), pressing Android hardware Back button closes the entire browser tab instead of just the drawer.

### Должно быть
Pressing Android Back when a drawer is open → closes that drawer, returns to menu. Pattern: when drawer opens → `window.history.pushState({drawer: 'name'}, '')`. Add `popstate` listener → if event matches → close the drawer.

Implement as a **reusable hook or utility** (e.g. `useAndroidBack(isOpen, onClose)`) that can be applied to all 4 drawers. Do NOT implement separately for each drawer.

### НЕ должно быть
- Separate pushState logic copy-pasted in 4 places
- Browser navigating back when drawer is open
- Multiple pushState entries stacking (if user opens drawer, closes, opens again — only 1 entry)

### Файл и локация
- `x.jsx`: detail card drawer (search for PM-122, `Drawer` component for dish detail), table code Bottom Sheet, help dialog
- `CartView.jsx`: cart Bottom Sheet

### Проверка
1. Open БКБ (detail card) → press Android Back → drawer closes, menu visible
2. Open cart → press Android Back → cart closes
3. Open table code input → press Android Back → input closes
4. Open help → press Android Back → help closes
5. On main menu (no drawer open) → press Android Back → normal browser behavior (go back)

---

## Fix 2 — PM-125 (P2) [MUST-FIX]: «Нужна помощь?» Dialog → Drawer + auto-close cart

### Сейчас
Bell icon 🔔 in cart's table info card ("Стол — Гость #1313") is clickable and opens "Нужна помощь?" as a **Dialog** (centered modal). Problem: the Dialog opens BEHIND the cart drawer (z-index conflict). User doesn't see it until they manually swipe cart down.

### Должно быть
1. Click bell → **auto-close cart drawer first**
2. Then show "Нужна помощь?" as a **Drawer (bottom sheet)**, not Dialog
3. Drawer contains: title "Нужна помощь?", subtitle, table number field, 5 option buttons (Позвать официанта, Счёт, Салфетки, Меню, Другое), comment textarea, Cancel + Submit buttons
4. Apply Android Back pattern from Fix 1

### НЕ должно быть
- Dialog component for "Нужна помощь?" (replace with Drawer/Bottom Sheet)
- Help appearing behind cart (z-index issue)
- Cart remaining open when help is shown

### Файл и локация
- Bell icon click handler: in `CartView.jsx` (table info card row with bell icon)
- Help dialog component: in `x.jsx` (search for "Нужна помощь" or "needHelp" or "helpDialog")
- Need to pass a callback from CartView to close cart before showing help

### Проверка
1. Open cart → tap bell icon → cart slides down → help drawer slides up
2. Help drawer shows all options (Позвать официанта, Счёт, Салфетки, Меню, Другое)
3. Tap "Отмена" or swipe down → help closes → StickyCartBar visible to reopen cart

---

## Fix 3 — PM-127 (P2) [MUST-FIX]: Вернуть колокольчик на главное меню

### Сейчас
Bell icon 🔔 is missing from the main menu screen (when cart is not open). It was present before but likely removed by a recent КС run (regression). The bell only appears inside CartView's table info card.

### Должно быть
Bell icon visible on main menu screen (outside cart). When tapped → opens "Нужна помощь?" drawer directly (no cart involved). Possible locations: in the header area, or as a floating button, or near StickyCartBar.

Look at git history to find where the bell was previously rendered on main menu. Restore it. Apply the Drawer pattern from Fix 2 (same component).

### НЕ должно быть
- Bell icon missing from main menu
- Bell only visible inside cart

### Файл и локация
- `x.jsx` — search git history for bell/notification icon rendering on main page (outside CartView)
- Likely near header or PublicMenuHeader component

### Проверка
1. Load menu page (no cart open) → bell icon visible somewhere on screen
2. Tap bell → "Нужна помощь?" drawer opens
3. Submit help request → works correctly

---

## Fix 4 — #143 (P3) [MUST-FIX]: Шеврон ˅ на drawer кода стола

### Сейчас
Table code input drawer (Bottom Sheet "Введите код стола") has no chevron button to close it. The only way to close is swiping down. Other drawers (e.g. detail card) have a nice grey circle chevron ˅ in the top-right corner.

### Должно быть
Add `ChevronDown` icon button in top-right corner of table code input drawer. Same style as detail card drawer: grey circle background, white chevron icon. Click → closes the drawer.

### НЕ должно быть
- Table code drawer without a close button
- Chevron in a different style than detail card (must match)

### Файл и локация
- `x.jsx` — table code Bottom Sheet (search for "Введите код стола" or "tableCode" or "verifyCode")

### Проверка
1. Open table code input → grey circle chevron visible in top-right
2. Tap chevron → drawer closes

---

## Fix 5 — #140 (P3) [MUST-FIX]: Шеврон ˅ → правая часть карточки стола в CartView (не липкий)

### Сейчас
CartView has a separate sticky row with a chevron ˅ above the table info card ("Стол — Гость #1313"). This row wastes vertical space and doesn't look natural.

### Должно быть
1. Remove the separate chevron row entirely
2. Add ChevronDown icon button to the RIGHT side of the table info card (same row as bell icon + "Стол — Гость #XXXX")
3. The chevron is NOT sticky — it scrolls with the content
4. Cart closure: swipe down (native drawer behavior) or tap chevron in table card

Layout of table info card after fix:
```
┌─────────────────────────────────────────┐
│  🔔  Стол —                         ˅  │
│       Вы: Гость #1313 ✏️               │
└─────────────────────────────────────────┘
```

### НЕ должно быть
- Separate row/bar with chevron above the table card
- Sticky chevron (must scroll with content)
- Chevron appearing outside the table info card

### Файл и локация
- `CartView.jsx` — header section: find the `ChevronDown` button/row (currently separate), move it inside the table info card div
- Remove any `sticky` or `fixed` positioning from the chevron

### Проверка
1. Open cart → chevron visible in right side of table info card (same row as bell)
2. Scroll down in cart → chevron scrolls away (not sticky)
3. Swipe down → cart closes (native behavior still works)

---

## ⛔ SCOPE LOCK
Only change what is described in Fix 1-5. Do NOT:
- Change dish card rendering, prices, steppers, or any MenuView content
- Modify StickyCartBar appearance or behavior
- Change order submission logic or table code validation
- Alter any styles/layout of cart items list or checkout flow

## FROZEN UX (DO NOT CHANGE)
⚠️ НС: заполнить из BUGS_MASTER (все 🟢 Fixed+Tested элементы для x.jsx и CartView.jsx)

## Implementation Notes
- The `useAndroidBack` hook should handle edge cases: (a) user opens multiple drawers in sequence (only topmost closes on Back); (b) pushState cleanup when drawer closes programmatically (not via Back)
- For PM-125: the cart close → help open transition should feel smooth. Consider a small delay (200-300ms) between cart closing animation and help opening.
