# Deep Functional Analysis: StaffOrdersMobile + PublicMenu
## Session S70 | 2026-03-03
## Analyzed by: Claude Code (CC) + Codex (background)
## Prerequisite: Audit_FunctionalMap_S70.md (completed S70)

---

## Part 1: Full Customer Journey

### Scenario A: Hall Guest (Dine-In)

**Step 1: Enter restaurant, sit down, scan QR**
- QR encodes URL: `/x?partner=<id>&table=<code>&mode=hall`
- App loads, resolves partner (by ID or slug), resolves table from `table` URL param via `useHallTable()` hook
- Guest sees: restaurant header (name, logo, contacts), mode tabs (if multiple channels), menu
- **Works well.** Fast path from scan to menu.

**Step 2: Browse menu, add items**
- Menu shows categorized dishes with images, prices, descriptions
- Category chips at top with scroll spy tracking
- Tile/list layout toggle on mobile
- `addToCart()` adds dish, cart persisted in localStorage (4h TTL)
- **Works well.** No dish detail modal — by design for simple QR menu.

**Step 3: Open cart, review, submit order**
- Hall mode uses bottom drawer (`CartView`) via `StickyCartBar`
- StickyBar always visible when table verified (even with empty cart — shows "my bill" or "table orders")
- Cart shows items with quantity controls, split type selector, optional comment
- Submit calls `handleSubmitOrder()` → `processHallOrder()`
- Creates `Order` + `OrderItem` entities, links to session + guest
- **After submit:** toast "Заказ отправлен", cart clears, guest stays on menu view. Drawer stays open.
- **GAP: No order confirmation screen.** Guest sees a toast that disappears in 3 seconds. No order number shown. No "your order #ZAL-001 has been sent" screen. Guest must open cart drawer to see order in "My orders" section.

**Step 4: Wait for food, check order status**
- Guest can open cart drawer to see `myOrders` with `OrderStatusBadge` (New → Cooking → Ready → Served)
- Polling every 10 seconds via `useTableSession`
- **Works.** But guest has no push notification. Must actively check the drawer.

**Step 5: Want more food — order again**
- Guest adds items, submits again. Session and guest reused automatically.
- New order gets its own order number, same table session.
- **Works seamlessly.**

**Step 6: See the bill**
- StickyBar shows "Мой счёт" with bill amount when orders exist but cart is empty
- Cart drawer shows: my orders + items + my bill total, other guests' bills, table total
- Bill split supported (single = my items only, all = split equally)
- **Works.** But there's no dedicated "bill view" — it's all inside the cart drawer.

**Step 7: Request bill from waiter**
- Help button (floating) → HelpModal → preset "Принести счёт"
- Creates `ServiceRequest` entity, waiter sees it in their interface
- 5-minute cooldown on bill requests (per table, stored in localStorage)
- **Works well.**

**Step 8: Pay and leave**
- Payment is outside the app (cash/card to waiter)
- **GAP: Guest has no "I'm done" action.** No way to indicate they've paid or are leaving.
- Waiter closes table from their interface (`handleCloseTable`)
- **GAP: Guest gets no notification that table is closed.** Session silently becomes "closed" on next poll.

**Step 9: Close browser, reopen QR later**
- Session restores from localStorage (sessionId + guestId, 8h TTL)
- `useTableSession` restore flow: check saved session → validate in DB → restore guest via multiple fallback strategies (session key, table key, legacy key, guest code, device ID)
- If session expired (>8h): silently closed, new session on next order
- **Works**, but **GAP: no user-facing message when session expires.** Guest just sees empty cart drawer.

**Step 10: Second person at same table scans QR**
- New device → new `SessionGuest` created (`addGuestToSession`)
- Each guest gets own guest number (Гость 1, Гость 2)
- Each guest sees own orders + other guests' orders (with bills)
- Guest can edit their name in cart drawer
- **Works.** But both guests share the same menu view — no "table overview" or shared cart.

**Step 11: Guest wants to CANCEL an order**
- **NOT POSSIBLE.** No cancel button in guest UI. Once submitted, order exists until waiter closes or session expires.
- Only `closeExpiredSessionInDB` cancels unprocessed orders (status "new" → "cancelled"), but this is automated cleanup, not user-initiated.

### Scenario B: Pickup Guest

**Step 1-3: Same as hall** (mode selection → menu → add to cart)
- Checkout view (`CheckoutView`) instead of drawer
- Required fields: name, phone
- Optional: comment, loyalty email

**Step 4: Submit order**
- `handleSubmitOrder()` → pickup/delivery flow (x.jsx:1850-1992)
- Toast "Заказ отправлен", view transitions back to menu after 300ms
- **GAP: No order confirmation with order number.** Guest sees toast only. No "Your order #СВ-001" screen.
- **GAP: No way to track order status after submit.** Pickup/delivery mode has NO `useTableSession`, NO polling, NO status tracking UI. Guest has zero visibility into their order after submitting.

**Step 5: Know when order is ready**
- **NOT POSSIBLE from app.** No push notifications, no SMS, no status page.
- Guest must physically come to restaurant and ask.
- The `public_token` field is generated (random) but never used for a status lookup page.

**Step 6: Cancel pickup order**
- **NOT POSSIBLE.** Same as hall.

### Scenario C: Delivery Guest

- Identical to pickup + delivery address field (required)
- Same gaps: no confirmation screen, no status tracking, no cancel

---

## Part 2: Full Waiter Workday

### Morning — Waiter Arrives

**Opening the app:**
- Waiter opens `/staffordersmobile?token=<token>` from bookmarked link or message
- Device binding check: first visit binds device ID → subsequent visits from same device only
- If another device already bound → "Ссылка занята" screen (must ask manager to re-issue)
- Once bound, waiter sees the order list immediately

**What does waiter see first?**
- Header: "Заказы" + active count
- Filter bar: Мои / Чужие / Свободные (assign filters)
- Tabs: Активные / Завершённые + Favorites star
- Orders from current shift only (auto-filtered by `getShiftStartTime()` based on `working_hours`)
- **No "good morning" or shift-start ritual needed.** App just shows current orders.

**How does waiter know which tables are their responsibility?**
- No table assignment system. All orders visible to all waiters.
- "Мои столы" favorites: waiter can star tables for quick filtering
- "Мои" filter: shows orders assigned to this waiter
- **This works for small restaurants** (10 tables, 2-3 waiters). For larger venues, table assignment would be needed.

**Are there orders from yesterday?**
- No. Shift filtering (`getShiftStartTime`) hides orders before current shift start.
- Handles overnight shifts correctly (e.g., close at 01:29 → shift started yesterday)
- **Works well.**

### During Service

**New order comes in:**
1. Polling detects new order (5-60s interval, configurable)
2. Notification: sound beep (880Hz) + vibration + system notification (if permitted) + orange sparkle on card
3. Order appears in table group, expandable card
4. Waiter sees: table name, order type badge, guest name badge, time ago, overdue indicator if >10min
5. Waiter clicks "Принять" → assigns self + moves to next stage
- **Works well.** Sound + vibration are good for phone-in-pocket scenarios.

**Multiple tables ordering simultaneously:**
- Sort by priority: Ready (top) → New → In Progress → Accepted
- Overdue badge (red clock) on orders waiting >10min
- Auto-expand first 5 groups + favorites
- **Adequate** for small restaurant. No explicit queue or priority system.

**Guest asks waiter verbally to order (no QR):**
- **NOT POSSIBLE.** `StaffOrdersMobile` has NO order creation functionality.
- Waiter would need to: (a) scan QR themselves and order as guest, or (b) ask guest to scan
- **This is a real gap** for elderly guests or those without phones.

**Food is ready (kitchen marks "ready"):**
- Polling detects stage change → notification "Готово: +1"
- Order card gets green styling + "Выдать" CTA button
- **Works.** But if phone is in pocket, waiter relies on vibration/sound. No persistent alarm.

**Waiter brings food, marks "served":**
- Clicks "Выдать" → moves to finish stage
- Guest's polling (10s) picks up change, shows ✅ badge in cart drawer
- **Works.**

**Guest wants to change/cancel order:**
- **NOT POSSIBLE from either side.** No "modify order" or "cancel order" button for waiter.
- In practice: waiter would tell kitchen verbally, no app record.
- **Real gap.** In any restaurant, order modifications are common.

**Guest wants bill → pays → waiter confirms payment:**
- Guest presses help button → "Принести счёт" → ServiceRequest created
- Waiter sees request, processes it (new → in_progress → done)
- Guest pays cash/card outside app
- **GAP: No "mark as paid" button.** `payment_status` field exists on Order entity ("unpaid") but StaffOrdersMobile has NO UI to change it. Waiter can only close the table.
- **Workaround:** Waiter clicks "Закрыть стол" which closes session. But this doesn't record payment.

**Close table:**
- "Закрыть стол" button on table group (when all orders finished) or per-order
- Calls `closeSession()` → sets session status="closed" + `closed_at`
- Also "Закрыть стол" on OrderGroupCard moves all orders to finish stage
- Confirm dialog: "Закрыть стол? Сессия будет завершена."
- **Works.** Two different "close" actions exist (close session vs move orders to finish) — could be confusing.

### End of Day

**Last guests leave:**
- Waiter closes remaining open tables
- Any orders left in "new" status after session expires (8h) are auto-cancelled by `closeExpiredSessionInDB`

**End-of-day summary:**
- **NOT AVAILABLE.** No daily report: orders served, tables handled, revenue, tips
- Completed tab shows finished orders for current shift, but no aggregated stats
- **Gap, but LOW priority** for MVP. Manager can see this in Partner cabinet.

---

## Part 3: Kitchen Perspective

**Cook opens StaffOrdersMobile:**
- Same app, role detected as "kitchen" from `StaffAccessLink.staff_role`
- Kitchen view differs:
  - **Flat list** (no table grouping)
  - **No guest badges** (kitchen doesn't need to know which guest ordered)
  - **No service requests** (bill/waiter calls irrelevant for kitchen)
  - **No "Close table" button**
  - **Kitchen cannot mark "served"** (`disableServe={isKitchen}`) — only up to "Ready"
  - **Filters start/new orders hidden** — kitchen sees only accepted+ orders

**Cook sees orders:**
- Filtered: only `accepted`, `in_progress`, `ready` (NOT `new` — waiter must accept first)
- Each order shows: items (expandable), table name, time ago, status
- Sort by priority: Ready → accepted/in_progress

**Cook finishes dish, marks ready:**
- Clicks "Готово" → moves to finish stage
- Waiter's polling detects change → notification "Готово: +1"
- **Works.**

**Multiple orders from same table:**
- Kitchen sees them as separate cards (flat list, no grouping)
- No "same table" indicator for kitchen
- **Adequate** for small kitchen. For high-volume, a combined table view would help.

**Order queue (FIFO):**
- Sort by time within priority tier (oldest first when priority sort active)
- But no explicit queue numbering or position display
- **Adequate for MVP.**

---

## Part 4: Edge Cases & Real-World Situations

### 1. Guest sits down but doesn't order for 20 minutes — then orders
- **Works fine.** No session created until first order submitted. Cart persists in localStorage (4h TTL). Timer irrelevant.

### 2. Guest orders, then moves to different table
- **Problematic.** Session is tied to original table. If guest scans new table's QR:
  - `useTableSession` detects table change (line 219-243), clears session state
  - Old session stays open in DB (auto-expires after 8h)
  - Guest loses visibility of orders from old table
  - Orders still exist in DB, waiter still sees them on old table
- **Impact: MEDIUM.** Rare scenario but causes confusion. Guest cannot move orders between tables.

### 3. Two waiters accidentally accept the same order
- **Possible.** `handleAction()` sets `assignee` only on first action (when `isOrderFree`), but there's no lock or optimistic concurrency check.
- Race condition window: polling interval (5s default). Both waiters see order as "free", both click "Принять" within 5s.
- Second waiter's action would overwrite `assignee` + `assigned_at` (last write wins).
- **Impact: LOW.** In practice, small restaurant with 2-3 waiters, verbal coordination prevents this. No data loss, just assignment confusion.

### 4. Internet drops for 30 seconds during order submission
- `handleSubmitOrder()` is NOT idempotent. If network fails partway through:
  - If `Order.create()` fails → error toast, no order created. Guest can retry. **Safe.**
  - If `Order.create()` succeeds but `OrderItem.bulkCreate()` fails → order exists with no items. **Problem.** Waiter sees empty order.
  - If both succeed but `Partner.update()` (counter) fails → order exists, counter not updated. **Minor.** Next order might get duplicate number.
- Double-tap protection exists (`submitLockRef.current`) but no retry logic.
- **Impact: MEDIUM.** Partial order creation is a real risk on unreliable mobile networks.

### 5. Guest scans QR of wrong table
- Guest sits at table 5 but scans table 3's QR
- App resolves table 3, creates session for table 3, order goes to table 3
- Waiter sees order on table 3, goes there, finds no guest
- **No automatic detection.** App trusts QR fully.
- **Impact: LOW.** Rare, and waiter can verbally resolve. Table code verification adds a layer of protection (guest must enter code displayed at table).

### 6. Restaurant is closing in 30 minutes — can they stop accepting orders?
- **No mechanism in app.** No "close ordering" toggle.
- Partner admin could theoretically disable channels, but that requires accessing Partner cabinet.
- No scheduled closing, no "last call" notification.
- **Impact: MEDIUM for pickup/delivery** (guest might order at 11:50pm, kitchen closes at midnight). Hall mode is less affected (waiter can verbally stop taking orders).

### 7. Dish runs out mid-service — how to mark it unavailable?
- **Not from StaffOrdersMobile.** No dish management in waiter interface.
- Would need to go to Partner cabinet → Dishes → toggle `enabled_hall`, etc.
- Or use a B44 prompt to add "out of stock" toggle per dish.
- **Impact: MEDIUM.** Common situation in restaurants. Workaround: waiter tells guests verbally.

### 8. Guest complains about food — feedback mechanism?
- In-app: `DishReviewsModal` lets guest rate dishes after ordering (star rating + review text)
- Rating visible to other guests viewing the dish
- No dedicated "complaint" flow, no complaint routing to manager
- **Impact: LOW.** Reviews serve as indirect feedback. Direct complaints are handled verbally.

### 9. Large party (10+ people) at one table — does the UI scale?
- Session supports unlimited guests, each with separate bills
- Cart drawer shows all guests' orders + bills (scroll needed for many)
- `otherGuestsExpanded` toggle hides/shows other guests' section
- Waiter sees all orders grouped under table with per-order cards
- **Scales reasonably.** Might be slow with many orders due to polling + item loading, but UI handles it.

---

## Part 5: Gap Analysis — What's ACTUALLY Needed

### GAP-01: No Order Confirmation Screen (Guest)
- **What's missing:** After submitting order, guest sees only a 3-second toast. No confirmation screen showing order number, estimated wait, or "your order has been received" message.
- **Who needs it:** Guest (hall, pickup, delivery)
- **Impact:** HIGH for pickup/delivery (guest has zero confirmation they ordered), MEDIUM for hall (guest can check drawer)
- **Recommendation:** Implement now. Especially critical for pickup — guest needs order number to identify their order at pickup counter.

### GAP-02: No Order Status Tracking for Pickup/Delivery
- **What's missing:** After pickup/delivery order submit, guest cannot track status. No status page, no polling, no notifications.
- **Who needs it:** Pickup/delivery guest
- **Impact:** HIGH (blocks core flow for pickup/delivery mode)
- **Recommendation:** Implement now. Use `public_token` (already generated) to create a status lookup page. Simple polling with OrderStatusBadge.

### GAP-03: Waiter Cannot Create Orders (Verbal/Walk-Up)
- **What's missing:** No order creation in StaffOrdersMobile. Waiter can only process guest-submitted orders.
- **Who needs it:** Waiter (for elderly guests, guests without phones, verbal orders)
- **Impact:** MEDIUM (workaround: waiter scans QR and orders as guest, or asks guest to use their phone)
- **Recommendation:** Implement later. Current workaround is acceptable for MVP with QR-native guests. But important for restaurants with diverse clientele.

### GAP-04: No "Mark as Paid" for Waiter
- **What's missing:** `payment_status` exists on Order but no UI to update it. Waiter can only "close table" but cannot record whether payment was received.
- **Who needs it:** Waiter, manager (accounting)
- **Impact:** MEDIUM (workaround: closing table implies payment in practice)
- **Recommendation:** Implement later. For small restaurant, closing table = payment received. Important for larger operations or end-of-day reconciliation.

### GAP-05: No Order Modification/Cancellation
- **What's missing:** Neither guest nor waiter can modify or cancel a submitted order from the app.
- **Who needs it:** Guest (changed mind), waiter (guest request)
- **Impact:** MEDIUM (workaround: verbal communication with kitchen)
- **Recommendation:** Implement later. Cancellation for "new" orders (before kitchen accepts) would be most useful. Full modification is complex.

### GAP-06: i18n Missing in StaffOrdersMobile
- **What's missing:** All waiter-facing strings hardcoded in Russian. No `t()` or `useI18n()`.
- **Who needs it:** Non-Russian speaking staff
- **Impact:** LOW for Kazakhstan market (Russian is common), MEDIUM for expansion
- **Recommendation:** Implement later, when internationalization becomes a priority.

### GAP-07: No "Stop Accepting Orders" Toggle
- **What's missing:** Restaurant cannot pause order acceptance from the app. No closing time enforcement.
- **Who needs it:** Manager, kitchen
- **Impact:** MEDIUM for pickup/delivery (orders can come in after kitchen closes)
- **Recommendation:** Implement later. Simple toggle in settings: "temporarily pause new orders" with auto-resume timer.

### GAP-08: No Dish Availability Toggle from Waiter Side
- **What's missing:** When a dish runs out, waiter cannot mark it unavailable from StaffOrdersMobile.
- **Who needs it:** Waiter, kitchen
- **Impact:** MEDIUM (common restaurant scenario, currently requires Partner cabinet access)
- **Recommendation:** Implement later. Simple "86'd" toggle per dish in waiter interface.

### GAP-09: Session Expiry Not Communicated to Guest
- **What's missing:** When session expires (8h), it's silently closed. Guest sees empty cart drawer with no explanation.
- **Who needs it:** Guest
- **Impact:** LOW (8h is generous, most visits are 1-2h; expiry is edge case)
- **Recommendation:** Implement later. Show message: "Your session has ended. Place a new order to start a new session."

### GAP-10: No End-of-Day Summary for Waiter
- **What's missing:** No daily report (orders served, tables handled, revenue)
- **Who needs it:** Waiter (personal tracking), manager (oversight)
- **Impact:** LOW (manager has Partner cabinet with this data)
- **Recommendation:** Never (for waiter interface). This belongs in Partner cabinet / manager dashboard.

### GAP-11: Partial Order Creation on Network Failure
- **What's missing:** Order creation is not atomic. If network drops between `Order.create()` and `OrderItem.bulkCreate()`, an empty order exists in the system.
- **Who needs it:** System integrity
- **Impact:** MEDIUM (intermittent network on mobile devices is real)
- **Recommendation:** Implement later. Add cleanup: if OrderItems creation fails, delete the Order. Or mark it as "draft" until items confirmed.

### GAP-12: Waiter Bill Split Visibility
- **What's missing:** Waiter only sees order totals, not per-guest bill breakdown. Guest sees split bills but waiter doesn't.
- **Who needs it:** Waiter (when guests ask "how much do I owe?")
- **Impact:** LOW (guests see their own bills, waiter can tell them to check their phone)
- **Recommendation:** Never. Guests already have this information.

---

## Part 6: Session Status Mismatch Investigation

### The Bug

**sessionHelpers.js:68-86** — `getOrCreateSession()`:
- Filters by `status: "active"` (line 71)
- Creates with `status: "active"` (line 81)

**useTableSession.jsx:310-313** — restore flow:
- Filters by `status: "open"` (line 313)

### Trace: Every Code Path That Creates a Session

| # | Code Location | Filter Status | Create Status |
|---|---|---|---|
| 1 | `sessionHelpers.js:getOrCreateSession()` line 69-86 | `"active"` | `"active"` |
| 2 | PublicMenu `x.jsx:1726` calls `getOrCreateSession()` | `"active"` (via helper) | `"active"` (via helper) |

**Only one code path creates sessions:** `getOrCreateSession()` in sessionHelpers.js, called from x.jsx during order submit.

### Trace: Every Code Path That Reads/Filters Sessions

| # | Code Location | Status Filtered | Purpose |
|---|---|---|---|
| 1 | `sessionHelpers.js:getOrCreateSession()` line 69-72 | `"active"` | Find existing session to reuse |
| 2 | `useTableSession.jsx:285` (restore from saved ID) | Checks `savedSession.status === 'open'` (line 285) | Validate saved session is still active |
| 3 | `useTableSession.jsx:310-313` (search for session) | `status: 'open'` | Find active session if saved one invalid |
| 4 | `sessionHelpers.js:isSessionExpired()` line 168-177 | Checks `session.status === "closed"` | Determine if expired |
| 5 | `sessionHelpers.js:closeSession()` line 157-161 | Sets `status: "closed"` | Close session |
| 6 | `useTableSession.jsx:closeExpiredSessionInDB()` line 169-190 | Sets `status: 'expired'` | Auto-expire |

### Analysis: Is This Actually a Bug?

**YES, it is a real mismatch, but with limited practical impact in the current flow.**

Here's why:

**Flow 1: Guest visits page, session restore runs FIRST**
1. Guest scans QR → `useTableSession` restore effect fires (line 265)
2. Restore searches for saved session ID in localStorage
3. If no saved session → searches DB with `status: 'open'` (line 310-313)
4. Finds nothing (because sessions are created with `status: "active"`)
5. `session` stays null
6. Guest browses menu, adds to cart, submits
7. `handleSubmitOrder()` → calls `getOrCreateSession()` (x.jsx:1726)
8. `getOrCreateSession()` searches by `status: "active"`, finds nothing, **creates new session with status `"active"`**
9. Session saved to localStorage, `setTableSession(session)`

**Flow 2: Guest refreshes page (F5)**
1. `useTableSession` restore fires
2. Finds saved session ID in localStorage
3. Fetches session from DB by ID (line 280)
4. Checks: `savedSession.status === 'open'` → **FALSE** (status is `"active"`)
5. Session rejected as invalid!
6. Falls through to step 2: search by `status: 'open'` → finds nothing
7. Session not restored. Guest loses session context.

**BUT WAIT** — there's a subtlety. At line 285:
```js
const isActive = savedSession.status === 'open' &&
                 !savedSession.closed_at &&
                 !savedSession.ended_at &&
                 !isExpired;
```
This returns `false` because status is `"active"` not `"open"`. So the saved session is treated as invalid.

Then at line 297:
```js
} else if (savedSession.status === 'open' && isExpired) {
```
This also doesn't match. So the saved session is silently ignored — no cleanup, no error.

### Real-World Impact

**Scenario: Guest orders, then refreshes page**
1. First order: session created with `status: "active"`
2. F5: `useTableSession` can't restore (expects `"open"`)
3. Guest adds more items, submits second order
4. `getOrCreateSession()` searches by `status: "active"` → **finds existing session!**
5. Second order goes to same session. **Works correctly.**

So the restore-on-F5 fails to show previous orders, but the next order still links correctly because `getOrCreateSession()` uses the right status.

**Actual symptoms a guest would experience:**
- After F5: StickyBar shows "Открыть" instead of "Мой счёт" (no session data loaded)
- Opening cart drawer: no "My orders" section (session not restored)
- Submitting new order: works correctly, links to same session
- After new order: session data loads again via optimistic update

**Data integrity:** No data loss. Orders are correctly linked. The issue is **UX** — guest temporarily loses visibility of their order history after refresh.

### Severity Assessment

- **Priority:** P1 (UX issue, not data loss)
- **Frequency:** Every time a hall guest refreshes the page after ordering
- **Fix complexity:** Simple — change `getOrCreateSession()` to use `status: "open"` instead of `"active"`, or change `useTableSession` restore to also accept `"active"`
- **Recommended fix:** Change `sessionHelpers.js:getOrCreateSession()` to use `status: "open"` consistently. Both the filter (line 71) and the create (line 81) should use `"open"`. This aligns with what `useTableSession` expects and what `closeSession` sets as the "pre-close" state.

### Fix Proposal

```js
// sessionHelpers.js:getOrCreateSession()
// Line 69-86: Change "active" to "open" in both filter and create

export async function getOrCreateSession(tableId, partnerId) {
  const sessions = await base44.entities.TableSession.filter({
    table: tableId,
    status: "open"    // was: "active"
  });

  if (sessions && sessions.length > 0) {
    return sessions[0];
  }

  const newSession = await base44.entities.TableSession.create({
    table: tableId,
    partner: partnerId,
    status: "open",    // was: "active"
    opened_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  });

  return newSession;
}
```

**Migration concern:** Any existing sessions in DB with `status: "active"` would become orphaned (not found by filter "open", not cleaned up by expiry check that only looks for "open"). A one-time migration or dual-status filter may be needed. See SESS-021 in SessionLogic_Consensus_S67.md.

---

## Summary: Priority Matrix

| Priority | Gap | Who | Recommendation |
|---|---|---|---|
| **P0** | GAP-02: No pickup/delivery status tracking | Guest | Implement ASAP |
| **P1** | GAP-01: No order confirmation screen | Guest | Implement soon |
| **P1** | Session status mismatch ("active" vs "open") | System | Fix in next session |
| **P1** | GAP-11: Partial order on network failure | System | Implement soon |
| **P2** | GAP-03: Waiter can't create orders | Waiter | Later |
| **P2** | GAP-04: No "mark as paid" | Waiter | Later |
| **P2** | GAP-05: No order cancel/modify | Guest+Waiter | Later |
| **P2** | GAP-07: No "stop orders" toggle | Manager | Later |
| **P2** | GAP-08: No dish availability toggle | Waiter | Later |
| **P3** | GAP-06: i18n for waiter | Staff | Later (expansion) |
| **P3** | GAP-09: Session expiry message | Guest | Later |
| **P3** | GAP-10: End-of-day summary | Waiter | Never (use cabinet) |
| **P3** | GAP-12: Waiter bill split view | Waiter | Never |

---

*Analysis completed by Claude Code (CC). Codex consulted in background for session mismatch validation.*
