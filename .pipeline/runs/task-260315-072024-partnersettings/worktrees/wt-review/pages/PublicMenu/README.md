---
version: "7.0"
updated: "2026-03-13"
session: 119
---

# PublicMenu — README

Страница публичного меню ресторана (`/x`). Гость сканирует QR-код, видит меню,
добавляет блюда, оформляет заказ. Работает в трёх режимах: зал, самовывоз, доставка.

## Текущий RELEASE

| Файл | RELEASE | Дата | Сессия |
|---|---|---|---|
| x.jsx | `260306-01 x RELEASE.jsx` | 06 мар 2026 | S87 |
| CartView.jsx | `260305-03 CartView RELEASE.jsx` | 05 мар 2026 | S82 |
| MenuView.jsx | `260305-02 MenuView RELEASE.jsx` | 05 мар 2026 | S79 |
| useTableSession.jsx | `260302-06 useTableSession RELEASE.jsx` | 02 мар 2026 | S68 |

## Активные баги

14 багов из S116 (BUG-PM-026 -- BUG-PM-039) подтверждены, все ещё активны.
8 новых багов найдено в S119 CC review (BUG-PM-040 -- BUG-PM-047): 2x P0 + 1x P1 + 4x P2 + 1x P3.
Итого активных: 22. Подробности в BUGS.md.

---

## Changelog (UX/UI решения)

### Session 119 — 13 мар 2026

- Full CC code review всех 6 base файлов (CartView, CheckoutView, MenuView, ModeTabs, useTableSession, x.jsx)
- 14 багов из S116 подтверждены как всё ещё активные
- BUG-PM-040 (P0): Loyalty points debited before order creation — no rollback on failure
- BUG-PM-041 (P0): Polling timer leak in useTableSession after cleanup
- BUG-PM-042 (P1): isBillOnCooldown crashes without try/catch in restricted environments
- BUG-PM-043 (P2): formatOrderTime + OrderStatusScreen hardcode ru-RU locale
- BUG-PM-044 (P2): loyalty_redeem_rate falsy-coalescing shows wrong value for rate=0
- BUG-PM-045 (P2): console.log left in production order submission
- BUG-PM-046 (P2): Redirect banner setTimeout not cleaned up on unmount
- BUG-PM-047 (P3): Multiple interactive elements missing aria-label

### Session 116 — 12 мар 2026

- BUG-PM-023: Исправлен краш при undefined `reviewedItems` — добавлен `safeReviewedItems` default
- BUG-PM-024: Исправлен краш при undefined `loyaltyAccount.balance` — обёрнуто в `Number(... || 0)`
- BUG-PM-025: Исправлен краш при undefined `draftRatings` — добавлен `safeDraftRatings` default
- V7 smoke test: полный code review всех base файлов PublicMenu
- Codex review (253k tokens): +14 багов найдено (6x P1 рег., 8x P2), добавлены в BUGS.md

### Session 87 — 07 мар 2026

- BUG-PM-S87-03: Кнопка «Отправить официанту» теперь серая когда disabled (код стола не введён) — добавлена подсказка «Введите код стола»
- BUG-PM-S87-01: Маркер :::ARCHIVED::: больше не виден гостям — регистронезависимая очистка описаний блюд
- BUG-PM-S87-02: Экран подтверждения заказа и кнопки корзины теперь показывают русский текст вместо сырых i18n ключей (добавлен tr() с фоллбэками)

### Session 85 — 06 мар 2026

- BUG-PM-034: Cart drawer setActiveSnapPoint теперь блокирует закрытие во время отправки заказа (добавлен !isSubmitting guard, симметрично с checkout drawer)

### Session 84 — 06 мар 2026

- BUG-S81-07: Убрано дублирование названия ресторана в шапке (теперь только в блоке логотип+название)
- BUG-S81-03: Кнопка «Отправить официанту» всегда видна — добавлен scroll контейнер внутри drawer
- BUG-S81-01: Свайп вниз по drag handle закрывает drawer — кастомный обработчик touch событий (порог 80px)
- Исправление: drawer не закрывается во время отправки заказа (isSubmitting guard)

### Session 82 — 05 мар 2026

- BUG-S81-02: Поле кода стола теперь показывает 4 ячейки вместо 5 — код принимается, стол привязывается
- BUG-S81-17: Уведомление «Заказ отправлен официанту» теперь показывается 4 секунды вместо 2
- BUG-S81-17: При ошибке отправки заказа в режиме «Зал» теперь виден toast с текстом ошибки
- BUG-S81-17: Корзина очищается после успешной отправки заказа (в зале и во всех режимах)
- BUG-S81-01: Свайп вниз закрывает drawer корзины (починен обработчик setActiveSnapPoint)
- BUG-S81-03: Drawer автоматически разворачивается до полного размера при добавлении блюд
- BUG-S81-14: Checkout для самовывоза/доставки перенесён в drawer (вместо fullscreen)

### Session 79 — 05 мар 2026

- Добавлен логотип ресторана (40px аватар) в шапке меню
- Баннер «Ресторан закрыт» при partner.is_open === false
- Drawer: sticky header, два размера (mid 60% / full 90%), компактный блок кода стола
- Блюда в корзине в две строки, подпись бонуса за онлайн-заказ

### Session 75 — 04 мар 2026

- Карточки блюд: квадратные фото, бейдж скидки -X% зелёный, зачёркнутая старая цена
- Inline stepper «— 1 +» прямо на карточке

### Session 74 — 04 мар 2026

- Drawer v2: два режима — «Заказ» (корзина) и «Чеки» (история заказов)
- Статусы заказов с иконками (🟡 Отправлен / 🟢 Принят / 🔵 Готовится / ✅ Готов)
- Защита от двойного сабмита (submitLockRef + safeguard restore guest)

### Session 71–73 — 03 мар 2026

- GAP-01: Экран подтверждения заказа для самовывоза/доставки
- GAP-02: Экран статуса заказа (?track=TOKEN) встроен в x.jsx
- Inline stepper на карточках блюд

### Session 65–68 — 02–03 мар 2026

- Session logic: 8h hard-expire, guard hasRecentActivity, SESS-022 контракт
- Оптимистичные обновления заказа не перезаписываются при polling
- Корзина сохраняется после обновления страницы (F5)
