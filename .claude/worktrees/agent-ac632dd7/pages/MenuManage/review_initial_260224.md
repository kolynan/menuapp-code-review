# Code Review Report: menumanage.jsx

**Date:** 2026-02-24
**Reviewers:** Claude (correctness + style) + Post-fix verification
**File:** `pages/MenuManage/menumanage.jsx` (1482 → ~1481 lines after fixes)
**Commits:** `fbe924a`, `1b20f90`

---

## Summary

MenuManage is a category and dish management page with drag-and-drop reordering, multi-channel support, image upload, and archive functionality. It does NOT use `usePartnerAccess()` — instead implements its own auth via `getUser()` + `loadPartner()` (valid pattern for non-PartnerShell pages). It has good i18n coverage via `useI18n()`. The main issues found were a cross-partner data leak in the entity loading fallback, missing rollback for optimistic drag-and-drop operations, and a premature state update in the reindex path. All P1 issues were fixed.

---

## Fixed Bugs (P0/P1 — implemented in this review)

### BUG-MM-001 (P1): listFor() data leak via .list() fallback
- **File:** menumanage.jsx (~line 196, listFor function)
- **Impact:** When all `.filter({ partner: pid })` key variations fail, `listFor()` falls back to `.list()` which returns ALL records across ALL partners — a data confidentiality violation
- **Fix:** Removed `.list()` fallback entirely; function now returns `[]` when all filter attempts fail
- **Commit:** `fbe924a`

### BUG-MM-002 (P1): batchedReindex premature state update
- **File:** menumanage.jsx (~line 464, batchedReindex function)
- **Impact:** `batchedReindex` called `setter()` to update state before all API batch calls completed. If batch 2+ failed, UI showed partially-reindexed state with no rollback
- **Fix:** Moved `setter()` call to AFTER all batch API calls succeed. Added snapshot/rollback pattern in calling functions (`reorderCats`, `moveDish`)
- **Commit:** `fbe924a`

### BUG-MM-002 regression (P1): Premature setDishesRaw in moveDish null-order path
- **File:** menumanage.jsx:622
- **Impact:** In the cross-category moveDish path when `computeMidOrder` returns null, `setDishesRaw` was called before `batchedReindex`, causing a brief flash of incorrect state. Since `batchedReindex` now handles the state update internally, this pre-call was redundant
- **Fix:** Removed premature `setDishesRaw` call; `batchedReindex` handles state update after all API calls succeed
- **Commit:** `1b20f90`

### BUG-MM-003 (P1): reorderCats/moveDish missing optimistic rollback
- **File:** menumanage.jsx (reorderCats, moveDish functions)
- **Impact:** If drag-and-drop API calls fail, UI stays in optimistic state with no way to recover without page reload
- **Fix:** Added `const snapshot = catsRaw/dishesRaw` before optimistic update; in catch block, `setCatsRaw/setDishesRaw(snapshot)` restores original state
- **Commit:** `fbe924a`

---

## Active Bugs (P2/P3 — documented for future work)

### BUG-MM-004 (P2): AVAILABLE_LANGUAGES/CURRENCIES have Russian labels
- **File:** menumanage.jsx:75-96
- **Impact:** Labels like "Тенге", "Доллар США" are hardcoded Russian; should use `t()` for multi-locale admin UI
- **Recommendation:** Convert to function accepting `t` parameter: `const getCurrencies = (t) => [...]`

### BUG-MM-005 (P2): computeMidOrder precision limits
- **File:** menumanage.jsx (computeMidOrder function)
- **Impact:** After many drag-and-drop operations between adjacent items, floating point precision degrades; `isFloat` parameter suggests this is a known concern
- **Recommendation:** Monitor in production; `batchedReindex` with `ORDER_STEP` resets provide recovery path

### BUG-MM-006 (P2): No loading indicator during batchedReindex
- **File:** menumanage.jsx
- **Impact:** During multi-batch reindex (BATCH_SIZE=5), user sees no progress feedback; can initiate another drag while previous is in-flight (guarded by `reordering` flag)
- **Recommendation:** Add visual indicator during `reordering` state

### BUG-MM-007 (P3): Possible double-fire on DnD events
- **File:** menumanage.jsx:988
- **Impact:** `onDrop` handler calls `moveDish` without debounce; rapid drops could queue multiple moves
- **Recommendation:** The `reordering` guard prevents actual double-execution, so impact is low

---

## Statistics
- Total issues found: 7 (P0: 0, P1: 3 + 1 regression, P2: 3, P3: 1)
- Issues fixed: 4 (P1: 3 + 1 regression)
- Issues documented: 4 (P2: 3, P3: 1)
- Files analyzed: 1
- Lines of code: ~1481
