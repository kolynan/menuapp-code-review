# TEST_PLAN: MenuTranslations

**URL:** `/menutranslations`  
**Роль:** Партнёр  
**Авторизация:** PartnerShell (требуется авторизация)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

Управление мультиязычными переводами меню. Два таба: категории и блюда. Инлайн-редактирование переводов, bulk paste через Dialog, экспорт/импорт, поиск по названию. LocalStorage для недавних языков партнёра.

---

## Сущности

- `Category` + `CategoryTranslation` — переводы категорий
- `Dish` + `DishTranslation` — переводы блюд
- `DEFAULT_LANGS = ['ru', 'en', 'kk']`

---

## Состояние

| State | Начальное значение |
|-------|-------------------|
| `activeTab` | `'categories'` |
| `selectedLang` | `'en'` |
| `customLangInput` | `''` |
| `searchQuery` | `''` |
| `categoryFilter` | `'all'` |
| `editingTranslations` | `{}` |
| `hasUnsavedChanges` | `Object.keys(editingTranslations).length > 0` |

---

## Happy Path сценарии

### HP-1: Просмотр переводов
1. Открыть `/menutranslations`
2. ✅ PartnerShell (activeTab="menu")
3. ✅ Таб «Категории» активен по умолчанию
4. ✅ Язык `en` выбран по умолчанию
5. ✅ Список категорий с полем перевода

### HP-2: Переключить таб
1. Нажать таб «Блюда»
2. ✅ Список блюд (без архивированных) с полями перевода
3. Нажать «Категории» — возврат

### HP-3: Изменить язык
1. Выбрать язык из Select (ru/en/kk + недавние)
2. ✅ Загружаются переводы для выбранного lang
3. ✅ `CategoryTranslation.filter({partner, lang})` / `DishTranslation.filter({partner, lang})`

### HP-4: Добавить кастомный язык
1. Ввести код языка в customLangInput
2. Нажать «Добавить»
3. ✅ Язык добавляется в список и в localStorage `menu_trans_langs_{partnerId}`
4. ✅ `recentLangs` + `DEFAULT_LANGS` → `allLangs` (deduplicated Set)

### HP-5: Инлайн-редактирование перевода
1. Кликнуть на поле перевода (категория или блюдо)
2. Ввести текст
3. ✅ Изменение попадает в `editingTranslations` (в памяти)
4. ✅ `hasUnsavedChanges = true`

### HP-6: Сохранить изменения
1. Нажать «Сохранить» (isSaving=true)
2. ✅ Для каждой изменённой записи: update или create в CategoryTranslation/DishTranslation
3. ✅ Инвалидация queryClient кешей
4. ✅ `editingTranslations` сбрасывается
5. ✅ Toast CheckCircle2

### HP-7: Bulk paste переводов
1. Нажать «Вставить» (Upload иконка)
2. ✅ Dialog открывается с Textarea
3. Вставить данные (JSON/CSV формат)
4. ✅ Preview: сколько строк будет обновлено
5. Подтвердить → `isPasting=true`
6. ✅ Batch обновление, `pasteResult` с итогом

### HP-8: Поиск и фильтр
1. Ввести в поле поиска
2. ✅ Список фильтруется по названию блюда/категории
3. Выбрать категорию в `categoryFilter` (только для таба «Блюда»)
4. ✅ Показывает блюда только выбранной категории

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Архивированное блюдо | Исключено через `isArchivedDish()` (проверяет `:::archived:::` в description — LEGACY метод!) |
| E2 | Нет переводов для языка | Пустые поля ввода, можно добавить |
| E3 | customLangInput уже в allLangs | Не дублируется (Set) |
| E4 | Ошибка загрузки | ErrorBoundary → карточка с кнопками «Go to Menu» / «Reload» |
| E5 | Несохранённые изменения при смене языка | Потенциальная потеря данных — предупреждения нет (⚠️) |
| E6 | storageKey = null (нет partnerId) | recentLangs = [] |

---

## Специфические проверки

- **isArchivedDish():** в этой странице LEGACY — проверяет `:::archived:::` в description (не поле is_archived!)
- **LocalStorage key:** `menu_trans_langs_{partnerId}` — уникален на партнёра
- **allLangs:** `[...new Set([...DEFAULT_LANGS, ...recentLangs])]`
- **Queries enabled:** только когда `!!partnerId` — нет запросов до авторизации
- **4 параллельных query:** categories, dishes, categoryTranslations, dishTranslations
- **Download иконка:** экспорт текущих переводов
- **Copy иконка:** копировать перевод
- **ErrorBoundary:** оборачивает MenuTranslationsInner

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (просмотр) | Partner с 5 категориями, 10 блюд; переводы для EN частично заполнены |
| HP-4 (кастомный язык) | Partner без ранее добавленных кастомных языков |
| HP-7 (bulk paste) | JSON/CSV с переводами для 5+ элементов |
| E1 (архивированное) | Блюдо с `:::archived:::` в description — должно быть исключено |
| E5 (несохранённые) | Внести изменения → попытаться сменить язык без сохранения |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Открыть `/menutranslations` без авторизации | Редирект на логин |
| S2 | Только переводы своего партнёра редактируются | `partner` query scope ограничен |
| S3 | Bulk paste — JSON с `__proto__` pollution | Не влияет на объект, сохраняется как текст |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — форма переводов | Поля ввода не обрезаются |
| V2 | Language selector | Все языки видны в dropdown |
| V3 | hasUnsavedChanges | Индикатор несохранённых изменений видим |
| V4 | Кнопка «Сохранить» при isSaving | Заблокирована + показывает прогресс |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | 4 параллельных query при загрузке | Не waterfall — одновременно |
| P2 | 100+ блюд — таблица переводов | Прокрутка без лагов |
| P3 | Bulk paste 50+ записей | `isPasting=true` с progress, нет freeze |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Добавить EN перевод категории → PublicMenu (EN язык) | Категория показывает переведённое название |
| I2 | Добавить KK перевод блюда → PublicMenu | Language selector показывает KK, блюдо переведено |
