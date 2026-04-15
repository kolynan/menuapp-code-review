# CC Writer Findings — CartView
Chain: cartview-260415-225026-8ace

## Findings

### Fix 1 — CV-BUG-07 (P0) · Floating-point in sums on "Стол" tab

1. [P0] `tableOrdersTotal` useMemo returns raw float sum — Lines 489-498 return `sum` without any rounding. The `reduce` accumulates `Number(o.total_amount)` which can produce IEEE-754 artifacts (e.g. `3899.969999...`). **Confirmed at :497** — `return sum;` with no `toFixed`.

   FIX (step 1): In `tableOrdersTotal` useMemo at :497, replace `return sum;` with `return parseFloat(sum.toFixed(2));` — matches pattern already used in `ordersSum` useMemo at :466-467.

2. [P0] Three call-sites pass unrounded values to `formatPrice` — While `formatPrice` in parent `x.jsx` does `Math.round(num*100)/100`, defense-in-depth requires rounding at call-sites too:
   - **:811** — `formatPrice(tableOrdersTotal)` — raw sum from useMemo
   - **:834** — `formatPrice(guestTotal)` — inline reduce at :825 with no rounding
   - **:848** — `formatPrice(order.total_amount)` — DB value, usually safe but no guarantee

   FIX (step 2): Wrap each call-site with `formatPrice(parseFloat(Number(X).toFixed(2)))`:
   - :811 → `formatPrice(parseFloat(Number(tableOrdersTotal).toFixed(2)))`
   - :834 → `formatPrice(parseFloat(Number(guestTotal).toFixed(2)))`
   - :848 → `formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))`

   **Note:** The task spec calls for `parseFloat(Number(...).toFixed(2))` wrapping on all three call-sites. However, after step 1 rounds `tableOrdersTotal` in the useMemo, the :811 wrapping is technically redundant (defense-in-depth). Both steps should still be applied per spec.

   **Existing call-sites NOT to touch** (already rounded or out of scope): :631, :764, :896, :908, :1087.

---

### Fix 2 — CV-BUG-08 (P0) · CV-70 regression: empty-cart CTA

3. [P0] Empty-cart CTA uses `variant="outline"` and wrong label — Lines 1209-1218 render an outline button with `cart.cta.order_more` ("Заказать ещё") when cart is empty but orders exist. CV-70 rule b requires primary filled "Вернуться в меню".

   **Confirmed at :1210-1217:**
   - `variant="outline"` — should be removed (default = filled)
   - `style={{borderColor: primaryColor, color: primaryColor}}` — should become `style={{backgroundColor: primaryColor}}`
   - `className` missing `text-white`
   - Label `cart.cta.order_more` → `cart.cta.back_to_menu`

   FIX: Replace the Button block at :1210-1218 with:
   ```jsx
   <Button
     size="lg"
     className="w-full min-h-[44px] text-white"
     style={{backgroundColor: primaryColor}}
     onClick={() => { onClose ? onClose() : setView("menu"); }}
   >
     {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
   </Button>
   ```

   **Orphan key:** `cart.cta.order_more` — grep confirms single usage at :1217. Safe to remove from translations.

---

### Fix 3 — CV-BUG-09 (P1) · Badge "Готово" in Стол tab (CV-52)

4. [P1] `getSafeStatus` maps by label only, not `internal_code` first — Lines 300-338. The function checks `status.label` patterns but never checks `status.internal_code`. Partner custom stage labels (e.g. "Готово" instead of "Готов") fall through, leaking internal labels to guests.

   **Confirmed:**
   - :300 — no `internal_code` check at top
   - :326 — `oldInProgressLabels` = `['Отправлено', 'Принят', 'Готовится', 'Готов']` — missing `'Готово'`

   FIX (2 parts):
   
   Part A: Add early `internal_code` check at the top of `getSafeStatus` (after null check at :301-303), before label processing:
   ```js
   const code = status.internal_code;
   if (code === 'ready' || code === 'prepared' || code === 'in_progress' || code === 'accepted' || code === 'new') {
     return { label: tr('cart.status.in_progress', 'В работе'), icon: '⏳', color: '#64748b' };
   }
   if (code === 'served' || code === 'delivered') {
     return { label: tr('cart.status.served', 'Выдано'), icon: '✓', color: '#059669' };
   }
   if (code === 'cancel' || code === 'cancelled') {
     return { label: tr('cart.status.cancelled', 'Отменён'), icon: '✕', color: '#dc2626' };
   }
   ```

   Part B: Add `'Готово'` to `oldInProgressLabels` at :326 as safety-net fallback for legacy data without `internal_code`.

   **Note:** `getSafeStatus` currently returns different icon/color format (`icon: '🔵'`, `color: '#6B7280'`) from the proposed fix (`icon: '⏳'`, `color: '#64748b'`). The new `internal_code` branches should use consistent icons/colors. Task spec uses `'⏳'`/`'#64748b'` for in_progress, `'✓'`/`'#059669'` for served, `'✕'`/`'#dc2626'` for cancelled — these are reasonable guest-facing values.

---

### Fix 4 — CV-BUG-10 + CV-BUG-13 (P1+P2) · Header total semantics + pluralization

5. [P1] Header shows dish count on Стол tab instead of table total — Lines 753-767. The header always shows `{totalDishCount} блюда · {formatPrice(headerTotal)}` regardless of which tab is active. On Стол tab, CV-50/CV-19 requires "Заказано на стол: X ₸" with submitted-only sum.

   **Confirmed at :763-764:** No `cartTab` conditional. `headerTotal` = `ordersSum + cartTotalAmount` which is my-orders only, not table-wide.

   FIX (step 1): Add `submittedTableTotal` useMemo after `tableOrdersTotal` (after :498):
   ```js
   const submittedTableTotal = React.useMemo(() => {
     const orders = sessionOrders || [];
     const sum = orders
       .filter(o => o.status !== 'cancelled' && (o.status === 'submitted' || o.status === 'accepted' || o.status === 'in_progress' || o.status === 'ready' || o.status === 'served' || o.status === 'closed'))
       .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);
     return parseFloat(sum.toFixed(2));
   }, [sessionOrders]);
   ```

   FIX (step 2): Make header conditional by `cartTab` at :763-764:
   ```jsx
   {cartTab === 'table'
     ? `${tr('cart.header.table_ordered', 'Заказано на стол')}: ${formatPrice(parseFloat(Number(submittedTableTotal).toFixed(2)))}`
     : `${totalDishCount} ${pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · ${formatPrice(parseFloat(headerTotal.toFixed(2)))}`
   }
   ```

   **Note:** `submittedTableTotal` filters by `o.status` strings — same concern as Fix 7 (raw status vs stage-based). However, `sessionOrders` are all-guest orders from the session endpoint, which may have different status semantics than `myOrders`. Using status strings here is pragmatic for Polish batch; deeper stage-based filter can come in a future sprint.

6. [P2] Hardcoded "блюда" — no Russian pluralization — Line 764. `tr('cart.header.dishes', 'блюда')` is always "блюда" regardless of count. Russian requires 3 forms: 1→"блюдо", 2-4→"блюда", 5+→"блюд", with exceptions for 11-14.

   FIX: Add `pluralizeRu` helper after `trFormat` (~:297):
   ```js
   const pluralizeRu = (n, one, few, many) => {
     const abs = Math.abs(n);
     const m10 = abs % 10;
     const m100 = abs % 100;
     if (m10 === 1 && m100 !== 11) return one;
     if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
     return many;
   };
   ```
   Then use in header (see step 2 above).

7. [P1] Card "Счёт стола" violates CV-50 (money only in header) — Lines 890-900 (Стол tab) and 902-912 (Мои tab). Two separate Card blocks show `formatPrice(tableTotal)` which includes draft cart amount (Codex critical catch). After header shows `submittedTableTotal`, these cards are redundant AND show wrong amount.

   **Confirmed:** TWO Card blocks exist in HEAD:
   - :890-900 — `showTableOrdersSection && cartTab === 'table'`
   - :902-912 — `showTableOrdersSection && cartTab === 'my'`

   FIX: Delete BOTH Card blocks (:890-912).

   **Orphan key:** `cart.table_total` — used at :895 and :907. Both removed.

---

### Fix 5 — CV-BUG-11 (P2) · Remove "Оценить блюда гостей" button

8. [P2] Cross-guest review button violates CV-20 privacy — Lines 872-883. Button allows rating other guests' dishes. Not in UX spec State T. Violates privacy principle CV-20.

   **Confirmed at :872-883:** Full Button block with `review.rate_others` and `openReviewDialog(otherGuestsReviewableItems)`.

   FIX: Delete lines 872-883 (the entire `{otherGuestsReviewableItems.length > 0 && (...)}` block including the comment at :872).

   **Orphan key:** `review.rate_others` — single usage confirmed. `review.points` — used elsewhere? Need grep check during impl.

   **Note:** Task says NOT to remove `otherGuestsReviewableItems` from prop signature (:66) — upstream still references it.

---

### Fix 6 — CV-BUG-12 (P1) · "Гость 5331" → "Гость N"

9. [P1] Guest label fallback shows UUID suffix instead of ordinal — Lines 500-506. `getGuestLabelById` uses `gid.slice(-4)` for unfound guests, producing labels like "Гость 5331". CV-13 requires "Гость N" with sequential numbering.

   **Confirmed at :504:** `const suffix = gid.length >= 4 ? gid.slice(-4) : gid;`

   FIX: Replace :504-505 with index-based ordinal from `otherGuestIdsFromOrders`:
   ```js
   const idx = (otherGuestIdsFromOrders || []).indexOf(gid);
   const guestNum = idx >= 0 ? idx + 2 : '?';
   return `${tr("cart.guest", "Гость")} ${guestNum}`;
   ```

   **Scope check:** `otherGuestIdsFromOrders` is defined at :485-487 in same functional scope — accessible. +2 offset because self = Гость 1.

   **Edge case:** If `gid` is not in `otherGuestIdsFromOrders` (orphan from stale data), returns "Гость ?" — acceptable edge-case marker per spec.

---

### Fix 7 — CV-BUG-06 (L) · Raw `o.status === 'cancelled'` → stage-based filter

10. [P1] `todayMyOrders` uses raw status string for cancelled filter — Line 422. `.filter(o => o.status !== 'cancelled')` checks raw `o.status` which may lag behind the stage pipeline. `statusBuckets` (:434-441) already does the correct stage-based check.

    **Confirmed at :422:** `.filter(o => o.status !== 'cancelled')` — no `getOrderStatus` call.

    FIX: Replace :422 with stage-based cancelled check matching `statusBuckets` pattern:
    ```js
    .filter(o => {
      const stageInfo = getOrderStatus(o);
      const isCancelled = stageInfo?.internal_code === 'cancel'
        || (!stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled');
      return !isCancelled;
    })
    ```
    Also add `getOrderStatus` to the useMemo deps at :428: `}, [myOrders, getOrderStatus]);`

    **Note:** The task spec marks this as "(L)" priority but the actual fix is P1 severity — incorrect cancelled detection can show cancelled orders to guests.

---

## Summary
Total: 10 findings (3 P0, 4 P1, 2 P2, 0 P3) covering all 7 Fixes

| Fix | Bug ID | Priority | Verified Lines | Status |
|-----|--------|----------|----------------|--------|
| 1 | CV-BUG-07 | P0 | :489-498, :811, :834, :848 | Confirmed — raw float sums |
| 2 | CV-BUG-08 | P0 | :1209-1218 | Confirmed — outline + wrong label |
| 3 | CV-BUG-09 | P1 | :300-338 | Confirmed — no internal_code check |
| 4 | CV-BUG-10+13 | P1+P2 | :753-767, :890-912 | Confirmed — wrong header + no plural + 2 redundant Cards |
| 5 | CV-BUG-11 | P2 | :872-883 | Confirmed — privacy violation |
| 6 | CV-BUG-12 | P1 | :500-506 | Confirmed — UUID suffix fallback |
| 7 | CV-BUG-06 | P1 | :422 | Confirmed — raw status check |

## Prompt Clarity

- **Overall clarity:** 4/5
- **Ambiguous Fix descriptions:**
  - Fix 4 step 3 (conditional header): the spec shows `submittedTableTotal` in the Стол-tab branch, but the `(ordersSum > 0 || cart.length > 0)` guard at :754 only checks my-orders data. When on Стол tab with no personal orders but table orders exist, the header IIFE may not execute at all. Spec doesn't address whether to modify this guard. Implementation should verify behavior.
  - Fix 3: The spec uses `tr('cart.status.in_progress', ...)` keys in the new `internal_code` branches, but the existing function uses `tr('cart.group.in_progress', ...)` — different key prefix (`status` vs `group`). Spec introduces new i18n keys which is intentional but could cause confusion if not added to translations.
  - Fix 7: Marked as "(L)" in the header but described as P1 behavior — unclear actual priority. Treating as P1.
- **Missing context:**
  - `submittedTableTotal` filter: what are all valid `o.status` values in the order lifecycle? The hardcoded list (`submitted`, `accepted`, `in_progress`, `ready`, `served`, `closed`) may miss future statuses. A stage-based approach (like Fix 7) would be more robust but wasn't specified.
  - Fix 4 card deletion: do any other components reference `cart.table_total` key or depend on these Cards being rendered (e.g., for scroll anchoring)?
- **Scope questions:**
  - Fix 1: Should `guestTotal` at :825 also get its own intermediate rounding (like `tableOrdersTotal` gets in step 1), or is the call-site wrapping sufficient? Spec only rounds `tableOrdersTotal` useMemo. The inline reduce for `guestTotal` has no useMemo to round. Call-site wrapping at :834 handles it, but asymmetric.
  - Fix 4: The `(ordersSum > 0 || cart.length > 0)` guard at :754 — should it be extended to also show when `cartTab === 'table' && submittedTableTotal > 0`? Otherwise Стол-tab header won't show if user has no personal orders.
