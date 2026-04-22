---
chain: publicmenu-260323-125539-3bf4
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260323-125539-3bf4
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260323-125539-3bf4-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/publicmenu-260323-125539-3bf4-codex-findings.md
   - If NOT found there, search in pages/PublicMenu/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260323-125539-3bf4-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260323-125539-3bf4

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
# Bugfix: PublicMenu UI fixes — dish card, toast, tile price, chevron (PM-102, PM-103, PM-106, PM-104)

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.
UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

**Context:** Four UI bugs found during Android mobile testing in S165. Mix of M and L weight fixes across MenuView.jsx and x.jsx.

TARGET FILES (modify):
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/x.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/CheckoutView.jsx`

---

## Fix 1 — PM-102 (P2) [MUST-FIX]: Tapping dish card does not open dish detail

### Сейчас (текущее поведение)
On Android (Chrome), tapping on a dish card in list-mode does nothing. The dish detail view/modal/drawer does NOT open. The user cannot see dish description, reviews, or modifiers.

### Должно быть (ожидаемое поведение)
Tapping anywhere on a dish card (except the +/- stepper buttons) should open the dish detail view.
The dish detail view should show: full image, name, description, price, reviews (if enabled), and an "Add to cart" button.

### НЕ должно быть (анти-паттерны)
- Do NOT change the stepper (+/-) button click behavior — tapping +/- should still add/remove items, NOT open detail.
- Do NOT change the card layout or CSS.
- Do NOT remove `onClick` handlers from stepper buttons.

### Файл и локация
`pages/PublicMenu/MenuView.jsx` — Look for the card component's `onClick` handler.
- In list-mode: search for the card wrapper `<div` or `<Card` that renders each dish. Check if it has an `onClick` prop.
- If `onClick` exists but is not firing: check if `e.stopPropagation()` on inner buttons prevents the parent click from reaching the card.
- If `onClick` does NOT exist: add one that calls the dish detail open function (likely passed as a prop from x.jsx, e.g. `onDishClick`, `onSelectDish`, or `setSelectedDish`).
- Also check tile-mode card for the same issue.

### Проверка (мини тест-кейс)
1. Tap on dish card area (not on +/- buttons) → dish detail opens.
2. Tap on +/- buttons → item added/removed (detail does NOT open).
3. Works in both list and tile mode.

---

## Fix 2 — PM-103 (P2) [MUST-FIX]: Toast shows as thin line instead of proper notification

### Сейчас (текущее поведение)
When adding a dish to cart on Android mobile, instead of showing a proper toast notification ("Добавлено в корзину"), a small thick line/bar briefly appears on screen. The toast text is either invisible or has 0 height.

### Должно быть (ожидаемое поведение)
A proper toast notification appears when a dish is added to cart:
- Text: "Добавлено в корзину" (or i18n equivalent)
- Position: top-center or bottom-center
- Duration: ~2 seconds
- Styling: readable text, proper padding, distinct background (e.g. dark bg, white text)
- Must be visible on 375px mobile viewport

### НЕ должно быть (анти-паттерны)
- Do NOT use `alert()` or any blocking notification.
- Do NOT change the toast trigger logic (when it shows) — only fix the visual rendering.
- Do NOT add a new toast library if one already exists (check for existing toast/Toaster component).

### Файл и локация
`pages/PublicMenu/x.jsx` or `pages/PublicMenu/MenuView.jsx`
- Search for: `toast(` or `useToast` or `Toaster` or `sonner` to find the toast implementation.
- Search for: `Добавлено` or `added_to_cart` or `cart.added` to find the toast message.
- The issue is likely: (a) toast container has `overflow: hidden` + tiny height, or (b) toast z-index is below other elements, or (c) toast component is missing proper styling on mobile.

### Проверка (мини тест-кейс)
1. Add dish to cart → toast appears with readable text.
2. Toast auto-dismisses after ~2 seconds.
3. Toast is fully visible (not a thin line) on 375px mobile viewport.

---

## Fix 3 — PM-106 (P2) [MUST-FIX]: Tile-mode discount price wraps to multiple lines

### Сейчас (текущее поведение)
In tile (grid) mode, when a dish has a discount, the price area breaks across multiple lines. Example for a dish priced 2400₸ with 5% off:
```
2       2
280     400
₸       ₸
```
The discounted price ("2 280 ₸") and original price ("2 400 ₸") wrap onto 3+ lines because the tile card is narrow (~180px on mobile).

### Должно быть (ожидаемое поведение)
Discount price in tile mode should display compactly on ONE or TWO lines max:
- **Option A (preferred):** Single line: `2 280 ₸  ~~2 400 ₸~~` — with smaller font if needed.
- **Option B:** Two lines: line 1 = `2 280 ₸` (bold, primary_color), line 2 = `~~2 400 ₸~~` (small, gray, strikethrough).

Key constraints:
- Font size can be reduced in tile mode (e.g. `text-sm` instead of `text-base`).
- Use `whitespace-nowrap` or `flex-nowrap` to prevent price value from breaking mid-number.
- The `₸` symbol must stay on the same line as the number.

### НЕ должно быть (анти-паттерны)
- Do NOT truncate the price (e.g. "2.2K ₸") — show exact number.
- Do NOT change list-mode price layout (it works correctly already).
- Do NOT change the discount calculation logic.
- Do NOT change `primary_color` or `discount_color` assignments (fixed in S165 KS-1, #84).

### Файл и локация
`pages/PublicMenu/MenuView.jsx`
- Search for the tile-mode card function: `renderTileCard` or similar (~lines 200-310).
- Inside it, find the price section with discount: look for `discount_percent` and `Math.round`.
- The issue is that the price `<span>` wraps. Fix by adding `whitespace-nowrap` class and ensuring the parent container uses `flex-wrap: nowrap` or similar.

### Проверка (мини тест-кейс)
1. Open menu in tile/grid mode with a partner that has discounts.
2. Price with discount fits on max 2 lines (no 3+ line wrapping).
3. The ₸ symbol stays on same line as the number.
4. Large prices (e.g. 12 500 ₸) still render without clipping.

---

## Fix 4 — PM-104 (P3) [NICE-TO-HAVE]: Chevron not aligned with gray separator line

### Сейчас (текущее поведение)
The chevron (˅ or drag handle indicator) at the top of the bottom sheet / cart drawer is visually not on the same horizontal line as the gray separator line. They appear at slightly different vertical positions, creating a misaligned appearance.

### Должно быть (ожидаемое поведение)
The chevron and any horizontal separator line should be vertically aligned or positioned consistently. If they serve different purposes, they should have clear visual separation rather than appearing almost-aligned-but-not-quite.

### НЕ должно быть (анти-паттерны)
- Do NOT remove the chevron or the separator line.
- Do NOT change the drag handle interaction behavior.

### Файл и локация
`pages/PublicMenu/x.jsx` or `pages/PublicMenu/CartView.jsx`
- Search for: `ChevronDown` or `chevron` or `drag-handle` near the bottom sheet / drawer header area.
- Search for: `border-t` or `border-b` or `<hr` near the same area.
- The fix is likely: adjust `margin-top`/`padding-top` on the chevron or the separator to align them.

### Проверка (мини тест-кейс)
1. Open cart/order sheet → chevron and gray line are visually aligned or clearly separated.
2. No visual "almost aligned" jitter.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/MenuView.jsx` and `pages/PublicMenu/x.jsx`
- Do NOT touch: CartView.jsx, CheckoutView.jsx, useTableSession.jsx
- Do NOT fix bugs outside the 4 Fix sections above.
- Do NOT change business logic, state management, navigation, or data flow.
- Do NOT change the history/popstate logic (being fixed separately in PM-105).
- Extra findings = task FAILURE.
- UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md` — do NOT change locked decisions.

## Implementation Notes
- Files: `pages/PublicMenu/MenuView.jsx`, `pages/PublicMenu/x.jsx`
- НЕ ломать: cart add/remove, stepper buttons, grid layout switching, PM-096 tile stepper fix (44px)
- git add pages/PublicMenu/MenuView.jsx pages/PublicMenu/x.jsx && git commit -m "fix: dish card detail, toast visibility, tile price layout, chevron alignment" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
- [ ] Dish card tap opens detail (both list and tile mode)
- [ ] Toast is fully visible with readable text at 375px
- [ ] Tile-mode discount price: max 2 lines, ₸ stays with number
- [ ] No visual regressions in list or tile mode
=== END ===
