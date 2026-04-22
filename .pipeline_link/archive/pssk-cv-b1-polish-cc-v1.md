---
task_id: pssk-cv-b1-polish-cc-v1
page: CartView
code_file: pages/PublicMenu/CartView.jsx
budget: 5
agent: cc
model: claude-sonnet-4-5
ws: WS-CV
created: 2026-04-15
session: 283
scope_summary: "CV-B1-Polish — 8 багов (CV-BUG-06..13) после CV-B1-Core. Независимый CC-анализ. Параллельно с pssk-cv-b1-polish-codex-v1."
---

# START PROMPT — CV-B1-Polish (CC findings)

**Role:** You are Claude Code. Analyze `pages/PublicMenu/CartView.jsx` independently and produce findings for 8 bugs listed below. DO NOT modify code. DO NOT launch Codex or subagents. Review/analysis task only.

**Output file:** `pipeline/cc-analysis-pssk-cv-b1-polish-cc-v1.txt` (Markdown, 400–1200 lines, concise, every claim backed by `Read`/`Grep` with file:line).

---

## Context

**Workstream:** WS-CV (CartView — guest-facing drawer, FROZEN UX v7.0).
**Release under review:** `pages/PublicMenu/CartView.jsx` (HEAD, 1223 строки, после CV-B1-Core chain `cartview-260415-092055-289b`).
**UX spec:** `ux-concepts/CartView/260408-00 CartView UX S246.md` v7.0 FROZEN (CV-13..CV-80).
**Bugs source:** `menuapp-code-review/pages/CartView/BUGS.md` v1.2 §§ CV-BUG-06..13.
**Batch plan source:** BACKLOG #330 (CV-B1-Polish) + #324 (CV-BUG-06) + #339 (CV-BUG-13). Весь батч одной ПССК→КС до CV-B1b.

---

## Bugs to analyze (all 8)

### CV-BUG-07 (P0) — Floating point в суммах
- Симптом: `3 169.8700000000003 ₸` в табе «Стол».
- Кандидаты в коде: `tableOrdersTotal` useMemo (ок. строка 489), `guestTotal` reduce (ок. строка 825), `formatPrice(tableOrdersTotal)` (~811), `formatPrice(guestTotal)` (~834).
- Нужно: grep ВСЕ `formatPrice(...)`; для каждого вызова проверить, прошёл ли аргумент через `toFixed(2)` или эквивалент. Вернуть таблицу `line | expression | toFixed? (yes/no)`.
- Рекомендация: где фиксить — в `formatPrice` helper (если он в этом файле) или на каждом вызове. Если `formatPrice` снаружи — указать путь.

### CV-BUG-08 (P0) — CV-70 регрессия footer CTA
- Симптом: когда корзина пуста + есть `todayMyOrders`, footer показывает outline «Заказать ещё» вместо primary filled «Вернуться в меню».
- Кандидат: footer ~строка 1180–1220 (`sticky bottom-0`), ветка `cart.length === 0` рендерит `<Button variant="outline">... Заказать ещё</Button>`.
- Проверить: все состояния State A/B/C в UX-спеке CV-70 (rule a/b/c). Grep по `cart.cta.order_more`, `order_more`, `primaryColor`.
- Рекомендация: минимальный diff (условный рендер + замена variant/style) + указание удалить ли i18n key `cart.cta.order_more` или оставить для других мест.

### CV-BUG-09 (P1) — Badge «Готово» в табе Стол (CV-52)
- Симптом: в строке блюда гостя показывается `🟡 Готово`, хотя CV-52 разрешает только 2 guest-facing статуса: «В работе» / «Выдано».
- Кандидат: функция `getSafeStatus` (ок. строка 300–340) + её вызов в рендере таба Стол (ок. 842 `status = getSafeStatus(getOrderStatus(order))`).
- Проверить: какие `code` значения маппит `getSafeStatus` в «Выдано»/«Отменён»/other? Маппится ли `ready` / `готово` / `prepared` в «В работе»?
- Рекомендация: дополнить маппинг (список codes для «В работе») + явно возвращать объект `{icon: '🔵', label: tr('cart.group.in_progress', 'В работе')}`.

### CV-BUG-10 (P1) — Блоки «Счёт стола» нарушают CV-50 + CV-19
- Симптом: в обоих табах рендерится Card-блок с `cart.table_total` / «Счёт стола».
- Кандидат: строки ~890–900 (full card в табе Стол) + ~902–912 (mini card в табе Мои). Header — ~строка 764 `{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(...)}`.
- UX требование (CV-50 + CV-19):
  - Удалить оба Card-блока.
  - Header в табе Стол → переключить label на `«Заказано на стол: X ₸»` (CV-19); сумма = `tableOrdersTotal + headerTotal` (уточнить, целый table или только others) — проверь в UX-спеке строка §348+.
  - Header в табе Мои → остаётся `«N блюд · X ₸»` (мои).
- Рекомендация: точные границы блоков к удалению (line N..M) + один conditional switch в header. i18n ключи: что удалять, что добавить (`cart.header.table_total` новый?).

### CV-BUG-11 (P2) — Кнопка «Оценить блюда гостей» (privacy CV-20)
- Симптом: в табе Стол рендерится Button `⭐ Оценить блюда гостей`.
- Кандидат: строки ~872–882 (`variant="outline"`, `openReviewDialog(otherGuestsReviewableItems)`).
- UX: в State T footer CTA = «Попросить счёт» (CV-21), кнопки оценки чужих блюд НЕТ. CV-20 — privacy between guests.
- Рекомендация: удалить блок целиком + проверить не сиротеют ли `otherGuestsReviewableItems`, `openReviewDialog`, `review.rate_others` i18n key. Если используется только здесь — удалить computation; если ещё где-то — оставить.

### CV-BUG-12 (P1) — Label `Гость 5331` вместо `Гость N`
- Симптом: в табе Стол вместо `Гость 3` показывается `Гость 5331` (похоже на хвост session_id/device_id).
- Кандидат: функция `getGuestLabelById` (ок. строка 500–506), fallback `const suffix = gid.length >= 4 ? gid.slice(-4) : gid` — это и есть «5331».
- CV-13 требует: `Гость N` где N — seq number (1, 2, 3, ...). Источник истины для `guest_number` — `components/sessionHelpers.js` (`getGuestDisplayName` использует `guest.guest_number`).
- Проверить: (1) что возвращает `sessionGuests` — есть ли в них `guest_number`? (grep по `sessionGuests` в CartView + x.jsx); (2) что делает `getGuestDisplayName` в `components/sessionHelpers.js` (уже возвращает `Гость ${guest.guest_number}`); (3) почему fallback срабатывает — гостя нет в `sessionGuests`, но он есть в `ordersByGuestId`.
- Рекомендация варианта: (a) использовать `otherGuestIdsFromOrders.indexOf(gid) + 2` (self = 1, others 2..N) — простое, но не стабильное если списки меняются; (b) fetch `SessionGuest` entity по guestId при рендере — сложно, требует useQuery; (c) использовать `guest.guest_number` если `SessionGuest` уже загружен (prop `sessionGuests`). Выбрать безопасный.

### CV-BUG-13 (P2) — Плюрализация «17 блюда»
- Симптом: header `"17 блюда · ..."` грамматически неверно. Правило RU: 1→блюдо, 2–4→блюда, 5–20→блюд, 21→блюдо, 25→блюд.
- Кандидат: строка ~764 `{totalDishCount} {tr('cart.header.dishes', 'блюда')}`.
- Проверить: есть ли в проекте существующий helper `pluralizeRu` / `plural` — grep в `components/`, `hooks/`, `utils/`, `pages/PublicMenu/x.jsx`. Если нет — не тянуть npm-пакет, писать inline-функцию.
- Рекомендация: inline helper (~6 строк) + замена вызова. Не ломать i18n (en-fallback = `dish(es)` — отдельный pluralizer или простой `n === 1 ? 'dish' : 'dishes'`).

### CV-BUG-06 (L) — `o.status === 'cancelled'` (line ~422)
- Кандидат: строка ~422 `.filter(o => o.status !== 'cancelled')` (BACKLOG #324 упоминал 418 — уточни точную).
- Проблема: тот же root cause что CV-BUG-05 (fixed в CV-B1-Core) — `o.status` не обновляется при переходе через stage. Надо читать через `getOrderStatus(o)` + сравнение с stage code / label.
- Рекомендация: `.filter(o => { const st = getSafeStatus(getOrderStatus(o)); return st.label !== tr('status.cancelled', 'Отменён'); })` ИЛИ по stage code напрямую (если getOrderStatus возвращает объект с code).

---

## Your deliverable (8 sections + 2 meta)

Для каждого бага:
1. **Exact lines** в текущем `CartView.jsx` (`git show HEAD:pages/PublicMenu/CartView.jsx`). NULL bytes в файле — используй `python3 -c "open(...).read().replace(b'\x00',b'').decode('utf-8')"` если `grep` молчит.
2. **Minimal diff sketch** (до 15 строк) — какие строки удалить, какие добавить, текст новых строк. Не писать полный файл.
3. **Side-effects check** — что может сломаться (другие вызовы, i18n keys, сиротские imports/vars).
4. **Test plan** (2–4 шага руками на устройстве).

### Section 9 — Prompt clarity rating (1–5)
Если <5, перечисли конкретные двусмысленности.

### Section 10 — Out-of-scope risks
Max 5 предметов, замеченных при grep, но не входящих в 8 багов. 1 строка каждый.

---

## ⛔ SCOPE LOCK

- DO NOT modify any `.jsx` / `.js` / `.md` file.
- DO NOT launch Codex, subagents, or pipeline tasks.
- DO NOT design the КС prompt — это следующий шаг после обоих findings.
- Output file: `pipeline/cc-analysis-pssk-cv-b1-polish-cc-v1.txt` и ничего больше.

Begin analysis. Use `Read`/`Grep`/`Bash` (read-only) for every claim.
