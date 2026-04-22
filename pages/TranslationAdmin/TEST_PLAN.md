# TEST_PLAN: TranslationAdmin

**URL:** `/translationadmin`  
**Роль:** Глобальный администратор  
**Авторизация:** Email в вайтлисте (`ADMIN_EMAILS`)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

Управление i18n переводами интерфейса (InterfaceTranslation). Экспорт/импорт CSV, сканирование исходного кода на `t('key')` паттерны, управление языками, источниками (PageSource), трекинг неиспользованных ключей.

---

## Сущности

- `Language` — список языков (sort_order)
- `InterfaceTranslation` — ключ → переводы по языкам (`translations[langCode]`)
- `PageSource` — исходники страниц (is_active filter)
- `PageScanTracker` — история сканирований
- `UnusedKeyLog` — лог неиспользованных ключей

---

## PREDEFINED_SOURCES

4 компонента: `partnershell`, `imageuploader`, `helpers`, `constants`

---

## Happy Path сценарии

### HP-1: Список переводов
1. Открыть `/translationadmin` (admin email)
2. ✅ Загрузка всех Language + InterfaceTranslation
3. ✅ Таблица ключей с переводами по активным языкам
4. ✅ Поле поиска фильтрует по key/page/description

### HP-2: Экспорт CSV (все переводы)
1. Нажать «Download CSV»
2. ✅ `generateCSV(translations, languages)` — headers: key, page, description, [lang codes]
3. ✅ CSV скачивается как файл
4. ✅ Кавычки и переносы строк экранируются через `escapeCSV()`

### HP-3: Экспорт CSV (только пропущенные)
1. Нажать «Download Missing»
2. ✅ `generateCSVMissing()` — фильтрует записи без перевода в активных языках
3. ✅ Счётчик N пропущенных переводов в названии кнопки/файла

### HP-4: Импорт CSV
1. Выбрать CSV файл (Upload)
2. ✅ `parseCSV(text, languages)` разбирает с `splitCSVRows()` (RFC 4180 многострочные поля)
3. ✅ Предпросмотр: N строк, M обновлений
4. Подтвердить импорт
5. ✅ InterfaceTranslation.update() для каждого ключа
6. ✅ Toast результата

### HP-5: Сканирование исходного кода
1. Вставить JSX-код в textarea (или выбрать PageSource)
2. ✅ `extractKeysFromCode(code)` — regex `t\(\s*["']([^"']+)["']`
3. ✅ Список найденных ключей
4. ✅ `countLines(code)` — кол-во строк (0 если "// Paste code here")

### HP-6: Управление языками
1. Просмотр списка Language (активные/неактивные)
2. ✅ Добавить/деактивировать язык

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Не admin | ShieldX Access Denied |
| E2 | Не авторизован | Редирект на `/` |
| E3 | CSV с многострочными полями | `splitCSVRows()` корректно парсит (BUG-TA-028 fix) |
| E4 | CSV с кавычками внутри поля | `parseCSVLine()` — `""` = экранированная кавычка |
| E5 | CSV import → `\n` в значении | `unescapeCSV()` восстанавливает реальные переносы (BUG-TA-006 fix) |
| E6 | 0 PageSource | Список источников пустой |
| E7 | Пустой код в textarea | `countLines()` → 0 |

---

## Специфические проверки

- **extractKeysFromCode():** regex `/t\(\s*["']([^"']+)["']/g` — находит все `t('key')` вызовы
- **escapeCSV():** заменяет `"` → `""`, `\n` → `\\n` (round-trip safe)
- **unescapeCSV():** `\\n` → реальный `\n` (reverse)
- **splitCSVRows():** RFC 4180 — не разрывает строку на `\n` внутри кавычек
- **formatDate():** относительное время (Just now / N min ago / N hours ago / N days ago / дата)
- **ADMIN_EMAILS:** hardcoded `["linkgabinfo@gmail.com"]`
- **Иконки:** Globe, Languages, FileCode, Copy, Zap, Download, Upload, Settings, Component

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-2 (CSV экспорт) | 10+ InterfaceTranslation записей с разными языками |
| HP-3 (missing CSV) | 5+ записей с пустым переводом для одного языка |
| HP-4 (CSV импорт) | Подготовить валидный CSV файл (RFC 4180, многострочные поля) |
| HP-5 (сканирование) | Скопировать JSX с 10+ вызовами `t('key')` |
| E3 (BUG-TA-028) | CSV с полями содержащими реальный `\n` символ |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Email не в ADMIN_EMAILS | ShieldX Access Denied |
| S2 | Нет авторизации | Редирект на `/` |
| S3 | CSV импорт с `=EXEC(...)` или formula injection | Значение сохраняется как текст, не выполняется |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — таблица переводов (много колонок) | Горизонтальный скролл без потери данных |
| V2 | Textarea для кода | Читаема, resize работает |
| V3 | Кнопки действий (Download/Upload/Missing) | Доступны без горизонтального скролла |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | Загрузка 500+ InterfaceTranslation записей | Таблица рендерится с поиском (<2s) |
| P2 | CSV экспорт 500+ записей | Генерация и скачивание без freeze |
| P3 | Сканирование 200KB JSX кода через regex | Без зависания браузера (<500ms) |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Обновить перевод `common.loading` на EN → открыть любую страницу | Новый текст отображается вместо старого |
| I2 | Экспорт CSV → внести правки → импорт CSV | Round-trip: все ключи сохранены, переводы обновились |
