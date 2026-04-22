---
chain: staffordersmobile-260415-153619-4e93
chain_step: 4
chain_total: 4
chain_step_name: merge-v2
page: StaffOrdersMobile
budget: 16.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260415-153619-4e93
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260415-153619-4e93-comparison.md
   - **Abort-on-empty check (KB-158):** if comparison contains `## CRITICAL: No findings found` OR has empty "Final Fix Plan" (0 items) → write merge report with status `ABORTED_NO_FINDINGS`, skip git commit, EXIT step. Do NOT proceed with 0 fixes and claim success.
   - **Capture HEAD baseline:** run `git rev-parse HEAD` and record value as `HEAD_BEFORE` in merge report. Required for step 9 verify.
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260415-153619-4e93-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. **File integrity check (KB-121 prevention):**
   Run: `wc -l pages/StaffOrdersMobile/*.jsx`
   - If result matches expected line count from comparison/findings → proceed.
   - If result is unexpectedly low (e.g. differs by 200+ lines from what findings mention) →
     run `git fetch origin && git reset --hard origin/main` then verify again.
   - If still wrong after reset → STOP and write merge report explaining the issue. Do NOT apply changes to a truncated file.
4. Read the code file: pages/StaffOrdersMobile/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
6. After applying fixes:
   a. Update BUGS.md in pages/StaffOrdersMobile/ with fixed items
   b. Update README.md in pages/StaffOrdersMobile/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260415-153619-4e93"
   - git push
8. **Verify-commit check (PQ-111):** run `git rev-parse HEAD` → record as `HEAD_AFTER`.
   - If `HEAD_BEFORE == HEAD_AFTER` → merge FAILED silently. Write merge report with status `FAILED_NO_COMMIT` explaining what blocked the commit (merge conflict? nothing to stage? hooks rejected?). Do NOT claim success.
   - If `HEAD_AFTER != HEAD_BEFORE` → verify commit touched expected files: `git show --stat HEAD` must include at least one `pages/StaffOrdersMobile/` file. If not → status `FAILED_WRONG_FILES`.
9. Write merge report to: pipeline/chain-state/staffordersmobile-260415-153619-4e93-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260415-153619-4e93

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- HEAD_BEFORE: <hash>
- HEAD_AFTER: <hash>
- Commit: <hash> (MUST equal HEAD_AFTER when status=OK)
- Status: OK | ABORTED_NO_FINDINGS | FAILED_NO_COMMIT | FAILED_WRONG_FILES
- Lines before: <N>
- Lines after: <N>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# КС SOM Батч Б1 — Close Table → «Завершённые» + rate limit

Reference:
- `pipeline/cc-analysis-pssk-som-b1-cc-v1.txt` (CC findings, 18.5KB)
- `pipeline/codex-findings-pssk-som-b1-codex-v1.txt` (Codex findings, 15.7KB)
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md`
- `components/sessionHelpers.js` (helper, 215 строк)

**UX-решение (Arman, S283):** после нажатия «Закрыть стол» таблица должна появиться в табе «Завершённые» (НЕ исчезать, НЕ оставаться в «Активных»). Это требует расширить фильтр `activeOrders` чтобы включить closed orders из текущей смены.

---

## Fix 1 — SOM-BUG-S270-02 (P1) [MUST-FIX]: Close Table → стол в «Завершённые»

### Сейчас
Официант нажимает «Закрыть стол» в expanded card → `closeSession()` закрывает `TableSession` + все Orders (status='closed'). Таб «Завершённые» стол НЕ показывает — стол исчезает из обоих табов.

### Должно быть
После `closeSession()` стол появляется в табе «Завершённые» с индикатором закрытия. Остаётся там до конца смены (shift cutoff).

### Root cause (по findings)
`activeOrders` useMemo (строки 3575-3584) отфильтровывает `status === 'closed'` ДО группировки:
```js
// Существующий код (строка 3580):
if (stage.internal_code === 'finish') {
  return o.status !== 'closed' && o.status !== 'cancelled';  // ← отсюда утечка closed
}
```
После фильтра закрытые заказы не попадают в `visibleOrders` → `orderGroups` → `filteredGroups`. Таб-фильтр на 3828-3847 никогда не срабатывает для полностью закрытых столов.

Дополнительно: `hasActiveRequest` (3834) держит стол в Active, если остались открытые `ServiceRequest`. `closeSession()` их не закрывает (только TableSession + Orders).

### Фикс
**Часть 1a — `activeOrders` фильтр (pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:3580)**
Изменить строку 3580 чтобы включить closed orders (но не cancelled):
```js
// Было:
if (stage.internal_code === 'finish') {
  return o.status !== 'closed' && o.status !== 'cancelled';
}
// Стало:
if (stage.internal_code === 'finish') {
  return o.status !== 'cancelled';
}
```
SHIFT cutoff уже на 3572-3574 (`createdAt < shiftCutoff → return false`) — гарантирует что leak'а исторических закрытых не будет. Только текущая смена.

**Часть 1b — закрывать ServiceRequests в `closeSession` (components/sessionHelpers.js:158-171)**
Добавить после bulk-close Orders:
```js
// Закрыть также открытые ServiceRequests для этого стола
const tableSessions = await base44.entities.TableSession.filter({ id: sessionId });
const tableId = getLinkId(tableSessions[0]?.table);
if (tableId) {
  const requests = await base44.entities.ServiceRequest.filter({ table: tableId });
  const openRequests = requests.filter(r => !['done', 'cancelled'].includes(r.status));
  for (const r of openRequests) {
    await base44.entities.ServiceRequest.update(r.id, { status: 'done' });
  }
}
```
Используем `for...of` + await (sequential), НЕ `Promise.all` — см. Fix 3 о rate limit.

**Часть 1c — refetch requests после close (pages/StaffOrdersMobile/.../4148-4155)**
В `confirmCloseTable` после `closeSession(sessionId)` добавить `if (!isKitchen) refetchRequests();` по аналогии с `handleRefresh` (4131).

### НЕ должно быть
- НЕ трогать `Table.status` (B44 поле есть по S271 схеме, но фильтр tab'ов его не использует — добавим позже отдельной задачей).
- НЕ менять logic `filteredGroups` на 3828-3847 — текущая логика корректна, просто сейчас closed orders до неё не доходят.
- НЕ менять `hasServedButNotClosed` — он работает как задумано для "served but not yet closed" промежуточного состояния.

### Файл и локация
1. `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:3580` (1 строка)
2. `components/sessionHelpers.js:158-171` (+ ~10 строк внутри `closeSession`)
3. `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:4148-4155` (+ 1 строка refetchRequests)

### Проверка
1. Зайти в SOM как официант, открыть стол, создать 2 заказа, провести через all stages до finish.
2. Создать 1 ServiceRequest (help/bill) на этом же столе.
3. Нажать «Закрыть стол» в expanded card → подтвердить.
4. Переключиться на таб «Завершённые» → стол там виден (с заказами в статусе closed).
5. Таб «Активные» → стола нет.
6. Обновить страницу (F5) → стол по-прежнему в «Завершённые» (пока смена не кончилась).
7. Открыть новую сессию на том же столе → стол возвращается в «Активные», в «Завершённые» остаётся старая закрытая версия (отдельный orderGroup — другая session).

---

## Fix 2 — SOM-BUG-S270-01 (P0) [MUST-FIX]: `Promise.all` в closeSession → sequential

### Сейчас
`components/sessionHelpers.js:165-170`:
```js
await Promise.all(
  sessionOrders
    .filter(o => o.status !== 'cancelled')
    .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
);
```
Для стола с 5+ заказами → 5+ параллельных B44 API calls одномоментно → вероятность 429 rate limit.

### Должно быть
Sequential закрытие с 120ms delay между вызовами (по паттерну `runBatchSequential`).

### Фикс
Заменить `Promise.all` на for-loop с delay. `runBatchSequential` определён только в RELEASE.jsx (строка 529), импортировать в sessionHelpers.js нельзя (circular). Inline-реализация:
```js
const BATCH_DELAY_MS = 120;
const ordersToClose = sessionOrders.filter(o => o.status !== 'cancelled');
for (let i = 0; i < ordersToClose.length; i++) {
  await base44.entities.Order.update(ordersToClose[i].id, { status: 'closed' });
  if (i < ordersToClose.length - 1) {
    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }
}
```

### НЕ должно быть
- НЕ использовать `Promise.allSettled` (маскирует ошибки, waiter не увидит failed order).
- НЕ импортировать `runBatchSequential` из RELEASE.jsx (циклическая зависимость: sessionHelpers → RELEASE → sessionHelpers).
- НЕ увеличивать `BATCH_DELAY_MS` >120ms без причины.

### Файл и локация
`components/sessionHelpers.js:158-171` (перепишется внутри `closeSession`).

### Проверка
1. Стол с 5 заказами, все доведены до finish stage.
2. Нажать «Закрыть стол».
3. В Network tab DevTools → видим последовательные `PATCH /entities/Order/{id}` запросы с интервалом ~120ms.
4. Нет 429 ответов.
5. Все 5 заказов в DB имеют `status: 'closed'`.

---

## Fix 3 — SOM-BUG-S270-01 (P1) [MUST-FIX]: `forEach` → `runBatchSequential` в collapsed card

### Сейчас
`pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx`, collapsed card two places:

**Строка ~663** (Accept All):
```js
onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', {
  assignee: effectiveUserId,
  assigned_at: new Date().toISOString()
}))}
```

**Строка ~665** (Serve All):
```js
onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))}
```

Аналогично в expanded version на строке 1272 (найти по grep `tableRequests.forEach`).

Каждый `forEach` = N параллельных mutations + N `invalidateQueries(["serviceRequests"])` одномоментно. 3 requests = 3 mutations + 3 invalidations в <50ms → 429.

### Должно быть
Использовать `runBatchSequential` + `onBatchCloseRequestAsync` (паттерн уже есть в expanded card на строке 2369 — см. её как образец).

### Фикс
Заменить `forEach` на `runBatchSequential` с async wrapper. Требует проп `onBatchCloseRequestAsync` вместо/в дополнение к `onCloseRequest`. Точный паттерн уже используется в `pages/StaffOrdersMobile/...:2369` — использовать его верхом.

```js
// Accept All:
onClick={async () => {
  await runBatchSequential(tableRequests, (r) =>
    onBatchCloseRequestAsync(r.id, 'accepted', {
      assignee: effectiveUserId,
      assigned_at: new Date().toISOString()
    })
  );
  queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
}}

// Serve All:
onClick={async () => {
  await runBatchSequential(tableRequests, (r) =>
    onBatchCloseRequestAsync(r.id, 'done')
  );
  queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
}}
```

Если `onBatchCloseRequestAsync` не проброшен в collapsed card компонент — пробросить через props (parent уже имеет, используется на 2369).

### НЕ должно быть
- НЕ оставлять оригинальный `forEach` как fallback.
- НЕ менять UI-кнопки (тексты, стили, disabled state).
- НЕ трогать expanded card на 2369 (там паттерн правильный).

### Файл и локация
`pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx`:
- Строка ~663 (Accept All в collapsed)
- Строка ~665 (Serve All в collapsed)
- Строка 1272 (analogous collapsed view in TableOrderGroup) — grep `tableRequests.forEach` для точного расположения

### Проверка
1. Стол с 3+ открытыми ServiceRequest'ами (например, 3 × «Счёт»).
2. В collapsed card (не expanded) нажать «Принять все» → mutations идут последовательно с ~120ms интервалом.
3. Нет 429. Все requests переходят в `accepted`.
4. Потом «Подать все» → аналогично → все в `done`.

---

## Fix 4 — [NICE-TO-HAVE]: `__batch` guard на `updateStatusMutation`

### Сейчас
`pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:1594-1607`:
```js
const updateStatusMutation = useMutation({
  mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
  // ...
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),  // всегда
});
```
`onSettled` всегда fire'ит invalidate — нет `__batch` guard (в отличие от `advanceMutation` на 1916-1919).

### Должно быть
Консистентность с `advanceMutation`: `onSettled` пропускает invalidate для batched calls.

### Фикс
```js
onSettled: (_data, _err, vars) => {
  if (vars?.__batch) return;
  queryClient.invalidateQueries({ queryKey: ["orders"] });
},
```

### НЕ должно быть
- НЕ менять call-sites `updateStatusMutation.mutate(...)` — они пока передают payload без `__batch`, это OK.

### Файл и локация
`pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx:1606` (1 строка → 3 строки).

### Проверка
Single-click на OrderCard action → invalidate fire'ит как раньше. Регрессий нет.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Изменяй ТОЛЬКО код из Fix 1-4 (4575 строк файла + 215 строк sessionHelpers.js — 99% файла не трогаем).
- ВСЁ остальное — НЕ ТРОГАТЬ. Ни кнопки, ни i18n, ни layout, ни другие мутации, ни другие компоненты.
- Если видишь «проблему» не из Fix 1-4 — ПРОПУСТИ (она в Out-of-scope risks, см. ниже).
- Locked UX (см. `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md`) — ЗАПРЕЩЕНО менять.

---

## FROZEN UX (из Arman's decision S283)

1. Close Table → стол появляется в табе «Завершённые» (не исчезает, не остаётся в «Активных»).
2. Видимость закрытого стола: до конца текущей смены (shift cutoff уже применяется на 3572-3574).
3. После открытия новой сессии на том же столе: новая сессия → «Активные», старая закрытая → остаётся в «Завершённых».
4. ServiceRequest'ы закрытого стола → автоматически `status='done'` (чтобы не было `hasActiveRequest=true` для закрытого стола).

---

## Out-of-scope risks (не фиксить в этом КС)

1. [P2] Hardcoded Russian strings в `confirmCloseTable` (4149, 4153, 4163, 4378) → i18n — follow-up task.
2. [P2] `updateStatusMutation` и `advanceMutation` дублирование — consolidate позже.
3. [P2] `closeSession` не return'ит метаданные (сколько orders закрыто, какие failed) — отдельный улучшение.
4. [P2] Notification invalidate на 4062 + polling 5с — другой rate limit vector, требует отдельного анализа.
5. [P1] `Table.status` поле не используется SOM'ом — добавить в будущем КС если понадобится cross-page sync с PartnerTables.

---

## Implementation Notes

- **Файлы:** `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx`, `components/sessionHelpers.js`
- **НЕ ломать:** рабочую batch-логику на 2369 (expanded card), `handleOrdersAction` / `handleSingleAction` на 1981-2002 (они уже используют `__batch`).
- **Git commit** после всех 4 фиксов одним коммитом: `"SOM B1: close-table→completed + rate limit (CV-BUG-S270-01/02)"`
- **RELEASE файл** создать: `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` после merge.
=== END ===
