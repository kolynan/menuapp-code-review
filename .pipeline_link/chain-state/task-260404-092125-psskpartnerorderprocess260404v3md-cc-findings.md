# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: task-260404-092125-psskpartnerorderprocess260404v3md
Prompt: pssk-partnerorderprocess-redesign-260404-v3.md

## Issues Found

1. [CRITICAL] Fix 4 — `analyzeStageSet()` has no access to `t()` — Prompt says to replace ALL `LOCAL_UI_TEXT.blocker*` with `t('orderprocess.blocker.*')`, but `analyzeStageSet()` (line 229) is a standalone helper function with signature `function analyzeStageSet(stages)` — it does NOT receive `t` as a parameter. The blocker strings at lines 249, 258, 267, 276 cannot use `t()` directly. The prompt's replacement table lists `LOCAL_UI_TEXT.blockerGeneric`, `blockerMultipleStart`, `blockerMultipleFinish`, `blockerTooManyMiddle`, `blockerUnsupportedType` — of these, only `blockerGeneric` (used at line 1505 inside JSX) has `t()` available. The other 4 are inside `analyzeStageSet()` which lacks `t()`.

   **PROMPT FIX:** Two options:
   - (A) Change `analyzeStageSet` to store i18n KEYS (e.g. `blocker: "orderprocess.blocker.multiple_start"`) instead of translated text, then at the display point (line 1508) wrap with `t(stageAnalysis.blocker)`. This is cleaner.
   - (B) Add `t` as a second parameter to `analyzeStageSet(stages, t)` and update its call-site at line 1136. This adds coupling but is simpler.
   
   Recommend option (A): store keys in analyzeStageSet, translate at display. Add explicit instruction to prompt.

2. [MEDIUM] Fix 4 — `LOCAL_UI_TEXT.locked` value mismatch — Code has `"Зафиксировано"` (line 127), prompt replacement says `"Зафиксирован"`. This is intentional per UX v2.0, but prompt should explicitly note the CHANGE from "Зафиксировано" to "Зафиксирован" so the executor doesn't think it's a typo and revert. Currently prompt says nothing about this deliberate wording change.

   **PROMPT FIX:** Add a note: `⚠️ NOTE: The Russian text intentionally changes from "Зафиксировано" to "Зафиксирован" per UX v2.0.`

3. [MEDIUM] Fix 4 — `LOCAL_UI_TEXT.enabled`/`disabled` → `active`/`inactive` mapping — Prompt says replace `LOCAL_UI_TEXT.enabled` with `t('orderprocess.status.active')` and `LOCAL_UI_TEXT.disabled` with `t('orderprocess.status.inactive')`. The current text is "Вкл"/"Выкл" and new values are "Активен"/"Выключен". This is correct per UX v2.0, and the prompt does note this. However, the usage at line 712 is INSIDE the old FixedStageRow which is being REPLACED in Fix 2. The new FixedStageRow code in Fix 2 already uses `t('orderprocess.status.active')` and `t('orderprocess.status.inactive')` directly. So Fix 4's replacement of these two keys is actually a NO-OP since the old code is deleted in Fix 2.

   **PROMPT FIX:** Note that `enabled`/`disabled` replacements at line 712 are moot because Fix 2 replaces FixedStageRow entirely. Only remaining usages outside FixedStageRow need replacement. Grep confirms: `LOCAL_UI_TEXT.enabled` and `LOCAL_UI_TEXT.disabled` are ONLY at line 712 (inside old FixedStageRow). Since Fix 2 replaces the component, these are already handled. The prompt should clarify this to avoid confusion.

4. [MEDIUM] Fix 4 — `LOCAL_UI_TEXT.locked` at line 698 also inside old FixedStageRow — Same issue as #3. The `LOCAL_UI_TEXT.locked` usage at line 698 is inside the OLD FixedStageRow being replaced by Fix 2. The new component already uses `t('orderprocess.status.locked')`. Only the usage at line 1505 area needs explicit replacement. The `LOCAL_UI_TEXT.currentProcess` at line 1589 also needs replacement — prompt covers this.

   **PROMPT FIX:** Clarify which `LOCAL_UI_TEXT` references are inside old FixedStageRow (auto-deleted by Fix 2) vs elsewhere (need explicit replacement). Actual references needing manual replacement after Fix 2:
   - Line 1589: `LOCAL_UI_TEXT.currentProcess` → `t('orderprocess.current_process')`
   - Line 1505: `LOCAL_UI_TEXT.blockerGeneric` → `t('orderprocess.blocker.generic')`
   - Lines 249, 258, 267, 276: blocker strings inside `analyzeStageSet()` → see Issue #1
   - Lines 698, 712: INSIDE old FixedStageRow → deleted by Fix 2 (no action needed)

5. [MEDIUM] Fix 5 — `deleteMutation` is a top-level hook — Prompt correctly warns about hook order. `deleteMutation` (line 1219, `useMutation`) is a top-level React hook. If `handleDeleteStage` and `handleConfirmDelete` are removed, the `deleteMutation` hook call MUST remain or the component will crash due to changed hook call order. The prompt's Step B instruction covers this: "do NOT delete those hook calls." But the connection is indirect — prompt says to check if dead functions are "connected to useMutation hooks" but doesn't explicitly name `deleteMutation` as the one connected to `handleConfirmDelete`. The executor needs to grep and figure this out.

   **PROMPT FIX:** Explicitly state: "`deleteMutation` (line 1219) is used by `handleConfirmDelete` — do NOT remove the `useMutation` call. Leave it in place with comment `// reserved — do not remove (hook order)`. Similarly, `createMutation` (line 1209) is used by `handleSaveStage` (NOT dead code) — do not touch."

6. [MEDIUM] Fix 5 — `deleteDialog` state removal risk — Prompt says to delete `deleteDialog` useState if grep confirms 0 usages. But `deleteDialog` is used inside `deleteMutation`'s `onSuccess` callback at line 1223: `setDeleteDialog({ open: false, stage: null })`. If we keep `deleteMutation` (for hook order) but delete `deleteDialog` state, the `onSuccess` will crash calling `setDeleteDialog` which no longer exists.

   **PROMPT FIX:** Explicitly state: "If `deleteMutation` hook is kept for hook order safety, then `deleteDialog` state (line 1079) must ALSO be kept. Do NOT delete `deleteDialog` independently."

7. [LOW] Fix 2 — `editingKey` state declared but unused — The prompt adds `const [editingKey, setEditingKey] = useState(null)` with comment "reserved for future inline edit (not used yet)". Adding dead state to production code is unnecessary complexity. Consider removing this unless there's an immediate plan to use it.

   **PROMPT FIX:** Remove `editingKey` state declaration — adding unused state violates YAGNI. If needed later, it can be added in the future КС.

8. [LOW] Fix 2 — Icon imports assumed present — Prompt says `ChevronUp`, `ChevronDown`, `Lock`, `Pencil`, `Utensils`, `Package`, `Truck` are "already imported, do NOT re-import." Verified at line 11-13: `ChevronUp, ChevronDown` ✅, `Utensils, Package, Truck` ✅, `Lock` ✅, `Pencil` ✅. All imports confirmed.

   No fix needed — prompt is correct.

9. [LOW] Fix 1 — Correct: ChannelFilter is dead code — Verified: `ChannelFilter` is defined at line 582 but never called in JSX (grep `<ChannelFilter` returns 0 matches). `CHANNEL_FILTERS` at line 35 is only used inside `ChannelFilter` component. Safe to delete both. Prompt is accurate.

   No fix needed.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ChannelFilter function | 582-630 | 582-630 | ✅ |
| CHANNEL_FILTERS constant | 35-40 | 35-40 | ✅ |
| FixedStageRow function | 636-769 | 636-769 | ✅ |
| getRoleLabel (inside FixedStageRow) | 664 | 664 | ✅ |
| LOCAL_UI_TEXT constant | 125-135 | 125-135 | ✅ |
| useState group (toggleBusyKey) | 1076-1079 | 1076-1079 | ✅ |
| `<FixedStageRow` call-site | 1609-1618 | 1609-1618 | ✅ |
| handleAddStage | 1229 | 1229 | ✅ |
| handleMoveUp | 1365 | 1365 | ✅ |
| handleMoveDown | 1390 | 1390 | ✅ |
| handleDeleteStage | 1326 | 1326 | ✅ |
| `const { t } = useI18n()` | 1067 | 1067 | ✅ |
| `bg-white rounded-xl border overflow-hidden` | main render | 1608 | ✅ |
| PipelinePreview | 548-576 | 548-576 | ✅ |
| EditStageDialog | 775-993 | 775 (start confirmed) | ✅ |

## Prop Name Verification (v2 had 4 CRITICAL wrong props — v3 fixes)
| Prop | Prompt v3 says | Actual code | Status |
|------|---------------|-------------|--------|
| `slot.channels.enabled_hall` | enabled_hall | line 643: `slot.channels.enabled_hall` | ✅ FIXED |
| `slot.active` | slot.active | line 365: `active: slot.locked ? true : ...` | ✅ FIXED |
| `slot.allowedRoles` | slot.allowedRoles | line 367: `allowedRoles: getStageRoles(...)` | ✅ FIXED |
| `slot.label` | slot.label | line 363: `label: getSystemStageLabel(slot, t)` | ✅ FIXED |
| `slot.canEdit` | slot.canEdit | line 369: `canEdit: Boolean(stage)` | ✅ FIXED |
| `slot.definition.locked` | slot.definition.locked | line 361: `definition: slot` | ✅ FIXED |
| `slot.color` | slot.color | line 366: `color: stage?.color \|\| slot.color` | ✅ FIXED |
| `slot.key` | slot.key | line 360: `key: slot.key` | ✅ FIXED |
| `slot.index` | slot.index | line 362: `index` (assigned as index) | ✅ FIXED |
| `slot.stage` | slot.stage | line 364: `stage` (DB object or null) | ✅ FIXED |

## Fix-by-Fix Analysis

### Fix 4 (i18n LOCAL_UI_TEXT removal) — RISKY
- The `analyzeStageSet()` problem (Issue #1) is a CRITICAL blocker. Without addressing how blocker strings work without `t()`, this fix will either crash or produce raw i18n keys in the UI.
- The `LOCAL_UI_TEXT.locked` and `enabled`/`disabled` replacements at lines 698/712 are inside old FixedStageRow — moot since Fix 2 replaces it. But executor might try to replace them first (since Fix 4 runs before Fix 2 per execution order), then Fix 2 would discard those changes anyway. This is inefficient but not harmful.

### Fix 1 (remove ChannelFilter) — SAFE
- Clean dead code removal. Zero JSX usages confirmed. CHANNEL_FILTERS only used by ChannelFilter.

### Fix 3 (mobile channel legend) — SAFE
- Simple JSX insertion before a unique class string. Low risk.

### Fix 2 (redesign FixedStageRow) — SAFE (with v3 fixes)
- All prop names now match `buildFixedStageSlots` output ✅
- Call-site update included ✅
- `getRoleLabel` preserved with `useCallback([t])` ✅
- Touch targets 44px ✅
- Responsive `sm:hidden`/`sm:flex` ✅
- One minor issue: `editingKey` dead state (Issue #7)

### Fix 5 (remove dead handlers) — RISKY
- Hook order warning is present but not specific enough (Issues #5, #6)
- `deleteMutation` + `deleteDialog` coupling not explicitly addressed

## Summary
Total: 9 issues (1 CRITICAL, 5 MEDIUM, 3 LOW — of which 2 LOW are "no fix needed")
Actionable: 1 CRITICAL, 5 MEDIUM, 1 LOW = 7 issues requiring prompt changes

## Prompt Clarity (MANDATORY)
- Overall clarity: **4/5** (v3 is a major improvement over v2 — prop names fixed, call-site update included, hook order warning added)
- What was most clear: Prop name documentation with "VERIFIED against real code" table; explicit execution order with reasoning; FROZEN UX list; wireframes for all states
- What was ambiguous or could cause hesitation:
  - `analyzeStageSet()` blocker string replacement will confuse executor — `t()` not available in that scope
  - Which `LOCAL_UI_TEXT` references are auto-deleted by Fix 2 vs need manual replacement is not clear
  - Fix 5 hook/state coupling (`deleteMutation` ↔ `deleteDialog`) not explicitly called out
- Missing context: 
  - How to handle blocker strings in `analyzeStageSet()` (store keys, translate at display)
  - Explicit list of `LOCAL_UI_TEXT` references that survive Fix 2 deletion
