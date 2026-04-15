# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260415-225055-2937
Mode: CC-Only (v2)
Date: 2026-04-15

## Disputes Analyzed
Total: 3 disputes from Comparator

### Dispute 1: Fix B approach — table_session filter vs partner-wide fetch

**CC Solution:** Filter by `table_session: sessionId` (primary), fallback to `table: tableId` (legacy). No signature change to `closeSession(sessionId, tableId)`.

**Codex Solution:** Filter by `partner: partnerId` + client-side `getLinkId(r.table) === String(tableId)` match. Requires adding `partnerId` as 3rd parameter to `closeSession`.

**CC Analysis:**
I verified the code at `sessionHelpers.js:158` — the function signature is `closeSession(sessionId, tableId)`. The `sessionId` parameter is already available at line 158 and used at line 159 (`TableSession.update(sessionId, ...)`). Using `table_session: sessionId` as filter key is semantically correct — it scopes to the exact session being closed, not all historical requests on the table.

Codex's approach is technically safer against B44 link-field quirks (client-side `getLinkId` normalization), but it:
1. **Violates Cowork constraint** — the spec explicitly says "do NOT change signature of closeSession".
2. **Over-fetches** — fetching ALL partner ServiceRequests just to close 1-3 is wasteful.
3. **Requires caller updates** — `confirmCloseTable` and potentially `sessionCleanupJob` must pass `partnerId`.

CC's fallback to `table: tableId` handles the legacy edge case (requests created before `table_session` was populated), providing the same robustness without the signature change.

**Verdict:** CC
**Reasoning:** Cowork spec forbids signature change; `table_session: sessionId` is semantically correct and scoped; fallback covers legacy requests.

### Dispute 2: Fix C scope — activeOrders level vs orderGroups level

**CC Solution:** Filter closed-session orders inside `orderGroups` forEach using `openSessionIds` from Fix A query. This couples Fix C to Fix A.

**Codex Solution:** Exclude `o.status === 'closed'` at `activeOrders` line 3583 (the finish-stage passthrough). Standalone, no dependency on Fix A.

**CC Analysis:**
Both approaches address different aspects of the same problem:

1. **Fix C.1 (line 3583)** — Codex is correct here. The finish-stage branch `return o.status !== 'cancelled'` at line 3583 lets `status='closed'` orders into `activeOrders`. This is a clear bug: closed orders should not be considered "active" for any purpose. The one-line change (`return o.status !== 'closed' && o.status !== 'cancelled'`) is minimal, standalone, and correct. Verified: `hasServedButNotClosed` at line 3842 already checks `o.status !== 'closed'`, so consistency is maintained.

2. **Fix A.5 (filteredGroups override)** — CC is correct here. The session-based override provides defense-in-depth that goes beyond order-status checks. Even if some signal is inconsistent (e.g., partial close failure), the TableSession status is authoritative.

3. **Bill summary preservation** — Codex raised a critical point (#12 in comparison): if closed orders were excluded from `orderGroups` itself, bill totals would break. The Cowork spec correctly places the filter at `activeOrders` level (Fix C.1), NOT at `orderGroups` level. Both CC and Codex agree `orderGroups` grouping stays unchanged (all orders in group, including closed). This is the right design.

The two approaches are **complementary, not competing**. Fix C.1 is the immediate correctness fix (wrong orders in active set). Fix A.5 is the architectural safety net (session as ground truth).

**Verdict:** Compromise — both needed at different levels
**Reasoning:** Fix C.1 (Codex approach) at activeOrders line 3583 for correctness; Fix A.5 (CC approach) at filteredGroups for defense-in-depth. orderGroups unchanged to preserve bill summary.

### Dispute 3: Fix A necessity — "may not be needed" vs "required defense-in-depth"

**CC Solution:** Required. Add `useQuery` for `TableSession.filter({ status: 'open' })` as explicit source of truth. Provides `openSessionByTableId` for filteredGroups/tabCounts override and `openSessionId` for handleCloseTableClick.

**Codex Solution:** Optional. Fix B may resolve the root cause. If needed, Option C (check if all orders are closed/cancelled) suffices — zero additional queries.

**CC Analysis:**
Codex's Option C (`group.orders.every(o => o.status === 'closed' || o.status === 'cancelled')`) is fragile:
1. **Partial close failure** — if `closeSession` closes 4 of 5 orders and fails, Option C sees one unclosed order → table stays in Active. But the session IS closed (TableSession.status='closed' was set first at line 159, before order bulk-close). The session-based override correctly moves it to Completed.
2. **Future signals** — if new entities are added to the "table activity" model (beyond orders and requests), Option C won't account for them. Session status is the single source of truth by design.
3. **Fix C.2 dependency** — `handleCloseTableClick` needs `group.openSessionId` to pick the correct session. This field comes from Fix A.4 (`openSessionByTableId[tableId]?.id`). Without Fix A, Fix C.2's fallback must parse orders (which is the exact bug we're fixing).

The Cowork spec explicitly requires `useQuery` for TableSession as "explicit source of truth". The additional query cost is minimal (returns only open sessions, typically 1-10 per restaurant).

Codex's concern about "wait for Fix B" has merit in isolation — Fix B might resolve the immediate symptom. But the task explicitly defines all three fixes as part of B2 scope, and the architectural benefit of session-as-ground-truth is worth the marginal query cost.

**Verdict:** CC
**Reasoning:** Cowork spec requires it; defense-in-depth against partial failures; enables Fix C.2's `group.openSessionId`; Option C is fragile against partial close and future signals.

## Resolution Summary

| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Fix B: table_session filter vs partner-wide fetch | CC | Cowork forbids signature change; table_session is semantically correct; fallback covers legacy |
| 2 | Fix C: activeOrders level vs orderGroups level | Compromise | Fix C.1 at activeOrders (Codex), Fix A.5 at filteredGroups (CC); both needed, different levels |
| 3 | Fix A necessity | CC | Cowork requires it; defense-in-depth; enables Fix C.2; Option C fragile |

## Updated Fix Plan

Based on discussion results, the disputed items are resolved as follows. Agreed items from Comparator remain unchanged.

1. **[P0] Fix B — sessionHelpers.js line 177** — Source: discussion-resolved (D1: CC approach) — Replace `ServiceRequest.filter({ table: tableId })` with `ServiceRequest.filter({ table_session: sessionId })` + fallback to `table: tableId` if 0 results. No signature change.

2. **[P1] Fix C.1 — activeOrders line 3583** — Source: discussion-resolved (D2: Codex approach confirmed) — Change `return o.status !== 'cancelled'` to `return o.status !== 'closed' && o.status !== 'cancelled'`. One-line change. Bill summary unaffected (operates on `group.orders` which includes all orders).

3. **[P1] Fix C.2 — handleCloseTableClick lines 2164-2171** — Source: agreed (no dispute) — Use `group.openSessionId` (from Fix A.4) with fallback to non-closed order's table_session. Dependency on Fix A.4 acknowledged.

4. **[P1] Fix A.1-A.6 — useQuery + overrides** — Source: discussion-resolved (D3: CC approach, required) — Full Fix A implementation per Cowork spec: useQuery for open TableSessions, derived maps, invalidation in confirmCloseTable, openSessionId in orderGroups, filteredGroups/tabCounts session-first override.

## Skipped (for Arman)

No items skipped. All 3 disputes resolved technically with clear reasoning. Both CC and Codex approaches are well-understood; the selected approaches align with Cowork spec constraints and provide the most robust solution.
