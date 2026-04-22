---
task_id: integrate-session-cleanup-job-s73
type: implementation
priority: P0
created: 2026-03-03
session: S73
budget: 12.00
---

# Task: Integrate sessionCleanupJob into StaffOrdersMobile + Fix P1 payment_status

## Context

In S72, `sessionCleanupJob.js` was created with `runSessionCleanup({ dryRun })`.
Now we need to:
1. Wire it into StaffOrdersMobile (auto-run on interval)
2. Fix P1 bug: `payment_status` is always `undefined` in the cleanup job

**Read first:**
- `menuapp-code-review/components/sessionCleanupJob.js` — the job file created in S72
- `menuapp-code-review/components/sessionHelpers.js` — session helpers (isSessionExpired etc.)
- `menuapp-code-review/pages/StaffOrdersMobile/` — current RELEASE file
- `outputs/SessionLogic_Consensus_S67.md` — LOCKED session logic spec

**Git:** Start with `git add . && git commit -m "S73 pre-cleanup-integration snapshot" && git push`

---

## Step 1: Fix P1 — payment_status always undefined

In `sessionCleanupJob.js`, the check for "problem orders" uses `payment_status` to determine
if an order is safe to close. But `payment_status` is coming back as `undefined`.

**Investigation:**
1. Check what field name B44 actually uses for order payment state (look in existing StaffOrdersMobile code — how it reads payment info from orders)
2. The field might be named differently: `paymentStatus`, `is_paid`, `paid`, `payment_state`, etc.
3. Check the Order entity in `menuapp-code-review/` pages that deal with orders

**Fix:**
- Update sessionCleanupJob.js to use the correct field name
- Ensure the "problem order" check still works correctly (no false positives that would wrongly close sessions with pending payments)

---

## Step 2: Integrate into StaffOrdersMobile

Wire `runSessionCleanup()` to run automatically while the waiter screen is open.

**Implementation:**
- Add a `useEffect` with `setInterval` in StaffOrdersMobile
- Interval: every 5 minutes (300,000 ms) — per SESS-022
- Run once on mount (immediately), then on interval
- Always run with `dryRun=false` in production
- Log results to console (for debugging): `console.log('[SessionCleanup]', result)`
- Do NOT show any UI notification to waiter — silent background job

**Example pattern:**
```js
useEffect(() => {
  const cleanup = async () => {
    const result = await runSessionCleanup({ dryRun: false });
    console.log('[SessionCleanup]', result);
  };
  cleanup(); // run immediately on mount
  const interval = setInterval(cleanup, 5 * 60 * 1000);
  return () => clearInterval(interval); // cleanup on unmount
}, []);
```

---

## Step 3: Safety validation

Before finalizing RELEASE:
1. Run `runSessionCleanup({ dryRun: true })` mentally — trace through the logic with a sample expired session
2. Confirm: sessions with any non-finished orders are NOT expired
3. Confirm: the fix for payment_status doesn't break the problem-order detection

---

## Required Output

### Deliverable 1: Updated `menuapp-code-review/components/sessionCleanupJob.js`
- payment_status P1 bug fixed
- Field name corrected to match actual B44 entity

### Deliverable 2: Updated StaffOrdersMobile RELEASE
- useEffect + setInterval integration added
- Silent background job (no UI notification)
- RELEASE: `260303-NN StaffOrdersMobile RELEASE.jsx`

### Deliverable 3: Update BUGS.md
- `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md` — mark P1 payment_status as RESOLVED

---

## Notes for CC+Codex

- The cleanup job must be IDEMPOTENT — safe to run multiple times
- Do NOT change SessionLogic_Consensus_S67.md semantics
- "Problem order" definition is LOCKED: order NOT in {served, closed, cancelled} OR OrderStage.internal_code != 'finish'
- payment_status is ONE of the checks — don't remove it, just fix the field name
- Both CC and Codex must review final code before RELEASE

**After implementation:** CC and Codex both confirm the fix is correct.
