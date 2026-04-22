# SOM Batch Б1 — Independent Findings (ССП / Claude Code Desktop)

**File reviewed:** `pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx` (4575 lines)
**Helper reviewed:** `menuapp-code-review/components/sessionHelpers.js` (215 lines)
**Date:** 2026-04-15
**Role:** ССП (Bash env). Did NOT launch subagents, did NOT invoke Codex. Read-only.

---

## Self-check (pre-task)

1. **Ambiguities noticed before starting**
   - Prompt says file is at `menuapp-code-review/pages/StaffOrdersMobile/260414-02 ...` but that folder only contains `260306-05 ... RELEASE.jsx`. The actual latest RELEASE is at **`pages/StaffOrdersMobile/260414-02 ...`** (top-level `Menu AI Cowork/pages/...`, not inside `menuapp-code-review/`). Proceeded with the correct path.
   - Line hints in the prompt (~767, ~1382, ~2381) are off by a few lines; close-table button sites are at lines **767, 1384, 2381**.
   - Prompt's hypothesis for Bug 1 asserts "Completed tab likely filters by `Table.status`". **Not confirmed by code** — see Section 1.2 below. The filter uses order-level state, not `Table.status`. This materially changes the recommended fix.

2. **Execution plan (followed)**
   - Verify file path → `wc -l` → parallel greps (`__batch`, `closeSession|closeTable`, `invalidateQueries`, handler names, `base44.entities.*.update`) → read `sessionHelpers.js` whole → targeted slices of RELEASE (tab filter 3820-3890, confirmCloseTable 4130-4185, mutations 1585-1645 / 1890-2000 / 3540-3560) → read close-table button sites 750-770 and 2360-2395 → search BUGS_MASTER.
   - Heaviest reads: 4-slice window around mutations (~270 lines combined) — acceptable given 4575-line file.

3. **Stalling risks encountered**
   - Working directory is `menuapp-code-review/`, but target RELEASE is one level up. Used absolute paths for Read after first failed attempt.
   - Cyrillic in filename — no issues with quoted bash paths.
   - BUGS_MASTER.md is at `..`; confirmed existence before grep.

---

## Section 1 — SOM-BUG-S270-02 (Close table → Completed)

### 1.1 `closeSession()` verbatim

`menuapp-code-review/components/sessionHelpers.js`, lines **158–171**:

```js
export async function closeSession(sessionId) {
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });

  // S267: Bulk-close all non-cancelled orders in this session.
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
}
```

**Does it touch `Table.status`?** **NO.** Only `TableSession.status` (line 159) and `Order.status` (line 169).
**Does it touch `Order.stage_id`?** **NO.** Only `Order.status`. `stage_id` is left at whatever stage the order was in.
**Does it touch `ServiceRequest`?** **NO.** Any active/accepted requests linked to the table remain live.

### 1.2 What drives the "Завершённые" tab filter

`pages/StaffOrdersMobile/260414-02 StaffOrdersMobile RELEASE.jsx`, lines **3829–3847**:

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

Repo-wide grep `Table\.status|\.Table\.update` in RELEASE.jsx returns **zero hits** (only `Table.filter({partner})` / `Table.list()` at line 3371). **The Completed tab filter does NOT read `Table.status`.**

It depends on three per-group booleans:
- `hasActiveOrder` — any order where **`!isFinishStage` AND `status !== 'cancelled'`**. `isFinishStage` is computed in `getStatusConfig` (lines 3423-3482) from `stage.internal_code === 'finish'` or "last stage in relevantStages", i.e. from **`stage_id`**, not from `status`.
- `hasActiveRequest` — any `ServiceRequest` linked to this table whose status is NOT `done`/`cancelled` (filter at line 3544-3545).
- `hasServedButNotClosed` — `isFinishStage && status !== 'closed' && status !== 'cancelled'`.

### 1.3 Why the bug happens (actual root cause — corrects prompt hypothesis)

After `closeSession(sessionId)` runs:
- `TableSession.status = 'closed'` ✅
- Every non-cancelled order's `status = 'closed'` ✅
- **`Order.stage_id` is UNCHANGED** ❌
- **`ServiceRequest`s linked to this table are UNCHANGED** ❌

The `hasActiveOrder` predicate trips on any order whose `stage_id` is NOT a finish stage — because `isFinishStage=false` and `'closed' !== 'cancelled'`. So an order that was sitting in a middle stage (e.g. «В работе» / `in_progress`) when the waiter hit «Закрыть стол» keeps `hasActiveOrder=true` → group stays in Active.

A second failure path: if the table had any live `ServiceRequest` (e.g. «Счёт» / «Позвать официанта» status=`accepted` or `new`), `hasActiveRequest=true` → group stays in Active regardless of order state.

A third (smaller) failure path: `hasServedButNotClosed` is now correctly false for orders that WERE in finish stage AND got `status='closed'`. But orders that were NOT yet in finish stage slip through `hasActiveOrder` instead — same outcome.

> Prompt asserted: "Completed tab likely filters by `Table.status`" — **this is wrong.** The Table entity's `status` field (added S271) is never read by SOM. Fixing `Table.status` in `closeSession` would NOT move the card to Completed — the filter doesn't look at it.

### 1.4 Fix recommendation

Neither Option A nor Option B as written in the prompt will fix this bug, because both target `Table.status` and the filter ignores it. I need to restate:

- **Option A (prompt's framing):** extend `closeSession` to set `Table.status='closed'`. ❌ **Does not fix the observed bug** (filter does not read Table.status).
- **Option B (prompt's framing):** update `Table.status` at call-site. ❌ Same reason.

**Actual options that would fix the bug:**

- **Option A' — fix the helper (recommended):** in `closeSession()`, ALSO (a) advance each order's `stage_id` to the partner's `finish` stage (the same pattern `handleCloseAllOrders` uses at RELEASE:4161-4170: `sortedStages.find(s => s.internal_code === 'finish')`), AND (b) close all live `ServiceRequest`s for this table (`ServiceRequest.filter({table: tableId})` → update `status='done'` for rows not in `done`/`cancelled`). This requires resolving `tableId` via `TableSession.filter({id: sessionId})` (or reading session first) and fetching `stages` — which `sessionHelpers.js` currently doesn't have. The helper needs a new signature: `closeSession(sessionId, { finishStageId, tableId })` — OR it imports stage lookup via `base44.entities.OrderStage.filter({partner, internal_code:'finish'})` itself.
- **Option B' — fix at call-site** (`confirmCloseTable`, RELEASE:4143-4155): do the stage advance + request closure inline, using the already-available `sortedStages`, `tableId` (resolvable from `closeTableConfirm`), and `activeRequests`. Leave `closeSession()` alone so other callers (if any) keep their current behaviour.
- **Option C' — fix the filter:** treat orders with `status === 'closed'` as not-active in `hasActiveOrder` (change the predicate to `!config.isFinishStage && o.status !== 'cancelled' && o.status !== 'closed'`) AND require requests to actually be for the current session, not stale. Low-invasive but papers over the real state model (stage_id no longer tracks reality).

**Choose: Option B' (call-site fix) + keep Option A' mentally as future consolidation.**

Reasoning:
1. `confirmCloseTable` already has `sortedStages` and `queryClient` in scope; the "Close all orders" sibling handler (`handleCloseAllOrders`, 4158-4179) already demonstrates the exact stage-advance pattern with `runBatchSequential` for rate-limit safety. Reusing it keeps one source of truth locally in the page.
2. `closeSession()` is currently used only by SOM (verified by `ServiceRequest.filter` + `close_table` grep — no other call-sites in RELEASE). But changing its signature without a repo-wide consumer sweep risks breaking PartnerTables (which may also close sessions). A call-site fix is lower blast radius.
3. Option C' (filter change) hides state drift. Having `stage_id` in middle stage while `status='closed'` is already a subtle inconsistency; papering over it in the filter will confuse anyone reading state later (PublicMenu `CartView`, partner reports, etc.).

### 1.5 Regression risks (top 3)

1. **Stage-finish event side effects.** Advancing `stage_id` to `finish` may trigger other UI paths that watch for stage transitions (e.g. `useEffect` in OrderRow, analytics, Telegram notifications). Check for any `useEffect(..., [stage_id])` or `onSuccess` that assumes a user-driven "Выдать" tap. Risk especially for orders that were in «Новый» — they'd skip `accepted/in_progress/ready` entirely, breaking any "how long was this in progress" metric.
2. **Rate limit on bulk close.** `closeSession` already does `Promise.all(sessionOrders.map(Order.update))` in parallel (line 166). Adding a second wave of `Order.update` for `stage_id` (or batching both into one `update` call — better) and a third wave for `ServiceRequest.update` multiplies B44 calls. A table with 8 orders + 2 requests ≈ 10+ parallel writes — likely 429. Fix must use sequential throttling (the page already has `runBatchSequential` — adopt it, and consolidate `{status:'closed', stage_id:finish.id}` into ONE update per order).
3. **Lost `served`→`closed` distinction.** Today, if the waiter explicitly advanced orders to finish stage BEFORE hitting «Закрыть стол», orders sit at `status='served', stage_id=finish`. After fix, closeSession will overwrite to `status='closed', stage_id=finish` — losing the `served` marker. Anywhere else in the codebase that distinguishes `served` vs `closed` (analytics, sales report, guest bill replay) might break. Grep `status === 'served'` and `status: 'served'` before shipping.

### 1.6 Manual test plan (3 waiter steps)

1. **Mixed-state table close.** Open a table, create 3 orders: leave one in «Новый» (stage=start), advance another to «В работе», advance the third to «Выдано» (finish). Add one ServiceRequest «Позвать официанта» (status=new). Tap «Закрыть стол» → confirm. Expected: card appears in «Завершённые» tab within one refetch; counter on «Активные» tab decrements by 1; tapping the card in «Завершённые» shows all 3 orders at finish stage with `status=closed` and no live requests.
2. **Idempotency + collapse.** Immediately after closing in step 1, re-open the same table via QR (new guest scans). Expected: a NEW `TableSession` is created (previous is closed), the table re-appears in «Активные». The stale-closed card stays in «Завершённые» for the current shift view but does not re-activate.
3. **Rate-limit stress.** Open a table with 12 orders across stages. Tap «Закрыть стол» → confirm. Expected: toast «Стол закрыт» within ~3s, no 429 error, all 12 orders are `status=closed, stage_id=finish` on refetch, card in «Завершённые». If any 429 appears → serial throttle is insufficient; revisit batch size or add retry-with-backoff.

---

## Section 2 — SOM-BUG-S270-01 re-check (rate limit, single mutations)

### 2.1 Handlers calling B44 mutations WITHOUT `__batch: true`

| Line | Handler / Call | Mutation | `__batch`? |
|------|----------------|----------|------------|
| 1627 | `handleAction` (inside `OrderRow`-ish component) — single-tap on one order row | `updateStatusMutation.mutate({id: order.id, payload})` | **N** |
| 3119 | `updateLinkMutation.mutate({...})` (staff-link update, ~settings) | `Link` table mutation | N |
| 3138 | `updateLinkMutation.mutate(...)` | same | N |
| 3176 | `updateLinkMutation.mutate(...)` | same | N |
| 3263 | `updateLinkMutation.mutate(...)` | same | N |
| 4360 | `onAction={() => updateRequestMutation.mutate({id: req.id, status: req.status === "new" ? "in_progress" : "done"})}` | `ServiceRequest.update` | **N** |
| 4435 | `onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({id, status:newStatus, ...extraFields})}` | `ServiceRequest.update` | **N** |
| 4169 | `base44.entities.Order.update(o.id, {stage_id: finishStage.id})` — inside `handleCloseAllOrders`, wrapped in `runBatchSequential` | direct `Order.update` (no mutation wrapper) | N/A — direct call, bypasses `__batch` concept |

Handlers that DO set `__batch: true` (for reference, not bugs): 1959, 1990 (advanceMutation during Undo and bulk row/section advance), 4436 (`onBatchCloseRequestAsync`).

### 2.2 `onSuccess` / `onSettled` inspection — per-tap invalidate storms

- **`updateStatusMutation`** (line 1594-1607, OrderRow single-row advance). `onSettled` at **1606** is unconditional: `queryClient.invalidateQueries({ queryKey: ["orders"] })`. **No `__batch` branch.** Every single tap → full orders refetch. Rapid taps (3–5 in a second on different rows) → 3–5 concurrent orders refetches + 3–5 Order.update PATCH requests → likely 429 on B44.
- **`advanceMutation`** (line 1904-1921, per-group advance). `onSettled` at **1916-1920** correctly short-circuits on `vars?.__batch` AND invalidates both `["orders"]` and `["servedOrders", group.id]` otherwise. Not a bug — but note it's only used for bulk row/undo; single-tap path uses `updateStatusMutation` above.
- **`updateRequestMutation`** (line 3549-3558). `onSuccess` at **3551** correctly short-circuits on `__batch`. Single-click handlers at 4360 and 4435 do NOT pass `__batch` → every single request accept/done → `["serviceRequests"]` invalidate + refetch. Two requests resolved in quick succession → possible 429.
- **Optimistic snapshot overhead.** `updateStatusMutation.onMutate` (1596-1601) calls `queryClient.cancelQueries` + `getQueriesData` + `setQueriesData` on EVERY single tap. Harmless for React Query itself, but means rapid taps cancel each other's in-flight refetches mid-flight, producing a jittery UI — orthogonal to 429 but worth flagging.

### 2.3 `closeSession()` fan-out (sessionHelpers.js:166-170)

```js
await Promise.all(
  sessionOrders
    .filter(o => o.status !== 'cancelled')
    .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
);
```

`Promise.all` dispatches N parallel PATCH requests to B44. For a table with 10+ orders this is a classic 429 trigger. B44 rate limits are typically ~5-10 rps per-workspace. HIGH risk. Should be replaced with `runBatchSequential` (already used elsewhere in RELEASE.jsx, e.g. 4168, 1956, 2369).

### 2.4 Risk-ranked findings table

| # | Location | Issue | Risk | Est. LOC |
|---|----------|-------|------|----------|
| 1 | `sessionHelpers.js:166-170` | `Promise.all` over N orders on every close-table → 429 on busy tables | **HIGH** | 5-10 (swap to sequential loop with small delay, or accept partial-failure retry) |
| 2 | RELEASE:1606 | `updateStatusMutation.onSettled` always invalidates; single-tap handler at 1627 has no `__batch` flag → refetch storm on rapid taps | **HIGH** | 3-5 (mirror advanceMutation pattern: accept `__batch` in vars, short-circuit) |
| 3 | RELEASE:4360, 4435 | `updateRequestMutation.mutate` called without `__batch` for single-click flows → per-tap serviceRequests refetch | MED | 2 (thread `__batch: true` where appropriate, OR debounce invalidation — but for single taps the right fix is probably a 500ms debounced invalidate) |
| 4 | RELEASE:1596-1601 | Optimistic cache cancel+write on every tap; harmless perf but contributes to jitter during bursts | LOW | — (leave as-is) |
| 5 | RELEASE:3119/3138/3176/3263 | `updateLinkMutation` single-tap paths — same no-`__batch` pattern; less likely to be spam-tapped in real flow | LOW | — (verify mutation's onSettled first; out of Б1 scope) |

### 2.5 No fix design (as instructed)

Diagnosis only. A separate КС (С5v2 recipe recommended, budget ≥ $10 per Rule 42) should design the consolidated fix across items 1-3.

---

## Section 3 — Prompt Clarity rating

**Rating: 3/5.**

Reasons:
- ✅ Scope (2 bugs, role split ССП/КП, read-only, output path) is unambiguous.
- ✅ Env-specific read commands are provided and worked.
- ⚠️ File path wrong (`menuapp-code-review/pages/StaffOrdersMobile/260414-02...` — actual file is at top-level `pages/StaffOrdersMobile/260414-02...`). Cost ~2 minutes verifying.
- ⚠️ Line hints (~767, ~1382, ~2381) are off by 2-3 lines; close-table button sites are at 767/1384/2381. Minor.
- ❌ **Bug 1 hypothesis is materially wrong.** Prompt asserts "Completed tab likely filters by `Table.status`" — grep shows it does not. The prompt leads the reviewer into proposing fixes (Options A and B both target `Table.status`) that would NOT fix the observed bug. Had to invalidate both options and propose A'/B'/C'. Rating dropped 2 full points because prompt framing could have caused a reviewer to ship a non-fix.
- ⚠️ "SOM-BUG-S270-01 previously fixed in S272" — BUGS_MASTER.md (at `../BUGS_MASTER.md`) has no `SOM-BUG-S270-01` row, only S197 entries. Either the bug ID was never written to the master file, or it lives elsewhere. Hard to cross-reference the "previous fix".

---

## Section 4 — Out-of-scope risks (noticed while grepping)

1. **RELEASE:3286** `queryClient.invalidateQueries();` (no queryKey) — nukes the entire cache on some staff-link flow. Suspicious blanket invalidate; likely overkill and a refetch-storm multiplier.
2. **RELEASE:1606** `onSettled` (not `onSuccess`) always runs even on error. Combined with `onError` rollback path at 1603-1605 means: error → rollback optimistic → then invalidate → refetch → rollback is overwritten by server state. Fine logically, but wasteful on errors in rate-limit scenarios.
3. **sessionHelpers.js:6** imports `base44` from `@/api/base44Client` but the file is plain `.js` with JSDoc-free exports and no explicit error handling — a single failing `Order.update` inside `Promise.all` will reject the whole close-table flow, leaving TableSession closed but some orders still open. Partial-failure recovery is missing.
4. **RELEASE:3442** `const isFinishStage = stage.internal_code === 'finish' || currentIndex === relevantStages.length - 1;` — if a partner accidentally creates a stage pipeline where the last stage is not `internal_code='finish'` (e.g. custom workflow), `isFinishStage` silently becomes true for whatever the last stage happens to be. Masks misconfiguration and could trap orders in "finish" state without explicit finish semantics.
5. **BUGS_MASTER.md:189-190** (SO-S197-01 / SO-S197-02) describe related-but-older bugs about cards moving to «Завершённые» prematurely. Worth cross-reading before landing the Б1 fix — the contract "served-but-not-closed stays Active" (line 3838 comment "S267: ...") was introduced specifically to address SO-S197-01, and our proposed fix must not re-break it.

---

## Post-task review

1. **Rate this prompt 1-10 for clarity and executability:** **6/10.** Scope/deliverables/env commands are clear. File path and line hints are slightly off. The Bug 1 hypothesis is incorrect and would mislead a less-skeptical reviewer into shipping a non-fix. Dropped ~4 points on that — the synthesizer must not just average my output with КП's if КП took the hypothesis at face value.
2. **Unclear / caused hesitation:**
   - File location (menuapp-code-review/ vs top-level pages/).
   - Whether "Completed tab filter" in the hypothesis was a confirmed claim or a working guess — I assumed guess once grep disproved it.
   - Whether "Option A" strictly means "add Table.status update" or is shorthand for "fix in helper". I interpreted strictly and coined A' for the real fix.
3. **Prompt changes that would save tokens/time:**
   - Fix the path (`pages/StaffOrdersMobile/260414-02 ...` — note leading `pages/`, not `menuapp-code-review/pages/`).
   - Replace the Bug 1 hypothesis with: "The filter logic at RELEASE.jsx:3829-3847 drives the Completed tab. Reviewer: determine whether closeSession leaves enough state to satisfy the filter; if not, where to fix." Neutral framing would've saved me ~15 min of counter-hypothesis writing.
   - Narrow the grep scope for Bug 2: explicitly name the 4 mutations (`updateStatusMutation`, `advanceMutation`, `updateRequestMutation`, `updateLinkMutation`) and ask for per-mutation `onSuccess/onSettled` audit in one pass.
4. **Reads that cost the most tokens:**
   - The two slices at lines 750-795 and 2360-2395 (close-table button sites) each pulled ~45 lines of very dense single-line JSX. **What would have been enough:** just the 5-10 lines around `handleCloseTableClick` and the `onCloseTable` prop pass-through — maybe 20 LOC total instead of 85.
   - The OrderRow mutation slice (1585-1644) included 60 lines but only lines 1594-1607 and 1622-1628 were needed for Section 2. Could cut to 25 LOC.
   - `getStatusConfig` read at 3420-3495 — needed to confirm `isFinishStage` is stage-driven, but a 10-line slice around line 3442 would have sufficed.

---

## Permissions Requested

Task was fully read-only. Would have requested the following if scope expanded:
- Write to `pipeline/findings-som-b1-ssp-v1.md` — **done** (explicit deliverable in prompt).
- Would NOT have requested: any edit to `.jsx`/`.js` source, any `git` operation, any subagent launch, any Codex invocation. None needed.
