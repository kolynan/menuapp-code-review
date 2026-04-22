---
task_id: implement-sess016-scheduled-job-s72
type: implementation
priority: P0
created: 2026-03-03
session: S72
budget: 12.00
---

# Task: Implement SESS-016 — Scheduled Job: Expire Safe Sessions

## Context

This is P0-4 from the session logic work (S67-S71). The scheduled job is the final missing piece of the session cleanup system.

**Read first:**
- `menuapp-code-review/components/sessionHelpers.js` — has `isSessionExpired()` (Function 9) already implemented
- `outputs/ChatGPT_Response3_SessionContract_S67.md` — SESS-016 spec (LOCKED)
- `outputs/SessionLogic_Consensus_S67.md` — full session logic consensus

**Git:** Start with `git add . && git commit -m "S72 pre-sess016-job snapshot" && git push`

---

## SESS-016 Spec (LOCKED — do not change semantics)

**Purpose:** Periodically expire table sessions that are safe to close.

**Logic:**
```
FOR each TableSession WHERE status = 'open':
  IF isSessionExpired(session, 8):              ← uses existing helper, 8h hard-expire
    IF has_no_problem_orders(session):
      session.status = 'expired'
      session.closed_at = now()
    ELSE:
      skip (leave open — waiter sees STALE via UI)
```

**"Problem order" definition** = any Order linked to this session where:
- order status NOT IN `{served, closed, cancelled}` (legacy)
- OR `OrderStage.internal_code != 'finish'` (new pipeline)

**Key constraints:**
- Do NOT expire sessions with problem orders
- Do NOT touch orders themselves — only session status
- Keep it minimal and reversible
- Cadence: every 5–10 minutes (per SESS-022)

---

## Implementation Plan

### Step 1: Research — how B44 implements scheduled jobs

Check if Base44 has a built-in scheduled function mechanism. Look for:
- Any existing scheduled jobs in the codebase (search for `schedule`, `cron`, `interval`, `setInterval` in pages/)
- B44 documentation references in references/ folder
- Any `b44-sdk` or backend function examples

If B44 has scheduled functions: implement as a B44 scheduled backend function.
If NOT: implement as a JavaScript function that can be triggered manually from a page (e.g. admin page) OR recommend alternative approach.

### Step 2: Implement the job function

Create/update file: `menuapp-code-review/components/sessionCleanupJob.js`

The function should:
1. Query all `TableSession` with `status='open'`
2. For each: call `isSessionExpired(session, 8)` from sessionHelpers.js
3. For expired: check orders linked to session (via `session_id` foreign key)
4. If no problem orders: update session `status='expired'`, `closed_at=new Date().toISOString()`
5. Log results (how many expired, how many skipped as stale)

### Step 3: Integration

Determine best way to run this in B44:
- Option A: B44 scheduled backend function (preferred per SESS-016)
- Option B: Add to an existing admin page (e.g. AdminPartners) as a manual trigger + auto-run on page load
- Option C: useEffect with setInterval in a page that's always open (e.g. StaffOrdersMobile)

**Recommend the best option** with justification. Implement whichever is recommended.

### Step 4: Safety check

Add a dry-run mode: `runCleanupJob(dryRun=true)` — logs what WOULD be expired without actually changing data. This allows testing before enabling live.

---

## Required Output

### Deliverable 1: `menuapp-code-review/components/sessionCleanupJob.js`

New file with:
- `runCleanupJob(dryRun=false)` — main function
- Uses `isSessionExpired` from sessionHelpers
- Queries TableSession + Orders entities
- Returns summary: `{ expired: N, skipped_stale: N, errors: [] }`

### Deliverable 2: Integration recommendation in `menuapp-code-review/components/sessionCleanupJob.js` header comment

Explain how to wire this up in B44 (scheduled function, page trigger, or setInterval).

### Deliverable 3: Update `menuapp-code-review/pages/StaffOrdersMobile/BUGS.md`

Add entry: BUG-SOM-xxx — "No scheduled session cleanup" → RESOLVED (link to new file).

### Deliverable 4: RELEASE file

`menuapp-code-review/components/260303-NN sessionCleanupJob RELEASE.js`

---

## Notes for CC+Codex

- `isSessionExpired(session, 8)` already exists — import from sessionHelpers, don't rewrite
- Entity names in B44: `TableSession`, `Order` (check exact entity names in codebase)
- `session_id` field links Orders to TableSession — verify field name in existing code
- The function must be idempotent (safe to run multiple times)
- DO NOT change SessionLogic_Consensus_S67.md semantics

**After implementation:** CC and Codex must both review the final code for correctness before RELEASE.
