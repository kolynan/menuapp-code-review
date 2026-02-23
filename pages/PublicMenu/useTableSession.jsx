import { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  getSessionGuests,
  getSessionOrders,
  getDeviceId,
  findGuestByDevice,
  isSessionExpired,
} from "@/components/sessionHelpers";

// Persistence helpers (FIX-260131-01: session + guest, 8h TTL)
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// BUG-PM-004: TTL for optimistic data before server confirms
const OPTIMISTIC_TTL_MS = 30000; // 30 seconds

// FIX-260131-06: Normalize guest id (support both id and _id)
const normalizeGuestId = (g) => String(g?.id ?? g?._id ?? "");

// FIX-260131-07: Get menu_guest_code from localStorage
const getMenuGuestCode = () => {
  try {
    return localStorage.getItem("menu_guest_code");
  } catch {
    return null;
  }
};

// Session persistence (by table - stable)
const getSessionStorageKey = (partnerId, tableId) => 
  `menuApp_hall_session_${partnerId}_${tableId}`;

const saveSessionId = (partnerId, tableId, sessionId) => {
  if (!partnerId || !tableId || !sessionId) return;
  try {
    const key = getSessionStorageKey(partnerId, tableId);
    localStorage.setItem(key, JSON.stringify({ tableSessionId: sessionId, ts: Date.now() }));
  } catch (e) {
    // Silent fail
  }
};

const getSavedSessionId = (partnerId, tableId) => {
  if (!partnerId || !tableId) return null;
  try {
    const key = getSessionStorageKey(partnerId, tableId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data.tableSessionId;
  } catch {
    return null;
  }
};

const clearSessionId = (partnerId, tableId) => {
  if (!partnerId || !tableId) return;
  try {
    const key = getSessionStorageKey(partnerId, tableId);
    localStorage.removeItem(key);
  } catch {}
};

// =============================================================
// Guest persistence (FIX-260131-05/06/07: PRIMARY by session, FALLBACK by table)
// =============================================================

// PRIMARY key: by session
const getGuestStorageKeyBySession = (partnerId, tableSessionId) => {
  if (!partnerId || !tableSessionId) return null;
  return `menuApp_hall_guest_${partnerId}_${tableSessionId}`;
};

// FALLBACK key: by table
const getGuestStorageKeyByTable = (partnerId, tableId) => {
  if (!partnerId || !tableId) return null;
  return `menuApp_hall_guest_${partnerId}_${tableId}`;
};

// LEGACY key (old format)
const getGuestStorageKeyLegacy = (partnerId, tableId) => {
  if (!partnerId || !tableId) return null;
  return `menuapp_guest_${partnerId}_${tableId}`;
};

// FIX-260131-06: Read guestId from specific key with TTL check
const readGuestIdFromKey = (key) => {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.ts > TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data.guestId ? String(data.guestId) : null;
  } catch {
    return null;
  }
};

// FIX-260131-06: Save to BOTH keys (sync them)
const saveGuestId = (partnerId, tableSessionId, tableId, guestId) => {
  if (!partnerId || !guestId) return;
  try {
    const ts = Date.now();
    const payload = JSON.stringify({ guestId: String(guestId), ts });
    
    // PRIMARY: save by session
    if (tableSessionId) {
      const sessionKey = getGuestStorageKeyBySession(partnerId, tableSessionId);
      if (sessionKey) {
        localStorage.setItem(sessionKey, payload);
      }
    }
    // ALSO save by table (sync both keys)
    if (tableId) {
      const tableKey = getGuestStorageKeyByTable(partnerId, tableId);
      if (tableKey) {
        localStorage.setItem(tableKey, payload);
      }
    }
  } catch (e) {
    // Silent fail
  }
};

const clearGuestId = (partnerId, tableSessionId, tableId) => {
  try {
    if (partnerId && tableSessionId) {
      const sessionKey = getGuestStorageKeyBySession(partnerId, tableSessionId);
      if (sessionKey) localStorage.removeItem(sessionKey);
    }
    if (partnerId && tableId) {
      const tableKey = getGuestStorageKeyByTable(partnerId, tableId);
      if (tableKey) localStorage.removeItem(tableKey);
      // Also clear legacy
      const legacyKey = getGuestStorageKeyLegacy(partnerId, tableId);
      if (legacyKey) localStorage.removeItem(legacyKey);
    }
  } catch {}
};

// FIX-260131-06: Get ALL device ids (there can be multiple)
const getAllDeviceIds = () => {
  const ids = new Set();
  try {
    // Primary from sessionHelpers
    const d1 = getDeviceId();
    if (d1) ids.add(String(d1));
    
    // Legacy keys
    const d2 = localStorage.getItem("menu_device_id");
    if (d2) ids.add(String(d2));
    
    const d3 = localStorage.getItem("menuapp_device_id");
    if (d3) ids.add(String(d3));
  } catch {}
  return Array.from(ids);
};

export function useTableSession({
  partner,
  isHallMode,
  isTableVerified,
  currentTableId,
  orderStages,
  cartTotalAmount,
  getLinkId,
  isRateLimitError,
  t,
}) {
  // TableSession state
  const [tableSession, setTableSession] = useState(null);
  const [currentGuest, setCurrentGuest] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [sessionGuests, setSessionGuests] = useState([]);
  const [sessionItems, setSessionItems] = useState([]);

  // Refs
  const sessionIdRef = useRef(null);
  const currentGuestIdRef = useRef(null);
  const prevTableIdRef = useRef(null);
  const sessionOrdersErrRef = useRef(null);
  const isLoadingSessionRef = useRef(false);
  const didAttemptRestoreRef = useRef(false);

  // Reset session state when table changes (prevents data leaking between tables)
  useEffect(() => {
    const prev = prevTableIdRef.current;
    const curr = currentTableId;
    
    // Clear storage ONLY on REAL table change (both prev and curr defined and different)
    if (prev && curr && prev !== curr && partner?.id) {
      clearSessionId(partner.id, prev);
      clearGuestId(partner.id, sessionIdRef.current, prev);
    }
    
    // Reset state when table changes (including null → tableId on initial mount)
    if (prev !== curr) {
      setTableSession(null);
      setCurrentGuest(null);
      setSessionOrders([]);
      setSessionGuests([]);
      setSessionItems([]);
      sessionIdRef.current = null;
      currentGuestIdRef.current = null;
      didAttemptRestoreRef.current = false;
    }
    
    // Update ref for next render
    prevTableIdRef.current = curr;
  }, [currentTableId, partner?.id]);
  
  // Keep refs in sync with state
  useEffect(() => {
    sessionIdRef.current = tableSession?.id || null;
  }, [tableSession?.id]);
  
  // FIX-260131-03: Persist session when set by /x via setTableSession
  useEffect(() => {
    if (isHallMode && isTableVerified && partner?.id && currentTableId && tableSession?.id) {
      saveSessionId(partner.id, currentTableId, tableSession.id);
    }
  }, [isHallMode, isTableVerified, partner?.id, currentTableId, tableSession?.id]);
  
  useEffect(() => {
    currentGuestIdRef.current = currentGuest?.id || null;
  }, [currentGuest?.id]);
  
  // ============================================================
  // RESTORE: TableSession first, then guest within session
  // FIX-260131-06/07: Robust guest restore with multiple fallbacks
  // ============================================================
  useEffect(() => {
    if (!isHallMode || !isTableVerified || !currentTableId || !partner?.id) return;
    if (didAttemptRestoreRef.current) return;
    
    let cancelled = false;
    
    async function restoreSession() {
      try {
        didAttemptRestoreRef.current = true;
        let session = null;
        
        // STEP 1: Try restore session from storage
        const savedSessionId = getSavedSessionId(partner.id, currentTableId);
        if (savedSessionId) {
          try {
            const savedSessions = await base44.entities.TableSession.filter({ id: savedSessionId });
            const savedSession = savedSessions?.[0];
            
            if (savedSession) {
              const isActive = savedSession.status === 'open' && 
                               !savedSession.closed_at && 
                               !savedSession.ended_at &&
                               !isSessionExpired(savedSession);
              
              const savedTableId = getLinkId(savedSession.table);
              const savedPartnerId = getLinkId(savedSession.partner);
              const matchesTable = String(savedTableId) === String(currentTableId);
              const matchesPartner = String(savedPartnerId) === String(partner.id);
              
              if (isActive && matchesTable && matchesPartner) {
                session = savedSession;
              }
            }
          } catch (err) {
            // Fall through to STEP 2
          }
        }
        
        // STEP 2: If no valid saved session, search for active session
        if (!session) {
          const sessions = await base44.entities.TableSession.filter({
            partner: partner.id,
            table: currentTableId,
            status: 'open'
          });
          
          if (sessions?.length) {
            const sortedSessions = [...sessions].sort((a, b) => 
              new Date(b.opened_at || b.created_at) - new Date(a.opened_at || a.created_at)
            );
            const freshSession = sortedSessions[0];
            
            if (!isSessionExpired(freshSession)) {
              session = freshSession;
            }
          }
        }
        
        if (cancelled || !session) return;
        
        // STEP 3: Persist sessionId for future restores
        saveSessionId(partner.id, currentTableId, session.id);
        
        setTableSession(session);
        sessionIdRef.current = session.id;
        
        // STEP 4: Load guests
        const guests = await getSessionGuests(session.id);
        if (cancelled) return;
        setSessionGuests(guests || []);
        
        // ============================================================
        // STEP 5: FIX-260131-07 — Robust guest restore (try ALL keys separately)
        // ============================================================
        let guest = null;
        
        // Read ALL saved guestIds (don't use || — try each separately)
        const sessionKey = getGuestStorageKeyBySession(partner.id, session.id);
        const tableKey = getGuestStorageKeyByTable(partner.id, currentTableId);
        const legacyKey = getGuestStorageKeyLegacy(partner.id, currentTableId);
        
        const sessionSavedGuestId = readGuestIdFromKey(sessionKey);
        const tableSavedGuestId = readGuestIdFromKey(tableKey);
        const legacySavedGuestId = readGuestIdFromKey(legacyKey);
        
        // A) Try session-key guestId first
        if (!guest && sessionSavedGuestId && guests?.length) {
          guest = guests.find(g => normalizeGuestId(g) === sessionSavedGuestId) || null;
        }
        
        // B) Try table-key guestId (even if session-key existed but didn't match)
        if (!guest && tableSavedGuestId && guests?.length) {
          guest = guests.find(g => normalizeGuestId(g) === tableSavedGuestId) || null;
        }
        
        // C) Try legacy-key guestId
        if (!guest && legacySavedGuestId && guests?.length) {
          guest = guests.find(g => normalizeGuestId(g) === legacySavedGuestId) || null;
        }
        
        // D) Fallback: find by menu_guest_code
        if (!guest && guests?.length) {
          const guestCode = getMenuGuestCode();
          if (guestCode) {
            guest = guests.find(g => {
              const code = String(g.guest_code ?? g.guestCode ?? g.code ?? g.menu_guest_code ?? "");
              return code === String(guestCode);
            }) || null;
          }
        }
        
        // E) Fallback: find by ANY device_id
        if (!guest && guests?.length) {
          const deviceIds = getAllDeviceIds();
          if (deviceIds.length > 0) {
            guest = guests.find(g => {
              const gDeviceId = String(g.device_id ?? g.deviceId ?? "");
              return gDeviceId && deviceIds.includes(gDeviceId);
            }) || null;
          }
        }
        
        // F) If still not found in guests array, try DB load
        if (!guest) {
          const guestIdToLoad = sessionSavedGuestId || tableSavedGuestId || legacySavedGuestId;
          if (guestIdToLoad) {
            try {
              let loadedGuests = await base44.entities.SessionGuest.filter({ id: guestIdToLoad });
              let loadedGuest = loadedGuests?.[0];
              
              if (!loadedGuest) {
                try {
                  loadedGuests = await base44.entities.SessionGuest.filter({ _id: guestIdToLoad });
                  loadedGuest = loadedGuests?.[0];
                } catch {}
              }
              
              if (loadedGuest) {
                const guestSessionId = getLinkId(loadedGuest.session);
                if (String(guestSessionId) === String(session.id)) {
                  guest = loadedGuest;
                }
              } else {
                clearGuestId(partner.id, session.id, currentTableId);
              }
            } catch (err) {
              // DB error — don't clear
            }
          }
        }
        
        // G) Last fallback: findGuestByDevice with ALL device ids
        if (!guest) {
          const deviceIds = getAllDeviceIds();
          for (const deviceId of deviceIds) {
            if (cancelled) break;
            try {
              guest = await findGuestByDevice(session.id, deviceId);
              if (guest) break;
            } catch {}
          }
        }
        
        // STEP 6: Set guest and SYNC both keys
        if (cancelled) return;
        if (guest) {
          const guestId = normalizeGuestId(guest);
          setCurrentGuest(guest);
          currentGuestIdRef.current = guestId;
          saveGuestId(partner.id, session.id, currentTableId, guestId);
        }
        
        // STEP 7: Load orders and items
        const orders = await getSessionOrders(session.id);
        if (cancelled) return;
        setSessionOrders(orders || []);
        
        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          let items = [];
          
          try {
            const result = await base44.entities.OrderItem.filter({
              order: { $in: orderIds }
            });
            if (Array.isArray(result)) items = result;
          } catch (inErr) {
            const batchSize = 10;
            for (let i = 0; i < orderIds.length; i += batchSize) {
              if (cancelled) break;
              const batch = orderIds.slice(i, i + batchSize);
              const results = await Promise.allSettled(
                batch.map(oid => base44.entities.OrderItem.filter({ order: oid }))
              );
              for (const r of results) {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                  items.push(...r.value);
                }
              }
            }
          }
          
          if (!cancelled) setSessionItems(items);
        }
        
      } catch (err) {
        didAttemptRestoreRef.current = false;
      }
    }
    
    restoreSession();
    
    return () => { cancelled = true; };
  }, [isHallMode, isTableVerified, currentTableId, partner?.id]);

  // ============================================================
  // POLLING: Only when session already exists
  // FIX-260131-07: Run immediately + fast restore in polling (try ALL keys)
  // ============================================================
  useEffect(() => {
    const sessionId = tableSession?.id;
    if (!sessionId || !isHallMode || !isTableVerified) return;
    
    let cancelled = false;
    let intervalId = null;
    
    async function pollSessionData() {
      if (isLoadingSessionRef.current) return;
      isLoadingSessionRef.current = true;
      
      try {
        // Load guests
        const guests = await getSessionGuests(sessionId);
        if (cancelled) return;
        setSessionGuests(guests || []);
        
        // ============================================================
        // FIX-260131-07: Fast restore current guest (try ALL keys separately)
        // ============================================================
        if (!currentGuestIdRef.current && partner?.id && currentTableId && Array.isArray(guests) && guests.length) {
          let foundGuest = null;
          
          // 1) Try persisted guestIds (ALL keys, not || )
          const sessionKey = getGuestStorageKeyBySession(partner.id, sessionId);
          const tableKey = getGuestStorageKeyByTable(partner.id, currentTableId);
          const legacyKey = getGuestStorageKeyLegacy(partner.id, currentTableId);
          
          const sessionSavedId = readGuestIdFromKey(sessionKey);
          const tableSavedId = readGuestIdFromKey(tableKey);
          const legacySavedId = readGuestIdFromKey(legacyKey);
          
          // Try session-key first
          if (sessionSavedId) {
            foundGuest = guests.find(g => normalizeGuestId(g) === sessionSavedId) || null;
          }
          // If not found, try table-key
          if (!foundGuest && tableSavedId) {
            foundGuest = guests.find(g => normalizeGuestId(g) === tableSavedId) || null;
          }
          // If not found, try legacy-key
          if (!foundGuest && legacySavedId) {
            foundGuest = guests.find(g => normalizeGuestId(g) === legacySavedId) || null;
          }
          
          // 2) Try guest code (menu_guest_code) if still not found
          if (!foundGuest) {
            const code = getMenuGuestCode();
            if (code) {
              foundGuest = guests.find(g => {
                const gCode = g?.guest_code ?? g?.guestCode ?? g?.code ?? g?.menu_guest_code;
                return gCode != null && String(gCode) === String(code);
              }) || null;
            }
          }
          
          // 3) If found, set and sync
          if (foundGuest) {
            setCurrentGuest(foundGuest);
            currentGuestIdRef.current = normalizeGuestId(foundGuest);
            saveGuestId(partner.id, sessionId, currentTableId, currentGuestIdRef.current);
          }
        }
        
        // Refresh current guest if still not set — try device lookup
        if (!currentGuestIdRef.current) {
          const deviceIds = getAllDeviceIds();
          for (const deviceId of deviceIds) {
            if (cancelled) break;
            try {
              const guest = await findGuestByDevice(sessionId, deviceId);
              if (guest) {
                setCurrentGuest(guest);
                currentGuestIdRef.current = normalizeGuestId(guest);
                if (partner?.id && currentTableId) {
                  saveGuestId(partner.id, sessionId, currentTableId, normalizeGuestId(guest));
                }
                break;
              }
            } catch {}
          }
        }
        
        // Load orders — BUG-PM-004: merge strategy preserves optimistic data
        const orders = await getSessionOrders(sessionId);
        if (cancelled) return;
        setSessionOrders(prev => {
          const serverOrders = (orders || []).map(o => ({ ...o, _fromServer: true }));
          const serverIds = new Set(serverOrders.map(o => String(o.id)));
          const now = Date.now();
          // Keep optimistic orders not yet confirmed by server, within TTL
          const optimistic = prev.filter(o =>
            !o._fromServer &&
            o._optimisticAt &&
            !serverIds.has(String(o.id)) &&
            (now - o._optimisticAt) < OPTIMISTIC_TTL_MS
          );
          return [...serverOrders, ...optimistic];
        });
        
        // Load OrderItems
        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          let items = [];
          
          try {
            const result = await base44.entities.OrderItem.filter({
              order: { $in: orderIds }
            });
            if (Array.isArray(result)) items = result;
          } catch (inErr) {
            const batchSize = 10;
            for (let i = 0; i < orderIds.length; i += batchSize) {
              if (cancelled) break;
              const batch = orderIds.slice(i, i + batchSize);
              const results = await Promise.allSettled(
                batch.map(oid => base44.entities.OrderItem.filter({ order: oid }))
              );
              for (const r of results) {
                if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                  items.push(...r.value);
                }
              }
            }
          }
          
          if (!cancelled) {
            // BUG-PM-004: merge strategy — keep optimistic items (temp_ IDs)
            setSessionItems(prev => {
              const serverOrderIds = new Set(items.map(item => {
                const oid = typeof item.order === 'object'
                  ? (item.order?.id ?? item.order?._id) : item.order;
                return String(oid || '');
              }));
              const now = Date.now();
              const optimistic = prev.filter(item =>
                String(item.id || '').startsWith('temp_') &&
                item._optimisticAt &&
                (now - item._optimisticAt) < OPTIMISTIC_TTL_MS &&
                !serverOrderIds.has(String(
                  typeof item.order === 'object'
                    ? (item.order?.id ?? item.order?._id) : item.order || ''
                ))
              );
              return [...items, ...optimistic];
            });
          }
        } else {
          if (!cancelled) {
            // BUG-PM-004: keep optimistic items even when no server orders yet
            setSessionItems(prev => {
              const now = Date.now();
              return prev.filter(item =>
                String(item.id || '').startsWith('temp_') &&
                item._optimisticAt &&
                (now - item._optimisticAt) < OPTIMISTIC_TTL_MS
              );
            });
          }
        }
        
        sessionOrdersErrRef.current = null;
      } catch (err) {
        sessionOrdersErrRef.current = err;
      } finally {
        isLoadingSessionRef.current = false;
      }
    }
    
    // Polling with dynamic interval
    const getInterval = () => {
      const err = sessionOrdersErrRef.current;
      if (err && isRateLimitError(err)) return 30000;
      if (err) return 15000;
      return 10000;
    };
    
    const scheduleNext = () => {
      intervalId = setTimeout(() => {
        pollSessionData();
        scheduleNext();
      }, getInterval());
    };
    
    // FIX-260131-07: Run once immediately so guest restore happens
    // BEFORE the first user submit (not waiting 10 seconds)
    pollSessionData();
    scheduleNext();
    
    return () => {
      cancelled = true;
      if (intervalId) clearTimeout(intervalId);
    };
  }, [tableSession?.id, isHallMode, isTableVerified]);

  // ============================================================
  // TABLESESSION COMPUTED VALUES with SPLIT LOGIC (TASK-260126-01)
  // ============================================================

  // Build items map by order for quick lookup
  const itemsByOrder = useMemo(() => {
    const map = new Map();
    (sessionItems || []).forEach(item => {
      const orderId = getLinkId(item.order);
      if (!orderId) return;
      if (!map.has(orderId)) map.set(orderId, []);
      map.get(orderId).push(item);
    });
    return map;
  }, [sessionItems, getLinkId]);

  // Calculate split bills per guest
  const billsByGuest = useMemo(() => {
    const guestIdsFromGuests = (sessionGuests || []).map(g => normalizeGuestId(g));
    const guestIdsFromOrders = Array.from(
      new Set((sessionOrders || []).map(o => getLinkId(o.guest)).filter(Boolean))
    );
    const guestIds = guestIdsFromGuests.length ? guestIdsFromGuests : guestIdsFromOrders;
    const guestCount = guestIds.length || 1;
    
    const bills = new Map();
    
    guestIds.forEach(id => {
      bills.set(id, { singles: 0, shared: 0, total: 0 });
    });
    
    let sharedPool = 0;
    
    sessionOrders.forEach(order => {
      const guestId = getLinkId(order.guest);
      const items = itemsByOrder.get(order.id) || [];
      
      items.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.dish_price) || 0;
        const lineTotal = item.line_total ?? (price * qty);
        
        if (item.split_type === 'all') {
          sharedPool += lineTotal;
        } else {
          if (guestId && bills.has(guestId)) {
            const bill = bills.get(guestId);
            bill.singles += lineTotal;
          }
        }
      });
    });
    
    const sharedPerGuest = guestCount > 0 ? sharedPool / guestCount : 0;
    
    bills.forEach((bill) => {
      bill.shared = sharedPerGuest;
      bill.total = bill.singles + bill.shared;
    });
    
    return { bills, sharedPool, sharedPerGuest };
  }, [sessionOrders, sessionGuests, itemsByOrder, getLinkId]);

  // My bill (current guest)
  const myBill = useMemo(() => {
    if (!currentGuest) return { singles: 0, shared: 0, total: 0 };
    const guestId = normalizeGuestId(currentGuest);
    return billsByGuest.bills.get(guestId) || { singles: 0, shared: 0, total: 0 };
  }, [billsByGuest, currentGuest]);

  // Others bills (grouped by guest, not by order)
  const otherGuestsBills = useMemo(() => {
    const result = [];
    const myId = currentGuest ? normalizeGuestId(currentGuest) : null;
    sessionGuests.forEach(guest => {
      const guestId = normalizeGuestId(guest);
      if (guestId === myId) return;
      const bill = billsByGuest.bills.get(guestId) || { singles: 0, shared: 0, total: 0 };
      result.push({ guest, bill });
    });
    return result;
  }, [sessionGuests, currentGuest, billsByGuest]);

  // Others total
  const othersTotal = useMemo(() => {
    return otherGuestsBills.reduce((sum, { bill }) => sum + bill.total, 0);
  }, [otherGuestsBills]);

  // My orders (for display)
  const myOrders = useMemo(() => {
    if (!currentGuest) return [];
    const myId = normalizeGuestId(currentGuest);
    return sessionOrders.filter(o => getLinkId(o.guest) === myId);
  }, [sessionOrders, currentGuest, getLinkId]);

  // Table total = all submitted orders + current cart
  const tableTotal = useMemo(() => {
    const submittedTotal = sessionOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return submittedTotal + cartTotalAmount;
  }, [sessionOrders, cartTotalAmount]);

  // OrderStages map for status lookup
  const stagesMap = useMemo(() => {
    if (!orderStages) return new Map();
    return new Map(orderStages.map(s => [String(s.id), s]));
  }, [orderStages]);

  // Get order status helper
  const getOrderStatus = (order) => {
    const stageId = typeof order.stage_id === 'object' 
      ? (order.stage_id?.id ?? order.stage_id?._id) 
      : order.stage_id;
    
    const stageIdStr = stageId ? String(stageId) : null;
    const stage = stageIdStr ? stagesMap.get(stageIdStr) : null;
    
    if (stage) {
      const icon = stage.internal_code === 'finish' ? '✅' 
                 : stage.internal_code === 'start' ? '🔵' : '🟠';
      return { icon, label: stage.name, color: stage.color || '#3b82f6' };
    }
    
    return { icon: '🔵', label: t('status.new'), color: '#3b82f6' };
  };

  return {
    tableSession,
    setTableSession,
    currentGuest,
    setCurrentGuest,
    sessionOrders,
    setSessionOrders,
    sessionGuests,
    setSessionGuests,
    sessionItems,
    setSessionItems,
    itemsByOrder,
    billsByGuest,
    myBill,
    myOrders,
    otherGuestsBills,
    othersTotal,
    tableTotal,
    stagesMap,
    getOrderStatus,
    saveGuestId,
    sessionIdRef,
    currentGuestIdRef,
  };
}
