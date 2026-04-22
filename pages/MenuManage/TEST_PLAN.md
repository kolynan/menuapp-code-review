# TEST_PLAN: MenuManage

**URL:** `/menumanage`  
**Роль:** Партнёр  
**Авторизация:** PartnerShell (требуется авторизация)  
**Версия плана:** v2.0 | Сессия S290

---

## Назначение страницы

Управление меню: категории (CRUD, сортировка drag-n-drop) и блюда (CRUD, сортировка, каналы, архивирование). Поддержка 3 каналов (hall/pickup/delivery), 9 языков, 8 валют. Виртуальная подгрузка (INITIAL_VISIBLE=50, LOAD_MORE_COUNT=30). Предпросмотр меню в публичном виде.

---

## Константы

| Константа | Значение |
|-----------|----------|
| `ORDER_STEP` | 1000 |
| `BATCH_SIZE` | 5 |
| `INITIAL_VISIBLE` | 50 |
| `LOAD_MORE_COUNT` | 30 |

---

## Happy Path сценарии

### HP-1: Просмотр меню
1. Открыть `/menumanage`
2. ✅ PartnerShell (activeTab="menu"), PageHelpButton
3. ✅ Список категорий + блюда по категориям
4. ✅ Видимые: первые 50 блюд (INITIAL_VISIBLE), далее «Показать ещё»

### HP-2: Создать категорию
1. Нажать «+ Категория»
2. ✅ Dialog с полем name
3. Ввести название → Сохранить
4. ✅ `Category.create({partner, name, sort_order})` sort_order = max+ORDER_STEP
5. ✅ Категория появляется в списке

### HP-3: Редактировать категорию
1. Нажать Pencil на категории
2. ✅ Dialog с текущим именем
3. Изменить → Сохранить → `Category.update(id, {name})`

### HP-4: Создать блюдо
1. Нажать «+ Блюдо» в категории
2. ✅ Dialog: название, описание, цена, изображение (ImageUploader), каналы (hall/pickup/delivery checkboxes), категория
3. Ввести данные → Сохранить
4. ✅ `Dish.create(payload)` с sort_order
5. ✅ Блюдо появляется в категории

### HP-5: Редактировать блюдо
1. Нажать Pencil на блюде
2. ✅ Dialog с текущими данными
3. Изменить → Сохранить → `Dish.update(id, payload)`

### HP-6: Сортировка drag-and-drop
1. Перетащить блюдо в другое место (GripVertical)
2. ✅ `computeMidOrder(prev, next, isFloat)` — midpoint между соседями
3. ✅ Если gap < minGap → null, затем полное перестроение с ORDER_STEP
4. ✅ `batchedUpdates(items, updateFn, BATCH_SIZE, 100ms)` — обновление по 5

### HP-7: Архивировать / Разархивировать блюдо
1. DropdownMenu → Архивировать
2. ✅ `Dish.update(id, {is_archived: true})` (поле is_archived, P1.4 — NOT :::archived:::)
3. ✅ Блюдо скрывается из активных
4. DropdownMenu → Показать архив → Разархивировать
5. ✅ `Dish.update(id, {is_archived: false})`

### HP-8: Предпросмотр меню
1. Нажать ExternalLink (preview)
2. ✅ Открывает `/x?partner={pid}&mode=hall&lang={selectedLang}`
3. ✅ `buildPreviewUrl(pid, lang)` с encodeURIComponent

### HP-9: Подгрузить больше блюд
1. Прокрутить до «Показать ещё»
2. ✅ Видимость увеличивается на LOAD_MORE_COUNT (30)

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | 0 категорий | Пустое состояние, кнопка + Категория |
| E2 | 100+ блюд | Первые 50, кнопка «Показать ещё» |
| E3 | Блюдо в нескольких категориях | getDishCategoryIds() — category_ids[] или category |
| E4 | is_archived=true | Скрыто по умолчанию |
| E5 | Rate limit 429 | isRateLimitError() → shouldRetry() false |
| E6 | Ошибка batchedUpdates | Частичный fail: сколько упало, сколько прошло |
| E7 | sort_order float (legacy) | detectSortOrderType() → float mid-calculation |

---

## Специфические проверки

- **sortByOrder():** по sort_order ASC, fallback localeCompare по name
- **getDishCategoryIds():** сначала `dish.category_ids[]`, потом `dish.category` (string)
- **dishInCategory(dish, catId):** toString() comparison
- **pluralize(n, one, few, many):** русская плюрализация
- **detectPartnerKey():** авто-детект 'partner' / 'partner_id' / 'partnerId' из данных
- **Каналы:** hall/pickup/delivery, 3 иконки: Store/Package/Truck
- **Языки:** 9 (RU/EN/KK/DE/TR/ZH/AR/ES/FR)
- **Валюты:** 8 (KZT/USD/EUR/RUB/GBP/TRY/AED/CNY)
- **PageHelpButton:** компонент контекстной справки (из AdminPageHelp)

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (просмотр) | Partner с ≥3 категории, ≥10 блюд в разных категориях, цены от 500 до 5000 ₸ |
| HP-2/HP-3 (категории CRUD) | Партнёр без категорий (чистое состояние) |
| HP-6 (drag-n-drop) | ≥5 блюд в одной категории с разными sort_order |
| HP-7 (архив) | ≥1 блюдо с is_archived=true |
| HP-9 (подгрузить) | Partner с >50 блюдами (INITIAL_VISIBLE=50) |
| E2 (100+ блюд) | Partner с ≥100 блюдами для проверки warning |
| E7 (float sort_order) | Блюда с дробными sort_order (detectSortOrderType → float) |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Открыть без авторизации | Редирект на логин (PartnerShell) |
| S2 | Auth error в getUser() | Редирект на логин (P0.1 fix) |
| S3 | XSS в названии блюда `<script>alert(1)</script>` | Экранируется, не выполняется |
| S4 | Unsafe URL в изображении (`javascript:alert(1)`) | isUrlSafe() блокирует, не сохраняется |
| S5 | Доступ к данным другого партнёра | API возвращает только данные авторизованного партнёра |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — категории и блюда | Нет горизонтального скролла |
| V2 | Мобиль 390px — drag-n-drop | GripVertical доступен для touch |
| V3 | Мобиль 390px — кнопки CRUD | Touch target ≥ 44px |
| V4 | Desktop — grid блюд | Несколько колонок, корректная раскладка |
| V5 | Архивированные блюда | Визуально отличаются от активных (серый цвет/badge) |
| V6 | Tooltip (info иконки) | Появляются при hover, корректный текст |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | Загрузка 300 блюд | Initial paint < 2s (INITIAL_VISIBLE=50 кэширует) |
| P2 | Drag-n-drop 50 блюд | Нет jank (60fps), main thread не блокируется |
| P3 | batchedUpdates (5 блюд) | Все 5 завершены или все упали (no partial state) |
| P4 | «Показать ещё» (+30) | Моментальный отклик (локальное состояние) |
| P5 | Rate limit 429 при drag | shouldRetry() false, нет бесконечных запросов |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Создать блюдо в MenuManage → PublicMenu | Блюдо появляется в меню гостя |
| I2 | Архивировать блюдо → PublicMenu | Блюдо исчезает из меню гостя |
| I3 | Создать категорию → MenuTranslations | Новая категория доступна для перевода |
| I4 | Добавить блюдо → PartnerHome | Шаг 1 онбординга помечен выполненным |
| I5 | Изменить sort_order блюда → MenuManage reload | Порядок сохранился после перезагрузки |
