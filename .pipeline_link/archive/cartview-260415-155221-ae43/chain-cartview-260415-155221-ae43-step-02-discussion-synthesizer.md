---
chain: cartview-260415-155221-ae43
chain_step: 2
chain_total: 2
chain_step_name: discussion-synthesizer
page: CartView
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion Synthesizer (2/2) ===
Chain: cartview-260415-155221-ae43
Page: CartView

You are the Discussion Synthesizer in a modular discussion pipeline.
Your job: read BOTH CC and Codex positions, compare them, and produce a unified decision report.

INSTRUCTIONS:

1. Read CC position: pipeline/chain-state/cartview-260415-155221-ae43-cc-position.md
2. Read Codex position: pipeline/chain-state/cartview-260415-155221-ae43-codex-position.md
3. If reference files are mentioned in the original task — read them for additional context.

4. For EACH question, compare CC and Codex positions:

   IF they AGREE:
   - Confirm the shared recommendation
   - Note confidence level

   IF they DISAGREE:
   - Analyze both arguments on technical/UX merits
   - Be FAIR — do not automatically prefer CC or Codex
   - Pick the stronger recommendation OR propose a compromise
   - If neither is clearly better → mark as "Arman decides" with both options

5. Write final discussion report to: pipeline/chain-state/cartview-260415-155221-ae43-discussion.md

FORMAT:
# Discussion Report — CartView
Chain: cartview-260415-155221-ae43
Mode: CC+Codex (synthesized)
Topic: [title from task]

## Questions Discussed
[List all N questions from the task]

## Analysis

### Q1: [question title]
**CC Position:** [summary of CC recommendation + key reasoning]
**Codex Position:** [summary of Codex recommendation + key reasoning]
**Status:** agreed / disagreement
**Resolution:** [agreed recommendation OR synthesizer's verdict with reasoning]

### Q2: [question title]
...

## Decision Summary
| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | Title    | option A | option A | agreed: option A | high |
| 2 | Title    | option B | option C | synthesizer: option B (reason) | medium |
| 3 | Title    | option D | option E | Arman decides | — |

## Recommendations
For each question: the final recommendation (or both options if unresolved).
Format as actionable decisions ready for DECISIONS_INDEX.

## Unresolved (for Arman)
Questions where CC and Codex positions are both valid and synthesizer cannot determine a clear winner.
Each item shows both positions and the key trade-off.

## Quality Notes
- CC Prompt Clarity score: [from CC position file]
- Codex Prompt Clarity score: [from Codex position file]
- Issues noted: [any concerns about question quality]

6. Do NOT write or modify any code files.

=== TASK CONTEXT ===
# Д3 Discussion: CartView CV-B1-Polish (8 багов после CV-B1-Core)

## Контекст

После деплоя CV-B1-Core (chain `cartview-260415-092055-289b`, RELEASE `260414-03 CartView RELEASE.jsx` + последующие правки, HEAD = 1223 строки) визуальное тестирование выявило 8 багов (2×P0 + 4×P1 + 2×P2/L). Весь батч — одной ПССК→КС до CV-B1b.

Цель дискуссии: для каждого бага подтвердить точные строки в HEAD, предложить **minimal diff sketch** (до 15 строк -/+), перечислить side-effects и шаги теста. Synthesizer объединит позиции в единый план для КС С5v2.

⚠️ **NULL bytes в CartView.jsx.** Файл в HEAD содержит 75 NULL байт (legacy артефакт). Если `grep`/`rg` молчит — используй:
```
python3 -c "import sys; sys.stdout.buffer.write(open('pages/PublicMenu/CartView.jsx','rb').read().replace(b'\x00',b''))" > /tmp/cv.jsx
```
и грепай `/tmp/cv.jsx`. Номера строк совпадают с HEAD.

## Reference Files

- `menuapp-code-review/pages/CartView/BUGS.md` v1.2 §§ CV-BUG-06..13
- `ux-concepts/CartView/260408-00 CartView UX S246.md` v7.0 FROZEN (CV-13, CV-19, CV-20, CV-21, CV-50, CV-52, CV-70)
- `components/sessionHelpers.js` — `getGuestDisplayName` (~line 213) возвращает `Гость ${guest.guest_number}`
- `BACKLOG.md` #330 (CV-B1-Polish), #324 (CV-BUG-06), #339 (CV-BUG-13)

## Constraints (не обсуждать)

- Схема B44 не расширяется.
- FROZEN UX v7.0 — решения CV-13/CV-19/CV-20/CV-21/CV-50/CV-52/CV-70 уже приняты.
- Mobile-first, 320–420px, vaul drawer.
- Target file — только `pages/PublicMenu/CartView.jsx`. Изменения в `components/`, `hooks/`, `x.jsx` — **вне scope этого батча** (если нужны — отметить как risk и предложить перенести в CV-B1b).

## 8 вопросов (по одному на баг)

### Q1: CV-BUG-07 (P0) — Floating point в денежных суммах

Симптом: `3 169.8700000000003 ₸` в табе «Стол».
Кандидаты:
- `tableOrdersTotal` useMemo (~line 489) — raw `sum += Number(o.total_amount) || 0`, no toFixed.
- `guestTotal` reduce (~line 825) — same.
- `formatPrice(tableOrdersTotal)` ~line 811 — аргумент без toFixed.
- `formatPrice(guestTotal)` ~line 834 — same.
- Уже защищены: строки 467, 631, 764 (headerTotal), 896, 908, 1087 — через `parseFloat(n.toFixed(2))`.

**Обсудить:**
1. Где фиксить — на каждом call-site `formatPrice(...)` или в `formatPrice` helper'е? (Grep `formatPrice` — где определён. Если вне CartView.jsx — риск повлиять на другие страницы.)
2. Точные строки к правке + новый код (до 15 строк).
3. Нужно ли править `tableOrdersTotal` / `guestTotal` computation или достаточно `parseFloat(...toFixed(2))` на выводе?
4. Test plan (2 шага).

### Q2: CV-BUG-08 (P0) — Footer CTA «Заказать ещё» вместо «Вернуться в меню» (CV-70 регрессия)

Сейчас (~lines 1180–1220): когда `cart.length === 0` — outline `<Button variant="outline">... Заказать ещё</Button>`.
CV-70 rule b: State B (пустая корзина + active/delivered) → primary filled «Вернуться в меню».

**Обсудить:**
1. Как определить State B/C в коде? (`todayMyOrders.length > 0`? `statusBuckets.in_progress.length > 0 || statusBuckets.served.length > 0`?)
2. Нужно ли сохранить ветку «Заказать ещё» для какого-то состояния (State E — finalized?), или удалить совсем?
3. Новый i18n key (`cart.cta.back_to_menu` = «Вернуться в меню»)? Или reuse существующего — grep по проекту.
4. Стиль: `style={{backgroundColor: primaryColor}}` + `className="text-white"` (как в Submit button ~line 1184).
5. Minimal diff sketch.

### Q3: CV-BUG-09 (P1) — Badge «Готово» в табе Стол (CV-52 violation)

Сейчас `getSafeStatus` (~lines 300–340) маппит только `done/served/completed` → «Выдано», `cancel/cancelled` → «Отменён». `ready` / `prepared` / «готово» — пропускаются и возвращаются as-is (отсюда `🟡 Готово`).
CV-52: гостю видны только 2 статуса — «В работе» / «Выдано». `ready` должен маппиться в **«В работе»** (не «Выдано» — это ошибка ожиданий гостя).

**Обсудить:**
1. Точный список codes для «В работе»: `['ready','prepared','pending','accepted','cooking','in_progress','готово']`? Проверить через grep stages/OrderStage какие фактически приходят.
2. Структура возврата `getSafeStatus` — где-то есть `.icon`, `.label`, `.color`. Какой icon/color для «В работе»? (Сейчас default `🔵 В работе` / `#6B7280`.)
3. Сохранить ли fallback «Отменён» как отдельный статус (3-й) или маппить в «В работе» тоже? (CV-52 — 2 статуса; но «Отменён» это edge case.)
4. Minimal diff sketch (5–10 строк).
5. Test plan: официант переводит заказ через SOM (`ready` stage) → CartView гостя показывает «🔵 В работе», не «Готово».

### Q4: CV-BUG-10 (P1) — Блоки «Счёт стола» нарушают CV-50 + CV-19

Сейчас:
- Card-блок full (~lines 890–900) в табе Стол: `Счёт стола: {formatPrice(tableTotal)}`.
- Card-блок mini (~lines 902–912) в табе Мои: то же, меньше.
- Header (~line 764): `{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}` — одинаковый для обоих табов.

UX:
- CV-50 (Totals Logic §94–105): деньги ТОЛЬКО в header. Отдельных блоков нет.
- CV-19: в табе Стол header label → «Заказано на стол: X ₸» (не «N блюд · X ₸»).
- Таб Мои: header остаётся «N блюд · X ₸».

**Обсудить:**
1. Что именно считать «Заказано на стол» — `tableOrdersTotal` (только others) или `tableOrdersTotal + myOrdersSum`? (Проверить UX-spec §348+.) Проверить также: входят ли `cart` (ещё не отправленные items) в сумму «на стол» или только `sessionOrders`?
2. Точные lines к удалению (границы обоих Card-блоков).
3. Conditional в header — grep на `cartTab` в области line 764. Новая версия header (до 15 строк).
4. Новые/удаляемые i18n keys: `cart.table_total` — удалить? `cart.header.table_total = «Заказано на стол»` — добавить?
5. Test plan (переключение табов).

### Q5: CV-BUG-11 (P2) — Кнопка «⭐ Оценить блюда гостей» не в спеке

Сейчас ~lines 872–882: `<Button variant="outline" ...>⭐ {tr('review.rate_others', 'Оценить блюда гостей')}</Button>`.
UX State T (§348–371): footer CTA = «Попросить счёт» (CV-21), отдельной кнопки нет. CV-20 privacy — гость не оценивает чужие блюда.

**Обсудить:**
1. Удалить блок целиком (5 строк).
2. Orphans check:
   - `otherGuestsReviewableItems` — где computed, кто ещё использует? Если только здесь — удалить computation.
   - `openReviewDialog` — используется для своих блюд в табе Мои (вероятно да, не трогать).
   - i18n `review.rate_others` — grep по репо; удалять ли из translations.
3. Minimal diff sketch + test plan (таб Стол — кнопки нет; таб Мои — rating flow работает).

### Q6: CV-BUG-12 (P1) — Label `Гость 5331` вместо `Гость N` (CV-13)

Сейчас `getGuestLabelById` (~lines 500–506):
```js
const found = (sessionGuests || []).find((g) => String(g.id) === gid);
if (found) return getGuestDisplayName(found);
const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
return `${tr("cart.guest", "Гость")} ${suffix}`;
```
Fallback возвращает хвост session_id — отсюда «5331». CV-13: `Гость N` где N — seq number (1 = Вы, 2, 3...).

Корень — гостя нет в `sessionGuests` но он есть в `ordersByGuestId` (race condition? incomplete fetch?).

**Обсудить:**
1. Почему гость отсутствует в `sessionGuests` — race / incomplete prop / entity не подтянут? Grep в `pages/PublicMenu/x.jsx` по `sessionGuests` — как загружается.
2. Варианты fallback:
   - **A (safe, quick):** seq index из `otherGuestIdsFromOrders.indexOf(gid) + 2` (self = 1, others 2..N). Стабильно в рамках одного рендера; порядок может прыгать между polling-циклами.
   - **B (proper):** догрузить missing SessionGuests по guestId через useQuery. Требует работы с fetch logic — возможно вне scope CV-B1-Polish.
   - **C (hybrid):** A как fallback, но логировать `console.warn` чтобы поймать на QA — помогает будущему B.
3. Рекомендация с обоснованием (вес CV-B1-Polish = minimal diff, архитектурные правки в CV-B1b #334).
4. Minimal diff sketch.
5. Test plan (2 стола, multi-guest session).

### Q7: CV-BUG-13 (P2) — Плюрализация «17 блюда»

Сейчас ~line 764: `{totalDishCount} {tr('cart.header.dishes', 'блюда')}` — статичная форма.
RU: 1→блюдо, 2–4→блюда, 5–20→блюд, 21→блюдо, 25→блюд.

**Обсудить:**
1. Есть ли существующий `pluralizeRu` / plural helper в проекте? Grep: `rg -n "pluralize|plural\b" components/ hooks/ pages/PublicMenu/ utils/`.
2. Если нет — inline helper в CartView.jsx (6 строк) или в `components/utils.js` (отдельный файл, reusable)? Вес батча CV-B1-Polish = minimal → рекомендация inline.
3. i18n en-fallback: `dish` / `dishes` — отдельная логика или inline ternary `n === 1 ? 'dish' : 'dishes'`?
4. Minimal diff sketch (helper + замена вызова).
5. Нужно ли добавить 3 новых i18n key (`cart.header.dishes_1`, `cart.header.dishes_few`, `cart.header.dishes_many`) или хватит одного fallback списка в коде?

### Q8: CV-BUG-06 (L) — `o.status === 'cancelled'` (~line 422)

Тот же root cause что CV-BUG-05 (fixed в CV-B1-Core для `statusBuckets` через `getOrderStatus`/`stage_id`). В строке ~422 `.filter(o => o.status !== 'cancelled')` — прямое чтение `o.status`.

**Обсудить:**
1. Grep все `o.status ===` / `order.status ===` в CartView.jsx — подтвердить что line 422 единственное оставшееся место (или есть ещё).
2. Fix-паттерн: тот же что применил CV-BUG-05 (`getSafeStatus(getOrderStatus(o)).label !== tr('status.cancelled', 'Отменён')`) или сравнение по stage code? (Уточнить что возвращает `getOrderStatus` — объект со `.code`? grep в hook.)
3. Minimal diff (1–3 строки).
4. Test plan: официант отменяет заказ через SOM → CartView не показывает отменённый заказ в списках.

## Deliverable (синтезатор)

Файл `ux-concepts/CartView/CV-B1-Polish_Plan_S283.md` со структурой:
- По каждому из 8 багов: **точные lines + minimal diff (до 15 строк) + side-effects + test plan**.
- Таблица i18n keys (add/remove).
- Список orphan vars/functions к удалению.
- Риски/open items для КС.
- Рекомендация — писать один КС С5v2 на все 8 багов ($12) или разбить.

## ⛔ Scope Lock

- Это discussion/findings — **никаких модификаций кода**.
- Не трогать файлы вне `pages/PublicMenu/CartView.jsx` в рекомендациях (если нужно — risk note «требует x.jsx — перенести в CV-B1b»).
- Не писать КС-промпт — это следующий шаг.
=== END ===
