# CV-B1-Polish — Unified Fix Plan S283
Chain: cartview-260415-155221-ae43
Discussion mode: CC-only (Codex position missing)
Date: 2026-04-15
Target: `pages/PublicMenu/CartView.jsx` (HEAD ~1223 lines)

---

## Bug Fix Plan (7 active + 1 skipped)

### 1. CV-BUG-07 (P0) — Floating point in monetary sums

**Lines:** ~497 (`tableOrdersTotal` return), ~825 (`guestTotal` reduce)
**Root cause:** Raw `sum +=` without rounding produces IEEE 754 artifacts.
**Fix pattern:** `parseFloat(sum.toFixed(2))` — same as 6+ existing sites in HEAD.

**Minimal diff:**
```diff
@@ tableOrdersTotal useMemo return (~line 497)
-    return sum;
+    return parseFloat(sum.toFixed(2));

@@ guestTotal reduce (~line 825)
-  const guestTotal = guestOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0);
+  const guestTotal = parseFloat(guestOrders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2));
```

**Side-effects:** None. Only affects display values in Стол tab.
**Test:** Multi-guest, items 1099.29 × 3 → shows "3 169.87 ₸", not "3 169.870000...".

---

### 2. CV-BUG-08 (P0) — Footer CTA "Заказать ещё" → "Вернуться в меню"

**Lines:** ~1209-1218
**Root cause:** CV-70 regression — wrong label and styling for empty-cart state.

**Minimal diff:**
```diff
@@ empty-cart CTA (~lines 1209-1218)
-  <Button variant="outline" size="lg"
-    className="w-full min-h-[44px]"
-    style={{borderColor: primaryColor, color: primaryColor}}
+  <Button size="lg"
+    className="w-full min-h-[44px] text-white"
+    style={{backgroundColor: primaryColor}}
     onClick={() => { onClose ? onClose() : setView("menu"); }}
   >
-    {tr('cart.cta.order_more', 'Заказать ещё')}
+    {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
   </Button>
```

**Side-effects:** None. Action unchanged, only label/style.
**Test:** Empty cart + active orders → filled button "Вернуться в меню" → taps to menu.

---

### 3. CV-BUG-09 (P1) — SKIP (already fixed in CV-B1-Core)

`getSafeStatus` in HEAD (lines 299-338) already implements CV-52 2-status model. `ready`/`prepared` → "В работе". No diff needed.

---

### 4. CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50 + CV-19

**Lines:** ~891-900 (Card full), ~903-912 (Card mini), ~753-767 (header)
**Root cause:** Separate Card blocks show monetary totals; CV-50 says totals only in header. CV-19 specifies Стол tab header as "Заказано на стол: X ₸".

**Minimal diff:**
```diff
@@ header area (~lines 753-767) — add conditional
+  if (showTableOrdersSection && cartTab === 'table') {
+    return (
+      <div className="text-xs text-slate-500 mt-0.5">
+        {tr('cart.header.table_total', 'Заказано на стол')}: {formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}
+      </div>
+    );
+  }
   // existing "N блюд · X ₸" for Мои tab follows...

@@ delete Card blocks (~lines 891-912)
-  {/* SECTION 6: TABLE TOTAL */}
-  {showTableOrdersSection && cartTab === 'table' && (
-    <Card ...> ... </Card>
-  )}
-  {showTableOrdersSection && cartTab === 'my' && (
-    <Card ...> ... </Card>
-  )}
```

**Side-effects:** ~20 lines deleted. `tableTotal` prop still used in header — stays.
**Test:** Мои → "N блюд · X ₸". Стол → "Заказано на стол: X ₸", no Card blocks.

**⚠ Arman decision:** Does "Заказано на стол" use `tableTotal` (all guests incl. self) or `tableOrdersTotal` (others only)? CC recommends `tableTotal` per "на стол" semantics.

---

### 5. CV-BUG-11 (P2) — Button "Оценить блюда гостей" not in spec

**Lines:** ~872-883 (12 lines)
**Root cause:** CV-20 privacy violation — guests shouldn't rate others' dishes.

**Minimal diff:**
```diff
@@ delete button block (~lines 872-883)
-  {otherGuestsReviewableItems.length > 0 && (
-    <Button variant="outline" size="sm" className="w-full mt-2"
-      onClick={() => openReviewDialog(otherGuestsReviewableItems)}
-    >
-      ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
-      {loyaltyAccount && ...}
-    </Button>
-  )}
```

**Side-effects:** Props `otherGuestsReviewableItems`, `openReviewDialog` stay (defined in x.jsx).
**Test:** Стол tab expanded → no rate-others button. Мои tab rating → still works.

---

### 6. CV-BUG-12 (P1) — Label "Гость 5331" → "Гость N"

**Lines:** ~500-506 (`getGuestLabelById` fallback)
**Root cause:** Fallback uses `gid.slice(-4)` showing raw session ID fragment.

**Minimal diff:**
```diff
@@ getGuestLabelById fallback (~lines 503-504)
-    const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
-    return `${tr("cart.guest", "Гость")} ${suffix}`;
+    const idx = otherGuestIdsFromOrders.indexOf(gid);
+    return `${tr("cart.guest", "Гость")} ${idx >= 0 ? idx + 2 : '?'}`;
```

**Side-effects:** Guest numbers may shift between polling cycles if new guests appear. Acceptable for fallback path.
**Test:** Multi-guest (3), Стол tab → "Гость 2", "Гость 3" (not "Гость 5331").

**Risk:** Root cause (missing guest in sessionGuests) deferred to CV-B1b (#334).

---

### 7. CV-BUG-13 (P2) — Pluralization "17 блюда"

**Lines:** ~764 (header dish count), new helper after ~line 287
**Root cause:** Static "блюда" form for all counts.

**Minimal diff:**
```diff
@@ after trFormat, before getSafeStatus (~line 287)
+  const pluralRu = (n, one, few, many) => {
+    const abs = Math.abs(n) % 100;
+    const last = abs % 10;
+    if (abs > 10 && abs < 20) return many;
+    if (last > 1 && last < 5) return few;
+    if (last === 1) return one;
+    return many;
+  };

@@ header Мои-tab branch (~line 764, inside Q4 conditional)
-  {totalDishCount} {tr('cart.header.dishes', 'блюда')}
+  {totalDishCount} {pluralRu(totalDishCount,
+    tr('cart.header.dish_one', 'блюдо'),
+    tr('cart.header.dish_few', 'блюда'),
+    tr('cart.header.dish_many', 'блюд'))}
```

**Side-effects:** None. Only affects Мои tab header (Стол tab uses Q4's "Заказано на стол" without count).
**Test:** 1→"блюдо", 3→"блюда", 17→"блюд", 21→"блюдо".

---

### 8. CV-BUG-06 (L) — Raw `o.status === 'cancelled'`

**Lines:** ~422
**Root cause:** Direct `o.status` read bypasses stage-based status (same root as CV-BUG-05, fixed in statusBuckets but not here).

**Minimal diff:**
```diff
@@ todayMyOrders filter (~line 422)
-  .filter(o => o.status !== 'cancelled')
+  .filter(o => {
+    const info = getOrderStatus(o);
+    if (info?.internal_code === 'cancel') return false;
+    if (!info?.internal_code && (o.status || '').toLowerCase() === 'cancelled') return false;
+    return true;
+  })
```

**Side-effects:** `getOrderStatus` called per order (already called in statusBuckets). Minor perf duplication, acceptable.
**Test:** Waiter cancels order in SOM → CartView hides it in all views + totals.

---

## i18n Keys Summary

| Action | Key | RU | EN suggestion |
|--------|-----|----|---------------|
| ADD | `cart.cta.back_to_menu` | Вернуться в меню | Back to menu |
| ADD | `cart.header.table_total` | Заказано на стол | Table total |
| ADD | `cart.header.dish_one` | блюдо | dish |
| ADD | `cart.header.dish_few` | блюда | dishes |
| ADD | `cart.header.dish_many` | блюд | dishes |
| REMOVE | `cart.cta.order_more` | verify no other usage | — |
| REMOVE | `cart.table_total` | verify no other usage | — |
| REPLACE | `cart.header.dishes` | replaced by 3 forms | — |
| ORPHAN? | `review.rate_others` | grep project-wide | — |

## Orphan Vars/Functions

None to remove from CartView.jsx. Props from x.jsx stay as-is (out of scope).

## Execution Order

1. **Q4** — largest structural change (header + Card deletion)
2. **Q5** — adjacent block deletion
3. **Q7** — header pluralization (depends on Q4 header rewrite)
4. **Q1** — FP rounding (independent)
5. **Q2** — CTA label (independent)
6. **Q6** — guest label fallback (independent)
7. **Q8** — cancelled filter (independent)

## Estimated Diff Size

| Bug | Lines added | Lines removed | Lines modified |
|-----|-------------|---------------|----------------|
| Q1 (BUG-07) | 0 | 0 | 2 |
| Q2 (BUG-08) | 0 | 0 | 6 |
| Q3 (BUG-09) | 0 | 0 | 0 (skip) |
| Q4 (BUG-10) | 8 | 20 | 0 |
| Q5 (BUG-11) | 0 | 12 | 0 |
| Q6 (BUG-12) | 0 | 0 | 2 |
| Q7 (BUG-13) | 8 | 0 | 1 |
| Q8 (BUG-06) | 4 | 1 | 0 |
| **Total** | **~20** | **~33** | **~11** |

Net: ~1210 lines (down from ~1223). Within F3 threshold (>95% of original).

## KS Recommendation

**One KS C5v2 for all 7 fixes.** Budget: $12 sufficient. All changes in single file, independent, non-conflicting. Splitting adds overhead without benefit.

## Risks

1. **Q4+Q7 line overlap** — must apply Q4 first, Q7 second.
2. **NULL bytes** — KS must handle with python3 workaround for grep.
3. **No Codex review** — Q4 (largest change) and Q6 (stability) have reduced confidence.
4. **Q8 `getOrderStatus` shape** — verify `internal_code` values for cancel stages during KS.
5. **`tableTotal` definition** — verify it includes self+others (Arman to confirm for Q4).
