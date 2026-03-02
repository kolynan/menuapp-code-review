---
version: "3.4"
updated: "2026-03-02"
session: 66
---

# StaffOrdersMobile — Мобильный интерфейс персонала

## Описание
Мобильный интерфейс для персонала ресторана. Приём заказов, смена статусов, запросы помощи, группировка по столам. Самый сложный файл проекта (v3.4.0 — UI bug fixes S66).

**Route:** `/staffordersmobile`
**Roles:** partner_manager, partner_staff, kitchen
**Размер:** ~3940 строк (v3.2.0)

## Архитектура

### Компоненты (14)
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
- `BannerNotification` — баннер-уведомление о новых событиях (Sprint D, fixed z-60)
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
- **Notifications:** sound, vibration, system notifications, in-app banner (Sprint D)
- **Multi-device lock:** DEVICE_ID → предотвращает дублирование
- **P0 security:** ongoing hardening (v2.6.x series)
- **Split-tap (V2-03):** CTA → action inline; card body → TableDetailScreen
- **Detail view (V2-02):** liveDetailGroup по detailGroupId, auto-updates via polling
- **Scroll preservation:** listScrollRef + requestAnimationFrame при возврате из детального вью
- **Transition animation (V2-07):** CSS transition-colors на бордюрах, бейджах, тексте; amber ring flash; CTA fade-in через max-h wrapper
- **Position stability (V2-04):** transitionLocksRef предотвращает перемещение карточки при смене статуса (600ms lock)

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-03-02 | 3.4.0 UI Bug Fixes | 4 бага из Deep Test S66: detail view теперь открывается (убрана анимация, z-50), карточки ГОТОВИТСЯ показывают кнопку действия, кнопка "Принять" открывает детали (нет слепого принятия), убран двойной "Стол Стол". |
| 2026-03-02 | 3.3.0 P0 Session Fix | Фикс утечки исторических заказов: hall-заказы без `table_session` (legacy/orphан) больше не отображаются в активном виде. Совместно с P0-1/P0-2 (PublicMenu) обеспечивает 4 инварианта сессий: макс. 1 open сессия на стол, каждый заказ привязан к сессии, гости видят только свои заказы, суммы считаются по текущей сессии. |
| 2026-03-02 | 3.2.0 Sprint D | Баннер-уведомления: при новых заказах/готовых заказах появляется баннер сверху экрана с названием стола и типом события. Автоскрытие 5с, свайп-вверх для закрытия. Тап на баннер → скролл к карточке стола с подсветкой. Множественные события: "3 новых заказа". Работает на всех экранах включая детальный вью. |
| 2026-03-02 | 3.2.0 Sprint C | Анимация перехода Готовится→Готов: бордюр карточки плавно меняет цвет с серого на янтарный (300мс), CTA-кнопка "Подать" появляется с fade-in эффектом (300мс), краткая янтарная вспышка (200мс) для привлечения внимания. Стабильность позиции: карточка не перемещается в списке во время анимации (600мс lock). CSS-переходы на всех элементах карточки для плавных изменений статуса. |
| 2026-03-02 | 3.1.0 Sprint B | Детальный вью стола: тап на тело карточки → полноэкранный TableDetailScreen (slide-in справа). CTA-кнопка → действие без перехода (split-tap V2-03). Секции по гостям с кнопками 48px full-width. Сохранение позиции скролла. Свайп-вправо для закрытия. Живое обновление detail view через polling. |
| 2026-03-02 | 3.0.0 Sprint A | Компактные карточки: цветные бордюры по статусу, бейдж статуса, счётчик гостей и заказов, elapsed time, одна CTA-кнопка 52px. Сортировка Mine: СЧЁТ > НОВЫЙ > ГОТОВ > ОБСЛУЖЕНО > ГОТОВИТСЯ |
| 2026-02-24 | 2.7.3 (1.0 save) | Первичное сохранение кода |
