# PartnerStaffAccess

**Page:** Partner Cabinet > Staff Access Management
**Route:** `/partnerstaffaccess`
**Last updated:** 2026-02-28

## Description
Manages staff access links for the restaurant. Partners can create invite links (via link or email), assign roles (director, managing director, staff, kitchen, manager), enable/disable access, and perform bulk operations.

## RELEASE History

| Version | Date | Description |
|---------|------|-------------|
| v1.0 | 2026-02-24 | BASE - original code from Base44 |
| v1.1 | 2026-02-24 | XSS fix, bulk permission bypass, clipboard fallback |
| v1.2 | 2026-02-28 | Phase 1 mobile UX: touch targets 44px, send invitation on all pending cards |

## UX Changelog

| Date | Change |
|------|--------|
| 2026-02-28 | Кнопки действий на карточках сотрудников увеличены до 44px для мобильных. Отступы между кнопками увеличены до 8px. Кнопка "Отправить приглашение" теперь видна на ВСЕХ ожидающих карточках (email + link). Чекбокс массового выбора увеличен до 44px. |
