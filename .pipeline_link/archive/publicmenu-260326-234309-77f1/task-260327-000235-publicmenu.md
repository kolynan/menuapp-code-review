---
task_id: task-260327-000235-publicmenu
status: running
started: 2026-03-27T00:02:38+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 4.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260327-000235-publicmenu

## Config
- Budget: $4.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260326-234309-77f1
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 4.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260326-234309-77f1
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260326-234309-77f1-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260326-234309-77f1-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260326-234309-77f1-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260326-234309-77f1

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
