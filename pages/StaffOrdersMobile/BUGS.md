# StaffOrdersMobile Bug Tracker

**Page:** `pages/StaffOrdersMobile/260302-05 StaffOrdersMobile RELEASE.jsx`
**Last updated:** 2026-03-03 (Session 72 — SESS-016 scheduled cleanup job)

---

## Fixed Bugs

### BUG-S66-01 (P1) -- Detail view doesn't open on card tap (Sprint B broken)
- **Function:** TableDetailScreen render / CSS animation
- **Root cause:** CSS `translate-x-full` → `translate-x-0` transition with `requestAnimationFrame` timing was unreliable in Base44 platform container. Detail screen mounted but stayed off-screen.
- **Fix:** Removed slide-in animation entirely. Detail view now shows instantly with `z-50` (above all other content). Swipe-right to close gesture retained.
- **Commit:** `9b27dfd`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S66-02 (P1) -- No CTA button on PREPARING card
- **Function:** computeGroupCTA
- **Root cause:** `computeGroupCTA` returned `null` for all PREPARING status cards (by Sprint A design V2-06). Orders in middle stages (kitchen working) had no action button, preventing waiter from advancing them.
- **Fix:** For PREPARING status, find orders with `nextStageId`/`nextStatus` that are advanceable (not first-stage, not finish-stage). Show CTA with appropriate action label. Added `ctaBgClass` for PREPARING style.
- **Commit:** `aba6513`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S65-04 (P1) -- Waiter accepts order blind (no content visible)
- **Function:** computeGroupCTA / handleCTA
- **Root cause:** CTA on collapsed card for NEW orders directly advanced the order status (accepting it) without showing the order content (dishes, quantities). Waiter had no idea what they were accepting.
- **Fix:** First-stage CTA now opens the detail view (calls `onCardBodyTap`) instead of advancing directly. Label changed from "Принять" to "Открыть заказ". Accept button remains in the detail view (GuestOrderSection) where order content is visible.
- **Commit:** `4f2fa26`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S65-05 (P2) -- Double "Стол" prefix ("Стол Стол 22")
- **Function:** orderGroups computation / banner text
- **Root cause:** `displayName` was constructed as `` `Стол ${tableName}` `` where `tableName` comes from `tableMap[tableId].name` which already contains "Стол" prefix (DB stores "Стол 22"). Same issue in banner notification text.
- **Fix:** Removed hardcoded "Стол " prefix from `displayName` in orderGroups computation and from single-table banner text. Table name used as-is from DB.
- **Commit:** `5200dc7`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-011 (P0) -- Hall orders without table_session shown in active view
- **Function:** activeOrders (useMemo filter)
- **Root cause:** Hall orders with `table_session: null` (legacy/orphan data from before session logic was implemented, or orders created when session expired) passed through the filter and appeared in the waiter's active orders list. Combined with BUG-PM-009 (sessions never expired), this caused historical orders to appear mixed with current ones.
- **Fix:** Added filter: `if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false` in `activeOrders` computation. Hall orders without a valid `table_session` link are now excluded from the active view.
- **Commit:** `9dae0cc`
- **RELEASE:** `260302-04 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-002 (P1) -- handleCloseAllOrders silent error swallowing
- **Function:** handleCloseAllOrders
- **Fix:** Added error toast for non-rate-limit failures
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-003 (P1) -- AudioContext resource leak on unmount
- **Function:** createBeep / audioRef usage
- **Fix:** Added cleanup useEffect that calls `beep.ctx.close()` on unmount
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-004 (P1) -- Logout race condition with device unbinding
- **Function:** handleLogout
- **Fix:** Changed to async with await on StaffAccessLink.update; wrapped in try/catch
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-005 (P2) -- parseTime NaN propagation
- **Function:** parseTime
- **Fix:** Added `if (isNaN(h) || isNaN(m)) return null;` guard
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-006 (P1) -- filteredGroups uses unsorted orderGroups
- **Line:** ~2479-2490
- **Fix:** Changed input from `orderGroups` to `sortedGroups`; updated dependency array
- **Commit:** `1b20f90`
- **Status:** FIXED

---

### BUG-SM-012 (P0) -- No scheduled session cleanup (SESS-016)
- **Function:** (missing — no cleanup job existed)
- **Root cause:** Base44 has no built-in scheduler. Expired sessions (>8h) with no problem orders stayed `open` forever, causing stale data accumulation and historical orders appearing to new guests.
- **Fix:** Created `components/sessionCleanupJob.js` — `runSessionCleanup()` function that: (1) queries all open sessions, (2) checks 8h hard-expire via `isSessionExpired()`, (3) skips sessions with problem orders (non-finish or unpaid), (4) expires safe sessions. Includes `dryRun` mode for testing.
- **Integration:** Recommended as `useEffect + setInterval(5min)` in StaffOrdersMobile (see file header comment).
- **RELEASE:** `260303-01 sessionCleanupJob RELEASE.js`
- **Status:** FIXED (code ready, pending integration into StaffOrdersMobile page)

## Active Bugs

### BUG-SM-001 (P1 -- deferred) -- Complete absence of i18n
- **Scope:** Entire file (~3040 lines)
- **Impact:** 100+ hardcoded Russian strings: buttons, toasts, status text, help text, errors
- **Recommendation:** Dedicated i18n pass; estimated 100-120 translation keys needed
- **Status:** Deferred — too large for this review cycle

### BUG-SM-007 (P2) -- window.confirm in handleCloseTable
- **Function:** handleCloseTable
- **Impact:** Blocked in iframes, not keyboard accessible
- **Recommendation:** Replace with custom Dialog confirmation

### BUG-SM-008 (P2) -- No error toast in handleAction
- **Function:** handleAction
- **Impact:** Order status update failure gives no user feedback
- **Recommendation:** Add error toast in catch block

### BUG-SM-009 (P2) -- Magic numbers throughout polling/timing logic
- **Impact:** Numbers like 5000, 60000, 300000 scattered without named constants
- **Recommendation:** Extract to named constants

### BUG-SM-010 (P3) -- Version header block is 87 lines long
- **Lines:** 1-87
- **Impact:** Changelog in code header; better suited for CHANGELOG.md
- **Recommendation:** Move to separate file

---

## Sprint D Notes (v3.2.0, 2026-03-02)

**Changes implemented:**
- V2-09: BannerNotification — in-app banner overlay for new order events
- Fixed position at top of viewport, z-60 (above header z-20, detail z-30, modals z-40)
- Content: "Стол N: Новый заказ" with table name + event type
- Auto-hide after 5 seconds, swipe-up to dismiss early
- Tap banner → scroll to relevant table card with brief highlight (indigo ring, 1.5s)
- De-duplication: multiple events in same poll cycle → "3 новых заказа"
- Works on all screens (Mine, Free, Others, Detail view — closes detail on navigate)
- Non-blocking: pointer-events only on banner itself

**Review findings fixed:**
- P0: Nested setTimeout cleanup in BannerNotification — tracked via separate refs
- P1: CSS.escape() for querySelector to prevent selector injection
- P1: Proper timer cleanup in all dismiss/tap paths

**Known limitations:**
- i18n still fully deferred (BUG-SM-001)

---

## Sprint C Notes (v3.2.0, 2026-03-02)

**Changes implemented:**
- V2-04: Mine tab static urgency sort with position stability during transitions
- V2-07: Preparing→Ready transition animation:
  - Left border animates gray→amber (300ms ease via CSS transition-colors)
  - CTA button fades in with max-h/opacity wrapper transition (300ms)
  - Card position locked during transition (stays at PREPARING sort position for 600ms)
  - Brief amber ring flash (200ms) for peripheral attention
- CSS transition-colors on all card elements (borders, badges, text) for smooth status changes
- Timer cleanup on unmount for position lock timeouts

**Known limitations:**
- Side effects inside useMemo (setTimeout for position locks) — pragmatic trade-off for synchronous detection
- i18n still fully deferred (BUG-SM-001)

---

## Sprint B Notes (v3.1.0, 2026-03-02)

**Changes implemented:**
- V2-02: TableDetailScreen — full-screen detail view, slide-in from right (300ms ease-out)
- V2-03: Split-tap — CTA executes action inline; card body opens TableDetailScreen
- DetailOrderRow — auto-fetches items in detail view (no lazy loading guard)
- GuestOrderSection — per-guest sections with 48px full-width action buttons
- Scroll position preserved via `listScrollRef` + `requestAnimationFrame`
- Swipe-right back gesture on TableDetailScreen (dx>80, dy<60)
- liveDetailGroup: detail view auto-updates via polling using `detailGroupId`

**Known limitations:**
- i18n still fully deferred (BUG-SM-001)
- Preparing-to-Ready animation → implemented in Sprint C (v3.2.0)
- Static urgency sort with position stability → implemented in Sprint C (v3.2.0)

---

## Sprint A Notes (v3.0.0, 2026-03-02)

**Changes implemented:**
- V2-01: Compact card (table name + zone, status badge, guest/order count, elapsed time, 1 CTA)
- V2-05: Color-coded left borders via `TABLE_STATUS_STYLES` mapping (Tailwind classes, no inline styles)
- V2-06: Muted Preparing cards (gray bg, 2px border, no CTA button)
- V2-08: Guest-labeled CTA button ("Принять (Гость 1)")
- V2-10: 52px min-height primary CTA, full-width
- Sort: BILL_REQUESTED > NEW > READY > ALL_SERVED > PREPARING (oldest first)
