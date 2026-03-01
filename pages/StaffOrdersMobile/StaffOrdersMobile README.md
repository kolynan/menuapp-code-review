---
version: "1.0"
updated: "2026-02-24"
session: 31
---

# StaffOrdersMobile — Мобильный интерфейс персонала

## Описание
Мобильный интерфейс для персонала ресторана. Приём заказов, смена статусов, запросы помощи, группировка по столам. Самый сложный файл проекта (v2.7.3).

**Route:** `/staffordersmobile`
**Roles:** partner_manager, partner_staff, kitchen
**Размер:** 3037 строк (v2.7.3)

## Архитектура

### Компоненты (7)
- `StaffOrdersMobile` — главный
- `RateLimitScreen` — экран блокировки
- `LockedScreen` — другое устройство
- `BindingScreen` — привязка устройства
- `IconToggle` — toggle кнопка
- `RequestCard` — карточка запроса
- `OrderCard` — карточка заказа

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
- **Lazy loading OrderItems:** prevents N+1 rate limit errors
- **Notifications:** sound, vibration, system notifications
- **Multi-device lock:** DEVICE_ID → предотвращает дублирование
- **P0 security:** ongoing hardening (v2.6.x series)

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-02-24 | 2.7.3 (1.0 save) | Первичное сохранение кода |
