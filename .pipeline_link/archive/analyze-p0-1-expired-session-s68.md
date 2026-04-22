---
task: analyze-p0-1-expired-session-s68
budget: 10
type: analysis
created: 2026-03-02
session: S68
priority: P0 — must answer before deploy
---

# Analyze P0-1: How is "expired session" defined?

We have already implemented P0-1 (cleanup-before-show) in:
- `menuapp-code-review/pages/StaffOrdersMobile/` — file `260302-04 StaffOrdersMobile RELEASE.jsx`
- `menuapp-code-review/pages/StaffOrdersMobile/` — file `260302-00 useTableSession RELEASE.jsx`

These files are NOT yet deployed to production.

## Question

Before we deploy, we need to understand EXACTLY how P0-1 determines that a session is "expired" or "old", because we are afraid of closing active tables that guests are currently using.

## What to look up in the code

1. Open `260302-00 useTableSession RELEASE.jsx` (and `260302-04 StaffOrdersMobile RELEASE.jsx` if needed)
2. Find the cleanup-before-show logic (P0-1)
3. Answer these specific questions:

### Q1: What is the expiry threshold?
- What value/variable/constant determines when a session is considered "old"?
- Is it `table_session_duration_minutes` from entity config, or a hardcoded value, or something else?
- What is the actual number of hours/minutes used?

### Q2: What happens to an active session?
- Scenario: A waiter opened table 1 at 10:00. It is now 11:00. A guest scans QR.
  - Is this session closed? (1h old — less than threshold)
- Scenario: Same table, session opened at 10:00, it is now 19:00 (9h old).
  - Is this session closed? (exceeds 8h hard-expire agreed in SessionLogic_Consensus_S67.md)
- Scenario: Session opened yesterday (20+ hours ago).
  - Is this session closed?

### Q3: Is there any risk of closing currently active sessions?
- Based on the code, can P0-1 accidentally close a session that a waiter is actively using?
- If yes — what change would prevent this?

### Q4: Legacy sessions in production
- Right now in production there may be sessions from many hours/days ago that are "open"
- Will P0-1 automatically handle them on first QR scan, or is a manual migration needed first?
- Reference: SESS-021 from `outputs/SessionLogic_Consensus_S67.md`

## Expected output

Write a clear analysis in `outputs/reports/Analysis_P0-1_ExpiredSession_S68.md` with:
1. Code excerpt showing the expiry logic (copy the relevant lines)
2. Direct answers to Q1-Q4
3. Verdict: Safe to deploy as-is / Needs change before deploy
4. If change needed: exact code fix (small, surgical)

After writing the report:
- git add, commit, push
- Report any findings clearly in the result file

## Important

Do NOT change any code without confirming it's needed. The goal is analysis first.
If you find a problem, describe the fix but wait for human approval before applying it.
