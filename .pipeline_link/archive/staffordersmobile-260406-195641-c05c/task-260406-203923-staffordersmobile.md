---
task_id: task-260406-203923-staffordersmobile
status: running
started: 2026-04-06T20:39:23+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 10.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260406-203923-staffordersmobile

## Config
- Budget: $10.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260406-195641-c05c
chain_step: 4
chain_total: 4
chain_step_name: merge
page: StaffOrdersMobile
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260406-195641-c05c
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260406-195641-c05c-comparison.md
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260406-195641-c05c-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/StaffOrdersMobile/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/StaffOrdersMobile/ with fixed items
   b. Update README.md in pages/StaffOrdersMobile/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260406-195641-c05c"
   - git push
7. Write merge report to: pipeline/chain-state/staffordersmobile-260406-195641-c05c-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260406-195641-c05c

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# SOM Section Rework — UX decisions #10, #11, #19, #20, #21, #23, #29, #31 (#245)

Reference: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` (v2.5), `BUGS_MASTER.md`.
Production page. StaffOrdersMobile = waiter's mobile order management screen.

**Context:** The page already has status-grouped sections (New, Ready, In Progress, Served, Requests) with batch actions and per-item buttons. This task brings existing sections into alignment with the finalized UX document v2.5: reorder sections to lifecycle order, add active/passive visual weight, dual metrics in headers, two-step service request flow, staff pill, inline toast, action-oriented close-table text, and bulk button visibility logic.

**TARGET FILES (modify):** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4333 lines)
**CONTEXT FILES (read-only):**
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — UX decisions document
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — Interactive HTML mockup. Read this file as code. Use it to resolve styling and layout details ONLY within Fixes 1-7 scope. Do NOT rewrite unrelated hierarchy/classes just to mirror the mockup. When a Fix description and the mockup conflict on styling details within that Fix's scope — the mockup wins.

**File integrity check:** Before starting, run `wc -l pages/StaffOrdersMobile/staffordersmobile.jsx`. If result < 4300, **STOP and report the issue** — do NOT automatically overwrite the file.

**⚠️ THREE render blocks exist (not two!):**
1. **Compact block** (~lines 500-710) — collapsed table card, uses `renderHallRows`
2. **Expanded block** (~lines 1100-1320) — expanded table card, uses `renderHallRows`
3. **Legacy block** (~lines 2134-2153) — non-table groups (delivery/pickup), uses `renderLegacyOrderCard`

Fixes 1-6 MUST be applied to ALL THREE blocks. After each Fix, verify all 3 blocks are updated.

**⚠️ i18n exception:** This file uses hardcoded Russian strings in `HALL_UI_TEXT` constant (~line 305). This is an approved exception — do NOT convert to `t('key')` pattern. Add all new strings to `HALL_UI_TEXT`.

**⚠️ Implementation order (mandatory):**
1. Fix 1 — section reorder (establishes render structure)
2. Fix 2 — active/passive visual weight
3. Fix 3 — dual metric headers
4. Fix 4 — two-step request mutation flow
5. Fix 6 — bulk request buttons (depends on Fix 4 states)
6. Fix 5 — close-blocker array + section refs (after render structure settled)
7. Fix 7 — inline toast relocation (last, as it changes state ownership)

---

## Fix 1 — UX #10 [MUST-FIX]: Reorder sections to lifecycle order

### Currently
Sections render in order: Requests → New → Ready → In Progress → Served → Bill → Close Table.
Ready comes BEFORE In Progress — breaks the natural lifecycle.

### Should be
Lifecycle order: **Requests → New → In Progress (with sub-groups by stage) → Ready → Served → Bill → Close Table**.
This matches the kitchen workflow: order arrives → accepted → being prepared → ready to serve → served.

### Must NOT be
- Do NOT change the section content/logic — only the render ORDER in the JSX.
- Do NOT remove any section.

### File and location — THREE blocks
**Block 1 (compact ~500-710):** Find sections by grep:
- `newOrders.length > 0 && (` — "New" section
- `readyOrders.length > 0 && (` — "Ready" section
- `inProgressOrders.length > 0 && (` or `inProgressSections.length > 0 && (` — "In Progress" section

**Block 2 (expanded ~1100-1320):** Same patterns, second occurrence.

**Block 3 (legacy ~2134-2153):** Grep: the section starting with `renderLegacyOrderCard`. Currently order is New → Ready → InProgress. Move InProgress before Ready.

In ALL THREE blocks, move the "In Progress" section to render AFTER "New" and BEFORE "Ready".

### Verification
After fix, confirm render order in JSX for all 3 blocks: `tableRequests` → `newOrders` → `inProgressOrders`/`inProgressSections` → `readyOrders` → `servedOrders` → bill → close button.

---

## Fix 2 — UX #11 [MUST-FIX]: Active/passive section visual weight

### Currently
All sections have distinct colors (blue=New, green=Ready, amber=InProgress, violet=Requests, slate=Served) but no visual differentiation between "active" (needs waiter action) and "passive" (no immediate action needed) sections.

### Should be
**Active sections** (Requests, New, Ready to Serve):
- Section header has colored background pill (e.g., `bg-blue-50 text-blue-700 rounded-md px-2 py-0.5`)
- Section body fully visible (opacity-100)
- Expanded by default

**Passive sections** (In Progress sub-groups, Served):
- Section header text only, muted: `text-slate-400 opacity-60`
- Content area: `opacity-60`
- Collapsed by default (In Progress sections keep their existing `inProgressExpanded` toggle, Served keeps `servedExpanded`)

### Must NOT be
- Do NOT change section colors completely — keep blue/green/violet for active, but ADD background pill.
- Do NOT hide passive sections — they must remain visible but visually de-emphasized.
- Do NOT change `amber` color for In Progress to gray — instead make it muted amber (`text-amber-400 opacity-60`).

### File and location — THREE blocks
Grep for section headers in compact/expanded blocks:
- `text-blue-600` (New header) — add `bg-blue-50 rounded-md px-2 py-0.5` wrapper
- `text-green-600` (Ready header) — add `bg-green-50 rounded-md px-2 py-0.5` wrapper
- `text-violet-600` (Requests header) — add `bg-violet-50 rounded-md px-2 py-0.5` wrapper
- `text-amber-600` (In Progress header) — change to `text-amber-400 opacity-60`
- `text-slate-500` (Served header) — add `opacity-60`

Legacy block (~2150): similar header patterns with Unicode strings.

### Verification
Visual check: active sections (Requests, New, Ready) should stand out with colored background on header. Passive sections (In Progress, Served) should be visually muted with lower opacity.

---

## Fix 3 — UX #19 [MUST-FIX]: Dual metric in section headers ("N guests · N dishes")

### Currently
Section headers show single count: `НОВЫЕ (5)` where 5 = dish count from `countRows()`.

### Should be
Dual metric: `НОВЫЕ (2 гостя · 5 блюд)` where:
- Guest count = `orders.length` (each order = one guest's order)
- Dish count = existing `countRows(rows, orders.length)` value (reuse the helper, do NOT replace its logic)

Use Russian pluralization: 1 гость/2 гостя/5 гостей, 1 блюдо/2 блюда/5 блюд.

### Must NOT be
- Do NOT show dual metric for Served section (keep simple count).
- Do NOT change how `countRows` is calculated — reuse it for dish count.

### File and location
`countRows` is defined as `useCallback` (grep: `const countRows = useCallback`), NOT a standalone function.

Add helper functions OUTSIDE the component (above `function OrderGroupCard`):
```javascript
function pluralRu(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
```

In section headers, replace single count with dual metric. Example for New section:
```javascript
// BEFORE:
`${HALL_UI_TEXT.new} (${countRows(newRows, newOrders.length)})`
// AFTER:
`${HALL_UI_TEXT.new} (${newOrders.length} ${pluralRu(newOrders.length, 'гость', 'гостя', 'гостей')} · ${countRows(newRows, newOrders.length)} ${pluralRu(countRows(newRows, newOrders.length), 'блюдо', 'блюда', 'блюд')})`
```

Same for Ready section (grep: `HALL_UI_TEXT.ready`).

**In Progress sections** use `.reduce()` for total count (grep: `inProgressSections.reduce`). Apply dual metric using `inProgressOrders.length` for guests and existing reduce value for dishes. Apply in ALL THREE render blocks.

Legacy block (~2150): uses `newOrders.length` directly — apply same dual metric.

### Verification
Section header should show e.g. `НОВЫЕ (2 гостя · 5 блюд)`, not `НОВЫЕ (5)`.

---

## Fix 4 — UX #20 + #21 [MUST-FIX]: Two-step service request flow + staff pill

### Currently
Service requests show a single "Выполнено" (Done) button. One tap marks request as done. No Accept step. Assignee is saved to DB but not displayed.

### Should be
**Two-step flow (branch on `request.status`, NOT `request.assignee`):**
1. **New request** (`!request.status || request.status === 'new' || request.status === 'open'`) → button `[Принять]` (blue). On tap: update request with `status='accepted'`, `assignee=effectiveUserId`, `assigned_at=new Date().toISOString()`.
2. **Accepted request** (`request.status === 'accepted'`) → button `[Выдать]` (green). On tap: update request with `status='done'`.

**⚠️ Prerequisite check (MANDATORY before editing):**
Run: `grep -n "status" pages/StaffOrdersMobile/staffordersmobile.jsx | grep -i "request"` — verify that ServiceRequest entity supports `status` field with values like 'accepted'/'done'. Also verify `assignee` and `assigned_at` fields exist. **If any field is missing from the entity or the active-request query filters OUT accepted requests — STOP and report.**

**Staff pill after Accept:**
When `request.status === 'accepted'` and `request.assignee`, show assignee name as small pill: `bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full`.
- If `request.assignee === effectiveUserId`: show `staffName` (already in scope, grep: `staffName`)
- Else: show first 6 chars of assignee ID as fallback

### Must NOT be
- Do NOT remove the request section or change its position.
- Do NOT change request type icons (Bell, Receipt, etc.).

### File and location — THREE render blocks with request buttons
- Grep: `onCloseRequest(request.id, "done")` (~line 607) — compact block
- Grep: `onCloseRequest(request.id, 'done')` (~line 1212) — expanded block
- Grep: `onCloseRequest(request.id, "done")` (~line 2134) — **legacy block (THIRD occurrence!)**

In `HALL_UI_TEXT` (grep: `const HALL_UI_TEXT`), add new keys:
```javascript
  acceptRequest: "Принять",
  serveRequest: "Выдать",
```

Change each request button to conditionally render based on `request.status`:
```javascript
// If request is new/open → blue "Принять" button
// If request is accepted → green "Выдать" button + staff pill before button
```

⚠️ **CRITICAL wiring fix (parent component):**
- Grep: `mutationFn: ({ id, status })` (~line 3315) — expand to accept full payload:
  ```javascript
  mutationFn: (payload) => base44.entities.ServiceRequest.update(payload.id, {
    status: payload.status,
    ...(payload.assignee ? { assignee: payload.assignee, assigned_at: payload.assigned_at } : {})
  })
  ```
- Grep: `onCloseRequest={(reqId, status) => updateRequestMutation.mutate({ id: reqId, status: 'done' })` (~line 4190) — **BUG: hardcodes 'done'!** Fix:
  ```javascript
  onCloseRequest={(reqId, newStatus, extraFields) => updateRequestMutation.mutate({
    id: reqId, status: newStatus, ...extraFields
  })}
  ```
- Then in button onClick, pass extraFields for accept:
  ```javascript
  onClick={() => onCloseRequest(request.id, "accepted", {
    assignee: effectiveUserId,
    assigned_at: new Date().toISOString()
  })}
  ```
- Grep: `effectiveUserId` (~line 2798) — verify exists in parent StaffOrdersMobile scope. If missing, STOP and report.

### Verification
1. New request shows [Принять]. Tap → request gets `status='accepted'` + assignee + staff pill appears.
2. Accepted request shows [Выдать]. Tap → request gets `status='done'`, disappears from list.
3. Verify accepted requests are still included in active request queries (not filtered out).

---

## Fix 5 — UX #29 [MUST-FIX]: Action-oriented close table text with scroll-to-section

### Currently
Close button disabled reasons are diagnostic strings. `closeDisabledReason` is a single string — first blocker wins.
Grep: `const closeDisabledReason = group.type !== "table" ? null :` (~line 1967).

### Should be
Action-oriented multi-line list: tell waiter WHAT TO DO for each active blocker. Tapping a blocker scrolls to that section.

**Implementation:**

**Step 1 — Add section refs** (at top of OrderGroupCard, near other state):
```javascript
const requestsSectionRef = useRef(null);
const newSectionRef = useRef(null);
const inProgressSectionRef = useRef(null);
const readySectionRef = useRef(null);
```
Add `ref={requestsSectionRef}` etc. to corresponding section wrapper `<div>` in all render blocks.

**Step 2 — Replace single-string with array + backward-compatible string:**

Replace blocker texts in `HALL_UI_TEXT`:
```javascript
  requestsBlocker: "Выполнить запросы",
  newBlocker: "Принять новые блюда",
  inProgressBlocker: "Дождаться блюда в работе",
  readyBlocker: "Выдать готовые блюда",
```

Replace `closeDisabledReason` computation (~line 1967):
```javascript
const closeDisabledReasons = group.type !== "table" ? [] : [
  tableRequests.length > 0 && { text: HALL_UI_TEXT.requestsBlocker, count: tableRequests.length, ref: requestsSectionRef },
  newOrders.length > 0 && { text: HALL_UI_TEXT.newBlocker, count: newOrders.length, ref: newSectionRef },
  inProgressOrders.length > 0 && { text: HALL_UI_TEXT.inProgressBlocker, count: inProgressOrders.length, ref: inProgressSectionRef },
  readyOrders.length > 0 && { text: HALL_UI_TEXT.readyBlocker, count: readyOrders.length, ref: readySectionRef },
].filter(Boolean);
const closeDisabledReason = closeDisabledReasons.length > 0 ? closeDisabledReasons[0].text : null;
```

**Step 3 — Update close-button render** (~lines 702 and 1307, and ~2146):
Keep `disabled={!!closeDisabledReason}` and className ternaries (backward-compatible).
Replace the `<p>` display:
```jsx
{closeDisabledReasons.length > 0 && (
  <div className="text-[10px] text-slate-400 text-center mt-1 space-y-0.5">
    <div>Чтобы закрыть стол:</div>
    {closeDisabledReasons.map((reason, i) => (
      <button key={i} type="button"
        onClick={() => reason.ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="block w-full text-left text-slate-500 underline">
        {`· ${reason.text} (${reason.count})`}
      </button>
    ))}
  </div>
)}
```

### Must NOT be
- Do NOT change the close button itself (color, size, icon).
- Do NOT change when close is enabled (conditions stay same).
- Do NOT break `!!closeDisabledReason` boolean checks — keep the string variable for backward compat.

### Verification
When close is disabled, should show multi-line list of tappable actions with counts. Tapping scrolls to section. When enabled, no blockers shown.

---

## Fix 6 — UX #31 [MUST-FIX]: Bulk button visibility logic for requests

### Currently
Request section has no bulk buttons. Only individual "Выполнено" per request.

### Should be
**Request section bulk buttons (new) — branch on `request.status`, not `assignee`:**
- "Принять все (N)" — visible ONLY when ALL requests are new/open (none accepted)
- "Выдать все (N)" — visible ONLY when ALL requests are accepted (none new/open)
- If mixed states (some new, some accepted) → NO bulk button shown

```javascript
const allRequestsNew = tableRequests.every(r => !r.status || r.status === 'new' || r.status === 'open');
const allRequestsAccepted = tableRequests.length > 0 && tableRequests.every(r => r.status === 'accepted');
```

Bulk "Принять все" calls `onCloseRequest(reqId, 'accepted', { assignee: effectiveUserId, assigned_at: new Date().toISOString() })` for each request sequentially. Disable button while `updateRequestMutation.isPending`.

Bulk "Выдать все" calls `onCloseRequest(reqId, 'done')` for each request.

**Order section bulk buttons:** Preserve existing behavior. No code change needed.

### Must NOT be
- Do NOT add bulk buttons that operate across sections (only within one section).

### File and location — THREE blocks
Request section render blocks:
- ~line 594 (compact), ~line 1199 (expanded), ~line 2134 (legacy)
Add bulk button in request section header, next to the count.

### Verification
With 3 new requests: "Принять все (3)" visible. Accept 1: bulk button disappears (mixed state). Accept all 3: "Выдать все (3)" appears. Button disabled while mutation pending.

---

## Fix 7 — UX #23 [MUST-FIX]: Inline action toast under acted order row

### Currently
Undo toast is global — rendered at bottom of screen as `fixed bottom-4`. Managed by `undoToast` state in parent StaffOrdersMobile component (grep: `const [undoToast, setUndoToast] = useState(null)` ~line 2714). Comment says: `lifted from OrderGroupCard — survives card unmount`.

### Should be
Toast appears INLINE directly under the order row that was just acted on. Dark strip with action info + "Отменить" button + 3s timer.

**⚠️ CRITICAL: Do NOT move `undoToast` state back to OrderGroupCard!** It was intentionally lifted to parent to survive card collapse/unmount (S212 fix). Instead:
1. Keep `undoToast` state in StaffOrdersMobile parent.
2. Keep passing it as prop to OrderGroupCard.
3. Add `orderId` to the toast object so OrderGroupCard knows which row to render it under.
4. Render the inline toast inside `renderHallRows` — after the row whose `order.id` matches `undoToast.orderId`.

**Implementation:**
- In `startUndoWindow` (grep: `startUndoWindow` ~line 1830): change timeout from 5000 to 3000. Add `orderId` to toast object: `{ ...existingFields, orderId: order.id }`.
- In `renderHallRows`: after each dish row `<div>`, check `undoToast?.orderId === order.id`. If match, render inline toast:
  ```jsx
  <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mt-1 flex items-center justify-between">
    <span>{undoToast.label || "Действие выполнено"}</span>
    <button type="button" onClick={handleUndoClick} className="text-white underline ml-3 min-h-[36px]">Отменить</button>
  </div>
  ```
- **Remove** global toast render block (grep: `{undoToast && (` ~line 4201-4206).
- Keep `setUndoToast` prop passing to OrderGroupCard (grep: `setUndoToast={setUndoToast}` ~line 4192).

### Must NOT be
- Do NOT move undoToast state into OrderGroupCard — card unmount will destroy it.
- Do NOT break the undo mechanism — snapshot + restore logic stays same.
- Toast should render under ONE row only (the acted order), not under every row.

### Verification
Tap action on an order → dark toast appears directly below that order row (not at bottom of screen). Collapse/expand the card → toast still present if within 3s. After 3 seconds, toast disappears. Tap "Отменить" → action reversed.

---

## ⛔ SCOPE LOCK — change ONLY what's specified above

- Modify ONLY code described in Fix 1-7 sections.
- Everything else — DON'T TOUCH.
- Do NOT change: polling logic, order fetching, stage computation, authentication, navigation, tab filtering, sort order of table cards in list view, banner notification, sound/vibration, shift filtering.
- Do NOT rename existing variables or functions unless specifically required by a Fix.
- Do NOT refactor code style (formatting, imports, etc.).
- Use the HTML mockup ONLY to resolve styling details within Fix 1-7 scope. Do NOT rewrite unrelated areas to match mockup.

## FROZEN UX (DO NOT CHANGE)

These elements are tested and working — do not modify:
- ✅ Per-item action buttons on dish rows (per-order action, not per-dish)
- ✅ Age-based urgency coloring on collapsed card summary (getSummaryTone)
- ✅ Sub-grouping within In Progress section by stage_id
- ✅ Shift-based filtering (getShiftStartTime)
- ✅ Banner notification system (BannerNotification component)
- ✅ Star/favorites toggle on table cards
- ✅ Confirmation dialog for table close
- ✅ Bill section with per-guest breakdown and totals
- ✅ Collapsed card: per-stage summary lines with urgency color
- ✅ Overdue badge on collapsed cards
- ✅ Undo snapshot+restore logic (only change toast position/timing)

Grep verification before commit:
```bash
grep -n "getSummaryTone" pages/StaffOrdersMobile/staffordersmobile.jsx | head -5   # must exist
grep -n "BannerNotification" pages/StaffOrdersMobile/staffordersmobile.jsx | head -3  # must exist
grep -n "getShiftStartTime" pages/StaffOrdersMobile/staffordersmobile.jsx | head -3   # must exist
grep -n "startUndoWindow" pages/StaffOrdersMobile/staffordersmobile.jsx | head -3     # must exist
```

## Validation Matrix (MANDATORY after implementation)

**Fix 4-6 request flow:**
- [ ] New request → shows [Принять] blue button
- [ ] Tap [Принять] → request becomes accepted, [Выдать] green button + staff pill
- [ ] Accepted request still visible (not filtered from active list)
- [ ] Tap [Выдать] → request done, removed from active list
- [ ] Mixed states (some new + some accepted) → NO bulk button
- [ ] All new → "Принять все (N)" visible, disabled while pending
- [ ] All accepted → "Выдать все (N)" visible

**Fix 5 close-blocker:**
- [ ] Multiple active blockers → multi-line list with counts
- [ ] Tap blocker item → scrolls to corresponding section
- [ ] All blockers resolved → close button enabled, no list

**Fix 7 inline toast:**
- [ ] Action on order → toast under THAT row only (not global, not under all rows)
- [ ] Toast disappears after 3 seconds
- [ ] Collapse/expand card → toast survives (state in parent)
- [ ] Tap "Отменить" → undo works

## Regression Check (MANDATORY)
- [ ] Table card list renders correctly in all tabs (Mine, Free, Others)
- [ ] Tapping table card expands/collapses
- [ ] Per-item action buttons still work (tap → order advances)
- [ ] Existing batch buttons ("Принять все", "Выдать все") still work in ORDER sections
- [ ] Served section still toggles show/hide
- [ ] Bill section still renders per-guest totals
- [ ] Close table dialog still appears when button enabled
- [ ] All 3 render blocks updated consistently

## Implementation Notes
- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4333 lines). TARGET.
- `HALL_UI_TEXT` constant starts at ~line 305. Approved i18n exception — hardcoded Russian strings.
- THREE parallel render blocks: compact (~500-710), expanded (~1100-1320), legacy (~2134-2153). ALL must be updated.
- `onCloseRequest` prop wiring: trace from OrderGroupCard up to parent to find the actual ServiceRequest update handler.
- `effectiveUserId` (~line 2798) and `staffName` (~line 2264) available in parent scope.
- git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "SOM Section Rework: UX #10,11,19,20,21,23,29,31 — lifecycle order, active/passive, dual metric, 2-step requests, staff pill, inline toast, action-oriented close, bulk requests"
=== END ===


## Status
Running...
