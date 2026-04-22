# MenuTranslations

## Description
Translation management page for menu categories and dishes. Partners use this page to add, edit, and manage translations of their menu into other languages (en, kk, custom codes). Part of the Partner admin panel.

## Features
- Inline editing of translations per category/dish
- Language selector with custom language codes (stored per partner in localStorage)
- Bulk paste from TSV (spreadsheet copy-paste workflow)
- Export to TSV file
- Copy template to clipboard
- Progress tracking (translated/total counts)
- Search and category filter
- Automatic preview before bulk paste execution

## Entities Used
- **Category** — menu categories (filtered by partner)
- **Dish** — menu dishes (filtered by partner, archived excluded)
- **CategoryTranslation** — translations for categories (partner + lang scoped)
- **DishTranslation** — translations for dishes (partner + lang scoped)

## Key Dependencies
- `@tanstack/react-query` — data fetching and caching
- `useI18n` from `@/components/i18n` — i18n translation function
- `PartnerShell` — partner admin wrapper
- `sonner` — toast notifications

## RELEASE History

| RELEASE | Date | Changes |
|---------|------|---------|
| 260225-00 | 2026-02-25 | Initial review. Fixed 8 bugs (7x P1): language/tab switch data corruption, queryFn error swallowing, Promise.allSettled for partial failures, storageKey race condition, forEach variable shadowing, full i18n compliance (51+ strings). |

## UX Changelog

### 260225-00 (Initial Review)
- Users now see a confirmation dialog when switching language or tab with unsaved edits (prevents silent data corruption)
- Translation fetch errors now show proper error UI instead of empty table
- Partial save failures show count of succeeded/failed operations
- Custom language codes persist correctly across page refreshes
- All UI text uses i18n translation system (menu_translations.* keys with English fallbacks)
