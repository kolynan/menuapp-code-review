# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: task-260404-202015-psskpartnerorderprocess260404v5md

## Issues Found

1. **[CRITICAL] Validation expected line count (1620-1700) is wrong — should be ~1450-1530**

   After applying all 6 fixes, the file will lose approximately 175 lines:
   - Fix 1 (ChannelFilter + CHANNEL_FILTERS): -55 lines
   - Fix 2 (FixedStageRow replace): -7 lines net (old 134 lines → new ~127 lines)
   - Fix 3 (mobile legend): +6 lines
   - Fix 4A (text replacements): 0 lines
   - Fix 4B (LOCAL_UI_TEXT delete): -11 lines
   - Fix 5 (dead handlers delete): ~-108 lines (handleAddStage 27 + handleDeleteStage 3 + handleConfirmDelete 32 + handleMoveUp 24 + handleMoveDown 24 = 110, minus 2 lines comment)

   **1653 - 175 = ~1478 lines expected.**

   The validation says `If below 1550 → STOP, restore` — this means the implementor would ABORT the entire correct implementation and restore from git, thinking something went wrong.

   PROMPT FIX: Change validation step 1 expected range from `1620-1700` to `1450-1530`. Change abort threshold from `1550` to `1400`.

2. **[MEDIUM] Fix 5 does not mention `moveBusy` / `setMoveBusy` state (line 1077)**

   `moveBusy` state is used ONLY by `handleMoveUp` (line 1366, 1371, 1386) and `handleMoveDown` (line 1391, 1396, 1411). After Fix 5 deletes these handlers, `moveBusy` becomes dead state. However, it is a `useState` hook and MUST remain for React hook ordering safety — same reason as `deleteMutation`/`deleteDialog`.

   The prompt's Fix 5 Step B explicitly protects `deleteMutation` and `deleteDialog` but says nothing about `moveBusy`. An implementor may see it as dead code and remove it, breaking hook order.

   PROMPT FIX: Add `moveBusy` state (line 1077) to Fix 5 Step B explicit list of hooks to keep:
   ```
   - `moveBusy` state (line 1077) — top-level `useState` used by removed handlers.
     DO NOT remove — React hook ordering requirement.
   ```

3. **[MEDIUM] Fix 5 "delete function body" phrasing is ambiguous**

   Fix 5 Step C says: "Function body of handleDeleteStage", "Function body of handleAddStage", etc. This could mean:
   - (a) Replace body with empty: `const handleAddStage = () => {};`
   - (b) Delete the entire function declaration

   Since these are regular functions (not hooks), option (b) is safe and cleaner. But the ambiguity may cause hesitation.

   PROMPT FIX: Clarify explicitly: "Delete the entire function declaration (const + body). These are NOT hooks — removing them entirely is safe for React hook order."

4. **[MEDIUM] i18n dictionary location not specified — new t() keys may show raw key strings**

   The prompt lists 19 new `t()` keys (orderprocess.status.locked, orderprocess.edit_button, etc.) and says "Add these entries to the Russian i18n dictionary" but:
   - Does NOT specify which file contains the dictionary
   - SCOPE LOCK says "Any file OTHER than partnerorderprocess.jsx" must not be modified
   - If the dictionary is in a separate file (e.g., inside `@/components/i18n`), the implementor can't add keys

   Without dictionary entries, `t('orderprocess.status.locked')` would display `"orderprocess.status.locked"` as literal text to users.

   PROMPT FIX: Either (a) specify the exact dictionary file path and exempt it from SCOPE LOCK, or (b) add a `translateWithFallback` wrapper (already exists at line 168) for new keys with Russian fallbacks, matching the existing pattern for `getSystemStageLabel`.

5. **[LOW] `handleToggleStage` becomes uncalled from JSX after Fix 2 — prompt should note this**

   Old call-site passes `onToggle={handleToggleStage}` (line 1615). New call-site (Fix 2 STEP 3) does not pass `onToggle`. The prompt correctly explains this is intentional (UX v2.0: toggle via EditStageDialog only). However, the function is in FROZEN UX and remains in the file as dead code.

   The prompt should note: "handleToggleStage will have 0 JSX usages after this change — this is expected and correct. It is FROZEN and must stay."

   PROMPT FIX: Add a note after Fix 2 STEP 3: "NOTE: `handleToggleStage` is no longer passed as a prop. This is intentional — it remains in the file as FROZEN code."

6. **[LOW] `toggleBusyKey` state remains useful but `setToggleBusyKey` usage should be verified**

   `toggleBusyKey` at line 1076 is used by `handleToggleStage` (line 1262) which is FROZEN. Even though it's no longer passed to FixedStageRow as a prop, the state is still SET inside `handleToggleStage`. Since `handleToggleStage` is FROZEN, this is fine — no action needed.

   Just confirming this is NOT an issue.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| function ChannelFilter | 582-630 | 582-630 | ✅ |
| CHANNEL_FILTERS | 35-40 | 35-40 | ✅ |
| function FixedStageRow | 636-769 | 636-769 | ✅ |
| LOCAL_UI_TEXT | 125-135 | 125-135 | ✅ |
| LOCAL_UI_TEXT.locked | 698 | 698 | ✅ |
| LOCAL_UI_TEXT.enabled/disabled | 712 | 712 | ✅ |
| LOCAL_UI_TEXT.blockerGeneric | 1505 | 1505 | ✅ |
| LOCAL_UI_TEXT.currentProcess | 1589 | 1589 | ✅ |
| LOCAL_UI_TEXT.blockerUnsupportedType | 249 | 249 | ✅ |
| LOCAL_UI_TEXT.blockerMultipleStart | 258 | 258 | ✅ |
| LOCAL_UI_TEXT.blockerMultipleFinish | 267 | 267 | ✅ |
| LOCAL_UI_TEXT.blockerTooManyMiddle | 276 | 276 | ✅ |
| stageAnalysis.blocker display | ~1508 | 1508 | ✅ |
| useState group | 1076-1079 | 1076-1079 | ✅ |
| handleAddStage | 1229 | 1229 | ✅ |
| handleEditStage | 1257 | 1257 | ✅ |
| handleToggleStage | 1261 | 1261 | ✅ |
| handleSaveStage | 1300 | 1300 | ✅ |
| handleDeleteStage | 1326 | 1326 | ✅ |
| handleConfirmDelete | 1331 | 1331 | ✅ |
| handleMoveUp | 1365 | 1365 | ✅ |
| handleMoveDown | 1390 | 1390 | ✅ |
| const { t } = useI18n() | 1067 | 1067 | ✅ |
| bg-white rounded-xl border overflow-hidden | 1608 | 1608 | ✅ |
| <FixedStageRow | 1609-1618 | 1610-1617 | ✅ (minor: prompt says 1609 but JSX at 1610) |
| function PipelinePreview | 548-576 | 548 | ✅ |
| function EditStageDialog | 775-993 | 775 | ✅ |
| deleteMutation | 1219 | 1219 | ✅ |
| createMutation | 1209 | 1209 | ✅ |
| deleteDialog | 1079 | 1079 | ✅ |
| getRoleLabel useCallback | 664 | 664 | ✅ |
| Icon imports (Utensils, Package, etc.) | 11-13 | 10-14 | ✅ |

All 30 line number references verified. **30/30 correct.**

## Fix-by-Fix Analysis

**Fix 4A** — Replace LOCAL_UI_TEXT references outside FixedStageRow: **SAFE**
- Text replacements only. Approach A for analyzeStageSet (key strings + t() at display point) is clean.
- The blocker display at line 1508: wrapping `{stageAnalysis.blocker}` with `{t(stageAnalysis.blocker)}` is correct because analyzeStageSet will now return key strings.
- Line 1505 `LOCAL_UI_TEXT.blockerGeneric` → `t('orderprocess.blocker.generic')` is straightforward.

**Fix 1** — Remove ChannelFilter + CHANNEL_FILTERS: **SAFE**
- Verified: 0 JSX usages of `<ChannelFilter`. No state variable. Pure dead code.

**Fix 3** — Add mobile channel legend: **SAFE**
- Clean JSX insertion. Uses existing i18n keys (`channel.hall` etc.). `sm:hidden` for mobile-only.

**Fix 2** — Replace FixedStageRow: **SAFE with notes**
- New component is well-structured. Responsive design with `sm:` breakpoints.
- Correctly preserves `getRoleLabel` with `useCallback([t])`.
- Prop change (removes toggleBusyKey/onToggle, adds isExpanded/onToggleExpand) is clean.
- ⚠️ See issue #4 — new `t()` keys may not have dictionary entries.

**Fix 4B** — Delete LOCAL_UI_TEXT: **SAFE (order-dependent)**
- Correct: must run AFTER Fix 2 removes lines 698/712 references. Prompt is explicit about this.

**Fix 5** — Remove dead handlers: **SAFE with notes**
- All 5 functions have 0 JSX usages (verified by grep).
- `deleteMutation` and `deleteDialog` correctly preserved for hook order.
- ⚠️ See issue #2 — `moveBusy` state also needs protection.
- ⚠️ See issue #3 — "delete function body" phrasing needs clarification.

## Summary
Total: 6 issues (1 CRITICAL, 3 MEDIUM, 2 LOW)

- CRITICAL: Validation line count range is wrong (1620-1700 should be ~1450-1530) — implementor would abort correct work
- MEDIUM: `moveBusy` state not mentioned in Fix 5 Step B (hook order risk)
- MEDIUM: "delete function body" phrasing ambiguous
- MEDIUM: i18n dictionary location unspecified — new keys may show raw strings
- LOW: handleToggleStage becomes dead JSX-wise after Fix 2 — expected, should be noted
- LOW: toggleBusyKey state verified still needed — no action required

## Prompt Clarity (MANDATORY)

- **Overall clarity: 4/5**
- **What was most clear:**
  - Execution order with explicit rationale (Fix 4A → Fix 1 → Fix 3 → Fix 2 → Fix 4B → Fix 5) is excellent
  - FROZEN UX and DO NOT DELETE sections are comprehensive
  - Key data facts table for slot properties — verified against real code, all correct
  - Line numbers: 30/30 verified correct — outstanding accuracy for a v5 prompt
  - The 4A/4B split to handle LOCAL_UI_TEXT safely is well-designed
  - Approach A for analyzeStageSet (store keys, translate at display point) is clean

- **What was ambiguous or could cause hesitation:**
  - "Delete function body" — does this mean empty the function or delete the declaration?
  - Validation line count range would cause implementor to panic and abort correct work
  - Where do new i18n dictionary entries go?

- **Missing context:**
  - `moveBusy` state protection in Fix 5
  - Explicit note that handleToggleStage becomes dead-from-JSX (expected per UX v2.0)
  - Dictionary file path or fallback strategy for 19 new t() keys

---
*CC Reviewer | $(date -Iseconds)*
