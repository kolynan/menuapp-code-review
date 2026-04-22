# CC Writer Findings — PublicMenu
Chain: publicmenu-260324-132142-434d

## Findings

1. **[P3] PM-115: List-mode stepper/add-button overlay centered instead of bottom-right** (line 151)

   **Current code (line 151):**
   ```jsx
   <div className="absolute inset-0 flex items-center justify-center z-10" onClick={(e) => e.stopPropagation()}>
   ```

   **Problem:** The wrapper div for the add button / stepper in `renderListCard` uses `inset-0 flex items-center justify-center`, which stretches the overlay across the entire photo and centers its content. This:
   - Centers the `+` button and the `−N+` stepper in the middle of the photo
   - Makes the entire photo area clickable for add/stepper (consuming clicks that should go to `onDishClick`)
   - Doesn't match the tile-mode pattern (line 229: `absolute bottom-2 right-2 z-10`)

   **Comparison with tile-mode (line 229):**
   ```jsx
   <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
   ```
   Tile-mode correctly positions the overlay at bottom-right without stretching across the entire image.

   **FIX:** Replace line 151:
   ```jsx
   // FROM:
   <div className="absolute inset-0 flex items-center justify-center z-10" onClick={(e) => e.stopPropagation()}>
   // TO:
   <div className="absolute bottom-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
   ```

   This positions both the `+` button (when count=0) and the `−N+` stepper (when count>0) at bottom-right of the photo, matching tile-mode behavior and the FROZEN UX requirement from PM-110.

   **Touch target verification:** The `+` button is `w-9 h-9` (36px) — slightly under 44px but this is the existing FROZEN size. The stepper buttons are also `w-9 h-9`. These sizes are NOT changed by this fix (FROZEN per task scope).

   **No regression risk to tile-mode:** This change only affects `renderListCard` (line 81-189). `renderTileCard` (line 193-304) is untouched.

## Summary
Total: 1 finding (0 P0, 0 P1, 0 P2, 1 P3)

## ⛔ Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None — Fix 1 is extremely well-specified with current code, desired result, anti-patterns, file location, and grep hints.
- Missing context: None — the task provided exact line-level search hints (`inset-0`), comparison with tile-mode, and prior chain history.
- Scope questions: None — FROZEN UX section and SCOPE LOCK are clear. Single CSS class change, no ambiguity.
