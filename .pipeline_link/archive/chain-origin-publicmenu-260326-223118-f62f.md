---
page: PublicMenu
code_file: pages/PublicMenu/CartView.jsx
budget: 15
agent: cc+codex
chain_template: consensus-with-discussion
---

# Feature: CartView Drawer Redesign — Current Visit Only (#161)

Reference: `BUGS_MASTER.md` (PM-142, PM-143, PM-144, PM-145 CartView part). UX agreed S181/S182.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** CartView drawer currently mixes orders from different days (PM-142), sorts incorrectly (PM-143), and shows "Новый заказ" section below old orders requiring the user to scroll (PM-144). UX redesign agreed with product owner S181.

TARGET FILES (modify):
- `pages/PublicMenu/CartView.jsx`

CONTEXT FILES (read-only):
- `BUGS_MASTER.md`
- `pages/PublicMenu/x.jsx` (for context on how orders/session data flows in)

---

## Fix 1 — PM-142/143/144 (P2) [MUST-FIX]: CartView drawer — restructure to show current visit only, correct section order

### Сейчас
1. Drawer shows ALL orders from ALL days (including past visits/sessions)
2. Orders sorted only by time (HH:MM) without date → orders from different days are mixed (e.g. today's 15:30 appears above yesterday's 17:14)
3. "Новый заказ" (current cart with steppers) is placed BELOW all previous orders — user must scroll down to see what they just added

### Должно быть
**Structure (top to bottom):**
```
┌─────────────────────────────────────┐
│  🔔  Стол 22                    ˅  │
│      Вы: Timur111 #1313             │
├─────────────────────────────────────┤
│  ✅ Выдано          [˅ chevron]     │  ← COLLAPSED by default, chevron to expand
│  (orders with status "Выдан гостю") │
│  Стейк × 2               111.72 ₸  │
│  New York Steak × 1       32.01 ₸  │
├─────────────────────────────────────┤
│  🕐 Заказано        [˅ chevron]     │  ← EXPANDED by default, chevron to collapse
│  (orders with status "Заказано",    │
│   "Принято", "Готовится")           │
│  Карбанара × 1            14.50 ₸  │
├─────────────────────────────────────┤
│  🛒 Новый заказ                     │  ← Always visible, NO chevron
│  New dish         10 ₸  — 1 +      │
│  Карбанара       14.5 ₸  — 1 +     │
│                                     │
│  Для кого: Только мне  (2+ гостей) │
├─────────────────────────────────────┤
│  ИТОГО за визит:         136.73 ₸  │  ← Sum of ALL orders this visit
│  ┌─────────────────────────────┐   │
│  │    Отправить официанту      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Section rules:**
- **«Выдано»**: orders where all items have status "Выдан гостю" — COLLAPSED by default (history)
- **«Заказано»**: orders where any item has status "Заказано", "Принято", "Готовится" — EXPANDED by default (active)
- **«Новый заказ»**: current cart (not yet submitted) — always visible, no chevron
- **ИТОГО за визит**: sum of all orders this visit (Выдано + Заказано + Новый заказ items). ⚠️ Float fix (PM-145): wrap the total with `parseFloat(total.toFixed(2))` — same pattern as x.jsx cartTotalAmount. Also apply to any per-order subtotals shown in section rows.
- **Filter**: show ONLY orders from current session/visit (today's date OR current session ID). Do NOT show orders from previous days.
- **Sort within sections**: newest first (by full datetime, not just time)
- **No separate totals** per section — only one grand total

### НЕ должно быть
- Orders from previous days/visits in the drawer
- "Новый заказ" buried below history orders
- Separate sum displayed for "Выдано" or "Заказано" sections
- Sort by time only (HH:MM) — must use full datetime (date + time)
- "В работе" as section name — use "Заказано" (matches existing status badge in app)

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Current structure: search for `"Ваши заказы"` or `sessionOrders` or `myOrders` to find the orders rendering section.
The orders data comes as props from x.jsx (`sessionOrders`, `myOrders`, `myBill`, `itemsByOrder`).
Filter logic: add a date filter — only include orders where `created_date` is today's date (compare `new Date(order.created_date).toDateString()` with `new Date().toDateString()`), OR where order belongs to current `sessionId`.

### Уже пробовали
No previous fix attempts for this restructure. New feature.

### Проверка
1. Open cart drawer after having previous orders from yesterday visible
2. Only today's orders should be visible (not yesterday's)
3. "Новый заказ" with steppers is visible at top-level without scrolling
4. "Выдано" section is collapsed (shows chevron ˅ to expand)
5. "Заказано" section is expanded showing in-progress orders
6. ИТОГО = sum of all today's orders (not just new cart)
7. Tap "Выдано" chevron → section expands; tap again → collapses

---

⚠️ **C3 note**: Fix 2 (float) is folded into Fix 1 above (ИТОГО за визит rule). No separate Fix 2 needed — the total is part of the same redesigned section.

## ⚠️ D7 — DrawerContent: NO `relative` class
CartView.jsx uses DrawerContent (vaul library). Any new wrapper elements added inside DrawerContent must NOT have the `relative` class — it breaks vaul (drawer won't open or darkens background). KB-096.
```
grep -n "relative" pages/PublicMenu/CartView.jsx | grep -i "drawer\|content"
```
If any new element you add has `relative` → remove it.

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY the CartView drawer structure and order filtering/sorting logic
- Do NOT change: stepper +/- behavior, order submission, "Отправить официанту" button function
- Do NOT change: guest name display, loyalty points display, table header
- Do NOT change: CartView.jsx logic outside of the orders display section

## FROZEN UX (DO NOT CHANGE)
- PM-104 ✅: chevron (˅) in right part of table card header, NOT sticky
- PM-140 ✅: "Вернуться в меню" + "Мои заказы" buttons after successful order
- PM-141 ✅: star rating touch targets ≥ 44px in order history

## FROZEN UX grep verification
Before commit, verify these have NOT changed:
```
grep -n "ChevronDown" pages/PublicMenu/CartView.jsx | head -5
grep -n "Вернуться в меню\|back_to_menu" pages/PublicMenu/CartView.jsx | head -5
```

## Regression Check (MANDATORY after implementation)
- [ ] "Отправить официанту" button still submits order correctly
- [ ] Stepper (—/+) still adjusts quantities in "Новый заказ"
- [ ] "Для кого заказ" selector still works
- [ ] Stars rating still shows in order history
- [ ] Table header with chevron still collapses/expands

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] "Новый заказ" section visible without scrolling when drawer first opens
- [ ] Chevron buttons for sections: right-aligned, ≥ 44×44px touch target
- [ ] Sticky ИТОГО + "Отправить официанту" does not overlap content
- [ ] Section headers ("Выдано", "Заказано") clearly distinguishable
- [ ] Text truncation: long dish names don't overflow

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/CartView.jsx`
- CONTEXT: `pages/PublicMenu/x.jsx` for understanding how session data is passed as props
- Do NOT use `git add .` — only: `git add pages/PublicMenu/CartView.jsx`
- git commit -m "feat: CartView drawer redesign — current visit only, section order S181"
- git push

⚠️ DRAFT — Run prompt-checker before moving to queue/.
⚠️ Run AFTER #160 is DONE (Rule 26 — one chain at a time).
