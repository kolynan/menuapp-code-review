---
task_id: task-260324-013343-publicmenu
status: running
started: 2026-03-24T01:33:43+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-013343-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-003210-36d5
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260324-003210-36d5
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260324-003210-36d5-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260324-003210-36d5-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260324-003210-36d5"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260324-003210-36d5-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

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
# UX Batch — PM-117 + PM-118 + PM-115: Detail Card Redesign + Stepper Center

Reference: `BUGS_MASTER.md` PM-117, PM-118, PM-115. `ux-concepts/ACCEPTANCE_CRITERIA_PublicMenu.md` (if exists).

Secondary file: `pages/PublicMenu/MenuView.jsx` (PM-115 fix).

---

## Fix 1 — PM-117 (P3) [MUST-FIX]: Detail card photo not square

### Сейчас
In the detail card (large item card / modal), the dish photo stretches or crops incorrectly — aspect ratio is not square.

### Должно быть
Photo in detail card: `aspect-square object-cover` — strictly 1:1 ratio, image fills the square without distortion.

### НЕ должно быть
- Do NOT use `aspect-video` or `aspect-auto`
- Do NOT add max-height that would break the square ratio

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Component: detail card / item detail modal — the `<img>` or image container at the top of the detail view.
Look for the large card/modal that opens when user taps a menu item.

### Проверка
Tap any menu item → detail card opens → photo is perfectly square (1:1), no stretching.

---

## Fix 2 — PM-118 (P2) [MUST-FIX]: Detail card missing discount price display

### Сейчас
In the detail card, there is no discount information shown (no strikethrough price, no discount badge), even when `discount_enabled === true` for the item.

### Должно быть
When `discount_enabled === true` AND `original_price` exists:

Layout under the photo (order matters):
```
[Item Name]                          ← bold, large
320 ₸   ~~400 ₸~~   [-20%]          ← discounted price + strikethrough original + badge
⭐ 4.8  (12 reviews)                 ← only if reviews exist
Description text...                  ← only if not empty
─────────────────────────────────────
[Add to Cart button — NO CHANGES]
```

Discount badge:
- Text: `-{percent}%` where percent = Math.round((1 - price/original_price) * 100)
- Background color: from `partner.discount_color` (same as used in menu cards)
- Text color: white
- Style: rounded pill/badge, same as existing discount badges in menu cards

When `discount_enabled !== true` OR no original_price: show only regular price, no badge, no strikethrough.

### НЕ должно быть
- Do NOT show discount UI when `discount_enabled !== true` (strict check: `=== true`)
- Do NOT change the "Add to Cart" button in any way
- Do NOT reorder the button position
- Do NOT change the name/title styling

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Component: detail card / item detail view — the price section below the photo.
Look for where `item.price` is displayed in the detail view. Add discount logic next to it.
Check how discount_color is accessed in MenuView.jsx for reference (it uses `partner.discount_color`).

### Проверка
1. Open item with discount_enabled=true → see: discounted price + strikethrough original + colored badge
2. Open item with discount_enabled=false → see: only regular price, no badge

---

## Fix 3 — PM-115 (P3) [MUST-FIX]: List-mode stepper position — center of photo, not bottom-right

### Сейчас
In list-mode, when an item is already in the cart, the stepper (`-N+`) appears at bottom-right of the photo overlay. This was a partial fix — the stepper IS already an overlay on the photo (✅), but position is bottom-right (❌).

### Должно быть
Stepper overlay position: **center of photo**.
CSS: `absolute inset-0 flex items-center justify-center`
(Replace current positioning classes like `absolute bottom-2 right-2` or similar.)

### НЕ должно быть
- Do NOT remove the overlay entirely — the stepper MUST remain inside the image container as an overlay
- Do NOT add the stepper outside/below the image
- Do NOT change stepper functionality (increment/decrement/remove)
- Do NOT change stepper visual style (colors, size)

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
Component: `renderListCard` function — the stepper container div inside the image/photo area.
Look for the stepper overlay that was added in RELEASE 260323-11. Current positioning classes are likely `bottom-X right-X` — replace with `inset-0 flex items-center justify-center`.

### Уже пробовали
RELEASE 260323-11: stepper moved to overlay (✅), but position is bottom-right (❌). Tested on Android S170.

### Проверка
List mode → add item to cart → `-N+` stepper appears centered over the photo (not bottom-right corner).

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Fix 1+2: change ONLY the detail card in `x.jsx` — photo aspect ratio and discount display.
- Fix 3: change ONLY the stepper overlay position in `MenuView.jsx` `renderListCard`.
- Do NOT change tile-mode cards, category chips, cart logic, or any other component.
- Do NOT change the "Add to Cart" button behavior or appearance.
- Locked UX: stepper design (–/+), cart FAB, menu grid layout — do NOT touch.

## Implementation Notes
- Files: `pages/PublicMenu/x.jsx` (Fix 1+2), `pages/PublicMenu/MenuView.jsx` (Fix 3)
- For discount_color: reference how MenuView.jsx accesses `partner.discount_color`
- For discount percent: `Math.round((1 - item.price / item.original_price) * 100)`
- git add pages/PublicMenu/x.jsx pages/PublicMenu/MenuView.jsx && git commit -m "fix(PM-117,PM-118,PM-115): detail card square photo + discount display + stepper center" && git push
=== END ===


## Status
Running...
