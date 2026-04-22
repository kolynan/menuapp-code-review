---
chain: publicmenu-260323-140917-fd04
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260323-140917-fd04
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260323-140917-fd04-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260323-140917-fd04-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260323-140917-fd04-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260323-140917-fd04

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
# Bugfix Batch 6: PublicMenu — regression + toast + dish detail + UI polish

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.
UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`
- `pages/PublicMenu/MenuView.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/CheckoutView.jsx`

---

## Fix 1 — PM-107 (P1) [MUST-FIX]: Programmatic BS close collapses entire sheet stack (regression from КС-4)

### Сейчас (текущее поведение)
КС-4 (chain publicmenu-260323-124313-bcbe) added stack-based history management to x.jsx. Each sheet open calls `pushOverlay(name)` which calls `history.pushState(...)`. Each sheet close was wired to call `history.back()`.

**Regression found on Android:**
1. Open order list (bottom sheet)
2. Inside order list, tap "Enter table code" → table code verification BS opens on top
3. Swipe down on table code BS (OR tap × close button) → programmatic close
4. **BUG:** Both the table code BS AND the order list close at the same time. Only the main menu remains.

Expected: only the table code BS closes; the order list stays open underneath.

### Должно быть (ожидаемое поведение)
- **Hardware Android "Back" button** → calls `history.back()` → `popstate` fires → closes topmost sheet only. ✅ This works correctly already.
- **Programmatic close** (swipe down, × button, tap overlay) → calls only `setState(false)` for the relevant sheet. Does NOT call `history.back()`.
- When a sheet is closed programmatically, it must also remove its history entry: call `history.back()` silently OR use `history.replaceState` to pop without triggering popstate.

Correct pattern:
```
Sheet opens → pushOverlay('tableCode') → history.pushState({sheet:'tableCode'}, '')
User swipes/taps × → setShowTableCodeSheet(false) + history.back() [without re-triggering popstate listener]
Hardware Back → popstate fires → setShowTableCodeSheet(false) [listener already handles it]
```
The key: `history.back()` called on programmatic close should NOT cause the popstate listener to fire again (use a flag/ref like `isProgrammaticBack = true` to skip the listener on that specific back).

### НЕ должно быть (анти-паттерны)
- Do NOT remove pushOverlay/popOverlay — keep the stack logic.
- Do NOT break the hardware back button behavior (it must still close topmost sheet only).
- Do NOT call `history.back()` in a way that cascades and closes multiple sheets.
- Do NOT remove the popstate listener.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for: `pushOverlay` and `popOverlay` — these were added in КС-4 (commit 4da1dc4)
- Search for: `popstate` — the listener added in КС-4
- Search for: `setShowTableCodeSheet` — the table code sheet close handler
- Search for: `overlayStackRef` — the stack ref from КС-4

### Уже пробовали
КС-4 (chain publicmenu-260323-124313-bcbe, commit 4da1dc4): implemented stack-based history. Hardware back ✅ fixed. But programmatic close still calls history.back() and collapses all stacked sheets. This is the specific regression to fix.

### Проверка (мини тест-кейс)
1. Open order list → open table code BS → swipe down on table code BS → only table code closes, order list stays open. ✅
2. Open order list → press hardware Android Back → only order list closes. ✅
3. No infinite loops, no frozen state.

---

## Fix 2 — PM-103 (P2) [MUST-FIX]: Toast shows as thin line on Android (not working after КС-5 fix attempt)

### Сейчас (текущее поведение)
Adding a dish to cart on Android shows a thin line/bar instead of a proper toast notification. КС-5 (chain publicmenu-260323-125539-3bf4, commit c152dc7) attempted to fix this by removing a duplicate sonner `<Toaster>`, but the issue persists on Android after deploy.

### Должно быть (ожидаемое поведение)
A proper toast notification appears when adding a dish:
- Visible text: "Добавлено в корзину" (or i18n key `menu.added_to_cart`)
- Position: top-center or bottom-center
- Duration: ~2 seconds
- Fully visible on 375px mobile viewport — NOT a thin line

### НЕ должно быть (анти-паттерны)
- Do NOT use `alert()`.
- Do NOT change when toast fires (only fix visual rendering).
- Do NOT add a third `<Toaster>` if one already exists — check existing implementation first.

### Файл и локация
`pages/PublicMenu/MenuView.jsx` and/or `pages/PublicMenu/x.jsx`
- Search for `toastVisible` in MenuView.jsx — custom state-based toast implementation was added in КС-3 (commit d633716)
- Search for `sonner` or `<Toaster` in x.jsx — checks for existing sonner setup
- The thin-line symptom likely means: toast container has `h-0` or `overflow-hidden` or `opacity-0` stuck. Or the `toastVisible` state triggers correctly but the toast div has wrong styling.
- If using a custom `toastVisible` boolean: ensure the toast div has explicit height, padding, z-index (e.g. `z-[200]`), and `fixed` positioning.

### Уже пробовали
КС-5 (chain publicmenu-260323-125539-3bf4): removed duplicate sonner Toaster — did NOT fix. The issue is in the custom `toastVisible` implementation in MenuView.jsx, not in sonner duplication.

### Проверка (мини тест-кейс)
1. Open menu on 375px Android Chrome → tap "+" on any dish → toast with text appears fully visible (not a line). ✅
2. Toast auto-dismisses after ~2 seconds. ✅

---

## Fix 3 — PM-102 (P2) [MUST-FIX]: Dish detail dialog — "Add to cart" button has no text

### Сейчас (текущее поведение)
КС-5 created a dish detail dialog that opens when tapping a dish card. The dialog shows: dish name, description, price. However, the "Add to cart" button is rendered as an empty colored bar — no text visible inside it.

### Должно быть (ожидаемое поведение)
The button must display readable text: "Добавить в корзину" (or i18n key `menu.add_to_cart` or `cart.add`).
The button should:
- Use `partner.primary_color` as background
- White text, properly readable
- Minimum 44px height (touch target)

### НЕ должно быть (анти-паттерны)
- Do NOT remove or replace the dialog — it opens correctly, only the button text is missing.
- Do NOT change the dish data shown in the dialog (name, description, price work fine).

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for the new DishDetailDialog or similar component added by КС-5 (commit c152dc7)
- Search for: `DishDetail` or `dishDetailOpen` or `selectedDish` — the dialog state
- Look for the `<Button` or `<button` inside the dialog — it likely has an empty children or the text is missing: `<Button style=...></Button>` → should be `<Button>Добавить в корзину</Button>`
- Also check: the button might render `{t('menu.add_to_cart')}` but the i18n key is missing — in that case add a fallback: `{t('menu.add_to_cart', 'Добавить в корзину')}`

### Проверка (мини тест-кейс)
1. Tap on a dish card (not on stepper) → dialog opens → button shows "Добавить в корзину" text. ✅
2. Tap button → dish added to cart + dialog closes. ✅

---

## Fix 4 — PM-108 (P2) [MUST-FIX]: "+" button clipped by card overflow in list-mode

### Сейчас (текущее поведение)
In list-mode, the "+" add-to-cart button (circular FAB at bottom-right of card) is cut off at the right edge. Only the left half of the circle is visible — the card's `overflow-hidden` clips it.

### Должно быть (ожидаемое поведение)
The "+" button is fully visible and tappable. It should sit at the bottom-right corner of the dish card, fully within the card bounds, OR the card overflow should allow it to show.

### НЕ должно быть (анти-паттерны)
- Do NOT move the "+" button to the center of the card.
- Do NOT remove `overflow-hidden` from the card if it clips the dish image — find a targeted fix.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `renderListCard` or the list-mode card component
- Look for the card wrapper that has `overflow-hidden` — the "+" button needs `overflow-visible` on its parent, or the button needs to be positioned inside the card bounds (e.g. `right-2 bottom-2` instead of `right-0 bottom-0` hanging outside)
- The "+" button was moved to bottom-right in PM-077 fix (КС-3, commit a4f4f4f) — check if the positioning is outside the card boundary

### Проверка (мини тест-кейс)
1. Open menu in list mode on 375px mobile → all "+" buttons fully visible as complete circles. ✅
2. Tap "+" → item added. ✅

---

## Fix 5 — PM-104 (P3) [NICE-TO-HAVE]: Chevron and gray separator line misaligned in cart drawer header

### Сейчас (текущее поведение)
The chevron (˅ icon, right-aligned) and the gray horizontal separator line in the cart drawer header are at slightly different vertical positions — they appear visually misaligned.

### Должно быть (ожидаемое поведение)
The header area should look clean: either chevron and separator are on the same horizontal level, or there is intentional visual separation between them.

### НЕ должно быть (анти-паттерны)
- Do NOT remove the chevron or the separator.
- Do NOT change drawer close behavior.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for `ChevronDown` in x.jsx — near the cart drawer / sheet header
- The fix is likely adjusting `margin-top` or `padding` on either the chevron or the separator so they align properly
- NOTE: Do NOT look in CartView.jsx for this fix — CartView.jsx is NOT in the TARGET FILES list

### Проверка (мини тест-кейс)
1. Open cart drawer → header area looks visually clean and aligned. ✅

---

## Fix 6 — PM-096 (P2) [MUST-FIX]: Tile-mode stepper buttons below 44px touch target

### Сейчас (текущее поведение)
In tile (grid) mode, the stepper buttons − and + have `w-8 h-8` (32px), below the 44px minimum touch target for mobile.

### Должно быть (ожидаемое поведение)
Stepper buttons: minimum `w-11 h-11` (44px) or use padding to ensure 44px tap target.

### НЕ должно быть (анти-паттерны)
- Do NOT change list-mode stepper (already fixed in PM-092, commit d633716).
- Do NOT change the tile card layout or grid.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `renderTileCard` — tile-mode card renderer
- Look for stepper buttons with `w-8 h-8` → change to `w-11 h-11` (or add `min-w-[44px] min-h-[44px]`)

### Проверка (мини тест-кейс)
1. Open menu in tile mode → tap − / + buttons → easily tappable (no misses). ✅

---

## Fix 7 — PM-discount-check (P2) [MUST-FIX]: Discount badge shows when discount_enabled is false

### Сейчас (текущее поведение)
The discount badge (-5%, -X%) and strikethrough price are shown when `discount_percent > 0`, but the code does NOT check `partner.discount_enabled`. So even if a partner has disabled their discount, the badge still shows.

### Должно быть (ожидаемое поведение)
Discount badge and strikethrough price ONLY shown when BOTH conditions are true:
1. `partner.discount_enabled === true`
2. `partner.discount_percent > 0`

### НЕ должно быть (анти-паттерны)
- Do NOT change the discount calculation logic.
- Do NOT change the visual styling of the badge when it IS shown.

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for `discount_percent` — find all places where discount badge/strikethrough is rendered
- Add guard: `partner.discount_enabled && partner.discount_percent > 0` before rendering discount UI
- Check both `renderListCard` and `renderTileCard`

### Проверка (мини тест-кейс)
1. Partner has `discount_enabled: false`, `discount_percent: 5` → no badge shown. ✅
2. Partner has `discount_enabled: true`, `discount_percent: 5` → badge "-5%" shown. ✅

---

## Fix 8 — #84b (P2) [MUST-FIX]: Discount badge uses hardcoded color instead of partner.discount_color

### Сейчас (текущее поведение)
The discount badge (-X%) uses a hardcoded color (red `#C92A2A` or `bg-red-600`). The Partner entity has a `discount_color` field that should control this color, but it is not being used.

### Должно быть (ожидаемое поведение)
The discount badge background color reads from `partner.discount_color`.
Fallback if `discount_color` is null/undefined: use `#C92A2A`.

### НЕ должно быть (анти-паттерны)
- Do NOT change the discount badge shape, size, or position.
- Do NOT change the badge text color (white stays white).

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for the discount badge element — likely near `discount_percent` rendering
- Replace hardcoded color class (e.g. `bg-red-600`) with inline style: `style={{ backgroundColor: partner.discount_color || '#C92A2A' }}`

### Проверка (мини тест-кейс)
1. Partner has `discount_color: '#4CAF50'` → badge shows with green background. ✅
2. Partner has `discount_color: null` → badge shows with default `#C92A2A`. ✅

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/x.jsx` and `pages/PublicMenu/MenuView.jsx`
- Do NOT touch: CartView.jsx, CheckoutView.jsx, useTableSession.jsx, ModeTabs.jsx, StickyCartBar.jsx
- Do NOT fix bugs outside the 8 Fix sections above.
- Do NOT change business logic, navigation, data flow, or any other state management.
- UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md` — do NOT change locked decisions.
- Extra findings = task FAILURE.

## Implementation Notes
- Files: `pages/PublicMenu/x.jsx` (~3500 lines), `pages/PublicMenu/MenuView.jsx` (~400 lines)
- Priority order: Fix 1 (P1) → Fix 2, 3, 4 (P2) → Fix 5 (P3, NICE-TO-HAVE)
- НЕ ломать: PM-105 back button stack (КС-4, commit 4da1dc4), PM-106 tile price (КС-5, commit c152dc7), PM-063 stepper −/+, PM-064 table code BS
- git add pages/PublicMenu/x.jsx pages/PublicMenu/MenuView.jsx && git commit -m "fix: batch 6 — PM-107 regression, toast, dish detail button, list+ clip, stepper, discount" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] PM-107: programmatic BS close → only that sheet closes, underlying sheet stays open
- [ ] PM-103: toast fully visible with readable text (not a thin line)
- [ ] PM-102: dish detail dialog button shows "Добавить в корзину" text
- [ ] PM-108: "+" button in list mode fully visible (not clipped)
- [ ] PM-096: tile stepper buttons >= 44px tap target
- [ ] Touch targets >= 44x44px
- [ ] No regressions in back button behavior (PM-105)
=== END ===
