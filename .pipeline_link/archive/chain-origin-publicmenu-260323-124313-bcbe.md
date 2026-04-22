---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 15
agent: cc+codex
chain_template: consensus-with-discussion
---

# Bugfix: Android back button — nested sheet priority (PM-105)

Reference: `BUGS_MASTER.md`, `menuapp-code-review/pages/PublicMenu/`.
UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md`.

**Production page** — `https://menu-app-mvp-49a4f5b2.base44.app/x?partner=69540a85f2492cff3e46a283&mode=hall&lang=RU`

**Context:** PM-S81-15 (Android back button) was partially fixed in a previous KS — `history.pushState` + `popstate` listener was added to x.jsx. The basic scenario works: pressing Android "Back" button from menu view goes back correctly instead of closing the browser.

**HOWEVER**, the fix does NOT handle nested overlapping sheets correctly. When multiple sheets are stacked (e.g. order list + table code input sheet), the back button closes them in the WRONG order.

TARGET FILES (modify):
- `pages/PublicMenu/x.jsx`

CONTEXT FILES (read-only, do NOT modify):
- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/MenuView.jsx`
- `pages/PublicMenu/CheckoutView.jsx`

---

## Fix 1 — PM-105 (P1) [MUST-FIX]: Android back button closes nested sheets in wrong order

### Сейчас (текущее поведение)
Reproduction on Android Chrome:
1. Open the public menu page
2. Add items to cart
3. Open the order list (bottom sheet / drawer)
4. While order list is open, tap on "enter table code" → table code input sheet opens ON TOP of order list
5. Press Android hardware "Back" button
6. **BUG:** The FIRST back press closes the ORDER LIST (bottom layer) instead of the TABLE CODE INPUT (top layer)
7. A SECOND back press is needed to close the table code input

### Должно быть (ожидаемое поведение)
Android "Back" button MUST always close the TOPMOST active sheet/overlay first:
1. If table code input sheet is open (on top of everything) → back closes table code input
2. If order list is open (no other sheet on top) → back closes order list
3. If cart drawer is open → back closes cart drawer
4. If only menu is visible → back navigates to browser history (or does nothing)

**Implementation pattern (LMP: stack-based history management):**
Each sheet/overlay push should add a unique state to `history.pushState`. The `popstate` listener should check which sheets are open and close the topmost one. Sheet priority stack (top to bottom):
- Table code verification sheet (highest priority)
- Checkout/order confirmation
- Order status screen
- Cart drawer / order list
- Menu (base level — no close action)

Each time a sheet opens: `history.pushState({ sheet: 'tableCode' }, '')`.
Each time a sheet closes programmatically: `history.back()` to pop the state.
On `popstate` event: check `event.state.sheet` and close the matching sheet.

### НЕ должно быть (анти-паттерны)
- Do NOT remove the existing popstate listener — refactor it to support the stack pattern.
- Do NOT break the basic scenario: menu → browser back still works.
- Do NOT use a single boolean flag. Use a STACK or ordered priority list of active sheets.
- Do NOT call `history.pushState` on every re-render — only on sheet OPEN.
- Do NOT duplicate state in both React state and history state — React state is the source of truth, history is just the trigger.

### Файл и локация
`pages/PublicMenu/x.jsx`
- Search for: `popstate` to find the existing listener (added by PM-S81-15 fix).
- Search for: `history.pushState` to find where history entries are pushed.
- Search for: `showTableCodeSheet` or `setShowTableCodeSheet` — table code BS state.
- Search for: `showOrderList` or similar — order list state.
- Search for: `showCart` or `isCartOpen` or similar — cart drawer state.
- The fix needs to identify ALL sheet/overlay state variables and build a priority-ordered close sequence.

### Проверка (мини тест-кейс)
1. Open menu → add dish → open order list → open table code input → press Back → table code input closes (order list stays open).
2. Press Back again → order list closes (menu stays).
3. Press Back again → standard browser back behavior.
4. Open cart drawer → press Back → cart closes.
5. NO regression: basic menu back still works (no infinite loops, no stuck state).

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Modify ONLY: `pages/PublicMenu/x.jsx`
- Modify ONLY the popstate/history logic and the sheet open/close handlers.
- Do NOT touch: CartView.jsx, MenuView.jsx, CheckoutView.jsx, useTableSession.jsx.
- Do NOT change any sheet visual design, layout, or CSS.
- Do NOT change any business logic (orders, cart, table verification).
- Do NOT fix other bugs. Extra findings = task FAILURE.
- UX Lock: `ux-concepts/UX_LOCKED_PublicMenu.md` — do NOT change locked decisions.

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (~3500 lines)
- НЕ ломать: existing PM-S81-15 basic back behavior, table verification flow, cart submit, order status
- This is an H-weight architectural fix: involves coordinating multiple sheet states with browser history API.
- git add pages/PublicMenu/x.jsx && git commit -m "fix: android back button nested sheet priority stack (PM-105)" && git push

## MOBILE-FIRST CHECK (MANDATORY before commit)
- [ ] Android back: closes topmost sheet first (table code > order list > cart > menu)
- [ ] No infinite history loops (pressing back many times eventually reaches browser default)
- [ ] Programmatic sheet close (X button, overlay tap) still works without history stack corruption
- [ ] No console errors on rapid back button presses
