---
task_id: task-260331-204438-staffordersmobile-codex-writer
status: running
started: 2026-03-31T20:44:38+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260331-204438-staffordersmobile-codex-writer

## Config
- Budget: $12.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260331-204431-401b
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 12.00
runner: codex
type: chain-step
---
Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/staffordersmobile-260331-204431-401b-codex-findings.md

FORMAT:
# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

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
