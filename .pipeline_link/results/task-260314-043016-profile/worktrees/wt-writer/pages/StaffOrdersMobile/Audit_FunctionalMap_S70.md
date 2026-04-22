# Functional Audit: StaffOrdersMobile + PublicMenu
## Session S70 | 2026-03-02
## Reviewed by: Claude Code (CC) + Codex (background)

---

## Files Analyzed

| File | Lines | Role |
|---|---|---|
| `StaffOrdersMobile/base/staffordersmobile.jsx` | ~3040 | Waiter/kitchen mobile interface |
| `PublicMenu/base/PublicMenu_BASE.txt` (x.jsx) | ~2504 | Guest public menu (main orchestrator) |
| `PublicMenu/base/useTableSession.jsx` | ~838 | Hall session/guest management hook |
| `PublicMenu/base/CartView.jsx` | ~600+ | Cart drawer (hall mode) |
| `PublicMenu/base/CheckoutView.jsx` | ~165 | Checkout form (pickup/delivery) |
| `PublicMenu/base/MenuView.jsx` | ~283 | Menu items display (tile/list) |
| `PublicMenu/base/ModeTabs.jsx` | ~83 | Hall/pickup/delivery mode selector |
| `components/sessionHelpers.js` | ~206 | Shared session utility functions |

---

## Deliverable 1: User Flow Map

### A. Client (Guest) Flows

#### 1. Scan QR -> Land on menu -> See restaurant info
- **What happens:** Guest scans QR containing URL like `/x?partner=<id>&table=<code>&mode=hall`
- **Code:** `X()` component (x.jsx:396-410) parses `searchParams` for `partner`, `table`, `mode`, `lang`
- **Partner load:** `useQuery("publicPartner")` (x.jsx:470-495) — lookup by ID or slug with fallback
- **Header:** `<PublicMenuHeader>` (x.jsx:2182-2196) — shows restaurant name, logo, contacts, language/currency switchers
- **Status:** ✅ Works

#### 2. Select mode: hall / pickup / delivery
- **What happens:** Guest sees mode tabs if multiple channels enabled
- **Code:** `useGuestChannels()` (x.jsx:228-268) determines which channels are visible/available based on partner config + dish availability. `<ModeTabs>` (ModeTabs.jsx) renders the switcher. `handleModeChange()` (x.jsx:1320-1341) updates state + URL.
- **Auto-redirect:** If current mode unavailable, auto-redirects to first available (x.jsx:969-998) with `<RedirectBanner>`
- **Status:** ✅ Works

#### 3. Hall mode: choose table -> enter table code
- **What happens:** Table can be resolved from QR URL param (`table=<code>`) OR guest enters code manually
- **Code:** `useHallTable()` hook (imported x.jsx:103, used x.jsx:611-623) handles:
  - QR resolution: `tableCodeParam` from URL
  - Manual input: `tableCodeInput` + `verifyTableCode()`
  - Result: `resolvedTable` / `verifiedTable` / `verifiedByCode`
- **Verification UI:** `<HallVerifyBlock>` (x.jsx:2160-2169) shown during checkout if table not verified
- **Verified badge:** `<ModeTabs>` shows green checkmark when verified (ModeTabs.jsx:54-63)
- **Status:** ✅ Works — QR auto-resolves; manual code entry available in checkout

#### 4. Enter phone number — where? when? required?
- **What happens:** Phone number is handled differently per mode:
  - **Hall:** Phone is OPTIONAL. `handlePhoneChange()` (x.jsx:1432-1441), `validate()` (x.jsx:1447-1483) — only validates format if provided, not required
  - **Pickup/Delivery:** Phone is REQUIRED. `validate()` checks `clientPhone` is non-empty + valid format
- **Code:** Phone input in `<CheckoutView>` (CheckoutView.jsx:109-123) for pickup/delivery. For hall, phone field is in `orderData.client_phone` (x.jsx:1584) — passed if provided
- **Where in hall:** Phone is collected ONLY in checkout view, NOT in CartView drawer. In the cart drawer, there is NO phone field for hall guests.
- **Status:** ⚠️ Partial — Hall mode has no UI to enter phone number in the cart drawer. It's only available in CheckoutView but hall mode primarily uses the drawer. The `comment` field could contain phone but no dedicated field.

#### 5. Browse menu -> view dish details -> add to cart
- **What happens:** Guest sees categorized dish list with images, prices, descriptions
- **Code:** `<MenuView>` (MenuView.jsx) renders tile or list layout. `addToCart()` (x.jsx:1344-1358) adds dish. `<CategoryChips>` for navigation. Scroll spy (x.jsx:1258-1298) tracks active category.
- **Dish details:** NO separate dish detail view/modal. Only name + description + price + image shown inline.
- **Dish reviews:** `<DishRating>` component shows avg rating; `<DishReviewsModal>` shows reviews on click (x.jsx:2447-2453)
- **Status:** ✅ Works (no full detail view — by design for simple QR menu)

#### 6. View cart -> modify quantities -> remove items
- **What happens:** Two cart UIs exist:
  - **Hall mode:** Bottom drawer (`<CartView>`) opened via `<StickyCartBar>` (x.jsx:2311-2392)
  - **Pickup/Delivery:** Checkout view (`<CheckoutView>`) with quantity controls
- **Code:** `updateQuantity()` (x.jsx:1361-1367) — delta-based, auto-removes at 0. Cart persisted in localStorage with 4h TTL (x.jsx:159-207).
- **Status:** ✅ Works

#### 7. Checkout -> confirm order -> see confirmation
- **What happens:**
  - **Hall:** Submit from CartView drawer via `handleSubmitOrder()` (x.jsx:1698) -> `processHallOrder()` (x.jsx:1520-1696). Creates Order + OrderItems + handles session/guest/loyalty.
  - **Pickup/Delivery:** Submit from CheckoutView. Same `handleSubmitOrder()` but different path (x.jsx:1850-1992).
- **Confirmation:** Toast `t('toast.order_sent')` shown. Cart cleared. View returns to menu.
- **No confirmation page.** Guest stays on menu after order.
- **Status:** ✅ Works — but no dedicated "order confirmed" screen with order number

#### 8. Track order status (waiting -> preparing -> ready -> served)
- **What happens:** Hall mode only. `<CartView>` shows `myOrders` with status badges via `<OrderStatusBadge>` (x.jsx:314-362). Uses `getOrderStatus()` from `useTableSession` hook.
- **Polling:** `useTableSession` polls every 10s (useTableSession.jsx:663-686)
- **Status display:** Shows icon + translated label (New/Cooking/Ready/Served) with color
- **Status:** ✅ Works (hall mode only; pickup/delivery has NO status tracking)

#### 9. Call waiter / request help
- **What happens:** Help button appears when table verified in hall mode
- **Code:** `<HelpFab>` floating button (x.jsx:2395-2403) -> `<HelpModal>` (x.jsx:2406-2421). `useHelpRequests()` hook manages state. Creates `ServiceRequest` entity.
- **Presets:** call_waiter, bill, napkins, menu, other (with custom comment)
- **Status:** ✅ Works (hall mode only, when table verified)

#### 10. Place additional order at same table
- **What happens:** After submitting an order, cart clears but session persists. Guest can add more items and submit again.
- **Code:** `processHallOrder()` reuses existing `tableSession` and `currentGuest` (x.jsx:1722-1838). Order gets same session + guest link.
- **Status:** ✅ Works

#### 11. View order history for current session
- **What happens:** CartView drawer shows all `myOrders` and other guests' orders in session
- **Code:** `myOrders` computed in useTableSession (useTableSession.jsx:777-781). Displayed in CartView with items, statuses, bills per guest.
- **Bill display:** `myBill`, `otherGuestsBills`, `tableTotal` computed (useTableSession.jsx:704-787)
- **Status:** ✅ Works

#### 12. What happens if session expires while browsing?
- **What happens:** On session restore (page load or table change), `isSessionExpired()` checks if `opened_at` > 8 hours ago.
- **Code:** `isSessionExpired()` (sessionHelpers.js:168-177) checks `opened_at` only. `closeExpiredSessionInDB()` (useTableSession.jsx:169-190) closes expired session + cancels unprocessed orders. Restore flow (useTableSession.jsx:265-487) closes all expired sessions before using any.
- **Client experience:** Expired session is silently closed. New session created on next order.
- **Status:** ⚠️ Partial — No user-facing message when session expires. Guest just loses order history silently. Activity guard (`hasRecentActivity`) added in S68 (BUG-PM-011) but only in useTableSession, not in sessionHelpers.

---

### B. Waiter (Staff) Flows

#### 1. Login / access — how does waiter get to the screen?
- **What happens:** Two access methods:
  - **Token mode:** URL `/staffordersmobile?token=<token>` — uses `StaffAccessLink` entity
  - **Direct login:** Logged-in user with valid role
- **Code:** `StaffOrdersMobile()` (staffordersmobile.jsx:1578). `tokenState` computed (line 1835-1843). Gate views: `gateView` (line 1944-2012) handles loading/locked/inactive/no-access states.
- **Device binding:** On first visit, binds device ID to link (line 1849-1856). `LockedScreen` shown if another device already bound.
- **Status:** ✅ Works

#### 2. Select/assign table — how does waiter choose which tables to watch?
- **What happens:** Waiter doesn't "select" tables to watch. All orders from the partner are shown, filtered by channels/assignment.
- **Favorites ("My Tables"):** `MyTablesModal` (line 1213-1310) lets waiter mark favorite tables. `showOnlyFavorites` toggle filters to show only starred items.
- **Code:** `favorites` state (line 1726), `toggleFavorite()` (line 1784-1803), `isFavorite()` (line 1806-1807)
- **Status:** ✅ Works (via favorites filter, not table assignment)

#### 3. Enter client phone number — is there a field for this? Where?
- **What happens:** Waiter has NO field to enter client phone number. Phone is only entered by the client in PublicMenu.
- **Code:** Not found in StaffOrdersMobile. Orders show `order.client_phone` if provided, but no input for waiter.
- **Status:** ❌ Missing — Waiter cannot enter/edit client phone number

#### 4. See new order notification -> review order details
- **What happens:** Polling detects new orders. Toast + vibration/sound/push notification.
- **Code:** `pushNotify()` (line 2517-2537). Notification effect (line 2540-2616) compares digests, detects new orders and status changes. `notifiedOrderIds` track which orders sparkle.
- **New order indicator:** Orange sparkle icon on card (OrderCard, line 997)
- **Status:** ✅ Works

#### 5. Accept/confirm order
- **What happens:** First stage action assigns the waiter and moves to next stage
- **Code:** `handleAction()` in OrderCard (line 826-855). If `isFirstAction` and order unassigned, sets `assignee` + `assigned_at`. Updates `stage_id` or `status`.
- **Status:** ✅ Works

#### 6. Change order status: new -> preparing -> ready -> served
- **What happens:** CTA button on each OrderCard shows next stage name
- **Code:** `getStatusConfig()` (line 2091-2138) determines current stage + next stage. `handleAction()` advances. Supports both `stage_id` (OrderStage) and legacy `status` modes.
- **Status:** ✅ Works

#### 7. View all orders grouped by table
- **What happens:** Non-kitchen view groups hall orders by table in `OrderGroupCard`. Pickup/delivery shown individually.
- **Code:** `orderGroups` (line 2389-2423). `sortedGroups` (line 2426-2437) sorted by oldest unaccepted. `finalGroups` with tab + favorites filtering.
- **Status:** ✅ Works

#### 8. View detail of specific table -> see all guests + orders
- **What happens:** Expanding a table group shows all orders for that table. Guest names shown via `guestsMap` badge.
- **Code:** `OrderGroupCard` (line 1081-1211) renders expandable card. `guestsMap` batch-loaded (line 2264-2309). `getGuestDisplayName()` from sessionHelpers.
- **Detail view:** Within the expanded group, individual OrderCards are shown with guest badges.
- **Status:** ⚠️ Partial — Shows orders + guest names, but no dedicated "table detail" screen with session info, total bill, etc.

#### 9. Handle service requests (help button from client)
- **What happens:** `ServiceRequest` entities shown as `RequestCard` components
- **Code:** `activeRequests` (line 2189-2202) filtered by shift + status. `RequestCard` (line 708-763) shows type, table, comment, status. Action button advances status: new -> in_progress -> done.
- **Status:** ✅ Works

#### 10. Close table / end session
- **What happens:** "Close table" button on individual orders and on table groups when all orders ready
- **Code:** `handleCloseTable()` (line 2651-2665) calls `closeSession()` from sessionHelpers. `handleCloseAllOrders()` (line 2668-2689) moves all orders to finish stage. "Close table" per-order in OrderCard (line 1045-1058). "Close table" per-group in OrderGroupCard (line 1192-1201).
- **Confirmation:** Uses `confirm()` dialog (line 2655)
- **Status:** ✅ Works

#### 11. Multi-device lock — how it works for waiter
- **What happens:** Device ID bound to StaffAccessLink on first visit. Other devices see `LockedScreen`.
- **Code:** `getOrCreateDeviceId()` (line 385-395). Binding in effect (line 1849-1856). Check: `link.bound_device_id !== deviceId` -> "locked" state (line 1841).
- **Status:** ✅ Works

#### 12. Shift management — start/end shift
- **What happens:** No explicit shift start/end. Shift boundaries are inferred from `partner.working_hours`.
- **Code:** `getShiftStartTime()` (line 291-361) calculates shift start. Orders/requests before shift start are filtered out (line 2220-2226, line 2192-2201).
- **Status:** ⚠️ Partial — Automatic shift filtering works, but no explicit "start shift" / "end shift" action for waiter. No shift handover.

#### 13. Sound/vibration notifications
- **What happens:** Configurable via notification panel
- **Code:** `notifPrefs` (sound, vibrate, system, enabled). `createBeep()` (line 490-517) for audio. `tryVibrate()` (line 483-488). Push via `Notification` API (line 2534-2536). Panel in bottom sheet (line 2987-3029).
- **Status:** ✅ Works

#### 14. Favorites (my tables) — how to set up
- **What happens:** Star icon on orders, table groups, and service requests. "My Tables" modal with search.
- **Code:** `toggleFavorite()` (line 1784-1803). Format: `table:<id>`, `order:<id>`, `request:<id>`. Stored in localStorage + synced to `StaffAccessLink.favorite_tables` for token mode.
- **Status:** ✅ Works

#### 15. Handle pickup/delivery orders (no table)
- **What happens:** Shown as individual cards (not grouped by table). Type badge shows pickup/delivery icon.
- **Code:** `orderGroups` (line 2410-2420) — individual group per pickup/delivery order. `TYPE_THEME` (line 159-178) provides icons and colors.
- **Status:** ✅ Works

#### 16. Create order on behalf of client (waiter-initiated order)
- **What happens:** Not supported. Waiter can only process client-submitted orders.
- **Code:** No order creation functionality in StaffOrdersMobile.
- **Status:** ❌ Missing

---

### C. Cross-Flow (Client <-> Waiter)

#### 1. Client orders -> waiter sees it — what's the full chain?
1. Guest calls `handleSubmitOrder()` -> creates `Order` entity with `partner`, `table`, `table_session`, `guest`, `stage_id`
2. Guest creates `OrderItem` entities linked to order
3. Waiter's polling (`refetchInterval`) picks up new order (5-60s depending on settings)
4. Notification effect detects new order ID not in previous digest -> `pushNotify()` fires
5. Order appears in waiter's list, grouped by table if hall mode
- **Status:** ✅ Works — delay is polling interval (default 5s)

#### 2. Waiter marks "served" -> client sees what?
1. Waiter clicks CTA to advance to finish stage -> `Order.update(id, { stage_id: finishStageId })`
2. Guest's `useTableSession` polling (10s) picks up updated order
3. `getOrderStatus()` returns finish icon + color for that stage
4. `<OrderStatusBadge>` in CartView shows updated status
- **Status:** ✅ Works — client sees "Ready" or "Served" badge after polling refresh

#### 3. Table session lifecycle: open -> active -> close — who controls what?
- **Open:** Guest triggers via `getOrCreateSession()` during first order submit (x.jsx:1726-1728). Creates `TableSession` with status "open" (note: sessionHelpers uses "active", useTableSession search uses "open" — **mismatch**)
- **Active:** Session persisted in localStorage. Polling keeps loading data. 8h hard expire.
- **Close by waiter:** `handleCloseTable()` calls `closeSession()` which sets status="closed" + `closed_at`
- **Close by expiry:** `closeExpiredSessionInDB()` sets status="expired" + cancels new orders
- **Who controls:** Guest opens, waiter or expiry closes
- **Status:** ⚠️ Issue — `getOrCreateSession()` in sessionHelpers.js:69 filters by `status: "active"` but creates with `status: "active"`. Meanwhile `useTableSession.jsx:310-313` filters by `status: "open"`. This is a potential bug — sessions created by sessionHelpers won't be found by useTableSession's restore if status naming is inconsistent. **However**, in practice the guest submit flow (x.jsx:1726) calls `getOrCreateSession(partner.id, currentTableId)` which is in sessionHelpers and uses "active", while the restore flow in useTableSession.jsx:310 uses "open". This means sessions created by the guest flow WON'T be found by the restore flow! This looks like it was never caught because the guest first creates via useTableSession restore (which creates with "open") and only falls back to sessionHelpers if none found.

#### 4. Guest identification — how does waiter know which guest ordered what?
- **Guest badge:** Blue badge on OrderCard showing `getGuestDisplayName()` (e.g., "Гость 1" or custom name)
- **Guest code:** 4-digit code (`hallGuestCodeEnabled`) — guest can show it to waiter verbally
- **Device tracking:** Guest identified by `device_id` in `SessionGuest` entity
- **Status:** ✅ Works (basic level — name badge only, no photo or detailed guest profile)

#### 5. Multiple guests at same table — how is this handled?
- **Session:** One `TableSession` per table. Multiple `SessionGuest` records per session.
- **Guest creation:** Each new device visiting same table gets a new `SessionGuest` (useTableSession via addGuestToSession)
- **Bill split:** `splitType` (single/all) per OrderItem. `billsByGuest` computed in useTableSession (line 705-749). Guest sees their bill + other guests' bills.
- **Guest name:** Editable in CartView via `handleUpdateGuestName()` (x.jsx:2003-2023)
- **Waiter view:** Sees guest name badges on orders within table group
- **Status:** ✅ Works

---

## Deliverable 2: Correspondence Table

| # | Feature / Flow | Client Code | Waiter Code | Status | Notes |
|---|---|---|---|---|---|
| 1 | Enter phone number | `CheckoutView` (pickup/delivery only) | None | ⚠️ | Hall: no phone field in drawer. Waiter: no phone input at all |
| 2 | Select table (hall) | `useHallTable()` hook | Favorites filter (`MyTablesModal`) | ✅ | Client selects via QR/code; waiter filters via favorites |
| 3 | Browse menu | `MenuView` + `CategoryChips` | N/A | ✅ | Tile/list toggle, scroll spy |
| 4 | Add to cart | `addToCart()` in x.jsx | N/A | ✅ | Cart persisted in localStorage (4h TTL) |
| 5 | View cart | `CartView` (drawer) / `CheckoutView` | N/A | ✅ | Hall=drawer, pickup/delivery=page |
| 6 | Submit order | `handleSubmitOrder()` -> `processHallOrder()` or pickup/delivery flow | N/A | ✅ | Creates Order + OrderItems + session/guest |
| 7 | View order status | `OrderStatusBadge` in CartView | `getStatusConfig()` + badge in OrderCard | ✅ | Both use OrderStage with fallback to STATUS_FLOW |
| 8 | Track order list | `myOrders` in useTableSession | `visibleOrders` / `orderGroups` | ✅ | Guest sees own; waiter sees all |
| 9 | Call waiter | `HelpFab` + `HelpModal` + `useHelpRequests()` | `RequestCard` + `activeRequests` | ✅ | Guest creates; waiter processes |
| 10 | Request bill | `handleRequestBill()` in x.jsx | `RequestCard` (type=bill) | ✅ | With 5min cooldown |
| 11 | Close table/session | N/A (guest can't close) | `handleCloseTable()` / `handleCloseAllOrders()` | ✅ | Waiter-only action |
| 12 | Create order for client | N/A | N/A | ❌ | Missing on both sides |
| 13 | Multi-guest bill split | `splitType` + `billsByGuest` in CartView | Not shown | ⚠️ | Guest sees split; waiter only sees total per order |
| 14 | Guest identification | `SessionGuest` (device_id, name, code) | `guestsMap` + guest badge | ✅ | Basic name badge |
| 15 | Additional order | Same session reuse via `processHallOrder()` | New order in same table group | ✅ | Works seamlessly |
| 16 | Shift filtering | N/A | `getShiftStartTime()` + shift cutoff | ✅ | Based on partner.working_hours |
| 17 | Notifications | N/A (sonner toasts only) | Sound/vibrate/push + sparkle indicator | ✅ | Configurable per-waiter |
| 18 | Loyalty/discount | `useLoyalty()` hook + email-based | N/A | ✅ | Earn/redeem points, discount calculation |
| 19 | Reviews/ratings | `useReviews()` + `DishRating` + `ReviewDialog` | N/A | ✅ | Instant star rating + full review flow |
| 20 | i18n / multi-language | `useI18n()` + translation hooks | Hardcoded Russian | ⚠️ | Client: full i18n. Waiter: all strings hardcoded |
| 21 | Currency conversion | `useCurrency()` hook | N/A | ✅ | Multi-currency display for guests |
| 22 | Device lock (waiter) | N/A | `bound_device_id` on StaffAccessLink | ✅ | One device per link |
| 23 | Logout | N/A | `handleLogout()` — clears data, unbinds device | ✅ | Redirects to "/" |
| 24 | Session expiry | `isSessionExpired()` + close in useTableSession | N/A (waiter doesn't see session status) | ⚠️ | No user-facing expiry message |
| 25 | Order number | Generated in `getNextOrderNumber()` | Shown in OrderCard badge | ✅ | Format: ZAL-001, SV-002, DOS-003 |

---

## Deliverable 3: Refactoring Assessment

### 1. Can StaffOrdersMobile be split? Into what logical modules?

**Yes, it can be split.** The file has clear logical boundaries:

| Proposed Module | Current Lines | Content | Dependencies |
|---|---|---|---|
| `helpers.js` | ~250 lines (224-578) | `getLinkId`, `isRateLimitError`, `getShiftStartTime`, `isOrderOverdue`, `safeParseDate`, `formatRelativeTime`, `getOrCreateDeviceId`, notification/sort/favorites helpers, `getStagesForOrder` | Pure functions, no React |
| `constants.js` | ~90 lines (130-219) | `STATUS_FLOW`, `TYPE_THEME`, `REQUEST_TYPE_LABELS`, `ROLE_LABELS`, storage keys, `POLLING_OPTIONS`, defaults | Pure constants |
| `RateLimitScreen.jsx` | ~25 lines (584-607) | Rate limit error screen | Card, Button |
| `LockedScreen.jsx` | ~17 lines (609-625) | Device locked screen | Card |
| `BindingScreen.jsx` | ~13 lines (627-641) | Binding in progress screen | Card, Loader2 |
| `IconToggle.jsx` | ~65 lines (643-706) | Filter toggle button | None |
| `RequestCard.jsx` | ~55 lines (708-763) | Service request card | Badge, Button, helpers |
| `OrderCard.jsx` | ~315 lines (765-1078) | Individual order card | useQuery, useMutation, helpers |
| `OrderGroupCard.jsx` | ~130 lines (1080-1211) | Table group (expandable) | OrderCard, helpers |
| `MyTablesModal.jsx` | ~100 lines (1213-1310) | Favorites management modal | Button, helpers |
| `ProfileSheet.jsx` | ~127 lines (1312-1438) | Staff profile bottom sheet | Button |
| `SettingsPanel.jsx` | ~120 lines (1440-1572) | Settings bottom sheet | IconToggle |
| `NotificationPanel.jsx` | ~30 lines (2987-3029) | Notification settings | Button |
| `StaffOrdersMobile.jsx` | ~1450 lines (1578-3038) | Main component (reduced) | All above + hooks |

**Total: 14 files** (1 main + 13 extracted)

### 2. Risk assessment: refactoring now vs later?

**Risk level: MEDIUM**

**Risks of refactoring now:**
- **Import path breakage:** Base44 may bundle differently. Need to verify module resolution works.
- **State coupling:** Main component has ~50 state variables. Passing props to extracted components is already happening (e.g., OrderCard has 12 props). Extraction won't change this but won't help much either.
- **Testing gap:** No automated tests exist. Manual testing required after refactoring.
- **Context loss:** If something breaks, debugging across 14 files is harder than one file for the current team (non-developer owner).

**Risks of NOT refactoring:**
- **3040 lines** is large but manageable for AI tooling (Base44 generates/edits whole files)
- **Merge conflicts** if multiple changes happen in parallel — but currently only one developer (AI)
- **Cognitive load** for code review — harder to review a 3040-line diff

### 3. Is refactoring blocking new features?

**No.** Current features that might be added:
- Waiter-initiated orders — would be a new component, not blocked by monolith
- Phone number entry for waiter — small addition to existing UI
- i18n for waiter — text replacement, not structural change
- Table detail view — new component, not blocked

The monolith structure doesn't prevent any planned feature. All proposed features are additive.

### 4. Recommendation

**Leave as-is for now. Refactor later (when complexity demands it).**

Reasoning:
1. **Base44 constraint:** The platform generates/manages entire page files. Splitting into modules may not be supported or may cause import resolution issues in the no-code builder.
2. **No test coverage:** Refactoring without tests is risky. Write tests first, then refactor.
3. **Single developer (AI):** No merge conflict pressure from parallel development.
4. **3040 lines is borderline:** Not ideal, but not catastrophic. The file is well-organized with clear section headers.
5. **Effort vs payoff:** ~4-6 hours of refactoring work for modest quality-of-life improvement. Better spent on features.

**When to reconsider:** If the file exceeds ~5000 lines, or if Base44 starts supporting component imports, or if multiple developers work in parallel.

### 5. If refactoring — proposed file structure

```
pages/StaffOrdersMobile/
├── base/
│   ├── staffordersmobile.jsx          ← Main (reduced to ~1450 lines)
│   ├── helpers/
│   │   ├── constants.js               ← STATUS_FLOW, TYPE_THEME, etc.
│   │   ├── linkHelpers.js             ← getLinkId, getAssigneeId, etc.
│   │   ├── timeHelpers.js             ← safeParseDate, formatRelativeTime, getShiftStartTime
│   │   ├── storageHelpers.js          ← localStorage/sessionStorage helpers
│   │   └── notificationHelpers.js     ← createBeep, tryVibrate, canUseNotifications
│   ├── components/
│   │   ├── OrderCard.jsx
│   │   ├── OrderGroupCard.jsx
│   │   ├── RequestCard.jsx
│   │   ├── IconToggle.jsx
│   │   ├── MyTablesModal.jsx
│   │   ├── ProfileSheet.jsx
│   │   ├── SettingsPanel.jsx
│   │   └── screens/
│   │       ├── RateLimitScreen.jsx
│   │       ├── LockedScreen.jsx
│   │       └── BindingScreen.jsx
│   └── hooks/
│       └── useStaffNotifications.js   ← Notification detection + push logic
```

**Estimated effort:** 6-8 hours (extract, test, verify in Base44)

---

## Key Findings Summary

### Missing Features (❌)
1. **Waiter cannot enter client phone number** — No input field in StaffOrdersMobile
2. **Waiter cannot create orders on behalf of client** — No order creation in waiter interface

### Partial Features (⚠️)
1. **Hall mode phone entry** — Phone field only in CheckoutView, not in CartView drawer (where hall orders happen)
2. **Session expiry handling** — Silent close, no user-facing message when session expires
3. **Shift management** — Auto-filtered by working hours, but no explicit start/end shift action
4. **Table detail view** — Expandable groups show orders, but no dedicated screen with session/bill/guest summary
5. **i18n for waiter** — All waiter-facing strings are hardcoded Russian
6. **Bill split visibility for waiter** — Guest sees per-guest bills, waiter only sees order totals
7. **Session status naming** — `getOrCreateSession()` uses "active", `useTableSession` searches for "open"

### Working Features (✅)
All core ordering flows work: QR scan, menu browsing, cart, checkout, order submission, status tracking, notifications, favorites, help requests, table close, device lock, loyalty, reviews, multi-guest, additional orders.

---

*Audit completed by Claude Code (CC). Codex consulted in background for parallel validation.*
