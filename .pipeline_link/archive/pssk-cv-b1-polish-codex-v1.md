---
task_id: pssk-cv-b1-polish-codex-v1
page: CartView
code_file: pages/PublicMenu/CartView.jsx
budget: 5
agent: codex
model: o4-mini
ws: WS-CV
created: 2026-04-15
session: 283
scope_summary: "CV-B1-Polish — 8 багов (CV-BUG-06..13) после CV-B1-Core. Независимый Codex-анализ. Параллельно с pssk-cv-b1-polish-cc-v1."
---

# START PROMPT — CV-B1-Polish (Codex findings)

**Role:** You are Codex. Analyze `pages/PublicMenu/CartView.jsx` independently and produce findings for 8 bugs listed below. This is a review/analysis task — DO NOT modify code. Use Read/Grep (or `rg`/`sed`/`awk`) for every claim. Output Markdown with file:line references.

---

## Context

**Workstream:** WS-CV (CartView — guest-facing drawer).
**Target file:** `pages/PublicMenu/CartView.jsx` (HEAD, ~1223 строки, после CV-B1-Core).
**UX spec (authoritative):** `ux-concepts/CartView/260408-00 CartView UX S246.md` v7.0 FROZEN (CV-13..CV-80).
**Bugs source:** `pages/CartView/BUGS.md` v1.2 §§ CV-BUG-06..13.
**Sister findings (parallel run):** CC produces `pipeline/cc-analysis-pssk-cv-b1-polish-cc-v1.txt` — do NOT read it, work independently.

**⚠️ File has NULL bytes in-repo (legacy artefact).** If grep/sed misbehaves, use: `python3 -c "import sys; sys.stdout.buffer.write(open('pages/PublicMenu/CartView.jsx','rb').read().replace(b'\x00',b''))" > /tmp/cartview.clean.jsx` and grep that copy. Report absolute line numbers from the cleaned copy (they match HEAD line numbering).

---

## Bugs to analyze (all 8)

### CV-BUG-07 (P0) — Floating point в денежных суммах
Симптом: `3 169.8700000000003 ₸`.
- Кандидаты: `tableOrdersTotal` useMemo (~line 489), `guestTotal` reduce (~line 825), `formatPrice(tableOrdersTotal)` (~811), `formatPrice(guestTotal)` (~834).
- Задача: собрать таблицу всех `formatPrice(...)` вызовов в файле → для каждого пометить защищён ли аргумент через `toFixed(2)` / `parseFloat(n.toFixed(2))`.
- Определить: где лучше фиксить (в helper `formatPrice` если он в этом файле, иначе на каждом call-site). Если `formatPrice` импортирован — дать путь и указать, что менять его за пределами файла рискованно (может сломать другие страницы).

### CV-BUG-08 (P0) — CV-70 регрессия footer CTA
Когда `cart.length === 0` + `todayMyOrders.length > 0`, footer рендерит outline `<Button>` с текстом «Заказать ещё». CV-70 rule b требует primary filled «Вернуться в меню».
- Кандидат: ~lines 1180–1220 (sticky footer).
- Дать минимальный diff: условный рендер (State A / State B / State C) + стиль primary filled (использовать `primaryColor`, как в State A submit-кнопке).
- Проверить i18n: удалять ли `cart.cta.order_more` (grep по репо), или оставить для других страниц.

### CV-BUG-09 (P1) — Badge «Готово» в табе Стол (CV-52 violation)
CV-52: гостю видны только 2 статуса — «В работе» / «Выдано» (+ «Отменён» на spec).
- Кандидат: `getSafeStatus` ~line 300, его вызов ~line 842.
- Сейчас `getSafeStatus` маппит `done/served/completed` → «Выдано» и `cancel/cancelled` → «Отменён». `ready` / `prepared` / «готово» не маппятся — попадают as-is.
- Предложить: дополнить маппинг — список `readyCodes = ['ready','prepared','готово','pending','accepted','cooking','in_progress']` → возврат `{icon: '🔵', label: tr('cart.group.in_progress', 'В работе')}`. Проверить, не сломает ли для таба Мои (там тоже `getSafeStatus` используется? — grep все callers).

### CV-BUG-10 (P1) — Блоки «Счёт стола» нарушают CV-50 + CV-19
- Кандидаты: Card блок ~lines 890–900 (таб Стол) + mini Card ~902–912 (таб Мои). Header — ~line 764 с `{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(headerTotal)}`.
- UX:
  - Удалить оба Card-блока.
  - В табе Стол header label меняется на «Заказано на стол: X ₸» (CV-19). Сумма — `tableOrdersTotal` (только другие гости) либо `tableOrdersTotal + myOrdersSum` — уточнить по `260408-00 CartView UX S246.md` §348+ и §94-105 «Totals Logic».
  - В табе Мои header остаётся `«N блюд · X ₸»`.
- Дать минимальный diff: conditional JSX в header + удаление двух блоков + новый i18n key (если нужен) `cart.header.table_total` = «Заказано на стол».

### CV-BUG-11 (P2) — Кнопка «Оценить блюда гостей» не в спеке
- Кандидат: Button block ~lines 872–882.
- Удалить. Проверить orphans:
  - `otherGuestsReviewableItems` — где вычисляется? Используется ли ещё где-то?
  - `openReviewDialog` — используется для своих блюд в табе Мои (вероятно да, не трогать определение).
  - i18n `review.rate_others` — удалить из translations если не используется.

### CV-BUG-12 (P1) — Label `Гость 5331` вместо `Гость N`
Fallback в `getGuestLabelById` (~lines 500–506) берёт `gid.slice(-4)` от session_id.
- Нужно: CV-13 требует `Гость N` seq (1 = Вы, 2/3/4...).
- Проверить:
  - Как prop `sessionGuests` передаётся из x.jsx — содержит ли он записи для ВСЕХ гостей стола или только некоторых? Grep в `pages/PublicMenu/x.jsx` по `sessionGuests`.
  - `components/sessionHelpers.js` уже имеет `getGuestDisplayName(guest) = guest.name || 'Гость ${guest.guest_number}'` (~line 213).
  - Почему fallback срабатывает — потому что `sessionGuests` не включает гостя, у которого есть заказы? Race condition? Или entity вообще не подтянута?
- Предложить 2 варианта:
  - **A (safe):** если `sessionGuests` гостя нет — использовать index из `otherGuestIdsFromOrders` + 2 (self = 1). Стабильно в рамках одного рендера, но номер может «прыгать» между рендерами если порядок меняется.
  - **B (proper):** догрузить `SessionGuest` по guestId через useQuery в этом же файле (как уже делается для `sessionGuests` в x.jsx — propagate).
- Рекомендация с обоснованием. Для Polish-батча — скорее всего A. B — отдельный батч (архитектурный).

### CV-BUG-13 (P2) — Плюрализация «17 блюда»
- Кандидат: ~line 764.
- Проверить наличие существующих helpers: `rg -n "pluralize|plural" components/ hooks/ pages/ utils/`.
- Если нет — предложить inline 6-строчный helper + замену вызова. Пример:
  ```js
  const pluralizeRu = (n, forms) => {
    const m10 = Math.abs(n) % 10, m100 = Math.abs(n) % 100;
    if (m10 === 1 && m100 !== 11) return forms[0];
    if ([2,3,4].includes(m10) && ![12,13,14].includes(m100)) return forms[1];
    return forms[2];
  };
  ```
- Вызов: `{totalDishCount} {pluralizeRu(totalDishCount, ['блюдо','блюда','блюд'])}`.
- Для английского fallback — отдельно (если i18n en-locale активна на этой странице).

### CV-BUG-06 (L) — `o.status === 'cancelled'` (~line 422)
- Тот же root cause что CV-BUG-05 (уже фикшено в CV-B1-Core для `statusBuckets`).
- Кандидат: `.filter(o => o.status !== 'cancelled')` ~line 422.
- Grep все `o.status ===`, `order.status ===` в файле — возможно есть ещё места.
- Fix: через `getSafeStatus(getOrderStatus(o))` + сравнение по label или по stage code (выбрать тот же паттерн что применил CV-BUG-05 fix).

---

## Your deliverable (per bug + 2 meta)

Для каждого бага:
1. Точные line numbers в HEAD.
2. Minimal diff sketch (до 15 строк `-` / `+`).
3. Side-effects — что может сломаться (другие callers, i18n, orphan vars).
4. Test plan (2–4 шага).

### Section 9 — Prompt Clarity (1–5) + список двусмысленностей.
### Section 10 — Out-of-scope risks (max 5, 1 строка).

**Output target:** single Markdown document (Codex default output channel for the App — paste back to Cowork).

---

## Scope lock

- No code modifications.
- Independent analysis — do not peek at CC findings.
- Do not design the final КС prompt — it will be built from both findings next step.

Begin.
