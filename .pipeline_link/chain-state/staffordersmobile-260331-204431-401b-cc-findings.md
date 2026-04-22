# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-204431-401b

## Findings

### Fix 1 — Verb-first per-card footer button labels

1. [P1] Per-card footer buttons show "Все N блюд" instead of verb-first labels — All 4 occurrences (lines ~1808, ~1885, ~1963, ~2053) use `Все ${n} ${dishWord}` pattern. This is a generic "All N dishes" label that doesn't tell the waiter WHAT action will happen. Must be replaced with verb-first labels like "Выдать всё (N)" for finish-stage or "[ActionVerb] всё (N)" for other stages.

**Call sites analysis:**

- **Line 1808** (Section 1 — Новые): `config = getStatusConfig(order)` at line 1763. For new/first-stage orders, `config.actionLabel` = "Принять" (STATUS_FLOW) or `→ [StageName]` (stage mode, but first-stage would have next stage). `config.isFinishStage` = false. So the button should show: `Принять всё (N)` (stripping `→ ` prefix).

- **Line 1885** (Section 2 — Готово к выдаче): `config = getStatusConfig(order)` at line 1843. For completed/finish-stage orders, `config.isFinishStage` = true, `config.actionLabel` = null (no next stage). Button should show: `Выдать всё (N)` or just `Выдать` when n=0.

- **Line 1963** (Section 3 — В работе, single sub-group flatten): `config = getStatusConfig(order)` at line 1922. For in-progress orders, `config.actionLabel` = `→ [NextStageName]` or `Выдать` (if nextIsFinish). Button should show verb-first: strip `→ ` prefix → `[NextStageName] всё (N)` or `Выдать всё (N)`.

- **Line 2053** (Section 3 — В работе, multi sub-group expanded): `config = getStatusConfig(order)` at line 2012. Same logic as line 1963.

**FIX:** Replace the button label expression in all 4 locations. The new expression should be:
```jsx
n > 0
  ? config.isFinishStage
    ? `Выдать всё (${n})`
    : `${(config.actionLabel || '').replace(/^→\s*/, '')} всё (${n})`
  : (config.isFinishStage ? 'Выдать' : (config.actionLabel || 'Действие').replace(/^→\s*/, ''))
```
(Using unicode escapes in actual implementation.)

**Edge case concern:** When `config.actionLabel` is `null` and `config.isFinishStage` is `false` — this would yield `" всё (N)"` with leading space or empty verb. However, the `(config.actionLabel || config.isFinishStage)` guard at lines 1795, 1872, 1953, 2043 ensures this block only renders when one of these is truthy. If `isFinishStage=false` and `actionLabel=null`, the IIFE/block won't render, so this edge case is safe.

**Another edge case:** `config.actionLabel` could be just `"Выдать"` (when nextIsFinish in stage mode, line 3216). In that case, `replace(/^→\s*/, '')` is a no-op and we get `"Выдать всё (N)"` — correct.

**Mobile fit check:** "Принять всё (2)" = 16 chars. At 375px with `text-xs` (~12px), this fits comfortably in one line within the `rounded-full` button. Even worst-case "Готовится всё (99)" = 19 chars, still fits.

Also note: the `dishWord` variable and its pluralization logic become unused and should be removed from all 4 sites to keep code clean. However, per SCOPE LOCK, this is a minimal cleanup directly tied to the label change — acceptable.

### Fix 2 — Undo toast after finish-stage batch action

2. [P1] No undo mechanism after "Выдать" batch action — When waiter taps the finish-stage per-card button, orders are immediately marked as served with no way to revert an accidental tap. An undo toast with a 5-second window is needed.

**Implementation analysis:**

**State placement:** `const [undoToast, setUndoToast] = React.useState(null)` should go inside `OrderGroupCard` component (after line ~1322, near other state declarations). This is correct because undo is per-card (per-table), not global.

**Trigger location:** Inside the per-card footer button click handlers. Currently 4 button `onClick` handlers call `handleBatchAction([order])` (lines 1802, 1879, 1957, 2047). The undo should ONLY trigger when `config.isFinishStage === true`. Since each card renders orders from different sections, the finish-stage buttons are in Section 2 (Готово к выдаче). But per-card inline buttons in other sections could also be finish-stage if the config says so.

**Key concern — snapshot timing:** The task says to capture `prevStatus` and `prevStageId` BEFORE calling `handleBatchAction`. This is correct. The snapshots array should be built from the orders array passed to the action. However, `handleBatchAction` is called synchronously and triggers mutations — the undo needs to capture state BEFORE mutation fires.

**FIX:** 
- Add `undoToast` state to OrderGroupCard.
- For the **group-level** "Выдать все" button (line 1834) AND per-card finish-stage buttons: wrap the onClick to capture snapshots first, then call handleBatchAction, then show toast.
- Add `handleUndo` function that calls `advanceMutation.mutate` (via `Order.update`) for each snapshot to restore previous state.
- Add toast JSX before the closing `</div>` of the expanded content area (before line 2165).

**Important implementation detail — updateOrder:** The task spec uses `updateOrder(orderId, payload)` but the actual code uses `advanceMutation.mutate({ id, payload })` which calls `base44.entities.Order.update(id, payload)`. The undo handler should use the same `advanceMutation.mutate` pattern for consistency and to get optimistic updates + query invalidation.

**Concern with advanceMutation for undo:** `advanceMutation` is a `useMutation` that does `Order.update(id, payload)`. Using `advanceMutation.mutate` in undo is fine — it updates the order back to previous status/stage_id. The mutation already handles `onSettled` with `queryClient.invalidateQueries`.

**Toast visibility concern:** The toast is placed inside the expanded card content. If the card is collapsed, the toast won't be visible. Since the action was taken while expanded, this is acceptable — the card stays expanded after the action. But if the user collapses the card during the 5s window, the toast disappears. This is a minor UX concern but acceptable for Phase 1.

**Touch target check:** The "Отменить" button with `ml-3 font-semibold text-amber-300 underline` — the `py-2` on parent gives ~32px height. The button text itself needs `min-h-[44px]` or at least padding to reach 44px touch target. The task spec doesn't include explicit min-h on the button element. FIX: Add `min-h-[44px] flex items-center` to the undo button, or increase parent padding.

3. [P2] Undo toast "Отменить" button touch target may be below 44px — The task spec shows the toast with `py-2` on the parent container and no explicit min-height on the `<button>` element. On mobile, the "Отменить" text link at ~12px font + py-2 (~8px each side) = ~28px, below the 44px minimum touch target. FIX: Add `min-h-[44px] flex items-center` to the button element, or wrap in a container with min-h-[44px].

4. [P2] Undo toast text "Выдан гостю" is not always accurate — The toast says "Выдан гостю" (Served to guest) but the finish-stage action for pickup/delivery orders means "Выдан" (Given out), not specifically "to guest". For hall orders it's correct. Minor i18n/accuracy concern. The task spec explicitly uses this text, so this is just a note — implement as specified.

## Summary
Total: 4 findings (0 P0, 2 P1, 2 P2, 0 P3)

- Fix 1: 1 finding (P1) — button label replacement in 4 locations, clear implementation path, edge cases analyzed and safe
- Fix 2: 3 findings (1 P1 core implementation + 1 P2 touch target + 1 P2 text accuracy note)

## Prompt Clarity

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: The replacement expression uses unicode escapes which is good for unambiguous implementation. However, the instruction "check actual variable name at each call site" could be clearer — `config` is the variable at all 4 sites (lines 1763, 1843, 1922, 2012), but accessed via different patterns (2 sites use IIFE with closure, 2 sites use block scope). Would have been faster with explicit line-by-line mapping.
  - Fix 2: The spec says "add to TableCard" but the component is named `OrderGroupCard` (line 1301), not `TableCard`. This could cause confusion — the writer might look for a non-existent component. The correct target is `OrderGroupCard`.
- Missing context: 
  - Fix 2 uses `updateOrder(orderId, payload)` which doesn't exist in the code. The actual API is `advanceMutation.mutate({ id, payload })` or direct `base44.entities.Order.update(id, payload)`. This mismatch requires the implementer to find the right API themselves.
- Scope questions: None — the FROZEN UX list and SCOPE LOCK are clear and comprehensive.
