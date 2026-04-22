---
task_id: task-260407-125338-staffordersmobile-pssk-codex-reviewer
status: running
started: 2026-04-07T12:53:40+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260407-125338-staffordersmobile-pssk-codex-reviewer

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260407-125330-6e8e
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: StaffOrdersMobile
budget: 5.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?

Write your findings to: pipeline/chain-state/staffordersmobile-260407-125330-6e8e-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-125330-6e8e

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
You are reviewing the quality of a КС implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: Phase 1 bug fixes batch for StaffOrdersMobile page (OrderGroupCard component).
5 fixes: (1) remove duplicate inner card shown when table expanded, (2) make jump chips scroll to sections, (3) show undo toast under clicked row, (4) make close-table blocked reasons tappable with scroll, (5) add age urgency border to dish rows.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, class names)
2. Missing edge cases or broken interactions between fixes (fixes 2 and 4 share section refs — any conflicts?)
3. Ambiguous instructions — is it clear exactly what to delete and what to add?
4. Safety risks — does Fix 1 (deleting inner card) accidentally remove something needed?
5. Validation: are post-fix grep checks sufficient to catch incomplete implementation?
6. Fix 3 (rowId in toast): is passing row.id to handleSingleAction realistic without seeing handleSingleAction's full signature? Flag if assumptions are made.
7. Fix 5 (urgencyClass): overdueMinutes prop — is it available inside renderHallRows scope? Is the dep array update correct?

---

# SOM Phase 1 Bug Fixes — КС Prompt

## Context
Файл: `pages/StaffOrdersMobile/staffordersmobile.jsx`
RELEASE: `pages/StaffOrdersMobile/260406-01 StaffOrdersMobile RELEASE.jsx` (4389 строк)
Задача: Исправить 5 UX-багов в компоненте OrderGroupCard (раскрытая карточка стола)
Вес: L×5 | Бюджет: ~$10-12 | Модель: С5v2

**KB-095 guard (CRITICAL, выполнить ПЕРВЫМ):**
```bash
expected=4389
actual=$(wc -l < pages/StaffOrdersMobile/staffordersmobile.jsx)
if [ "$actual" -lt "$expected" ]; then
  cp "pages/StaffOrdersMobile/260406-01 StaffOrdersMobile RELEASE.jsx" pages/StaffOrdersMobile/staffordersmobile.jsx
  echo "KB-095: restored from RELEASE ($actual → $expected)"
fi
```

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

Grep для поиска блока:
```
rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2
```

Этот `<div>` открывается сразу после `{group.type === "table" ? (` внутри expanded area.
Он содержит: Star/Lock icon, compactTableLabel badge, zone_name, collapse button, ownerHintVisible, hallSummaryItems chips, billData.total.

**УДАЛИТЬ ЦЕЛИКОМ** весь этот блок `<div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">...</div>`.

Блок заканчивается закрывающим `</div>` перед `{tableRequests.length > 0 && ...}`.

После удаления первым элементом expanded area (после `<React.Fragment>`) должна быть секция запросов:
```jsx
{tableRequests.length > 0 && <div>...}
```

### Проверка
- `grep -c "rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2" staffordersmobile.jsx` → должно быть 0 после fix
- При раскрытии стола: заголовок «22 + chips» виден один раз (в header), expanded area начинается с секций

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
└────────────────────────────────────────┘
```

### Что менять

**Шаг A — добавить refs на wrapper'ы секций.**

Grep для поиска места объявления состояний компонента (добавить рядом с другими useRef):
```
const ownerHintTimerRef = useRef(null);
```

Добавить после:
```jsx
const requestsSectionRef = useRef(null);
const newSectionRef = useRef(null);
const readySectionRef = useRef(null);
```

**Шаг B — прикрепить refs к секциям.**

Найти секцию запросов:
```
tableRequests.length > 0 && <div>
```
Первый `<div>` в этом блоке → добавить `ref={requestsSectionRef}`.

Найти секцию новых блюд:
```
newOrders.length > 0 && <div>
```
Первый `<div>` → добавить `ref={newSectionRef}`.

Найти секцию готовых блюд:
```
readyOrders.length > 0 && <div>
```
Первый `<div>` → добавить `ref={readySectionRef}`.

**Шаг C — добавить функцию scroll.**

После объявления `requestsSectionRef`/`newSectionRef`/`readySectionRef`:
```jsx
const scrollToSection = useCallback((kind) => {
  const refMap = {
    requests: requestsSectionRef,
    new: newSectionRef,
    ready: readySectionRef,
  };
  const ref = refMap[kind];
  if (ref?.current) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}, []);
```

**Шаг D — обновить renderHallSummaryItem.**

Grep:
```
const renderHallSummaryItem = useCallback((item) => {
```

Заменить `<span key={item.key} ...>` на `<button type="button" key={item.key} onClick={() => scrollToSection(item.kind)} ...>`.

Сохранить все существующие className. Добавить `cursor-pointer active:opacity-70`.

Добавить `scrollToSection` в dependency array: `}, [getSummaryTone, scrollToSection]);`

### Проверка
- `grep -n "scrollToSection" staffordersmobile.jsx` → 3+ совпадения (def + вызовы)
- Клик на chip → карточка плавно скроллится к нужной секции

---

## Fix 3: Toast под кликнутой строкой, не под последней (#254, UX #23)

### Проблема
После нажатия кнопки на строке блюда, undo toast появляется под ПОСЛЕДНЕЙ строкой заказа. Если у гостя 3 блюда и нажали «Принять» на первом — toast уедет под третье. UX #23: toast = под кликнутой строкой.

### Wireframe

```
БЫЛО:                           ДОЛЖНО БЫТЬ:
[Борщ ×1]          Принять     [Борщ ×1]          Принять
[Котлета ×1]       Принять     [Отменить → 4с]  ← toast сразу под
[Стейк ×1]         Принять     [Котлета ×1]       Принять
[Отменить → 4с]  ← toast       [Стейк ×1]         Принять
```

### Что менять

**Шаг A — добавить rowId в undoToast.**

Где бы ни устанавливался `undoToast` (через `setUndoToast(...)`) — добавить поле `rowId: row.id`.

Grep для поиска мест вызова setUndoToast:
```
setUndoToast(
```

В каждом вызове добавить `rowId: row.id` (или `rowId: rowId` если передаётся параметром).

**Шаг B — обновить логику showToast в renderHallRows.**

Grep:
```
const isLastOfOrder
```

Текущий код:
```js
const isLastOfOrder = !rows[idx + 1] || rows[idx + 1].order?.id !== row.order?.id;
const showToast = toastOrderId && row.order?.id === toastOrderId && isLastOfOrder && !renderedToast.has(toastOrderId);
```

Новый код (заменить обе строки):
```js
const showToast = undoToast && row.order?.id === undoToast.orderId && row.id === undoToast.rowId && !renderedToast.has(undoToast.orderId);
if (showToast) renderedToast.add(undoToast.orderId);
```

Убрать строку `const isLastOfOrder = ...` — она больше не нужна.
Обновить строку `if (showToast) renderedToast.add(toastOrderId)` → уже включено выше.

**Шаг C — обновить кнопку действия в row.**

Grep:
```
onClick={() => handleSingleAction(row.order)
```

Изменить на:
```jsx
onClick={() => handleSingleAction(row.order, row.id)}
```

И в `handleSingleAction(order, rowId)` — добавить `rowId` в параметры и включить в `setUndoToast({ ..., rowId })`.

### Проверка
- Нажать «Принять» на первом блюде из трёх → toast появляется после первой строки
- `grep -n "rowId" staffordersmobile.jsx` → 2+ совпадения

---

## Fix 4: Причины блокировки «Закрыть стол» — tappable, scroll к секции (#256, UX #29)

### Проблема
Под кнопкой «Закрыть стол» (когда disabled) отображаются причины как `<p>` — нетапабельный текст. UX #29: причины должны быть кнопками, клик → scroll к нужной секции.

### Wireframe

```
БЫЛО:                           ДОЛЖНО БЫТЬ:
[ ✕ Закрыть стол ] (серая)     [ ✕ Закрыть стол ] (серая)
Есть новые блюда               [Есть новые блюда →]  ← button, tap → scroll к НОВЫЕ
Есть блюда в работе            [Есть блюда в работе →]  ← tap → scroll к В РАБОТЕ
```

### Что менять

**Использовать refs из Fix 2** — `requestsSectionRef`, `newSectionRef`, `readySectionRef`.
Добавить недостающий ref:
```jsx
const inProgressSectionRef = useRef(null);
```

Прикрепить `ref={inProgressSectionRef}` к первому `<div>` в блоке:
```
inProgressSections.length > 0 && <div>
```

**Маппинг причин на refs:**
```js
const reasonToRef = {
  [HALL_UI_TEXT.requestsBlocker]: requestsSectionRef,
  [HALL_UI_TEXT.newBlocker]: newSectionRef,
  [HALL_UI_TEXT.inProgressBlocker]: inProgressSectionRef,
  [HALL_UI_TEXT.readyBlocker]: readySectionRef,
};
```

Grep для поиска рендеринга причин:
```
closeDisabledReasons.map
```

Текущий код:
```jsx
{closeDisabledReasons.map((reason, i) => <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>)}
```

Новый код:
```jsx
{closeDisabledReasons.map((reason, i) => {
  const sectionRef = reasonToRef[reason];
  return (
    <button
      key={i}
      type="button"
      onClick={() => sectionRef?.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })}
      className="w-full text-[10px] text-slate-400 text-center min-h-[28px] active:text-slate-600"
    >
      {reason} ›
    </button>
  );
})}
```

### Проверка
- `grep -n "reasonToRef" staffordersmobile.jsx` → 1 совпадение (definition)
- При заблокированном «Закрыть стол» — тап на причину → scroll к соответствующей секции

---

## Fix 5: Age urgency цветная полоска на строках блюд (#255, UX #13)

### Проблема
Строки блюд в `renderHallRows` не показывают визуальную срочность по возрасту заказа. В BUGS_MASTER #13 реализована urgency на карточке стола (summary item цвет), но UX #13 требует urgency и на строках внутри раскрытого стола.

### Wireframe

```
Строки блюд (В РАБОТЕ секция, оранжевый):
БЫЛО:                               ДОЛЖНО БЫТЬ:
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ [Борщ ×1]           Далее   │    │ [Борщ ×1]           Далее   │  ← <10 мин: обычный
├──────────────────────────────┤    ├──────────────────────────────┤
│ [Котлета ×1]        Далее   │    │▌[Котлета ×1]        Далее   │  ← 10-14 мин: amber
│                              │    │  amber border-l-4            │
└──────────────────────────────┘    └──────────────────────────────┘
                                    ┌──────────────────────────────┐
                                    │▌[Стейк ×1]          Далее   │  ← ≥15 мин: red
                                    │  red border-l-4              │
                                    └──────────────────────────────┘
```

### Что менять

Grep для поиска нужного места в renderHallRows:
```
rows.map((row, idx) => {
```

Внутри `.map()`, перед `return`, добавить расчёт urgency:
```js
const ageMin = getAgeMinutes(row.order?.created_date);
const overdueThreshold = overdueMinutes || 10;
const urgencyClass = ageMin >= overdueThreshold + 5
  ? "border-l-4 border-l-red-500"
  : ageMin >= overdueThreshold
  ? "border-l-4 border-l-amber-400"
  : "";
```

В классе строки блюда найти:
```
rounded-lg border ${palette.border} ${palette.bg} px-3 py-2
```

Добавить `${urgencyClass}` в className:
```jsx
className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2 ${urgencyClass}`}
```

**Важно:** `getAgeMinutes` уже определена в компоненте как глобальная функция (не метод). Вызывать напрямую без `this`.

Добавить `overdueMinutes` в dependency array `renderHallRows`:
```
}, [advanceMutation.isPending, handleSingleAction, overdueMinutes, undoToast, setUndoToast]);
```

### Проверка
- `grep -n "urgencyClass" staffordersmobile.jsx` → 2 совпадения (def + className)
- Заказ возрастом >10 мин → amber полоска слева на строках блюд
- Заказ возрастом >15 мин → red полоска слева

---

## Post-fix Checks (ОБЯЗАТЕЛЬНО после всех изменений)

1. **KB-095 check:**
   ```bash
   wc -l staffordersmobile.jsx
   ```
   Ожидаемое значение: 4389 ± 30 (добавляем код, не удаляем массово).
   Если < 4300 — восстановить из RELEASE и начать заново.

2. **Syntax check:**
   ```bash
   node --input-type=module < staffordersmobile.jsx 2>&1 | head -20
   ```
   Ноль синтаксических ошибок.

3. **Grep проверки:**
   ```bash
   # Fix 1: inner card удалён
   grep -c "rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2" staffordersmobile.jsx
   # ожидается: 0

   # Fix 2: scroll подключён
   grep -c "scrollToSection" staffordersmobile.jsx
   # ожидается: ≥3

   # Fix 3: rowId добавлен
   grep -c "rowId" staffordersmobile.jsx
   # ожидается: ≥2

   # Fix 4: reasonToRef добавлен
   grep -c "reasonToRef" staffordersmobile.jsx
   # ожидается: ≥1

   # Fix 5: urgencyClass добавлен
   grep -c "urgencyClass" staffordersmobile.jsx
   # ожидается: ≥2
   ```

4. **FROZEN UX check:**
   ```bash
   grep -c "handleOrdersAction" staffordersmobile.jsx
   # bulk actions должны остаться
   grep -c "serveAllRequests\|acceptAllRequests" staffordersmobile.jsx
   # запросы bulk должны остаться
   ```
=== END ===


## Status
Running...
