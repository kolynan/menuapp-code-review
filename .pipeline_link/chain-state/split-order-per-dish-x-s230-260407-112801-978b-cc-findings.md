# CC Writer Findings — PublicMenu x.jsx (Split Order Per Dish)
Chain: split-order-per-dish-x-s230-260407-112801-978b

## Code Analyzed
- `pages/PublicMenu/x.jsx` — 5278 lines (RELEASE)
- Fix 1 scope: `processHallOrder` function, lines 3671–3868
- Fix 2 scope: delivery/takeaway `Order.create` block inside `handleSubmitOrder`, lines 4094–4200

## Findings

### Fix 1 — Hall Mode: `processHallOrder`

1. **[P1] Discount split: `cartSubtotal` should use `cartTotalAmount` (already computed) or be computed identically** — The task proposes `cart.reduce((s, item) => s + item.price * item.quantity, 0)` inline. However, `cartTotalAmount` is already computed at line 3129 with `parseFloat(...toFixed(2))` rounding. Using a raw reduce without the same rounding creates a subtle mismatch: `cartSubtotal` (unrounded) vs `cartTotalAmount` (rounded). When `totalDiscount` was originally computed using `cartTotalAmount` (via `useLoyalty` at line 3145), the denominators diverge. **FIX**: Use `cartTotalAmount` directly as the denominator (it's already in scope at line 3129), or if recomputing inline, apply the same `parseFloat(....toFixed(2))` wrapper. This ensures the proportional discount fractions sum correctly to `totalDiscount`.

2. **[P1] `saveTableSelection` call position after split** — Current code (line 3731) calls `saveTableSelection` after building `orderData` but before `Order.create`. In the split version, `baseOrderData` no longer contains `total_amount`, so the guard `if (partner?.id && orderData.table)` must reference `baseOrderData.table` (or `currentTableId` directly). The task template omits this `saveTableSelection` call entirely. **FIX**: Keep `saveTableSelection` call BEFORE the loop, using `currentTableId`: `if (partner?.id && currentTableId) saveTableSelection(partner.id, currentTableId);` — it only needs to run once, not per-order.

3. **[P1] `orderCreated` flag dropped silently** — Line 3734 sets `let orderCreated = true;` after `Order.create`. The task template removes this without noting it. While grep shows no downstream usage of `orderCreated` within this function (it's only set, never read), the implementer should verify no other code references it. **FIX**: Confirm `orderCreated` is unused (grep confirms it is), then it's safe to drop. No action needed — just noting for implementer awareness.

4. **[P1] Loyalty `order` field in redeem transaction (line 3753)** — The current redeem `LoyaltyTransaction.create` (line 3753) does NOT include an `order` field, but the earn transaction (line 3779) does. After the split, the task says to use `createdOrders[0].id` for earn — this is correct. But redeem also has no `order` field in current code, which is fine. Implementer should NOT add `order: createdOrders[0].id` to the redeem block (task doesn't ask for it, original doesn't have it). **FIX**: No change to redeem block — keep as-is. Only earn block uses `createdOrders[0].id`.

5. **[P2] `confirmedTotal` should remain `finalTotal`, NOT sum of `itemTotal`s** — The task correctly specifies `totalAmount: confirmedTotal` where `confirmedTotal = finalTotal`. This is important: due to floating-point rounding in the per-item discount split, `sum(itemTotal[i])` may differ from `finalTotal` by a few cents. Using `finalTotal` (the original cart total) avoids showing a different number on the confirmation screen than what the customer expects. **FIX**: The task template is correct. Implementer must NOT replace `confirmedTotal = finalTotal` with a sum of created order totals.

6. **[P2] `setSessionOrders` optimistic update: dedup logic needs adjustment** — Current code (line 3817-3820) deduplicates by checking `prev.some(o => String(o.id) === String(order.id))`. The task template uses `Set`-based dedup filtering ALL N orders. This is correct, but the order of `[...newOpts, ...prev]` means new orders appear at top — matching the existing pattern. **FIX**: The task template's `Set`-based approach is correct and cleaner for N orders. No issue.

7. **[P1] `Partner.update` with `finalUpdatedCounters` — must include ALL counter fields** — The task template shows `finalUpdatedCounters` with 4 fields: `order_counter_hall`, `order_counter_pickup`, `order_counter_delivery`, `order_counter_date`. The current `updatedCounters` from `getNextOrderNumber` returns these same fields. However, the accumulated state approach (`currentPartnerState = { ...currentPartnerState, ...itemCounters }`) only works if `getNextOrderNumber` returns the same counter field names each time. Since `getNextOrderNumber(state, 'hall')` increments `order_counter_hall` and potentially resets `order_counter_date`, calling it N times with accumulated state should correctly produce sequential numbers. **FIX**: The approach is correct. The final `Partner.update` should use the accumulated `currentPartnerState` counters. The task template correctly extracts just the 4 counter fields for the update.

### Fix 2 — Delivery/Takeaway Mode

8. **[P1] Delivery mode currently has NO `setSessionOrders`/`setSessionItems` optimistic updates** — The task says to add N-order optimistic updates for delivery. However, the CURRENT code (lines 4112-4200) has NO optimistic session updates at all — it goes straight from loyalty to `clearCart` to `showConfirmation`. Adding `setSessionOrders`/`setSessionItems` for delivery would be a NEW feature, not a refactor of existing code. The task template says "same N-order pattern as Fix 1 (but without `guest` field)". **FIX**: This is intentional per the task. Implementer should add `setSessionOrders`/`setSessionItems` blocks to delivery mode. However, since delivery/takeaway orders don't have table_session/guest, the polling-based session order loading may not pick them up anyway. The optimistic update is harmless but may not be useful. Implementer should add it per spec, but note this potential mismatch.

9. **[P2] Delivery `baseDeliveryOrderData` includes `discount_amount` that gets overridden** — The task template shows `discount_amount: discountAmount + pointsDiscountAmount` in `baseDeliveryOrderData`, then overrides it in `itemOrderData` with `discount_amount: itemDiscount`. The base field is dead code (spread then overridden). **FIX**: Remove `discount_amount` from `baseDeliveryOrderData` to avoid confusion. Not a bug (it gets overridden), but cleaner.

10. **[P1] Delivery mode has `stage_id` in current code but task template omits it** — Current delivery `orderData` (line 4098) includes `stage_id: startStage?.id || null`. The task template's `baseDeliveryOrderData` does NOT include `stage_id`. This would be a regression — delivery orders would lose their initial stage assignment. **FIX**: Include `stage_id: startStage?.id || null` in `baseDeliveryOrderData`, matching the current code at line 4098.

11. **[P1] Edge case: empty cart (`cart.length === 0`)** — If somehow `handleSubmitOrder` is called with an empty cart, the loop creates 0 orders, and `createdOrders[0]` would be `undefined` — causing a crash at `showConfirmation({ publicToken: createdOrders[0].public_token })`. Current code also crashes (creates an Order with 0 items, but at least doesn't null-ref). **FIX**: Add a guard at the top: `if (cart.length === 0) return;` — or rely on existing UI guards that disable the submit button when cart is empty. The existing `submitLockRef` and cart validation likely prevent this, but the implementer should verify. Low risk since the current code has the same issue in a different form.

12. **[P1] `cartSubtotal <= 0` edge case: task says "use original single-Order flow"** — The task architecture decisions say: "If `cartSubtotal <= 0` (free cart, edge case): skip split math, use original single-Order flow." However, the task template code does NOT implement this fallback — it only sets `itemDiscount = 0` when `cartSubtotal <= 0`. The loop still runs N times creating N orders. **FIX**: The task template's behavior (N orders with zero discount) is actually reasonable for a free cart. Creating N free orders is consistent with the split architecture. The "use original single-Order flow" instruction in the architecture section contradicts the template code. Implementer should follow the template code (N orders, zero discount) since this is simpler and consistent. Flag for Arman if the single-order fallback is truly needed.

## Summary
Total: 12 findings (0 P0, 7 P1, 3 P2, 0 P3)

Key risks:
- **Finding 1**: Discount denominator mismatch (use `cartTotalAmount` not raw reduce)
- **Finding 10**: Missing `stage_id` in delivery template (regression)
- **Finding 2**: `saveTableSelection` call position must be preserved
- **Finding 12**: Contradiction between architecture text (single-order fallback) and template code (N orders)

All other findings are confirmations that the task template is correct or minor cleanup suggestions.

## Prompt Clarity
- Overall clarity: **4/5**
- Ambiguous Fix descriptions:
  - Fix 2: The `baseDeliveryOrderData` template includes a `discount_amount` field that is immediately overridden — minor confusion but not blocking.
  - Fix 2: `stage_id` is present in current code (line 4098) but absent from the template — unclear if intentional omission or oversight. This is the biggest clarity gap.
- Missing context:
  - Whether delivery mode currently uses `setSessionOrders`/`setSessionItems` — it does NOT, and the task adds them as new behavior without explicitly calling this out as a new feature vs refactor.
  - Whether `cartTotalAmount` (line 3129) is the intended denominator for discount splits, given it has additional rounding vs the raw `cart.reduce` shown in the template.
- Scope questions:
  - Finding 12: The architecture section says "use original single-Order flow" for free carts, but the template code creates N orders. Which takes precedence? (I assumed template code.)
  - The task says "DO NOT change CartView.jsx / StaffOrdersMobile.jsx / Any other file" — clear scope lock, no ambiguity there.
