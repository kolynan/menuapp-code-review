# StaffOrdersMobile Bug Tracker

**Page:** `pages/StaffOrdersMobile/staffordersmobile.jsx`
**Last updated:** 2026-02-24

---

## Fixed Bugs

### BUG-SM-002 (P1) -- handleCloseAllOrders silent error swallowing
- **Function:** handleCloseAllOrders
- **Fix:** Added error toast for non-rate-limit failures
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-003 (P1) -- AudioContext resource leak on unmount
- **Function:** createBeep / audioRef usage
- **Fix:** Added cleanup useEffect that calls `beep.ctx.close()` on unmount
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-004 (P1) -- Logout race condition with device unbinding
- **Function:** handleLogout
- **Fix:** Changed to async with await on StaffAccessLink.update; wrapped in try/catch
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-005 (P2) -- parseTime NaN propagation
- **Function:** parseTime
- **Fix:** Added `if (isNaN(h) || isNaN(m)) return null;` guard
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-006 (P1) -- filteredGroups uses unsorted orderGroups
- **Line:** ~2479-2490
- **Fix:** Changed input from `orderGroups` to `sortedGroups`; updated dependency array
- **Commit:** `1b20f90`
- **Status:** FIXED

---

## Active Bugs

### BUG-SM-001 (P1 -- deferred) -- Complete absence of i18n
- **Scope:** Entire file (~3040 lines)
- **Impact:** 100+ hardcoded Russian strings: buttons, toasts, status text, help text, errors
- **Recommendation:** Dedicated i18n pass; estimated 100-120 translation keys needed
- **Status:** Deferred — too large for this review cycle

### BUG-SM-007 (P2) -- window.confirm in handleCloseTable
- **Function:** handleCloseTable
- **Impact:** Blocked in iframes, not keyboard accessible
- **Recommendation:** Replace with custom Dialog confirmation

### BUG-SM-008 (P2) -- No error toast in handleAction
- **Function:** handleAction
- **Impact:** Order status update failure gives no user feedback
- **Recommendation:** Add error toast in catch block

### BUG-SM-009 (P2) -- Magic numbers throughout polling/timing logic
- **Impact:** Numbers like 5000, 60000, 300000 scattered without named constants
- **Recommendation:** Extract to named constants

### BUG-SM-010 (P3) -- Version header block is 87 lines long
- **Lines:** 1-87
- **Impact:** Changelog in code header; better suited for CHANGELOG.md
- **Recommendation:** Move to separate file
