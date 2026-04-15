# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260415-161942-d5a3

## Source Notes
- **CC findings:** `pipeline/chain-state/staffordersmobile-260415-161942-d5a3-cc-findings.md` (present, 5 findings)
- **Codex findings:** `pipeline/chain-state/staffordersmobile-260415-161942-d5a3-codex-findings.md` — **NOT FOUND** (searched: pipeline/chain-state/, pages/StaffOrdersMobile/, git pull --rebase, KB-158 fallback paths). Codex writer step either failed or was not executed for this chain.
- **Baseline:** Task context contains Arman's fix plan (Fixes 1-4) from the KS SOM Batch B1 spec. This serves as the reference specification for comparison.

---

## Agreed (CC confirms task spec)

### Fix 1a — [P1] `activeOrders` filter excludes closed orders (line 3580)
- **Task spec:** Change `return o.status !== 'closed' && o.status !== 'cancelled';` to `return o.status !== 'cancelled';`
- **CC:** Confirmed. Shift cutoff at 3572-3574 prevents historical leakage. `filteredGroups` logic at 3828-3847 will correctly route closed tables to "Completed" tab.
- **Status:** AGREED. One-line change, straightforward.

### Fix 1c — [P1] Missing `refetchRequests()` after closeSession (line 4148-4155)
- **Task spec:** Add `if (!isKitchen) refetchRequests();` after `refetchOrders()` at line 4151.
- **CC:** Confirmed. Pattern already exists in `handleRefresh` at line 4131. Without this, stale request cache keeps closed table in Active for up to 5s polling cycle.
- **Status:** AGREED. One-line addition.

### Fix 2 — [P0] `Promise.all` in closeSession → sequential (sessionHelpers.js:166-170)
- **Task spec:** Replace `Promise.all` with `for` loop + 120ms delay.
- **CC:** Confirmed. Inline pattern (not importing `runBatchSequential` from RELEASE.jsx due to circular dep). Simpler version without per-item try/catch acceptable because `confirmCloseTable` already has outer try/catch.
- **Status:** AGREED. Identical proposed fix.

### Fix 4 — [P2] `__batch` guard on `updateStatusMutation` (line 1606)
- **Task spec:** Add `__batch` guard to `onSettled` callback.
- **CC:** Confirmed as latent issue (not currently called with `__batch: true`). Consistency improvement.
- **Status:** AGREED. Three-line change replacing one line.

---

## CC Only (deviations from task spec)

### Fix 1b — [P1] `closeSession` ServiceRequest cleanup — CC proposes different implementation

- **Task spec:** Add code inside `closeSession()` that fetches the TableSession to get `tableId` via `getLinkId()`, then closes open ServiceRequests.
- **CC finding:** `getLinkId` is NOT imported/available in `sessionHelpers.js`. It's defined in RELEASE.jsx (line 546). The proposed code would cause a **runtime error**.
- **CC recommendation:** Option (c) — modify `closeSession(sessionId)` → `closeSession(sessionId, tableId)`. Pass `tableId` from `confirmCloseTable` call site, which already has access to the table ID via the group context. This avoids: (1) extra B44 API call to re-fetch TableSession, (2) `getLinkId` dependency, (3) risk of link field format mismatch.
- **Evaluation:** CC's approach is **better** than the task spec. It's cleaner, avoids the dependency issue, and saves one API call. The call site `confirmCloseTable` (around line 4148) has `closeTableConfirm` state which contains the session/table context.
- **Status:** ACCEPTED with CC's improvement. Use `closeSession(sessionId, tableId)` signature.

### Fix 3 — [P1 → NO-OP] Dead code finding

- **Task spec:** Replace `tableRequests.forEach` at lines ~663, ~665, and 1272 with `runBatchSequential` pattern.
- **CC finding:** Lines 657, 665, and 1272 are ALL inside `/* ... */` multi-line comment blocks (dead code at lines 564-803 and 1169-1436). These are old commented-out versions. The active collapsed card (line 1720+) does NOT have bulk Accept All / Serve All buttons. The expanded card at 2369 already uses the correct `runBatchSequential` pattern.
- **Evaluation:** CC is **correct**. Fixing dead code has zero runtime impact. This fix should be **SKIPPED** for active code changes. Optionally note in BUGS.md that dead code blocks exist for future cleanup.
- **Status:** ACCEPTED as NO-OP. Skip Fix 3 — no active code needs changing.

---

## Codex Only (CC missed)

N/A — Codex findings not available for this chain.

---

## Disputes (disagree)

### Fix 1b implementation approach
- **Task spec approach:** Fetch TableSession inside `closeSession`, use `getLinkId` to extract tableId, then close ServiceRequests.
- **CC approach:** Pass `tableId` as parameter to `closeSession(sessionId, tableId)` from call site.
- **Resolution:** CC's approach wins — avoids runtime error (`getLinkId` not in scope), avoids extra API call, cleaner API. No dispute between reviewers (only CC analyzed), but deviation from task spec warrants explicit decision.

---

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P0] Fix 2 — Sequential close in sessionHelpers.js** — Source: agreed (task + CC) — Replace `Promise.all` with `for` loop + 120ms delay at lines 166-170 of `components/sessionHelpers.js`. Inline implementation, no import of `runBatchSequential`.

2. **[P1] Fix 1a — Include closed orders in finish stage filter** — Source: agreed (task + CC) — Change line 3580 of RELEASE.jsx from `return o.status !== 'closed' && o.status !== 'cancelled';` to `return o.status !== 'cancelled';`.

3. **[P1] Fix 1b — Close ServiceRequests in closeSession** — Source: CC improvement over task spec — Modify `closeSession(sessionId)` → `closeSession(sessionId, tableId)`. Add sequential ServiceRequest closing inside `closeSession` when `tableId` is provided. Update call site in `confirmCloseTable` to pass `tableId`. Use sequential loop with 120ms delay (consistent with Fix 2).

4. **[P1] Fix 1c — refetchRequests after closeSession** — Source: agreed (task + CC) — Add `if (!isKitchen) refetchRequests();` after `refetchOrders()` in `confirmCloseTable` (~line 4151).

5. **[P2] Fix 4 — `__batch` guard on updateStatusMutation** — Source: agreed (task + CC) — Add `__batch` guard to `onSettled` at line 1606 of RELEASE.jsx.

6. ~~**[P1] Fix 3 — forEach → runBatchSequential in collapsed card**~~ — **SKIPPED (dead code).** Lines cited are inside `/* */` comment blocks. No active code change needed.

---

## Summary
- Agreed: 4 items (Fix 1a, Fix 1c, Fix 2, Fix 4)
- CC only: 2 items (Fix 1b improvement — accepted, Fix 3 dead code — accepted as skip)
- Codex only: 0 items (Codex findings not available)
- Disputes: 1 item (Fix 1b approach — resolved in CC's favor)
- Total fixes to apply: **5** (Fixes 1a, 1b-improved, 1c, 2, 4)
- Total fixes skipped: **1** (Fix 3 — dead code, no-op)
