---
version: "1.0"
status: FINAL
session: 271
date: 2026-04-14
supersedes:
  - CV-BUG-01_Persist_Strategy_S271.md (DRAFT)
  - CV-BUG-01_Codex_Review_S271.md (review)
---

# CV-BUG-01 --- Persist Strategy Final Spec

## Chosen approach

**Variant B --- Lightweight Snapshot.** Store `{ tableId, tableSessionId, sessionGuestId, lastSeenTs, orderIds[], schemaVersion }` in localStorage. This adds ~200-400 bytes per partner+table pair. It avoids the stale-data and reconcile-complexity risks of a full cart snapshot (Variant C), while improving on the current minimal persistence (Variant A) by persisting `sessionGuestId` (cuts the 7-step A-G guest fallback to a single `find()`) and `orderIds[]` (enables kill-during-submit detection and immediate order-count display).

## localStorage schema

**Key format:**

```javascript
const PERSIST_KEY = (partnerId, tableId) => `menuapp_session_${partnerId}_${tableId}`;
const PERSIST_SCHEMA_VERSION = 1;
```

**Persisted shape:**

```json
{
  "v": 1,
  "tableSessionId": "abc123",
  "sessionGuestId": "def456",
  "orderIds": ["ord1", "ord2"],
  "lastSeenTs": 1712345678000,
  "pendingSubmit": null
}
```

- `v` --- schema version for migration. If `persist.v !== PERSIST_SCHEMA_VERSION`, clear persist and start fresh.
- `tableSessionId` --- skip session lookup on restore.
- `sessionGuestId` --- skip guest identification fallbacks.
- `orderIds` --- known orders for this guest. Used for kill-during-submit detection (Q4) and immediate "Your orders: N" display.
- `lastSeenTs` --- for 12h client-side TTL check.
- `pendingSubmit` --- kill-during-submit detection (see section below). `null` when no submit is in flight.

**Budget:** ~200-400 bytes per partner+table pair. Well within mobile localStorage limits.

## Restore flow (4-state machine)

### State machine

```
                   mount + persist exists
                          |
                          v
                    +-----------+
                    | S-loading |  (skeleton UI, "Loading...")
                    +-----------+
                     /    |     \
                    /     |      \
          success  /   timeout    \ empty result
                  /   (8s UX)      \
                 v        |         v
          +-----------+   |    +---------+
          | S-restored|   |    | S-lost  |
          +-----------+   v    +---------+
                    +-----------------+
                    | S-failed-network|
                    +-----------------+
```

### Fetch strategy with timeout rules

**CHANGED per Codex V1:** The 8s UX deadline applies ONLY to session validation + guests fetch + order headers fetch. `OrderItem` loading is lazy-loaded AFTER `S-restored` is reached, not inside the restore gate.

Rationale: `OrderItem` loading can degrade into batched `Promise.allSettled(...)` calls (`useTableSession.jsx:456-468`) and is the slowest, least reliable step. Including it in the 8s gate would misclassify slow-but-healthy restores as `S-failed-network` on slower mobile networks.

**Alternative documented (not chosen):** If items must stay inside the restore gate, increase technical timeout to 10-12s. This is NOT the chosen default because 8+ seconds of blank skeleton already feels close to "broken" on mobile.

### Restore pseudocode

```javascript
async function restoreFromPersist(persist) {
  const controller = new AbortController();
  const globalTimeout = setTimeout(() => controller.abort(), 8000); // 8s UX deadline

  try {
    // PHASE 1: Validate session (single request)
    const sessions = await TableSession.filter({ id: persist.tableSessionId });
    const session = sessions?.[0];

    if (!session || session.status !== 'open' || isSessionExpired(session)) {
      clearPersist();
      return { state: 'S-lost' };
    }

    // PHASE 2: Parallel fetch guests + order headers (NO items here)
    const [guests, orders] = await Promise.all([
      getSessionGuests(session.id),
      getSessionOrders(session.id),
    ]);

    // PHASE 3: Identify current guest (fast path with persisted ID)
    const guest = guests.find(g => normalize(g) === persist.sessionGuestId)
      || fallbackGuestRestore(guests); // existing A-G logic as fallback

    return { state: 'S-restored', session, guest, orders };
    // OrderItems loaded lazily after S-restored transition

  } catch (err) {
    if (err.name === 'AbortError' || isNetworkError(err)) {
      return { state: 'S-failed-network' };
    }
    clearPersist();
    return { state: 'S-lost' };
  } finally {
    clearTimeout(globalTimeout);
  }
}
```

### Transition rules

| From | Trigger | To | UX Action |
|------|---------|-----|-----------|
| `S-loading` | Session + guests + orders fetched | `S-restored` | Render cart/orders, start polling, lazy-load items |
| `S-loading` | 8s UX timeout | `S-failed-network` | Show retry banner |
| `S-loading` | Session query returns empty `[]` | `S-lost` | Show "Session ended", clear persist |
| `S-loading` | `session.status !== 'open'` or expired | `S-lost` | Close expired in DB, clear persist, show message |
| `S-failed-network` | User taps "Retry" | `S-loading` | Retry full flow |
| `S-failed-network` | Network restored (`online` event) | `S-loading` | Auto-retry once |

### No debounce/retry before S-failed-network

Single attempt on mount. If it fails, show the banner immediately. Retrying silently wastes time on mobile (user already sees skeleton for up to 8s). User-initiated retry or `online` event triggers retry. Exception: if Phase 1 succeeds but Phase 2 fails, one Phase-2 retry is acceptable (session is valid, network may be flaky).

## Invalidation rules

| Trigger | Action | Rationale |
|---------|--------|-----------|
| Session query returns empty `[]` | Clear persist, `S-lost` | Session deleted or never existed |
| `session.status !== 'open'` | Clear persist, close expired in DB if needed, `S-lost` | Official end of session |
| `isSessionExpired(session)` returns true | Close in DB, clear persist, `S-lost` | 8h TTL exceeded |
| `lastSeenTs` older than **12 hours** | Clear persist on mount (before any fetch) | Stale even if session somehow alive |
| `persist.v !== PERSIST_SCHEMA_VERSION` | Clear persist, start fresh | Schema migration --- safe reset |
| User taps "Leave table" / explicit leave | Clear persist + all related keys | Intentional exit |
| `tableCodeParam` changes (different table) | Clear persist for OLD table, start fresh for new | PM-152 pattern --- prevent cross-table leakage |
| `partnerId` changes | Clear all persist for old partner | Different restaurant |

### Session "not found" handling

**CHANGED per Codex Additional #2.** Base44 uses `.filter()` returning arrays. An empty result `[]` means "session gone" --- clear persist and transition to `S-lost`. The spec does NOT use 404/410 HTTP wording, as that is inaccurate for B44's entity query API. All "not found" checks are expressed as empty-array checks.

### 12h client-side TTL rationale

- **2h too aggressive:** Guest leaves, phone dies, comes back in 2.5h --- session lost unnecessarily. Real restaurant visits can last 3-4h.
- **24h too permissive:** Guest visits at lunch, comes back next day --- gets yesterday's stale session.
- **12h covers:** Long dinner (4-5h) + buffer, but expires before next-day visit. Session's own 8h TTL (`useTableSession.jsx:10-15`) is the hard limit --- 12h persist TTL is a "don't even try to fetch" optimization.

### Shared phone edge case

Guest A leaves, Guest B sits at same table on shared/restaurant tablet. No automatic solution is possible without login. Practical mitigation: "New guest" button in CartView header that clears `sessionGuestId` from persist (keeps `tableSessionId`), creates new `SessionGuest` entity, gives fresh cart state. This is P3, documented in Open Items.

### Schema version migration

If `persist.v !== PERSIST_SCHEMA_VERSION`, clear persist and start fresh. No complex migration --- the data is only hints, and a full server fetch is always the fallback.

### Table/partner change

Follows PM-152 pattern: if `tableCodeParam` changes, clear persist for the old table. If `partnerId` changes, clear all persist for old partner.

## Kill-during-submit (pendingSubmit)

### Detection logic

```javascript
// Before submit:
updatePersist({
  pendingSubmit: {
    ts: Date.now(),
    cartSnapshot: { itemCount: 3, totalAmount: 4500 },
    sessionGuestId: currentGuestId  // scope to this guest
  }
});

// After successful submit:
updatePersist({ pendingSubmit: null, orderIds: [...prev.orderIds, newOrderId] });

// After failed submit (caught error):
updatePersist({ pendingSubmit: null });
```

### On restore: check pendingSubmit

**CHANGED per Codex V2:** `pendingSubmit` matcher is scoped to **current guest's orders only**, NOT all session orders. In a multi-guest-per-table app, matching against all session orders would produce false negatives (another guest's order suppressing the warning banner for the current guest).

**CHANGED per Codex V2:** Clock skew tolerance widened from 5s to **30-60s**. The `pendingSubmit.ts` is client-authored via `Date.now()`, while `created_at` is server-authored. Mobile devices can drift or resume from sleep with clock jitter larger than 5s. A 30-60s window is more robust for this client-vs-server timestamp heuristic.

```javascript
function checkKillDuringSubmit(persist, serverOrders) {
  if (!persist.pendingSubmit) return null;

  const { ts, cartSnapshot, sessionGuestId } = persist.pendingSubmit;

  // Discard stale pendingSubmit (>5 min)
  if (Date.now() - ts > 5 * 60 * 1000) return null;

  // Filter to current guest's orders only
  const guestOrders = serverOrders.filter(o => o.session_guest === sessionGuestId);

  // Check if any guest order was created AFTER the pendingSubmit timestamp
  const ordersAfterSubmit = guestOrders.filter(o => {
    const orderTs = new Date(o.created_at || o.createdDate).getTime();
    return orderTs >= ts - 45000; // 45s tolerance for clock skew
  });

  if (ordersAfterSubmit.length > 0) {
    return { status: 'likely-sent', orders: ordersAfterSubmit };
  }

  return { status: 'maybe-lost', cartSnapshot };
}
```

### State transitions

| Detection Result | Banner | Action |
|------------------|--------|--------|
| `likely-sent` | None (or brief "Order sent" confirmation) | Clear `pendingSubmit`, continue |
| `maybe-lost` | "Your last order may not have been sent. Check your orders before retrying." | Show "Check" button -> expand orders section |
| `pendingSubmit` older than 5 min | None | Clear `pendingSubmit`, ignore (stale) |

**DOCUMENTED per Codex V2:** `pendingSubmit` is a **recovery heuristic, NOT idempotency**. No B44-side dedupe exists in the reviewed code. Banner copy MUST advise "check your orders before retrying". Duplicate risk is accepted for the heuristic version. If the team wants strong duplicate prevention, a client-generated submit token stored on the created order is the real fix (requires B44 schema change).

### Fingerprint addition (optional, recommended per Codex)

Sorted item-ids + quantities hash in `pendingSubmit` for improved matching confidence. Example: `fingerprint: "item1:2,item3:1"`. This does not make the flow idempotent but reduces false matches.

### cartSnapshot sufficiency

`{ itemCount, totalAmount }` is sufficient for banner UX copy only (e.g., "Order for 3 items (4,500 T) may not have been sent"). It is NOT sufficient for matching or duplicate prevention --- that is handled by the timestamp + guest-scoped order check.

## Polling vs persist race (V3)

**NEW section from Codex V3.**

### React-state race (already mitigated)

The existing 30s optimistic-merge window in `useTableSession.jsx:580-589` (TTL constant at `:10-15`) prevents the polling loop from immediately wiping in-memory optimistic orders/items. Do NOT re-implement this guard.

### Persist-state race (NEW rule)

**Rule: "Polling must never downgrade persist state while `pendingSubmit` is active."**

- Submit owns the `pendingSubmit` lifecycle: write before network I/O, clear only on success/fail paths.
- Polling may update UI state continuously but MUST NOT rewrite persisted `orderIds` or `pendingSubmit`.
- Implementation hint: `isSubmittingRef` gate in `useTableSession` before any persist write from the poll path.

In other words: polling may update React state, but persisted submit-recovery state is written exclusively by the submit transaction, not by whichever async path finishes last.

## What already exists (do NOT re-implement)

**NEW section from Codex Additional #3.** These capabilities are already present in the codebase and must not be duplicated:

| Capability | Location | Notes |
|-----------|----------|-------|
| 8h session TTL constants | `useTableSession.jsx:10-15, 29-64` | Hard limit on session lifetime |
| Guest persistence with legacy fallback keys | `useTableSession.jsx:69-145` | Reads `menuApp_hall_session_*`, `menuApp_hall_guest_*` |
| A-G guest restore fallback chain | `useTableSession.jsx:346-429` | 7-strategy guest identification |
| Polling only after session + dynamic backoff | `useTableSession.jsx:490-685` | 10s normal, 15s on error, 30s on rate limit |
| Session creation uses `status: "open"` | `components/sessionHelpers.js:62-79` | Fixed in S70 (was "active") |
| Optimistic merge for orders/items (30s TTL) | `useTableSession.jsx:580-589, 625-649` | Prevents poll from wiping in-flight state |
| OrderItem fallback batching | `useTableSession.jsx:447-468` | `$in` query with `Promise.allSettled` fallback |

## Ownership

**NEW section from Codex Additional #4.**

Persist lifecycle lives in `useTableSession` + submit flow, NOT in `CartView.jsx`. CartView currently only touches localStorage for guest-code display helpers (`CartView.jsx:337-355`) --- keep it that way. The new unified persist key, restore state machine, and `pendingSubmit` logic all belong in `useTableSession` and/or the submit handler, not spread across UI components.

## Acceptance Criteria (revised)

### Must Have (Definition of Done)

- **AC-1** --- Unified persist key `menuapp_session_${partnerId}_${tableId}` with schema version field.
  - AC-1 :white_check_mark: unchanged

- **AC-2** --- Persist stores `{ v, tableSessionId, sessionGuestId, orderIds, lastSeenTs, pendingSubmit }`.
  - AC-2 :white_check_mark: unchanged

- **AC-3** --- On mount with valid persist: show skeleton (S-loading), then transition to S-restored/S-failed-network/S-lost within 8s.
  - AC-3 :arrows_counterclockwise: REVISED per Codex V1: The 8s deadline covers session + guests + order headers only. OrderItem loading happens after S-restored, not inside the 8s gate.

- **AC-4** --- 4-state restore renders correctly: S-loading (skeleton), S-restored (full cart/orders), S-failed-network (retry banner), S-lost (session ended message).
  - AC-4 :white_check_mark: unchanged

- **AC-5** --- Kill-during-submit: `pendingSubmit` flag set before fetch, cleared after success/failure. On restore, banner shown if `pendingSubmit` exists and no matching server order found.
  - AC-5 :arrows_counterclockwise: REVISED per Codex V2: Matcher must be scoped to current guest's orders only (using persisted `sessionGuestId`). Clock skew tolerance widened to 30-60s. Banner copy must include "check your orders before retrying".

- **AC-6** --- Invalidation: persist cleared on empty session result, expired session, 12h TTL, schema mismatch, table change.
  - AC-6 :arrows_counterclockwise: REVISED per Codex Additional #2: Wording changed from "404/410" to "empty result `[]`" to match B44's `.filter()` array return semantics.

- **AC-7** --- Backward compatibility: old `menuApp_hall_session_*` and `menuApp_hall_guest_*` keys still read as fallback during transition period.
  - AC-7 :white_check_mark: unchanged

- **AC-8** --- Polling starts only after S-restored. Polling failure does not regress to S-failed-network. Polling must not rewrite persist state while `pendingSubmit` is active.
  - AC-8 :arrows_counterclockwise: REVISED per Codex V3: Added persist-race rule --- polling may update UI state but must NOT overwrite persisted `orderIds` or `pendingSubmit` during an active submit.

- **AC-9** --- All user-facing strings use `t()` / `tr()` keys.
  - AC-9 :white_check_mark: unchanged

- **AC-10** --- No new B44 entities or schema changes.
  - AC-10 :warning: CAVEAT per Codex V2: Only valid if heuristic `pendingSubmit` dedup is accepted. True idempotency (server-side submit token stored on Order entity) would require a B44 schema change. The team accepts heuristic dedup for CV-B3; server-side dedupe is deferred.

### Should Have (P1, can be in CV-B3.1)

- **AC-11** --- `online` event listener triggers auto-retry from S-failed-network.
  - AC-11 :white_check_mark: unchanged

- **AC-12** --- Consecutive polling failure counter with escalating UI (toast -> banner).
  - AC-12 :white_check_mark: unchanged

- **AC-13** --- Migration: on first load with new schema, read old keys, write unified key, clean up old keys.
  - AC-13 :white_check_mark: unchanged

### Nice to Have (P2, backlog)

- **AC-14** --- "New guest" button for shared-device edge case.
  - AC-14 :white_check_mark: unchanged

- **AC-15** --- Event priority queue for overlapping notifications.
  - AC-15 :white_check_mark: unchanged

## Explicitly corrected errors from CC draft

- :x: **"active vs open unfixed"** --- The CC draft stated this was still unfixed from S70. In fact, it IS fixed: `components/sessionHelpers.js:62-79` already creates sessions with `status: "open"` (header comment confirms S70 fix). Removed from Open Items. Legacy DB rows with `active` may still exist but are a data-cleanup concern, not a code bug.

- :x: **"404/410 semantics"** --- The CC draft used HTTP 404/410 wording for "session not found". B44 uses `.filter()` returning arrays, not HTTP error codes. All "not found" checks are rephrased as "empty result `[]`" throughout this spec.

## Open Items (trimmed)

1. **OrderItems lazy-load specifics** --- What triggers the item fetch after S-restored? Options: expand gesture on a specific order, on-scroll into view, immediate background fetch after render. Defer to CV-B3 implementation.

2. **Migration path: old keys to unified key** --- One-shot migration on first load with new schema: read old `menuApp_hall_session_*` and `menuApp_hall_guest_*` keys, write unified key, schedule old key cleanup. Implementation details deferred to CV-B3.

3. **"New guest" button for shared device (P3)** --- Clears `sessionGuestId` from persist, keeps `tableSessionId`, creates new `SessionGuest`. Low priority, not a persist-strategy blocker.

---

*Synthesized by: Claude Code (CC), Session S271, 2026-04-14*
*Source: CC strategy (DRAFT) + Codex review (APPROVE WITH CHANGES)*
*Status: FINAL --- ready for CV-B3 implementation*
