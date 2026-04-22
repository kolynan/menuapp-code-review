# Code Review Report: Index + Profile (Initial Review)

**Date:** 2026-02-25
**Reviewed by:** Claude Code (correctness + style sub-agents) + Codex (independent review)
**Files:** `pages/Index/index.jsx` (108→118 lines), `pages/Profile/profile.jsx` (226→243 lines)

---

## Summary

Both pages are simple, well-structured components. Index had a major i18n gap (all text hardcoded Russian) and no error handling. Profile was mostly good but had a critical UX flaw (empty form on auth failure) and several i18n compliance issues. All P1 bugs fixed, 10 P2/P3 items documented for future work.

---

## Fixed Issues (P1)

### Index (4 bugs fixed)
| Bug ID | Issue | Commit |
|--------|-------|--------|
| BUG-IX-001 | No i18n — all 13 user-facing strings hardcoded Russian | `2fe776a` |
| BUG-IX-002 | handleLogin no error handling — silent failure | `c2bbed0` |
| BUG-IX-003 | Unused `useNavigate` import (dead code) | `6c55471` |
| BUG-IX-004 | No double-click protection on 4 login buttons | `6c55471` |

### Profile (4 bugs fixed)
| Bug ID | Issue | Commit |
|--------|-------|--------|
| BUG-PF-001 | No error state when auth.me() fails — user sees empty form | `efed5bd` |
| BUG-PF-002 | Non-standard toast key `toast.profile_saved` | `fa229c5` |
| BUG-PF-003 | getRoleLabel exposes raw DB enum via `|| userRole` fallback | `fa229c5` |
| BUG-PF-004 | useEffect depends on `t` — re-fetches data on language switch | `fa229c5` |

---

## Active Bugs (P2/P3 — documented, not fixed)

### Index
| Bug ID | Severity | Issue |
|--------|----------|-------|
| BUG-IX-005 | P2 | Feature card `key={idx}` uses array index |
| BUG-IX-006 | P2 | Features array not memoized |
| BUG-IX-007 | P3 | Decorative icons missing aria-hidden |
| BUG-IX-008 | P3 | Sections missing aria-label |

### Profile
| Bug ID | Severity | Issue |
|--------|----------|-------|
| BUG-PF-005 | P2 | console.error in production (3 places) |
| BUG-PF-006 | P2 | initialFullName not trimmed on load |
| BUG-PF-007 | P2 | `profile.fullName` key uses camelCase (should be snake_case) |
| BUG-PF-008 | P2 | autoFocus triggers keyboard on mobile |
| BUG-PF-009 | P2 | Save button blocked 2s after success (no unmount cleanup) |
| BUG-PF-010 | P3 | Decorative icons missing aria-hidden |

---

## Reviewer Consensus

| Source | Index Issues | Profile Issues |
|--------|-------------|----------------|
| Claude (initial) | 2 P1 | 1 P1, 2 P2 |
| Correctness Reviewer | +2 P1, 1 P2 | +3 P1, 2 P2 |
| Style Reviewer | 2 P2, 2 P3 | +2 P1, 2 P2, 3 P3 |
| Codex (Phase 1) | Same 2 P1 | Same P1 + same P2/P3 |

All reviewers agreed on the core issues. No disputed patches — Arman decision not needed.

---

## Statistics
- Total issues found: 18 (P0: 0, P1: 8, P2: 7, P3: 3)
- P1 issues fixed: 8/8
- Files analyzed: 2
- Lines of code: ~351 (combined)
- Commits: 5
