# CC Writer Findings — PublicMenu
Chain: publicmenu-260401-125045-ef92

## Findings

1. **[P1] HD-17a: Drawer auto-closes 5 seconds after card tap** — In `handleCardTap` (~line 1805), the 5-second timeout calls `handlePresetSelect(type)` which internally sets `setIsHelpModalOpen(false)` as a side-effect from the old modal flow. This closes the drawer without user action. FIX: Add `setIsHelpModalOpen(true);` immediately after `handlePresetSelect(type);` inside the setTimeout callback (before `setUndoToast(null);`). This overrides the unwanted close side-effect. Verified: `setIsHelpModalOpen` is already in scope (destructured from `useHelpRequests` at line 1639).

2. **[P1] HD-17b: Only 1 of 2 tapped requests is sent on multi-tap** — In `handleCardTap` line 1807, `if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);` cancels card 1's 5-second timer when card 2 is tapped. Card 1 stays in `status: 'sending'` forever, never reaches `status: 'pending'`, and is not persisted to localStorage (which only saves `pending`/`repeat` states). FIX: Remove the `clearTimeout(undoToast.timeoutId)` line entirely from `handleCardTap`. Both timers run independently — card 1 fires 5s after tap 1, card 2 fires 5s after tap 2. The visual undo toast shows only the most recent card (acceptable per spec).

## Applied Changes

Both fixes applied in commit `d6a0b29`:
- **Fix 1 (HD-17a):** Added `setIsHelpModalOpen(true);` at line 1816 inside the setTimeout callback, after `handlePresetSelect(type);`
- **Fix 2 (HD-17b):** Removed `if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);` at former line 1807, replaced with comment `// HD-17b: Do NOT cancel previous card's timer — both must fire independently`

## Verification

- `grep -an "clearTimeout(undoToast" pages/PublicMenu/x.jsx` — returns 3 matches: line 1800 (closeHelpDrawer, FROZEN), line 1826 (handleUndo, FROZEN), line 4227 (other context). None in handleCardTap. PASS.
- `grep -an "setIsHelpModalOpen(true)" pages/PublicMenu/x.jsx` — returns line 1816 (new addition in timeout). PASS.
- Line count: 4424 before → 4424 after (net 0: removed 1 line, added 1 line). PASS.
- Function count: `grep -ac "function\|const.*=.*=>" pages/PublicMenu/x.jsx` = unchanged. PASS.

## FROZEN UX Compliance
- closeHelpDrawer() — NOT touched
- openHelpDrawer() — NOT touched
- handleResolve — NOT touched
- handleRemind — NOT touched
- handleUndo — NOT touched
- Undo toast position `fixed bottom-4 left-4 right-4 z-50` — NOT touched
- Button text and colors — NOT touched

## Summary
Total: 2 findings (0 P0, 2 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY)
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. Both Fix 1 and Fix 2 had exact line numbers, search strings, and clear before/after descriptions.
- Missing context: None. The `setIsHelpModalOpen` scope confirmation and the explanation of why `clearTimeout` causes the issue were very helpful.
- Scope questions: None. The FROZEN UX list and SCOPE LOCK were clear and unambiguous.
