# TEST_PLAN: AdminPageHelp

**URL:** `/adminpagehelp`  
**Роль:** Глобальный администратор  
**Авторизация:** Email в вайтлисте (`ADMIN_EMAILS`)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

Управление контекстной справкой для страниц кабинета партнёра. CRUD для `PageHelp` записей (pageKey, title, markdown, isActive). Поиск по pageKey. Быстрые шаблоны через template-кнопки.

---

## Happy Path сценарии

### HP-1: Вход и список справок
1. Открыть `/adminpagehelp` (admin email)
2. ✅ Spinner пока загружается auth + данные
3. ✅ Список PageHelp записей, отсортированных по pageKey (localeCompare)
4. ✅ Каждая: pageKey, title, isActive (Switch), дата обновления

### HP-2: Поиск по pageKey
1. Ввести текст в поиск
2. ✅ Список фильтруется по `pageKey.toLowerCase().includes(query)`
3. Очистить → полный список

### HP-3: Создать справку
1. Нажать «Создать»
2. ✅ Dialog открывается, поля пустые, isActive=true
3. Ввести pageKey, title, markdown
4. pageKey без `/` → автоматически добавляется `/` в начале
5. Нажать «Сохранить»
6. ✅ `PageHelp.create(payload)` с `updatedAt = new Date().toISOString()`
7. ✅ Новая запись появляется в списке
8. ✅ Toast «Сохранено»

### HP-4: Редактировать справку
1. Нажать «Редактировать» (Pencil иконка)
2. ✅ Dialog открывается с текущими данными
3. Изменить markdown
4. Нажать «Сохранить»
5. ✅ `PageHelp.update(id, payload)` → optimistic update в списке
6. ✅ Toast «Сохранено»

### HP-5: Переключить isActive (Switch)
1. Нажать Switch на записи или в Dialog
2. ✅ isActive меняется
3. ✅ Визуально Switch обновляется

### HP-6: Удалить справку
1. Нажать Trash2
2. ✅ `confirm()` диалог подтверждения с pageKey
3. Подтвердить
4. ✅ `PageHelp.delete(id)`
5. ✅ Запись удаляется из списка
6. ✅ Toast «Удалено»

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Не admin → Access Denied | ShieldX-карточка, кнопка «Выйти» |
| E2 | Не авторизован | Редирект на `/` |
| E3 | pageKey пустой | Toast «pageKey обязателен», не сохраняется |
| E4 | pageKey = `/` | Та же валидация — блокирует |
| E5 | Дублирующий pageKey | Toast «Такой pageKey уже существует» (unique constraint из API) |
| E6 | Нет справок | Пустой список |
| E7 | Ошибка загрузки | Toast «Ошибка» |

---

## Специфические проверки

- **pageKey нормализация:** `normalizedKey = '/' + formData.pageKey.trim()` если нет `/`
- **Сортировка:** `localeCompare` по pageKey (алфавитная)
- **updatedAt:** клиентская метка `new Date().toISOString()` (B44 не обновляет сам)
- **ADMIN_EMAILS:** hardcoded `["linkgabinfo@gmail.com"]`
- **formatDate():** `new Date(dateStr).toLocaleDateString('ru-RU')`
- **Иконка заголовка:** BookOpen

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (список) | 3+ PageHelp записей с разными pageKey |
| HP-3 (создать) | Пустой список или конкретный pageKey для теста |
| E5 (дублирующий pageKey) | Существующая запись с pageKey=`/partnerhome` |
| E1/E2 (не admin) | Не-admin аккаунт или без авторизации |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Email не в ADMIN_EMAILS | ShieldX «Access Denied» карточка |
| S2 | Нет авторизации | Редирект на `/` |
| S3 | XSS в markdown поле | Отображается как текст, не выполняется (нет eval) |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — список справок | Не обрезается горизонтально |
| V2 | Мобиль 390px — диалог создания/редактирования | Поля доступны, не выходят за экран |
| V3 | Switch isActive | Явное состояние on/off |
| V4 | Иконки Pencil/Trash2 | Touch target ≥ 44px |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | 50+ записей PageHelp — сортировка localeCompare | Мгновенная (локальная), нет лагов |
| P2 | Поиск по pageKey (локальный) | Фильтр без нового API запроса |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Создать PageHelp с pageKey=`/partnerhome`, isActive=true → открыть PartnerHome | Партнёр видит блок контекстной справки |
| I2 | Переключить isActive=false для `/partnerhome` → PartnerHome | Блок справки исчезает |
