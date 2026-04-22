---
chain: publicmenu-260321-195108
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 15.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260321-195108-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260321-195108

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

Do NOT apply fixes — only document findings.

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
