# Code Review Report: PartnerHome

**File:** `pages/PartnerHome/partnerhome.jsx` (294 lines after fix)
**Date:** 2026-02-24
**Reviewed by:** Claude (correctness + style) + Codex (independent review)
**Rounds:** 1 analysis + 1 post-fix verification

---

## Summary

Simple dashboard page with 3 KPIs (open tables, orders, revenue). Two P1 bugs found and fixed: wrong partner-access pattern and session double-counting. Clean page overall — well-structured, good i18n coverage, proper error/loading states.

---

## Fixed Issues

### BUG-PH-001 (P1) — Partner.list()[0] instead of usePartnerAccess()
- **Line:** 39-49 (original)
- **Impact:** In multi-partner scenarios, dashboard shows wrong restaurant's data. Bypasses PartnerShell access control.
- **Fix:** Refactored to Content+Wrapper pattern. `PartnerHomeContent` calls `usePartnerAccess()` inside `<PartnerShell>`, consistent with all other partner pages.
- **Consensus:** All 3 reviewers agreed (Claude P1, Style P1, Codex P1).

### BUG-PH-002 (P1) — Session double-counting (open vs expired)
- **Line:** 72-78 (original)
- **Impact:** Sessions past `expires_at` but still `status=open` were counted in both `openSessions` and `expiredSessions`. Partner sees inflated "open tables" count.
- **Fix:** Added `!(s.expires_at && new Date(s.expires_at) < now)` exclusion to `openSessions` filter.
- **Consensus:** Claude found, Codex confirmed.

---

## Active Issues (P2-P3, not fixed)

### P2: Client-side "today" filter uses browser timezone
- **Line:** 13-17, 80-83
- Uses `new Date().setHours(0,0,0,0)` which is browser local time. For UTC-stored `created_at`, orders near midnight are miscounted.
- **Impact:** Revenue/order counts slightly wrong for non-UTC timezones.
- **Recommendation:** Compare UTC date strings or use partner timezone when available.

### P2: All orders loaded client-side (no server-side date filter)
- **Line:** 62-65
- Loads ALL historical orders and filters in useMemo. For restaurants with many orders, this is slow.
- **Impact:** Performance degrades over time.

### P2: Revenue counts all statuses for orders but only completed for revenue
- **Line:** 92-96
- `totalOrders` includes pending/cancelled, `totalRevenue` is completed only. Metrics are incompatible without labels.

### P2: `window.location.reload()` for error recovery
- **Line:** 156
- Full page reload instead of `queryClient.invalidateQueries()`. Heavier, loses state.

### P3: Emoji `📊` and `💡` should have `aria-hidden="true"`
- **Lines:** 208, 276

### P3: Missing `aria-label` on tables navigation button
- **Line:** 180

---

## Statistics
- Total issues found: 8 (P0: 0, P1: 2, P2: 4, P3: 2)
- Issues fixed: 2 (both P1)
- Lines of code: 294
