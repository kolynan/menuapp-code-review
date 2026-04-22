# CC Writer Findings — PublicMenu
Chain: publicmenu-260328-083047-385c

## Findings

### Fix 1 — CV-01+CV-09: Section restructure

1. **[P1] Section filter uses English DB statuses but task describes Russian labels — mismatch risk.** Current code at lines 367-375 uses `o.status === 'served' || o.status === 'completed'` for served orders and excludes `served/completed/cancelled` for active. The task says to filter by `['Принят','Готовится','Готов']` → «Сейчас» and `['Подано','Выдан гостю']` → «История». However, the actual DB status values are ENGLISH (`served`, `completed`, `new`, `preparing`, `ready`, etc.), NOT Russian. The `getOrderStatus()` function returns an object with `{ icon, label, color }` where `label` is the Russian display text. **FIX:** Keep the existing English-based status filtering pattern. Rename `servedOrders` → `historyOrders` (statuses: `served`, `completed`). Rename `activeOrders` → `nowOrders` (everything else except `cancelled`). Add sub-grouping within `nowOrders` by status for the sub-headers. The urgency order for sub-headers should be: `ready` → `preparing` → `new`/other (mapping to Готов → Готовится → Принят).

2. **[P1] Section labels «Выдано»/«Заказано» must be renamed to «Сейчас»/«История».** Current code at line 784 uses `tr('cart.served', 'Выдано')` and line 817 uses `tr('cart.ordered', 'Заказано')`. **FIX:** Rename: line ~817 section → `⏱ Сейчас` (or `tr('cart.now_section', 'Сейчас')`). Line ~784 section → `📋 История` (or `tr('cart.history_section', 'История')`). History should be collapsed by default (already is — `servedExpanded` starts `false`). Swap render ORDER: «Сейчас» must render BEFORE «История» (currently «Выдано» renders before «Заказано» at lines 772-848 — swap so active/now renders first).

3. **[P1] Sub-headers within «Сейчас» section are missing.** Current `renderOrderItems()` (lines 457-530) shows each order with an individual status badge. The task requires grouping orders by status with status as sub-header (e.g., `── Готовится ──`). **FIX:** Create a new render function for «Сейчас» that groups `nowOrders` by their raw status, sorts groups by urgency (`ready` first, then `preparing`, then `new`/other), and renders a sub-header per group. Within each group, orders are sorted newest first (already handled by `todayMyOrders` sorting).

4. **[P1] Empty sections must not render.** Current code already has conditional rendering (`servedOrders.length > 0` at line 773, `activeOrders.length > 0` at line 806). **FIX:** Keep this pattern, ensure all three sections (Сейчас, История, Новый заказ) follow it. The cart section at line 865 already checks `cart.length > 0`. No additional change needed for this rule.

### Fix 2 — CV-02+CV-03: Sticky footer

5. **[P1] Footer is NOT sticky — ИТОГО + CTA are inside scrollable content.** The `ИТОГО за визит` card (lines 980-992) and submit button (lines 1007-1041) are inside the main scrollable `div`. The submit button has `className="sticky bottom-0"` (line 1009) but this only works within the scroll container, not as a true fixed footer. The entire CartView is rendered inside a `<div className="max-w-2xl mx-auto px-4 mt-2 pb-4">` (line 533) with no flex layout. **FIX:** Restructure CartView's root to use flex layout: `<div className="flex flex-col h-full">` wrapping a `<div className="flex-1 overflow-y-auto">` for scrollable content and a `<div className="border-t p-4 bg-white">` for the sticky footer. Move the total + CTA button out of the scrollable area into the footer div. Remove the spacer `<div className="h-16" />` at line 995. ⚠️ Do NOT use `position: relative` on children of DrawerContent (D7/KB-096).

6. **[P1] Footer content logic — three states needed.** Current footer always shows «Отправить заказ официанту» when cart has items. The task requires:
   - Cart NOT empty + previous orders exist → show «К отправке: X ₸» (bold) + «Всего: Y ₸» (small, gray) + primary «Отправить» button
   - Cart NOT empty + NO previous orders (first order) → show «ИТОГО: X ₸» (just cart total) + primary «Отправить» button
   - Cart IS empty → show «ИТОГО: X ₸» (total of all orders) + outline «Заказать ещё» button
   **FIX:** Replace the current ИТОГО card + submit button with a footer component that checks `cart.length > 0` and `todayMyOrders.length > 0` to determine which state to render. Use `cartGrandTotal` for «К отправке» and `visitTotal` for «Всего»/«ИТОГО». Wrap all sums with `parseFloat(total.toFixed(2))`.

7. **[P2] «ИТОГО ЗА ВИЗИТ» label should be removed.** Line 986: `tr('cart.visit_total', 'ИТОГО за визит')` — the task says to remove this label everywhere. **FIX:** Remove the standalone ИТОГО card (lines 980-992). The total now lives in the sticky footer with context-appropriate labels.

### Fix 3 — CV-04+CV-05: Remove stars until delivery

8. **[P1] Stars/Rating shown on ALL orders regardless of status.** In `renderOrderItems()` at lines 489-516, the rating component renders for every item when `reviewsEnabled` is true — no status check. **FIX:** Add a status check: only show rating UI when the order's status is `served` or `completed` (delivered). For non-delivered orders, show nothing (no stars, no CTA). For delivered orders, show a CTA button «Оценить блюда» instead of inline stars. Tapping the CTA expands to show the existing Rating component per item.

9. **[P2] «Оценить блюда» CTA button doesn't exist yet — currently shows empty stars.** The task requires replacing empty stars with a single «Оценить блюда» button that expands on tap. **FIX:** Add a `ratingExpandedByOrder` state (map of order.id → boolean). For delivered orders in «История», show a collapsed CTA button. On tap, set `ratingExpandedByOrder[order.id] = true` and render the Rating components for each item in that order.

### Fix 4 — CV-06: Collapsed summary rows

10. **[P1] Orders always show full item list — no collapsed summary rows.** `renderOrderItems()` at lines 457-530 always renders all items expanded. **FIX:** Add a `expandedOrders` state (Set of order IDs). For orders in «Сейчас» section, default to collapsed: show a single row with `HH:MM  Name1, Name2 +N  total ₸  ▾`. Tap chevron → add to `expandedOrders` set → show full item list. «Новый заказ» items are always expanded (not affected — they use a different render path at lines 872-901). Use the same price formatter as individual items (line 486: `formatPrice(lineTotal)`) for order totals in collapsed rows — do NOT use `Math.round` or raw `toFixed`.

11. **[P2] Chevron touch target for collapsed rows.** The task requires chevron ≥ 44×44px. **FIX:** Use `min-w-[44px] min-h-[44px]` on the chevron button/area in collapsed summary rows (same pattern as existing chevrons at lines 787, 820).

### Fix 5 — CV-07: «Кому заказ» selector

12. **[P1] Current label is confusing: «Для кого заказ: Только мне (2+ гостей)».** Lines 904-972 show the split toggle with radio buttons (Только я / На всех / Выбрать гостей). The task says to:
    - Hide entirely when 1 guest (current code already has `canSplit` check at line 910, but the section still renders at line 905 — the `isTableVerified` check makes it visible even with 1 guest, just disabled).
    - Rename to «Кому заказ: Мне ▾» with a simple sheet/popover.
    **FIX:** Change the condition at line 905: only render when `isTableVerified === true && canSplit` (add `canSplit` to the outer condition). Replace the radio buttons with a simpler selector: show `Кому заказ: [selected] ▾`, and on tap open a local `useState`-based picker (not pushOverlay). Guest list from `sessionGuests`. After selection, update the appropriate state. Do NOT use `pushOverlay`/`popOverlay` per D6(c).

### Fix 6 — CV-08: Guest-facing status labels

13. **[P1] Status labels not remapped for guest clarity.** The `getSafeStatus()` function at lines 251-286 shows labels like «Заказано», «Выдан гостю». The task requires 4 guest-facing labels: Принят, Готовится, Готов, Подано. **FIX:** In `getSafeStatus()` and in the sub-header rendering for «Сейчас» section:
    - Map `'new'` → «Принят» (already done at line 273)
    - Ensure `'Заказано'` also maps to «Принят» (currently at line 266 it maps to tr('status.new', 'Заказано') — change fallback to 'Принят')
    - Map `'done'`/`'finish'`/`'ready'` → keep «Готов» (line 272, OK)
    - Map served/completed display label to «Подано» (not «Выдан гостю»)
    Also update the i18n fallbacks in the status mapping.

### Fix 7 — PM-154: Order filter 06:00

14. **[P1] Order filter uses midnight cutoff instead of 06:00 AM.** Lines 351-364: `todayMyOrders` filters with `new Date(d).toDateString() === today` which is a midnight-based comparison. **FIX:** Replace the filter with 06:00 AM business-day cutoff:
    ```js
    const today6am = new Date();
    today6am.setHours(6, 0, 0, 0);
    if (new Date() < today6am) today6am.setDate(today6am.getDate() - 1);
    ```
    Then filter: `new Date(d) >= today6am` instead of `toDateString() === today`. This ensures orders placed before 06:00 AM "today" (belonging to last night's shift) are excluded, and late-night orders after midnight are still shown if current time is before 06:00.

### Fix 8 — PM-151: Float in success screen

15. **[P1] Success screen shows floating point total.** In `x.jsx` line 731: `{formatPrice(totalAmount)}` — `totalAmount` is passed directly without float fix. At line 3481: `totalAmount={confirmationData.totalAmount}`. **FIX:** At line 731, change to `{formatPrice(parseFloat(totalAmount.toFixed(2)))}`. Alternatively, apply the fix at the data source (line 3481) by wrapping: `totalAmount={parseFloat((confirmationData.totalAmount || 0).toFixed(2))}`.

### Fix 9 — PM-152 + PM-153: Guest name localStorage

16. **[P1] Guest name already persisted in localStorage but NOT cleared on table change.** Lines 1358-1360 in x.jsx: `guestNameInput` is initialized from `localStorage.getItem('menuapp_guest_name')`. Line 3162: name is saved on update. However, there is NO logic to clear the stored name when the table changes (new QR scan / different `tableCodeParam`). **FIX:** Add an effect that watches `tableCodeParam` (or `currentTableId`) changes. Store the last-used table identifier in localStorage (e.g., `menuapp_last_table`). When the component mounts, compare the current table with the stored one. If different → clear `menuapp_guest_name` from localStorage and reset `guestNameInput` to `''`. If same → keep the stored name (handles Chrome kill recovery).

17. **[P2] PM-153: Name recovery after Chrome kill already works partially.** The `useState` initializer at line 1358 reads from localStorage on mount. However, if `currentGuest?.name` is fetched from the DB and overrides the localStorage value, the stale DB name could appear. **FIX:** Ensure the localStorage value takes priority over the DB `currentGuest.name` for the display name. In `handleUpdateGuestName`, both DB and localStorage are updated (line 3162), so they should stay in sync. The issue is likely that `currentGuest` object from `useTableSession` has an old name. Add: on mount, if localStorage has a name, update `currentGuest.name` to match.

### Fix 10 — D3: «Все блюда поданы ✅» screen

18. **[P1] No D3 screen exists — empty state after all orders delivered is just the normal view.** When `nowOrders.length === 0 && historyOrders.length > 0 && cart.length === 0`, the CartView currently shows just the collapsed «Выдано» section + ИТОГО + «Добавить к заказу» button (lines 851-862). There is no special «Все блюда поданы» banner. **FIX:** Add a condition check: if no active orders AND history exists AND cart is empty → render the D3 screen:
    - ✅ banner «Все блюда поданы»
    - Collapsed «История» section (reuse existing)
    - Sticky footer with: ИТОГО + «Дозаказать» (primary) + «Попросить счёт» (secondary, disabled if no backend support — show tooltip «Попросите официанта напрямую»)
    Use the same `historyOrders` / `visitTotal` data computed by Fix 1. The footer sums should use `parseFloat(total.toFixed(2))`.

## Summary
Total: 18 findings (0 P0, 13 P1, 5 P2, 0 P3)

## Key Implementation Notes

**Status value mapping (CRITICAL for Fix 1, 3, 6):**
The DB uses English status strings. Based on code analysis:
- `new` / default → «Принят» (active, in «Сейчас»)
- `preparing` → «Готовится» (active, in «Сейчас»)
- `ready` → «Готов» (active, in «Сейчас»)
- `served` / `completed` → «Подано» (delivered, in «История»)
- `cancelled` → excluded from display

The `getOrderStatus()` returns `{ icon, label, color }` where `label` is already translated. The raw `o.status` field contains the English value. Fix 1's section filter should use `o.status` (English), not the display label.

**File structure:**
- CartView.jsx (1044 lines) — all 7 CartView fixes (Fix 1-7, 10)
- x.jsx (4003 lines) — Fix 8 (line 731) and Fix 9 (lines 1358-1360, 3162)

**Dependencies between fixes:**
- Fix 7 (date filter) runs BEFORE Fix 1 (sections) — both in `todayMyOrders` area
- Fix 1 computes `nowOrders`/`historyOrders` → used by Fix 3 (rating), Fix 4 (collapsed), Fix 10 (D3)
- Fix 2 (sticky footer) uses `cartGrandTotal` and `visitTotal` already computed
- Fix 6 (labels) changes `getSafeStatus()` used by Fix 1's sub-headers

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: Says filter by `['Принят','Готовится','Готов']` but actual DB statuses are English (`new`, `preparing`, `ready`). The dependency note C3 helps but the main description is misleading. Should have stated: "use the same English status values already in use".
  - Fix 5: "Кому заказ" — the current implementation is a split-type radio (single/all), but the task describes a guest-name picker. These are conceptually different (split billing vs. assigning order to a specific guest). The task should clarify: is this replacing `splitType` entirely, or is it a new field `orderForGuest`?
  - Fix 9: Says "When table changes (new `tableCode`) → clear guest name" but `tableCodeParam` comes from URL params and doesn't change during SPA navigation within the same page. Need to clarify the actual trigger (new QR scan = full page reload, or re-mount with different URL params).
- Missing context: What are the exact raw status strings stored in DB? I had to grep to find them (`new`, `preparing`, `ready`, `served`, `completed`, `cancelled`). Including these in the task would save time.
- Scope questions: Fix 10's «Попросить счёт» — is `handleRequestBill` (line 3179 in x.jsx) already available as a prop to CartView? If not, should a new prop be added or should it be disabled?
