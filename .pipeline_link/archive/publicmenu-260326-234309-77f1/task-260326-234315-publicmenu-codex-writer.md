---
task_id: task-260326-234315-publicmenu-codex-writer
status: running
started: 2026-03-26T23:43:15+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 8.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260326-234315-publicmenu-codex-writer

## Config
- Budget: $8.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260326-234309-77f1
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 8.00
runner: codex
type: chain-step
---
Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260326-234309-77f1-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260326-234309-77f1

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# Small UX Fixes — x.jsx (#162)

Reference: `BUGS_MASTER.md` (PM-148, PM-149). UX agreed S182.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** Two small guest-facing UX cleanups in x.jsx identified during S182 Android testing.

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`

CONTEXT FILES (read-only):
- `BUGS_MASTER.md`

---

## Fix 1 — PM-148 (P3) [MUST-FIX]: Remove table confirmation banner

### Сейчас
After scanning QR and confirming the table, a green banner is displayed:
`✓ Стол Стол 22 подтверждён`

Two problems: (1) duplicate word "Стол Стол" (tech bug), (2) the banner adds no value — the guest just scanned their own QR code, they already know which table they're at.

### Должно быть
Remove the green confirmation banner entirely. The table code confirmation flow (Bottom Sheet / input) remains unchanged — only the success banner that appears on the main menu screen should be removed.

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for: `подтверждён` or `tableConfirmed` or `showTableConfirmSheet` or the green banner render block.
The banner likely renders conditionally based on a state variable (e.g. `tableConfirmed`, `showSuccessBanner`) — set it to never render, or remove the state + render entirely.

### Уже пробовали
No previous fix attempts.

### Проверка
1. Scan QR code → confirm table code → main menu shown
2. The green "Стол X подтверждён" banner should NOT appear
3. Menu, categories, mode tabs (В зале / Самовывоз / Доставка) all visible normally

---

## Fix 2 — PM-149 (P3) [MUST-FIX]: Remove guest ID suffix from guest name display

### Сейчас
After saving a guest name, the cart header shows: `Вы: Timur #1313 ✏️`
Before saving (default): `Гость 1 #1313`

The `#1313` suffix is a system-generated guest ID — internal tech detail, not meaningful to the guest. Showing it is "tech leakage".

### Должно быть
Show only the name without the suffix:
- After saving name: `Вы: Timur ✏️`
- Before saving (default): `Вы: Гость 1 ✏️` (or just `Гость 1`)

The `#N` suffix should be HIDDEN in the guest-facing UI (x.jsx / CartView.jsx display).
Note: In StaffOrdersMobile (waiter-facing UI) the suffix can remain for disambiguation — do NOT change StaffOrdersMobile.

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search for: `guestName` display, `currentGuest?.name`, `#${guestNumber}` or the pattern that produces "Timur #1313".
The name is composed from guest name + suffix — strip the suffix from the rendered display string only. Keep the underlying data intact.

### Уже пробовали
No previous fix attempts.

### Проверка
1. Open cart drawer → header shows `Вы: Гость 1 ✏️` (no `#1313`)
2. Tap ✏️ → enter "Timur" → save
3. Header shows `Вы: Timur ✏️` (no `#1313`)
4. Open StaffOrdersMobile as waiter → guest should still be identifiable (suffix can remain there)

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Do NOT change: table code input flow (Bottom Sheet), table confirmation logic
- Do NOT change: guest name save/edit functionality
- Do NOT change: StaffOrdersMobile (waiter-facing UI)
- Do NOT change: any other part of x.jsx

## FROZEN UX (DO NOT CHANGE)
- PM-133 ✅: help drawer — no table code → open table code sheet first
- PM-139 ✅: guest name saved correctly (setCurrentGuest null guard)
- PM-104 ✅: chevron in right part of table card, NOT sticky

## FROZEN UX grep verification
Before commit, verify:
```
grep -n "closeHelpDrawer\|helpQuickSent" pages/PublicMenu/x.jsx | head -5
grep -n "setCurrentGuest\|trimmedName" pages/PublicMenu/x.jsx | head -5
```

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Close/chevron buttons: RIGHT-ALIGNED (not centered), sticky top
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close/submit button
- [ ] No duplicate visual indicators (e.g. two gray lines that look the same)
- [ ] Text truncation: long item names don't overflow
- [ ] Sticky footer buttons don't overlap content

## Regression Check (MANDATORY after implementation)
- [ ] Table code input still works (Bottom Sheet opens, code accepted)
- [ ] Guest name edit still saves correctly
- [ ] Cart header shows correct name after save
- [ ] Help drawer (bell 🔔) still works

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/x.jsx`
- Do NOT use `git add .` — only: `git add pages/PublicMenu/x.jsx`
- git commit -m "fix(PublicMenu): remove table confirm banner + strip guest ID suffix (PM-148, PM-149)"
- git push

⚠️ Run AFTER #161 is DONE (Rule 26 — one chain at a time).
=== END ===


## Status
Running...
