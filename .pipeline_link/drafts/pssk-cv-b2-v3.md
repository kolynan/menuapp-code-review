---
chain_template: pssk-review
budget: 10
code_file: menuapp-code-review/pages/PublicMenu/CartView.jsx
ws: WS-CV
type: ПССК
---

# ПССК CV-B2 — CartView Batch 2
**Версия:** v3 | **Сессия:** S303 | **Дата:** 2026-04-16
**Изменения v3 vs v2:** Fix 1 формула dish-count выровнена с существующей (sum quantities); «Текущий код» блок показывает реальную `<div>` разметку; className нового JSX = существующему; Fix 4 Шаг 4.2 расширен — явное изменение условия на line 834 (избежать пустой карточки «Заказы стола (0)»).

## Context

**File:** `menuapp-code-review/pages/PublicMenu/CartView.jsx`
**Lines:** 1227 | **Last RELEASE commit:** `fa73c97` (RELEASE `260415-01 CartView RELEASE.jsx`)
**UX Source of Truth:** `ux-concepts/CartView/260416-02 CartView Mockup v11 S302.html` (FROZEN v11, 8 states + ✦ Terminal)
> ⚠️ **Note:** All FROZEN UX and spec content needed for review is provided **inline** in this file below. Do NOT attempt to read external files outside `menuapp-code-review/` — they are inaccessible in worktree.

This prompt covers **4 Fix-blocks** for CartView Batch 2:
- **Fix 1 [BUG at lines 787-807]:** Header attribution «Вы:»/«Стол:» + rendered-data invariant (R2, CV-NEW-01)
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
| **R2** | Таб «Мои» header → `«Вы: X блюд · X ₸»`. Таб «Стол» header → `«Стол: X гостя · X блюд · X ₸»`. Сумма = from rendered-data (не из агрегата `submittedTableTotal`). Количество блюд = сумма quantity (не count заказов). |
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

## Fix 1 — Header Attribution + Rendered-Data Invariant [BUG at lines 787-807]

**Проблема:** Header использует `submittedTableTotal` (агрегат из строк 525-531) вместо суммы реально отрендеренных блюд. Нет атрибуции «Вы:»/«Стол:». [CV-NEW-01]

### Верификация grep перед ревью
```bash
grep -an "submittedTableTotal\|Заказано на стол\|table_ordered\|ordersItemCount" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 525-531`: определение `submittedTableTotal` (useMemo агрегат)
- `~line 788`: начало условного блока header (`ordersSum > 0 || cart.length > 0 ...`)
- `~line 789-792`: `ordersItemCount` — **сумма quantity, НЕ count заказов** (важно для Fix 1)
- `~line 798-800`: текущий «Заказано на стол» render — это и есть баг (нет атрибуции, из агрегата)
- `~line 802-806`: текущий «Мои» render — правильная структура, но без «Вы:» prefix

### Текущий код (строки 787-807, точная копия)
```jsx
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && submittedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => {
    const items = itemsByOrder.get(o.id) || [];
    return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? (
      <div className="text-xs text-slate-500 mt-0.5">
        {tr('cart.header.table_ordered', 'Заказано на стол')}: {formatPrice(parseFloat(Number(submittedTableTotal).toFixed(2)))}
      </div>
    )
    : totalDishCount > 0 ? (
      <div className="text-xs text-slate-500 mt-0.5">
        {totalDishCount} {pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
      </div>
    ) : null;
})()}
```

### Что нужно сделать

**Шаг 1.1** — Добавить rendered-data сумму и счётчик блюд для таба «Стол».

Найти строки ~514-523 где определён `tableOrdersTotal` (считает только других гостей), и ДОБАВИТЬ НИЖЕ (до `submittedTableTotal`, строка ~525):

```jsx
// Fix 1 (R2): rendered-data aggregates across ALL guests (self + others) for «Стол» header
const renderedTableTotal = React.useMemo(() => {
  let total = 0;
  const allGuestIds = [...(myGuestId ? [myGuestId] : []), ...otherGuestIdsFromOrders];
  allGuestIds.forEach((gid) => {
    const orders = ordersByGuestId.get(gid) || [];
    orders.forEach((o) => {
      if (o.status !== 'cancelled') total += Number(o.total_amount) || 0;
    });
  });
  return parseFloat(total.toFixed(2));
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders]);

// Fix 1 (R2): dish count = sum of item quantities (same semantics as ordersItemCount line 789-792)
const renderedTableDishCount = React.useMemo(() => {
  let count = 0;
  const allGuestIds = [...(myGuestId ? [myGuestId] : []), ...otherGuestIdsFromOrders];
  allGuestIds.forEach((gid) => {
    const orders = ordersByGuestId.get(gid) || [];
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      const items = itemsByOrder.get(o.id) || [];
      count += items.reduce((s, it) => s + (it.quantity || 1), 0);
    });
  });
  return count;
}, [ordersByGuestId, myGuestId, otherGuestIdsFromOrders, itemsByOrder]);

// Fix 1 (R2): guest count = self (if has orders) + others
const renderedTableGuestCount = React.useMemo(() => {
  const selfCount = myGuestId && ordersByGuestId.has(myGuestId) ? 1 : 0;
  return selfCount + otherGuestIdsFromOrders.length;
}, [myGuestId, ordersByGuestId, otherGuestIdsFromOrders]);
```

> ⚠️ Важно: Reviewer —
> 1. `itemsByOrder` — это prop, приходит на вход компонента (grep: prop list line ~17-83). Доступен в scope useMemo. ✅
> 2. `ordersByGuestId` — useMemo выше (line ~496-506, grep подтвердит). ✅
> 3. Формула count = **сумма `it.quantity || 1`**, как в `ordersItemCount` (line 789-792). НЕ использовать `.length` — семантика должна совпадать.

**Шаг 1.2** — Заменить header render (строки **787-807**) целиком:

```jsx
{(ordersSum > 0 || cart.length > 0 || (cartTab === 'table' && renderedTableTotal > 0)) && (() => {
  const ordersItemCount = todayMyOrders.reduce((sum, o) => {
    const items = itemsByOrder.get(o.id) || [];
    return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
  }, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalDishCount = ordersItemCount + cartItemCount;
  const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
  return cartTab === 'table'
    ? (renderedTableTotal > 0 ? (
        <div className="text-xs text-slate-500 mt-0.5">
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
          · {formatPrice(parseFloat(Number(renderedTableTotal).toFixed(2)))}
        </div>
      ) : null)
    : (totalDishCount > 0 ? (
        <div className="text-xs text-slate-500 mt-0.5">
          {tr('cart.header.you_label', 'Вы')}: {totalDishCount}{' '}
          {pluralizeRu(totalDishCount,
            tr('cart.header.dish_one', 'блюдо'),
            tr('cart.header.dish_few', 'блюда'),
            tr('cart.header.dish_many', 'блюд')
          )}{' '}
          · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
        </div>
      ) : null);
})()}
```

> ⚠️ Важно: Reviewer —
> 1. **Тот же тег**: `<div className="text-xs text-slate-500 mt-0.5">` (НЕ `<p>`, НЕ `text-sm`, НЕ `slate-600`). Точно совпадает с существующей разметкой.
> 2. **Condition**: `renderedTableTotal > 0` (НЕ `submittedTableTotal > 0`). Это принципиально — иначе заголовок не появится если `submittedTableTotal === 0` а `renderedTableTotal > 0` (edge case).
> 3. `pluralizeRu` уже существует (grep: функция определена в файле, используется в существующем «Мои» render).
> 4. `formatPrice`, `parseFloat(Number(...).toFixed(2))` — точно тот же паттерн что в существующем коде (line 799, 851, 874 и др.).

**НЕ делать:**
- ❌ Не удалять определение `submittedTableTotal` (может использоваться в другом месте — проверить grep: `submittedTableTotal` hits помимо line 525 и 788).
- ❌ Не менять `ordersItemCount`/`totalDishCount`/`headerTotal` для «Мои» (только добавить `«Вы:»` prefix).
- ❌ Не использовать `.length || 1` для dish count — только sum quantities (R2 FROZEN).

### Acceptance Criteria
- [ ] Header «Мои»: `«Вы: X блюд · X ₸»` (pluralized + правильный тег `<div>`)
- [ ] Header «Стол»: `«Стол: X гостя · X блюд · X ₸»` (pluralized + правильный тег `<div>`)
- [ ] `submittedTableTotal` НЕ используется в header render (line 799 ref удалён)
- [ ] Condition включает `renderedTableTotal > 0` вместо `submittedTableTotal > 0`
- [ ] `renderedTableDishCount` = sum of `it.quantity` (НЕ `.length`)
- [ ] Новые `<div>` используют className `text-xs text-slate-500 mt-0.5` (=existing)

---

## Fix 2 — ⏳ Ожидает Bucket [NEW CODE]

**Задача:** Добавить третий bucket «Ожидает» (amber) для заказов в статусе `'submitted'` — до подтверждения официантом.

### Верификация grep перед ревью
```bash
grep -an "statusBuckets\|groups\.served\|in_progress.*groups\|pending_unconfirmed\|submitted" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 457`: `const groups = { served: [], in_progress: [] }` — 2 группы, нет pending
- `~line 461`: условие `isServed` через `stageInfo.internal_code`
- `~line 528`: `submittedTableTotal` фильтрует `o.status === 'submitted'` как первый статус (подтверждает что `submitted` — pre-acceptance)
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

> ⚠️ Важно: Reviewer — проверить что `'submitted'` — это реальный pre-acceptance статус в B44 (grep line ~528: `submittedTableTotal` явно фильтрует `o.status === 'submitted'` ОТДЕЛЬНО от `'accepted'` → подтверждает что submitted = до подтверждения). Если есть другие pre-acceptance статусы (например `'pending'`) — добавить их тоже.

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
{/* ⏳ Ожидает bucket — ниже «В работе» (R1 FROZEN: снизу) */}
{statusBuckets.pending_unconfirmed.length > 0 && (
  <div className="mb-3">
    <div className="text-xs font-medium text-amber-600 mb-2">
      {groupLabels.pending_unconfirmed}
    </div>
    {renderBucketOrders(statusBuckets.pending_unconfirmed, false)}
  </div>
)}
```

> ⚠️ Важно: Reviewer — функция `renderBucketOrders` существует (~line 627). Использовать её паттерн. Если `renderBucketOrders` не подходит (по арности или контексту) — использовать тот же паттерн что у `statusBuckets.in_progress` render (скопировать разметку соседней bucket).

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
- ❌ Не менять `getSafeStatus` для pending — bucket assignment через `statusBuckets`, не через `getSafeStatus`

### Acceptance Criteria
- [ ] `statusBuckets` имеет 3 ключа: `pending_unconfirmed`, `in_progress`, `served`
- [ ] Заказ со статусом `'submitted'` → в `pending_unconfirmed` bucket (не в `in_progress`)
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

> ⚠️ ВАЖНО для Reviewer: `tableSession` prop НЕ СУЩЕСТВУЕТ в этом компоненте (verified grep). Используется `currentTable` prop (line 19). Проверить: `currentTable?.status === 'closed'` или аналогичный field. Если `currentTable` не имеет status field — исследовать альтернативу через `sessionOrders` prop (все заказы имеют статус `closed`?). **Reviewer должен определить верный data source и отразить в findings.**

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
> 1. `btn btn-outline` — проверить grep `btn-outline`. Если нет — использовать className из существующей кнопки «Вернуться в меню» (~line 1221).
> 2. `onClose` prop — существует (~line 72).
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

**Проблема:** Текущий гость отфильтрован из «Стол» (`myGuestId` исключается в строке 511). Свои заказы не видны в «Стол». [CV-NEW-03]

### Верификация grep перед ревью
```bash
grep -an "otherGuestIds\|showTableOrdersSection\|otherGuestsExpanded\|setOtherGuestsExpanded\|myGuestId" menuapp-code-review/pages/PublicMenu/CartView.jsx
```
Ожидаем:
- `~line 508`: `const myGuestId = currentGuest?.id ? String(currentGuest.id) : null`
- `~line 511`: filter: `gid !== myGuestId` — текущий гость исключён из списка
- `~line 542`: `const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;` — текущее определение
- `~line 834`: `{showTableOrdersSection && cartTab === 'table' && (` — условный рендер «Заказы стола»
- `~line 838`: `onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}` — один toggle для всех
- `~line 861`: `{otherGuestsExpanded && (...)}` — отображает всех других гостей
- `~line 63-64`: `setOtherGuestsExpanded`, `otherGuestsExpanded` — переданы как props (boolean для ВСЕХ других гостей)

**Важное понимание:** `otherGuestsExpanded` — ОДИН boolean для всех чужих гостей (не per-guest). Его трогать НЕ нужно. Self-block добавляется ПЕРЕД секцией других гостей как ОТДЕЛЬНАЯ Card.

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
          if (items.length === 0) {
            return (
              <div key={order.id} className="flex justify-between items-center text-xs">
                <span className="text-slate-600">
                  {status.icon} {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
                  {isOrderPending && (
                    <span className="ml-1 text-amber-600">⏳ {tr('cart.order.pending_badge', 'Ожидает')}</span>
                  )}
                </span>
                <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
              </div>
            );
          }
          // items present: render follows same pattern as existing other-guests items block (~lines 893-910)
          // Reviewer: скопировать точный JSX items-render из существующей секции
          return (
            <div key={order.id} className="text-xs">
              {/* Reviewer: заполнить точно как в existing block для других гостей */}
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
)}
```

> ⚠️ Важно: Reviewer —
> 1. `getGuestLabelById(myGuestId)` — функция существует (~line 533). ✅
> 2. `Card`, `CardContent` — импорт на line 3 (`import { Card, CardContent } from "@/components/ui/card";`). ✅
> 3. `Users` — импорт на line 2 (`import { ... Users ... } from "lucide-react";`). ✅
> 4. Структуру render блюд (при `items.length > 0`) **скопировать 1:1** из существующего рендера для других гостей (~lines 893-910). Не изобретать новый.

**Шаг 4.2 (КРИТИЧНО)** — Обновить `showTableOrdersSection` **И** условный рендер на line 834.

Изменение 1 — определение (line 542):
```jsx
// БЫЛО:
const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

// СТАЛО:
const showTableOrdersSection = (myGuestId && ordersByGuestId.has(myGuestId)) || otherGuestIdsFromOrders.length > 0;
```

Изменение 2 — условный рендер (line 834, Card «Заказы стола»):
```jsx
// БЫЛО:
{showTableOrdersSection && cartTab === 'table' && (
  <Card className="mb-4">
    <CardContent className="p-4">
      <button onClick={() => setOtherGuestsExpanded(...)}>
        ... Заказы стола ({otherGuestIdsFromOrders.length}) ...

// СТАЛО (добавить `&& otherGuestIdsFromOrders.length > 0`):
{showTableOrdersSection && cartTab === 'table' && otherGuestIdsFromOrders.length > 0 && (
  <Card className="mb-4">
    <CardContent className="p-4">
      <button onClick={() => setOtherGuestsExpanded(...)}>
        ... Заказы стола ({otherGuestIdsFromOrders.length}) ...
```

> ⚠️ **Почему оба изменения обязательны:** `showTableOrdersSection` используется как guard на уровне секции «Стол» (чтобы рендерить tabs/footer). После Fix 4.2 он становится `true` даже если есть ТОЛЬКО self (нет других гостей). Если НЕ добавить `otherGuestIdsFromOrders.length > 0` на line 834 — на экране появится пустая Card «Заказы стола (0)».

**Шаг 4.3** — НЕ менять логику отображения других гостей внутри (~833-891).

Секция с `otherGuestsExpanded`/`otherGuestIdsFromOrders.map(...)` остаётся без изменений. Self-block добавляется КАК ОТДЕЛЬНАЯ Card ПЕРЕД ней (Шаг 4.1), а условный рендер расширяется (Шаг 4.2).

**НЕ делать:**
- ❌ Не добавлять self-block внутрь `otherGuestIdsFromOrders.map(...)`
- ❌ Не менять `otherGuestIdsFromOrders` filter (line 511 — он правильный)
- ❌ Не трогать `otherGuestsExpanded` toggle логику
- ❌ Не оставлять без изменений line 834 — иначе появится пустая Card «Заказы стола (0)»

### Acceptance Criteria
- [ ] В «Стол» отображается Card «Вы (Гость N)» ПЕРЕД «Заказы стола»
- [ ] Self-block ВСЕГДА expanded (нет кнопки collapse для него)
- [ ] Self-block показывается только когда `ordersByGuestId.has(myGuestId)` (есть свои заказы)
- [ ] `showTableOrdersSection = true` даже если других гостей нет (только свои заказы)
- [ ] Card «Заказы стола» НЕ рендерится когда `otherGuestIdsFromOrders.length === 0` (line 834 guard)
- [ ] Другие гости по-прежнему через `otherGuestsExpanded` toggle (не затронуто)
- [ ] `myGuestId` не появился в `otherGuestIdsFromOrders` (фильтр line 511 не изменён)

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
- [ ] Header «Мои»: `totalDishCount` и `headerTotal` корректны (формула не затронута, добавлен только «Вы:» prefix)
- [ ] `submittedTableTotal` не вызывает ошибку (если переменная осталась, не используется в header)
- [ ] Когда в «Стол» нет ни self, ни других — секция не показывается вообще
- [ ] Когда в «Стол» есть только другие (self без заказов) — Card «Заказы стола» видна, self-block скрыт
- [ ] Когда в «Стол» есть только self (других нет) — self-block виден, Card «Заказы стола» скрыта

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
