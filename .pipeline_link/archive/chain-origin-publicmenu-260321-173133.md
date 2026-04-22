---
page: PublicMenu
code_file: pages/PublicMenu/base/CartView.jsx
budget: 15
agent: cc+codex
chain_template: consensus-with-versioning
---

# PM-071: Bottom Sheet trigger для Table Confirmation [H]

Reference: `ux-concepts/public-menu.md` v4.1, `ux-concepts/UX_LOCKED_PublicMenu.md`, `STYLE_GUIDE.md`, `BUGS_MASTER.md`.

---

## Fix 1 — PM-071 (P1) [MUST-FIX]: Bottom Sheet «Подтвердите стол» не открывается

### Сейчас (текущее поведение)
Новый гость (стол не верифицирован, localStorage пуст) нажимает «Отправить официанту» в drawer корзины → **ничего не происходит**.

Детали:
- Кнопка визуально активна (терракотовая), не disabled — TC-3 ✅
- Клик регистрируется (Network: `analytics/track/batch` POST 200)
- Заказ НЕ уходит — P0-гейт `isTableVerified` работает ✅
- Но Bottom Sheet «Подтвердите стол» НЕ появляется
- В DOM нет ни одного BS-компонента (`role="dialog"` — только drawer корзины)
- В консоли нет app-ошибок, только Chrome extension warnings

Пользователь в тупике: кнопка есть, нажал, ноль реакции. Не может ввести код стола → не может отправить заказ.

### Должно быть (ожидаемое поведение)
Клик на «Отправить официанту» при `!isTableVerified`:
1. Drawer корзины остаётся открытым (НЕ закрывается)
2. Поверх drawer появляется Bottom Sheet (~75-85% высоты экрана) с:
   - Заголовок: «Подтвердите стол»
   - Подзаголовок: «Чтобы отправить заказ официанту»
   - Поле ввода кода стола (4-6 цифр, `tableCodeLength` из partner config)
   - Кнопка CTA: «Подтвердить и отправить» (терракотовая)
   - Ссылка: «Не тот стол? Изменить»
3. После ввода верного кода → `isTableVerified = true` → заказ отправляется

Ref: `ux-concepts/public-menu.md` §E (Table Confirmation flow).

### НЕ должно быть (анти-паттерны)
- **НЕ ВОЗВРАЩАТЬ inline-инпут кода стола в drawer** — он был удалён в Batch 4 (201 строк). Это было правильно. Не откатывать.
- **НЕ убирать P0-гейт** на `isTableVerified` в `handleSubmitOrder` — он блокирует orphan orders. Оставить.
- **НЕ отправлять заказ без верификации стола** — даже если кажется что "так проще".
- **НЕ показывать fullscreen overlay** — только Bottom Sheet поверх drawer.

### Файл и локация
Файл: `CartView.jsx` (основной файл — `pages/PublicMenu/base/CartView.jsx`)

Вероятная проблема: в функции `handleSubmitOrder` (или аналогичном onClick кнопки «Отправить официанту») есть проверка `if (!isTableVerified) return;` (или `if (!isTableVerified) { /* ничего */ }`), но **отсутствует** вызов `setShowTableVerificationSheet(true)` перед return.

Нужно:
1. Найти обработчик кнопки «Отправить официанту» → внутри, ПЕРЕД P0-гейтом (или В блоке гейта) добавить: `setShowTableVerificationSheet(true)` (или как назван state).
2. Убедиться что JSX содержит условный рендер BS: `{showTableVerificationSheet && <BottomSheet>...</BottomSheet>}` — если этого нет, добавить.
3. Bottom Sheet должен содержать: заголовок, поле ввода, CTA кнопку, ссылку «Не тот стол?».
4. При успешной верификации: `setShowTableVerificationSheet(false)` + `setIsTableVerified(true)` + отправить заказ.

### Уже пробовали
Batch 4, chain `publicmenu-260321-140331` ($4.69, 6 фиксов):
- КС добавил P0-гейт ✅
- КС удалил inline verification (201 строк) ✅
- КС описал CTA кнопку в BS ✅
- **НО не подключил onClick → BS open trigger.** Старый путь (inline) убрали, новый путь (BS) к нему не подключили.

Вероятная причина: merge применил delete (inline) и add (P0-гейт) корректно, но пропустил связку onClick → setState. Это типичная проблема при рефакторинге: удаление + добавление по отдельности ОК, но интеграция пропущена.

### Проверка (мини тест-кейс)
1. Инкогнито → `/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`
2. Добавить любое блюдо → нажать «Оформить заказ» → drawer открывается
3. Нажать «Отправить официанту» → **Bottom Sheet «Подтвердите стол» появляется**
4. Ввести код стола → нажать «Подтвердить и отправить» → заказ уходит

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код, описанный в Fix 1 (Bottom Sheet trigger + BS UI).
- ВСЁ остальное (цвета чипов, stepper, StickyCartBar, layout) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions: см. `ux-concepts/UX_LOCKED_PublicMenu.md` — ЗАПРЕЩЕНО менять.

## Prompt Clarity
_(заполняется CC/Codex writer после выполнения)_

## Implementation Notes
- Основной файл: `CartView.jsx`
- Может потребоваться также: `x.jsx` (если state поднят выше)
- НЕ ломать: PM-063 (stepper «− 1 +»), PM-041 (polling clean), P0-гейт `isTableVerified`
- Ref: STYLE_GUIDE.md (#B5543A primary), BUGS_MASTER.md (PM-064, PM-071)
- git add [конкретные файлы] && git commit -m "PM-071: add BS trigger for table verification" && git push
