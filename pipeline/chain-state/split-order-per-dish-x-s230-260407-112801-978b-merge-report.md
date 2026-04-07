# Merge Report — PublicMenu x.jsx (Split Order Per Dish)
Chain: split-order-per-dish-x-s230-260407-112801-978b

## Applied Fixes

1. **[P1] Include `stage_id` in delivery `baseDeliveryOrderData`** — Source: CC Finding 10 (agreed) — DONE
   Added `stage_id: startStage?.id || null` to delivery base order data. Prevents regression where delivery orders would lose their initial stage assignment.

2. **[P1] Use `cartTotalAmount` as discount split denominator** — Source: CC Finding 1 (agreed) — DONE
   Both hall and delivery loops use `cartTotalAmount` (already computed with proper rounding at line 3129) instead of raw `cart.reduce(...)`. Ensures proportional fractions match the total used for discount computation.

3. **[P1] Preserve `saveTableSelection` call in hall mode** — Source: CC Finding 2 (agreed) — DONE
   Moved `saveTableSelection(partner.id, currentTableId)` BEFORE the loop (no longer depends on `orderData.table`).

4. **[P1] Fix 1: Hall mode per-cart-line loop** — Source: Agreed (CC+Codex) — DONE
   Replaced single `Order.create` + `OrderItem.bulkCreate` with loop creating N Orders (1 per cart line). Each Order gets sequential `order_number` via accumulated `getNextOrderNumber`, proportional discount, unique `public_token`. `OrderItem.create` (not `bulkCreate`) used per iteration.

5. **[P1] Fix 1 post-submit: loyalty + optimistic + confirmation** — Source: Agreed (CC+Codex) — DONE
   - Loyalty: `createdOrders[0]` used for earn transaction + Order.update
   - Redeem: no `order` field (kept as-is, per CC Finding 4)
   - Partner.update: `finalUpdatedCounters` (accumulated across loop, called once)
   - Optimistic `setSessionOrders`: adds all N orders with dedup Set
   - Optimistic `setSessionItems`: builds items with `createdOrders[i].id`
   - `showConfirmation`: `createdOrders[0].public_token`, `totalAmount: confirmedTotal` (= `finalTotal`)

6. **[P1] Fix 2: Delivery/takeaway per-cart-line loop** — Source: Agreed (CC+Codex) — DONE
   Same loop pattern as Fix 1. Includes `stage_id` (fix #1). No `order_number`, no `split_type` on OrderItem. No `getNextOrderNumber` calls (delivery has no order numbering).

7. **[P1] Fix 2 post-submit: loyalty + optimistic + confirmation** — Source: Agreed (CC+Codex) — DONE
   Same pattern as Fix 1 post-submit but without `guest` field in optimistic orders. `setSessionOrders`/`setSessionItems` are NEW for delivery mode (previously not present — CC Finding 8).

8. **[P1] `cartSubtotal <= 0` edge case: follow template** — Source: CC Finding 12 (agreed) — DONE
   N orders created with `itemDiscount = 0` when `cartSubtotal <= 0`. No single-order fallback. Consistent and simple.

9. **[P2] Remove dead `discount_amount` from `baseDeliveryOrderData`** — Source: CC Finding 9 (agreed) — DONE
   Not included in base data since it's set per-iteration in the loop.

10. **[P2] `confirmedTotal` = `finalTotal`** — Source: CC Finding 5 (agreed) — DONE
    Both hall and delivery use `const confirmedTotal = finalTotal` (original cart total, not sum of per-item totals).

11. **[P2] `orderCreated` flag dropped** — Source: CC Finding 3 (agreed) — DONE
    Confirmed unused (set but never read). Removed without replacement.

## Skipped — Unresolved Disputes (for Arman)
None — 0 disputes.

## Skipped — Could Not Apply
None.

## Git
- Pre-task commit: `bd3486f`
- Commit: `befa1e0`
- Lines before: 5278
- Lines after: 5374 (+96, within ±100 range)
- Files changed: 1 (pages/PublicMenu/x.jsx)
- Diff: +167 insertions, -71 deletions

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description: Fix 2 `stage_id` — CC correctly identified this was an omission in the template (present in current code line 4098 but absent from template). Codex did not analyze template quality, so no divergence per se.
- Fixes where description was perfect (both writers agreed immediately): Fix 1 hall mode loop, discount split math, loyalty to first order, optimistic updates pattern.
- Recommendation for improving task descriptions: The delivery mode template should have explicitly included `stage_id` since it exists in current code. When providing "New pattern" code blocks, ensure ALL fields from the current code are accounted for (either included or explicitly marked "removed because...").

## Summary
- Applied: 11 fixes (7 P1 + 1 P1 edge case + 3 P2)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: `befa1e0`
