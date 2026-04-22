---
task_id: task-260324-010146-publicmenu
status: running
started: 2026-03-24T01:01:46+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-010146-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-003210-36d5
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260324-003210-36d5
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260324-003210-36d5-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260324-003210-36d5-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260324-003210-36d5-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

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
