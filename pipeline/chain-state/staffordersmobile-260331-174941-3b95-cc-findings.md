# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-174941-3b95

## Findings

### Fix 1 — Verb-first per-card button labels

1. **[P1] isFirstStage label derives stage NAME, not imperative verb** — In stage mode, `getStatusConfig` returns `actionLabel: '→ Принято'` (next stage name, participle) for first-stage orders (~line 3216). The task spec's implementation formula `config.actionLabel.replace(/^→\s*/, '')` would produce `Принято всё (2)` instead of the required `Принять всё (2)` (imperative verb). The spec's table clearly says НОВЫЕ → `Принять всё (N)`. **FIX:** Add explicit `isFirstStage` check BEFORE the `isFinishStage` check in the ternary. For isFirstStage, use hardcoded `'\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0451 (${n})'` instead of deriving from actionLabel. Full replacement for the `n > 0` case:
```jsx
n > 0
  ? config.isFirstStage
    ? `\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0432\u0441\u0451 (${n})`
    : config.isFinishStage
      ? `\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0451 (${n})`
      : `${(config.actionLabel || '').replace(/^\u2192\s*/, '')} \u0432\u0441\u0451 (${n})`
  : config.isFirstStage
    ? '\u041F\u0440\u0438\u043D\u044F\u0442\u044C'
    : config.isFinishStage
      ? '\u0412\u044B\u0434\u0430\u0442\u044C'
      : (config.actionLabel || '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435').replace(/^\u2192\s*/, '')
```

2. **[P2] All 4 occurrences confirmed at lines 1808, 1885, 1963, 2053** — Two patterns exist: (a) Lines 1808/1885 are inside an IIFE `(() => { ... })()` where `n` is computed locally and `config` comes from outer scope; (b) Lines 1963/2053 have `n` and `config` computed earlier in the `.map()` callback. Both patterns have `config` available. The `dishWord` variable becomes unused after this change and can be removed (its only use was in the old label). **FIX:** Apply the same replacement at all 4 locations. Remove the now-unused `dishWord` computation at lines 1797, 1874, 1928, 2018.

3. **[P2] Lines 1797 and 1874 — IIFE can be simplified** — After replacing the label, the IIFE at lines 1795-1814 and 1872-1891 only computes `n = orderItems.length` (dishWord removed). The IIFE is no longer needed — `n` can be inlined as `orderItems.length` directly in the label expression, or `n` can be moved outside the IIFE and the IIFE removed. However, per SCOPE LOCK, minimal change is preferred — just replacing the label and removing `dishWord` is sufficient. **FIX:** Keep IIFE for now (minimal change), just remove `dishWord` line and update label.

### Fix 2 — Undo toast after «Выдать всё»

4. **[P1] Spec says `updateOrder` but function doesn't exist — must use `advanceMutation.mutate`** — The task spec's `handleUndo` uses `updateOrder(orderId, payload)` which doesn't exist in the codebase. The actual order update mechanism is `advanceMutation.mutate({ id: orderId, payload })` (~line 1562). **FIX:** Replace `updateOrder(orderId, payload)` with `advanceMutation.mutate({ id: orderId, payload })` in the handleUndo implementation.

5. **[P1] Undo trigger location — per-card footer button vs group header** — The task says undo toast should trigger when `config.isFinishStage === true` on the per-card footer button. There are two types of "batch" calls: (a) group header buttons «Выдать все» at line 1834 — these are FROZEN and must NOT be changed; (b) per-card footer buttons at lines 1802, 1879, 1957, 2047 — these call `handleBatchAction([order])` for a single order. The undo wrapping should ONLY be added at the per-card footer `onClick` handlers where `config.isFinishStage === true`. **FIX:** At each per-card footer button onClick (lines 1802, 1879, 1957, 2047), wrap the `handleBatchAction` call: check `config.isFinishStage`, if true → capture snapshot, call handleBatchAction, start undo timer. If false → call handleBatchAction directly (no toast).

6. **[P1] undoToast state belongs in OrderGroupCard, not "TableCard"** — The task spec refers to "TableCard component" but the actual component is `OrderGroupCard` (line 1301). State `undoToast` should be declared alongside other state at ~line 1479. The `handleUndo` function should also be declared inside `OrderGroupCard`. **FIX:** Add `const [undoToast, setUndoToast] = React.useState(null);` after line 1479. Add `handleUndo` function after the state declarations.

7. **[P1] Toast JSX placement — must be inside `isExpanded` block** — The card has collapsed and expanded states. The toast should only render when the card is expanded (since the action buttons are only visible when expanded). Place the toast JSX inside the expanded content area, after the last section (Block D / contacts) but before the closing `</div>` at line 2165. **FIX:** Insert undo toast JSX just before line 2165 (`</div>` closing the expanded content).

8. **[P2] Stale toast on card collapse** — If user collapses the card while the 5-second undo window is active, the toast hides (inside isExpanded block) but the timer continues. Re-expanding shows a stale toast with reduced time. **FIX:** Add cleanup — when `isExpanded` changes to false, clear `undoToast` and its timer. Can use `useEffect`:
```jsx
React.useEffect(() => {
  if (!isExpanded && undoToast) {
    clearTimeout(undoToast.timerId);
    setUndoToast(null);
  }
}, [isExpanded]);
```

9. **[P2] Snapshot should capture raw stage_id for undo payload** — The spec uses `getLinkId(o.stage_id)` to capture `prevStageId`. This is correct because `handleBatchAction` passes raw IDs to `Order.update()` (line 1546: `payload.stage_id = config.nextStageId` where `nextStageId = nextStage?.id`). For undo, passing the `getLinkId(o.stage_id)` (raw ID) to `advanceMutation.mutate` is consistent. **FIX:** No change needed — spec's `getLinkId(o.stage_id)` is correct.

10. **[P2] Toast min-height for touch target** — The spec's toast JSX uses `py-2` (8px top+bottom) + text. The `«Отменить»` button has no explicit min-height. At `text-xs` (12px) + `py-2` (8px×2), total height ≈ 28px — below the 44px touch target requirement. **FIX:** Add `min-h-[44px]` to the toast container div or to the «Отменить» button:
```jsx
<button
  onClick={handleUndo}
  className="ml-3 font-semibold text-amber-300 underline min-h-[44px] flex items-center"
>
```

## Summary
Total: 10 findings (0 P0, 5 P1, 5 P2, 0 P3)

- Fix 1: 3 findings (1 P1, 2 P2) — main issue is isFirstStage label derivation gap
- Fix 2: 7 findings (4 P1, 3 P2) — main issues are updateOrder → advanceMutation.mutate, component name, toast placement, touch target

## Prompt Clarity

- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: The implementation code uses `config.isFinishStage` as the first check but the spec table shows isFirstStage as a separate row. The code doesn't match the table for isFirstStage in stage mode (produces stage name not imperative verb). Minor inconsistency between the table and the code block.
  - Fix 2: Says "TableCard component" but actual component is `OrderGroupCard`. Says `updateOrder(orderId, payload)` but this function doesn't exist — should reference `advanceMutation.mutate`.
- Missing context: The spec could have included the actual `handleBatchAction` function signature and the mutation mechanism to avoid guessing about `updateOrder`.
- Scope questions: The per-card footer buttons also fire for single orders (not just batch) — the "batch" naming is slightly misleading. Clear that undo is only for isFinishStage, but "batch action" vs "single order action" could be clearer.
