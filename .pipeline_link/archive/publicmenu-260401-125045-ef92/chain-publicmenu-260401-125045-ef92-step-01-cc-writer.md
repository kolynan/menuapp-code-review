---
chain: publicmenu-260401-125045-ef92
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 10.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260401-125045-ef92
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260401-125045-ef92-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260401-125045-ef92

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

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
