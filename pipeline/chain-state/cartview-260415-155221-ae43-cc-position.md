# CC Discussion Position — CartView
Chain: cartview-260415-155221-ae43
Topic: CV-B1-Polish (8 bugs after CV-B1-Core)

**Important HEAD context:** The task context references line numbers from an older RELEASE (1164 lines). HEAD is 1223 lines and already includes CV-B1-Core fixes (2-group model CV-52, submitPhase state machine CV-48, tabs CV-14/CV-56, auto-collapse CV-46, etc.). My analysis is against HEAD.

## Questions Analyzed

### Q1: CV-BUG-07 (P0) — Floating point in monetary sums

**Recommendation:** Fix at call-sites `formatPrice(tableOrdersTotal)` (line 811) and `formatPrice(guestTotal)` (line 834) by wrapping with `parseFloat(....toFixed(2))`. Also fix `tableOrdersTotal` computation (line 497) and `guestTotal` (line 825) at source.

**Reasoning:**
- `formatPrice` is a prop passed from parent (`x.jsx`), defined outside CartView.jsx. Changing it would affect all pages — out of scope for CV-B1-Polish.
- HEAD already uses `parseFloat(N.toFixed(2))` pattern in other places (lines 631, 764, 896, 908, 1087). This is the established pattern.
- Two unprotected call-sites exist:
  1. Line 811: `formatPrice(tableOrdersTotal)` — `tableOrdersTotal` (line 489-497) has raw `sum += Number(o.total_amount) || 0` with no rounding.
  2. Line 834: `formatPrice(guestTotal)` — `guestTotal` (line 825) has same raw reduce.
  3. Line 848: `formatPrice(order.total_amount)` — single value from DB, less likely to have FP issues but should be protected too.

**Minimal diff sketch:**
```diff
--- a/pages/PublicMenu/CartView.jsx
+++ b/pages/PublicMenu/CartView.jsx
@@ -494,7 +494,7 @@
         sum += Number(o.total_amount) || 0;
       });
     });
-    return sum;
+    return parseFloat(sum.toFixed(2));
   }, [ordersByGuestId, otherGuestIdsFromOrders]);

@@ -822,7 +822,7 @@
                 {otherGuestIdsFromOrders.map((gid) => {
                   const guestOrders = ordersByGuestId.get(gid) || [];
-                  const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
+                  const guestTotal = parseFloat(guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toFixed(2));
```

**Trade-offs:** Slightly more verbose call-sites, but consistent with existing pattern and zero risk to other pages.

**Side-effects:** None — only affects display rounding in table-orders section.

**Test plan:**
1. Multi-guest session, 3+ items with prices like 1099.29, 1099.29, 971.29 — verify "Стол" tab shows clean sum (e.g., `3 169.87 ₸`, not `3 169.8700000000003 ₸`).
2. Verify individual guest subtotals in expanded view are also clean.

---

### Q2: CV-BUG-08 (P0) — Footer CTA "Заказать ещё" instead of "Вернуться в меню" (CV-70 regression)

**Recommendation:** Change the empty-cart CTA from outline "Заказать ещё" to primary filled "Вернуться в меню" with `primaryColor` background.

**Reasoning:**
- HEAD line 1209-1218: when `cart.length === 0`, shows outline button with `tr('cart.cta.order_more', 'Заказать ещё')`.
- CV-70 rule b: State B (empty cart + has orders) should show primary filled "Вернуться в меню".
- The action (`onClose ? onClose() : setView("menu")`) is already correct — it returns to menu. Only the label and styling are wrong.
- No need to distinguish State B vs State E — both result in returning to menu when cart is empty. The CTA always means "go back to menu" when cart is empty. "Вернуться в меню" is more accurate than "Заказать ещё" regardless of state.

**Minimal diff sketch:**
```diff
@@ -1209,11 +1209,11 @@
           ) : (
             <Button
-              variant="outline"
               size="lg"
-              className="w-full min-h-[44px]"
-              style={{borderColor: primaryColor, color: primaryColor}}
+              className="w-full min-h-[44px] text-white"
+              style={{backgroundColor: primaryColor}}
               onClick={() => { onClose ? onClose() : setView("menu"); }}
             >
-              {tr('cart.cta.order_more', 'Заказать ещё')}
+              {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
             </Button>
```

**New i18n key:** `cart.cta.back_to_menu` = "Вернуться в меню". Old key `cart.cta.order_more` can be orphaned (grep shows no other usage in CartView.jsx).

**Trade-offs:** Loses the "Заказать ещё" wording which might feel more inviting. But CV-70 spec is explicit — "Вернуться в меню" is the decided label.

**Side-effects:** None.

**Test plan:**
1. Open cart with orders but empty cart items — verify button is filled (primaryColor background, white text), reads "Вернуться в меню".
2. Tap button — returns to menu view.

---

### Q3: CV-BUG-09 (P1) — Badge "Готово" in Стол tab (CV-52 violation)

**Recommendation:** **Already fixed in HEAD.** No action needed.

**Reasoning:**
HEAD lines 299-338 show `getSafeStatus` already implements CV-52 2-status model:
- `servedCodes = ['done', 'served', 'completed']` → "Выдано"
- `cancelledCodes = ['cancel', 'cancelled']` → "Отменён"
- Everything else (including `ready`, `prepared`, `cooking`, `pending`, etc.) → "В работе" (line 321)
- Old Russian labels are also mapped (line 323-331): "Подано" → "Выдано", "Отправлено/Принят/Готовится/Готов" → "В работе"

The `statusBuckets` (lines 430-442) also uses `getOrderStatus` + `stageInfo.internal_code` for grouping, and `getSafeStatus` for display labels. Both are CV-52 compliant.

Grep for `ready` in the HEAD file shows NO unhandled `ready` status — it falls through to the `else` branch which returns "В работе".

**Trade-offs:** None — this was already resolved in CV-B1-Core.

**Confidence note:** The task context was written against the pre-Core RELEASE (1164 lines) where `getSafeStatus` had the old 5-status model. HEAD has the fix.

---

### Q4: CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50 + CV-19

**Recommendation:** Remove both "Счёт стола" Card blocks (lines 891-900 and 903-912). Modify header (line 753-767) to show different label in "Стол" tab: "Заказано на стол: X ₸" instead of "N блюд · X ₸".

**Reasoning:**
- CV-50: monetary totals ONLY in header, no separate Card blocks.
- CV-19: "Стол" tab header should show "Заказано на стол: X ₸".
- HEAD has two Card blocks:
  - Lines 891-900: Full version in "Стол" tab — `cartTab === 'table'`
  - Lines 903-912: Mini version in "Мои" tab — `cartTab === 'my'`
- Both should be deleted.
- Header (lines 753-767) needs conditional logic based on `cartTab`.

**What "Заказано на стол" should sum:**
- In "Стол" tab: `tableTotal` (prop) — this is the full table sum including all guests (self + others). This matches UX-spec §348+ "total for the table".
- In "Мои" tab: keep current `headerTotal = ordersSum + cartTotalAmount` (just my orders + cart).

**Minimal diff sketch:**
```diff
@@ -753,8 +753,16 @@
             {/* CV-50: Dish count + total sum in drawer header (orders + cart) */}
             {(ordersSum > 0 || cart.length > 0) && (() => {
+              // CV-19: Different header label for Стол tab vs Мои tab
+              if (showTableOrdersSection && cartTab === 'table') {
+                return (
+                  <div className="text-xs text-slate-500 mt-0.5">
+                    {tr('cart.header.table_total', 'Заказано на стол')}: {formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}
+                  </div>
+                );
+              }
               const ordersItemCount = todayMyOrders.reduce((sum, o) => {
...

@@ -890,20 +898,0 @@
-      {/* SECTION 6: TABLE TOTAL — full version in Стол tab */}
-      {showTableOrdersSection && cartTab === 'table' && (
-        <Card className="mb-4 bg-slate-50">
-          ...
-        </Card>
-      )}
-
-      {/* Mini table total in Мои tab */}
-      {showTableOrdersSection && cartTab === 'my' && (
-        <Card className="mb-4 bg-slate-50">
-          ...
-        </Card>
-      )}
```

**New i18n key:** `cart.header.table_total` = "Заказано на стол"
**Removed i18n key:** `cart.table_total` (used only in the deleted Card blocks — grep confirms no other usage in CartView.jsx)

**Trade-offs:** The "Стол" tab header won't show dish count, only sum. This matches CV-19 which specifies just the total.

**Side-effects:** Removing ~20 lines. The `tableTotal` prop is still used in the header conditional, so it stays.

**Test plan:**
1. Multi-guest session, "Мои" tab — header shows "N блюд · X ₸" (unchanged).
2. Switch to "Стол" tab — header shows "Заказано на стол: X ₸", no separate "Счёт стола" Card.

---

### Q5: CV-BUG-11 (P2) — Button "Оценить блюда гостей" not in spec

**Recommendation:** Delete the button block (lines 872-883). Keep `otherGuestsReviewableItems` and `openReviewDialog` props — they may be used elsewhere and are received as props (defined in x.jsx).

**Reasoning:**
- CV-20 privacy: guests don't rate other guests' dishes.
- The button at lines 872-883 is the only place `otherGuestsReviewableItems` is consumed in CartView.jsx.
- `otherGuestsReviewableItems` is a prop (line 66), so we can't remove its computation — that's in x.jsx.
- `openReviewDialog` is a prop (line 62) also used potentially elsewhere.
- Removing just the JSX block is the cleanest approach. The unused prop destructuring at lines 62, 66 can stay — removing props from destructuring is cosmetic and risks breaking if x.jsx passes them.

**Minimal diff sketch:**
```diff
@@ -872,12 +872,0 @@
-                {/* Review button for other guests' dishes */}
-                {otherGuestsReviewableItems.length > 0 && (
-                  <Button
-                    variant="outline"
-                    size="sm"
-                    className="w-full mt-2"
-                    onClick={() => openReviewDialog(otherGuestsReviewableItems)}
-                  >
-                    ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
-                    {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
-                  </Button>
-                )}
```

**Orphaned i18n key:** `review.rate_others` — grep across project needed to confirm no other usage before removing from translations.

**Side-effects:** None functionally. The "Стол" tab expanded section just won't have a review button at the bottom.

**Test plan:**
1. Multi-guest session, "Стол" tab, expand guest section — no "Оценить блюда гостей" button.
2. "Мои" tab rating flow (via "Оценить" chip on served bucket) still works.

---

### Q6: CV-BUG-12 (P1) — Label "Гость 5331" instead of "Гость N" (CV-13)

**Recommendation:** Option A — sequential index from `otherGuestIdsFromOrders`.

**Reasoning:**
- `getGuestLabelById` (lines 500-506): fallback uses `gid.slice(-4)` producing IDs like "5331" which are meaningless to the guest.
- Root cause: the guest isn't in `sessionGuests` array (incomplete fetch / race). This is a data-layer issue in x.jsx — fixing the fetch is out of scope for CV-B1-Polish.
- Option A is safe: `otherGuestIdsFromOrders.indexOf(gid) + 2` gives stable sequential numbers (self = implied "1", others start at 2).
- Option C (A + console.warn) would be nice for QA, but rule says no console.log in production. Could use a comment instead.
- The order of `otherGuestIdsFromOrders` is derived from `ordersByGuestId` (Map insertion order from `sessionOrders`), which is stable within a render cycle. Between polling cycles the order may shift if new guests appear, but sequential numbers would still be meaningful.

**Minimal diff sketch:**
```diff
@@ -500,7 +500,7 @@
   const getGuestLabelById = (guestId) => {
     const gid = String(guestId);
     const found = (sessionGuests || []).find((g) => String(g.id) === gid);
     if (found) return getGuestDisplayName(found);
-    const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
-    return `${tr("cart.guest", "Гость")} ${suffix}`;
+    const idx = otherGuestIdsFromOrders.indexOf(gid);
+    return `${tr("cart.guest", "Гость")} ${idx >= 0 ? idx + 2 : '?'}`;
   };
```

**Trade-offs:**
- Numbers may shift between renders if guest order changes — acceptable for a fallback path that shouldn't normally be hit.
- `'?'` fallback for truly unknown IDs (not in otherGuestIdsFromOrders) is better than a random 4-digit suffix.

**Side-effects:** None — only affects the fallback display in table-orders section.

**Test plan:**
1. Multi-guest session (3 guests), "Стол" tab — guests show as "Гость 2", "Гость 3" (not "Гость 5331").
2. If a guest has a name in sessionGuests, their actual name shows (existing path, unchanged).

---

### Q7: CV-BUG-13 (P2) — Pluralization "17 блюда"

**Recommendation:** Inline `pluralRu` helper in CartView.jsx (3 lines). No separate file — minimal diff principle.

**Reasoning:**
- No existing `pluralize`/`plural` helper found in the project (grep returned empty across components/, hooks/, pages/PublicMenu/).
- Russian pluralization rules: `n % 10 === 1 && n % 100 !== 11` → singular, `n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)` → few, else → many.
- HEAD line 764: `{totalDishCount} {tr('cart.header.dishes', 'блюда')}` — always "блюда".
- Use 3 i18n keys for the 3 forms: `cart.header.dish_one` ("блюдо"), `cart.header.dish_few` ("блюда"), `cart.header.dish_many` ("блюд").

**Minimal diff sketch:**
```diff
@@ +287 (after trFormat, before getSafeStatus)
+  const pluralRu = (n, one, few, many) => {
+    const abs = Math.abs(n) % 100;
+    const last = abs % 10;
+    if (abs > 10 && abs < 20) return many;
+    if (last > 1 && last < 5) return few;
+    if (last === 1) return one;
+    return many;
+  };

@@ -764
-                  {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
+                  {totalDishCount} {pluralRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
```

**New i18n keys:**
- `cart.header.dish_one` = "блюдо"
- `cart.header.dish_few` = "блюда"
- `cart.header.dish_many` = "блюд"

**Removed i18n key:** `cart.header.dishes` (replaced by the 3 above).

**Trade-offs:** Inline helper means it's not reusable. But creating a shared utility file is a larger change, and this is the only pluralization site in CartView. Can extract later if needed.

**Side-effects:** None.

**Test plan:**
1. 1 item → "1 блюдо · X ₸"
2. 3 items → "3 блюда · X ₸"
3. 17 items → "17 блюд · X ₸"
4. 21 items → "21 блюдо · X ₸"

---

### Q8: CV-BUG-06 (L) — `o.status === 'cancelled'` (line 422)

**Recommendation:** Replace direct `o.status` check with `getOrderStatus`-based check, consistent with how `statusBuckets` (lines 430-442) already handles it.

**Reasoning:**
- Line 422: `.filter(o => o.status !== 'cancelled')` — reads raw `o.status` which may not reflect the stage-based status from SOM.
- CV-B1-Core fixed `statusBuckets` (lines 430-442) to use `getOrderStatus(o)` + `stageInfo.internal_code` for grouping, but left the `todayMyOrders` filter on line 422 using raw `o.status`.
- `getOrderStatus` returns an object with `internal_code` (from stage mapping). For cancelled, we need to check if the internal code maps to cancelled, OR if raw `o.status` is 'cancelled' (fallback when no stage info).
- Looking at HEAD lines 435-437: the `statusBuckets` already has the pattern — `isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled'`. But this doesn't catch stage-based cancellation.
- Simplest fix: use the same pattern from `statusBuckets` inline in the filter. Since `statusBuckets` already filters out cancelled orders (line 438-439: they're not pushed to any group), the `todayMyOrders` filter at line 422 is actually redundant for bucket display. However, `todayMyOrders` is also used for `ordersSum` (line 465) and `ordersItemCount` (line 755), so the filter is needed.
- Safest minimal approach: keep the filter but also check via `getOrderStatus`.

**Minimal diff sketch:**
```diff
@@ -422
-      .filter(o => o.status !== 'cancelled')
+      .filter(o => {
+        const info = getOrderStatus(o);
+        if (info?.internal_code === 'cancel') return false;
+        if (!info?.internal_code && (o.status || '').toLowerCase() === 'cancelled') return false;
+        return true;
+      })
```

**Note:** Need to verify what `getOrderStatus` returns for cancelled stages. The `internal_code` for cancellation might be `'cancel'` or something else — grep in the hooks/order logic would confirm, but that's outside CartView.jsx. The pattern at line 437 uses `(o.status || '').toLowerCase() === 'cancelled'` as fallback, suggesting `internal_code` might not have a cancel code. If `getOrderStatus` never returns a cancel `internal_code`, the first check is harmless (never triggers) and the fallback handles it.

**Risk:** If `getOrderStatus` is expensive (it's called per order), adding it to the filter adds N calls. But `statusBuckets` already calls it per order (line 434), and `todayMyOrders` feeds `statusBuckets`, so the total call count stays roughly the same.

**Side-effects:** Cancelled orders that were previously shown (if their status came from stage rather than raw `o.status`) will now be correctly hidden.

**Test plan:**
1. Waiter cancels an order via SOM → CartView should NOT show the cancelled order in any bucket or in totals.
2. Verify `ordersSum` and header dish count exclude cancelled orders.

---

## Summary Table

| # | Question | Bug | CC Recommendation | Confidence |
|---|----------|-----|-------------------|------------|
| 1 | CV-BUG-07 (P0) | FP in money | Fix at computation (`toFixed(2)`) on `tableOrdersTotal` + `guestTotal` | high |
| 2 | CV-BUG-08 (P0) | Wrong CTA label | Change to filled "Вернуться в меню" | high |
| 3 | CV-BUG-09 (P1) | "Готово" badge | **Already fixed in HEAD** — no action | high |
| 4 | CV-BUG-10 (P1) | "Счёт стола" blocks | Delete Card blocks, add conditional header for Стол tab | high |
| 5 | CV-BUG-11 (P2) | Rate others button | Delete button block (12 lines) | high |
| 6 | CV-BUG-12 (P1) | "Гость 5331" | Option A — sequential index fallback | medium |
| 7 | CV-BUG-13 (P2) | "17 блюда" | Inline `pluralRu` helper + 3 i18n keys | high |
| 8 | CV-BUG-06 (L) | Raw `o.status` | Use `getOrderStatus` in filter | medium |

## i18n Keys Summary

| Action | Key | Value (RU) |
|--------|-----|------------|
| ADD | `cart.cta.back_to_menu` | Вернуться в меню |
| ADD | `cart.header.table_total` | Заказано на стол |
| ADD | `cart.header.dish_one` | блюдо |
| ADD | `cart.header.dish_few` | блюда |
| ADD | `cart.header.dish_many` | блюд |
| REMOVE | `cart.cta.order_more` | (verify no other usage first) |
| REMOVE | `cart.table_total` | (verify no other usage first) |
| REMOVE | `cart.header.dishes` | (replaced by 3 plural forms) |
| ORPHAN? | `review.rate_others` | (check project-wide usage) |

## Orphan Vars/Functions to Remove

None. All props (`otherGuestsReviewableItems`, `openReviewDialog`) are defined in x.jsx and passed as props — removing them from destructuring is cosmetic. The only JSX removal is the button block (Q5).

## KS Recommendation

One KS for all 7 remaining bugs (Q3 is already fixed). Estimated net change: ~+15 lines (helper), ~-35 lines (deleted blocks), ~10 modified lines = small batch. $12 budget is sufficient. Splitting into multiple KS would add overhead without benefit — all changes are independent and non-conflicting.

## Prompt Clarity

- Overall clarity: 4/5
- Ambiguous questions: Q4 (#4) — unclear whether "Заказано на стол" should sum `tableTotal` (all guests) or `tableOrdersTotal` (others only). I assumed `tableTotal` based on the label semantics ("на стол" = whole table).
- Missing context: Line number mapping between the task context (1164-line RELEASE) and HEAD (1223 lines) caused confusion — several bugs (Q3, Q8) were partially addressed in CV-B1-Core. A note about which bugs might already be fixed in HEAD would have saved analysis time.
- The NULL bytes warning was helpful.
