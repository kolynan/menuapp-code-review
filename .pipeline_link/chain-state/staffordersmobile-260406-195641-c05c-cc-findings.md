# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260406-195641-c05c

## Findings

### Fix 1 — Reorder sections to lifecycle order

1. [P1] Section order: Ready renders before InProgress in all 3 blocks — must swap.
   - **Block 1 (compact, lines 616-662):** Render order is: Requests (590) → New (616) → Ready (626) → InProgress (636) → Served (664). The InProgress block (636-662) must move BEFORE the Ready block (626-634).
   - **Block 2 (expanded, lines 1195-1276):** Same pattern: Requests (1195) → New (1221) → Ready (1231) → InProgress (1241) → Served (1269). Move InProgress (1241-1267) before Ready (1231-1239).
   - **Block 3 (compact table section, lines 2134-2142):** Order is Requests (2134) → New (2136) → Ready (2138) → InProgress (2140) → Served (2142). Move InProgress (2140) before Ready (2138).
   - **Block 3 (legacy non-table, lines 2150-2152):** Order is New (2150) → Ready (2151) → InProgress (2152). Move InProgress (2152) before Ready (2151).
   FIX: In each block, cut the InProgress section and paste it before the Ready section. No logic changes needed — pure JSX reorder.

### Fix 2 — Active/passive section visual weight

2. [P1] Active sections (Requests, New, Ready) need colored background pill on headers; passive sections (InProgress, Served) need muted opacity.
   - **Active headers currently:** `text-violet-600` (Requests), `text-blue-600` (New), `text-green-600` (Ready). Add wrapping `<span className="bg-[color]-50 rounded-md px-2 py-0.5">` around text content.
   - **Passive headers currently:** `text-amber-600` (InProgress) → change to `text-amber-400 opacity-60`. `text-slate-500` (Served) → add `opacity-60`.
   - **InProgress content area:** Add `opacity-60` to the content wrapper div when InProgress section is expanded.
   - Must apply in ALL THREE render blocks (compact lines ~590-670, expanded lines ~1195-1276, compact-table/legacy lines ~2134-2152).
   FIX: Wrap active section header text in bg pill span. Change passive header classes. Add opacity-60 to passive content areas.

### Fix 3 — Dual metric in section headers

3. [P1] Section headers show single count; need dual metric "N гостей · N блюд".
   - Add `pluralRu(n, one, few, many)` helper function OUTSIDE the component (above `function OrderGroupCard`).
   - **New section headers** (3 blocks): Replace `countRows(newRows, newOrders.length)` with `${newOrders.length} ${pluralRu(...guests)} · ${countRows(newRows, newOrders.length)} ${pluralRu(...dishes)}`.
   - **Ready section headers** (3 blocks): Same pattern with `readyOrders.length` for guests.
   - **InProgress section headers** (3 blocks): Use `inProgressOrders.length` for guests, existing reduce value for dishes.
   - **Legacy block (lines 2150-2151):** Uses `newOrders.length` and `readyOrders.length` directly — these are order counts (= guest counts). Add dish count via items or keep order count as both guest and dish proxy. NOTE: Legacy uses `renderLegacyOrderCard` not `renderHallRows`, so no `countRows`. Use `newOrders.length` as fallback dish count or compute from itemsByOrder.
   - **Served section:** Keep simple count (do NOT add dual metric per spec).
   FIX: Add pluralRu helper. Update all section header strings in 3 blocks. For legacy block, use order count as approximate dish count or sum items from itemsByOrder.

4. [P2] Legacy non-table block (line 2150-2152) uses hardcoded Unicode strings for headers, not HALL_UI_TEXT constants — dual metric format strings will need to be built inline using the same Unicode prefix + appended metrics.
   FIX: Build the dual metric string inline for legacy headers, matching the Unicode prefix patterns already used.

### Fix 4 — Two-step service request flow + staff pill

5. [P0] **CRITICAL: `activeRequests` filter (line 3310) only includes `["new", "in_progress"]` — does NOT include `"accepted"`.** If a request is updated to `status='accepted'`, it will be immediately FILTERED OUT of the active requests list and vanish from the UI. The two-step flow is impossible without expanding this filter.
   FIX: Change line 3310 from `return ["new", "in_progress"].includes(r.status)` to `return ["new", "in_progress", "accepted"].includes(r.status)` (or `!["done", "cancelled"].includes(r.status)`).

6. [P0] **CRITICAL: `updateRequestMutation` (line 3315) only destructures `{ id, status }` and only passes `{ status }` to the update call.** The two-step Accept flow needs to also pass `assignee` and `assigned_at` fields. Without this, the Accept button will save status but lose the staff assignment.
   FIX: Change `mutationFn: ({ id, status }) => base44.entities.ServiceRequest.update(id, { status })` to `mutationFn: (payload) => base44.entities.ServiceRequest.update(payload.id, { status: payload.status, ...(payload.assignee ? { assignee: payload.assignee, assigned_at: payload.assigned_at } : {}) })`.

7. [P0] **CRITICAL: `onCloseRequest` prop (line 4190) hardcodes `status: 'done'`.** Currently: `onCloseRequest={(reqId, status) => updateRequestMutation.mutate({ id: reqId, status: 'done' })}`. The `status` parameter from the child component is IGNORED — it always sends 'done'. This means the "Принять" button would set done instead of accepted.
   FIX: Change to `onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...extraFields })}`.

8. [P1] Request buttons in all 3 render blocks (lines 607, 1212, 2134) currently show a single "Выполнено" button with `onClick={() => onCloseRequest(request.id, "done")}`. Need to conditionally render based on `request.status`:
   - New/open request → blue "Принять" button, calls `onCloseRequest(request.id, "accepted", { assignee: effectiveUserId, assigned_at: new Date().toISOString() })`.
   - Accepted request → green "Выдать" button + staff pill, calls `onCloseRequest(request.id, "done")`.
   - **NOTE:** `effectiveUserId` is a prop of OrderGroupCard (line 1641). `staffName` is NOT a prop — it's only in parent scope (line 2922). Need to pass `staffName` as a new prop to OrderGroupCard, or derive assignee display differently.
   FIX: Add `staffName` to OrderGroupCard props. Add new HALL_UI_TEXT keys: `acceptRequest: "Принять"`, `serveRequest: "Выдать"`. Replace single button with conditional two-button render. Add staff pill display for accepted requests.

9. [P1] **`effectiveUserId` prop availability in OrderGroupCard:** Verified — it is passed as a prop (line 1641, received at line 4181). However, `staffName` is NOT a prop of OrderGroupCard — it's only available in the parent StaffOrdersMobile (line 2922). The staff pill display needs `staffName` for self-assigned requests.
   FIX: Either pass `staffName` as a new prop to OrderGroupCard, or show a generic label like the first 6 chars of assignee ID as the task description suggests.

### Fix 5 — Action-oriented close table text with scroll-to-section

10. [P1] `closeDisabledReason` (line 1967) is a single ternary chain returning the first blocker string. Need to replace with array-based computation and keep backward-compatible string.
    - Need 4 section refs: `requestsSectionRef`, `newSectionRef`, `inProgressSectionRef`, `readySectionRef`.
    - Refs must be attached to section wrapper `<div>` elements in all 3 render blocks.
    - Replace the close button `<p>` display with clickable multi-line list.
    - Keep `!!closeDisabledReason` boolean checks for backward compat.
    FIX: Add useRef declarations. Compute `closeDisabledReasons` array. Derive `closeDisabledReason` string from first element. Attach refs to section divs. Replace close-disabled display in all 3 blocks.

11. [P2] **Ref attachment complexity:** The compact block (lines 590-662) sections are inside the collapsed card view — scrollIntoView may not work correctly if the card is collapsed (max-h-0, overflow-hidden). Refs should be placed on the EXPANDED block sections primarily, since scrolling only makes sense when the card is expanded. However, the compact block never shows the close button (it's in the expanded area). So refs should be on expanded block sections only (blocks 2 and 3, not block 1).
    FIX: Actually, looking more carefully — Block 1 is the COLLAPSED card header (lines 502-570 area, inside a comment block). The ACTIVE code for compact table IS Block 2 (lines ~590-704) which is already inside the expanded area. Attach refs there and in Block 3 (lines 2134-2146).

### Fix 6 — Bulk button visibility logic for requests

12. [P1] No bulk request buttons currently exist. Need to add "Принять все (N)" and "Выдать все (N)" buttons based on request status homogeneity.
    - `allRequestsNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open')`
    - `allRequestsAccepted = tableRequests.length > 0 && tableRequests.every(r => r.status === 'accepted')`
    - Place bulk button in request section header, next to the count, in all 3 blocks.
    - Bulk "Принять все" must pass assignee fields for each request.
    - Button disabled while `updateRequestMutation.isPending` — but `updateRequestMutation` is NOT a prop of OrderGroupCard! It's in the parent. The `onCloseRequest` callback is the interface.
    FIX: Implement sequential calls via `onCloseRequest` for each request. For "pending" state, either pass `updateRequestMutation.isPending` as a prop, or use local state to track bulk action in progress.

13. [P2] **Missing `isPending` for request mutation in OrderGroupCard:** The `updateRequestMutation` is in parent StaffOrdersMobile. OrderGroupCard only has `onCloseRequest` callback — no way to know if mutation is pending. Options: (a) pass `isRequestMutationPending` as new prop, (b) add local `isBulkPending` state in OrderGroupCard.
    FIX: Pass `updateRequestMutation.isPending` as a prop (e.g., `isRequestPending`) from parent to OrderGroupCard. Reference it for disabled state on bulk buttons.

### Fix 7 — Inline action toast under acted order row

14. [P1] Toast needs to render INLINE under the acted order row. Currently `renderHallRows` (line 2003) iterates over `rows` (dish-level items), not order-level. Each `row` has `row.order` property (the parent order). The `undoToast.orderId` should match `row.order.id`. After each row where `row.order.id === undoToast?.orderId`, render the inline toast.
    - BUT: multiple rows can belong to the same order. Toast should render only ONCE, after the LAST row of that order.
    FIX: In `renderHallRows`, after mapping rows, check if current row's order.id matches undoToast?.orderId AND next row's order.id differs (or is last row). Render toast div after the last row of the matching order. Alternatively, render after ANY matching row but use a `Set` or flag to prevent duplicates.

15. [P1] `startUndoWindow` (line 1830) creates toast with `snapshots` array but no `orderId` field. Need to add `orderId` to the toast object. Since `startUndoWindow` accepts an array of orders (batch actions), there could be MULTIPLE order IDs. The spec says "toast appears under the order row that was just acted on" — for batch, this is ambiguous.
    FIX: For single order actions: set `undoToast.orderId = orders[0].id`. For batch actions: set `undoToast.orderId = orders[0].id` (show under first order in batch). Or set `undoToast.orderIds = orders.map(o => o.id)` and show toast under each acted row — but spec says "under ONE row only". Recommend: `orderId = orders[orders.length - 1].id` (last order in the batch, most recently visible).

16. [P1] `undoToast` is passed from parent StaffOrdersMobile to OrderGroupCard. But `renderHallRows` needs access to `undoToast` for inline rendering. Currently `renderHallRows` is a `useCallback` inside OrderGroupCard — it has closure access to component state/props. Need to ensure `undoToast` is either: (a) a prop of OrderGroupCard (it's passed as `setUndoToast`, but not `undoToast` itself!), or (b) passed as prop.
    - Looking at OrderGroupCard props (line 1632-1653): receives `setUndoToast` but NOT `undoToast`. The toast value is only in parent.
    FIX: Add `undoToast` as a new prop to OrderGroupCard (in addition to existing `setUndoToast`). Pass from parent: `undoToast={undoToast}`. Then `renderHallRows` can access it via closure.

17. [P1] Remove global toast render (lines 4201-4206). Replace with inline rendering inside `renderHallRows`.
    FIX: Delete the `{undoToast && (` block at lines 4201-4206. Ensure inline toast in renderHallRows covers the functionality.

18. [P1] Change undo timeout from 5000ms to 3000ms in `startUndoWindow` (line 1835).
    FIX: Change `setTimeout(() => setUndoToast(null), 5000)` to `setTimeout(() => setUndoToast(null), 3000)`.

19. [P2] The `handleUndoGlobal` function (line 2972-2978) in parent directly accesses `undoToast.onUndo()`. With inline toast, the undo button is inside OrderGroupCard's `renderHallRows`. The click handler should call `undoToast.onUndo()` then `setUndoToast(null)` — both accessible via props if `undoToast` is passed as prop. The parent `handleUndoGlobal` can be kept as backup but the global toast UI should be removed.
    FIX: In renderHallRows inline toast, onClick: `() => { if (undoToast?.timerId) clearTimeout(undoToast.timerId); undoToast.onUndo(); setUndoToast(null); }`. Remove global toast div but keep handleUndoGlobal for safety.

20. [P2] Add `label` field to undoToast object in `startUndoWindow` — the inline toast shows `undoToast.label || "Действие выполнено"`. Currently toast object has `{ snapshots, timerId, onUndo }` — no `label`. Need to add label based on action type.
    FIX: Add `label` to toast object in `startUndoWindow`. E.g., `label: "Выдан гостю"` (matching current global toast text) or dynamically set based on action.

## Summary
Total: 20 findings (3 P0, 12 P1, 5 P2, 0 P3)

- **Fix 1:** 1 finding (P1) — straightforward JSX reorder in 3+1 blocks
- **Fix 2:** 1 finding (P1) — add visual weight classes in 3 blocks
- **Fix 3:** 2 findings (P1, P2) — pluralRu helper + dual metric in headers
- **Fix 4:** 5 findings (3 P0, 2 P1) — activeRequests filter MUST include 'accepted', mutation MUST pass extra fields, onCloseRequest hardcode MUST be fixed, staffName prop needed
- **Fix 5:** 2 findings (P1, P2) — array-based blockers + refs on expanded sections
- **Fix 6:** 2 findings (P1, P2) — bulk buttons + isPending prop gap
- **Fix 7:** 7 findings (5 P1, 2 P2) — undoToast prop gap, inline rendering in renderHallRows, batch orderId handling, timeout change, label field, global toast removal

### Critical Blockers (must fix FIRST):
1. **Finding #5 (P0):** activeRequests filter excludes 'accepted' — accepted requests vanish
2. **Finding #6 (P0):** updateRequestMutation doesn't pass assignee/assigned_at fields
3. **Finding #7 (P0):** onCloseRequest hardcodes 'done', ignores status parameter

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 4: Task says "branch on `request.status`" for button rendering but doesn't explicitly mention that `activeRequests` filter needs updating — this is the most critical prerequisite and could easily be missed. Mentioned as "verify accepted requests are still included" in Verification section but not as an explicit code change.
  - Fix 7: Says "render inline toast inside `renderHallRows` — after the row whose `order.id` matches" but `renderHallRows` processes dish-level rows (multiple per order). Doesn't specify how to handle multi-row orders or batch actions with multiple orderIds.
  - Fix 6: Says "Disable button while `updateRequestMutation.isPending`" but doesn't mention that this mutation state is not available in OrderGroupCard (only `onCloseRequest` callback exists as interface).
- Missing context:
  - Whether ServiceRequest entity schema actually supports `assignee`, `assigned_at`, and `status='accepted'` values — task says to verify but this is a DB schema question that can't be answered from code alone.
  - `staffName` is not a prop of OrderGroupCard — task says to show it for self-assigned requests but doesn't mention it needs to be passed as a new prop.
- Scope questions:
  - Fix 7: Should toast show under ALL acted order rows in a batch action, or just one? Task says "under ONE row only" — used last order as recommendation.
  - Fix 3: Legacy block (non-table) — should it get dual metric too? Items aren't pre-counted there.
