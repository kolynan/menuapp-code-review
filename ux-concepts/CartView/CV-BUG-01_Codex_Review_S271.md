# CV-BUG-01 Codex Review - CC Persist Strategy

Reviewer: Codex
Date: 2026-04-14
Reviewed doc: `CV-BUG-01_Persist_Strategy_S271.md`
Verdict: APPROVE WITH CHANGES

The overall direction is good: a lightweight persisted snapshot is safer than a full cart snapshot, and persisting `tableSessionId` plus `sessionGuestId` is aligned with the current restore bottlenecks in `pages/PublicMenu/useTableSession.jsx`.

The strategy still needs changes before implementation starts. The three biggest issues are:

1. The proposed 8s global timeout is too aggressive if `OrderItem` loading stays in the critical path.
2. The `pendingSubmit` heuristic is directionally correct, but the timestamp-only matcher is too weak as written and appears to be scoped to all session orders instead of the current guest's orders.
3. Polling already has an optimistic-state merge guard, but the document does not define how persisted state avoids being reconciled from stale poll results during a submit.

## V1: 8s Global Timeout

### Finding

I do **not** recommend the current "single 8s global timeout for Phase 1 + Phase 2" exactly as written.

My recommendation is:

- Keep an approximately 8s **UX deadline** only for "session + guest + order header" restore.
- Do **not** include `OrderItem` loading inside that same hard cutoff.
- If `OrderItem` loading remains in the critical path, increase the technical timeout to roughly 10-12s, or you will misclassify slow-but-healthy restores as `S-failed-network`.

### Code evidence

- I found **no existing request-level timeout** or abort logic in the inspected files.
  - `pages/PublicMenu/CartView.jsx` only uses `setTimeout` for UI timers and scroll timing at lines 127, 146, 246, 939, 1012, and 1133.
  - `pages/PublicMenu/useTableSession.jsx` only uses `setTimeout` for polling rescheduling at lines 672-685.
  - I found **no `AbortController` usage** in either file.

- The current restore path is already a multi-step async chain:
  - restore saved session id: `pages/PublicMenu/useTableSession.jsx:271-323`
  - fetch guests and run the A-G guest-identification fallback chain: `pages/PublicMenu/useTableSession.jsx:338-429`
  - fetch session orders and then order items: `pages/PublicMenu/useTableSession.jsx:438-472`

- `OrderItem` loading is especially important here:
  - first it tries one `$in` query: `pages/PublicMenu/useTableSession.jsx:447-454`
  - on failure, it falls back to batched `Promise.allSettled(...)` calls: `pages/PublicMenu/useTableSession.jsx:456-468`

- The polling path has the same order-items fallback and already assumes transient failure/rate-limit handling:
  - optimistic merge: `pages/PublicMenu/useTableSession.jsx:580-589`
  - item fallback batching: `pages/PublicMenu/useTableSession.jsx:599-613`
  - dynamic interval backoff: 10s normal, 15s on generic error, 30s on rate limit at `pages/PublicMenu/useTableSession.jsx:663-675`

### Assessment

The problem is not just "is 8s too long for UX?" It is also "what exactly are we timing?"

If the 8s budget covers:

- one session fetch, plus
- guests fetch, plus
- orders fetch, plus
- `OrderItem` fetch that may degrade into batched calls,

then 8s is too brittle for slower mobile networks and for tables with larger order history. The current code itself already contains a fallback path that assumes the `OrderItem` read can be the slowest or least reliable step.

If the 8s budget covers only:

- validating the session,
- loading guests,
- loading order headers,

then 8s is reasonable as a user-facing upper bound before the app stops showing a skeleton and shows a retry affordance.

### Verdict

RECOMMEND DIFFERENT VALUE / BOUNDARY

- Do not keep the current "8s for everything including items" proposal.
- Either:
  - keep 8s, but exclude `OrderItem` loading from the restore gate, or
  - keep items in the gate and raise the timeout to ~10-12s.

I prefer the first option because 8 seconds of blank skeleton already feels close to "broken" on mobile.

## V2: `pendingSubmit` Logic

### Finding

The `pendingSubmit` idea is worth keeping, but the matching rule needs tightening before implementation.

As written, the logic is **not fully sound** because:

- the matcher is timestamp-only,
- the pseudocode appears to check **all session orders**, not just the current guest's orders,
- and the inspected code shows **no idempotency token / dedupe / client transaction id** anywhere in the reviewed files.

That means the banner is fine as a heuristic, but it is **not** a guarantee against duplicates or false classifications.

### Code evidence

- `components/sessionHelpers.js:124-136` defines `getSessionOrders(sessionId)` as:
  - `base44.entities.Order.filter({ table_session: sessionId })`
  - then sort newest first

This returns **all orders for the table session**, not just the current guest's orders.

- `pages/PublicMenu/useTableSession.jsx:438-472` restores and stores the full session order list.
- `pages/PublicMenu/useTableSession.jsx:573-589` polling also works with the full session order list.

- In the allowed review scope, I found **no** occurrences of:
  - `idempotency`
  - `dedupe`
  - `clientTxnId`

I checked:

- `pages/PublicMenu/CartView.jsx`
- `pages/PublicMenu/useTableSession.jsx`
- `components/sessionHelpers.js`

Result: no matches.

### Recommendation

Keep `pendingSubmit`, but change the decision rule:

- Match only against the **current guest's** restored orders, not all session orders.
- Use timestamp as a hint, not the only signal.
- Persist enough local metadata to make the heuristic less fragile.

At minimum, persist:

- `sessionGuestId`
- `pendingSubmit.ts`
- `pendingSubmit.itemCount`
- `pendingSubmit.totalAmount`

Better still, also persist a cheap order fingerprint such as:

- sorted item ids + quantities hash, or
- top 1-2 item ids plus totals

That fingerprint does not make the flow idempotent, but it improves operator confidence and reduces false matches.

### Clock skew assessment

The proposed 5-second skew tolerance is too narrow for a client-vs-server timestamp heuristic.

Why:

- the timestamp is captured on the client with `Date.now()`,
- `created_at` is server-authored,
- and mobile devices can drift or resume from sleep with clock jitter larger than 5 seconds.

A 5-second window may work most of the time, but it is not robust enough to decide whether to suppress a banner.

Recommendation:

- use a larger tolerance, roughly 30-60 seconds, if timestamp remains part of the heuristic;
- or treat timestamps as secondary evidence after filtering to the current guest's orders.

### Race condition walkthrough

This path is correct **if the match is guest-scoped**:

1. Client sets `pendingSubmit`.
2. Submit reaches the server.
3. Server creates the order.
4. Browser/app is killed before client clears `pendingSubmit`.
5. On restore, the app loads orders.
6. If it finds a newly created order for the **same guest**, the flag can safely be cleared and no warning banner is needed.

That part of CC's strategy is sound.

The unsound part is the current matcher shape:

- if another guest at the same table submits an order around the same time,
- and restore checks all session orders,
- that unrelated order can suppress the warning banner for the wrong guest.

Given that this app is specifically multi-guest-per-table, that is not a corner case. It is a realistic false negative.

### Idempotency on B44 side

Based on the inspected files, I do **not** see any existing dedupe mechanism.

Implication:

- if a submit actually succeeded but the response was lost,
- and the user later resubmits,
- duplicate orders are possible unless unseen code outside this review scope adds protection.

So the document should explicitly state:

- `pendingSubmit` is a **recovery heuristic**, not idempotency;
- users should be directed to check their order list before retrying;
- if the team wants strong duplicate prevention, a client-generated submit token stored on the created order is the real fix.

That last option may require backend/schema support, which matters for AC-10.

### `cartSnapshot` sufficiency

For banner copy alone, `{ itemCount, totalAmount }` is sufficient.

It is enough to render text like:

- "Your last order for 3 items may not have been sent."

It is **not** sufficient for any stronger reconciliation or support/debug workflow.

So my recommendation is:

- keep `{ itemCount, totalAmount }` if the snapshot is only UX text,
- do not pretend it is enough for matching or duplicate prevention.

### Verdict

APPROVE WITH CHANGES

Required changes before implementation:

- scope matching to the current guest's orders,
- widen the timestamp tolerance or reduce reliance on it,
- document duplicate risk because there is no visible idempotency layer.

## V3: Persist vs Polling Race

### Finding

This is **not a blocker**, but the document is incomplete here.

The current code does **not** pause polling during submit, yet it already contains an optimistic merge strategy that prevents the polling loop from immediately wiping in-memory optimistic orders/items.

That means the React-state race is partly mitigated today.

The unresolved gap is the **persist race**, not the in-memory state race.

### Code evidence

- Polling starts only once `tableSession?.id` exists:
  - `pages/PublicMenu/useTableSession.jsx:490-499`

- Polling is guarded only by `isLoadingSessionRef.current`, which prevents overlapping polls:
  - `pages/PublicMenu/useTableSession.jsx:500-503`

- I found no `isSubmitting` / `submitInFlight` gate in `useTableSession.jsx`.

- There is already an optimistic merge guard for orders:
  - TTL constant: `pages/PublicMenu/useTableSession.jsx:10-15`
  - merge logic: `pages/PublicMenu/useTableSession.jsx:580-589`

- There is already an optimistic merge guard for items:
  - `pages/PublicMenu/useTableSession.jsx:625-649`

The TTL for those optimistic records is 30 seconds.

### Assessment

Because of that merge strategy, a poll that lands before the server exposes the just-submitted order should not immediately erase optimistic in-memory state.

So CC's concern is real, but the current codebase is already halfway protected.

What the document misses is this distinction:

- React state is already guarded.
- Persisted localStorage state is not yet defined, so it still needs explicit ownership rules.

### Recommendation

The future implementation should make submit own the persist lifecycle.

Specifically:

- write `pendingSubmit` from submit code before network I/O;
- clear `pendingSubmit` and append the confirmed `newOrderId` only from the submit success path;
- do **not** let the polling loop rewrite persisted `orderIds` while `pendingSubmit` is active;
- if polling wants to reconcile persisted data, gate that behind a submit-in-flight ref or transaction marker.

In other words:

- polling may update UI state continuously,
- but persisted submit recovery state should be written by the submit transaction, not by whichever async path finishes last.

### Verdict

NOT A BLOCKER, BUT MUST BE SPECIFIED

I would not reject the strategy over this point, but I would require one extra implementation rule:

- "Polling must never downgrade persist state while `pendingSubmit` exists."

## Additional Findings

### 1. The "active vs open" open item is outdated against current code

The strategy document says the status mismatch is still unfixed and that `getOrCreateSession()` creates `status: 'active'`.

That is **not true in the inspected current code**.

Evidence:

- `components/sessionHelpers.js` header comment says:
  - `S70: changed status "active" -> "open" to match useTableSession.jsx`
- `components/sessionHelpers.js:62-79` creates new sessions with `status: "open"`

There may still be legacy rows in the database with `active`, but the doc's statement about current code behavior is outdated and should be corrected before implementation starts.

### 2. The document assumes 404/410 semantics that the current code does not appear to use

The current code uses Base44 entity `.filter(...)` calls everywhere:

- `TableSession.filter(...)`
- `SessionGuest.filter(...)`
- `Order.filter(...)`
- `OrderItem.filter(...)`

The restore path handles "not found" as an empty result, not as an HTTP-style 404/410 branch.

Example:

- `pages/PublicMenu/useTableSession.jsx:279-301` reads `savedSessions?.[0]`
- `components/sessionHelpers.js:62-69` and `124-129` also assume arrays

So AC-6 should not rely only on "404/410" wording. It should also say:

- if the session query returns no row, clear persist and treat it as lost.

### 3. Some acceptance criteria are already partly satisfied

Already partly present today:

- Existing session persistence with 8h TTL:
  - `pages/PublicMenu/useTableSession.jsx:10-15`
  - `pages/PublicMenu/useTableSession.jsx:29-64`

- Existing guest persistence and legacy fallback keys:
  - `pages/PublicMenu/useTableSession.jsx:69-145`

- Existing A-G guest restore fallback chain:
  - `pages/PublicMenu/useTableSession.jsx:346-429`

- Polling only after session exists, with dynamic error backoff:
  - `pages/PublicMenu/useTableSession.jsx:490-685`

Not present yet in the reviewed code:

- unified key `menuapp_session_${partnerId}_${tableId}`
- schema versioning
- `orderIds[]`
- `pendingSubmit`
- `online` event auto-retry
- explicit restore state machine in UI

### 4. `CartView.jsx` currently is not the persistence owner

Within the allowed review scope, `pages/PublicMenu/CartView.jsx` touches localStorage only for guest-code/display helpers around `pages/PublicMenu/CartView.jsx:337-355`.

It does **not** currently own session restore or order-persist state.

That matters because the new strategy will need a clear home:

- either in `useTableSession`,
- or in the parent submit flow,
- but not split ambiguously between UI-only `CartView` and session orchestration.

### 5. AC-10 is true only for the heuristic version

If the team accepts:

- heuristic submit recovery,
- possible duplicate risk,
- no strong server-side dedupe,

then AC-10 ("No new B44 entities or schema changes") is realistic.

If the team wants:

- reliable duplicate suppression,
- or deterministic "this submit already created order X" recovery,

then some server-stored client submit token is likely needed, and AC-10 becomes questionable.

## Summary for Arman

- Keep the lightweight persist approach, but do not ship the exact 8s proposal as a single hard cutoff for guests + orders + items. Either lazy-load `OrderItem`s after restore or raise the technical timeout.
- Change `pendingSubmit` matching so it only inspects the current guest's orders. Matching against all session orders will hide real failures when another guest submits at the same table.
- Treat `pendingSubmit` as a heuristic only. I found no visible idempotency or dedupe layer in the reviewed code, so duplicate orders remain possible after a crash/retry flow.
- Polling is already partly protected by a 30s optimistic merge window, so this is not a rework-level race. The missing rule is simply that polling must not rewrite persist state while a submit is in flight.
- Correct the document before implementation: the current code already creates sessions with `status: "open"`, so the "active vs open" open item is stale as written.
