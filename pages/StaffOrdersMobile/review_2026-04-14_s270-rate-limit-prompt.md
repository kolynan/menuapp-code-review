# Review: SOM-BUG-S270-01 KS Prompt

Date: 2026-04-14
Target: `pages/StaffOrdersMobile/260414-01 StaffOrdersMobile RELEASE.jsx` (4538 lines)
Context: `pages/StaffOrdersMobile/BUGS.md`

## Scope note

I did not find a separate raw prompt file in the repository. This review validates the draft proposal as described by these checks:

1. 5 fan-out locations
2. `runBatchSequential` helper
3. invalidate-once optimization
4. `120ms` delay
5. missing fan-out locations
6. `onCloseRequest` `mutate -> mutateAsync`

## Summary

The draft direction is mostly right at the problem level: the current file does have real burst-update paths, and the reported `429` after "Выдать все" is credible from the live code. The main prompt risk is implementation precision. In this file, some candidate anchors are dead commented code, the actual order fan-out is centralized in one shared helper, and `mutateAsync` alone does not remove per-item invalidations because the mutation callbacks still fire on every call.

## Findings

### [P1] Invalidate-once is not sound if the prompt only switches loops to `mutateAsync`

- `advanceMutation` still invalidates on every mutation settle at `1882-1897`:
  - `1895`: `queryClient.invalidateQueries({ queryKey: ["orders"] });`
  - `1896`: `queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });`
- `updateRequestMutation` still invalidates on every success at `3513-3521`:
  - `3515`: `onSuccess: () => queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }),`
- `mutateAsync()` changes call shape, not mutation lifecycle. If the prompt says "use `mutateAsync` sequentially, then invalidate once after the loop", that is incomplete. The per-item `onSettled` / `onSuccess` handlers will still refetch unless the mutation callbacks are taught to skip invalidation during batch mode.

Additional request-specific caveat:

- `updateRequestMutation.mutationFn` currently spreads every non-`id` field into the entity update at `3514`.
- Any batch-only flag such as `skipInvalidate`, `batch`, or `silent` would be written into `ServiceRequest` unless explicitly stripped there.

### [P1] Global `onCloseRequest: mutate -> mutateAsync` is not a drop-in safe change

- Parent wiring is currently synchronous at `4399`:
  - `onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })}`
- Single-row request buttons call `onCloseRequest(...)` without awaiting or catching:
  - live detail-view request actions are embedded on `2333`
  - older mirrors at `658` and `1273` are inside block comments, not live
- If `4399` is changed to `mutateAsync(...)`, those handlers start returning promises. On failure, that can produce unhandled promise rejections unless every caller does `await` with `try/catch`, or explicitly uses `void ...catch(...)`.

Safer prompt direction:

- keep the existing sync `onCloseRequest` for one-off button clicks
- add a separate async batch-specific helper / prop for bulk request actions

### [P1] The prompt must distinguish live fan-out points from dead commented duplicates

There are two large commented-out render snapshots:

- `546-785`
- `1148-1418`

That matters because several older bulk-action anchors inside those blocks are not live:

- request bulk bar at `639`
- request bulk bar at `1254`
- bulk order buttons at `671`, `694`, `709`, `1286`, `1309`, `1324`

The only live request bulk fan-out is the detail-view bulk bar embedded on `2333`, where:

- `tableRequests.forEach(r => onCloseRequest(...))` handles "accept all"
- `tableRequests.forEach(r => onCloseRequest(...))` handles "serve all"

### [P2] The real order fan-out is centralized at `1956-1965`, not at the three bulk button lines

Live table-card bulk entry points are real:

- `2335`: bulk action for `newOrders`
- `2337`: bulk action for `inProgressSections`
- `2339`: bulk action for `readyOrders`

But those three buttons all funnel into one actual mutation fan-out:

- `1956-1965`: `handleOrdersAction`
- `1960-1962`: `actionable.forEach(... advanceMutation.mutate(...))`

If the prompt only lists `2335/2337/2339`, the implementor can easily patch button call sites and miss the shared loop that actually creates the burst.

### [P2] There is a missing live fan-out path: batch undo at `1933-1936`

- `startUndoWindow` creates an `onUndo` callback at `1920-1941`
- inside it, `1933-1936` loops `snapshots.forEach(...)` and calls `advanceMutation.mutate(...)` once per order

This is not the reported S270 repro, but it is a real live batch-update path with the same N-mutation shape. If the prompt claims to fix the batch-rate-limit pattern generally, omitting undo leaves one burst path intact.

### [P2] `handleCloseAllOrders` is a real hotspot, but it is not the reported repro path

- `4122-4143`: `handleCloseAllOrders`
- `4132-4133`: `await Promise.all(orders.map(o => base44.entities.Order.update(...)))`
- `2131`: `handleCloseTableClick` only falls back to `onCloseAllOrders(group.orders)` when there is no `sessionId` / no close-table handler

This is a valid batch hardening target, but the specific S270 reproduction in `BUGS.md` is "Выдать все" on 4 dishes, which maps more directly to:

- `2335/2337/2339` -> `1956-1965`

### [P2] `120ms` is a heuristic, not a validated sufficiency threshold

- default polling is `5000ms` at `508`
- active queries refetch on that interval at `3449-3485`

A serial batch plus single invalidation is the important fix. `120ms` may help smooth bursts, but static review cannot prove it is sufficient for the backend's real limit window. For 4 items it is likely fine if requests are truly serialized; for 10-30 item restaurant batches, polling can still overlap a long-running batch.

Prompt guidance should therefore say:

- use a named constant, not a magic number
- treat the delay as tunable
- do not claim "`120ms` is sufficient" as a fact unless it was tested

## Direct answers

### 1. Are all 5 fan-out locations correctly identified with right line numbers?

If the draft's 5 locations are these live user-facing batch entry points, then the anchors are real:

- `2333`: bulk request bar (`tableRequests.forEach(...)`)
- `2335`: bulk `newOrders` button
- `2337`: bulk `inProgressSections` button
- `2339`: bulk `readyOrders` button
- `4132-4133`: `Promise.all(...)` inside `handleCloseAllOrders`

But two corrections are needed:

- `2335/2337/2339` are entry points, not the actual order fan-out loop. The real mutation fan-out is `1956-1965`.
- If the draft cites `639` or `1254` for request bulk fan-out, those are wrong because both are inside commented code.

### 2. Is `runBatchSequential` helper correct?

Conceptually yes, but only if all of these are true:

- it is promise-based and truly serial: `await` one item before starting the next
- it works with `mutateAsync(...)` or direct entity-update promises, never `mutate(...)`
- it delays only between items, not before the first or after the last
- it fails fast and rethrows, rather than swallowing errors and continuing blindly

Recommended shape:

```js
const BATCH_DELAY_MS = 120;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBatchSequential(items, task, delayMs = BATCH_DELAY_MS) {
  for (let i = 0; i < items.length; i += 1) {
    await task(items[i], i);
    if (delayMs > 0 && i < items.length - 1) {
      await sleep(delayMs);
    }
  }
}
```

### 3. Is the invalidate-once optimization sound?

Not by itself. It is only sound if the prompt also suppresses the existing per-mutation invalidations during batch mode:

- orders: `1882-1897`
- requests: `3513-3521`

Without that, `mutateAsync` will still trigger `invalidateQueries(...)` once per item.

### 4. Is `120ms` delay sufficient?

Not something static review can certify. The prompt can justify `120ms` as a starting throttle value, but not as a proven-safe number. The safer statement is:

- sequentialization is mandatory
- single final invalidation is mandatory
- `120ms` is a tunable starting point
- if large batches still hit the backend limit, increase the delay and/or pause polling during batch

### 5. Any missing fan-out locations?

Yes.

- Missing live order fan-out implementation site: `1956-1965`
  - this is the one the three live bulk order buttons actually use
- Missing live undo fan-out: `1933-1936`

Potentially misleading non-live sites that should **not** be counted:

- `639`
- `1254`
- `671`, `694`, `709`
- `1286`, `1309`, `1324`

Those all sit inside commented snapshots.

### 6. Is `onCloseRequest mutate -> mutateAsync` change safe?

Not as a blanket replacement at `4399`.

It is safe only if the prompt also requires one of these:

- every async caller `await`s it in `try/catch`
- or every fire-and-forget caller uses `void onCloseRequestAsync(...).catch(...)`
- or single-request buttons keep using sync `mutate(...)`, while bulk request paths use a separate async batch helper

Without that, failures from request updates can escape as unhandled promise rejections.

## Bottom line

The prompt's main idea is good, but it is not implementation-safe unless it is tightened in four places:

1. distinguish live fan-out code from commented duplicates
2. target the real shared order batch loop at `1956-1965`
3. explicitly suppress per-item invalidations in `1882-1897` and `3513-3521`
4. do not globally replace `onCloseRequest` with `mutateAsync` without caller-side error handling or a separate async batch wrapper
