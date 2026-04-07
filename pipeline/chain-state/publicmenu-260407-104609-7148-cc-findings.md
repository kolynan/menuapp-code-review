# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260407-104609-7148

## Issues Found

1. **[CRITICAL] Line numbers are wildly wrong — prompt says ~2460–2587 and ~2840–2920, actual is ~3671–3868 and ~4045–4210.** The prompt claims "hall mode ~line 2460–2587, delivery/takeaway mode ~line 2840–2920" but verified locations are: `processHallOrder` at line 3671, `Order.create(orderData)` at lines 3733 and 4112, `OrderItem.bulkCreate` at lines 3747 and 4124. This is ~1200 lines off. PROMPT FIX: Replace all line number references with correct ones: hall block = lines 3671–3868 (function `processHallOrder`), delivery/takeaway block = lines 4045–4210 (inline in `handleSubmitOrder`).

2. **[CRITICAL] Hall order creation is in a separate function `processHallOrder`, not inline.** The prompt assumes both blocks are inline in `handleSubmitOrder`. In reality, hall logic is in `const processHallOrder = async (guestToUse, validatedSession) => {...}` at line 3671, called from `handleSubmitOrder` at line 4039. The delivery block IS inline in `handleSubmitOrder` (line 4045–4210). The prompt's refactoring instructions assume a flat code structure — CC may misidentify where to apply changes. PROMPT FIX: Explicitly name the two functions: "Refactor `processHallOrder` (line 3671) for hall mode" and "Refactor the inline delivery/takeaway block in `handleSubmitOrder` (line 4045) for non-hall mode."

3. **[CRITICAL] `order_number` / `getNextOrderNumber` not addressed for N orders.** Hall mode calls `getNextOrderNumber(partner, 'hall')` at line 3709, which returns ONE `orderNumber` and ONE `updatedCounters` object. With N orders, each order needs its own unique `order_number`, requiring N calls to `getNextOrderNumber`. The prompt's code snippet uses `...orderData` which would give ALL N orders the SAME `order_number`. This will cause order number collisions visible to staff. PROMPT FIX: Add explicit instruction: "Call `getNextOrderNumber(partner, orderType)` inside the loop for each order — each split order must have a unique `order_number`. Accumulate all `updatedCounters` and apply the final counter state once after the loop."

4. **[CRITICAL] `updatedCounters` must be recalculated for N orders.** `getNextOrderNumber` increments the partner's internal counter. With N orders, calling it N times in the loop means each call must see the incremented state from the previous call. The prompt doesn't mention this at all. If `getNextOrderNumber` reads from `partner` object (stale closure), all N orders get the same number. PROMPT FIX: Add instruction to pass accumulated counter state to each successive `getNextOrderNumber` call, or explain how the function handles sequential calls.

5. **[CRITICAL] Rollback deletes Orders but doesn't rollback OrderItems.** The rollback code in the prompt deletes Orders (`Order.delete(o.id)`), but OrderItems were already created in the same loop iteration. If `OrderItem.create` at iteration 3 fails, iterations 1 and 2 have both Orders AND OrderItems. Deleting the Order may not cascade-delete OrderItems (depends on B44 behavior). PROMPT FIX: Either (a) confirm B44 cascade-deletes OrderItems when Order is deleted, or (b) add explicit `OrderItem.delete` in rollback, or (c) restructure: create all Orders first, then all OrderItems.

6. **[MEDIUM] `splitType` not available in delivery/takeaway branch.** The prompt acknowledges this ("use `'single'` as fallback") but the code snippet references `splitType ?? 'single'` in the `OrderItem.create` call. In the delivery branch (line 4115–4122), the existing code does NOT include `split_type` at all. Adding it as `'single'` is harmless but the prompt should be explicit about whether to add this field to the delivery branch items or omit it to match existing behavior. PROMPT FIX: Clarify: "In the delivery/takeaway branch, do NOT add `split_type` to OrderItem (matching current behavior which omits it)."

7. **[MEDIUM] `setSessionOrders` optimistic update must handle N orders, not 1.** The prompt says "add ALL N created orders" but doesn't show the code. Current code (line 3817–3820) does dedup check `prev.some(o => String(o.id) === String(order.id))`. With N orders, this needs to add all N and dedup each. The implementer might not get this right without a code snippet. PROMPT FIX: Add explicit code snippet for the N-order optimistic update: `setSessionOrders(prev => { const newOrders = createdOrders.filter(co => !prev.some(o => String(o.id) === String(co.id))).map(co => ({...co, guest: guestToUse?.id, _optimisticAt: Date.now()})); return [...newOrders, ...prev]; });`

8. **[MEDIUM] `showConfirmation` receives `publicToken: order.public_token` — but with N orders, which token?** The prompt says "use `createdOrders[0].public_token`" which is correct, but `showConfirmation` also receives `items: confirmedItems` and `totalAmount: confirmedTotal`. The `totalAmount` should remain `finalTotal` (the combined total, not one order's total). The prompt doesn't clarify this. PROMPT FIX: Add explicit instruction: "Pass `totalAmount: finalTotal` (pre-existing variable, the full cart total) to `showConfirmation` — NOT the per-item total."

9. **[MEDIUM] Loyalty `order` field references — earn_order links to `order.id`.** Lines 3776 and 4152 create LoyaltyTransaction with `order: order.id`. With N orders, the prompt says "attach to `createdOrders[0]` only." But `Order.update(order.id, { points_earned })` at lines 3792 and 4169 also need to target `createdOrders[0].id`. The prompt should show this explicitly. PROMPT FIX: Clarify: "All loyalty operations (redeem, earn, `Order.update({points_earned})`) use `createdOrders[0].id` as the `order` reference."

10. **[MEDIUM] `setSessionItems` optimistic update must create N temp items (one per order), not N items for 1 order.** Currently (line 3827–3834), all items get `order: order.id`. With N orders, each temp item must reference its own `createdOrders[idx].id`. The prompt doesn't provide code for this. PROMPT FIX: Add code snippet showing temp items with correct order linkage.

11. **[LOW] `cartSubtotal` vs `cartTotalAmount` naming conflict.** The prompt warns about this ("may conflict with existing `cartTotalAmount` at line ~1916") but `cartTotalAmount` is defined at line 3129 using `Math.round(... * 100) / 100` rounding, while the prompt's `cartSubtotal` uses simple `item.price * item.quantity` sum. These will differ due to rounding, causing discount proportions to be slightly off. PROMPT FIX: Use `cartTotalAmount` (already in scope, already correctly rounded) instead of computing a new `cartSubtotal`. Update the discount formula to use `cartTotalAmount`.

12. **[LOW] `line_total` calculation differs between prompt and existing code.** Existing code uses `Math.round(item.price * item.quantity * 100) / 100` (line 3743, 4121). The prompt's code snippet uses `itemGross` = `item.price * item.quantity` without rounding. Should match existing pattern. PROMPT FIX: Use `Math.round(item.price * item.quantity * 100) / 100` for `line_total` to match existing code.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| handleSubmitOrder | not specified | line 3870 | ✅ (grep hint correct) |
| Hall mode block | ~line 2460–2587 | line 3671–3868 (`processHallOrder`) | ❌ ~1200 lines off |
| Delivery/takeaway block | ~line 2840–2920 | line 4045–4210 (inline in handleSubmitOrder) | ❌ ~1200 lines off |
| Order.create (hall) | not specified | line 3733 | ✅ (grep hint correct) |
| Order.create (delivery) | not specified | line 4112 | ✅ (grep hint correct) |
| OrderItem.bulkCreate (hall) | not specified | line 3747 | ✅ (grep hint correct) |
| OrderItem.bulkCreate (delivery) | not specified | line 4124 | ✅ (grep hint correct) |
| cartTotalAmount | ~line 1916 | line 3129 | ❌ ~1200 lines off |
| splitType | implied available | line 1486 (state), used only in hall branch line 3744 | ✅ |
| discountAmount | implied in scope | line 3140 (destructured from useLoyalty) | ✅ |

## Fix-by-Fix Analysis

**Fix 1 (the only fix): Split handleSubmitOrder** — **RISKY**

Reasons:
1. **Structural misunderstanding**: The prompt treats both blocks as inline code, but hall mode is a separate function (`processHallOrder`). CC needs to know this to avoid creating duplicate logic or breaking the function boundary.
2. **order_number collision**: Without explicit instructions to call `getNextOrderNumber` N times, all split orders get the same number — visible data corruption for staff.
3. **Rollback incompleteness**: OrderItems may orphan if cascade delete isn't guaranteed.
4. **Counter accumulation**: N calls to `getNextOrderNumber` without passing accumulated state will produce N identical counters.
5. **The approach is fundamentally sound** — creating N orders instead of 1 is a clean solution. But the prompt needs 4 CRITICAL fixes before it's safe to execute.

## Summary
Total: 12 issues (5 CRITICAL, 5 MEDIUM, 2 LOW)
Prompt clarity rating: 2/5

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 2/5**
- **What was most clear:** The problem statement and validation checklist are excellent. The "Must NOT be" section is thorough. The grep hints for finding code are correct and useful. The conceptual approach (1 Order per dish) is well-justified.
- **What was ambiguous or could cause hesitation:**
  - Line numbers in the "File and location" section are ~1200 lines off — this will cause CC to search in wrong areas
  - Hall mode is in a separate function (`processHallOrder`) not mentioned by name in the prompt
  - `order_number` generation for N orders is completely unaddressed — this is a data integrity issue
  - Optimistic updates (`setSessionOrders`, `setSessionItems`) lack code snippets for the N-order case
  - Rollback strategy assumes cascade delete without verifying
- **Missing context:**
  - The function name `processHallOrder` — essential for CC to find the right code
  - How `getNextOrderNumber` works internally (does it mutate `partner`? return incremented state?)
  - Whether B44 `Order.delete` cascade-deletes associated OrderItems
  - Explicit code for `setSessionOrders` / `setSessionItems` with N orders
  - Whether `order_number` is required for delivery/takeaway orders (currently not set in that branch)
