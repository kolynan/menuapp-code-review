# TEST_PLAN: MenuDishes

**URL:** `/menudishes`  
**Роль:** Партнёр  
**Авторизация:** PartnerShell (требуется авторизация)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

WYSIWYG Menu Editor v4.9. Управление категориями и блюдами с drag-and-drop (grid layout). Поддержка архивирования, каналов доступности, сортировки. Rate limit защита, XSS защита, batch updates.

---

## Константы

| Константа | Значение | Назначение |
|-----------|----------|------------|
| `TOAST_ID` | `"mm1"` | Дедупликация toast |
| `HEADER_HEIGHT` | 180 | Auto-scroll при drag |
| `SCROLL_PAD` | 80 | Padding при auto-scroll |
| `SCROLL_SPEED` | 12 | Скорость auto-scroll |
| `ROW_TOLERANCE` | 50 | Grid drag row detection |

---

## Константы архивирования

- **P1.4 FIX:** `is_archived` поле (boolean) вместо `:::archived:::` маркера в description
- `isArchivedDish(dish)` → `dish?.is_archived === true`

---

## Happy Path сценарии

### HP-1: Просмотр меню (WYSIWYG)
1. Открыть `/menudishes`
2. ✅ PartnerShell (activeTab="menu")
3. ✅ Категории с блюдами в grid-раскладке
4. ✅ Каналы (hall/pickup/delivery) — иконки Store/Package/Truck

### HP-2: Drag-and-drop блюда в grid
1. Перетащить блюдо GripVertical
2. ✅ `getGridInsertIndex()` — row-based вычисление с `ROW_TOLERANCE=50`
3. ✅ `reorderInsert(ids, movingId, insertIndex)` — корректная вставка
4. ✅ Auto-scroll при достижении `HEADER_HEIGHT`
5. ✅ `batchedUpdates(items, updateFn, 5, 100ms)` для сохранения порядка

### HP-3: Drag-and-drop между категориями
1. Перетащить блюдо в другую категорию
2. ✅ `Dish.update(id, {category: newCatId})`
3. ✅ Блюдо уходит из старой, появляется в новой

### HP-4: Создать блюдо
1. + Блюдо → Dialog
2. ✅ Поля: name, description, price, image, каналы, категория
3. ✅ `Dish.create()` с sort_order
4. ✅ Toast «Сохранено»

### HP-5: Редактировать блюдо
1. Pencil → Dialog с данными
2. ✅ `Dish.update(id, payload)`
3. ✅ Optimistic update в UI

### HP-6: Архивировать блюдо
1. MoreVertical → Архивировать
2. ✅ `Dish.update(id, {is_archived: true})`
3. ✅ Блюдо исчезает из основного вида

### HP-7: Посмотреть архив
1. Переключить «Показать архив»
2. ✅ Архивированные блюда видны с пометкой
3. Разархивировать → `Dish.update(id, {is_archived: false})`

### HP-8: Контакты (ContactTypes)
- Поддерживаемые типы: phone, whatsapp, instagram, facebook, tiktok, website, email, map, custom
- `isUrlSafe()` проверяет протокол: only `http:`, `https:`, `tel:`, `mailto:` (P0.5–P0.6)
- `getDefaultContactLabel(type)` → локализованный label

---

## Rate Limit & Retry (P0.3)

- `isRateLimitError(error)` → проверяет `"rate limit"` или `"429"` в сообщении
- `shouldRetry(failureCount, error)` → false при rate limit, max 2 попытки иначе

---

## Batch Updates (P0.4)

- `batchedUpdates(items, updateFn, batchSize=5, delayMs=100)`
- `Promise.allSettled` — нет partial fail state (BUG-MD-002 fix)
- Если N упали → выбрасывает ошибку с `err.failed` + `err.results`

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | 100+ блюд (P0.2) | Warning «достигнут лимит» |
| E2 | Auth error (P0.1) | Редирект на login |
| E3 | Rate limit в useQuery | shouldRetry() false → нет бесконечного retry |
| E4 | XSS в URL контакта | isUrlSafe() блокирует javascript: и data: |
| E5 | is_archived = :::archived::: (legacy) | НЕ обрабатывается — только новое поле |
| E6 | Ошибка batchedUpdates | Toast с N из M failed |
| E7 | Пустая категория | Кнопка «+ Блюдо», пустое состояние |

---

## Специфические проверки

- **formatPriceDisplay(price, currencyCode):** decimals=0 для KZT/RUB/JPY/KRW, 2 иначе
- **getDishCategoryIds(dish):** `dish.categories[]` → `dish.category_ids[]` → `dish.category`
- **syncOrderIds(prevIds, currentIds):** сохраняет старый порядок + добавляет новые в конец
- **moveToIndex / reorderInsert:** grid drag helpers
- **getGridInsertIndex():** row-based (не column-based!) — BUG 1 FIX
- **AVAILABLE_CURRENCIES:** 8 валют с символами (KZT=₸, USD=$, EUR=€...)
- **AVAILABLE_LANGUAGES:** 3 (RU/EN/KK) в этой странице (vs 9 в MenuManage)

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (просмотр) | Partner с 3 категориями, 5+ блюд в каждой |
| HP-2 (drag-and-drop) | Grid с 6+ блюдами в одной категории |
| HP-6 (архивировать) | Блюдо без активных заказов |
| E1 (100+ лимит) | Partner с 101+ блюдами |
| E4 (XSS в URL) | Контакт с URL `javascript:alert(1)` |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Открыть `/menudishes` без авторизации | Редирект на логин (P0.1 auth error) |
| S2 | XSS в URL контакта (`javascript:`, `data:`) | `isUrlSafe()` блокирует — URL не сохраняется |
| S3 | Только блюда своего партнёра видны | Нет cross-partner contamination |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — grid блюд | Одна колонка, нет горизонтального скролла |
| V2 | Drag handle (GripVertical) | Видна и достижима на тач-экране |
| V3 | Архивированные блюда (при включённом показе) | Визуально помечены, отличимы от активных |
| V4 | Каналы (Hall/Pickup/Delivery иконки) | Все три иконки видны для каждого блюда |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | 100+ блюд — рендер WYSIWYG grid | Warning о лимите + нет crash |
| P2 | batchedUpdates (5 штук / 100ms) после drag | UI не блокируется во время batch |
| P3 | Auto-scroll при drag к HEADER_HEIGHT | Плавный (SCROLL_SPEED=12), без рывков |
| P4 | Rate limit (429) в useQuery | `shouldRetry=false` — нет бесконечного retry |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Добавить новое блюдо → PublicMenu | Блюдо появляется в меню гостя |
| I2 | Архивировать блюдо → PublicMenu | Блюдо скрыто от гостей |
| I3 | Изменить sort_order через drag → PublicMenu | Порядок блюд обновился у гостей |
