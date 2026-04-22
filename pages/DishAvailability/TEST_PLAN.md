# TEST_PLAN: DishAvailability

**URL:** `/dishavailability` (LAB: `/dishavailability1`)  
**Роль:** Партнёр  
**Авторизация:** `base44.auth.me()` (currentUser → partnerId)  
**Версия плана:** v2.0 | Сессия S293

---

## Назначение страницы

⚠️ **LAB страница** (`dishavailability1.jsx` — флаг `// LAB ONLY`). Bulk Edit доступности блюд по каналам (hall/pickup/delivery) и sort_order. Массовое редактирование без поодиночного Dialog. Таблица с inline-чекбоксами.

---

## Функционал

- Таблица блюд: название, категория, enabled_hall, enabled_pickup, enabled_delivery, sort_order
- Inline редактирование прямо в строке
- Bulk save: `batchedUpdates` только изменённых (`editedDishes`)
- Фильтры: поиск по названию, категория, показать архив, только несовпадающие (mismatch)

---

## Состояние

| State | Начальное значение |
|-------|-------------------|
| `search` | `""` |
| `categoryFilter` | `"all"` |
| `showArchived` | `false` |
| `showOnlyMismatched` | `false` |
| `editedDishes` | `{}` |
| `isBulkRunning` | `false` |
| `bulkProgress` | `{current: 0, total: 0}` |
| `bulkErrors` | `[]` |

---

## Happy Path сценарии

### HP-1: Просмотр таблицы
1. Открыть `/dishavailability1`
2. ✅ Загрузка categories + dishes (filter по partnerId)
3. ✅ Таблица: Name, Category, Hall ✓, Pickup ✓, Delivery ✓, Sort Order
4. ✅ Сортировка категорий: sort_order ASC, fallback localeCompare

### HP-2: Редактировать доступность
1. Нажать checkbox Hall/Pickup/Delivery в строке
2. ✅ `editedDishes[dishId]` обновляется
3. ✅ `isDirty(original, edited)` = true → строка помечена как изменённая

### HP-3: Редактировать sort_order
1. Изменить число в поле sort_order
2. ✅ `editedDishes[dishId].sort_order` обновляется

### HP-4: Сохранить все изменения
1. Нажать «Сохранить»
2. ✅ `isBulkRunning = true`
3. ✅ `bulkProgress` обновляется по ходу
4. ✅ `saveDishMutation.mutateAsync({id, payload})` для каждого isDirty
5. ✅ `queryClient.invalidateQueries(["dishes", partnerId])`
6. ✅ Toast «Сохранено» / список ошибок если были

### HP-5: Фильтр по категории
1. Выбрать категорию в Select
2. ✅ Показываются только блюда выбранной категории

### HP-6: Поиск по названию
1. Ввести в Search
2. ✅ Фильтр `dish.name.toLowerCase().includes(search)`

### HP-7: Показать архив
1. Включить «Показать архив»
2. ✅ `isArchivedDish()` включает archived блюда

### HP-8: Фильтр несовпадений (mismatch)
1. Включить «Только несовпадающие»
2. ✅ Показывает блюда где enabled_hall ≠ is_available или enabled_pickup ≠ is_online_enabled

### HP-9: Normalize (диалог)
1. Нажать «Нормализовать» → `normalizeConfirmOpen = true`
2. ✅ Dialog с предупреждением
3. Подтвердить → массовое обновление enabled-флагов

---

## Edge Cases

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| E1 | Нет блюд | Пустая таблица |
| E2 | Ошибка сохранения | `bulkErrors[]` с ID и сообщением |
| E3 | 0 изменений (save) | Кнопка disabled или noop |
| E4 | Страница краш | PageErrorBoundary → карточка «Ошибка», кнопка «Перезагрузить» |
| E5 | isArchivedDish() | LEGACY метод — `:::archived:::` в description (не поле is_archived) |

---

## Специфические проверки

- **isDirty(original, edited):** сравнивает enabled_hall, enabled_pickup, enabled_delivery, sort_order
- **isArchivedDish():** `normStr(dish.description).toLowerCase().includes(":::archived::::")` — LEGACY
- **categories sort:** sort_order → localeCompare(name, "ru")
- **mismatch logic:** `d.enabled_hall !== (d.is_available !== false)` — обнаружение рассинхрона полей
- **FlaskConical иконка:** маркер LAB страницы
- **Нет PartnerShell:** страница не использует стандартный shell (LAB)
- **bulkProgress:** `{current, total}` для progress bar во время bulk save

---

## Preconditions & Тестовые данные

| Сценарий | Что подготовить |
|----------|----------------|
| HP-1 (таблица) | Partner с 20+ блюдами в 3 категориях |
| HP-8 (mismatch) | Блюда где enabled_hall ≠ is_available (рассинхрон) |
| HP-9 (normalize) | Минимум 3 блюда с mismatch для нормализации |
| E5 (LEGACY archived) | Блюдо с `:::archived:::` в description (не поле is_archived) |
| E2 (ошибка сохранения) | Симуляция API ошибки для одного блюда в batch |

---

## Security & Authorization Tests

| # | Тест | Ожидаемое |
|---|------|-----------|
| S1 | Открыть `/dishavailability1` без авторизации | `base44.auth.me()` редиректит на логин |
| S2 | Только свои блюда видны и редактируются | `filter({partner: partnerId})` scope |

---

## UI / Visual Tests

| # | Тест | Критерий прохождения |
|---|------|---------------------|
| V1 | Мобиль 390px — таблица с 6 колонками | Горизонтальный скролл или reflow |
| V2 | Чекбоксы Hall/Pickup/Delivery | Touch target ≥ 44px |
| V3 | bulkProgress bar | Видна и обновляется во время bulk save |
| V4 | FlaskConical иконка (LAB маркер) | Видна в заголовке |

---

## Performance Tests

| # | Тест | Целевой показатель |
|---|------|--------------------|
| P1 | 100+ блюд — рендер таблицы | Без лагов при открытии |
| P2 | Batch save 100 изменений (по 5 штук) | `bulkProgress` обновляется, UI не заморожен |
| P3 | `isDirty` check для 100 блюд при save | Мгновенный (синхронный) |

---

## Integration Tests

| # | Сценарий | Ожидаемое |
|---|----------|-----------|
| I1 | Выключить Hall для блюда → PublicMenu (hall режим) | Блюдо скрыто от гостей зала |
| I2 | Выключить Pickup → PublicMenu (pickup режим) | Блюдо скрыто для навынос |
| I3 | Mismatch filter → Normalize → DishAvailability и MenuDishes | Поля синхронизированы в обоих источниках |
