# Codex Findings — SOM Batch B2 (Fix A/B/C)

**Task ID:** pssk-som-b2-codex-v1
**Agent:** Claude Code (acting as Codex peer reviewer)
**File:** `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` (4579 lines)
**Helper:** `components/sessionHelpers.js` (229 lines)
**Date:** 2026-04-15
**Session:** 289

---

## Section 1 — Fix A: filteredGroups must respect TableSession.status

### 1.1 Verbatim: `filteredGroups` (lines 3832-3850)

```jsx
// v2.7.1: Tab filtering (active vs completed)
const filteredGroups = useMemo(() => {
  if (!orderGroups) return [];
  
  return orderGroups.filter(group => {
    const hasActiveOrder = group.orders.some(o => {
      const config = getStatusConfig(o);
      return !config.isFinishStage && o.status !== 'cancelled';
    });
    const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
    // S267: served-but-not-closed → stay in Active until closeSession
    const hasServedButNotClosed = group.orders.some(o => {
      const config = getStatusConfig(o);
      return config.isFinishStage && o.status !== 'closed' && o.status !== 'cancelled';
    });
    return activeTab === 'active'
      ? (hasActiveOrder || hasActiveRequest || hasServedButNotClosed)
      : (!hasActiveOrder && !hasActiveRequest && !hasServedButNotClosed);
  });
}, [orderGroups, activeTab, getStatusConfig, activeRequests]);
```

### 1.2 Verbatim: `tabCounts` (lines 3852-3871)

```jsx
const tabCounts = useMemo(() => {
  if (!orderGroups) return { active: 0, completed: 0 };
  
  let active = 0, completed = 0;
  orderGroups.forEach(group => {
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
}, [orderGroups, getStatusConfig, activeRequests]);
```

### 1.3 Grep: TableSession loading in SOM

```
$ grep -n "TableSession" pages/StaffOrdersMobile/260415-00\ StaffOrdersMobile\ RELEASE.jsx
(no matches)
```

**Finding: TableSession entity is NEVER queried/loaded in SOM.** The only reference to TableSession is via `table_session` link field on Order objects (line 3572: `getLinkId(o.table_session)`). SOM does not have any `useQuery` for `TableSession.filter(...)` or `TableSession.list()`.

The `closeSession` helper in `sessionHelpers.js` calls `TableSession.update(sessionId, { status: "closed" })` (line 159), but SOM never reads `TableSession.status` back.

### 1.4 Approach Recommendation

**Option A: Add `useQuery` for TableSession.filter({ status: 'open' })**
- Pros: Authoritative source, clear override semantics.
- Cons: +1 polling query per interval (query cost). Need to join by tableId. Extra network traffic.
- Query cost: ~1 API call per poll interval (same as orders/requests).

**Option B: Add flag to group from order's table_session field**
- Pros: No extra query. Uses data already in orders.
- Cons: Requires `table_session` to be a link with resolved `status` field. Base44 link fields may only contain the ID (not resolved entity). Need to verify if `o.table_session` includes resolved `status`.

**Option C: Check all orders `.every(o => o.status === 'closed' || 'cancelled')`**
- Pros: Zero additional queries. Uses existing data.
- Cons: Doesn't check session status explicitly. If `closeSession` fails to close all orders (partial failure), this check would be inconsistent. Also doesn't handle the race: if `closeSession` succeeded but `refetchOrders()` hasn't returned yet, orders still show old status.

**RECOMMENDATION: Option C (with caveats) as immediate fix, Option A as robust long-term.**

Rationale:
- `closeSession()` already bulk-closes all non-cancelled orders (lines 166-173) AND service requests (lines 176-184). After successful close:
  - All orders get `status: 'closed'` → `hasActiveOrder = false`, `hasServedButNotClosed = false`
  - All service requests get `status: 'done'` → `hasActiveRequest = false`
  - Therefore the group SHOULD move to Completed naturally.

- **The real bug is likely Fix B** (ServiceRequest filter returning 0), which leaves `hasActiveRequest = true` even after close. If Fix B is resolved, Fix A may not be needed at all.

- However, Option C adds defense-in-depth: if ALL orders in a group are `closed`/`cancelled`, force the group into Completed regardless of service requests. This is ~3 lines of code change.

If Option A is chosen anyway:
```jsx
const { data: openSessions } = useQuery({
  queryKey: ["tableSessions", partnerId, "open"],
  queryFn: () => base44.entities.TableSession.filter({ partner: partnerId, status: "open" }),
  enabled: canFetch && !isKitchen,
  refetchInterval: effectivePollingInterval,
});

const openSessionTableIds = useMemo(() => {
  if (!openSessions) return new Set();
  return new Set(openSessions.map(s => getLinkId(s.table)));
}, [openSessions]);
```

Then in `filteredGroups`:
```jsx
// If table has no open session → always completed
if (group.type === 'table' && !openSessionTableIds.has(group.id)) {
  return activeTab !== 'active';
}
```

### 1.5 Regression Risks

1. **Tab count desync after close-then-reopen:** If a table is closed then immediately reopened (new session), the `openSessionTableIds` set may have a stale entry depending on poll timing. The table could briefly flash from Active → Completed → Active. Mitigation: `refetchOrders` + `refetchSessions` on close confirmation.

2. **Groups with 0 orders but active requests:** Currently `orderGroups` creates groups from `activeRequests` alone (lines 3773-3786). If session is closed but a service request somehow persists (orphan), Option A would hide it. Option C wouldn't catch this case since there are no orders to check.

3. **Completed tab shows stale closed tables forever:** Since `activeOrders` has a shift filter (line 3576: `createdAt < shiftCutoff`), orders from old shifts are excluded. But a closed session from the current shift would show in Completed for the rest of the shift. Not a regression per se, but a UX note.

4. **Kitchen mode:** `isKitchen` skips `orderGroups` entirely (line 3741: `if (isKitchen) return null`). No regression risk there.

### 1.6 Test Plan

1. **Basic close flow:** Open a table with 2 orders (1 new, 1 served). Close table. Verify: group moves from Active to Completed tab. Tab counts update correctly.
2. **Reload after close:** Close a table. Force-refresh the browser. Verify: closed table appears in Completed, not Active.
3. **Tab navigation:** With 3 tables (1 active, 1 closed, 1 with active request), verify Active tab shows 2 groups, Completed shows 1.
4. **Re-open flow:** Close table. Create a new order for the same physical table (new session). Verify: new session's group appears in Active. Old closed group in Completed (or gone if shift-filtered).

---

## Section 2 — Fix B: ServiceRequest.filter in closeSession returns 0

### 2.1 Verbatim: `closeSession` ServiceRequest block (sessionHelpers.js lines 175-185)

```jsx
// S283: Close open ServiceRequests for this table (so closed table leaves Active tab)
if (tableId) {
  const requests = await base44.entities.ServiceRequest.filter({ table: tableId });
  const openRequests = requests.filter(r => !['done', 'cancelled'].includes(r.status));
  for (let i = 0; i < openRequests.length; i++) {
    await base44.entities.ServiceRequest.update(openRequests[i].id, { status: 'done' });
    if (i < openRequests.length - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }
}
```

### 2.2 Grep: ServiceRequest creation (PublicMenu)

From `pages/PublicMenu/260321-02 x RELEASE.jsx` line 2992:
```jsx
await base44.entities.ServiceRequest.create({
  partner: partner.id,
  table: currentTableId,        // <--- string ID
  table_session: tableSession?.id,
  request_type: 'bill',
  status: 'new',
  source: 'public'
});
```

**Key observation:** `table` field is set to `currentTableId` — a **string ID** (not a link object, not a full entity reference).

### 2.3 Grep: activeRequests query in SOM (line 3521)

```jsx
queryFn: () => (partnerId
  ? base44.entities.ServiceRequest.filter({ partner: partnerId })
  : base44.entities.ServiceRequest.list()),
```

The SOM `activeRequests` query filters by `partner` only (not by `table`). Then client-side in `activeRequests` useMemo (lines 3537-3550):
```jsx
return allRequests.filter((r) => {
  const createdAt = safeParseDate(r.created_date).getTime();
  if (createdAt < shiftCutoff) return false;
  return !["done", "cancelled"].includes(r.status);
});
```

And in `filteredGroups`, matching is done via: `getLinkId(r.table) === group.id` (line 3840).

### 2.4 Mismatch Analysis

**The call chain for closing:**
1. `handleCloseTableClick` (line 2164): `sessionId = group.orders.map(o => getLinkId(o.table_session)).find(Boolean)`
2. Calls `onCloseTable(sessionId, identifier, group.id)` where `group.id` = tableId string
3. `handleCloseTable` (line 4139): receives `(tableSessionField, tableName, tableId)`
4. Calls `closeSession(sessionId, tableId)` — `tableId` is the string from `group.id`
5. `closeSession` (sessionHelpers.js line 177): `ServiceRequest.filter({ table: tableId })`

**The creation path** (PublicMenu): `ServiceRequest.create({ table: currentTableId, ... })` — also a string ID.

**So both sides use string IDs.** The filter key matches the create key.

**HOWEVER — Base44 link field semantics matter.** If `table` is defined as a **link field** in the B44 data model (which it likely is — it links to the Table entity), then:
- When you `create({ table: "abc123" })`, B44 may store it as a link reference internally
- When you `filter({ table: "abc123" })`, B44 should resolve the link comparison

**Possible root causes for filter returning 0:**

1. **Link field object format:** Base44 may store link fields as `{ id: "abc123" }` internally. If `ServiceRequest.filter({ table: tableId })` expects exact match but stored format differs, the server-side filter returns empty. This is the most likely cause.

2. **`table` vs `table_session` confusion:** Note that ServiceRequests are created with BOTH `table` AND `table_session` fields. The filter only queries `table`. If B44 has aliasing or if the field name changed, it could silently return empty.

3. **Timing/race:** `closeSession` closes orders first (lines 166-173 with delays), then tries to close requests. If the total time exceeds some B44 timeout, the second filter call might fail silently.

4. **Filter field not indexed:** Base44 might not index the `table` field on ServiceRequest for filter queries. The API could return an empty array instead of erroring.

### 2.5 Recommended Fix

**Approach 1 — Filter by partner + client-side match (safest):**
```jsx
// Replace lines 177-184 in sessionHelpers.js:
if (tableId) {
  // B44 link field filter may not match by raw ID.
  // Fetch all partner requests and filter client-side.
  const allRequests = await base44.entities.ServiceRequest.filter({
    partner: partnerId  // Need to add partnerId param to closeSession
  });
  const openTableRequests = allRequests.filter(r =>
    getLinkId(r.table) === String(tableId) &&
    !['done', 'cancelled'].includes(r.status)
  );
  for (let i = 0; i < openTableRequests.length; i++) {
    await base44.entities.ServiceRequest.update(openTableRequests[i].id, { status: 'done' });
    if (i < openTableRequests.length - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }
}
```

**NOTE:** This requires adding `partnerId` as a parameter to `closeSession()`. Signature becomes: `closeSession(sessionId, tableId, partnerId)`. All callers must be updated.

**Approach 2 — Use table_session instead of table:**
```jsx
if (tableId) {
  // Filter by session instead of table — sessionId is guaranteed to be a plain string
  const requests = await base44.entities.ServiceRequest.filter({
    table_session: sessionId
  });
  const openRequests = requests.filter(r => !['done', 'cancelled'].includes(r.status));
  // ... same update loop
}
```

**NOTE:** This assumes ServiceRequests have `table_session` field populated. Per the PublicMenu create code (line 2995), they do: `table_session: tableSession?.id`. However, the `?.id` means it could be null if no session existed when the request was created.

**RECOMMENDATION:** Approach 1 is safest. Approach 2 is cleaner but has the null-session edge case.

### 2.6 Regression Risks

1. **Approach 1 over-fetches:** Fetching ALL partner ServiceRequests just to close a few is wasteful. In a restaurant with many concurrent tables, this could be 50+ requests. Mitigated by this being a one-time operation (table close), not polling.

2. **closeSession signature change:** Adding `partnerId` parameter requires updating all callers:
   - `confirmCloseTable` (SOM line 4151)
   - `sessionCleanupJob.js` (if it calls closeSession)
   - Any future callers

3. **Race with SOM polling:** Even after `closeSession` updates ServiceRequests to `done`, SOM's `refetchRequests()` is called (line 4155). If the refetch completes before B44's write is committed, stale data could appear for one poll cycle. The 120ms batch delay helps but doesn't guarantee consistency.

---

## Section 3 — Fix C: orderGroups groups by tableId not table_session (#347)

### 3.1 Verbatim: `orderGroups` (lines 3740-3789)

```jsx
const orderGroups = useMemo(() => {
  if (isKitchen) return null;
  
  const groups = [];
  const tableGroups = {};
  
  visibleOrders.forEach(o => {
    if (o.order_type === 'hall') {
      const tableId = getLinkId(o.table);         // <--- groups by TABLE, not session
      if (!tableId) return;
      if (!tableGroups[tableId]) {
        const tableName = tableMap[tableId]?.name || '?';
        tableGroups[tableId] = {
          type: 'table',
          id: tableId,                             // <--- group.id = tableId
          displayName: tableName,
          orders: [],
        };
        groups.push(tableGroups[tableId]);
      }
      tableGroups[tableId].orders.push(o);
    } else {
      groups.push({
        type: o.order_type,
        id: o.id,
        displayName: o.order_type === 'pickup' 
          ? `СВ-${o.order_number || o.id.slice(-3)}` 
          : `ДОС-${o.order_number || o.id.slice(-3)}`,
        orders: [o],
      });
    }
  });

  activeRequests.forEach((req) => {
    const tableId = getLinkId(req.table);
    if (!tableId) return;
    if (!tableGroups[tableId]) {
      const tableName = tableMap[tableId]?.name || '?';
      tableGroups[tableId] = {
        type: 'table',
        id: tableId,
        displayName: tableName,
        orders: [],
      };
      groups.push(tableGroups[tableId]);
    }
  });
  
  return groups;
}, [visibleOrders, tableMap, isKitchen, activeRequests]);
```

**Bug confirmed:** Grouping key is `getLinkId(o.table)` — a tableId. When a table is re-opened (new TableSession#2 for the same physical table), orders from both sessions are merged into one group. The waiter sees a mix of old completed orders and new active ones.

### 3.2 Grep: table_session used as grouping key?

```
$ grep -n "table_session" pages/StaffOrdersMobile/260415-00\ StaffOrdersMobile\ RELEASE.jsx
1584:  const tableSessionId = getLinkId(order.table_session);
2165:    const sessionId = group.orders.map((order) => getLinkId(order.table_session)).find(Boolean);
3571:      // P0-3: For hall orders, require table_session (filter out legacy/orphan orders)
3572:      if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false;
```

**Confirmed: `table_session` is NEVER used as a grouping key.** It's only used for:
- Extracting session ID for close-table flow (line 2165)
- Filtering out legacy orders without sessions (line 3572)

### 3.3 Approach Recommendation

**Option A: Composite key `${tableId}:${sessionId}`**
```jsx
const sessionId = getLinkId(o.table_session);
const groupKey = `${tableId}:${sessionId}`;
// Group stores: id: tableId (for backwards compat with request matching)
// + sessionId field for close-table
```
- Pros: Clean separation. Each session is its own card.
- Cons: Breaks `activeRequests` matching (line 3773-3786) which matches by `tableId`. Need to also attach requests to the right session group. `displayName` becomes ambiguous: "Стол 5" appears twice.
- **Major complication:** `computeTableStatus`, `filteredGroups`, `tabCounts`, `v2SortedGroups`, `finalGroups` — ALL reference `group.id` and compare with `getLinkId(r.table)`. Changing `group.id` from `tableId` to a composite key breaks ~10 downstream consumers.

**Option B: Filter visibleOrders to exclude closed-session orders**
```jsx
// In activeOrders useMemo (lines 3565-3589), add:
// Skip orders from closed sessions
if (o.table_session_status === 'closed') return false;
```
- Cons: Requires B44 to expose `table_session.status` as a resolved field on Order. Likely not available (link fields are just IDs in B44).

**Option C: Group by tableId, but exclude orders from closed sessions**
```jsx
visibleOrders.forEach(o => {
  if (o.order_type === 'hall') {
    const tableId = getLinkId(o.table);
    if (!tableId) return;
    // Skip orders whose status is 'closed' — they belong to a completed session
    if (o.status === 'closed') return;
    // ... rest unchanged
  }
});
```
- Pros: Minimal change (~2 lines). No new queries.
- Cons: Relies on `closeSession` having set all orders to `closed`. If the close was partial, some old orders leak through. Also hides closed orders from the Completed tab view entirely.

**RECOMMENDATION: Option C (modified) — exclude `closed` status orders from Active grouping, but include them for Completed tab.**

The cleanest version that preserves both tabs:
```jsx
visibleOrders.forEach(o => {
  if (o.order_type === 'hall') {
    const tableId = getLinkId(o.table);
    if (!tableId) return;
    if (!tableGroups[tableId]) {
      const tableName = tableMap[tableId]?.name || '?';
      tableGroups[tableId] = {
        type: 'table',
        id: tableId,
        displayName: tableName,
        orders: [],
      };
      groups.push(tableGroups[tableId]);
    }
    tableGroups[tableId].orders.push(o);
  }
  // ... no change here — all orders go into groups
});
```

Actually, the current code already works correctly IF:
- `closeSession` closes all orders → `hasActiveOrder = false`
- `closeSession` closes all requests → `hasActiveRequest = false`
- All finish-stage orders get `status: 'closed'` → `hasServedButNotClosed = false`

Then `filteredGroups` naturally puts the group in Completed.

**The REAL problem is the re-open scenario.** When TableSession#2 opens for the same table:
- New orders (from session#2) have `status: 'new'` → `hasActiveOrder = true` → group is Active
- Old orders (from session#1) have `status: 'closed'` → don't affect Active/Completed classification
- But old orders still appear in the group's `orders` array → waiter sees them mixed in

**Refined fix for re-open scenario:**

In `activeOrders` filter (line 3570), orders with `status === 'closed'` already pass through IF they're in a finish stage:
```jsx
if (stage.internal_code === 'finish') {
  return o.status !== 'cancelled';  // <--- 'closed' passes through!
}
```

**This is the root cause for Fix C.** Line 3583 allows `closed` orders through the `activeOrders` filter. They then enter `visibleOrders` and get grouped by tableId.

**FIX: Add `o.status !== 'closed'` to the finish-stage filter:**
```jsx
if (stage.internal_code === 'finish') {
  return o.status !== 'cancelled' && o.status !== 'closed';
}
```

This would exclude closed orders from `activeOrders` entirely. They wouldn't appear in any group. The Completed tab would only show groups where all remaining orders are in finish stage but not yet closed (served-but-not-closed pattern from S267).

### 3.4 UX Impact: Re-open Scenario

**Current behavior (buggy):**
1. Waiter closes Table 5 (session#1). All orders become `status: 'closed'`.
2. Guest scans QR again → new session#2 opens. New order placed.
3. SOM shows Table 5 in Active tab with: new order (from session#2) + ALL old closed orders (from session#1).
4. Waiter sees a confusing mix of old and new orders.

**After Fix C (proposed):**
1. Same flow. After step 3:
2. `activeOrders` filter excludes `closed` orders. Only the new order from session#2 appears.
3. Table 5 group shows only the new session's orders. Clean view.
4. Old session#1 orders are gone from both tabs (they're filtered out at the `activeOrders` level).

**Open question:** Should closed-session orders appear in the Completed tab at all? Currently: yes (they pass the finish-stage filter). After fix: no (they're filtered out). If the business requirement is to show historical orders from closed sessions, a different approach is needed (like keeping them but in a separate "History" section).

### 3.5 Regression Risks

1. **Completed tab becomes empty faster:** After the fix, a closed table's orders are excluded entirely. The Completed tab would only show tables with served-but-not-yet-closed orders. Once all orders are closed (by closeSession), the group disappears from both tabs. This changes the UX: waiter loses the "recently closed tables" view.

2. **Bill summary data loss:** The bill summary section (lines 743-758) shows billing info for the table group. If closed orders are excluded from the group, the bill total would be incorrect (only showing unclosed orders' amounts). This could be a significant UX regression for financial tracking.

3. **Tab count spike during close:** Between `closeSession` starting (orders closing one by one with 120ms delay) and finishing, the tab counts would fluctuate as individual orders transition.

### 3.6 Test Plan

1. **Single session lifecycle:** Create table → add orders → serve all → close table. Verify: group moves to Completed, then disappears after full close. Tab counts correct.
2. **Re-open scenario:** Close table → immediately open new session for same table → add new order. Verify: Active tab shows ONLY new session's orders. No old closed orders mixed in.
3. **Partial close failure:** Close table but simulate one order failing to close (e.g., network error mid-batch). Verify: the failed order still shows correctly, doesn't cause UI confusion.

---

## Section 4 — Prompt Clarity Rating

**Rating: 4/5**

Strengths:
- Clear scope delineation (3 fixes with hypotheses)
- Line number references for key code blocks
- Specific deliverable structure

Unclear areas:
1. **B44_Entity_Schemas.md v3.0 referenced but not available.** The entity schema for ServiceRequest (link field types, indexes) is critical for Fix B diagnosis. Without it, I'm speculating on whether `table` is a link field vs string field.
2. **BACKLOG.md #347 and #348 not available.** Can't verify the exact bug description and acceptance criteria.
3. **"ServiceRequest.filter returns 0" claim (Fix B):** Is this from production logs, manual testing, or hypothesis? The exact reproduction steps would help diagnose. The prompt says "In prod returns 0" but doesn't provide evidence (B44 API logs, console output).
4. **Re-open table flow details:** How does the guest trigger a new session? Is it automatic (scan QR → getOrCreateSession finds no open session → creates new)? Or does the waiter manually open? This affects Fix C's approach.

---

## Section 5 — Risks Outside Scope

1. **`activeOrders` finish-stage filter allows closed orders through (line 3583)** — This is the root cause of Fix C and partially of Fix A. Currently in scope but the fix here affects ALL downstream consumers (filteredGroups, tabCounts, sortedGroups, v2SortedGroups).

2. **No invalidation of ServiceRequest cache after close.** `confirmCloseTable` calls `refetchRequests()` (line 4155) but this is a polling refetch, not a cache invalidation. If the poll returns before the B44 write commits, stale data persists for one interval.

3. **`sessionCleanupJob` compatibility.** The cleanup job (referenced in BUGS.md SOM-SM-012) calls `closeSession` too. If Fix B changes the `closeSession` signature (adding `partnerId`), the cleanup job must be updated. Could silently break automated cleanup.

4. **`handleCloseTableClick` extracts sessionId from first order (line 2165).** If a table group has orders from multiple sessions (Fix C's bug scenario), `group.orders.map(o => getLinkId(o.table_session)).find(Boolean)` grabs the FIRST non-null session ID — which could be from the old closed session, not the current one. Closing the wrong session would be a P0.

5. **Toast messages are hardcoded Russian (lines 4152, 4157, 4167).** `showToast("Стол закрыт")`, `showToast("Ошибка при закрытии")`, `showToast('Нет этапа "Завершён"')` — all violate i18n rules. Not in scope for B2 but a standing P1.

---

## Summary

| Fix | Root Cause | Recommended Approach | Complexity | Dependencies |
|-----|-----------|---------------------|------------|--------------|
| A (filteredGroups) | No TableSession.status check | Option C (all-closed override) OR wait for Fix B | Low (2-3 lines) | Fix B may resolve this |
| B (ServiceRequest.filter) | Likely B44 link field filter mismatch | Filter by partner + client-side getLinkId match | Medium (10 lines + signature change) | closeSession signature |
| C (orderGroups session) | `activeOrders` passes closed orders through finish-stage check (line 3583) | Exclude `o.status === 'closed'` from finish-stage passthrough | Low (1 line) | May affect Completed tab UX |

**Key insight:** Fixes A, B, and C are interconnected. Fix B is the most critical — if ServiceRequest.filter works correctly, Fix A may be unnecessary. Fix C's root cause is actually in `activeOrders` (line 3583), not in `orderGroups` itself. The three fixes should be implemented in order: B → C → A (verify if still needed).
