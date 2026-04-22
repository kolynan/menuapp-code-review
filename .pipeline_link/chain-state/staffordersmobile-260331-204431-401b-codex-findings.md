# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

## Findings
1. [P2] Fix 1 not applied on the four per-card footer labels — The target expressions at `staffordersmobile.jsx:1808`, `staffordersmobile.jsx:1885`, `staffordersmobile.jsx:1963`, and `staffordersmobile.jsx:2053` still render the old `\u0412\u0441\u0435 ${n} ${dishWord}` / `(config.actionLabel || '\u0412\u044B\u0434\u0430\u0442\u044C')` text. The requested verb-first logic (`\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0451 (${n})` or stripped `config.actionLabel`) was not applied, so the per-card buttons remain unchanged instead of matching SOM-S210-01. FIX: Replace those four expressions with the requested `config.isFinishStage` / stripped-`config.actionLabel` ternary, including the zero-item fallback branch.
2. [P1] Fix 2 undo toast flow is missing entirely for finish-stage actions — `OrderGroupCard` has no `undoToast` state in its local state block (`staffordersmobile.jsx:1475-1479`), the per-card finish-stage buttons still call `handleBatchAction([order])` directly (`staffordersmobile.jsx:1800-1803`, `staffordersmobile.jsx:1877-1880`, `staffordersmobile.jsx:1955-1958`, `staffordersmobile.jsx:2045-2048`), and there is no `handleUndo` function or toast JSX before the component closes (`staffordersmobile.jsx:2080-2168`). Finish-stage actions therefore remain irreversible from the card UI and do not provide the required 5-second recovery path. FIX: Add `undoToast` state to `OrderGroupCard`, capture `{ orderId, prevStatus, prevStageId }` snapshots before finish-stage actions, clear/reset the timeout, implement `handleUndo`, and render the requested toast using the same order update path already used by `handleBatchAction`.

## Summary
Total: 2 findings (0 P0, 1 P1, 1 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): None.
