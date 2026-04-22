---
page: StaffOrdersMobile
agent: cc+codex
chain_template: discussion-cc-codex
ws: WS-SOM
budget: 10
session: S267
---

# ПССК v4: Ревью обновлённого КС-промпта — SOM Batch A Android Quick-Fix

Это **четвёртый раунд ПССК** по SOM Batch A. История:
- ПССК v2 (task-260414-042356): Fix1 3.5⚠️, Fix2 3❌, Fix3 5✅, Fix4 3.5⚠️
- ПССК v3 (task-260414-045840): Fix1 4.5, Fix2 3❌ (group.requests BLOCKER), Fix3 5, Fix4 4
- ПССК v3p (task-260414-052254): CC — Fix1 4.5, Fix2 3.5⚠️, Fix3 5, Fix4 4. Codex — Fix1/2/4 = 1 (ложная премиса «commented-out code»), Fix3 5.

**Цель v4:** получить **≥4/5 от CC И Codex по каждому Fix**. Применены 4 финальных патча (A/B/C/D) после v3p merge-report.

## Что изменилось vs v3p

**Patch A — Fix2 Change 3 (устранение useMemo-ambiguity, найдено CC в v3p):**
- Исходный v3p писал `REPLACE lines 3792-3801 with: const filteredGroups = orderGroups.filter(...)`. Это привело бы к дублированию declaration (существующий `const filteredGroups = useMemo(...)` на 3789 остаётся) и потере useMemo-оптимизации.
- v4: **«Replace the filter callback body INSIDE the existing useMemo (lines 3792-3800)»**. Показан только внутренний filter body без `const filteredGroups = ...`. Target lines изменены на 3792-3800 (exclude 3801 — dep array).
- Добавлено явное замечание: **useMemo dependency array at line 3801 не нуждается в новых deps** — `getStatusConfig` уже покрывает `hasServedButNotClosed` inputs.

**Patch B — Fix4 per-section header format (underspecified, найдено CC в v3p):**
- Добавлены явные BEFORE/AFTER для lines 692 (B1) и 1303 (B3). Currently they show `${section.label} (${section.rowCount})` — без guest count. Fix4 теперь явно владеет этим изменением.
- Для B2/B4 после миграции на `inProgressSections.map` указан точный target header format.

**Patch C — файловое именование (nit):**
- Убрана ссылка на несуществующий `260413-00 StaffOrdersMobile RELEASE.jsx`. Везде используется `staffordersmobile.jsx` (совпадает с `code_file` в YAML).

**Patch D — Regression check (нит):**
- Добавлена строка: "После 'Выдать все (N)': table card остаётся в Active tab с green ОБСЛУЖЕНО badge (не исчезает до closeSession)".

## Задача ревью

Review the updated draft КС prompt below. Identify:
1. Ambiguous Fix descriptions — anything that could be interpreted in 2+ ways
2. Wrong or missing line numbers / grep hints (file: `staffordersmobile.jsx`, 4524 lines)
3. Missing edge cases or anti-patterns
4. Scope creep risks
5. Any fixes that are underspecified or overspecified
6. **Fix2 specific:** verify useMemo wrapper handling (Patch A). Verify `hasActiveRequest` preservation. Verify PartnerTables closeSession caller (lines 61, 1981) remains safe.
7. **Fix4 specific:** verify B1/B3 lines 692/1303 per-section header changes (Patch B). Verify B2/B4 header format post-migration.
8. **Fix1 grep coverage:** confirm grep catches ALL 10 places.

### ⚠️ ВАЖНО для Codex reviewer

Lines 670-708 и 1281-1319 — это **ЖИВОЙ КОД**, не commented-out. В v3p Codex ошибочно определил эти строки как dead code `/* ... */` и дал 1/5 по Fix1/Fix2/Fix4. Перед тем как ставить «Rewrite needed» — прочитай лично строки через:
```
grep -n "newOrders.length\|inProgressOrders.length\|readyOrders.length" staffordersmobile.jsx | head -20
```
и убедись что они активны в JSX (template literals inside `<div>` / `<span>`).

Файл worktree `staffordersmobile.jsx` — единственный источник. Нет `260413-00 RELEASE.jsx`.

Rate each Fix: ✅ Clear / ⚠️ Needs clarification / ❌ Rewrite needed. Target: **all 4 Fix ≥4/5 от CC И Codex**.

## Context decisions carried over (Arman Decisions)

**Decision A-3 (Fix2):** Modify `closeSession()` in `components/sessionHelpers.js` to bulk-update all session orders to `status: 'closed'`. SOM then filters by `o.status !== 'closed'`.

**closeSession callers (verified grep 2026-04-14):**
- `pages/StaffOrdersMobile/staffordersmobile.jsx` — multiple
- `pages/PartnerTables/260301-00 partnertables RELEASE.js` — line 61 (import), line 1981 (call inside `handleCloseSession` lines 1972-1991)

**Semantics verified:** In PartnerTables, `handleCloseSession` is called by admin from table management UI. Bulk-closing orders on admin table-close is correct behavior.

**Decision B-3 (Fix4):** Fix 4 active render branches (B1 677-703, B2 761-769, B3 1288-1314, B4 1374-1398). Legacy branch line 2346 out of scope. Line 2333 (B6) uses correct pattern.

---

## DRAFT КС PROMPT BELOW (do not implement — review only)

---

```yaml
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
also_edits: components/sessionHelpers.js
budget: 14
agent: cc+codex
chain_template: consensus-with-discussion-v2
session: S267
```

# SOM Batch A v2: Android Quick-Fix (#293 + #296 + #297 + #271)

Reference: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` v2.7, `BUGS_MASTER.md` (SOM-S256-02/03/04/05, SOM-S235-03).

Source file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4524 lines).
Also edits: `components/sessionHelpers.js` (Fix2 only).

All line numbers verified against `staffordersmobile.jsx` on 2026-04-14.

---

## ⚠️ APPLICATION ORDER (mandatory sequencing)

Apply fixes in this order:

1. **Fix1 FIRST** — introduces `uniqueGuests(orders)` helper + replaces `.length` with helper call in 10 places (6 in B1+B3, 4 in B6).
2. **Fix4 SECOND** — removes "В РАБОТЕ" wrapper in B1/B2/B3/B4. Each resulting per-section header uses `uniqueGuests(section.orders)` (see Fix4 patches for lines 692, 1303 explicitly).
3. **Fix2** — independent (touches sessionHelpers.js + 3 separate blocks in SOM).
4. **Fix3** — independent (minimal stopPropagation addition).

**Why:** Fix4 deletes lines 680, 1291 (inProgress wrapper headers from Fix1 locations). After Fix4, those two wrapper headers disappear but **per-section headers at lines 692, 1303** (inside `inProgressSections.map`) each use `uniqueGuests(section.orders)` — see Fix4 Patch B below.

---

## Fix 1 — SOM-S256-02 / #293 (P2) [MUST-FIX]: Guest counter shows dish count instead of unique guests

### Сейчас (текущее поведение)
Section headers (НОВЫЕ, В РАБОТЕ, ГОТОВО, etc.) show `N ГОСТЕЙ · N БЛЮД`. Guest count equals number of orders, not unique guests. Example: 1 guest with 2 dishes → "2 ГОСТЯ · 2 БЛЮДА" instead of "1 ГОСТЬ · 2 БЛЮДА".

### Должно быть
Guest count = number of unique `guest_id` values. Use helper `uniqueGuests(orders)` everywhere (REQUIRED).
Ref: UX decision #19.

### Helper — REQUIRED at component top

```javascript
const uniqueGuests = (orders) => new Set(orders.map(o => getLinkId(o.guest))).size;
```

MUST be used at all 10 sites (not inline `new Set(...)`).

### НЕ должно быть
- Do NOT count orders as guests (`.length`).
- Do NOT count `null`/`undefined` guest_id as separate — Set collapses null.
- Do NOT change `countRows(...)` calls or `section.rowCount`.
- Do NOT inline `new Set(...)` — always helper.

### Файл и локация — 10 places in 3 branches (6 in B1+B3, 4 in B6)

**Branch B1 (Hall view primary, ~670-710) — 3 places:**
- **Line 670** — `newOrders.length` в заголовке НОВЫЕ → `uniqueGuests(newOrders)`
- **Line 680** — `inProgressOrders.length` в заголовке В РАБОТЕ. ⚠️ Удаляется в Fix4 вместе с wrapper.
- **Line 708** — `readyOrders.length` в заголовке ГОТОВО → `uniqueGuests(readyOrders)`

**Branch B3 (Hall view secondary, ~1281-1319) — 3 places:**
- **Line 1281** — `newOrders.length` → `uniqueGuests(newOrders)`
- **Line 1291** — `inProgressOrders.length`. ⚠️ Удаляется в Fix4.
- **Line 1319** — `readyOrders.length` → `uniqueGuests(readyOrders)`

**Branch B6 (Hall row-based, inline JSX) — 4 places:**
- **Line 2331** — `newOrders.length` → `uniqueGuests(newOrders)`
- **Line 2333** — `section.orders.length` per-section → `uniqueGuests(section.orders)`. ⚠️ B6 already reference model.
- **Line 2335** — `readyOrders.length` → `uniqueGuests(readyOrders)`
- **Line 2337** — `servedOrders.length` → `uniqueGuests(servedOrders)`

**Pattern — B1/B3 (HALL_UI_TEXT.guests form):**
```javascript
// BEFORE
${newOrders.length} ${pluralRu(newOrders.length, HALL_UI_TEXT.guests + 'ь', ...)}
// AFTER
${uniqueGuests(newOrders)} ${pluralRu(uniqueGuests(newOrders), HALL_UI_TEXT.guests + 'ь', ...)}
```

**Pattern — B6 (hardcoded strings):**
```javascript
// BEFORE
${newOrders.length} ${pluralRu(newOrders.length, 'гость', 'гостя', 'гостей')}
// AFTER
${uniqueGuests(newOrders)} ${pluralRu(uniqueGuests(newOrders), 'гость', 'гостя', 'гостей')}
```

### Grep verification (обязательно)
```bash
grep -n "HALL_UI_TEXT.guests" staffordersmobile.jsx
grep -n "pluralRu.*guests" staffordersmobile.jsx
grep -n "pluralRu.*гост" staffordersmobile.jsx  # B6 hardcoded
grep -n "const uniqueGuests" staffordersmobile.jsx   # expect: 1 hit
grep -nE "(newOrders|readyOrders|servedOrders|inProgressOrders|section\.orders)\.length.*pluralRu" staffordersmobile.jsx
# expect: 0 hits
```

### Проверка
1. 1 guest, 2 dishes. Both NEW. Header: "1 ГОСТЬ · 2 БЛЮДА".
2. В обоих view modes (B1 и B3) + row-based (B6).
3. После Fix4: per-section headers at 692/1303 — каждая со своим `uniqueGuests(section.orders)` (см. Fix4 Patch B).

---

## Fix 2 — SOM-S256-04 / #296 (P1) [MUST-FIX REWRITE]: Table card disappears after "Выдать все (N)"

### Root cause (verified)
При "Выдать все (N)" все orders → `status: 'served'`. Фильтр `activeOrders` (lines 3539-3544) исключает `served`:
```javascript
if (stage.internal_code === 'finish') {
  return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
}
```
→ orders исчезают из `visibleOrders` → карточка пропадает.

### closeSession callers — verified (не «ONLY in SOM»)

Grep 2026-04-14:
- `pages/StaffOrdersMobile/staffordersmobile.jsx` — multiple
- `pages/PartnerTables/260301-00 partnertables RELEASE.js`:
  - Line 61 — `import { closeSession } from "@/components/sessionHelpers"`
  - Line 1981 — `await closeSession(id)` inside `handleCloseSession` (1972-1991)

No other pages call closeSession.

**PartnerTables semantics:** admin clicks "Close table" → confirm → `closeSession(id)` → toast → reload. Bulk-close orders on admin close = CORRECT behavior.

### Fix — 3 изменения

**Change 1 — `components/sessionHelpers.js`:**

- `base44.entities.TableSession.update(sessionId, {...})` — **KEEP AS-IS**
- `status: "closed"` — **KEEP AS-IS**
- `closed_at: new Date().toISOString()` — **KEEP AS-IS**
- bulk-order close block — **NEW**

```javascript
export async function closeSession(sessionId) {
  // UNCHANGED
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });

  // NEW (S267) — Bulk-close all orders.
  // Callers (verified 2026-04-14):
  //   - pages/StaffOrdersMobile/staffordersmobile.jsx
  //   - pages/PartnerTables/260301-00 partnertables RELEASE.js (admin closes table — same semantics)
  // Cancelled orders skipped.
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
}
```

**Do NOT:** change signature, remove `closed_at`, restructure TableSession update, add try/catch.

**Change 2 — `staffordersmobile.jsx` line 3540:**
```javascript
// BEFORE
if (stage.internal_code === 'finish') {
  return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
}
// AFTER
if (stage.internal_code === 'finish') {
  return o.status !== 'closed' && o.status !== 'cancelled';
}
```

**Change 3 — `filteredGroups` + `tabCounts`:**

⚠️ **Patch A (v4 — critical context):** Existing code at lines 3789-3801 wraps `filteredGroups` in `useMemo`:
```javascript
const filteredGroups = useMemo(() => {   // line 3789
  if (!orderGroups) return [];            // line 3790
                                          // line 3791
  return orderGroups.filter(group => {    // line 3792
    ...filter body...                     // lines 3793-3799
  });                                     // line 3800
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);  // line 3801
```

**Target for replacement: lines 3792-3800 ONLY** (inner filter callback body). **Do NOT touch lines 3789-3791 (useMemo wrapper + null guard) and line 3801 (dep array).** The `const filteredGroups = useMemo(() => { ... }, [deps])` structure MUST be preserved.

⚠️ **useMemo dependency array (line 3801) does NOT need new deps.** `getStatusConfig` is already in the array and covers inputs for `hasServedButNotClosed` (which calls `getStatusConfig(o)`). Do NOT add extra deps.

⚠️ `hasActiveRequest` computation: group objects have shape `{ type, id, displayName, orders }` — NO `requests` property. Keep existing `activeRequests.some(r => getLinkId(r.table) === group.id)` unchanged.

**Replace INSIDE the useMemo — lines 3792-3800 only:**
```javascript
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    // KEEP AS-IS — activeRequests is external array, group has NO .requests property
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

**tabCounts — ADD `hasServedButNotClosed` (lines 3804-3818):**

⚠️ Current `tabCounts` uses `forEach` + mutable vars (NOT `reduce`). Match existing style. Keep `hasActiveRequest` computation unchanged.

```javascript
// Inside existing tabCounts forEach — add hasServedButNotClosed:
const hasServedButNotClosed = group.orders.some(o => {
  const config = getStatusConfig(o);
  return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
});
// Then in the active condition, add || hasServedButNotClosed:
// BEFORE: if (hasActiveOrder || hasActiveRequest) { active++ } else { completed++ }
// AFTER:  if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) { active++ } else { completed++ }
```

Do NOT rename keys or switch from forEach to reduce.

### Ref — UX decisions
- #16 — "Закрыть стол — двойное условие"
- ALL_SERVED: green border, "ОБСЛУЖЕНО" badge, enabled "Закрыть стол"

### НЕ должно быть
- Do NOT load TableSession entity into SOM.
- Do NOT touch `activeOrders` filter beyond removing `'served'` from finish-stage branch.
- Do NOT modify `closeSession` beyond bulk-close addition.
- Do NOT change PublicMenu/CartView/OrdersList.
- Do NOT break PartnerTables flow — `handleCloseSession` (1972-1991) must work identically.
- **Do NOT remove the useMemo wrapper around `filteredGroups`** (lines 3789-3801). Replace only the filter body (3792-3800).

### Проверка
1. **SOM:** Open table, 2 NEW dishes. Accept both → "Выдать все" → all `served`. Card MUST remain in **Active tab** with green "ОБСЛУЖЕНО". "Закрыть стол" → moves to **Completed**, orders `closed`.
2. **PartnerTables regression:** Admin "Close table" on session with 2 served orders → confirm → orders `closed`, sessions refetch, toast.
3. **CartView/OrdersList:** render orders с `served`/`closed` без errors.

---

## Fix 3 — SOM-S256-05 / #297 (P2) [MUST-FIX]: Tap on ★ ownership badge expands card

✅ **No changes from S263/S266 drafts.**

### Сейчас
★ — plain `<div>` без `stopPropagation`.

### Должно быть
Add `onClick={(e) => e.stopPropagation()}` to ★ и ☆ badges.

### Файл и локация
`staffordersmobile.jsx`, **lines 2249-2252** (★):
```javascript
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label="Мой стол" onClick={(e) => e.stopPropagation()}>
  {'★'}
</div>
```
Same for ☆ (2259-2262). Do NOT touch 🔒 (2255, already has stopPropagation).

### Проверка
1. "Все" filter, стол с ★.
2. Тап на ★ — карточка НЕ расширяется.
3. Тап в другом месте — расширяется нормально.

---

## Fix 4 — SOM-S235-03 / #271 (P1) [MUST-FIX REWRITE]: Remove "В РАБОТЕ" wrapper in 4 render branches

### Сейчас
Секции Принято/Готовится обёрнуты в collapsible "В РАБОТЕ (N гостей · N блюд)" с `inProgressExpanded` toggle.

### Должно быть
Каждый stage — ROOT-LEVEL section. Без wrapper.

**Reference — Branch B6 (line 2333) uses correct pattern via `inProgressSections.map`:**
```javascript
{inProgressSections.map((section, idx) => { ... return <div key={section.sid}><button ...>{section.label}</button>...</div>; })}
```

Применить ко всем 4 active branches. After Fix4, **B1/B2/B3/B4 use `inProgressSections.map`** — NOT `subGroups.map`.

### Rules per section
- Header: stage name + guest/dish count.
- Active/passive styling: Готово к выдаче = active. Принято/Готовится/Выдано = passive (opacity 0.6).
- Каждая секция со своим expand toggle (`expandedSubGroups[section.sid]`).
- Bulk action button (если `section.bulkLabel`).

Ref: UX #10, #11.

### Per-section header format (⚠️ Patch B — v4 NEW EXPLICIT)

**Target header format for ALL per-section headers (B1/B2/B3/B4 after migration to `inProgressSections.map`):**
```javascript
`${section.label} (${uniqueGuests(section.orders)} ${pluralRu(uniqueGuests(section.orders), 'гость', 'гостя', 'гостей')} · ${section.rowCount} ${pluralRu(section.rowCount, 'блюдо', 'блюда', 'блюд')})`
```

**B1 — Line 692 (per-section header inside existing `inProgressSections.map`):**
- **BEFORE:** `` `${section.label} (${section.rowCount})` ``
- **AFTER:** `` `${section.label} (${uniqueGuests(section.orders)} ${pluralRu(uniqueGuests(section.orders), 'гость', 'гостя', 'гостей')} · ${section.rowCount} ${pluralRu(section.rowCount, 'блюдо', 'блюда', 'блюд')})` ``

**B3 — Line 1303 (mirror of B1):**
- **BEFORE/AFTER:** same change as line 692.

**B2 / B4 (after migration to `inProgressSections.map`):**
- New per-section headers MUST use the same full format as above. Use `section.label`, `uniqueGuests(section.orders)`, `section.rowCount`. Do NOT fall back to `cfg.label` or `orders.length`.

**Note on pluralRu forms:** B1/B3 are in the B1/B3 branch context where hardcoded `'гость'/'гостя'/'гостей'` is the convention used in surrounding code (same as B6 line 2333 reference). If the local convention in B1/B3 uses `HALL_UI_TEXT.guests` instead, match that convention — the requirement is that the pluralRu call receives `uniqueGuests(section.orders)` (not `section.rowCount` or `section.orders.length`).

### Файл и локация — 4 branches TO FIX

**Branch B1 — lines 677-703:**
- Remove outer `<div>` wrapper with `<button onClick={() => setInProgressExpanded(...)}>` (lines 678-682).
- Remove outer `<div className="space-y-3 opacity-60">` conditional on `inProgressExpanded` (lines 683-702).
- Promote `inProgressSections.map(...)` to root level at same indentation as `newOrders` block above.
- **Line 692 header:** update to new format (see Patch B above).

**Branch B2 — lines 761-769 (legacy card, currently uses `subGroups.map`):**
- **Switch from `subGroups.map` to `inProgressSections.map`** для consistency.
- Remove outer `<div>` wrapper conditional on `inProgressOrders.length > 0` (line 761).
- Remove `setInProgressExpanded` toggle header (763-766).
- **B2 special case (line 767, `if (subGroups.length === 1)`): DROP THE SHORTCUT.**
- **Render function:** B2 = "legacy card" → **keep `renderLegacyOrderCard`**. Use `section.label`, `section.orders.map(renderLegacyOrderCard)`.
- **Per-section header:** use full `guest · dish` format from Patch B above (NOT simple `${orders.length}`).

**Branch B3 — lines 1288-1314 (mirror of B1):**
- Same as B1: remove wrapper (1289-1293), remove conditional (1294, 1312), promote `inProgressSections.map(...)` to root level.
- **Line 1303 header:** update to new format (see Patch B above).

**Branch B4 — lines 1374-1398 (mirror of B2):**
- **Switch from `subGroups.map` to `inProgressSections.map`**.
- Remove wrapper with `setInProgressExpanded` toggle (1374-1377).
- Promote to root level.
- `subGroups.length === 1` shortcut at line 1385 — drop.
- **Render function:** same as B2 — `renderLegacyOrderCard`.
- **Per-section header:** full format from Patch B.

**Legacy Branch (line 2346) — OUT OF SCOPE (Arman decision B-3).**

### `inProgressExpanded` state — KEEP

Used on: 1780 (useState), 1816/1823 (effect), 2346 (legacy). После B1-B4 removal — состояние живое, **не удалять**.

### НЕ должно быть
- NO "В РАБОТЕ" wrapper anywhere in B1/B2/B3/B4.
- Do NOT keep `subGroups.map` in B2/B4.
- Do NOT keep `subGroups.length === 1` shortcut.
- Do NOT delete `inProgressExpanded` state.
- Do NOT change section order.
- Do NOT touch legacy branch 2346.
- Do NOT use `section.rowCount` alone as the guest count — always `uniqueGuests(section.orders)`.

### Grep verification
```bash
grep -n "inProgressExpanded" staffordersmobile.jsx
# expected: useState(1780), effect(1816, 1823), legacy(2346) — 4-5 hits max.

grep -n "HALL_UI_TEXT.inProgress\|'В РАБОТЕ'" staffordersmobile.jsx
# expected: 0 hits in B1/B2/B3/B4.

grep -n "subGroups.map" staffordersmobile.jsx
# expected: 0 hits in B2/B4.

grep -n "subGroups.length === 1" staffordersmobile.jsx
# expected: 0 hits.

# Verify per-section headers use uniqueGuests (not section.rowCount as guest count)
grep -nE "\\\$\\{section\\.label\\} \\(\\\$\\{section\\.rowCount" staffordersmobile.jsx
# expected: 0 hits (old format removed from lines 692/1303)
```

### Проверка
1. Orders in ПРИНЯТО и ГОТОВИТСЯ на одном столе.
2. Expand card (B1).
3. ПРИНЯТО и ГОТОВИТСЯ как separate root-level sections.
4. ПРИНЯТО collapsed + opacity.
5. Single-section case: только ГОТОВИТСЯ → root-level с own header.
6. Per-section headers show `uniqueGuests · rowCount` format (Patch B).
7. Repeat в B2/B3/B4.

---

## ⛔ SCOPE LOCK

- Menять ТОЛЬКО код из Fix 1-4 + `closeSession`.
- Header redesign (#294, #295) — out of scope.
- Drawer, settings, service requests — НЕ ТРОГАТЬ.
- Legacy branch 2346 — НЕ ТРОГАТЬ.
- PublicMenu/CartView/OrdersList — НЕ ТРОГАТЬ.
- PartnerTables — только `closeSession` helper меняется; `handleCloseSession` (1972-1991) остаётся.

## FROZEN UX (locked GPT S250)

- Collapsed card identity block (78×54px, urgency colors, badges)
- Smart chips
- Ownership filter bar — locked R3
- Urgency 3 levels — locked R6

## CONTEXT FILES

- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — **mockup wins** при конфликте.
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — UX spec v2.7.

## Implementation Notes

- File 1: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4524 lines) — Fix 1, 2 (partial), 3, 4
- File 2: `components/sessionHelpers.js` — Fix 2 only
- i18n: `t()` from `useI18n()` (line 2835). No new user-facing strings.
- Apply order: **Fix1 → Fix4 → Fix2 → Fix3**.
- Fix #293: grep `HALL_UI_TEXT.guests` + `pluralRu.*guests` + `pluralRu.*гост` — все через `uniqueGuests`. Helper exactly once.
- Fix #296: 3 изменения в 2 файлах. useMemo wrapper preserved (lines 3789-3801 structure), only filter body replaced (3792-3800).
- Fix #297: minimal — add `onClick` stopPropagation to 2 `<div>`s.
- Fix #271: promote `inProgressSections.map(...)` to root level in 4 branches; B2/B4 migrate from `subGroups.map`; drop B2 `length===1` shortcut; lines 692/1303 per-section headers updated to full guest/dish format.
- git add staffordersmobile.jsx sessionHelpers.js && git commit -m "SOM Batch A v2: #293 guest count + #296 served visibility + #297 star badge + #271 wrapper removal"

## MOBILE-FIRST CHECK (MANDATORY before commit)

Verify at 375px width:
- [ ] Touch targets >= 44x44px
- [ ] No excessive whitespace on small screens
- [ ] Section headers visible and readable
- [ ] Removing "В РАБОТЕ" wrapper doesn't cause horizontal overflow
- [ ] Per-section headers (lines 692/1303 post-fix) fit on one line at 375px

## Regression Check (MANDATORY after implementation)

- [ ] Collapsed table card shows correct status chips and urgency colors
- [ ] Tap on table card header expands/collapses detail view
- [ ] Bulk action buttons ("Принять все", "Выдать все") work
- [ ] Ownership filter bar filters correctly
- [ ] "Закрыть стол" button (SOM) appears on ALL_SERVED tables и moves card to Completed tab
- [ ] After closeSession, orders appear with status 'closed' in base44 entity inspector
- [ ] **PartnerTables admin close:** "Close table" → confirm → orders `closed`, sessions refetch, toast. No regression.
- [ ] CartView renders orders с all statuses без errors
- [ ] OrdersList renders orders с all statuses без errors
- [ ] **⚠️ Patch D (v4 NEW):** After "Выдать все (N)": table card **remains in Active tab** with green ОБСЛУЖЕНО badge (NOT disappeared before closeSession). Card only moves to Completed tab после явного "Закрыть стол".

## FROZEN UX grep verification (run before commit)

```bash
grep -n "URGENCY_IDENTITY_STYLE" staffordersmobile.jsx | head -5
grep -n "scsChips\|scsUrgency" staffordersmobile.jsx | head -5
```
Expected: unchanged.

---

## END OF DRAFT КС PROMPT
