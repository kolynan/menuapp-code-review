# TEST_PLAN: AcceptInvite

**URL:** `/acceptinvite?token=...`  
**Роль:** Новый сотрудник (без аккаунта или уже авторизованный)  
**Авторизация:** Не требуется (публичная страница)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

Страница принятия приглашения на работу. Обрабатывает токен из URL, проверяет его валидность, регистрирует/авторизует пользователя и перенаправляет на нужную страницу в зависимости от роли.

---

## Логика ролей и редиректов

| staff_role | user_role | Редирект |
|-----------|-----------|----------|
| director | partner_owner | `/partnerhome` |
| managing_director | partner_manager | `/partnerhome` |
| partner_manager | partner_staff | `/staffordersmobile?token=...` |
| partner_staff | partner_staff | `/staffordersmobile?token=...` |
| kitchen | kitchen | `/staffordersmobile?token=...` |

---

## Happy Path сценарии

### HP-1: Новый пользователь принимает приглашение (не кабинетная роль)
1. Открыть `/acceptinvite?token=VALID_TOKEN`
2. ✅ Страница загружает данные (spinner)
3. ✅ Страница регистрирует пользователя (или авторизует)
4. ✅ Через N секунд редирект на `/staffordersmobile?token=VALID_TOKEN`

### HP-2: Кабинетная роль (director/managing_director)
1. Открыть с токеном роли director
2. ✅ Обрабатывает invite
3. ✅ Редирект на `/partnerhome` (без токена в URL)

### HP-3: Повторное принятие (пользователь уже авторизован)
1. Войти как существующий сотрудник
2. Открыть `/acceptinvite?token=VALID_TOKEN`
3. ✅ Страница распознаёт текущего пользователя
4. ✅ Обновляет роль/привязку
5. ✅ Редирект

### HP-4: Retry при ошибке
1. Если первый запрос неудачен (сеть)
2. ✅ Автоматически retryAsync (до 2 попыток, 500ms задержка)
3. ✅ Toast не мелькает при retry

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Нет токена в URL (`/acceptinvite` без `?token=`) | Статус `invalid_token`, сообщение об ошибке |
| E2 | Токен не существует в базе | Статус `invalid_token` |
| E3 | Ссылка деактивирована (is_active = false) | Статус `error`, «Ссылка отключена» |
| E4 | Rate limit (429) | Не делает retry, показывает ошибку |
| E5 | Timeout — страница зависла | processingRef = true предотвращает двойную обработку |

---

## Error States

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| R1 | invalid_token | Иконка XCircle, текст «Недействительная ссылка» |
| R2 | error (деактивирован) | Иконка AlertCircle, текст из t('acceptinvite.link_disabled') |
| R3 | Сетевая ошибка | Иконка XCircle, текст ошибки, кнопка «Попробовать снова» |

---

## Специфические проверки

- **processingRef:** защита от двойной обработки (useRef, не state)
- **timeoutRef:** clearTimeout при размонтировании — нет утечки памяти
- **mapStaffRoleToUserRole():** маппинг LOCKED DM-027 — тестировать все 5 ролей
- **hasCabinetAccess():** только director + managing_director → `/partnerhome`
- **retryAsync:** maxRetries=2, delay=500ms — срабатывает при сетевых ошибках, НЕ при rate limit
- **scheduleRedirect:** используется `window.location.href` (не navigate) — полная перезагрузка

---

## Тестовые данные

- Активный StaffAccessLink с токеном для роли partner_staff
- Активный StaffAccessLink с токеном для роли director
- Деактивированный StaffAccessLink (is_active = false)
- Несуществующий токен

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (partner_staff) | StaffAccessLink: staff_role=partner_staff, is_active=true |
| HP-2 (director) | StaffAccessLink: staff_role=director, is_active=true |
| HP-3 (повторное) | Существующий пользователь с тем же email + валидный токен |
| E3 (деактивирован) | StaffAccessLink: is_active=false |
| HP-4 (retry) | Симуляция сетевой ошибки (DevTools → offline на первый запрос) |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | `processingRef = true` после первого запуска | Повторное открытие страницы не создаёт второй запрос |
| S2 | Деактивированная ссылка | Показывает ошибку, не раскрывает данные партнёра |
| S3 | Rate limit (429) при обработке | `isRateLimitError()` = нет повторного запроса, показывает ошибку |
| S4 | Случайный UUID токен (не в базе) | Статус `invalid_token`, нет crash |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — loading spinner | Виден и центрирован |
| V2 | Состояние ошибки | XCircle/AlertCircle иконки ≥ 24px, текст читаемый |
| V3 | Кнопка «Попробовать снова» (при сетевой ошибке) | Touch target ≥ 44px |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | retryAsync (maxRetries=2, delay=500ms) | Общее время retry ≤ 1.5s до финального результата |
| P2 | scheduleRedirect → window.location.href | Редирект происходит в ожидаемое время |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Создать partner_staff в PartnerStaffAccess → использовать токен | Пользователь попадает в SOM с правильным партнёром |
| I2 | Токен роли director → acceptinvite | Редирект на `/partnerhome`, доступ к кабинету |
| I3 | Деактивировать сотрудника → использовать старый токен | Ошибка «Ссылка отключена» |
