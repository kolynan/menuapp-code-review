# CC Writer Findings — PartnerOrderProcess
Chain: partnerorderprocess-260404-204226-0133

## Findings

### Fix 1 — REMOVE ChannelFilter component and related state

1. [P1] ChannelFilter is dead code — confirmed safe to remove. `function ChannelFilter` at line 582-630 has zero JSX call-sites (grep `<ChannelFilter` returns 0 matches). `CHANNEL_FILTERS` constant at lines 35-40 is only referenced inside `ChannelFilter` itself. No `channelFilter` state variable exists. FIX: Delete `CHANNEL_FILTERS` constant (lines 35-40) and `ChannelFilter` function (lines 582-630). Both are entirely self-contained dead code.

### Fix 2 — REDESIGN FixedStageRow to compact row + mobile accordion

2. [P1] FixedStageRow replacement is well-specified and correct. The current component (lines 636-769) passes `toggleBusyKey` and `onToggle` props that tie it to inline toggle buttons. The replacement component correctly removes toggle buttons (per UX v2.0 — toggling now only via EditStageDialog) and adds accordion behavior. Key observations:
   - `getRoleLabel` at line 664 uses `useCallback([t])` — correctly preserved in the new component. **No issue.**
   - The new component receives `isExpanded`, `onToggleExpand`, `onEdit`, `t` as props — all correct.
   - `slot.canEdit` (boolean, from `buildFixedStageSlots` line 369) correctly gates edit access.
   - `slot.definition.locked` correctly gates locked status.
   - FIX: Replace entire `FixedStageRow` function (lines 636-769) with the provided component. Add `expandedKey` state after line 1079. Update call-site at lines 1609-1618.

3. [P2] After Fix 2, `handleToggleStage` (lines 1261-1297) will have 0 JSX usages — it was the `onToggle` prop of old FixedStageRow. Per prompt, this is expected and correct (FROZEN code). **No action needed** — documenting for comparator awareness.

4. [P1] Missing import check for new component icons — All icons used in the new FixedStageRow (`Utensils`, `Package`, `Truck`, `Lock`, `Pencil`, `ChevronUp`, `ChevronDown`) are already imported at lines 10-13. **No issue found** — all imports present.

### Fix 3 — ADD mobile channel legend

5. [P1] Mobile channel legend placement is correct. The anchor `bg-white rounded-xl border overflow-hidden` is at line 1608. Legend uses `sm:hidden` to hide on desktop. All three channel icons match the pattern used in Fix 2. FIX: Insert the legend JSX immediately before line 1608 (the `<div className="bg-white rounded-xl border overflow-hidden">` line).

### Fix 4A — Replace LOCAL_UI_TEXT references outside FixedStageRow

6. [P1] `LOCAL_UI_TEXT.currentProcess` at line 1589 — must replace with `t('orderprocess.current_process')`. Straightforward string replacement. FIX: `{LOCAL_UI_TEXT.currentProcess}` → `{t('orderprocess.current_process')}`.

7. [P1] `LOCAL_UI_TEXT.blockerGeneric` at line 1505 — must replace with `t('orderprocess.blocker.generic')`. FIX: `{LOCAL_UI_TEXT.blockerGeneric}` → `{t('orderprocess.blocker.generic')}`.

8. [P1] `analyzeStageSet` function (lines 229-289) — standalone helper without `t()` in scope. Four `LOCAL_UI_TEXT.*` references at lines 249, 258, 267, 276 must be replaced with i18n key strings (Approach A). The display-point at line 1508 (`{stageAnalysis.blocker}`) must be wrapped with `t()`. FIX:
   - Line 249: `LOCAL_UI_TEXT.blockerUnsupportedType` → `"orderprocess.blocker.unsupported_type"`
   - Line 258: `LOCAL_UI_TEXT.blockerMultipleStart` → `"orderprocess.blocker.multiple_start"`
   - Line 267: `LOCAL_UI_TEXT.blockerMultipleFinish` → `"orderprocess.blocker.multiple_finish"`
   - Line 276: `LOCAL_UI_TEXT.blockerTooManyMiddle` → `"orderprocess.blocker.too_many_middle"`
   - Line 1508: `{stageAnalysis.blocker}` → `{t(stageAnalysis.blocker)}`

   **Potential concern:** The `analyzeStageSet` also returns `blocker: ""` (empty string) on success at line 284. When `t("")` is called with an empty string, behavior depends on the i18n library — it may return `""` or the key itself. However, line 1497 checks `if (stageAnalysis.blocker)` before rendering the blocker UI, so an empty string is falsy and the `t()` call at line 1508 will never execute with `""`. **No issue** — the guard at 1497 prevents it.

### Fix 4B — Delete LOCAL_UI_TEXT constant

9. [P1] After Fix 2 removes FixedStageRow (which contained the last two references at lines 698 and 712), and Fix 4A replaces lines 249/258/267/276/1505/1589, the `LOCAL_UI_TEXT` constant (lines 125-135) will have zero references. FIX: Delete lines 125-135 entirely. Must be done AFTER Fix 2, not before.

10. [P1] i18n dictionary keys — 19 new `t()` keys are introduced by Fix 2 + Fix 3 + Fix 4. The `channel.hall`, `channel.pickup`, `channel.delivery` keys are already used in the current file (lines 586-588, 644-658, 957-973), so they likely exist in the dictionary. `toast.saved` is used at line 1202. `orderprocess.role.staff/kitchen/manager` are used at lines 665-669 of the current component. The truly NEW keys that may not exist:
    - `orderprocess.status.locked` (replaces hardcoded `LOCAL_UI_TEXT.locked`)
    - `orderprocess.status.active` (replaces `LOCAL_UI_TEXT.enabled`)
    - `orderprocess.status.inactive` (replaces `LOCAL_UI_TEXT.disabled`)
    - `orderprocess.edit_button`
    - `orderprocess.aria.edit` (already used at line 723 — likely exists)
    - `orderprocess.channels_label`
    - `orderprocess.roles_label`
    - `orderprocess.current_process`
    - `orderprocess.blocker.generic`
    - `orderprocess.blocker.multiple_start`
    - `orderprocess.blocker.multiple_finish`
    - `orderprocess.blocker.too_many_middle`
    - `orderprocess.blocker.unsupported_type`

    FIX: Grep the i18n dictionary to check which keys already exist before adding. Add only missing ones with the Russian values specified in the prompt.

### Fix 5 — REMOVE dead handlers

11. [P1] Confirmed: `handleAddStage` (line 1229), `handleMoveUp` (line 1365), `handleMoveDown` (line 1390), `handleDeleteStage` (line 1326), and `handleConfirmDelete` (line 1331) have 0 JSX usages — they only appear in their own function definitions (grep confirmed). FIX: Delete entire function declarations for all five.

12. [P2] Hook order safety for `deleteMutation` and `deleteDialog`:
    - `deleteMutation` (line 1219) is a top-level `useMutation` hook — MUST remain for React hook ordering.
    - `deleteDialog` state (line 1079) is referenced inside `deleteMutation.onSuccess` callback (line 1223) — MUST remain.
    - `moveBusy` state (line 1077) — top-level `useState`, only used by `handleMoveUp`/`handleMoveDown`. After those are deleted, it becomes dead state but MUST remain for hook order safety.
    FIX: Keep `deleteMutation`, `deleteDialog`, and `moveBusy`. Add comment `// reserved — do not remove (hook order)` next to `deleteMutation` and `moveBusy`.

13. [P2] After deleting `handleConfirmDelete`, the `deleteMutation.mutateAsync` call at line 1346 and the `deleteDialog.stage` references at lines 1332-1342 will be gone. The `deleteMutation.onSuccess` callback (lines 1221-1224) still references `setDeleteDialog` — this is fine since the callback won't fire if nobody calls `mutateAsync`. The `deleteDialog` state remains valid due to hook order requirement. **No issue.**

### Additional observations (within scope)

14. [P2] Execution order validation — The prompt specifies: Fix 4A → Fix 1 → Fix 3 → Fix 2 → Fix 4B → Fix 5. This is logically sound:
    - Fix 4A first: replaces `LOCAL_UI_TEXT` refs outside FixedStageRow while the constant still exists (lines 698/712 inside FixedStageRow still need it).
    - Fix 1 next: removes dead ChannelFilter code (independent).
    - Fix 3 next: inserts mobile legend before Fix 2 rewrites the component area.
    - Fix 2: replaces FixedStageRow (auto-removes lines 698/712 references).
    - Fix 4B: deletes `LOCAL_UI_TEXT` constant (now 0 references).
    - Fix 5 last: removes dead handlers (safest, least risky).
    **No issue with ordering.**

## Summary
Total: 14 findings (0 P0, 8 P1, 5 P2, 0 P3)

All 6 fixes (Fix 1, Fix 2, Fix 3, Fix 4A, Fix 4B, Fix 5) are well-specified with correct line numbers and verified data facts. No blocking issues found. The prompt accurately describes the current state of the code.

Key validations:
- All icon imports already present (lines 10-13) -- no new imports needed
- `channel.hall/pickup/delivery` and `toast.saved` keys already used in file -- likely exist in dictionary
- `orderprocess.aria.edit` already used at line 723 -- likely exists in dictionary
- `handleToggleStage` becoming unused after Fix 2 is expected per FROZEN UX
- Hook order safety correctly addressed for `deleteMutation`, `deleteDialog`, `moveBusy`
- ChannelFilter confirmed dead code (0 JSX usages)
- All 5 dead handlers confirmed (0 JSX usages each)

## Prompt Clarity

- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. All fixes have precise line numbers, grep patterns, and before/after code. The step-by-step breakdown and execution order are exceptionally clear.
- Missing context: None. The key data facts table for slot properties, the behavior matrix, and the wireframes provide complete specification.
- Scope questions: None. The SCOPE LOCK, FROZEN UX, and DO NOT DELETE sections clearly delineate boundaries. The exception for i18n dictionary is well-documented.
