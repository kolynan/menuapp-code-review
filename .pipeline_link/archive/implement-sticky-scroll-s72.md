---
task_id: implement-sticky-scroll-s72
type: implementation
priority: high
created: 2026-03-03
session: S72
budget: 12.00
---

# Task: Sticky Buttons + Auto-Scroll in PublicMenu (S72)

## Context

Follow-up to dish cards redesign (implement-dish-cards-s72). These are UX polish improvements for the PublicMenu guest experience: sticky CTAs and scroll-to-context after actions.

**Read first:**
- `ux-concepts/public-menu.md` — UX philosophy, key principles
- `outputs/Design_OrderTabs_S72.md` — drawer section order (relevant for scroll targets)

**Git:** Start with `git add . && git commit -m "S72 pre-sticky-scroll snapshot" && git push`

---

## Change 1: Sticky Buttons Audit & Fix

Check and fix the following CTAs — each must be sticky (always visible, not scrolled away):

### 1a. "Отправить заказ" in CheckoutView
- Verify the green "Отправить заказ" button is sticky (position: sticky or fixed at bottom) when the order list is long (many items).
- If not sticky: wrap the button in a sticky footer container pinned to bottom of the checkout view.
- Pattern: `sticky bottom-0 bg-white border-t border-slate-200 p-4`

### 1b. CTA in bottom drawer (CartView / order drawer)
- The "Оформить заказ" / "Отправить" button inside the drawer must be sticky at the bottom of the drawer, not scroll away when the drawer content is tall.
- The drawer should have `overflow-y-auto` on the scrollable content area, with the CTA outside/below that scroll container.

### 1c. StickyCartBar — already sticky ✅
- Do NOT change. This is working correctly.

---

## Change 2: Auto-Scroll on User Actions

Implement smooth scroll (`behavior: 'smooth'`) to the right element after each action:

### 2a. "Оформить заказ" tapped → scroll to top of CheckoutView
- When user opens checkout, scroll `window.scrollTo({ top: 0, behavior: 'smooth' })` or scroll checkout container to top.

### 2b. Form validation error → scroll to first error field
- When form submit fails (phone/name missing), scroll to the first field with error state.
- Use `element.scrollIntoView({ behavior: 'smooth', block: 'center' })`.

### 2c. Order submitted successfully → scroll to confirmation/status area
- After successful order send, scroll to OrderConfirmationScreen or status indicator.
- Already partially handled by screen transition — verify it feels right, adjust if needed.

### 2d. Item added to cart (tile view) → NO extra scroll needed
- StickyCartBar already animates/highlights. Do not add scroll. This would conflict with browsing.

---

## Rules

- Use `scrollIntoView` with `behavior: 'smooth'` — not instant jumps.
- Do NOT add scroll on every state change — only on deliberate user actions (taps/submits).
- Mobile-first: test logic with mobile viewport in mind (320-390px width).
- Codex must review Change 2 (scroll logic can have edge cases).

---

## Required Output

### Deliverable 1: RELEASE file
`menuapp-code-review/pages/PublicMenu/260303-NN x RELEASE.jsx` (increment from dish cards release)

### Deliverable 2: Update base/
Copy to `pages/PublicMenu/base/x.jsx`

### Deliverable 3: Update README
Add UX changelog entry for sticky + scroll improvements.
