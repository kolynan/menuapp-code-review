# CC Discussion Position — CartView
Chain: cartview-260415-184304-835e
Topic: CV-B1-Polish findings (8 bugs: CV-BUG-06..13)

## Questions Analyzed

### Q1: CV-BUG-07 (P0) — Floating point in monetary sums

**Recommendation:** Fix by adding `parseFloat(sum.toFixed(2))` at lines 497 and 825, consistent with 6+ existing sites. However, severity should be downgraded to **P2** (not P0).

**Reasoning:**
`formatPrice` in x.jsx (line 1159) already rounds internally via `Math.round(num * 100) / 100`. This means the display output is correct even with FP-error inputs. I verified: `formatPrice(3169.8700000000003)` → `Math.round(316987.00000000003) / 100 = 3169.87` → displays `"3 169.87 ₸"` correctly.

The two unprotected sites:
- **Line 497** (`tableOrdersTotal` return): raw `sum` without `toFixed(2)`. Value passed to `formatPrice` at line 811.
- **Line 825** (`guestTotal` reduce): raw `reduce` result. Value passed to `formatPrice` at line 834.

Both reach display exclusively through `formatPrice`, which handles rounding. The bug symptom ("3 169.87000000003 ₸") would only appear if `formatPrice` did NOT round — but it does. The bug may have been observed on an older version of `formatPrice`.

**Still worth fixing:** For consistency with the 6+ other sites that already use `parseFloat(toFixed(2))`, and to protect against future code paths that might use these values without `formatPrice`.

**formatPrice call-site audit (all 10 calls in CartView.jsx):**

| Line | Expression | Already protected? |
|------|-----------|-------------------|
| 631 | `formatPrice(parseFloat(g.totalPrice.toFixed(2)))` | YES |
| 764 | `formatPrice(parseFloat(headerTotal.toFixed(2)))` | YES |
| 811 | `formatPrice(tableOrdersTotal)` | NO — fix here |
| 834 | `formatPrice(guestTotal)` | NO — fix here |
| 848 | `formatPrice(order.total_amount)` | NO — raw DB field (no FP accumulation, safe) |
| 896 | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 908 | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 1084 | `formatPrice(item.price)` | NO — raw field (safe) |
| 1087 | `formatPrice(parseFloat((item.price * item.quantity).toFixed(2)))` | YES |

Lines 811 and 834 are the only computed sums without protection.

**Minimal diff:**
```diff
@@ line 497
-    return sum;
+    return parseFloat(sum.toFixed(2));

@@ line 825
-  const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
+  const guestTotal = parseFloat(guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0).toFixed(2));
```

**Side-effects:** None. `tableOrdersTotal` used only at line 811. `guestTotal` used only at line 834.
**Test:** Multi-guest orders with items like 1099.29 x 3 — verify header and per-guest total display cleanly.

**Trade-offs:** Tiny perf cost of `toFixed` calls in useMemo. Negligible.
**Confidence:** High (fix is safe, defensive).

---

### Q2: CV-BUG-08 (P0) — CV-70 regression footer CTA

**Recommendation:** Change outline button to primary filled, label from "Заказать ещё" to "Вернуться в меню". Agree with Plan diff.

**Reasoning:**
Lines 1209-1218 show the empty-cart CTA:
```jsx
<Button variant="outline" size="lg"
  className="w-full min-h-[44px]"
  style={{borderColor: primaryColor, color: primaryColor}}
  onClick={() => { onClose ? onClose() : setView("menu"); }}
>
  {tr('cart.cta.order_more', 'Заказать ещё')}
</Button>
```

This renders when `cart.length === 0 && todayMyOrders.length > 0` (line 1181 condition). Per CV-70, when cart is empty but orders exist, the CTA should be a primary filled button saying "Вернуться в меню" — because the guest has already ordered and the action is "go back to browse."

**"Заказать ещё" vs "Вернуться в меню":** "Заказать ещё" implies the guest needs to order more (pushy), while "Вернуться в меню" is neutral navigation. CV-70 specifies the neutral form.

**i18n key `cart.cta.order_more` usage:** Grep shows it's only used in CartView.jsx (and its versioned copies). Safe to replace with `cart.cta.back_to_menu`. The old key can be orphaned (removed from translations in x.jsx in a separate batch).

**Minimal diff:**
```diff
@@ lines 1210-1217
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

**Side-effects:** None. Action unchanged. Only label and styling change.
**Test:** Empty cart + todayMyOrders > 0 → see filled primary "Вернуться в меню" → tap → returns to menu.

**Trade-offs:** None.
**Mobile UX:** Primary filled button is more visible and provides clearer affordance on mobile — the ghost/outline button can be easily missed, especially in bright light.
**Confidence:** High.

---

### Q3: CV-BUG-09 (P1) — Badge "Готово" in Стол tab (CV-52)

**Recommendation:** SKIP — already adequately handled in current `getSafeStatus` implementation, with one minor gap to note.

**Reasoning:**
`getSafeStatus` (lines 300-338) implements a 2-tier mapping:

**Tier 1 (translation-key labels, lines 308-322):**
- Extracts code from last segment of key (e.g., `orderprocess.stages.ready` → `ready`)
- `['done', 'served', 'completed']` → "Выдано"
- `['cancel', 'cancelled']` → "Отменён"  
- Everything else → "В работе" (catch-all at line 321)

This handles `ready`, `prepared`, `cooking`, `accepted`, `new` etc. correctly — all fall to "В работе". **No bug here.**

**Tier 2 (plain Russian labels, lines 323-332):**
- `['Подано']` → "Выдано"
- `['Отправлено', 'Принят', 'Готовится', 'Готов']` → "В работе"
- Anything not matched passes through AS-IS (line 336: `label: label`)

**Potential gap:** If `getOrderStatus` returns a plain label "Готово" (neuter form), it would NOT match "Готов" (masculine short form) in `oldInProgressLabels`, and would display as-is: "Готово". However:
1. I cannot verify whether "Готово" ever appears as a real status label without seeing the partner's stage config.
2. The PSSK symptom "🟡 Готово" may refer to this exact case.
3. The Plan (line 59-61) says this is "already fixed in CV-B1-Core."

**If the bug IS still present**, the fix would be adding "Готово" to `oldInProgressLabels` at line 326. But this is speculative — the catch-all at line 321 handles all translation-key-format labels, and the plain-string path (Tier 2) only applies to legacy Russian labels from before the i18n migration.

**Side-effects of adding "Готово":** None. It's a safe addition to the mapping array.
**Test:** Would need a partner whose stages produce "Готово" as a plain label (not a translation key).

**Trade-offs:** Skip = no unnecessary code change. Add = more defensive.
**Confidence:** Medium (can't verify whether "Готово" actually appears in production data).

---

### Q4: CV-BUG-10 (P1) — "Счёт стола" Card blocks violate CV-50 + CV-19

**Recommendation:** Delete both Card blocks (lines 890-912). In header, add conditional for Стол tab showing "Заказано на стол: X ₸". Use `tableTotal` (all guests including self) for the amount.

**Reasoning:**
Two Card blocks exist that show "Счёт стола":
- **Lines 890-899:** Full Card in Стол tab — `{tr('cart.table_total', 'Счёт стола')}: {formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}`
- **Lines 902-911:** Mini Card in Мои tab — same content, smaller styling

CV-50 says totals should only appear in the header area, not as separate cards. CV-19 specifies the Стол tab header should read "Заказано на стол: X ₸".

**Header modification (lines 753-767):** Currently shows `{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(headerTotal)}` for all tabs. Need conditional:
- Мои tab: keep existing `"N блюд · X ₸"` (with pluralization fix from Q7)
- Стол tab: show `"Заказано на стол: X ₸"`

**Key decision — which amount for "Заказано на стол":**
- `tableTotal` (prop, line 67) = all guests including self — this is the "table total"
- `tableOrdersTotal` (line 489) = only OTHER guests' orders

Semantically "Заказано на стол" means "ordered for the table" = ALL guests. **Recommend `tableTotal`.**

**Minimal diff sketch:**
```diff
@@ lines 753-767 (header IIFE)
+  if (showTableOrdersSection && cartTab === 'table') {
+    return (
+      <div className="text-xs text-slate-500 mt-0.5">
+        {tr('cart.header.table_total', 'Заказано на стол')}: {formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}
+      </div>
+    );
+  }
   // existing Мои tab header continues...

@@ delete lines 890-912 (both Card blocks)
-  {/* SECTION 6: TABLE TOTAL — full version in Стол tab */}
-  {showTableOrdersSection && cartTab === 'table' && ( <Card ...> ... </Card> )}
-  {/* Mini table total in Мои tab */}
-  {showTableOrdersSection && cartTab === 'my' && ( <Card ...> ... </Card> )}
```

**Side-effects:**
- `tableTotal` prop stays (used in header now).
- `cart.table_total` i18n key can be orphaned (replaced by `cart.header.table_total`).
- ~20 lines deleted.
- Need to verify the header IIFE structure supports early return for the Стол tab branch.

**Test:** Мои tab → "N блюд · X ₸" in header, no Card. Стол tab → "Заказано на стол: X ₸" in header, no Card.

**Trade-offs:** Structural change to header IIFE — must be careful with the early return. The IIFE at line 754 computes `ordersItemCount`, `cartItemCount`, `totalDishCount`, `headerTotal` — the Стол-tab branch doesn't need these, so early return before those computations is safe.

**Decision needed from Arman:** Confirm `tableTotal` (all guests) for "Заказано на стол".
**Confidence:** High (clear UX spec violation, straightforward fix).

---

### Q5: CV-BUG-11 (P2) — Button "Оценить блюда гостей" not in spec

**Recommendation:** Delete the button block (lines 872-883). Do not remove props or computations.

**Reasoning:**
Lines 872-883:
```jsx
{otherGuestsReviewableItems.length > 0 && (
  <Button variant="outline" size="sm" className="w-full mt-2"
    onClick={() => openReviewDialog(otherGuestsReviewableItems)}
  >
    ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
    {loyaltyAccount && ...}
  </Button>
)}
```

CV-20 (privacy) says guests should not rate other guests' dishes. This button is in the Стол tab's expanded section and directly violates this rule.

**Orphan analysis:**
- `otherGuestsReviewableItems` — prop from x.jsx (line 66). Used ONLY at lines 873, 878, 881 in CartView.jsx. After deletion, the prop is unused in CartView but still computed in x.jsx. **Leave the prop** — removing it from x.jsx is out of scope (separate file).
- `openReviewDialog` — prop (line 62). Used at line 878 AND for own dishes rating elsewhere. **Keep.**
- `review.rate_others` i18n key — used only in CartView.jsx (and old versions). Will be orphaned. **Leave in translations for now** (cleanup is a separate task).

**Minimal diff:**
```diff
@@ delete lines 872-883
-  {/* Review button for other guests' dishes */}
-  {otherGuestsReviewableItems.length > 0 && (
-    <Button variant="outline" size="sm" className="w-full mt-2"
-      onClick={() => openReviewDialog(otherGuestsReviewableItems)}
-    >
-      ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
-      {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
-    </Button>
-  )}
```

**Side-effects:** None in CartView.jsx. Unused prop `otherGuestsReviewableItems` remains (harmless).
**Test:** Стол tab expanded → no "Оценить блюда гостей" button. Own dishes rating in Мои tab still works.

**Trade-offs:** Loyalty points incentive lost for cross-guest rating. But CV-20 privacy takes priority.
**Confidence:** High.

---

### Q6: CV-BUG-12 (P1) — Label "Гость 5331" instead of "Гость N"

**Recommendation:** Option A — use `otherGuestIdsFromOrders.indexOf(gid) + 2` for the fallback. This is the safe, minimal fix for the Polish batch.

**Reasoning:**
`getGuestLabelById` (lines 500-506):
```jsx
const getGuestLabelById = (guestId) => {
  const gid = String(guestId);
  const found = (sessionGuests || []).find((g) => String(g.id) === gid);
  if (found) return getGuestDisplayName(found);
  const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
  return `${tr("cart.guest", "Гость")} ${suffix}`;
};
```

The fallback at line 504-505 fires when a guest has orders in `ordersByGuestId` but is NOT found in `sessionGuests`. This happens when the `SessionGuest` entity wasn't loaded (race condition, or guest record created after x.jsx's initial query).

The fallback shows last 4 chars of the guest ID (like "5331"), violating CV-13 which requires sequential "Гость N" labels.

**Option A (recommended):** Replace fallback with index-based numbering:
```diff
@@ lines 503-505
-  const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
-  return `${tr("cart.guest", "Гость")} ${suffix}`;
+  const idx = otherGuestIdsFromOrders.indexOf(gid);
+  return `${tr("cart.guest", "Гость")} ${idx >= 0 ? idx + 2 : '?'}`;
```

Self = Гость 1 (not shown in Стол tab since it's "Вы"). Others get sequential 2, 3, 4...

**Option B (proper, deferred):** Fetch `SessionGuest` by ID or propagate `guest_number` from orders. Requires architectural changes in x.jsx — too large for Polish batch.

**Why Option A is acceptable:**
- `otherGuestIdsFromOrders` is stable within a render cycle (useMemo at line 485).
- Numbers may shift if new guests appear between polls, but this is the fallback path — when `sessionGuests` loads properly, `getGuestDisplayName` handles it correctly with the real `guest_number`.
- For the fallback case, sequential numbering is much better UX than raw ID fragments.

**Side-effects:** `otherGuestIdsFromOrders` must be in scope when `getGuestLabelById` is called. It IS — both defined at component level (lines 485 and 500).
**Test:** Multi-guest table where one guest's SessionGuest record is delayed → shows "Гость 2" not "Гость 5331".

**Trade-offs:** Numbers not globally stable across renders. Acceptable for fallback path.
**Mobile UX:** "Гость 5331" is confusing and meaningless to users. "Гость 2" is immediately understandable.
**Confidence:** High.

---

### Q7: CV-BUG-13 (P2) — Pluralization "17 блюда"

**Recommendation:** Add inline `pluralRu` helper after `trFormat` (around line 298), use it at line 764. Agree with Plan approach.

**Reasoning:**
Line 764: `{totalDishCount} {tr('cart.header.dishes', 'блюда')}` always shows "блюда" regardless of count.

Russian pluralization rules:
- 1 → блюдо (nominative singular)
- 2-4 → блюда (nominative plural)  
- 5-20 → блюд (genitive plural)
- 21 → блюдо, 22-24 → блюда, 25-30 → блюд (cycle by last digit, except teens)

**Existing helpers:** Grepped `pluraliz|plural` in components/, hooks/, pages/ — none found. No project-wide pluralization utility.

**Proposed helper (6 lines):**
```jsx
const pluralRu = (n, one, few, many) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
};
```

**Usage at line 764:**
```diff
-  {totalDishCount} {tr('cart.header.dishes', 'блюда')}
+  {totalDishCount} {pluralRu(totalDishCount,
+    tr('cart.header.dish_one', 'блюдо'),
+    tr('cart.header.dish_few', 'блюда'),
+    tr('cart.header.dish_many', 'блюд'))}
```

**Note on line 1142:** There's also `{tr('review.dishes_word', 'блюд')}` at line 1142 — this is a different context (review section) and uses a fixed "блюд" form. Could also benefit from pluralization, but it's a separate issue not in scope.

**i18n keys:** 3 new keys needed: `cart.header.dish_one`, `cart.header.dish_few`, `cart.header.dish_many`. Old `cart.header.dishes` becomes orphaned.

**English fallback:** For EN locale, `pluralRu` still works: `pluralRu(n, 'dish', 'dishes', 'dishes')` — `one` vs `few`/`many` covers English's simpler 1/many pattern.

**Side-effects:** None. Helper is local, only used in header.
**Test:** 1→"блюдо", 2→"блюда", 5→"блюд", 11→"блюд", 17→"блюд", 21→"блюдо", 101→"блюдо".

**Trade-offs:** Inline helper vs shared utility. For one usage site, inline is appropriate (YAGNI). If more plural sites emerge, extract to a shared helper.
**Confidence:** High.

---

### Q8: CV-BUG-06 (L) — `o.status === 'cancelled'` bypass

**Recommendation:** Replace raw `o.status` check at line 422 with `getOrderStatus`-based logic, matching the pattern used in `statusBuckets` (lines 431-442).

**Reasoning:**
Line 422: `.filter(o => o.status !== 'cancelled')` — this filters `todayMyOrders` by raw `o.status` field.

The same root cause was fixed for `statusBuckets` at lines 437: it uses both `stageInfo?.internal_code` and `o.status` fallback:
```jsx
const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
```

Line 422's raw check misses orders cancelled via stage transitions where `o.status` might still be 'active' but the stage is 'cancel'.

**Proposed fix (matching statusBuckets pattern):**
```diff
@@ line 422
-  .filter(o => o.status !== 'cancelled')
+  .filter(o => {
+    const info = getOrderStatus(o);
+    if (info?.internal_code === 'cancel') return false;
+    if (!info?.internal_code && (o.status || '').toLowerCase() === 'cancelled') return false;
+    return true;
+  })
```

**Why this matters:** If a waiter cancels an order via the stage-based process flow (not by setting `o.status = 'cancelled'`), the `statusBuckets` at line 437 would correctly exclude it, but the `todayMyOrders` filter at line 422 would still include it. This means the cancelled order appears in `todayMyOrders` → its amount gets added to `ordersSum` (line 466) → inflated header total.

**Performance note:** `getOrderStatus` is called per order in both the line-422 filter AND in `statusBuckets` (line 434). This is redundant but acceptable — the data is in memory (no I/O), and `todayMyOrders` is memoized.

**Side-effects:** `getOrderStatus` must be in the useMemo dependency array. Currently `todayMyOrders` at line 428 depends only on `[myOrders]`. Adding `getOrderStatus` would change the memo signature. However, looking at `statusBuckets` (line 442), it already depends on `[todayMyOrders, getOrderStatus]`, so the call chain is: `myOrders` changes → `todayMyOrders` re-computes → `statusBuckets` re-computes.

**For the fix:** `todayMyOrders` useMemo (line 428) must add `getOrderStatus` to its dependency array:
```diff
-  }, [myOrders]);
+  }, [myOrders, getOrderStatus]);
```

**Test:** Waiter cancels order via stage flow (not direct status change) → order disappears from CartView totals.

**Trade-offs:** Extra dependency in useMemo. Low risk — `getOrderStatus` is a stable function reference from props.
**Confidence:** High.

---

## Summary Table

| # | Bug | CC Recommendation | Confidence | Notes |
|---|-----|-------------------|------------|-------|
| 1 | CV-BUG-07 (P0→P2) | Fix with `parseFloat(toFixed(2))` at lines 497, 825 | High | `formatPrice` already rounds; fix is for consistency |
| 2 | CV-BUG-08 (P0) | Change to primary filled + "Вернуться в меню" | High | Clear CV-70 violation |
| 3 | CV-BUG-09 (P1) | SKIP (already handled), note "Готово" gap | Medium | Can't verify if "Готово" appears in prod |
| 4 | CV-BUG-10 (P1) | Delete Cards + conditional header | High | Arman to confirm `tableTotal` vs `tableOrdersTotal` |
| 5 | CV-BUG-11 (P2) | Delete button block lines 872-883 | High | CV-20 privacy violation |
| 6 | CV-BUG-12 (P1) | Option A: index-based fallback | High | Option B deferred to CV-B1b |
| 7 | CV-BUG-13 (P2) | Inline `pluralRu` + 3 i18n keys | High | No existing helper in project |
| 8 | CV-BUG-06 (L) | Use `getOrderStatus` pattern + add dep | High | Match statusBuckets pattern |

## Prompt Clarity

- Overall clarity: **4/5**
- Ambiguous questions:
  - Q1: PSSK says P0 but `formatPrice` already rounds — symptom may not be reproducible on current HEAD. Should have noted `formatPrice` internals.
  - Q4: "Заказано на стол: X ₸" — unclear whether amount is `tableTotal` (all guests) or `tableOrdersTotal` (others only). PSSK says "уточнить по UX spec" but no specific UX spec section was referenced by number.
  - Q3: PSSK says "badge Готово" but doesn't specify which stage config produces this label. Makes verification impossible without partner data.
- Missing context:
  - The `formatPrice` implementation (in x.jsx) should have been flagged as rounding-safe in the PSSK. This changes the severity assessment of CV-BUG-07.
  - UX spec `260408-00 CartView UX S246.md` was not found in the worktree's `ux-concepts/CartView/` directory — only the Plan file was there. The actual UX spec would have helped verify CV-70 states and CV-19 header text.
