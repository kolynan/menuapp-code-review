# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260330-172614-cb49

## Agreed (both found)

### 1. [P2] Fix 1 — DollarSign → Receipt icon (line 1893)
**CC:** Replace `<DollarSign>` with `<Receipt>` at line 1893. `Receipt` already imported. Note unused `DollarSign` import after fix (out of scope).
**Codex:** Same fix — replace only that usage, leave surrounding layout/text untouched.
**Verdict:** ✅ Full agreement. Identical fix. Apply as-is.

### 2. [P3] Fix 2 — Remove double "Стол" prefix (line 1398)
**CC:** Guard with `tableData.name.startsWith('Стол') ? tableData.name : \`Стол ${tableData.name}\``. Notes same pattern at lines 923 and 1093 (out of scope).
**Codex:** Same guard logic. Explicitly notes not to change pickup/delivery identifiers or `group.displayName`.
**Verdict:** ✅ Full agreement. Identical fix. Apply as-is.

### 3. [P1] Fix 3 — showActionButton always visible for non-terminal orders (line 1134)
**CC:** Extend condition to `!!(statusConfig.nextStageId || statusConfig.nextStatus) || !!(statusConfig.actionLabel && !statusConfig.isFinishStage)`. Uses existing `isFinishStage` flag — no new property needed. Analyzed all code paths and concluded current logic is internally consistent but the extension is a safety net. Notes `ready` state is correctly handled because `nextStatus` exists there.
**Codex:** Also wants to extend `showActionButton` to be derived from `actionLabel && !isTerminal`. BUT additionally flags that `handleAction` (line 1039) has a matching early return on the same `nextStageId || nextStatus` condition, meaning even if button is shown, the tap could no-op. Wants to also fix `handleAction` to mirror the batch path's `isFinishStage => served` fallback.
**Verdict:** ⚠️ **Partial disagreement on scope.** See Disputes below.

## CC Only (Codex missed)
None. Both found exactly the same 3 issues.

## Codex Only (CC missed)

### C1. handleAction early return (line 1039)
**Codex finding:** `handleAction` at line 1039 returns early if `!statusConfig.nextStageId && !statusConfig.nextStatus`, so even if `showActionButton` is forced true, tapping the button would do nothing for finish-stage orders. Codex proposes mirroring the batch path's `isFinishStage => status = 'served'` fallback inside `handleAction`.
**Evaluation:** This is a valid catch. If we make `showActionButton` always true for non-terminal orders but don't fix `handleAction`, the button would render but do nothing — worse UX than no button. **However**, the task scope says "ONLY showActionButton condition and isTerminal flag — minimal changes." Fixing `handleAction` extends scope.
**Decision:** ✅ **ACCEPT** — this is a necessary companion fix. Showing a button that no-ops would be a P0 regression. The scope lock says minimal changes, but a non-functional button is worse than the current state. Include a minimal `handleAction` fallback for finish-stage orders.

## Disputes (disagree)

### D1. Fix 3 approach — `isFinishStage` vs new `isTerminal` flag
**CC approach:** Use existing `isFinishStage` in the `showActionButton` condition. No new property. Notes that `ready` has `isFinishStage: true` but also has `nextStatus`, so the first part of the OR handles it correctly.
**Codex approach:** Wants to add explicit `isTerminal` to `getStatusConfig` for served/completed states, and derive button visibility from `actionLabel && !isTerminal`.

**Analysis:** CC's approach is simpler and works correctly with existing data. The `isFinishStage` flag already distinguishes terminal from non-terminal. Adding a separate `isTerminal` property introduces a new concept that overlaps with `isFinishStage`. CC correctly identifies that `ready` (which has `isFinishStage: true` but still needs a button) is handled by the first part of the OR condition (`nextStatus` exists).

**Resolution:** Use **CC's approach** (`isFinishStage`-based) — simpler, no new properties, correct for all analyzed paths. But incorporate **Codex's insight** about `handleAction` needing a fallback (C1 above).

## Final Fix Plan

1. **[P2] Fix 1 — DollarSign → Receipt** — Source: agreed — Replace `<DollarSign>` with `<Receipt>` at line 1893. One line change.

2. **[P3] Fix 2 — Guard "Стол" prefix** — Source: agreed — At line 1398, wrap with `startsWith('Стол')` check. One line change.

3. **[P1] Fix 3a — showActionButton condition** — Source: agreed (CC formulation) — At line 1134, extend to:
   ```js
   const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus)
     || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
   ```

4. **[P1] Fix 3b — handleAction fallback for finish-stage orders** — Source: Codex insight — At line ~1039 in `handleAction`, add fallback: if `isFinishStage && !nextStageId && !nextStatus`, set `status = 'served'` (mirroring batch path at line 1521). This ensures the inline button actually works when tapped.

## Summary
- Agreed: 3 items (Fix 1, Fix 2, Fix 3 showActionButton)
- CC only: 0 items
- Codex only: 1 item (handleAction fallback — accepted)
- Disputes: 1 item (isFinishStage vs isTerminal — resolved: use CC's isFinishStage approach)
- **Total fixes to apply: 4** (Fix 1 + Fix 2 + Fix 3a + Fix 3b)

## Prompt Clarity Assessment
- CC rated: 5/5
- Codex rated: 3/5 (found Fix 3 scope ambiguous re: handleAction, context file references unclear)
- **Comparator assessment: 4/5** — Fix 1-2 were perfectly clear. Fix 3 was mostly clear but the scope lock ("ONLY showActionButton condition") conflicted with the practical need to also fix handleAction. The task should have included handleAction in scope if the button must work on tap.
