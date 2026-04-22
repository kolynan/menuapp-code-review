---
version: "1.3"
updated: "2026-03-01"
session: 52
---

# PartnerTables — Управление столами ресторана

## Описание
Большая страница (~2500 строк) управления столами: CRUD столов и зон, генерация QR-кодов, drag-and-drop сортировка, управление сессиями, пакетная печать QR.

**Route:** `/partnertables`
**Roles:** Owner, Staff (с доступом к столам)
**Размер:** ~2499 строк

## Entities
- **Table** — CRUD (создание, редактирование, удаление столов)
- **Area** — CRUD (зоны ресторана)
- **TableSession** — read/close (активные сессии)
- **Partner** — read (настройки партнёра, логотип для QR)

## Ключевые паттерны
- QR Code generation — `qrcode` library + canvas rendering with logo overlay
- Drag-and-drop reorder — HTML5 DnD API для порядка столов
- Batch QR printing — открытие print window с CSS-сеткой
- `escapeHtml()` — sanitization для document.write() print functions
- Code settings — настраиваемый префикс и формат кодов столов

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260301-00 | 2026-03-01 | Phase 1v2 CC+Codex: zone overflow menu, reorder 48px, 8px spacing |
| 260228-01 | 2026-02-28 | Phase 1 Touch Targets: 6 fixes, all interactive elements >= 44x44px |
| 260228-00 | 2026-02-28 | Fix D01 (console.error dev-gate) + D02 (confirm i18n key) |
| 260222-00 | 2026-02-22 | Code review: 16 patches (2×P0, 4×P1, 3×P2, 3×P3 + 4 Codex), 4 disputes |

## UX Changelog

| Дата | Версия | Что изменилось |
|------|--------|----------------|
| 2026-03-01 | 260301-00 | Зона: действия в overflow-меню (QR, ред., удал.), кнопки сортировки 48px, отступы 8px. CC+Codex верификация |
| 2026-02-28 | 260228-01 | Мобильные кнопки увеличены до 44px: кнопки сортировки, закрытия поиска, QR-выбора, настроек кодов |
| 2026-02-28 | 260228-00 | console.error скрыты в проде; confirm-диалог — правильный i18n ключ |
| 2026-02-22 | 260222-00 | Безопасность QR-печати (XSS fix); стабильность QR-рендеринга; локализация всех hardcoded текстов |
