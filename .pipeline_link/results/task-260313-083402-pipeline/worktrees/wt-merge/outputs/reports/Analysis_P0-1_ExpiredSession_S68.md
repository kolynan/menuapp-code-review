---
title: "Analysis: P0-1 Expired Session Logic — Safety Review Before Deploy"
session: S68
date: 2026-03-02
version: "1.0"
status: analysis complete
reviewers: Claude Code + Codex
verdict: CONDITIONALLY SAFE — see details
---

# Analysis: How Does P0-1 Determine "Expired Session"?

## Context

Before deploying `260302-00 useTableSession RELEASE.jsx` + `260302-04 StaffOrdersMobile RELEASE.jsx`,
we need to verify that P0-1 (cleanup-before-show) will NOT accidentally close sessions
that a waiter is actively using.

---

## Q1: What is the expiry threshold?

### Two separate mechanisms exist:

**Mechanism 1: `isSessionExpired()` — Server-side session validity**
- Imported from `@/components/sessionHelpers` (Base44 platform file)
- **We do NOT have the source code** of this function locally
- Per SESS-008 (LOCKED): `isSessionExpired = 8h since last order`
- Likely implementation: `now - session.last_activity_at > 8h`
- Used in lines 284, 297, 323 of `useTableSession RELEASE.jsx`

**Mechanism 2: `TTL_MS = 8 * 60 * 60 * 1000` — Client-side localStorage TTL**
- Defined on line 12 of `useTableSession RELEASE.jsx`
- Used ONLY for localStorage key expiry (lines 50, 97)
- Purpose: browser forgets saved sessionId/guestId after 8 hours
- **This is NOT the session expiry logic** — it's a separate browser storage cleanup

### Key code excerpt — P0-1 cleanup logic (lines 167-190):

```jsx
// P0-1: Close an expired session in DB (cleanup-before-show)
// Closes session status to 'expired' and cancels unprocessed (new) orders
const closeExpiredSessionInDB = async (sessionId) => {
  try {
    await base44.entities.TableSession.update(sessionId, {
      status: 'expired',
      closed_at: new Date().toISOString(),
    });
    // Cancel unprocessed orders (new status only — accepted+ are already in kitchen)
    const orders = await getSessionOrders(sessionId);
    if (orders?.length) {
      const unprocessed = orders.filter(o => o.status === 'new');
      if (unprocessed.length > 0) {
        await Promise.allSettled(
          unprocessed.map(o =>
            base44.entities.Order.update(o.id, { status: 'cancelled' })
          )
        );
      }
    }
  } catch (err) {
    console.warn(`[P0-cleanup] Failed to close expired session ${sessionId}:`, err?.message);
  }
};
```

### Key code excerpt — Where P0-1 triggers (lines 283-328):

```jsx
// STEP 1: Restore saved session — check if expired
if (savedSession) {
  const isExpired = isSessionExpired(savedSession);           // line 284
  const isActive = savedSession.status === 'open' &&
                   !savedSession.closed_at &&
                   !savedSession.ended_at &&
                   !isExpired;                                // lines 285-288

  if (isActive && matchesTable && matchesPartner) {
    session = savedSession;                                   // use as-is
  } else if (savedSession.status === 'open' && isExpired) {
    closeExpiredSessionInDB(savedSession.id);                 // line 299 — P0-1
    clearSessionId(partner.id, currentTableId);
  }
}

// STEP 2: Search for active sessions — close any expired ones
for (const s of sortedSessions) {
  if (isSessionExpired(s)) {                                  // line 323
    await closeExpiredSessionInDB(s.id);                      // P0-1
  } else if (!session) {
    session = s;                                              // use first non-expired
  }
}
```

### Answer to Q1:
- **Threshold:** 8 hours since last activity/order (SESS-008 LOCKED)
- **Source:** `isSessionExpired()` from `@/components/sessionHelpers` — B44 platform code
- **NOT hardcoded in our code** — we depend on B44's implementation
- **localStorage TTL (also 8h)** is separate and unrelated

---

## Q2: What happens to an active session?

### Scenario A: Session opened at 10:00, now 11:00 (1h old)
- `isSessionExpired()` returns `false` (1h < 8h threshold)
- Session stays open, guest joins normally
- **SAFE**

### Scenario B: Session opened at 10:00, now 19:00 (9h old)
- **If `last_activity_at` updates on orders:** If last order was at 18:00, then only 1h since last activity → NOT expired. If no orders since 10:00, then 9h → EXPIRED.
- **If `isSessionExpired` checks `opened_at`:** Always 9h → EXPIRED regardless of orders
- In the expired case: session is closed, orders with status 'new' are cancelled
- **CONDITIONALLY SAFE** — depends on which timestamp `isSessionExpired` uses

### Scenario C: Session opened yesterday (20+ hours old)
- `isSessionExpired()` returns `true` (20h >> 8h)
- `closeExpiredSessionInDB()` is called:
  - Session status → 'expired'
  - `closed_at` → now
  - Only orders with status `'new'` are cancelled
  - Orders already `accepted`/`in_progress`/`ready`/`served` are NOT touched
- **SAFE** — only stale 'new' orders are cancelled

---

## Q3: Is there any risk of closing currently active sessions?

### Short answer: LOW RISK, but with one uncertainty.

**What protects active sessions:**
1. The 8h threshold is generous — normal dining visits are 1-3 hours
2. `closeExpiredSessionInDB` only cancels orders with status `'new'` — orders already accepted/in-progress/ready are untouched
3. The cleanup only triggers on QR scan (not on polling or waiter actions)

**The uncertainty:**
- We don't know exactly what `isSessionExpired()` checks internally
- SESS-008 says "8h since last order" → implies it uses `last_activity_at`
- If it instead checks `opened_at` → a table open since morning (>8h) would be expired even with recent activity
- **This is the critical unknown** — need to verify in B44's `sessionHelpers.js`

### Risk matrix:

| `isSessionExpired` checks... | Risk level | Comment |
|---|---|---|
| `last_activity_at` + 8h | **LOW** | Only truly idle sessions expire. Active tables safe. |
| `opened_at` + 8h | **MEDIUM** | Long lunch/dinner events (>8h) would be expired. Unlikely but possible. |
| `expires_at < now` | **DEPENDS** | If `expires_at` is set at creation and never updated → MEDIUM risk. If sliding → LOW risk. |

### Recommendation:
- **Before deploy:** Verify `isSessionExpired()` implementation in B44 code
- Ask B44 or check the actual `@/components/sessionHelpers.js` file in the B44 editor
- If it uses `opened_at` → we need to add our own guard (check `last_activity_at` instead)

---

## Q4: Legacy sessions in production

### Current situation:
- Production may have sessions from days/weeks ago still `status='open'`
- These have NO P0-1 cleanup logic (current prod doesn't have it)

### What happens after deploying P0-1:
- On the **first QR scan** for a table with an old open session:
  - STEP 1: `getSavedSessionId()` from localStorage — unlikely to find one (localStorage cleared after 8h)
  - STEP 2: `filter({ status: 'open', table: tableId })` — finds ALL open sessions for this table
  - Iterates through them, calling `isSessionExpired(s)` on each
  - Old sessions (>8h) → `closeExpiredSessionInDB()` closes them one by one
  - If no non-expired session found → a new session is created normally

### Risk of heavy first load:
- If a table has 5+ accumulated open sessions → STEP 2 iterates and closes each
- Each close = 1 update + 1 filter + N order cancels
- For a table with many old sessions, this could be slow (5-10 seconds)
- **SESS-021 (LOCKED):** Run a one-time legacy migration BEFORE deploying P0-1

### Recommendation:
- **Run SESS-021 migration** before deploy: close all sessions with `last_activity_at < now - 24h`
- This prevents P0-1 from doing heavy cleanup on first scan
- Without migration: P0-1 still works, just slower on first scan per table

---

## Verdict

### CONDITIONALLY SAFE TO DEPLOY

**Safe aspects:**
1. 8h threshold is generous for normal dining (1-3h visits)
2. Only `'new'` orders are cancelled — in-progress/ready/served untouched
3. Cleanup only triggers on QR scan, not on background polling
4. Legacy sessions handled lazily but correctly

**Must verify before deploy (1 item):**
- [ ] **CRITICAL:** What exactly does `isSessionExpired()` check in `@/components/sessionHelpers`?
  - If `last_activity_at` + 8h → **SAFE, deploy immediately**
  - If `opened_at` + 8h → **Need guard for long sessions** (add check for recent orders)
  - **How to verify:** Open Base44 editor → navigate to `sessionHelpers.js` → find `isSessionExpired` function

**Should do before deploy (1 item):**
- [ ] **RECOMMENDED:** Run SESS-021 legacy migration (close sessions older than 24h)
  - Without this: first QR scan may be slow for tables with accumulated sessions
  - With this: clean slate, fast first load

**If `isSessionExpired` needs fixing (proposed surgical change):**

If we discover it checks `opened_at` instead of `last_activity_at`, add a guard in `useTableSession`:

```jsx
// BEFORE calling isSessionExpired, add extra check:
const hasRecentActivity = (session) => {
  const lastActivity = session.last_activity_at || session.updated_at || session.opened_at;
  if (!lastActivity) return false;
  const ageMs = Date.now() - new Date(lastActivity).getTime();
  return ageMs < 8 * 60 * 60 * 1000; // 8h
};

// In STEP 1 (line 284), replace:
//   const isExpired = isSessionExpired(savedSession);
// With:
//   const isExpired = isSessionExpired(savedSession) && !hasRecentActivity(savedSession);
```

This would ensure that even if B44's function is too aggressive, sessions with recent activity are protected.

---

*Analysis by Claude Code (CC) + Codex, Session S68, 2026-03-02*
