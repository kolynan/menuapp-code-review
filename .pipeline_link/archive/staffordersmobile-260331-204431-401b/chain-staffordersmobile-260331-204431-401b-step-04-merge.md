---
chain: staffordersmobile-260331-204431-401b
chain_step: 4
chain_total: 4
chain_step_name: merge
page: StaffOrdersMobile
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260331-204431-401b
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260331-204431-401b-comparison.md
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260331-204431-401b-discussion.md
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
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260331-204431-401b"
   - git push
7. Write merge report to: pipeline/chain-state/staffordersmobile-260331-204431-401b-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

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
