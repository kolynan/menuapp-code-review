---
task_id: task-260329-232414-publicmenu-cc-writer
status: running
started: 2026-03-29T23:24:15+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260329-232414-publicmenu-cc-writer

## Config
- Budget: $12.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260329-232408-0279
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
Chain: publicmenu-260329-232408-0279
Page: PublicMenu

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for PublicMenu
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/publicmenu-260329-232408-0279-cc-findings.md
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
Chain: publicmenu-260329-232408-0279

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
# UX Batch 7: CartView polish + PM-162 discount price formatting

Reference: `ux-concepts/cart-view.md` v4.2, `BUGS_MASTER.md`, `DECISIONS_INDEX.md §3`.

**TARGET FILES (modify):**
- `pages/PublicMenu/CartView.jsx` (Fixes 1–5)
- `pages/PublicMenu/MenuView.jsx` (Fix 6)
- `pages/PublicMenu/x.jsx` (Fix 7)

**CONTEXT FILES (read only, do not modify):**
- `ux-concepts/cart-view.md`
- `BUGS_MASTER.md`

---

## Fix 1 — CV-UX (P2) [MUST-FIX]: Move "За отзыв" and "Спасибо за оценку" banners inside "Подано" section

### Сейчас
Two banners appear at the top of the CartView drawer body, above ALL bucket sections:
1. "За отзыв +N бонусов" hint (`shouldShowReviewRewardHint`) — amber background — at ~lines 670–679
2. "Спасибо за оценку!" nudge (`shouldShowReviewRewardNudge`) — green background — at ~lines 681–730
These ~100px of banners push "Новый заказ" section below the fold when there are 3+ active sections.

### Должно быть
Both banners (`shouldShowReviewRewardHint` and `shouldShowReviewRewardNudge`) must be rendered INSIDE the "Подано" (`served`) bucket section — immediately below the bucket header row, before the list of served orders.
Banners should only appear when the served bucket is expanded (`expandedStatuses.served === true`).
Outside the served bucket: no banners at all.

### НЕ должно быть
- Banners at the top-level drawer body (outside any bucket section).
- Banners visible when served bucket is collapsed.
- Banners duplicated in multiple locations.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
- Remove: `{shouldShowReviewRewardHint && ...}` block at ~lines 670–679 (top-level position)
- Remove: `{shouldShowReviewRewardNudge && ...}` block at ~lines 681–730 (top-level position)
- Add both blocks inside the served bucket render area, AFTER the `<button>` header, BEFORE `{expandedStatuses.served && renderBucketOrders(...)}` — but only when `expandedStatuses.served` is true.
  Search for: `"Подано bucket"` or `key === 'served'` or `isServed` in CartView.jsx to locate served bucket rendering (~lines 866–960).

### Проверка
1. Open CartView drawer with at least 1 served order and loyalty enabled.
2. When "Подано" section is collapsed: no banners visible.
3. When "Подано" section is expanded: "За отзыв" or "Спасибо" banner visible inside the section.

---

## Fix 2 — CV-UX (P3) [MUST-FIX]: Reduce collapsed bucket header padding

### Сейчас
Collapsed bucket header buttons (`<CardContent>`) use `p-3` (12px all sides), making each collapsed header tall (48-52px).

### Должно быть
Collapsed bucket headers: `px-3 py-2` (12px horizontal, 8px vertical) — saves ~8px per header.
Expanded headers: keep as-is (do NOT change padding for expanded state).

### НЕ должно быть
- Changing padding of expanded bucket content.
- Changing padding of the "Новый заказ" section card.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: `<CardContent className="p-3">` inside bucket map rendering at ~lines 905–945.
Change `className="p-3"` → `className="px-3 py-2"` ONLY on the outer `<CardContent>` of bucket headers.

### Проверка
Open CartView → collapse a bucket → header height visually smaller vs before.

---

## Fix 3 — PM-159 (P3) [NICE-TO-HAVE]: Spacing fix between "Новый заказ" card and submit footer

### Сейчас
When only 1 item is in cart, there is visible white space between the "Новый заказ" card bottom and the "Отправьте заказ официанту..." footer zone.

### Должно быть
Add `mb-4` margin-bottom on the "Новый заказ" cart card container.
Add `border-t border-slate-200` on the footer zone div that contains "Отправьте заказ..." text.

### НЕ должно быть
- Conditional logic based on number of items.
- Changing the submit button itself.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: `"Новый заказ"` or `new_order` section rendering at ~lines 948–984.
Search for: `"Отправьте заказ"` or `tr('cart.send_hint'` for footer zone.

### Проверка
Add 1 item to cart → open CartView → "Новый заказ" card has visible bottom margin, footer has top border line.

---

## Fix 4 — CV-UX (P3) [MUST-FIX]: Reduce gap between bucket header and its items

### Сейчас
When a bucket is expanded, the content area uses `p-3` inside `<CardContent>` which creates a 12px top gap between the header row and the first order item — feels too loose.

### Должно быть
Change the bucket content padding from `p-3` to `pt-2 px-3 pb-3` so the gap from header to first item is reduced (8px instead of 12px).
Side padding and bottom padding stay the same.

### НЕ должно быть
- Changing the header button area padding.
- Affecting the "Новый заказ" section (separate component).

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: the `<div>` or wrapping element that contains `{renderBucketOrders(...)}` inside the expanded bucket — at ~lines 509–591.
Change outer wrapper padding to `pt-2 px-3 pb-3`.

### Проверка
Expand a bucket → first order item appears slightly closer to the header vs before.

---

## Fix 5 — CV-05 (P3) [MUST-FIX]: accent-chip "all rated" — replace ✅ emoji with text "Оценено"

### Сейчас
When all served orders are rated (`allServedRated`), a `✅` emoji character is shown next to the "Подано" bucket header. It visually looks like a leftover emoji.
Location: `pages/PublicMenu/CartView.jsx` ~line 885 — `<span className="ml-1 text-xs text-green-600">✅</span>` (approximately).

### Должно быть
Replace the ✅ emoji span with a text chip: `<span className="ml-1 text-xs text-green-600 font-medium">Оценено</span>` (or use i18n key `tr('review.all_rated', 'Оценено')`).

### НЕ должно быть
- Removing the "Оценить" button that appears when NOT all are rated.
- Adding any new emoji.

### Файл и локация
File: `pages/PublicMenu/CartView.jsx`
Search for: `allServedRated` at ~lines 875–895.
Change: emoji `✅` span → text "Оценено" span.

### Проверка
Rate all dishes in served orders → "Подано" header shows text "Оценено" instead of ✅.

---

## Fix 6 — PM-162 (P2) [MUST-FIX]: formatPrice() on discounted price in MenuView tile and list card

### Сейчас
Discounted price in MenuView tile and list card shows without decimal places: `50` instead of `50.27`.
Root cause: discounted price is computed as `parseFloat((price * (1 - discount/100)).toFixed(2))` which correctly gives `50.27` — but it is then rendered WITHOUT passing through `formatPrice()`. JavaScript number `50.00` becomes string "50", `50.10` becomes "50.1".

### Должно быть
Discounted price must be wrapped in `formatPrice()` exactly like the original price is displayed nearby.
Formula: `formatPrice(parseFloat((dish.price * (1 - partner.discount_percent / 100)).toFixed(2)))`

### НЕ должно быть
- Using `Math.round` — it creates different format artifacts (PM-155 lesson).
- Changing the ORIGINAL (non-discounted) price display.
- Applying discount when `partner.discount_enabled !== true`.

### Файл и локация
File: `pages/PublicMenu/MenuView.jsx`
- Tile (~line 281): find where discounted price is rendered in tile mode. Search: `discount_percent` or `discounted` near `dish.price` in tile section.
- List card (~line 103): find where discounted price is rendered in list mode. Search: `discount_percent` or `discountedPrice` near list card price display.
Apply `formatPrice(parseFloat((...).toFixed(2)))` pattern to both locations.
Ref: DECISIONS_INDEX.md §3 — `parseFloat((price * (1 - discount/100)).toFixed(2))` is the confirmed formula.

### Проверка
1. Open menu with discount enabled (partner.discount_enabled = true).
2. Steak price 55.86₸ with 10% discount → shows `50.27 ₸` (not `50` or `50.2699...`).
3. Price 32.01₸ with 10% discount → shows `28.81 ₸` (not `28.809`).

---

## Fix 7 — PM-162 (P2) [MUST-FIX]: formatPrice() on discounted price in x.jsx detail card

### Сейчас
Detail card (БКБ — big dish card, opened on tap) likely shows same PM-162 bug: discounted price without formatPrice().
Previous PM-155 fix (ССП commit df5df03) added `parseFloat(toFixed(2))` in 3 places including x.jsx ~line 3894. Verify if formatPrice() is actually applied there too.

### Должно быть
In x.jsx detail card price display: discounted price wrapped in `formatPrice(parseFloat((...).toFixed(2)))`.
If the fix from PM-155 already uses formatPrice there — verify and leave it. If not — apply same pattern as Fix 6.

### НЕ должно быть
- Changing the original price display in detail card.
- Adding formatPrice where it is already applied (avoid double-wrapping).

### Файл и локация
File: `pages/PublicMenu/x.jsx`
Search: `discount_percent` or `discountedPrice` or `parseFloat` near `3894` in detail card section.
NOTE: x.jsx contains BOM/null-byte — use `grep -a` flag when searching (PQ-029).

### Уже пробовали
PM-155 fix (ССП commit df5df03, S186): added `parseFloat(toFixed(2))` in 3 places in x.jsx + MenuView.jsx. PM-162 is the same pattern — formatPrice was missing from discounted price render. Check if x.jsx ~3894 also needs formatPrice wrapper.

### Проверка
Tap a dish in menu with discount → detail card shows discounted price with 2 decimal places (e.g. `50.27 ₸`).

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Modify ONLY the code described in Fix 1–7 sections.
- DO NOT change anything else: layout, colors, navigation, state logic, polling, API calls.
- DO NOT touch: Checkout flow, StickyCartBar, ModeTabs, help drawer, loyalty logic beyond banner placement.
- FROZEN UX (confirmed working — DO NOT change):
  - PM-160 ✅: expandedStatuses auto-collapse useEffect when cart.length > 0
  - PM-161 ✅: p-4→p-3 on header card and section headers
  - CV-28 ✅: flat dish list, grouping of identical dishes
  - CV-29 ✅: no dividers between bucket rows
  - CV-30 ✅: «N заказа · X ₸» in drawer header
  - CV-31 ✅: «Стол 1 · Tulip ›» table display
  - PM-153 fallback ✅: guest name from localStorage
  - PM-156 ✅: no duplicate bell icon
  - bucket labels without emoji (Batch 6) ✅

## Implementation Notes

- Files: `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/x.jsx`
- NOTE: x.jsx has BOM/null-byte — use `grep -a` for any searches (PQ-029)
- Do NOT break: CartView drawer open/close, order submission flow, stepper +/− in cart, StickyCartBar
- Ref: BUGS_MASTER.md, DECISIONS_INDEX.md §3 (discount formula)
- git add pages/PublicMenu/CartView.jsx pages/PublicMenu/MenuView.jsx pages/PublicMenu/x.jsx
- git commit after all fixes

## DESIGN SYSTEM — ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА

Это приложение QR-меню для ресторанов. Все стили должны соответствовать дизайн-системе ниже.

### CSS Variables (использовать ВМЕСТО стандартных Tailwind цветов)
--color-primary: #B5543A (terracotta — CTA, ссылки, активные табы, кнопка "+", selected state)
--color-success: #22c55e (confirmed, served, paid)
--color-sent: #f59e0b (отправлено, ожидание)
--color-preparing: #3b82f6 (готовится)

### ЗАПРЕЩЕНО
- ❌ bg-indigo-*, bg-purple-*, bg-violet-* — НИКОГДА
- ❌ bg-blue-600 для CTA

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close/submit button
- [ ] No duplicate visual indicators
- [ ] Text truncation: long item names don't overflow

## Regression Check (MANDATORY after implementation)
Verify these existing features still work after changes:
- [ ] CartView drawer opens and closes correctly (ChevronDown button)
- [ ] Order submission: "Отправить официанту" button sends order
- [ ] Bucket expand/collapse toggles correctly (all buckets)
- [ ] Stepper +/− works in "Новый заказ" section
- [ ] StickyCartBar shows correct total (not affected by MenuView discount fix)
- [ ] Discount display in MenuView: original price shows strikethrough, discounted price shows primary color

## E3. FROZEN UX grep verification (run before commit)
```bash
grep -an "expandedStatuses" pages/PublicMenu/CartView.jsx | grep "useEffect" | wc -l  # should be >= 1
grep -an "p-3" pages/PublicMenu/CartView.jsx | grep "CardContent" | wc -l  # should be 0 (all changed to px-3 py-2)
grep -an "discount_enabled" pages/PublicMenu/MenuView.jsx | wc -l  # should be >= 1 (guard still present)
```
=== END ===


## Status
Running...
