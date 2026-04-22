# MenuTranslations — BUGS.md

## Fixed Bugs (RELEASE 260225-00)

### BUG-MT-001 (P1) — Language switch data corruption
- **Commit:** 7710b17
- **Issue:** When user switched language with unsaved inline edits, edits persisted and would be saved with the WRONG language. English translations saved as Kazakh, etc.
- **Fix:** Added confirm dialog warning + clear editingTranslations on language switch (both button click and handleAddLanguage).

### BUG-MT-002 (P1) — Tab switch data corruption
- **Commit:** 1fc2e56
- **Issue:** Switching between Categories/Dishes tabs with unsaved edits caused save function to use wrong entity type. Could create DishTranslation records with category IDs (orphaned data).
- **Fix:** Added confirm dialog warning + clear editingTranslations on tab switch.

### BUG-MT-003 (P1) — queryFn error swallowing hides failures
- **Commit:** 9b6ee83
- **Issue:** try/catch in queryFn for CategoryTranslation and DishTranslation returned [] on error, preventing React Query from setting error state. Users saw empty table instead of error UI.
- **Fix:** Removed try/catch — React Query handles errors natively and triggers existing error UI.

### BUG-MT-004 (P1) — Promise.all partial failure leaves stale UI
- **Commit:** daaf62e
- **Issue:** Promise.all in handleSaveTranslations rejected on first failure, skipping cache invalidation. Successfully saved items stayed invisible until manual page refresh.
- **Fix:** Changed to Promise.allSettled — all operations complete, cache always invalidated, partial success count shown to user.

### BUG-MT-005 (P1) — Custom languages lost on page refresh
- **Commit:** 4ce58e7
- **Issue:** useState initializer for recentLangs ran at mount when partnerId was still undefined (query not resolved). storageKey was null → localStorage skipped → custom languages lost.
- **Fix:** Moved localStorage read to useEffect that fires when storageKey becomes available.

### BUG-MT-006 (P1) — forEach variable `t` shadows i18n t()
- **Commit:** 506262e
- **Issue:** Loop variable `t` in catTransMap/dishTransMap useMemo blocks would shadow the i18n t() function.
- **Fix:** Renamed to `trans`.

### BUG-MT-007 (P1) — Full i18n compliance (51+ strings)
- **Commit:** 95dc262
- **Issue:** Entire page had zero i18n — no useI18n import, all 51+ user-facing strings hardcoded in Russian or English.
- **Fix:** Added useI18n import, const { t } = useI18n(), replaced all strings with t('menu_translations.*', 'fallback') keys.

### Phase 3 review fixes (P1)
- **Commit:** d386a03
- **Fix:** Moved hasUnsavedChanges declaration before handler functions (TDZ safety), fixed toast.warning template literal and Textarea placeholder i18n, removed unused Link import, removed 2 console.error calls.

---

## Active Bugs (for future work)

### BUG-MT-008 (P2) — ErrorBoundary strings not i18n-compliant
- **Lines:** 60, 62, 70
- **Issue:** ErrorBoundary is a class component — cannot use useI18n() hook. Strings "Page Error", "An unexpected error occurred", "Go to Menu", "Reload Page" remain hardcoded English.
- **Fix:** Extract error UI to a functional ErrorFallback component that can use useI18n().

### BUG-MT-009 (P2) — DRY violation: TSV building duplicated
- **Lines:** ~258-275 (handleCopyTemplate) and ~287-304 (handleExportTSV)
- **Issue:** Identical TSV generation logic in two functions.
- **Fix:** Extract shared buildTsvContent() function.

### BUG-MT-010 (P2) — DRY violation: TSV parsing duplicated
- **Lines:** ~398-464 (handlePreviewBulkPaste) and ~467-596 (handleBulkPaste)
- **Issue:** Nearly identical TSV parsing logic in preview and execute functions.
- **Fix:** Extract shared parsePasteLines() function.

### BUG-MT-011 (P2) — Bulk paste preview can be stale
- **Issue:** Preview runs against catTransMap/dishTransMap at preview time. Between preview and confirm, queries may refetch, making preview counts inaccurate.
- **Fix:** Re-validate against current maps before executing paste.

### BUG-MT-012 (P2) — PartnerShell rendered multiple times
- **Lines:** 54, 604, 620, 645, 673, 700
- **Issue:** PartnerShell appears in 6 places (ErrorBoundary + 5 early returns + main render). Should be in export default wrapper only.
- **Fix:** Restructure to single PartnerShell in export default, remove from inner component.

### BUG-MT-013 (P3) — Missing ARIA attributes on tabs and buttons
- **Lines:** 745, 788, 804
- **Issue:** Language selector buttons missing aria-pressed, tab buttons missing role="tab" and aria-selected, wrapping div missing role="tablist".
- **Fix:** Add proper ARIA tab pattern.

### BUG-MT-014 (P3) — O(n) find() in bulk paste loops
- **Lines:** 424, 451, 499, 544
- **Issue:** categories.find() and activeDishes.find() called per line in O(n) loop = O(n*m) total. Not a problem for typical menu sizes (<100 items).
- **Fix:** Pre-build Set or Map of IDs for O(1) lookup if needed.
