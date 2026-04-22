# Code Review Report: staffordersmobile.jsx

**Date:** 2026-02-24
**Reviewers:** Claude (correctness + style) + Post-fix verification
**File:** `pages/StaffOrdersMobile/staffordersmobile.jsx` (3037 → ~3042 lines after fixes)
**Commits:** `f0f9159`, `1b20f90`

---

## Summary

StaffOrdersMobile is the largest file in the codebase (~3040 lines) — a mobile-first staff interface for order processing with polling, shift filtering, device binding, QR token auth, audio notifications, and group-by-table ordering. It does NOT use PartnerShell (standalone page accessed via token URL). The most significant structural issue is the complete absence of i18n — 100+ hardcoded Russian strings throughout the file. The fixes in this pass addressed silent error handling, resource leaks, race conditions, NaN propagation, and a sort-order bug.

---

## Fixed Bugs (P0/P1 — implemented in this review)

### BUG-SM-002 (P1): handleCloseAllOrders silent error swallowing
- **File:** staffordersmobile.jsx (handleCloseAllOrders function)
- **Impact:** When closing all orders for a table fails (non-rate-limit error), the catch block only handles rate limit errors and silently swallows all other failures. User gets no feedback that the operation failed
- **Fix:** Added `else` branch with `showToast('Ошибка при закрытии стола')` for non-rate-limit errors
- **Commit:** `f0f9159`

### BUG-SM-003 (P1): AudioContext resource leak on unmount
- **File:** staffordersmobile.jsx (createBeep / audioRef usage)
- **Impact:** `createBeep()` creates an `AudioContext` but never closes it on component unmount. Over time (hot-reloads, navigation), leaked contexts accumulate and browsers cap at ~6 active contexts, causing silent notification failures
- **Fix:** Added cleanup `useEffect` that calls `beep.ctx.close()` on unmount and nulls the ref
- **Commit:** `f0f9159`

### BUG-SM-004 (P1): Logout race condition with device unbinding
- **File:** staffordersmobile.jsx (handleLogout function)
- **Impact:** `handleLogout` was synchronous — called `base44.entities.StaffAccessLink.update()` to clear `bound_device_id` but didn't await it, then immediately cleared local state and redirected. The server unbind might never complete, leaving stale device lock
- **Fix:** Changed to `async` function with `await` on the update call; wrapped in try/catch for best-effort handling
- **Commit:** `f0f9159`

### BUG-SM-005 (P2): parseTime NaN propagation
- **File:** staffordersmobile.jsx (parseTime function)
- **Impact:** If `timeStr` is malformed (e.g., "abc"), `split(':').map(Number)` produces `NaN`, and `NaN * 60 + NaN` = `NaN` propagates into shift filter comparisons, potentially showing all orders or no orders
- **Fix:** Added `if (isNaN(h) || isNaN(m)) return null;` guard after parsing
- **Commit:** `f0f9159`

### BUG-SM-006 (P1): filteredGroups uses unsorted orderGroups
- **File:** staffordersmobile.jsx:2479-2490
- **Impact:** `filteredGroups` reads from `orderGroups` instead of `sortedGroups`, bypassing the v2.7.0 priority sort (sort by oldest unaccepted order). Groups appear in arbitrary insertion order instead of urgency order
- **Fix:** Changed input from `orderGroups` to `sortedGroups`; updated dependency array
- **Commit:** `1b20f90`

---

## Active Bugs (P2/P3 — documented for future work)

### BUG-SM-001 (P1 — deferred): Complete absence of i18n
- **File:** staffordersmobile.jsx (entire file)
- **Impact:** 100+ hardcoded Russian strings: button labels, toast messages, status text, help text, error messages. Non-Russian users see untranslated UI
- **Scope:** Systemic — requires dedicated i18n pass. Too large for this review cycle
- **Recommendation:** Create dedicated task to add `useI18n()` import and convert all strings to `t('staffordersmobile.section.element')` pattern. Estimated 100-120 translation keys needed

### BUG-SM-007 (P2): window.confirm in handleCloseTable
- **File:** staffordersmobile.jsx (handleCloseTable function)
- **Impact:** `window.confirm()` is blocked in iframes (Base44 preview), not keyboard accessible, not styled
- **Recommendation:** Replace with custom Dialog confirmation

### BUG-SM-008 (P2): No error toast in handleAction
- **File:** staffordersmobile.jsx (handleAction function)
- **Impact:** If order status update fails (non-rate-limit), user gets no feedback
- **Recommendation:** Add error toast in catch block (similar to BUG-SM-002 fix pattern)

### BUG-SM-009 (P2): Magic numbers throughout polling/timing logic
- **File:** staffordersmobile.jsx
- **Impact:** Numbers like `5000`, `60000`, `300000`, `10`, `180` scattered through code without named constants
- **Recommendation:** Extract to named constants: `POLL_INTERVAL_MS`, `MAX_POLL_INTERVAL_MS`, etc.

### BUG-SM-010 (P3): Version header block is 87 lines long
- **File:** staffordersmobile.jsx:1-87
- **Impact:** Changelog in code header is unusual and makes the file harder to navigate; better suited for CHANGELOG.md
- **Recommendation:** Move to separate changelog file; keep only current version in header

---

## Statistics
- Total issues found: 10 (P0: 0, P1: 4 + 1 deferred, P2: 4, P3: 1)
- Issues fixed: 5 (P1: 3 + 1 pre-existing, P2: 1)
- Issues documented: 5 (P1: 1 deferred, P2: 3, P3: 1)
- Files analyzed: 1
- Lines of code: ~3042
