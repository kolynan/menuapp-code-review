# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-260404-053229-1bf8

## Issues Found

1. **[CRITICAL] Fix 1 says "Delete the `<ChannelFilter .../>` JSX call in main render" — but no such JSX call exists.** The `ChannelFilter` function is defined at line 582 but is NEVER invoked anywhere in the render tree. Grep for `<ChannelFilter` returns 0 matches. The component and `CHANNEL_FILTERS` constant are dead code already. The prompt instruction to "delete the JSX call" will confuse the executor — they'll search for something that doesn't exist and may wonder if they're looking in the wrong place. **PROMPT FIX:** Replace "Delete the `<ChannelFilter .../>` JSX call in main render" with "Note: `<ChannelFilter>` is NOT called anywhere in JSX — it is already dead code. Just delete the function definition (lines 582-630) and the `CHANNEL_FILTERS` constant (lines 35-40)."

2. **[CRITICAL] Fix 1 says "grep `channelFilter` — remove useState and any usage in filtering logic" — but `channelFilter` state does NOT exist.** Grep for `channelFilter`, `setChannelFilter`, and `channel_filter` returns 0 matches in the file. There is no state variable for channel filtering. The prompt implies there is filtering state to clean up, which will send the executor on a wild goose chase. **PROMPT FIX:** Remove the instruction "Delete the state: grep `channelFilter` — remove `useState` and any usage in filtering logic". Replace with "Note: there is no `channelFilter` state variable — the component was defined but never wired up. Only the function definition and constant need deletion."

3. **[CRITICAL] Fix 4 says to use `tr()` but the file only uses `t()` from `useI18n()`.** Grep confirms: `tr(` has 0 occurrences in the file; `t(` has 103 occurrences. The file destructures `const { t } = useI18n()` at line 1067. The prompt acknowledges this risk in its "IMPORTANT" section and says to create a `tr` helper if not available — but this is buried at the bottom of Fix 4. Since `tr` DEFINITELY doesn't exist, the prompt should lead with the helper creation as Step 1 of Fix 4, not as a conditional afterthought. **PROMPT FIX:** Move the `tr` helper creation to the TOP of Fix 4 as a mandatory first step: "Step 1: Add `tr` helper immediately after `const { t } = useI18n()` (line 1067): `const tr = (key, fallback) => { const val = t(key); return val === key ? fallback : val; };`". Then proceed with replacements.

4. **[MEDIUM] Fix 4 changes the actual text content of `enabled`/`disabled` without noting this is intentional.** The current `LOCAL_UI_TEXT.enabled` is `"Вкл"` and `LOCAL_UI_TEXT.disabled` is `"Выкл"` (lines 128-129). The prompt maps them to `tr('orderprocess.status.active', 'Активен')` and `tr('orderprocess.status.inactive', 'Выключен')` — different words. This is likely intentional (UX v2.0 redesign), but the executor might think it's a mistake and use the original short forms. **PROMPT FIX:** Add note: "Note: the text for enabled/disabled INTENTIONALLY changes from 'Вкл'/'Выкл' to 'Активен'/'Выключен' per UX v2.0 spec."

5. **[MEDIUM] Fix 2 references `handleChannelToggle` and `handleRoleToggle` as NEW functions to create, but doesn't specify their implementation.** The prompt says "call a new `handleChannelToggle(slot, channelKey)` that updates single channel via `OrderStage.update()`" and similar for roles, but provides no code skeleton. The executor must invent the entire implementation including: which fields to update (`enabled_hall`, `enabled_pickup`, `enabled_delivery`), how to map channelKey to field name, error handling, toast feedback, query invalidation. Given the complexity, a code skeleton or pseudo-code would reduce ambiguity. **PROMPT FIX:** Add implementation skeleton for both handlers, following the existing `handleToggleStage` pattern (try/catch, `OrderStage.update()`, `queryClient.invalidateQueries`, toast).

6. **[MEDIUM] Fix 2 is extremely large — replacing 134 lines (636-769) with a new component having 3 modes.** This is the highest-risk fix. The prompt provides wireframes but no JSX skeleton. The executor must: create accordion state, responsive breakpoint logic, collapsed/expanded/edit modes, icon rendering, role chips, status badges, and wire up autosave. Risk of producing code that doesn't match wireframes or has subtle responsive bugs is high. **PROMPT FIX:** Consider providing a JSX skeleton (even partial) for the collapsed row at minimum, since that's the primary view users will see. Or split into Fix 2A (collapsed row only) and Fix 2B (mobile accordion + edit mode) for safer incremental delivery.

7. **[MEDIUM] Fix 2 says desktop should open "existing EditStageDialog" on pencil click, but the prompt also says to implement autosave.** These are conflicting UX patterns: EditStageDialog has Save/Cancel buttons (traditional save), while Fix 2C says "No Save/Cancel buttons needed (autosave)". Clarify: desktop uses EditStageDialog (no change), mobile uses inline autosave (new behavior). **PROMPT FIX:** Add explicit note: "Desktop: pencil icon opens existing EditStageDialog with Save/Cancel (no change to dialog). Mobile: accordion edit mode uses autosave (no dialog, no Save/Cancel)."

8. **[MEDIUM] Fix 3 line reference "around line 1607" is correct but insertion point needs precision.** Line 1607 is a blank line between `</div>` (end of PipelinePreview container) and `<div className="bg-white rounded-xl border overflow-hidden">` (stage list container). The instruction should be more precise to avoid ambiguity. **PROMPT FIX:** Change "around line 1607" to "between lines 1606 and 1608 — after the PipelinePreview closing `</div>` and before `<div className='bg-white rounded-xl border overflow-hidden'>`".

9. **[LOW] Fix 5 says to keep a comment after deleting dead code.** The system rules (CLAUDE.md F4, F7) say "Do NOT remove comments" but also say to fix only what's asked. Adding a comment `// NOTE: Add/Move/Delete stage handlers removed` is acceptable but adds noise. Also, `handleDeleteStage` (line 1326) is connected to `deleteDialog` state (line 1079) and `handleConfirmDelete` (line 1331) — deleting `handleDeleteStage` alone may leave orphaned delete dialog logic. **PROMPT FIX:** Expand Fix 5 to include `deleteDialog` state and `handleConfirmDelete` in the "check if unused" list, since they form a connected group. If `handleDeleteStage` is the only caller of `setDeleteDialog({ open: true, ... })`, then all three (`handleDeleteStage`, `deleteDialog`, `handleConfirmDelete`, `deleteMutation`) may be dead code.

10. **[LOW] Fix 2 references `getRoleLabel()` — confirmed it exists at line 664 but it's INSIDE `FixedStageRow`.** If FixedStageRow is being completely replaced, the executor needs to either preserve `getRoleLabel` in the new component or extract it. The prompt doesn't mention this. **PROMPT FIX:** Add note: "`getRoleLabel` (line 664) is defined inside current FixedStageRow — preserve it in the new component implementation."

11. **[LOW] Fix dependency ordering is not explicit.** Fix 4 (i18n) creates the `tr()` helper that Fix 2 and Fix 3 both need. Fix 1 (remove ChannelFilter) should happen before Fix 2 (redesign FixedStageRow) to avoid line number drift. **PROMPT FIX:** Add execution order note: "Recommended order: Fix 4 (tr helper first) → Fix 1 → Fix 3 → Fix 2 → Fix 5."

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ChannelFilter function | lines 582-630 | 582-630 | ✅ |
| CHANNEL_FILTERS constant | lines 35-40 | 35-40 | ✅ |
| LOCAL_UI_TEXT constant | lines 125-135 | 125-135 | ✅ |
| FixedStageRow function | lines 636-769 | 636-769 | ✅ |
| `<ChannelFilter .../>` JSX call | "in main render" | NOT FOUND — 0 matches | ❌ |
| `channelFilter` state | implied exists | NOT FOUND — 0 matches | ❌ |
| `handleAddStage` | "defined but no JSX calls it" | line 1229, confirmed unused in JSX | ✅ |
| `handleMoveUp` | "defined but no JSX calls it" | line 1365, confirmed unused in JSX | ✅ |
| `handleMoveDown` | "defined but no JSX calls it" | line 1390, confirmed unused in JSX | ✅ |
| `handleDeleteStage` | "defined but no JSX calls it" | line 1326, confirmed unused in JSX | ✅ |
| `getRoleLabel` | exists in file | line 664, inside FixedStageRow | ✅ |
| PipelinePreview | line ~1607 area | PipelinePreview defined line 548, rendered around 1589-1606 | ✅ |
| Fix 3 insertion point | "around line 1607" | line 1607 is blank between preview and stage list | ✅ |
| `handleToggleStage` | referenced in SCOPE LOCK | line 1261, exists and used | ✅ |
| `handleSaveStage` | referenced in SCOPE LOCK | line 1300, exists and used | ✅ |
| `const { t } = useI18n()` | referenced in Fix 4 | line 1067 | ✅ |
| `tr()` function | Fix 4 says to use it | NOT in file (0 occurrences) | ❌ (prompt acknowledges, but buried) |

## Fix-by-Fix Analysis

**Fix 1 — REMOVE ChannelFilter:** SAFE with corrections. The component and constant are truly dead code. But the prompt's instructions about removing JSX call and state are wrong (they don't exist). Risk: executor wastes time searching, may doubt the prompt's accuracy and lose confidence.

**Fix 2 — REDESIGN FixedStageRow:** RISKY. This is a 134-line replacement with a complex 3-mode component. No JSX skeleton provided. New handlers (`handleChannelToggle`, `handleRoleToggle`) need implementation from scratch. `getRoleLabel` inside current component must be preserved. Desktop vs mobile UX conflict (EditStageDialog vs autosave) needs clarification. High chance of the executor producing something that doesn't match wireframes perfectly on first try.

**Fix 3 — ADD mobile legend:** SAFE. Clean, self-contained JSX provided. Insertion point is clear. Only risk: depends on Fix 4 for `tr()` helper — without `tr`, the `tr('channel.hall', 'В зале')` calls will fail.

**Fix 4 — i18n LOCAL_UI_TEXT:** SAFE with correction. The tr() helper MUST be created first (doesn't exist in file). The replacement table is complete and accurate. The text changes for enabled/disabled are intentional but should be noted. Usage in normalization logic (lines 249, 258, 267, 276) for blocker messages is correctly covered.

**Fix 5 — REMOVE dead code:** SAFE. All 4 functions are confirmed unused in JSX. Minor risk: `handleDeleteStage` is connected to `deleteDialog` state and `handleConfirmDelete` — these may also become orphaned.

## Summary
Total: 11 issues (3 CRITICAL, 5 MEDIUM, 3 LOW)
Prompt clarity rating: 3/5

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 3/5**
- **What was most clear:** Line numbers are accurate (except phantom JSX/state references). Wireframes are detailed and well-formatted. SCOPE LOCK and DESIGN SYSTEM sections are excellent — they give clear guardrails. The LOCAL_UI_TEXT replacement table in Fix 4 is complete.
- **What was ambiguous or could cause hesitation:**
  - Fix 1 references non-existent JSX call and state — executor will lose confidence in prompt accuracy
  - Fix 2 is very large with no code skeleton — executor must invent implementation from wireframes alone
  - Fix 2 desktop/mobile UX conflict (EditStageDialog vs autosave) is unclear
  - Fix 4 `tr()` helper creation is conditional/buried when it should be mandatory/first
  - No explicit execution order for the 5 fixes
- **Missing context:**
  - JSX skeleton for Fix 2 collapsed row (at minimum)
  - Implementation skeleton for `handleChannelToggle` / `handleRoleToggle`
  - Note about `getRoleLabel` being inside the component being replaced
  - Explicit dependency chain: Fix 4 → Fix 1 → Fix 3 → Fix 2 → Fix 5
  - Confirmation that enabled/disabled text change is intentional
