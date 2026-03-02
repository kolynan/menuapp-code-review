---
version: "3.0"
updated: "2026-03-02"
session: 65
---

# StaffOrdersMobile — Мобильный интерфейс персонала

## Описание
Мобильный интерфейс для персонала ресторана. Приём заказов, смена статусов, запросы помощи, группировка по столам. Самый сложный файл проекта (v3.1.0 — Sprint B детальный вью).

**Route:** `/staffordersmobile`
**Roles:** partner_manager, partner_staff, kitchen
**Размер:** 3702 строки (v3.1.0)

## Архитектура

### Компоненты (13)
- `StaffOrdersMobile` — главный
- `RateLimitScreen` — экран блокировки
- `LockedScreen` — другое устройство
- `BindingScreen` — привязка устройства
- `IconToggle` — toggle кнопка
- `RequestCard` — карточка запроса
- `OrderCard` — карточка заказа (кухня)
- `OrderGroupCard` — компактная карточка группы/стола (V2 Sprint A+B)
- `DetailOrderRow` — строка заказа с позициями (Sprint B, auto-fetch)
- `GuestOrderSection` — секция гостя с кнопкой действия (Sprint B, 48px)
- `TableDetailScreen` — полноэкранный детальный вью стола (Sprint B, slide-in)
- `MyTablesModal` — модальный вью избранных столов
- `ProfileSheet` — профиль сотрудника + настройки

### Entities
- **Order** — CRUD + status transitions
- **OrderItem** — lazy read (предотвращение N+1 429)
- **OrderStage** — read (pipeline)
- **SessionGuest** — batch read
- **ServiceRequest** — CRUD
- **TableSession** — read

### Ключевые паттерны
- **Polling:** configurable 5s/15s/30s/60s/manual
- **Shift-based filtering:** overnight shift support
- **Grouping:** hall по столам, pickup/delivery индивидуально
- **Favorites:** localStorage, prefix keys
- **Lazy loading OrderItems:** prevents N+1 rate limit errors (list view); auto-fetch в detail view
- **Notifications:** sound, vibration, system notifications
- **Multi-device lock:** DEVICE_ID → предотвращает дублирование
- **P0 security:** ongoing hardening (v2.6.x series)
- **Split-tap (V2-03):** CTA → action inline; card body → TableDetailScreen
- **Detail view (V2-02):** liveDetailGroup по detailGroupId, auto-updates via polling
- **Scroll preservation:** listScrollRef + requestAnimationFrame при возврате из детального вью

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-03-02 | 3.1.0 Sprint B | Детальный вью стола: тап на тело карточки → полноэкранный TableDetailScreen (slide-in справа). CTA-кнопка → действие без перехода (split-tap V2-03). Секции по гостям с кнопками 48px full-width. Сохранение позиции скролла. Свайп-вправо для закрытия. Живое обновление detail view через polling. |
| 2026-03-02 | 3.0.0 Sprint A | Компактные карточки: цветные бордюры по статусу, бейдж статуса, счётчик гостей и заказов, elapsed time, одна CTA-кнопка 52px. Сортировка Mine: СЧЁТ > НОВЫЙ > ГОТОВ > ОБСЛУЖЕНО > ГОТОВИТСЯ |
| 2026-02-24 | 2.7.3 (1.0 save) | Первичное сохранение кода |
