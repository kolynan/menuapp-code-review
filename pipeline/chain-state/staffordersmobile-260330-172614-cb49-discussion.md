# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260330-172614-cb49
Mode: CC-Only (v2)

## Disputes Analyzed
Total: 1 dispute from Comparator

### Dispute 1: Fix 3 approach — `isFinishStage` vs new `isTerminal` flag + handleAction scope

**CC Solution:** Use existing `isFinishStage` in the `showActionButton` condition as a safety net:
```js
const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus)
  || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
```
No new properties. Notes that current logic is internally consistent (actionLabel and nextStageId/nextStatus are always set together), so this is defensive only.

**Codex Solution:** Add explicit `isTerminal` to `getStatusConfig` for served/completed states, derive button from `actionLabel && !isTerminal`, AND fix `handleAction` (line 1039) early return to mirror the batch path's `isFinishStage => status = 'served'` fallback.

**CC Analysis:**

I examined the actual code paths in detail:

1. **Stage mode (isFinishStage=true):** At line 3037-3056, when `isFinishStage=true`:
   - `nextStage` = undefined (last stage, no next)
   - `actionLabel` = `null` (line 3042: `nextStage ? ... : null`)
   - `nextStageId` = `null` (line 3043)
   - Therefore: `showActionButton = false` AND render condition `showActionButton && statusConfig.actionLabel` = false
   - **Both CC's and Codex's fix produce the same result**: button remains hidden because `actionLabel` is null. CC's added condition `actionLabel && !isFinishStage` evaluates to `null && ...` = false. Codex's `actionLabel && !isTerminal` also evaluates to `null && ...` = false.

2. **Fallback mode (status='ready'):** At line 3060-3071:
   - `ready` has `isFinishStage: true` (line 3070) BUT also gets `actionLabel: "Выдать"` and `nextStatus: "served"` from STATUS_FLOW
   - `showActionButton` = true (via `nextStatus`)
   - Button shows correctly **already today**

3. **Fallback mode (status='served'):** Not in STATUS_FLOW → `actionLabel: null`, `nextStatus: null` → button correctly hidden.

4. **The handleAction early return (Codex C1):** The comparator accepted this as a necessary companion fix. However, examining the data flow:
   - The early return at line 1039 triggers when `!nextStageId && !nextStatus`
   - For finish-stage orders in stage mode: `actionLabel=null` → button never renders → `handleAction` is never called
   - For `ready` in fallback mode: `nextStatus='served'` exists → early return doesn't trigger
   - **There is no code path where the button renders but handleAction no-ops.** The concern is theoretical.

   However, Codex's point has defensive merit: if CC's `showActionButton` safety net ever fires (some future edge case with actionLabel but no nextStageId/nextStatus), then yes, `handleAction` would no-op. Adding the fallback makes the safety net actually functional rather than decorative.

5. **isFinishStage vs isTerminal:** CC correctly identifies that `isFinishStage` already serves this purpose. The `ready` state is `isFinishStage: true` but has `nextStatus`, so it's handled by the first part of the OR. Adding a separate `isTerminal` property is redundant with `isFinishStage` for served/completed (which already don't have actionLabel). Adding new properties increases surface area for no practical benefit.

**Verdict:** CC (with Codex's handleAction fallback included as accepted in Comparator)

**Reasoning:** CC's `isFinishStage` approach is simpler, uses existing infrastructure, and is correct for all analyzed paths. Adding `isTerminal` creates redundancy. However, Codex correctly identified that `handleAction` should mirror the batch path's fallback — this was already accepted by the Comparator as item C1. The combined approach (CC's condition + Codex's handleAction fallback) is the safest.

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | isFinishStage vs isTerminal + handleAction scope | CC + Codex C1 accepted | isFinishStage is sufficient (no new property needed), but handleAction fallback from Codex adds genuine safety for theoretical edge cases |

## Updated Fix Plan
Based on discussion results, the disputed item resolves as follows.
Agreed items from Comparator (Fix 1, Fix 2, Fix 3a, Fix 3b) remain unchanged.

1. **[P1] Fix 3a — showActionButton condition** — Source: CC (confirmed by discussion) — Use `isFinishStage`, not new `isTerminal`:
   ```js
   const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus)
     || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
   ```

2. **[P1] Fix 3b — handleAction fallback** — Source: Codex (accepted by Comparator, confirmed by discussion) — At line ~1039 in `handleAction`, replace early return with:
   ```js
   if (!statusConfig.nextStageId && !statusConfig.nextStatus) {
     if (statusConfig.isFinishStage) {
       // Mirror batch path: finish stage with no nextStageId → serve directly
       const payload = { status: 'served' };
       if (onClearNotified) onClearNotified(order.id);
       updateStatusMutation.mutate({ id: order.id, payload });
     }
     return;
   }
   ```

## Skipped (for Arman)
None — all items resolved.
