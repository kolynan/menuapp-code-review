---
chain_template: pssk-review
budget: 10
code_file: menuapp-code-review/pages/PublicMenu/CartView.jsx
ws: WS-CV
type: ПССК
---

# ПССК CV-B2 — CartView Batch 2
**Версия:** v1 | **Сессия:** S303 | **Дата:** 2026-04-16

## Context

**File:** `menuapp-code-review/pages/PublicMenu/CartView.jsx`
**Lines:** 1227 | **Last RELEASE commit:** `fa73c97` (RELEASE `260415-01 CartView RELEASE.jsx`)
**UX Source of Truth:** `ux-concepts/CartView/260416-02 CartView Mockup v11 S302.html` (FROZEN v11, 8 states + ✦ Terminal)
**UX Spec:** `ux-concepts/CartView/260408-00 CartView UX S246.md` v8.0

This prompt covers **4 Fix-blocks** for CartView Batch 2:
- Fix 1: Header attribution «Вы:»/«Стол:» + rendered-data invariant (R2, CV-NEW-01)
- Fix 2: ⏳ Ожидает bucket — pending pre-production state (R1)
- Fix 3: ✦ Terminal screen «Спасибо за визит!» with durable persist (R4)
- Fix 4: Self-first «Вы (Гость N)» in «Стол» tab — own orders visible + expanded (CV-NEW-03, CV-16/17)

**Scope lock:** Only CartView.jsx. No changes to other files (sessionHelpers.js, partnertables.jsx, etc.).

---

## ⛔ FROZEN UX — ОБЯЗАТЕЛЬНО К СОБЛЮДЕНИЮ (Rule 33)

Следующие решения LOCKED. Нельзя оспаривать, изменять или предлагать альтернативы:

| ID | Решение | Источник |
|----|---------|---------|
| **R1** | `pending_unconfirmed` → `⏳ Ожидает` (текст + иконка, НЕ иконка-only). `accepted/ready/in_progress` → `🔵 В работе`. «Ожидает» bucket — СНИЗУ «Мои» (ниже «В работе»). Badge «Ожидает» — ТОЛЬКО в табе «Стол» (per-item). В «Мои» — badge нет, достаточно amber bucket-заголовка. | DECISIONS_INDEX §2 S302 |
| **R2** | Таб «Мои» → `«Вы: X блюд · X ₸»`. Таб «Стол» → `«Стол: X гостя · X блюд · X ₸»`. Header sum = derived from **rendered-data invariant** (активный таб), НЕ из агрегата `submittedTableTotal`. | DECISIONS_INDEX §2 S294+S302 |
| **V4** | Standalone CTA «Попросить счёт» УБРАН. Footer «Стол»: «Вернуться в меню» (outline) + helper «Нужна помощь или счёт? Нажмите 🔔». Дублирования UI нет. | DECISIONS_INDEX §2 S302 |
| **R4** | Terminal = единый экран «Спасибо за визит!» для закрытия стола. Durable persist через `terminalStateShownForVersion`. | DECISIONS_INDEX §2 S294+S302 |
| **CV-52** | «В работе»: calm bg, без stepper. «В корзине»: яркий, stepper видим. Badge «Отправлено» убран ВЕЗДЕ. | cart-view.md v6.0 |
| **CV-50** | Деньги убраны из групп (В работе, В корзине, Выдано). Деньги ТОЛЬКО в header drawer. | DECISIONS_INDEX §2 S244 |
| **CV-16/17** | «Стол» tab: self-first «Вы (Гость N)» expanded первым, остальные collapsed. | cart-view.md v6.0 |
| **stale helper** | Helper «Проверяем подтверждение…» (`stale_pending`) — УБРАН (S302). Не восстанавливать. | HO_CV_B2_Mockup_S302.md |

---

## Preparation

Перед анализом:
```bash
cp menuapp-code-review/pages/PublicMenu/CartView.jsx menuapp-code-review/pages/PublicMenu/CartView.jsx.working
wc -l menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 1227 строк
git -C menuapp-code-review log --oneline -1
# Ожидаем коммит: fa73c97 или новее
```

Убедиться что работаешь с актуальной версией (не worktree-копией).

---

## Fix 1 — Header Attribution + Rendered-Data Invariant

**Задача:** Заменить текущий header в CartView на атрибутированный «Вы:»/«Стол:» с суммой, вычисляемой из реально отрендеренных данных (не из агрегата).

### Текущее состояние (проблема)

**Строки 788–804** (header render):
```jsx
{cartTab === 'table'
  ? `Заказано на стол: ${formatPrice(submittedTableTotal)}`
  : `${myOrdersCount} блюд · ${formatPrice(headerTotal)}`
}
```

Проблема 1: нет атрибуции «Вы:»/«Стол:»  
Проблема 2: `submittedTableTotal` — агрегат из строк ~490-530 (суммирует ВСЕ заказы столика по guest_id), не зависит от того, что реально отрисовано в табе «Стол». Это CV-NEW-01: если гость видит только 3 блюда на экране, а агрегат говорит 5 — пользователь видит неверную сумму.

**Строки 490–530** (агрегаты):
```jsx
const ordersSum = ...  // сумма «Мои» заказов
const tableOrdersTotal = ...
const submittedTableTotal = ... // агрегат, НЕ rendered-data
```

### Что нужно сделать

**Шаг 1.1** — Добавить rendered-data invariant для таба «Стол».

После вычисления `otherGuestIdsFromOrders` (строки ~510-511) и перед рендером, вычислить суммы из реально отрисованных данных:

```jsx
// Rendered-data invariant для header
// Таб "Мои": блюда из myOrderItems (уже существует) → их сумма
const renderedMyDishCount = myOrderItems.length; // или соответствующая переменная
const renderedMyTotal = myOrderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

// Таб "Стол": блюда всех гостей включая себя (rendered в «Стол» = self-block + other guests)
const allTableOrderItems = [...(selfTableItems || []), ...otherGuestTableItems]; // будет добавлено в Fix 4
const renderedTableDishCount = allTableOrderItems.length;
const renderedTableTotal = allTableOrderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
const renderedTableGuestCount = otherGuestIdsFromOrders.length + (showSelfInTable ? 1 : 0); // +1 если себя показываем
```

**⚠️ Важно:** Точная реализация зависит от структуры данных в файле. Reviewer должен найти существующие переменные для количества и суммы блюд в «Мои» (уже вычислены), и создать аналоги для «Стол» с учётом самого гостя. Не выдумывать переменные — читать реальный код.

**Шаг 1.2** — Заменить header text (строки ~788-804):

```jsx
// БЫЛО:
{cartTab === 'table'
  ? `Заказано на стол: ${formatPrice(submittedTableTotal)}`
  : `${myOrdersCount} блюд · ${formatPrice(headerTotal)}`
}

// СТАЛО:
{cartTab === 'table'
  ? `Стол: ${renderedTableGuestCount} ${guestWord(renderedTableGuestCount)} · ${renderedTableDishCount} ${dishWord(renderedTableDishCount)} · ${formatPrice(renderedTableTotal)}`
  : `Вы: ${renderedMyDishCount} ${dishWord(renderedMyDishCount)} · ${formatPrice(renderedMyTotal)}`
}
```

Форматы (точный wording из DECISIONS_INDEX R2):
- «Мои»: `«Вы: X блюд · X ₸»`
- «Стол»: `«Стол: X гостя · X блюд · X ₸»`

Склонение «гостя/гостей» и «блюда/блюд»: использовать существующий `dishWord()` helper или аналог. Если нет — добавить простую функцию. Для «гостя/гостей»: 1 → «гость», 2-4 → «гостя», 5+ → «гостей».

### Grep verification
```bash
grep -n "submittedTableTotal\|Заказано на стол" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: строки ~490-530 (определение) + строки ~788-804 (использование в header)
grep -n "headerTotal\|ordersSum" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: строки ~490-530
```

### Acceptance Criteria
- [ ] Header «Мои»: «Вы: X блюд · X ₸» (НЕ «Заказано: X блюд»)
- [ ] Header «Стол»: «Стол: X гостя · X блюд · X ₸» (НЕ «Заказано на стол: X ₸»)
- [ ] Сумма в header строго из rendered-data (те же блюда, что видны на экране), НЕ из `submittedTableTotal`
- [ ] `submittedTableTotal` больше НЕ используется в header render (можно оставить определение если нужно для другого места — проверить)
- [ ] Склонение числительных корректно (1 гость, 2 гостя, 5 гостей)

---

## Fix 2 — ⏳ Ожидает Bucket (pending pre-production state)

**Задача:** Добавить третий bucket «Ожидает» (amber) для заказов в статусе `pending`/`submitted`/`new` до подтверждения официантом.

### Текущее состояние (проблема)

**Строки 309–350** (`getSafeStatus()`):
```jsx
function getSafeStatus(status) {
  if (['new', 'accepted', 'ready', 'in_progress'].includes(status)) return 'in_progress';
  if (['served', 'delivered'].includes(status)) return 'served';
  return 'in_progress'; // fallback
}
```
Проблема: `new`/`pending`/`submitted` → «В работе», хотя гость ещё не знает подтвердили ли. Нет визуальной «зоны ожидания».

**Строки 456–467** (`statusBuckets`):
```jsx
const statusBuckets = {
  served: [],
  in_progress: []
};
```
Проблема: только 2 корзины, нет `pending_unconfirmed`.

### Что нужно сделать

**Шаг 2.1** — Обновить `getSafeStatus()` (строки ~309-350):

```jsx
function getSafeStatus(status) {
  if (['pending', 'submitted', 'new'].includes(status)) return 'pending_unconfirmed';
  if (['accepted', 'ready', 'in_progress'].includes(status)) return 'in_progress';
  if (['served', 'delivered'].includes(status)) return 'served';
  return 'in_progress'; // fallback для неизвестных статусов
}
```

**⚠️ Важно:** Проверить реальные значения статусов в коде (grep `order.status` или `o.status`). Список `['pending', 'submitted', 'new']` — из DECISIONS_INDEX R1, но нужно убедиться что именно такие значения приходят из B44.

**Шаг 2.2** — Добавить `pending_unconfirmed` bucket (строки ~456-467):

```jsx
const statusBuckets = {
  pending_unconfirmed: [],
  in_progress: [],
  served: []
};
```

**Позиция в «Мои»:** Buckets рендерятся в порядке: `in_progress` → `pending_unconfirmed` (снизу) → `served`. Это соответствует R1: «Ожидает bucket — СНИЗУ «Мои» (ниже «В работе»)».

**Шаг 2.3** — Рендер «Ожидает» bucket в табе «Мои»:

Найти место рендера `statusBuckets.in_progress` и добавить аналогичный блок для `statusBuckets.pending_unconfirmed` ПОСЛЕ него:

```jsx
{/* ⏳ Ожидает bucket — ниже «В работе» */}
{statusBuckets.pending_unconfirmed.length > 0 && (
  <div className="mb-3">
    <div className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
      <span>⏳</span>
      <span>{tr('cart.bucket.pending', 'Ожидает подтверждения')}</span>
    </div>
    {statusBuckets.pending_unconfirmed.map(item => renderOrderItem(item))}
  </div>
)}
```

**⚠️ Важно:** Точный JSX-код зависит от того, как рендерятся другие buckets (найти renderOrderItem или эквивалентный helper). Reviewer должен соответствовать существующему паттерну.

**Шаг 2.4** — Badge «Ожидает» в табе «Стол» (per-item, inline):

В рендере блюд в табе «Стол» (строки ~834-891), при `getSafeStatus(item.status) === 'pending_unconfirmed'` добавить inline badge:

```jsx
{getSafeStatus(item.status) === 'pending_unconfirmed' && (
  <span className="text-xs text-amber-600 font-medium">⏳ Ожидает</span>
)}
```

**R1 FROZEN:** Badge ТОЛЬКО в «Стол», НЕ в «Мои». В «Мои» достаточно amber bucket-заголовка.

### Grep verification
```bash
grep -n "getSafeStatus\|statusBuckets\|pending_unconfirmed" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем до правки: 0 hits на pending_unconfirmed, getSafeStatus ~строки 309-350, statusBuckets ~456-467
grep -n "pending\|submitted" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Для понимания реальных значений статусов в коде
```

### Acceptance Criteria
- [ ] `getSafeStatus('pending')` → `'pending_unconfirmed'`
- [ ] `getSafeStatus('submitted')` → `'pending_unconfirmed'`
- [ ] `getSafeStatus('new')` → `'pending_unconfirmed'`
- [ ] `getSafeStatus('accepted')` → `'in_progress'` (НЕ изменился)
- [ ] `getSafeStatus('served')` → `'served'` (НЕ изменился)
- [ ] Bucket «Ожидает» отображается В «Мои» (amber заголовок ⏳, ниже «В работе»)
- [ ] Badge «⏳ Ожидает» видим в «Стол» (per-item), НЕ в «Мои»
- [ ] `statusBuckets` имеет 3 ключа: `pending_unconfirmed`, `in_progress`, `served`
- [ ] Helper `stale_pending` или «Проверяем подтверждение…» — НЕ добавлен (FROZEN: убран S302)

---

## Fix 3 — ✦ Terminal Screen «Спасибо за визит!»

**Задача:** Добавить финальный экран закрытия визита с durable persist — отображается когда стол закрыт или оплата подтверждена.

### Текущее состояние (проблема)

Нет ни одного из: `terminalState`, `tableClosedAt`, `paymentAccepted`, «Спасибо за визит» в файле.
```bash
grep -n "terminal\|tableClosedAt\|paymentAccepted\|Спасибо за визит" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits
```

### Что нужно сделать

**Шаг 3.1** — Добавить durable persist state.

В секции useState (начало компонента, ищи блок `const [cartTab, setCartTab]` ~строка 94 и рядом):

```jsx
// Terminal state durable persist
const [terminalStateShownForVersion, setTerminalStateShownForVersion] = React.useState(() => {
  try { return localStorage.getItem('cv_terminal_version') || null; } catch { return null; }
});
```

**Шаг 3.2** — Определить условие показа терминала.

Стол закрыт когда `tableSession?.status === 'closed'` (или аналогичный статус — проверить в коде как используется `tableSession`). Добавить вычисляемую переменную в секцию вычислений (после получения данных из хуков):

```jsx
const tableIsClosed = tableSession?.status === 'closed' || tableSession?.status === 'completed';
const currentVersion = tableSession?.id ? String(tableSession.id) : null;
const showTerminal = tableIsClosed && currentVersion && terminalStateShownForVersion !== currentVersion;
```

**⚠️ Важно:** Проверить реальные поля `tableSession` в коде. Grep: `tableSession?.status` или `useTableSession` hook. Список возможных «закрытых» статусов взять из существующего кода, не угадывать.

**Шаг 3.3** — Рендер Terminal screen.

Добавить ДО основного return JSX (или как первый блок внутри drawer container):

```jsx
{showTerminal && (
  <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center gap-4">
    <div className="text-5xl">✅</div>
    <h2 className="text-xl font-semibold text-gray-900">
      {tr('cart.terminal.title', 'Спасибо за визит!')}
    </h2>
    {currentOrdersTotal > 0 && (
      <p className="text-gray-600">
        {tr('cart.terminal.total', 'Ваша сумма')} {formatPrice(currentOrdersTotal)}
      </p>
    )}
    {/* Rating CTA — если есть нерейтингованные блюда */}
    {unratedDishesCount > 0 && (
      <button
        className="btn btn-primary w-full"
        onClick={() => { /* открыть rating flow */ }}
      >
        {tr('cart.terminal.rate_cta', 'Оценить блюда')}
      </button>
    )}
    <button
      className="text-sm text-gray-500 underline mt-2"
      onClick={() => { setTerminalStateShownForVersion(currentVersion); try { localStorage.setItem('cv_terminal_version', currentVersion); } catch {} }}
    >
      {tr('cart.terminal.back', 'Вернуться в меню')}
    </button>
  </div>
)}
```

**⚠️ Важно:** 
- `currentOrdersTotal` — использовать уже существующую переменную для суммы заказов гостя (не создавать новую).
- `unratedDishesCount` — использовать существующую логику рейтинга если есть, иначе пропустить блок.
- Структура JSX (classNames, компоненты) — соответствовать паттернам файла (shadcn/Tailwind стиль уже в файле).
- Durable: нажатие «Вернуться в меню» записывает `terminalStateShownForVersion` → экран не появится снова для того же стола.

### Grep verification
```bash
grep -n "tableSession\|table_session\|useTableSession" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Для понимания как доступен tableSession и его статус
grep -n "useState\|useEffect" menuapp-code-review/pages/PublicMenu/CartView.jsx | head -20
# Для нахождения блока state declarations
```

### Acceptance Criteria
- [ ] Экран «Спасибо за визит!» показывается когда стол закрыт (`tableSession.status === 'closed'` или аналог)
- [ ] Содержит: ✅ иконку, «Спасибо за визит!», сумму гостя, ссылку «Вернуться в меню»
- [ ] Durable: после нажатия «Вернуться в меню» экран НЕ показывается снова для того же `tableSession.id`
- [ ] При новом визите (новый `tableSession.id`) экран снова показывается
- [ ] Основной контент drawer скрыт когда Terminal активен (не оба одновременно)
- [ ] `stale_pending` helper не добавлен, `«Проверяем подтверждение…»` — не добавлен

---

## Fix 4 — Self-first «Вы (Гость N)» в табе «Стол»

**Задача:** Добавить блок текущего гостя первым в «Стол» (развёрнутый, «Вы (Гость N)»), остальные гости — ниже, свёрнутые по умолчанию.

### Текущее состояние (проблема)

**Строки 510–511** (`otherGuestIdsFromOrders`):
```jsx
const otherGuestIdsFromOrders = Array.from(ordersByGuestId.keys())
  .filter((gid) => !myGuestId || gid !== myGuestId);
```
Текущий гость (`myGuestId`) отфильтрован из списка → его блок вообще не рендерится в «Стол».

**Строка 542** (`showTableOrdersSection`):
```jsx
const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;
```
Секция показывается только если ЕСТЬ ДРУГИЕ гости. Свои заказы не видны в «Стол» (CV-NEW-03).

**Строки 834–891** (рендер «Стол»):
```jsx
{otherGuestIdsFromOrders.map(gid => (
  // рендерит блоки других гостей
))}
```
Нет self-block перед другими.

### Что нужно сделать

**Шаг 4.1** — Добавить self-block первым в «Стол».

В рендере таба «Стол» (строки ~834-891), ПЕРЕД `otherGuestIdsFromOrders.map(...)`, добавить блок текущего гостя:

```jsx
{/* Self-block: текущий гость первым, expanded */}
{myGuestId && ordersByGuestId.has(myGuestId) && (
  <GuestOrderBlock
    guestId={myGuestId}
    orders={ordersByGuestId.get(myGuestId)}
    label={tr('cart.table.you_guest', 'Вы (Гость {n})', { n: myGuestNumber || '' })}
    defaultExpanded={true}
    isSelf={true}
    key={`self-${myGuestId}`}
  />
)}

{/* Other guests — collapsed by default */}
{otherGuestIdsFromOrders.map(gid => (
  <GuestOrderBlock
    guestId={gid}
    orders={ordersByGuestId.get(gid)}
    label={...} // существующий лейбл для других гостей
    defaultExpanded={false}
    isSelf={false}
    key={gid}
  />
))}
```

**⚠️ Важно:** `GuestOrderBlock` — условное имя. Найти реальный компонент/паттерн рендера гостя в строках ~834-891. Адаптировать код под существующую структуру.

**Шаг 4.2** — Обновить `showTableOrdersSection`.

Секция должна показываться если есть КТО-ЛИБО в столе (себя + другие), не только другие:

```jsx
// БЫЛО:
const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

// СТАЛО:
const showTableOrdersSection = (myGuestId && ordersByGuestId.has(myGuestId)) || otherGuestIdsFromOrders.length > 0;
```

**Шаг 4.3** — Добавить expand/collapse для гостей (если не реализовано).

Если в текущем рендере нет collapse-логики, добавить простой expand-collapse:

```jsx
const [expandedGuests, setExpandedGuests] = React.useState(new Set([myGuestId])); // себя expand по умолчанию

const toggleGuest = (gid) => {
  setExpandedGuests(prev => {
    const next = new Set(prev);
    next.has(gid) ? next.delete(gid) : next.add(gid);
    return next;
  });
};
```

Показывать контент гостя только если `expandedGuests.has(gid)`.

**⚠️ Важно:** Если expand/collapse уже есть — использовать существующий механизм. Не дублировать.

### Grep verification
```bash
grep -n "otherGuestIds\|myGuestId\|showTableOrdersSection\|ordersByGuestId" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: ~510-511 определение otherGuestIdsFromOrders, ~508 myGuestId, ~542 showTableOrdersSection
grep -n "expandedGuest\|toggleGuest\|defaultExpanded" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits (функционал не реализован)
```

### Acceptance Criteria
- [ ] В «Стол» первым отображается блок «Вы (Гость N)» с заказами текущего гостя
- [ ] Self-block РАЗВЁРНУТ по умолчанию
- [ ] Блоки других гостей — СВЁРНУТЫ по умолчанию (клик раскрывает)
- [ ] Если у текущего гостя нет заказов в «Стол» — self-block не показывается (guard `ordersByGuestId.has(myGuestId)`)
- [ ] `showTableOrdersSection` = `true` если текущий гость имеет заказы (даже если других гостей нет)
- [ ] `otherGuestIdsFromOrders` по-прежнему фильтрует `myGuestId` (не ломать существующую логику, только добавить self-block отдельно)
- [ ] `myGuestId` корректно определён (строка ~508: `currentGuest?.id ? String(currentGuest.id) : null`)

---

## Review Instructions

Для каждого Fix-блока:

1. **Прочитать** соответствующие строки в CartView.jsx (используй Read с offset/limit)
2. **Проверить grep** — убедиться что код соответствует описанному выше состоянию
3. **Оценить** предложенный Fix (1-5):
   - 5 = точно, безопасно, никаких сомнений
   - 4 = небольшие уточнения (конкретные строки)
   - 3 = нужна доработка (что именно)
   - 1-2 = BLOCKER (обязательно описать причину)
4. **Указать конкретные строки** для каждого изменения
5. **Флаги:**
   - 🚨 BLOCKER — критическая проблема, Fix нельзя применять
   - ⚠️ WARNING — можно применить, но с осторожностью
   - ✅ APPROVED — можно применять as-is

### Final Rating Table

| Fix | CC Rating | Codex Rating | Verdict |
|-----|-----------|--------------|---------|
| Fix 1 Header+Invariant | ? | ? | ? |
| Fix 2 Ожидает bucket | ? | ? | ? |
| Fix 3 Terminal screen | ? | ? | ? |
| Fix 4 Self-first Стол | ? | ? | ? |

---

## НЕ делать (scope lock)

- ❌ Не менять sessionHelpers.js, partnertables.jsx или другие файлы
- ❌ Не добавлять «Попросить счёт» standalone CTA (V4 FROZEN: через 🔔 ServiceRequest)
- ❌ Не добавлять helper «Проверяем подтверждение…» / `stale_pending` (убран S302)
- ❌ Не менять логику rating flow (CV-C/C2/C3 states) — не в скоупе
- ❌ Не трогать таб «Мои» структуру (только добавить pending_unconfirmed bucket снизу)
- ❌ Не форсировать Math.round() на ценах для KZT/RUB (KB-167: by design)
