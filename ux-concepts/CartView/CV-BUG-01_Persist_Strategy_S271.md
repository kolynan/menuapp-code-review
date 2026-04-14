# CV-BUG-01: Persist Strategy for CartView Session Restore

**Session:** S271
**Discussed by:** Claude Code (CC) analysis
**Date:** 2026-04-14
**Status:** DRAFT — awaiting Codex review + Arman approval

---

## Q1: What to Store in localStorage

### Chosen: Option B — Lightweight Snapshot

**Decision:** Store `{ tableId, tableSessionId, sessionGuestId, lastSeenTs, orderIds[], schemaVersion }`.

**Rationale:**

| Criterion | A (Minimal) | B (Lightweight) | C (Full Snapshot) |
|-----------|-------------|-----------------|-------------------|
| localStorage size | ~60 bytes | ~200-400 bytes | 5-50 KB |
| Round-trips on restore | 4 (session + guests + orders + items) | 3 (guests + orders + items, session ID known) | 0 initial, then 4 for reconcile |
| Stale data risk | None — always fresh | Low — IDs rarely stale | High — prices, statuses, items all stale |
| Reconcile complexity | None | None — IDs are just hints | High — diff/merge needed |
| UX on restore | Skeleton 1-3s | Skeleton 1-2s (skip session lookup) | Instant render, then flash on reconcile |

**Why not A:** Current `useTableSession` already stores `tableSessionId` per table — that's effectively option A today. The problem is: after Chrome kill, we fetch session (1 round-trip), then guests (1 RT), then we go through 7 fallback strategies to find the guest (A-G in `useTableSession.jsx:359-435`). Adding `sessionGuestId` to persist cuts guest identification from 7 fallbacks + potential DB calls to a single array `find()`.

**Why not C:** On mobile Safari/Chrome, localStorage quota is 5-10 MB shared across all origins. A full snapshot with order items could be 10-50 KB per session. But the bigger issue is **reconcile complexity**: prices change, items get removed, order statuses update — we'd need a full diff engine. The UX gain (instant render vs 1-2s skeleton) doesn't justify the complexity and stale-data risk. Plus, showing stale prices/statuses before server data arrives is **worse UX** than an honest skeleton.

**Adding `orderIds[]`:** This is the key improvement over current state. By persisting known order IDs, we can:
1. Detect "kill during submit" (Q4) — compare persisted IDs with server IDs.
2. Show "Ваши заказы: N" count immediately while loading details.
3. Skip the full session-orders-to-guest matching on restore.

### localStorage Key and Schema

```javascript
const PERSIST_KEY = (partnerId, tableId) => `menuapp_session_${partnerId}_${tableId}`;
const PERSIST_SCHEMA_VERSION = 1;

// Persisted shape:
{
  v: 1,                          // schema version for migration
  tableSessionId: "abc123",      // skip session lookup on restore
  sessionGuestId: "def456",      // skip guest identification fallbacks
  orderIds: ["ord1", "ord2"],    // known orders for this guest
  lastSeenTs: 1712345678000,     // for TTL + staleness check
  pendingSubmit: null             // Q4: kill-during-submit detection (see below)
}
```

**Budget:** ~200-400 bytes per partner+table pair. Well within mobile limits.

**Migration from current:** Current keys (`menuApp_hall_session_*`, `menuApp_hall_guest_*`) remain readable during transition. New persist writes to unified key. Old keys are read-once as fallback, then cleaned up.

---

## Q2: Restore Flow Sequence (CV-74: S-loading -> S-restored)

### State Machine

```
                   mount + persist exists
                          |
                          v
                    +-----------+
                    | S-loading |  (skeleton UI, "Загрузка...")
                    +-----------+
                     /    |     \
                    /     |      \
          success  /   timeout    \ 404/410
                  /   (8s global)  \
                 v        |         v
          +-----------+   |    +---------+
          | S-restored|   |    | S-lost  |
          +-----------+   v    +---------+
                    +-----------------+
                    | S-failed-network|
                    +-----------------+
```

### Fetch Strategy: Parallel with Global Timeout

```javascript
async function restoreFromPersist(persist) {
  const controller = new AbortController();
  const globalTimeout = setTimeout(() => controller.abort(), 8000); // 8s global

  try {
    // PHASE 1: Validate session (single request)
    const session = await fetchSession(persist.tableSessionId);

    if (!session || session.status !== 'open' || isSessionExpired(session)) {
      clearPersist();
      return { state: 'S-lost' }; // session gone or closed
    }

    // PHASE 2: Parallel fetch guests + orders + items
    const [guests, orders, items] = await Promise.all([
      getSessionGuests(session.id),
      getSessionOrders(session.id),
      getSessionItems(session.id),  // or lazy-load after
    ]);

    // PHASE 3: Identify current guest (fast path with persisted ID)
    const guest = guests.find(g => normalize(g) === persist.sessionGuestId)
      || fallbackGuestRestore(guests); // existing A-G logic as fallback

    return { state: 'S-restored', session, guest, orders, items };

  } catch (err) {
    if (err.name === 'AbortError' || isNetworkError(err)) {
      return { state: 'S-failed-network' };
    }
    if (is404or410(err)) {
      clearPersist();
      return { state: 'S-lost' };
    }
    return { state: 'S-failed-network' }; // default to retryable
  } finally {
    clearTimeout(globalTimeout);
  }
}
```

### Transition Rules

| From | Trigger | To | UX Action |
|------|---------|-----|-----------|
| `S-loading` | Session fetched + data loaded | `S-restored` | Render cart/orders, start polling |
| `S-loading` | 8s global timeout | `S-failed-network` | Show retry banner |
| `S-loading` | 404/410 on session | `S-lost` | Show "Сессия завершена", clear persist |
| `S-loading` | Session expired (isSessionExpired) | `S-lost` | Close expired in DB, clear persist, show message |
| `S-failed-network` | User taps "Повторить" | `S-loading` | Retry full flow |
| `S-failed-network` | Network restored (online event) | `S-loading` | Auto-retry once |

### Why 8s Global Timeout (not per-request)

- On slow 3G mobile, individual requests can take 2-4s each.
- Per-request timeouts (e.g., 3s each) would give 12s total for 4 sequential requests — too long.
- With parallel Phase 2, the realistic path is: 2s session + max(2s guests, 2s orders, 2s items) = ~4s.
- 8s gives 2x buffer for slow networks without keeping the user waiting too long.

### No Debounce/Retry Before S-failed-network

- Single attempt on mount. If it fails, show the banner immediately.
- Retrying silently wastes time on mobile (user already sees skeleton for 8s).
- User-initiated retry ("Повторить") or `online` event trigger retry.
- Exception: if Phase 1 succeeds but Phase 2 fails, we can retry Phase 2 once (session is valid, network may be flaky).

---

## Q3: Invalidation — When Persist Becomes Stale

### Invalidation Rules Table

| Trigger | Action | Rationale |
|---------|--------|-----------|
| Server returns 404/410 on `TableSession.filter({id})` | Clear persist, transition to `S-lost` | Session deleted or never existed |
| `session.status !== 'open'` (closed/expired) | Clear persist, close expired in DB if needed, `S-lost` | Official end of session |
| `isSessionExpired(session)` returns true | Close in DB, clear persist, `S-lost` | 8h TTL exceeded |
| `lastSeenTs` older than **12 hours** | Clear persist on mount (before any fetch) | Stale even if session somehow alive |
| `persist.v !== PERSIST_SCHEMA_VERSION` | Clear persist, start fresh | Schema migration — safe reset |
| User taps "Покинуть стол" / explicit leave | Clear persist + all related keys | Intentional exit |
| `tableCodeParam` changes (different table scanned) | Clear persist for OLD table, start fresh for new | PM-152 pattern — prevent cross-table leakage |
| `partnerId` changes | Clear all persist for old partner | Different restaurant |

### Why 12 Hours (not 2h or 24h)

- **2h too aggressive:** Guest leaves for bathroom, phone dies, comes back in 2.5h — session lost unnecessarily. Real restaurant visits can last 3-4h.
- **24h too permissive:** Guest visits restaurant at lunch, comes back next day — gets yesterday's stale session. Confusing UX.
- **12h covers:** Long dinner (4-5h) + buffer, but expires before next-day visit. Session's own 8h TTL is the hard limit anyway — 12h persist TTL is a "don't even try to fetch" optimization.
- The server-side `isSessionExpired()` (8h from last order) is the authoritative check. The 12h client-side TTL just avoids a wasted network round-trip for obviously-stale persists.

### Edge Case: Shared Phone (Two Guests, One Device)

**Scenario:** Guest A scans QR at table 5, orders. Guest A leaves. Guest B sits at table 5, scans same QR on shared/restaurant tablet.

**Current behavior:** Guest B gets Guest A's session (same table + device). Cart shows Guest A's orders. Bad UX.

**Solution (already partially implemented in PM-152):**
1. `menuapp_last_table` key tracks table changes — if table code changes, clear guest name.
2. For shared-phone within same table: **no automatic solution possible** without login. The session is per-table, not per-person.
3. Practical mitigation: "Новый гость" button in CartView header that:
   - Clears `sessionGuestId` from persist (keeps `tableSessionId`)
   - Creates new `SessionGuest` entity
   - Fresh cart state
4. This is a P3 enhancement, not a persist-strategy blocker. Document in open items.

---

## Q4: Kill-During-Submit Detection (CV-75)

### Detection Logic: `pendingSubmit` Flag

```javascript
// Before submit:
updatePersist({ pendingSubmit: { ts: Date.now(), cartSnapshot: cartSummary } });

// After successful submit:
updatePersist({ pendingSubmit: null, orderIds: [...prev.orderIds, newOrderId] });

// After failed submit (caught error):
updatePersist({ pendingSubmit: null });
// Show error toast normally
```

### On Restore: Check `pendingSubmit`

```javascript
function checkKillDuringSubmit(persist, serverOrders) {
  if (!persist.pendingSubmit) return null; // no pending submit

  const { ts, cartSnapshot } = persist.pendingSubmit;

  // If pending submit is older than 5 minutes, discard (stale)
  if (Date.now() - ts > 5 * 60 * 1000) {
    return null;
  }

  // Check if any server order was created AFTER the pendingSubmit timestamp
  const ordersAfterSubmit = serverOrders.filter(o => {
    const orderTs = new Date(o.created_at || o.createdDate).getTime();
    return orderTs >= ts - 5000; // 5s tolerance for clock skew
  });

  if (ordersAfterSubmit.length > 0) {
    // Order likely went through — no banner needed
    return { status: 'likely-sent', orders: ordersAfterSubmit };
  }

  // No matching order found — show banner
  return { status: 'maybe-lost', cartSnapshot };
}
```

### UX for Each Case

| Detection Result | Banner | Action |
|------------------|--------|--------|
| `likely-sent` | None (or brief "Заказ отправлен" confirmation) | Clear `pendingSubmit`, continue |
| `maybe-lost` | "Возможно, последний заказ не отправлен. Проверьте ваши заказы." | Show "Проверить" button -> expand orders section |
| `pendingSubmit` older than 5 min | None | Clear `pendingSubmit`, ignore |

### False Positive Handling

**Scenario:** Order actually went through, but the server response didn't arrive before kill. On restore, server orders include the new order.

**Detection:** `ordersAfterSubmit.length > 0` catches this case. The timestamp comparison (order.created_at >= pendingSubmit.ts) identifies orders that were likely from the killed submit.

**If false positive occurs (banner shown but order exists):** User taps "Проверить", sees their order in the orders list. Banner auto-dismisses after 30s or on any user interaction with orders section. No harm done — it's an informational banner, not a blocking modal.

### What's in `cartSnapshot`?

Minimal: `{ itemCount: 3, totalAmount: 4500 }`. Not full cart items (those are already cleared after submit attempt). Just enough to show in the banner: "Заказ на 3 блюда (4 500 T) мог не отправиться."

---

## Q5: Interaction with Polling (CV-80) and Event Priority (CV-77)

### Polling Start Timing

```
S-loading  --> no polling (still restoring)
S-restored --> START polling (10s interval, existing logic)
S-failed-network --> no polling (can't reach server)
S-lost --> no polling (session gone)
```

**Decision:** Polling starts ONLY after `S-restored`. Rationale:
- Starting polling during `S-loading` would conflict with the restore fetch (duplicate requests).
- Starting during `S-failed-network` wastes battery on a known-broken connection.
- The existing `useTableSession` polling effect already gates on `tableSession?.id`, which is only set after successful restore.

### Polling Failure After S-restored

**Decision:** Stay in `S-restored` with stale data + error toast. Do NOT transition back to `S-failed-network`.

**Rationale:**
- The user already has valid data from the restore. Hiding it and showing an error skeleton is worse UX than showing stale data with a toast.
- Polling errors are often transient (1-2 missed polls on flaky mobile network).
- Current `useTableSession` already handles this: `sessionOrdersErrRef` tracks errors, dynamic interval backs off (10s -> 15s -> 30s on rate limit).

**Degradation path:**
1. 1 poll failure: silent (try again in 15s)
2. 3 consecutive failures: show toast "Проблема с соединением. Данные могут быть устаревшими."
3. 10 consecutive failures: show persistent banner (not toast) with "Повторить" button
4. `online` event: reset error counter, immediate poll

### Event Priority Integration (CV-77)

Events during/after restore, ranked by priority:

| Priority | Event | Display | Duration |
|----------|-------|---------|----------|
| 1 (highest) | Kill-during-submit banner (CV-75) | Sticky banner top of CartView | Until dismissed or confirmed |
| 2 | Session lost / expired | Full-screen state (S-lost) | Permanent until new scan |
| 3 | Network failure on restore | Full-screen state (S-failed-network) | Until retry succeeds |
| 4 | Order status change (new -> accepted) | Push toast (if supported) or in-drawer badge update | Auto-dismiss 5s |
| 5 | Polling failure (post-restore) | Toast | Auto-dismiss 3s |
| 6 | Restore success | No special event (just render) | — |

**Priority rule:** Higher-priority events suppress lower ones. E.g., if kill-during-submit banner is showing, don't also show polling failure toast — the user already knows something is wrong.

**Implementation:** Simple priority number on each event. Before showing a new event, check if a higher-priority event is active. Queue lower-priority events; show them when higher-priority clears.

---

## Sequence Diagram: Full Restore Flow

```
User kills Chrome    Chrome reopens     App mounts
      |                    |                |
      v                    v                v
  [localStorage persisted]           Read persist
                                          |
                                    persist.v === 1?
                                     /          \
                                   yes           no
                                    |             |
                              lastSeenTs       Clear persist,
                              < 12h?          start fresh
                              /      \
                            yes       no
                             |         |
                        S-loading   Clear persist,
                             |      start fresh
                             |
                    Check pendingSubmit
                             |
                    Fetch session by ID -----> 404/410? --> S-lost
                             |
                    session.status === 'open'
                    && !isSessionExpired?
                      /            \
                    yes             no
                     |               |
              Parallel fetch:     Close in DB,
              guests + orders     clear persist
              + items              --> S-lost
                     |
                8s timeout? ---------> S-failed-network
                     |
                Find guest by
                persist.sessionGuestId
                     |
               S-restored
                     |
           Check pendingSubmit
           vs server orders
                 /        \
           match found    no match
                |              |
           Clear flag    Show CV-75 banner
                |              |
           Start polling (10s)
```

---

## Acceptance Criteria for CV-B3 Implementation

### Must Have (Definition of Done)

- [ ] **AC-1:** New unified persist key `menuapp_session_${partnerId}_${tableId}` with schema version field.
- [ ] **AC-2:** Persist stores `{ v, tableSessionId, sessionGuestId, orderIds, lastSeenTs, pendingSubmit }`.
- [ ] **AC-3:** On mount with valid persist: show skeleton (S-loading), then transition to S-restored/S-failed-network/S-lost within 8s.
- [ ] **AC-4:** 4-state restore renders correctly:
  - S-loading: skeleton with "Загрузка..." text
  - S-restored: full cart/orders view
  - S-failed-network: retry banner with "Повторить" button
  - S-lost: "Сессия завершена" message with "Сканировать QR" CTA
- [ ] **AC-5:** Kill-during-submit: `pendingSubmit` flag set before fetch, cleared after success/failure. On restore, banner shown if `pendingSubmit` exists and no matching server order found.
- [ ] **AC-6:** Invalidation: persist cleared on 404/410, expired session, 12h TTL, schema mismatch, table change.
- [ ] **AC-7:** Backward compatibility: old `menuApp_hall_session_*` and `menuApp_hall_guest_*` keys still read as fallback during transition period.
- [ ] **AC-8:** Polling starts only after S-restored. Polling failure does not regress to S-failed-network.
- [ ] **AC-9:** All user-facing strings use `t()` / `tr()` keys.
- [ ] **AC-10:** No new B44 entities or schema changes.

### Should Have (P1, can be in CV-B3.1)

- [ ] **AC-11:** `online` event listener triggers auto-retry from S-failed-network.
- [ ] **AC-12:** Consecutive polling failure counter with escalating UI (toast -> banner).
- [ ] **AC-13:** Migration: on first load with new schema, read old keys, write unified key, clean up old keys.

### Nice to Have (P2, backlog)

- [ ] **AC-14:** "Новый гость" button for shared-device edge case.
- [ ] **AC-15:** Event priority queue for overlapping notifications.

---

## Open Items

1. **Session status mismatch ("active" vs "open")** — still unfixed from S70. Restore flow filters by `status: 'open'`, but `getOrCreateSession()` creates with `status: 'active'`. This causes a missed restore on first F5 after session creation. Persist strategy doesn't fix this — it needs a separate `sessionHelpers.js` fix. **Blocker?** No — persist stores `tableSessionId` directly, bypassing the status filter. But new sessions (no persist yet) still hit the mismatch on first page refresh.

2. **OrderItems lazy loading** — Current restore fetches all OrderItems in Phase 2. For sessions with many orders (10+), this could be slow. Consider lazy-loading items only when user expands a specific order in CartView. Not a persist-strategy decision, but affects restore performance.

3. **Codex review pending** — This strategy needs independent review. Key areas for Codex to validate:
   - Is 8s global timeout appropriate for B44 API latency?
   - Is the `pendingSubmit` detection logic sound (timestamp comparison)?
   - Are there race conditions between persist writes and polling updates?

---

*Authored by: Claude Code (CC), Session S271, 2026-04-14*
*Pending: Codex independent review*
