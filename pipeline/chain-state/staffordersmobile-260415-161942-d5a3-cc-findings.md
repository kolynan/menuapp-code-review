# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260415-161942-d5a3

## Findings

### Fix 1 — SOM-BUG-S270-02 (P1): Close Table → стол в «Завершённые»

**1a. [P1] `activeOrders` filter excludes closed orders from finish stage (line 3580)**

Confirmed. Line 3580:
```js
return o.status !== 'closed' && o.status !== 'cancelled';
```
This filters out `status === 'closed'` orders at finish stage. After `closeSession()` sets all orders to `closed`, they vanish from `activeOrders`, so the table disappears from both tabs (no orders → no group in `filteredGroups`).

The shift cutoff at lines 3572-3574 already prevents historical closed orders from leaking in. Only current-shift closed orders will pass through.

FIX: Change line 3580 to `return o.status !== 'cancelled';` — removes the `closed` exclusion so finish-stage closed orders remain visible. The `filteredGroups` logic at 3828-3847 will correctly route them: `hasActiveOrder` = false (finish stage), `hasServedButNotClosed` = false (they ARE closed), `hasActiveRequest` = false (after Fix 1b) → routes to "Completed" tab. **Correct.**

**1b. [P1] `closeSession` does not close ServiceRequests — causes `hasActiveRequest=true` for closed table (sessionHelpers.js:158-171)**

Confirmed. `closeSession()` closes TableSession + Orders but not ServiceRequests. The `activeRequests` useMemo at 3534-3547 filters by `!["done", "cancelled"].includes(r.status)` — so open/accepted requests survive. `filteredGroups` at line 3837 checks `hasActiveRequest` using `activeRequests.some(r => getLinkId(r.table) === group.id)` — this would keep a closed table in the "Active" tab if it has open requests.

FIX: Add ServiceRequest cleanup in `closeSession()` after bulk-close Orders. **However, important implementation note:** `getLinkId` is NOT imported in `sessionHelpers.js`. The task spec's proposed code uses `getLinkId(tableSessions[0]?.table)` but this helper doesn't exist in that file. Options:
- (a) Import `getLinkId` — but it's defined in the RELEASE.jsx (line 546), not a shared module. Would need to extract to a shared utils file or inline a simpler version.
- (b) Access `table` field directly — TableSession's `table` field may be a plain ID string (if B44 stores it as a link, it could be an object). Need to handle both cases inline.
- (c) The task already knows the `tableId` at call site (`confirmCloseTable` has access to the group's table ID). Pass `tableId` as a parameter to `closeSession(sessionId, tableId)` instead of re-fetching the session to extract it. This is cleaner and avoids the extra API call + getLinkId dependency.

**Recommendation:** Option (c) — modify `closeSession` signature to accept optional `tableId`, pass it from `confirmCloseTable`. Avoids extra B44 API call and `getLinkId` dependency. If `tableId` provided, close open ServiceRequests for that table using sequential loop (per Fix 2 pattern).

**1c. [P1] Missing `refetchRequests()` after closeSession in `confirmCloseTable` (line 4148-4155)**

Confirmed. After `closeSession()`, `refetchOrders()` is called (line 4151) but `refetchRequests()` is not. If Fix 1b closes ServiceRequests server-side, the local cache still holds stale open requests until next polling cycle (5s). This means `hasActiveRequest` stays true temporarily, keeping the closed table in "Active" tab for up to 5 seconds.

FIX: Add `if (!isKitchen) refetchRequests();` after `refetchOrders()` at line 4151. Pattern already used in `handleRefresh` at line 4131. `isKitchen` guard is correct — kitchen view doesn't show requests.

---

### Fix 2 — SOM-BUG-S270-01 (P0): `Promise.all` in closeSession → sequential

**2. [P0] `Promise.all` fires N parallel API calls — rate limit risk (sessionHelpers.js:166-170)**

Confirmed. Lines 166-170:
```js
await Promise.all(
  sessionOrders
    .filter(o => o.status !== 'cancelled')
    .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
);
```
For a table with 5+ orders, this fires 5+ parallel `PATCH` requests simultaneously. B44's API rate limit can return 429.

FIX: Replace `Promise.all` with sequential loop + 120ms delay. `runBatchSequential` from RELEASE.jsx cannot be imported (it's a page-level function, not a module export). Inline the pattern:
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

**Note on error handling:** The RELEASE.jsx `runBatchSequential` (line 529-543) catches errors per item and breaks on rate limit. The inline version in sessionHelpers should probably do the same for consistency — but the task spec shows a simpler version without try/catch. Since `closeSession` is called from `confirmCloseTable` which already has a try/catch, unhandled errors will bubble up correctly. The simpler version is acceptable — any failed update will abort the loop and the catch at 4152 will show the error toast.

---

### Fix 3 — SOM-BUG-S270-01 (P1): `forEach` → `runBatchSequential` in collapsed card

**3. [P1 → NO-OP / DEAD CODE] `tableRequests.forEach` at lines 657 and 1272 are inside `/* */` comment blocks**

**Critical finding:** Both line 657 (inside comment block lines 564-803) and line 1272 (inside comment block lines 1169-1436) are **dead code** — they are entirely within multi-line `/* ... */` comments. These are old, commented-out versions of the collapsed card component.

The **active** collapsed card view inside `OrderGroupCard` (line 1720+) does NOT have its own "Accept All" / "Serve All" bulk buttons in the collapsed state — only individual request action buttons exist there.

The **expanded** card at line 2369 already correctly uses `runBatchSequential` + `onBatchCloseRequestAsync`.

FIX: **No fix needed for active code.** The `tableRequests.forEach` pattern exists only in dead code. However, if these commented-out blocks are ever restored, they should use the `runBatchSequential` pattern. Consider deleting the dead code blocks entirely (lines 564-803 and 1169-1436) in a follow-up cleanup task.

---

### Fix 4 — [NICE-TO-HAVE]: `__batch` guard on `updateStatusMutation`

**4. [P2] Missing `__batch` guard on `updateStatusMutation.onSettled` (line 1606)**

Confirmed. Line 1606:
```js
onSettled: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
```
Compare with `advanceMutation` at lines 1916-1919:
```js
onSettled: (_data, _err, vars) => {
  if (vars?.__batch) return;
  queryClient.invalidateQueries({ queryKey: ["orders"] });
  queryClient.invalidateQueries({ queryKey: ["servedOrders", group.id] });
},
```
`advanceMutation` skips invalidation for `__batch` calls; `updateStatusMutation` does not. If `updateStatusMutation` is ever used in a batch context, every individual call will trigger `invalidateQueries`, causing N refetches instead of 1.

Currently `updateStatusMutation` is not called with `__batch: true` anywhere, so this is a latent issue — no active bug, but inconsistency that could cause problems when batch usage is added.

FIX:
```js
onSettled: (_data, _err, vars) => {
  if (vars?.__batch) return;
  queryClient.invalidateQueries({ queryKey: ["orders"] });
},
```

---

## Summary
Total: 5 findings (1 P0, 3 P1, 1 P2, 0 P3)
- Fix 1a: P1 — Confirmed. One-line change at 3580. Straightforward.
- Fix 1b: P1 — Confirmed, but implementation needs adjustment (no `getLinkId` in sessionHelpers.js). Recommend passing `tableId` as param to `closeSession`.
- Fix 1c: P1 — Confirmed. One-line addition after 4151.
- Fix 2: P0 — Confirmed. Replace Promise.all with sequential loop in sessionHelpers.js:166-170.
- Fix 3: P1 → NO-OP — **Dead code.** Both cited lines (657, 1272) are inside `/* */` comment blocks. No active code uses `tableRequests.forEach` for bulk operations. Expanded card already uses correct pattern.
- Fix 4: P2 — Confirmed. One-line → three-line change at 1606.

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1b: The proposed code uses `getLinkId(tableSessions[0]?.table)` but `getLinkId` is not available in `sessionHelpers.js`. This would cause a runtime error if implemented as-is. The task should have noted this dependency gap or proposed an alternative approach (e.g., passing `tableId` as parameter).
  - Fix 3: Lines 657, 665, and 1272 are all inside `/* */` comment blocks (dead code, lines 564-803 and 1169-1436). The task description states these are active collapsed card locations, which is incorrect. This would have led to wasted effort trying to fix dead code if not caught.
- Missing context: It would help to know whether `confirmCloseTable` has access to the table ID (it does via `closeTableConfirm` — verified by reading the code, but task could state this explicitly for the `closeSession(sessionId, tableId)` pattern).
- Scope questions: Fix 3 being dead code — should the dead code comment blocks (lines 564-803, 1169-1436) be removed as part of this task, or is that out of scope?
