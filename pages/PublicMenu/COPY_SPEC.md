---
version: "1.0"
created: "2026-03-07"
updated: "2026-03-07"
session: 97
depends_on:
  - public-menu.md v4.1
  - STYLE_GUIDE.md v3.1
  - ACCEPTANCE_CRITERIA_PHASE1.md v1.0
---

# COPY_SPEC — UI Тексты PublicMenu

Единый справочник текстов для PublicMenu. Все i18n ключи и их переводы (RU / EN / KK). Используется CC+Codex при реализации + Arman при импорте переводов в B44.

**Принцип:** тексты для гостя ресторана — короткие, понятные, без жаргона. Гость одной рукой держит телефон, второй — вилку. Каждое слово на вес золота.

---

## Фаза покрытия

**Phase 1 (этот документ):** core flow — меню, добавление, drawer, отправка, подтверждение, ошибки.

**Phase 2+ (будущие дополнения):** visit states, bill, модификаторы, table confirmation, loyalty, orders history.

---

## 1. StickyCartBar

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `cart.bar.items` | `{count} {блюдо/блюда/блюд}` | `{count} {item/items}` | `{count} {тағам}` | Счётчик. Plural: 1 блюдо, 2 блюда, 5 блюд |
| `cart.bar.new_order` | `Новый заказ` | `New order` | `Жаңа тапсырыс` | Разделитель |
| `cart.bar.my_order` | `Мой заказ` | `My order` | `Менің тапсырысым` | Visit mode |
| `cart.bar.sent_count` | `{count} отправлено` | `{count} sent` | `{count} жіберілді` | Sent orders |
| `cart.bar.unpaid` | `Не оплачено {amount}` | `Unpaid {amount}` | `Төленбеген {amount}` | Visit mode |

---

## 2. Cart Drawer — Header

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `drawer.table` | `Стол {number}` | `Table {number}` | `Үстел {number}` | Шапка drawer |
| `drawer.guest` | `Гость {number}` | `Guest {number}` | `Қонақ {number}` | Рядом с номером стола |
| `drawer.new_order` | `НОВЫЙ ЗАКАЗ` | `NEW ORDER` | `ЖАҢА ТАПСЫРЫС` | Section title, caps |
| `drawer.my_orders` | `МОИ ЗАКАЗЫ` | `MY ORDERS` | `МЕНІҢ ТАПСЫРЫСТАРЫМ` | Section title |
| `drawer.bill` | `СЧЁТ` | `BILL` | `ШОТТАМА` | Section title |
| `drawer.bill.mine` | `Только мои: {amount}` | `Mine: {amount}` | `Менікі: {amount}` | Bill line |
| `drawer.bill.total` | `Общий: {amount}` | `Total: {amount}` | `Жалпы: {amount}` | Bill line |

---

## 3. CTA Buttons

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `cta.send_order` | `Отправить официанту` | `Send to waiter` | `Даяшыға жіберу` | Primary CTA, V1+D1 |
| `cta.send_new_order` | `Отправить новый заказ` | `Send new order` | `Жаңа тапсырыс жіберу` | V4+D1 |
| `cta.sending` | `Отправляем...` | `Sending...` | `Жіберілуде...` | Loading state |
| `cta.retry` | `Повторить отправку` | `Retry` | `Қайта жіберу` | Error state V6+D3 |
| `cta.order_more` | `Заказать ещё` | `Order more` | `Тағы тапсырыс беру` | V3+D0, after confirm |
| `cta.open_bill` | `Открыть счёт` | `View bill` | `Шотты ашу` | Secondary, V3 |
| `cta.continue` | `Продолжить выбор` | `Continue browsing` | `Таңдауды жалғастыру` | Secondary |
| `cta.back_to_menu` | `Вернуться в меню` | `Back to menu` | `Мәзірге оралу` | Secondary |

---

## 4. Confirmation Screen

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `confirm.title` | `Заказ отправлен официанту` | `Order sent to waiter` | `Тапсырыс даяшыға жіберілді` | Main text после ✓ |
| `confirm.wait` | `Подтверждение ~1-2 мин` | `Confirmation ~1-2 min` | `Растау ~1-2 мин` | Expectation setting |
| `confirm.my_orders` | `Мои заказы` | `My orders` | `Менің тапсырыстарым` | Secondary link |

---

## 5. Empty States

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `empty.cart.title` | `Корзина пуста` | `Cart is empty` | `Себет бос` | Drawer empty |
| `empty.cart.subtitle` | `Выберите блюда из меню` | `Choose dishes from the menu` | `Мәзірден тағамдарды таңдаңыз` | Explanation |
| `empty.cart.cta` | `Открыть меню` | `Open menu` | `Мәзірді ашу` | CTA |
| `empty.menu.title` | `Меню пока пусто` | `Menu is empty` | `Мәзір әзірше бос` | 0 dishes |
| `empty.menu.subtitle` | `Скоро здесь появятся блюда` | `Dishes will appear here soon` | `Тағамдар жақын арада пайда болады` | Explanation |
| `empty.orders.title` | `Пока нет заказов` | `No orders yet` | `Тапсырыстар жоқ` | My Orders empty |
| `empty.orders.subtitle` | `Выберите блюда в меню` | `Choose dishes from the menu` | `Мәзірден тағамдарды таңдаңыз` | Explanation |

---

## 6. Error States

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `error.load.title` | `Не удалось загрузить` | `Failed to load` | `Жүктеу мүмкін болмады` | Network/server error |
| `error.load.subtitle` | `Проверьте интернет и попробуйте снова` | `Check your internet and try again` | `Интернетті тексеріп, қайта көріңіз` | Explanation |
| `error.load.cta` | `Попробовать снова` | `Try again` | `Қайта көру` | CTA |
| `error.send.title` | `Не удалось отправить` | `Failed to send` | `Жіберу мүмкін болмады` | Submit error |
| `error.send.subtitle` | `Ваш заказ сохранён. Попробуйте снова` | `Your order is saved. Try again` | `Тапсырысыңыз сақталды. Қайта көріңіз` | Draft preserved |

---

## 7. Toasts / Snackbars

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `toast.added` | `Добавлено` | `Added` | `Қосылды` | After "+" on dish |
| `toast.removed` | `Удалено` | `Removed` | `Жойылды` | After remove in cart |

---

## 8. Modifier Guard (Phase 1)

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `modifier.guard.title` | `Выбор опций скоро будет доступен` | `Options selection coming soon` | `Опциялар таңдауы жақын арада қосылады` | Блюдо с required modifier |
| `modifier.guard.subtitle` | `Пока вы можете заказать это блюдо через официанта` | `You can order this dish through the waiter for now` | `Әзірше бұл тағамды даяшы арқылы тапсырыс бере аласыз` | Workaround hint |

---

## 9. Menu Navigation

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `menu.search.placeholder` | `Найти блюдо...` | `Find a dish...` | `Тағам іздеу...` | Search input (Phase 2, но i18n key нужен) |
| `menu.mode.hall` | `В зале` | `Dine in` | `Залда` | Service mode tab |
| `menu.mode.pickup` | `Самовывоз` | `Pickup` | `Өзі алу` | Service mode tab |
| `menu.mode.delivery` | `Доставка` | `Delivery` | `Жеткізу` | Service mode tab |

---

## 10. Loyalty Preview

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `loyalty.preview.savings` | `Ожидаемая выгода` | `Estimated savings` | `Болжамды жеңілдік` | Label в drawer |
| `loyalty.preview.bonus` | `+{count} бонус` | `+{count} bonus` | `+{count} бонус` | Bonus line |
| `loyalty.banner` | `По QR: бонусы и скидки` | `QR ordering: bonuses & discounts` | `QR арқылы: бонустар мен жеңілдіктер` | Compact banner (Phase 2) |

---

## 11. Misc

| i18n key | RU | EN | KK | Контекст |
|----------|-----|-----|-----|----------|
| `common.currency` | `₸` | `₸` | `₸` | Тенге |
| `common.close` | `Закрыть` | `Close` | `Жабу` | Universal close |
| `common.cancel` | `Отмена` | `Cancel` | `Болдырмау` | Universal cancel |
| `common.edit` | `Изменить` | `Edit` | `Өзгерту` | Universal edit |
| `time.minutes_ago` | `{count} мин назад` | `{count} min ago` | `{count} мин бұрын` | Order timestamp |

---

## Правила копирайтинга

1. **Максимум 5 слов** в CTA кнопке. Исключение: "Отправить официанту" (3 слова — ок).
2. **Глагол первым** в CTA: "Отправить", "Заказать", "Открыть", "Вернуться".
3. **Без восклицательных знаков** в CTA и заголовках (спокойный тон).
4. **Plural forms:** RU имеет 3 формы (1 блюдо, 2 блюда, 5 блюд). EN — 2 (1 item, 2 items). KK — 1 форма.
5. **Без капслока** в body text. CAPS только в section titles (НОВЫЙ ЗАКАЗ, МОИ ЗАКАЗЫ).
6. **Точка в конце** subtitle/explanation. Без точки в CTA и заголовках.
7. **Нет "пожалуйста"** в error CTA — императивно: "Попробовать снова" (не "Пожалуйста, попробуйте снова").
8. **Тенге** всегда символом ₸ после числа: `3400 ₸` (с пробелом).

---

## Формат CSV для импорта в B44

```csv
"key","page","description","ru","en","kk"
"cart.bar.new_order","x","StickyCartBar divider","Новый заказ","New order","Жаңа тапсырыс"
```

Режим импорта: **Merge** (не overwrite существующие, добавить новые).

---

## История изменений

| Дата | Сессия | Что изменилось |
|------|--------|---------------|
| 2026-03-07 | S97 | v1.0 — Создан. 11 секций, ~60 i18n keys. Phase 1 core flow + empty/error states + modifier guard + loyalty preview. Правила копирайтинга. CSV формат |
