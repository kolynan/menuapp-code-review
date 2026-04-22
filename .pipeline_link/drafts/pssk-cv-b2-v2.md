---
chain_template: pssk-review
budget: 10
code_file: menuapp-code-review/pages/PublicMenu/CartView.jsx
ws: WS-CV
type: ПССК
---

# ПССК CV-B2 — CartView Batch 2
**Версия:** v2 | **Сессия:** S303 | **Дата:** 2026-04-16

## Context

**File:** `menuapp-code-review/pages/PublicMenu/CartView.jsx`
**Lines:** 1227 | **Last RELEASE commit:** `fa73c97` (RELEASE `260415-01 CartView RELEASE.jsx`)
**UX Source of Truth:** `ux-concepts/CartView/260416-02 CartView Mockup v11 S302.html` (FROZEN v11, 8 states + ✦ Terminal)
> ⚠️ **Note:** All FROZEN UX and spec content needed for review is provided **inline** in this file below. Do NOT attempt to read external files outside `menuapp-code-review/` — they are inaccessible in worktree.

This prompt covers **4 Fix-blocks** for CartView Batch 2:
- **Fix 1 [BUG at lines 788-804]:** Header attribution «Вы:»/«Стол:» + rendered-data invariant (R2, CV-NEW-01)
- **Fix 2 [NEW CODE]:** ⏳ Ожидает bucket — pending pre-production state (R1)
- **Fix 3 [NEW CODE]:** ✦ Terminal screen «Спасибо за визит!» with durable persist (R4)
- **Fix 4 [BUG at lines 833-891]:** Self-first «Вы (Гость N)» in «Стол» tab — own orders visible + expanded (CV-NEW-03, CV-16/17)

**Scope lock:** Only `pages/PublicMenu/CartView.jsx`. No changes to other files.

---

## ⛔ FROZEN UX — ОБЯЗАТЕЛЬНО К СОБЛЮДЕНИЮ (Rule 33)

Следующие решения LOCKED. Нельзя оспаривать, изменять или предлагать альтернативы.
(Source: DECISIONS_INDEX §2, content inlined here)

| ID | Решение |
|----|---------|
| **R1** | `'submitted'` статус → `⏳ Ожидает` (текст + иконка, НЕ иконка-only). `'accepted'/'ready'/'in_progress'` → `🔵 В работе` (уже так). «Ожидает» bucket — СНИЗУ «Мои» (ниже «В работе»). Badge «Ожидает» — ТОЛЬКО в табе «Стол» (per-item). В «Мои» — badge нет, достаточно amber bucket-заголовка. |
| **R2** | Таб «Мои» header → `«Вы: X блюд · X ₸»`. Таб «Стол» header → `«Стол: X гостя · X блюд · X ₸»`. Сумма = from rendered-data (не из агрегата `submittedTableTotal`). |
| **V4** | Standalone CTA «Попросить счёт» УБРАН. Footer «Стол»: «Вернуться в меню» (outline) + helper «Нужна помощь или счёт? Нажмите 🔔». |
| **R4** | Terminal = единый экран «Спасибо за визит!» при закрытии стола. Durable persist `terminalStateShownForVersion` (localStorage). |
| **CV-52** | «В работе»: calm bg, без stepper. «В корзине»: яркий, stepper видим. Badge «Отправлено» убран везде. |
| **CV-50** | Деньги убраны из групп (В работе, В корзине, Выдано). Деньги ТОЛЬКО в header drawer. |
| **CV-16/17** | Self-block «Вы (Гость N)» — первым в «Стол», expanded. Остальные гости — collapsed по умолчанию. |
| **stale helper** | Helper «Проверяем подтверждение…» (`stale_pending`) — УБРАН (S302). НЕ восстанавливать. |

---

## Preparation

```bash
cp menuapp-code-review/pages/PublicMenu/CartView.jsx menuapp-code-review/pages/PublicMenu/CartView.jsx.working
wc -l menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 1227 строк
git -C menuapp-code-review log --oneline -1
# Ожидаем: fa73c97 или новее
```

---

## Fix 1 — Header Attribution + Rendered-Data Invariant [BUG at lines 788-804]

**Проблема:** Header использует `submittedTableTotal` (агрегат из строк ~525-530) вместо суммы реально отрендеренных блюд. Нет атрибуции «Вы:»/«Стол:». [CV-NEW-01]

### Верификация grep перед ревью
```bash
grep -an "submittedTableTotal\|Заказано на стол\|cart.header" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 525`: определение `submittedTableTotal` (useMemo агрегат)
- `~line 799`: `Заказано на стол` в header render — это и есть баг
- `~line 804`: `totalDishCount ... блюд · headerTotal` — правильная структура для «Мои», но без «Вы:» prefix

### Текущий код (строки 788-810)
```jsx
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => sum + ..., 0);
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? <p>Заказано на стол: {formatPrice(submittedTableTotal)}</p>   // ← БАГИ: нет «Стол:», агрегат
    : totalDishCount > 0 ? <p>{totalDishCount} блюд · {headerTotal}</p>  // ← нет «Вы:» prefix
    : null;
})()}
```

### Что нужно сделать

**Шаг 1.1** — Добавить rendered-data сумму для таба «Стол».

Найти строки ~514-523 где определён `tableOrdersTotal`:
```js
const tableOrdersTotal = React.useMemo(() => {
  // суммирует по otherGuestIdsFromOrders (только ДРУГИЕ гости)
}, [ordersByGuestId, otherGuestIdsFromOrders]);
```

`tableOrdersTotal` считает только других гостей. Для R2 нужна сумма ВСЕХ гостей включая себя. Добавить:
```jsx
const renderedTableTotal = React.useMemo(() => {
  let total = 0;
  // Себя (если есть заказы)
  if (myGuestId && ordersByGuestId.has(myGuestId)) {
    (ordersByGuestId.get(myGuestId) || []).forEach(o => {
      if (o.status !== 'cancelled') total += Number(o.total_amount) || 0;
    });
  }
  // Других гостей
  otherGuestIdsFromOrders.forEach(gid => {
    (ordersByGuestId.get(gid) || []).forEach(o => {
      if (o.status !== 'cancelled') total += Number(o.total_amount) || 0;
    });
  });
  return total;
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders]);

const renderedTableDishCount = React.useMemo(() => {
  let count = 0;
  const allGuestIds = [...(myGuestId ? [myGuestId] : []), ...otherGuestIdsFromOrders];
  allGuestIds.forEach(gid => {
    (ordersByGuestId.get(gid) || []).forEach(o => {
      if (o.status !== 'cancelled') count += (itemsByOrder.get(o.id) || []).length || 1;
    });
  });
  return count;
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders, itemsByOrder]);

const renderedTableGuestCount = (myGuestId && ordersByGuestId.has(myGuestId) ? 1 : 0) + otherGuestIdsFromOrders.length;
```

> ⚠️ Важно: Reviewer — проверить что `itemsByOrder` доступен в этом scope (он есть как prop строка 53). Если count нельзя из itemsByOrder — использовать `orders.length` как fallback.

**Шаг 1.2** — Заменить header render (строки ~788-810):

```jsx
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && renderedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => sum + ..., 0); // не менять
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? (renderedTableTotal > 0 ? (
        <p className="text-sm text-slate-600">
          {tr('cart.header.table_label', 'Стол')}: {renderedTableGuestCount}{' '}
          {pluralizeRu(renderedTableGuestCount,
            tr('cart.header.guest_one', 'гость'),
            tr('cart.header.guest_few', 'гостя'),
            tr('cart.header.guest_many', 'гостей')
          )}{' '}
          · {renderedTableDishCount}{' '}
          {pluralizeRu(renderedTableDishCount,
            tr('cart.header.dish_one', 'блюдо'),
            tr('cart.header.dish_few', 'блюда'),
            tr('cart.header.dish_many', 'блюд')
          )}{' '}
          · {formatPrice(parseFloat(renderedTableTotal.toFixed(2)))}
        </p>
      ) : null)
    : (totalDishCount > 0 ? (
        <p className="text-sm text-slate-600">
          {tr('cart.header.you_label', 'Вы')}: {totalDishCount}{' '}
          {pluralizeRu(totalDishCount,
            tr('cart.header.dish_one', 'блюдо'),
            tr('cart.header.dish_few', 'блюда'),
            tr('cart.header.dish_many', 'блюд')
          )}{' '}
          · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
        </p>
      ) : null);
})()}
```

> ⚠️ Важно: Reviewer — сверить className с существующим классом `<p>` в этом блоке (~line 804). Сохранить те же Tailwind-классы.
> 
> Функция `pluralizeRu` уже существует в файле (grep: `pluralizeRu` → ~line 804). Использовать её как есть.

**НЕ делать:**
- ❌ Не удалять определение `submittedTableTotal` (может использоваться в другом месте — проверить grep)
- ❌ Не менять логику `totalDishCount` и `headerTotal` для «Мои» (только добавить «Вы:» prefix)

### Acceptance Criteria
- [ ] Header «Мои»: `«Вы: X блюд · X ₸»` (pluralized)
- [ ] Header «Стол»: `«Стол: X гостя · X блюд · X ₸»` (pluralized)
- [ ] `submittedTableTotal` НЕ используется в header render после фикса
- [ ] Сумма в «Стол» header — из `renderedTableTotal` (включает себя + других)
- [ ] Показывается condition включает `renderedTableTotal > 0` вместо `submittedTableTotal > 0`

---

## Fix 2 — ⏳ Ожидает Bucket [NEW CODE]

**Задача:** Добавить третий bucket «Ожидает» (amber) для заказов в статусе `'submitted'` — до подтверждения официантом.

### Верификация grep перед ревью
```bash
grep -an "statusBuckets\|groups.*served\|in_progress.*groups\|pending_unconfirmed\|submitted" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 457`: `const groups = { served: [], in_progress: [] }` — 2 группы, нет pending
- `~line 461`: условие `isServed` через `stageInfo.internal_code`
- `~line 528`: `submittedTableTotal` фильтрует `o.status === 'submitted'` как первый статус
- `pending_unconfirmed` — 0 hits (не реализовано)

```bash
grep -an "getSafeStatus\|internal_code" menuapp-code-review/pages/PublicMenu/CartView.jsx | head -15
```
Ожидаем:
- `~line 309`: `const getSafeStatus = (status) => {` — принимает stageInfo объект
- `~line 314-318`: обрабатывает `status.internal_code` (НЕ raw string статус заказа)

### Архитектура (важно понять перед ревью)

`statusBuckets` (строки ~456-467) использует **`getOrderStatus(o)`** для определения bucket — НЕ `getSafeStatus`. Присвоение bucket:
```js
const stageInfo = getOrderStatus(o);
const isServed = stageInfo?.internal_code === 'finish'
  || (!stageInfo?.internal_code && ['served', 'completed'].includes(o.status.toLowerCase()));
const isCancelled = ...(o.status === 'cancelled');
if (isServed) groups.served.push(o);
else if (!isCancelled) groups.in_progress.push(o);
```

`getSafeStatus(stageInfo)` используется ТОЛЬКО для отображения статуса блюд в «Стол» tab (~line 882).

### Что нужно сделать

**Шаг 2.1** — Обновить `statusBuckets` — добавить pending_unconfirmed bucket (строки ~456-467):

```jsx
const statusBuckets = React.useMemo(() => {
  const groups = { pending_unconfirmed: [], in_progress: [], served: [] };
  todayMyOrders.forEach(o => {
    const stageInfo = getOrderStatus(o);
    const isServed = stageInfo?.internal_code === 'finish'
      || (!stageInfo?.internal_code && ['served', 'completed'].includes((o.status || '').toLowerCase()));
    const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
    // NEW: pending_unconfirmed = submitted status (awaiting waiter confirmation)
    const isPending = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'submitted';
    
    if (isServed) groups.served.push(o);
    else if (isPending) groups.pending_unconfirmed.push(o);
    else if (!isCancelled) groups.in_progress.push(o);
  });
  return groups;
}, [todayMyOrders, getOrderStatus]);
```

> ⚠️ Важно: Reviewer — проверить что `'submitted'` — это реальный pre-acceptance статус в B44 (из grep ~line 528: `submittedTableTotal` явно фильтрует `o.status === 'submitted'` отдельно от `'accepted'` → подтверждает что submitted = до подтверждения). Если есть другие pre-acceptance статусы (например `'pending'`) — добавить их тоже.

**Шаг 2.2** — Обновить `currentGroupKeys` (~строки 470-474) — добавить ключ для pending bucket:

```jsx
const currentGroupKeys = [
  statusBuckets.served.length > 0 ? 'S' : '',
  statusBuckets.pending_unconfirmed.length > 0 ? 'P' : '',  // NEW
  statusBuckets.in_progress.length > 0 ? 'I' : '',
  cart.length > 0 ? 'C' : ''
].join('');
```

**Шаг 2.3** — Добавить `pending_unconfirmed` в `groupLabels` (~строки 575-577):

```jsx
const groupLabels = {
  pending_unconfirmed: tr('cart.group.pending', '⏳ Ожидает'),  // NEW
  served: tr('cart.group.served', 'Выдано'),
  in_progress: tr('cart.group.in_progress', 'В работе'),
};
```

**Шаг 2.4** — Добавить рендер «Ожидает» bucket в табе «Мои»:

Найти место рендера `statusBuckets.in_progress` (в блоке «Мои» заказов) и добавить «Ожидает» bucket ПОСЛЕ него:

```jsx
{/* ⏳ Ожидает bucket — ниже «В работе» (R1 FROZEN: snizhu) */}
{statusBuckets.pending_unconfirmed.length > 0 && (
  <div className="mb-3">
    <div className="text-xs font-medium text-amber-600 mb-2">
      {groupLabels.pending_unconfirmed}
    </div>
    {renderBucketOrders(statusBuckets.pending_unconfirmed, false)}
  </div>
)}
```

> ⚠️ Важно: Reviewer — функция `renderBucketOrders` существует (~line 627, grep: `renderBucketOrders`). Использовать её паттерн. Если `renderBucketOrders` не подходит — использовать тот же паттерн что у `statusBuckets.in_progress` render.

**Шаг 2.5** — Badge «Ожидает» в «Стол» tab per-item (R1 FROZEN):

В рендере блюд в «Стол» (~строки 878-910), найти где используется `getSafeStatus` (~line 882) и добавить badge:

```jsx
const status = getSafeStatus(getOrderStatus(order));
// Add: pending badge for submitted orders
const isOrderPending = (order.status || '').toLowerCase() === 'submitted';
```

И в JSX рядом со статусом заказа:
```jsx
{isOrderPending && (
  <span className="text-xs text-amber-600 font-medium ml-1">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
)}
```

**НЕ делать:**
- ❌ Не добавлять badge «Ожидает» в «Мои» таб (R1 FROZEN: только amber заголовок bucket)
- ❌ Не добавлять helper «Проверяем подтверждение…» или stale_pending (FROZEN: убран S302)
- ❌ Не менять getSafeStatus для pending — bucket assignment через statusBuckets, не через getSafeStatus

### Acceptance Criteria
- [ ] `statusBuckets` имеет 3 ключа: `pending_unconfirmed`, `in_progress`, `served`
- [ ] Заказ со статусом `'submitted'` → в `pending_unconfirmed` bucket (не в in_progress)
- [ ] Bucket «Ожидает» (amber) отображается в «Мои» НИЖЕ «В работе»
- [ ] Badge «⏳ Ожидает» видим в «Стол» (per-item) при `status === 'submitted'`
- [ ] НЕТ badge «Ожидает» в «Мои» (только amber заголовок)
- [ ] `stale_pending` / «Проверяем подтверждение…» — НЕ добавлен

---

## Fix 3 — ✦ Terminal Screen «Спасибо за визит!» [NEW CODE]

**Задача:** Добавить финальный экран при закрытии стола с durable persist.

### Верификация grep перед ревью
```bash
grep -an "currentTable\|table.*status\|status.*closed\|tableStatus\|isTableClosed\|terminal\|Спасибо" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 19`: `currentTable` prop присутствует
- `terminal`, `Спасибо` — 0 hits (не реализовано)

> ⚠️ ВАЖНО для Reviewer: `tableSession` prop НЕ СУЩЕСТВУЕТ в этом компоненте (verified grep). Используется `currentTable` prop (line 19). Проверить: `currentTable?.status === 'closed'` или аналогичный field. Если `currentTable` не имеет status field — исследовать альтернативу через `sessionOrders` prop (все заказы имеют статус closed?). **Reviewer должен определить верный data source и отразить в findings.**

### Что нужно сделать

**Шаг 3.1** — Добавить durable persist state (в начале компонента, рядом с другими useState):

```jsx
const [terminalDismissedForTable, setTerminalDismissedForTable] = React.useState(() => {
  try { return localStorage.getItem('cv_terminal_dismissed') || null; } catch { return null; }
});
```

**Шаг 3.2** — Вычислить условие показа terminal:

```jsx
// Fix 3: Terminal state — показывается когда стол закрыт и не был отклонён
// ⚠️ Reviewer: проверить корректный field для closed status (currentTable?.status)
const tableIsClosed = currentTable?.status === 'closed' || currentTable?.status === 'completed';
const currentTableKey = currentTable?.id ? String(currentTable.id) : null;
const showTerminal = tableIsClosed && currentTableKey && terminalDismissedForTable !== currentTableKey;
```

**Шаг 3.3** — Рендер Terminal screen (добавить ПЕРЕД основным контентом drawer, после header):

```jsx
{showTerminal ? (
  <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center gap-5">
    <div className="text-6xl">✅</div>
    <h2 className="text-xl font-semibold text-gray-900">
      {tr('cart.terminal.title', 'Спасибо за визит!')}
    </h2>
    {ordersSum > 0 && (
      <p className="text-gray-600 text-sm">
        {tr('cart.terminal.your_total', 'Ваша сумма')}: {formatPrice(parseFloat(ordersSum.toFixed(2)))}
      </p>
    )}
    <button
      className="w-full btn btn-outline mt-2"
      onClick={() => {
        setTerminalDismissedForTable(currentTableKey);
        try { localStorage.setItem('cv_terminal_dismissed', currentTableKey); } catch {}
        onClose?.();
      }}
    >
      {tr('cart.terminal.back_to_menu', 'Вернуться в меню')}
    </button>
  </div>
) : (
  /* основной контент drawer сюда — условно показывать ИЛИ terminal ИЛИ основной контент */
  /* Reviewer: определить точное место wrap */
)}
```

> ⚠️ Важно: Reviewer —
> 1. `btn btn-outline` — проверить что эти классы существуют в файле (grep: `btn-outline`). Если нет — использовать className из существующей кнопки «Вернуться в меню» (~line 1221).
> 2. `onClose` prop — существует (~line 72, grep подтвердил).
> 3. Вся основная структура drawer должна показываться только когда `!showTerminal`. Reviewer должен предложить точный wrap — либо ternary на верхнем уровне рендера, либо early return.

**НЕ делать:**
- ❌ Не показывать terminal и основной контент одновременно
- ❌ Не добавлять счётчик обратного отсчёта (не в скоупе)

### Acceptance Criteria
- [ ] Экран «Спасибо за визит!» показывается когда `currentTable.status === 'closed'` (или правильный статус — Reviewer уточнит)
- [ ] Содержит: ✅ иконку, «Спасибо за визит!», сумму гостя (если > 0), кнопку «Вернуться в меню»
- [ ] Нажатие «Вернуться в меню» закрывает drawer + записывает dismissed в localStorage
- [ ] При повторном открытии того же стола — экран НЕ показывается
- [ ] При новом столе (новый `currentTable.id`) — экран снова показывается
- [ ] Основной контент скрыт когда Terminal активен

---

## Fix 4 — Self-first «Вы (Гость N)» в «Стол» [BUG at lines 833-891]

**Проблема:** Текущий гость отфильтрован из «Стол» (`myGuestId` исключается в строке ~511). Свои заказы не видны в «Стол». [CV-NEW-03]

### Верификация grep перед ревью
```bash
grep -an "otherGuestIds\|showTableOrders\|otherGuestsExpanded\|setOtherGuestsExpanded\|myGuestId" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 508`: `const myGuestId = currentGuest?.id ? String(currentGuest.id) : null`
- `~line 511`: filter: `gid !== myGuestId` — текущий гость исключён из списка
- `~line 63-64`: `setOtherGuestsExpanded`, `otherGuestsExpanded` — уже переданы как props (boolean для ВСЕХ других гостей)
- `~line 838`: `onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}` — один toggle для всех
- `~line 861`: `{otherGuestsExpanded && (...)}` — отображает всех других гостей

**Важное понимание:** `otherGuestsExpanded` — ОДИН boolean для всех чужих гостей (не per-guest). Его трогать НЕ нужно. Self-block добавляется ПЕРЕД секцией других гостей.

### Что нужно сделать

**Шаг 4.1** — Добавить self-block ПЕРЕД секцией «Заказы стола».

Найти строку ~833: `{/* SECTION 5: TABLE ORDERS (other guests) */}` и добавить ПЕРЕД ней:

```jsx
{/* SECTION 4.5: SELF BLOCK in Стол tab — own orders, shown first (CV-16/17, CV-NEW-03) */}
{cartTab === 'table' && myGuestId && ordersByGuestId.has(myGuestId) && (
  <Card className="mb-4">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">
            {tr('cart.table.you', 'Вы')} ({getGuestLabelById(myGuestId)})
          </span>
        </div>
        <span className="font-bold text-slate-700">
          {formatPrice(parseFloat(Number(
            (ordersByGuestId.get(myGuestId) || []).reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
          ).toFixed(2)))}
        </span>
      </div>
      {/* Self orders expanded by default (CV-16) */}
      <div className="pl-2 border-l-2 border-slate-200 space-y-1">
        {(ordersByGuestId.get(myGuestId) || []).map((order) => {
          const items = itemsByOrder.get(order.id) || [];
          const status = getSafeStatus(getOrderStatus(order));
          const isOrderPending = (order.status || '').toLowerCase() === 'submitted'; // Fix 2 связь
          return (
            <div key={order.id} className="text-xs flex justify-between items-center py-0.5">
              <span className="text-slate-700">
                {status.icon} {items.length > 0 ? `${items.length} блюд` : tr('cart.order_total', 'Заказ')}
                {isOrderPending && (
                  <span className="ml-1 text-amber-600">⏳</span>
                )}
              </span>
              <span className="text-slate-500 font-medium">
                {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
              </span>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}
```

> ⚠️ Важно: Reviewer —
> 1. `getGuestLabelById(myGuestId)` — функция существует (~line 533, grep подтвердил).
> 2. `Card`, `CardContent` — проверить что импортированы (~line 1-15, должны быть).
> 3. `Users` — проверить import (~line 841 использует `<Users ...>`, значит импортирован).
> 4. Структуру render блюд адаптировать под ТОЧНЫЙ паттерн из строк ~863-910 (другие гости). Скопировать паттерн, не изобретать новый.

**Шаг 4.2** — Обновить `showTableOrdersSection`:

```jsx
// БЫЛО (~line 542):
const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

// СТАЛО:
const showTableOrdersSection = (myGuestId && ordersByGuestId.has(myGuestId)) || otherGuestIdsFromOrders.length > 0;
```

**Шаг 4.3** — НЕ менять секцию «Заказы стола» (~833-891).

Секция с `otherGuestsExpanded` остаётся без изменений. Self-block добавляется КАК ОТДЕЛЬНАЯ Card ПЕРЕД ней, не внутри.

**НЕ делать:**
- ❌ Не добавлять self-block внутрь секции `otherGuestIdsFromOrders.map(...)` 
- ❌ Не менять `otherGuestIdsFromOrders` фильтр (он правильный)
- ❌ Не трогать `otherGuestsExpanded` логику

### Acceptance Criteria
- [ ] В «Стол» отображается card «Вы (Гость N)» ПЕРЕД «Заказы стола»
- [ ] Self-block ВСЕГДА expanded (нет кнопки collapse для него)
- [ ] Self-block показывается только когда `ordersByGuestId.has(myGuestId)` (есть свои заказы)
- [ ] `showTableOrdersSection = true` даже если других гостей нет (только свои заказы)
- [ ] Другие гости по-прежнему через `otherGuestsExpanded` toggle (не затронуто)
- [ ] `myGuestId` не появился в `otherGuestIdsFromOrders` (фильтр не изменён)

---

## MOBILE-FIRST CHECK (MANDATORY)

This is a mobile-first restaurant app. Verify at **375px width**:
- [ ] Fix 1: Header «Вы:»/«Стол:» text wraps gracefully on narrow screens (no overflow)
- [ ] Fix 2: «Ожидает» bucket header amber text readable at 375px
- [ ] Fix 3: Terminal «Спасибо за визит!» centered on small screen, «Вернуться в меню» full-width button
- [ ] Fix 4: Self-block card not overflowing horizontally
- [ ] Touch targets >= 44px for any new interactive elements (Fix 3 close button)
- [ ] No new content below bottom sticky footer

---

## Regression Check (MANDATORY after fixes)

Проверить что существующие функции НЕ сломаны:
- [ ] Таб «Мои» открывается, блюда отображаются с bucket «В работе» / «Выдано»
- [ ] Кнопка «Заказать ещё» (в footer «Мои») работает
- [ ] Rating mode (state C/C2/C3) по-прежнему работает для «Выдано»
- [ ] Таб «Стол» переключается, другие гости отображаются через `otherGuestsExpanded`
- [ ] Header «Мои»: `totalDishCount` и `headerTotal` корректны (не затронуты Fix 1)
- [ ] `submittedTableTotal` не вызывает ошибку (если переменная осталась, не используется в header)

---

## Review Instructions

Для каждого Fix:
1. **Прочитать** указанные строки `Read ... --offset=X --limit=Y`
2. **Выполнить** grep verification из секции Fix
3. **Оценить** (1-5), указать точные строки для изменений
4. **Флаги:** 🚨 BLOCKER | ⚠️ WARNING | ✅ APPROVED

### Final Rating Table

| Fix | CC Rating | Codex Rating | Verdict |
|-----|-----------|--------------|---------|
| Fix 1 Header+Invariant [BUG] | ? | ? | ? |
| Fix 2 Ожидает bucket [NEW CODE] | ? | ? | ? |
| Fix 3 Terminal screen [NEW CODE] | ? | ? | ? |
| Fix 4 Self-first Стол [BUG] | ? | ? | ? |

---

## НЕ делать (scope lock)

- ❌ Не менять sessionHelpers.js, partnertables.jsx или другие файлы
- ❌ Не добавлять «Попросить счёт» standalone CTA (V4 FROZEN)
- ❌ Не добавлять `stale_pending` / «Проверяем подтверждение…» (убран S302)
- ❌ Не менять rating flow (states C/C2/C3) — не в скоупе
- ❌ Не форсировать Math.round() на ценах для KZT/RUB (KB-167: by design)
- ❌ Не менять `otherGuestsExpanded` логику / UI (Add self-block separately)

### ⚠️ i18n Exception (B8)

Реализация добавит новые `tr()` ключи. КС для этого батча ОБЯЗАН добавить их в i18n dictionary.
Новые ключи:
```
cart.header.you_label      → «Вы»
cart.header.table_label    → «Стол»
cart.header.guest_one      → «гость»
cart.header.guest_few      → «гостя»
cart.header.guest_many     → «гостей»
cart.terminal.title        → «Спасибо за визит!»
cart.terminal.your_total   → «Ваша сумма»
cart.terminal.back_to_menu → «Вернуться в меню»
cart.group.pending         → «⏳ Ожидает»
cart.order.pending_badge   → «Ожидает»
cart.table.you             → «Вы»
```

> i18n функция в файле: `const tr = (key, fallback)` (line 282). Использовать ТОЛЬКО `tr()`, НЕ `t()` или `trFormat()`.

---

## FROZEN UX Grep Verification (E3 — MANDATORY before commit)

Выполнить после реализации, убедиться что FROZEN elements не затронуты:

```bash
# CV-52: только 2 статуса guest-facing (В работе / Выдано) — bucket заголовки
grep -n "cart.group.in_progress\|cart.group.served\|В работе\|Выдано" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: существующие строки ПЛЮС новый pending bucket с отдельным ключом cart.group.pending

# CV-50: деньги только в header, не в bucket-заголовках
grep -n "formatPrice" menuapp-code-review/pages/PublicMenu/CartView.jsx | grep -i "group\|bucket\|in_progress\|served"
# Ожидаем: 0 hits (formatPrice не используется в bucket-заголовках)

# V4: standalone «Попросить счёт» CTA не добавлен
grep -n "Попросить счёт\|ask_bill\|request.*bill\|bill.*cta" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits

# stale_pending не восстановлен
grep -n "stale_pending\|Проверяем подтверждение" menuapp-code-review/pages/PublicMenu/CartView.jsx
# Ожидаем: 0 hits
```
