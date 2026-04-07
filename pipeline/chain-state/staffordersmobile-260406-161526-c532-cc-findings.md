# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260406-161526-c532

## Issues Found

1. [CRITICAL] **THREE render block groups, not TWO — third group at ~2134-2153 completely unmentioned.** The prompt repeatedly says "Apply in BOTH render blocks (~lines 500-710 and ~1100-1320)" but the file has a THIRD rendering group at lines ~2134-2153 (hall detail view with full sections: requests → new → ready → inProgress → served → bill → close + legacy fallback ~2150-2153). This block uses `renderHallRows`, has `countRows` calls, section headers, `onCloseRequest` buttons, and `closeDisabledReason` — ALL of which are touched by Fixes 1-6. Missing this block means Fix 1 (reorder), Fix 2 (visual weight), Fix 3 (dual metric), Fix 4 (two-step requests), Fix 5 (close blockers), Fix 6 (bulk buttons) will be only partially applied. **PROMPT FIX:** Change all references from "BOTH render blocks" to "ALL THREE render block groups": compact (~590-710), expanded (~1195-1320), and detail view (~2134-2153). Explicitly list the third block's line numbers for each Fix.

2. [CRITICAL] **Fix 7 moves undoToast to OrderGroupCard — contradicts S212 intentional lift to parent.** The prompt says "Move `undoToast` state from StaffOrdersMobile to OrderGroupCard level." But `undoToast` was intentionally lifted to the parent in S212 (commit b00521d) because OrderGroupCard unmounts when the last order in a group advances — killing the toast and undo opportunity. Moving it back re-introduces the exact bug that was fixed. The inline rendering idea is valid, but the state MUST remain in the parent. **PROMPT FIX:** Keep `undoToast` state and `setUndoToast` in StaffOrdersMobile. Keep the prop passing. Add `orderId` + `dishName` to the toast object in `startUndoWindow`. In `renderHallRows`, accept `undoToast` as parameter and render inline toast conditionally. Remove the global fixed-position render at line ~4201 but keep state in parent.

3. [CRITICAL] **Fix 5 changes closeDisabledReason from string to array — breaks all boolean checks.** Currently `closeDisabledReason` is a string or null (line 1967). It's used as: `!!closeDisabledReason` (line 698, 1303, 2146 — disabled prop), `closeDisabledReason ? "..." : "..."` (className ternary), `{closeDisabledReason && <p>` (conditional render). If changed to an array, an EMPTY array `[]` is truthy — the close button will ALWAYS appear disabled and the reason block will always render (even when no blockers exist). **PROMPT FIX:** Either (a) keep a derived boolean `const hasBlockers = closeBlockers.length > 0` and use it everywhere the old string was used as boolean, or (b) explicitly list all 6 locations that need `!!closeDisabledReason` → `closeBlockers.length > 0` and `closeDisabledReason ? ...` → `closeBlockers.length > 0 ? ...` and `{closeDisabledReason && ...}` → `{closeBlockers.length > 0 && ...}`.

4. [MEDIUM] **Legacy render blocks (~708-716, ~1313-1335, ~2150-2153) have sections but are not addressed.** Each "block group" actually has TWO branches: a hall-mode branch (using `renderHallRows`) and a legacy-mode branch (using `renderLegacyOrderCard`). The legacy branches have their own section ordering (New → Ready → InProgress) with hardcoded Russian strings instead of `HALL_UI_TEXT`. The prompt doesn't mention whether Fixes 1-3 should also apply to legacy blocks. If left unchanged, users on legacy mode will see the OLD section order while hall-mode users see the NEW order. **PROMPT FIX:** Add explicit guidance: either apply section reorder to legacy blocks too, OR add a note "Legacy blocks (lines ~708, ~1313, ~2150 using `renderLegacyOrderCard`) — DO NOT CHANGE, these are fallback paths being phased out."

5. [MEDIUM] **Fix 3 grep instruction wrong: `function countRows` doesn't match actual code.** The prompt says "Add helper function near `countRows` (grep: `function countRows`)". Actual code at line 1915: `const countRows = useCallback((rows, fallback) => {`. The grep pattern won't find it. **PROMPT FIX:** Change grep to: `const countRows = useCallback` (line 1915).

6. [MEDIUM] **Fix 3 doesn't address InProgress section dual metric.** The prompt says to apply dual metric to New, Ready, and In Progress sections. But InProgress header uses a completely different pattern: `inProgressSections.reduce((sum, section) => sum + section.rowCount, 0)` — this is an aggregate across sub-groups, not a simple `countRows` call. The prompt provides no instruction on how to compute guest count for InProgress (sum across `inProgressSections[].orders.length`?). **PROMPT FIX:** Add explicit InProgress dual metric: `const ipGuests = inProgressSections.reduce((sum, s) => sum + s.orders.length, 0); const ipDishes = inProgressSections.reduce((sum, s) => sum + s.rowCount, 0);` then use `dualMetric` with these values. Or explicitly state "InProgress uses sub-group structure — show dual metric only on sub-group headers, not the parent InProgress header."

7. [MEDIUM] **Fix 4 has a third onCloseRequest occurrence at line 2134 not mentioned.** The prompt mentions two request render blocks: "~line 607 (compact block)" and "~line 1212 (expanded block)". But there's a THIRD occurrence at line 2134 in the detail view block. This third block also renders requests with `onCloseRequest(request.id, "done")` and needs the same two-step conditional button. **PROMPT FIX:** Add: "Third request render at ~line 2134 (detail view block) — apply same conditional button logic."

8. [MEDIUM] **Fix 5 assumes section refs exist — they don't.** The prompt says tappable close-blocker items should "scroll to relevant section" with `sectionRef`. But no refs are currently defined for any section. Creating refs for all sections (Requests, New, Ready, InProgress, Served) is a non-trivial addition not covered. **PROMPT FIX:** Either (a) add explicit instructions to create `useRef` for each section and attach to section wrappers, or (b) simplify to non-tappable list items (remove scroll-to-section feature from this Fix, create a separate BACKLOG item).

9. [MEDIUM] **Fix 7 inline toast in renderHallRows requires state threading.** `renderHallRows` is a `useCallback` (line 2003) that takes `(rows, tone, readOnly)` — no access to `undoToast` state. Adding inline toast rendering requires either: (a) adding `undoToast` to the callback's closure (and to its dependency array), or (b) passing it as a parameter. The prompt doesn't address this wiring detail. **PROMPT FIX:** Specify: "Add `undoToast` to `renderHallRows` parameters: `renderHallRows(rows, tone, readOnly, activeToast)`. Update all call sites. Add `undoToast` to the `useCallback` dependency array."

10. [LOW] **Fix 4 staff name fallback "first 6 characters of assignee ID" is unfriendly.** Showing `a3f82c` as staff name is confusing for waiters. Consider using a generic label like `HALL_UI_TEXT.otherStaff` or "Коллега" instead. **PROMPT FIX:** Add to HALL_UI_TEXT: `otherStaff: "Коллега"` and use as fallback instead of ID substring.

11. [LOW] **Fix 3 dualMetric function uses `rows.length || orders.length` — orders.length is always the guest count, not a fallback for dish count.** If `rows` is empty array, `rows.length` is 0 (falsy), so it falls back to `orders.length` — making dishes = guests. This should probably be `rows.length > 0 ? rows.length : orders.reduce(...)` or just always use `rows.length`. **PROMPT FIX:** Remove the `|| orders.length` fallback or clarify when rows can be empty.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HALL_UI_TEXT | ~line 305 | line 305 | ✅ |
| requestsBlocker..readyBlocker | ~line 331-334 | lines 331-334 | ✅ |
| countRows function | grep: `function countRows` | line 1915: `const countRows = useCallback` | ❌ wrong grep |
| onCloseRequest compact | ~line 607 | line 607 | ✅ |
| onCloseRequest expanded | ~line 1212 | line 1212 | ✅ |
| onCloseRequest detail (MISSING) | not mentioned | line 2134 | ❌ missing |
| onCloseRequest prop wiring | ~line 4190 | line 4190 | ✅ |
| ServiceRequest mutation | ~line 3315 | line 3315 | ✅ |
| closeDisabledReason | ~line 1967 | line 1967 | ✅ |
| closeDisabledReason render | ~lines 702, 1307 | lines 702, 1307, 2146 | ⚠️ missing 2146 |
| undoToast state | ~line 2714 | line 2714 | ✅ |
| undoToast render | ~line 4201 | line 4201 | ✅ |
| startUndoWindow | ~line 1830 | line 1830 | ✅ |
| effectiveUserId | ~line 2700+ | line 2922 (definition) | ✅ approx |
| staffName | exists in component | line 2922, 4221 | ✅ |
| newOrders compact | ~line 500-710 range | line 616 | ✅ |
| newOrders expanded | ~line 1100-1320 range | line 1221 | ✅ |
| readyOrders compact | in range | line 626 | ✅ |
| readyOrders expanded | in range | line 1231 | ✅ |
| inProgressOrders compact | in range | line 710 | ✅ (at edge of range) |
| inProgressOrders expanded | in range | line 1315 | ✅ (at edge of range) |
| tableRequests compact | ~line 594 | line 590 (length check), 594 (map) | ✅ approx |
| tableRequests expanded | ~line 1199 | line 1195 (length check), 1199 (map) | ✅ approx |
| tableRequests detail (MISSING) | not mentioned | line 2134 | ❌ missing |
| renderHallRows | grep exists | line 2003 (useCallback) | ✅ |
| TWO render blocks | prompt claim | actually THREE (+ legacy variants) | ❌ critical |

## Fix-by-Fix Analysis

### Fix 1 — Section Reorder: RISKY
Correct diagnosis (Ready before InProgress). But only mentions TWO blocks — misses the third at ~2134. Also doesn't address legacy blocks (~708, ~1313, ~2150) which have their own section order.

### Fix 2 — Active/Passive Visual Weight: SAFE (with caveat)
Clear instructions for styling changes. But same "BOTH blocks" problem — needs to include the third block. Also: the opacity-60 wrapper for InProgress sub-groups could affect readability of action buttons within those groups.

### Fix 3 — Dual Metric Headers: RISKY
Good concept. Issues: wrong grep pattern for countRows, InProgress section uses different aggregation pattern (reduce across sub-groups), `dualMetric` function has a questionable `|| orders.length` fallback. Third block at ~2136-2142 not mentioned.

### Fix 4 — Two-Step Requests + Staff Pill: RISKY
Core logic is sound. The mutation wiring analysis is excellent (lines 3315, 4190). But: misses third onCloseRequest at line 2134, and the ServiceRequest entity may not have `assignee`/`assigned_at` fields (no B44 schema verification mentioned). If these fields don't exist, the `.update()` call will silently fail or error. The prompt should add a B44 entity check or note.

### Fix 5 — Action-Oriented Close Text: RISKY
String-to-array refactor is correct in concept but breaks all boolean checks (3 locations × 3 render groups = 9 places to update). Section refs for scroll-to don't exist. This Fix has the highest regression risk.

### Fix 6 — Bulk Request Buttons: SAFE
Logic is straightforward. Depends on Fix 4 (noted correctly). But needs the third block at ~2134.

### Fix 7 — Inline Toast: RISKY
Moving state back to OrderGroupCard re-introduces S212 unmount bug. renderHallRows threading not addressed. This Fix needs the most rework.

## Summary
Total: 11 issues (3 CRITICAL, 6 MEDIUM, 2 LOW)
Prompt clarity rating: 3/5

## Prompt Clarity (MANDATORY)
- **Overall clarity: 3/5** — Individual fix descriptions are well-structured with Currently/Should be/Must NOT be. Grep instructions and line numbers are mostly accurate. But the architectural understanding of the file's render structure is incomplete (3 block groups, not 2), and two fixes have design flaws (Fix 5 array truthiness, Fix 7 state location).
- **What was most clear:** Fix 4 mutation wiring analysis is excellent — traces the full callback chain from prop to mutation to DB call. Fix 1 diagnosis is accurate. FROZEN UX list is comprehensive.
- **What was ambiguous or could cause hesitation:**
  - "Apply in BOTH render blocks" when there are THREE+ block groups — executor will be unsure whether to also touch ~2134-2146 block.
  - Fix 5 scroll-to-section with non-existent refs — executor will either skip the feature or invent an implementation.
  - Fix 7 "move state to OrderGroupCard" contradicts known history of S212 — executor who reads KB may hesitate.
  - Fix 3 InProgress dual metric — executor will try to apply `dualMetric` but InProgress uses `inProgressSections.reduce()`, not `countRows()`.
- **Missing context:**
  - B44 ServiceRequest entity schema — does it have `assignee` and `assigned_at` fields? Fix 4 adds these without verification.
  - Legacy render blocks — should they be updated or left alone?
  - How many total render paths exist in OrderGroupCard — a structural map would prevent missed locations.
  - The `undoToast` lift history (S212) and WHY it was moved to parent.
