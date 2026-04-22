# SOM Phase 1 Bug Fixes — КС Prompt (reviewed)
<!-- Applied: CC 3 CRITICAL + 2 MEDIUM, Codex 3 CRITICAL + 3 MEDIUM -->

## Context
Файл: `pages/StaffOrdersMobile/staffordersmobile.jsx`
RELEASE: `pages/StaffOrdersMobile/260406-01 StaffOrdersMobile RELEASE.jsx` (4389 строк)
Задача: Исправить 5 UX-багов в компоненте OrderGroupCard (раскрытая карточка стола)
Вес: L×5 | Бюджет: ~$10-12 | Модель: С5v2

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

После удаления первым элементом expanded area (после `<React.Fragment>`) должен быть conditionally rendered контент секций:
```jsx
{tableRequests.length > 0 && <div>...}
```
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

Найти секцию запросов в hall-mode:
```
tableRequests.length > 0 && <div>
```
Добавить `ref={requestsSectionRef}` к первому `<div>`.

Найти секцию В РАБОТЕ в hall-mode:
```
inProgressSections.length > 0 && <div>
```
Добавить `ref={inProgressSectionRef}` к первому `<div>`.

Найти секцию НОВЫЕ в hall-mode:
```
newOrders.length > 0 && <div>
```
Добавить `ref={newSectionRef}` к первому `<div>`.

Найти секцию ГОТОВО в hall-mode:
```
readyOrders.length > 0 && <div>
```
Добавить `ref={readySectionRef}` к первому `<div>`.

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

Добавить `scrollToSection` в dependency array: `}, [getSummaryTone, scrollToSection]);`

**⚠️ Dependency array**: Проверить текущий массив зависимостей. Добавить `scrollToSection` к СУЩЕСТВУЮЩИМ зависимостям, не заменять весь массив.

### Проверка
```bash
grep -c "scrollToSection" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥3 (definition + chip onClick + Fix 4 usage)
grep -c "stopPropagation" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥1
```

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

### ⚠️ DISCOVERY STEP (обязательно перед реализацией)

`setUndoToast` вызывается НЕ напрямую из кнопки — есть call chain. Перед реализацией:

1. Найти тело `handleSingleAction`:
```bash
grep -n "const handleSingleAction\|function handleSingleAction" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```

2. Проверить что вызывает `handleSingleAction` и где в этой цепочке вызывается `setUndoToast`:
```bash
grep -n "setUndoToast(" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```

3. Проследить полный path: `handleSingleAction → ? → setUndoToast(...)`. Возможны промежуточные функции (например `startUndoWindow`). Все промежуточные функции нужно обновить для передачи `rowId`.

### Что менять

**Шаг A — обновить кнопку в renderHallRows.**

Grep:
```
onClick={() => handleSingleAction(row.order)
```

Изменить на:
```jsx
onClick={() => handleSingleAction(row.order, row.id)}
```

**Шаг B — обновить все функции в call chain.**

Для каждой промежуточной функции между `handleSingleAction` и `setUndoToast`:
- Добавить `rowId` как параметр
- Передать его дальше по chain

В самом конце, где вызывается `setUndoToast({...})`:
```jsx
setUndoToast({ ..., rowId })
```

**Шаг C — обновить логику showToast в renderHallRows.**

Grep:
```
const isLastOfOrder
```

Заменить обе строки:
```js
const isLastOfOrder = ...
const showToast = ... isLastOfOrder ...
```

Новым кодом:
```js
const showToast = undoToast && row.order?.id === undoToast.orderId && row.id === undoToast.rowId && !renderedToast.has(undoToast.orderId);
if (showToast) renderedToast.add(undoToast.orderId);
```

Строку `const isLastOfOrder = ...` удалить — больше не нужна.
Строку `if (showToast) renderedToast.add(toastOrderId)` — заменена строкой выше.

**⚠️ Dependency array renderHallRows**: добавить новые зависимости к СУЩЕСТВУЮЩИМ, не заменять весь массив.

### Проверка
```bash
grep -c "rowId" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥3 (button onClick, setUndoToast call, showToast condition)
```

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

⚠️ Если причина не найдена в маппинге — показать как обычный текст, не мёртвую кнопку.

Grep для поиска рендеринга причин в hall-mode (~line 2206):
```
closeDisabledReasons.map
```

⚠️ Этот паттерн встречается в 3 местах (legacy1, legacy2, hall-mode). Менять только hall-mode (~line 2206) — ближайший перед `</React.Fragment>` в hall-mode path.

Текущий код в hall-mode:
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
Строки блюд в `renderHallRows` не показывают визуальную срочность по возрасту заказа. UX #13 требует urgency на строках внутри раскрытого стола.

### Wireframe

```
Строки блюд (В РАБОТЕ секция):
БЫЛО:                               ДОЛЖНО БЫТЬ:
┌──────────────────────────────┐    ┌──────────────────────────────┐
│ [Борщ ×1]           Далее   │    │ [Борщ ×1]           Далее   │  ← <порог: обычный
├──────────────────────────────┤    ├──────────────────────────────┤
│ [Котлета ×1]        Далее   │    │▌[Котлета ×1]        Далее   │  ← порог..+5 мин: amber
└──────────────────────────────┘    └──────────────────────────────┘
                                    ┌──────────────────────────────┐
                                    │▌[Стейк ×1]          Далее   │  ← ≥порог+5: red
                                    └──────────────────────────────┘
```

### ⚠️ DISCOVERY STEP (перед реализацией)

Проверить что `overdueMinutes` доступен в scope `OrderGroupCard`:
```bash
grep -n "overdueMinutes" "pages/StaffOrdersMobile/staffordersmobile.jsx"
```
Если `overdueMinutes` это prop компонента — он доступен внутри `renderHallRows` через closure. Если НЕ найден — использовать `10` как fallback.

### Что менять

Grep для поиска нужного места в renderHallRows:
```
rows.map((row, idx) => {
```

Внутри `.map()`, **после** проверки `isLastOfOrder` и `showToast` (или на их месте если Fix 3 применён), добавить расчёт urgency:
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

`getAgeMinutes` — глобальная функция в файле, вызывать напрямую.

**⚠️ Dependency array renderHallRows**: если `overdueMinutes` используется внутри callback — добавить к СУЩЕСТВУЮЩИМ зависимостям. Не переписывать весь массив.

### Проверка
```bash
grep -c "urgencyClass" "pages/StaffOrdersMobile/staffordersmobile.jsx"
# ожидается: ≥2 (def + className)
```

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

   # Fix 2: scroll подключён + stopPropagation
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
   # ожидается: ≥2 (bulk actions должны остаться)
   grep -c "renderLegacyOrderCard" "pages/StaffOrdersMobile/staffordersmobile.jsx"
   # ожидается: ≥2 (legacy rendering не тронуто)
   ```
