# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

## Agreed (both found)

### 1. Fix 1 — Verb-first per-card footer button labels (P1)
- **CC**: P1 — detailed analysis of all 4 call sites (lines ~1808, 1885, 1963, 2053), edge case analysis (null actionLabel guarded by render condition, "Выдать" without arrow prefix is no-op), mobile fit check (16-19 chars fits at 375px). Provides exact replacement expression with unicode escapes.
- **Codex**: P2 — confirms same 4 locations, same replacement logic needed. Less detail on edge cases.
- **Verdict**: AGREED. Use CC's detailed analysis. Upgrade to P1 (CC's rating) — this is a core UX requirement of the task.

### 2. Fix 2 — Undo toast for finish-stage batch action (P1)
- **CC**: P1 — detailed implementation plan: state in OrderGroupCard (not "TableCard" as task spec says), snapshot capture before handleBatchAction, advanceMutation.mutate for undo (not the non-existent "updateOrder"), toast JSX placement. Notes concern about toast visibility when card collapsed (acceptable for Phase 1).
- **Codex**: P1 — confirms undoToast state missing from OrderGroupCard state block (lines 1475-1479), no handleUndo function, no toast JSX. Same fix direction.
- **Verdict**: AGREED. Both confirm the full undo flow is needed. CC's analysis is more detailed on implementation specifics.

## CC Only (Codex missed)

### 3. Touch target below 44px on "Отменить" button (P2)
- **CC finding**: The undo toast spec has `py-2` on parent container but no min-height on the button. At `text-xs` + `py-2`, effective height is ~28px, below the 44px mobile minimum. Fix: add `min-h-[44px] flex items-center` to the button.
- **Validity**: SOLID — this is a real mobile UX concern from the MOBILE-FIRST CHECK requirement in the task spec. The task itself lists "Отменить touch target ≥ 44px" as a mandatory check.
- **Decision**: ACCEPTED — include in fix plan.

### 4. "Выдан гостю" text accuracy note (P2)
- **CC finding**: The toast text "Выдан гостю" is always shown but may not be accurate for pickup/delivery orders. However, the task spec explicitly uses this text.
- **Validity**: Valid observation but the task spec explicitly defines this text. Not actionable for this task.
- **Decision**: NOTED but NOT included in fix plan — implement as specified. Can be revisited later.

## Codex Only (CC missed)

None. CC covered everything Codex found, plus additional P2 observations.

## Disputes (disagree)

### Priority disagreement on Fix 1
- CC rates Fix 1 as P1 (core UX requirement).
- Codex rates Fix 1 as P2 (code quality).
- **Resolution**: P1 is correct — this is one of the two primary deliverables of the task (SOM-S210-01). It's a deliberate UX decision, not just a style preference.

### Component naming: "TableCard" vs "OrderGroupCard"
- CC notes the task spec says "add to TableCard" but actual component is `OrderGroupCard` (line 1301).
- Codex correctly identifies `OrderGroupCard` with state block at lines 1475-1479.
- **Resolution**: Both agree on the correct target. The task spec's "TableCard" is a misnomer — use `OrderGroupCard`.

### API for undo: "updateOrder" vs actual mutation
- CC notes the task spec's `updateOrder(orderId, payload)` doesn't exist; actual API is `advanceMutation.mutate` or `Order.update`.
- Codex says "use the same order update path already used by handleBatchAction" (implicitly agreeing).
- **Resolution**: Both agree — use the existing mutation pattern, not the non-existent `updateOrder`.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] Verb-first per-card footer button labels** — Source: AGREED (CC+Codex) — Replace button label expressions at 4 locations (~lines 1808, 1885, 1963, 2053) with `config.isFinishStage` ternary using stripped `config.actionLabel`. Remove unused `dishWord` variable at each site.

2. **[P1] Undo toast for finish-stage batch action** — Source: AGREED (CC+Codex) — Add `undoToast` state to `OrderGroupCard`, capture snapshots before finish-stage handleBatchAction calls, implement `handleUndo` using existing mutation pattern (not the non-existent `updateOrder`), render toast JSX inside expanded card area.

3. **[P2] Touch target fix on "Отменить" button** — Source: CC only — Add `min-h-[44px] flex items-center` to the undo button element to meet the mandatory mobile touch target requirement from the task spec's MOBILE-FIRST CHECK.

## Summary
- Agreed: 2 items (Fix 1 labels + Fix 2 undo toast)
- CC only: 2 items (1 accepted: touch target fix; 1 noted but not actioned: text accuracy)
- Codex only: 0 items
- Disputes: 0 real disputes (priority rating difference resolved as P1; naming/API clarifications aligned)
- **Total fixes to apply: 3**

## Prompt Clarity (aggregated)
- CC: 4/5 — noted "TableCard" misnomer, missing `updateOrder` API, could be clearer on per-site variable mapping
- Codex: 5/5 — no issues noted
- **Consensus: 4/5** — the prompt is clear on scope and FROZEN UX, but has two API/naming inaccuracies that the merger must correct during implementation
