---
page: PublicMenu
code_file: pages/PublicMenu/x.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion-v2
---

# Fix #258: Split Cart Submission — One Order Per Dish Item

Reference: `ux-concepts/StaffOrdersMobile/GPT_PerItemVsPerOrder_S229.md`, `BUGS_MASTER.md`.

## Context

Currently, when a guest submits a cart with N items, the app creates:
- 1 `Order` with all N items
- 1 `OrderItem.bulkCreate(N items)`

**Problem:** In StaffOrdersMobile (SOM), the waiter sees per-dish action buttons, but pressing any button advances the **entire Order** status — not just that dish. This is a UX lie: the interface promises one action, the system does another.

**Solution:** At cart submission, create **one `Order` per cart item** (each with 1 `OrderItem`). This gives SOM genuine per-dish fulfillment control without any backend schema changes. CartView already handles multiple Orders gracefully — displays them grouped under one status label with correct total.

**Validated:** Manually tested with 3 separate orders — CartView shows "Отправлено (3)" with correct sum. SOM shows 3 dish rows with individual [Принять] buttons. Both look correct.

---

## Fix 1 — #258 (H) [MUST-FIX]: Split handleSubmitOrder — N Orders per cart, 1 item each

### Currently
In `pages/PublicMenu/x.jsx`, all order creation functions that process the guest cart:
- Create **1 `Order`** with `total_amount = finalTotal`
- Call **`OrderItem.bulkCreate`** with all cart items at once
- `discount_amount = discountAmount + pointsDiscountAmount` (total discount on one order)

Grep to find all cart submission blocks:
```
grep -n "Order.create(orderData)\|OrderItem.bulkCreate\|const handleSubmitOrder\|order_type.*hall\|order_type.*delivery\|order_type.*takeaway" pages/PublicMenu/x.jsx
```

There are likely **2 separate order-creation code blocks** in the file — one for hall mode (QR/table, contains `table_session`, `guest`, `table` fields) and one for delivery/takeaway. Apply the split logic to **BOTH**.

### Must be (new behavior)

For **every** cart submission that currently creates 1 Order + bulkCreate:

**Step 1 — Calculate per-item discount split:**
```js
// cartSubtotal = sum of (price × qty) for all cart items BEFORE discount
const cartSubtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
const totalDiscount = discountAmount + pointsDiscountAmount; // total discount to distribute
```

**Step 2 — Create N Orders sequentially with rollback:**
```js
const createdOrders = [];
try {
  for (let idx = 0; idx < cart.length; idx++) {
    const item = cart[idx];
    const itemGross = item.price * item.quantity; // before discount
    // Proportional discount; last item gets rounding remainder
    const itemDiscount = idx < cart.length - 1
      ? parseFloat((totalDiscount * (itemGross / cartSubtotal)).toFixed(2))
      : parseFloat((totalDiscount - createdOrders.reduce((s, o) => s + (o._itemDiscount || 0), 0)).toFixed(2));
    const itemTotal = parseFloat((itemGross - itemDiscount).toFixed(2));

    const itemOrderData = {
      ...orderData,                         // inherit all shared fields (partner, status, stage_id, etc.)
      total_amount: itemTotal,
      discount_amount: itemDiscount,
      public_token: Math.random().toString(36).substring(2, 10),
      // ⚠️ CRITICAL: all split orders MUST share the same guest ID
      // guest: orderData.guest  (already in orderData — do NOT change)
    };
    const createdOrder = await base44.entities.Order.create(itemOrderData);
    createdOrders.push({ ...createdOrder, _itemDiscount: itemDiscount });

    await base44.entities.OrderItem.create({
      order: createdOrder.id,
      dish: item.dishId,
      dish_name: item.name,
      dish_price: item.price,
      quantity: item.quantity,
      line_total: itemGross,
      split_type: splitType ?? 'single',
    });
  }
} catch (err) {
  // Rollback: delete already-created orders on failure
  for (const o of createdOrders) {
    try { await base44.entities.Order.delete(o.id); } catch (_) {}
  }
  throw err; // re-throw to outer catch
}
```

**Step 3 — After loop: use first order for confirmation token + optimistic updates:**
- `public_token` for `showConfirmation(...)` = `createdOrders[0].public_token`
- Optimistic `setSessionOrders`: add ALL N created orders (not just one)
- Optimistic `setSessionItems`: add temporary items for all N orders
- Loyalty (if present): attach to `createdOrders[0]` only (do NOT split or multiply)
- `Partner.update(updatedCounters)`: call once, not N times

### Must NOT be
- Do NOT call `OrderItem.bulkCreate` anymore (replace with individual `OrderItem.create` per loop iteration)
- Do NOT create N LoyaltyTransactions or N Partner counter updates — only 1 each (on first order)
- Do NOT generate same `public_token` for all N orders — each order gets its own random token
- Do NOT change the `guest` field — all N orders must have the SAME `guest` ID (critical for SOM "1 guest · 3 dishes" display)
- Do NOT modify CartView, SOM, or any other component — only `x.jsx`
- Do NOT remove `submitLockRef`, `setIsSubmitting`, validation, or any pre-submit guards

### File and location
File: `pages/PublicMenu/x.jsx` (~5279 lines)

Key grep hints:
```
grep -n "const handleSubmitOrder" pages/PublicMenu/x.jsx     # main submit handler
grep -n "Order\.create(orderData)" pages/PublicMenu/x.jsx    # find both create() calls
grep -n "OrderItem\.bulkCreate" pages/PublicMenu/x.jsx       # find both bulkCreate calls
grep -n "order_type.*hall\|order_type.*delivery" pages/PublicMenu/x.jsx  # mode branches
grep -n "showConfirmation" pages/PublicMenu/x.jsx            # confirmation call
grep -n "setSessionOrders" pages/PublicMenu/x.jsx            # optimistic update
```

There are **2 separate code blocks** creating orders (hall mode ~line 2460–2587, delivery/takeaway mode ~line 2840–2920). Both must be refactored.

### Verification
1. Open QR menu for a table → add 3 different dishes to cart → submit
2. CartView: should show "Ваши заказы (3)" with each dish on its own row with correct individual price
3. Total in CartView header = sum of all 3 items (discounted if applicable)
4. SOM (/staffordersmobile): should show 3 separate dish rows under "НОВЫЕ" with individual [Принять] buttons
5. SOM should show "1 ГОСТЯ · 3 БЛЮДА" (NOT "3 ГОСТЯ")
6. Press [Принять] on one dish → only that row advances to "ПРИНЯТО", other 2 stay in "НОВЫЕ"

---

## ⛔ SCOPE LOCK — change ONLY what is described above

- Modify ONLY the two order-creation blocks in `x.jsx` (where `Order.create` + `OrderItem.bulkCreate` currently appear)
- Do NOT change CartView.jsx, StaffOrdersMobile.jsx, MenuView.jsx, or any other file
- Do NOT change the UI, any state, any hooks, any props outside the submit logic
- Do NOT change validation, guards, form fields, or confirmation screen logic (only the public_token source changes)
- Do NOT "fix" anything outside Fix 1
- FROZEN UX: all existing UI behaviors (cart display, drawer, navigation, polling) must continue working

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. This fix is backend-logic only (no UI changes), so mobile check is N/A. However verify:
- [ ] Submit flow still works correctly after change (no JS errors in console)
- [ ] Cart clears correctly after submission
- [ ] Confirmation screen shows correct items and total

## Regression Check (MANDATORY after implementation)
- [ ] Single-item cart: submit creates exactly 1 Order + 1 OrderItem (no regression for single-item orders)
- [ ] Cart with 2+ items: creates N Orders, each with 1 OrderItem
- [ ] Discount = 0: all N orders created with discount_amount = 0, total_amount = item price
- [ ] Discount > 0: total of all N discount_amount values = original total discount (no rounding drift > 1 cent)
- [ ] Network error mid-loop: rollback deletes all already-created Orders, error shown to user
- [ ] Confirmation screen appears after successful submit with correct item list and total
- [ ] Delivery/takeaway mode: also creates N orders per item (both branches refactored)

## Implementation Notes
- Target file: `pages/PublicMenu/x.jsx`
- Read-only context: `pages/PublicMenu/CartView.jsx` (to understand how orders are displayed — DO NOT MODIFY)
- The variable `cartSubtotal` may conflict with existing `cartTotalAmount` at line ~1916 — use `cartTotalAmount` if already available in scope, or calculate locally as `cart.reduce((s,i) => s + i.price * i.quantity, 0)`
- `discountAmount` and `pointsDiscountAmount` are already in scope in both submission branches
- `splitType` may not be available in delivery/takeaway branch — use `'single'` as fallback
- git add pages/PublicMenu/x.jsx
- git commit -m "feat: split cart submission into N orders per dish item (#258)"
