---
task_id: task-260324-010449-publicmenu
status: running
started: 2026-03-24T01:04:49+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-010449-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-003211-6767
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260324-003211-6767
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260324-003211-6767-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260324-003211-6767-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260324-003211-6767-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260324-003211-6767

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# UX Batch 7 — PM-070 + PM-073 + PM-069 + PM-075 + PM-112: Resilience & UX Fixes

Reference: `BUGS_MASTER.md` PM-070, PM-073, PM-069, PM-075, PM-112.

All fixes are in `pages/PublicMenu/x.jsx`.

---

## Fix 1 — PM-070 (P1) [MUST-FIX]: Partner lookup swallows backend errors as "restaurant not found"

### Сейчас
When looking up a partner/restaurant by QR code, any backend failure (network error, server 500, timeout) is caught and shown as "restaurant not found" — same as a genuinely invalid QR code. User cannot distinguish between a bad QR and a temporary backend outage. They may discard a valid QR thinking it's broken.

Location: `x.jsx` around lines 1321 and 3029 — the partner lookup query catches all exceptions in one block.

### Должно быть
Separate two error paths:
1. **partner_not_found** (404 / entity not found) → "Restaurant not found" message (current behavior — keep)
2. **transient_error** (network error, server 5xx, timeout) → Retryable UI: show "Connection error — tap to retry" with a retry button. Do NOT say "restaurant not found" for server errors.

Logic:
- If error has HTTP status 404 or the error message contains "not found" → path 1
- Otherwise (network error, 500, timeout, unknown) → path 2 (retryable)

### НЕ должно быть
- Do NOT show "restaurant not found" for transient server errors
- Do NOT remove the existing 404 / not-found handling
- Do NOT add complex retry logic with intervals — a simple "Retry" button that re-triggers the lookup is sufficient

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Look for: partner lookup query catch block(s) around lines 1321 and 3029.

### Проверка
If backend returns 500 → user sees "Connection error" + retry button (not "restaurant not found").
If backend returns 404 → user sees "restaurant not found" (unchanged).

---

## Fix 2 — PM-073 (P2) [MUST-FIX]: useTableSession loses restored guest ID

### Сейчас
In `useTableSession` hook (or inline in x.jsx), when restoring a guest session, `currentGuestIdRef.current` is set using `.id` property — but restored guests may only have `_id` (MongoDB style). So `currentGuestIdRef.current` becomes `undefined` for restored guests, causing session loss.

### Должно быть
Use `normalizeGuestId(guest)` instead of `guest.id` when setting `currentGuestIdRef.current`.
`normalizeGuestId` already handles both `.id` and `._id` cases — use it consistently.

### НЕ должно быть
- Do NOT remove normalizeGuestId function
- Do NOT change the normalizeGuestId implementation
- Do NOT change other guest ID references that already use normalizeGuestId correctly

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Look for: `currentGuestIdRef.current = ` assignment where `.id` is used instead of `normalizeGuestId()`.
Search for: `currentGuestIdRef.current = guest.id` or similar patterns.

### Проверка
Restore a guest session → `currentGuestIdRef.current` is not undefined → session restored correctly.

---

## Fix 3 — PM-069 (P2) [MUST-FIX]: Table code bottom sheet — no cooldown countdown display

### Сейчас
The table code entry bottom sheet has lockout logic (after N wrong attempts, user is locked out for X minutes). But the lockout countdown timer is NOT shown to the user — they see a blank or generic error, not "Please wait 4:30 minutes". This is because `codeAttempts`, `codeLockedUntil`, `nowTs` state is not accessible in the bottom sheet component scope.

### Должно быть
When the user is locked out (`codeLockedUntil > nowTs`):
1. Show remaining lockout time as a countdown: "Please wait MM:SS"
2. Disable the code input and submit button during lockout
3. Countdown updates every second (using `nowTs` which should tick every second)

State needed in bottom sheet scope: `codeAttempts`, `codeLockedUntil`, `nowTs`.
If these are defined in a parent scope but not passed down — pass them as props or lift the bottom sheet rendering to where the state is accessible.

### НЕ должно быть
- Do NOT remove the existing lockout logic
- Do NOT change the lockout duration or attempt limit values
- Do NOT redesign the bottom sheet layout beyond adding the countdown display

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for: `codeLockedUntil`, `codeAttempts`, `nowTs` state declarations — note where they are defined.
Then find: the table code bottom sheet render — check if it has access to those state variables.
Fix: either pass state as props, or restructure so the bottom sheet is rendered in the right scope.

### Проверка
Enter wrong table code N times → see countdown "Please wait 4:30" that ticks down. Input disabled.

---

## Fix 4 — PM-075 (P2) [MUST-FIX]: Auto-submit after table verification — untracked setTimeout

### Сейчас
After table verification, there is a `setTimeout(() => handleSubmitOrder(), 100)` call (around line 2091-2098) that auto-submits the order. This setTimeout is untracked — no ref stores the timer ID, and there is no cleanup in useEffect. This is a React anti-pattern: if the component re-renders or unmounts before the timeout fires, a stale submit may occur.

### Должно быть
Store the timer ID in a `useRef` and clean it up:
```javascript
const autoSubmitTimerRef = useRef(null);

// When setting the timeout:
autoSubmitTimerRef.current = setTimeout(() => handleSubmitOrder(), 100);

// In a useEffect cleanup (or the appropriate cleanup location):
return () => {
  if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
};
```

### НЕ должно быть
- Do NOT remove the auto-submit behavior itself — just make it safe
- Do NOT change the 100ms delay
- Do NOT change when/why auto-submit is triggered

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for: `setTimeout(() => handleSubmitOrder` around line 2091-2098.

### Проверка
Code inspection: setTimeout result is stored in a ref; cleanup exists in useEffect.

---

## Fix 5 — PM-112 (P3) [MUST-FIX]: Remove "Send" button from table code bottom sheet (auto-submit makes it redundant)

### Сейчас
The table code bottom sheet has a "Send" / "Отправить" button. However, the code auto-submits when the last (4th) digit is entered. The button is therefore redundant and confusing — it implies the user needs to tap it, but the form already submitted.

### Должно быть
Remove the "Send" / "Отправить" button from the table code bottom sheet entirely.
Auto-submit on last digit entry remains (don't change that logic).

### НЕ должно быть
- Do NOT remove auto-submit on last digit
- Do NOT add any other submit mechanism to replace the button
- Do NOT change the layout of the digit input cells

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for: the "Отправить" button inside the table code bottom sheet component/render block.
It should be a `<button>` with text "Отправить" or i18n key `"send"` / `"submit"`.

### Проверка
Open table code bottom sheet → no "Отправить" button visible. Entering 4 digits still auto-submits.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Change ONLY the 5 items described in Fix 1–5.
- Do NOT change: cart logic, menu display, order submission flow beyond Fix 1, partner settings, any other components.
- Do NOT "improve" anything not listed above.
- If you see another issue — skip it, note it in the report.

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (all 5 fixes)
- Fix 3 may require moving state or adding props — keep changes minimal, prefer passing props over large refactors
- Fix 4: useRef pattern is standard React, safe to apply
- git add pages/PublicMenu/x.jsx && git commit -m "fix(batch7-PM-070,073,069,075,112): error paths, guest id, lockout countdown, timer ref, remove send button" && git push
=== END ===


## Status
Running...
