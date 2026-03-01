# acceptinvite — README

## Описание
Страница принятия приглашения для сотрудников ресторана. Сотрудник получает ссылку с токеном по email, переходит по ней и:
1. Система находит `StaffAccessLink` по токену
2. Проверяет, активна ли ссылка
3. Если email не требуется — перенаправляет на страницу сотрудника (токен-доступ)
4. Если email требуется — проверяет авторизацию → совпадение email → принимает приглашение
5. Обновляет роль пользователя через `updateMe()` и отмечает ссылку как принятую
6. Перенаправляет: кабинет (`/partnerhome`) для директоров или мобильная страница (`/staffordersmobile?token=...`) для персонала

## Route
`/acceptinvite?token=...`

## Роли
Публичная страница. Проверка авторизации выполняется внутри компонента.

## Размер
~390 строк

## Entities
- **StaffAccessLink** — фильтрация по `token`, обновление `invited_user` и `invite_accepted_at`

## Auth API
- `base44.auth.isAuthenticated()`, `base44.auth.me()`, `base44.auth.updateMe()`
- `base44.auth.redirectToLogin()`, `base44.auth.logout()`

## Ключевые паттерны
- **Маппинг ролей (LOCKED DM-027):** `staff_role` → `user_role` (например `director` → `partner_owner`)
- **Доступ к кабинету:** только `director` и `managing_director` получают `/partnerhome`
- **Безопасность:** ссылки без email с кабинетными ролями блокируются (P0 SEC)
- **Retry-паттерн:** `retryAsync(fn, 2, 500)` для надёжности `updateMe`
- **Race condition guard:** `processingRef` предотвращает параллельные вызовы `processInvite`
- **Redirect cleanup:** `scheduleRedirect()` с очисткой таймера при размонтировании

## RELEASE History

| Date | RELEASE | Description | Bugs fixed |
|------|---------|-------------|------------|
| 2026-02-27 | 260227-00 | Initial review. 12 fixes: auth bypass, partial state, error handling, race conditions, i18n | BUG-AI-001 — BUG-AI-012 |

## UX Changelog

| Date | Change | Type |
|------|--------|------|
| 2026-02-27 | "Log out and retry" button теперь реально перезагружает страницу | Bug fix |
| 2026-02-27 | Пользователь не видит сырые технические ошибки — всегда переведённые сообщения | Bug fix |
| 2026-02-27 | Неизвестные роли показывают ошибку вместо тихого назначения partner_staff | Security fix |
| 2026-02-27 | Повторный клик на "Retry" не вызывает двойные запросы | Bug fix |
