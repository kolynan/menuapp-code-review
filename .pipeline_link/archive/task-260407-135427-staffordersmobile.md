---
task_id: task-260407-135427-staffordersmobile
status: running
started: 2026-04-07T13:54:28+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 2.50
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260407-135427-staffordersmobile

## Config
- Budget: $2.50
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260407-132533-b0c8
chain_step: 4
chain_total: 4
chain_step_name: merge-v2
page: StaffOrdersMobile
budget: 2.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260407-132533-b0c8
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-comparison.md
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-discussion.md
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
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260407-132533-b0c8"
   - git push
8. Write merge report to: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
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
# SOM Phase 1 Bug Fixes — КС Prompt

## Context
Файл: `pages/StaffOrdersMobile/staffordersmobile.jsx` (**Production page**)
RELEASE: `pages/StaffOrdersMobile/260406-01 StaffOrdersMobile RELEASE.jsx` (4389 строк)
Задача: Исправить 5 UX-багов в компоненте OrderGroupCard (раскрытая карточка стола)
Вес: L×5 | Бюджет: $12 | Модель: С5v2

**KB-095 guard (CRITICAL, выполнить ПЕРВЫМ):**
```bash
expected=4389
actual=$(wc -l < "pages/StaffOrdersMobile/staffordersmobile.jsx")
if [ "$actual" -lt "$expected" ]; then
  echo "KB-095 WARNING: file has $actual lines, expected $expected. Restoring from RELEASE..."
  cp "pages/StaffOrdersMobile/260406-01 StaffOrdersMobile RELEASE.jsx" "pages/StaffOrdersMobile/staffordersmobile.jsx"
  echo "KB-095: restored from RELEASE ($actual → $expected)"
fi
```

---

## ⚠️ КРИТИЧНО — 3 ПАРАЛЛЕЛЬНЫХ RENDER PATH В ФАЙЛЕ

Файл содержит три независимых блока рендеринга для разных типов групп:
- **legacy1** (~line 580): первый блок (доставка/самовывоз, старый стиль)
- **legacy2** (~line 1190): второй блок (non-table группы, старый стиль)
- **hall-mode** (~line 2175): блок для зальных столов ← **ВСЕ ПЯТЬ ФИКСОВ ПРИМЕНЯТЬ ТОЛЬКО ЗДЕСЬ**

Для навигации к hall-mode:
```bash
grep -n 'group\.type === "table" ?' pages/StaffOrdersMobile/staffordersmobile.jsx
# Берём ТРЕТЬЕ совпадение — это вход в hall-mode render path
```

**Legacy paths НЕ трогать.** Они используют `renderLegacyOrderCard` и не имеют секций "Запросы/Новые/Готово".

---

## UX Reference
UX-документ: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` (v2.6, 32 решения)
Скриншоты: `menuapp-code-review/pages/StaffOrdersMobile/screenshots/current/`
BACKLOG: #259 (SOM-S231-01), #251 (jump chips), #254 (toast position), #256 (close reasons), #255 (age urgency)

---

## FROZEN UX (DO NOT CHANGE)
Следующие элементы НЕЛЬЗЯ трогать — реализованы и протестированы в RELEASE 260406-01:

- Порядок секций: Запросы → Новые → В работе → Готово → Выдано → СЧЁТ → «Закрыть стол»
- Bulk кнопки «Принять все (N)» и «Выдать все (N)» в заголовках секций
- Per-item action кнопки на каждой строке блюда (Принять / Выдать / кастомный этап)
- Двухшаговый flow запросов: [Принять] → [Выдать]
- Staff pill после «Принять» в строке запроса
- Collapse/expand анимация карточки (max-h-[3000px] transition)
- Inline undo toast механизм — только позицию меняем (Fix 3), не механизм
- Логика блокировки «Закрыть стол» — только добавляем scroll, не меняем условия
- Секция СЧЁТ (billData) — только убрать из дублирующей карточки, не трогать основную
- Компонент `renderLegacyOrderCard` — не трогать (используется в non-table groups)
- Все изменения legacy1 и legacy2 path — НЕ ТРОГАТЬ

---

## Fix 1: Убрать дублирующую вложенную карточку стола (SOM-S231-01)

### Проблема
При раскрытии карточки стола (tap → isExpanded=true) пользователь видит:
- Внешний контейнер (заголовок): «22» badge + «Свернуть» + jump chips
- Внутри expanded area: ЕЩЁ ОДНА карточка с «22» badge + «Свернуть» + те же chips

Результат: визуальное дублирование заголовка стола. Баг SOM-S231-01.

### Wireframe (было → должно быть)

```
БЫЛО (expanded):                    ДОЛЖНО БЫТЬ (expanded):
┌────────────────────────────┐      ┌────────────────────────────┐
│ ⭐ [22] Зона A    Свернуть │      │ ⭐ [22] Зона A    Свернуть │
│ Новые 3 · 5 мин  Готово 2 │      │ Новые 3 · 5 мин  Готово 2 │
├────────────────────────────┤      ├────────────────────────────┤
│ ┌──────────────────────┐   │      │ ЗАПРОСЫ (1)        Принять │
│ │ ⭐ [22] Зона A  Свн.│   │      │ [Салфетки]           4 мин │
│ │ Новые 3 · 5 мин .... │   │      ├────────────────────────────┤
│ │ Счёт · Итого 4200₸  │   │      │ НОВЫЕ (1 гость · 2 блюда)  │
│ └──────────────────────┘   │      │ [Борщ ×1]          Принять │
│ ЗАПРОСЫ (1)       Принять  │      └────────────────────────────┘
│ НОВЫЕ (1 гость · 2 блюда)  │
└────────────────────────────┘
```

### Что менять

Найти hall-mode expanded area (после третьего `group.type === "table" ?`).
Внутри expanded content `<div className="... overflow-hidden transition-all ...">` найти:

Grep в hall-mode path:
```
rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2
```

⚠️ Этот className присутствует в файле в 3 местах (legacy1, legacy2, hall-mode). Нужен ТОЛЬКО блок в hall-mode (третье совпадение, ~line 2180).

**Удалить весь блок** `<div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">...</div>` в hall-mode path (третье совпадение).

Блок содержит: Star/Lock icon, compactTableLabel badge, zone_name, collapse button, ownerHintVisible, hallSummaryItems chips, billData.total — всё это дублирование из header.

После удаления первым элементом expanded area (после `<React.Fragment>`) должен быть conditionally rendered контент секций.
*(если запросов нет — первым будет блок newOrders, если и их нет — inProgressSections и т.д.)*

### Проверка
```bash
grep -c "rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: 2 (legacy1 и legacy2 остаются; hall-mode экземпляр удалён)
```

---

## Fix 2: Jump chips → scrollIntoView при клике (#251, UX #26)

### Проблема
Jump chips (Новые 3, Готово 2) в заголовке карточки — только информационные `<span>`. По клику ничего не происходит. UX #26 требует: клик → scroll к нужной секции внутри карточки.

### Wireframe

```
Заголовок карточки (всегда виден):
┌────────────────────────────────────────┐
│ ⭐ [22]  [Новые 3 · 5м]  [Готово 2 · 8м]  Свернуть │
│           ↑ tappable → scroll to section           │
│           ↑ e.stopPropagation() нужен!             │
└────────────────────────────────────────┘
```

### Что менять

**⚠️ Важно: chips находятся ВНУТРИ кликабельного header div (`onClick={onToggleExpand}`). Нажатие на chip должно скроллить секцию, но НЕ сворачивать/разворачивать карточку. Обязательно добавить `e.stopPropagation()` в onClick чипа.**

**Шаг A — добавить refs на wrapper'ы секций.**

Grep для поиска места объявления состояний компонента (добавить рядом с другими useRef):
```
const ownerHintTimerRef = useRef(null);
```

Добавить после:
```jsx
const requestsSectionRef = useRef(null);
const newSectionRef = useRef(null);
const inProgressSectionRef = useRef(null);
const readySectionRef = useRef(null);
```

**Шаг B — добавить единую функцию scroll (используется и в Fix 4).**

После объявления refs:
```jsx
const scrollToSection = useCallback((kind) => {
  const refMap = {
    requests: requestsSectionRef,
    new: newSectionRef,
    inProgress: inProgressSectionRef,
    ready: readySectionRef,
  };
  const ref = refMap[kind];
  if (ref?.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, []);
```

**Шаг C — прикрепить refs к секциям в hall-mode path (~line 2175+).**

Найти секцию запросов в hall-mode: `tableRequests.length > 0 && <div>` → добавить `ref={requestsSectionRef}` к первому `<div>`.
Найти секцию В РАБОТЕ: `inProgressSections.length > 0 && <div>` → добавить `ref={inProgressSectionRef}`.
Найти секцию НОВЫЕ: `newOrders.length > 0 && <div>` → добавить `ref={newSectionRef}`.
Найти секцию ГОТОВО: `readyOrders.length > 0 && <div>` → добавить `ref={readySectionRef}`.

**Шаг D — обновить renderHallSummaryItem.**

Grep:
```
const renderHallSummaryItem = useCallback((item) => {
```

Заменить `<span key={item.key} ...>` на:
```jsx
<button
  type="button"
  key={item.key}
  onClick={(e) => { e.stopPropagation(); scrollToSection(item.kind); }}
  className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer active:opacity-70 ${getSummaryTone(item.kind, item.ageMin)}`}
>
```

Закрывающий тег `</span>` → `</button>`.

**⚠️ Dependency array**: Добавить `scrollToSection` к СУЩЕСТВУЮЩИМ зависимостям, не заменять весь массив.

### Проверка
```bash
grep -c "scrollToSection" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥3
grep -c "stopPropagation" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥1
```

---

## Fix 3: Toast под кликнутой строкой, не под последней (#254, UX #23)

### Проблема
После нажатия кнопки на строке блюда, undo toast появляется под ПОСЛЕДНЕЙ строкой заказа. UX #23: toast = под кликнутой строкой.

### Wireframe

```
БЫЛО:                           ДОЛЖНО БЫТЬ:
[Борщ ×1]          Принять     [Борщ ×1]          Принять
[Котлета ×1]       Принять     [Отменить → 4с]  ← toast сразу под
[Стейк ×1]         Принять     [Котлета ×1]       Принять
[Отменить → 4с]  ← toast       [Стейк ×1]         Принять
```

### ⚠️ DISCOVERY STEP (обязательно перед реализацией)

`setUndoToast` вызывается НЕ напрямую из кнопки — есть call chain. Перед реализацией:

1. Найти тело `handleSingleAction`:
```bash
grep -n "const handleSingleAction\|function handleSingleAction" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```

2. Проследить полный path от `handleSingleAction` до `setUndoToast`:
```bash
grep -n "setUndoToast(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```

3. Найти ВСЕ call sites `handleSingleAction` (вдруг вызывается без `row.id` в других местах):
```bash
grep -n "handleSingleAction(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```

4. Обновить ВСЕ промежуточные функции в chain для передачи `rowId`.

### Что менять

**Шаг A — обновить кнопку в renderHallRows.**

Grep: `onClick={() => handleSingleAction(row.order)` → изменить на:
```jsx
onClick={() => handleSingleAction(row.order, row.id)}
```

**Шаг B — обновить call chain.**

Для каждой промежуточной функции между `handleSingleAction` и `setUndoToast`:
- Добавить `rowId` как параметр
- Передать дальше по chain

В самом конце, где вызывается `setUndoToast({...})`:
```jsx
setUndoToast({ ..., rowId })
```

**Шаг C — обновить логику showToast в renderHallRows.**

Grep: `const isLastOfOrder` → заменить обе строки:
```js
const isLastOfOrder = ...
const showToast = ... isLastOfOrder ...
```

На:
```js
const showToast = undoToast && row.order?.id === undoToast.orderId && row.id === undoToast.rowId && !renderedToast.has(undoToast.orderId);
if (showToast) renderedToast.add(undoToast.orderId);
```

Строку `const isLastOfOrder = ...` удалить.

**⚠️ Dependency array renderHallRows**: добавить новые зависимости к СУЩЕСТВУЮЩИМ, не заменять весь массив.

### Проверка
```bash
grep -c "rowId" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥3
```

---

## Fix 4: Причины блокировки «Закрыть стол» — tappable (#256, UX #29)

### Проблема
`<p>` с причинами блокировки под кнопкой «Закрыть стол» — нетапабельный текст. UX #29: тап → scroll к нужной секции.

### Wireframe

```
БЫЛО:                           ДОЛЖНО БЫТЬ:
[ ✕ Закрыть стол ] (серая)     [ ✕ Закрыть стол ] (серая)
Есть новые блюда               [Есть новые блюда →]  ← button → scroll к НОВЫЕ
Есть блюда в работе            [Есть блюда в работе →]  ← scroll к В РАБОТЕ
```

### Что менять

**Использовать refs и `scrollToSection` из Fix 2** — все 4 refs уже объявлены.

**Маппинг причин на scrollToSection kind:**
```js
const reasonToKind = {
  [HALL_UI_TEXT.requestsBlocker]: "requests",
  [HALL_UI_TEXT.newBlocker]: "new",
  [HALL_UI_TEXT.inProgressBlocker]: "inProgress",
  [HALL_UI_TEXT.readyBlocker]: "ready",
};
```

⚠️ Если причина не найдена в маппинге — показать как обычный `<p>`, не мёртвую кнопку.

Grep: `closeDisabledReasons.map` — встречается в 3 местах. Менять только hall-mode (~line 2206).

Текущий код:
```jsx
{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}
```

Новый код:
```jsx
{closeDisabledReasons.map((reason, i) => {
  const kind = reasonToKind[reason];
  if (!kind) return <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>;
  return (
    <button
      key={i}
      type="button"
      onClick={() => scrollToSection(kind)}
      className="w-full text-[10px] text-slate-400 text-center min-h-[28px] active:text-slate-600"
    >
      {reason} ›
    </button>
  );
})}
```

### Проверка
```bash
grep -c "reasonToKind" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥1
```

---

## Fix 5: Age urgency цветная полоска на строках блюд (#255, UX #13)

### Проблема
Строки блюд в `renderHallRows` не показывают срочность по возрасту заказа.

### Wireframe

```
БЫЛО:                               ДОЛЖНО БЫТЬ:
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ [Борщ ×1]           Далее   │    │ [Борщ ×1]           Далее   │  ← <10 мин: обычный
├──────────────────────────────┤    ├──────────────────────────────┤
│ [Котлета ×1]        Далее   │    │▌[Котлета ×1]        Далее   │  ← 10-14 мин: amber
└──────────────────────────────┘    └──────────────────────────────┘
                                    ┌──────────────────────────────┐
                                    │▌[Стейк ×1]          Далее   │  ← ≥15 мин: red
                                    └──────────────────────────────┘
```

### ⚠️ DISCOVERY STEP

Проверить что `overdueMinutes` доступен в scope `OrderGroupCard`:
```bash
grep -n "overdueMinutes" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```
Если найден — использовать. Если не найден — использовать `10` как fallback.

### Что менять

Grep: `rows.map((row, idx) => {` → внутри `.map()` добавить расчёт urgency:
```js
const ageMin = getAgeMinutes(row.order?.created_date);
const overdueThreshold = overdueMinutes || 10;
const urgencyClass = ageMin >= overdueThreshold + 5
  ? "border-l-4 border-l-red-500"
  : ageMin >= overdueThreshold
  ? "border-l-4 border-l-amber-400"
  : "";
```

Grep: `rounded-lg border ${palette.border} ${palette.bg} px-3 py-2` → добавить `${urgencyClass}`:
```jsx
className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2 ${urgencyClass}`}
```

`getAgeMinutes` — глобальная функция в файле (line ~366), вызывать напрямую.

**⚠️ Dependency array renderHallRows**: добавить `overdueMinutes` к СУЩЕСТВУЮЩИМ зависимостям.

### Проверка
```bash
grep -c "urgencyClass" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥2
```

---

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app (waiter tablet/phone). Verify at 375px width:
- [ ] Jump chips (Fix 2): touch area ≥ 44px height — `min-h-[44px]` or adequate padding
- [ ] Close table reason buttons (Fix 4): touch area ≥ 28px — `min-h-[28px]` already in prompt
- [ ] Dish rows (Fix 5): urgency border-l-4 visible and not clipped
- [ ] No duplicate visual headers when table expanded (Fix 1)
- [ ] Expanded card still scrollable after section refs added (Fix 2)

---

## Regression Check (MANDATORY after implementation)
Проверить что следующее ПРОДОЛЖАЕТ работать:
- [ ] Tap на заголовок карточки стола → раскрывается/сворачивается (не должен срабатывать chip onClick)
- [ ] «Принять все (N)» / «Выдать все (N)» bulk кнопки в заголовках секций работают
- [ ] Одиночный тап на строку блюда → undo toast появляется (механизм работает)
- [ ] «Закрыть стол» кнопка disabled и enabled states работают правильно
- [ ] Legacy path карточки (delivery/online) рендерятся без изменений

---

## Post-fix Checks (ОБЯЗАТЕЛЬНО после всех изменений)

1. **KB-095 check (line count):**
   ```bash
   wc -l "pages/StaffOrdersMobile/staffordersmobile.jsx"
   ```
   Ожидаемое: 4389 ± 50 строк. Если < 4300 — восстановить из RELEASE.

2. **Grep проверки:**
   ```bash
   # Fix 1: hall-mode inner card удалён (legacy1/2 остаются)
   grep -c "rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: 2

   # Fix 2: scroll + stopPropagation
   grep -c "scrollToSection" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥3
   grep -c "stopPropagation" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥1

   # Fix 3: rowId добавлен
   grep -c "rowId" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥3

   # Fix 4: reasonToKind добавлен
   grep -c "reasonToKind" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥1

   # Fix 5: urgencyClass добавлен
   grep -c "urgencyClass" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥2
   ```

3. **FROZEN UX check:**
   ```bash
   grep -c "handleOrdersAction" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥2
   grep -c "renderLegacyOrderCard" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥2
   ```
=== END ===


## Status
Running...
