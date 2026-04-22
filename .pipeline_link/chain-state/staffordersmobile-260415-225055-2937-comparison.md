# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260415-225055-2937
Date: 2026-04-15
Comparator: Claude Code (Opus 4.6)

## Source Files
- CC findings: `pipeline/cc-analysis-task-260415-215028-004.txt` (558 lines)
- Codex findings: `pipeline/codex-findings-pssk-som-b2-codex-v1.md` (514 lines)

---

## Agreed (both found)

### 1. [P0] TableSession entity is NEVER queried in SOM
Both CC and Codex confirmed via grep that `TableSession` has zero hits in SOM (4579 lines). SOM relies entirely on order statuses + service request statuses to classify Active/Completed. Both agree this is the structural root cause of the "closed table stays in Active" bug.

### 2. [P0] ServiceRequest.filter({ table: tableId }) likely returns 0 (Fix B root cause)
Both CC and Codex identified B44 link field format mismatch as the most likely cause. Both traced the full call chain: `handleCloseTableClick → onCloseTable → handleCloseTable → closeSession → ServiceRequest.filter({ table: tableId })`. Both confirmed creation format uses string ID (`currentTableId`), but B44 internal storage may differ (link object `{ id: "..." }`). Both agree this is the primary reason `hasActiveRequest` stays true after close-table.

### 3. [P1] activeOrders line 3583 passes closed orders through finish-stage filter
Both CC and Codex identified that `o.status !== 'cancelled'` at line 3583 allows `status='closed'` orders through `activeOrders`. CC mentions this in Section 5 (Risks Outside Scope, item 1) and in Fix C.1 analysis. Codex calls it "the root cause for Fix C" (Section 3.3). Both agree: `closed` orders should be excluded from `activeOrders`.

### 4. [P1] handleCloseTableClick grabs wrong sessionId (line 2165)
Both CC and Codex identified that `group.orders.map(o => getLinkId(o.table_session)).find(Boolean)` can return a closed session's ID when orders from multiple sessions coexist. CC mentions in Section 3.2 trace. Codex calls this a P0 in Section 5, item 4. Both agree the session selection is unreliable.

### 5. [P1] tabCounts must use same override logic as filteredGroups
Both explicitly flag the desync risk if `filteredGroups` and `tabCounts` use different classification logic. CC: Section 1.6 item 1. Codex: Section 1.5 item 1.

### 6. [INFO] orderGroups groups by tableId, not table_session
Both confirmed grouping key is `getLinkId(o.table)` and `table_session` is never used for grouping. Both analyzed the same verbatim code block (lines 3740-3789).

### 7. [INFO] Fix priority: B is most critical
Both CC and Codex agree Fix B is the lowest-hanging fruit and may resolve the immediate symptom alone. CC: "B → A → C". Codex: "B → C → A (verify if still needed)".

### 8. [INFO] Prompt clarity 4/5, B44 schema missing
Both rated prompt clarity 4/5 and flagged the missing `B44_Entity_Schemas.md v3.0` as the main gap.

---

## CC Only (Codex missed)

### 9. [P2] Race condition / invalidation gap (CC Section 1.4)
CC explicitly analyzed the timing window between `closeSession()` completing and `refetchOrders()`/`refetchRequests()` completing, noting that sequential await before refetch makes this minimal but other SOM instances see stale data until next poll.
**Validity:** Solid observation. Not actionable for B2 (no websocket planned), but worth documenting.
**Accept as INFO note.**

### 10. [P2] Multiple open sessions per table edge case (CC Section 1.5)
CC flagged that `openSessionByTableId` map assumes at most one open session per table. If enforcement fails, the map would silently drop extra sessions.
**Validity:** Valid edge case. openSession/closeSession should enforce uniqueness, but no validation exists in the map.
**Accept as INFO note — add defensive comment.**

### 11. [APPROACH] Fix C: CC recommends filtering closed-session orders inside orderGroups using `openSessionIds` from Fix A query
CC's Option C for Fix C: keep grouping by tableId, but skip orders where `sessionId && !openSessionIds.has(sessionId)` inside orderGroups forEach. This requires Fix A's TableSession data.
**Validity:** Depends on Fix A existing. More robust than status-only check but couples Fix C to Fix A.

---

## Codex Only (CC missed)

### 12. [P1] Bill summary data loss if closed orders excluded from orderGroups (Codex Section 3.5, item 2)
Codex flagged that bill summary (lines 743-758) uses `group.orders` for totals. If closed orders are excluded from the group, bill amounts would be wrong — only showing unclosed orders.
**Validity:** CRITICAL insight. The Cowork spec for Fix C.1 says to exclude closed orders from `activeOrders` (line 3583), NOT from `orderGroups` itself. The bill summary on Completed tab cards must still show full amounts. This validates the Cowork approach: filter at `activeOrders` level, not at `orderGroups` level.
**Accept — confirms Cowork's Fix C.1 approach is correct.**

### 13. [P2] Completed tab becomes empty after full close (Codex Section 3.5, item 1)
Codex noted that after excluding closed orders from `activeOrders`, a fully-closed table's group would have zero orders in the group → disappears from both tabs. The Completed tab loses "recently closed tables" visibility.
**Validity:** Partially valid but RESOLVED by Fix A. The `openSessionByTableId` override forces tables without open sessions into Completed tab regardless of order content. The activeRequests-based group creation (orderGroups lines 3773-3786) also keeps request-only groups alive. With Fix A + Fix C.1 combined, Completed tab still shows closed tables.
**Accept as context — no action needed beyond Fix A.**

### 14. [APPROACH] Fix B: Codex recommends Approach 1 — filter by partner + client-side match
Codex suggests fetching ALL partner ServiceRequests and matching client-side with `getLinkId(r.table) === String(tableId)`. Requires adding `partnerId` parameter to `closeSession`.
**Validity:** Safest against B44 link field quirks, but over-fetches and requires signature change to `closeSession`. The Cowork spec explicitly says "do NOT change signature of closeSession(sessionId, tableId)". Also, `partnerId` is not available in `sessionHelpers.js` scope without the signature change.
**Reject — violates Cowork constraint. Use table_session filter with fallback (CC approach / Cowork spec).**

### 15. [APPROACH] Fix A: Codex recommends Option C (all-closed check) or "wait for Fix B"
Codex suggests checking if ALL orders are closed/cancelled as a simpler alternative to useQuery for TableSession. Also suggests Fix A may not be needed if Fix B works.
**Validity:** Option C is fragile — it fails if closeSession partially closes orders, or if new non-order signals are added in future. The Cowork spec explicitly requires useQuery for TableSession as "explicit source of truth". Fix A is defense-in-depth and handles the broader case where any future signal fails to close properly.
**Reject for Option C — accept useQuery approach per Cowork spec and CC recommendation.**

---

## Disputes (disagree)

### D1: Fix B approach — table_session filter vs partner-wide fetch

| Aspect | CC (+ Cowork spec) | Codex |
|--------|-------------------|-------|
| **Approach** | Filter by `table_session: sessionId`, fallback to `table: tableId` | Filter by `partner: partnerId` + client-side match |
| **Signature** | Keep `closeSession(sessionId, tableId)` unchanged | Add `partnerId` as 3rd parameter |
| **Edge case** | Fallback handles legacy requests without `table_session` | Client-side `getLinkId` handles link field format |
| **Cost** | 1-2 B44 API calls (primary + optional fallback) | 1 API call but returns ALL partner requests |

**Resolution:** CC approach wins. Reasons:
1. Cowork spec explicitly forbids changing `closeSession` signature.
2. `table_session` filter is semantically correct (close THIS session's requests, not all table requests).
3. Fallback to `table: tableId` handles legacy requests.
4. No over-fetching.

### D2: Fix C scope — activeOrders level vs orderGroups level

| Aspect | CC | Codex |
|--------|-----|-------|
| **Where to filter** | Inside `orderGroups` forEach using `openSessionIds` from Fix A | At `activeOrders` line 3583 (exclude `o.status === 'closed'`) |
| **Dependencies** | Requires Fix A's TableSession query | Standalone (uses existing order status) |
| **Bill impact** | Closed orders still in group (for bill summary) | Closed orders excluded entirely |

**Resolution:** BOTH are needed, at different levels:
1. **Fix C.1 (line 3583)** — Codex is correct: exclude `closed` from `activeOrders` finish-stage passthrough. This prevents closed orders from appearing in Active tab groups. This aligns with Cowork spec.
2. **Fix A.5 (filteredGroups override)** — CC is correct: the session-based override provides defense-in-depth. Even if order statuses are inconsistent, session status is authoritative.
3. **orderGroups itself stays unchanged** — Neither CC nor Codex changes are applied at the orderGroups level. The Cowork spec adds `openSessionId` field to groups (Fix A.4) but doesn't change the grouping logic.

### D3: Fix A necessity — "may not be needed" vs "required defense-in-depth"

| Aspect | CC | Codex |
|--------|-----|-------|
| **Position** | Required — Option A (useQuery) is most robust | Optional — Fix B may resolve; Option C (all-closed check) suffices |
| **Cost** | +1 B44 query per polling interval | Zero additional queries |

**Resolution:** Fix A is REQUIRED per Cowork spec. Reasons:
1. Cowork explicitly specifies useQuery for TableSession as "explicit source of truth".
2. Defense-in-depth against any future signal failure (not just ServiceRequests).
3. Enables `group.openSessionId` for Fix C.2 (handleCloseTableClick session selection).
4. The additional query cost is minimal (returns only open sessions, small set).

---

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

### Priority 1: Fix B — sessionHelpers.js line 177

1. **[P0] Replace ServiceRequest.filter key from `table` to `table_session`**
   - Source: **Agreed** (both identified the filter mismatch)
   - Approach: CC + Cowork spec (filter by `table_session: sessionId`, fallback to `table: tableId`)
   - File: `components/sessionHelpers.js` line 177
   - Change: Replace `ServiceRequest.filter({ table: tableId })` with `ServiceRequest.filter({ table_session: sessionId })`, add fallback if 0 results
   - Reject Codex approach (partner-wide fetch + signature change)

### Priority 2: Fix C.1 — activeOrders exclude closed orders (line 3583)

2. **[P1] Exclude `status='closed'` from finish-stage passthrough in activeOrders**
   - Source: **Agreed** (both identified line 3583 as root cause)
   - Approach: Codex + Cowork spec (add `&& o.status !== 'closed'` to finish-stage return)
   - File: `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` line 3583
   - Change: `return o.status !== 'cancelled';` → `return o.status !== 'closed' && o.status !== 'cancelled';`

### Priority 3: Fix C.2 — handleCloseTableClick correct sessionId (line 2165)

3. **[P1] Use openSessionId from group (Fix A.4) with fallback to non-closed order**
   - Source: **Agreed** (both flagged wrong sessionId selection)
   - Approach: Cowork spec (prefer `group.openSessionId`, fallback to open-order search)
   - File: `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` lines 2164-2171
   - Change: Replace `find(Boolean)` with `group.openSessionId || fallback-to-non-closed-order`

### Priority 4: Fix A.1 — useQuery for open TableSessions

4. **[P1] Add useQuery for TableSession.filter({ status: 'open' })**
   - Source: **CC** (Codex deferred to Fix B; Cowork spec requires it)
   - File: `pages/StaffOrdersMobile/260415-00 StaffOrdersMobile RELEASE.jsx` ~line 3525
   - Change: New `useQuery({ queryKey: ["openSessions", partnerId], ... })` after serviceRequests query

### Priority 5: Fix A.2 — derived maps

5. **[P1] Create openSessionByTableId map and openSessionIds set**
   - Source: **CC** + Cowork spec
   - File: same, after the new useQuery
   - Change: Two new `useMemo` blocks

### Priority 6: Fix A.3 — invalidate openSessions after close-table

6. **[P1] Add queryClient.invalidateQueries(["openSessions"]) in confirmCloseTable**
   - Source: **CC** + Cowork spec
   - File: same, in `confirmCloseTable` block (~line 4146-4200)
   - Change: Add one `invalidateQueries` call alongside existing ones

### Priority 7: Fix A.4 — openSessionId in orderGroups

7. **[P1] Add openSessionId field to table groups in orderGroups mapping**
   - Source: **CC** + Cowork spec (enables Fix C.2)
   - File: same, in `orderGroups` useMemo (~line 3740-3789)
   - Change: Add `openSessionId: openSessionByTableId[tableId]?.id || null` to table group objects

### Priority 8: Fix A.5 — filteredGroups session override

8. **[P1] Add session-first override at top of filteredGroups filter callback**
   - Source: **Agreed** (both propose override; CC uses useQuery, Codex uses all-closed check)
   - Approach: CC + Cowork spec (use `openSessionByTableId`)
   - File: same, lines 3832-3850
   - Change: If `group.type === 'table' && !openSessionByTableId[group.id]` → force to Completed

### Priority 9: Fix A.6 — tabCounts session override

9. **[P1] Mirror filteredGroups override in tabCounts**
   - Source: **Agreed** (both flagged desync risk)
   - File: same, lines 3852-3871
   - Change: Same session-first override logic as filteredGroups

---

## Regression Notes (from both reviewers)

1. **Bill summary preservation:** Closed orders remain in `orderGroups` (Fix C.1 filters at `activeOrders` level, not `orderGroups`). Bill totals on Completed tab cards stay correct. (Codex concern #12 — addressed by design)
2. **Completed tab visibility:** Fix A override forces no-session tables to Completed regardless of order content. (Codex concern #13 — resolved)
3. **Non-table groups unaffected:** `group.type !== 'table'` → session override skipped → existing logic applies. (Both confirmed)
4. **Kitchen mode unaffected:** `isKitchen` returns null from `orderGroups`. (Codex confirmed)
5. **closeSession signature unchanged:** `closeSession(sessionId, tableId)` — both params stay. (Cowork constraint)
6. **Multiple open sessions per table:** `openSessionByTableId` map takes last entry. Should be rare; add note. (CC concern #10)

---

## Summary

| Category | Count | Details |
|----------|-------|---------|
| **Agreed** | 8 items | Core diagnosis, root causes, priority ordering, prompt clarity |
| **CC only** | 3 items | Race condition (INFO), multiple sessions edge (INFO), orderGroups filter approach (superseded) |
| **Codex only** | 4 items | Bill summary risk (accepted), Completed tab empty (resolved by Fix A), partner-wide fetch (rejected), Option C for Fix A (rejected) |
| **Disputes** | 3 items | All resolved — CC/Cowork approach wins on Fix B (table_session filter), both-needed on Fix C scope, Fix A required per spec |
| **Total fixes to apply** | 9 | Fix B (1) + Fix C (2) + Fix A (6 sub-steps) |

### Confidence Assessment
- **Fix B:** HIGH confidence — both reviewers agree on root cause, approach aligns with Cowork spec
- **Fix C.1:** HIGH confidence — both reviewers identified line 3583, minimal 1-line change
- **Fix C.2:** MEDIUM confidence — depends on Fix A.4 being correct; fallback logic covers edge cases
- **Fix A (all sub-steps):** MEDIUM-HIGH confidence — standard useQuery + useMemo pattern, well-specified in Cowork; main risk is B44 TableSession entity availability (needs grep verification)
