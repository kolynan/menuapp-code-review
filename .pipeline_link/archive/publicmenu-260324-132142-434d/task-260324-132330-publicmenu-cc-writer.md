---
task_id: task-260324-132330-publicmenu-cc-writer
status: running
started: 2026-03-24T13:23:30+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 10.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-132330-publicmenu-cc-writer

## Config
- Budget: $10.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-132142-434d
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
Chain: publicmenu-260324-132142-434d
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260324-132142-434d-cc-findings.md
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
Chain: publicmenu-260324-132142-434d

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
# KS-3 (#135): MenuView stepper position (PM-115)

**Production page.** Target file: MenuView.jsx only.

Reference: `BUGS_MASTER.md`.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested — DO NOT modify under any circumstances:
- List-mode card: image RIGHT, «+» button = absolute overlay bottom-right of image (PM-108, PM-110)
- Tile-mode: «+» button = absolute overlay bottom-right of image (PM-111)
- discount_enabled guard === true (not just truthy) (PM-109)
- Touch targets ≥ 44px on all stepper buttons (PM-092, PM-096)
- Mobile grid: dynamic MOBILE_GRID[mobileCols], not hardcoded (PM-072)
- whitespace-nowrap on discounted prices in tile-mode (PM-106)

---

## Fix 1 — PM-115 (P3) [MUST-FIX]: List-mode stepper at BOTTOM-RIGHT of photo, not center

### Сейчас
In list-mode, when an item is in cart (stepper visible), the `−N+` stepper is positioned at the CENTER of the item photo (`inset-0 flex items-center justify-center` or similar). This overlaps the food photo poorly and looks wrong.
RELEASE 260324-01 (MenuView) contains a center-position fix that was tested on Android S172 and confirmed WRONG.

### Должно быть
The stepper `−N+` in list-mode must appear at the **bottom-right corner of the photo** — same position as the «+» add button. The stepper REPLACES the «+» button when item count > 0.
CSS: `absolute bottom-2 right-2` (or equivalent) on the stepper overlay.

### НЕ должно быть
- Do NOT use `inset-0` + `items-center` + `justify-center` — this centers the stepper (confirmed wrong, S172)
- Do NOT move the stepper outside the photo area
- Do NOT change the «+» button position (PM-110, PM-111 are FROZEN)
- Do NOT change stepper touch targets (must stay ≥ 44px)

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Function: `renderListCard` (or equivalent list-mode card renderer)
Search for: `inset-0` near stepper — that's the wrong centering class to replace.
Grep hint: search `"inset-0"` in MenuView.jsx → find the stepper overlay div in list card context.
Also search `"renderListCard"` or `"list-mode"` comment to find the card renderer.
Current wrong class: `inset-0 flex items-center justify-center` (or similar)
Required class: `absolute bottom-2 right-2` (matching PM-110 «+» button position)

### Уже пробовали
Chain 36d5 (S172, chain template С5): applied `center` position — tested Android, WRONG (PM-115 reopened).
Chain 98ba (S170): PM-115 🟡 — overlay appeared but position was off.

### Проверка
1. Open menu in list-mode
2. Add any item to cart (stepper appears)
3. Stepper `−N+` must be at BOTTOM-RIGHT of the item photo, NOT centered
4. Must NOT overlap dish name or price text

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY the stepper position in list-mode card (renderListCard).
- Do NOT touch tile-mode cards, header, category chips, or any other component.
- Do NOT change stepper button sizes, colors, or logic.
- Locked UX decisions (FROZEN UX above) — PROHIBITED to change.
- If you notice another issue not in this task — SKIP IT.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Stepper buttons: BOTTOM-RIGHT of photo (not centered)
- [ ] Touch targets ≥ 44×44px on stepper −/+ buttons
- [ ] Stepper does NOT overlap dish name or price text
- [ ] «+» button still visible when item count = 0 (not affected by fix)
- [ ] No regression in tile-mode (stepper/add button position unchanged)

## Implementation Notes
- TARGET FILES (modify): `pages/PublicMenu/MenuView.jsx`
- CONTEXT FILES (read-only): `BUGS_MASTER.md`
- This is a SINGLE CSS positioning fix — scope is very narrow
- After fix: `git add pages/PublicMenu/MenuView.jsx && git commit -m "KS-3 #135: PM-115 list-mode stepper bottom-right position"`
=== END ===


## Status
Running...
