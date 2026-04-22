# SOM Batch B1 - KP Independent Findings

Date: 2026-04-15
Role: KP (Codex App / PowerShell)
Scope: Read-only independent analysis for StaffOrdersMobile

## Self-check (before starting)

1. Ambiguities
- `BUGS_MASTER.md` is not present in this workspace. I used the nearest local source, `pages/StaffOrdersMobile/BUGS.md`, for `SOM-BUG-S270-01`, and I found no local `SOM-BUG-S270-02` entry.
- The prompt says `tableId` is already in scope near line 4148, but the current code stores only `{ sessionId, tableName }` in `closeTableConfirm` at lines 4136-4145.
- The prompt hypothesis says the Completed tab likely filters by `Table.status`, but the inspected predicate in this RELEASE does not.

2. Execution plan
- Read `components/sessionHelpers.js` first to anchor the close-session behavior.
- Read only the requested StaffOrdersMobile ranges plus targeted greps for mutation paths.
- Read the local bug entry for `SOM-BUG-S270-01`, then synthesize into this file.

3. Risks of stalling
- PowerShell login-shell startup was slow; targeted reads needed `login=false`.
- The main RELEASE filename contains spaces, so grep/path quoting was fragile.
- Repo-wide markdown greps can hit prior generated reports; I did not use those as evidence.

## Section 1 - SOM-BUG-S270-02 (close table -> Completed)

### 1. `closeSession()` verbatim with line numbers

```js
158: export async function closeSession(sessionId) {
159:   await base44.entities.TableSession.update(sessionId, {
160:     status: "closed",
161:     closed_at: new Date().toISOString()
162:   });
163: 
164:   // S267: Bulk-close all non-cancelled orders in this session.
165:   const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
166:   await Promise.all(
167:     sessionOrders
168:       .filter(o => o.status !== 'cancelled')
169:       .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
170:   );
171: }
```

Answer: NO. `closeSession()` updates `TableSession.status` and then bulk-updates `Order.status`, but it does not touch `Table.status`.

### 2. Completed-tab filter hits

Relevant hits with line + 2 lines context:

```txt
3828:   // v2.7.1: Tab filtering (active vs completed)
3829:   const filteredGroups = useMemo(() => {
3830:     if (!orderGroups) return [];
3831:
```

```txt
3837:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
3838:       // S267: served-but-not-closed -> stay in Active until closeSession
3839:       const hasServedButNotClosed = group.orders.some(o => {
3840:         const config = getStatusConfig(o);
3841:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
```

```txt
3843:       return activeTab === 'active'
3844:         ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
3845:         : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
```

```txt
3849:   // v2.7.1: Tab counts
3850:   const tabCounts = useMemo(() => {
3851:     if (!orderGroups) return { active: 0, completed: 0 };
3852:
```

```txt
3859:       const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
3860:       const hasServedButNotClosed = group.orders.some(o => {
3861:         const config = getStatusConfig(o);
3862:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
```

```txt
3862:         return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
3863:       });
3864:       if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
```

Conclusion: the Completed tab is driven by:
- `group.orders[*].status`
- `getStatusConfig(o).isFinishStage`
- presence of active service requests via `activeRequests.some(r => getLinkId(r.table) === group.id)`

It is not driven by `Table.status`.

Important upstream finding: the current waiter dataset excludes closed orders before tab filtering even runs:

```txt
3562:   const activeOrders = useMemo(() => {
3563:     if (!orders) return [];
3564:
3567:     return orders.filter((o) => {
3577:       if (stageId && stagesMap[stageId]) {
3578:         const stage = stagesMap[stageId];
3579:         if (stage.internal_code === 'finish') {
3580:           return o.status !== 'closed' && o.status !== 'cancelled';
3581:         }
3582:         return true;
3583:       }
3584:       return ["new", "accepted", "in_progress", "ready"].includes(o.status);
3585:     });
```

This means a successfully closed table can drop out of `activeOrders` and therefore never reach `orderGroups` / `filteredGroups` / Completed. Based on this RELEASE alone, that is a stronger explanation for the symptom than missing `Table.status`.

### 3. Recommended fix option

Pick: Option A.

Why Option A is safer between the two proposed choices:
- `closeSession()` is the domain boundary for "table visit is now closed", so syncing `Table.status` there keeps all callers consistent.
- Option B is not actually available in the current code as written: the confirm path has only `sessionId` and `tableName` in scope, not `tableId` (`handleCloseTable` at 4136-4139, `confirmCloseTable` at 4143-4148).
- Helper-level sync reduces the chance that one caller remembers to update `Table.status` while another forgets.

Important caveat: Option A alone is not sufficient to fix the visible "moves to Completed" symptom in this RELEASE. The local UI currently filters closed orders out at lines 3562-3585 before grouping, so the table can disappear before the Completed predicate runs. `Table.status` sync looks like cross-entity consistency work, not the whole UI fix.

### 4. Regression risks

1. If the reopen path never resets `Table.status` back from `"closed"`, a new visit on the same physical table can inherit stale closed state.
2. A partial failure between `TableSession.update`, bulk order close, and `Table.update` can leave session/order/table entities inconsistent.
3. Sessions with missing or legacy table links may fail table resolution inside `closeSession()`, silently skipping the table-status sync.

### 5. Manual test plan (3 waiter steps)

1. Create a hall table with all dishes already served and no active service requests, tap `Close table`, then verify the table leaves Active and appears under Completed after refresh/poll.
2. Open the Completed tab and confirm the same table card remains visible there, with no active request badge and no reopen into Active on the next poll.
3. Start a brand-new session/order on the same table and verify the new visit appears in Active while the previous closed visit does not leak stale closed state into the new session.

## Section 2 - SOM-BUG-S270-01 re-check (rate limit, diagnostics only)

Note: `BUGS_MASTER.md` was missing. The nearest local bug entry is `pages/StaffOrdersMobile/BUGS.md:368-374`, which documents the batch fix from S271 and explicitly notes that `onBatchCloseRequestAsync` was added while keeping the synchronous single-item request path.

### 1. Handlers that call a B44 mutation without `__batch: true`

| Line | Handler name | Mutation call | has `__batch`? |
| --- | --- | --- | --- |
| 1627 | `handleAction` (`OrderCard` single-order action) | `updateStatusMutation.mutate({ id: order.id, payload })` | N |
| 4360 | `RequestCard.onAction` (standalone request card) | `updateRequestMutation.mutate({ id: req.id, status: req.status === "new" ? "in_progress" : "done" })` | N |
| 4435 | `onCloseRequest` prop used by single request accept/serve buttons | `updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })` | N |

Negative control: the waiter single-order row buttons are not the current gap. `handleSingleAction` at line 2002 delegates into `handleOrdersAction`, and that path calls `advanceMutation.mutateAsync(..., __batch: true)` at line 1990 even for a single order.

### 2. Mutation-wrapper invalidation audit

- `updateStatusMutation` (1594-1606): `onSettled` always calls `queryClient.invalidateQueries({ queryKey: ["orders"] })`. Yes, every tap forces an orders refetch.
- `advanceMutation` (1904-1920): `onSettled` invalidates `["orders"]` and `["servedOrders", group.id]` unless `vars?.__batch` is set. Not always; current single-row waiter actions are protected because they pass `__batch: true`.
- `updateRequestMutation` (3549-3551): `onSuccess` invalidates `["serviceRequests"]` unless `vars?.__batch` is set. Current single request handlers do not set `__batch`, so each tap refetches.
- Direct `base44.entities.Order.update` in `handleCloseAllOrders` (4168-4171): no wrapper-level invalidation; there is one explicit invalidate after the sequential loop, so this specific path is not a per-item refetch storm.

Diagnosis: yes, per-tap refetch storm is still suspected on the unbatched single-action paths (`handleAction`, `RequestCard.onAction`, `onCloseRequest`).

### 3. `closeSession()` audit

`closeSession()` still contains a concurrent mutation fan-out:

```txt
165:   const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
166:   await Promise.all(
167:     sessionOrders
168:       .filter(o => o.status !== 'cancelled')
169:       .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
170:   );
```

This is a potential 429 source on its own. It does not use React Query mutation wrappers, so there is no `__batch` suppression available here; the risk is raw concurrent HTTP fan-out.

### 4. Findings table

| Finding | Evidence | Risk | Estimated LOC to fix |
| --- | --- | --- | --- |
| Kitchen single-order action is unbatched and always invalidates `orders` | 1594-1606, 1627 | HIGH | ~8-15 LOC |
| Standalone request card single action is unbatched and invalidates `serviceRequests` on every tap | 3549-3551, 4360 | MED | ~3-6 LOC |
| Table-card request accept/serve single actions are unbatched and invalidate `serviceRequests` on every tap | 3549-3551, 4435 | HIGH | ~3-6 LOC |
| `closeSession()` still does `Promise.all(Order.update(...))` fan-out | `components/sessionHelpers.js:165-169` | HIGH | ~6-12 LOC |

## Section 3 - Prompt Clarity rating

Rating: 4/5

Why not 5/5:
- `BUGS_MASTER.md` was referenced but does not exist in this workspace.
- The prompt said `tableId` is already in scope near line 4148, but the current code only carries `sessionId`.
- The prompt hypothesis pointed at `Table.status` for Completed-tab behavior, but the inspected RELEASE uses order/request-derived predicates and also filters closed orders out upstream.

## Section 4 - Out-of-scope risks

1. `handleCloseTable` / `confirmCloseTable` still use hardcoded Russian UI strings (`'стол'`, `"Стол закрыт"`, `"Ошибка при закрытии"`) at 4139, 4149, and 4153, which violates the repo i18n rules.
2. `activeOrders` applies the shift cutoff before Completed-tab grouping (3565-3573), so older same-shift history can never appear under Completed even if the tab intends historical visibility.
3. `computeTableStatus()` (1129-1162) is used for styling/sort priority, while tab membership is computed separately at 3828-3868; the two models can drift.
4. `workOrders` in `OrderGroupCard` excludes `"closed"` orders (1752-1754), but totals/bill sections still read from `group.orders` excluding only `"cancelled"` (2021-2029), which can create inconsistent card subviews around close/reopen edges.
5. Guest loading still does `Promise.all(SessionGuest.get(...))` at 3635-3639; not in B1 scope, but it can burst requests on large tables.

## Post-task review

1. Prompt clarity/executability rating: 8/10.
2. What was unclear or caused hesitation:
- Missing `BUGS_MASTER.md`.
- The prompt's assumption that `tableId` was already available at the close confirm site.
- The prompt framed Bug 1 around `Table.status`, but the RELEASE's stronger local cause is the `activeOrders` pre-filter.
3. What change would save tokens/time:
- Replace `BUGS_MASTER.md` with the actual local path `pages/StaffOrdersMobile/BUGS.md`.
- Add `3560-3585` to the required read ranges, because that block explains why closed tables can disappear before reaching Completed.
4. Which reads cost the most tokens:
- Broad markdown grep for `SOM-BUG-S270` cost the most and risked hitting generated review artifacts.
- A smaller excerpt such as `pages/StaffOrdersMobile/BUGS.md:366-374` would have been enough.

## Permissions Requested

- Read targeted excerpts from `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx`
- Read `components/sessionHelpers.js`
- Read `pages/StaffOrdersMobile/BUGS.md` as the nearest fallback because `BUGS_MASTER.md` was missing
- Write `pipeline/findings-som-b1-kp-v1.md`

No escalated permissions were needed for this task.
