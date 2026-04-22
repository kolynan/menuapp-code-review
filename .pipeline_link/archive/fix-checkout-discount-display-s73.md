---
task_id: fix-checkout-discount-display-s73
type: implementation
priority: P2
created: 2026-03-03
session: S73
budget: 10.00
---

# Task: Fix Checkout — Show Discount Breakdown (Pickup & Delivery modes)

## Problem (User-visible)

In modes **Самовывоз (pickup)** and **Доставка (delivery)**, the checkout screen shows:

```
Стейк      56 ₸
Итого:     54 ₸   ← user sees -2 ₸ with no explanation
```

The user sees a different price in checkout vs. the menu card, with NO explanation.
This is confusing and the discount loses its marketing value — users don't know they got a deal.

**Expected behavior:**
```
Стейк                56 ₸
Скидка за онлайн    −2 ₸
─────────────────────────
Итого:              54 ₸
```

**Note:** In **В зале (hall)** mode, the discount IS already shown in the yellow "Онлайн-заказ официанту" block — no change needed there.

**Git:** Start with `git add . && git commit -m "S73 pre-discount-display snapshot" && git push`

---

## Investigation

1. Find CheckoutView / CartView component in `menuapp-code-review/pages/x/` (PublicMenu)
2. Find where the subtotal is calculated for pickup/delivery modes
3. Find where the online discount is applied (look for `-2`, `qr_discount`, `discount`, `online_discount` etc.)
4. Check what data is available at the time of rendering (is discount amount stored in state?)

---

## Implementation

In the checkout summary section for pickup and delivery modes, add a discount line between the item subtotal and the total:

**Requirements:**
- Show the discount line ONLY when discount > 0 (don't show "Скидка: 0" if no discount)
- Label: use the existing i18n key `checkout.qr_discount` (already exists) — check the exact key in translationadmin
- Style: muted/secondary color (gray or green), similar to how bonuses are shown
- Amount: show with minus sign: `−2 ₸`
- The total remains correct (already is) — just make the breakdown visible

**Example layout:**
```jsx
{discount > 0 && (
  <div className="flex justify-between text-sm text-gray-500">
    <span>{t('checkout.qr_discount')}</span>
    <span className="text-green-600">−{discount} ₸</span>
  </div>
)}
```

---

## Required Output

### Deliverable 1: Updated PublicMenu/x RELEASE
- Discount line visible in pickup and delivery checkout
- Not visible in hall mode (already handled there)
- Not visible when discount = 0
- RELEASE: `260303-NN x RELEASE.jsx` (or CheckoutView if it's a separate file)

### Deliverable 2: Update README
- `menuapp-code-review/pages/x/README.md` or PublicMenu README — add UX changelog entry

---

## Notes for CC+Codex

- Hall mode already shows discount in the yellow block — DO NOT change hall mode behavior
- The fix is purely visual — no logic change, discount is already correctly calculated
- Use existing i18n keys where possible (checkout.qr_discount was added in S72)
- Keep the same currency symbol (₸) format used elsewhere in the checkout
- Both CC and Codex review final output before RELEASE
