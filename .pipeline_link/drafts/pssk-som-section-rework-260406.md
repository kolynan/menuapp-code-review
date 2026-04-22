---
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 20
agent: cc+codex
chain_template: consensus-with-discussion-v2
---

# SOM Section Rework — UX decisions #10, #11, #19, #20, #21, #23, #29, #31 (#245)

Reference: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` (v2.5), `BUGS_MASTER.md`.
Production page. StaffOrdersMobile = waiter's mobile order management screen.

**Context:** The page already has status-grouped sections (New, Ready, In Progress, Served, Requests) with batch actions and per-item buttons. This task brings existing sections into alignment with the finalized UX document v2.5: reorder sections to lifecycle order, add active/passive visual weight, dual metrics in headers, two-step service request flow, staff pill, inline toast, action-oriented close-table text, and bulk button visibility logic.

**TARGET FILES (modify):** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4333 lines)
**CONTEXT FILES (read-only):**
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — UX decisions document
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — **Interactive HTML mockup (CRITICAL).** Read this file as code. It contains the exact target UI structure with Tailwind CSS classes, section order, component hierarchy, button labels, and visual states. Your implementation MUST match the layout, class names, and behavior shown in this mockup. When a Fix description and the mockup conflict — the mockup wins.

**File integrity check:** Before starting, run `wc -l pages/StaffOrdersMobile/staffordersmobile.jsx`. If result < 4300, restore from RELEASE: `cp "pages/StaffOrdersMobile/260405-00 StaffOrdersMobile RELEASE.jsx" pages/StaffOrdersMobile/staffordersmobile.jsx`.

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

### File and location
Two OrderGroupCard render blocks (one for compact ~lines 500-710, one for expanded ~lines 1100-1320). In each block, find the JSX sections by searching:
- Grep: `newOrders.length > 0 && (` — this is the "New" section start
- Grep: `readyOrders.length > 0 && (` — this is the "Ready" section start
- Grep: `inProgressOrders.length > 0 && (` — this is the "In Progress" section start

In BOTH blocks, move the "In Progress" section to render AFTER "New" and BEFORE "Ready".

### Verification
After fix, confirm render order in JSX: `tableRequests` → `newOrders` → `inProgressOrders` → `readyOrders` → `servedOrders` → bill → close button. Check both render blocks.

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

### File and location
Grep: `text-blue-600` (New section header), `text-green-600` (Ready header), `text-violet-600` (Requests header) — add background pill to these.
Grep: `text-amber-600` (In Progress header), `text-slate-500` (Served header) — add opacity-60 wrapper.

Apply in BOTH render blocks (~lines 500-710 and ~1100-1320).

### Verification
Visual check: active sections (Requests, New, Ready) should stand out with colored background on header. Passive sections (In Progress, Served) should be visually muted with lower opacity.

---

## Fix 3 — UX #19 [MUST-FIX]: Dual metric in section headers ("N guests · N dishes")

### Currently
Section headers show single count: `НОВЫЕ (5)` where 5 = dish count from `countRows()`.

### Should be
Dual metric: `НОВЫЕ (2 гостя · 5 блюд)` where:
- Guest count = number of unique orders in the section (each order = one guest's order)
- Dish count = total items across all orders (current `countRows` value)

Use Russian pluralization: 1 гость/2 гостя/5 гостей, 1 блюдо/2 блюда/5 блюд.

### Must NOT be
- Do NOT show dual metric for Served section (keep simple count).
- Do NOT change how `countRows` is calculated — add guest count alongside it.

### File and location
Grep: `countRows(newRows, newOrders.length)` — New section header
Grep: `countRows(readyRows, readyOrders.length)` — Ready section header

Add helper function near `countRows` (grep: `function countRows`):
```javascript
function pluralRu(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}
function dualMetric(orders, rows) {
  const guests = orders.length;
  const dishes = rows.length || orders.length;
  return `${guests} ${pluralRu(guests, 'гость', 'гостя', 'гостей')} · ${dishes} ${pluralRu(dishes, 'блюдо', 'блюда', 'блюд')}`;
}
```

Replace `countRows(newRows, newOrders.length)` with `dualMetric(newOrders, newRows)` in header text.
Same for Ready and In Progress sections. Apply in BOTH render blocks.

### Verification
Section header should show e.g. `НОВЫЕ (2 гостя · 5 блюд)`, not `НОВЫЕ (5)`.

---

## Fix 4 — UX #20 + #21 [MUST-FIX]: Two-step service request flow + staff pill

### Currently
Service requests show a single "Выполнено" (Done) button. One tap marks request as done. No Accept step. Assignee is saved to DB but not displayed.

### Should be
**Two-step flow:**
1. **New request** → button `[Принять]` (blue). On tap: update request `status='accepted'` + `assignee=effectiveUserId` + `assigned_at=new Date()`.
2. **Accepted request** → button `[Выдать]` (green). On tap: update request `status='done'`.

**Staff pill after Accept:**
After step 1, show assignee name as small pill on the request meta line: `🧾 Счёт · Гость 1 · 2м · [Азиз]` where `[Азиз]` is a small rounded pill (`bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full`).

To get staff name: the request's `assignee` field links to StaffAccessLink. The `staffName` for current user is already available in the component (grep: `staffName`). For other staff, show first 6 characters of assignee ID as fallback.

### Must NOT be
- Do NOT remove the request section or change its position.
- Do NOT change request type icons (Bell, Receipt, etc.).

### File and location
Two request render blocks:
- Grep: `onCloseRequest(request.id, "done")` (~line 607) — compact block
- Grep: `onCloseRequest(request.id, 'done')` (~line 1212) — expanded block

In `HALL_UI_TEXT` (grep: `const HALL_UI_TEXT`), add new keys:
```javascript
  acceptRequest: "Принять",
  serveRequest: "Выдать",
```

In `onCloseRequest` handler (grep: `onCloseRequest`), the current implementation always passes `"done"`. Change the button to conditionally render:
- If `!request.assignee`: show "Принять" button → `onCloseRequest(request.id, "accepted")`
- If `request.assignee`: show "Выдать" button → `onCloseRequest(request.id, "done")`
- If `request.assignee`: also render staff pill before button

⚠️ **CRITICAL wiring detail (verified via grep):**
- Line ~3315: `mutationFn: ({ id, status }) => base44.entities.ServiceRequest.update(id, { status })` — mutation already accepts any status ✅
- Line ~4190: `onCloseRequest={(reqId, status) => updateRequestMutation.mutate({ id: reqId, status: 'done' })}` — **BUG: hardcodes 'done', ignores `status` argument!**
- **Fix:** Change line ~4190 from `status: 'done'` to `status` (pass through the argument).
- **For assignee:** Expand the mutation payload. Change line ~3315 from `{ status }` to accept a full payload object: `mutationFn: (payload) => base44.entities.ServiceRequest.update(payload.id, { status: payload.status, ...(payload.assignee ? { assignee: payload.assignee, assigned_at: payload.assigned_at } : {}) })`.
- Then update line ~4190: `onCloseRequest={(reqId, newStatus) => updateRequestMutation.mutate({ id: reqId, status: newStatus, ...(newStatus === 'accepted' ? { assignee: effectiveUserId, assigned_at: new Date().toISOString() } : {}) })}`
- Grep: `effectiveUserId` — verify this variable exists in the parent StaffOrdersMobile component scope (~line 2700+).

⚠️ **Fix 4 → Fix 6 dependency:** Fix 6 (bulk request buttons) uses the two-step states introduced by Fix 4. Implement Fix 4 BEFORE Fix 6. Bulk "Принять все" calls `onCloseRequest(reqId, 'accepted')` for each request. Bulk "Выдать все" calls `onCloseRequest(reqId, 'done')`.

### Verification
1. New request shows [Принять]. Tap → button changes to [Выдать] + staff pill appears.
2. Tap [Выдать] → request disappears from active list.

---

## Fix 5 — UX #29 [MUST-FIX]: Action-oriented close table text

### Currently
Close button disabled reasons are diagnostic: "Есть невыполненные запросы", "Есть новые блюда", "Есть блюда в работе", "Есть блюда в секции «Готово»".
Grep: `HALL_UI_TEXT.requestsBlocker` through `HALL_UI_TEXT.readyBlocker` (~line 331-334).

### Should be
Action-oriented instructions: tell waiter WHAT TO DO, not what exists. Also make reasons tappable (scroll to relevant section).

Replace blocker texts in `HALL_UI_TEXT`:
```javascript
  requestsBlocker: "Выполнить запросы",
  newBlocker: "Принять новые блюда",
  inProgressBlocker: "Дождаться блюда в работе",
  readyBlocker: "Выдать готовые блюда",
```

Change the disabled reason display from simple text to:
```
Чтобы закрыть стол:
· Выдать 3 блюда     [tappable → scroll to Ready section]
· Выполнить 1 запрос [tappable → scroll to Requests section]
```

Build the reasons list dynamically from all active blockers (not just the first one). The `closeDisabledReason` is currently a single string (first blocker wins). Change to an array of `{ text, count, sectionRef }` objects.

### Must NOT be
- Do NOT change the close button itself (color, size, icon).
- Do NOT change when close is enabled (conditions stay same).

### File and location
Grep: `closeDisabledReason =` (~line 1967) — replace single-string logic with array.
Grep: `{closeDisabledReason && <p` (~lines 702, 1307) — replace `<p>` with list of tappable items.

### Verification
When close is disabled, should show multi-line list of actions needed with counts.

---

## Fix 6 — UX #31 [MUST-FIX]: Bulk button visibility logic for requests

### Currently
Request section has no bulk buttons. Only individual "Выполнено" per request.
Order sections have "Принять все" / "Выдать все" always visible when section has items.

### Should be
**Request section bulk buttons (new):**
- "Принять все (N)" — visible ONLY when ALL requests show [Принять] (all are new, none accepted)
- "Выдать все (N)" — visible ONLY when ALL requests show [Выдать] (all are accepted, none new)
- If mixed states (some new, some accepted) → NO bulk button

**Order section bulk buttons (update existing):**
Same logic as requests: "Принять все (N)" only when ALL orders in New section are first-stage. "Выдать все (N)" only when ALL orders in Ready section are finish-adjacent. Currently bulk buttons are always visible — this is already correct because sections are filtered by status. No change needed for order bulk buttons.

### Must NOT be
- Do NOT add bulk buttons that operate across sections (only within one section).

### File and location
Request section render blocks (grep: `tableRequests.map`):
- ~line 594 (compact) and ~line 1199 (expanded)

Add bulk button in request section header, next to the count. Logic:
```javascript
const allRequestsNew = tableRequests.every(r => !r.assignee);
const allRequestsAccepted = tableRequests.length > 0 && tableRequests.every(r => !!r.assignee && r.status !== 'done');
```

### Verification
With 3 new requests: "Принять все (3)" button visible. After accepting 1: bulk button disappears. After accepting all 3: "Выдать все (3)" appears.

---

## Fix 7 — UX #23 [MUST-FIX]: Inline action toast under dish row

### Currently
Undo toast is global — rendered at bottom of screen as fixed bar (`fixed bottom-4`). Toast shows "[Отменить]" with 5-second timeout. Managed by `undoToast` state lifted to parent StaffOrdersMobile component.

Grep: `{undoToast && (` (~line 4201) — global toast render
Grep: `setUndoToast` — passed down to OrderGroupCard

### Should be
Toast appears INLINE directly under the dish row that was just acted on. Dark strip with: `[Блюдо] → [Статус]  Отменить [3с]`.

Implementation:
1. Move `undoToast` state from StaffOrdersMobile to OrderGroupCard level.
2. In `renderHallRows` (grep: `function renderHallRows` or `renderHallRows =`), after each dish row render, check if this row's order matches `undoToast.orderId`. If yes, render inline toast below it.
3. Toast style: `bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mt-1 flex items-center justify-between`.
4. Toast content: `{dishName} → {newStatusLabel}` + "Отменить" button.
5. Timer: 3 seconds (changed from 5s).

### Must NOT be
- Do NOT keep the global toast at the bottom of the screen — remove it.
- Do NOT break the undo mechanism — snapshot + restore logic stays same.

### File and location
Global toast render: grep `{undoToast && (` (~line 4201-4206) — REMOVE this block.
Global toast state: grep `const [undoToast, setUndoToast] = useState` (~line 2714) — move into OrderGroupCard.
OrderGroupCard prop: grep `setUndoToast={setUndoToast}` (~line 4192) — remove prop, use local state.

In `startUndoWindow` (~line 1830): change timeout from 5000 to 3000. Add `orderId` and `dishName` to toast object.

In `renderHallRows`: after each dish row `<div>`, add conditional inline toast render.

### Verification
Tap action on a dish → dark toast appears directly below that dish row (not at bottom of screen). After 3 seconds, toast disappears. Tap "Отменить" → action reversed.

---

## ⛔ SCOPE LOCK — change ONLY what's specified above

- Modify ONLY code described in Fix 1-7 sections.
- Everything else — DON'T TOUCH.
- Do NOT change: polling logic, order fetching, stage computation, authentication, navigation, tab filtering, sort order of table cards in list view, banner notification, sound/vibration, shift filtering.
- Do NOT rename existing variables or functions unless specifically required by a Fix.
- Do NOT refactor code style (formatting, imports, etc.).

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
- ✅ Undo toast functionality (only change position/timing, keep snapshot logic)

Grep verification before commit:
```bash
grep -n "getSummaryTone" staffordersmobile.jsx | head -5   # must exist
grep -n "BannerNotification" staffordersmobile.jsx | head -3  # must exist
grep -n "getShiftStartTime" staffordersmobile.jsx | head -3   # must exist
grep -n "startUndoWindow" staffordersmobile.jsx | head -3     # must exist
```

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app used by waiters on the go. Verify at 375px width:
- [ ] Close/chevron: right-aligned, sticky top
- [ ] Touch targets >= 44x44px (all buttons, tappable items)
- [ ] No excessive whitespace on small screens
- [ ] Section headers readable at small font sizes
- [ ] Inline toast does not push content off-screen

## Regression Check (MANDATORY after implementation)
- [ ] Table card list renders correctly in all tabs (Mine, Free, Others)
- [ ] Tapping table card expands/collapses
- [ ] Per-item action buttons still work (tap → order advances)
- [ ] Existing batch buttons ("Принять все", "Выдать все") still work in order sections
- [ ] Served section still toggles show/hide
- [ ] Bill section still renders per-guest totals
- [ ] Close table dialog still appears when button enabled

## Implementation Notes
- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4333 lines). TARGET.
- `HALL_UI_TEXT` constant starts at ~line 305. All hardcoded Russian text lives here.
- There are TWO parallel render blocks for OrderGroupCard (compact ~500-710, expanded ~1100-1320). BOTH must be updated for Fixes 1-6.
- `onCloseRequest` prop wiring: trace from OrderGroupCard up to parent to find the actual ServiceRequest update handler.
- i18n: this file uses hardcoded Russian strings in `HALL_UI_TEXT`. No `t()` or `tr()` function. Keep this pattern — add new strings to `HALL_UI_TEXT`.
- git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "SOM Section Rework: UX #10,11,19,20,21,23,29,31 — lifecycle order, active/passive, dual metric, 2-step requests, staff pill, inline toast, action-oriented close"
