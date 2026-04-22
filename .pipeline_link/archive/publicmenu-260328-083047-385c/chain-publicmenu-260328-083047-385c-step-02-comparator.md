---
chain: publicmenu-260328-083047-385c
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 12.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260328-083047-385c
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260328-083047-385c-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260328-083047-385c-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260328-083047-385c-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260328-083047-385c

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
# Feature: CartView Drawer UX Redesign v3 (#174)

Reference: `ux-concepts/cart-view.md` (12 решений CV-01..CV-12, 3 ASCII-макета). UX agreed S183 + GPT 2 rounds.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** CartView drawer was restructured in #161 (sections Заказано/Новый заказ). Now needs UX polish based on GPT consultation: sticky footer, collapsed rows, rating logic, label fixes, status rename. This is a UI/layout change — no new data fetching or API changes.

TARGET FILES (modify):
- `pages/PublicMenu/CartView.jsx` (main: sections, footer, rating, filter, D3 screen)
- `pages/PublicMenu/x.jsx` (PM-151 success screen, PM-152/153 guest name localStorage)

⚠️ KB-095 RISK: Two files modified in one chain. After chain completes:
```
git show HEAD:pages/PublicMenu/CartView.jsx | wc -l
wc -l pages/PublicMenu/CartView.jsx
git show HEAD:pages/PublicMenu/x.jsx | wc -l
wc -l pages/PublicMenu/x.jsx
```
Line counts must match. If diff > 0 → restore from git HEAD before deploy.

CONTEXT FILES (read-only):
- `ux-concepts/cart-view.md` (full UX spec with ASCII mockups)
- `ux-concepts/visit-lifecycle.md` (VL-04: D3 screen spec)
- `BUGS_MASTER.md`

---

## Fix 1 — CV-01+CV-09: Section restructure [MUST-FIX]

### Сейчас
CartView drawer has sections: «Заказано (N)» → «Новый заказ» → «+ Добавить ещё» → «ИТОГО ЗА ВИЗИТ».
All submitted orders in one flat section «Заказано» with per-order status badges.

### Должно быть
Three sections: **⏱ Сейчас** → **📋 История** → **🛒 Новый заказ**.

**«Сейчас»** — active orders (statuses: Принят, Готовится, Готов). Sub-grouped by status with status as sub-header:
```
⏱ Сейчас
── Готовится ──
15:48  New dish, Карбонара    69.27 ₸
── Принят ──
18:19  Стейк, Карбонара      70.36 ₸
17:40  New York Steak         32.01 ₸
```

**«История»** — delivered orders (status: Подано/Выдан гостю). **Collapsed by default**. Summary line: `📋 История · N заказ · оценить ˅`. Tap to expand.

**«Новый заказ»** — current cart with steppers (same as current implementation). Keep existing stepper, quantity, price logic unchanged.

**Rules:**
- Empty sections are NOT rendered. No empty «Сейчас» if no active orders. No «История» if no delivered orders. No «Новый заказ» if cart empty.
- Sub-headers inside «Сейчас»: order by urgency top→bottom: Готов → Готовится → Принят.
- Within each sub-group: newest first (by full datetime).

### НЕ должно быть
- Old section name «Заказано (N)» — replace with «Сейчас»
- Per-order status badge repeating — status is now a sub-header
- Flat unsorted list of all orders

### Файл и локация
File: `CartView.jsx`
Search for the current section rendering: `"Заказано"` or `"Заказано ("` to find the section header. The orders rendering likely uses `.map()` over filtered orders.

⚠️ **Dependencies (C3):**
- Fix 1 defines the categorization logic using RAW DB status values: `['Принят','Готовится','Готов']` → «Сейчас»; `['Подано','Выдан гостю']` → «История». Fix 6 changes only DISPLAY labels — do NOT change the filter condition values in Fix 1.
- Fix 3 («Оценить блюда») must use the SAME status condition as Fix 1's «История» section: show CTA only when `order.status === 'Подано' || order.status === 'Выдан гостю'`.
- Fix 7 (PM-154) changes the date filter cutoff. Fix 1 organizes the ALREADY-filtered orders into sections. Execution order: Fix 7 filter → Fix 1 sections. No conflict, but Fix 1 must run AFTER Fix 7's filter is in place (same file, both in CartView.jsx — writer should ensure filter is applied before section rendering).
- Fix 10 (D3 screen) uses the same «Сейчас» / «История» / cart data as Fix 1. Use the same arrays/counts already computed by Fix 1.

### Проверка
1. With mix of statuses (Принят + Готовится) → two sub-groups visible in «Сейчас»
2. With delivered orders → «История» shows collapsed with count
3. With empty cart → no «Новый заказ» section
4. With only cart (no previous orders) → no «Сейчас» or «История»

---

## Fix 2 — CV-02+CV-03: Sticky footer with correct scope [MUST-FIX]

### Сейчас
«ИТОГО ЗА ВИЗИТ: 248.51 ₸» is inside scrollable content, followed by «Отправить официанту» button.

### Должно быть
ИТОГО + CTA button = **sticky footer** (always visible at bottom of drawer, does NOT scroll).

**When cart is NOT empty:**
```
├═════════════════════════════════════┤
│ К отправке:                44.77 ₸ │  ← main, bold, larger
│ Всего:                    248.51 ₸ │  ← secondary, smaller, text-gray-500
│ [    Отправить официанту         ] │
└─────────────────────────────────────┘
```

**When cart IS empty (no items to submit):**
```
├═════════════════════════════════════┤
│ ИТОГО:                    248.51 ₸ │  ← only total
│ [       Заказать ещё             ] │  ← secondary style (outline, not filled)
└─────────────────────────────────────┘
```

**When cart is not empty but NO previous orders (first order):**
```
├═════════════════════════════════════┤
│ ИТОГО:                     87.87 ₸ │  ← just cart total, no "К отправке"
│ +88 бонусов                         │
│ [    Отправить официанту         ] │
└─────────────────────────────────────┘
```

### Implementation notes
- Use a wrapper div with classes for sticky positioning. ⚠️ Do NOT use `position: relative` on direct children of DrawerContent (breaks vaul). Instead use a flex layout: scrollable content area + fixed footer.
- Pattern: `<div className="flex flex-col h-full"><div className="flex-1 overflow-y-auto">{scrollable}</div><div className="border-t p-4">{footer}</div></div>`
- "К отправке" label appears ONLY when there are BOTH cart items AND previous orders.
- "Заказать ещё" button: outline style, navigates back to menu (same as current «+ Добавить ещё»).
- ⚠️ Float fix: wrap all sums with `parseFloat(total.toFixed(2))`.

### НЕ должно быть
- «ИТОГО ЗА ВИЗИТ» label (remove everywhere)
- Total inside scrollable area
- Active «Отправить» button when cart is empty

### Проверка
1. Scroll long order list → footer stays visible
2. Cart empty → shows «ИТОГО» + «Заказать ещё» (secondary)
3. Cart + history → shows «К отправке: X» (bold) + «Всего: Y» (small)
4. First order only → shows «ИТОГО: X» without «К отправке»

---

## Fix 3 — CV-04+CV-05: Remove stars until delivery [MUST-FIX]

### Сейчас
Empty star rating (☆☆☆☆☆) shown under EVERY item in EVERY order, regardless of status.

### Должно быть
- Orders with status Принят/Готовится/Готов: **NO rating shown at all**
- Orders with status Подано/Выдан гостю: show CTA button `Оценить блюда` (not empty stars)
- Tap «Оценить блюда» → expand to show star rating per item (existing rating component)

### Файл и локация
Search for star/rating rendering: `"Rating"` or `"Star"` or `"⭐"` or `rating` in CartView.jsx.

### Проверка
1. Order with status «Заказано/Принято/Готовится» → no stars visible
2. Order with status «Выдан гостю» → button «Оценить блюда» visible
3. Tap «Оценить» → stars appear for each item in that order

---

## Fix 4 — CV-06: Collapsed summary rows [MUST-FIX]

### Сейчас
Each order shows full item list expanded by default.

### Должно быть
Orders in «Сейчас» section show as **collapsed summary rows**:
```
18:19  Стейк, Карбонара      70.36 ₸  ▾
```

Rules:
- Show first 2 item names, then `+N` for remaining: `Стейк, Карбонара +3  70.36 ₸  ▾`
- Tap ▾ → expand to show full item list with prices
- «Новый заказ» section items are ALWAYS expanded (user needs steppers)
- ⚠️ C7: For the order total (`70.36 ₸`) in collapsed rows, use the SAME price formatter already used for individual item prices in this component (search for how `item.price` or `item.total` is displayed — use that exact pattern, do NOT use `Math.round` or raw `toFixed`)

### Проверка
1. Order with 2 items → shows both names, no «+N»
2. Order with 5 items → shows 2 names + «+3»
3. Tap chevron → full list expands
4. «Новый заказ» items always show with steppers (NOT collapsed)

---

## Fix 5 — CV-07: «Кому заказ» selector [SHOULD-FIX]

### Сейчас
Shows «Для кого заказ: Только мне (2+ гостей)» — confusing label.

### Должно быть
- When 1 guest at table: **do not show this element at all**
- When 2+ guests: show `Кому заказ: Мне ▾` — stateful selector
- Tap → **open a new simple Sheet/Popover** (this does NOT exist yet in code — create it) with guest list (Мне / Гость 1 / Гость 2 / etc.)
- After selection: `Кому заказ: Гость 2 ▾`
- ⚠️ D6(c): This is a NEW secondary sheet inside the CartView drawer. Do NOT use `pushOverlay`/`popOverlay` for it — use simple local `useState` open/close (e.g., `isGuestPickerOpen`). Android Back is handled by the parent CartView drawer; this picker closes on backdrop tap or item selection.

### Файл и локация
Search for: `"Для кого"` or `"Только мне"` in CartView.jsx.

### Проверка
1. Table with 1 guest → no selector visible
2. Table with 2+ guests → shows «Кому заказ: Мне ▾»
3. Tap → guest picker opens (new component, local state)
4. Select guest → label updates to «Кому заказ: [name] ▾»

---

## Fix 6 — CV-08: Guest-facing status labels [SHOULD-FIX]

### Сейчас
Status labels: Заказано, Принято, Готовится, Готов, Выдан гостю.

### Должно быть
Rename for guest clarity (4 statuses):
- «Заказано» → **«Принят»** (or map both «Заказано» and «Принято» to display as «Принят»)
- «Готовится» → stays **«Готовится»**
- «Готов» → stays **«Готов»**
- «Выдан гостю» → **«Подано»**

### Проверка
1. No badge/label says «Заказано» or «Выдан гостю» — only «Принят», «Готовится», «Готов», «Подано»

---

---

## Fix 7 — PM-154: Order filter 06:00 (today's shift) [MUST-FIX]

### Сейчас
Заказы фильтруются по «сегодняшнему дню» (midnight cutoff), но PM-142 fix не работает правильно — гость видит заказы прошлых дней/смен (PM-154 регрессия).

### Должно быть
Filter: show only orders where `createdAt >= today at 06:00 AM`.
Reason: restaurants work past midnight — orders placed at 01:00 belong to the *previous* evening shift, not "today". 06:00 AM is the business-day reset point (VL-07).

### Implementation
In `CartView.jsx`, find the order filtering logic (search for `createdAt`, `filter`, or the PM-142 date filter). Replace the current date cutoff with:
```js
const today6am = new Date();
today6am.setHours(6, 0, 0, 0);
// If current time is before 06:00 → use yesterday's 06:00
if (new Date() < today6am) today6am.setDate(today6am.getDate() - 1);
const filtered = orders.filter(o => new Date(o.created_date) >= today6am);
```
Note: B44 date field may be `created_date` or `createdAt` — search for the actual field name used in the current filter.

### НЕ должно быть
- Midnight (00:00) as cutoff
- Orders from yesterday evening visible to today's guest

### Проверка
1. Orders placed before 06:00 AM today → NOT shown (belong to last night's shift)
2. Orders placed after 06:00 AM today → shown
3. Edge case: it's 02:00 AM → show orders since yesterday 06:00 AM

---

## Fix 8 — PM-151: Float in success screen [MUST-FIX]

### Сейчас
After submitting an order, the success screen «Заказ принят!» shows floating point total: `31.00999999999998 ₸`.

### Должно быть
All total values on the success screen wrapped with `parseFloat((value).toFixed(2))`.

### Файл и локация
File: `x.jsx`. Confirmed: success screen is in x.jsx, NOT in CartView.jsx.
Search for `"confirmation.total"` or `formatPrice(totalAmount)` → ~line 728–731.
Apply: `{formatPrice(parseFloat(totalAmount.toFixed(2)))}` instead of `{formatPrice(totalAmount)}`.

### Проверка
1. Submit order → success screen shows `31.01 ₸` (not `31.00999...`)

---

## Fix 9 — PM-152 + PM-153: Guest name localStorage [MUST-FIX]

### Сейчас
- PM-152: stale name — guest enters «Артур» but sees old name «Mike» from previous session. localStorage guest name not reset on new session/table.
- PM-153: name lost on kill — after killing and reopening Chrome, name shows as «Гость» (localStorage for name not implemented).

### Должно быть
Persist guest name in localStorage and clear it on table change:
1. When guest enters name → save to `localStorage.setItem('guestName', name)`.
2. On component mount → read `localStorage.getItem('guestName')` to restore name.
3. When table changes (new `tableCode`) → clear guest name from localStorage: `localStorage.removeItem('guestName')`.
4. If name is empty/null → show «Гость» as default.

### Файл и локация
File: `x.jsx`. Search for `guestName` state and the input where guest enters their name. Also search for `tableCode` change handler (where to add the clear logic).

Note: If `SessionGuest.guest_number` exists in B44 entities — do NOT use it here, this is purely frontend localStorage. No backend changes.

### НЕ должно быть
- Name from previous visitor shown to new guest
- Name reset to «Гость» after Chrome kill (if name was entered this session)

### Проверка
1. Enter name «Артур» → kill Chrome → reopen → name still «Артур» ✅
2. Change table → name cleared (shows «Гость») ✅
3. New session on different table → no stale name from previous guest ✅

---

## Fix 10 — D3 (VL-04): «Все блюда поданы ✅» screen [MUST-FIX]

### Сейчас
When all orders are delivered (no active orders, no new cart), CartView drawer shows empty «Сейчас» section or is confusing. Guest doesn't know what to do.

### Должно быть
When **«Сейчас» is empty AND «История» has delivered orders AND «Новый заказ» cart is empty**:
Show a special summary screen instead of empty state:

```
┌─────────────────────────────────────┐
│  ✅ Все блюда поданы                │
│                                     │
│  📋 История  (collapsed, tap →)     │
│     [existing collapsed История]    │
│                                     │
└─────────────────────────────────────┘
    ┌─────────────────────────────┐
    │ ИТОГО:            248.51 ₸  │  ← sticky footer
    │ [    Дозаказать           ] │  ← primary button
    │ [  Попросить счёт         ] │  ← secondary button
    └─────────────────────────────┘
```

**Rules:**
- «Дозаказать» button: navigates back to menu (same as «Заказать ещё» / «+ Добавить ещё»).
- «Попросить счёт» button: sends a help request (same mechanism as help drawer «Попросить счёт» option if it exists, or a new API call). If no backend support yet → show as disabled with tooltip «Попросите официанта напрямую».
- ИТОГО: total of all delivered orders (same float fix as Fix 2).
- This screen only shows when: `сейчасOrders.length === 0 AND историяOrders.length > 0 AND cartItems.length === 0`.

### НЕ должно быть
- Empty blank area after all orders delivered
- «Отправить официанту» button when cart is empty (Fix 2 already handles this)

### Проверка
1. All orders delivered → ✅ banner visible, «Дозаказать» + «Попросить счёт» visible
2. Add item to cart → screen switches back to normal CartView with «Новый заказ»
3. Active order still in progress → normal view, no D3 screen

---

## ⚠️ D7 — DrawerContent: NO `relative` class
CartView.jsx uses DrawerContent (vaul library). Any new wrapper elements added inside DrawerContent must NOT have the `relative` class — it breaks vaul. KB-096.

## ⛔ SCOPE LOCK
- Modify ONLY: section structure, footer, rating visibility, collapsed rows, labels, selector, date filter, success screen float, guest name localStorage, D3 screen
- Do NOT change: stepper +/- behavior, order submission logic, "Отправить официанту" API call
- Do NOT change: loyalty points calculation, table header chevron, help drawer logic
- In x.jsx: ONLY touch guest name localStorage (PM-152/153) and success screen float (PM-151)

## FROZEN UX (DO NOT CHANGE)
- PM-104 ✅: chevron (˅) in right part of table card header, NOT sticky
- PM-140 ✅: "Вернуться в меню" + "Мои заказы" buttons after successful order
- PM-141 ✅: star rating touch targets ≥ 44px (keep when stars ARE shown)
- PM-142 ✅: orders filtered to current shift only (Fix 7 REFINES this to 06:00 AM cutoff — do NOT revert to showing all-time orders)
- PM-143 ✅: sort by full datetime (newest first within each section)
- PM-145 ✅: float fix on totals (parseFloat toFixed(2))

## FROZEN UX grep verification
Before commit, verify these have NOT changed:
```
grep -n "ChevronDown" pages/PublicMenu/CartView.jsx | head -5
grep -n "Вернуться в меню\|back_to_menu" pages/PublicMenu/CartView.jsx | head -5
grep -n "toFixed\|parseFloat" pages/PublicMenu/CartView.jsx | head -5
```

## Regression Check (MANDATORY after implementation)
- [ ] "Отправить официанту" button still submits order correctly
- [ ] Stepper (—/+) still adjusts quantities in "Новый заказ"
- [ ] "Для кого заказ" selector still works (or replaced with new selector)
- [ ] Stars rating works when shown (on delivered orders)
- [ ] Table header with chevron still collapses/expands
- [ ] 06:00 filter: no past-day orders visible
- [ ] Float fix applied on all totals (CartView + success screen)
- [ ] Guest name persists after Chrome kill
- [ ] Guest name clears on table change
- [ ] D3 screen appears when all orders delivered + cart empty
- [ ] Help drawer still opens (x.jsx unchanged outside scope)

## MOBILE-FIRST CHECK (MANDATORY before commit)
At 375px viewport width:
- [ ] «Сейчас» section visible at top when drawer opens
- [ ] Sticky footer does not overlap scrollable content
- [ ] Collapsed rows: chevron ≥ 44×44px touch target
- [ ] «Новый заказ» steppers work correctly
- [ ] Long dish names truncated (not overflowing)

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/CartView.jsx`
- CONTEXT: `pages/PublicMenu/x.jsx`, `ux-concepts/cart-view.md`
- Do NOT use `git add .` — only: `git add pages/PublicMenu/CartView.jsx pages/PublicMenu/x.jsx pages/PublicMenu/BUGS.md`
- git commit -m "feat: CartView v3 — sections, sticky footer, 06:00 filter, guest name, D3 screen"
- git push

⚠️ DRAFT — Run prompt-checker before moving to queue/.
⚠️ Run AFTER #162 is DONE (Rule 26 — one chain at a time).
=== END ===
