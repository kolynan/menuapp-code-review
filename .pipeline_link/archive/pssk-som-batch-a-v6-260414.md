---
page: StaffOrdersMobile
agent: cc+codex
chain_template: discussion-cc-codex
ws: WS-SOM
budget: 10
session: S267
---

# ПССК v6: Ревью КС-промпта — SOM Batch A Android Quick-Fix (5 патчей vs v5)

Это **шестой раунд ПССК** по SOM Batch A. История:
- v2 (042356): Fix1 3.5/Fix2 3/Fix3 5/Fix4 3.5 — BLOCKER Fix2 closeSession scope
- v3 (045840): Fix1 4.5/Fix2 3/Fix3 5/Fix4 4 — BLOCKER Fix2 Change 3 `group.requests`
- v3p (052254): CC Fix1 4.5/Fix2 3.5/Fix3 5/Fix4 4; Codex 1/5 — claim «dead code», было ошибкой Claude
- v4 (055856): CC Fix1 2.5/Fix2 4.5/Fix3 5/Fix4 1; Codex ~2/5 — dead code подтверждён, Fix4 удалён
- v5 (062342): Fix1 4/Fix2 4.5/Fix3 2❌ — BLOCKER: line numbers Fix3 wrong + line count 4426≠4524 everywhere

**v6 патчи vs v5:**
1. `4426` → `4524` везде (wc -l verify: реальный размер файла)
2. Fix3: `2249` → `2250` (★ div), `2257` → `2260` (☆ div)
3. Fix3: SCOPE LOCK 🔒 → `~line 2255` (не диапазон)
4. Fix1 helper placement: убран `getLinkId` (он на 528, до блок-комментария); только `getAssignee` (~line 786)
5. grep block-comment pattern исправлен: `^/\*$\|^/\* function\|^\*/$` (матчит line 1148 с содержимым)

## 🚨 Root cause prior rounds (verified 2026-04-14)

В `staffordersmobile.jsx` (**4524 строк**) **два block comment блока**:
```bash
grep -n "^/\*$\|^/\* function\|^\*/$" staffordersmobile.jsx
# 546:/*
# 785:*/
# 1148:/* function RateLimitScreen({ onRetry }) {
# 1414:*/
```

Target lines v2-v4 для B1 (670-708), B2 (761-769), B3 (1288-1314), B4 (1374-1398) — **ВНУТРИ этих block comments**. Мёртвый код.

**Live render primary path:** lines 2300-2343. Использует `renderHallRows` + `inProgressSections.map`.

**Fix4 — удалён** (no-op: live B6 уже без wrapper).

## Задача ревью

Please review the updated draft КС prompt below. Identify:
1. Ambiguous Fix descriptions
2. Wrong or missing line numbers (file: `staffordersmobile.jsx`, **4524 строк**; НЕ RELEASE варианты)
3. Missing edge cases or anti-patterns
4. Scope creep risks
5. **Block-comment verification:** все цитируемые target lines (2250, 2260, 2331, 2333, 2335, 2337, 3540, 3789-3819) должны быть ВНЕ block comments. Проверить:
   ```bash
   grep -n "^/\*$\|^/\* function\|^\*/$" staffordersmobile.jsx
   # ожидается: 546 /*, 785 */, 1148 /* function..., 1414 */
   # ни одна из target lines не должна лежать в [547-784] или [1149-1413]
   ```
6. **Risks specific to Fix2** — modifying `closeSession()` shared helper. Verify PartnerTables caller (`260301-00 partnertables RELEASE.js` line 61 import, line 1981 call) remains safe.
7. **Fix1 grep coverage** — confirm 4 B6 targets (2331/2333/2335/2337) catch all live guest-count sites. Проверить grep pattern `(newOrders|readyOrders|servedOrders|section\.orders)\.length.*pluralRu` на только-live зоне.

Rate each Fix: ✅ Clear / ⚠️ Needs clarification / ❌ Rewrite needed.

**Target:** все 3 Fix ≥4/5 от CC И Codex. Любой ❌ блокирует.

### ⚠️ ВАЖНО — file disambiguation

Target file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (**4524 строк**).

**НЕ открывать:**
- `260306-05 StaffOrdersMobile RELEASE.jsx` (4015 строк) — старая версия, line numbers не совпадают
- `260405-00 / 260407-00 / 260408-00 / 260413-00 StaffOrdersMobile RELEASE.jsx` — архивные RELEASE

Все line numbers ниже привязаны ТОЛЬКО к `staffordersmobile.jsx`.

## Context decisions carried over

**Decision A-3 (Fix2):** Modify `closeSession()` в `components/sessionHelpers.js` — bulk-update session orders → `status: 'closed'`. SOM фильтрует `o.status !== 'closed'`.

**closeSession callers (verified grep 2026-04-14):**
- `pages/StaffOrdersMobile/staffordersmobile.jsx` — multiple
- `pages/PartnerTables/260301-00 partnertables RELEASE.js`:
  - Line 61 — `import { closeSession } from "@/components/sessionHelpers"`
  - Line 1981 — `await closeSession(id)` в `handleCloseSession` (1972-1991)

Bulk-close на admin table-close = correct behavior.

---

## DRAFT КС PROMPT BELOW (do not implement — review only)

---

```yaml
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
also_edits: components/sessionHelpers.js
budget: 10
agent: cc+codex
chain_template: consensus-with-discussion-v2
session: S267
```

# SOM Batch A v3: Android Quick-Fix (#293 + #296 + #297)

Reference: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` v2.7.
Scope: 3 fixes (Fix1 + Fix2 + Fix3). **#271 Fix4 удалён — live B6 render уже без wrapper.**

Source file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (**4524 строк**).
Also edits: `components/sessionHelpers.js` (Fix2 only).

**⚠️ File disambiguation:** НЕ ОТКРЫВАТЬ файлы с именем `*RELEASE.jsx` (архивные). Только `staffordersmobile.jsx`.

**⚠️ Block comments:** файл содержит два `/* */` блока — 546-785 и 1148-1414. НЕ цитировать target lines из этих диапазонов. Все Fix ниже работают ТОЛЬКО с live кодом вне этих блоков.

---

## ⚠️ APPLICATION ORDER

1. **Fix1** — helper + 4 live targets (B6 lines).
2. **Fix2** — closeSession + filter + useMemo.
3. **Fix3** — minimal stopPropagation (2 места).

Fixes независимы; порядок выше снижает риск merge-конфликтов в useMemo зоне.

---

## Fix 1 — SOM-S256-02 / #293 (P2) [MUST-FIX]: Guest counter shows dish count

### Сейчас
Section headers (Новые / в prog-sections / Готово / Выдано) показывают `N ГОСТЕЙ · N БЛЮД`. Guest count = number of orders, not unique guests. Пример: 1 guest с 2 dishes → "2 ГОСТЯ · 2 БЛЮДА".

### Должно быть
Guest count = unique `guest_id` values. Helper `uniqueGuests(orders)` — REQUIRED.
Ref: UX decision #19.

### Helper — REQUIRED at component top

Добавить ВБЛИЗИ других helpers — рядом с `getAssignee` (~line 786, после block comment `*/` at 785):

```javascript
// SOM-S256-02 (#293): Counts unique guests across orders.
// null/undefined guest collapses into one bucket via Set semantics.
const uniqueGuests = (orders) => new Set(orders.map(o => getLinkId(o.guest))).size;
```

Helper **MUST be used** at all 4 live sites (не inline `new Set(...)`).

### НЕ должно быть
- Do NOT count orders as guests (`.length` в guest slot).
- Do NOT change `countRows(...)` calls — dish count корректен.
- Do NOT inline `new Set(...)`.
- **Do NOT edit dead code** inside block comments 546-785 или 1148-1414 (там тоже есть `.length`-паттерны, но они неактивны).

### Файл и локация — 4 LIVE places (все в primary hall render)

**Critical:** verify before edit:
```bash
grep -n "^/\*$\|^/\* function\|^\*/$" staffordersmobile.jsx
# должен показать: 546 /*, 785 */, 1148 /* function..., 1414 */
```

Все 4 target lines **ВЫШЕ line 2718**.

**Line 2331 — new section header (`${HALL_UI_TEXT.new}`):**

BEFORE (фрагмент длинной JSX-строки):
```
{`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, "гость", "гостя", "гостей")} · ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), "блюдо", "блюда", "блюд")})`}
```

AFTER — заменить **первые два** `newOrders.length` на `uniqueGuests(newOrders)`; `countRows(newRows, newOrders.length)` **НЕ ТРОГАТЬ**:
```
{`${HALL_UI_TEXT.new} (${uniqueGuests(newOrders)} ${pluralRu(uniqueGuests(newOrders), "гость", "гостя", "гостей")} · ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), "блюдо", "блюда", "блюд")})`}
```

**Line 2333 — inProgressSections.map per-section header:**

BEFORE:
```
{`· ${section.orders.length} ${pluralRu(section.orders.length, "гость", "гостя", "гостей")} · ${section.rowCount} ${pluralRu(section.rowCount, "блюдо", "блюда", "блюд")}`}
```

AFTER — заменить оба `section.orders.length` на `uniqueGuests(section.orders)`:
```
{`· ${uniqueGuests(section.orders)} ${pluralRu(uniqueGuests(section.orders), "гость", "гостя", "гостей")} · ${section.rowCount} ${pluralRu(section.rowCount, "блюдо", "блюда", "блюд")}`}
```

**Line 2335 — ready section header:**

BEFORE:
```
{`${HALL_UI_TEXT.ready} (${readyOrders.length} ${pluralRu(readyOrders.length, "гость", "гостя", "гостей")} · ${countRows(readyRows, readyOrders.length)} ${pluralRu(countRows(readyRows, readyOrders.length), "блюдо", "блюда", "блюд")})`}
```

AFTER — первые два `readyOrders.length` → `uniqueGuests(readyOrders)`. Оставить `countRows(readyRows, readyOrders.length)` без изменений.

**Line 2337 — served section header:**

BEFORE:
```
{`${HALL_UI_TEXT.served} (${servedOrders.length} ${pluralRu(servedOrders.length, "гость", "гостя", "гостей")} · ${countRows(servedRows, servedOrders.length)} ${pluralRu(countRows(servedRows, servedOrders.length), "блюдо", "блюда", "блюд")})`}
```

AFTER — первые два `servedOrders.length` → `uniqueGuests(servedOrders)`. Оставить `countRows(...)` без изменений.

### Grep verification (обязательно перед commit)

```bash
# Helper exists exactly once
grep -n "const uniqueGuests" staffordersmobile.jsx   # expect: 1 hit

# All guest-slot pluralRu calls use uniqueGuests (не .length) в live зоне (2300-2340):
sed -n '2300,2340p' staffordersmobile.jsx | grep -oE "(newOrders|readyOrders|servedOrders|section\.orders)\.length.*pluralRu.*гост"
# expect: 0 совпадений

# Убедиться что countRows не тронут
grep -nc "countRows(newRows, newOrders.length)" staffordersmobile.jsx  # expect: ≥ 1
grep -nc "countRows(readyRows, readyOrders.length)" staffordersmobile.jsx  # expect: ≥ 1
grep -nc "countRows(servedRows, servedOrders.length)" staffordersmobile.jsx  # expect: ≥ 1
```

### Проверка (мини тест-кейс)
1. 1 guest создаёт 2 dishes (NEW stage). Both same guest.
2. Header section Новые: "1 ГОСТЬ · 2 БЛЮДА" (не "2 ГОСТЯ · 2 БЛЮДА").
3. Перевести оба в In-progress → header in-progress section: "1 ГОСТЬ · 2 БЛЮДА".
4. Перевести в Ready → "1 ГОСТЬ · 2 БЛЮДА".
5. Перевести в Served → "1 ГОСТЬ · 2 БЛЮДА".

---

## Fix 2 — SOM-S256-04 / #296 (P1) [MUST-FIX REWRITE]: Table card disappears after "Выдать все (N)"

### Root cause (verified by Claude 2026-04-14)
При "Выдать все (N)" все orders переходят в stage с `internal_code === 'finish'`, status `'served'`. Фильтр `activeOrders` на line **3539-3541** исключает `served`:
```javascript
if (stage.internal_code === 'finish') {
  return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
}
```
→ orders исчезают из `visibleOrders` → `orderGroups` не создаёт группу → карточка стола пропадает.

### closeSession callers — verified не «ONLY in SOM»

Grep 2026-04-14:
- `pages/StaffOrdersMobile/staffordersmobile.jsx` — multiple call sites
- `pages/PartnerTables/260301-00 partnertables RELEASE.js`:
  - Line 61 — `import { closeSession } from "@/components/sessionHelpers"`
  - Line 1981 — `await closeSession(id)` в `handleCloseSession` (1972-1991)

PartnerTables semantics: admin clicks "Close table" → confirm → `closeSession(id)` → toast → reload. Bulk-close = CORRECT.

### Fix — 3 изменения

**Change 1 — `components/sessionHelpers.js`:**

```javascript
export async function closeSession(sessionId) {
  // UNCHANGED — existing TableSession close
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });

  // NEW (S267) — Bulk-close all orders belonging to this session.
  // Callers (verified 2026-04-14):
  //   - pages/StaffOrdersMobile/staffordersmobile.jsx
  //   - pages/PartnerTables/260301-00 partnertables RELEASE.js
  // Cancelled orders skipped (preserve audit trail).
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
}
```

**Do NOT:** change function signature, remove `closed_at`, restructure TableSession update, add try/catch.

**Change 2 — `staffordersmobile.jsx` line 3540** (внутри `activeOrders = useMemo`, строки 3520-3547):

```javascript
// BEFORE (line 3540)
if (stage.internal_code === 'finish') {
  return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
}
// AFTER
if (stage.internal_code === 'finish') {
  return o.status !== 'closed' && o.status !== 'cancelled';
}
```

Результат: `served` остаётся в `visibleOrders` → `orderGroups` держит карточку в Active. `closed` orders (после closeSession) уходят.

**Change 3 — `filteredGroups` (lines 3789-3802) + `tabCounts` (3804-3819):**

⚠️ Существующий код filteredGroups (verified):
```javascript
const filteredGroups = useMemo(() => {             // line 3789
  if (!orderGroups) return [];                      // line 3790
                                                    // line 3791
  return orderGroups.filter(group => {              // line 3792
    const hasActiveOrder = group.orders.some(o => { // line 3793
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);

    return activeTab === 'active' ? (hasActiveOrder || hasActiveRequest) : (!hasActiveOrder && !hasActiveRequest);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);   // line 3802
```

⚠️ Target: **замена inner filter callback body (строки 3792-3801)**. Не трогать useMemo wrapper (3789, 3790, 3802). Dep array на 3802 не менять.

**Replace INSIDE useMemo — filter callback:**
```javascript
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    // KEEP AS-IS — activeRequests external array, group has NO .requests property
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    // NEW (S267): served-but-not-closed — keep in Active tab until closeSession
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
```

Dep array (3802) **не трогать**: `getStatusConfig` уже покрывает inputs для `hasServedButNotClosed`.

**tabCounts (3804-3819) — ADD `hasServedButNotClosed`:**

⚠️ Существующий код:
```javascript
const tabCounts = useMemo(() => {
  if (!orderGroups) return { active: 0, completed: 0 };
  let active = 0, completed = 0;
  orderGroups.forEach(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    if (hasActiveOrder || hasActiveRequest) active++; else completed++;
  });
  return { active, completed };
}, [orderGroups, getStatusConfig, activeRequests]);
```

⚠️ Match existing style (`forEach` + mutable, NOT reduce). Add `hasServedButNotClosed` — ничего больше не менять (keys, dep array).

```javascript
// Внутри existing forEach, добавить:
const hasServedButNotClosed = group.orders.some(o => {
  const config = getStatusConfig(o);
  return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
});
// Изменить if:
// BEFORE: if (hasActiveOrder || hasActiveRequest) active++; else completed++;
// AFTER:  if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
```

Dep array (`[orderGroups, getStatusConfig, activeRequests]`) не трогать.

### Ref — UX decisions
- #16 — "Закрыть стол: все блюда выданы + счёт оплачен"
- ALL_SERVED visual: green border, "ОБСЛУЖЕНО" badge, enabled "Закрыть стол"

### НЕ должно быть
- Do NOT load TableSession entity в SOM.
- Do NOT touch `activeOrders` filter beyond removing `'served'`.
- Do NOT modify `closeSession` beyond bulk-close addition.
- Do NOT change PublicMenu/CartView/OrdersList.
- Do NOT break PartnerTables — `handleCloseSession` (1972-1991) должен работать идентично.
- **Do NOT remove useMemo wrappers** (3789, 3804). Replace только inner bodies.

### Проверка
1. **SOM:** Открыть стол, 2 NEW dishes. Принять → "Выдать все" → all `served`. Карточка **остаётся в Active** с green "ОБСЛУЖЕНО". Нажать "Закрыть стол" → orders `closed` → карточка → Completed.
2. **PartnerTables regression:** Admin "Close table" on session с 2 served orders → confirm → orders `closed`, sessions refetch, toast.
3. **CartView/OrdersList:** render orders с `served`/`closed` без errors.

---

## Fix 3 — SOM-S256-05 / #297 (P2) [MUST-FIX]: Tap on ★ ownership badge expands card

### Сейчас
★ (Мой стол) и ☆ (Свободный) — plain `<div>` без `stopPropagation`. Parent `onToggleExpand` срабатывает.

### Должно быть
Add `onClick={(e) => e.stopPropagation()}` to both `<div>`s. 🔒 badge (другой стол) уже `<button>` с stopPropagation — не трогать.

### Файл и локация

**Line 2250 — ★ badge div** (inside `{ownershipState === "mine" && (...)}`; line 2249 = JSX condition guard, НЕ div):

BEFORE:
```jsx
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label={"Мой стол"}>
  {'★'}
</div>
```
AFTER:
```jsx
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label={"Мой стол"} onClick={(e) => e.stopPropagation()}>
  {'★'}
</div>
```

**Line 2260 — ☆ badge div** (inside `{ownershipState === "free" && (...)}`; line 2257 = `</button>` closing 🔒, НЕ div):

BEFORE:
```jsx
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label={"Свободный стол"}>
  {'☆'}
</div>
```
AFTER:
```jsx
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label={"Свободный стол"} onClick={(e) => e.stopPropagation()}>
  {'☆'}
</div>
```

### НЕ должно быть
- Do NOT touch 🔒 `<button>` at ~line 2255 — уже имеет stopPropagation.
- Do NOT изменять style / position / aria-label.
- Do NOT удалять `onClick` parent `onToggleExpand`.

### Проверка
1. "Все" filter, стол с ★ (свой).
2. Тап на ★ → карточка НЕ expand/collapse.
3. Тап на area рядом → expand работает.
4. Repeat с ☆ (free).
5. 🔒 tap (другой стол) → показывает hint (как было) — не сломано.

---

## ⛔ SCOPE LOCK

- Менять ТОЛЬКО Fix 1-3 + `closeSession`.
- Fix4 (#271) — ОТМЕНЁН, out of scope.
- Header redesign (#294, #295) — out of scope.
- Drawer, settings, service requests — НЕ ТРОГАТЬ.
- Legacy branch (line 2346) — НЕ ТРОГАТЬ.
- Dead code 546-785, 1148-1414 — **НЕ РЕДАКТИРОВАТЬ** (block comments).
- PublicMenu/CartView/OrdersList — НЕ ТРОГАТЬ.
- PartnerTables page — НЕ ТРОГАТЬ (только closeSession helper).

## FROZEN UX (locked GPT S250)
- Collapsed card identity block (78×54px, urgency colors, badges)
- Smart chips
- Ownership filter bar — locked R3
- Urgency 3 levels — locked R6

## CONTEXT FILES
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — **mockup wins** при конфликте.
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — UX spec v2.7.

## Implementation Notes

- File 1: `pages/StaffOrdersMobile/staffordersmobile.jsx` (**4524 строк**) — Fix 1, 2 (partial), 3
- File 2: `components/sessionHelpers.js` — Fix 2 only
- i18n: `t()` from `useI18n()` — no new user-facing strings
- Apply order: Fix1 → Fix2 → Fix3
- Commit: `git add staffordersmobile.jsx sessionHelpers.js && git commit -m "SOM Batch A v3: #293 guest count + #296 served visibility + #297 star badge"`

## MOBILE-FIRST CHECK (MANDATORY before commit)

- [ ] Touch targets >= 44x44px (★ и ☆ sizes unchanged)
- [ ] Section headers на 375px читаемы
- [ ] Guest count format `N гостей · N блюд` помещается на строке

## Regression Check (MANDATORY after implementation)

- [ ] Collapsed table card: correct status chips и urgency colors
- [ ] Tap на area table card header expand/collapse detail
- [ ] Bulk buttons ("Принять все", "Выдать все") работают
- [ ] Ownership filter bar фильтрует корректно
- [ ] "Закрыть стол" SOM: появляется на ALL_SERVED столах, moves card to Completed
- [ ] After closeSession: orders с `status: 'closed'` в base44 entity inspector
- [ ] **PartnerTables admin close:** confirm → orders `closed`, sessions refetch, toast. No regression
- [ ] CartView renders orders с all statuses без errors
- [ ] OrdersList renders orders с all statuses без errors
- [ ] **Patch D (v4):** After "Выдать все (N)" — card **остаётся в Active tab** с green ОБСЛУЖЕНО, не исчезает до закрытия
- [ ] In-progress sections: per-section header показывает `uniqueGuests · rowCount` format (не `.length` в guest slot)

## FROZEN UX grep verification (run before commit)

```bash
grep -n "URGENCY_IDENTITY_STYLE" staffordersmobile.jsx | head -5
grep -n "scsChips\|scsUrgency" staffordersmobile.jsx | head -5
```
Expected: unchanged.

## Block-comment integrity check (MANDATORY before commit)

```bash
grep -n "^/\*$\|^/\* function\|^\*/$" staffordersmobile.jsx
# expected unchanged: 546 /*, 785 */, 1148 /* function RateLimitScreen..., 1414 */
# ни один из этих маркеров не должен сместиться или исчезнуть
```

Если результат отличается — значит Fix случайно затронул dead-code зону, откатить.

---

## END OF DRAFT КС PROMPT
