---
chain: publicmenu-260324-003210-36d5
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 12.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260324-003210-36d5
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260324-003210-36d5-cc-findings.md
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
Chain: publicmenu-260324-003210-36d5

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
