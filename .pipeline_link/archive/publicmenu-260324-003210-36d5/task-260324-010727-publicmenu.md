---
task_id: task-260324-010727-publicmenu
status: running
started: 2026-03-24T01:07:27+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
version: 5.12
launcher: python-popen
---

# Task: task-260324-010727-publicmenu

## Config
- Budget: $12.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260324-003210-36d5
chain_step: 3
chain_total: 4
chain_step_name: discussion
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion (3/4) ===
Chain: publicmenu-260324-003210-36d5
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step by running a multi-round discussion between CC and Codex.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260324-003210-36d5-comparison.md
2. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260324-003210-36d5-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260324-003210-36d5
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   Run up to 3 rounds of discussion. Each round:

   a) CC Position (you write):
      For each dispute, write your analysis:
      - Which solution is better and WHY (with code reasoning)
      - What edge cases or risks does each approach have

   b) Codex Position (run codex):
      Create a prompt file with CC's position and ask Codex to respond.
      Run: codex.cmd exec --model codex-mini --prompt "<prompt>" --quiet
      The prompt should include CC's position and ask Codex to:
      - Agree or disagree with CC's reasoning
      - Provide counter-arguments if it disagrees
      - Propose a compromise if possible

   c) After each round, check:
      - If both agree on all disputes → RESOLVED, stop early
      - If round 3 and still disagree → mark as UNRESOLVED for Arman

3. Write final discussion report to: pipeline/chain-state/publicmenu-260324-003210-36d5-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

## Disputes Discussed
Total: N disputes from Comparator

## Round 1
### Dispute 1: [title]
**CC Position:** ...
**Codex Position:** ...
**Status:** resolved/ongoing

### Dispute 2: [title]
...

## Round 2 (if needed)
...

## Round 3 (if needed)
...

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Title   | 2      | resolved   | CC/Codex/compromise |
| 2 | Title   | 3      | unresolved | → Arman |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Unresolved (for Arman)
Items where CC and Codex could not agree after 3 rounds.
Arman must decide. Each item shows both positions.

4. Do NOT apply any fixes — only document the discussion results

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
