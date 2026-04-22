---
task_id: task-260324-130437-publicmenu-cc-writer
status: running
started: 2026-03-24T13:04:38+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 10.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-130437-publicmenu-cc-writer

## Config
- Budget: $10.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-130431-1152
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
Chain: publicmenu-260324-130431-1152
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260324-130431-1152-cc-findings.md
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
Chain: publicmenu-260324-130431-1152

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
# KS-1 (#133): CartView header + floating point fixes

**Production page.** Target files: CartView.jsx + x.jsx.

Reference: `BUGS_MASTER.md`, `ux-concepts/ACCEPTANCE_CRITERIA_PublicMenu.md`.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested — DO NOT modify under any circumstances:
- Chevron ˅ must stay on the RIGHT side, sticky during scroll (PM-083, PM-085)
- No custom drag handle (native B44 only) (PM-099)
- Single border-t above ИТОГО (PM-098)
- Chevron size w-7 h-7 (PM-100)
- Email field must remain REMOVED from cart (PM-086)
- ИТОГО layout: compact, no extra padding (PM-087)

---

## Fix 1 — PM-121 (P3) [MUST-FIX]: Double drag handle strip in CartView

### Сейчас
CartView (Bottom Sheet) shows TWO gray horizontal strips at the top: one is the native B44 Bottom Sheet drag handle, the second is our custom `div` drag handle added in a previous fix. Visually looks broken — duplicate bars.

### Должно быть
Only ONE gray drag handle strip at the top of the CartView Bottom Sheet. The native B44 handle is sufficient.

### НЕ должно быть
- Do NOT add any new custom drag handle `div`
- Do NOT remove the native B44 drag handle (it is part of B44 Bottom Sheet, cannot be removed)
- Do NOT touch the chevron position or style

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: custom drag handle div — likely `<div className="... drag ... handle ...">` or similar near the top of the Bottom Sheet JSX. Remove ONLY the custom one, keep everything else.

### Уже пробовали
PM-099 (S165): custom drag handle was removed before. Chain 36d5 (S172) may have accidentally re-added it. Check git diff.

### Проверка
Open CartView (tap cart icon) → top of bottom sheet shows exactly ONE gray strip.

---

## Fix 2 — PM-104 (P3) [MUST-FIX]: Chevron alignment in CartView header

### Сейчас
Chevron ˅ (close button) in CartView is NOT aligned on the same visual line as the gray drag handle. They appear at different vertical levels. Deployed in RELEASE 260324-00, but needs Android confirmation.

### Должно быть
Chevron ˅ and drag handle are visually on the same line (same row). Layout: `flex justify-between` or `flex items-center`, drag handle centered, chevron on the right.
The exact fix applied in chain 505b (S171): `justify-between` layout, spacer, centered drag handle, ChevronDown `w-9 h-9` on the right.

### НЕ должно быть
- Chevron must NOT be centered (must stay RIGHT)
- Do NOT change chevron size from w-9 h-9 (36px)
- Do NOT add email field (PM-086 — permanently removed)

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: `ChevronDown` — the header row with drag handle + chevron. Apply `flex justify-between items-center` if not already applied.
Note: if Fix 1 removed the custom drag handle, verify the chevron row layout still looks correct.

### Уже пробовали
Chain 505b (S171) quick-fix: exact B44 diff applied. RELEASE 260324-00. Test pending on Android.
Previous attempts (S167, S168): partial — chevron was center or wrong size.

### Проверка
Open CartView → header shows: [gray handle centered] [˅ right]. Both on same line.

---

## Fix 3 — PM-120 (P2) [MUST-FIX]: Floating point prices in cart

### Сейчас
Cart item prices and total show floating point artifacts: `167.57999999999998 ₸` instead of `167.58 ₸`. Happens when price × quantity in JavaScript produces floating point errors.

### Должно быть
All prices in cart are rounded to 2 decimal places. Use: `Math.round(price * qty * 100) / 100` or `parseFloat((price * qty).toFixed(2))`.

### НЕ должно быть
- Do NOT use `.toFixed(2)` on display string alone — must fix the underlying number before display
- Do NOT change the currency symbol or formatting (₸ stays, thousands separator stays)
- Do NOT touch `useCurrency` hook — that hook is for formatting only (PM-116 already fixed)

### Файл и локация
Files: `pages/PublicMenu/CartView.jsx` AND `pages/PublicMenu/x.jsx`
In CartView.jsx: search for `price * qty` or `item.price * item.quantity` — the line item subtotal calculation.
In x.jsx: search for cart total calculation — wherever `reduce` or sum of cart items is computed for display.

### Проверка
Add item (e.g. price 55.93 ₸) × 3 → cart shows `167.79 ₸` (not `167.78999...`). Total also shows clean number.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY code described in Fix 1, Fix 2, Fix 3.
- Everything else (stepper logic, loyalty section, toast notifications, i18n keys, order submission) — DO NOT TOUCH.
- Locked UX decisions (FROZEN UX section above) — PROHIBITED to change.
- If you notice another issue not listed here — SKIP IT, do not fix.

## Implementation Notes
- TARGET FILES (modify): `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/x.jsx`
- CONTEXT FILES (read-only): `BUGS_MASTER.md`, `README.md`
- Fix order: Fix 1 first (remove extra handle) → Fix 2 (verify alignment) → Fix 3 (floating point, both files)
- After all fixes: `git add` + `git commit -m "KS-1 #133: CartView handle + chevron + floating point (PM-121, PM-104, PM-120)"`
- Mobile-first: all fixes must look correct at 390px width (iPhone 14 viewport)
=== END ===


## Status
Running...
