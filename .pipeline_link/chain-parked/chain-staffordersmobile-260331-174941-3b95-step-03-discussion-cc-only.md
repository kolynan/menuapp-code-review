---
chain: staffordersmobile-260331-174941-3b95
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: StaffOrdersMobile
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: staffordersmobile-260331-174941-3b95
Page: StaffOrdersMobile

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/staffordersmobile-260331-174941-3b95-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/staffordersmobile-260331-174941-3b95-discussion.md:
     # Discussion Report — StaffOrdersMobile
     Chain: staffordersmobile-260331-174941-3b95
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   For each dispute, write your analysis considering BOTH CC and Codex findings:

   a) Read the original code in the repository to understand the current implementation.
   b) Evaluate CC's proposed solution:
      - Correctness, edge cases, risks
   c) Evaluate Codex's proposed solution:
      - Correctness, edge cases, risks
   d) Pick the better solution OR propose a compromise, with clear reasoning.
   e) If neither solution is safe → mark as SKIP with explanation.

   IMPORTANT: Be fair. Do not automatically prefer CC's solution.
   Judge each dispute on technical merits only.

4. Write final discussion report to: pipeline/chain-state/staffordersmobile-260331-174941-3b95-discussion.md

FORMAT:
# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260331-174941-3b95
Mode: CC-Only (v2)

## Disputes Analyzed
Total: N disputes from Comparator

### Dispute 1: [title]
**CC Solution:** ...
**Codex Solution:** ...
**CC Analysis:** [technical reasoning comparing both]
**Verdict:** CC / Codex / Compromise / SKIP
**Reasoning:** [1-2 sentences why]

### Dispute 2: [title]
...

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Title   | CC/Codex/Compromise/SKIP | Brief reason |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Skipped (for Arman)
Items where neither solution is safe or where the dispute cannot be resolved technically.
Each item shows both positions and why neither is sufficient.

5. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# SOM-S210-01: Verb-first per-card buttons + Undo toast

Reference:
- `ux-concepts/staff-orders-mobile.md` v2.2, Решения #23 (FINAL)
- `ux-concepts/StaffOrdersMobile/GPT_SOM_UX_S210.md`
- `BUGS_MASTER.md` SOM-S210-01

Target file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines)

---

## Fix 1 — SOM-S210-01 (P1) [MUST-FIX]: Per-card footer button labels — verb-first

### Сейчас
Per-card footer buttons in the expanded section show:
```
Все 2 блюда    ← for НОВЫЕ section
Все 3 блюда    ← for ГОТОВО К ВЫДАЧЕ section
Все 1 блюдо    ← for В РАБОТЕ section
```
Pattern: `\u0412\u0441\u0435 ${n} ${dishWord}` (4 occurrences, ~lines 1808, 1885, 1963, 2053)

Problems:
- No verb — waiter doesn't know what action will happen
- Must open card mentally to understand the button
- Inconsistent with LMP (Square/Uber Eats: verb first)

### Должно быть
Replace all 4 button label expressions with verb-first format:

| Section | n > 0 label | n === 0 fallback |
|---------|------------|-----------------|
| НОВЫЕ (isFirstStage) | `Принять всё (N)` | `Принять` |
| ГОТОВО К ВЫДАЧЕ (isFinishStage) | `Выдать всё (N)` | `Выдать` |
| В РАБОТЕ (mid-stage) | `[actionLabel] всё (N)` e.g. `Готовится всё (2)` | `[actionLabel]` |

### Implementation

Find all 4 occurrences of the pattern (grep first):
```bash
grep -n "dishWord\|Все.*блюд" pages/StaffOrdersMobile/staffordersmobile.jsx
```

For each occurrence, replace the button label expression. The `config` / `statusConfig` object for the current order group is available via `getStatusConfig(orders[0])` or equivalent at each location.

Replace:
```jsx
`\u0412\u0441\u0435 ${n} ${dishWord}`
```

With:
```jsx
n > 0
  ? config.isFinishStage
    ? `\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0451 (${n})`
    : `${(config.actionLabel || '').replace(/^\u2192\s*/, '')} \u0432\u0441\u0451 (${n})`
  : (config.isFinishStage ? '\u0412\u044B\u0434\u0430\u0442\u044C' : (config.actionLabel || '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435').replace(/^\u2192\s*/, ''))
```

Where `config = getStatusConfig(orders[0])` (or the equivalent variable name at each call site — check what variable is used locally).

**Important:** `actionLabel` for НОВЫЕ typically starts with `→` (e.g. `→ Принято`). Strip the `→` prefix using `.replace(/^\u2192\s*/, '')` before concatenating ` всё (N)`.

### НЕ должно быть
- Do NOT change group header buttons («Принять все» / «Выдать все») — FROZEN (#5 ✅ Tested)
- Do NOT change inline per-row action buttons («→ Принято», «→ Готовится», «Выдать») — FROZEN (#168 ✅ Tested S207)
- Do NOT use hardcoded «Принять» / «Выдать» except for isFirstStage/isFinishStage fallbacks

---

## Fix 2 — SOM-S210-01 (P1) [MUST-FIX]: Undo toast after «Выдать всё»

### Сейчас
After tapping «Выдать всё (N)» (finish-stage batch action), the orders immediately disappear from the list — no undo possible.

### Должно быть
After any finish-stage batch action (`handleBatchAction` called when `config.isFinishStage === true`):
1. Show undo toast: `«Выдан гостю · Отменить»` for 5 seconds
2. If «Отменить» tapped within 5 seconds: reverse the mutation (restore previous status/stage)
3. After 5 seconds with no undo: dismiss toast silently (mutation already committed)

Toast renders INSIDE the table card (not global), below the action buttons.

### State

Add near the top of `TableCard` component (after existing state declarations):
```jsx
// SOM-S210-01: undo toast state
const [undoToast, setUndoToast] = React.useState(null);
// undoToast shape: { snapshots: [{orderId, prevStatus, prevStageId}], timerId } | null
```

### Trigger — wrap handleBatchAction calls for finish-stage

When the per-card footer button is clicked AND `config.isFinishStage === true`:

```jsx
// BEFORE calling handleBatchAction, capture snapshots:
const snapshots = orders.map(o => ({
  orderId: o.id,
  prevStatus: o.status,
  prevStageId: o.stage_id ? getLinkId(o.stage_id) : null,
}));

// Call batch action:
handleBatchAction(orders);

// Show undo toast:
if (undoToast?.timerId) clearTimeout(undoToast.timerId);
const timerId = setTimeout(() => setUndoToast(null), 5000);
setUndoToast({ snapshots, timerId });
```

Only trigger undo toast when `config.isFinishStage === true`. Do NOT show toast for НОВЫЕ / В РАБОТЕ actions.

### Undo handler

```jsx
const handleUndo = () => {
  if (!undoToast) return;
  clearTimeout(undoToast.timerId);
  // Reverse each order: restore prevStatus + prevStageId
  undoToast.snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
    const payload = { status: prevStatus };
    if (prevStageId) payload.stage_id = prevStageId;
    // Use the same update mechanism as handleBatchAction — updateOrder or equivalent mutation
    // Search for how handleBatchAction updates individual orders and use the same pattern
    updateOrder(orderId, payload); // or equivalent — check actual function name
  });
  setUndoToast(null);
};
```

**Important:** Find the actual order update function used in `handleBatchAction` (search `handleBatchAction` implementation ~line 1541) and use the same function/hook for undo.

### Toast JSX

Add INSIDE `TableCard` return, just before the closing `</div>` of the card:

```jsx
{/* SOM-S210-01: Undo toast */}
{undoToast && (
  <div className="flex items-center justify-between bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mt-2 mx-1">
    <span>{'\u0412\u044B\u0434\u0430\u043D \u0433\u043E\u0441\u0442\u044E'}</span>
    <button
      onClick={handleUndo}
      className="ml-3 font-semibold text-amber-300 underline"
    >
      {'\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C'}
    </button>
  </div>
)}
```

### НЕ должно быть
- Do NOT show undo toast for non-finish-stage actions (НОВЫЕ, В РАБОТЕ)
- Do NOT add global toast — toast is scoped to the card component
- Do NOT block the action while waiting — action fires immediately, undo reverses it

---

## FROZEN UX (DO NOT CHANGE)

- **Row 1** — `{identifier}` + `{elapsedLabel}` with Clock icon (~line 1636-1644) — FROZEN (#164 ✅ Tested S203)
- **Row 2** — channel + statusLabel + needsAction dot + contacts + favorite star (~line 1647-1686) — FROZEN
- **Row 3** — СЕЙЧАС/ЕЩЁ summary (collapsed card) — FROZEN until SOM-UX-23 КС
- **Expanded section structure** — ЗАПРОСЫ / НОВЫЕ / ГОТОВО К ВЫДАЧЕ / В РАБОТЕ — FROZEN
- **Sub-grouping В РАБОТЕ** — expandedSubGroups, auto-expand first group — FROZEN (SOM-S208-01 ✅ Tested S210)
- **Inline action buttons** — «→ Принято», «→ Готовится», «Выдать» per row — FROZEN (#168 ✅ Tested S207)
- **Group header buttons** — «Принять все» / «Выдать все» — FROZEN (#5 ✅ Tested S207)
- **Close table blocking** — disabled + explanation text — FROZEN (#173 ✅ Tested S208)
- **Service requests expanded** — ЗАПРОСЫ block, «Выполнено» button — FROZEN (#167 ✅ Tested S203)

## SCOPE LOCK — менять ТОЛЬКО per-card кнопки и undo toast

- Modify ONLY: button label expressions (Fix 1, 4 locations) + undoToast state + handleUndo + toast JSX (Fix 2)
- Do NOT change `handleBatchAction` logic itself — only wrap the call site
- Do NOT change `computeTableStatus`, `getStatusConfig` — FROZEN
- Do NOT change any collapsed card rendering (Row 1/2/3) — FROZEN

## Implementation Notes

- All Russian strings → `\uXXXX` unicode escapes (codebase convention)
- `getStatusConfig` is available via closure in `TableCard`
- `getLinkId` helper exists in file
- `handleBatchAction` implementation at ~line 1541 — check actual update function name used there

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Button text «Принять всё (2)» fits on one line (no overflow)
- [ ] Undo toast visible without scrolling
- [ ] Toast touch target «Отменить» ≥ 44px height

## Regression Check (MANDATORY after implementation)

- [ ] Tap collapsed card → expands correctly
- [ ] Row 1 shows table name + elapsed time (Clock icon unchanged)
- [ ] Row 2 shows channel type + status label unchanged
- [ ] Group header «Принять все» / «Выдать все» unchanged
- [ ] Inline row buttons «→ Принято» / «→ Готовится» / «Выдать» unchanged
- [ ] Sub-grouping В РАБОТЕ sections still render with auto-expand first group
- [ ] ЗАПРОСЫ / НОВЫЕ / ГОТОВО К ВЫДАЧЕ sections all render
- [ ] computeTableStatus card border colors unchanged

## Git

```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "feat(SOM): verb-first per-card buttons + undo toast (SOM-S210-01)"
```
=== END ===
