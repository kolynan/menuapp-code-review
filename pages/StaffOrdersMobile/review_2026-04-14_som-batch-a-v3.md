# Review: SOM Batch A v3 KS Prompt Check

Date: 2026-04-14
Target code:
- `C:\Dev\worktrees\task-260414-064018\pages\StaffOrdersMobile\staffordersmobile.jsx` (4524 lines)
- `C:\Dev\worktrees\task-260414-064018\components\sessionHelpers.js`

## Summary

Most cited anchors are correct. The main problem is Fix1: the live code at `2331/2333/2335/2337` does not use the older `.length || ...` fallback pattern, so a prompt that describes those lines that way is pointing at stale logic from a commented block, not the active implementation.

## Verification

### 1. Cited line numbers vs actual code

- Block comment `546-785`: correct. Starts at `546` with `/*` and ends at `785` with `*/`.
- Block comment `1148-1414`: correct. Starts at `1148` with `/* function RateLimitScreen...` and ends at `1414` with `*/`.
- Fix1 targets:
  - `2331`: active `newOrders` summary/header block.
  - `2333`: active `inProgressSections.map(...)` block.
  - `2335`: active `readyOrders` summary/header block.
  - `2337`: active `servedOrders` summary/header block.
- Fix2 targets:
  - `3540`: exact served/closed/cancelled exclusion inside `activeOrders`.
  - `3789-3802`: exact `filteredGroups` memo.
  - `3804-3819`: exact `tabCounts` memo.
- Fix3 targets:
  - `2250`: exact `"mine"` star badge `<div>`.
  - `2260`: exact `"free"` empty-star badge `<div>`.
- `closeSession` helper:
  - `components/sessionHelpers.js:158-163`: function exists.
  - Imported at `staffordersmobile.jsx:202`.
  - Called at `staffordersmobile.jsx:4098`.

### 2. Block comments at `546-785` and `1148-1414`

- Both ranges are real block comments and the line spans are correct.
- Both contain obsolete/historical JSX, not active code.
- The second block comment (`1148-1414`) contains stale count logic such as:
  - `1281`: `newRows.length || newOrders.length`
  - `1319`: `readyRows.length || readyOrders.length`
  - `1329`: `servedRows.length || servedOrders.length`
- That matters because those fallback patterns do not exist in the live code around `2331-2337`.

### 3. Fix1 check: `2331/2333/2335/2337`

Observed live code:

- `2331`: uses `newOrders.length` for guests and `countRows(newRows, newOrders.length)` for dishes.
- `2333`: uses `section.orders.length` for guests and `section.rowCount` for dishes.
- `2335`: uses `readyOrders.length` for guests and `countRows(readyRows, readyOrders.length)` for dishes.
- `2337`: uses `servedOrders.length` for guests and `countRows(servedRows, servedOrders.length)` for dishes.

Conclusion:

- These lines do contain `.length`, but not the old `.length || ...` fallback pattern.
- If the draft KS prompt says Fix1 should target `.length || ...` patterns at these live lines, that is incorrect.
- The `.length || ...` fallback pattern appears in the commented block around `1281/1319/1329`, not in the active block around `2331/2335/2337`.

### 4. Fix2 check: served visibility

- `3522-3546`: `activeOrders` memo is the correct area.
- `3540`: exact exclusion is:
  - `return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';`
- `3789-3802`: `filteredGroups` is the correct active/completed tab split.
- `3804-3819`: `tabCounts` is the correct tab counter logic.

Conclusion:

- Fix2 target references are accurate.
- The prompt’s cited anchors for Fix2 are usable as written.

### 5. Fix3 check: star badge stopPropagation

- `2250`: `"mine"` badge is a plain `<div>` showing `★`.
- `2255`: `"other"` badge is a `<button>` and already does `e.stopPropagation()`.
- `2260`: `"free"` badge is a plain `<div>` showing `☆`.

Conclusion:

- The cited lines for the star and empty-star badges are accurate.
- The draft should explicitly note that these are non-button `<div>` elements, while the lock badge at `2255` already stops propagation.
- Without that note, an implementer could miss that Fix3 means adding click handling to decorative nodes solely to stop parent-card toggle bubbling.

### 6. `components/sessionHelpers.js`

- `closeSession` exists at `158-163`:
  - updates `TableSession`
  - sets `status: "closed"`
  - sets `closed_at: new Date().toISOString()`

## Fix Ratings

- Fix1 guest count: `Rewrite needed`
  - The cited live lines are real, but the expected `.length || ...` pattern is not there.
  - The draft is mixing active code (`2331-2337`) with stale commented logic (`1281/1319/1329`).

- Fix2 served visibility: `Clear`
  - All important anchors are correct and correspond to the actual filtering/tab logic.

- Fix3 star badge stopPropagation: `Needs clarification`
  - The line targets are correct.
  - The draft should explicitly say that `2250` and `2260` are decorative `<div>` badges, while `2255` already has `stopPropagation()`.

## Line Number Mismatches

### Hard mismatches

- None for the block comment ranges.
- None for Fix2 anchors.
- None for Fix3 anchors.

### Content/target mismatches that should be treated as prompt errors

- Fix1:
  - `2331/2333/2335/2337` are valid live-code anchors, but they do not contain the old `.length || ...` fallback logic.
  - The stale fallback logic is in the commented block at:
    - `1281`
    - `1319`
    - `1329`
  - If the prompt describes `2331/2333/2335/2337` as those fallback targets, that is a mismatch and should be rewritten.

## Recommended Prompt Adjustment

For Fix1, describe the live code by its real expressions:

- `2331`: `newOrders.length` and `countRows(newRows, newOrders.length)`
- `2333`: `section.orders.length` and `section.rowCount`
- `2335`: `readyOrders.length` and `countRows(readyRows, readyOrders.length)`
- `2337`: `servedOrders.length` and `countRows(servedRows, servedOrders.length)`

If the intent is to refer to the old fallback implementation, point to the commented block around `1281/1319/1329` and explicitly say it is historical/commented code.
