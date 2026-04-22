---
task: fix-stafforders-bugs-s76
type: bugfix
budget: "$10"
priority: P1
page: StaffOrdersMobile + PublicMenu
---

# Задача: Fix StaffOrders Bugs S76

## Баги для исправления

### BUG-S76-01 (i18n) — бейдж статуса на карточке
**Страница:** StaffOrdersMobile
**Что видно:** бейдж на карточке заказа показывает сырой i18n ключ `orderprocess.default.new` вместо человекочитаемого текста "Новый"
**Ожидание:** бейдж показывает переведённый текст статуса
**Файл:** `pages/StaffOrdersMobile/260304-00 StaffOrdersMobile RELEASE.jsx`

### BUG-S76-02 (i18n) — кнопка действия
**Страница:** StaffOrdersMobile
**Что видно:** кнопка действия показывает `→ orderprocess.default.cooking` вместо текста
**Ожидание:** кнопка показывает "Принять" / "Готово" / "Подано" и т.д.
**Файл:** `pages/StaffOrdersMobile/260304-00 StaffOrdersMobile RELEASE.jsx`

### BUG-S76-03 (Logic) — имя покупателя не показывается
**Страница:** StaffOrdersMobile (detail view для Pickup/Delivery)
**Что видно:** в detail view для заказа Самовывоз/Доставка показывается "гость не определён" вместо имени из чекаута
**Ожидание:** показывать `order.client_name` (поле существует в Order entity, заполняется при оформлении Pickup/Delivery)
**Контекст:** при оформлении заказа в PublicMenu поля `client_name` и `client_phone` записываются в Order. StaffOrdersMobile UI просто не читает эти поля.
**Файл:** `pages/StaffOrdersMobile/260304-00 StaffOrdersMobile RELEASE.jsx`

### BUG-S76-04 (UX) — баннер "Неверный код" на PublicMenu
**Страница:** PublicMenu (x.jsx)
**Что видно:** при входе по невалидному QR-коду (или без кода) на странице меню висит постоянный красный баннер "Неверный код стола", который не исчезает
**Ожидание:** заменить на одноразовый toast (появляется при загрузке, через 3-5 секунд исчезает). После dismiss — чистое меню. Гость может показать экран меню официанту для ручного заказа.
**Файл:** `pages/PublicMenu/260304-01 x RELEASE.jsx`

## Acceptance criteria
1. Все 4 бага исправлены
2. Нет сырых i18n ключей на карточках StaffOrders
3. Имя клиента из checkout отображается в Pickup/Delivery карточках
4. "Неверный код" — toast, не постоянный баннер

## RELEASE
- `260305-00 StaffOrdersMobile RELEASE.jsx` (если redesign задача не создаст свой — иначе `260305-01`)
- `260305-00 x RELEASE.jsx` (PublicMenu)
