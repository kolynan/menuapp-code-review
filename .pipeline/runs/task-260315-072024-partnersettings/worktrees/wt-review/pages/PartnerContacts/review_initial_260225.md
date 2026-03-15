# Code Review Report: partnercontacts1.jsx

**Date:** 2026-02-25
**Reviewed by:** Claude (correctness + style sub-reviewers) + Codex (attempted, timed out on file read)
**File:** pages/PartnerContacts/partnercontacts1.jsx (736 lines → 751 lines after fixes)
**Type:** Initial review

## Summary

Partner contacts management page (LAB version) with 1 P0 and 6 P1 issues found and fixed. The P0 was a crash in the error boundary itself (broken safety net). P1 issues were i18n violations, data integrity (NaN sort_order), and a useEffect that silently discarded unsaved changes. 9 additional P2/P3 issues documented in BUGS.md for future work.

## Fixed Issues (P0-P1)

### BUG-PC-001 (P0) — Error boundary crashes when triggered
- **Impact:** `tr()` called but never defined. Error boundary renders blank page on any error.
- **Fix:** Functional wrapper passes `t` from `useI18n()` as prop to class component.

### BUG-PC-002 (P1) — Hardcoded toast "URL обязателен"
- **Fix:** `toast.error(t('partnercontacts.toast.url_required', ...))`

### BUG-PC-003 (P1) — Hardcoded "LAB VERSION — Partner Contacts"
- **Fix:** `t('partnercontacts.lab_version', ...)`

### BUG-PC-004 (P1) — getTypeLabel() bypasses i18n
- **Impact:** 9 type labels displayed in UI without translation.
- **Fix:** `getTypeLabel(type, t)` now accepts `t` parameter with `partnercontacts.type.*` keys.

### BUG-PC-004b (P1) — openCreateLink hardcoded "Phone" label
- **Fix:** `label: getTypeLabel("phone", t)`

### BUG-PC-005 (P1) — NaN sort_order sent to API
- **Impact:** Non-numeric sort_order silently corrupted data.
- **Fix:** `Number.isNaN` validation with error toast.

### BUG-PC-006 (P1) — useEffect resets unsaved viewMode
- **Impact:** Background refetch (window focus) silently discarded user's unsaved view mode change.
- **Fix:** Depend on `[recordId, recordViewMode]` primitives instead of object reference.

## Active Bugs (P2-P3 — not fixed, documented in BUGS.md)

| ID | Priority | Description |
|----|----------|-------------|
| BUG-PC-007 | P2 | `initialData: []` suppresses loading state flash |
| BUG-PC-008 | P2 | URL scheme validation missing (latent XSS) |
| BUG-PC-009 | P2 | All toggle buttons blocked by shared `isPending` |
| BUG-PC-010 | P2 | Dynamic Tailwind classes via interpolation |
| BUG-PC-011 | P2 | `console.error` in error boundary |
| BUG-PC-012 | P2 | Error boundary doesn't wrap early return |
| BUG-PC-013 | P3 | Missing `aria-label` on icon buttons |
| BUG-PC-014 | P3 | Missing `aria-label` on search input |
| BUG-PC-015 | P3 | Magic strings "icons"/"full" |

## Post-Fix Review

- **Correctness reviewer:** All 6 fixes verified correct. No regressions found.
- **Style reviewer:** All fixes verified correct. Found one additional P1 (BUG-PC-004b) which was immediately fixed.
- **Codex:** Attempted but timed out due to shell execution issues on Windows.

## Statistics
- Total issues found: 15 (P0: 1, P1: 6, P2: 5, P3: 3)
- Issues fixed: 7 (P0: 1, P1: 6)
- Issues documented for future: 8 (P2: 5, P3: 3)
- Commits: 6
