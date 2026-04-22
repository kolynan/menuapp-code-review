# Code Review Report: Admin456 + AdminPageHelp + AdminPartners + Lab
## Initial Review — 2026-02-25
## Reviewed by: Claude Code (correctness + style reviewers) + Codex (attempted, sandbox issues)

---

## Files Reviewed
1. **admin456.jsx** (140 → 141 lines) — Admin Hub navigation
2. **adminpagehelp.jsx** (476 → 473 lines) — Help article CRUD
3. **adminpartners.jsx** (495 → 503 lines) — Partner management with react-query
4. **lab.jsx** (130 lines) — Static lab hub (no changes)

---

## Summary

Found **12 issues** across 4 files. Fixed **8** (2 P0, 4 P1, 2 P2). Documented **19 active bugs** for future work.

AdminPartners had the most critical issues: non-admin data leak (P0) and global mutation lock (P0). AdminPageHelp had a case-sensitivity bug that could silently deny admin access. Admin456 had zero i18n. Lab is clean as a static page but needs i18n.

---

## Fixed Issues

### P0 — Critical (2)

| ID | File | Issue | Fix |
|---|---|---|---|
| BUG-AP-001 | adminpartners.jsx | All 5 useQuery calls fired for non-admin users (enabled checked authLoading but not isAdmin). Any logged-in user could fetch 3,100 records | Added `!!isAdmin` to all query enabled flags. Moved isAdmin computation before hooks |
| BUG-AP-002 | adminpartners.jsx | Single shared mutation isPending locked ALL partner rows. Race condition on same partner with concurrent plan+status mutations | Per-partner disable via `mutation.variables?.partnerId` check |

### P1 — High Priority (4)

| ID | File | Issue | Fix |
|---|---|---|---|
| BUG-AH-001 | adminpagehelp.jsx | Email case-sensitivity: `includes(user.email)` without toLowerCase(). Inconsistent with Admin456 | Added `.toLowerCase()` |
| BUG-AH-002 | adminpagehelp.jsx | Null guard on PageHelp.create: null entry could be appended to state | Added `if (created)` guard |
| BUG-AP-003 | adminpartners.jsx | queryClient missing from useEffect dependency array | Added to deps |
| BUG-A4-001 | admin456.jsx | Zero i18n — all 12 user-facing strings hardcoded | Added useI18n + wrapped all strings with t() |

### P2 — Bonus Fixes (2)

| ID | File | Issue | Fix |
|---|---|---|---|
| BUG-AP-005 | adminpartners.jsx | 2 console.error calls in mutation onError | Removed |
| BUG-AH-003 | adminpagehelp.jsx | 3 console.error calls in handlers | Removed |

### Post-Fix Regression Fix (1)

| ID | File | Issue | Fix |
|---|---|---|---|
| BUG-AP-006 | adminpartners.jsx | Adding useI18n created variable shadowing: filter `t` shadowed i18n `t` in getPartnerStats | Renamed to `tbl` |

---

## Active Bugs (Not Fixed — Documented in BUGS.md)

### P1 Active (3)
- **BUG-AP-007** AdminPartners: ~30 hardcoded Russian/English strings in JSX need full i18n conversion
- **BUG-AP-008** AdminPartners: concurrent plan+status mutations on same partner can produce partial writes
- **BUG-AH-004** AdminPageHelp: AccessDenied component has zero i18n
- **BUG-LB-001** Lab: zero i18n — all text hardcoded English

### P2 Active (9)
- BUG-A4-002/003 Admin456: fallback strings in t(), key naming
- BUG-AH-005/006/007 AdminPageHelp: t-as-prop anti-pattern, fallbacks, client-only duplicate check
- BUG-AP-009/010/011 AdminPartners: magic numbers, DRY violation, getPartnerStats not memoized
- BUG-LB-002 Lab: dynamic Tailwind classes

### P3 Active (6)
- BUG-A4-004, BUG-AH-008/009, BUG-AP-012/013/014, BUG-LB-003/004/005: accessibility, emoji, locale, unused state

---

## Commits
1. `705c9f4` — fix(AdminPartners): P0 auth guard + per-partner mutation disable + i18n toasts
2. `fdbd67a` — fix(AdminPageHelp): P1 email case sensitivity + null guard + remove console.error
3. `9c4b475` — fix(Admin456): P1 add useI18n — wrap all hardcoded strings with t()
4. `b703c85` — fix(AdminPartners): rename shadowed variable t → tbl

---

## Statistics
- Total issues found: 27 (2 P0, 8 P1, 11 P2, 6 P3)
- Fixed: 8 (2 P0, 4 P1, 2 P2)
- Active: 19 (4 P1, 9 P2, 6 P3)
- Files modified: 3 of 4 (Lab unchanged)
- Reviewers: correctness-reviewer, style-reviewer, Codex (sandbox blocked)
- Rounds of review: 2 (initial + post-fix)
