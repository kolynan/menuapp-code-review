# CC Writer Findings — PublicMenu
Chain: publicmenu-260326-223118-f62f

## Findings

### Fix 1 — PM-142/143/144/145: CartView drawer restructure to current visit only, correct section order

**1. [P2] No date filtering on orders — PM-142** (lines 663-777)
`myOrders` is rendered as-is without any date/session filtering. All historical orders from all days appear in the drawer. The `sessionOrders` and `myOrders` arrays come from `useTableSession` hook and may contain orders from previous visits/sessions.

**FIX:** Add a date filter at the top of CartView's render logic (or as a `useMemo`). Filter `myOrders` to only include orders where `new Date(order.created_date).toDateString() === new Date().toDateString()`. Use `order.created_at || order.created_date || order.createdAt` (same pattern as `formatOrderTime` in x.jsx line 1243). Store result as `todayMyOrders`. Use `todayMyOrders` everywhere instead of `myOrders` for rendering.

---

**2. [P2] No sort by full datetime — PM-143** (lines 690)
`myOrders.map(...)` renders orders in the order received from the hook. No explicit sort by datetime. If the data comes sorted by time-only or arbitrary order, orders from different times appear mixed.

**FIX:** Sort the filtered `todayMyOrders` array by full datetime descending (newest first):
```js
const todayMyOrders = useMemo(() => {
  const today = new Date().toDateString();
  return (myOrders || [])
    .filter(o => {
      const ts = o.created_at || o.created_date || o.createdAt;
      if (!ts) return true; // keep orders without date (edge case)
      return new Date(ts).toDateString() === today;
    })
    .sort((a, b) => {
      const ta = new Date(a.created_at || a.created_date || a.createdAt || 0).getTime();
      const tb = new Date(b.created_at || b.created_date || b.createdAt || 0).getTime();
      return tb - ta; // newest first
    });
}, [myOrders]);
```

---

**3. [P2] Wrong section order — PM-144** (lines 663-918)
Current layout order is:
1. Table orders (other guests) — lines 554-649
2. Table total — lines 651-661
3. **"Ваши заказы" (all my orders, mixed)** — lines 663-777
4. "Add more" CTA — lines 779-791
5. **"Новый заказ" (current cart)** — lines 793-918
6. Submit button — lines 936-970

Required layout order per UX spec:
1. Header (table + guest info) — keep as-is
2. **"Выдано" section** (collapsed by default) — orders with status `served` or `completed`
3. **"Заказано" section** (expanded by default) — orders with status `new`, `accepted`, `in_progress`, `ready`
4. **"Новый заказ" section** (current cart, always visible)
5. Split type selector (inside "Новый заказ")
6. **"ИТОГО за визит"** — sum of all sections
7. **"Отправить официанту"** button (sticky bottom)

**FIX:** Restructure the JSX sections:

a) Split `todayMyOrders` into two groups:
```js
const servedOrders = todayMyOrders.filter(o => ['served', 'completed'].includes(o.status));
const activeOrders = todayMyOrders.filter(o => !['served', 'completed', 'cancelled'].includes(o.status));
```

b) Add two new collapse states:
```js
const [servedExpanded, setServedExpanded] = React.useState(false);  // collapsed by default
const [activeExpanded, setActiveExpanded] = React.useState(true);   // expanded by default
```

c) Replace the single "Ваши заказы" section (lines 663-777) with two sections:
- **"Выдано"** (✅ icon, collapsed by default, chevron to expand) — renders `servedOrders`
- **"Заказано"** (🕐 icon, expanded by default, chevron to collapse) — renders `activeOrders`

d) Move "Новый заказ" section (lines 793-918) to render AFTER the two status sections, not after table orders section.

e) Remove the current `myOrdersExpanded` state (line 92) — replaced by `servedExpanded` and `activeExpanded`.

f) Remove "Table orders" (other guests) section and "Table total" section from before the order sections — OR keep them but place them after the main 3 sections per spec. The spec only mentions current guest's sections. Decision: keep other guests section but AFTER the 3 main sections (it's not in the spec wireframe, so it goes below).

g) Each section should NOT show a separate total. Only one "ИТОГО за визит" at the bottom.

---

**4. [P2] Floating point in totals — PM-145** (lines 679, 912)
- Line 679: `formatPrice(myBill.total)` — `myBill.total` may have floating point artifacts (e.g., 157.14000000000001)
- Line 912: `formatPrice(Number(cartTotalAmount) || 0)` — `cartTotalAmount` is already protected in x.jsx with `parseFloat(...toFixed(2))`, but per-item totals in the order list (line 717: `item.line_total ?? (item.dish_price * item.quantity)`) are NOT protected.

**FIX:**
a) For the new "ИТОГО за визит" total that sums all sections:
```js
const visitTotal = parseFloat(
  (servedTotal + activeTotal + (Number(cartTotalAmount) || 0)).toFixed(2)
);
```
Where `servedTotal` and `activeTotal` sum order totals from each group.

b) For per-order subtotals shown in section rows, wrap with `parseFloat(Number(order.total_amount || 0).toFixed(2))`.

c) For line item totals (line 717), wrap: `parseFloat((item.dish_price * item.quantity).toFixed(2))`.

---

**5. [P2] Section chevrons need ≥44px touch targets** (new UI elements)
The new "Выдано" and "Заказано" section headers need chevron buttons with `min-w-[44px] min-h-[44px]` for mobile touch targets. Follow existing pattern from table card header chevron (line 474-482).

**FIX:** Use the same button wrapper pattern as the header chevron:
```jsx
<button className="min-w-[44px] min-h-[44px] flex items-center justify-center">
  {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
</button>
```

---

**6. [P1] D7 warning — no `relative` class on new wrapper elements**
Any new container `div` elements added inside DrawerContent must NOT have `className="relative"` — it breaks vaul drawer behavior (KB-096). Need to verify after implementation.

**FIX:** Audit all new elements. Do not use `relative` positioning class on any wrapper inside DrawerContent. If positioning is needed, use `sticky` (which is already used for the submit button at line 937).

---

**7. [P2] "Для кого" selector position** (lines 834-901)
Currently the "Для кого заказ" split selector is inside the "Новый заказ" Card, below the cart items. Per the spec wireframe, it should remain inside "Новый заказ" section — this is correct. No change needed here, but need to verify it stays in the right position after restructure.

**FIX:** No code change — just verify during restructure that the split selector stays inside "Новый заказ" Card, after cart items and before the grand total.

---

**8. [P2] "ИТОГО за визит" label needs i18n**
The new "ИТОГО за визит" label is a new user-facing string. Must use `tr()` for i18n.

**FIX:** Use `tr('cart.visit_total', 'ИТОГО за визит')` for the new total label. The existing `tr('cart.total', 'ИТОГО')` is used inside "Новый заказ" section — the new visit-level total needs a distinct key.

---

## Summary
Total: 8 findings (0 P0, 1 P1, 7 P2, 0 P3)

The main change is a structural rewrite of the orders display section in CartView:
- Add date filtering (today only)
- Split orders into "Выдано" (served, collapsed) and "Заказано" (active, expanded)
- Move "Новый заказ" above history sections in visual hierarchy (it renders 3rd, after Выдано and Заказано)
- Add one "ИТОГО за визит" total summing all sections
- Apply `parseFloat(x.toFixed(2))` to prevent floating point display artifacts
- Keep sticky submit button at bottom

**Key data flow:**
- `myOrders` = array of order objects with `.status` field (`new`/`accepted`/`in_progress`/`ready`/`served`/`completed`/`cancelled`) and `.created_date`/`.created_at` timestamp
- `itemsByOrder` = Map(orderId → items[]) for rendering line items
- `getOrderStatus(order)` returns `{icon, label, color}` for display
- `cartTotalAmount` = sum of current cart (already float-protected in x.jsx)
- `myBill.total` = sum of all my submitted orders (NOT float-protected)

**Implementation risk:** Medium. Restructuring JSX sections is straightforward but touches ~150 lines. Follow F1 rules — use targeted edits, not full file rewrite.

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — the wireframe is detailed, status mapping is explicit, and float fix pattern is specified.
- Missing context: `getOrderStatus` return value structure had to be reverse-engineered from x.jsx (it returns `{icon, label, color}` but the raw `order.status` string is what's needed for section grouping). A note like "use `order.status` directly for grouping, not `getOrderStatus()`" would have been helpful but was inferrable.
- Scope questions: None — scope lock is clear and FROZEN UX list is explicit.
