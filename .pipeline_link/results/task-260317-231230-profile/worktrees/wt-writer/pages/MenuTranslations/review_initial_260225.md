# Code Review Report: MenuTranslations

## File: menutranslations.jsx (1151 lines original → 1157 lines after fixes)
## Date: 2026-02-25
## Reviewed by: Claude Code (correctness + style subagents) + Codex (attempted, timed out due to OneDrive latency)
## Review type: Initial code review

---

## Summary

MenuTranslations is a well-structured page with good separation of concerns, but had **8 P1 bugs** that could cause data corruption, misleading UI, and broken i18n. All P1 issues were fixed. No P0 crashes found. 7 P2/P3 issues documented for future work.

---

## Critical Issues (P0) — None Found

No data loss or crash scenarios on normal usage paths.

---

## High Priority (P1) — 8 Issues, ALL FIXED

### BUG-MT-001: Language switch corrupts edits
- **Impact:** Edits saved with wrong language (e.g., English text saved as Kazakh)
- **Root cause:** editingTranslations state persisted across language switches; save used current selectedLang
- **Fix:** Confirm dialog + clear edits on language switch
- **Commit:** 7710b17

### BUG-MT-002: Tab switch creates corrupt data
- **Impact:** Switching Categories↔Dishes with edits could create DishTranslation records with category IDs
- **Root cause:** save function checks activeTab, not what was being edited
- **Fix:** Confirm dialog + clear edits on tab switch
- **Commit:** 1fc2e56

### BUG-MT-003: queryFn error swallowing
- **Impact:** Translation fetch failures invisible — user sees empty table, may overwrite existing data
- **Root cause:** try/catch returned [] on error, preventing React Query error state
- **Fix:** Removed try/catch, let React Query handle errors
- **Commit:** 9b6ee83

### BUG-MT-004: Promise.all partial failure
- **Impact:** After partial save failure, UI shows stale data (no cache invalidation)
- **Root cause:** Promise.all rejects on first failure, skips invalidateQueries
- **Fix:** Promise.allSettled + always invalidate + show partial success count
- **Commit:** daaf62e

### BUG-MT-005: Custom languages lost on refresh
- **Impact:** User-added language codes disappeared on page reload
- **Root cause:** useState initializer ran before partnerId loaded → storageKey null
- **Fix:** Moved to useEffect that fires when storageKey available
- **Commit:** 4ce58e7

### BUG-MT-006: Variable shadowing blocks i18n
- **Impact:** Would prevent adding i18n (t variable conflict)
- **Root cause:** forEach(t => ...) in useMemo blocks
- **Fix:** Renamed to trans
- **Commit:** 506262e

### BUG-MT-007: Zero i18n coverage (51+ hardcoded strings)
- **Impact:** Mixed Russian/English UI, no translation support
- **Root cause:** No useI18n import, all strings hardcoded
- **Fix:** Added useI18n, replaced 51+ strings with t() keys
- **Commit:** 95dc262

### Phase 3 fixes: TDZ safety, remaining i18n, cleanup
- **Impact:** TDZ rule violation, 3 missed i18n strings, production console.error
- **Fix:** Moved hasUnsavedChanges, fixed toast/placeholder i18n, removed console.error, removed unused import
- **Commit:** d386a03

---

## Medium Priority (P2) — 5 Issues (documented, NOT fixed)

| ID | Issue | Lines |
|----|-------|-------|
| BUG-MT-008 | ErrorBoundary strings not i18n (class component) | 60, 62, 70 |
| BUG-MT-009 | DRY: TSV building duplicated | ~258, ~287 |
| BUG-MT-010 | DRY: TSV parsing duplicated | ~398, ~467 |
| BUG-MT-011 | Bulk paste preview can be stale | ~398 |
| BUG-MT-012 | PartnerShell rendered 6 times (should be 1) | 54, 604, 620, 645, 673, 700 |

---

## Low Priority (P3) — 2 Issues (documented, NOT fixed)

| ID | Issue | Lines |
|----|-------|-------|
| BUG-MT-013 | Missing ARIA attributes on tabs/buttons | 745, 788, 804 |
| BUG-MT-014 | O(n) find() in bulk paste loops | 424, 451, 499, 544 |

---

## Statistics
- Total issues found: 15 (P0: 0, P1: 8, P2: 5, P3: 2)
- Issues fixed: 8 (all P1)
- Issues documented: 7 (5 P2, 2 P3)
- Lines of code: ~1157
- Commits: 8

## RELEASE
- **File:** `260225-00 menutranslations RELEASE.jsx`
- **Location:** `code/MenuTranslations/`
- **BUGS.md:** Updated with all bugs
- **README:** Created with description, entities, history
