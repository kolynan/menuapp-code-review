# Code Review Report: menudishes.jsx

**Date:** 2026-02-24
**Reviewers:** Claude (correctness + style) + Post-fix verification
**File:** `pages/MenuDishes/menudishes.jsx` (2992 → 3050 lines after fixes)
**Commits:** `1cff8b5`, `a6828f6`

---

## Summary

MenuDishes is a complex WYSIWYG menu editor with custom drag-and-drop, cross-category dish moves, CRUD operations with optimistic UI, batch updates, and rate limit handling. The main issues found were: missing rollback on cross-category move errors (P0), partial failure in batch updates leaving DB inconsistent (P0), stale closures in mutation callbacks, and a settings dialog that closed before mutation completion. The entire file lacks i18n — all strings are hardcoded Russian, which is tracked as systemic P2 debt. All P0/P1 issues were fixed.

---

## Fixed Bugs (P0/P1 — implemented in this review)

### BUG-MD-001 (P0): Cross-category move — no rollback on error
- **File:** menudishes.jsx:1664-1710
- **Impact:** Network error during move leaves dishOrderByCat permanently corrupted; subsequent saves persist wrong order
- **Fix:** Snapshot `dishOrderByCat` before optimistic update, restore in `onError`; also added guard for undefined dish during drag
- **Commit:** `1cff8b5`

### BUG-MD-002 (P0): batchedUpdates partial failure leaves DB inconsistent
- **File:** menudishes.jsx:172-183
- **Impact:** If one item in a batch fails, completed batches are committed but remaining are skipped — sort_order partially applied
- **Fix:** Replaced `Promise.all` with `Promise.allSettled`; collects failures and throws with details after completing all batches
- **Commit:** `1cff8b5`

### BUG-MD-003 (P1): New drag starts during post-move refetch window
- **File:** menudishes.jsx:1003,1451
- **Impact:** Second drag during refetch operates on stale data, dish appears in two categories
- **Fix:** Expanded `isSavingDish` to include `moveDishToCategoryMutation.isSuccess && fetchingDishes`; round-2 fix changed from `isLoading` to `isFetching`
- **Commits:** `1cff8b5`, `a6828f6`

### BUG-MD-004 (P1): Stale closure in saveCategoryMutation/saveDishMutation onSuccess
- **File:** menudishes.jsx:871-890, 906-925
- **Impact:** Toast shows wrong/empty category or dish name; wrong create/update branch
- **Fix:** Changed to `{payload, meta}` pattern — metadata (name, isEdit, editId) passed through mutation
- **Commit:** `1cff8b5`

### BUG-MD-005 (P1): Settings dialog closes before mutation completes
- **File:** menudishes.jsx:1070-1081
- **Impact:** If mutation fails, user's changes are silently lost; dialog already closed, no retry path
- **Fix:** Moved `setSettingsDialogOpen(false)` from `saveSettings()` into `savePartnerMutation.onSuccess`
- **Commit:** `1cff8b5`

### BUG-MD-006 (P1): createContactLinkMutation stale sort_order
- **File:** menudishes.jsx:834
- **Impact:** Two rapid contact additions get same sort_order, non-deterministic display order
- **Fix:** Accept `sort_order` via payload (evaluated at call time), not from closure
- **Commit:** `1cff8b5`

### BUG-MD-007 (P1): RAF not cancelled when switching drag types
- **File:** menudishes.jsx:1298, 1451
- **Impact:** Stale RAF callback fires after switching from dish drag to category drag (or vice versa), causing flicker or wrong state
- **Fix:** Cancel opposite RAF in both `onCategoryGripPointerDown` and `onDishGripPointerDown`
- **Commit:** `1cff8b5`

---

## Active Bugs (P2/P3 — documented for future work)

### BUG-MD-008 (P2): No i18n — entire file hardcoded Russian
- **File:** menudishes.jsx (entire file, ~120+ strings)
- **Impact:** Non-Russian users see Russian text; i18n key missing detection not possible
- **Recommendation:** Full i18n migration: import `useI18n`, convert constants to functions, replace all hardcoded strings

### BUG-MD-009 (P2): `<style>` tag instead of Tailwind class
- **File:** menudishes.jsx:1896-1904
- **Impact:** Violates Tailwind-only rule; raw CSS injected into JSX
- **Recommendation:** Replace with `scrollbar-hide` Tailwind plugin class

### BUG-MD-010 (P2): DOM classList manipulation for highlight animation
- **File:** menudishes.jsx:1700-1703
- **Impact:** Direct DOM mutation bypasses React reconciliation, fragile
- **Recommendation:** Replace with `highlightedDishId` state + conditional className

### BUG-MD-011 (P2): PartnerShell wrapper not used
- **File:** menudishes.jsx:428
- **Impact:** Manual auth/partner loading instead of standard pattern
- **Recommendation:** Assess if intentional; if not, migrate to PartnerShell wrapper

### BUG-MD-012 (P2): Dish image URL saved unvalidated
- **File:** menudishes.jsx:1250, 2864
- **Impact:** Invalid/malicious URL stored in DB; low XSS risk via img src
- **Recommendation:** Add `isUrlSafe()` check in `saveDish()`

### BUG-MD-013 (P2): Magic numbers (scrollToCategory offset, scroll-spy offset)
- **File:** menudishes.jsx:1052,1737
- **Impact:** Duplicate of HEADER_HEIGHT constant; inconsistent offset values
- **Recommendation:** Use `HEADER_HEIGHT` constant consistently

### BUG-MD-014 (P2): AVAILABLE_CURRENCIES labels hardcoded Russian
- **File:** menudishes.jsx:84-93
- **Impact:** i18n violation; labels appear unused in rendering
- **Recommendation:** Remove `label` field if unused, or convert to `getCurrencies(t)`

### BUG-MD-015 (P2): getDefaultContactLabel returns hardcoded "Ссылка"
- **File:** menudishes.jsx:204
- **Impact:** Hardcoded Russian fallback for unknown contact type
- **Recommendation:** Part of i18n migration

### BUG-MD-016 (P3): Icon-only buttons missing aria-label
- **File:** menudishes.jsx:2018-2022, 2146-2153, 2420-2436
- **Impact:** Screen readers cannot identify button purpose
- **Recommendation:** Add `aria-label` (after i18n migration)

### BUG-MD-017 (P3): `title` attributes hardcoded Russian
- **File:** menudishes.jsx:2019,2129,2150,2165,2404
- **Impact:** Tooltips not translatable
- **Recommendation:** Part of i18n migration

### BUG-MD-018 (P3): "Preview" button label hardcoded English
- **File:** menudishes.jsx:2060
- **Impact:** Inconsistent with rest of page (Russian); should use i18n
- **Recommendation:** Part of i18n migration

---

## Statistics

| Priority | Found | Fixed | Remaining |
|---|---|---|---|
| P0 | 2 | 2 | 0 |
| P1 | 5 | 5 | 0 |
| P2 | 8 | 0 | 8 |
| P3 | 3 | 0 | 3 |
| **Total** | **18** | **7** | **11** |

**Lines of code:** ~3050
**Files analyzed:** 1
**Review rounds:** 2 (initial + post-fix verification)
