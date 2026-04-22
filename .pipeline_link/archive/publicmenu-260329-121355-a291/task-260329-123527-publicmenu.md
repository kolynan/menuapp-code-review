---
task_id: task-260329-123527-publicmenu
status: running
started: 2026-03-29T12:35:36+05:00
type: chain-step
page: PublicMenu
work_dir: C:/Dev/menuapp-code-review
budget_usd: 6.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260329-123527-publicmenu

## Config
- Budget: $6.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: publicmenu-260329-121355-a291
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260329-121355-a291
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260329-121355-a291-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260329-121355-a291-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260329-121355-a291-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260329-121355-a291

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
# UX Batch 4: Floating Point, Confirmation Screen Cleanup, Whitespace, Line-Clamp, StickyCartBar Visual (#185)

Reference: `BUGS_MASTER.md`, `ux-concepts/cart-view.md`, `DECISIONS_INDEX.md §2`.
Production page. App URL: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** MenuApp — QR-menu and table ordering system for restaurants. Primary usage: customer phone at the table (mobile-first). This batch fixes 5 issues across 4 files in PublicMenu. All fixes are independent of each other.

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/StickyCartBar.jsx`

CONTEXT FILES (read-only, for reference):
- `pages/PublicMenu/useTableSession.jsx`

---

## Fix 1 — PM-157 (P1) [MUST-FIX]: Floating point in StickyCartBar "МОЙ СЧЁТ" amount

### Current behavior
When the guest has submitted orders, StickyCartBar shows "МОЙ СЧЁТ" mode with total like `189.039999...₸` (raw JS float). Affects both `myBill.total` and `tableTotal` display in the sticky bar.

### Expected behavior
All monetary amounts in StickyCartBar must display with exactly 2 decimal places: `189.04₸`.
Same fix as PM-155 (discount prices) and PM-151 (confirmation screen) — apply `parseFloat(value.toFixed(2))` before passing to `formatPrice()`.

### Must NOT be
- Do NOT change any StickyCartBar layout, text modes, or visibility logic.
- Do NOT change `formatPrice()` function itself.

### File and location
File: `pages/PublicMenu/x.jsx`
Look for: `const hallStickyBillTotal =` (around line 2283)
Current code:
```
const hallStickyBillTotal =
  hallStickyMode === "myBill"
    ? formatPrice(myBill.total)
    : hallStickyMode === "tableOrders"
      ? formatPrice(tableTotal)
      : "";
```
Fix: wrap each value with `parseFloat((value || 0).toFixed(2))` before `formatPrice`:
```
const hallStickyBillTotal =
  hallStickyMode === "myBill"
    ? formatPrice(parseFloat((myBill.total || 0).toFixed(2)))
    : hallStickyMode === "tableOrders"
      ? formatPrice(parseFloat((tableTotal || 0).toFixed(2)))
      : "";
```

### Verification
1. Add 2 dishes to cart → submit order → StickyCartBar shows "МОЙ СЧЁТ" mode.
2. The amount must show clean price like `189.04₸`, NOT `189.039999...₸`.

---

## Fix 2 — #197 (P2) [MUST-FIX]: OrderConfirmationScreen — remove "Ваш заказ" header and guest label

### Current behavior
After submitting an order, the `OrderConfirmationScreen` shows:
- A header text "Ваш заказ" above the list of items (line ~702-704)
- A line "Гость: Гость 1" below the items list (lines ~737-741)

Both are redundant: the items list is self-evident, and the guest already knows their own name.

### Expected behavior
- Remove the `<p>` tag containing `{tr("confirmation.your_order", "Ваш заказ")}` — the items list remains, just without the header label.
- Remove the `{guestLabel && (...)}` block that renders "Гость: [name]".
- Keep everything else: items list, total ("Итого"), buttons ("Вернуться в меню", "Мои заказы").

### Must NOT be
- Do NOT remove the items list or the total.
- Do NOT remove `clientName` display for pickup/delivery mode (only remove `guestLabel` display).
- Do NOT change button labels or order.

### File and location
File: `pages/PublicMenu/x.jsx`, function `OrderConfirmationScreen`

Remove line ~702-704 (`<p>` with `confirmation.your_order`):
```jsx
<p className="text-sm font-medium text-slate-600 mb-3">
  {tr("confirmation.your_order", "Ваш заказ")}
</p>
```

Remove lines ~737-741 (guestLabel block):
```jsx
{guestLabel && (
  <p className="text-sm text-slate-500 mt-3">
    {tr("confirmation.guest_label", "Гость")}: {guestLabel}
  </p>
)}
```

### Verification
1. Add items, submit order → confirmation screen appears.
2. Screen shows: checkmark animation → "Заказ отправлен!" → list of items → "Итого: X ₸" → buttons.
3. NO "Ваш заказ" header. NO "Гость: Гость 1" line.

---

## Fix 3 — PM-159 (P3) [NICE-TO-HAVE]: Extra whitespace between "Новый заказ" card and "Отправить" button (1 item in cart)

### Current behavior
When there is exactly 1 item in the cart ("Новый заказ" section), there is visible extra whitespace between the bottom of the item card and the "Отправить официанту" submit button. With 2+ items this gap looks normal.

### Expected behavior
The gap between the "Новый заказ" card and the submit button should be consistent regardless of item count (1 item or many). The button should sit close to the card content without excessive empty space.

### Must NOT be
- Do NOT change item display, stepper buttons, or submit button logic.
- Do NOT affect layout when 2+ items are in cart.

### File and location
File: `pages/PublicMenu/CartView.jsx` (~1063 lines)
Search for: `new_order` to find the "Новый заказ" bucket section, then look for the submit button container nearby. Also search for `renderBucketOrders` to find the rendering function. The whitespace is likely in the `mb-` or `py-` padding on the Card or container wrapping the new_order section, or the gap between card and submit button in the outer flex layout.
If a clean fix is not obvious without introducing conditional layout logic, SKIP this fix (it is [NICE-TO-HAVE]).

### Verification
1. Add exactly 1 item to cart → open CartView drawer.
2. The "Новый заказ" card shows close to "Отправить официанту" button without large gap.

---

## Fix 4 — #193 (P2) [MUST-FIX]: MenuView list-mode — revert description to line-clamp-1

### Current behavior
In list-mode dish cards, both dish name and description each show up to 2 lines (line-clamp-2). On real restaurant data with long names and descriptions, this makes cards very tall and the dish photo is no longer vertically centered.

### Expected behavior
Both dish name AND description in list-mode cards: `line-clamp-1` (1 line each, with `...` truncation if too long).
Full text is always visible when the user opens the detail card (drawer). Pattern: Wolt, Uber Eats — list cards are compact, details in the modal.

### Must NOT be
- Do NOT change tile-mode cards (only list-mode).
- Do NOT change the detail card/drawer.
- Do NOT change stepper buttons or any other list card element.

### Intentional change note
Fix PM-147 (S186) previously changed description from line-clamp-1 → line-clamp-2. This fix intentionally REVERTS the description back to line-clamp-1. This is a design decision, not a regression.

### File and location
File: `pages/PublicMenu/MenuView.jsx`, function `renderListCard`
Look for: dish name className with `line-clamp-` and description className with `line-clamp-`.
Change: Both `line-clamp-2` occurrences in list-mode → `line-clamp-1`.

### Verification
1. Open menu in list-mode (Wolt-style cards with photo on right).
2. Each card shows dish name (1 line max, truncated) + description (1 line max, truncated).
3. Cards are compact, photo is vertically centered.

---

## Fix 5 — #144 (P3) [NICE-TO-HAVE]: StickyCartBar visual redesign — Uber Eats style

### Current behavior
StickyCartBar shows items count + text + price in separate visual elements. The panel may not be fully tappable as a single unit.

### Expected behavior
The entire StickyCartBar panel = one tappable button (whole area is clickable, opens CartView drawer).
Layout (single row): `[ ⑥ badge ] [ Оформить заказ — centered ]  [ 14 497 ₸ → ]`
- Left: circular badge with item count (quantity, not SKUs)
- Center: "Оформить заказ" (or equivalent text label from current props)
- Right: formatted price + "→" or "›" chevron
- If price text is very long: "Оформить заказ" text compresses (truncates), price NEVER gets cut off

### Must NOT be
- Do NOT add separate icon + two-row text layout. Single row only.
- Do NOT change the EXISTING state logic (myBill, tableOrders, draft modes). Only change the visual layout.
- Do NOT remove or change the click handler — just ensure the WHOLE panel area triggers the same onClick.
- Do NOT change when the panel is visible/hidden (visibility logic stays the same).
- Do NOT use ALL CAPS for button text.

### File and location
File: `pages/PublicMenu/StickyCartBar.jsx`
The component receives `cartTotalItems`, `formattedCartTotal`, `formattedBillTotal`, `showBillAmount`, `isLoadingBill` as props.
Keep existing props, redesign only the render/layout.

If the redesign requires changes to click handler wiring in `x.jsx` (e.g., passing `onClick` prop), make minimal changes to `x.jsx` as well.

### Verification
1. Add 2 dishes to cart → StickyCartBar appears at bottom.
2. Shows: circular badge with "2" + centered label + price on right — all in one row.
3. Tapping ANYWHERE on the bar (not just a button) opens CartView drawer.

---

## ⛔ SCOPE LOCK — change ONLY what is described in Fix sections above

- Modify ONLY the code described in Fix 1–5.
- Do NOT touch any other logic, layout, UX behavior, or code outside the Fix scope.
- If you see a potential problem NOT listed here → skip it, do not fix it.
- NEVER apply code changes from memory of previous tasks — only from this task description.
- Fix 3 and Fix 5 are [NICE-TO-HAVE]: if they conflict with other fixes or risk regression, skip them and note in the report.

## FROZEN UX — DO NOT CHANGE these confirmed features

The following features are tested and confirmed working on Android. Do NOT modify:
- StickyCartBar 3 text modes: draft ("КОРЗИНА: N ПОЗИЦИЙ"), visit ("МОЙ СЧЁТ"), closed ("ВАШИ ЗАКАЗЫ") — PM-059/060/065/066 ✅
- CartView section order: Подано (top) → Заказано → Новый заказ (bottom) — PM-144/CV-01 ✅
- CartView date filter: only today's orders (06:00 business-day cutoff) — PM-154 ✅
- CartView floating point total — PM-145 ✅
- Guest name display (no "#1313" suffix) — PM-149 ✅
- Confirmation screen total formatting (`parseFloat(...toFixed(2))`) — PM-151 ✅
- Discount price formatting in MenuView — PM-155 ✅
- Stepper buttons size w-11 h-11 in list-mode — PM-132 ✅

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: customer phone at the table.
Before committing, verify ALL changes at 375px viewport width:
- [ ] Close/chevron buttons: RIGHT-ALIGNED (not centered), sticky top
- [ ] Touch targets ≥ 44×44px (h-11 w-11)
- [ ] No excessive whitespace/gaps on small screens
- [ ] Bottom sheet content scrollable without losing close/submit button
- [ ] No duplicate visual indicators (e.g. two gray lines that look the same)
- [ ] Text truncation: long item names don't overflow
- [ ] Sticky footer buttons don't overlap content

## Regression Check (MANDATORY after implementation)
After all fixes are applied, verify these EXISTING features still work correctly:
- [ ] StickyCartBar shows correct text in all 3 modes: draft ("КОРЗИНА: N ПОЗИЦИЙ"), visit ("МОЙ СЧЁТ / price"), closed ("ВАШИ ЗАКАЗЫ / Посмотреть")
- [ ] CartView drawer sections display in correct order: Подано (top) → Заказано → Новый заказ (bottom) with submit button
- [ ] OrderConfirmationScreen still shows: checkmark + "Заказ отправлен!" + items list + "Итого" + two buttons ("Вернуться в меню", "Мои заказы")
- [ ] MenuView list-mode shows dish photo on right + name + description (both 1 line, truncated) with stepper buttons
- [ ] Discount prices in MenuView show clean 2-decimal format (not 30.4094...)

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/x.jsx`, `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/StickyCartBar.jsx`
- CONTEXT FILES (read-only): `pages/PublicMenu/useTableSession.jsx`
- Do NOT break: PM-059 (StickyCartBar modes), PM-144 (CartView sections), PM-154 (date filter), PM-155 (discount prices)
- FROZEN UX grep verification before commit:
  ```
  grep -n "hallStickyMode\|hallStickyBillTotal" pages/PublicMenu/x.jsx | head -10
  grep -n "todayMyOrders\|cutoffDay\|cutoffDate" pages/PublicMenu/CartView.jsx | head -5
  grep -n "line-clamp" pages/PublicMenu/MenuView.jsx
  ```
- git add pages/PublicMenu/x.jsx pages/PublicMenu/CartView.jsx pages/PublicMenu/MenuView.jsx pages/PublicMenu/StickyCartBar.jsx && git commit -m "fix: batch 4 — floating point, confirmation cleanup, line-clamp, StickyCartBar visual" && git push
=== END ===


## Status
Running...
