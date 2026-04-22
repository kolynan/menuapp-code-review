---
task: fix-session-logic-p0-s66
budget: 12
type: implementation
created: 2026-03-02
session: S66
priority: P0 — fix first
---

Fix table session logic to prevent old orders from leaking into new sessions.
Base code: menuapp-code-review/pages/ (StaffOrdersMobile, OrderProcess, any sessionHelpers files).
Reference: outputs/ActionPlan_TableSession_S65.md

## Root Cause

sessionHelpers finds an old open TableSession and reuses it — new guests see all historical orders.
Sessions never expire automatically, so a session from 20+ hours ago stays "open" forever.

## Changes to implement (P0-1 + P0-2 + P0-3)

### P0-1: Cleanup-before-show
In sessionHelpers (or wherever a TableSession is fetched on QR scan / page load):
- Before returning an open session, check: if (session.opened_at + table_session_duration_minutes < now) → close the old session, create a new one
- This ensures guests always get a fresh session, not a stale one from days ago

### P0-2: Enforce valid session on Order creation
- When a guest creates an Order, validate that a valid open TableSession exists
- If session is missing or expired → reject the order, show: "Сессия истекла, отсканируйте QR заново"
- Never allow Order with table_session = null

### P0-3: Remove fallback to table
- Find all places in the code where order lists or totals fall back to filtering by `table` instead of `table_session`
- Files to check: staffordersmobile.jsx, orderprocess.jsx (and any helper files)
- Remove/disable the fallback: all queries must use table_session, never table directly
- This ensures the total shown to guests and waiters is always session-scoped

## Four invariants that must hold after this fix

1. A table can have AT MOST one open session at any time
2. Every Order MUST have a valid table_session (never null)
3. A guest sees ONLY orders from their current open session
4. All totals and counters are calculated from the current open session only

## Expected result

- Guest opens table → sees ONLY orders from current visit (not historical)
- Total shown matches the current session only
- Old sessions are automatically closed when a new guest arrives

## After implementation

- git add, commit, push
- Create RELEASE file: 260302-04 StaffOrdersMobile RELEASE.jsx in menuapp-code-review/pages/StaffOrdersMobile/
  (or whichever component contains the session logic — may be OrderProcess)
- Update BUGS.md: mark BUG-S65-02 as fixed
- Update README.md with session logic change description
