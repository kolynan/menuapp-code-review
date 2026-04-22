---
chain: publicmenu-260324-153540-d45d
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 15.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: publicmenu-260324-153540-d45d
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260324-153540-d45d-cc-findings.md
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
Chain: publicmenu-260324-153540-d45d

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
# KS-2 (#134): Detail card redesign — drawer + layout + discount

**Production page.** Target file: x.jsx.

Reference: `BUGS_MASTER.md`, `outputs/wolt-reference/WOLT_DESIGN_REFERENCE.md`.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested — DO NOT modify under any circumstances:
- Table confirmation = Bottom Sheet only, never inline (PM-064)
- Back button priority: close active screen first (PM-105)
- Toast = full toast notification, not a thin line (PM-103)
- BS close button closes ONLY BS, not order list (PM-107)
- Detail card photo: aspect-square object-cover (PM-117)
- Table code BS: sr-only input, «Отправить» button, no «Не тот стол?» link (PM-079, PM-080, PM-081)

---

## Wolt Design Reference
See `outputs/wolt-reference/WOLT_DESIGN_REFERENCE.md` for detailed layout spec.
Key points:
- Detail card = Bottom Drawer (~85-90% screen height), NOT fullscreen
- Drag handle: thin gray line at top of photo
- Chevron ˅: top-right of photo (close button)
- Layout order (top → bottom): Photo → Title → Description → Price(+discount) → Options → [bottom bar: stepper + Add button]
- Photo: full width, ~50% screen height

---

## Fix 1 — PM-122 (P2) [MUST-FIX]: Detail card must open as bottom drawer, NOT fullscreen

### Сейчас
Tapping a dish in the menu opens a fullscreen overlay/page — it covers the entire screen and looks like a navigation to a new page.

### Должно быть
Detail card must appear as a **Bottom Sheet / Drawer** — slides up from the bottom, approximately 85-90% of screen height. Remaining 10-15% of the page shows behind.
This matches CartView behavior (which is already a Bottom Sheet).

### НЕ должно быть
- Do NOT keep fullscreen presentation
- Do NOT use a modal that covers 100% of screen without the bottom-sheet pattern
- Do NOT remove the drag handle (swipe to dismiss)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep hint: search `"selectedDish"` or `"activeDish"` or `"DishDetail"` — this is the state/component that controls detail card visibility.
Also search `"fixed inset-0"` — that's likely the fullscreen overlay class to replace.
⚠️ D4 NOTE: If the detail card is NOT a separate component but inline JSX in x.jsx — locate the section and wrap it in a Bottom Sheet (same pattern as CartView). If it IS a separate imported component — note which file and update that file instead.
Change: wrap in B44 Bottom Sheet component (same as CartView uses), or apply: `position: fixed; bottom: 0; height: 88vh; border-radius: 16px 16px 0 0; overflow-y: auto`.

### Проверка
Tap any dish → card slides up from bottom, does NOT cover full screen, background menu partially visible at top.

---

## Fix 2 — PM-123 (P2) [MUST-FIX]: Detail card layout order

### Сейчас
Detail card content order: Название (Title) → Цена (Price) → Рейтинг (Rating) → Описание (Description).
Price appears before description — user sees price before understanding the dish.

### Должно быть
Correct order (Wolt-style, top → bottom):
1. Photo (full width, top)
2. **Название** (Title) — bold, large (~22px)
3. **Описание** (Description) — gray/muted text, immediately below title
4. **Цена + скидка** (Price + discount badge) — below description
5. Rating/options (if any)
6. Bottom bar: stepper + Add to cart button (sticky)

### НЕ должно быть
- Do NOT put price above description
- Do NOT remove description
- Do NOT change the bottom action bar (stepper + add button)

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep hint: search `"dish.name"` or `"selectedDish.name"` or `"item.name"` — find where the detail content is rendered.
Also search `"dish.description"` to find the description block that needs to move up (above price).
Reorder the JSX blocks: Title → Description → Price → (rest).

### Проверка
Open detail card → read order: dish name → description text → price (with badge if discount) → options.

---

## Fix 3 — PM-118 (P2) [MUST-FIX]: Discount badge in detail card

### Сейчас
Detail card does not show discount information: no strikethrough original price, no `-X%` badge. Even when `discount_enabled === true` for the dish, the detail card shows only the discounted price without context.

### Должно быть
When `item.discount_enabled === true`:
- Show **original price** with strikethrough: ~~500 ₸~~
- Show **discounted price** prominently: 375 ₸
- Show **discount badge**: `-25%` (calculated)
These must appear in the Price section (Fix 2 position: below description).

### НЕ должно быть
- Do NOT show discount info when `discount_enabled !== true`
- Do NOT use truthy check — must be `=== true` (PM-109 guard pattern)
- Do NOT change the discount logic that already works in list/tile view

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Grep hint: search `"dish.price"` or `"selectedDish.price"` in the detail card section (near the dish.name block found in Fix 2).
Add discount display logic — use SAME pattern as MenuView.jsx list/tile discount display.
Fields (verify against MenuView.jsx): `item.discount_enabled`, `item.discount_percent`, `item.original_price`.

### ⚠️ Fix 2 + Fix 3 relationship
Fix 2 reorders blocks. Fix 3 adds discount to the Price block. Apply in this order: (1) reorder blocks (Fix 2) → (2) enhance the Price block with discount display (Fix 3). Both modify the same Price section.

### Проверка
Find a dish with discount enabled in menu → open detail card → see: ~~original_price~~ + discounted_price + `-X%` badge.

---

## ⚠️ WEIGHT NOTE (for CC/Codex writers)
Fix 1 (fullscreen→drawer) is an H-weight architectural change. Fix 2 (reorder) and Fix 3 (discount) are M-weight.
They are combined intentionally because all three affect the SAME detail card section. If Fix 1 is blocked by B44 limitations → apply Fix 2 and Fix 3 independently and report Fix 1 as SKIPPED with reason.

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: (1) detail card presentation (drawer vs fullscreen), (2) content order, (3) discount display.
- Do NOT touch: table confirmation flow, cart logic, order submission, toasts, Back button behavior.
- Do NOT touch: Bottom Sheet for table code verification (PM-064, PM-071, PM-079-PM-082).
- Locked UX decisions (FROZEN UX above) — PROHIBITED to change.
- If you notice another issue not listed here — SKIP IT.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Detail card opens as bottom drawer (NOT fullscreen), ~85-90% screen height
- [ ] Content order: Photo → Title → Description → Price → Options → Sticky bottom bar
- [ ] Discount badge visible (strikethrough + badge) when discount_enabled === true
- [ ] Close/chevron button: accessible, tappable (≥ 44×44px)
- [ ] Bottom action bar (stepper + Add button) is sticky at bottom, not overlapped
- [ ] Text truncation: long dish names don't overflow
- [ ] No fullscreen flash before drawer appears

## Implementation Notes
- TARGET FILES (modify): `pages/PublicMenu/x.jsx`
- CONTEXT FILES (read-only): `pages/PublicMenu/MenuView.jsx` (for discount field names), `BUGS_MASTER.md`, `outputs/wolt-reference/WOLT_DESIGN_REFERENCE.md`
- Fix order: Fix 1 (drawer) → Fix 2 (reorder) → Fix 3 (discount)
- After all fixes: `git add pages/PublicMenu/x.jsx && git commit -m "KS-2 #134: Detail card drawer + layout + discount (PM-122, PM-123, PM-118)"`
=== END ===
