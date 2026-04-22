# Merge Report: SOM Phase 2 — 6 UX Gap Fixes

## Task ID: task-260407-225355
## File: pages/StaffOrdersMobile/staffordersmobile.jsx
## Commit: 6141f95
## Lines: 4407 → 4429 (+22)

## CC Analysis: 6 fixes applied

### Fix 1: Jump chips (replaces text summary with colored tappable chips)
- Added `jumpChips` computation after `hallSummaryItems` (line 2012)
- Replaced `hallSummaryItems.map(renderHallSummaryItem)` in collapsed card with jump-bar
- `HALL_CHIP_STYLES` added at module level (line 351)
- Chip tap: `setIsExpanded(true)` then `scrollToSection(chip.kind)`
- STATUS: APPLIED

### Fix 2: Bulk buttons moved from section header to bottom
- ЗАПРОСЫ: IIFE removed from header, bulk bar added after request cards (bg-red-500)
- НОВЫЕ: button removed from header, bulk bar at bottom (bg-blue-600)
- ГОТОВО: button removed from header, bulk bar at bottom (bg-green-600)
- Headers now show only title + ChevronDown
- STATUS: APPLIED

### Fix 3: В РАБОТЕ wrapper removed, subsections become root sections
- Removed outer `inProgressExpanded` toggle wrapper from hall-mode
- Each `inProgressSections` item renders independently with own `expandedSubGroups` toggle
- Dual metric added: "N гостей · N блюд" per subsection
- Bulk bar (bg-amber-500) inside expanded area
- `inProgressExpanded` state kept for legacy paths
- STATUS: APPLIED

### Fix 4: ВЫДАНО dual metric
- Added `pluralRu` with explicit forms for "гость/гостя/гостей" and "блюдо/блюда/блюд"
- STATUS: APPLIED

### Fix 5: Intermediate-stage dish buttons show text labels
- `rowLabel` changed from standalone "→" to "→ [StageName]" using `nextLabel`
- Affects all 3 render paths (intentional)
- STATUS: APPLIED

### Fix 6: Close table reasons — inline action hint
- 6 new HALL_UI_TEXT keys added (inProgressShort, closeHint, closeAction*)
- Old vertical `space-y-0.5` layout replaced with single `<p>` inline hint
- Tappable red links with `scrollToSection(kind)` preserved
- STATUS: APPLIED

## Codex: FAILED
- Reason: File read timeout — 4400+ line JSX file too large for Codex sandbox
- Known issue type (KB-113)

## Agreed (both found): N/A (Codex failed)
## CC only: All 6 fixes
## Codex only: N/A
## Disputes: N/A

## Verification Results
- Line count: 4429 (expected 4427-4452) ✅
- renderHallSummaryItem: 5 occurrences ✅
- jumpChips: before JSX return ✅
- HALL_CHIP_STYLES: module level ✅
- closeHint in close area ✅
- scrollToSection preserved ✅
- rowLabel uses nextLabel ✅
- No space-y-0.5 in hall-mode close ✅
- Filled bulk bars present ✅
- inProgressExpanded in legacy paths ✅
- All key functions present ✅
