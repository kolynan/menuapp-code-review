---
version: "1.4"
updated: "2026-03-01"
session: 52
---

# PartnerTables — BUGS

## Active Bugs

_No active bugs._

## Fixed Bugs (260301-00 RELEASE — Phase 1v2 CC+Codex)

### BUG-PT-P1v2-001 | P2 | Zone actions: 4 icons without overflow menu
**Строки:** 752-800 (v1.5)
**Фикс:** Replaced 3 inline icon buttons (QR, Edit, Delete) with DropdownMenu overflow. Only "+ Table" stays visible.
**Codex:** Confirmed same issue. CC fix applied.
**RELEASE:** 260301-00

### BUG-PT-P1v2-002 | P2 | Zone actions spacing 4px (should be 8px)
**Строка:** 752 (v1.5)
**Фикс:** gap-1 -> gap-2.
**Codex:** Confirmed.
**RELEASE:** 260301-00

### BUG-PT-P1v2-003 | P2 | Reorder button spacing 4px (should be 8px)
**Строка:** 852 (v1.5)
**Фикс:** gap-1 -> gap-2.
**Codex:** Confirmed.
**RELEASE:** 260301-00

### BUG-PT-P1v2-004 | P2 | Reorder arrows 44px (should be 48px per UX consensus)
**Строки:** 856, 866 (v1.5)
**Фикс:** h-11 w-11 -> h-12 w-12, icons h-4 w-4 -> h-5 w-5.
**Codex:** Found this issue independently. CC agreed and applied.
**RELEASE:** 260301-00

### BUG-PT-D03 | CLOSED | setDragImage rename
**Строка:** 1400
**Решение (S43):** Codex — оставить как есть. Нет runtime бага, переименование может сломать связанный код.
**Статус:** ✅ закрыт — не требует действий

### BUG-PT-D04 | CLOSED | DRY refactor moveTableUp/Down
**Строки:** 1761-1789
**Решение (S43):** Codex — оставить две функции. Guard уже добавлен (BUG-PT-007), рефакторинг не срочный перед релизом.
**Статус:** ✅ закрыт — не требует действий

## Fixed Bugs (260228-01 RELEASE — Phase 1 Touch Targets)

### BUG-PT-P1-001 | P2 | Mobile reorder buttons too small (24x32px)
**Строки:** 848-867 (v1.4)
**Фикс:** h-6 w-8 -> h-11 w-11, icons h-3 w-3 -> h-4 w-4, added gap-1 spacing.
**RELEASE:** 260228-01

### BUG-PT-P1-002 | P2 | Area "Add table" button 40px
**Строка:** 756 (v1.4)
**Фикс:** h-10 -> h-11 (44px).
**RELEASE:** 260228-01

### BUG-PT-P1-003 | P2 | Code settings refresh button 40px
**Строка:** 1054 (v1.4)
**Фикс:** h-10 w-10 -> h-11 w-11 (44px).
**RELEASE:** 260228-01

### BUG-PT-P1-004 | P2 | Search close button ~24px
**Строка:** 2178 (v1.4)
**Фикс:** p-1 -> h-11 w-11 flex items-center justify-center (44px touch target).
**RELEASE:** 260228-01

### BUG-PT-P1-005 | P2 | QR select/deselect buttons 32px
**Строки:** 2441, 2444 (v1.4)
**Фикс:** h-8 -> h-11 (44px).
**RELEASE:** 260228-01

### BUG-PT-P1-006 | P2 | Code mode edit button 36px
**Строка:** 2188 (v1.4)
**Фикс:** h-9 -> h-11 (44px).
**RELEASE:** 260228-01

## Fixed Bugs (260228-00 RELEASE)

### BUG-PT-D01 | P3 | console.error calls — dev-only gate
**Строки:** 580, 1278, 1633, 1890, 1983 (v1.4)
**Фикс:** Обёрнуты в `if (process.env.NODE_ENV !== 'production')`.
**RELEASE:** 260228-00

### BUG-PT-D02 | P2 | window.confirm() — i18n key fix
**Строка:** 1973 (v1.4)
**Фикс:** Ключ изменён с `tables.close_table_confirm` на `partnertables.confirm.delete_table` (правильный формат page.section.element).
**RELEASE:** 260228-00

## Fixed Bugs (260222-00 RELEASE)

### BUG-PT-001 | P0 | XSS via unescaped values in print functions
**Строки:** 2053, 2087
**Описание:** `areaName`, `num`, `t()` returns интерполируются raw в `document.write()`. `escapeHtml()` уже есть (строка 147), но не применяется.
**Фикс:** Добавлен `escapeHtml()` на все интерполированные значения в обоих print-функциях.
**RELEASE:** 260222-00

### BUG-PT-002 | P0 | QRCodeImage — async sets state after unmount
**Строки:** 332-372
**Описание:** Нет cleanup в useEffect. Async callback вызывает `setReady(true)` после unmount.
**Фикс:** Добавлен `cancelled` flag + cleanup return.
**RELEASE:** 260222-00

### BUG-PT-003 | P1 | Hardcoded Russian fallback strings
**Строки:** 1218, 1834, 1846
**Фикс:** Заменены на `t()` ключи.
**RELEASE:** 260222-00

### BUG-PT-004 | P1 | Hardcoded '0000' fallback placeholder
**Строка:** 1042
**Фикс:** `placeholder={t('partnertables.code_settings.prefix_placeholder')}`.
**RELEASE:** 260222-00

### BUG-PT-005 | P1 | .toLowerCase() on t() — locale-unsafe
**Строка:** 1080
**Фикс:** Целая фраза через i18n ключ (Codex improvement).
**RELEASE:** 260222-00

### BUG-PT-006 | P1 | reload useCallback — stale closure
**Строки:** 1277-1308
**Фикс:** `hasAutoExpandedRef` + fixed deps + functional `setExpandedAreas`.
**RELEASE:** 260222-00

### BUG-PT-007 | P2 | moveTableUp/Down missing reordering guard
**Строки:** 1761, 1776
**Фикс:** Добавлен `if (reordering) return;` guard.
**RELEASE:** 260222-00

### BUG-PT-008 | P2 | Magic number 250
**Строка:** 2056
**Фикс:** Вынесен в `PRINT_WINDOW_RENDER_DELAY_MS` constant.
**RELEASE:** 260222-00

### BUG-PT-009–012 | P2-P3 | Codex findings
Hardcoded fallbacks (`'000'`, `'?'`, `'—'`), hardcoded placeholders, i18n fixes.
**RELEASE:** 260222-00

### BUG-PT-013–015 | P3 | Style
Hardcoded aria-label, `№` symbol, `→` arrow — all moved to i18n.
**RELEASE:** 260222-00
