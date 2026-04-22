---
chain: split-order-per-dish-x-s230-260407-112801-978b
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: Unknown
budget: 2.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: split-order-per-dish-x-s230-260407-112801-978b
Page: Unknown

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/split-order-per-dish-x-s230-260407-112801-978b-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/split-order-per-dish-x-s230-260407-112801-978b-codex-findings.md
   - If NOT found there, search in pages/Unknown/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/split-order-per-dish-x-s230-260407-112801-978b-comparison.md

FORMAT:
# Comparison Report — Unknown
Chain: split-order-per-dish-x-s230-260407-112801-978b

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
# Task: Split Cart Submission into N Separate Orders

## Business Goal
Currently, submitting a cart with N dishes creates **1 Order + N OrderItems**. This causes a UX lie in StaffOrdersMobile: waiter presses [Принять] on one dish but the entire Order advances (all dishes change status together).

**Fix**: Change cart submission to create **N Orders (1 per cart line)**, each with **1 OrderItem**. StaffOrdersMobile already handles multiple orders from the same guest correctly — no SOM changes needed. CartView already displays N orders with correct totals — no CartView changes needed.

## Scope Lock
Changes are **ONLY** in `pages/PublicMenu/x.jsx`, within:
- `processHallOrder` function (hall mode, ~line 3671)
- The delivery/takeaway Order creation block inside `handleSubmitOrder` (~line 4039–4200)
- Post-submit logic: `setSessionOrders`, `setSessionItems`, `showConfirmation` inside those two blocks

**DO NOT change:**
- CartView.jsx
- StaffOrdersMobile.jsx
- Any other file

## FROZEN UX (DO NOT CHANGE)
These elements are tested and approved — **do not touch their rendering logic**:
- CartView order grouping by guest/session (already works for N orders)
- SOM per-order row display (already correct)
- `submitLockRef` double-tap guard (line 3871-3872 in RELEASE) — keep as-is
- Confirmation screen layout (`showConfirmation` call structure)
- All loyalty UI (points display, redemption UI)
- All discount UI (discount display in cart)

---

## Architecture Decisions (confirmed by Arman)

**Split unit**: 1 Order per cart LINE. `quantity` is preserved as-is.
- If cart has `2 × Стейк`, create 1 Order with `OrderItem.quantity = 2` (not 2 separate Orders).
- This is by design: SOM shows quantity on the row.

**Discount**: Proportional split by `itemGross / cartSubtotal`. Last item absorbs rounding remainder.
- If `cartSubtotal <= 0` (free cart, edge case): skip split math, use original single-Order flow.

**Loyalty**: Attach all loyalty side-effects (earn/redeem transactions, LoyaltyAccount update, Order.points_earned) to `createdOrders[0]` (first Order) only. Do NOT repeat for each Order.

**Partner counters**: Call `getNextOrderNumber` N times (once per loop iteration), accumulating state. Call `Partner.update` once after the loop with final accumulated counters.

**Error handling**: If Order.create or OrderItem.create fails mid-loop, do NOT delete already-created Orders. Let the error propagate to the existing `catch` block (which shows `setSubmitError`). Guest will see an error and can retry.

**`public_token`**: Each Order gets a unique `public_token` (random). For `showConfirmation`, use `createdOrders[0].public_token`.

---

## Fix 1 — Hall Mode: `processHallOrder` (~line 3671 in RELEASE)

### What to find
```
grep -n "processHallOrder" x.jsx
```
Function signature: `const processHallOrder = async (guestToUse, validatedSession) => {`

### Current pattern to replace (approximate lines 3709–3747)
```js
const { orderNumber, updatedCounters } = getNextOrderNumber(partner, 'hall');
const orderData = {
  ...
  order_number: orderNumber,
  total_amount: finalTotal,
  discount_amount: discountAmount + pointsDiscountAmount,
  public_token: Math.random().toString(36).substring(2, 10),
  ...
};
const order = await base44.entities.Order.create(orderData);
// ... (loyalty pre-checks in between)
const newItems = cart.map((item) => ({
  order: order.id,
  dish: item.dishId,
  dish_name: item.name,
  dish_price: item.price,
  quantity: item.quantity,
  line_total: Math.round(item.price * item.quantity * 100) / 100,
  split_type: splitType,
}));
await base44.entities.OrderItem.bulkCreate(newItems);
```

### New pattern

Replace the single `Order.create` + `OrderItem.bulkCreate` block with a loop. Keep ALL other fields in `orderData` unchanged (partner, order_type, status, stage_id, payment_status, comment, client_phone, client_email, table, table_session, guest, loyalty_account, points_redeemed). Only `total_amount`, `discount_amount`, `order_number`, and `public_token` change per iteration.

```js
// Compute discount split inputs
const cartSubtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
const totalDiscount = discountAmount + pointsDiscountAmount;

// Base orderData — shared fields (no total_amount / discount_amount / order_number / public_token yet)
const baseOrderData = {
  partner: partner.id,
  order_type: 'hall',
  status: "new",
  stage_id: startStage?.id || null,
  payment_status: "unpaid",
  comment: comment || undefined,
  client_phone: clientPhone || undefined,
  client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
  table: currentTableId,
  table_session: validatedSession?.id ?? null,
  guest: guestToUse?.id || null,
  loyalty_account: loyaltyAccountToUse?.id || null,
  points_redeemed: redeemedPoints || 0,
};

// Loop: create N Orders, accumulate order numbers
const createdOrders = [];
let currentPartnerState = { ...partner };
let accumulatedDiscount = 0;

for (let idx = 0; idx < cart.length; idx++) {
  const item = cart[idx];
  const itemGross = Math.round(item.price * item.quantity * 100) / 100;

  // Proportional discount; last item absorbs rounding remainder
  let itemDiscount;
  if (cartSubtotal <= 0) {
    itemDiscount = 0;
  } else if (idx < cart.length - 1) {
    itemDiscount = parseFloat((totalDiscount * (itemGross / cartSubtotal)).toFixed(2));
  } else {
    itemDiscount = parseFloat((totalDiscount - accumulatedDiscount).toFixed(2));
  }
  // Clamp: itemTotal must not go below 0
  const itemTotal = Math.max(0, parseFloat((itemGross - itemDiscount).toFixed(2)));
  accumulatedDiscount += itemDiscount;

  // Sequential order number (accumulate state across loop)
  const { orderNumber: itemOrderNumber, updatedCounters: itemCounters } =
    getNextOrderNumber(currentPartnerState, 'hall');
  currentPartnerState = { ...currentPartnerState, ...itemCounters };

  const itemOrderData = {
    ...baseOrderData,
    total_amount: itemTotal,
    discount_amount: itemDiscount,
    order_number: itemOrderNumber,
    public_token: Math.random().toString(36).substring(2, 10),
  };

  const createdOrder = await base44.entities.Order.create(itemOrderData);
  createdOrders.push(createdOrder);

  await base44.entities.OrderItem.create({
    order: createdOrder.id,
    dish: item.dishId,
    dish_name: item.name,
    dish_price: item.price,
    quantity: item.quantity,
    line_total: Math.round(item.price * item.quantity * 100) / 100,
    split_type: splitType,
  });
}

// Final accumulated counters → Partner.update (once, not N times)
const finalUpdatedCounters = {
  order_counter_hall: currentPartnerState.order_counter_hall,
  order_counter_pickup: currentPartnerState.order_counter_pickup,
  order_counter_delivery: currentPartnerState.order_counter_delivery,
  order_counter_date: currentPartnerState.order_counter_date,
};
```

After the loop:
- **Loyalty side-effects**: use `createdOrders[0]` instead of `order` everywhere in the existing loyalty try/catch blocks. Specifically:
  - `LoyaltyTransaction.create({ ..., order: createdOrders[0].id })`
  - `LoyaltyAccount.update(...)` — keep as-is (not order-specific)
  - `Order.update(createdOrders[0].id, { points_earned: earnedPoints })`
- **Partner.update**: replace `updatedCounters` with `finalUpdatedCounters`
- **queryClient.setQueryData**: same, use `finalUpdatedCounters`
- **Optimistic update `setSessionOrders`**: add ALL N orders:
  ```js
  const optimisticAt = Date.now();
  setSessionOrders(prev => {
    const existingIds = new Set(prev.map(o => String(o.id)));
    const newOpts = createdOrders
      .filter(o => !existingIds.has(String(o.id)))
      .map(o => ({ ...o, guest: guestToUse?.id, _optimisticAt: optimisticAt }));
    return [...newOpts, ...prev];
  });
  ```
- **Optimistic update `setSessionItems`**: build temp items for ALL N orders:
  ```js
  const tempIdBase = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const allOptimisticItems = cart.map((item, i) => ({
    id: `temp_${tempIdBase}_${i}`,
    order: createdOrders[i].id,
    dish: item.dishId,
    dish_name: item.name,
    dish_price: item.price,
    quantity: item.quantity,
    line_total: Math.round(item.price * item.quantity * 100) / 100,
    split_type: splitType,
    _optimisticAt: optimisticAt,
  }));
  setSessionItems(prev => [...prev, ...allOptimisticItems]);
  ```
- **`showConfirmation`**: change `publicToken: order.public_token` → `publicToken: createdOrders[0].public_token`. Keep `totalAmount: confirmedTotal` (= `finalTotal`, the full cart total — NOT per-item).

---

## Fix 2 — Delivery/Takeaway Mode: inside `handleSubmitOrder` (~line 4039–4200)

### What to find
```
grep -n "orderMode.*delivery\|orderMode.*takeaway\|client_name" x.jsx
```
Look for the delivery `Order.create` block (has `client_name`, `delivery_address`, NO `order_number`, NO `splitType`).

### Current pattern to replace
```js
const order = await base44.entities.Order.create(orderData);
const orderItemsData = cart.map((item) => ({
  order: order.id,
  dish: item.dishId,
  dish_name: item.name,
  dish_price: item.price,
  quantity: item.quantity,
  line_total: Math.round(item.price * item.quantity * 100) / 100,
}));
await base44.entities.OrderItem.bulkCreate(orderItemsData);
```

### New pattern
Same loop structure as Fix 1, but simpler (no `getNextOrderNumber`, no `splitType`):

```js
// Compute discount split inputs
const cartSubtotal = cart.reduce((s, item) => s + item.price * item.quantity, 0);
const totalDiscount = discountAmount + pointsDiscountAmount;

// Base orderData — shared fields
const baseDeliveryOrderData = {
  // Preserve ALL existing fields from the current orderData block
  // Only total_amount / discount_amount / public_token are per-iteration
  partner: partner.id,
  order_type: orderMode,
  status: "new",
  payment_status: "unpaid",
  comment: comment || undefined,
  client_name: clientName || undefined,
  client_phone: clientPhone || undefined,
  client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
  delivery_address: orderMode === "delivery" ? deliveryAddress || undefined : undefined,
  loyalty_account: loyaltyAccountToUse?.id || null,
  points_redeemed: redeemedPoints || 0,
  discount_amount: discountAmount + pointsDiscountAmount, // will be overridden per-item
};

const createdOrders = [];
let accumulatedDiscount = 0;

for (let idx = 0; idx < cart.length; idx++) {
  const item = cart[idx];
  const itemGross = Math.round(item.price * item.quantity * 100) / 100;

  let itemDiscount;
  if (cartSubtotal <= 0) {
    itemDiscount = 0;
  } else if (idx < cart.length - 1) {
    itemDiscount = parseFloat((totalDiscount * (itemGross / cartSubtotal)).toFixed(2));
  } else {
    itemDiscount = parseFloat((totalDiscount - accumulatedDiscount).toFixed(2));
  }
  const itemTotal = Math.max(0, parseFloat((itemGross - itemDiscount).toFixed(2)));
  accumulatedDiscount += itemDiscount;

  const itemOrderData = {
    ...baseDeliveryOrderData,
    total_amount: itemTotal,
    discount_amount: itemDiscount,
    public_token: Math.random().toString(36).substring(2, 10),
  };

  const createdOrder = await base44.entities.Order.create(itemOrderData);
  createdOrders.push(createdOrder);

  await base44.entities.OrderItem.create({
    order: createdOrder.id,
    dish: item.dishId,
    dish_name: item.name,
    dish_price: item.price,
    quantity: item.quantity,
    line_total: Math.round(item.price * item.quantity * 100) / 100,
    // No split_type in delivery (not in original code)
  });
}
```

After the delivery loop:
- **Loyalty side-effects**: use `createdOrders[0]` instead of `order`
- **Optimistic update `setSessionOrders`**: same N-order pattern as Fix 1 (but without `guest` field — delivery has no guest)
- **Optimistic update `setSessionItems`**: same N-order pattern as Fix 1 (no `split_type`)
- **`showConfirmation`**: `publicToken: createdOrders[0].public_token`, `totalAmount: confirmedTotal` (= `finalTotal`)

---

## Verification Checklist

After implementation, verify:

1. **Line count**: `x.jsx` must be within ±100 lines of current RELEASE (5279 lines). If outside range → something went wrong.
2. **Submit 3-dish cart (hall mode)**:
   - B44 DB → Order table shows 3 new Orders, same `guest`, same `table_session`
   - Each Order has 1 OrderItem
   - Order numbers: ЗАЛ-001, ЗАЛ-002, ЗАЛ-003 (sequential)
   - Discount split: proportional per item
   - Hard refresh after submit: CartView still shows "Ваши заказы (3)"
3. **SOM after 3-dish submit**: 3 separate [Принять] rows, same guest shown as "1 ГОСТЯ · 3 БЛЮДА" (NOT "3 ГОСТЯ")
4. **1-dish cart**: works exactly as before (loop of 1 = same as single create)
5. **Delivery mode**: 3-dish submit creates 3 Orders, no `order_number` field, no `split_type` on OrderItem
6. **Error mid-loop**: network error after 2nd Order create → error shown to user, first 2 Orders remain in DB (expected behavior, no rollback)

---

## Notes for Implementer

- `getNextOrderNumber` is imported from `sessionHelpers.js` — it's a pure function, safe to call N times with accumulated state
- `base44.entities.*` API pattern: keep the same pattern already used throughout the function (do NOT change API style)
- `cartTotalAmount` is already computed at ~line 1916 as `cart.reduce(...)` — you can use it as `cartSubtotal` if it's in scope, otherwise recompute inline
- The existing `submitLockRef.current = true` at the start of `handleSubmitOrder` already prevents double-taps — do not add additional guards
- Loyalty is intentionally low-priority: `pointsDiscountAmount` and `loyaltyEnabled` etc. are in scope but their allocation to first Order only is a deliberate simplification
=== END ===
