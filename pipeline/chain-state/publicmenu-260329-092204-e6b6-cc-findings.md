# CC Writer Findings — PublicMenu
Chain: publicmenu-260329-092204-e6b6

## Findings

### 1. [P1] Fix 1 — CV-28: Flat dish list inside status buckets (Variant B — group by name)

**Current:** `renderBucketOrders()` (lines 520-614) renders per-order rows with timestamps, chevrons, and individual order collapse. Each order maps over its items separately. Same-name dishes across different orders in the same bucket appear as separate rows.

**FIX:** Replace `renderBucketOrders()` with a new function that:
1. Collects ALL items from ALL orders in the bucket into a flat array.
2. Groups items by `dish_name` — summing quantities and line totals.
3. Renders a single flat list: `Name ×qty  total_price` (hide `×1` per CV-23).
4. For the "served" bucket with ratings: keep per-item rating controls — expand grouped items back to individual `itemId` for rating purposes. Each unique `itemId` still needs its own star rating row (don't merge rating state across items).

Specifically:
- Remove the per-order `<button>` with timestamp + chevron + `getOrderTime()` + `getOrderSummary()` (lines 530-549).
- Remove `expandedOrders` toggle per order.
- The bucket header chevron (already exists at lines 930-957) controls expand/collapse of the entire bucket contents.
- When expanded, show flat grouped dish rows + rating rows (for served bucket).
- State `expandedOrders` (line 100) can remain unused or be removed — it's no longer needed for bucket rendering.

**Risk:** Rating functionality in "served" bucket must be preserved. Each individual `itemId` must still get its own rating stars. Group visually by name, but when `showRating` is true, show individual rating rows under the grouped display name.

---

### 2. [P2] Fix 2 — CV-29: Remove separator lines between dish rows inside buckets

**Current:** Line 528: `className="border-b pb-2 last:border-0 last:pb-0"` on the per-order wrapper div. Line 978: `className="... py-2 border-b last:border-0"` on cart item rows (but this is "Новый заказ" section, not status buckets — keep as-is per scope lock).

**FIX:** After Fix 1 restructures `renderBucketOrders`, ensure the new flat dish rows inside buckets do NOT have `border-b` between them. If Fix 1 uses `space-y-*` for spacing, that's sufficient — no `border-b` classes on individual dish row containers inside bucket sections.

Also remove `border-t` from the bucket orders container (line 521: `className="space-y-2 mt-3 pt-3 border-t"`) — with flat list, the bucket header already provides visual separation. Keep `mt-3 pt-3` for spacing but remove `border-t`.

---

### 3. [P2] Fix 3 — CV-30: Drawer header "N заказа . X ₸" format

**Current:** Lines 664-668:
```jsx
{ordersSum > 0 && (
  <div className="text-xs text-slate-500 mt-0.5">
    {tr('cart.orders_sum', 'Заказов')}: {formatPrice(ordersSum)}
  </div>
)}
```
Shows `Заказов: 114.88 ₸` — no count.

**FIX:** Replace with:
```jsx
{todayMyOrders.length > 0 && (
  <div className="text-xs text-slate-500 mt-0.5">
    {todayMyOrders.length} {todayMyOrders.length === 1 ? tr('cart.order_one', 'заказ') : (todayMyOrders.length >= 2 && todayMyOrders.length <= 4) ? tr('cart.order_few', 'заказа') : tr('cart.order_many', 'заказов')} {ordersSum > 0 ? `\u00B7 ${formatPrice(ordersSum)}` : ''}
  </div>
)}
```
Russian plurals: 1 заказ / 2-4 заказа / 5+ заказов. Use `\u00B7` for middle dot separator.

**Note:** Change condition from `ordersSum > 0` to `todayMyOrders.length > 0` — even if total is 0 (theoretically), the count is still useful.

---

### 4. [P2] Fix 4 — CV-31: Table + guest on one line

**Current:** Lines 634-663 — table label on its own `<div>`, then guest display on a separate flex block with "Вы:" prefix.

**FIX:** Combine into a single line:
```jsx
<div className="flex items-center justify-center gap-1 text-sm">
  <span className="font-medium text-slate-700">{tableLabel}</span>
  <span className="text-slate-400">\u00B7</span>
  {isEditingName ? (
    // ... editing UI unchanged
  ) : (
    <button ...>{guestDisplay} <span className="text-xs ml-0.5">›</span></button>
  )}
</div>
```
Remove the separate `<div className="text-sm font-medium text-slate-700">{tableLabel}</div>` (line 634) and the "Вы:" prefix (line 636). Keep the editing inline form as-is but within the same flex row.

---

### 5. [P2] Fix 5 — CV-32: Auto-collapse "Подано" when cart is non-empty

**Current:** Lines 92-99 — `expandedStatuses` has `served: false` by default. No effect to auto-collapse when cart changes.

**FIX:** Add `useEffect` after line 99:
```jsx
React.useEffect(() => {
  if (cart.length > 0) {
    setExpandedStatuses(prev => ({ ...prev, served: false }));
  }
}, [cart.length > 0]);
```
The dependency `cart.length > 0` is a boolean — effect fires when transitioning from empty to non-empty cart. This only collapses "served"; other buckets remain as user left them.

**Note:** Using `[cart.length > 0]` as dependency is correct — React compares by value, so `false→true` triggers, `true→true` does not.

---

### 6. [P2] Fix 6 — CV-33: Remove "Для кого заказ" section entirely

**Current:**
- Line 90: `const [splitExpanded, setSplitExpanded] = React.useState(false);`
- Line 470-472: `splitSummary` computation
- Lines 1009-1076: Full split-order UI block (radio buttons, labels)

**FIX:**
1. Remove `splitExpanded` state (line 90).
2. Remove `splitSummary` computation (lines 470-472).
3. Remove the entire `{isTableVerified === true && (` block from line 1009 to line 1076 (the split-order section).
4. Keep `splitType` and `setSplitType` props — they come from parent and may still be used in order submission. Just don't render the UI.

**Risk:** Low. The split logic in the parent (x.jsx) defaults to 'single'. Removing only the UI means the behavior defaults to "only me" which is the desired state.

---

### 7. [P2] Fix 7 — CV-34: Hide "price x 1" when qty=1

**Current:** Line 981:
```jsx
<div className="text-xs text-slate-500">{formatPrice(item.price)} x {item.quantity}</div>
```
Always shown.

**FIX:** Wrap with quantity check:
```jsx
{item.quantity > 1 && (
  <div className="text-xs text-slate-500">{formatPrice(item.price)} x {item.quantity}</div>
)}
```

---

### 8. [P2] Fix 8 — CV-35: Reduce padding in "Новый заказ"

**Current:** Line 968: `<CardContent className="p-4">` and line 967: `<Card className="mb-4">`.

**FIX:** Change line 968 to `<CardContent className="px-3 py-2">` and line 967 to `<Card className="mb-2">` for a tighter layout.

---

### 9. [P2] Fix 9 — PM-156: Remove duplicate bell icon from x.jsx

**Current:** Lines 3952-3961 in x.jsx — floating bell button with `fixed bottom-20 left-4 z-40`, visible when `view === "menu" && isHallMode && drawerMode !== 'cart'`.

**FIX:** Remove the entire block (lines 3952-3961), including the comment on line 3952. The CartView header already has a bell icon (lines 622-630), and help is accessible via the help drawer from menu. Per task recommendation: Approach B — remove entirely.

```
Remove:
{/* PM-127: Bell icon on main menu — opens help drawer directly */}
{view === "menu" && isHallMode && drawerMode !== 'cart' && (
  <button ... >
    <Bell className="w-5 h-5" />
  </button>
)}
```

---

### 10. [P2] Fix 10 — PM-152: Guest name not cleared when table changes

**Current:** Lines 2464-2473 in x.jsx:
```javascript
const prevTableRef = useRef(tableCodeParam);
useEffect(() => {
  if (!tableCodeParam) return;
  if (prevTableRef.current && prevTableRef.current !== tableCodeParam) {
    try { localStorage.removeItem('menuapp_guest_name'); } catch(e) {}
    setGuestNameInput('');
  }
  prevTableRef.current = tableCodeParam;
}, [tableCodeParam]);
```
Problem: After Chrome kill, `prevTableRef` is re-initialized with current `tableCodeParam` value. When navigating to a new table, `prevTableRef.current` equals the URL param from the initial render, so the comparison `prevTableRef.current !== tableCodeParam` may pass — BUT the real issue is that `prevTableRef` is initialized with the CURRENT `tableCodeParam` on mount (line 2465: `useRef(tableCodeParam)`). So on first render after Chrome kill, `prevTableRef.current === tableCodeParam` (same value), and the cleanup doesn't trigger. Then if user navigates to another table (URL changes), the effect SHOULD fire with new `tableCodeParam` different from `prevTableRef.current`.

Wait — re-reading the problem: the issue is that after Chrome kill, `prevTableRef` resets. Actually `useRef(tableCodeParam)` initializes with current URL param. If user is already on table 02 and kills Chrome, ref starts as "table02". No change detected. The stale name from table01 in localStorage persists because the effect only clears on CHANGE, not on mount.

**FIX:** Replace the ref-based comparison with a simpler approach that also handles the mount case:
```javascript
// PM-152: Clear guest name when table changes
useEffect(() => {
  if (!tableCodeParam) return;
  const savedTable = localStorage.getItem('menuapp_last_table');
  if (savedTable && savedTable !== tableCodeParam) {
    try { localStorage.removeItem('menuapp_guest_name'); } catch(e) {}
    setGuestNameInput('');
  }
  try { localStorage.setItem('menuapp_last_table', tableCodeParam); } catch(e) {}
}, [tableCodeParam]);
```
This uses localStorage itself (`menuapp_last_table`) to persist the previous table across Chrome kills. On mount after kill: if stored table differs from URL param → clear name. This is reliable across state resets.

Remove `prevTableRef` (line 2465) as it's no longer needed.

---

### 11. [P1] Fix 11 — PM-153: Guest name fallback using guestNameInput

**Current:** Lines 309-312:
```javascript
const guestBaseName = currentGuest
  ? (currentGuest.name || getGuestDisplayName(currentGuest))
  : tr("cart.guest", "Гость");
```
After Chrome kill, `currentGuest.name` is null/empty, `getGuestDisplayName()` returns generic "Гость". But `guestNameInput` (from localStorage auto-save) has the real name.

**FIX:** Insert `guestNameInput` as fallback:
```javascript
const guestBaseName = currentGuest
  ? (currentGuest.name || guestNameInput || getGuestDisplayName(currentGuest))
  : (guestNameInput || tr("cart.guest", "Гость"));
```
`guestNameInput` is confirmed as a prop passed from x.jsx (line 3544).

---

## Summary
Total: 11 findings (0 P0, 2 P1, 9 P2, 0 P3)

All 11 fixes from the task are analyzed. No out-of-scope findings reported.

## Prompt Clarity

- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. All 11 fixes have clear "Currently / Expected / Must NOT be / File and location / Verification" structure with exact line numbers.
- Missing context: None — all necessary context was in the task description. Line numbers matched actual code closely.
- Scope questions: Fix 1 (CV-28) has complexity around preserving rating functionality when grouping dishes by name. The task says "group by name" but doesn't explicitly address how per-item ratings should display in grouped rows. I inferred: visually group, but expand individual rating rows per itemId for served bucket. Fix 10 (PM-152) — the root cause analysis needed deeper investigation than provided; the ref-based approach fails because ref initializes with current value on mount, not because ref "resets to undefined/null" as stated. The actual fix needs localStorage-based persistence rather than just removing ref comparison.
