# MenuDishes Bug Tracker

**Page:** `pages/MenuDishes/menudishes.jsx`
**Last updated:** 2026-02-24

---

## Fixed Bugs

### BUG-MD-001 (P0) -- Cross-category move: no rollback on error
- **Lines:** 1664-1710
- **Fix:** Snapshot `dishOrderByCat` before optimistic update, restore in `onError`; guard for undefined dish
- **Commit:** `1cff8b5`
- **Status:** FIXED

### BUG-MD-002 (P0) -- batchedUpdates partial failure leaves DB inconsistent
- **Lines:** 172-183
- **Fix:** Replaced `Promise.all` with `Promise.allSettled`; collects failures, throws with details
- **Commit:** `1cff8b5`
- **Status:** FIXED

### BUG-MD-003 (P1) -- New drag starts during post-move refetch window
- **Lines:** 1003, 1451
- **Fix:** Expanded `isSavingDish` to include `moveDishToCategoryMutation.isSuccess && fetchingDishes`; round-2 changed `isLoading` to `isFetching`
- **Commits:** `1cff8b5`, `a6828f6`
- **Status:** FIXED

### BUG-MD-004 (P1) -- Stale closure in saveCategoryMutation/saveDishMutation onSuccess
- **Lines:** 871-890, 906-925
- **Fix:** Changed to `{payload, meta}` pattern -- metadata passed through mutation
- **Commit:** `1cff8b5`
- **Status:** FIXED

### BUG-MD-005 (P1) -- Settings dialog closes before mutation completes
- **Lines:** 1070-1081
- **Fix:** Moved `setSettingsDialogOpen(false)` from `saveSettings()` into `savePartnerMutation.onSuccess`
- **Commit:** `1cff8b5`
- **Status:** FIXED

### BUG-MD-006 (P1) -- createContactLinkMutation stale sort_order
- **Line:** 834
- **Fix:** Accept `sort_order` via payload (evaluated at call time), not from closure
- **Commit:** `1cff8b5`
- **Status:** FIXED

### BUG-MD-007 (P1) -- RAF not cancelled when switching drag types
- **Lines:** 1298, 1451
- **Fix:** Cancel opposite RAF in both `onCategoryGripPointerDown` and `onDishGripPointerDown`
- **Commit:** `1cff8b5`
- **Status:** FIXED

---

## Active Bugs

### BUG-MD-008 (P2) -- No i18n: entire file hardcoded Russian
- **Scope:** Entire file (~120+ strings)
- **Impact:** Non-Russian users see Russian text; i18n key detection not possible
- **Recommendation:** Full i18n migration: import `useI18n`, convert constants to functions, replace all hardcoded strings

### BUG-MD-009 (P2) -- `<style>` tag instead of Tailwind class
- **Lines:** 1896-1904
- **Impact:** Violates Tailwind-only rule; raw CSS injected into JSX
- **Recommendation:** Replace with `scrollbar-hide` Tailwind plugin class

### BUG-MD-010 (P2) -- DOM classList manipulation for highlight animation
- **Lines:** 1700-1703
- **Impact:** Direct DOM mutation bypasses React reconciliation, fragile
- **Recommendation:** Replace with `highlightedDishId` state + conditional className

### BUG-MD-011 (P2) -- PartnerShell wrapper not used
- **Line:** 428
- **Impact:** Manual auth/partner loading instead of standard pattern
- **Recommendation:** Assess if intentional; if not, migrate to PartnerShell wrapper

### BUG-MD-012 (P2) -- Dish image URL saved unvalidated
- **Lines:** 1250, 2864
- **Impact:** Invalid/malicious URL stored in DB; low XSS risk via img src
- **Recommendation:** Add `isUrlSafe()` check in `saveDish()`

### BUG-MD-013 (P2) -- Magic numbers (scrollToCategory offset, scroll-spy offset)
- **Lines:** 1052, 1737
- **Impact:** Duplicate of HEADER_HEIGHT constant; inconsistent offset values
- **Recommendation:** Use `HEADER_HEIGHT` constant consistently

### BUG-MD-014 (P2) -- AVAILABLE_CURRENCIES labels hardcoded Russian
- **Lines:** 84-93
- **Impact:** i18n violation; labels appear unused in rendering
- **Recommendation:** Remove `label` field if unused, or convert to `getCurrencies(t)`

### BUG-MD-015 (P2) -- getDefaultContactLabel returns hardcoded "Ссылка"
- **Line:** 204
- **Impact:** Hardcoded Russian fallback for unknown contact type
- **Recommendation:** Part of i18n migration

### BUG-MD-016 (P3) -- Icon-only buttons missing aria-label
- **Lines:** 2018-2022, 2146-2153, 2420-2436
- **Impact:** Screen readers cannot identify button purpose
- **Recommendation:** Add `aria-label` (after i18n migration)

### BUG-MD-017 (P3) -- `title` attributes hardcoded Russian
- **Lines:** 2019, 2129, 2150, 2165, 2404
- **Impact:** Tooltips not translatable
- **Recommendation:** Part of i18n migration

### BUG-MD-018 (P3) -- "Preview" button label hardcoded English
- **Line:** 2060
- **Impact:** Inconsistent with rest of page (Russian); should use i18n
- **Recommendation:** Part of i18n migration
