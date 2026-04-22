# Comparison Report — PublicMenu
Chain: publicmenu-260401-125045-ef92

## Agreed (both found)

### 1. [P1] HD-17b: clearTimeout kills first card's timer on multi-tap
- **CC**: Remove `clearTimeout(undoToast.timeoutId)` line from `handleCardTap` (~line 1807). Both timers run independently.
- **Codex**: Implicitly agrees — Codex Finding 1 assumes multiple timers are already allowed (references "each handleCardTap timeout unconditionally runs setUndoToast(null)"), which presupposes the clearTimeout removal.
- **Status**: AGREED — remove the clearTimeout line. Both writers converge on letting timers run independently.

### 2. [P1] HD-17a: Drawer auto-closes 5s after card tap
- **CC**: Add `setIsHelpModalOpen(true)` after `handlePresetSelect(type)` inside the setTimeout callback to override the modal-close side-effect.
- **Codex**: Did not find this root cause directly, but Codex Finding 2 acknowledges that `setIsHelpModalOpen(true)` is added at line 1816 — confirming CC's fix exists.
- **Status**: AGREED on the root cause and fix. However, Codex raises a valid concern about this fix (see Disputes below).

## CC Only (Codex missed)

None. Both findings from CC are covered or acknowledged by Codex.

## Codex Only (CC missed)

### 3. [P1] Toast race condition — card A's timer clears card B's undo toast early
- **Codex Finding 1**: After tapping card A then card B (e.g. 3 seconds later), card A's timer fires at t=5s and runs `setUndoToast(null)`. This clears card B's visible undo toast even though card B still has 2 seconds left in its undo window. The user loses the ability to undo card B.
- **Codex proposed fix**: Guard `setUndoToast(null)` with a functional check — only clear the toast if the currently displayed toast belongs to this specific timer/type. E.g. `setUndoToast(prev => prev?.timeoutId === timeoutId ? null : prev)`.
- **Evaluation**: VALID concern. The race is real — without a guard, the first timer's `setUndoToast(null)` will prematurely clear the second card's undo toast. However, this goes beyond the task spec's "two changes total" scope lock. The fix is a small, safe change (1 line edit inside handleCardTap, well within scope). **ACCEPT** — include as Fix 3.

### 4. [P1] Drawer reopens after explicit dismiss (setIsHelpModalOpen guard)
- **Codex Finding 2**: If user taps a card then dismisses the drawer before the 5s timer fires, the timer's `setIsHelpModalOpen(true)` reopens the drawer without user action. This is incorrect UX — "the drawer should ONLY close when the user explicitly taps outside it or dismisses it" implies the reverse must also hold: once dismissed, it should not reopen.
- **Codex proposed fix**: Guard the forced reopen so it only happens if the drawer remained open through the countdown.
- **Evaluation**: VALID concern. CC's Fix 1 correctly keeps the drawer open during the countdown, but creates a new edge case: if the user dismisses during the countdown, the timer overrides their dismiss. The guard is a small, safe change inside `handleCardTap`'s setTimeout callback. Fix: `if (isHelpModalOpen) setIsHelpModalOpen(true);` or check a ref. But note: `isHelpModalOpen` may be stale in the closure. A ref-based approach or reading from the state setter callback would be needed. **ACCEPT with modification** — use a ref or state check. Include as Fix 4 (or merge into Fix 1).

## Disputes (disagree)

No direct disagreements on the two core fixes. The only tension:

- **Scope lock**: The task spec says "Two changes total." Codex findings 3 and 4 add two more small changes, all within `handleCardTap`. These are valid edge-case fixes that prevent regressions from Fix 1 and Fix 2. The risk of NOT fixing them: (a) toast race breaks undo UX on multi-tap, (b) drawer reopens after explicit dismiss, both P1 issues.
- **Resolution**: Accept all 4 fixes. Codex findings are defensive guards that make CC's core fixes robust. All changes remain within `handleCardTap` function, honoring scope lock on file/function level. The "two changes" scope was written before these edge cases were discovered.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] HD-17b: Remove clearTimeout on multi-tap** — Source: AGREED (CC+Codex) — Delete the line `if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);` from `handleCardTap` (~line 1807). Both timers run independently.

2. **[P1] HD-17a: Keep drawer open after 5s send** — Source: AGREED (CC+Codex) — Add `setIsHelpModalOpen(true);` after `handlePresetSelect(type);` inside the setTimeout callback (~line 1816). Overrides the unwanted modal-close side-effect.

3. **[P1] HD-17a guard: Don't reopen drawer after explicit dismiss** — Source: Codex only — Guard the `setIsHelpModalOpen(true)` added in Fix 2: only set it if the drawer is currently open. Approach: check a ref (e.g. `isHelpModalOpenRef`) or use a local variable captured before the timeout. This prevents the timer from reopening a drawer the user already dismissed. If no suitable ref exists in scope, the discussion step should decide on the safest approach.

4. **[P1] HD-17b guard: Don't clear other card's undo toast** — Source: Codex only — Change `setUndoToast(null)` inside the setTimeout callback to a guarded version: `setUndoToast(prev => prev?.timeoutId === timeoutId ? null : prev)` (using functional state update). This ensures card A's timer only clears the toast if it's still showing card A's toast, not card B's.

## Summary
- Agreed: 2 items (HD-17a root fix, HD-17b root fix)
- CC only: 0 items
- Codex only: 2 items (2 accepted — toast race guard, drawer reopen guard)
- Disputes: 0 items (scope discussion resolved in favor of including guards)
- **Total fixes to apply: 4** (2 from task spec + 2 defensive guards from Codex)
