---
chain: publicmenu-260323-223605-98ba
chain_step: 3
chain_total: 4
chain_step_name: discussion
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion (3/4) ===
Chain: publicmenu-260323-223605-98ba
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step by running a multi-round discussion between CC and Codex.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260323-223605-98ba-comparison.md
2. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260323-223605-98ba-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260323-223605-98ba
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   Run up to 3 rounds of discussion. Each round:

   a) CC Position (you write):
      For each dispute, write your analysis:
      - Which solution is better and WHY (with code reasoning)
      - What edge cases or risks does each approach have

   b) Codex Position (run codex):
      Create a prompt file with CC's position and ask Codex to respond.
      Run: codex.cmd exec --model codex-mini --prompt "<prompt>" --quiet
      The prompt should include CC's position and ask Codex to:
      - Agree or disagree with CC's reasoning
      - Provide counter-arguments if it disagrees
      - Propose a compromise if possible

   c) After each round, check:
      - If both agree on all disputes → RESOLVED, stop early
      - If round 3 and still disagree → mark as UNRESOLVED for Arman

3. Write final discussion report to: pipeline/chain-state/publicmenu-260323-223605-98ba-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260323-223605-98ba

## Disputes Discussed
Total: N disputes from Comparator

## Round 1
### Dispute 1: [title]
**CC Position:** ...
**Codex Position:** ...
**Status:** resolved/ongoing

### Dispute 2: [title]
...

## Round 2 (if needed)
...

## Round 3 (if needed)
...

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Title   | 2      | resolved   | CC/Codex/compromise |
| 2 | Title   | 3      | unresolved | → Arman |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Unresolved (for Arman)
Items where CC and Codex could not agree after 3 rounds.
Arman must decide. Each item shows both positions.

4. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# UX Batch S170: Price decimals + List stepper overlay + Chevron alignment

Reference: `ux-concepts/UX_LOCKED_PublicMenu.md`, `ux-concepts/public-menu.md`, `BUGS_MASTER.md`.

TARGET FILES (modify):
- `pages/PublicMenu/MenuView.jsx` — Fix 1 (formatPrice), Fix 2 (list stepper overlay)
- `pages/PublicMenu/x.jsx` — Fix 3 (chevron/handle area wrapper)
- `pages/PublicMenu/CartView.jsx` — Fix 3 (drag handle + ChevronDown element)

CONTEXT FILES (read only, do not modify unless Fix 3 explicitly requires it):
- `pages/PublicMenu/CheckoutView.jsx`

---

## Fix 1 — PM-101 (P2) [MUST-FIX]: formatPrice обрезает значимые десятичные

### Сейчас (текущее поведение)
Функция `formatPrice` в `MenuView.jsx` обрезает десятичную часть. Пример: цена `32.50` отображается как `32` в меню клиента. Незначимые нули (`32.00` → `32`) — допустимо. Значимые десятичные (`32.50` → `32.50`) — должны сохраняться.

### Должно быть (ожидаемое поведение)
- `32.00` → показывать `32` (незначимые нули убирать, OK)
- `32.50` → показывать `32.50` (значимые десятичные сохранять)
- `32.5` → показывать `32.5`
- `32` (integer) → показывать `32`
- Логика: если дробная часть ≠ 0 → показывать с нужным количеством знаков; если дробная = 0 → показывать без десятичных.

Ref: BUGS_MASTER.md PM-101.

### НЕ должно быть
- `parseFloat('32.50').toString()` даёт `"32.5"` — это приемлемо.
- `parseInt` или `Math.round` — ЗАПРЕЩЕНО (обрезает дробную часть).
- `toFixed(2)` на целых числах — ЗАПРЕЩЕНО (даст `32.00`, некрасиво).

### Файл и локация
Файл: `pages/PublicMenu/MenuView.jsx`
Найти функцию `formatPrice` (поиск по строке `formatPrice`).
Текущая реализация скорее всего делает `parseInt(price)` или `Math.round(price)` или аналог.
Правильная реализация:
```js
const formatPrice = (price) => {
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? num.toString() : num.toString();
  // OR: return String(parseFloat(num.toFixed(2))); // убирает trailing zeros
};
```
Самый чистый вариант: `String(parseFloat(parseFloat(price).toFixed(10)))` — убирает trailing zeros, сохраняет значимые.

### Уже пробовали
Не пробовали — PM-101 впервые в КС.

### Проверка
1. Добавить блюдо с ценой `32.50` через PartnerSettings.
2. Открыть меню клиента → цена должна отображаться `32.50`, не `32`.
3. Блюдо с ценой `50` → должно отображаться `50` (без `.00`).

---

## Fix 2 — PM-115 (P3) [MUST-FIX]: List-mode stepper overlay поверх фото

### Сейчас (текущее поведение)
В list-mode (горизонтальные карточки с фото справа), когда блюдо добавлено в корзину, степпер `-N+` растягивается на полную ширину карточки снизу. Карточки с блюдами в корзине становятся выше → неравномерная высота карточек в списке.

### Должно быть (ожидаемое поведение)
Степпер `-N+` должен быть поверх фото, в bottom-right углу фото — как «+» кнопка когда блюда ещё нет в корзине (pattern: `position: absolute`, bottom и right относительно фото-контейнера). Высота карточки всегда одинакова независимо от наличия блюда в корзине.

Ref: PM-110 (tile overlay) и PM-111 (tile + stepper) — аналогичный паттерн уже реализован в tile-mode в MenuView.jsx. СКОПИРОВАТЬ тот же подход для list-mode.

### НЕ должно быть
- Степпер НЕ должен быть под карточкой или снизу карточки.
- НЕ должен растягиваться на полную ширину.
- НЕ должен увеличивать высоту карточки.

### Файл и локация
Файл: `pages/PublicMenu/MenuView.jsx`
Функция: `renderListCard` (поиск по `renderListCard`).
Сейчас: при `inCart` (блюдо в корзине) рендерится степпер как отдельный блок снизу карточки.
Нужно: обернуть фото-контейнер в `position: relative`, разместить степпер как `position: absolute; bottom: X; right: X` поверх фото.
Образец: посмотреть как реализован overlay в `renderTileCard` для tile-mode (PM-110/111 уже там).

### Уже пробовали
Не пробовали — PM-115 впервые в КС.

### Проверка
1. Открыть меню клиента в list-mode.
2. Добавить блюдо в корзину.
3. Степпер должен появиться поверх фото (bottom-right), карточка не должна стать выше.
4. Нажать `-` → `+` → корректно изменяет количество.

---

## Fix 3 — PM-104 (P3) [MUST-FIX]: Шеврон ˅ не выровнен с drag handle, размер мал

### Сейчас (текущее поведение)
В bottom sheet (корзина или другой drawer), шеврон ˅ (ChevronDown) визуально не выровнен с серой горизонтальной полосой (drag handle). Размер иконки: 28px — слишком мал для удобного нажатия.

### Должно быть (ожидаемое поведение)
- ChevronDown размер: 36px (или w-9 h-9 в Tailwind).
- ChevronDown выровнен по вертикали с drag handle полосой (flex items-center или absolute позиционирование на одном уровне).
- Tap target: кнопка с ChevronDown должна быть минимум 44×44px (ЛМП).

Ref: BUGS_MASTER.md PM-104.

### НЕ должно быть
- Размер 28px или меньше.
- Шеврон и drag handle на разных вертикальных уровнях.

### Файл и локация
**ВАЖНО (PQ-021, урок S168):** ChevronDown рендерится в `CartView.jsx`, drag handle также в `CartView.jsx`. В предыдущих задачах CartView.jsx был помечен как read-only → КС не мог исправить баг. В ЭТОЙ задаче `CartView.jsx` — TARGET файл, его МОЖНО и НУЖНО редактировать.

Файл 1: `pages/PublicMenu/CartView.jsx`
- Найти drag handle элемент (поиск по `drag` или `rounded-full bg-gray` или аналог серой полосы).
- Найти ChevronDown (поиск по `ChevronDown`).
- Изменить размер ChevronDown: `w-7 h-7` → `w-9 h-9` (или size={36}).
- Выровнять ChevronDown с drag handle: поместить в flex-контейнер с `items-center`, или убедиться что оба на одном уровне (одинаковый top/bottom в absolute позиционировании).

Файл 2: `pages/PublicMenu/x.jsx`
- Проверить, есть ли ChevronDown также в x.jsx (для других BS/drawer).
- Применить те же изменения размера если есть.

### Уже пробовали
- Chain bfb4 (S168): drag handle restored в x.jsx, но chevron alignment и размер не исправлены.
- Причина прошлых пропусков (S165-S167): CartView.jsx был в SCOPE LOCK как read-only → writer не мог трогать. В ЭТОЙ задаче CartView.jsx в TARGET.

### Проверка
1. Открыть корзину (bottom sheet) в приложении.
2. Drag handle полоса и шеврон ˅ должны быть на одном визуальном уровне.
3. Иконка шеврона: визуально больше (36px).
4. Нажать на шеврон → BS закрывается.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что описано выше

- Изменяй ТОЛЬКО код, описанный в Fix 1, Fix 2, Fix 3 выше.
- ВСЁ остальное (другие UI элементы, цвета, layout, поведение, UX) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- PM-110/PM-111 (tile overlay) — уже реализованы и работают, НЕ ТРОГАТЬ.
- PM-109 (discount toggle) — уже реализован, НЕ ТРОГАТЬ.
- History API / popstate / back button logic (PM-105, PM-S81-15) — НЕ ТРОГАТЬ.
- Locked UX decisions: `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.

## Implementation Notes

- TARGET FILES: `MenuView.jsx`, `x.jsx`, `CartView.jsx`
- НЕ ломать: PM-110/111 tile overlay, PM-109 discount guard, PM-S81-15 back button
- Ref: `ux-concepts/UX_LOCKED_PublicMenu.md`, `BUGS_MASTER.md`, `STYLE_GUIDE.md`
- git add + git commit после всех фиксов
- Fix 3: CartView.jsx IS in scope — это принципиально для данной задачи
=== END ===
