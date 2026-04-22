# Merge Report: Profile Smoke Test S134

**Task:** smoke-test-s134
**File:** pages/Profile/base/profile.jsx (308 lines)
**Date:** 2026-03-16

## Agreed (both found)

1. **[P1] BUG-S123-01 — Profile bypasses PartnerShell context** (line 73)
   - CC: Already tracked as active bug. ProfileContent does its own auth.me()/Partner.get() even though PartnerShell already resolves user/partner context.
   - Codex: Same finding. Recommends using usePartnerAccess() inside ProfileContent.
   - Status: KNOWN ACTIVE BUG — not fixing in smoke test.

2. **[P1] BUG-S106-02 — getRoleLabel null guard missing** (line 138)
   - CC: Already tracked. `getRoleLabel(undefined)` returns `undefined` as fallback.
   - Codex: Same finding. Role badge can be blank or leak raw DB enum values.
   - Status: KNOWN ACTIVE BUG — not fixing in smoke test.

## CC only (Codex missed)

- BUG-S123-02 (P3) — Nested min-h-screen containers
- BUG-S123-03 (P3) — Load error state not announced (no role="alert")
- BUG-S106-01 (P3) — PartnerShell missing activeTab prop
- BUG-PF-010 (P3) — Decorative icons missing aria-hidden
- BUG-S105-02 (P2) — Input fields missing min-h-[44px]
- BUG-S105-03 (P2) — Save button not in fixed footer on mobile
- BUG-S105-04 (P2) — Partner load failure indistinguishable from "no restaurant"

Note: Codex was still running (PS timeout issues) and only partially completed. It may have found more given time.

## Codex only (CC missed)

- **[P2] Hardcoded Russian fallbacks** — Codex flagged that tr() helper uses Russian literals as inline fallbacks, which could mix Russian into non-Russian locales.
  - CC evaluation: This is by design — tr() is a safety net for missing i18n keys. The alternative (no fallback) is worse (shows raw key strings). Already discussed in BUG-PF-019/BUG-PR-S83-04v2. Not a new bug.

## Disputes (disagree)

None.

## Summary

- **New bugs found:** 0
- **Active bugs confirmed:** 9 (all previously tracked in BUGS.md)
- **Code changes needed:** None for this smoke test
- **Pipeline heartbeat verification:** Task ran successfully with progress updates
