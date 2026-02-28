# PartnerStaffAccess Bug Tracker

**Page:** `pages/PartnerStaffAccess/partnerstaffaccess.jsx`
**Last updated:** 2026-02-28

---

## Fixed Bugs

### BUG-SA-001 (P0) -- XSS in printQR via staffName
- **Function:** printQR
- **Fix:** Added `escapeHtml()` helper; applied to staffName before `document.write()`
- **Commit:** `53c960e`
- **Status:** FIXED

### BUG-SA-002 (P1) -- Bulk operations permission bypass
- **Functions:** handleBulkEnable, handleBulkDisable, handleBulkDeleteConfirm
- **Fix:** Added `getPermittedBulkIds()` filter through `canDeleteLink()` permission check
- **Commit:** `53c960e`
- **Status:** FIXED

### BUG-SA-002 regression (P1) -- Toast count shows selectedIds.size not permittedIds.length
- **Lines:** 1918, 1937, 1950
- **Fix:** Changed toast count and confirm dialog count to use `permittedIds.length`
- **Commit:** `1b20f90`
- **Status:** FIXED

### BUG-SA-005 (P2) -- Clipboard fallback returns unconditional true
- **Function:** copyToClipboard
- **Fix:** Return `document.execCommand('copy')` result instead of hardcoded `true`
- **Commit:** `53c960e`
- **Status:** FIXED

### BUG-SA-007 (P2) -- Touch targets too small for mobile (40px / 28px)
- **Lines:** StaffCard quick actions, overflow menu trigger, send invitation button, bulk checkbox
- **Fix:** All icon buttons → h-11 w-11 (44px), gap-1 → gap-2 (8px spacing), send button h-7 → h-11, checkbox min-h/w-[44px]. Send invitation button now visible on ALL pending cards (email + link).
- **Commit:** Phase1 partnerstaffaccess
- **Status:** FIXED

---

## Active Bugs

### BUG-SA-003 (P2) -- handleBulkDeleteConfirm TDZ ordering
- **Line:** ~1954
- **Impact:** References `confirmModal` declared below; works at runtime but violates TDZ safety rule
- **Recommendation:** Move declaration below `confirmModal` state

### BUG-SA-004 (P2) -- window.confirm not accessible in Base44 iframe
- **Function:** delete single link
- **Impact:** Blocked in iframes, silently returns false
- **Recommendation:** Replace with custom Dialog confirmation pattern

### BUG-SA-006 (P3) -- AVAILABLE_LANGUAGES has Russian labels
- **Impact:** Informational only; language names conventionally shown in native script
- **Status:** No fix needed
