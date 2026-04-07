# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: partnerorderprocess-260404-060141-d4ba

## Issues Found
1. [CRITICAL] Scope contradiction for i18n changes — The prompt says `DO NOT modify` any file other than `partnerorderprocess.jsx`, but Fix 4 also says to "add these keys to i18n dictionary." That creates a direct execution conflict: Codex either violates scope or leaves new `t()` calls unresolved. PROMPT FIX: explicitly name the allowed i18n file(s) and permit edits there, or change the task to reuse only keys that already exist in `partnerorderprocess.jsx`.

2. [CRITICAL] Same i18n key has two different required values — `orderprocess.status.locked` is mapped to `"Зафиксировано"` in the replacement table, then later to `"Зафиксирован"` in the new UI key list. One key cannot safely serve both values. PROMPT FIX: pick one final value, or split this into two distinct keys and specify where each must be used.

3. [CRITICAL] Mobile inline edit flow can call update logic with invalid data — The prompt requires channel autosave via `OrderStage.update({ id: stage.id, ... })`, but it never states what to do when `stage` is missing, normalization is blocked, or the row is a fixed slot without a persisted record yet. That can produce runtime crashes or invalid writes. PROMPT FIX: add explicit guards: no edit mode unless `stage?.id` exists, render read-only fallback when a stage is missing, and disable all autosave actions while normalization/blocker state is active.

4. [MEDIUM] Desktop edit callback is under-specified and may use the wrong argument — The new row skeleton uses `onEdit(slot)`, but the behavior requirement is "pencil opens existing EditStageDialog." If the existing dialog opener expects `stage`, `{ stage, slot }`, or a different state setter, this prompt steers Codex toward a broken integration. PROMPT FIX: state the exact existing callback/signature to preserve, or instruct: "reuse the current dialog-open logic from the old `FixedStageRow`; only move it to the pencil button."

5. [MEDIUM] Mobile expanded/edit UI is described by wireframe only, not by executable rules — The prompt shows wireframes for expanded and edit states, but it does not define the exact JSX structure, the active/inactive control, the edit completion path, or what stays visible in read-only expanded mode. That leaves too much room for interpretation. PROMPT FIX: provide a concrete JSX skeleton for expanded read-only mode and expanded edit mode, including which controls call which handlers.

6. [MEDIUM] Missing i18n key for `[Готово]` in mobile edit mode — The prompt requires all user-facing strings to use `t(key)`, and the wireframe includes a `[Готово]` button, but no key is specified for it. Codex will either hardcode the label or guess an existing common key. PROMPT FIX: add an explicit key such as `common.done` or `orderprocess.done_button` and state which one to use.

7. [MEDIUM] Render-time and save-time channel field names are assumed, not validated — The UI skeleton reads `slot.channels.hall/pickup/delivery`, while the save instruction writes `enabled_hall/enabled_pickup/enabled_delivery`. If the actual file uses different names or stores effective channel flags on `stage`, the prompt's concrete snippet will be wrong. PROMPT FIX: add: "inspect the existing stage/slot shape first and preserve current field names; only the UI behavior is fixed, not the property names."

8. [MEDIUM] React Query invalidation snippet is version- and project-pattern-sensitive — `queryClient.invalidateQueries(['orderStages'])` may be wrong for the app's installed TanStack Query version or inconsistent with existing local code. PROMPT FIX: replace the hardcoded call with "use the same `orderStages` invalidation style already present in this file/project."

9. [MEDIUM] Required fix sequencing is missing — Fix 2 and Fix 3 depend on the i18n work from Fix 4, and Fix 5 should happen only after the row redesign is complete so dead-code decisions are based on the final render path. Without explicit order, Codex can remove things too early or introduce unresolved keys mid-edit. PROMPT FIX: require this order: inspect existing contracts/imports, resolve i18n key plan, replace `FixedStageRow`, add mobile legend, then remove dead code and unused imports.

10. [MEDIUM] Dead-code deletion criteria are too narrow — Fix 5 says to confirm "0 JSX usages," but a handler or state variable can still be referenced outside JSX by dialogs, effects, or helper functions. That makes the deletion rule unsafe. PROMPT FIX: require zero references across the entire file, not just JSX, before removing a function/state/helper.

11. [MEDIUM] The sample button classes violate the prompt's own touch-target requirement — The mobile-first checklist says touch targets must be at least `44px`, but the provided button examples use `p-1` with `h-4 w-4` icons, which will typically produce much smaller tap targets. PROMPT FIX: specify `min-h-[44px] min-w-[44px]` or equivalent on chevron, pencil, and edit-mode controls.

12. [LOW] "Replace the entire `FixedStageRow` function" is too destructive for a constrained refactor — The prompt only tells Codex to preserve `getRoleLabel`, but existing rows often contain non-visual details such as test IDs, permission guards, or helper logic that should survive the redesign. PROMPT FIX: say "replace the layout, but preserve any existing non-visual behavior, data attributes, and guards unless explicitly removed by this prompt."

13. [LOW] Verification is too grep-heavy to catch the likely failures — The checks focus on string matches and simple UI expectations, but they do not require validation for unused imports, broken JSX, missing icon imports, incorrect handler wiring, or autosave failure behavior. PROMPT FIX: add explicit post-change validation items for parse/lint sanity, unused imports, desktop/mobile render paths, locked-stage no-edit behavior, and save/error flows.

14. [LOW] Line-number anchors are brittle — Instructions such as "lines 582-630" and insertion between "line 1606" and "line 1608" are likely to drift after any prior edit or if the source file has changed. PROMPT FIX: anchor edits by stable symbols and neighboring JSX markers instead of raw line numbers.

15. [LOW] Cleanup instructions do not explicitly cover import fallout — Removing `ChannelFilter`, `LOCAL_UI_TEXT`, and dead handlers can leave now-unused imports, constants, or dialog state behind. That may not break runtime, but it increases the chance of unfinished cleanup or lint noise. PROMPT FIX: add a final cleanup step: "remove all now-unused imports, helpers, and state introduced or orphaned by Fixes 1-5."

16. [LOW] `onToggleEdit` is included in the new component API but not used in the provided skeleton — This is a small prompt-quality defect, but it creates uncertainty about whether edit mode is owned by the row or the parent. PROMPT FIX: either remove `onToggleEdit` from the proposed signature or show exactly where it is used in the mobile expanded/edit section.

## Summary
Total: 16 issues (3 CRITICAL, 8 MEDIUM, 5 LOW)

## Additional Risks
- The prompt assumes several symbols are already in scope (`t`, `toast`, `queryClient`, `OrderStage`, icon imports, `getDisplayName`) without telling Codex what to do if any are missing. That can stall execution or cause ad hoc fixes outside the intended scope.
- The redesign mixes "keep existing logic" with "replace entire function," which increases the risk of accidental behavior loss if the current row contains hidden constraints not mentioned in the prompt.
- Autosave is specified only for the happy path. Without an explicit failure path, Codex may leave the UI in edit mode with stale values or show success toasts even after a failed update.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: the desired UX outcome, the high-level scope lock, and the intent to remove dead `ChannelFilter` code.
- What was ambiguous or could cause hesitation: the i18n file/scope conflict, the exact `EditStageDialog` integration contract, the mobile expanded/edit JSX contract, and the data shape to use for channel flags.
- Missing context: the exact file path of `partnerorderprocess.jsx`, the target i18n dictionary location, the current dialog-open function signature, the existing `orderStages` query invalidation pattern, and how to handle rows where `stage` is absent or normalization is blocked.
