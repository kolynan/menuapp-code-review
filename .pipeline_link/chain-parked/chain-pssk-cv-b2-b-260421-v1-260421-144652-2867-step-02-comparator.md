---
chain: pssk-cv-b2-b-260421-v1-260421-144652-2867
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: Unknown
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: pssk-cv-b2-b-260421-v1-260421-144652-2867
Page: Unknown

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/pssk-cv-b2-b-260421-v1-260421-144652-2867-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
   - **KB-158 fallback (worktree isolation):** if writers could not write outside worktree, CC findings may be in `pages/**/*cc-findings.md` or `pages/**/pssk-cv-b2-b-260421-v1-260421-144652-2867-*.md`. Search there too. Also look at `pages/**/cc-analysis-*.txt` for summary.
2. Read Codex findings: pipeline/chain-state/pssk-cv-b2-b-260421-v1-260421-144652-2867-codex-findings.md
   - If NOT found there, search in pages/Unknown/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
   - **KB-158 fallback:** also check `pages/**/pssk-cv-b2-b-260421-v1-260421-144652-2867-codex-findings.md` (Codex in worktree sandbox writes here when pipeline/ is read-only).
3. **Abort-on-empty check:** if BOTH CC and Codex findings are missing/empty after all fallbacks → write comparison file with `## CRITICAL: No findings found\n- Searched: pipeline/chain-state/, pages/**/*.md\n- Action: chain aborted, see KB-158` and EXIT step. Do NOT produce an empty "Final Fix Plan" — that causes silent merge failure.
4. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/pssk-cv-b2-b-260421-v1-260421-144652-2867-comparison.md

FORMAT:
# Comparison Report — Unknown
Chain: pssk-cv-b2-b-260421-v1-260421-144652-2867

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

5. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
PC-VERDICT: GO

# ПССК CV-B2-B — CartView Batch B2-B (5 фиксов)

## Context

**Файл:** `pages/PublicMenu/CartView.jsx`  
**RELEASE HEAD:** `260419-00 CartView RELEASE.jsx` — 1316 строк  
**Batch:** CV-B2-B (продолжение после CV-B2-A, деплой `260419-00`)

Этот батч закрывает 5 задач:

| Fix | Задача | Суть |
|-----|--------|------|
| Fix 2 | CV-BUG-16 + pending порядок | `isPending` проверяет `'submitted'` вместо `'new'` (3 места) + `pending_unconfirmed` bucket отображается первым вместо последним |
| Fix 3 | R4 Terminal Screen durable | `terminalStateShownForVersion` не персистится в localStorage — экран «Ничего не ждёте» сбрасывается при перезагрузке |
| Fix 4 | CV-BUG-15 flat guest cards | Таб «Стол» оборачивает карточки гостей в общий блок «Заказы стола» — надо плоский список |
| Fix 5 | V4 footer «Стол» tab | Кнопка «Вернуться в меню» сплошная вместо outline + отсутствует хелпер «Нужна помощь? 🔔» |
| Fix 6 | CV-BUG-06 отменённые заказы | `tableOrdersTotal` и `guestTotal` суммируют отменённые заказы — баг на копейки/₸ |

---

## Root Cause

**Fix 2 (CV-BUG-16):** B44 статус для нового заказа — `'new'`, не `'submitted'`. Функция `isPending` проверяет `.toLowerCase() === 'submitted'` в 3 местах: `statusBuckets` useMemo (line 467), блок «Мои заказы» SECTION 4 (line 887), блок «Стол» SECTION 5 (line 979). Из-за этого bucket «Ожидает подтверждения» всегда пуст.

**Fix 2 (порядок bucket):** `bucketOrder` (line 1094) = `['pending_unconfirmed', 'served', 'in_progress']` — pending отображается первым. По спеке DECISIONS_INDEX §2 R1 LOCKED: pending СНИЗУ, под «В работе».

**Fix 3 (R4):** Экран «Ничего не ждёте» (isV8) не имеет localStorage-персистенции. При перезагрузке/закрытии и возврате состояние сбрасывается. По DECISIONS_INDEX §2 R4 LOCKED: durable persist `terminalStateShownForVersion`.

**Fix 4 (CV-BUG-15):** SECTION 5 (lines 917–1003) оборачивает все карточки гостей в один `<Card>` с кнопкой «Заказы стола» (expand/collapse). По спеке гости должны быть отдельными карточками без wrapper-группы.

**Fix 5 (V4 LOCKED):** Footer при пустой корзине в табе «Стол» (lines 1304–1311) рендерит primary-кнопку «Вернуться в меню». По DECISIONS_INDEX §2 V4 LOCKED: должна быть `variant="outline"` + helper-строка «Нужна помощь или счёт? Нажмите 🔔».

**Fix 6 (CV-BUG-06):** `tableOrdersTotal` (lines 521–530) и `guestTotal` (line 949) суммируют ВСЕ заказы включая отменённые. `isCancelledOrder` helper уже существует в коде (lines 427–431), используется в `renderedTableTotal` (line 537), но не применён к этим двум переменным.

---

## FROZEN UX (не трогать)

Следующие решения LOCKED — не изменять:

1. **R2 Header** (DECISIONS_INDEX §2 line 88) — «Стол: X гостя · X блюд · X ₸» использует `renderedTableTotal` — УЖЕ реализовано в CV-B2-A. Не переписывать.
2. **CV-BUG-04** — `setExpandedStatuses(prev => ({ ...prev, served: true }))` — УЖЕ реализовано (lines 970-978). Не трогать.
3. **Section «Ожидает» bucket** — amber цвет (`text-amber-600`) — не менять, только порядок.
4. **isV8 terminal screen content** — текст «Ничего не ждёте», кнопка «Оценить», «Подано» bucket — FROZEN. Fix 3 добавляет только localStorage state + persist, не меняет UI.
5. **Tab state** (`cartTab`) — логика вкладок «Мои» / «Стол» не меняется.
6. **submitPhase + handleSubmitOrder** — не трогать.

---

## Working Directory

```
menuapp-code-review/
```

Все пути в промпте относительно этой директории.

---

## Preparation

**Шаг 0.1 — Скопировать RELEASE в рабочий файл:**

```bash
cp "260419-00 CartView RELEASE.jsx" pages/PublicMenu/CartView.jsx
```

**Шаг 0.2 — Верифицировать wc -l:**

```bash
wc -l pages/PublicMenu/CartView.jsx
```

Ожидаемый результат: `1316` (допуск ±10 от RELEASE).  
Если ≠ 1316 ±10 — STOP, не продолжать.

**Шаг 0.3 — Верифицировать ключевые anchors:**

```bash
grep -n "isCancelledOrder" pages/PublicMenu/CartView.jsx | head -10
```
Ожидаемо: минимум 3 hits (lines ~427, ~463, ~537).

```bash
grep -n "terminalStateShownForVersion" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 0 hits (переменная ещё не добавлена).

```bash
grep -n "tableOrdersTotal" pages/PublicMenu/CartView.jsx
```
Ожидаемо: минимум 2 hits (lines ~521 и ~935).

---

## Fix Application Order

Применять строго в этом порядке:

1. **Fix 6** — `tableOrdersTotal` isCancelledOrder filter (line ~521–530) — ДО Fix 4, т.к. Fix 4 реструктурирует секцию где `guestTotal` используется
2. **Fix 2a** — `isPending` 'submitted' → 'new' (3 места)
3. **Fix 2b** — `bucketOrder` reorder (line ~1094)
4. **Fix 3** — Terminal Screen localStorage (добавление state + useMemo + useEffect)
5. **Fix 4** — CV-BUG-15 flat guest cards (реструктурировать SECTION 5)
6. **Fix 5** — V4 footer outline + 🔔 helper

---

## Fix 6 — CV-BUG-06: tableOrdersTotal + guestTotal isCancelledOrder

**Задача:** `tableOrdersTotal` суммирует все заказы других гостей, включая отменённые. `isCancelledOrder(o)` helper уже существует, нужно применить его к этому useMemo.

### Шаг 6.1 — Исправить tableOrdersTotal (line ~521–530)

Найти (grep для точной строки):
```bash
grep -n "const tableOrdersTotal" pages/PublicMenu/CartView.jsx
```

**Было:**
```javascript
  const tableOrdersTotal = React.useMemo(() => {
    let sum = 0;
    otherGuestIdsFromOrders.forEach((gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      orders.forEach((o) => {
        sum += Number(o.total_amount) || 0;
      });
    });
    return parseFloat(sum.toFixed(2));
  }, [ordersByGuestId, otherGuestIdsFromOrders]);
```

**Стало:**
```javascript
  // CV-BUG-06: exclude cancelled orders from tableOrdersTotal (mirrors renderedTableTotal)
  const tableOrdersTotal = React.useMemo(() => {
    let sum = 0;
    otherGuestIdsFromOrders.forEach((gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      orders.forEach((o) => {
        if (isCancelledOrder(o)) return;
        sum += Number(o.total_amount) || 0;
      });
    });
    return parseFloat(sum.toFixed(2));
  }, [ordersByGuestId, otherGuestIdsFromOrders, isCancelledOrder]);
```

**Verification после Fix 6.1:**
```bash
grep -n -A 10 "const tableOrdersTotal" pages/PublicMenu/CartView.jsx
```
Ожидаемо: `if (isCancelledOrder(o)) return;` присутствует внутри useMemo.

### Acceptance Criteria Fix 6

- AC 6.1: `tableOrdersTotal` useMemo содержит `if (isCancelledOrder(o)) return;` строку
- AC 6.2: `isCancelledOrder` добавлен в deps array `[ordersByGuestId, otherGuestIdsFromOrders, isCancelledOrder]`
- AC 6.3: `guestTotal` (внутри SECTION 5 в Fix 4) будет исправлен через restructure в Fix 4 — отдельный шаг там

---

## Fix 2a — CV-BUG-16: isPending 'submitted' → 'new' (3 места)

**Задача:** B44 статус нового заказа = `'new'`. В коде три места используют `=== 'submitted'`.

**Verification сначала:**
```bash
grep -n "'submitted'" pages/PublicMenu/CartView.jsx
```
Ожидаемо: ровно 3 hits (lines ~467, ~887, ~979).

### Шаг 2a.1 — statusBuckets useMemo (line ~467)

**Было:**
```javascript
      const isPending = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'submitted';
```

**Стало:**
```javascript
      // CV-BUG-16: B44 pending status is 'new', not 'submitted'
      const isPending = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'new';
```

### Шаг 2a.2 — SECTION 4 self orders (line ~887)

**Было:**
```javascript
                  const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'submitted';
```
*(Находится внутри selfOrders.map, в блоке рендера «Мои заказы»)*

**Стало:**
```javascript
                  // CV-BUG-16: B44 pending status is 'new', not 'submitted'
                  const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'new';
```

### Шаг 2a.3 — SECTION 5 other guests (line ~979)

**Было:**
```javascript
                            const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'submitted';
```
*(Находится внутри guestOrders.map в SECTION 5, после `if (items.length === 0)` блока)*

**Стало:**
```javascript
                            // CV-BUG-16: B44 pending status is 'new', not 'submitted'
                            const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'new';
```

**Verification после Fix 2a:**
```bash
grep -n "'submitted'" pages/PublicMenu/CartView.jsx
```
Ожидаемо: **0 hits** (все три заменены).

```bash
grep -n "=== 'new'" pages/PublicMenu/CartView.jsx
```
Ожидаемо: минимум 3 hits.

### Acceptance Criteria Fix 2a

- AC 2a.1: `grep -c "'submitted'" CartView.jsx` → `0`
- AC 2a.2: `isPending` в statusBuckets useMemo использует `'new'`
- AC 2a.3: `isOrderPending` в selfOrders.map (SECTION 4) использует `'new'`
- AC 2a.4: `isOrderPending` в guestOrders.map (SECTION 5) использует `'new'`

---

## Fix 2b — Порядок bucket: pending ниже «В работе»

**Задача:** По DECISIONS_INDEX §2 R1 LOCKED — bucket «Ожидает подтверждения» (`pending_unconfirmed`) должен отображаться НИЖЕ «В работе» (`in_progress`).

**Verification:**
```bash
grep -n "bucketOrder" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 1 hit (line ~1094).

### Шаг 2b.1 — Reorder bucketOrder array (line ~1094)

**Было:**
```javascript
        const bucketOrder = ['pending_unconfirmed', 'served', 'in_progress'];
```

**Стало:**
```javascript
        // R1 LOCKED: pending_unconfirmed показывается НИЖЕ in_progress (DECISIONS_INDEX §2)
        const bucketOrder = ['served', 'in_progress', 'pending_unconfirmed'];
```

**Verification после Fix 2b:**
```bash
grep -n "bucketOrder" pages/PublicMenu/CartView.jsx
```
Ожидаемо: порядок `['served', 'in_progress', 'pending_unconfirmed']`.

### Acceptance Criteria Fix 2b

- AC 2b.1: `bucketOrder` = `['served', 'in_progress', 'pending_unconfirmed']`
- AC 2b.2: Только одна строка `bucketOrder` в файле (не дубли)

---

## Fix 3 — Terminal Screen localStorage persist (R4 LOCKED)

**Задача:** Добавить persistence экрана «Ничего не ждёте» через `terminalStateShownForVersion` в localStorage. Состояние вычисляется из ID поданных заказов — при перезагрузке страницы восстанавливается.

**НЕ менять:** isV8 condition, UI экрана, кнопки «Оценить» / «Подано» bucket.

### Шаг 3.1 — Добавить state (после line ~120, после submitPhase state)

Найти точную строку для вставки:
```bash
grep -n "submitPhase.*useState.*idle" pages/PublicMenu/CartView.jsx
```

**Вставить ПОСЛЕ** строки `const [submitPhase, setSubmitPhase] = React.useState('idle');`:

```javascript
  // Fix 3: R4 Terminal Screen — durable state persist (DECISIONS_INDEX §2 R4 LOCKED)
  const [terminalStateShownForVersion, setTerminalStateShownForVersion] = React.useState(() => {
    try { return localStorage.getItem('terminalStateShownForVersion') || ''; } catch { return ''; }
  });
```

### Шаг 3.2 — Добавить useMemo для terminalVersion (после statusBuckets useMemo, line ~473)

Найти точную строку для вставки:
```bash
grep -n "return groups;" pages/PublicMenu/CartView.jsx
```

**Вставить ПОСЛЕ** закрывающего `}, [todayMyOrders, getOrderStatus]);` блока statusBuckets useMemo:

```javascript
  // Fix 3: R4 — compute terminal version key from current served orders
  const terminalVersion = React.useMemo(() => {
    if (
      statusBuckets.served.length > 0 &&
      statusBuckets.in_progress.length === 0 &&
      statusBuckets.pending_unconfirmed.length === 0 &&
      cart.length === 0
    ) {
      return statusBuckets.served.map(o => String(o.id)).sort().join('-');
    }
    return '';
  }, [statusBuckets, cart]);
```

### Шаг 3.3 — Добавить useEffect persist (после terminalVersion useMemo)

**Вставить ПОСЛЕ** `terminalVersion` useMemo:

```javascript
  // Fix 3: R4 — persist terminal version to localStorage when terminal state is active
  React.useEffect(() => {
    if (terminalVersion && terminalVersion !== terminalStateShownForVersion) {
      setTerminalStateShownForVersion(terminalVersion);
      try { localStorage.setItem('terminalStateShownForVersion', terminalVersion); } catch {}
    }
  }, [terminalVersion]);
```

**Verification после Fix 3:**
```bash
grep -n "terminalStateShownForVersion" pages/PublicMenu/CartView.jsx
```
Ожидаемо: **3 hits** (useState, useMemo deps или useEffect, localStorage.setItem).

```bash
grep -n "terminalVersion" pages/PublicMenu/CartView.jsx
```
Ожидаемо: минимум 4 hits (useMemo declaration, useEffect deps, setItem).

### Acceptance Criteria Fix 3

- AC 3.1: `terminalStateShownForVersion` state читает из `localStorage.getItem` при инициализации
- AC 3.2: `terminalVersion` useMemo вычисляет ключ из sorted IDs served orders (пустая строка если не terminal state)
- AC 3.3: useEffect записывает в `localStorage.setItem('terminalStateShownForVersion', ...)` когда terminalVersion меняется
- AC 3.4: isV8 condition (line ~1015–1019) **не изменена** — Terminal Screen logic остаётся computed from real data
- AC 3.5: Нет try/catch вне localStorage вызовов (не оборачивать всё в try/catch)

---

## Fix 4 — CV-BUG-15: Flat guest cards (реструктурировать SECTION 5)

**Задача:** Убрать wrapper Card «Заказы стола» с кнопкой expand/collapse. Каждый гость = отдельная `<Card>`. `guestTotal` в новой структуре должен использовать `isCancelledOrder` (CV-BUG-06 для этой переменной).

**Verification — найти SECTION 5 anchor:**
```bash
grep -n "SECTION 5" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 1 hit (~line 917).

### Шаг 4.1 — Заменить всю SECTION 5 (lines ~917–1004)

**Было:**
```jsx
      {/* SECTION 5: TABLE ORDERS (other guests) — visible only in Стол tab */}
      {showTableOrdersSection && cartTab === 'table' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <button
              onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600">
                  {tr('cart.table_orders', 'Заказы стола')} ({otherGuestIdsFromOrders.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                  <span className="text-sm text-slate-400">{tr('common.loading', 'Загрузка')}</span>
                ) : (
                  <span className="font-bold text-slate-700">{formatPrice(parseFloat(Number(tableOrdersTotal).toFixed(2)))}</span>
                )}
                {otherGuestsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {otherGuestsExpanded && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {otherGuestIdsFromOrders.map((gid) => {
                  const guestOrders = ordersByGuestId.get(gid) || [];
                  const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

                  return (
                    <div key={gid} className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{getGuestLabelById(gid)}</span>
                        {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                          <span className="text-slate-400">{tr('common.loading', 'Загрузка')}</span>
                        ) : (
                          <span className="font-bold text-slate-600">{formatPrice(parseFloat(Number(guestTotal).toFixed(2)))}</span>
                        )}
                      </div>

                      {guestOrders.length > 0 ? (
                        <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                          {guestOrders.map((order) => {
                            const items = itemsByOrder.get(order.id) || [];
                            const status = getSafeStatus(getOrderStatus(order));

                            if (items.length === 0) {
                              return (
                                <div key={order.id} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-600">
                                    {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
                                  </span>
                                  <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                                </div>
                              );
                            }

                            const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'new';
                            return items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">
                                  {item.dish_name} × {item.quantity}
                                  {isOrderPending && <span className="ml-1 text-amber-600 font-medium">{tr('cart.badge.pending', '⏳ Ожидает')}</span>}
                                </span>
                                <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                              </div>
                            ));
                          })}
                        </div>
                      ) : (
                        <div className="pl-2 text-xs text-slate-400">
                          {tr('cart.no_orders_yet', 'Заказов пока нет')}
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </CardContent>
        </Card>
      )}
```

**Стало:**
```jsx
      {/* SECTION 5: TABLE ORDERS (other guests) — flat list, no wrapper group (CV-BUG-15) */}
      {showTableOrdersSection && cartTab === 'table' && otherGuestIdsFromOrders.map((gid) => {
        const guestOrders = ordersByGuestId.get(gid) || [];
        // CV-BUG-06: exclude cancelled orders from guestTotal
        const guestTotal = guestOrders.reduce((sum, o) => isCancelledOrder(o) ? sum : sum + (Number(o.total_amount) || 0), 0);

        return (
          <Card key={gid} className="mb-4">
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">{getGuestLabelById(gid)}</span>
                  {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                    <span className="text-slate-400">{tr('common.loading', 'Загрузка')}</span>
                  ) : (
                    <span className="font-bold text-slate-600">{formatPrice(parseFloat(Number(guestTotal).toFixed(2)))}</span>
                  )}
                </div>

                {guestOrders.length > 0 ? (
                  <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                    {guestOrders.map((order) => {
                      const items = itemsByOrder.get(order.id) || [];
                      const status = getSafeStatus(getOrderStatus(order));

                      if (items.length === 0) {
                        return (
                          <div key={order.id} className="flex justify-between items-center text-xs">
                            <span className="text-slate-600">
                              {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
                            </span>
                            <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                          </div>
                        );
                      }

                      const isOrderPending = !getOrderStatus(order)?.internal_code && (order.status || '').toLowerCase() === 'new';
                      return items.map((item, idx) => (
                        <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">
                            {item.dish_name} × {item.quantity}
                            {isOrderPending && <span className="ml-1 text-amber-600 font-medium">{tr('cart.badge.pending', '⏳ Ожидает')}</span>}
                          </span>
                          <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                        </div>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="pl-2 text-xs text-slate-400">
                    {tr('cart.no_orders_yet', 'Заказов пока нет')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
```

**Важные проверки для Fix 4:**

1. Убедиться что wrapper `<Card className="mb-4">` и `<CardContent className="p-4">` с кнопкой «Заказы стола» полностью УДАЛЕНЫ.
2. `otherGuestsExpanded` state больше не используется в этой секции (можно оставить в state declaration, не удалять — не ломать).
3. `tableOrdersTotal` больше не используется в JSX (только в useMemo, который остаётся).
4. `guestTotal` теперь включает `isCancelledOrder` filter.
5. `isOrderPending` внутри Fix 4 уже использует `'new'` (из Fix 2a — проверить что не регрессия).

**Verification после Fix 4:**
```bash
grep -n "Заказы стола" pages/PublicMenu/CartView.jsx
```
Ожидаемо: **0 hits** (wrapper label удалён).

```bash
grep -n "otherGuestsExpanded" pages/PublicMenu/CartView.jsx
```
Ожидаемо: может остаться в `useState` declaration, но не в JSX рендере.

```bash
grep -n "SECTION 5" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 1 hit (комментарий `{/* SECTION 5: TABLE ORDERS ... (CV-BUG-15) */}`).

### Acceptance Criteria Fix 4

- AC 4.1: Нет wrapper `<Card>` вокруг всей секции «Заказы стола» — вместо него каждый `gid` рендерит отдельный `<Card key={gid}>`
- AC 4.2: Кнопка «Заказы стола» (`onClick={() => setOtherGuestsExpanded(...)`) УДАЛЕНА из JSX
- AC 4.3: `{tr('cart.table_orders', 'Заказы стола')}` НЕТ в render (только если встречается в другом месте — проверить)
- AC 4.4: `guestTotal` использует `isCancelledOrder(o) ? sum : sum + ...` паттерн
- AC 4.5: `isOrderPending` внутри секции использует `'new'` (не регрессия из Fix 2a)
- AC 4.6: Структура рендера: `otherGuestIdsFromOrders.map((gid) => { ... return (<Card key={gid}>...); })`

---

## Fix 5 — V4 Footer: outline + 🔔 helper (DECISIONS_INDEX §2 V4 LOCKED)

**Задача:** Footer в Стол-табе при пустой корзине (`cart.length === 0`, `todayMyOrders.length > 0`): кнопка «Вернуться в меню» должна быть `variant="outline"` без `style={{backgroundColor}}` + helper-строка «Нужна помощь или счёт? Нажмите 🔔».

**Verification:**
```bash
grep -n "back_to_menu\|Вернуться в меню" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 1 hit (line ~1310).

### Шаг 5.1 — Заменить footer кнопку (lines ~1303–1311)

**Было:**
```jsx
          ) : (
            <Button
              size="lg"
              className="w-full min-h-[44px] text-white"
              style={{backgroundColor: primaryColor}}
              onClick={() => { onClose ? onClose() : setView("menu"); }}
            >
              {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
            </Button>
          )}
```

**Стало:**
```jsx
          ) : (
            // V4 LOCKED: outline button + 🔔 helper (DECISIONS_INDEX §2)
            <div className="space-y-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full min-h-[44px]"
                onClick={() => { onClose ? onClose() : setView("menu"); }}
              >
                {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
              </Button>
              <p className="text-center text-sm text-slate-500">
                {tr('cart.cta.need_help_or_bill', 'Нужна помощь или счёт? Нажмите')} <Bell className="inline w-4 h-4 align-middle" />
              </p>
            </div>
          )}
```

**Verification после Fix 5:**
```bash
grep -n "variant=\"outline\"" pages/PublicMenu/CartView.jsx
```
Ожидаемо: минимум 1 hit (footer кнопка).

```bash
grep -n "need_help_or_bill\|Нужна помощь" pages/PublicMenu/CartView.jsx
```
Ожидаемо: 1 hit (helper строка).

```bash
grep -n "back_to_menu.*style.*backgroundColor\|style.*backgroundColor.*back_to_menu" pages/PublicMenu/CartView.jsx
```
Ожидаемо: **0 hits** (убрали `style={{backgroundColor: primaryColor}}` с этой кнопки).

### Acceptance Criteria Fix 5

- AC 5.1: Footer «no cart» ветка содержит `variant="outline"` на Button
- AC 5.2: `style={{backgroundColor: primaryColor}}` УДАЛЁН с кнопки «Вернуться в меню»
- AC 5.3: `className="w-full min-h-[44px]"` сохранён (без `text-white`)
- AC 5.4: Добавлена `<p>` строка с `tr('cart.cta.need_help_or_bill', ...)` и `<Bell>` icon
- AC 5.5: `<Bell>` используется inline: `className="inline w-4 h-4 align-middle"`
- AC 5.6: `onClick` handler сохранён без изменений: `() => { onClose ? onClose() : setView("menu"); }`

---

## TestPlan

После применения всех фиксов:

**T1 — isPending новые заказы:**
- Гость делает заказ → статус в B44 `'new'`
- В табе «Мои» должен появиться bucket «Ожидает подтверждения» (amber)
- До фикса bucket был пустым

**T2 — Порядок buckets «Мои»:**
- При наличии заказов в разных статусах порядок сверху вниз: «Подано» → «В работе» → «Ожидает подтверждения»
- bucket «Ожидает» должен быть ПОСЛЕДНИМ

**T3 — Terminal Screen persist (Fix 3):**
- Все заказы поданы, корзина пуста → экран «Ничего не ждёте» показывается
- Перезагрузить страницу → `localStorage.getItem('terminalStateShownForVersion')` должен вернуть непустую строку
- Экран по-прежнему показывается после перезагрузки

**T4 — Плоский список «Стол» (Fix 4):**
- В табе «Стол» НЕТ заголовка «Заказы стола» с кнопкой expand/collapse
- Каждый гость видит отдельную карточку
- Отменённые заказы гостя не включаются в сумму карточки

**T5 — Footer «Стол» outline (Fix 5):**
- Войти в таб «Стол», корзина пуста
- Кнопка «Вернуться в меню» — outline стиль (без заливки цветом партнёра)
- Ниже кнопки — строка «Нужна помощь или счёт? Нажмите 🔔»

**T6 — CV-BUG-06 таблица без отменённых:**
- Создать и отменить заказ гостя X
- В табе «Стол» сумма карточки гостя X не включает отменённый заказ
- `tableOrdersTotal` в шапке секции также не включает

---

## Safety Guards

1. **wc -l после всех фиксов:**
   ```bash
   wc -l pages/PublicMenu/CartView.jsx
   ```
   Ожидаемо: 1316 ±60 строк (Fix 3 добавляет ~15 строк, Fix 4 нетто -30..+10, Fix 5 +6 строк).

2. **isCancelledOrder не удалён:**
   ```bash
   grep -n "const isCancelledOrder\|function isCancelledOrder" pages/PublicMenu/CartView.jsx
   ```
   Ожидаемо: 1 hit (helper должен остаться).

3. **Нет дублей термinalVersion:**
   ```bash
   grep -c "terminalVersion" pages/PublicMenu/CartView.jsx
   ```
   Ожидаемо: 4–6 hits (useMemo declaration, useEffect, setItem).

4. **Bell import:**
   ```bash
   grep -n "Bell" pages/PublicMenu/CartView.jsx | head -3
   ```
   Ожидаемо: `Bell` уже импортирован (line 2: `import { ..., Bell, ... } from "lucide-react"`). Не добавлять повторный импорт.

5. **Нет регрессии 'submitted':**
   ```bash
   grep -n "'submitted'" pages/PublicMenu/CartView.jsx
   ```
   Ожидаемо: **0 hits**.

6. **renderedTableTotal не тронут:**
   ```bash
   grep -n -A 6 "const renderedTableTotal" pages/PublicMenu/CartView.jsx
   ```
   Ожидаемо: содержит `isCancelledOrder(o)` — без изменений (был правильным до этого батча).

7. **submitPhase не тронут:**
   ```bash
   grep -n "submitPhase" pages/PublicMenu/CartView.jsx | wc -l
   ```
   Ожидаемо: то же количество что в RELEASE (Fix 3 вставляется ПОСЛЕ строки submitPhase, не внутри).

---

## Findings Summary

По завершении — в секции `## Findings Summary` указать:

- Количество изменённых строк по каждому фиксу
- Все отклонения от ожидаемых строк (если anchor-строки сдвинулись)
- wc -l итоговый
- Все нерешённые вопросы или предложения CC/Codex

---

*ПССК CV-B2-B v1 — S326 — написан на основе Discovery pass (прямое чтение 260419-00 CartView RELEASE.jsx, 1316 строк)*
=== END ===
