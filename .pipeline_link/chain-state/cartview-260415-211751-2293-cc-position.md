# CC Discussion Position — CartView
Chain: cartview-260415-211751-2293
Topic: CV-B1-Polish findings (8 bugs: CV-BUG-06..13)

## Questions Analyzed

### Q1: CV-BUG-07 (P0) — Floating point in monetary sums

**Recommendation:** Fix at each unprotected call-site by wrapping with `parseFloat(value.toFixed(2))` before passing to `formatPrice()`.

**Reasoning:**
I audited all 9 `formatPrice(...)` calls in CartView.jsx:

| Line | Expression | Protected by toFixed? |
|------|-----------|----------------------|
| 631 | `formatPrice(parseFloat(g.totalPrice.toFixed(2)))` | YES |
| 764 | `formatPrice(parseFloat(headerTotal.toFixed(2)))` | YES |
| **811** | `formatPrice(tableOrdersTotal)` | **NO** |
| **834** | `formatPrice(guestTotal)` | **NO** |
| **848** | `formatPrice(order.total_amount)` | **NO** (raw DB value, likely safe but inconsistent) |
| 896 | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 908 | `formatPrice(parseFloat(Number(tableTotal).toFixed(2)))` | YES |
| 1084 | `formatPrice(item.price)` | N/A (single value, no sum) |
| 1087 | `formatPrice(parseFloat((item.price * item.quantity).toFixed(2)))` | YES |

The symptom (`3 169.8700000000003 ₸`) comes from lines **811** and **834** — both are sums computed via `.reduce()` without rounding:
- `tableOrdersTotal` (line 489-498): sum via `.reduce()`, no `.toFixed(2)`.
- `guestTotal` (line 825): inline `.reduce()`, no `.toFixed(2)`.

`formatPrice` is a prop passed from parent (not defined in this file), so fixing it globally would affect all pages — risky for a Polish batch.

**Minimal diff:**
- Line 811: `{formatPrice(tableOrdersTotal)}` → `{formatPrice(parseFloat(tableOrdersTotal.toFixed(2)))}`
- Line 834: `{formatPrice(guestTotal)}` → `{formatPrice(parseFloat(guestTotal.toFixed(2)))}`
- Line 848: `{formatPrice(order.total_amount)}` → `{formatPrice(parseFloat(Number(order.total_amount).toFixed(2)))}` (defensive, optional)

**Side-effects:** None — these are display-only changes. `tableOrdersTotal` value itself is used nowhere else for computation.

**Test plan:**
1. Open table tab with 2+ guests each having multi-item orders
2. Verify guest subtotals show exactly 2 decimal places
3. Verify "Заказы стола" header total shows 2 decimal places
4. Compare sum visually: guest subtotals should add up to header total

**Trade-offs:** Per-call-site fix is slightly verbose but safer than modifying `formatPrice` globally.
**Mobile UX:** Broken prices are highly visible on mobile screens — P0 confirmed.

---

### Q2: CV-BUG-08 (P0) — CV-70 regression: footer CTA "Заказать ещё" instead of "Вернуться в меню"

**Recommendation:** Replace the outline "Заказать ещё" button (lines 1210-1218) with primary filled "Вернуться в меню" using `primaryColor`.

**Reasoning:**
Lines 1209-1218 render the footer when `cart.length === 0`:
```jsx
<Button variant="outline" size="lg" className="w-full min-h-[44px]"
  style={{borderColor: primaryColor, color: primaryColor}}
  onClick={() => { onClose ? onClose() : setView("menu"); }}
>
  {tr('cart.cta.order_more', 'Заказать ещё')}
</Button>
```

CV-70 rule b (UX v7.0 FROZEN) says: when cart is empty + active/delivered orders exist → primary filled "Вернуться в меню". The label "Заказать ещё" was explicitly removed from UI per CV-70.

The i18n key `cart.cta.order_more` is used ONLY in this location in CartView.jsx (confirmed by grep). It may exist in other pages — recommend keeping the key in translations but removing this usage.

**Minimal diff:**
```diff
- <Button variant="outline" size="lg" className="w-full min-h-[44px]"
-   style={{borderColor: primaryColor, color: primaryColor}}
+ <Button size="lg" className="w-full min-h-[44px] text-white"
+   style={{backgroundColor: primaryColor}}
    onClick={() => { onClose ? onClose() : setView("menu"); }}
  >
-   {tr('cart.cta.order_more', 'Заказать ещё')}
+   {tr('cart.cta.back_to_menu', 'Вернуться в меню')}
  </Button>
```

**Side-effects:** New i18n key `cart.cta.back_to_menu` needed. The `cart.cta.order_more` key can remain in translations (may be used elsewhere). No other code references this button block.

**Test plan:**
1. Add items, submit order, then clear cart
2. Footer should show primary filled green "Вернуться в меню"
3. Tap it — should navigate to menu
4. Verify button style matches State A submit button (same `primaryColor` bg, white text)

**Trade-offs:** None — this is a direct spec compliance fix.
**Mobile UX:** Primary CTA is critical for mobile — outline button looks secondary and confuses guests about next action.

---

### Q3: CV-BUG-09 (P1) — Badge "Готово" in table tab (CV-52 violation)

**Recommendation:** Expand the `getSafeStatus` mapping (lines 300-339) to catch `ready`/`prepared`/`cooking` codes and map them to "В работе".

**Reasoning:**
Current `getSafeStatus` (line 300) handles:
- Translation-key labels: maps `done/served/completed` → "Выдано", `cancel/cancelled` → "Отменён", everything else → "В работе"
- Old Russian labels: maps "Подано" → "Выдано", "Отправлено"/"Принят"/"Готовится"/"Готов" → "В работе"

The bug: when `getOrderStatus(order)` returns a status object whose `label` is NOT a translation key (no dots) AND is NOT in the hardcoded Russian lists, it falls through to the raw label. Specifically, if `label` is "Готово" (differs from "Готов" in the list) — it passes through unmodified.

`getSafeStatus` is called at exactly 1 location: line 842 (table tab guest orders rendering). The `statusBuckets` in the "Мои" tab (line 431) uses `getOrderStatus` + `internal_code` directly, NOT `getSafeStatus` — so they use different mapping logic.

**Minimal diff (line ~326):**
```diff
- const oldInProgressLabels = ['Отправлено', 'Принят', 'Готовится', 'Готов'];
+ const oldInProgressLabels = ['Отправлено', 'Принят', 'Готовится', 'Готов', 'Готово'];
```

AND in the translation-key branch (line ~311), add `ready`/`prepared`/`cooking`/`accepted`/`pending` to the else-fallback path. Currently they already fall to the `else` → "В работе", so actually the translation-key branch is already correct. The problem is ONLY in the old-Russian-label branch where "Готово" is missing.

Also verify: does `getOrderStatus()` ever return `label: "Готово"` (with -о)? If the status object comes from a stage definition, the label depends on the partner's process config. The safest fix is to also add a catch-all: any label not explicitly "Выдано"/"Отменён" → "В работе".

**Better recommendation (catch-all approach):**
```diff
  } else if (label) {
    const oldServedLabels = ['Подано'];
-   const oldInProgressLabels = ['Отправлено', 'Принят', 'Готовится', 'Готов'];
    if (oldServedLabels.includes(label)) {
      label = tr('cart.group.served', 'Выдано');
-   } else if (oldInProgressLabels.includes(label)) {
+   } else if (label !== tr('status.cancelled', 'Отменён')) {
      label = tr('cart.group.in_progress', 'В работе');
    }
  }
```

This ensures ANY non-served, non-cancelled label maps to "В работе" — future-proof against new stage names.

**Side-effects:** The catch-all approach means any new status (even unexpected ones) will show as "В работе" to guests. This is the safer default per CV-52 (only 2 guest-facing statuses).

**Test plan:**
1. Have an order in "ready"/"Готово" stage
2. Open table tab → verify badge shows "В работе" not "Готово"
3. Order in "served" stage → verify shows "Выдано"
4. Order in any other stage → verify shows "В работе"

**Trade-offs:** Catch-all is less explicit but more resilient. Explicit list is safer but requires maintenance when new stages are added.
**Mobile UX:** Guests should never see kitchen-internal statuses — confusion risk.

---

### Q4: CV-BUG-10 (P1) — "Счёт стола" blocks violate CV-50 + CV-19

**Recommendation:** Delete both Card blocks (lines 890-900 and 902-912). Conditionally switch the header label in table tab to "Заказано на стол: X ₸" per CV-19.

**Reasoning:**
Two Card blocks render table totals:
- Lines 891-900: Full card in "Стол" tab with `tr('cart.table_total', 'Счёт стола')` + `formatPrice(tableTotal)`
- Lines 903-912: Mini card in "Мои" tab with same label

CV-50 says: money shown ONLY in drawer header. CV-19 says: table tab header shows "Заказано на стол: X ₸".

Currently the header (line 754-767) always renders the same label regardless of tab:
```jsx
{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(...)}
```

Need to conditionally switch when `cartTab === 'table'`:
- "Мои" tab: `{totalDishCount} {dishWord} · {formatPrice(headerTotal)}` (current)
- "Стол" tab: `{tr('cart.header.table_ordered', 'Заказано на стол')}: {formatPrice(tableTotalAll)}` where `tableTotalAll` = full table sum including self

The `tableTotal` prop is already available (used in the Card blocks being deleted) and represents the full table amount.

**Minimal diff:**
1. Delete lines 890-912 (both Card blocks)
2. At line ~762-764, wrap in conditional:
```diff
- {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
+ {showTableOrdersSection && cartTab === 'table'
+   ? <>{tr('cart.header.table_ordered', 'Заказано на стол')}: {formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}</>
+   : <>{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}</>
+ }
```

**Side-effects:**
- `cart.table_total` i18n key becomes orphaned after Card block removal — can be cleaned up.
- New key needed: `cart.header.table_ordered`.
- `tableTotal` prop is still used (now in header), not orphaned.

**Test plan:**
1. Open "Мои" tab → header shows "N блюд · X ₸"
2. Switch to "Стол" tab → header switches to "Заказано на стол: X ₸"
3. No separate "Счёт стола" card visible in either tab
4. Verify `tableTotal` matches expected sum

**Trade-offs:** Conditional header adds complexity to an already dense IIFE. Could extract to a small helper, but that's refactoring beyond scope.
**Mobile UX:** Removing duplicate money display reduces visual noise on small screens.

---

### Q5: CV-BUG-11 (P2) — "Оценить блюда гостей" button (privacy CV-20)

**Recommendation:** Delete the button block (lines 872-883). Keep `otherGuestsReviewableItems` prop and `openReviewDialog` — they may be used elsewhere.

**Reasoning:**
Lines 872-883 render a Button inside the table tab's expanded section:
```jsx
{otherGuestsReviewableItems.length > 0 && (
  <Button variant="outline" size="sm" className="w-full mt-2"
    onClick={() => openReviewDialog(otherGuestsReviewableItems)}>
    ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
    ...
  </Button>
)}
```

CV-20 (privacy) says guests should not rate each other's dishes. This button explicitly violates that.

Checking orphans:
- `otherGuestsReviewableItems` — is a prop (line 66), computed in parent (x.jsx). Used ONLY here in CartView.jsx (lines 66, 873, 878, 881). After removal, the prop becomes unused in CartView but the parent still computes it. The prop declaration at line 66 can stay (removing it requires parent change = out of scope) or be removed if safe.
- `openReviewDialog` — also used in the "Мои" tab flow for own dishes (via `renderBucketOrders` → inline rating). Actually checking: `openReviewDialog` is a prop (line 62) and is NOT called anywhere else in CartView.jsx except line 878. But it's used as a prop from parent, so it may be used in other scenarios. Keep the prop.
- `review.rate_others` i18n key — grep shows used only here. Can be removed from translations.

**Minimal diff:**
Delete lines 872-883 entirely.

**Side-effects:**
- `otherGuestsReviewableItems` prop becomes unused in this file (4 references removed). Parent still computes it. Leaving prop in destructuring is harmless.
- `review.rate_others` i18n key orphaned.
- `review.points` i18n key may be used elsewhere — check before removing.

**Test plan:**
1. Open table tab with multiple guests
2. Expand "Заказы стола" section
3. Verify no "Оценить блюда гостей" button visible
4. Verify own dish rating still works in "Мои" tab

**Trade-offs:** Minimal. Removing this button strictly follows the spec.
**Mobile UX:** Removing reduces clutter in table tab. Privacy is important in shared-table scenarios.

---

### Q6: CV-BUG-12 (P1) — Label "Гость 5331" instead of "Гость N"

**Recommendation:** Option A (index-based) for the Polish batch — use `otherGuestIdsFromOrders.indexOf(gid) + 2` as fallback.

**Reasoning:**
`getGuestLabelById` (lines 500-506):
```js
const getGuestLabelById = (guestId) => {
  const gid = String(guestId);
  const found = (sessionGuests || []).find((g) => String(g.id) === gid);
  if (found) return getGuestDisplayName(found);  // Uses guest.guest_number
  const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
  return `${tr("cart.guest", "Гость")} ${suffix}`;  // BUG: shows "Гость 5331"
};
```

The fallback triggers when a guest has orders but is NOT in `sessionGuests` array. This happens because:
1. `sessionGuests` may not include all guests (race condition, or entity not yet loaded)
2. The guest ID is a Base44 entity ID (long numeric), and `slice(-4)` gives meaningless digits

`getGuestDisplayName` from `sessionHelpers.js` (line 226-229) returns `guest.name || 'Гость ${guest.guest_number}'` — this is correct but requires a `SessionGuest` object with `guest_number`.

**Option A (safe, index-based):**
```diff
- const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
- return `${tr("cart.guest", "Гость")} ${suffix}`;
+ const idx = otherGuestIdsFromOrders.indexOf(gid);
+ const seqNum = idx >= 0 ? idx + 2 : '?';
+ return `${tr("cart.guest", "Гость")} ${seqNum}`;
```

Self = Guest 1 (implicit, shown as "Вы"), others = Guest 2, 3, 4... This is stable within a single render but numbers may shift between renders if `otherGuestIdsFromOrders` order changes (it's derived from `ordersByGuestId` Map iteration order, which is insertion order — generally stable).

**Option B (proper):** Fetch `SessionGuest` entity for missing guests. This requires adding a `useQuery` call and is architectural — out of scope for Polish batch.

**Side-effects (Option A):**
- `otherGuestIdsFromOrders` is already in closure scope (computed at line 485-487).
- Numbers are stable per render. Between renders, they may change if new guests appear (acceptable for Polish batch).
- Need to verify `getGuestLabelById` closure has access to `otherGuestIdsFromOrders` — yes, it's defined after it on line 500.

**Test plan:**
1. Open table tab with 3+ guests
2. If guest is in `sessionGuests` → should show name or "Гость N" with correct number
3. If guest NOT in `sessionGuests` (fallback) → should show "Гость 2"/"Гость 3" etc., NOT "Гость 5331"
4. Refresh page, verify numbers are consistent

**Trade-offs:** Option A may show "Гость 2" for a guest who was actually Guest 4 in the session. But this is far better than "Гость 5331" which is meaningless. Option B is the correct long-term fix.
**Mobile UX:** "Гость 5331" looks like a system ID and confuses guests — any sequential number is better.

---

### Q7: CV-BUG-13 (P2) — Pluralization "17 блюда" → "17 блюд"

**Recommendation:** Add inline `pluralizeRu` helper + separate English pluralization. Replace at line 764.

**Reasoning:**
Line 764 currently:
```jsx
{totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(...)}
```

This always shows "блюда" regardless of count. Russian pluralization rules:
- 1, 21, 31... → "блюдо"
- 2-4, 22-24... → "блюда"
- 5-20, 25-30... → "блюд"

Grep confirms: no existing `pluralize`/`plural` helper in components/hooks/utils (only a removed old one in CartView.jsx.bak2 line 715). Need to add inline.

**Minimal diff (add helper near line 298, after `trFormat`):**
```js
const pluralRu = (n, one, few, many) => {
  const abs = Math.abs(n);
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};
```

**Line 764 change:**
```diff
- {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
+ {totalDishCount} {pluralRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
```

This uses i18n keys for each form, so English translations can simply be `dish`/`dishes`/`dishes`.

**Side-effects:**
- New i18n keys: `cart.header.dish_one`, `cart.header.dish_few`, `cart.header.dish_many`. Old key `cart.header.dishes` becomes orphaned.
- `pluralRu` is defined inside the component — no external dependencies.

**Test plan:**
1. Have 1 dish in cart → "1 блюдо"
2. Have 3 dishes → "3 блюда"
3. Have 17 dishes → "17 блюд"
4. Have 21 dishes → "21 блюдо"

**Trade-offs:** Inline helper vs shared util — for one usage, inline is acceptable. If more pluralization needed later, extract to utils.
**Mobile UX:** Grammar errors look unprofessional. This is visible to every guest.

---

### Q8: CV-BUG-06 (L) — `o.status === 'cancelled'` (line 422)

**Recommendation:** Replace raw status check with stage-based check using `getOrderStatus` + `getSafeStatus`, matching the pattern used in `statusBuckets` (line 431-441).

**Reasoning:**
Line 422:
```js
.filter(o => o.status !== 'cancelled')
```

This is in `todayMyOrders` memo (line 405-428). It filters out cancelled orders using raw `o.status` field. Same root cause as CV-BUG-05 (fixed in CV-B1-Core for `statusBuckets`): `o.status` may not reflect the actual stage — the order process uses stages tracked by `getOrderStatus()`.

In `statusBuckets` (lines 431-441), the fix was:
```js
const isCancelled = !stageInfo?.internal_code && (o.status || '').toLowerCase() === 'cancelled';
```

For consistency, apply the same pattern:

**Minimal diff (line 422):**
```diff
- .filter(o => o.status !== 'cancelled')
+ .filter(o => {
+   const stage = getOrderStatus(o);
+   const isCancelled = stage?.internal_code === 'cancel'
+     || (!stage?.internal_code && (o.status || '').toLowerCase() === 'cancelled');
+   return !isCancelled;
+ })
```

**Side-effects:**
- `getOrderStatus` is called inside `todayMyOrders` useMemo but is NOT in its dependency array (line 428: `[myOrders]`). Need to add `getOrderStatus` to deps: `[myOrders, getOrderStatus]`.
- This changes when orders are filtered, which cascades to `statusBuckets`, `ordersSum`, and everything derived from `todayMyOrders`.

**Test plan:**
1. Cancel an order via waiter interface
2. In guest CartView, verify cancelled order disappears from both tabs
3. Verify non-cancelled orders still appear
4. Check that `ordersSum` excludes cancelled order

**Trade-offs:** Adding `getOrderStatus` to useMemo deps may cause more re-renders when `getOrderStatus` reference changes. If it's a stable callback (useCallback), no issue. If not, could cause performance regression — low risk for Polish batch.
**Mobile UX:** Not directly visible but prevents data inconsistency.

---

## Summary Table

| # | Bug | CC Recommendation | Confidence |
|---|-----|-------------------|------------|
| 1 | CV-BUG-07 (P0) FP sums | Fix 3 unprotected `formatPrice` call-sites with `toFixed(2)` | high |
| 2 | CV-BUG-08 (P0) Footer CTA | Replace outline "Заказать ещё" → primary filled "Вернуться в меню" | high |
| 3 | CV-BUG-09 (P1) Badge "Готово" | Catch-all in `getSafeStatus`: non-served/non-cancelled → "В работе" | high |
| 4 | CV-BUG-10 (P1) Table total cards | Delete both Card blocks + conditional header switch for table tab | high |
| 5 | CV-BUG-11 (P2) Rate others btn | Delete button block (lines 872-883) | high |
| 6 | CV-BUG-12 (P1) Guest label | Option A: index-based fallback `idx + 2` | medium |
| 7 | CV-BUG-13 (P2) Pluralization | Inline `pluralRu` helper + i18n keys per form | high |
| 8 | CV-BUG-06 (L) Cancelled filter | Stage-based check matching `statusBuckets` pattern | medium |

## Out-of-scope risks (max 5)

1. **Line 466**: `ordersSum` uses `todayMyOrders.reduce()` without `toFixed(2)` — same FP class as BUG-07 but already has `parseFloat(sum.toFixed(2))` return. OK.
2. **Line 436**: `statusBuckets` relies on `internal_code === 'finish'` — if stage config changes, served detection breaks. Not in scope.
3. **Line 1087**: Cart item total `(item.price * item.quantity)` could overflow for very expensive items — theoretical, not real risk.
4. **Lines 930-933**: "Ничего не ждёте" screen hardcodes emoji "✅" — not an i18n issue per se but worth noting.
5. **Line 1217**: After fixing BUG-08, the empty-cart + no-orders state still shows nothing (no footer). Edge case — empty cart with zero orders = no sticky footer at all. Verify this matches spec.

## Prompt Clarity

- Overall clarity: **4/5**
- Ambiguous questions:
  - Q4 (BUG-10): "сумма = `tableOrdersTotal + headerTotal` (уточнить, целый table или только others)" — unclear whether table tab header should show sum of ALL guests including self, or only others. I assumed `tableTotal` prop (which likely includes all) per CV-19 "Заказано на стол".
  - Q8 (BUG-06): Marked as "L" priority but PSSK says "same root cause as CV-BUG-05" — unclear if this is expected to be fixed in this batch or just documented.
- Missing context:
  - The UX spec (`260408-00 CartView UX S246.md`) was referenced but not read due to scope constraints. Would have helped verify CV-19 exact wording for table tab header.
  - Whether `getOrderStatus` is a stable reference (useCallback) — affects BUG-06 fix safety.
