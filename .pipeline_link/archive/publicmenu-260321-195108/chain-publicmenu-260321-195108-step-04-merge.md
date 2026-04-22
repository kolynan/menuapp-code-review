---
chain: publicmenu-260321-195108
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260321-195108
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260321-195108-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260321-195108-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/base/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260321-195108"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260321-195108-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260321-195108

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
