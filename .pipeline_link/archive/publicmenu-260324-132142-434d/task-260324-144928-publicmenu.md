---
task_id: task-260324-144928-publicmenu
status: running
started: 2026-03-24T14:49:29+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260324-144928-publicmenu

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-132142-434d
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260324-132142-434d
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260324-132142-434d-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260324-132142-434d-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260324-132142-434d"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260324-132142-434d-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260324-132142-434d

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
