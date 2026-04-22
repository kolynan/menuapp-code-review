---
task_id: pssk-som-b2-cc-v1
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx
budget: 10
agent: cc
model: claude-sonnet-4-5
ws: WS-SOM
created: 2026-04-15
session: 289
scope_summary: "SOM Батч Б2 — CC анализ Fix A (filteredGroups TableSession override) + Fix B (ServiceRequest.filter debug) + Fix C (#347 orderGroups session-aware). Параллельно с pssk-som-b2-codex-v1."
---

# START PROMPT — SOM Батч Б2 (CC analysis)

**Role:** You are Claude Code. Analyze SOM code independently and produce findings. DO NOT modify code. DO NOT launch Codex. Review/analysis only.

**Output file:** `pipeline/cc-analysis-pssk-som-b2-cc-v1.txt`. Markdown, 500–1500 lines, grep-backed with line numbers.

---

## Context

**Workstream:** WS-SOM. Batch Б2 unblocks the "Close Table" flow after deployed Б1 left one gap: закрытый стол всё ещё отображается в табе «Активные».

**Batch Б2 scope** (3 fixes):

### Fix A — filteredGroups TableSession.status override
Sym: после `closeSession()` стол остаётся в табе «Активные», хотя `TableSession.status = 'closed'` и все ордера `status = 'closed'`.
Hypothesis: `filteredGroups` (lines 3832-3850) решает active/completed по `hasActiveOrder || hasActiveRequest || hasServedButNotClosed`. Если хотя бы один `ServiceRequest` остался не-`done` (Fix B) или есть race с invalidation — группа всё ещё active. Нужен явный override: если session для этого стола closed → всегда completed.

### Fix B — ServiceRequest.filter debug
Sym: `closeSession()` в `components/sessionHelpers.js` (lines 175-185, S283) пытается закрыть все open ServiceRequests по столу: `ServiceRequest.filter({ table: tableId })`. В S286 тестировании после закрытия стола остался «активным» — значит либо filter ничего не вернул, либо update не отработал, либо invalidation не дошёл до SOM.
Need diagnosis: формат поля `table` в ServiceRequest (link? string? object?), правильный ли filter, почему в prod не срабатывает.

### Fix C — #347 orderGroups session-aware
Sym: при повторном открытии стола (TableSession#2 для того же Table) ордера из закрытой TableSession#1 отображаются в группе вместе с новыми.
Hypothesis: `orderGroups` (lines 3740-3789) группирует `visibleOrders` по `getLinkId(o.table)` (tableId), игнорируя `table_session`. Нужна группировка по `table_session` (или компо: tableId + session), чтобы закрытые сессии не смешивались с открытой.

**Reference files:**
- `menuapp-code-review/pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` — основной файл (4579 строк)
- `menuapp-code-review/components/sessionHelpers.js` — `closeSession` (строки 158-186)
- `BACKLOG.md` — #347, #348
- `BUGS_MASTER.md` — SOM-BUG-S270-02 (relevant)
- `B44_Entity_Schemas.md v3.0` — Table, TableSession, Order, ServiceRequest

---

## Your deliverable (findings)

### Section 1 — Fix A (filteredGroups TableSession override)

1. Verbatim `filteredGroups` useMemo (lines 3832-3850) + `tabCounts` (lines 3852-3871). Quote with line numbers.
2. Grep: загружаются ли `TableSession` entities в SOM? (`grep -n "TableSession" pages/StaffOrdersMobile/*.jsx`). Если нет — это часть фикса (добавить query).
3. **Recommend approach:**
   - Option A: добавить `useQuery` для `TableSession.filter({ status: 'open' })` → мапа `openSessionByTableId` → если нет open session для tableId → always completed.
   - Option B: добавить флаг `session_closed` в group при построении `orderGroups` (берём `o.table_session` → проверяем status).
   - Option C: проверить все ордера группы `.every(o => o.status === 'closed' || 'cancelled')` → completed (игнорируя requests).
   - Которое решение корректнее и дешевле по запросам к B44? Обоснуй.
4. Regression risks: 3 сценария что может сломаться (tab counts, сортировка, re-open table UX).
5. Test plan: 4 шага official (close table → reload → swipe tabs → reopen + new order).

### Section 2 — Fix B (ServiceRequest.filter debug)

1. Verbatim блок ServiceRequest close в `sessionHelpers.js` (lines 175-185). Квоут.
2. Grep в RELEASE: как формируется `ServiceRequest` при создании (там где waiter триггерит call/bill). Формат поля `table`: link/string/object? Строки + ±3 контекста.
3. Grep в RELEASE для `activeRequests` query: `ServiceRequest.filter({...})` — каким фильтром читается список активных? Что в filter key?
4. **Diagnose mismatch:** если создаётся с `table: tableObject` а читается с `table: tableId` — вот root cause. Приведи точный пример несоответствия.
5. **Recommend fix:** либо нормализовать filter в `closeSession` (попробовать оба варианта filter'а), либо починить создание. Pseudo-code 5-10 строк.
6. Regression risks: 3 штуки.

### Section 3 — Fix C (#347 orderGroups session-aware)

1. Verbatim `orderGroups` useMemo (lines 3740-3789). Квоут.
2. Grep: используется ли где-то `table_session` id как ключ группировки? (вероятно нет — это и есть баг).
3. **Recommend approach:**
   - Option A: ключ группы = `${tableId}:${sessionId}` (пара). Показываем два виртуальных стола "T5 (завершён)" и "T5 (активный)"? — или только открытую сессию?
   - Option B: фильтровать `visibleOrders` по `table_session.status === 'open'` (требует joined data).
   - Option C: группировать по tableId, но исключать orders из closed sessions.
   Которое чище и меньше ломает sort/tabCounts?
4. UX impact: что видит waiter если стол re-opened и в старой сессии ещё остались unclosed orders?
5. Test plan: 3 шага (session1 close → session2 open same table → оба набора orders видны правильно).

### Section 4 — Prompt Clarity rating

Оценка 1–5. Если <5 — список неясностей.

### Section 5 — Risks outside scope

До 5 пунктов. 1 строка каждый.

---

## ⛔ SCOPE LOCK

- DO NOT modify code.
- DO NOT launch Codex/subagents. Read/Grep/Bash only.
- DO NOT design the КС (Constructor) prompt — это следующий шаг.
- Output file: `pipeline/cc-analysis-pssk-som-b2-cc-v1.txt`.

Begin analysis.
