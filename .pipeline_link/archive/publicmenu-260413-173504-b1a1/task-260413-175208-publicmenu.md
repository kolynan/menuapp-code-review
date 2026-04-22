---
task_id: task-260413-175208-publicmenu
status: running
started: 2026-04-13T17:52:08+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260413-175208-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260413-173504-b1a1
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: publicmenu-260413-173504-b1a1
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260413-173504-b1a1-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260413-173504-b1a1-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260413-173504-b1a1
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   For each dispute, write your analysis considering BOTH CC and Codex findings:

   a) Read the original code in the repository to understand the current implementation.
   b) Evaluate CC's proposed solution:
      - Correctness, edge cases, risks
   c) Evaluate Codex's proposed solution:
      - Correctness, edge cases, risks
   d) Pick the better solution OR propose a compromise, with clear reasoning.
   e) If neither solution is safe → mark as SKIP with explanation.

   IMPORTANT: Be fair. Do not automatically prefer CC's solution.
   Judge each dispute on technical merits only.

4. Write final discussion report to: pipeline/chain-state/publicmenu-260413-173504-b1a1-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260413-173504-b1a1
Mode: CC-Only (v2)

## Disputes Analyzed
Total: N disputes from Comparator

### Dispute 1: [title]
**CC Solution:** ...
**Codex Solution:** ...
**CC Analysis:** [technical reasoning comparing both]
**Verdict:** CC / Codex / Compromise / SKIP
**Reasoning:** [1-2 sentences why]

### Dispute 2: [title]
...

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Title   | CC/Codex/Compromise/SKIP | Brief reason |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Skipped (for Arman)
Items where neither solution is safe or where the dispute cannot be resolved technically.
Each item shows both positions and why neither is sufficient.

5. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# UX Batch: WS-SOS Quick-Fix (#285 + #284 + #286 + #232)

Reference: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` v6.0, `BUGS_MASTER.md`.

CONTEXT FILES:
- `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` — SOS v6.0 UX spec (FINAL)
- `ux-concepts/HelpDrawer/260407-01 SOS HelpDrawer Mockup S235.html` — visual reference

---

## Fix 1 — #285 (P2) [MUST-FIX]: "Something else?" link — show disabled instead of hidden when custom request is active

### Сейчас (текущее поведение)
When any 'other' type request is active, the "Другой запрос?" link is fully hidden (condition: `!activeRequests.some(r => r.type === 'other') && !showOtherForm`). The user cannot see that re-sending is blocked.

### Должно быть (ожидаемое поведение)
The link is always visible, but when an 'other' request is active it appears disabled:
- Visual: grey text (`text-gray-300`), cursor default, no underline, no hover effect — button is not `disabled` attribute (must remain tappable for potential gate use later)
- Below the disabled link: helper text `"Можно только 1 такой запрос одновременно"` / `"Only 1 custom request at a time"` in `text-[11px] text-gray-300`
- When no active 'other' request: link looks exactly as before (grey underlined, clickable)

Ref: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` §«Другое»

### НЕ должно быть (анти-паттерны)
- Do NOT use `disabled` HTML attribute — link must remain tappable
- Do NOT hide the link when 'other' request is active
- Do NOT change the visual of the link when no active 'other' request exists
- Do NOT remove the condition that hides the link while `showOtherForm` is open (keep hiding it then)

### Файл и локация
`pages/PublicMenu/x.jsx`, line ~5048–5056:
```jsx
{/* "Другой запрос?" link — hidden while any 'other' request is active */}
{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
  <div className="px-3.5 pb-3">
    <button onClick={() => setShowOtherForm(true)}
      className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer">
      {tr('help.other_request_link', 'Другой запрос?')}
    </button>
  </div>
)}
```
Replace the condition so the link is visible (but disabled) when `activeRequests.some(r => r.type === 'other')` is true.

New i18n keys needed (use `tr(key, fallback)`):
- `tr('help.other_only_one', 'Можно только 1 такой запрос одновременно')`

### Проверка
1. Open Help Drawer → send a custom "other" request → verify "Другой запрос?" link stays visible but looks grey and unclickable visually, with helper text below.
2. No active 'other' request → link looks normal (grey, underlined).

---

## Fix 2 — #284 (P2) [MUST-FIX]: Auto-resolve requests older than 24h + stale timer display

### Сейчас (текущее поведение)
(a) Requests older than 24h remain active in the drawer forever — no auto-cleanup.
(b) `getHelpTimerStr` at line ~1898 shows raw minutes for any elapsed time, so a 7-day-old request shows "10439м" instead of a human-readable stale indicator.

### Должно быть (ожидаемое поведение)

**(a) Auto-resolve useEffect:**
Add a `useEffect` that runs on every `timerTick` (already ticks every 30s via existing timer) and resolves any `activeRequests` where `Date.now() - sentAt > 24 * 60 * 60 * 1000`. Call `handleResolve(type, id)` for each stale row.

**(b) Stale timer display:**
In `getHelpTimerStr` (line ~1898), if `elapsedSec >= 24 * 60 * 60` (≥ 24 hours), return `tr('help.stale_status', 'Данные могли устареть')` instead of `${min}м`.

Ref: BACKLOG #284, PM-167.

### НЕ должно быть (анти-паттерны)
- Do NOT auto-resolve requests younger than 24h
- Do NOT change urgency threshold constants (`HELP_URGENCY_THRESHOLDS`)
- Do NOT introduce a new polling interval — use the existing `timerTick` dependency
- Do NOT call any backend API for auto-resolve — use local `handleResolve` only

### Файл и локация
`pages/PublicMenu/x.jsx`:
- `getHelpTimerStr` function, line ~1898 — add early return for ≥ 24h
- Add new `useEffect` near the other Help-related effects (search comment `// Help / ServiceRequest hook` area, ~line 1811+)
- `i18n` key `help.stale_status` already exists in both EN and RU translation objects (lines 572, 643)

### Проверка
1. Verify `getHelpTimerStr` returns `'Данные могли устареть'` (or EN equivalent) when `sentAt` is more than 24h ago.
2. Verify the auto-resolve useEffect fires on timerTick and removes stale rows.

---

## Fix 3 — #286 (P3) [MUST-FIX]: Save textarea draft when drawer closes without sending

### Сейчас (текущее поведение)
If the user starts typing in the "Другой запрос?" textarea and closes the Help Drawer (swipe or backdrop tap), the text is lost.

### Должно быть (ожидаемое поведение)
- When the Help Drawer closes (`isHelpModalOpen` changes to `false`) and `helpComment.trim()` is non-empty and `showOtherForm` is `true` → save `helpComment` to `localStorage` under key `'sos_draft_' + currentTableId`.
- When the Help Drawer opens (`isHelpModalOpen` changes to `true`) and `showOtherForm` is `false` → check localStorage for `'sos_draft_' + currentTableId`. If found and non-empty → restore into `helpComment` and set `showOtherForm(true)`.
- Draft is cleared from localStorage on: (1) explicit "Отмена" click (already calls `setHelpComment('')`) — add `localStorage.removeItem` there; (2) successful send (already calls `setHelpComment('')`) — add `localStorage.removeItem` there.

### НЕ должно быть (анти-паттерны)
- Do NOT restore draft if there is already an active 'other' request
- Do NOT save draft if `helpComment` is empty
- Do NOT persist across different table IDs (key includes `currentTableId`)
- Do NOT throw if `localStorage` is unavailable — wrap in try/catch (KB-033: localStorage crash in private browsers)

### Файл и локация
`pages/PublicMenu/x.jsx`:
- Add `useEffect` watching `[isHelpModalOpen]` for save/restore logic — place near other Help drawer effects (~line 2357 area `openHelpDrawer` / `closeHelpDrawer`)
- "Отмена" button onClick at line ~5072: add `localStorage.removeItem('sos_draft_' + currentTableId)`
- Successful send path at line ~5116 `setShowOtherForm(false); setHelpComment('')`: add `localStorage.removeItem('sos_draft_' + currentTableId)`

### Проверка
1. Open Help Drawer → tap "Другой запрос?" → type text → close drawer by swipe → reopen → textarea should reappear with the typed text.
2. Open → type → click "Отмена" → reopen → textarea should be empty.
3. Open → type → send → reopen → textarea should be empty.

---

## Fix 4 — #232 (P2) [MUST-FIX]: HelpFab — move from right to left side

### Сейчас (текущее поведение)
HelpFab is positioned `right-4` (bottom-right corner of the screen). On mobile, this conflicts with common right-side gestures and overlaps with the cart area.

### Должно быть (ожидаемое поведение)
Move FAB to the left side:
- `right-4` → `left-4`
- `md:right-8` → `md:left-8`

### НЕ должно быть (анти-паттерны)
- Do NOT change any other styles, sizes, colors, or logic in HelpFab
- Do NOT change `bottom-24` or `z-40` values
- Do NOT touch x.jsx for this fix — only HelpFab.jsx

### Файл и локация
`pages/PublicMenu/HelpFab.jsx`, line 5:
```jsx
<div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
```
→ replace with:
```jsx
<div className="fixed bottom-24 left-4 z-40 md:bottom-8 md:left-8">
```

### Проверка
Open /x with a verified table (hall mode) → Help FAB should appear in bottom-LEFT corner.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Edit ONLY the code described in Fix 1–4.
- ALL other Help Drawer logic, state, hooks, and UI — DO NOT TOUCH.
- If you see any other issue outside this scope — log it in your report as "Out of scope", do NOT fix it.
- Do NOT refactor, rename, or restructure any existing functions.
- **Exception — i18n dictionary:** Fix 1 adds 1 new key. Find the RU and EN translation objects in x.jsx (grep `"help.other_request_link"` to locate them) and add:
  - RU: `"help.other_only_one": "Можно только 1 такой запрос одновременно"`
  - EN: `"help.other_only_one": "Only 1 custom request at a time"`

## FROZEN UX — НЕ МЕНЯТЬ (утверждено Arman)

Source: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` v6.0 (FINAL)

- **FROZEN**: 6-button 3×2 grid layout and button order — DO NOT change
- **FROZEN**: In-place state model (idle → sending → active → urgent) — DO NOT change
- **FROZEN**: Header: «Нужна помощь?» left + table pill right — DO NOT change
- **FROZEN**: Subtitle «Выберите, что нужно» visible only when 0 active requests — DO NOT change
- **FROZEN**: ✕ cancel button on active cards (with confirm panel for red urgency) — DO NOT change
- **FROZEN**: LOCK-PM-001: Cart FAB "+" in ListView — fixed bottom-right — DO NOT change (this is a DIFFERENT FAB from HelpFab)

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Fix 1: disabled "Другой запрос?" link is readable and touch target ≥ 44px
- [ ] Fix 1: helper text fits on 1-2 lines, no overflow
- [ ] Fix 4: HelpFab visible in bottom-LEFT corner, not obscured by other UI elements
- [ ] No excessive whitespace introduced on small screens

## Regression Check (MANDATORY after implementation)

Existing features that MUST continue to work after these changes:

- [ ] Help Drawer opens via HelpFab bell icon tap
- [ ] All 6 SOS buttons (call_waiter, bill, plate, napkins, utensils, clear_table) function normally
- [ ] Active SOS cards show timer + ✕ cancel button
- [ ] Cancel confirm panel works (red urgency cards)
- [ ] Undo toast works after sending an "other" request
- [ ] Closing Help Drawer via swipe/backdrop still works correctly

## FROZEN UX grep verification (run BEFORE commit)

```bash
grep -n "grid grid-cols-2 gap-\[9px\]" pages/PublicMenu/x.jsx          # 3x2 grid — must exist
grep -n "help.modal_title" pages/PublicMenu/x.jsx                        # Header title — must exist
grep -n "cancelConfirmType" pages/PublicMenu/x.jsx                       # Cancel confirm — must exist
grep -n "isHelpModalOpen" pages/PublicMenu/HelpFab.jsx                   # HelpFab props — must exist
```

## Implementation Notes

- Files to edit: `pages/PublicMenu/x.jsx`, `pages/PublicMenu/HelpFab.jsx`
- Do NOT edit any other files
- For all new user-facing strings: use `tr(key, fallback)` — NOT `t(key)` (PQ-035)
- localStorage usage: always wrap in try/catch (KB-033)
- i18n function in x.jsx: use `tr()` (confirmed: grep shows `tr(` throughout the file)
- git add pages/PublicMenu/x.jsx pages/PublicMenu/HelpFab.jsx
- git commit -m "fix: SOS quick-fix #285 #284 #286 #232"
=== END ===


## Status
Running...
