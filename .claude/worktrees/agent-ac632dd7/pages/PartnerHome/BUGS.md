# PartnerHome — Bug Tracker

**Last updated:** 2026-02-24

---

## Fixed (in RELEASE 260224-00)

| ID | Priority | Description | Commit |
|----|----------|-------------|--------|
| BUG-PH-001 | P1 | Partner.list()[0] instead of usePartnerAccess() — wrong tenant, bypasses access control | `6825d1c` |
| BUG-PH-002 | P1 | openSessions double-counts locally-expired sessions — inflated "open tables" counter | `6825d1c` |

---

## Active

| ID | Priority | Description | Line(s) | Notes |
|----|----------|-------------|---------|-------|
| BUG-PH-003 | P2 | Client-side "today" filter uses browser timezone — wrong counts near midnight | 13-17, 80-83 | Compare UTC date strings or use partner timezone |
| BUG-PH-004 | P2 | All orders loaded client-side, no server-side date filter — slow for large order history | 62-65 | Add date filter to API call when available |
| BUG-PH-005 | P2 | Revenue includes all-status order count but only completed revenue — misleading KPIs | 92-96 | Either filter cancelled from count or label "completed only" |
| BUG-PH-006 | P2 | window.location.reload() for error recovery — loses React state | 156 | Use queryClient.invalidateQueries() |
| BUG-PH-007 | P3 | Emoji 📊 💡 missing aria-hidden="true" | 208, 276 | |
| BUG-PH-008 | P3 | Tables navigation button missing aria-label | 180 | |
