# Merge Report: SOM-BUG-S270-01 Sequential Batch Mutations

## Task
Fix P0 rate-limit bug: batch mutations firing N concurrent HTTP requests causing B44 429.

## Codex Status
Codex completed (after delays due to PS sandbox timeouts on worktree reads).
Codex found 10 issues (5 P1, 5 P2) — all PRE-EXISTING, none related to the batch rate-limit bug.

## CC Analysis — 4 fan-out sites identified and fixed

### Fix A — handleOrdersAction (line 1956-1965) [P0]
- forEach(mutate) -> runBatchSequential(mutateAsync)
- Added batchInFlightRef + batchInFlight for double-click prevention

### Fix B — startUndoWindow.onUndo (line 1932-1937) [P0]
- forEach(mutate) -> runBatchSequential(mutateAsync)

### Fix E — Bulk request bar (line 2333) [P0]
- tableRequests.forEach(onCloseRequest) -> runBatchSequential(onBatchCloseRequestAsync)

### Fix F — handleCloseAllOrders (line 4132) [P1]
- Promise.all(orders.map(update)) -> runBatchSequential(update)

### Invalidate-once optimization
- __batch flag suppresses per-item onSettled/onSuccess
- __batch stripped in updateRequestMutation.mutationFn
- Single invalidation after each batch completes

## Agreed (both found)
N/A — Codex did not analyze the batch rate-limit bug (general review, not targeted)

## CC only (Codex missed)
All 4 batch fixes above (Codex scope was general review, not the specific P0 task)

## Codex only (CC missed) — PRE-EXISTING, OUT OF SCOPE
All 10 Codex findings are pre-existing bugs outside the scope of this KS:

### P1 (5):
1. **Logout unbind race** (line ~3261) — handleLogout calls mutate then immediately clears state. Already tracked.
2. **Silent mutation errors** (lines ~1594, ~1904) — updateStatusMutation and advanceMutation don't show error toast or handle 429 in onError.
3. **Unscoped .list() fallback** (lines ~3371, ~3496, ~3518) — queries fall back to global .list() when partnerId is falsy.
4. **i18n bypass** — BUG-SM-001 already tracked as deferred.
5. **AudioContext cleanup** — BUG-SM-003 marked fixed but Codex claims regressed.

### P2 (5):
6. **Service request error feedback** — only 429 handled, other errors silent.
7. **Guest-name cache permanent miss** — failed IDs never retried.
8. **Double Стол prefix in legacy cards** — lines 1530, 1635.
9. **Touch targets <44px** — several controls at 28-36px.
10. **Production console.log** — session cleanup debug logs.

### Decision
Per SCOPE LOCK (F4/F7): these are NOT fixed in this KS. Items #2, #3, #5 should be evaluated for separate tasks. Items #4 (i18n) and #8 (double Стол) already tracked in BUGS.md.

## Disputes
None — no overlap between CC task scope and Codex general review.

## File Integrity
- Lines: 4538 -> 4575 (delta: +37, within expected +30..+60)
- Function count stable (220)
- Dead-code blocks (564-802, 1166-1435) untouched
