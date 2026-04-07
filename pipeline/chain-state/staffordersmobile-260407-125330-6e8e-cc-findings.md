# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-125330-6e8e

## Issues Found

1. **[CRITICAL] Fix 1: Three instances of inner card, prompt only describes one deletion.**
   The grep pattern `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2` matches at **3 lines**: 584, 1196, and 2180. These correspond to three render paths in OrderGroupCard:
   - Line 584: legacy render path (uses `renderLegacyOrderCard`)
   - Line 1196: secondary legacy render path (uses `renderLegacyOrderCard`)
   - Line 2180: hall-mode render path (uses `renderHallRows`)
   
   The prompt describes deleting the block but the post-fix grep check says "ожидается: 0". If only the hall-mode instance (line 2180) is deleted, grep returns 2 — the check FAILS. If all 3 are deleted, legacy paths lose their inner card too (possibly correct but not described).
   
   **PROMPT FIX:** Explicitly state whether to delete ALL 3 instances or only the hall-mode one (line ~2180). If only one, change the grep expected count from 0 to 2. If all three, describe each location briefly (lines ~584, ~1196, ~2180) and confirm that legacy paths also have the same duplication bug.

2. **[CRITICAL] Fix 3: handleSingleAction signature change breaks the call chain.**
   The prompt says to change `handleSingleAction(row.order)` → `handleSingleAction(row.order, row.id)` and "add `rowId` in параметры". But `handleSingleAction` is currently:
   ```js
   const handleSingleAction = useCallback((order) => handleOrdersAction([order]), [handleOrdersAction]);
   ```
   This delegates to `handleOrdersAction` → `startUndoWindow` → `setUndoToast(...)`. The `rowId` must be threaded through the ENTIRE chain: `handleSingleAction(order, rowId)` → `handleOrdersAction([order], rowId)` → `startUndoWindow(orders, rowId)` → `setUndoToast({..., rowId})`.
   
   The prompt only mentions the first and last hops but doesn't describe changes to `handleOrdersAction` (line ~1899) or `startUndoWindow` (line ~1862). An implementor may add `rowId` to `handleSingleAction` but it never reaches `setUndoToast`.
   
   **PROMPT FIX:** Add explicit instructions for threading `rowId` through the full chain:
   - `handleSingleAction(order, rowId)` → pass `rowId` to `handleOrdersAction`
   - `handleOrdersAction(orders, rowId)` → pass `rowId` to `startUndoWindow`
   - `startUndoWindow(orders, rowId)` → include `rowId` in the `setUndoToast({..., rowId})` call
   
   Or alternatively: set `rowId` directly in `handleSingleAction` via a separate mechanism (e.g., a ref) to avoid changing 3 function signatures.

3. **[CRITICAL] Fix 4: Three instances of closeDisabledReasons.map, prompt only describes one change.**
   Similar to Fix 1, `closeDisabledReasons.map` appears at **3 locations**: lines 716, 1327, and 2206. These are in the same three render paths. The prompt describes changing `<p>` to `<button>` with `reasonToRef` but doesn't specify which instance(s) to modify.
   
   **PROMPT FIX:** Specify that ALL 3 instances should be updated (or only line 2206 for hall-mode). If only one, clarify which. If all three, note that `reasonToRef` and section refs must be available in scope for all three render paths.

4. **[MEDIUM] Fix 2: renderHallSummaryItem `<span>` → `<button>` — key prop placement.**
   Current code at line 2036: `<span key={item.key} className={...}>`. The prompt says to replace with `<button type="button" key={item.key} onClick={...} ...>`. This is correct, but `renderHallSummaryItem` is used inside `.map()` — when changing from `<span>` to `<button>`, the returned JSX element type changes. This is fine for React, but the prompt should note that the `key` prop goes on the outer element (already the case).
   
   Additionally, the prompt says "Добавить `cursor-pointer active:opacity-70`" but doesn't specify WHERE in the existing className string. The current className is dynamic: `` `inline-flex items-center gap-1.5 text-xs font-medium ${getSummaryTone(item.kind, item.ageMin)}` ``. Should append at the end.
   
   **PROMPT FIX:** Show the complete replacement className: `` `inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer active:opacity-70 ${getSummaryTone(item.kind, item.ageMin)}` ``.

5. **[MEDIUM] Fix 2: Refs attached to sections that may not exist in all render paths.**
   The prompt says to add `ref={requestsSectionRef}` to the `<div>` in `tableRequests.length > 0 && <div>`. But this pattern appears in THREE render paths (lines 598, 1209, 2194). The refs are declared once (in the component body) but must be attached in the correct render path. The prompt doesn't specify which of the three `tableRequests.length > 0` blocks to modify.
   
   **PROMPT FIX:** Specify that refs should be attached in the hall-mode expanded area (the block around line ~2194 that uses `renderHallRows`), not the legacy blocks at lines ~598 and ~1209.

6. **[MEDIUM] Fix 3: showToast logic replacement — `renderedToast.add` duplication.**
   Current code (line 2062): `if (showToast) renderedToast.add(toastOrderId);`
   Prompt replacement includes `if (showToast) renderedToast.add(undoToast.orderId);` in the same replacement block. But the prompt also says "Обновить строку `if (showToast) renderedToast.add(toastOrderId)` → уже включено выше" — this is potentially confusing. The implementor might not realize they need to DELETE the old line since it's "already included" in the new block.
   
   **PROMPT FIX:** Be explicit: "Delete the line `if (showToast) renderedToast.add(toastOrderId);` — this logic is now part of the replacement block above."

7. **[MEDIUM] Fix 5: `overdueMinutes` availability in `renderHallRows` scope.**
   `overdueMinutes` is a component prop (line 1673) of `OrderGroupCard`. `renderHallRows` is a `useCallback` inside the same component, so it CAN access `overdueMinutes` via closure. However, `overdueMinutes` is NOT currently in the dependency array: `[advanceMutation.isPending, handleSingleAction, undoToast, setUndoToast]`. The prompt correctly says to add it. This is fine.
   
   BUT: `row.order?.created_date` is used in the urgency calculation. For inProgress orders, the relevant timestamp might be `stage_entered_at` (when the order entered the current stage), not `created_date`. The UX doc (#13) may specify which timestamp to use. Using `created_date` means urgency = total order age, not time-in-stage.
   
   **PROMPT FIX:** Clarify whether urgency should be based on `row.order?.created_date` (total order age) or `row.order?.stage_entered_at` (time in current stage). If per-stage, the code should be: `getAgeMinutes(row.order?.stage_entered_at || row.order?.created_date)`.

8. **[LOW] Fix 2: Missing `inProgress` in scrollToSection refMap.**
   The refMap has `requests`, `new`, `ready` but no `inProgress`. This is actually correct because `hallSummaryItems` only includes request/new/ready chips (no inProgress chip exists). No fix needed, but the prompt could add a comment noting this intentional omission to avoid implementor confusion.
   
   **PROMPT FIX:** Add note: "Note: hallSummaryItems does not include inProgress chips, so no inProgress entry in scrollToSection refMap."

9. **[LOW] Post-fix syntax check will fail.**
   The prompt suggests: `node --input-type=module < staffordersmobile.jsx`. JSX files cannot be parsed by Node.js directly — this will always error on JSX syntax. This check is ineffective.
   
   **PROMPT FIX:** Remove the node syntax check or replace with a more useful check like `grep -c "function\|const.*=.*=>" staffordersmobile.jsx` to verify function count hasn't decreased.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ownerHintTimerRef = useRef(null) | "near other useRef" | Line 1747 | ✅ Exists |
| renderHallSummaryItem | "useCallback" | Line 2033 | ✅ Exists |
| `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2` | "inside expanded area after group.type table" | Lines 584, 1196, **2180** | ⚠️ 3 instances, not 1 |
| `const isLastOfOrder` | in renderHallRows | Line 2060 | ✅ Exists |
| `setUndoToast(` | "where toast is set" | Lines 1865, 1867, 2086, 3037 | ✅ Multiple call sites |
| `handleSingleAction(row.order)` | in renderHallRows | Line 2077 | ✅ Exists |
| `closeDisabledReasons.map` | "in close table section" | Lines 716, 1327, **2206** | ⚠️ 3 instances |
| `rows.map((row, idx)` | in renderHallRows | Line 2059 | ✅ Exists |
| `getAgeMinutes` | "global function" | Line 366 (definition) | ✅ Global function |
| `overdueMinutes` | "component prop" | Line 1673 (destructured prop) | ✅ Available in scope |
| `tableRequests.length > 0 && <div>` | "section начала" | Lines 598, 1209, **2194** | ⚠️ 3 instances |
| `newOrders.length > 0 && <div>` | "new section" | Lines 630, 1241, **2196** | ⚠️ 3 instances |
| `readyOrders.length > 0 && <div>` | "ready section" | Lines 668, 1279, **2200** | ⚠️ 3 instances |
| `inProgressSections.length > 0 && <div>` | Fix 4 ref target | Lines 640, 1251, **2198** | ⚠️ 3 instances |
| `HALL_UI_TEXT.requestsBlocker` etc. | Fix 4 reason keys | Lines 2004-2007 | ✅ All 4 blockers exist |
| `renderHallRows` dep array | current deps | Line 2094 | ✅ Matches prompt |

## Fix-by-Fix Analysis

### Fix 1: Remove duplicate inner card — RISKY
- Risk: 3 matching blocks exist; prompt implies all should go (grep=0) but only describes one deletion context. Deleting wrong instance or forgetting one = broken grep check or broken legacy path.
- The block at line 2180 (hall-mode) is the correct primary target. Lines 584 and 1196 are legacy render paths that likely have the same visual duplication bug.

### Fix 2: Jump chips scroll — SAFE (with clarification)
- The core logic is sound: add refs, attach to sections, make chips tappable.
- Risk: refs must only be attached in the hall-mode render path (~line 2194+), not legacy paths. Prompt doesn't specify which instance of `tableRequests.length > 0 && <div>` to modify.

### Fix 3: Toast under clicked row — RISKY
- Critical gap: `rowId` won't reach `setUndoToast` because the prompt doesn't describe changes to `handleOrdersAction` and `startUndoWindow` intermediary functions. Fix will be incomplete.

### Fix 4: Close reasons tappable — RISKY (same 3-instance problem)
- 3 instances of `closeDisabledReasons.map` exist. `reasonToRef` mapping is clean but only works if section refs from Fix 2 are in scope.
- Fix 2 and Fix 4 share refs — if Fix 2 fails, Fix 4's scroll targets won't work either. This dependency should be noted.

### Fix 5: Age urgency border — SAFE
- `getAgeMinutes` is a global function, `overdueMinutes` is in scope via prop. The calculation and className injection are straightforward.
- Minor question: `created_date` vs `stage_entered_at` for urgency — prompt uses `created_date` which shows total order age.

## Summary
Total: **9 issues** (3 CRITICAL, 4 MEDIUM, 2 LOW)

### Critical issues that MUST be fixed before execution:
1. Fix 1 has 3 matching blocks — specify which to delete or change grep expectation
2. Fix 3 `rowId` threading is incomplete — `handleOrdersAction` and `startUndoWindow` changes missing
3. Fix 4 has 3 matching blocks — specify which to update

### Medium issues that should be clarified:
4. Fix 2 className for button replacement needs full string
5. Fix 2 refs must specify which render path (hall-mode, ~line 2194)
6. Fix 3 deletion of old `renderedToast.add` line needs explicit instruction
7. Fix 5 timestamp choice (`created_date` vs `stage_entered_at`) should be explicit

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 3/5**
- **What was most clear:** Each fix has a well-structured Problem → Wireframe → What to change → Check format. Grep patterns for finding code are accurate. FROZEN UX section is thorough. KB-095 guard is solid. The wireframes clearly communicate the expected visual outcome.
- **What was ambiguous or could cause hesitation:** The file has 3 parallel render paths (legacy1 ~line 580, legacy2 ~line 1190, hall-mode ~line 2175) and the prompt treats each section (inner card, closeReasons, tableRequests div) as if it appears once. An implementor unfamiliar with the 3-path structure will grep, find 3 matches, and not know which to modify. Fix 3's `rowId` threading through the function call chain is described at the endpoints but missing the middle (handleOrdersAction, startUndoWindow).
- **Missing context:** (1) A note at the top: "This file has 3 render paths for table-type groups: legacy1 (~lines 510-730), legacy2 (~lines 1070-1340), and hall-mode (~lines 2125-2215). All fixes target the **hall-mode path** unless stated otherwise." (2) Fix 3 needs the full call chain described. (3) Fix 5 should specify which timestamp represents urgency.
