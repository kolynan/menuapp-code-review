---
title: B44 Prompt — Add i18n translations for confirmation + order_status keys
session: S71
date: 2026-03-03
type: DataTask (InterfaceTranslation records)
status: ready-to-submit
---

# B44 Prompt: Add i18n translations — confirmation.* + order_status.*

> **Куда вставлять:** B44 Admin Panel → AI Prompt
> **Тип:** Создание записей InterfaceTranslation (не код)

---

```
START

PROJECT: MenuApp (Base44)

TASK ID: TASK-260303-05
TITLE: Add i18n translations for confirmation.* and order_status.* keys

GOAL:
Create InterfaceTranslation records for all missing translation keys used by
OrderConfirmationScreen and OrderStatusScreen components. Currently these keys
display as raw strings (e.g. "confirmation.title", "order_status.step_received").

CONTEXT:
- OrderConfirmationScreen was added in pages/x.jsx (260303-02 release)
- OrderStatusScreen was added in pages/x.jsx (260303-04 release)
- Both use t() from useI18n hook
- All listed keys below are confirmed missing from InterfaceTranslation entity
- Language: Russian (primary), English (secondary)

SCOPE:
- Create: InterfaceTranslation records (entity only)
NO source code files. NO page changes. NO layout changes.

LOCKED (must-follow):
- Do NOT modify any page source code
- Do NOT change Data Model
- Do NOT change routing/auth/layout/security
- Only create new InterfaceTranslation records
- If a key already exists — skip (do not duplicate or overwrite)

SPECIFICATIONS:

Create InterfaceTranslation records for the following keys:

--- CONFIRMATION SCREEN ---

Key: confirmation.title
ru: "Заказ принят!"
en: "Order Placed!"

Key: confirmation.your_order
ru: "Ваш заказ"
en: "Your Order"

Key: confirmation.total
ru: "Итого"
en: "Total"

Key: confirmation.client_name
ru: "Имя"
en: "Name"

Key: confirmation.back_to_menu
ru: "Вернуться в меню"
en: "Back to Menu"

Key: confirmation.my_orders
ru: "Мои заказы"
en: "My Orders"

Key: confirmation.track_order
ru: "Отслеживать заказ"
en: "Track Order"

--- ORDER STATUS SCREEN ---

Key: order_status.title
ru: "Статус заказа"
en: "Order Status"

Key: order_status.back_to_menu
ru: "Вернуться в меню"
en: "Back to Menu"

Key: order_status.status_new
ru: "Заказ принят"
en: "Order Received"

Key: order_status.step_received
ru: "Принят"
en: "Received"

Key: order_status.step_preparing
ru: "Готовится"
en: "Preparing"

Key: order_status.step_ready
ru: "Готов"
en: "Ready"

Key: order_status.last_updated
ru: "Обновлено"
en: "Updated"

Key: order_status.seconds_ago
ru: "сек. назад"
en: "sec. ago"

Key: order_status.your_order
ru: "Ваш заказ"
en: "Your Order"

Key: order_status.total
ru: "Итого"
en: "Total"

Key: order_status.discount
ru: "Скидка"
en: "Discount"

Key: order_status.questions
ru: "Есть вопросы?"
en: "Questions?"

Key: order_status.loading
ru: "Загрузка..."
en: "Loading..."

Key: order_status.not_found
ru: "Заказ не найден"
en: "Order not found"

Key: order_status.error
ru: "Ошибка загрузки"
en: "Loading error"

TASKS:
1) For each key listed above: check if it already exists in InterfaceTranslation
2) If NOT exists — create record with { key, translations: { ru, en } }
3) If already exists — skip (do not modify)
4) Confirm total count created vs skipped

DELIVERABLES:
- All InterfaceTranslation records created (listed above)
- Summary: N created, N skipped

QA CHECKLIST:
- [ ] All confirmation.* keys created (7 keys)
- [ ] All order_status.* keys created (14 keys)
- [ ] No duplicates created
- [ ] No source code files modified

=== REPORT REQUEST ===
1) Total records created (with list of keys)
2) Total records skipped (already existed)
3) Any keys that failed to create (with reason)

=== FEEDBACK REQUEST ===
1) What was unclear in this prompt?
2) What did you assume?
3) Any suggestions to improve this prompt?

END
```
