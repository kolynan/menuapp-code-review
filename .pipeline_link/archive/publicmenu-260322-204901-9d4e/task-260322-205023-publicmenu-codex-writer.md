---
task_id: task-260322-205023-publicmenu-codex-writer
status: running
started: 2026-03-22T20:50:24+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 8.00
fallback_model: sonnet
version: 5.11
launcher: python-popen
---

# Task: task-260322-205023-publicmenu-codex-writer

## Config
- Budget: $8.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260322-204901-9d4e
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

Write findings to: pipeline/chain-state/publicmenu-260322-204901-9d4e-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260322-204901-9d4e

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
# Bug Fix: MenuView L-weight fixes — 5 bugs (PM-091–095)

Reference: `BUGS_MASTER.md`, `pages/PublicMenu/BUGS.md`, `pages/PublicMenu/README.md`.
Production page.

**TARGET FILES (modify):** `pages/PublicMenu/MenuView.jsx`
**CONTEXT FILES (read-only):** `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`

**Context:** MenuView.jsx (373 lines) renders the restaurant menu — dish cards in list mode and tile (grid) mode. It uses `t(key)` for i18n (passed as prop from parent x.jsx). These 5 bugs were found by Codex in S162 as out-of-scope findings. All are L-weight (one-line or few-line fixes).

---

## Fix 1 — PM-091 (P1) [MUST-FIX]: Hardcoded Russian fallback in toast

### Now (current behavior)
Line 369: `{t('menu.added_to_cart') || 'Добавлено'}` — uses JS `||` operator which means if `t()` returns `undefined`, the hardcoded Russian string shows. This is an i18n violation: non-Russian speakers see Russian text.

### Expected (correct behavior)
Use the `t(key, fallback)` two-argument pattern: `{t('menu.added_to_cart', 'Добавлено')}`. This way the `t()` function handles fallback internally (consistent with all other t() calls in the file).

### Must NOT be
- ❌ Hardcoded Russian outside of `t()` fallback parameter
- ❌ English-only fallback (the app is Russian-primary, so Russian fallback is correct — but it must go through `t()`)

### File and location
`MenuView.jsx` line 369. Search: `|| 'Добавлено'`.

### Verification
Search the file for `|| '` (JS OR with string literal) — should find 0 results after fix.

---

## Fix 2 — PM-092 (P2) [MUST-FIX]: Touch targets below 44px on list-mode stepper buttons

### Now (current behavior)
List-mode stepper buttons (−/+) at lines 161-173 have `className="p-1 hover:bg-white rounded-md"` — effective size ~24x24px, well below 44px minimum.

### Expected (correct behavior)
Add minimum touch target: `min-w-[44px] min-h-[44px]` (or `w-11 h-11`) to both stepper buttons at lines 161-165 and 168-172. Keep the visual icon size at `w-4 h-4` but enlarge the tap area.

### Must NOT be
- ❌ Buttons with effective touch area < 44x44px
- ❌ Visual layout broken by oversized buttons (use `flex items-center justify-center` to keep icon centered)

### File and location
`MenuView.jsx` lines 161-165 (minus button) and 168-172 (plus button) in `renderListCard`. Search: `p-1 hover:bg-white rounded-md`.

### Verification
Inspect list-mode stepper buttons → computed size >= 44x44px.

---

## Fix 3 — PM-093 (P2) [MUST-FIX]: No onError fallback for dish images in list mode

### Now (current behavior)
List-mode dish image at lines 92-97: `<img src={dish.image} ... />` — if the image URL is broken/404, the browser shows a broken image icon. No fallback.

### Expected (correct behavior)
Add `onError` handler that hides the broken image and shows the placeholder (same as the no-image state at lines 98-102): `onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling && (e.currentTarget.nextSibling.style.display = 'flex'); }}` — OR replace `<img>` src with empty and show placeholder div.

Simpler approach: add `onError={(e) => { e.currentTarget.src = ''; e.currentTarget.style.display = 'none'; }}` and ensure the parent div shows `bg-slate-100` background as fallback.

### Must NOT be
- ❌ Broken image icon visible to user
- ❌ Removing lazy loading (`loading="lazy"`)

### File and location
`MenuView.jsx` lines 92-97 in `renderListCard`. The `<img>` tag at line 92-97.

### Verification
Set a dish image URL to invalid → list card shows slate placeholder, not broken image icon.

---

## Fix 4 — PM-094 (P3) [MUST-FIX]: Missing aria-labels on list-mode buttons

### Now (current behavior)
Three buttons in list-mode `renderListCard` (lines 148-176) lack aria-labels:
1. "+" add button at line 150-158: no `aria-label`
2. "−" stepper button at line 161-165: no `aria-label`
3. "+" stepper button at line 168-172: no `aria-label`

Compare with tile-mode (lines 260-287) which already HAS aria-labels: `aria-label={t('menu.add')}`, `aria-label={t('menu.remove')}`.

### Expected (correct behavior)
Add the same aria-labels as tile mode:
- Add button: `aria-label={t('menu.add')}`
- Minus stepper: `aria-label={t('menu.remove')}`
- Plus stepper: `aria-label={t('menu.add')}`

### Must NOT be
- ❌ Hardcoded English aria-labels — use `t()` with i18n keys
- ❌ Missing aria-labels on interactive elements

### File and location
`MenuView.jsx` lines 150, 161, 168 in `renderListCard`. The tile-mode equivalents at lines 261, 273, 283 already have the correct pattern.

### Verification
Search `renderListCard` for `<button` — every button must have `aria-label`.

---

## Fix 5 — PM-095 (P2) [MUST-FIX]: No onError fallback for dish images in tile mode

### Now (current behavior)
Tile-mode dish image at lines 195-200: `<img src={dish.image} ... />` — same problem as Fix 3 but in `renderTileCard`. Broken image URL shows broken icon.

### Expected (correct behavior)
Same pattern as Fix 3: add `onError` handler to hide broken image and show the existing placeholder div (lines 201-204).

### Must NOT be
- ❌ Broken image icon visible to user

### File and location
`MenuView.jsx` lines 195-200 in `renderTileCard`. The `<img>` tag.

### Verification
Set a dish image URL to invalid in tile mode → card shows slate placeholder with ImageIcon, not broken image icon.

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Modify ONLY the code described in Fix 1-5 above.
- Everything else — DO NOT TOUCH.
- If you see other "problems" not in this task — SKIP them, do not fix.
- Do NOT change: grid layout, card structure, darkenColor function, DishRating component, category rendering.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets >= 44x44px (h-11 w-11)
- [ ] No broken image icons visible
- [ ] Toast text goes through t() function
- [ ] All interactive buttons have aria-label

## Implementation Notes
- TARGET: `pages/PublicMenu/MenuView.jsx` (373 lines)
- CONTEXT: `pages/PublicMenu/README.md`, `pages/PublicMenu/BUGS.md`
- `t(key)` is passed as prop — supports `t(key, fallback)` pattern
- Do NOT break: dish card layout, stepper +/- logic, discount badge, rating display
- git add pages/PublicMenu/MenuView.jsx && git commit -m "fix: MenuView L-bugs — i18n, touch targets, onError, aria (PM-091-095)" && git push
=== END ===


## Status
Running...
