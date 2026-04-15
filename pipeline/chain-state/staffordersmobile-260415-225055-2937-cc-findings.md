# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260415-225055-2937
Date: 2026-04-15
Analyzed files:
- `components/sessionHelpers.js` (230 lines)
- `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` (4579 lines)

---

## Findings

### 1. [P1] Fix B — sessionHelpers.js:177 filters ServiceRequests by `table` instead of `table_session` (line 177)

**Description:** `closeSession()` at line 177 uses `ServiceRequest.filter({ table: tableId })` to find requests to close. This relies on the `table` link-field, which can have ref/id mismatches in Base44. More importantly, it doesn't scope to the current session — if a table has been reopened, requests from a previous session could be affected, or current-session requests with only `table_session` link (no `table` link) could be missed entirely. This causes closed tables to remain in the Active tab because `hasActiveRequest` at SOM:3840 still sees unclosed requests.

**Current code (line 177):**
```js
const requests = await base44.entities.ServiceRequest.filter({ table: tableId });
```

**FIX:** Replace line 177 with a primary filter by `table_session: sessionId` and a fallback to `table: tableId` for legacy requests that lack the `table_session` link:
```js
let requests = await base44.entities.ServiceRequest.filter({ table_session: sessionId });
if (requests.length === 0 && tableId) {
  requests = await base44.entities.ServiceRequest.filter({ table: tableId });
}
```
Keep lines 178-185 (openRequests filter + sequential update + BATCH_DELAY_MS) unchanged. Do NOT add try/catch around fallback — errors should bubble up to `confirmCloseTable`'s catch block. Do NOT change function signature `closeSession(sessionId, tableId)`.

**Verified:** `sessionId` is the first parameter (line 158). The rest of the function (lines 164-173 bulk close orders, lines 178-185 close requests loop) remains untouched.

---

### 2. [P1] Fix C.1 — activeOrders useMemo passes `status='closed'` orders through finish-stage filter (line 3583)

**Description:** At line 3583, the finish-stage branch returns `o.status !== 'cancelled'`, meaning `status='closed'` orders pass through into `activeOrders`. After close-table (which bulk-sets orders to `status='closed'`), these closed orders remain in `activeOrders` → flow into `orderGroups` → appear in the Active tab via `hasServedButNotClosed` logic (line 3842-3844). On table reopen, old closed orders from a previous session still appear in the table's card, confusing the waiter.

**Current code (lines 3580-3584):**
```jsx
if (stageId && stagesMap[stageId]) {
  const stage = stagesMap[stageId];
  if (stage.internal_code === 'finish') {
    return o.status !== 'cancelled';
  }
  return true;
}
```

**FIX:** Change line 3583 to exclude both `closed` and `cancelled`:
```jsx
return o.status !== 'closed' && o.status !== 'cancelled';
```
This is a one-line change. No other lines in this useMemo need modification.

**Verified:** The `hasServedButNotClosed` check at line 3842-3844 already checks `o.status !== 'closed'`, so excluding closed orders from `activeOrders` is consistent — they won't contribute to Active tab presence. Completed tab receives closed tables via Fix A's session-based override.

---

### 3. [P1] Fix C.2 — handleCloseTableClick picks wrong sessionId from mixed orders (lines 2164-2171)

**Description:** `handleCloseTableClick` at line 2165 extracts sessionId via:
```jsx
const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
```
`find(Boolean)` returns the first truthy value. If the table has mixed orders from two sessions (old closed + new open), it may return the old session's ID → `closeSession()` closes an already-closed session while the current one stays open. This is a P1 because it silently fails to close the intended session.

**Current code (lines 2164-2171):**
```jsx
const handleCloseTableClick = useCallback(() => {
  const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
  if (onCloseTable && sessionId) {
    onCloseTable(sessionId, identifier, group.id);
    return;
  }
  if (onCloseAllOrders) onCloseAllOrders(group.orders);
}, [group.orders, identifier, onCloseAllOrders, onCloseTable]);
```

**FIX:** Prefer `group.openSessionId` (populated by Fix A.4), fallback to orders-based lookup filtering out closed/cancelled orders:
```jsx
const handleCloseTableClick = useCallback(() => {
  let sessionId = group.openSessionId || null;
  if (!sessionId) {
    const openOrder = group.orders.find(
      (o) => o.status !== 'closed' && o.status !== 'cancelled' && getLinkId(o.table_session)
    );
    sessionId = openOrder ? getLinkId(openOrder.table_session) : null;
  }
  if (onCloseTable && sessionId) {
    onCloseTable(sessionId, identifier, group.id);
    return;
  }
  if (onCloseAllOrders) onCloseAllOrders(group.orders);
}, [group.openSessionId, group.orders, identifier, onCloseAllOrders, onCloseTable]);
```
**Note:** `group.openSessionId` is a new field added by Fix A.4. The fallback ensures this works even before Fix A is merged, or for edge cases where openSessionByTableId hasn't refreshed yet.

---

### 4. [P1] Fix A.1 — No useQuery for open TableSessions (missing, insert after ~line 3526)

**Description:** Neither `filteredGroups` nor `tabCounts` reads `TableSession.status`. The entire Active/Completed tab logic is derived from orders + requests. If any signal fails to close (e.g., a request slips through Fix B's filter), the table stays in Active indefinitely. A ground-truth query for open TableSessions provides a definitive override.

**FIX:** Add a new useQuery after the serviceRequests query block (after line 3526), following the same pattern:
```jsx
const { data: openSessions = [] } = useQuery({
  queryKey: ["openSessions", partnerId],
  queryFn: () =>
    partnerId
      ? base44.entities.TableSession.filter({ partner: partnerId, status: 'open' })
      : base44.entities.TableSession.list(),
  enabled: canFetch && !!partnerId && !rateLimitHit,
  staleTime: 30_000,
});
```

**Verified:** `base44.entities.TableSession` is used in `sessionHelpers.js` (lines 70, 79, 159) and accessible via the same `base44` import. `canFetch`, `partnerId`, `rateLimitHit` are all in scope (lines 3349-3357, and rateLimitHit state). `staleTime: 30_000` avoids excessive polling while still catching closes within 30s (or immediately via invalidation in Fix A.3). The `enabled` guard with `!rateLimitHit` matches the serviceRequests query pattern.

---

### 5. [P1] Fix A.2 — Derived maps for openSessionByTableId (missing, insert after A.1)

**Description:** The raw `openSessions` array needs to be indexed by tableId for O(1) lookups in `filteredGroups`, `tabCounts`, and `orderGroups`.

**FIX:** Add two useMemo hooks immediately after the useQuery:
```jsx
const openSessionByTableId = useMemo(() => {
  const map = {};
  (openSessions || []).forEach((s) => {
    const tid = getLinkId(s.table);
    if (tid) map[tid] = s;
  });
  return map;
}, [openSessions]);

const openSessionIds = useMemo(
  () => new Set((openSessions || []).map((s) => s.id)),
  [openSessions]
);
```

**Verified:** `getLinkId` is available (used extensively throughout the file, e.g., line 2165, 3572, 3748).

---

### 6. [P1] Fix A.3 — confirmCloseTable doesn't invalidate openSessions query (line ~4154)

**Description:** `confirmCloseTable` (line 4146) calls `closeSession()` then `refetchOrders()` and `refetchRequests()` (lines 4154-4155). But the new `openSessions` query won't know the session was closed until `staleTime` expires (30s). Without explicit invalidation, the Active tab retains the closed table for up to 30 seconds.

**Current code (lines 4150-4155):**
```jsx
await closeSession(sessionId, tableId);
showToast("Стол закрыт");
setExpandedGroupId(null);
refetchOrders();
if (!isKitchen) refetchRequests();
```

**FIX:** Add `queryClient.invalidateQueries({ queryKey: ["openSessions"] });` after the existing refetch calls (after line 4155):
```jsx
refetchOrders();
if (!isKitchen) refetchRequests();
queryClient.invalidateQueries({ queryKey: ["openSessions"] });
```

**Note:** The existing pattern uses `refetchOrders()` / `refetchRequests()` (direct refetch references), not `invalidateQueries` for orders/requests. Using `invalidateQueries` for openSessions is fine — there's no stored refetch reference for it, and invalidation triggers the same refetch.

---

### 7. [P1] Fix A.4 — orderGroups mapping lacks openSessionId field (line ~3752)

**Description:** `orderGroups` useMemo (line 3740) builds table groups with `type`, `id`, `displayName`, `orders`. Fix C.2 needs `group.openSessionId` to identify the correct session to close. Without this field, the fallback in handleCloseTableClick must parse orders (unreliable with mixed sessions).

**Current code (lines 3750-3757):**
```jsx
tableGroups[tableId] = {
  type: 'table',
  id: tableId,
  displayName: tableName,
  orders: [],
};
```

**FIX:** Add `openSessionId` field:
```jsx
tableGroups[tableId] = {
  type: 'table',
  id: tableId,
  displayName: tableName,
  orders: [],
  openSessionId: openSessionByTableId[tableId]?.id || null,
};
```
Also add `openSessionByTableId` to the useMemo dependency array (line 3789):
```jsx
}, [visibleOrders, tableMap, isKitchen, activeRequests, openSessionByTableId]);
```

---

### 8. [P1] Fix A.5 — filteredGroups has no session-based override for table groups (lines 3832-3850)

**Description:** `filteredGroups` determines Active vs Completed tab placement using only `hasActiveOrder`, `hasActiveRequest`, `hasServedButNotClosed`. A table with no open TableSession but with stale data (e.g., a request that slipped through) stays in Active. The session status should be the definitive signal.

**FIX:** Add session-first override at the start of the filter callback, and add `openSessionByTableId` to deps:
```jsx
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  return orderGroups.filter(group => {
    if (group.type === 'table') {
      const hasOpenSession = !!openSessionByTableId[group.id];
      if (!hasOpenSession) return activeTab === 'completed';
    }
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests, openSessionByTableId]);
```

**Key behavior:** For `group.type === 'table'` with no open session → forced to Completed regardless of order/request state. For non-table groups (pickup, delivery) → existing logic unchanged.

---

### 9. [P1] Fix A.6 — tabCounts has no session-based override for table groups (lines 3853-3871)

**Description:** Same issue as Fix A.5 but for `tabCounts`. Must mirror the same override logic to keep tab counts consistent with `filteredGroups`.

**FIX:** Add session-first override and `openSessionByTableId` to deps:
```jsx
const tabCounts = useMemo(() => {
  if (!orderGroups) return { active: 0, completed: 0 };
  let active = 0, completed = 0;
  orderGroups.forEach(group => {
    if (group.type === 'table' && !openSessionByTableId[group.id]) {
      completed++;
      return;
    }
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    if (hasActiveOrder || hasActiveRequest || hasServedButNotClosed) active++; else completed++;
  });
  return { active, completed };
}, [orderGroups, getStatusConfig, activeRequests, openSessionByTableId]);
```

---

## Summary
Total: 9 findings (0 P0, 9 P1, 0 P2, 0 P3)

All 9 findings map directly to the 3 numbered Fixes (B, C, A) from the task specification:
- Fix B → Finding 1 (sessionHelpers.js:177)
- Fix C → Findings 2-3 (C.1: activeOrders, C.2: handleCloseTableClick)
- Fix A → Findings 4-9 (A.1-A.6: useQuery, useMemo maps, invalidate, orderGroups field, filteredGroups override, tabCounts override)

---

## Prompt Clarity

- **Overall clarity: 5/5** — Exceptionally detailed task description with exact line numbers, code snippets, before/after examples, test cases, and explicit "do NOT" boundaries.
- **Ambiguous Fix descriptions:** None. All three Fixes (B, C, A) are clear with precise code locations and expected behavior.
- **Missing context:** Minor: the task description said sessionHelpers.js has 203 lines but it actually has 230 lines (functions 9-11 extend beyond line 203). This didn't affect analysis — the target line 177 was accurate.
- **Scope questions:** None. The FROZEN UX section and "do NOT" constraints clearly delineate boundaries. The task correctly identified that `confirmCloseTable` uses `refetchOrders()`/`refetchRequests()` rather than `invalidateQueries` — the Fix A.3 approach of adding `invalidateQueries` for the new query is the right pattern since there's no refetch reference to use.
