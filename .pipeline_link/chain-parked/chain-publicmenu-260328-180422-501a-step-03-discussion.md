---
chain: publicmenu-260328-180422-501a
chain_step: 3
chain_total: 4
chain_step_name: discussion
page: PublicMenu
budget: 20.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion (3/4) ===
Chain: publicmenu-260328-180422-501a
Page: PublicMenu

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step by running a multi-round discussion between CC and Codex.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/publicmenu-260328-180422-501a-comparison.md
2. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/publicmenu-260328-180422-501a-discussion.md:
     # Discussion Report — PublicMenu
     Chain: publicmenu-260328-180422-501a
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   Run up to 3 rounds of discussion. Each round:

   a) CC Position (you write):
      For each dispute, write your analysis:
      - Which solution is better and WHY (with code reasoning)
      - What edge cases or risks does each approach have

   b) Codex Position (run codex):
      Create a prompt file with CC's position and ask Codex to respond.
      Run: codex.cmd exec --model codex-mini --prompt "<prompt>" --quiet
      The prompt should include CC's position and ask Codex to:
      - Agree or disagree with CC's reasoning
      - Provide counter-arguments if it disagrees
      - Propose a compromise if possible

   c) After each round, check:
      - If both agree on all disputes → RESOLVED, stop early
      - If round 3 and still disagree → mark as UNRESOLVED for Arman

3. Write final discussion report to: pipeline/chain-state/publicmenu-260328-180422-501a-discussion.md

FORMAT:
# Discussion Report — PublicMenu
Chain: publicmenu-260328-180422-501a

## Disputes Discussed
Total: N disputes from Comparator

## Round 1
### Dispute 1: [title]
**CC Position:** ...
**Codex Position:** ...
**Status:** resolved/ongoing

### Dispute 2: [title]
...

## Round 2 (if needed)
...

## Round 3 (if needed)
...

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Title   | 2      | resolved   | CC/Codex/compromise |
| 2 | Title   | 3      | unresolved | → Arman |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Unresolved (for Arman)
Items where CC and Codex could not agree after 3 rounds.
Arman must decide. Each item shows both positions.

4. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# Feature: CartView Drawer UX Redesign v4 (#174 re-run)

Reference: `ux-concepts/cart-view.md` v4.0 (CV-01..CV-27, ASCII mockups v5). UX agreed S183 + GPT 2 rounds + GPT CartView Review S187c.
Production page: https://menu-app-mvp-49a4f5b2.base44.app

**Context:** CartView drawer currently uses flat sections: «Выдано» (collapsed) + «Заказано» (expanded) + «Новый заказ». UX v4.0 replaces this with **status-based buckets** (Принят / Готовится / Готов — expanded; Подано — collapsed). This is a UI/layout restructure — no new API calls, no new entities, no backend changes.

**CRITICAL: OrderItem has NO status field.** Status lives on `Order.status` only. All items in one order share the same status. Therefore, status buckets group ORDERS (not individual items). Each order = one row in one bucket.

`Order.status` enum values and mapping to guest-facing buckets:
- `new` → **Отправлено** (gray/neutral) — guest just tapped "Отправить", waiter hasn't seen it yet
- `accepted` → **Принят** (amber) — waiter acknowledged
- `in_progress` → **Готовится** (blue)
- `ready` → **Готов** (amber/pulse)
- `served` / `completed` → **Подано** (green, collapsed)
- `cancelled` → hidden (do not render)

TARGET FILES (modify):
- `pages/PublicMenu/CartView.jsx` (main: sections, footer, rating, collapsed rows, D3 screen)
- `pages/PublicMenu/x.jsx` (PM-151 success screen float, PM-152/153 guest name localStorage)

⚠️ KB-095 RISK: Two files modified in one chain. After chain completes:
```
git show HEAD:pages/PublicMenu/CartView.jsx | wc -l
wc -l pages/PublicMenu/CartView.jsx
git show HEAD:pages/PublicMenu/x.jsx | wc -l
wc -l pages/PublicMenu/x.jsx
```
Line counts must match. If diff > 0 → restore from git HEAD before deploy.

CONTEXT FILES (read-only):
- `ux-concepts/cart-view.md` (full UX spec with ASCII mockups)
- `ux-concepts/visit-lifecycle.md` (VL-04: D3 screen spec)
- `BUGS_MASTER.md`

---

## Fix 1 — CV-01+CV-09: Status-based buckets (replaces Выдано/Заказано) [MUST-FIX, H weight]

### Currently
CartView splits orders into 2 flat sections: «Выдано» (served, collapsed ~line 772) and «Заказано» (active, expanded ~line 806). Uses binary filter: `o.status === 'served' || o.status === 'completed'` vs everything else (~lines 366-374).

### Required
Replace with **status-based buckets**. Each bucket = one Order.status group. Only non-empty buckets render.

**Bucket order (top → bottom) — chronological, oldest first, cart closest to CTA:**
1. **Подано** — `Order.status in ['served', 'completed']` — **collapsed by default** (CV-10). Oldest/done at top.
2. **Готов** — `Order.status === 'ready'` — expanded
3. **Готовится** — `Order.status === 'in_progress'` — expanded
4. **Принят** — `Order.status === 'accepted'` — expanded
5. **Отправлено** — `Order.status === 'new'` — expanded. Just sent, waiter hasn't seen yet.
6. **🛒 Новый заказ** — current cart items with steppers (unchanged logic). Directly above CTA button.

**Each bucket header format — includes subtotal:**
```
▾ Принят (2)              54.77 ₸  ← expanded: ▾, collapsed: ▸. Subtotal right-aligned.
  04:17  Суши, New dish   54.77 ₸  ← collapsed summary row (CV-06)
```
Subtotal in header = sum of all `order.total_amount` in that bucket. Wrap: `parseFloat(sum.toFixed(2))`.

**Rules:**
- Empty buckets are NOT rendered (CV-26). If no orders have status `ready`, the «Готов» section does not exist.
- Within each bucket: newest first (by `created_at || created_date || createdAt`), same sort as current (~line 360).
- `cancelled` orders: do NOT render anywhere.
- **Preserve `expandedStatuses` in UI state** (CV-25): `const [expandedStatuses, setExpandedStatuses] = useState({accepted: true, in_progress: true, ready: true, served: false})`. Polling must NOT change expanded/collapsed state. User toggles only.

### Implementation hints
- Replace `servedOrders` / `activeOrders` split (~lines 366-374) with a grouping function:
```js
const statusBuckets = React.useMemo(() => {
  const buckets = { served: [], ready: [], in_progress: [], accepted: [], new_order: [] };
  todayMyOrders.forEach(o => {
    const s = o.status;
    if (s === 'served' || s === 'completed') buckets.served.push(o);
    else if (s === 'ready') buckets.ready.push(o);
    else if (s === 'in_progress') buckets.in_progress.push(o);
    else if (s === 'accepted') buckets.accepted.push(o);
    else if (s === 'new') buckets.new_order.push(o);
    // cancelled: skip
  });
  return buckets;
}, [todayMyOrders]);
```
- **Render order** matches object key order: served → ready → in_progress → accepted → new_order → cart. This puts completed orders at top (collapsed) and cart at bottom (closest to CTA).
- Replace the two sections (~lines 772-828) with a loop over bucket entries.
- Remove `servedExpanded` / `activeExpanded` states (~lines 92-93). Replace with `expandedStatuses` object.
- Bucket display names (guest-facing): `{served: 'Подано', ready: 'Готов', in_progress: 'Готовится', accepted: 'Принят', new_order: 'Отправлено'}`.
- Keep `getSafeStatus()` (~line 250) for individual order status badges within expanded view, but the BUCKET HEADER uses the display name above (not per-order badge).
- **Each header shows subtotal:** `▾ Готовится (2)  86.77 ₸`. Calculate: `bucket.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)`. Wrap with `parseFloat(sum.toFixed(2))`.

### Must NOT
- Old section names «Выдано» or «Заказано (N)» anywhere
- Binary served/active split
- Empty bucket headers (e.g., `Готов (0)`)
- Per-order status badge repeated inside a single-status bucket (status is already the bucket header)

### Verification
1. Mix of statuses (accepted + in_progress) → two separate expanded buckets visible
2. All orders served → only «Подано» bucket (collapsed) visible
3. One order ready → «Готов (1)» expanded, other buckets hidden
4. New order arrives during polling → appears in correct bucket, collapsed/expanded state preserved

### Dependencies
- Fix 3 rating: uses the `served` bucket to determine where to show «Оценить»
- Fix 7 (PM-154 filter): runs BEFORE bucket grouping — buckets operate on already-filtered `todayMyOrders`
- Fix 10 (D3 screen): triggers when all buckets except `served` are empty AND cart is empty

---

## Fix 2 — CV-02+CV-03: Sticky footer with correct scope [MUST-FIX, M weight]

### Currently
«ИТОГО за визит: X ₸» is inside scrollable content (~line 980-992), a Card with bg-slate-50. Submit button is sticky (~line 1009) but ONLY visible when cart is not empty.

### Required
ИТОГО + CTA button = **one sticky footer block** (always visible at bottom of drawer when there are orders or cart). Remove the old «ИТОГО за визит» Card.

**Minimal footer — only bonus text + CTA button. Totals are in section headers + drawer header.**

**When cart is NOT empty (D1):**
```
├═══════════════════════════════════════┤
│ +70 бонусов                           │  ← if loyalty enabled
│ [      Отправить официанту         ] │
└═══════════════════════════════════════┘
```

**When cart IS empty but orders exist (D0 + orders):**
```
├═══════════════════════════════════════┤
│ [       Заказать ещё               ] │  ← secondary style (outline)
└═══════════════════════════════════════┘
```

**«Мои заказы» total → moved to drawer header area** (next to guest name):
```
│ 🔔  Стол 22                       ˅ │
│ Вы: Гость 1 >        Заказов: 233 ₸ │  ← sum of all submitted orders
```
Show `Заказов: X ₸` ONLY when `ordersSum > 0`. Wrap: `parseFloat(ordersSum.toFixed(2))`.

- ⛔ **Remove «ИТОГО ЗА ВИЗИТ» Card (~lines 980-992) completely.**
- ⛔ **Remove «ИТОГО ЗА ВИЗИТ» label everywhere.** Anti-pattern per cart-view.md.
- «🛒 Новый заказ» header shows cart subtotal: `🛒 Новый заказ  70.36 ₸`. This replaces the old «К отправке» line.
- Each status bucket header also shows its own subtotal (see Fix 1).
- Total is never in footer — all totals are inline in section headers or drawer header.

### Implementation hints
- Expand the existing sticky div (~line 1009) to ALWAYS render (not just `cart.length > 0`). Condition: `cart.length > 0 || todayMyOrders.length > 0`.
- Remove the «ИТОГО за визит» Card (~lines 980-992) completely.
- Remove the spacer div (~line 995).
- CTA logic: cart not empty → «Отправить заказ официанту» (existing); cart empty + orders → «Заказать ещё» (outline button, calls same back-to-menu navigation as «Добавить к заказу» ~line 859).
- **«Заказов: X ₸» in drawer header:** add to the header area (~line 534-591), right-aligned next to guest name. Use `ordersSum` (~line 379). Show only if > 0.
- **«🛒 Новый заказ X ₸» section header** shows cart subtotal: use existing `cartTotalAmount`.
- ⚠️ Do NOT use `position: relative` on any element inside DrawerContent (breaks vaul, KB-096, D7).
- Pattern for sticky: flex layout `h-full` → `flex-1 overflow-y-auto` (scrollable) + footer at bottom.
- Float fix: ALL price displays (section headers, drawer header) must use `parseFloat(value.toFixed(2))`.

### Must NOT
- «ИТОГО ЗА ВИЗИТ» label anywhere
- Totals inside sticky footer (totals are in section headers + drawer header only)
- Active «Отправить» button when cart is empty
- `position: relative` on DrawerContent children

### Verification
1. Scroll long order list → footer stays visible at bottom (only bonus + CTA)
2. Cart empty → footer shows only «Заказать ещё» (outline). «Заказов: X ₸» in header area.
3. Cart + history → «🛒 Новый заказ 70.36 ₸» header visible, «Заказов: 233 ₸» in drawer header
4. First order without history → «🛒 Новый заказ 70.36 ₸» header, no «Заказов» (nothing submitted yet)

---

## Fix 3 — CV-04+CV-05: Rating only on «Подано» bucket [MUST-FIX, M weight]

### Currently
Star rating (`<Rating>` component, imported ~line 6) shown under EVERY item in EVERY order, regardless of status. Visible at ~line 456+ inside `renderOrderItems`.

### Required
- Buckets Принят / Готовится / Готов: **NO rating UI at all** — no stars, no button, no empty state
- Bucket Подано: show **accent-chip** in bucket header: `Подано (3) • Оценить` (CV-05)
  - Tap «Оценить» → expand bucket + show star rating per item (existing `<Rating>` component)
  - If ALL items already rated → chip text changes to `Подано (3) ✅`
- ⚠️ Use the SAME status condition as Fix 1's `served` bucket: `o.status === 'served' || o.status === 'completed'`

### Implementation hints
- In `renderOrderItems` (~line 456), add a parameter `showRating: boolean`. Pass `true` only for served bucket.
- Accent-chip: small colored pill next to the count in Подано header. Example: `<span className="ml-2 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Оценить</span>`. On tap: set `expandedStatuses.served = true` AND scroll to rating section.
- Keep existing `Rating` component usage and `draftRatings` / `updateDraftRating` / `ratingSavingByItemId` props.

### Must NOT
- Empty stars (☆☆☆☆☆) on non-served orders
- Rating button/stars on «Принят» or «Готовится» or «Готов»

### Verification
1. Order status «Принят» → no rating UI
2. Order status «Подано» → accent-chip «Оценить» in header
3. Tap «Оценить» → section expands, stars visible per item
4. All rated → chip shows ✅

---

## Fix 4 — CV-06+CV-23: Collapsed summary rows + qty display [MUST-FIX, M weight]

### Currently
Each order shows full item list expanded by default in both sections.

### Required
Orders in status buckets (Принят/Готовится/Готов/Подано) show as **collapsed summary rows**:
```
04:17  Суши, Карбонара         70.36 ₸  ▾
```

**Rules:**
- Show order time (HH:MM from `created_at`) + first 2 item names + `+N` if more: `Суши, Карбонара +3  70.36 ₸  ▾`
- **qty display (CV-23):** `qty=1` → do NOT show. `qty>1` → show muted `×2` after name: `Паста карбонара ×2`.
- Tap ▾ → expand to show full item list with individual prices
- «Новый заказ» section items are ALWAYS expanded (user needs steppers)
- ⚠️ For the order total in collapsed rows, use the SAME `formatPrice` function already used for item prices. Wrap with `parseFloat(total.toFixed(2))`.
- Chevron touch target ≥ 44×44px

### Implementation hints
- Each order gets its own expanded/collapsed state: `const [expandedOrders, setExpandedOrders] = useState({})`. Toggle: `setExpandedOrders(prev => ({...prev, [orderId]: !prev[orderId]}))`.
- Summary text builder: `items.slice(0, 2).map(i => i.dish_name + (i.quantity > 1 ? ` ×${i.quantity}` : '')).join(', ')` + (items.length > 2 ? ` +${items.length - 2}` : '').
- Order time: `new Date(order.created_at || order.created_date || order.createdAt).toLocaleTimeString('ru', {hour:'2-digit', minute:'2-digit'})`.

### Must NOT
- Auto-expanded order list in status buckets
- `×1` shown for single-quantity items
- Collapsed rows in «Новый заказ» section (cart always expanded)

### Verification
1. Order with 2 items → shows both names, no «+N»
2. Order with 5 items → shows 2 names + «+3»
3. Item with qty=1 → no ×1 shown. Item with qty=3 → shows ×3
4. Tap chevron → full list expands with individual prices
5. «Новый заказ» items always show with steppers

---

## Fix 5 — CV-08+CV-27: Guest-facing status labels + tappable name [SHOULD-FIX, L weight]

### Currently
Status labels use raw values: Заказано, Принято, Готовится, Готов, Выдан гостю (~lines 250-280). Guest name shows with pencil icon for editing (~line 571-577).

### Required
**Status labels** — 5 guest-facing statuses:
- `new` → display **«Отправлено»** (gray) — waiter hasn't seen it yet
- `accepted` → display **«Принят»** (amber) — waiter acknowledged
- `in_progress` → **«Готовится»** (blue)
- `ready` → **«Готов»** (amber/pulse)
- `served` / `completed` → **«Подано»** (green)
- Update `getSafeStatus()` fallback map (~line 266-278) accordingly. Remove «Заказано» as display label. Add «Отправлено» for `new`.

**Guest name (CV-27):**
- Replace pencil icon with tappable text: `Вы: Гость 1 >`
- Hit area ≥ 44×44px
- Tap → same edit mode as current pencil icon flow
- Find current implementation at ~line 571 (`<button>` with edit icon)

### Must NOT
- «Заказано» or «Выдан гостю» visible to guest anywhere
- Pencil/edit icon next to name

### Verification
1. No label says «Заказано» or «Выдан гостю» — only «Отправлено», «Принят», «Готовится», «Готов», «Подано»
2. Order with status `new` shows «Отправлено», not «Заказано»
3. Guest name shows as `Вы: Гость 1 >` — tappable, no pencil icon

---

## Fix 6 — PM-154: Order filter 06:00 (today's shift) [MUST-FIX, M weight]

### Currently
Orders filtered to today's date but PM-154 shows stale orders from previous days. Current filter at ~lines 354-361 uses `created_at || created_date || createdAt`.

### Required
Filter: show only orders where `createdAt >= today at 06:00 AM`.
```js
const today6am = new Date();
today6am.setHours(6, 0, 0, 0);
if (new Date() < today6am) today6am.setDate(today6am.getDate() - 1);
const filtered = orders.filter(o => {
  const d = o.created_at || o.created_date || o.createdAt;
  return d && new Date(d) >= today6am;
});
```
Reason: restaurants work past midnight — 06:00 is business-day reset (VL-07).

### File and location
File: `CartView.jsx`, ~lines 354-361 (existing date filter).

### Must NOT
- Midnight (00:00) as cutoff
- Orders from yesterday evening visible

### Verification
1. Orders before 06:00 today → NOT shown
2. Orders after 06:00 today → shown
3. At 02:00 AM → shows orders since yesterday 06:00

---

## Fix 7 — PM-151: Float in success screen (x.jsx) [MUST-FIX, L weight]

### Currently
Success screen «Заказ отправлен!» shows floating point: `31.00999999999998 ₸`. Located in x.jsx ~line 731: `{formatPrice(totalAmount)}`.

### Required
Wrap with float fix: `{formatPrice(parseFloat(Number(totalAmount).toFixed(2)))}`.

### File and location
File: `x.jsx`, ~line 731. Search for `formatPrice(totalAmount)` near `confirmation.total`.

### Must NOT
- Raw `totalAmount` without toFixed

### Verification
1. Submit order → success screen shows `31.01 ₸` (not `31.009999...`)

---

## Fix 8 — PM-152+PM-153: Guest name localStorage (x.jsx) [MUST-FIX, M weight]

### Currently
Guest name initialized from localStorage ~line 1358-1359: `localStorage.getItem('menuapp_guest_name')`. Name saved on update ~line 3162: `localStorage.setItem('menuapp_guest_name', trimmedName)`.
**PM-152:** Stale name from previous session (old table) not cleared.
**PM-153:** Name lost after Chrome kill (already partially implemented — init from localStorage exists, but may not cover all re-mount scenarios).

### Required
1. On `tableCode` change → clear guest name: `localStorage.removeItem('menuapp_guest_name')` and reset `guestNameInput` to `''`.
2. On component mount → already reads from localStorage (~line 1358-1359) ✅. Verify this works after Chrome kill.
3. When guest enters name and taps ✓ → save to localStorage (already at ~line 3162) ✅.
4. When `tableCode` changes — search for `tableCode` state or effect. Add cleanup:
```js
// Inside useEffect that watches tableCode changes:
try { localStorage.removeItem('menuapp_guest_name'); } catch(e) {}
setGuestNameInput('');
```

### File and location
File: `x.jsx`. Search for `tableCode` state changes or `useEffect` depending on `tableCode`. Also check ~lines 1358-1362 (init) and ~line 3162 (save).

### Must NOT
- Name from previous visitor shown to new guest at different table
- Name reset to «Гость» after Chrome kill (if name was entered this session at same table)

### Verification
1. Enter name «Артур» → kill Chrome → reopen same table → name still «Артур» ✅
2. Change table → name cleared (shows «Гость») ✅
3. New session on different table → no stale name ✅

---

## Fix 9 — D3 (VL-04): «Все блюда поданы» screen [MUST-FIX, M weight]

### Currently
When all orders are delivered and cart is empty, drawer shows «Подано» collapsed section and empty space. No guidance for guest.

### Required
When **all status buckets except `served` are empty AND cart is empty** (= V8 state):
Show D3 screen:
```
┌─────────────────────────────────────┐
│ 🔔  Стол 22                      ˅ │
│ Вы: Гость 1 >      Заказов: 184 ₸ │
├─────────────────────────────────────┤
│                                     │
│  ✅ Ничего не ждёте.               │
│  Можно заказать ещё или оценить.    │
│                                     │
│  ▸ Подано (8) • Оценить   184.77 ₸│  ← collapsed, accent-chip, subtotal
│                                     │
├═════════════════════════════════════┤
│ [       Заказать ещё             ] │  ← minimal footer
└─────────────────────────────────────┘
```

**Condition:**
```js
const isV8 = statusBuckets.accepted.length === 0
  && statusBuckets.in_progress.length === 0
  && statusBuckets.ready.length === 0
  && statusBuckets.served.length > 0
  && cart.length === 0;
```

**Rules:**
- «Дозаказать» / «Заказать ещё» button: navigates back to menu (same as existing «Добавить к заказу» at ~line 859).
- ИТОГО: use `ordersSum` (same float fix).
- This condition should be checked ABOVE the normal bucket rendering.

### Must NOT
- Empty blank area when all delivered
- «Отправить» button when cart is empty

### Verification
1. All orders delivered + cart empty → ✅ banner + «Заказать ещё»
2. Add item to cart → switches to normal CartView with «Новый заказ»
3. One order still «Готовится» → normal view, no D3 screen

---

## ⚠️ D7 — DrawerContent: NO `relative` class
CartView.jsx uses DrawerContent (vaul library). Any new wrapper elements added inside DrawerContent must NOT have the `relative` class — it breaks vaul. KB-096.

## ⛔ SCOPE LOCK
- Modify ONLY: section structure, footer, rating visibility, collapsed rows, labels, date filter, success screen float, guest name localStorage, D3 screen, qty display
- Do NOT change: stepper +/- behavior, order submission logic, "Отправить официанту" API call payload
- Do NOT change: loyalty points calculation, table header chevron icon/position, help drawer logic
- Do NOT change: table confirmation Bottom Sheet, order tracking view
- In x.jsx: ONLY touch success screen float (PM-151, ~line 731) and guest name localStorage (~lines 1358, 3162, + tableCode effect)

## FROZEN UX (DO NOT CHANGE)
These elements are tested and working. Do NOT modify their CSS, className, or behavior:
- PM-104 ✅: chevron (˅) in right part of table card header, NOT sticky (~line 582-591)
- PM-140 ✅: "Вернуться в меню" + "Мои заказы" buttons on confirmation screen (x.jsx ~lines 759, 767)
- PM-141 ✅: star rating touch targets ≥ 44px (keep `<Rating>` component sizing when shown)
- PM-142 ✅: orders filtered to current date (Fix 6 REFINES to 06:00 cutoff, do NOT revert to all-time)
- PM-143 ✅: sort by full datetime (newest first within each bucket)
- PM-145 ✅: float fix on totals (parseFloat toFixed(2)) — extend pattern, do not remove existing
- PM-148 ✅: table banner removed (ModeTabs.jsx — not in scope)
- PM-149 ✅: guest name without suffix `#NNN` (CartView ~line 307-309 `guestDisplay = guestBaseName`)
- PM-155 ✅: discount price toFixed(2) (MenuView + x.jsx detail card — not in scope)

## FROZEN UX grep verification
Before commit, verify these have NOT been removed or broken:
```
grep -n "ChevronDown" pages/PublicMenu/CartView.jsx | head -5
grep -n "toFixed\|parseFloat" pages/PublicMenu/CartView.jsx | head -5
grep -n "guestBaseName\|guestDisplay" pages/PublicMenu/CartView.jsx | head -3
grep -n "formatPrice(totalAmount)" pages/PublicMenu/x.jsx | head -3
grep -n "menuapp_guest_name" pages/PublicMenu/x.jsx | head -5
```

## Regression Check (MANDATORY after implementation)
- [ ] "Отправить заказ официанту" button still submits order correctly
- [ ] Stepper (−/+) still adjusts quantities in «Новый заказ»
- [ ] Stars rating works when shown on Подано orders
- [ ] Table header with chevron still collapses/expands drawer
- [ ] Float fix applied on ALL totals (CartView footer + x.jsx success screen)
- [ ] Guest name persists after Chrome kill (same table)
- [ ] Guest name clears on table change
- [ ] D3 screen appears when all orders served + cart empty
- [ ] Help drawer still opens from bell icon (x.jsx unchanged outside scope)
- [ ] Подано bucket collapsed by default, other buckets expanded

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px viewport width:
- [ ] Status bucket headers visible and tappable (≥ 44px height)
- [ ] Sticky footer does not overlap scrollable content
- [ ] Collapsed summary rows: chevron ≥ 44×44px touch target
- [ ] «Новый заказ» steppers work correctly at 375px
- [ ] Long dish names truncated with ellipsis (not overflowing)
- [ ] Accent-chip «Оценить» visible and tappable on Подано header
- [ ] Guest name `>` tappable (≥ 44×44px hit area)

## Implementation Notes
- TARGET FILES: `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/x.jsx`
- CONTEXT: `ux-concepts/cart-view.md`, `BUGS_MASTER.md`
- Do NOT use `git add .` — only: `git add pages/PublicMenu/CartView.jsx pages/PublicMenu/x.jsx`
- git commit message: `feat: CartView v4 — status buckets, sticky footer, 06:00 filter, guest name, D3 screen`
- git push
=== END ===
