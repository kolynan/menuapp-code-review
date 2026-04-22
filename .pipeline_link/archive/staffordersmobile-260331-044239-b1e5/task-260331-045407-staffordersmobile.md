---
task_id: task-260331-045407-staffordersmobile
status: running
started: 2026-03-31T04:54:07+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 7.50
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260331-045407-staffordersmobile

## Config
- Budget: $7.50
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260331-044239-b1e5
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: StaffOrdersMobile
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: staffordersmobile-260331-044239-b1e5
Page: StaffOrdersMobile

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/staffordersmobile-260331-044239-b1e5-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/staffordersmobile-260331-044239-b1e5-codex-findings.md
   - If NOT found there, search in pages/StaffOrdersMobile/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/staffordersmobile-260331-044239-b1e5-comparison.md

FORMAT:
# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-044239-b1e5

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# SOM Batch: Sub-grouping В РАБОТЕ + Finish-stage Label + Items per Row (#18, #19, #20 Phase 1)

This is a **production page** used by restaurant waiters on mobile browsers (Android Chrome, 375px).

**Reference documents (read-only context):**
- `ux-concepts/staff-orders-mobile.md` v2.1-FINAL — §Решение #18 (sub-grouping), §Решение #19 (finish label), §Решение #20 (items per row), §ASCII-макеты
- `BUGS_MASTER.md` §StaffOrdersMobile — for FROZEN UX baseline

**TARGET FILES (modify):**
- `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines)

**CONTEXT FILES (read-only):**
- `ux-concepts/staff-orders-mobile.md`
- `BUGS_MASTER.md`

> ⚠️ Implementation order: apply Fix 2 first (changes `actionLabel` in `getStatusConfig`), then Fix 1 (uses `actionLabel` for sub-group button labels), then Fix 3 (independent).

---

## Fix 1 — #18 (P1) [MUST-FIX]: Sub-grouping «В РАБОТЕ» section by partner stage

### Сейчас (current behavior)
The «В РАБОТЕ» section inside `OrderGroupCard` renders all intermediate-stage orders as one flat collapsed list with no distinction between different stages. Orders at «ПРИНЯТО» and orders at «ГОТОВИТСЯ» appear mixed, with no per-stage action buttons.

Locate in `pages/StaffOrdersMobile/staffordersmobile.jsx`:
- `inProgressOrders` definition (~line 1342): search for `inProgressOrders = useMemo`
  ```javascript
  const inProgressOrders = useMemo(() => activeOrders.filter(o => !getStatusConfig(o).isFirstStage), [...]);
  ```
- `inProgressExpanded` state (~line 1455): search for `inProgressExpanded`
- «В работе» section rendering (~lines 1838–1890): search for `"В работе"` string or `inProgressOrders.map`

### Должно быть (expected behavior)
Group `inProgressOrders` by stage. Each unique stage gets its own collapsible sub-section.

**Step A — Add `orderStages` prop to `OrderGroupCard`:**
Add `orderStages` (the raw stages array) as a new optional prop to `OrderGroupCard` function signature (~line 1301).

The parent component renders `OrderGroupCard` at lines 3964–3986. The parent already has the stages array available as **`sortedStages`** (computed at line 2987: `const sortedStages = useMemo(() => [...orderStages].sort(...))`).

In the parent call site (~line 3984, inside the `v2SortedGroups.map(group => ...)` block), add the prop:
```jsx
orderStages={sortedStages}
```
Add it after `activeRequests={activeRequests}` (line 3983), before `onCloseRequest=`.

Inside `OrderGroupCard`, accept it as `orderStages = []` (with default). If `orderStages` is empty or unavailable, fall back to displaying sub-groups in iteration order (no sort).

**Step B — Build sub-groups:**
Inside `OrderGroupCard`, compute sub-groups from `inProgressOrders`:
```javascript
// Group inProgressOrders by normalized stage_id
const subGroups = useMemo(() => {
  const groups = {};
  for (const order of inProgressOrders) {
    const sid = getLinkId(order.stage_id) || '__null__';
    if (!groups[sid]) groups[sid] = [];
    groups[sid].push(order);
  }

  // Convert to array and sort: stage closest to finish = first (highest index in orderStages)
  return Object.entries(groups)
    .map(([sid, orders]) => {
      const cfg = getStatusConfig(orders[0]);
      return { sid, orders, cfg };
    })
    .sort((a, b) => {
      if (a.sid === '__null__') return 1;   // catch-all → last
      if (b.sid === '__null__') return -1;
      // Higher index in orderStages array = closer to finish = shown first
      const idxA = orderStages ? orderStages.findIndex(s => getLinkId(s.id) === a.sid) : -1;
      const idxB = orderStages ? orderStages.findIndex(s => getLinkId(s.id) === b.sid) : -1;
      return idxB - idxA;  // descending: higher index first
    });
}, [inProgressOrders, getStatusConfig, orderStages]);
```

**Step C — Expand state per sub-group:**
Replace single `inProgressExpanded` boolean with per-sub-group state:
```javascript
// Replace:  const [inProgressExpanded, setInProgressExpanded] = useState(false);
// With:
const [expandedSubGroups, setExpandedSubGroups] = useState({});
// Initialize first sub-group as expanded when section opens:
// When inProgressExpanded becomes true and expandedSubGroups is empty →
// auto-expand the first subGroup.sid
```
⚠️ Keep the top-level `inProgressExpanded` toggle for the entire «В работе» section header (it still exists). Only the internal sub-group expand/collapse is new.

**Step D — Render sub-groups:**
Replace the flat `inProgressOrders.map(...)` render (~lines 1849–1890) with sub-group sections:

```
┌ В работе (N) ─────────────────── [expand/collapse toggle]   ← existing section header, keep as-is
  ┌ ГОТОВИТСЯ (2) ──────── [Все → Выдать]   ← sub-group header, expanded by default
  │  [order card — see Fix 3 for card structure]
  │  [order card]
  └──────────────────────────────────────────
  ├ ПРИНЯТО (1) ──────── [Все → Готовится]  ← sub-group header, collapsed by default
  │  1 заказ
  └──────────────────────────────────────────
  ├ В РАБОТЕ (1) ──────── [Все → ...]       ← catch-all for null stage_id, at bottom
  └──────────────────────────────────────────
```

Sub-group header structure:
- Stage name + count: use `cfg.label` as stage name (from `getStatusConfig`)
- Group action button: `"Все → " + subGroupActionLabel` where:
  ```javascript
  const raw = cfg.actionLabel || '';  // after Fix 2: "Выдать" or "→ Готовится" etc.
  const subGroupActionLabel = raw.startsWith('→ ') ? raw.slice(3) : raw;
  // Examples: "→ Готовится" → "Все → Готовится"; "Выдать" → "Все → Выдать"
  ```
- The group action button calls `handleBatchAction(subGroup.orders)`
- Touch target for sub-group header: min-height 44px

Sub-group expand toggle: clicking header toggles `expandedSubGroups[sid]`.

**Step E — Flatten rule:**
If `subGroups.length === 1` (only one active intermediate stage): render WITHOUT sub-group header wrapper — show orders as the current flat list. Still show a single section-level "Все → [action]" button in the «В работе» header (using that single group's action label).

**Catch-all group label:**
For `sid === '__null__'` (null stage_id): use label «В РАБОТЕ» for the sub-group header.

### НЕ должно быть
- Do NOT modify the НОВЫЕ section (header, [Принять все] button, order rendering) — ✅ FROZEN
- Do NOT modify the ГОТОВО К ВЫДАЧЕ section — ✅ FROZEN
- Do NOT add a top-level group action button to the «В работе» section header itself (the collapse toggle stays, no batch button added at top level)
- Do NOT restructure `newOrders`, `completedOrders`, `activeOrders` useMemo definitions
- Do NOT modify `handleBatchAction` implementation

### Проверка
1. Open table with orders in 2+ different intermediate stages (e.g., some ПРИНЯТО, some ГОТОВИТСЯ)
2. «В работе» shows sub-sections, one per active stage
3. Sub-section closest to finish (e.g., ГОТОВИТСЯ) is shown first and expanded; others collapsed
4. Sub-section header shows «Все → Выдать» (or correct next stage name) — clicking it advances all orders in that sub-group
5. If only one intermediate stage has orders → flat list (no sub-group headers)
6. Orders with null stage_id appear in catch-all «В РАБОТЕ» sub-section at bottom

---

## Fix 2 — #19 (P1) [MUST-FIX]: Finish-stage button label «Выдать» instead of «→ [FinishStageName]»

### Сейчас (current behavior)
For orders on the stage just before the finish stage (e.g., ГОТОВИТСЯ when the final custom stage is «Выдан гостю»), the action button label is «→ Выдан гостю». This reads as a completed state, not a call to action.

Locate in `pages/StaffOrdersMobile/staffordersmobile.jsx`:
- `getStatusConfig` function: search for `function getStatusConfig` or `getStatusConfig =` (~around lines 2095–2165)
- The specific line to change: search for `actionLabel: nextStage` inside the stage-mode branch (~line 2128):
  ```javascript
  actionLabel: nextStage ? `→ ${nextStage.name}` : null,
  ```

### Должно быть
When the NEXT stage is the finish stage (i.e., pressing the button moves the order to the final stage), use the action verb «Выдать» instead of «→ [finishStageName]».

Change ONLY the `actionLabel` line inside the **stage-mode branch** of `getStatusConfig`:
```javascript
// BEFORE:
actionLabel: nextStage ? `→ ${nextStage.name}` : null,

// AFTER:
const nextIsFinish = nextStage && (
  nextStage.internal_code === 'finish' ||
  (currentIndex + 1) === relevantStages.length - 1
);
actionLabel: nextStage ? (nextIsFinish ? 'Выдать' : `→ ${nextStage.name}`) : null,
```

The STATUS_FLOW fallback branch already has `actionLabel: "Выдать"` for `ready` status — do NOT change it.

### НЕ должно быть
- Do NOT change `actionLabel` for intermediate→intermediate transitions («→ Готовится» stays as «→ Готовится»)
- Do NOT change the `STATUS_FLOW` constant (~line 212)
- Do NOT change `isFinishStage`, `nextStageId`, `nextStatus`, `label` or any other fields in the `getStatusConfig` return object
- Do NOT change the STATUS_FLOW fallback branch of `getStatusConfig`

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `const STATUS_FLOW` (~line 212): read-only, do NOT modify
- `getStatusConfig` function start: search for `getStatusConfig` keyword, find stage-mode branch (~lines 2095–2165)
- Target line: search for `actionLabel: nextStage ?` inside stage-mode branch (~line 2128)

### Проверка
1. Open table with custom-stage orders (not STATUS_FLOW fallback)
2. Find order on the stage directly before the last stage (e.g., ГОТОВИТСЯ → «Выдан гостю»)
3. Inline action button now shows «Выдать» instead of «→ Выдан гостю»
4. Clicking «Выдать» still advances the order to the finish stage (logic unchanged)
5. Orders on earlier stages still show «→ Готовится» (not «Выдать»)
6. STATUS_FLOW fallback: orders with `status=ready` still show «Выдать» (unchanged)

---

## Fix 3 — #20 Phase 1 (P1) [MUST-FIX]: Dish items on separate rows + action button in card footer

### Сейчас (current behavior)
Inside `OrderGroupCard` (~line 1300), order items are rendered as a comma-joined single line. The same pattern appears in 3 places (НОВЫЕ, ГОТОВО К ВЫДАЧЕ, В РАБОТЕ sections):
```javascript
orderItems.map(i => `${i.dish_name}×${i.quantity}`).join(', ')
```
Search: `orderItems.map.*dish_name.*join` — appears ~3 times inside `OrderGroupCard` (NOT inside standalone `OrderCard`):
- ~line 1759: inside НОВЫЕ section order rendering
- ~line 1823: inside ГОТОВО К ВЫДАЧЕ section order rendering
- ~line 1884: inside В РАБОТЕ section order rendering

The action button for each order currently sits in the **header/upper area** of the card, before the items list. Search for `e.stopPropagation.*handleBatchAction.*\border\b` to find these inline buttons (~lines 1748, 1812, 1873).

### Должно быть

**A. Items on separate lines (apply in all 3 locations):**

Replace the `orderItems.map(...).join(', ')` pattern with a vertical list:
```jsx
{orderItems.length > 0 ? (
  <div className="mt-1 space-y-0.5">
    {orderItems.map((item, idx) => (
      <div key={item.id || idx} className="text-xs text-slate-500">
        · {item.dish_name} ×{item.quantity}
      </div>
    ))}
  </div>
) : (
  <div className="text-xs text-slate-400 mt-1">Загрузка...</div>
)}
```

**B. Action button moved to card footer (apply in all 3 locations):**

REMOVE the existing inline action button from the header/upper area of the card.

ADD the action button at the BOTTOM of the card (after the items list), as the last element inside the card container:
```jsx
{/* Card footer: action button — always AFTER items, never adjacent to any individual dish row */}
{(config.actionLabel || config.isFinishStage) && (
  <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-end">
    <button
      className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium min-h-[36px]"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={updateStatusMutation?.isPending || false}
    >
      {(updateStatusMutation?.isPending)
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : orderItems.length > 0
          ? `Все ${orderItems.length} блюд`
          : (config.actionLabel || 'Выдать')
      }
    </button>
  </div>
)}
```

Visual result per ASCII-макет from UX spec:
```
┌ Гость 1 · 21:16 · Принято
│  · Цезарь ×1
│  · Икра кабачковая ×1
│
│  Все 2 блюда
│  [→ Готовится]
└───────────────────────── ЗАЛ-011
```

**Important:** the footer button uses `config` from `getStatusConfig(order)`. In the existing code, each section's `.map(order => {...})` starts with `const config = getStatusConfig(order)` — use exactly this variable name (`config`). Verify by searching for `const config = getStatusConfig` inside `OrderGroupCard` before making changes.

### НЕ должно быть
- Do NOT leave the old `orderItems.map(...).join(', ')` rendering anywhere in `OrderGroupCard`
- Do NOT have any action button adjacent to or between individual dish rows — button is ONLY in footer
- Do NOT modify the standalone `OrderCard` component function (~lines 984–1295) — only modify `OrderGroupCard` internal rendering (~lines 1709–1890)
- Do NOT change the collapsed table card summary rendering (СЕЙЧАС/ЕЩЁ in `computeTableStatus` and its rendering) — that is different code

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `OrderCard` function (standalone, do NOT modify): search for `function OrderCard` (~line 984)
- `OrderGroupCard` function start: search for `function OrderGroupCard` (~line 1300)
- НОВЫЕ section item rendering (~line 1759): search for first `orderItems.map.*dish_name.*join` inside `OrderGroupCard`
- ГОТОВО К ВЫДАЧЕ section item rendering (~line 1823): search for second occurrence
- В РАБОТЕ section item rendering (~line 1884): search for third occurrence
- Existing inline action buttons to REMOVE: search for `e.stopPropagation.*handleBatchAction.*\border\b` (~lines 1748, 1812, 1873)

### Проверка
1. Open any table with multiple orders, expand НОВЫЕ section
2. Each dish appears on its own line: `· Цезарь ×1` then `· Икра ×2` (separate lines, not joined with comma)
3. Footer button «Все 2 блюда» appears at the BOTTOM of the card, after all dish rows, separated by a thin border line
4. The footer button is NOT adjacent to any dish row — visual gap between dishes and button
5. Clicking footer button advances the order (same behavior as before)
6. Repeat verification for ГОТОВО К ВЫДАЧЕ and В РАБОТЕ sections
7. Standalone OrderCard (if visible elsewhere on page) is UNCHANGED

---

## ⛔ SCOPE LOCK — modify ONLY what is described above

- Modify ONLY: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- ALLOWED changes:
  - Add `orderStages` prop to `OrderGroupCard` and its call site (Fix 1)
  - New sub-group state and rendering inside «В работе» section in `OrderGroupCard` (Fix 1)
  - Single line change to `actionLabel` in stage-mode branch of `getStatusConfig` (Fix 2)
  - Replace 3× `orderItems.map(...).join(', ')` with vertical list in `OrderGroupCard` (Fix 3)
  - Remove 3× inline action buttons from card headers in `OrderGroupCard`, add footer buttons (Fix 3)
- DO NOT touch:
  - Standalone `OrderCard` component (~lines 984–1295)
  - `handleBatchAction` implementation
  - `STATUS_FLOW` constant (~line 212)
  - НОВЫЕ section header and [Принять все] button
  - ГОТОВО К ВЫДАЧЕ section header and [Выдать все] button
  - Service requests section (rendering and [Выполнено] button)
  - Collapsed table card summary (СЕЙЧАС/ЕЩЁ, `computeTableStatus`)
  - `computeTableStatus` function
  - Any page outside `OrderGroupCard` and `getStatusConfig`

---

## FROZEN UX — DO NOT CHANGE (✅ Tested S203/S207/S208)

These elements are confirmed working on Android. Do NOT modify class names, logic, or rendering for:

- **[#1]** Collapsed table card actionable summary — СЕЙЧАС/ЕЩЁ format
  - Verify preserved: `grep -n "СЕЙЧАС\|ЕЩЁ" pages/StaffOrdersMobile/staffordersmobile.jsx`
- **[#2]** Section structure: НОВЫЕ → ГОТОВО К ВЫДАЧЕ → В РАБОТЕ (order and existence)
- **[#3]** Single-tap action mechanism on each order (Fix 3 only MOVES button position, does NOT change click handlers or advance logic)
- **[#5]** [Принять все] in НОВЫЕ header; [Выдать все] in ГОТОВО К ВЫДАЧЕ header
  - Verify preserved: `grep -n "Принять все\|Выдать все\|handleBatchAction(newOrders\|handleBatchAction(completedOrders" pages/StaffOrdersMobile/staffordersmobile.jsx`
- **[#6]** Service requests section with [Выполнено] per-request button
- **[#7]** Service request badges on collapsed table card

---

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first app. Verify at 375px width:
- [ ] Sub-group section headers: touch target ≥ 44px height, full-width tappable area
- [ ] «Все → [stage]» sub-group buttons: touch target ≥ 36px height, clearly distinguishable from order content
- [ ] Dish item rows: text wraps naturally, no overflow on 375px screen
- [ ] Footer action button: right-aligned, does NOT overflow card width
- [ ] No excessive whitespace between dish items and footer button (max mt-2)
- [ ] Collapsed sub-groups show item count clearly (not blank white space)

---

## Regression Check (MANDATORY after implementation)

Verify these existing behaviors are unchanged after all three fixes:
- [ ] [Принять все] in НОВЫЕ advances all new orders → orders move to next stage
- [ ] [Выдать все] in ГОТОВО К ВЫДАЧЕ is visible and functional
- [ ] Service requests section renders; [Выполнено] removes the request
- [ ] Collapsed table card shows СЕЙЧАС/ЕЩЁ summary (not affected by OrderGroupCard changes)
- [ ] Footer button on single order correctly advances it (not a batch advance)
- [ ] STATUS_FLOW fallback: orders without custom stages still show correct labels

---

## Implementation Notes

- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines). Use `getLinkId()` for all stage_id comparisons (already defined in file).
- Dependency: Fix 2 logic must be consistent with Fix 1 sub-group button label computation. After Fix 2, `actionLabel` for finish-adjacent orders = «Выдать». The sub-group button strips leading «→ » before prepending «Все → ».
- `updateStatusMutation` variable name may differ inside `OrderGroupCard` vs `OrderCard` — check the correct variable name at each render location before using it in the footer button.
- **G3 weight note:** Fix 1 is H-weight, Fix 2+3 are M-weight. Combined deliberately per `ux-concepts/staff-orders-mobile.md` §Приоритеты реализации: "включить в ту же КС". Separation would cause merge conflict (Fix 1 restructures the В РАБОТЕ section that Fix 3 also modifies). Budget $15 covers the combined scope.
- FROZEN UX grep verification before commit:
  - `grep -n "Принять все\|handleBatchAction(newOrders" pages/StaffOrdersMobile/staffordersmobile.jsx` — must find existing batch action for НОВЫЕ
  - `grep -n "Выдать все\|handleBatchAction(completedOrders" pages/StaffOrdersMobile/staffordersmobile.jsx` — must find existing batch action for ГОТОВО К ВЫДАЧЕ
  - `grep -n "СЕЙЧАС\|ЕЩЁ" pages/StaffOrdersMobile/staffordersmobile.jsx` — must find summary format strings
- Git commit after all fixes: `git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "SOM #18 sub-grouping + #19 finish label + #20 items per row (Phase 1)"`
=== END ===


## Status
Running...
