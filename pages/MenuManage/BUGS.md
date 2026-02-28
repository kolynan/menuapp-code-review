# MenuManage Bug Tracker

**Page:** `pages/MenuManage/menumanage.jsx`
**Last updated:** 2026-02-28

---

## Fixed Bugs

### BUG-MM-001 (P1) -- listFor() data leak via .list() fallback
- **Function:** listFor (~line 196)
- **Fix:** Removed `.list()` fallback; returns `[]` when all filter attempts fail
- **Commit:** `fbe924a`
- **Status:** FIXED

### BUG-MM-002 (P1) -- batchedReindex premature state update
- **Function:** batchedReindex (~line 464)
- **Fix:** Moved `setter()` call to after all batch API calls succeed
- **Commit:** `fbe924a`
- **Status:** FIXED

### BUG-MM-002 regression (P1) -- Premature setDishesRaw in moveDish null-order path
- **Line:** ~622
- **Fix:** Removed redundant `setDishesRaw` before `batchedReindex`; `batchedReindex` handles state update
- **Commit:** `1b20f90`
- **Status:** FIXED

### BUG-MM-003 (P1) -- reorderCats/moveDish missing optimistic rollback
- **Functions:** reorderCats, moveDish
- **Fix:** Added snapshot save before optimistic update; restore on error in catch block
- **Commit:** `fbe924a`
- **Status:** FIXED

### BUG-MM-008 (P1) -- Touch targets too small for mobile
- **Lines:** ~890-960 (category buttons), ~1000-1060 (dish buttons), ~1100-1170 (header/toolbar)
- **Fix:** All icon buttons increased to 44x44px minimum, reorder arrows to 48x48px, gaps to 8px
- **RELEASE:** 260228-00
- **Status:** FIXED

---

## Active Bugs

### BUG-MM-004 (P2) -- AVAILABLE_LANGUAGES/CURRENCIES have Russian labels
- **Lines:** 75-96
- **Impact:** Hardcoded Russian labels; should use `t()` for multi-locale admin UI
- **Recommendation:** Convert to function accepting `t` parameter

### BUG-MM-005 (P2) -- computeMidOrder precision limits
- **Function:** computeMidOrder
- **Impact:** Floating point precision degrades after many consecutive drag-and-drops
- **Recommendation:** Monitor in production; `batchedReindex` resets provide recovery

### BUG-MM-006 (P2) -- No loading indicator during batchedReindex
- **Impact:** No progress feedback during multi-batch reindex
- **Recommendation:** Add visual indicator during `reordering` state

### BUG-MM-007 (P3) -- Possible double-fire on DnD events
- **Line:** ~988
- **Impact:** Low — guarded by `reordering` flag
- **Recommendation:** Monitor; no immediate fix needed
