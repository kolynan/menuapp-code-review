// Version: 1.1 (S70 fix, 2026-03-03)
// Source: Base44 platform file @/components/sessionHelpers
// S70: changed status "active" → "open" to match useTableSession.jsx
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
// FUNCTION 3: getOrCreateSession
// Finds open session for table or creates new one
// ============================================================
export async function getOrCreateSession(tableId, partnerId) {
  const sessions = await base44.entities.TableSession.filter({
    table: tableId,
    status: "open"
  });

  if (sessions && sessions.length > 0) {
    return sessions[0];
  }

  const newSession = await base44.entities.TableSession.create({
    table: tableId,
    partner: partnerId,
    status: "open",
    opened_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  });

  return newSession;
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
export async function closeSession(sessionId) {
  await base44.entities.TableSession.update(sessionId, {
    status: "closed",
    closed_at: new Date().toISOString()
  });

  // S267: Bulk-close all non-cancelled orders in this session.
  const sessionOrders = await base44.entities.Order.filter({ table_session: sessionId });
  await Promise.all(
    sessionOrders
      .filter(o => o.status !== 'cancelled')
      .map(o => base44.entities.Order.update(o.id, { status: 'closed' }))
  );
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
