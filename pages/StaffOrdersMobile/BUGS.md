# StaffOrdersMobile Bug Tracker

**Page:** `pages/StaffOrdersMobile/260302-03 StaffOrdersMobile RELEASE.jsx`
**Last updated:** 2026-03-02 (Sprint D v3.2.0)

---

## Fixed Bugs

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
- Preparing-to-Ready animation (Sprint C scope)

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

**Known limitations (Sprint C scope):**
- No Preparing-to-Ready animation (Sprint C)
- No static urgency sort on Mine tab with animation (Sprint C)
- i18n still fully deferred (BUG-SM-001)

---

## Sprint A Notes (v3.0.0, 2026-03-02)

**Changes implemented:**
- V2-01: Compact card (table name + zone, status badge, guest/order count, elapsed time, 1 CTA)
- V2-05: Color-coded left borders via `TABLE_STATUS_STYLES` mapping (Tailwind classes, no inline styles)
- V2-06: Muted Preparing cards (gray bg, 2px border, no CTA button)
- V2-08: Guest-labeled CTA button ("Принять (Гость 1)")
- V2-10: 52px min-height primary CTA, full-width
- Sort: BILL_REQUESTED > NEW > READY > ALL_SERVED > PREPARING (oldest first)
