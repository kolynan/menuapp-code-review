---
task_id: task-260401-114207-staffordersmobile-cc-writer
status: running
started: 2026-04-01T11:42:07+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 15.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260401-114207-staffordersmobile-cc-writer

## Config
- Budget: $15.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260401-114201-9ed3
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 15.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: staffordersmobile-260401-114201-9ed3
Page: StaffOrdersMobile

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for StaffOrdersMobile
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/staffordersmobile-260401-114201-9ed3-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260401-114201-9ed3

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
# SOM Batch: Undo toast fix + ВЫДАНО section (#219 + #220)

Reference: `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md`, `BUGS_MASTER.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app (waiter login required).

**Context:** StaffOrdersMobile is the waiter interface. Orders are grouped by table. Each table card expands to show sections: active orders (Section 1), orders ready to serve / completedOrders (Section 2 — "Готово к выдаче"), in-progress sub-groups. When waiter presses "Выдать всё" — all ready orders become status=`served` and the table card disappears from the active list. Two fixes needed in `OrderGroupCard` component and one new section.

**File:** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4450 lines)
**Component to modify:** `OrderGroupCard` (defined around line 1280, receives props including `setUndoToast`, `advanceMutation`)

---

## Fix 1 — SOM-S213-01 (P1) [MUST-FIX]: Batch "Выдать всё" button does not trigger undo toast

### Сейчас
Waiter presses "Выдать всё" (batch button in Section 2 "Готово к выдаче") → all ready orders become `served` → table card disappears from list. No undo toast appears. The waiter cannot undo an accidental "serve all".

### Должно быть
After pressing "Выдать всё":
1. All ready orders are advanced to `served` (existing behavior — keep it)
2. An undo toast appears at the bottom of the screen: "Выдан гостю · Отменить"
3. Toast stays for 5 seconds, then auto-dismisses
4. If waiter presses "Отменить" — all served orders revert to their previous status/stage_id
5. The undo toast renders at `fixed bottom-4 left-4 right-4 z-50` position (already fixed in commit c27604a)

### НЕ должно быть
- Do NOT change the individual per-order "Выдать" buttons (they already set undoToast correctly)
- Do NOT change the toast JSX render position (already at fixed bottom-4, outside the ternary — commit c27604a)
- Do NOT touch Section 1 buttons (for newOrders/inProgressOrders)

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Component: `OrderGroupCard`
Target: Section 2 batch button ~line 1903–1910:
```jsx
<button
  type="button"
  onClick={() => handleBatchAction(completedOrders)}
```
Search for: `onClick={() => handleBatchAction(completedOrders)}` — this is the batch button WITHOUT undoToast.

The fix: replace the `onClick` with a handler that:
1. Builds `snapshots` array from `completedOrders` (same pattern as individual order buttons ~line 1952–1966)
2. Calls `handleBatchAction(completedOrders)`
3. Creates `timerId = setTimeout(() => setUndoToast(null), 5000)`
4. Calls `setUndoToast({ snapshots, timerId, onUndo: () => { snapshots.forEach(...revert each order...) } })`

Reference pattern: individual order button ~lines 1951–1966 (same file, same component, same section).

`setUndoToast` is already available as a prop in `OrderGroupCard` (~line 1321).
`advanceMutation` is already available in `OrderGroupCard`.
`getLinkId` is already available in `OrderGroupCard`.

### Уже пробовали
- S211 chain 401b: fixed verb-first labels, attempted undoToast but toast was in wrong component (OrderGroupCard state — unmounted after serve)
- S212 ССП commit b00521d: lifted `undoToast` state to parent `StaffOrdersMobile`. Correct approach. But toast still didn't show.
- S213 ССП commit c27604a: moved toast JSX outside ternary to `fixed bottom-4`. Correct. But toast STILL didn't show.
- Root cause now confirmed: the batch "Выдать всё" button (~line 1905) calls `handleBatchAction(completedOrders)` WITHOUT ever calling `setUndoToast`. All previous fixes were correct but targeted wrong places. This is the actual fix needed.

### Проверка
1. Open a table with orders in "Готово к выдаче" section
2. Press "Выдать всё" → table disappears from active list
3. A toast "Выдан гостю · Отменить" appears at bottom of screen
4. Press "Отменить" → orders revert, table reappears in active list

---

## Fix 2 — SOM-UX-24 (P2) [MUST-FIX]: No "ВЫДАНО" section — waiter cannot see served orders

### Сейчас
Once all orders at a table are served (status=`served`), they are excluded from `activeOrders` filter (~line 3486: `o.status !== 'served'`). The table card disappears completely. Waiter has no way to see which orders were already delivered during the current visit.

### Должно быть
Inside the expanded table card (`OrderGroupCard`), add a new **collapsed** section "ВЫДАНО (N)" at the bottom:
- Position: AFTER all active sections (after completedOrders section, after in-progress subgroups), BEFORE bill summary / close table block
- Default state: **collapsed** (not expanded)
- Header: "ВЫДАНО (N)" in slate-400 color (muted — it's history, not actionable)
- Toggle: "Показать ▸" / "Скрыть ▴" button on the right of the header
- Content when expanded: list of served orders — each row: `[guestName] · [time]` (no action buttons, read-only)
- Only shown when `servedOrders.length > 0`
- Section is only loaded when card is `isExpanded` (lazy loading)

ASCII mockup (approved by Arman):
```
├ ВЫДАНО (3) ──────────── [Показать ▸]   ← collapsed default
```
When expanded:
```
┌ ВЫДАНО (3) ─────────── [Скрыть ▴] ──┐
│  Гость 1 · 19:48                     │
│  Гость 2 · 19:55                     │
│  Гость 1 · 20:05                     │
└──────────────────────────────────────┘
```

### НЕ должно быть
- Do NOT include action buttons in ВЫДАНО rows (read-only history)
- Do NOT add ВЫДАНО section to pickup/delivery groups (only for `group.type === 'table'`)
- Do NOT change the global `activeOrders` filter that excludes `served` orders (it's used elsewhere)
- Do NOT load served orders items via extra queries — show only guest name + time for simplicity

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Component: `OrderGroupCard`

Implementation:
1. Add state: `const [servedExpanded, setServedExpanded] = useState(false);` inside `OrderGroupCard`

2. Add query for served orders (inside `OrderGroupCard`, after existing `itemResults` query ~line 1368):
```jsx
const { data: servedOrders = [] } = useQuery({
  queryKey: ['servedOrders', group.id],
  queryFn: () => base44.entities.Order.filter({ table: group.id, status: 'served' }),
  enabled: isExpanded && group.type === 'table',
  staleTime: 30000,
  retry: shouldRetry,
});
```
`base44`, `shouldRetry`, `useQuery` are already imported/available in `OrderGroupCard`.

3. Add the section AFTER the completedOrders section (after ~line 1894 `</div>`) and BEFORE the bill summary / close table block. Search for: `{/* ═══ Section` or find the `completedOrders` section closing `</div>`.

4. For guest name in served orders: use the existing `guestName(order)` helper (already available in `OrderGroupCard`).
For time: `new Date(safeParseDate(order.created_date)).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })` — same pattern as completedOrders rows ~line 1917.

### Проверка
1. Expand a table card that has served orders from current session
2. See "ВЫДАНО (N)" section collapsed at the bottom
3. Tap "Показать ▸" → rows appear with guest names and times
4. Tap "Скрыть ▴" → rows hide

---

## ⛔ FROZEN UX — НЕ ТРОГАТЬ (tested and locked)

These are working and tested — do NOT change:
- Collapsed card format: `[count] [stage_name] · [age мин]` per-stage lines (SOM-UX-23, ✅ Tested S212, commit 3d6f5cf)
- Verb-first buttons: «Принять всё (N)» / «Выдать всё (N)» / «[stage] всё (N)» (SOM-S210-01, ✅ Tested S211)
- Auto-expand first sub-group in В РАБОТЕ (SOM-S208-01, ✅ Tested S210)
- Undo toast JSX position: `fixed bottom-4 left-4 right-4 z-50` outside ternary (commit c27604a — correct, keep as-is)
- Tab switching (active/completed tabs)
- BannerNotification component
- Polling interval logic
- `setUndoToast` prop passing from parent to `OrderGroupCard` (~line 4313)
- `handleUndoGlobal` in parent StaffOrdersMobile (~line 3116)

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `OrderGroupCard` component in `staffordersmobile.jsx`
- Do NOT modify: parent `StaffOrdersMobile` component state or logic
- Do NOT modify: `StaffOrdersMobile` render tree outside of `OrderGroupCard` props
- Do NOT modify: any other component (OrderCard, kitchen view, etc.)
- Do NOT add new imports unless strictly required (base44, useQuery, useState are already available)
- If you see an issue outside Fix 1 and Fix 2 scope — skip it, do not fix

## Implementation Notes
- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4450 lines) — ONLY this file
- `getLinkId` helper: already in scope at OrderGroupCard (~line 1265 area, used throughout)
- `guestName(order)` helper: already in scope at OrderGroupCard
- `safeParseDate(order.created_date)` helper: already in scope
- String encoding: use Unicode escape sequences for Cyrillic strings (existing pattern in file), e.g. `'\u0412\u044B\u0434\u0430\u043D\u043E'` for «Выдано», `'\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C'` for «Показать», `'\u0421\u043A\u0440\u044B\u0442\u044C'` for «Скрыть»
- Do NOT use `node --check` for validation — it fails on JSX/ESM files (KB-111). Use grep verification instead.
- After changes: verify with `grep -c "setUndoToast" pages/StaffOrdersMobile/staffordersmobile.jsx` — should be 6+ matches (existing + new Fix 1 call)
- After changes: verify with `grep -c "servedOrders" pages/StaffOrdersMobile/staffordersmobile.jsx` — should be 3+ matches (query + condition + render)

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: waiter phone on the floor.
Before committing, verify ALL changes at 375px viewport width:
- [ ] ВЫДАНО section header and toggle: touch target ≥ 44×44px
- [ ] ВЫДАНО rows: readable text-sm, no overflow
- [ ] Undo toast (fixed bottom-4): fully visible, not obscured by keyboard or nav bar
- [ ] "Выдать всё" button: still min-h-[44px], no layout changes
- [ ] No duplicate visual indicators introduced

## Regression Check (MANDATORY after implementation)
After implementing, verify these existing behaviors still work:
- [ ] Individual "Выдать" button on each order in Section 2 still works AND sets undo toast
- [ ] "Принять всё (N)" button in Section 1 still works (NOT affected by Fix 1)
- [ ] Collapsed card shows per-stage lines correctly (SOM-UX-23 intact)
- [ ] Tab switching active/completed still works
- [ ] Expanding/collapsing table cards still works
=== END ===


## Status
Running...
