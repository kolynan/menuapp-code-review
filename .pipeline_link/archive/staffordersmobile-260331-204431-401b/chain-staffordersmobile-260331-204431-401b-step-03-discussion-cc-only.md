---
chain: staffordersmobile-260331-204431-401b
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: StaffOrdersMobile
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: staffordersmobile-260331-204431-401b
Page: StaffOrdersMobile

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/staffordersmobile-260331-204431-401b-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/staffordersmobile-260331-204431-401b-discussion.md:
     # Discussion Report — StaffOrdersMobile
     Chain: staffordersmobile-260331-204431-401b
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

4. Write final discussion report to: pipeline/chain-state/staffordersmobile-260331-204431-401b-discussion.md

FORMAT:
# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b
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

Target file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines)

## Fix 1 — Verb-first per-card footer button labels

Pattern to find (4 occurrences, ~lines 1808, 1885, 1963, 2053):
```bash
grep -n "dishWord\|\u0412\u0441\u0435.*\u0431\u043b\u044e\u0434" pages/StaffOrdersMobile/staffordersmobile.jsx
```

Replace `\u0412\u0441\u0435 ${n} ${dishWord}` with:
```jsx
n > 0
  ? config.isFinishStage
    ? `\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0451 (${n})`
    : `${(config.actionLabel || '').replace(/^\u2192\s*/, '')} \u0432\u0441\u0451 (${n})`
  : (config.isFinishStage ? '\u0412\u044B\u0434\u0430\u0442\u044C' : (config.actionLabel || '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435').replace(/^\u2192\s*/, ''))
```
Where `config = getStatusConfig(orders[0])` (check actual variable name at each call site).

НЕ должно быть: group header buttons FROZEN, inline per-row buttons FROZEN.

## Fix 2 — Undo toast after finish-stage batch action

State (add to TableCard):
```jsx
const [undoToast, setUndoToast] = React.useState(null);
```

Trigger (finish-stage button click only, config.isFinishStage === true):
```jsx
const snapshots = orders.map(o => ({ orderId: o.id, prevStatus: o.status, prevStageId: o.stage_id ? getLinkId(o.stage_id) : null }));
handleBatchAction(orders);
if (undoToast?.timerId) clearTimeout(undoToast.timerId);
const timerId = setTimeout(() => setUndoToast(null), 5000);
setUndoToast({ snapshots, timerId });
```

Undo handler:
```jsx
const handleUndo = () => {
  if (!undoToast) return;
  clearTimeout(undoToast.timerId);
  undoToast.snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
    const payload = { status: prevStatus };
    if (prevStageId) payload.stage_id = prevStageId;
    updateOrder(orderId, payload);
  });
  setUndoToast(null);
};
```

Toast JSX (inside TableCard, before closing div):
```jsx
{undoToast && (
  <div className="flex items-center justify-between bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mt-2 mx-1">
    <span>{'\u0412\u044B\u0434\u0430\u043D \u0433\u043E\u0441\u0442\u044E'}</span>
    <button onClick={handleUndo} className="ml-3 font-semibold text-amber-300 underline">{'\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C'}</button>
  </div>
)}
```

## FROZEN UX (DO NOT CHANGE)
- Row 1/2/3 (collapsed card) — FROZEN
- Expanded sections ЗАПРОСЫ/НОВЫЕ/ГОТОВО К ВЫДАЧЕ/В РАБОТЕ — FROZEN
- Sub-grouping В РАБОТЕ + auto-expand — FROZEN (SOM-S208-01 S210)
- Inline action buttons per row — FROZEN (#168 S207)
- Group header buttons «Принять все»/«Выдать все» — FROZEN (#5 S207)

## SCOPE LOCK
Modify ONLY: 4 button label expressions + undoToast state + handleUndo + toast JSX.
Do NOT change handleBatchAction logic, computeTableStatus, getStatusConfig, Row 1/2/3.

## Implementation Notes
- Russian strings → unicode escapes
- getStatusConfig available via closure; getLinkId helper exists
- handleBatchAction at ~line 1541 — find actual update fn name there

## MOBILE-FIRST CHECK (MANDATORY before commit)
- [ ] «Принять всё (2)» fits one line at 375px
- [ ] Undo toast visible, «Отменить» touch target ≥ 44px

## Regression Check (MANDATORY after implementation)
- [ ] Collapsed card expands; Row 1 Clock+name+elapsed unchanged
- [ ] Group headers «Принять все»/«Выдать все» unchanged
- [ ] Inline row buttons unchanged; sub-grouping В РАБОТЕ unchanged

## Git
```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "feat(SOM): verb-first per-card buttons + undo toast (SOM-S210-01)"
```
=== END ===
