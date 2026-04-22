---
version: "1.0"
updated: "2026-02-24"
session: 31
---

# MenuDishes — WYSIWYG Menu Editor

## Описание
Визуальный редактор меню. Drag-and-drop для категорий и блюд, CRUD, переводы, изображения, каналы. Самый большой файл проекта.

**Route:** `/menudishes`
**Roles:** partner_owner, partner_manager, director, managing_director
**Размер:** 2992 строк (v4.9)
**Структура:** PART1 (imports, state) + PART2 (mutations, handlers, DnD) + PART3 (render, dialogs)

## Архитектура

### Компоненты
- `MenuDishes` — главный компонент (export default, ~2500 строк)
- `MenuSkeleton` — loading placeholder

### Entities
- **Partner** — настройки ресторана (read)
- **Category** — категории меню (full CRUD)
- **Dish** — блюда (full CRUD + archive)
- **PartnerContactLink** — контакты для footer (read)

### Ключевые паттерны
- **Drag-and-drop:** pointer events, grid intersection (getGridInsertIndex), RAF throttling
- **Batched updates:** batchedUpdates() для массовых изменений sort_order
- **Rate limiting:** isRateLimitError(), shouldRetry(), 100-dish warning
- **XSS protection:** isUrlSafe(), encodeURIComponent для preview
- **i18n:** multi-language tabs в диалогах (dish, category)
- **Archive:** is_archived вместо description markers
- **Optimistic UI:** undo toast для drag moves

### TanStack React Query
- **5 useQuery:** currentUser, partner, categories, dishes, contactLinks
- **9 useMutation:** Partner save, ContactLink CRUD, Category CRUD, Dish CRUD, order mutations

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-02-24 | 4.9 (1.0 save) | Первичное сохранение кода (из B44, audit fixes P0.1-P1.4) |

## Известные вопросы для review
1. **Монолитный файл (2992 строк):** 1 компонент, все в одном файле
2. **State explosion:** 18+ useState, 13+ useRef — кандидат на useReducer
3. **DnD дублирование:** category и dish drag handlers похожи
4. **Нет error boundary**
5. **Нет retry UI** при rate limit (только disable queries)
6. **Диалоги не data-driven** — hardcoded fields
7. **Archived dishes:** фильтруются, но нет UI для просмотра архива
