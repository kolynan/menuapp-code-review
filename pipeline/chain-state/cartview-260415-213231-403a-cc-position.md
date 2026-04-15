# CC Discussion Position -- CartView
Chain: cartview-260415-213231-403a
Topic: CV-B1-Polish findings -- 8 bugs (CV-BUG-06..13)

## Questions Analyzed

### Q1: CV-BUG-07 (P0) -- Floating point in monetary sums

**Recommendation:** Fix at the 3 unprotected `formatPrice` call sites (lines 811, 834, 848), wrapping each argument with `parseFloat(X.toFixed(2))`.

**Reasoning:**
Verified every `formatPrice(...)` call in CartView.jsx:
| Line | Expression | Has toFixed? |
|------|-----------|-------------|
| 631  | `formatPrice(parseFloat(g.totalPrice.toFixed(2)))` | YES |
| 764  | `formatPrice(parseFloat(headerTotal.toFixed(2)))` | YES |
| 811  | `formatPrice(tableOrdersTotal)` | **NO** |
| 834  | `formatPrice(guestTotal)` | **NO** |
| 848  | `formatPrice(order.total_amount)` | **NO** |
| 896  | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 908  | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 1084 | `formatPrice(item.price)` | N/A (single value) |
| 1087 | `formatPrice(parseFloat((item.price * item.quantity).toFixed(2)))` | YES |

Three unprotected calls: lines 811, 834, 848. All are in the "Stol" tab section where `tableOrdersTotal` (line 489-498) and `guestTotal` (line 825) are raw `reduce` sums with no rounding. `order.total_amount` at line 848 is from DB -- likely safe but could also have fp artifacts.

`formatPrice` is a prop (line 30), defined in parent `x.jsx` -- not in this file. Modifying the helper would fix globally but risks side effects in other pages. Call-site fix is safer and consistent with the pattern already used elsewhere in CartView.

**Diff sketch (lines 811, 834, 848):**
```diff
- <span className="font-bold text-slate-700">{formatPrice(tableOrdersTotal)}</span>
+ <span className="font-bold text-slate-700">{formatPrice(parseFloat(Number(tableOrdersTotal).toFixed(2)))}</span>

- <span className="font-bold text-slate-600">{formatPrice(guestTotal)}</span>
+ <span className="font-bold text-slate-600">{formatPrice(parseFloat(Number(guestTotal).toFixed(2)))}</span>

- {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(order.total_amount)}
+ {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}
```

Alternative: round once inside the `tableOrdersTotal` useMemo (line 497: `return parseFloat(sum.toFixed(2))`) -- cleaner, fewer call-site changes. But `guestTotal` at line 825 is computed inline inside JSX (not memoized), so it still needs call-site fix.

**Side-effects:** None -- `parseFloat(Number(x).toFixed(2))` is idempotent on already-rounded values.

**Test plan:**
1. Open tab "Stol" with 2+ guests having orders with fractional prices
2. Verify collapsed header sum shows 2 decimal places
3. Expand guest section -- verify per-guest totals show 2 decimal places
4. Verify per-order line amounts are rounded

**Trade-offs:** Call-site fix is verbose but safe; helper fix would be global but out of scope.

**Mobile UX:** Floating point artifacts are especially jarring on small screens where the long number breaks layout.

---

### Q2: CV-BUG-08 (P0) -- CV-70 regression: footer CTA "Заказать ещё" instead of "Вернуться в меню"

**Recommendation:** Replace the outline button (lines 1210-1218) with a primary filled button using `primaryColor` and label "Вернуться в меню" (`cart.cta.back_to_menu`).

**Reasoning:**
Lines 1209-1218 render when `cart.length === 0` (the else branch of line 1183 `cart.length > 0`). Current code:
```jsx
<Button variant="outline" size="lg" className="w-full min-h-[44px]"
  style={{borderColor: primaryColor, color: primaryColor}}
  onClick={() => { onClose ? onClose() : setView("menu"); }}
>
  {tr('cart.cta.order_more', 'Заказать ещё')}
</Button>
```

CV-70 rule b: cart empty + active/delivered orders exist -> primary filled "Вернуться в меню". The label "Заказать ещё" is explicitly banned by CV-70 (creates cognitive conflict in empty cart context, per UX spec).

**Diff sketch:**
```diff
- <Button
-   variant="outline"
-   size="lg"
-   className="w-full min-h-[44px]"
-   style={{borderColor: primaryColor, color: primaryColor}}
-   onClick={() => { onClose ? onClose() : setView("menu"); }}
- >
-   {tr('cart.cta.order_more', 'Заказать ещё')}
- </Button>
+ <Button
+   size="lg"
+   className="w-full min-h-[44px] text-white"
+   style={{backgroundColor: primaryColor}}
+   onClick={() => { onClose ? onClose() : setView("menu"); }}
+ >
+   {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
+ </Button>
```

**i18n key:** `cart.cta.order_more` -- grep shows it's used ONLY at line 1217. Safe to remove from translations. New key: `cart.cta.back_to_menu` with fallback "Вернуться в меню".

**Side-effects:** None -- same `onClick` behavior, only visual change (outline -> filled, label change).

**Test plan:**
1. Have 1+ submitted orders, empty cart -> open drawer -> verify primary filled green button "Вернуться в меню"
2. Tap button -> verify returns to menu
3. Add item to cart -> verify footer switches to "Отправить официанту" (State A)
4. Check both Мои and Стол tabs

**Trade-offs:** None -- direct UX spec compliance.

**Mobile UX:** Primary filled button is more visible as the main CTA on mobile. Outline was easy to miss.

---

### Q3: CV-BUG-09 (P1) -- Badge "Готово" shown to guest in Стол tab (CV-52 violation)

**Recommendation:** Add `'Готово'` to `oldInProgressLabels` array at line 326 in `getSafeStatus`.

**Reasoning:**
`getSafeStatus` (lines 300-339) has two branches:
1. **Key-based labels** (line 308-322): If label looks like a translation key (`orderprocess.X` / `status.X`), it extracts the code. `ready`/`prepared` etc. fall into the `else` at line 321 -> "В работе". This branch works correctly.
2. **Russian-label branch** (line 323-331): `oldInProgressLabels` at line 326 contains `['Отправлено', 'Принят', 'Готовится', 'Готов']`. Note: `'Готов'` is present but `'Готово'` is NOT. If the status label comes as `'Готово'` (neuter form, which is what the screenshot shows), it falls through both checks and gets returned as-is at line 336 (`label || ...` -- but label is truthy).

The fix is simply adding `'Готово'` to `oldInProgressLabels`. Could also add `'готов'`, `'готово'` (lowercase) for robustness.

**Diff sketch (line 326):**
```diff
- const oldInProgressLabels = ['\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e', '\u041f\u0440\u0438\u043d\u044f\u0442', '\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f', '\u0413\u043e\u0442\u043e\u0432'];
+ const oldInProgressLabels = ['\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e', '\u041f\u0440\u0438\u043d\u044f\u0442', '\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f', '\u0413\u043e\u0442\u043e\u0432', '\u0413\u043e\u0442\u043e\u0432\u043e'];
```

Alternative (more robust): normalize with `.toLowerCase()` before matching. But that changes existing behavior and is a larger diff.

**Callers of getSafeStatus:** Line 842 (Stol tab items) and line 434-441 area (statusBuckets). The statusBuckets use `getOrderStatus` with `internal_code` check, so they're not affected. The Stol tab at line 842 calls `getSafeStatus(getOrderStatus(order))` and is the primary affected path.

**Side-effects:** Minimal -- only adds one more label to the mapping. Existing labels unaffected.

**Test plan:**
1. Have an order with `ready` stage -> open Stol tab -> verify badge shows "В работе" (not "Готово")
2. Verify Stol tab items with other statuses (served, in_progress) still display correctly
3. Check My tab -> status badges unaffected

**Trade-offs:** Simple string addition vs. case-insensitive normalization. For Polish batch, the string addition is safest.

**Mobile UX:** Consistent status labels reduce guest confusion.

---

### Q4: CV-BUG-10 (P1) -- "Счёт стола" blocks violate CV-50 + CV-19

**Recommendation:** (A) Remove both Card blocks (lines 890-900 and 902-912). (B) Add conditional header: in Stol tab show "Заказано на стол: X ₸", in My tab keep "N блюд * X ₸".

**Reasoning:**
Two Card blocks exist:
- Lines 890-900: Full "Счёт стола" card in Stol tab (`cartTab === 'table'`)
- Lines 902-912: Mini "Счёт стола" card in My tab (`cartTab === 'my'`)

CV-50: Money only in header drawer. CV-19: Stol tab header = "Заказано на стол: X ₸".

The header at lines 753-767 currently shows `{totalDishCount} {tr('cart.header.dishes', 'блюда')} * {formatPrice(headerTotal)}` regardless of active tab. It needs to be conditional on `cartTab`.

**Diff sketch:**

Step 1 -- Remove Card blocks:
```diff
- {/* SECTION 6: TABLE TOTAL — full version in Стол tab */}
- {showTableOrdersSection && cartTab === 'table' && (
-   <Card className="mb-4 bg-slate-50">
-     ... (lines 892-899)
-   </Card>
- )}
-
- {/* Mini table total in Мои tab */}
- {showTableOrdersSection && cartTab === 'my' && (
-   <Card className="mb-4 bg-slate-50">
-     ... (lines 905-910)
-   </Card>
- )}
```

Step 2 -- Conditional header (replace line 763-765 area):
```diff
  return totalDishCount > 0 ? (
    <div className="text-xs text-slate-500 mt-0.5">
-     {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
+     {cartTab === 'table'
+       ? `${tr('cart.header.table_ordered', 'Заказано на стол')}: ${formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}`
+       : `${totalDishCount} ${tr('cart.header.dishes', 'блюда')} · ${formatPrice(parseFloat(headerTotal.toFixed(2)))}`
+     }
    </div>
  ) : null;
```

**Important detail:** The header sum in Stol tab uses `tableTotal` (prop, all guests including self) per UX spec "Заказано на стол = все отправленные заказы всех гостей". The `headerTotal` (line 761) = `ordersSum + cartTotalAmount` which is self only.

**New i18n key:** `cart.header.table_ordered` = "Заказано на стол".
**Orphaned i18n key:** `cart.table_total` = "Счёт стола" -- used ONLY at lines 895 and 907 (both being removed). Can be deleted from translations.

**Side-effects:**
- `tableTotal` prop must be accessible inside the header IIFE (line 754). It's in scope (defined as prop at line 67). OK.
- `cartTab` state (line 94) must also be in scope. It is. OK.

**Test plan:**
1. Open drawer with 2+ guests -> Stol tab -> verify header shows "Заказано на стол: X ₸" (not dish count)
2. Switch to My tab -> verify header shows "N блюд * X ₸"
3. Verify no separate "Счёт стола" card appears in either tab
4. Verify amounts are correct and rounded

**Trade-offs:** The header IIFE at line 754 already accesses many variables; adding `cartTab` and `tableTotal` is minor but increases complexity.

**Mobile UX:** Removing redundant total cards reduces scroll distance. Single source of truth for money in header is cleaner.

---

### Q5: CV-BUG-11 (P2) -- Button "Оценить блюда гостей" not in spec (privacy CV-20)

**Recommendation:** Remove the entire button block (lines 872-883).

**Reasoning:**
Lines 872-883 render a Button inside the Stol tab's guest orders section:
```jsx
{otherGuestsReviewableItems.length > 0 && (
  <Button variant="outline" size="sm" className="w-full mt-2"
    onClick={() => openReviewDialog(otherGuestsReviewableItems)}>
    ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
    ...
  </Button>
)}
```

CV-20: "Не показывать draft (корзину) другим гостям. Только отправленные заказы видны остальным. Privacy: нет ощущения 'за мной следят'." Rating other guests' dishes violates this privacy principle.

State T (Stol tab) spec shows no review button. Footer CTA = "Попросить счёт" (CV-21).

**Orphan check:**
- `otherGuestsReviewableItems` -- prop (line 66). Computed in x.jsx. Used ONLY at lines 873, 878, 881 within this block. After removal, the prop becomes unused in CartView. The computation in x.jsx is harmless (no side effects) but technically orphaned.
- `openReviewDialog` -- prop (line 62). Also used for own-dish rating elsewhere. Keep.
- `review.rate_others` i18n key -- only used here. Can be removed from translations.

**Diff sketch:**
```diff
  {otherGuestIdsFromOrders.map((gid) => {
    // ... guest rendering ...
  })}
-
- {/* Review button for other guests' dishes */}
- {otherGuestsReviewableItems.length > 0 && (
-   <Button
-     variant="outline"
-     size="sm"
-     className="w-full mt-2"
-     onClick={() => openReviewDialog(otherGuestsReviewableItems)}
-   >
-     ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
-     {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
-   </Button>
- )}
```

**Side-effects:** None on CartView. The `otherGuestsReviewableItems` prop can be cleaned from x.jsx in a later sweep.

**Test plan:**
1. Open Stol tab with 2+ guests -> verify no "Оценить блюда гостей" button
2. Verify own-dish rating in My tab still works (openReviewDialog unaffected)

**Trade-offs:** Losing potential cross-guest rating feature, but it was never in the spec.

**Mobile UX:** Removes a confusing button that implied you could rate others' food.

---

### Q6: CV-BUG-12 (P1) -- Label "Гость 5331" instead of "Гость N" (CV-13 violation)

**Recommendation:** Option A (index-based fallback) for Polish batch.

**Reasoning:**
`getGuestLabelById` (lines 500-506):
```js
const getGuestLabelById = (guestId) => {
  const gid = String(guestId);
  const found = (sessionGuests || []).find((g) => String(g.id) === gid);
  if (found) return getGuestDisplayName(found);
  const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
  return `${tr("cart.guest", "Гость")} ${suffix}`;
};
```

When `sessionGuests` doesn't include a guest who has orders (e.g., race condition, entity not loaded), the fallback at line 504 takes `gid.slice(-4)` = last 4 chars of the guest ID, producing "Гость 5331".

CV-13 requires `Гость N` where N is sequential (1 = you, 2+ = others).

**Option A (safe, recommended for Polish):**
Replace fallback with index-based sequential numbering:
```diff
- const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
- return `${tr("cart.guest", "Гость")} ${suffix}`;
+ const idx = otherGuestIdsFromOrders.indexOf(gid);
+ const guestNum = idx >= 0 ? idx + 2 : '?';
+ return `${tr("cart.guest", "Гость")} ${guestNum}`;
```
Self = Гость 1 (handled elsewhere via `currentGuest`). Others start at 2. `otherGuestIdsFromOrders` (line 485-487) is memoized and stable within a render.

**Option B (proper, future batch):**
Pass full `SessionGuest` data for all guests via prop. Requires changes to x.jsx query + prop threading. Out of scope for Polish.

**Stability concern with Option A:** The order of `otherGuestIdsFromOrders` depends on `ordersByGuestId` Map insertion order (from `sessionOrders`). As long as `sessionOrders` is stable (sorted by created_at desc, line 147 in sessionHelpers), the guest IDs order is consistent. Between sessions or if new orders arrive, numbering could shift -- but this matches real-world behavior (guest who ordered first = lower number).

**Side-effects:** `otherGuestIdsFromOrders` must be in scope where `getGuestLabelById` is defined. It is (both defined in the same component body, `otherGuestIdsFromOrders` at line 485, `getGuestLabelById` at line 500).

**Test plan:**
1. Open Stol tab with 2+ guests -> verify labels show "Гость 2", "Гость 3" etc.
2. Verify guest with name shows name (via `getGuestDisplayName`)
3. Reload page -> verify numbering is consistent

**Trade-offs:** Option A may show inconsistent numbering if guest order changes between polls. Acceptable for Polish batch; Option B is the proper long-term fix.

**Mobile UX:** "Гость 5331" looks like a technical glitch to the user. Sequential numbering is intuitive.

---

### Q7: CV-BUG-13 (P2) -- Pluralization "17 блюда" grammatically incorrect

**Recommendation:** Add inline `pluralizeRu` helper and use it at line 764.

**Reasoning:**
Line 764: `{totalDishCount} {tr('cart.header.dishes', 'блюда')}` -- hardcoded fallback 'блюда' is wrong for counts like 1, 5-20, 21, etc.

Russian pluralization rules: 1 -> блюдо, 2-4 -> блюда, 5-20 -> блюд, 21 -> блюдо, etc.

No existing `pluralizeRu` helper found in the codebase (checked components/, hooks/, utils/, pages/ -- grep found `plural` only in unrelated files like partner settings labels).

**Diff sketch:**

Add helper near other helpers (after `trFormat` ~line 297):
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

Replace line 764:
```diff
- {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
+ {totalDishCount} {pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
```

**i18n keys:** New keys `cart.header.dish_one` / `cart.header.dish_few` / `cart.header.dish_many`. Old key `cart.header.dishes` becomes unused -- remove.

English fallback: `dish` / `dishes` / `dishes` works since English only has singular/plural.

**Side-effects:** The `pluralizeRu` helper is local to CartView. If other pages need it, it should be moved to a shared util later (but NOT in this batch -- F7).

**Test plan:**
1. Have 1 item -> verify "1 блюдо"
2. Have 3 items -> verify "3 блюда"
3. Have 17 items -> verify "17 блюд"
4. Have 21 items -> verify "21 блюдо"

**Trade-offs:** Inline helper adds ~6 lines. Could be shared, but that's future scope.

**Mobile UX:** Correct grammar matters for perceived quality of a restaurant app.

---

### Q8: CV-BUG-06 (L) -- `o.status === 'cancelled'` uses raw status (same root cause as CV-BUG-05)

**Recommendation:** Replace raw status check at line 422 with stage-based check via `getOrderStatus`.

**Reasoning:**
Line 422: `.filter(o => o.status !== 'cancelled')` inside `todayMyOrders` useMemo (lines 405-428). This uses raw `o.status` which may not reflect the real order stage (same issue as CV-BUG-05, fixed for `statusBuckets` at lines 434-441).

The `statusBuckets` code (line 437) already does it right:
```js
const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
```

For `todayMyOrders`, the filter should mirror this pattern. However, `getOrderStatus` is not in the useMemo's dependency array (line 428: `[myOrders]`).

**Diff sketch (lines 422, 428):**
```diff
- .filter(o => o.status !== 'cancelled')
+ .filter(o => {
+   const stageInfo = getOrderStatus(o);
+   const isCancelled = stageInfo?.internal_code === 'cancel'
+     || (!stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled');
+   return !isCancelled;
+ })

  // Also fix dependency array:
- }, [myOrders]);
+ }, [myOrders, getOrderStatus]);
```

**Side-effects:**
- Adding `getOrderStatus` to deps means `todayMyOrders` recalculates when `getOrderStatus` changes. This is correct behavior (stage pipeline updates should reflect in the order list).
- Downstream consumers of `todayMyOrders` (e.g., `statusBuckets` at line 431) will also recalculate.

**Test plan:**
1. Have a cancelled order -> verify it doesn't appear in My tab
2. Have an order at `cancel` stage (via order pipeline) -> verify it's also filtered out
3. Verify non-cancelled orders still appear

**Trade-offs:** Adding a dep to useMemo increases recomputations, but `getOrderStatus` is typically a stable callback.

**Mobile UX:** No visible UX change -- this is a correctness fix for edge cases.

---

## Summary Table

| # | Bug | CC Recommendation | Confidence |
|---|-----|-------------------|------------|
| 1 | CV-BUG-07 (P0) FP sums | Fix 3 unprotected `formatPrice` call sites with `toFixed(2)` | high |
| 2 | CV-BUG-08 (P0) CTA regression | Replace outline "Заказать ещё" with primary filled "Вернуться в меню" | high |
| 3 | CV-BUG-09 (P1) "Готово" badge | Add `'Готово'` to `oldInProgressLabels` in `getSafeStatus` | high |
| 4 | CV-BUG-10 (P1) "Счёт стола" blocks | Remove 2 Card blocks + conditional header per tab | high |
| 5 | CV-BUG-11 (P2) Rate others button | Remove lines 872-883 entirely | high |
| 6 | CV-BUG-12 (P1) "Гость 5331" label | Option A: index-based fallback `otherGuestIdsFromOrders.indexOf(gid) + 2` | medium |
| 7 | CV-BUG-13 (P2) Pluralization | Inline `pluralizeRu` helper + 3 i18n keys | high |
| 8 | CV-BUG-06 (L) Raw cancelled check | Replace with stage-based check + fix useMemo deps | high |

## Prompt Clarity

- Overall clarity: **4/5**
- Ambiguous questions:
  - Q4 (CV-BUG-10): The PSSK says "проверь в UX-спеке строка S348+" for the sum logic in Stol tab header -- unclear whether `tableTotal` or `tableOrdersTotal + headerTotal` should be used. UX spec clarifies: "Заказано на стол = все отправленные заказы всех гостей" = `tableTotal` prop. Resolved by reading spec directly.
  - Q6 (CV-BUG-12): The PSSK asks to "выбрать безопасный" between options A/B/C but doesn't specify time/complexity budget constraints. For Polish batch, A is obvious choice -- this could have been stated upfront.
- Missing context:
  - What `getOrderStatus` returns for `ready` stage -- needed for Q3/Q8. Had to infer from `statusBuckets` usage pattern.
  - Whether `tableTotal` prop includes self's orders or only others'. Had to cross-reference UX spec.

## Out-of-scope risks (max 5)

1. Line 1084: `formatPrice(item.price)` -- single DB value, unlikely FP issue, but no protection. (Low risk)
2. Lines 431-441: `statusBuckets` fallback `(o.status || '').toLowerCase()` may miss status values with different casing from new order pipeline stages.
3. Line 466: `ordersSum` already has `parseFloat(sum.toFixed(2))` -- OK, but if `todayMyOrders` changes due to CV-BUG-06 fix, recalculation timing may shift.
4. `showLoyaltySection` prop (line 82) is declared but never used in CartView.jsx -- orphaned prop.
5. Line 131: `rewardTimerRef` cleanup on unmount only clears one timer -- if `rewardTimerRef.current` is reassigned at line 1164 before previous timer fires, old timer leaks.
