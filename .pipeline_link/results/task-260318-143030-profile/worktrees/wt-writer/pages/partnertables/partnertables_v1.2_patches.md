# partnertables v1.2 — Patch Summary

**Date:** 2026-02-22
**Pipeline:** Full (Claude Code sub-reviewers + Codex Round 1)
**Base version:** v1.0 (2499 lines)
**Total patches applied:** 16 (12 confirmed + 4 new from Codex)
**Disputed (deferred):** 4 (console.error, confirm(), setDragImage rename, DRY refactor)

---

## P0 — Critical Security & Stability (2 patches)

### P0-1: XSS in print functions
- **printSingleQR** (~line 2053): Wrapped title, alt, table number, area name, scan hint in `escapeHtml()`
- **printBatchQR** (~line 2087): Same escapeHtml() treatment for all dynamic values
- Also localized hardcoded `alt="QR Code"` → `t('partnertables.qr.alt')`

### P0-2: QRCodeImage unmount safety
- Added `cancelled` flag + cleanup return in useEffect
- Added `setReady(false)` on prop change to prevent stale QR display
- All async callbacks check `cancelled` before `setReady(true)`

## P1 — Important Fixes (4 patches)

### P1-1: Hardcoded Russian fallback strings
- Line ~1218, ~1834, ~1846: Removed Russian string fallbacks for error messages
- Now uses only `t()` keys: `partnertables.error.table_exists`, `partnertables.error.code_exists`

### P1-2: Hardcoded '0000' placeholder
- Line ~1042: Changed `placeholder="0000"` → `placeholder={t('partnertables.code_settings.prefix_placeholder')}`

### P1-3: `.toLowerCase()` on t() — locale-unsafe
- Line ~1080: Replaced `.toLowerCase()` hack with dedicated i18n key
- `t('partnertables.code_settings.example_result', { number: 1 })`

### P1-6: reload stale closure
- Added `hasAutoExpandedRef` to prevent re-expansion on every reload
- Fixed `reload` dependency array (removed `expandedAreas.size`, added `loadSessions`)
- Fixed `useEffect` dependency to include `reload`

## P2 — Quality Improvements (3 patches)

### P2-1: moveTable reordering guard
- `moveTableUp`: Added `if (reordering) return;` check
- `moveTableDown`: Added `if (reordering) return;` check

### P2-4: Magic number extraction
- Added `PRINT_WINDOW_RENDER_DELAY_MS = 250` constant
- Used in `setTimeout` for print window render delay

### P2-5: Indentation fix
- Fixed indentation of `[reordering, setReordering]` declaration (~line 1142)

## P3 — Minor Improvements (3 patches)

### P3-1: GripHandle aria-label
- Changed hardcoded `"Drag to reorder"` → `t('partnertables.drag_to_reorder')`
- Added `const { t } = useI18n();` inside GripHandle component

### P3-2: № symbol in print QR
- Replaced `№${num}` → `t('partnertables.qr.table_number_label', { number: num })`
- Full label in one i18n key: "Стол №{number}" (RU), "Table #{number}" (EN)

### P3-3: Text arrow → icon
- Line ~2394: Replaced text "→" with `<ChevronRight>` icon component

## NEW — Found by Codex (4 patches)

### NEW-1 (P2): Hardcoded '000' in preview
- Line ~1078: `code || '000'` → `code || t('partnertables.code_settings.prefix_placeholder')`

### NEW-2 (P2): Hardcoded "?" fallback
- Line ~2292: `number: tableForm.number || "?"` → `|| t('partnertables.dialog.table.unknown_number')`

### NEW-3 (P3): Hardcoded input placeholders
- Line ~2295: `placeholder="1"` → `placeholder={t('partnertables.dialog.table.number_placeholder')}`
- Line ~2297: `placeholder="1234"` → `placeholder={t('partnertables.dialog.table.code_placeholder')}`

### NEW-4 (P3): Hardcoded "—" in TableCodeDisplay
- Line ~516: `table?.code || "—"` → `table?.code || t('partnertables.table.code_missing')`
- Added `const { t } = useI18n();` inside TableCodeDisplay component

---

## Deferred (not applied — Arman decided to accept Codex position)

| ID | Issue | Decision |
|---|---|---|
| D1 | console.error in production | Keep — useful for debugging |
| D2 | window.confirm() | Keep — sufficient for MVP |
| D3 | setDragImage naming | Keep — no real conflict |
| D4 | DRY refactor moveTable | Keep — too big for code review scope |

---

## New i18n Keys Required

```
partnertables.qr.alt
partnertables.qr.table_number_label (with {number} param)
partnertables.code_settings.prefix_placeholder
partnertables.code_settings.example_result (with {number} param)
partnertables.drag_to_reorder
partnertables.dialog.table.unknown_number
partnertables.dialog.table.number_placeholder
partnertables.dialog.table.code_placeholder
partnertables.table.code_missing
```
