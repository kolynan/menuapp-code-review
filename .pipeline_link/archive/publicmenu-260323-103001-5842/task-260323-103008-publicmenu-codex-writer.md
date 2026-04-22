---
task_id: task-260323-103008-publicmenu-codex-writer
status: running
started: 2026-03-23T10:30:09+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 8.00
fallback_model: sonnet
version: 5.11
launcher: python-popen
---

# Task: task-260323-103008-publicmenu-codex-writer

## Config
- Budget: $8.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260323-103001-5842
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

Write findings to: pipeline/chain-state/publicmenu-260323-103001-5842-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260323-103001-5842

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
# Bugfix: PublicMenu L-fixes — touch targets, aria i18n, price color (#96, #68, #84)

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

**Context:** Three small L-weight fixes in MenuView.jsx and CheckoutView.jsx.
MenuView.jsx is the main dish list (grid + tile/list mode). CheckoutView.jsx is the order summary before submission.

TARGET FILES (modify):
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/CheckoutView.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/x.jsx`

---

## Fix 1 — PM-096 (P2) [MUST-FIX]: Tile-mode stepper buttons below 44px touch target

### Сейчас (текущее поведение)
In tile-mode (grid view), when a dish is added to cart, a quantity stepper `− qty +` replaces the "+" button. The Minus and Plus buttons have `className="w-8 h-8 ..."` = 32×32px, below the 44px mobile touch target minimum.

### Должно быть (ожидаемое поведение)
Both stepper buttons (Minus and Plus) in tile-mode must be at least `w-11 h-11` (44×44px).
Ref: WCAG 2.5.5 touch target size; list-mode was already fixed (PM-092) — tile-mode must match.

### НЕ должно быть (анти-паттерны)
- Do NOT change the list-mode stepper buttons (already `min-w-[44px] min-h-[44px]`).
- Do NOT change the initial "+" add button (already `w-11 h-11`).
- Do NOT change icon sizes inside buttons (keep `w-4 h-4`).

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Line ~280: `className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"` (Minus button in tile stepper)
- Line ~290: `className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"` (Plus button in tile stepper)
Search for: `w-8 h-8` near `<Minus` and `<Plus` in the renderTileCard function (~lines 260–300).

### Проверка (мини тест-кейс)
1. Add a dish in tile (grid) mode → stepper appears.
2. Verify both `−` and `+` buttons are 44px or larger.
3. Verify list-mode stepper is unchanged.

---

## Fix 2 — PM-068 (P3) [MUST-FIX]: Hardcoded English aria-labels in CheckoutView

### Сейчас (текущее поведение)
CheckoutView.jsx quantity buttons use hardcoded English strings:
- Line ~60: `aria-label="Decrease"`
- Line ~64: `aria-label="Increase"`
These are not translated and do not use the i18n system.

### Должно быть (ожидаемое поведение)
Replace with i18n keys:
- `aria-label="Decrease"` → `aria-label={t('cart.decrease', 'Уменьшить')}`
- `aria-label="Increase"` → `aria-label={t('cart.increase', 'Увеличить')}`

Note: `t` function is already available in CheckoutView.jsx. Use existing `t` — NOT `tr` or `tr()`.

### НЕ должно быть (анти-паттерны)
- Do NOT change aria-labels in CartView.jsx or MenuView.jsx (already use i18n correctly).
- Do NOT change button functionality or className.

### Файл и локация
`pages/PublicMenu/CheckoutView.jsx`
- Line ~60: quantity decrement button with `aria-label="Decrease"`
- Line ~64: quantity increment button with `aria-label="Increase"`
Search for: `aria-label="Decrease"` and `aria-label="Increase"` in CheckoutView.jsx.

### Проверка (мини тест-кейс)
1. Grep CheckoutView.jsx for `aria-label="Decrease"` — must return 0 results after fix.
2. Grep for `aria-label={t(` — must have at least 2 results.

---

## Fix 3 — #84 (P2) [MUST-FIX]: Discount price text color vs badge color conflict

### Сейчас (текущее поведение)
In MenuView.jsx, BOTH the discount badge AND the discounted price text use `partner.discount_color`:
- Badge background: `style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}`
- Discounted price text: `style={{ color: partner?.discount_color || '#C92A2A' }}`

Result: two different UI elements (badge and price) share the same color → visual confusion and poor hierarchy (LMP: price should signal "brand/value", badge should signal "sale").

### Должно быть (ожидаемое поведение)
- **Discount badge** (the "-5%" pill) → keep using `partner.discount_color` (signals "sale/deal")
- **Discounted price text** (e.g. "30 ₸") → use `partner.primary_color` (signals "price = brand")
- **Crossed-out original price** (e.g. "~~32 ₸~~") → keep existing gray/muted styling

This separates visual roles: brand color = what you pay, discount color = how much you save.

### НЕ должно быть (анти-паттерны)
- Do NOT change the badge background color (line ~108 and ~217).
- Do NOT hardcode any color hex values — use `partner?.primary_color || '#1A1A1A'`.
- Do NOT change the crossed-out original price color.
- Note: `primaryColor` is already declared at top of MenuView.jsx: `const primaryColor = partner?.primary_color || '#1A1A1A';`

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Line ~126: in list-mode card, discounted price `<span style={{ color: partner?.discount_color || '#C92A2A' }}>` → change to `style={{ color: primaryColor }}`
- Line ~237: in tile-mode card, same pattern — search for the discounted price span near `Math.round(dish.price * (1 - partner.discount_percent / 100))`

Search for: `discount_color` near `Math.round` or `formatPrice` in MenuView.jsx. There should be 2 occurrences (one per card mode).

### Проверка (мини тест-кейс)
1. Open menu with a partner that has discounted items.
2. Discounted price (e.g. "30 ₸") shows in `primary_color` (brand color, e.g. amber/terracotta).
3. Discount badge ("-5%") keeps its `discount_color` (red or custom).
4. Crossed-out price remains gray.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/MenuView.jsx` and `pages/PublicMenu/CheckoutView.jsx`
- Do NOT touch: `x.jsx`, `CartView.jsx`, `useTableSession.jsx`, or any other file.
- Do NOT fix bugs outside the 3 Fix sections above.
- Do NOT change any business logic, state management, or data flow.
- If you see other issues — IGNORE them completely. Extra findings = task FAILURE.

## Implementation Notes
- Files: `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/CheckoutView.jsx`
- НЕ ломать: toast logic (lines 53-68), grid logic (lines 70-77), list-mode stepper (lines 148-180)
- git add pages/PublicMenu/MenuView.jsx pages/PublicMenu/CheckoutView.jsx && git commit -m "fix: tile stepper touch targets, aria i18n, discount price color" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first app. Verify at 375px width:
- [ ] Tile stepper buttons: both ≥ 44×44px, easy to tap
- [ ] Aria labels: human-readable in DevTools accessibility tree (no "Decrease"/"Increase")
- [ ] Discount price color change is visible and distinct from badge
- [ ] No visual regressions in tile or list mode
=== END ===


## Status
Running...
