# TranslationAdmin

**Page type:** Admin-only
**Access:** ADMIN_EMAILS whitelist
**Entities:** Language, InterfaceTranslation, PageSource, PageScanTracker, UnusedKeyLog

## Description

Admin page for managing interface translations in MenuApp. Features:
- **Languages tab:** Add/edit/toggle/delete languages, set default
- **Translations tab:** View/edit/filter/search translation keys, export/import CSV, manage unused keys
- **Sources tab:** Register page/component source code, scan for i18n keys, auto-add new keys

## UX Changelog

### 2026-02-26 — S35 Codex Round (6 fixes)
- **Scan All button** now properly disables during scanning to prevent double-click corruption
- **Save+Scan+Add** now correctly tracks failed key additions — tracker stays in "needs rescan" state if any keys fail, preventing silent data loss
- **Add Scanned Keys** now retains failed keys in the scan results list for retry instead of clearing all
- **Add Language** now validates for duplicate language codes before creating
- **CSV Import** now correctly handles multiline quoted values (RFC 4180 compliant)
- **Unused Key Logs** now update incrementally — partial failure no longer corrupts the full batch

### 2026-02-25 — S35 Initial Review (7 fixes)
- **Set Default Language** now sets new default first (safe on partial failure) instead of unsetting old first (zero-default risk)
- **Translation editing** now keeps edit field open on save failure instead of silently closing
- **Delete Unused Keys** now only updates state after API confirms (prevents DB/UI desync)
- **Save+Scan+Add** now tracks newly created tracker IDs (fixes permanent "X new keys" badge)
- **CSV Import** now deduplicates rows and commits partial progress on failure
- **CSV Export/Import** round-trip now correctly preserves newlines in translations
- **Bulk operations** now show error toast when live sync (refreshTranslations) fails

## Files

| File | Description |
|------|-------------|
| `translationadmin.jsx` | Main page source (~1950 lines) |
| `BUGS.md` | Bug tracker with fix history |
| `review_initial_260225.md` | Initial review report |
