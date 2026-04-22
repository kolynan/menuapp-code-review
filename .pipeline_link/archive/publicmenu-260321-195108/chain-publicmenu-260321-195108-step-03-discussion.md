---
chain: publicmenu-260321-195108
chain_step: 3
chain_total: 4
chain_step_name: discussion
page: PublicMenu
budget: 15.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion (3/4) ===
Chain: publicmenu-260321-195108
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step by running a multi-round discussion between CC and Codex.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260321-195108-comparison.md
2. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260321-195108-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260321-195108
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

3. Write final discussion report to: pipeline/chain-state/publicmenu-260321-195108-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260321-195108

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
# PM-071: Bottom Sheet trigger для Table Confirmation [H] (Production page)

Reference: `ux-concepts/public-menu.md` v4.1, `ux-concepts/UX_LOCKED_PublicMenu.md`, `STYLE_GUIDE.md`, `BUGS_MASTER.md`.

⚠️ Production page: PublicMenu — боевая страница заказов. Приоритеты расставлять как P1.

---

## Fix 1 — PM-071 (P1) [MUST-FIX]: Bottom Sheet «Подтвердите стол» не открывается

### Сейчас (текущее поведение)
Новый гость (стол не верифицирован, localStorage пуст) нажимает «Отправить официанту» в drawer корзины → **ничего не происходит**.

Детали (проверено тестом S155A):
- Кнопка визуально активна (терракотовая), не disabled ✅
- Клик регистрируется: Network видит `analytics/track/batch` POST 200
- Заказ НЕ уходит — P0-гейт `isTableVerified` блокирует ✅
- Bottom Sheet «Подтвердите стол» НЕ появляется ❌
- В DOM нет ни одного BS-компонента (`data-state="open"` только у CartView drawer)
- В консоли нет app-ошибок — тихое бездействие

Пользователь в тупике: кнопка нажата, ноль реакции. Не может ввести код стола → не может отправить заказ. Заказ В зале невозможен для нового гостя.

### Должно быть (ожидаемое поведение)
Клик на «Отправить официанту» при `!isTableVerified`:
1. Drawer корзины остаётся открытым (НЕ закрывается)
2. Поверх drawer появляется Bottom Sheet (~75-85% высоты экрана) с:
   - Заголовок: «Подтвердите стол»
   - Подзаголовок: «Чтобы отправить заказ официанту»
   - Поле ввода кода стола (4-6 цифр, `tableCodeLength` из partner config)
   - Кнопка CTA: «Подтвердить и отправить» (терракотовый `#B5543A`)
   - Ссылка: «Не тот стол? Изменить»
3. После ввода верного кода → `isTableVerified = true` → BS закрывается → заказ отправляется

Ref: `ux-concepts/public-menu.md` §E (Table Confirmation flow).

### НЕ должно быть (анти-паттерны)
- **НЕ возвращать inline-инпут кода стола в drawer** — удалён в Batch 4 (201 строк). Не откатывать.
- **НЕ убирать P0-гейт** на `isTableVerified` — он блокирует orphan orders. Оставить.
- **НЕ отправлять заказ без верификации стола** — даже если «так проще».
- **НЕ показывать fullscreen overlay** — только Bottom Sheet поверх drawer.
- **НЕ закрывать drawer** при открытии BS.

### Файл и локация
Файл: `CartView.jsx` (`pages/PublicMenu/base/CartView.jsx`)

Вероятная проблема: в обработчике кнопки «Отправить официанту» (функция `handleSubmitOrder` или onClick) есть проверка `if (!isTableVerified) { return; }` — но **нет** вызова `setShowTableVerificationSheet(true)` перед или вместо return.

Что нужно сделать:
1. Найти onClick кнопки «Отправить официанту» → в блоке `!isTableVerified` добавить: `setShowTableVerificationSheet(true)` (или как назван стейт BS).
2. Убедиться что JSX содержит: `{showTableVerificationSheet && <BottomSheet ...>}` — если нет, добавить.
3. BS должен содержать: заголовок, поле ввода, CTA кнопку, ссылку «Не тот стол?».
4. При успешной верификации: `setShowTableVerificationSheet(false)` + отправить заказ.

### Уже пробовали
Batch 4, chain `publicmenu-260321-140331` ($4.69):
- КС удалил inline verification (201 строк) ✅
- КС добавил P0-гейт ✅
- КС описал CTA кнопку в BS ✅
- **НО не подключил onClick → BS open trigger.** Старый путь удалили, новый к нему не привязали.

### Проверка (мини тест-кейс)
1. Инкогнито → `/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`
2. Добавить блюдо → «Оформить заказ» → drawer открыт, «Стол —»
3. Нажать «Отправить официанту» → **BS «Подтвердите стол» появляется поверх drawer**
4. Ввести код стола → «Подтвердить и отправить» → заказ уходит

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код, описанный в Fix 1 (BS trigger + BS UI компонент).
- ВСЁ остальное (цвета чипов, stepper, StickyCartBar, layout, другие страницы) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions: `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.

## Prompt Clarity
_(заполняется CC/Codex writer после выполнения: оценка 1-5 + что было неясно)_

## Implementation Notes
- Файл: `CartView.jsx`. Возможно также `x.jsx` если state поднят выше.
- НЕ ломать: PM-063 (stepper «− 1 +»), PM-041 (polling clean), P0-гейт `isTableVerified`
- git add pages/PublicMenu/base/CartView.jsx && git commit -m "PM-071: add BS open trigger on submit with unverified table" && git push
=== END ===
