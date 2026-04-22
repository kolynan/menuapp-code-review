---
task_id: task-260324-144313-publicmenu
status: running
started: 2026-03-24T14:43:14+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260324-144313-publicmenu

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-130431-1152
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260324-130431-1152
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260324-130431-1152-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260324-130431-1152-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260324-130431-1152"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260324-130431-1152-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260324-130431-1152

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
