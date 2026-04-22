---
version: "1.2"
updated: "2026-03-01"
session: 52
---

# MenuManage — Управление категориями и блюдами

## Описание
Управление категориями меню и блюдами. Drag-and-drop для порядка, переводы на 9 языков, infinite scroll для больших меню, cross-category перетаскивание блюд.

**Route:** `/menumanage`
**Roles:** partner_owner, partner_manager, director, managing_director
**Размер:** 1482 строк

## Архитектура

### Entities
- **Category** — full CRUD + drag reorder
- **Dish** — full CRUD + cross-category moves
- **DishTranslation** — CRUD для переводов
- **Partner** — read (настройки)
- **OrderItem** — read (блокировка удаления)

### Ключевые паттерны
- **Infinite scroll:** IntersectionObserver, INITIAL_VISIBLE=50, LOAD_MORE_COUNT=30
- **Drag-and-drop:** cross-category, computeMidOrder, batched reindex (BATCH_SIZE=5)
- **Multilingual:** 9 языков (RU/EN/KK/DE/TR/ZH/AR/ES/FR)
- **i18n:** useI18n hook

## RELEASE History

| RELEASE | Сессия | Описание |
|---------|--------|----------|
| 260301-00 | S52 | Phase 1v2: overflow-меню + верификация тач-таргетов |
| 260228-00 | S52 | Phase 1: тач-таргеты для мобильных |
| 260224-01 | S31 | Первичный ревью + 4 бага |

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-03-01 | 1.2 | Overflow-меню: удаление категории и архивация блюд перенесены в три-точки. Макс 1-2 кнопки в строке. |
| 2026-02-28 | 1.1 | Тач-таргеты: все кнопки минимум 44x44px, стрелки сортировки 48x48px, отступы 8px |
| 2026-02-24 | 1.0 | Первичное сохранение кода |
