---
chain: staffordersmobile-260415-225055-2937
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: staffordersmobile-260415-225055-2937
Page: StaffOrdersMobile

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for StaffOrdersMobile
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/staffordersmobile-260415-225055-2937-cc-findings.md
   - **KB-158 write-fallback:** before writing, test-touch the path. If `pipeline/chain-state/` is read-only (worktree sandbox), write to `pages/StaffOrdersMobile/staffordersmobile-260415-225055-2937-cc-findings.md` AS A FALLBACK — comparator will find it there. Record fallback location in cc-analysis-*.txt.
   - ⚠️ NEVER write findings with generic name like `review_YYYY-MM-DD.md` — always include `staffordersmobile-260415-225055-2937` in filename so comparator can locate.
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260415-225055-2937

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
# КС — SOM Batch Б2 «Closed table попадает в Завершённые»

**Контекст:** После Б1 (S283, commit 6ec21e3, RELEASE 260415-00) close-table вызывает `closeSession(sessionId, tableId)` который закрывает `TableSession.status='closed'` + bulk `Order.status='closed'` + bulk `ServiceRequest.status='done'`. Однако тест S1 показал, что стол всё равно остаётся в табе «Активные»:
- Fix B: `sessionHelpers.js:177` фильтрует `ServiceRequest.filter({ table: tableId })` — link-field mismatch делает filter ненадёжным, часть requests остаётся `status != 'done'` → `hasActiveRequest=true` в `filteredGroups:3840` → стол в Active.
- Fix C: `activeOrders` @3583 после S283 пропускает `status='closed'` orders (только `cancelled` исключается) → закрытые orders видимы в Active через `hasServedButNotClosed` логику. Плюс `handleCloseTableClick:2165` берёт **первый** `table_session` через `find(Boolean)` — если на столе mixed old+new orders (после reopen) → закрывается НЕ та сессия.
- Fix A: UI драйвится только orders+requests, напрямую `TableSession.status` не читается. Нужен явный источник истины «какие TableSession открыты сейчас» через новый `useQuery`, и override в `filteredGroups`/`tabCounts`: если `group.type==='table'` и нет открытой сессии на этом столе → форсируем completed.

**Findings (Cowork-context, не нужно читать CC/Codex в chain):**
- `pipeline/cc-analysis-task-260415-215028-004.txt` (CC ПССК, 558 строк)
- `pipeline/codex-findings-pssk-som-b2-codex-v1.md` (Codex ПССК, 514 строк)

**Проверено Cowork перед КС (grep на HEAD):**
- `sessionHelpers.js:166-185` — текущая логика: bulk close orders + bulk done requests, filter по `table: tableId` (строка 177). Файл 203 строки (HO ошибочно указал 229 — фактически 203).
- `StaffOrdersMobile:2164-2171` — `handleCloseTableClick` через `find(Boolean)`, баг передачи sessionId.
- `StaffOrdersMobile:3565-3589` — `activeOrders` useMemo (finish-stage только cancelled исключается).
- `StaffOrdersMobile:3832-3850` — `filteredGroups` useMemo (hasActiveOrder / hasActiveRequest / hasServedButNotClosed).
- `StaffOrdersMobile:3853-3871` — `tabCounts` useMemo (та же логика).
- `StaffOrdersMobile:3372-3375` — reference паттерн `useQuery({ queryKey: ["tables", partnerId], queryFn: () => base44.entities.Table.filter({ partner: partnerId }) })`.
- `partnerId` и `canFetch` доступны в scope (строки 3349-3362).

---

## FROZEN UX (не менять)

1. **Tab switcher «Активные» / «Завершённые»** (per SOM-35 S277) — UI компонент не трогаем.
2. **Close-table flow** из Б1 (confirmation dialog, success toast «Стол закрыт»).
3. **Bill summary / request badges** на collapsed cards.
4. **Per-guest order model** (DECISIONS §1 S271).
5. **Skc/Rkc layouts** (S256/S277) — визуальная структура карточек не меняется.

---

## Fix B (PRIORITY 1) — sessionHelpers.js:177 filter by table_session

**Status:** `[BUG at line 177]` + `[NEW CODE fallback]`

**Target file:** `components/sessionHelpers.js` (203 строки).

**Проблема:** После close-table стол не пропадает из Active tab, потому что `hasActiveRequest` (`filteredGroups:3840`) продолжает видеть незакрытые `ServiceRequest`. Текущий код (строка 177):
```js
const requests = await base44.entities.ServiceRequest.filter({ table: tableId });
```
фильтрует по link-field `table`, который может иметь mismatch (ref vs id) и не возвращать все релевантные requests текущей сессии. Корректный ключ — `table_session: sessionId` (сессия уникальна, gatter не полагается на link normalization).

**Что делать:**

1. **Заменить строку 177** на filter по `table_session`:
   ```js
   // БЫЛО (@177):
   const requests = await base44.entities.ServiceRequest.filter({ table: tableId });
   
   // СТАЛО:
   let requests = await base44.entities.ServiceRequest.filter({ table_session: sessionId });
   // Fallback: if no results by session (legacy requests без table_session link) — try by tableId
   if (requests.length === 0 && tableId) {
     requests = await base44.entities.ServiceRequest.filter({ table: tableId });
   }
   ```

2. **Оставить** остальную часть блока (строки 178-185: filter openRequests + sequential update + BATCH_DELAY_MS) без изменений.

**НЕ должно быть в Fix B:**
- НЕ менять сигнатуру `closeSession(sessionId, tableId)` — оба параметра остаются.
- НЕ трогать bulk-close orders (@166-173) — это Fix Б1, работает корректно.
- НЕ менять `BATCH_DELAY_MS` (120ms) — baseline S283.
- НЕ добавлять try/catch вокруг fallback — partial failure должен пузыриться в `confirmCloseTable` catch.

**Test cases Fix B:**
1. Стол с 3 open ServiceRequests, каждый с `table_session=<active session>` → close-table → все 3 получают `status='done'`.
2. Стол с legacy ServiceRequest без `table_session` link, только `table=<tableId>` → первый filter возвращает 0 → fallback срабатывает → legacy request закрыт.
3. Нет requests на столе → оба filter возвращают 0 → функция выходит без update (никаких ошибок).

---

## Fix C (PRIORITY 2) — activeOrders:3583 + handleCloseTableClick:2165

**Status:** `[BUG at line 3583]` + `[BUG at line 2165]`

**Target file:** `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` (4579 строк).

### Fix C.1 — activeOrders exclude closed orders from finish-stage passthrough (@3583)

**Проблема:** После S283 (Fix 2 Б1) строка 3583 стала `return o.status !== 'cancelled';` — `status='closed'` orders проходят в `activeOrders` → попадают в `orderGroups`. На re-open (новая сессия) старые closed orders всё ещё ассоциированы со столом (тот же `group.id`) → показываются в карточке стола как «Ранее закрытые заказы» → UI путает официанта. Для Completed-tab стол виден через `hasServedButNotClosed` + новый Fix A override (см. ниже), старые closed orders не нужны в `activeOrders`.

**Что делать:**

Изменить строку 3583:
```jsx
// БЫЛО (@3580-3584):
if (stageId && stagesMap[stageId]) {
  const stage = stagesMap[stageId];
  if (stage.internal_code === 'finish') {
    return o.status !== 'cancelled';
  }
  return true;
}

// СТАЛО:
if (stageId && stagesMap[stageId]) {
  const stage = stagesMap[stageId];
  if (stage.internal_code === 'finish') {
    // S290 Б2: exclude both closed AND cancelled.
    // Closed orders принадлежат прошлой сессии — не показывать в Active tab.
    // Completed tab получает стол через Fix A override (openSessionByTableId).
    return o.status !== 'closed' && o.status !== 'cancelled';
  }
  return true;
}
```

### Fix C.2 — handleCloseTableClick правильный sessionId (@2165)

**Проблема:** `handleCloseTableClick` (@2164-2171) берёт первый попавшийся `table_session`:
```jsx
const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
```
Если на столе mixed orders от двух сессий (старая closed + новая open), `find(Boolean)` может вернуть старый sessionId → close-table закроет уже закрытую сессию, а текущую оставит открытой → P0 UX.

**Что делать:**

Использовать `openSessionByTableId` (создаётся в Fix A). Сигнатура `handleCloseTableClick` — closure внутри Card компонента; `openSessionByTableId` нужно прокинуть как prop через `onCloseTable`/`openSessionId`. Самый чистый путь — передать `openSessionId` как explicit prop в карточку из `filteredGroups` render и использовать его.

**Плохой путь:** менять propsAPI всех трёх call-sites (@767, @1382, @2384) с добавлением нового prop. Это расширяет scope.

**Хороший путь (minimal):** оставить `handleCloseTableClick` локальным, но добавить fallback к текущему orders-based поиску ПОСЛЕ попытки получить `openSessionId` из нового prop `group.openSessionId` (добавить в `orderGroups` mapping, см. Fix A.4):

```jsx
// БЫЛО (@2164-2171):
const handleCloseTableClick = useCallback(() => {
  const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
  if (onCloseTable && sessionId) {
    onCloseTable(sessionId, identifier, group.id);
    return;
  }
  if (onCloseAllOrders) onCloseAllOrders(group.orders);
}, [group.orders, identifier, onCloseAllOrders, onCloseTable]);

// СТАЛО:
const handleCloseTableClick = useCallback(() => {
  // S290 Б2: prefer session from openSessionByTableId (single source of truth)
  // fallback на orders[].table_session только для legacy rows без открытой TableSession
  let sessionId = group.openSessionId || null;
  if (!sessionId) {
    // Fallback: find sessionId from orders with status !== 'closed' (свежая сессия)
    const openOrder = group.orders.find(
      (o) => o.status !== 'closed' && o.status !== 'cancelled' && getLinkId(o.table_session)
    );
    sessionId = openOrder ? getLinkId(openOrder.table_session) : null;
  }
  if (onCloseTable && sessionId) {
    onCloseTable(sessionId, identifier, group.id);
    return;
  }
  if (onCloseAllOrders) onCloseAllOrders(group.orders);
}, [group.openSessionId, group.orders, identifier, onCloseAllOrders, onCloseTable]);
```

**НЕ должно быть в Fix C:**
- НЕ менять call-sites `handleCloseTableClick` (@767, @1382, @2384) — остаются без аргументов.
- НЕ трогать props API компонента карточки кроме чтения нового поля `group.openSessionId`.
- НЕ менять `activeRequests` filter — это Fix A scope.
- НЕ добавлять `__batch` flag — Б1b, отдельная КС.

**Test cases Fix C:**
1. Стол со всеми orders в finish+closed → `activeOrders` их НЕ включает → `orderGroups` без этого стола (Fix A override кладёт его в Completed).
2. Стол с 1 served order (finish+status='ready') → `activeOrders` включает (только closed/cancelled исключены) → `hasServedButNotClosed=true` → Active tab ✅.
3. Mixed table: 2 closed old + 1 new open order → `handleCloseTableClick` берёт sessionId из open order (fallback), НЕ из первого closed.
4. `group.openSessionId` присутствует (Fix A готов) → click → closeSession(openSessionId, tableId), closed без путаницы.

---

## Fix A (PRIORITY 3) — useQuery TableSession + override filteredGroups/tabCounts

**Status:** `[NEW CODE @~3525]` + `[MODIFY @3832-3850]` + `[MODIFY @3853-3871]` + `[MODIFY orderGroups mapping]`

**Target file:** `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx`.

**Проблема:** Ни `filteredGroups`, ни `tabCounts` не смотрят на `TableSession.status='open'`. Вся логика выводится из orders + requests. Если один signal не закрылся (Fix B решает для requests, но остаётся риск для любых будущих добавлений) — стол застревает в Active. Нужен явный источник истины.

**Что делать:**

### A.1 — новый useQuery для open TableSessions (добавить после @3519-3521 serviceRequests query, ~@3525):

```jsx
// S290 Б2: open-session ground truth (drives Active/Completed tab filter)
const { data: openSessions = [] } = useQuery({
  queryKey: ["openSessions", partnerId],
  queryFn: () =>
    partnerId
      ? base44.entities.TableSession.filter({ partner: partnerId, status: 'open' })
      : base44.entities.TableSession.list(),
  enabled: canFetch && !!partnerId && !rateLimitHit,
  staleTime: 30_000,
});
```

Использовать тот же `staleTime` / refetch pattern, что и `serviceRequests` query (сверить в @3519-3531 и применить один-в-один, кроме query). Импорт `TableSession` entity — если `base44.entities.TableSession` уже доступен (должен быть — closeSession.js его использует); если нет, добавить импорт рядом с `Partner/Table/Order` (grep на `base44.entities.` в начале файла).

### A.2 — производные map/set (useMemo сразу после useQuery):

```jsx
// S290 Б2: tableId -> open TableSession (и tableId set для быстрых проверок)
const openSessionByTableId = useMemo(() => {
  const map = {};
  (openSessions || []).forEach((s) => {
    const tid = getLinkId(s.table);
    if (tid) map[tid] = s;
  });
  return map;
}, [openSessions]);

const openSessionIds = useMemo(
  () => new Set((openSessions || []).map((s) => s.id)),
  [openSessions]
);
```

### A.3 — invalidate openSessions после close-table:

В `confirmCloseTable` (@~4146-4200, Fix Б1 реализация) в блоке after `closeSession(sessionId, tableId)` добавить:
```jsx
queryClient.invalidateQueries({ queryKey: ["openSessions"] });
```
рядом с существующими invalidate(`["orders"]`, `["serviceRequests"]`). Grep `queryClient.invalidateQueries` в `confirmCloseTable` — добавить третью строку.

### A.4 — прокинуть `openSessionId` в orderGroups (для Fix C.2):

Найти место где формируется `orderGroups` (предположительно из hall-grouping, grep `orderGroups =` / `orderGroups\s*=\s*useMemo`). В mapping каждой group `type==='table'` добавить поле:
```jsx
openSessionId: openSessionByTableId[tableId]?.id || null,
```

Если `orderGroups` строится через reduce — добавить в объект group. deps useMemo — включить `openSessionByTableId`.

### A.5 — filteredGroups override (@3832-3850):

```jsx
// БЫЛО (@3832-3850):
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(...);
    const hasActiveRequest = ...;
    const hasServedButNotClosed = ...;
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);

// СТАЛО:
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  return orderGroups.filter(group => {
    // S290 Б2: session-first override for 'table' groups
    if (group.type === 'table') {
      const hasOpenSession = !!openSessionByTableId[group.id];
      // No open session → force to Completed, никакой orders/requests логики
      if (!hasOpenSession) return activeTab === 'completed';
    }
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
```

### A.6 — tabCounts override (@3853-3871):

Тот же принцип:
```jsx
const tabCounts = useMemo(() => {
  if (!orderGroups) return { active: 0, completed: 0 };
  let active = 0, completed = 0;
  orderGroups.forEach(group => {
    // S290 Б2: same override as filteredGroups
    if (group.type === 'table' && !openSessionByTableId[group.id]) {
      completed++;
      return;
    }
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
  });
  return { active, completed };
}, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
```

**НЕ должно быть в Fix A:**
- НЕ менять UI (tab switcher, карточки, labels).
- НЕ трогать `activeRequests` query — остаётся как есть, fix Б1/Fix B закрывают requests при close-table.
- НЕ менять `finalGroups` (favorites filter @3874) — получит filtered values автоматически.
- НЕ добавлять polling/websocket — только базовый useQuery + invalidate.
- НЕ переписывать `orderGroups` с нуля — только добавить одно поле `openSessionId`.
- НЕ создавать новый useEffect для hydration — react-query делает сам.

**Test cases Fix A:**
1. Стол с open TableSession + 3 new orders → `openSessionByTableId[tid]` truthy → обычная логика → Active tab.
2. Closed-table: `openSessions` не содержит → `hasOpenSession=false` → force Completed, `tabCounts.completed++`.
3. После close-table → `queryClient.invalidateQueries(["openSessions"])` → refetch → closed TableSession пропала → стол мигрирует в Completed **без reload страницы**.
4. После reload страницы → `useQuery` перечитывает → стол всё ещё в Completed (ground truth в B44).
5. После re-open стола (новая TableSession) → `invalidateQueries(["openSessions"])` (в open-table flow если есть; если нет — staleTime 30s hydrates автоматически) → стол в Active.
6. Counter mismatch: tabs показывают разное кол-во чем есть в `filteredGroups` — исключено, оба используют один и тот же override.

---

## Regression Check (MANDATORY after implementation)

1. **Б1 close-table flow** продолжает работать: stage advance + request close + session close (`confirmCloseTable` не меняется, только добавляется одна строка invalidate).
2. **Active tab** показывает столы с open TableSession И (hasActiveOrder OR hasActiveRequest OR hasServedButNotClosed).
3. **«Закрыть все заказы»** handler (`handleCloseAllOrders` @4158-4179) — не затронут, работает.
4. **Reopen стола** — новая `TableSession.status='open'` → появляется в `openSessions` → стол в Active.
5. **Expand/collapse** карточки — `expandedGroupId` logic не затронута.
6. **Bill summary (Block E)** — использует `group.orders` (все, включая closed), суммы не ломаются.
7. **Sticky order groups (non-table)**: `group.type !== 'table'` → override не применяется → ведут себя как раньше.
8. **Favorites filter** (`finalGroups` @3874) — получает отфильтрованные values, ничего не ломается.
9. **Rate limit banner** при `isRateLimitError` — flow не меняется.

---

## Validation после merge (execute before commit)

1. **Lint:** `cd menuapp-code-review && npx eslint "pages/StaffOrdersMobile/*.jsx" "components/sessionHelpers.js"` — 0 errors.
2. **Grep verify:**
   - `grep -n "openSessionByTableId" "menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx"` — expected 4+ hits (useMemo creation + filteredGroups + tabCounts + orderGroups mapping).
   - `grep -n "openSessions" "menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx"` — expected 3+ hits (useQuery queryKey + useMemo deps + invalidate).
   - `grep -n "queryKey: \[\"openSessions\"" "menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx"` — expected 1 hit (useQuery registration).
   - `grep -n "invalidateQueries.*openSessions" "menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx"` — expected 1+ hit (в `confirmCloseTable`).
   - `grep -n "table_session: sessionId" "menuapp-code-review/components/sessionHelpers.js"` — expected 1 hit (Fix B).
   - `grep -n "ServiceRequest.filter({ table:" "menuapp-code-review/components/sessionHelpers.js"` — expected 1 hit (fallback branch, not primary).
   - `grep -n "find((o) => o.status !== 'closed'" "menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx"` — expected 1 hit (Fix C.2 fallback в handleCloseTableClick).
3. **Line count:** RELEASE.jsx 4579 → ~4620-4640 (+40-60 строк за Fix A/C). sessionHelpers.js 203 → ~206-210 (+3-7 строк Fix B).
4. **Entity check:** убедиться `base44.entities.TableSession` импортирован/доступен (grep `base44.entities.TableSession` — если 0 hits в SOM файле, добавить импорт аналогично существующим entities).

---

## Files to modify

1. `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` — Fix C.1 (activeOrders @3583), Fix C.2 (handleCloseTableClick @2164-2171), Fix A.1 (useQuery openSessions), A.2 (useMemo maps), A.3 (invalidate в confirmCloseTable), A.4 (openSessionId в orderGroups), A.5 (filteredGroups override), A.6 (tabCounts override).
2. `components/sessionHelpers.js` — Fix B (строка 177 + fallback).
3. `pages/StaffOrdersMobile/BUGS.md` — добавить SOM-BUG-S289-02 (closed table stays in Active) с fix reference (commit hash + RELEASE date).
4. `BUGS_MASTER.md` (root) — если баг не заведён, добавить запись.

---

## Git (auto via С5v2 merge step)

```
git add "pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx" \
        "components/sessionHelpers.js" \
        "pages/StaffOrdersMobile/BUGS.md" \
        "../BUGS_MASTER.md"
git commit -m "fix(som-b2): closed table lands in Completed via TableSession ground truth (Fix B+C+A)"
git push
```
=== END ===
