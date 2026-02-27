# Code Review Report: partnerstaffaccess.jsx

**Date:** 2026-02-24
**Reviewers:** Claude (correctness + style) + Post-fix verification
**File:** `pages/PartnerStaffAccess/partnerstaffaccess.jsx` (2165 → ~2170 lines after fixes)
**Commits:** `53c960e`, `1b20f90`

---

## Summary

PartnerStaffAccess is a comprehensive staff invitation and access management page with QR code generation, token-based link invites, email invites, bulk operations, and role-based permissions. It correctly uses the PartnerShell wrapper pattern, has thorough i18n coverage, and implements solid permission-checking logic. The main issues found were an XSS vulnerability in the print QR flow, a permission bypass in bulk operations, and a clipboard fallback correctness bug. All critical issues were fixed in this review pass.

---

## Fixed Bugs (P0/P1 — implemented in this review)

### BUG-SA-001 (P0): XSS in printQR via staffName
- **File:** partnerstaffaccess.jsx (printQR function)
- **Impact:** Staff names containing `<script>` or HTML tags get injected into `document.write()`, enabling XSS in the print preview window
- **Fix:** Added `escapeHtml()` helper that escapes `&`, `<`, `>`, `"`, `'`; applied to `staffName` before injection into `document.write()`
- **Commit:** `53c960e`

### BUG-SA-002 (P1): Bulk operations permission bypass
- **File:** partnerstaffaccess.jsx (handleBulkEnable, handleBulkDisable, handleBulkDeleteConfirm)
- **Impact:** User selects items including some they don't have permission to modify (e.g., director links when user is not director); bulk enable/disable/delete would process ALL selected items, bypassing `canDeleteLink()` checks
- **Fix:** Added `getPermittedBulkIds()` that filters `selectedIds` through `canDeleteLink()` permission check; applied to all 3 bulk handlers
- **Commit:** `53c960e`

### BUG-SA-002 regression (P1): Toast count shows wrong number
- **File:** partnerstaffaccess.jsx:1918,1937,1950
- **Impact:** After bulk operation succeeds, toast shows `selectedIds.size` (total selected) instead of `permittedIds.length` (actually processed), misleading user
- **Fix:** Changed toast count to `permittedIds.length` in handleBulkEnable/handleBulkDisable; changed confirm dialog count to `getPermittedBulkIds().length`
- **Commit:** `1b20f90`

### BUG-SA-005 (P2): Clipboard fallback returns unconditional true
- **File:** partnerstaffaccess.jsx (copyToClipboard function)
- **Impact:** When `navigator.clipboard` is unavailable, fallback uses `document.execCommand('copy')` but returns `true` regardless of result; could show false "Copied!" toast when copy actually failed
- **Fix:** Changed to `return document.execCommand('copy')` to return actual result
- **Commit:** `53c960e`

---

## Active Bugs (P2/P3 — documented for future work)

### BUG-SA-003 (P2): handleBulkDeleteConfirm TDZ ordering
- **File:** partnerstaffaccess.jsx (~line 1954)
- **Impact:** `handleBulkDeleteConfirm` references `confirmModal` which is declared below it. Works at runtime because functions are called after all hooks, but violates TDZ safety rule
- **Recommendation:** Move `handleBulkDeleteConfirm` declaration below `confirmModal` state declaration, or restructure to avoid TDZ dependency

### BUG-SA-004 (P2): window.confirm not accessible in Base44 iframe
- **File:** partnerstaffaccess.jsx (delete single link)
- **Impact:** `window.confirm()` is blocked in iframes (Base44 preview mode), silently returns false; not keyboard-accessible
- **Recommendation:** Replace with custom Dialog confirmation pattern (already used for bulk delete)

### BUG-SA-006 (P3): AVAILABLE_LANGUAGES constant has Russian labels
- **File:** partnerstaffaccess.jsx
- **Impact:** Language names like "Русский", "English" are hardcoded — not a real i18n issue since language names are conventionally shown in their native script
- **Status:** Informational, no fix needed

---

## Statistics
- Total issues found: 6 (P0: 1, P1: 2, P2: 2, P3: 1)
- Issues fixed: 4 (P0: 1, P1: 2 + 1 regression, P2: 1)
- Issues documented: 3 (P2: 2, P3: 1)
- Files analyzed: 1
- Lines of code: ~2170
