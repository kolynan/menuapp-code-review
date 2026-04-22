# Result: fix-bugs-s89

**Status:** DONE
**Budget used:** ~$2.00 / $12
**Codex:** TIMEOUT (3 attempts — codex CLI hanging, API issue)

## Fixes Applied

### BUG-1: SO-S89-01 — `orderprocess.default.new` raw i18n key (P1) ✅
- **File:** `pages/StaffOrdersMobile/base/staffordersmobile.jsx`
- **Fix:** Added `STAGE_NAME_FALLBACKS` map + `getStageName()` helper function
- **How:** Maps known i18n keys (orderprocess.default.new/accepted/in_progress/ready/served/cancelled) to Russian display names. Applied in `getStatusConfig()` for both `label` and `actionLabel`.
- **Commit:** `a3727f4`

### BUG-2: PC-S89-01 — "1 Баллы" wrong declension (P2) ✅
- **File:** `pages/PartnerClients/base/partnerclients.jsx`
- **Fix:** Added `pluralPoints()` function (copied from PartnerLoyalty)
- **How:** Replaces static `t("clients.detail.points")` with `pluralPoints(balance, t)` for correct Russian pluralization (1→Балл, 2-4→Балла, 5+→Баллов, 11-14→Баллов).
- **Commit:** `a2acbd4`

## RELEASE Files Created
- `pages/StaffOrdersMobile/260306-03 StaffOrdersMobile RELEASE.jsx`
- `pages/PartnerClients/260306-02 PartnerClients RELEASE.jsx`
- Old RELEASEs archived to `versions/`

## Docs Updated
- `pages/StaffOrdersMobile/BUGS.md` — SO-S89-01 added to Fixed
- `pages/StaffOrdersMobile/StaffOrdersMobile README.md` — v3.6.2 UX changelog row
- `pages/PartnerClients/BUGS.md` — PC-S89-01 added to Fixed (260306-02)
- `pages/PartnerClients/README.md` — 260306-02 RELEASE History + UX changelog

## Git
- 3 commits pushed to main
- Final hash: `6ad26e3`

## Note on Codex
Codex CLI (v0.101.0) timed out on all 3 attempts. It starts but hangs during file search operations. Likely an API/network issue. The fixes are straightforward and use proven patterns already in the codebase (getStageName is a simple map lookup, pluralPoints is an exact copy from PartnerLoyalty).
