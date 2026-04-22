---
chain: publicmenu-260401-125045-ef92
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260401-125045-ef92
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260401-125045-ef92-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260401-125045-ef92-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260401-125045-ef92"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260401-125045-ef92-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260401-125045-ef92

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# HD-17: Help Drawer closes after 5s + second request lost on multi-tap

Reference: `BUGS_MASTER.md` (HD-17), `ux-concepts/HelpDrawer/help-drawer.md` v5.2.
Production page: https://menu-app-mvp-49a4f5b2.base44.app (guest login, table scan).

**Context:** The Help Drawer ("Нужна помощь?") lets guests tap request cards (call waiter, bill, etc.). Each tap starts a 5-second undo window before the actual server send. Bug: when the guest taps 2 cards in sequence, the drawer auto-closes after 5 seconds and only 1 request is saved.

**File:** `pages/PublicMenu/x.jsx` (4424 lines)
**Component to modify:** `handleCardTap` function, ~line 1805

---

## Fix 1 — HD-17a (P1) [MUST-FIX]: Drawer auto-closes 5 seconds after a card tap

### Сейчас
Guest taps a help request card (e.g. "Счёт") → a 5-second undo window starts → after 5 seconds the timeout fires → `handlePresetSelect(type)` is called → the B44 `useHelpRequests` hook internally calls `setIsHelpModalOpen(false)` as part of its original "select → submit → close modal" flow → the drawer closes automatically without any user action.

### Должно быть
After 5 seconds the request is sent to the server AND the drawer stays open. The drawer should ONLY close when the user explicitly taps outside it or dismisses it.

### НЕ должно быть
- Do NOT remove `handlePresetSelect(type)` from the timeout — it triggers the actual server send
- Do NOT change when `pendingQuickSendRef.current` is set
- Do NOT touch `closeHelpDrawer()` function

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Function: `handleCardTap` ~line 1805
Timeout callback: ~lines 1813–1818:
```js
const timeoutId = setTimeout(() => {
  pendingQuickSendRef.current = type;
  handlePresetSelect(type);
  setUndoToast(null);      // ← ADD setIsHelpModalOpen(true) BEFORE this line
}, 5000);
```
Search for: `pendingQuickSendRef.current = type;` inside the setTimeout in `handleCardTap`.

Fix: add `setIsHelpModalOpen(true);` immediately after `handlePresetSelect(type);` and before `setUndoToast(null);`. This overrides the `setIsHelpModalOpen(false)` side-effect from `handlePresetSelect`.

`setIsHelpModalOpen` is already available in scope — it is destructured from `useHelpRequests` at ~line 1639.

### Уже пробовали
- This is the first fix attempt. Root cause identified via code analysis S214: `handlePresetSelect` from `useHelpRequests` was designed for the old "open modal → select → submit → close" flow. The new HD-01 "direct card tap → undo → delayed send" flow calls it only for the side-effect of setting `selectedHelpType`, but the modal-close side-effect is unwanted.

### Проверка
1. Open Help Drawer → tap any request card (e.g. "Позвать официанта")
2. Wait 5 seconds → undo toast disappears → drawer must still be OPEN
3. The card should now show disabled/pending state inside the still-open drawer

---

## Fix 2 — HD-17b (P1) [MUST-FIX]: Only 1 of 2 tapped requests is sent and stored

### Сейчас
Guest taps card 1 ("Позвать") → undo toast appears. Guest then taps card 2 ("Счёт") → `handleCardTap` runs `clearTimeout(undoToast.timeoutId)` which CANCELS card 1's 5-second timer → card 1 stays in `status: 'sending'` forever, never reaches `status: 'pending'`. The localStorage persistence effect (line ~1970) only saves `pending`/`repeat` states — `sending` is never saved. After the drawer closes (Fix 1) and reopens, card 1's state is lost from localStorage. Only card 2 is visible.

### Должно быть
When guest taps card 2, card 1's timer is NOT cancelled. Both timers run independently. Card 1 sends 5 seconds after card 1 was tapped. Card 2 sends 5 seconds after card 2 was tapped.

### НЕ должно быть
- Do NOT change the `setUndoToast` call that updates the visual toast display to show card 2's type
- Do NOT change the localStorage persistence effect (lines ~1970–1988)
- Do NOT add complex queue management — just remove the clearTimeout

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Function: `handleCardTap` ~line 1805
Target line: ~1807:
```js
if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
```
Search for: `clearTimeout(undoToast.timeoutId)` inside `handleCardTap`.

Fix: **remove** this line entirely. The existing `undoToast.timeoutId` timer for the previous card must continue running.

NOTE: The visual undo toast will show only the MOST RECENT card (card 2 overwrites card 1's display). That is acceptable — the important thing is that both underlying timers still fire and both requests are sent.

### Уже пробовали
First attempt. Root cause: when multi-tapping, `clearTimeout` kills the first card's actual send timer, leaving it stuck in `sending` state which is not persisted to localStorage.

### Проверка
1. Open Help Drawer → quickly tap card 1 ("Позвать") then card 2 ("Счёт")
2. Wait 5+ seconds
3. Both cards must show pending/disabled state simultaneously inside the (still-open) drawer
4. Reopen drawer → both requests visible

---

## ⛔ FROZEN UX — DO NOT CHANGE (tested and locked)

- `closeHelpDrawer()` function — must remain unchanged (PM-126, PM-135, commit fda866c)
- `openHelpDrawer()` function — must remain unchanged
- `handleResolve` function — do NOT touch
- `handleRemind` function — do NOT touch
- `handleUndo` function — do NOT touch
- The undo toast render position `fixed bottom-4 left-4 right-4 z-50` (HD-06, S213)
- Button text: «Не нужно» and «Через» (HD-16, commit fda866c S214) — do NOT revert
- Button colors: `text-orange-800 bg-orange-50` (HD-16, commit fda866c S214) — do NOT revert

## ⛔ SCOPE LOCK — modify ONLY what is specified above
- Modify ONLY: `handleCardTap` function in `pages/PublicMenu/x.jsx`
- Do NOT modify: any other function, hook call, state, effect, or component
- Do NOT modify: `useHelpRequests` destructuring
- If you see other issues — skip them, do not fix
- Two changes total: (1) remove 1 line `clearTimeout(undoToast.timeoutId)`, (2) add 1 line `setIsHelpModalOpen(true)` after `handlePresetSelect(type)`

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (4424 lines) — ONLY this file
- `setIsHelpModalOpen` is destructured from `useHelpRequests` at ~line 1639 — already in scope, no import needed
- `handleCardTap` is defined at ~line 1805 via `useCallback`
- Do NOT use `node --check` for validation — fails on JSX/ESM files (KB-111). Use grep instead.
- After changes: verify with `grep -n "clearTimeout(undoToast" pages/PublicMenu/x.jsx` — should return 0 matches (line removed)
- After changes: verify with `grep -n "setIsHelpModalOpen(true)" pages/PublicMenu/x.jsx` — should return 1+ match (new line added in timeout)
- String encoding: no new Cyrillic strings needed in this fix

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: guest phone at table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Help Drawer remains open after 5 seconds (does not auto-close)
- [ ] Both card states (pending/disabled) visible simultaneously when 2 cards tapped
- [ ] Undo toast still visible at `fixed bottom-4` (not obscured)
- [ ] Touch targets on cards: ≥ 44×44px
- [ ] No duplicate visual indicators introduced

## Regression Check (MANDATORY after implementation)
After implementing, verify these existing behaviors still work:
- [ ] Single card tap: undo toast appears → wait 5s → request sent → drawer stays open
- [ ] Undo button: tap card → immediately tap "Отменить" → card returns to idle state
- [ ] "Не нужно" button: marks request resolved, removes it from list
- [ ] Drawer opens/closes normally via the FAB button and swipe-down
- [ ] Card cooldown timer countdown still works (disabled state shows «Через MM:SS»)
=== END ===
