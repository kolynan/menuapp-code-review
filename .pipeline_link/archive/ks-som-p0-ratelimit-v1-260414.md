---
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion-v2
ws: WS-SOM
session: S271
task_id: ks-som-p0-ratelimit-v1-260414
---

**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
wc -l pages/StaffOrdersMobile/staffordersmobile.jsx
```
Save the line count. After all fixes: `wc -l` must match ±50 lines (mostly additions: helper + 2 useState + suppress branches; expected delta +30..+60).

---

# SOM P0 Rate Limit Fix: Sequential Batch Mutations (SOM-BUG-S270-01)

## Context
Файл: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4538 lines). RELEASE: `260414-01 StaffOrdersMobile RELEASE.jsx`.
Reference: `pages/StaffOrdersMobile/BUGS.md` § SOM-BUG-S270-01 (P0 CRITICAL).
Screenshot: `pages/StaffOrdersMobile/screenshots/current/S270_rate_limit_error.jpg`.

Вес: M (focused single-bug fix with multiple touchpoints) | Бюджет: $12 | Модель: С5v2 (consensus-with-discussion-v2)

⚠️ If `wc -l pages/StaffOrdersMobile/staffordersmobile.jsx` < 4400 — restore: `cp "pages/StaffOrdersMobile/260414-01 StaffOrdersMobile RELEASE.jsx" "pages/StaffOrdersMobile/staffordersmobile.jsx"` (KB-095).

---

## ⛔ CRITICAL: DEAD-CODE WARNING — Read FIRST

S271 ПССК ревью (Codex) обнаружил, что в этом файле есть **два больших закомментированных блока JSX**:

- **Comment block 1: lines `546-785`** (старый рендер snapshot; начинается с `{/*` или `/*`, заканчивается `*/`)
- **Comment block 2: lines `1148-1418`** (второй snapshot)

Внутри этих блоков есть anchors которые при naive grep по `forEach.*onCloseRequest` ВЫГЛЯДЯТ как live fan-out, но **являются мёртвым кодом**:

| Line | Внутри comment block | Статус |
|------|----------------------|--------|
| 639  | 546-785 | ❌ DEAD — НЕ трогать |
| 671  | 546-785 | ❌ DEAD |
| 694  | 546-785 | ❌ DEAD |
| 709  | 546-785 | ❌ DEAD |
| 1254 | 1148-1418 | ❌ DEAD — НЕ трогать |
| 1286 | 1148-1418 | ❌ DEAD |
| 1309 | 1148-1418 | ❌ DEAD |
| 1324 | 1148-1418 | ❌ DEAD |

**Перед любой правкой grep по batch buttons:** проверить, что найденная line находится ВНЕ этих двух блоков. Команда верификации:
```
sed -n '545,786p' pages/StaffOrdersMobile/staffordersmobile.jsx | head -3
sed -n '1147,1419p' pages/StaffOrdersMobile/staffordersmobile.jsx | head -3
```
Если первая/последняя строка блока начинается с `{/*` или `/*` и блок закрывается `*/` — это comment, anchors внутри = dead.

**Live anchors которые НУЖНО фиксить:** `1933-1936` (undo), `1956-1965` (handleOrdersAction shared loop), `2333` (single live bulk request bar), `4132-4133` (handleCloseAllOrders Promise.all). Все вне comment blocks.

---

## FROZEN UX (do NOT change)

- Названия и иконки кнопок «Принять», «Принять все», «Выдать», «Выдать все», «Отменить» — без изменений.
- Существующее поведение «Принять все» / «Выдать все» (один клик → все доступные items) — сохранить, фикс только в МЕХАНИКЕ выполнения мутаций.
- Тосты/уведомления при 429 (`isRateLimitError` → `setRateLimitHit(true)` → toast «Слишком много запросов») — оставить как safety net.
- Undo window (3 секунды) — таймер тот же, начинается ПОСЛЕ завершения batch (не во время).
- Loader на кнопке во время batch — visual состояние `disabled` уже описано ниже.
- i18n строки — НЕ менять.

---

## SCOPE LOCK (что НЕ делаем в этом КС)

- НЕ создаём новый Order entity / поля / B44 endpoints — только frontend.
- НЕ удаляем `isRateLimitError` (line 516-520), `shouldRetry` (522-525), `setRateLimitHit` обработчики — оставить как safety net.
- НЕ меняем single-action handlers (`handleSingleAction` line 1966+, single-item button onClick на one dish) — они уже работают.
- НЕ меняем `activeOrders` filter (line ~3539-3544) или TableSession loading.
- НЕ удаляем comment blocks 546-785 / 1148-1418 в этом КС — они в OPTIONAL Fix H ниже (отдельный commit, optional).
- НЕ меняем frontmatter / i18n / визуал.

---

## Root cause (для понимания)

1. Каждая batch-кнопка в shared loop `handleOrdersAction` (line **1956-1965**, конкретно строки 1960-1962) выполняет `actionable.forEach(({ order, payload }) => { advanceMutation.mutate({ id: order.id, payload }); })`. N мутаций стартуют синхронно в одном React tick → N concurrent HTTP к B44 → 429.
2. Аналогично `startUndoWindow.onUndo` (line **1933-1936**), bulk request bar (line **2333**), `handleCloseAllOrders.Promise.all` (line **4132-4133**).
3. Усиление: `advanceMutation.onSettled` (line **1894-1897**) делает `invalidateQueries({queryKey: ["orders"]})` + `["servedOrders", group.id]` per item → burst рефетчей во время burst мутаций.
4. `updateRequestMutation.onSuccess` (line **3515**) делает `invalidateQueries({queryKey: ["serviceRequests"]})` per item → тот же эффект для requests.
5. `advanceMutation.isPending` (line 1957) НЕ защищает: все N стартуют до того как React успеет re-render.

---

## Helper (NEW) — добавить ОДИН раз сразу после `isRateLimitError` (line 520)

```javascript
// Sequentially run async fn for each item with delay between.
// Prevents B44 rate-limit burst on batch operations. See SOM-BUG-S270-01.
const BATCH_DELAY_MS = 120; // tunable; bump to 150-200 if 30+ item batches still 429

async function runBatchSequential(items, fn, { delayMs = BATCH_DELAY_MS } = {}) {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    try {
      results.push(await fn(items[i], i));
    } catch (err) {
      results.push({ error: err });
      if (isRateLimitError(err)) break; // early stop on 429 — partial batch is acceptable
    }
    if (i < items.length - 1 && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return results;
}
```

**Каверы (важно):**
- Принимает только `mutateAsync` или прямые entity-update Promise — НЕ `mutate(...)` (тот не возвращает Promise).
- Delay только МЕЖДУ items, не до первого и не после последнего.
- При 429 → `break` (early stop). Partial batch (часть items applied, часть нет) — acceptable UX для P0: пользователь видит частично обновлённую таблицу + toast «Слишком много запросов» от existing safety net.
- НЕ пробрасывает throw наружу из callback (caller получает `{error}` в results) — это интенционально, чтобы не ломать UI на одиночной ошибке.

---

## Fix A — `handleOrdersAction` shared loop (line 1956-1965) [P0 CRITICAL]

⚠️ **Codex finding (S271 ПССК):** Real fan-out CENTRALIZED HERE. UI-кнопки на lines 2335 (newOrders), 2337 (inProgressSections), 2339 (readyOrders) — это только entry points; все три вызывают `handleOrdersAction` → один общий forEach loop на 1960-1962. Патч в одном месте покрывает все 3 кнопки. НЕ патчить кнопки 2335/2337/2339 отдельно.

### Add `batchInFlight` state inside `OrderGroupCard` component

В `OrderGroupCard` component (содержит `handleOrdersAction`), сразу ПЕРЕД объявлением `const advanceMutation = useMutation(...)` (~line 1882) добавить:

```javascript
const batchInFlightRef = useRef(false);  // ref not state — avoids re-render on flip + no useCallback dep
```

(Обоснование выбора `useRef` vs `useState`: `batchInFlight` читается синхронно при клике, не нужен trigger re-render для UI; флаг в `disabled` свойстве кнопок ниже использует `advanceMutation.isPending` который и так trigger re-render. `useRef` упрощает useCallback deps.)

### Rewrite `handleOrdersAction` (line 1956-1965)

```javascript
// BEFORE
const handleOrdersAction = useCallback((orders, rowId) => {
  if (advanceMutation.isPending) return;
  const actionable = orders.map(...).filter(...);
  if (actionable.length === 0) return;
  actionable.forEach(({ order, payload }) => {
    if (onClearNotified) onClearNotified(order.id);
    advanceMutation.mutate({ id: order.id, payload });
  });
  if (actionable.every(({ meta }) => meta.willServe)) startUndoWindow(...);
}, [...]);

// AFTER
const handleOrdersAction = useCallback(async (orders, rowId) => {
  if (advanceMutation.isPending || batchInFlightRef.current) return;
  const actionable = orders.map(...).filter(...);
  if (actionable.length === 0) return;
  batchInFlightRef.current = true;
  try {
    await runBatchSequential(actionable, async ({ order, payload }) => {
      if (onClearNotified) onClearNotified(order.id);
      // batch: true tells onSettled to skip invalidate (see Invalidate-once below)
      return advanceMutation.mutateAsync({ id: order.id, payload, __batch: true });
    });
    // After batch — single invalidation
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
    if (actionable.every(({ meta }) => meta.willServe)) {
      startUndoWindow(actionable.map(({ order }) => order), rowId);
    }
  } finally {
    batchInFlightRef.current = false;
  }
}, [advanceMutation, buildAdvancePayload, getOrderActionMeta, onClearNotified, startUndoWindow, queryClient, group.id]);
```

### Update `disabled` on bulk-action buttons (visual feedback only)

Bulk-кнопки на lines **2335** (newOrders), **2337** (inProgressSections), **2339** (readyOrders): добавить `|| batchInFlightRef.current` к существующему `disabled={advanceMutation.isPending}`. Поскольку `useRef` не trigger re-render, добавить также `useState` shadow для UI:

```javascript
const [, forceRerender] = useState(0);
// в handleOrdersAction try/finally:
batchInFlightRef.current = true; forceRerender(n => n + 1);
// в finally:
batchInFlightRef.current = false; forceRerender(n => n + 1);
```

ИЛИ альтернатива — заменить `useRef` на `useState`, добавить `batchInFlight` в useCallback deps, использовать прямо в `disabled={advanceMutation.isPending || batchInFlight}`. Имплементор выбирает любой из двух подходов; main цель — guard от double-click и visual feedback.

**Single-action buttons (НЕ ТРОГАТЬ):** одиночные «Принять»/«Выдать» на одном блюде (handleSingleAction → handleOrdersAction([order], rowId)) уже работают через тот же handleOrdersAction — но с array из 1 item, runBatchSequential обрабатывает single-item корректно (no delay, no break). Регрессии нет.

---

## Fix B — `startUndoWindow.onUndo` batch (line 1920-1941) [P0 CRITICAL]

```javascript
// BEFORE (line 1932-1938)
onUndo: () => {
  snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
    const payload = { status: prevStatus };
    if (prevStageId) payload.stage_id = prevStageId;
    advanceMutation.mutate({ id: orderId, payload });
  });
},

// AFTER
onUndo: async () => {
  await runBatchSequential(snapshots, async ({ orderId, prevStatus, prevStageId }) => {
    const payload = { status: prevStatus };
    if (prevStageId) payload.stage_id = prevStageId;
    return advanceMutation.mutateAsync({ id: orderId, payload, __batch: true });
  });
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
},
```

---

## Fix E — Bulk Request bar (line 2333) [P0 — единственный live request fan-out]

⚠️ **Codex finding:** Lines 639 и 1254 (которые в первоначальном ПССК v1 были как Fix C / D) — DEAD CODE в comment blocks 546-785 / 1148-1418. УДАЛЕНЫ из этого КС. Единственный live bulk request fan-out = line 2333.

В детальном request section (line ~2280-2340), bulk button с `tableRequests.forEach(r => onCloseRequest(...))`:

```jsx
// BEFORE (line ~2333, две branches: allNew и allAccepted)
onClick={allNew
  ? () => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() }))
  : () => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))
}

// AFTER
onClick={async () => {
  if (allNew) {
    await runBatchSequential(tableRequests, (r) =>
      onBatchCloseRequestAsync(r.id, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })
    );
  } else {
    await runBatchSequential(tableRequests, (r) =>
      onBatchCloseRequestAsync(r.id, 'done')
    );
  }
  queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
}}
```

**Пропс `onBatchCloseRequestAsync`** — это новый отдельный async-prop для bulk path. Single-item button onClick (`onCloseRequest(r.id, ...)` в карточке одного request) ПРОДОЛЖАЕТ использовать существующий sync `onCloseRequest`.

### Parent wiring (line 4399 area) — hybrid approach

⚠️ **Codex finding:** Глобальная замена `onCloseRequest: mutate → mutateAsync` на line 4399 НЕБЕЗОПАСНА. Live fire-and-forget caller возвращает Promise → unhandled rejections при 429 / network error. Решение: **сохранить sync prop + добавить отдельный async**.

```javascript
// BEFORE (line 4399)
onCloseRequest={(reqId, newStatus, extraFields) =>
  updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })
}

// AFTER (keep sync onCloseRequest unchanged + ADD async sibling)
onCloseRequest={(reqId, newStatus, extraFields) =>
  updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })
}
onBatchCloseRequestAsync={(reqId, newStatus, extraFields) =>
  updateRequestMutation.mutateAsync({ id: reqId, status: newStatus, ...extraFields, __batch: true })
}
```

В `OrderGroupCard` props и в любом intermediate component добавить prop `onBatchCloseRequestAsync` (default: `() => Promise.resolve()` если не передан, чтобы single-item path не сломался).

---

## Fix F — `handleCloseAllOrders` Promise.all (line 4122-4143) [P1 hardening]

⚠️ **Codex note:** Это НЕ S270 reproduction path (S270 был про «Выдать все» на dish-уровне), но `Promise.all(orders.map(o => entity.update(...)))` — тот же fan-out anti-pattern, fired при «Закрыть стол». Пропустить = оставить второй 429-риск на 4+ orders в столе.

```javascript
// BEFORE (line 4132-4133)
const handleCloseAllOrders = useCallback(async (orders) => {
  ...
  await Promise.all(orders.map(o => base44.entities.Order.update(o.id, { status: 'closed' })));
  ...
}, [...]);

// AFTER
const handleCloseAllOrders = useCallback(async (orders) => {
  ...
  await runBatchSequential(orders, async (o) =>
    base44.entities.Order.update(o.id, { status: 'closed' })
  );
  // Single invalidation after batch
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  ...
}, [..., queryClient]);
```

---

## Invalidate-once optimization — suppress per-item invalidate during batch [P0 CRITICAL]

⚠️ **Codex finding:** `mutateAsync` сам по себе НЕ убирает per-item invalidations. `onSettled` / `onSuccess` callback fires для каждого item независимо. Без явной suppression — 10-item batch = 20+ invalidate calls во время batch = race с rate limit.

### `advanceMutation` (line 1882-1898)

```javascript
// BEFORE
const advanceMutation = useMutation({
  mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
  onMutate: ({ id, payload }) => { ... cancelQueries + optimistic update ... },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
  },
});

// AFTER
const advanceMutation = useMutation({
  mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
  // ^ `__batch` flag NOT spread because we destructure explicitly here — only `id` and `payload` go to entity.update.
  onMutate: ({ id, payload }) => { ... cancelQueries + optimistic update — UNCHANGED ... },
  onSettled: (_data, _err, vars) => {
    if (vars?.__batch) return;  // NEW: skip invalidate during batch; caller invalidates once after loop
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
  },
});
```

⚠️ **Strip `__batch` in mutationFn defensively:** Codex finding — если mutationFn делает `({ id, ...rest }) => base44.entities.Order.update(id, rest)` (spread), то `__batch: true` попадёт в Order entity update payload. ВЕРИФИЦИРОВАТЬ строку 1883: если mutationFn использует destructuring `{ id, payload }` (с явным `payload`) — safe. Если spread — добавить strip:

```javascript
mutationFn: ({ id, payload, __batch, ...rest }) => base44.entities.Order.update(id, payload),
```

### `updateRequestMutation` (line 3513-3522)

```javascript
// BEFORE
const updateRequestMutation = useMutation({
  mutationFn: ({ id, ...fields }) => base44.entities.ServiceRequest.update(id, fields),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }),
  onError: (err) => { if (isRateLimitError(err)) setRateLimitHit(true); ... },
});

// AFTER
const updateRequestMutation = useMutation({
  mutationFn: ({ id, __batch, ...fields }) => {  // STRIP __batch defensively
    return base44.entities.ServiceRequest.update(id, fields);
  },
  onSuccess: (_data, vars) => {
    if (vars?.__batch) return;  // NEW: skip during batch
    queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
  },
  onError: (err) => { if (isRateLimitError(err)) setRateLimitHit(true); ... },  // UNCHANGED
});
```

⚠️ **Why strip is critical (Codex finding):** `mutationFn` line 3514 currently does `({ id, ...fields }) => ServiceRequest.update(id, fields)`. Without strip, `__batch: true` becomes `{ ..., __batch: true }` written to ServiceRequest entity in B44 = pollutes data + may fail B44 schema validation.

---

## Implementation Notes (read before editing)

1. **`advanceMutation.onMutate` cancelQueries (line 1884-1889)** — already calls `queryClient.cancelQueries({ queryKey: ["orders"] })` per item. **Это intentional во время batch** — предотвращает mid-batch refetch races. Не убирать, не gate behind `__batch` flag.

2. **Sequential vs Promise.all chunks** — sequential выбран для V1. 30 items × 120ms = 3.6s + сетевые. Если в практике слишком медленно — bump `BATCH_DELAY_MS` или перейти на p-limit concurrency=2 в отдельной задаче. Не делать в этом КС.

3. **Partial failure UX** — runBatchSequential break early на 429. UI показывает частично обновлённую таблицу + existing toast «Слишком много запросов». Acceptable для P0. Полная rollback = scope creep.

4. **120ms — heuristic, not validated** — named constant `BATCH_DELAY_MS`, easy to tune. Не утверждать в комментариях что «120ms is sufficient».

5. **Single-item paths** — `handleSingleAction` (1966+) уже вызывает `handleOrdersAction([order], rowId)` с array из 1. После фикса runBatchSequential обработает 1 item (без delay, без break) → результат тот же что прямой mutateAsync. Регрессии нет.

6. **`isRateLimitError` / `setRateLimitHit`** — оставить как safety net. Если что-то проскочило мимо нашего guard — toast всё равно покажется.

---

## OPTIONAL Fix H — Dead-code cleanup [LOW priority, отдельный commit]

Если время позволяет (после всех P0/P1 fixes commit-нуты и tests pass):

Удалить comment blocks 546-785 и 1148-1418. Это уменьшит файл на ~500 строк и устранит trap для будущих разработчиков (S271 уже потерял один round из-за этого).

**Условие:** ОТДЕЛЬНЫЙ commit с message `chore: remove dead JSX comment blocks (S271 trap)`. Если коммитится — ОБЯЗАТЕЛЬНО проверить `wc -l` ДО и ПОСЛЕ + diff визуально.

**Если в Implementation budget не вмещается** — пропустить, добавить в BACKLOG как отдельную задачу.

---

## Regression checklist (verify after fix)

- [ ] **(a)** Одиночное «Принять» на одном блюде → mutation выполнена, UI обновлён, no toast 429.
- [ ] **(b)** Одиночное «Выдать» на одном блюде → то же.
- [ ] **(c)** «Принять все (4)» на 4 блюдах → 4 sequential mutations с ~120ms gap, no 429, единственная invalidation в конце.
- [ ] **(d)** «Выдать все (4)» → same.
- [ ] **(e)** «Выдать все» на 10+ блюдах → batch завершается (~1.5s), no 429.
- [ ] **(f)** «Отменить» (undo window) после batch → revert sequential, no 429.
- [ ] **(g)** Bulk request bar (line 2333): «Принять все» / «Выдать все» requests → sequential, no 429.
- [ ] **(h)** «Закрыть стол» с 4+ orders (handleCloseAllOrders) → sequential, no 429.
- [ ] **(i)** Одиночные кнопки «Принять request» / «Выдать request» в request card → unchanged, sync mutate, work.
- [ ] **(j)** Visual: bulk-button `disabled` во время batch (не permits double-click).
- [ ] **(k)** При искусственном 429 в середине batch (через DevTools throttling): early break, toast показан, UI partially updated — не зависает.
- [ ] **(l)** `wc -l pages/StaffOrdersMobile/staffordersmobile.jsx` после Fix A+B+E+F+invalidate ≈ baseline + 30..60 строк.
- [ ] **(m)** Dead-code blocks 546-785 / 1148-1418 — НЕ изменены (если Fix H пропущен) ИЛИ удалены отдельным commit (если Fix H применён).

---

## Acceptance criteria

- `BUGS.md § SOM-BUG-S270-01` → status `Fixed`, добавить дату и note «Sequential batch + invalidate-once + onBatchCloseRequestAsync».
- Все Regression items (a)-(j) verified в worktree (где возможно — visual check, где нет — code review confirms).
- RELEASE: `260414-02 StaffOrdersMobile RELEASE.jsx` (next sequence number за 260414-01).
- Commit message: `fix(SOM): SOM-BUG-S270-01 sequential batch mutations to prevent B44 429 (S271)`.

---

## Post-fix update

- `BUGS.md` обновить (Fixed + дата + RELEASE name).
- `KB_PROMPT_ERRORS.md` — добавить если найдены новые prompt issues.
- `pages/StaffOrdersMobile/README.md` — UX changelog: «S271: batch mutations sequential, prevents 429 on «Выдать все»».
