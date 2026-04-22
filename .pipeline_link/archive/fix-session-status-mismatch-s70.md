---
type: fix
budget: 10
session: S70
priority: P1
created: "2026-03-03"
---

# Fix: Session Status Mismatch ("active" vs "open")

## Bug Description

`sessionHelpers.js:getOrCreateSession()` creates sessions with `status: "active"` and filters by `status: "active"`.
But `useTableSession.jsx` restore flow filters by `status: "open"` (lines 285, 310-313).

This means: after a guest refreshes the page (F5), the session is NOT restored — guest temporarily loses order history until they place a new order.

Full analysis: `pages/StaffOrdersMobile/DeepAnalysis_S70.md` → Part 6.

## Files to Fix

1. `components/sessionHelpers.js` — `getOrCreateSession()` function (~line 68-86)

## What to Change

In `getOrCreateSession()`:
- Change filter from `status: "active"` to `status: "open"` (line ~71)
- Change create from `status: "active"` to `status: "open"` (line ~81)

This aligns with what `useTableSession.jsx` expects and what `closeSession()` transitions FROM.

## Migration Note

Any existing sessions in DB with `status: "active"` will become orphaned. Add a comment in code noting this. The SESS-021 legacy migration (documented in `SessionLogic_Consensus_S67.md`) should handle cleanup of old sessions.

## Verification

After fix, verify:
1. `getOrCreateSession()` creates with `status: "open"`
2. `getOrCreateSession()` filters by `status: "open"`
3. `useTableSession` restore flow (line 285, 310-313) still uses `status: "open"` — should match now
4. `closeSession()` still sets `status: "closed"` — no change needed
5. `closeExpiredSessionInDB()` still sets `status: "expired"` — no change needed

## Output

RELEASE file: `components/260303-00 sessionHelpers RELEASE.js`

## Instructions

- git add -A && git commit -m "S70: fix session status mismatch active→open" && git push
- Read `components/sessionHelpers.js` carefully before editing
- This is a SMALL fix — do not refactor other parts of the file
- git add -A && git commit -m "S70: session status fix complete" && git push
