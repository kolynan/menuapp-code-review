# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: partnerorderprocess-260404-060141-d4ba

## Issues Found

1. [CRITICAL] Fix 2 JSX skeleton uses wrong channel property names — The skeleton code references `slot.channels.hall`, `slot.channels.pickup`, `slot.channels.delivery` but the actual data structure (built by `getStageChannels()` at line 177) uses `slot.channels.enabled_hall`, `slot.channels.enabled_pickup`, `slot.channels.enabled_delivery`. This will render NO channel icons.
   PROMPT FIX: Replace `slot.channels.hall` → `slot.channels.enabled_hall`, `slot.channels.pickup` → `slot.channels.enabled_pickup`, `slot.channels.delivery` → `slot.channels.enabled_delivery` in the JSX skeleton.

2. [CRITICAL] Fix 2 JSX skeleton references `stage?.is_active` but slot uses `slot.active` — The status badge code uses `stage?.is_active` which reads the raw DB field. But `fixedStageSlots` already computes `slot.active` (line 365: `active: slot.locked ? true : (stage ? isStageActive(stage) : false)`). The prompt should use `slot.active` for consistency with the existing pattern.
   PROMPT FIX: Replace `stage?.is_active` with `slot.active` in the status badge conditional.

3. [CRITICAL] Fix 2 JSX skeleton references `stage?.allowed_roles || slot.defaultRoles` — neither exists — The skeleton uses `stage?.allowed_roles || slot.defaultRoles` but `fixedStageSlots` already computes `slot.allowedRoles` (line 367: `allowedRoles: getStageRoles(stage, slot)`). The property `slot.defaultRoles` does not exist. The slot definition uses `slot.definition.allowed_roles` but `allowedRoles` on the computed slot is the correct merged value.
   PROMPT FIX: Replace `(stage?.allowed_roles || slot.defaultRoles)` with `slot.allowedRoles` in the role chips section.

4. [CRITICAL] Fix 2 JSX skeleton uses `getDisplayName(stage, slot)` with wrong signature — The actual function is `getDisplayName(stage, t)` (line 501). The prompt passes `slot` as second arg instead of `t`. Also, `stage` can be null for unmatched slots, and `getDisplayName` may not handle null stage. The existing code uses `slot.label` (line 693) which is already computed by `getSystemStageLabel(slot, t)` (line 363).
   PROMPT FIX: Replace `getDisplayName(stage, slot)` with `slot.label` — this is already the correct display name computed by the parent.

5. [MEDIUM] Fix 2 changes FixedStageRow signature but caller is not updated — Current caller (line 1610-1617) passes `{slot, toggleBusyKey, onEdit, onToggle, t}`. The new component expects `{slot, stage, isExpanded, isEditing, onToggleExpand, onToggleEdit, onEdit}`. The prompt must include updated JSX at the call site (lines 1609-1618) and specify where to add the new `expandedKey`/`editingKey` state. Without this, the component will receive wrong props.
   PROMPT FIX: Add explicit call-site JSX showing how to pass new props (`isExpanded={expandedKey === slot.key}`, `isEditing={editingKey === slot.key}`, etc.) and where to add the two new useState hooks in OrderProcessContent.

6. [MEDIUM] Fix 2 removes toggle active/inactive button — Current FixedStageRow (line 701-714) has an inline toggle button for active/inactive status that calls `onToggle(slot)` → `handleToggleStage`. The new skeleton replaces this with a read-only status badge. The `onToggle` prop and toggle functionality is silently dropped. Is this intentional per UX v2.0? If yes, the prompt should explicitly state "toggle button removed, status change only via EditStageDialog". If no, the toggle must be preserved.
   PROMPT FIX: Either (a) add `onToggle` back to the new skeleton with a clickable status badge, or (b) explicitly state: "Active/Inactive toggle removed from row — status changes via EditStageDialog only."

7. [MEDIUM] Fix 2 mobile edit mode channel save path is incomplete — The prompt says "use `OrderStage.update({ id: stage.id, enabled_hall: bool, ... })`" but doesn't specify how `stage` is accessed. In the new component, `slot.stage` contains the DB entity (which may be null for unmatched stages). The prompt should clarify: use `slot.stage?.id` and skip save if no DB stage exists.
   PROMPT FIX: Clarify channel save: `if (!slot.stage?.id) return; await OrderStage.update(slot.stage.id, { enabled_hall: bool, ... })`.

8. [MEDIUM] Fix 4 has conflicting i18n key for "locked" — Fix 4 replacement table says `LOCAL_UI_TEXT.locked` → `t('orderprocess.status.locked')` with value `"Зафиксировано"`. But the new dictionary entries section (for Fix 2/3) says `t('orderprocess.status.locked')` → `"Зафиксирован"`. These are different Russian words (neuter vs masculine). The wireframe shows "Зафиксирован" (masculine). The existing LOCAL_UI_TEXT uses "Зафиксировано" (neuter).
   PROMPT FIX: Pick one form consistently. Per wireframe, use `"Зафиксирован"` everywhere (masculine, matching "Активен"/"Выключен" masculine pattern).

9. [MEDIUM] Fix 5 — deleteDialog state and handleConfirmDelete have JSX usages not checked — The prompt says "check if these are also unused before deleting" but doesn't verify. `deleteDialog` state (line 1079) and `setDeleteDialog` (lines 1223, 1327, 1342) are used by `handleDeleteStage` and `handleConfirmDelete`. If both functions are removed, the state + mutation become dead code too. But `deleteMutation` (line 1219) with `useMutation` is a React hook — removing it changes hook call order which can break React. The prompt must specify exact deletion order and verify no hook reordering issues.
   PROMPT FIX: Explicitly list ALL items to remove for Fix 5: `handleAddStage`, `handleMoveUp`, `handleMoveDown`, `handleDeleteStage`, `handleConfirmDelete`, `deleteDialog` state, `setDeleteDialog` calls, `deleteMutation` hook, `moveBusy` state. Warn: removing `deleteMutation` (a `useMutation` hook) is safe only if no other code path references it — grep `deleteMutation` to confirm.

10. [LOW] Fix 2 — `getRoleLabel` uses `useCallback` inside original component — The prompt says "preserve getRoleLabel from original component" with `const getRoleLabel = (role) => { ... }`. The original (line 664) uses `useCallback((role) => {...}, [t])`. The prompt skeleton drops `useCallback`, which is fine functionally but inconsistent with "preserve existing implementation" instruction.
    PROMPT FIX: Either keep `useCallback` wrapper to match original, or explicitly say "simplify: remove useCallback wrapper (not needed for non-memoized component)".

11. [LOW] Fix 3 insertion point may shift — The prompt says "Insert between PipelinePreview closing `</div>` (line 1606) and `<div className="bg-white...">` (line 1608)". These line numbers are correct NOW but Fix 1 deletes ~55 lines (ChannelFilter + CHANNEL_FILTERS) and Fix 2 may change line count. If fixes are applied sequentially, line 1606 will shift.
    PROMPT FIX: Use grep anchors instead of line numbers: "Insert immediately before `<div className=\"bg-white rounded-xl border overflow-hidden\">`" — this is unique in the file and won't shift.

12. [LOW] Missing icon imports check — Fix 2 skeleton uses `ChevronUp`, `ChevronDown`, `Pencil`, `Lock`, `Utensils`, `Package`, `Truck`. Line 11-13 confirms all are already imported. No issue, but the prompt should note "all icons already imported, DO NOT add duplicate imports."
    PROMPT FIX: Add note: "All required Lucide icons are already imported at lines 11-13. Do not add duplicate imports."

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ChannelFilter function | 582-630 | 582-630 | ✅ |
| CHANNEL_FILTERS constant | 35-40 | 35-40 (line 35 start) | ✅ |
| FixedStageRow function | 636-769 | 636-769 | ✅ |
| getRoleLabel inside FixedStageRow | 664 | 664 | ✅ |
| LOCAL_UI_TEXT constant | 125-135 | 125-135 | ✅ |
| `const { t } = useI18n()` | 1067 | 1067 | ✅ |
| handleAddStage | 1229 | 1229 | ✅ |
| handleMoveUp | 1365 | 1365 | ✅ |
| handleMoveDown | 1390 | 1390 | ✅ |
| handleDeleteStage | 1326 | 1326 | ✅ |
| PipelinePreview closing div | 1606 | 1606 | ✅ |
| Stage list container div | 1608 | 1608 | ✅ |

## Fix-by-Fix Analysis

**Fix 1 (Remove ChannelFilter)** — SAFE. Confirmed: `ChannelFilter` has 0 JSX call sites (only its own definition at line 582). `CHANNEL_FILTERS` is only used inside `ChannelFilter` (line 606). True dead code. Clean deletion.

**Fix 2 (Redesign FixedStageRow)** — RISKY. Four critical data access bugs in the JSX skeleton (issues #1-4). Missing call-site update (issue #5). Silent removal of toggle button (issue #6). Mobile save path underspecified (issue #7). These must be fixed before execution or the component will render incorrectly (no icons, wrong names, wrong roles, crash on null stage).

**Fix 3 (Mobile channel legend)** — SAFE. Simple JSX insertion. Correct location. Icons already imported. Only risk: line numbers may shift after Fix 1/2 (issue #11) — use grep anchor instead.

**Fix 4 (i18n LOCAL_UI_TEXT)** — SAFE with one inconsistency. Replacement table is correct and complete. All 8 usages of LOCAL_UI_TEXT are covered (lines 249, 258, 267, 276, 698, 712, 1505, 1589). One "locked" value conflict (issue #8) — minor, pick one.

**Fix 5 (Dead code removal)** — RISKY. Removing `deleteMutation` (useMutation hook at line 1219) changes React hook call order. Need to also remove `deleteDialog` state (line 1079) and `moveBusy` state (line 1077, used only by handleMoveUp/Down). Must be done carefully to avoid hook order breakage. Issue #9 covers this.

## Summary
Total: 12 issues (4 CRITICAL, 5 MEDIUM, 3 LOW)
Prompt clarity rating: 3/5

## Prompt Clarity (MANDATORY)
- Overall clarity: 3/5
- What was most clear: Line numbers are 100% accurate (12/12 verified). Fix 1 is perfectly specified. Fix 4 replacement table is thorough and complete. SCOPE LOCK and MOBILE-FIRST CHECK sections are excellent. Dead code warnings in Fix 1 ("0 JSX usages", "no channelFilter state") prevent wasted grep time.
- What was ambiguous or could cause hesitation:
  - Fix 2 JSX skeleton has 4 data access bugs that will cause runtime failures (wrong property names for channels, roles, display name, active status). An executor following the skeleton literally will produce broken code.
  - Fix 2 doesn't show updated call-site JSX or where to add new state hooks — executor must figure this out independently.
  - Fix 2 silently drops the active/inactive toggle button without stating whether this is intentional.
  - Fix 5 doesn't enumerate all connected artifacts to remove (state, hooks, mutations), leaving executor to discover dependencies.
- Missing context:
  - The `fixedStageSlots` computed object structure (what properties exist: `key`, `definition`, `index`, `label`, `stage`, `active`, `color`, `allowedRoles`, `channels`, `canEdit`) should be documented so the executor uses the right property names.
  - Whether `onToggle` (active/inactive toggle) should be preserved in the new design.
  - What happens on mobile when user taps a locked stage chevron — should it expand (read-only view) or do nothing?
