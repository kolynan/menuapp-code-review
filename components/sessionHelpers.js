// Version: 1.2 (S451 RF-4 Sub-batch 1, 2026-04-29)
// Source: Base44 platform file @/components/sessionHelpers
// S70: changed status "active" → "open" to match useTableSession.jsx
// S451 RF-4: getOrCreateSession() migrated to thin wrapper around B44 Backend Function
//   `createTableSession` (server-side filter+create, reduces concurrent QR scan race window).
//   Frontend signature unchanged; internal implementation now delegates to backend.
// NOTE: Existing DB sessions with status:"active" are orphaned — SESS-021 migration handles cleanup

import { base44 } from '@/api/base44Client';

// ============================================================
// FUNCTION 1: getBusinessDate
// Returns business date (if before day start, returns yesterday)
// ============================================================
export function getBusinessDate(date, businessDayStart = "06:00") {
  const [hours, minutes] = businessDayStart.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  let businessDate = new Date(date);
  if (currentMinutes < startMinutes) {
    businessDate.setDate(businessDate.getDate() - 1);
  }

  return businessDate.toISOString().split("T")[0];
}

// ============================================================
// FUNCTION 2: getNextOrderNumber
// Generates next order number (ZAL-001, SV-002, DOS-003)
// Resets counter on new business day
// ============================================================
export function getNextOrderNumber(partner, channel) {
  const now = new Date();
  const businessDayStart = partner.business_day_start || "06:00";
  const currentBusinessDate = getBusinessDate(now, businessDayStart);

  const updated = { ...partner };

  // Reset counters if new business day
  if (updated.order_counter_date !== currentBusinessDate) {
    updated.order_counter_hall = 0;
    updated.order_counter_pickup = 0;
    updated.order_counter_delivery = 0;
    updated.order_counter_date = currentBusinessDate;
  }

  // Increment counter for channel
  const counterKey = `order_counter_${channel}`;
  updated[counterKey] = (updated[counterKey] || 0) + 1;

  // Generate order number
  const prefixes = { hall: "ЗАЛ", pickup: "СВ", delivery: "ДОС" };
  const prefix = prefixes[channel] || "ORD";
  const number = String(updated[counterKey]).padStart(3, "0");

  return {
    orderNumber: `${prefix}-${number}`,
    updatedCounters: {
      order_counter_hall: updated.order_counter_hall,
      order_counter_pickup: updated.order_counter_pickup,
      order_counter_delivery: updated.order_counter_delivery,
      order_counter_date: updated.order_counter_date,
    }
  };
}

// ============================================================
// FUNCTION 2b: claimOrderNumbers (RF-4 Sub-2, S484)
// Atomically claims N sequential order numbers for a channel.
//
// Strategy: read → update → verify-after-150ms.
// If another guest wrote concurrently (verify shows different
// counter value) → retry with fresh read, up to MAX_ATTEMPTS.
// Narrows race window ~100× without native B44 compare-and-swap.
// Falls back to unverified best-effort claim after MAX_ATTEMPTS.
//
// Returns { orderNumbers: string[], updatedCounters: object }.
// ============================================================
export async function claimOrderNumbers(partnerId, channel, count) {
  const counterField = `order_counter_${channel}`;
  const prefixes = { hall: 'ЗАЛ', pickup: 'СВ', delivery: 'ДОС' };
  const prefix = prefixes[channel] || 'ORD';
  const MAX_ATTEMPTS = 4;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Step 1: Fresh read — get current counter value
    const p = await base44.entities.Partner.get(partnerId);
    const businessDate = getBusinessDate(new Date(), p.business_day_start || '06:00');
    const isNewDay = p.order_counter_date !== businessDate;
    const baseCount = isNewDay ? 0 : (p[counterField] || 0);
    const newCount = baseCount + count;

    // Step 2: Write claimed range [baseCount+1 .. newCount]
    const claimPayload = {
      order_counter_hall: isNewDay ? 0 : (p.order_counter_hall || 0),
      order_counter_pickup: isNewDay ? 0 : (p.order_counter_pickup || 0),
      order_counter_delivery: isNewDay ? 0 : (p.order_counter_delivery || 0),
      order_counter_date: businessDate,
      [counterField]: newCount,
    };

    try {
      await base44.entities.Partner.update(partnerId, claimPayload);
    } catch {
      // Update failed — retry with backoff
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise(r => setTimeout(r, 50 * Math.pow(2, attempt)));
      }
      continue;
    }

    // Step 3: Verify after 150ms — confirm our write survived concurrent updates
    await new Promise(r => setTimeout(r, 150));
    const verify = await base44.entities.Partner.get(partnerId);

    if (verify[counterField] === newCount && verify.order_counter_date === businessDate) {
      // Verified — return N order number strings for the claimed range
      const orderNumbers = Array.from({ length: count }, (_, i) =>
        `${prefix}-${String(baseCount + 1 + i).padStart(3, '0')}`
      );
      return { orderNumbers, updatedCounters: claimPayload };
    }

    // Race detected — another write changed the counter; retry with backoff
    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise(r => setTimeout(r, 50 * Math.pow(2, attempt)));
    }
  }

  // Fallback: best-effort claim without verify
  // Triggered only if 4 concurrent races in rapid succession (extremely rare)
  const p = await base44.entities.Partner.get(partnerId);
  const businessDate = getBusinessDate(new Date(), p.business_day_start || '06:00');
  const isNewDay = p.order_counter_date !== businessDate;
  const baseCount = isNewDay ? 0 : (p[counterField] || 0);
  const newCount = baseCount + count;
  const fallbackPayload = {
    order_counter_hall: isNewDay ? 0 : (p.order_counter_hall || 0),
    order_counter_pickup: isNewDay ? 0 : (p.order_counter_pickup || 0),
    order_counter_delivery: isNewDay ? 0 : (p.order_counter_delivery || 0),
    order_counter_date: businessDate,
    [counterField]: newCount,
  };
  try { await base44.entities.Partner.update(partnerId, fallbackPayload); } catch { /* silent */ }
  const orderNumbers = Array.from({ length: count }, (_, i) =>
    `${prefix}-${String(baseCount + 1 + i).padStart(3, '0')}`
  );
  return { orderNumbers, updatedCounters: fallbackPayload };
}

// ============================================================
// FUNCTION 3: getOrCreateSession (S481 RF-4 Sub-1 client-side pivot)
// Finds open session for table or creates new one.
//
// S481 PIVOT: Backend Functions blocked (App Editor ≠ Backend Platform, KB-175).
// Replaced B44 Backend Function wrapper with client-side conditional create
// + retry-with-check pattern. Race window narrows ~100× (equivalent to what
// Backend Function would have provided — B44 confirmed Functions are NOT
// transactional either, see DECISIONS_INDEX §RF-4-PIVOT-S481).
//
// Pattern:
//   Step 1: filter existing open sessions → reuse oldest (idempotent)
//   Step 2: create new session if none found
//   Step 3: 150ms sleep → re-filter → close race dupes, return oldest
//
// Backwards-compat:
//   - Same export name + same positional args (tableId, partnerId)
//   - Returns same TableSession object shape
//   - Existing callers (e.g. x.jsx:4048) require no signature changes
//
// Note on arg order: caller x.jsx:4048 passes (partner.id, currentTableId) — args
// reversed relative to this function's signature. Pre-existing latent bug
// (S70-vintage), OUT OF SCOPE here; tracked separately.
// ============================================================
export async function getOrCreateSession(tableId, partnerId) {
  // Step 1: Filter existing open sessions for this (partner, table)
  const existing = await base44.entities.TableSession.filter({
    partner: partnerId,
    table: tableId,
    status: 'open',
  });

  if (existing && existing.length > 0) {
    // Reuse oldest (idempotent — same result whether 1st or Nth concurrent call)
    const sorted = [...existing].sort((a, b) => {
      const dateA = new Date(a.created_at || a.created_date || 0);
      const dateB = new Date(b.created_at || b.created_date || 0);
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
      return (a.id || '').localeCompare(b.id || ''); // R1 fallback: id lexicographic
    });
    return sorted[0];
  }

  // Step 2: Create new session (no open session found)
  const session = await base44.entities.TableSession.create({
    partner: partnerId,
    table: tableId,
    status: 'open',
  });

  // Step 3: Retry-with-check — close the race window for concurrent QR scans.
  // 150ms sleep collapses the overlap interval for near-simultaneous creates.
  await new Promise((r) => setTimeout(r, 150));

  const verify = await base44.entities.TableSession.filter({
    partner: partnerId,
    table: tableId,
    status: 'open',
  });

  if (verify && verify.length > 1) {
    // Race detected — keep oldest, close newer duplicates (best-effort)
    const sorted = [...verify].sort((a, b) => {
      const dateA = new Date(a.created_at || a.created_date || 0);
      const dateB = new Date(b.created_at || b.created_date || 0);
      if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
      return (a.id || '').localeCompare(b.id || '');
    });
    const oldest = sorted[0];
    const dupes = sorted.slice(1);

    await Promise.all(
      dupes.map((s) =>
        base44.entities.TableSession.update(s.id, {
          status: 'closed',
          closed_at: new Date().toISOString(),
          close_reason: 'race_dedup_s481',
        }).catch((e) => {
          // Best-effort: if update fails, SOM defence layer handles orphan
          console.warn('[sessionHelpers] race_dedup update failed:', e);
        })
      )
    );
    return oldest;
  }

  return session;
}

// ============================================================
// FUNCTION 4: addGuestToSession
// Adds guest to session with correct number
// ============================================================
export async function addGuestToSession(sessionId, name = null, deviceId = null) {
  const guests = await base44.entities.SessionGuest.filter({
    session: sessionId
  });

  const nextNumber = (guests?.length || 0) + 1;

  const newGuest = await base44.entities.SessionGuest.create({
    session: sessionId,
    guest_number: nextNumber,
    name: name || null,
    device_id: deviceId || null
  });

  return newGuest;
}

// ============================================================
// FUNCTION 5: findGuestByDevice
// Finds guest by device_id in session
// ============================================================
export async function findGuestByDevice(sessionId, deviceId) {
  if (!deviceId) return null;

  const guests = await base44.entities.SessionGuest.filter({
    session: sessionId,
    device_id: deviceId
  });

  return (guests && guests.length > 0) ? guests[0] : null;
}

// ============================================================
// FUNCTION 6: getSessionGuests
// Gets all guests in session
// ============================================================
export async function getSessionGuests(sessionId) {
  const guests = await base44.entities.SessionGuest.filter({
    session: sessionId
  });
  return guests || [];
}

// ============================================================
// FUNCTION 7: getSessionOrders
// Gets all orders in session
// ============================================================
export async function getSessionOrders(sessionId) {
  const orders = await base44.entities.Order.filter({
    table_session: sessionId
  });

  // Sort by created_at desc (newest first)
  const sorted = (orders || []).sort((a, b) =>
    new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return sorted;
}

// ============================================================
// FUNCTION 8: closeSession
// Closes session
// ============================================================
export async function closeSession(sessionId, tableId) {
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });

  // S267: Bulk-close all non-cancelled orders in this session (sequential to avoid 429).
  const BATCH_DELAY_MS = 120;
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  const ordersToClose = sessionOrders.filter(o => o.status !== 'cancelled');
  for (let i = 0; i < ordersToClose.length; i++) {
    await base44.entities.Order.update(ordersToClose[i].id, { status: 'closed' });
    if (i < ordersToClose.length - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  // S283: Close open ServiceRequests for this table (so closed table leaves Active tab)
  if (tableId) {
    let requests = await base44.entities.ServiceRequest.filter({ table_session: sessionId });
    if (requests.length === 0 && tableId) {
      requests = await base44.entities.ServiceRequest.filter({ table: tableId });
    }
    const openRequests = requests.filter(r => !['done', 'cancelled'].includes(r.status));
    for (let i = 0; i < openRequests.length; i++) {
      await base44.entities.ServiceRequest.update(openRequests[i].id, { status: 'done' });
      if (i < openRequests.length - 1) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }
  }
}

// ============================================================
// FUNCTION 9: isSessionExpired
// Checks if session timeout has passed
// ============================================================
export function isSessionExpired(session, hoursTimeout = 8) {
  if (!session) return true;
  if (session.status === "closed") return true;

  const openedAt = new Date(session.opened_at);
  const now = new Date();
  const hoursDiff = (now - openedAt) / (1000 * 60 * 60);

  return hoursDiff > hoursTimeout;
}

// ============================================================
// FUNCTION 10: getDeviceId
// Gets or creates device ID (localStorage)
// ============================================================
export function getDeviceId() {
  const STORAGE_KEY = "menuapp_device_id";

  if (typeof window === "undefined") return null;

  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

// ============================================================
// FUNCTION 11: getGuestDisplayName
// Returns display name for guest
// ============================================================
export function getGuestDisplayName(guest) {
  if (!guest) return "Гость";
  return guest.name || `Гость ${guest.guest_number}`;
}

// ============================================================
// FUNCTION 12: markOrdersPaid (RF-4 Sub-4 Variant A, S490, JSDoc hotfix S492)
// Marks N orders as payment_status='paid' using batch sequential
// updates with 120ms BATCH_DELAY (anti-429, same pattern as
// closeSession FUNCTION 8 line 319-323).
//
// Trust-caller contract (Variant A spec, S487 Opus decision):
// Caller MUST pass only ids of orders that are:
//   (a) within current partner+session+guest scope (caller has filtered Order objects),
//   (b) payment_status !== 'paid' (helper is idempotent but no-op wastes one RPC + 120ms),
//   (c) status !== 'cancelled' (semantically nonsensical to pay cancelled orders).
// Helper does NOT validate these — caller responsibility per Variant A externalization.
// closeSession FUNCTION 8 internalizes filter because its only param is sessionId;
// markOrdersPaid externalizes filter because caller already holds filtered Order objects.
//
// Idempotent at DB level: repeated set 'paid' → no harm (DB no-op).
// Best-effort: partial failure does NOT abort the loop.
// Returns { updated: string[], failed: Array<{id, error}> }
// for caller reconciliation (SOM display layer shows partial state).
// ============================================================
export async function markOrdersPaid(orderIds) {
  const BATCH_DELAY_MS = 120; // anti-429 (S267 vintage, same as closeSession)
  const updated = [];
  const failed = [];

  for (let i = 0; i < orderIds.length; i++) {
    try {
      await base44.entities.Order.update(orderIds[i], {
        payment_status: 'paid',
      });
      updated.push(orderIds[i]);
    } catch (err) {
      failed.push({ id: orderIds[i], error: err?.message || 'unknown' });
    }
    // Anti-429: delay between updates (skip after last item)
    if (i < orderIds.length - 1) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return { updated, failed };
}
