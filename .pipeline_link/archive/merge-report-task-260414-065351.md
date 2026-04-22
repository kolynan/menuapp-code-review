# Merge Report: SOM Batch A v3

## Codex Status
Codex timed out — PowerShell filesystem commands exceeded timeout limits reading the 4524-line file. No findings were produced by Codex.

## CC Analysis (sole reviewer)

### Fix 1 — #293 Guest counter shows dish count (P2)
- **Issue**: Section headers used `orders.length` as guest count instead of unique `guest_id` values
- **Fix**: Added `uniqueGuests()` helper using `Set` + `getLinkId(o.guest)`, applied at 4 live sites (new, inProgress, ready, served section headers)
- **Verification**: grep confirms 0 remaining `.length` in guest slots, 1 `uniqueGuests` declaration

### Fix 2 — #296 Table card disappears after "Serve All" (P1)
- **Issue**: `activeOrders` filter excluded `served` status; `filteredGroups`/`tabCounts` didn't account for served-but-not-closed orders
- **Fix**: 
  1. `closeSession()` in sessionHelpers.js now bulk-closes all non-cancelled orders
  2. Removed `served` from exclusion in activeOrders filter (line 3540)
  3. Added `hasServedButNotClosed` logic to `filteredGroups` and `tabCounts`
- **PartnerTables impact**: `closeSession` is also used in PartnerTables — the added bulk-close is additive and won't break existing flow

### Fix 3 — #297 Star badge tap expands card (P2)
- **Issue**: Star and free-table badge divs lacked `stopPropagation`, causing parent `onToggleExpand` to fire
- **Fix**: Added `onClick={(e) => e.stopPropagation()}` to both badge divs
- **Verification**: Lock badge already had stopPropagation, untouched

## Agreed (both found)
N/A — Codex produced no findings.

## CC only (Codex missed)
All 3 fixes above (Codex timed out).

## Codex only (CC missed)
N/A — Codex produced no findings.

## Disputes
None.

## Summary
- Fixes applied: 3/3
- Files changed: 2 (staffordersmobile.jsx, sessionHelpers.js)
- Lines: 4524 -> 4538 (+14 net)
- Block comments intact: 546/*, 785*/, 1152/*, 1418*/
- Commit: 6ec21e3
