# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260415-153619-4e93

## Findings

### Fix 1 — SOM-BUG-S270-02 (P1): Close Table -> table appears in "Completed" tab

**1a. [P1] `activeOrders` filter excludes closed orders at finish stage (line 3580)**

Currently line 3580:
```js
return o.status !== 'closed' && o.status !== 'cancelled';
```
This filters out ALL closed orders, so after `closeSession()` marks orders as `status:'closed'`, they vanish from `activeOrders` entirely and never reach `orderGroups` or `filteredGroups`.

FIX: Change to `return o.status !== 'cancelled';` — allow closed orders through. The shift cutoff on lines 3572-3574 already prevents historical closed orders from leaking in (only current shift orders pass). The `filteredGroups` logic on lines 3828-3847 will correctly route them:
- `hasActiveOrder` = false (finish stage orders don't match `!config.isFinishStage`)
- `hasServedButNotClosed` = false (closed orders don't match `o.status !== 'closed'`)
- `hasActiveRequest` = false (after Fix 1b closes SRs)
- Result: table goes to "completed" tab. Correct.

**1b. [P1] `closeSession` does not close ServiceRequests (sessionHelpers.js:158-171)**

`closeSession()` closes TableSession + Orders but leaves ServiceRequests open. This means `hasActiveRequest` on line 3837 remains true for the closed table, keeping it pinned in the "Active" tab even after orders are closed.

FIX: After bulk-closing orders in `closeSession`, fetch and close open ServiceRequests for the table. Implementation note: `getLinkId()` is defined in RELEASE.jsx (line 546), not in sessionHelpers.js. The proposed task code uses `getLinkId(tableSessions[0]?.table)` — but sessionHelpers doesn't import `getLinkId`. Two options:
- (A) Inline the link extraction: `const tableId = typeof session.table === 'object' ? session.table?.id : session.table;` (matching what `getLinkId` does)
- (B) Extract tableId from `sessionOrders[0]?.table` (already fetched on line 165), avoiding an extra API call to re-fetch the session.

Recommended: option (B) is more efficient — we already have orders with `table` field. But the task spec says to fetch `TableSession` by ID, which is a redundant API call since we already updated the session on line 159. Better: use the session data we already have. However, we don't have it in a variable. Simplest correct approach: fetch the session or use orders.

Also note: the proposed code uses `for...of` + await (sequential) for SR updates — correct per Fix 2/Fix 3 pattern. Should add 120ms delay between calls to match `BATCH_DELAY_MS`.

**1c. [P1] `confirmCloseTable` does not refetch requests after close (line 4148-4155)**

After `closeSession(sessionId)` on line 4148, only `refetchOrders()` is called (line 4151). `refetchRequests()` is never called, so the UI won't reflect the closed ServiceRequests until next polling cycle (5s).

FIX: Add `if (!isKitchen) refetchRequests();` after `refetchOrders()` on line 4151. The pattern already exists in `handleRefresh` (line 4131). `isKitchen` guard is needed because kitchen view doesn't use requests.

### Fix 2 — SOM-BUG-S270-01 (P0): `Promise.all` in closeSession -> sequential

**2. [P0] `Promise.all` causes parallel API calls risking 429 rate limit (sessionHelpers.js:166-170)**

Current code:
```js
await Promise.all(
  sessionOrders
    .filter(o => o.status !== 'cancelled')
    .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
);
```
For a table with 5+ orders, this fires 5+ simultaneous `PATCH` requests to the Base44 API, risking a 429 rate limit response.

FIX: Replace with sequential for-loop + 120ms delay between calls. Cannot import `runBatchSequential` from RELEASE.jsx (circular dependency: sessionHelpers -> RELEASE -> sessionHelpers). Must inline the implementation:
```js
const BATCH_DELAY_MS = 120;
const ordersToClose = sessionOrders.filter(o => o.status !== 'cancelled');
for (let i = 0; i < ordersToClose.length; i++) {
  await base44.entities.Order.update(ordersToClose[i].id, { status: 'closed' });
  if (i < ordersToClose.length - 1) {
    await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
  }
}
```
This matches the `runBatchSequential` pattern (line 529 in RELEASE.jsx) but without the error-catch-break behavior. Consider adding `try/catch` per iteration with break on rate limit for robustness, matching `runBatchSequential`'s error handling.

### Fix 3 — SOM-BUG-S270-01 (P1): `forEach` -> `runBatchSequential` in collapsed card

**3a. [P1] Collapsed card "Accept All" uses fire-and-forget `forEach` (line 657)**

Line 657 (inside IIFE on the collapsed card):
```js
onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'accepted', { ... }))
```
`forEach` fires N parallel `onCloseRequest` calls. Each triggers `updateRequestMutation.mutate()` which individually calls `invalidateQueries(["serviceRequests"])` on success — N mutations + N invalidations in <50ms. Rate limit risk for 3+ requests.

FIX: Replace with async handler using `runBatchSequential` + `onBatchCloseRequestAsync` (which passes `__batch: true` to skip per-call invalidation). Then call single `queryClient.invalidateQueries` after. The prop `onBatchCloseRequestAsync` is already available in `OrderGroupCard` (line 1739, with default `() => Promise.resolve()`), and it's passed from parent on line 4436.

**3b. [P1] Collapsed card "Serve All" uses same fire-and-forget `forEach` (line 657)**

Same line 657, the second branch `if (allAccepted)`:
```js
onClick={() => tableRequests.forEach(r => onCloseRequest(r.id, 'done'))
```
Same issue as 3a — parallel mutations.

FIX: Same pattern as 3a but with status `'done'`.

**3c. [P1] Expanded-collapsed (TableOrderGroup-like) at line 1272 has identical `forEach` issue**

Line 1272 has the exact same `forEach` pattern for Accept All and Serve All buttons, duplicated from the collapsed card template. Needs the same fix as 3a/3b.

Note: The expanded card at line 2369 already uses the correct `runBatchSequential` + `onBatchCloseRequestAsync` pattern. Lines 657 and 1272 are the only remaining violations.

### Fix 4 — [NICE-TO-HAVE]: `__batch` guard on `updateStatusMutation`

**4. [P2] `updateStatusMutation.onSettled` lacks `__batch` guard (line 1606)**

Current code (line 1606):
```js
onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
```
Always fires invalidation, even during batch operations. The sibling `advanceMutation` (line 1916-1919) already has the guard:
```js
onSettled: (_data, _err, vars) => {
  if (vars?.__batch) return;
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  ...
},
```

FIX: Add `__batch` guard to match `advanceMutation` pattern:
```js
onSettled: (_data, _err, vars) => {
  if (vars?.__batch) return;
  queryClient.invalidateQueries({ queryKey: ["orders"] });
},
```
Currently no call-site passes `__batch` to `updateStatusMutation`, so this is preventive — ensures consistency and prepares for future batch usage. Low risk.

## Summary
Total: 7 findings (1 P0, 4 P1, 1 P2, 0 P3) across 4 fixes

| Fix | Priority | Findings | Files |
|-----|----------|----------|-------|
| Fix 1 | P1 | 3 sub-findings (1a filter, 1b SR closure, 1c refetch) | RELEASE.jsx:3580, sessionHelpers.js:158-171, RELEASE.jsx:4148-4155 |
| Fix 2 | P0 | 1 finding (Promise.all -> sequential) | sessionHelpers.js:166-170 |
| Fix 3 | P1 | 3 sub-findings (657, 657, 1272 forEach) | RELEASE.jsx:657, RELEASE.jsx:1272 |
| Fix 4 | P2 | 1 finding (__batch guard) | RELEASE.jsx:1606 |

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — all 4 fixes have clear root cause, current code, expected behavior, and exact line numbers.
- Missing context: None — task provides sufficient file paths, line numbers, code snippets, and the UX decision (S283). The reference to `getLinkId` not being available in sessionHelpers.js could have been mentioned explicitly, but it's discoverable from reading the code.
- Scope questions: Fix 1b mentions using `getLinkId` in sessionHelpers.js but that function is only in RELEASE.jsx — the implementer needs to decide how to extract tableId. This is a minor implementation detail, not a scope ambiguity.
