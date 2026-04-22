---
chain: staffordersmobile-260415-094104-4d54
chain_step: 2
chain_total: 2
chain_step_name: discussion-synthesizer
page: StaffOrdersMobile
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion Synthesizer (2/2) ===
Chain: staffordersmobile-260415-094104-4d54
Page: StaffOrdersMobile

You are the Discussion Synthesizer in a modular discussion pipeline.
Your job: read BOTH CC and Codex positions, compare them, and produce a unified decision report.

INSTRUCTIONS:

1. Read CC position: pipeline/chain-state/staffordersmobile-260415-094104-4d54-cc-position.md
2. Read Codex position: pipeline/chain-state/staffordersmobile-260415-094104-4d54-codex-position.md
3. If reference files are mentioned in the original task — read them for additional context.

4. For EACH question, compare CC and Codex positions:

   IF they AGREE:
   - Confirm the shared recommendation
   - Note confidence level

   IF they DISAGREE:
   - Analyze both arguments on technical/UX merits
   - Be FAIR — do not automatically prefer CC or Codex
   - Pick the stronger recommendation OR propose a compromise
   - If neither is clearly better → mark as "Arman decides" with both options

5. Write final discussion report to: pipeline/chain-state/staffordersmobile-260415-094104-4d54-discussion.md

FORMAT:
# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260415-094104-4d54
Mode: CC+Codex (synthesized)
Topic: [title from task]

## Questions Discussed
[List all N questions from the task]

## Analysis

### Q1: [question title]
**CC Position:** [summary of CC recommendation + key reasoning]
**Codex Position:** [summary of Codex recommendation + key reasoning]
**Status:** agreed / disagreement
**Resolution:** [agreed recommendation OR synthesizer's verdict with reasoning]

### Q2: [question title]
...

## Decision Summary
| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | Title    | option A | option A | agreed: option A | high |
| 2 | Title    | option B | option C | synthesizer: option B (reason) | medium |
| 3 | Title    | option D | option E | Arman decides | — |

## Recommendations
For each question: the final recommendation (or both options if unresolved).
Format as actionable decisions ready for DECISIONS_INDEX.

## Unresolved (for Arman)
Questions where CC and Codex positions are both valid and synthesizer cannot determine a clear winner.
Each item shows both positions and the key trade-off.

## Quality Notes
- CC Prompt Clarity score: [from CC position file]
- Codex Prompt Clarity score: [from Codex position file]
- Issues noted: [any concerns about question quality]

6. Do NOT write or modify any code files.

=== TASK CONTEXT ===
# ПССК: SOM Б1 — Close Table → Завершённые (P1) + Rate-limit Single-Mutation Audit (diagnostics only)

Это ПССК v1 батча Б1 (надёжность). Scope утверждён Arman S278.

**Source RELEASE:** `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (4538 строк). Рабочая копия: `pages/StaffOrdersMobile/staffordersmobile.jsx`. Helper: `components/sessionHelpers.js` (closeSession FUNCTION 8).

**Report target для Fix 2:** `BUGS_MASTER.md` (корень репозитория Cowork), новая секция `## SOM Rate-Limit Single-Mutation Audit (S278 Б1)`.

---

## Задача ревью

Please review the DRAFT КС prompt below. The КС has TWO deliverables:

- **Fix 1 (code change)** — fixes SOM-BUG-S270-02 (close table → Завершённые tab).
- **Fix 2 (report only, NO code)** — rate-limit audit for single mutations. Output: markdown section appended to `BUGS_MASTER.md`.

Check the draft for:

1. **Fix 1 root cause coverage** — do the proposed changes actually close the bug? Specifically:
   - `closeSession` (sessionHelpers.js:158-171) sets `TableSession.status='closed'` + per-order `status='closed'` — is the signal reaching the filter?
   - `filteredGroups` (staffordersmobile.jsx:3829-3847) `hasActiveOrder` check: `!config.isFinishStage && o.status !== 'cancelled'` — a closed order can still have `!config.isFinishStage` if stage_id is earlier. Is this the actual gap?
   - Close-table button (lines 767, 1382, 2381) disabled only via `closeDisabledReason` — after closeSession nothing in `closeDisabledReason` changes locally until refetch; button stays clickable → double-press risk. Is the proposed guard (`table.status === 'closed'` OR `session.status === 'closed'`) the correct disable condition?
2. **Ambiguous Fix descriptions** — anything that could be interpreted 2+ ways.
3. **Wrong/missing line numbers or grep hints** (file: `260414-02 StaffOrdersMobile RELEASE.jsx`, 4538 lines).
4. **Fix 2 audit coverage** — does the draft list cover all single-mutation call sites?
   - `handleSingleAction` (line 2002) delegates to `handleOrdersAction` with `[order]` — already passes `__batch: true` and invalidates once. ✅ Covered.
   - `confirmCloseTable` (line 4143-4155) calls `closeSession(sessionId)` then `refetchOrders()` — does this trigger a cascade? closeSession inside does `Promise.all(sessionOrders.map(... Order.update))` (sessionHelpers.js:166-170) — **potential fan-out**, not covered by __batch.
   - `handleCloseAllOrders` (line 4158+) uses `runBatchSequential` → OK.
   - `updateRequestMutation` single calls (line 3550-3551) use `__batch` gate on success.
   - Any other mutation direct call (Order.update / ServiceRequest.update / TableSession.update) outside the __batch/invalidate-once discipline?
5. **Fix 2 report structure** — is the required markdown schema (Location / Call site / Risk / Recommendation / Estimated LOC) clear enough that CC+Codex write a consistent report?
6. **Scope creep risks** — Fix 2 must be PURE diagnostic: no code edits in staffordersmobile.jsx or sessionHelpers.js. If auditor finds ≤20-LOC fix, it goes into the report under "Proposed fix (NOT applied in this task)", NOT into the patch. Is this guardrail visible enough in the draft?
7. **Regression risks for Fix 1** — close-table flow is cross-cut with bill-payment gate and undo-toast. The draft explicitly protects:
   - `closeDisabledReason` original conditions (all dishes served + bill paid) — kept intact;
   - `activeTab === 'active'` default behavior (only newly closed group moves to completed);
   - Real-time `useQuery` refetch after closeSession — intact.
   Did we miss anything?
8. **Grep hints** — verify the patterns in "Grep verification" actually exist and return the expected counts.

Rate each Fix (1, 2): ✅ Clear / ⚠️ Needs clarification / ❌ Rewrite needed.

**Target for implementation КС:** both Fix ≥ 4/5. Any ❌ blocks queue.

---

## Context for reviewers

**B44 entity model (verified S271):**
- `TableSession.status` — values: `'open' | 'closed'` (S70 changed from `'active'`→`'open'`).
- `Order.status` — after closeSession all non-cancelled orders set to `'closed'`.
- `Table.status` — added in B44-2 (commit `374e7a4`, S271). NOT currently updated by closeSession in sessionHelpers.js — open question: should it be? Draft assumes fix is on the **filter side** (tab filter), not on closeSession side.

**Current filter logic (staffordersmobile.jsx:3829-3847):**
```js
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';  // ← gap: 'closed' still counts
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
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);
```

**closeSession helper (components/sessionHelpers.js:158-171):**
```js
export async function closeSession(sessionId) {
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
}
```

Root-cause hypothesis: `hasActiveOrder` returns true for `{status:'closed', stage_id:<not finish>}`, because it only excludes `'cancelled'`. After closeSession, orders get `status='closed'` but retain their stage_id. Filter keeps the group in `'active'` tab.

Secondary issue: `Promise.all` fan-out in closeSession on line 166 is a potential rate-limit source (Fix 2 audit — not in Fix 1 scope).

---

## DRAFT КС PROMPT BELOW (do not implement — review only)

---

```yaml
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion-v2
ws: WS-SOM
session: S278
```

# SOM Б1: Close Table → Завершённые + Rate-Limit Single-Mutation Audit

Reference: `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md` § SOM-BUG-S270-02.
RELEASE source: `260414-02 StaffOrdersMobile RELEASE.jsx` (4538 lines).
Helper: `menuapp-code-review/components/sessionHelpers.js` (FUNCTION 8 closeSession, lines 155-171).

---

## Fix 1 — SOM-BUG-S270-02 (P1) [MUST-FIX]: После «Закрыть стол» карточка не переходит в таб «Завершённые»

### Сейчас (текущее поведение)

Официант открывает стол → все условия выполнены (все блюда выданы + счёт оплачен) → нажимает «Закрыть стол». В БД: `TableSession.status='closed'`, все orders `status='closed'` (sessionHelpers.js:158-171). В UI: карточка сворачивается (expandedGroupId=null), но остаётся в табе «Активные» в свёрнутом виде. Кнопка «Закрыть стол» в свёрнутой карточке остаётся активной. Официант нажимает повторно → `closeSession` снова выполняется (idempotent, но лишние API calls).

### Должно быть (ожидаемое поведение)

После успешного `closeSession`:
1. Скс переходит в таб «Завершённые (N)», из «Активные» исчезает.
2. Таб-счётчики (`tabCounts`) синхронно обновляются: `active--`, `completed++`.
3. Кнопка «Закрыть стол» в скс становится disabled (серый стиль) ИЛИ не рендерится вовсе, если стол уже закрыт.
4. Real-time refetch через `refetchOrders()` в `confirmCloseTable` (line 4151) — intact.

Ref: BUGS.md § SOM-BUG-S270-02, UX-spec S225 §Завершение стола.

### НЕ должно быть (анти-паттерны)

- NO изменения `closeSession` в sessionHelpers.js (scope Fix 1 — только staffordersmobile.jsx).
- NO добавления новых entity полей, новых API routes, новой B44 schema.
- NO изменения `closeDisabledReason` исходных условий (dishes served + bill paid).
- NO изменения `activeTab` default ('active') — открытие страницы без выбора таба работает как раньше.
- NO изменения real-time subscription / polling интервалов.
- NO изменения в FROZEN UX layout (identity block, smart chips, ownership filter bar).

### Файл и локация — 2 места в staffordersmobile.jsx

**Change A — `filteredGroups` (line 3829-3847):** дополнить `hasActiveOrder` check чтобы исключать `status === 'closed'`.

```js
// BEFORE (line 3833-3836)
const hasActiveOrder = group.orders.some(o => {
  const config = getStatusConfig(o);
  return !config.isFinishStage && o.status !== 'cancelled';
});

// AFTER
const hasActiveOrder = group.orders.some(o => {
  const config = getStatusConfig(o);
  return !config.isFinishStage
    && o.status !== 'cancelled'
    && o.status !== 'closed';
});
```

**Apply same change in `tabCounts` useMemo (line 3850-3866) `hasActiveOrder` — строка 3855-3858**, чтобы счётчики совпадали с фильтром.

**Change B — Close-table button guard (lines 767, 1382, 2381):** добавить check `isTableClosed` и применить к `disabled`.

```js
// Near useMemo block (around line 2150, before handleCloseTableClick):
const isTableClosed = useMemo(() => {
  if (group.type !== 'table') return false;
  // group.orders all closed → group effectively closed
  const hasAnyOpen = group.orders.some(o =>
    o.status !== 'closed' && o.status !== 'cancelled'
  );
  return !hasAnyOpen && group.orders.length > 0;
}, [group.orders, group.type]);
```

Then update **all three buttons** (lines 767, 1382, 2381 — все вхождения `onClick={handleCloseTableClick} disabled={!!closeDisabledReason}`):

```jsx
// BEFORE
<button type="button" onClick={handleCloseTableClick}
        disabled={!!closeDisabledReason}
        className={`... ${closeDisabledReason ? "bg-slate-50 text-slate-400 ..." : "bg-red-50 text-red-600 ..."}`}>
  {HALL_UI_TEXT.closeTable}
</button>

// AFTER
<button type="button" onClick={handleCloseTableClick}
        disabled={!!closeDisabledReason || isTableClosed}
        className={`... ${(closeDisabledReason || isTableClosed) ? "bg-slate-50 text-slate-400 ..." : "bg-red-50 text-red-600 ..."}`}>
  {HALL_UI_TEXT.closeTable}
</button>
```

Three button blocks use the same JSX pattern:
- **line 767** — expanded card view (main flow)
- **line 1382** — collapsed card view (скс) inside TableCard branch
- **line 2381** — expanded card internal «Закрыть стол» block (inside `onCloseTable && group.orders.length > 0` conditional)

Apply the same `disabled={!!closeDisabledReason || isTableClosed}` + className change to all three.

**Scope of `isTableClosed` useMemo:** определить внутри того же компонента, где доступен `group.orders` (это тот же scope где `advanceMutation`, `handleCloseTableClick` line 2161). Если кнопки на 767 и 1382/2381 находятся в разных компонентах — определить `isTableClosed` в каждом scope отдельно (duplicate useMemo OK, scope lock важнее DRY).

### Уже пробовали

- S271: B44-2 применён (Table.status added). Но closeSession всё ещё только TableSession+Order (sessionHelpers.js unchanged). Фикс на уровне фильтра (а не schema) — проще и не трогает shared helper.
- S272: SOM-BUG-S270-01 rate-limit fix (batch fan-out). Отдельный bug, fixed, скс reorg не затронут.

### Grep verification (обязательно перед commit)

```bash
grep -n "hasActiveOrder" staffordersmobile.jsx
# expected: 2 hits — в filteredGroups (~3833) и в tabCounts (~3855). Оба должны содержать `o.status !== 'closed'`.

grep -n "o.status !== 'closed'" staffordersmobile.jsx
# expected: ≥3 hits (два новых в hasActiveOrder + один старый в hasServedButNotClosed).

grep -n "disabled={!!closeDisabledReason" staffordersmobile.jsx
# expected: 0 hits after fix — все 3 вхождения (767, 1382, 2381) должны измениться на `|| isTableClosed`.

grep -n "isTableClosed" staffordersmobile.jsx
# expected: ≥7 hits (1-2 useMemo definitions + 3 usages in disabled + 3 usages in className).
```

### Проверка (мини тест-кейс для Fix 1)

1. Открыть SOM с одним активным столом (1 блюдо выдано, счёт оплачен). Нажать «Закрыть стол» → подтвердить в диалоге. Скс должен через ≤1 sec исчезнуть из «Активные», появиться в «Завершённые (1)».
2. Перейти в таб «Завершённые» → скс виден. Развернуть её (если allowed) → кнопка «Закрыть стол» disabled (серый фон, cursor-not-allowed).
3. Regression: открытый стол с незавершёнными блюдами → кнопка «Закрыть стол» disabled по `closeDisabledReason` (как раньше).
4. Regression: открытие SOM по умолчанию — `activeTab='active'`, виден список активных столов. Табов-счётчики правильные.
5. Regression: real-time — закрыть стол в одном планшете → на втором планшете стол исчезает из «Активные» в течение polling interval (~5с).

---

## Fix 2 — Rate-Limit Single-Mutation Audit (P2) [DIAGNOSTIC ONLY, NO CODE CHANGES]

### Цель

Составить отчёт: все места в SOM (staffordersmobile.jsx + sessionHelpers.js), где единичная мутация (Order/ServiceRequest/TableSession) вызывается вне `__batch` флага или вне `runBatchSequential` — потенциальный источник rate-limit 429 при высокой нагрузке (polling + refetch cascade).

**NO code edits.** Output — новая секция в `BUGS_MASTER.md`.

### Метод аудита (для auditor — CC и Codex)

1. Grep all direct calls to entity mutations:
   ```bash
   grep -n "base44\.entities\.Order\.update\|base44\.entities\.ServiceRequest\.update\|base44\.entities\.TableSession\.update" \
     menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
     menuapp-code-review/components/sessionHelpers.js
   ```
2. Для каждого вхождения определить:
   - **Call site** (function + line range).
   - **Guard:** есть ли `__batch: true` во vars? Или внутри `runBatchSequential`? Или внутри `Promise.all`?
   - **Refetch/invalidate**: сразу после — `refetchOrders()`, `queryClient.invalidateQueries(...)`, `await queryClient.cancelQueries`?
3. Grep `refetchOrders\(\)|refetchRequests\(\)|invalidateQueries\(` — для каждого определить, вызывается ли после batch-операции или внутри одиночной мутации.
4. Grep `useQuery.*refetchInterval|refetchInterval:` — найти polling sources (ожидается: `orders` polling, `serviceRequests` polling). Интервал?

### Структура отчёта — append to `BUGS_MASTER.md`

Use this exact markdown skeleton:

```markdown
## SOM Rate-Limit Single-Mutation Audit (S278 Б1)

**Date:** 2026-04-15
**Scope:** `pages/StaffOrdersMobile/staffordersmobile.jsx` + `components/sessionHelpers.js`
**Related:** SOM-BUG-S270-01 (Fixed S272, batch path); SOM-BUG-S270-02 (Fix 1 Б1).

### Summary

- Total mutation call-sites audited: N
- Covered by `__batch: true` / `runBatchSequential`: M
- **Unguarded (potential rate-limit source): K**
- Polling intervals found: …

### Findings

#### Finding 1 — [Title, e.g. "closeSession Promise.all order close"]
- **Location:** `components/sessionHelpers.js:166-170` (function `closeSession`)
- **Call site:** `sessionOrders.filter(...).map(o => base44.entities.Order.update(o.id, { status: 'closed' }))` внутри `Promise.all`
- **Guard status:** ❌ No `__batch`, no delay — concurrent fan-out
- **Risk:** P0 / P1 / P2 — обосновать по числу блюд в типовом столе
- **Cascade check:** после closeSession вызывается `refetchOrders()` (staffordersmobile.jsx:4151) → burst refetch сразу после burst update
- **Proposed fix (NOT applied in this task):** заменить Promise.all на sequential loop с delay 120ms, OR добавить param `{batch:true}` в closeSession и использовать existing runBatchSequential из staffordersmobile.jsx (выделить в shared util)
- **Estimated LOC:** 8-15

#### Finding 2 — …
(same structure)

### Recommendations (prioritized)

1. [P0/P1/P2] — краткое описание + estimated LOC + отдельная задача (Б1-addon? BACKLOG?)
2. …

### Non-findings (verified safe)

- `handleSingleAction` (line 2002) — delegates to `handleOrdersAction` with `[order]` → уже проходит через runBatchSequential + `__batch:true` + invalidate-once. ✅
- `updateRequestMutation` (line 3550-3551) — `onSuccess` skips invalidate when `vars?.__batch`. ✅
- `handleCloseAllOrders` (line 4158+) — uses `runBatchSequential`. ✅
- …

### Polling sources

- `orders` useQuery: refetchInterval = X ms (source: line Y)
- `serviceRequests` useQuery: refetchInterval = X ms (source: line Y)

### Source files

- `menuapp-code-review/pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (4538 lines, grep queries above)
- `menuapp-code-review/components/sessionHelpers.js` (199 lines, FUNCTION 8)
```

### НЕ должно быть (Fix 2 анти-паттерны)

- NO code edits in `.jsx` / `.js`. This task writes a `.md` report only.
- NO changing BUGS.md (Cowork maintains it separately).
- NO creating new BACKLOG entries — list recommendations at end of report; Cowork will triage.
- NO speculative findings (e.g. "possibly X" without grep evidence). Every finding must cite a grep match with line number.
- NO restructuring existing BUGS_MASTER.md sections — append new section at end of file (or after the most recent S278 section if one exists).

### Grep verification (обязательно перед commit)

```bash
# 1. Mutation call-sites directly (not via React Query mutation hook) — should be enumerated in the report
grep -nE "base44\.entities\.(Order|ServiceRequest|TableSession)\.update" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
  menuapp-code-review/components/sessionHelpers.js

# 2. __batch flag usage — already-guarded paths
grep -nE "__batch\s*:|vars\?\.__batch" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 3. runBatchSequential usage — already-sequential paths
grep -n "runBatchSequential" menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 4. Polling sources
grep -nE "refetchInterval|useQuery\(" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx

# 5. Refetch/invalidate call-sites
grep -nE "refetchOrders\(\)|refetchRequests\(\)|invalidateQueries\(" \
  menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx \
  menuapp-code-review/components/sessionHelpers.js
```

### Проверка (Fix 2)

- Report записан в `BUGS_MASTER.md` как new section после последней S278 entry (или в конец если секций S278 нет).
- Все findings имеют `Location: file:line_range`, `Guard status`, `Risk`, `Proposed fix`, `Estimated LOC`.
- Все call-sites из grep #1 либо в Findings (unguarded), либо в Non-findings (guarded).
- Recommendations ранжированы по приоритету, для каждой указан estimated LOC.
- NO code edits — `git diff` в `.jsx`/`.js` = пусто.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

### Fix 1:
- Только 2 useMemo (`filteredGroups`, `tabCounts`) + useMemo `isTableClosed` + 2 button disabled/className обновления в `staffordersmobile.jsx`.
- `activeOrders` filter (line 3539-3550), `advanceMutation`, `updateRequestMutation` — НЕ ТРОГАТЬ.
- Single-action buttons, undo-toast, batch buttons — НЕ ТРОГАТЬ.
- `closeSession` в `sessionHelpers.js` — НЕ ТРОГАТЬ (scope Fix 2 audit, не Fix).
- Header redesign, drawer, ownership filter — НЕ ТРОГАТЬ.
- CartView / PublicMenu / OrdersList / ClientHome / Profile — НЕ ТРОГАТЬ.
- i18n строки `HALL_UI_TEXT.closeTable`, `HALL_UI_TEXT.acceptAll`, etc. — НЕ ТРОГАТЬ.

### Fix 2:
- Edits ONLY to `BUGS_MASTER.md` (append one new section).
- ZERO edits to `.jsx`, `.js`, `.md` (кроме BUGS_MASTER.md).
- Если auditor нашёл тривиальный (≤20 LOC) фикс → зафиксировать в `Proposed fix (NOT applied in this task)` поле Finding. НЕ применять в этой КС. Cowork создаст Б1-addon ПССК в той же сессии если Arman подтвердит.

## FROZEN UX (НЕ менять) — locked S225 / GPT S250

- Collapsed card identity block layout (78×54px, urgency colors, badge positions)
- Smart chips on collapsed card
- Ownership filter bar (★ Мои / ☆ Своб / Все)
- Urgency 3 levels (calm/warning/danger)
- Button labels, colors, touch targets min-h 44px
- Tab labels «Активные» / «Завершённые», counter format

## CONTEXT FILES (read before implementing)

- `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md` § Active (SOM-BUG-S270-02 reproduction)
- `menuapp-code-review/pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (source of truth)
- `menuapp-code-review/components/sessionHelpers.js` (FUNCTION 8 closeSession)
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` §Завершение стола
- `KNOWLEDGE_BASE_VSC.md` — KB-142 (grep "ONLY in X"), KB-149 (dead-code removal), KB-150 (WinError 206)
- `BUGS_MASTER.md` — target file для Fix 2 report

## Implementation Notes

- Fix 1: single file edit (`pages/StaffOrdersMobile/staffordersmobile.jsx`). wc-l до/после должны отличаться на ≤15 строк (1 useMemo + 2 button updates).
- Fix 2: single file append (`BUGS_MASTER.md`). Существующий контент файла не модифицировать.
- Commit: `git add pages/StaffOrdersMobile/staffordersmobile.jsx BUGS_MASTER.md && git commit -m "SOM Б1: close-table → Завершённые fix (SOM-BUG-S270-02) + rate-limit single-mutation audit"`

## MOBILE-FIRST CHECK (MANDATORY before commit for Fix 1)

- [ ] Touch targets кнопки «Закрыть стол» ≥ 44×44px (unchanged)
- [ ] Disabled state visually clear (серый фон, cursor-not-allowed)
- [ ] 375px width: скс layout не ломается при добавлении `isTableClosed` flag
- [ ] Таб-счётчики на 320px экране не переполняют контейнер

## Regression Check (MANDATORY after implementation)

- [ ] Fix 1: Закрыть стол → скс переходит в «Завершённые» в течение 1 sec
- [ ] Fix 1: Кнопка «Закрыть стол» disabled после закрытия (не кликабельна)
- [ ] Fix 1: Открытый стол с незавершёнными блюдами — кнопка «Закрыть стол» disabled по `closeDisabledReason` (original logic preserved)
- [ ] Fix 1: Таб «Активные» по умолчанию показывает стол с активными заказами
- [ ] Fix 1: `activeOrders` filter (line 3539-3550) — unchanged behavior (order cards внутри скс не пропадают)
- [ ] Fix 1: Undo toast после «Выдать все» — по-прежнему работает
- [ ] Fix 1: Real-time polling refetch после close — скс исчезает из «Активные» в других клиентах
- [ ] Fix 2: `git diff` показывает изменения ТОЛЬКО в `BUGS_MASTER.md`
- [ ] Fix 2: Отчёт в BUGS_MASTER.md содержит ≥1 Finding ИЛИ явное утверждение "no unguarded mutations found" с grep evidence
- [ ] Fix 2: Все Findings имеют Location / Guard status / Risk / Proposed fix / LOC

---

## END OF DRAFT КС PROMPT
=== END ===
