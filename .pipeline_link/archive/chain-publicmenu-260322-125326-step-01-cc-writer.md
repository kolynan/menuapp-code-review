---
chain: publicmenu-260322-125326
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
Chain: publicmenu-260322-125326
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for PublicMenu in pages/PublicMenu/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260322-125326-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-125326

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...

=== TASK CONTEXT ===
# UX Batch: Checkout motivation text + table code BS (#87 KS-1)

Reference: `ux-concepts/UX_LOCKED_PublicMenu.md`, `BUGS_MASTER.md`.
Production page.

**Context:** The checkout drawer currently shows a full loyalty section before order submission: "Лояльность +3, за отзыв +10, Бонусы за онлайн-заказ +3Б". The client hasn't earned anything yet — this is premature and clutters checkout. Also the term "онлайн-заказ" confuses dine-in customers. Decision: replace with compact motivational text + fix the table code bottom sheet.

TARGET FILES (modify): CartView.jsx, x.jsx
CONTEXT FILES (read-only): README.md, BUGS.md

---

## Fix 1 — #87a (P1) [MUST-FIX]: Replace loyalty section with motivational text in checkout drawer

### Сейчас (текущее поведение)
In the checkout drawer (CartView), before submitting the order, a full loyalty section is displayed:
- "Лояльность" header with expandable details (+3 points, за отзыв +10)
- "Бонусы за онлайн-заказ +3Б" line
- Full loyalty breakdown UI

This appears BEFORE the client has placed any order — premature and cluttering.

### Должно быть (ожидаемое поведение)
Replace the entire loyalty section with a compact motivational block (1-2 lines, small font, visually secondary) positioned above the "Отправить официанту" CTA button. Dynamic text based on partner settings:

- **Bonuses only:** Line 1: "Начислим +3 бонуса за этот заказ" / Line 2 (small, gray): "Официант сразу увидит его"
- **Discount only:** Line 1: "Скидка 10% на этот заказ" / Line 2 (small, gray): "Официант сразу увидит его"
- **Both:** Line 1: "Скидка 10% и +3 бонуса за этот заказ" / Line 2 (small, gray): "Официант сразу увидит его"
- **Nothing configured:** Single line: "Официант сразу увидит заказ" OR hide the block entirely

The motivational block should use small text (text-sm), secondary color (text-slate-500 for line 2), and NOT compete visually with the item list, total, or CTA button.

Read partner settings: `partner.loyalty_enabled`, `partner.loyalty_points_per_order` (or similar), `partner.discount_percentage` (or similar) to determine which variant to show.

### НЕ должно быть (анти-паттерны)
- NO full loyalty section (expandable details, "+3", "за отзыв +10", etc.) in pre-checkout
- NO "Бонусы за онлайн-заказ" line anywhere
- NO word "онлайн" in any client-facing UI text
- NO large/prominent loyalty UI before order submission
- Do NOT remove loyalty logic from post-order screens (reward after submission should stay)

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Look for: loyalty section rendering in the checkout/cart drawer (the section with "Лояльность", expandable bonus details, "Бонусы за онлайн-заказ"). Remove this entire section and replace with the motivational block described above.

### Проверка (мини тест-кейс)
1. Open cart drawer with items → see compact motivational text (1-2 lines) above CTA, NOT full loyalty section
2. If partner has bonuses configured → see "Начислим +X бонуса за этот заказ"
3. No word "онлайн" visible anywhere

---

## Fix 2 — #87b (P1) [MUST-FIX]: Redesign table code verification bottom sheet

### Сейчас (текущее поведение)
The "Подтвердите стол" bottom sheet shows:
- Title "Подтвердите стол"
- Subtitle "Чтобы отправить заказ официанту"
- Green text "По онлайн-заказу вы получите бонусы / скидку"
- "Введите код стола" label
- 4 input cells for code
- A separate field showing "0000" below the cells (confusing duplicate)
- Button "Подтвердить и отправить"
- Link "Не тот стол? Изменить"

### Должно быть (ожидаемое поведение)
Simplified bottom sheet (shown ONLY when table is NOT bound via QR):

1. **Title:** "Введите код стола" (replaces "Подтвердите стол")
2. **Helper text** (visible, NOT hidden behind tooltip): "Код указан на табличке на столе. Если не нашли — спросите у официанта." (text-sm, text-slate-500)
3. **4 empty input cells** (no pre-filled "0000", no separate duplicate field)
4. **Compact motivation line** near button: "Начислим +X бонуса" (text-sm, accent color text-[#B5543A]) — dynamic based on partner settings, same logic as Fix 1
5. **Button:** "Отправить" (single word, replaces "Подтвердить и отправить")
6. **Remove** "Не тот стол? Изменить" link
7. **Remove** "По онлайн-заказу вы получите бонусы / скидку" text
8. **Remove** the duplicate "0000" display field

Input behavior requirements:
- Auto-focus on first cell when BS opens
- Numeric keyboard (inputMode="numeric")
- Auto-advance to next cell after digit entry
- Backspace returns to previous cell
- Paste of 4 digits fills all cells
- Submit button enabled ONLY after all 4 digits entered
- Error message below input cells: "Неверный код. Проверьте цифры или спросите у официанта" (text-sm, text-red-500)

### НЕ должно быть (анти-паттерны)
- NO "Подтвердите стол" as title
- NO "По онлайн-заказу..." text
- NO "0000" pre-filled or displayed as separate field
- NO "Подтвердить и отправить" (too long)
- NO "Не тот стол? Изменить" link
- NO word "онлайн" anywhere

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Look for: Bottom Sheet component for table verification / code entry. Contains "Подтвердите стол", code input cells, "0000" display, "Не тот стол?" link.

### Проверка (мини тест-кейс)
1. Click "Отправить официанту" without table bound → BS opens with "Введите код стола" title
2. Helper text visible immediately (no tooltip needed)
3. 4 empty cells, numeric keyboard appears
4. Enter wrong code → error message below cells
5. No "0000", no "Не тот стол?" link, no "онлайн" word

---

## Fix 3 — PM-150-01 (P2) [NICE-TO-HAVE]: Check if email validation in loyalty is still needed

### Сейчас (текущее поведение)
PM-150-01 reported: no email validation in loyalty section — "abc" accepted. Since Fix 1 removes the loyalty section from pre-checkout, this bug may become irrelevant.

### Должно быть
If any email input remains in CartView after removing the loyalty section — add proper validation (input type="email" or regex). If the email input was part of the removed loyalty section — this fix is automatically resolved by Fix 1.

### НЕ должно быть
No unvalidated email inputs remaining in CartView.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx` — check if email input exists outside the loyalty section.

### Проверка
After Fix 1: search CartView for any remaining email input. If none → PM-150-01 resolved. If exists → validate it.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код, описанный в Fix-секциях выше.
- ВСЁ остальное (позиции элементов, цвета не описанные выше, layout, маршрутизация) — НЕ ТРОГАТЬ.
- Если видишь «проблему» не из этой задачи — ПРОПУСТИ, не чини.
- Locked UX decisions (см. `ux-concepts/UX_LOCKED_PublicMenu.md`) — ЗАПРЕЩЕНО менять.
- Do NOT modify post-order loyalty/reward screens — only pre-checkout.

## Implementation Notes
- TARGET FILES: `CartView.jsx`, `x.jsx`
- CONTEXT FILES: `README.md`, `BUGS.md`
- НЕ ломать: PM-063 (stepper −/+), PM-064 (BS trigger), PM-071 (BS z-index)
- After all fixes: `git add pages/PublicMenu/CartView.jsx pages/PublicMenu/x.jsx && git commit -m "feat: checkout motivation text + BS redesign #87-KS1" && git push`
=== END ===
