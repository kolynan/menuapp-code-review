---
task_id: task-260331-205849-staffordersmobile
status: running
started: 2026-03-31T20:58:49+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260331-205849-staffordersmobile

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260331-204431-401b
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: StaffOrdersMobile
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: staffordersmobile-260331-204431-401b
Page: StaffOrdersMobile

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/staffordersmobile-260331-204431-401b-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/staffordersmobile-260331-204431-401b-codex-findings.md
   - If NOT found there, search in pages/StaffOrdersMobile/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/staffordersmobile-260331-204431-401b-comparison.md

FORMAT:
# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

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


## Status
Running...
