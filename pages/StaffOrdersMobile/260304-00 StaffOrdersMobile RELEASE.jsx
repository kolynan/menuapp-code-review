/* ═══════════════════════════════════════════════════════════════════════════
   STAFFORDERSMOBILE — v3.6.0 (2026-03-04) Stale Data + Close Table Confirm S74

   CHANGES in v3.6.0 (P0 Stale Data + Close Table Confirm — S74):
   - P0: Detail view forces refetch on open (prevents stale order list)
   - P0: Notification effect invalidates orders query when new orders detected
   - P0: computeTableStatus reordered — NEW before STALE (new orders clear ПРОСРОЧЕН)
   - P0: "Закрыть стол" replaced browser confirm() with React confirmation dialog
   - Dialog: table name in title, destructive red button, 44px touch targets, mobile 320px safe

   CHANGES in v3.5.0 (SESS-016 — Session Cleanup Integration):
   - Added runSessionCleanup() import from @/components/sessionCleanupJob
   - Added useEffect + setInterval(5min) to auto-expire stale sessions
   - Silent background job: logs only when actions taken or errors occur
   - Idempotent: safe to run on each mount + every 5 minutes

   CHANGES in v3.4.0 (UI Bug Fixes — 4 bugs from Deep Test S66):
   - BUG-S66-01: Detail view now opens reliably (removed translate-x animation, z-40)
   - BUG-S66-02: PREPARING cards show CTA for advanceable orders (was hidden)
   - BUG-S65-04: First-stage CTA opens detail view (prevents blind accept)
   - BUG-S65-05: Fixed double "Стол" prefix (displayName + banner)

   CHANGES in v3.2.0 (Sprint D — Waiter Screen V2):
   - V2-09: BannerNotification — in-app banner overlay for new order events
   - Fixed position at top of viewport, z-60 (above everything)
   - Content: "Стол N: Новый заказ" with table name + event type
   - Auto-hide after 5 seconds, swipe-up to dismiss early
   - Tap banner → scroll to relevant table card with brief highlight
   - De-duplication: multiple events in same cycle → "3 новых заказа"
   - Works on all screens (Mine, Free, Others, Detail view)
   - Non-blocking: content below remains interactive

   CHANGES in v3.1.0 (Sprint B — Waiter Screen V2):
   - V2-02: TableDetailScreen — full-screen detail view, slide-in from right
   - V2-03: Split-tap — CTA button executes action, card body opens detail view
   - Scroll position preserved when returning from detail view
   - DetailOrderRow — auto-fetches items in detail view (no lazy loading needed)
   - GuestOrderSection — per-guest action buttons (48px min, full-width)
   - Swipe-right back navigation on TableDetailScreen
   - liveDetailGroup: detail view auto-updates via polling

   CHANGES in v3.0.0 (Sprint A — Waiter Screen V2):
   - V2-01: Compact card layout (table name + zone, status badge, guest/order count, elapsed time, 1 CTA)
   - V2-05: Color-coded left borders (purple/blue/amber/green/gray/red per status)
   - V2-06: Muted Preparing cards (gray bg, 2px border, no CTA)
   - V2-08: Guest-labeled CTA ("Accept (Guest #N)" format)
   - V2-10: 52px min-height full-width primary CTA button
   - Sort: Mine tab sorted BILL_REQUESTED > NEW > READY > ALL_SERVED > PREPARING (oldest first within group)
   - Added computeTableStatus() and computeGroupCTA() helpers
   - Added TABLE_STATUS_STYLES and TABLE_STATUS_SORT_PRIORITY mappings

   STAFFORDERSMOBILE — v2.7.3 (2026-02-02)
   
   CHANGES in v2.7.3 (shift filtering):
   - Added shift-based filtering: orders/requests only from current shift
   - Added getShiftStartTime helper (supports overnight shifts)
   - Filters use partner.working_hours to determine shift boundaries
   
   CHANGES in v2.7.2 (hotfix):
   - Fixed duplicate "Стол" in group header (removed prefix, displayName already contains full label)
   - Fixed empty state condition for non-kitchen (check finalGroups + finalRequests, not visibleOrders)
   
   CHANGES in v2.7.1 (tabs + overdue + favorites filter):
   - Added Active/Completed tabs (non-kitchen only)
   - Added overdue badge (red clock) on orders waiting too long
   - Added "★ Мои" favorites filter toggle
   - Added ★ button on ServiceRequests
   - Added "Закрыть стол" button when all orders ready
   
   CHANGES in v2.7.0 (grouping):
   - OrderGroupCard: hall grouped by table, pickup/delivery individual
   - Favorites format: plain IDs → prefixed keys (table:id)
   - Sorted by oldest unaccepted order
   - Auto-expand first 5 + favorites
   - Kitchen unchanged (flat list)
   
   CHANGES in v2.6.6 (hardening):
   - Stage ID сравнения теперь через getLinkId() везде (getStagesForOrder, getStatusConfig)
   - stagesMap собирается по нормализованным ключам
   - handleAction проверяет assignee через getAssigneeId() (не !order.assignee)
   
   CHANGES in v2.6.5 (hardening):
   - isOrderFree() теперь использует getLinkId() (унификация)
   - favorites нормализация: все ID приводятся к строке через getLinkId()
   - MyTablesModal использует getLinkId() для сравнений
   
   CHANGES in v2.6.4 (hotfix):
   - getAssigneeId() теперь использует getLinkId() (унификация)
   - Сброс guest-кэша при смене partnerId (защита от stale data)
   
   CHANGES in v2.6.3 (hotfix):
   - getLinkId() финальный: null-check (== null), консистентный String() везде
   
   CHANGES in v2.6.2 (hotfix):
   - getLinkId() типобезопасный: string/number/object/value-object
   
   CHANGES in v2.6.1 (hotfix):
   - getLinkId() расширен: теперь обрабатывает _id и value (не только id)
   - onCloseTable передаёт нормализованный tableSessionId
   
   CHANGES in v2.6 (P0 FIXES):
   - P0-1: Applied getLinkId() everywhere for order.table, order.stage_id, req.table
   - P0-2: Removed .list() from OrderStage query (consistent with other .filter() calls)
   - P0-3: Lazy loading for OrderItem (itemsOpen state + enabled flag) - fixes N+1 429
   - P0-4: Added loadedGuestIdsRef to prevent repeated SessionGuest requests on polling
   - P0-5: Added currentUserId fallback (id ?? _id ?? user_id ?? null)
   
   Previous changes (v2.5):
   - D1: Added order_number badge (gray) - NOT for kitchen
   - D1: Added guest name badge (blue) with batch loading - NOT for kitchen
   - D1: Added "Close table" button - NOT for kitchen
   - D1: Kitchen optimization: no SessionGuest requests
   - D1: getLinkId helper for normalizing link fields
   
   Previous changes (v2.4):
   - P1: Added OrderStage integration (dynamic stages instead of hardcoded STATUS_FLOW)
   - P1: getStatusConfig function with fallback to STATUS_FLOW
   - P1: Stage filtering by order channel (enabled_hall/pickup/delivery)
   - P1: Badge now shows stage.color when using OrderStage
   - P1: handleAction updates stage_id instead of status for new orders
   
   Previous changes (v2.3):
   - P0: Added CABINET_ACCESS_ROLES constant
   - P0: Added auto-bind for directors (if logged in + email matches)
   - P0: Added Cabinet button in header for directors after bind
   
   Previous changes (v2.2):
   - Added ProfileSheet with staff name, role, restaurant name
   - Moved "My Tables" (⭐) into ProfileSheet
   - Added role-based help instructions (waiter vs kitchen)
   - Added kitchen filter: kitchen only sees accepted/in_progress/ready orders
   - Simplified header: [👤] [🔔] [⚙️]
   - Added logout functionality
   
   Previous fixes (v2.1):
   - Rate limit fix (infinite loop prevention)
═══════════════════════════════════════════════════════════════════════════ */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Hand,
  Loader2,
  RefreshCcw,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Utensils,
  UtensilsCrossed,
  AlertTriangle,
  X,
  User,
  LogOut,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// D1: Import session helpers
import { getGuestDisplayName, closeSession } from "@/components/sessionHelpers";
// SESS-016: Import session cleanup job (auto-expire stale sessions)
import { runSessionCleanup } from "@/components/sessionCleanupJob";

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════════════════ */

// FALLBACK: Used when order has no stage_id or stages not loaded
const STATUS_FLOW = {
  new: {
    label: "Новый",
    actionLabel: "Принять",
    nextStatus: "accepted",
    badgeClass: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  accepted: {
    label: "Принят",
    actionLabel: "В работу",
    nextStatus: "in_progress",
    badgeClass: "bg-slate-50 text-slate-600 border border-slate-200",
  },
  in_progress: {
    label: "Готовится",
    actionLabel: "Готово",
    nextStatus: "ready",
    badgeClass: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  },
  ready: {
    label: "Готов",
    actionLabel: "Выдать",
    nextStatus: "served",
    badgeClass: "bg-green-50 text-green-700 border border-green-200",
  },
};

const TYPE_THEME = {
  hall: {
    label: "Зал",
    icon: Utensils,
    stripeClass: "bg-indigo-500",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  pickup: {
    label: "Самовывоз",
    icon: ShoppingBag,
    stripeClass: "bg-fuchsia-500",
    badgeClass: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  delivery: {
    label: "Доставка",
    icon: Truck,
    stripeClass: "bg-teal-500",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

const REQUEST_TYPE_LABELS = {
  call_waiter: "Позвать официанта",
  bill: "Принести счёт",
  napkins: "Принести салфетки",
  menu: "Принести меню",
  other: "Другой запрос",
};

const ROLE_LABELS = {
  partner_staff: "Официант",
  kitchen: "Кухня",
  partner_manager: "Менеджер",
  director: "Директор",
  managing_director: "Управляющий директор",
};

const DEVICE_ID_STORAGE_KEY = "menuapp_staff_device_id";
const NOTIF_PREFS_STORAGE_KEY = "menuapp_staff_notif_prefs_v2";
const POLLING_INTERVAL_KEY = "menuapp_staff_polling_interval";
const SORT_MODE_KEY = "menuapp_staff_sort_mode";
const SORT_ORDER_KEY = "menuapp_staff_sort_order";

// P0: Роли с доступом к кабинету
const CABINET_ACCESS_ROLES = ['director', 'managing_director'];

// V2-05: Table-level status color/style mapping (Sprint A)
const TABLE_STATUS_STYLES = {
  BILL_REQUESTED: {
    borderClass: 'border-l-4 border-l-violet-500',
    bgClass: 'bg-violet-50',
    badgeClass: 'bg-violet-500 text-white',
    textClass: 'text-slate-900',
    ctaBgClass: 'bg-violet-600 hover:bg-violet-700 text-white',
    label: 'СЧЁТ',
  },
  NEW: {
    borderClass: 'border-l-4 border-l-blue-500',
    bgClass: 'bg-blue-50',
    badgeClass: 'bg-blue-500 text-white',
    textClass: 'text-slate-900',
    ctaBgClass: 'bg-blue-600 hover:bg-blue-700 text-white',
    label: 'НОВЫЙ',
  },
  READY: {
    borderClass: 'border-l-4 border-l-amber-500',
    bgClass: 'bg-amber-50',
    badgeClass: 'bg-amber-500 text-white',
    textClass: 'text-slate-900',
    ctaBgClass: 'bg-amber-600 hover:bg-amber-700 text-white',
    label: 'ГОТОВ',
  },
  ALL_SERVED: {
    borderClass: 'border-l-4 border-l-green-500',
    bgClass: 'bg-green-50',
    badgeClass: 'bg-green-500 text-white',
    textClass: 'text-slate-900',
    ctaBgClass: 'bg-green-600 hover:bg-green-700 text-white',
    label: 'ОБСЛУЖЕНО',
  },
  PREPARING: {
    borderClass: 'border-l-2 border-l-slate-300',
    bgClass: 'bg-slate-50',
    badgeClass: 'bg-slate-400 text-white',
    textClass: 'text-slate-500',
    ctaBgClass: 'bg-slate-600 hover:bg-slate-700 text-white',
    label: 'ГОТОВИТСЯ',
  },
  STALE: {
    borderClass: 'border-l-4 border-l-red-500',
    bgClass: 'bg-red-50',
    badgeClass: 'bg-red-500 text-white',
    textClass: 'text-slate-900',
    ctaBgClass: 'bg-red-600 hover:bg-red-700 text-white',
    label: 'ПРОСРОЧЕН',
  },
};

// V2: Sort priority for Mine tab (0 = highest priority)
const TABLE_STATUS_SORT_PRIORITY = {
  BILL_REQUESTED: 0,
  STALE: 0,
  NEW: 1,
  READY: 2,
  ALL_SERVED: 3,
  PREPARING: 4,
};

const ALL_CHANNELS = ["hall", "pickup", "delivery"];
const ALL_ASSIGN_FILTERS = ["mine", "others", "free"];

const POLLING_OPTIONS = [
  { value: 5000, label: "5с" },
  { value: 15000, label: "15с" },
  { value: 30000, label: "30с" },
  { value: 60000, label: "60с" },
  { value: 0, label: "Вручную" },
];

const DEFAULT_POLLING_INTERVAL = 5000;
const DEFAULT_SORT_MODE = "priority";
const DEFAULT_SORT_ORDER = "newest";

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */

function isRateLimitError(error) {
  if (!error) return false;
  const msg = error.message || error.toString() || "";
  return msg.toLowerCase().includes("rate limit") || msg.includes("429");
}

function shouldRetry(failureCount, error) {
  if (isRateLimitError(error)) return false;
  return failureCount < 2;
}

// D1-006: Normalize link fields (type-safe: string/number/object/value-object)
function getLinkId(field) {
  if (field == null) return null; // only null/undefined

  if (typeof field === "string" || typeof field === "number") return String(field);

  if (typeof field === "object") {
    const v = field.id ?? field._id ?? field.value ?? null;

    if (typeof v === "string" || typeof v === "number") return String(v);

    if (v && typeof v === "object") {
      const vv = v.id ?? v._id ?? null;
      if (typeof vv === "string" || typeof vv === "number") return String(vv);
    }
  }

  return null;
}

function getAssignee(order) {
  return order.assignee || null;
}

function getAssigneeId(order) {
  return getLinkId(order.assignee);
}

function isOrderFree(order) {
  return !getLinkId(order.assignee);
}

function isOrderMine(order, effectiveUserId) {
  if (!effectiveUserId) return false;
  const assigneeId = getAssigneeId(order);
  if (!assigneeId) return false;
  return assigneeId === effectiveUserId;
}

function safeParseDate(dateStr) {
  if (!dateStr) return new Date();
  try {
    const safe = !String(dateStr).endsWith("Z") ? `${dateStr}Z` : dateStr;
    const d = new Date(safe);
    if (isNaN(d.getTime())) return new Date();
    return d;
  } catch {
    return new Date();
  }
}

/**
 * Calculate when current shift started based on working_hours
 * @param {Object} workingHours - partner.working_hours object
 * @returns {Date} - shift start datetime
 */
function getShiftStartTime(workingHours) {
  const FALLBACK_HOURS = 12;
  const now = new Date();
  
  // No working hours → fallback to 12 hours ago
  if (!workingHours || typeof workingHours !== 'object') {
    return new Date(now.getTime() - FALLBACK_HOURS * 60 * 60 * 1000);
  }
  
  const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayIndex = now.getDay(); // 0=Sun, 1=Mon, ...
  const todayKey = dayKeys[todayIndex];
  const yesterdayKey = dayKeys[(todayIndex + 6) % 7];
  
  const todayHours = workingHours[todayKey];
  const yesterdayHours = workingHours[yesterdayKey];
  
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Parse time string "HH:MM" to minutes since midnight
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  // Check if we're still in yesterday's overnight shift
  if (yesterdayHours?.active) {
    const yOpen = parseTime(yesterdayHours.open);
    const yClose = parseTime(yesterdayHours.close);
    
    // Overnight shift: close < open (e.g., 01:29 < 10:00)
    if (yClose !== null && yOpen !== null && yClose < yOpen) {
      // We're in overnight portion if now < close time
      if (nowMinutes < yClose) {
        // Shift started yesterday at open time
        const shiftStart = new Date(now);
        shiftStart.setDate(shiftStart.getDate() - 1);
        shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
        return shiftStart;
      }
    }
  }
  
  // Check today's shift
  if (todayHours?.active) {
    const tOpen = parseTime(todayHours.open);
    
    if (tOpen !== null && nowMinutes >= tOpen) {
      // Shift started today at open time
      const shiftStart = new Date(now);
      shiftStart.setHours(Math.floor(tOpen / 60), tOpen % 60, 0, 0);
      return shiftStart;
    }
  }
  
  // Before today's opening: find most recent shift start
  // Check yesterday's opening
  if (yesterdayHours?.active) {
    const yOpen = parseTime(yesterdayHours.open);
    if (yOpen !== null) {
      const shiftStart = new Date(now);
      shiftStart.setDate(shiftStart.getDate() - 1);
      shiftStart.setHours(Math.floor(yOpen / 60), yOpen % 60, 0, 0);
      return shiftStart;
    }
  }
  
  // Fallback: 12 hours ago
  return new Date(now.getTime() - FALLBACK_HOURS * 60 * 60 * 1000);
}

function isOrderOverdue(order, getStatusConfig, overdueMinutes = 10) {
  const config = getStatusConfig(order);
  if (!config.isFirstStage) return false;
  
  const created = safeParseDate(order.created_date).getTime();
  const minutesOld = (Date.now() - created) / 60000;
  
  return minutesOld > overdueMinutes;
}

function formatRelativeTime(dateStr) {
  const date = safeParseDate(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: ru });
}

function genDeviceId() {
  try {
    if (crypto?.randomUUID) return crypto.randomUUID();
  } catch { /* ignore */ }
  return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function getOrCreateDeviceId() {
  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing) return existing;
    const id = genDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
    return id;
  } catch {
    return genDeviceId();
  }
}

function loadNotifPrefs() {
  const defaults = { enabled: true, sound: false, vibrate: true, system: false };
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function saveNotifPrefs(prefs) {
  try {
    localStorage.setItem(NOTIF_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

function loadPollingInterval() {
  try {
    const raw = sessionStorage.getItem(POLLING_INTERVAL_KEY);
    if (!raw) return DEFAULT_POLLING_INTERVAL;
    const val = parseInt(raw, 10);
    if (POLLING_OPTIONS.some((o) => o.value === val)) return val;
    return DEFAULT_POLLING_INTERVAL;
  } catch {
    return DEFAULT_POLLING_INTERVAL;
  }
}

function savePollingInterval(val) {
  try {
    sessionStorage.setItem(POLLING_INTERVAL_KEY, String(val));
  } catch { /* ignore */ }
}

function loadSortMode() {
  try {
    const raw = sessionStorage.getItem(SORT_MODE_KEY);
    if (raw === "priority" || raw === "time") return raw;
    return DEFAULT_SORT_MODE;
  } catch {
    return DEFAULT_SORT_MODE;
  }
}

function saveSortMode(val) {
  try {
    sessionStorage.setItem(SORT_MODE_KEY, val);
  } catch { /* ignore */ }
}

function loadSortOrder() {
  try {
    const raw = sessionStorage.getItem(SORT_ORDER_KEY);
    if (raw === "newest" || raw === "oldest") return raw;
    return DEFAULT_SORT_ORDER;
  } catch {
    return DEFAULT_SORT_ORDER;
  }
}

function saveSortOrder(val) {
  try {
    sessionStorage.setItem(SORT_ORDER_KEY, val);
  } catch { /* ignore */ }
}

function getMyTablesKey(userIdOrToken) {
  return `staff_my_tables_${userIdOrToken || "anon"}`;
}

function loadMyTables(userIdOrToken) {
  try {
    const raw = localStorage.getItem(getMyTablesKey(userIdOrToken));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMyTables(userIdOrToken, tables) {
  try {
    localStorage.setItem(getMyTablesKey(userIdOrToken), JSON.stringify(tables));
  } catch { /* ignore */ }
}

function tryVibrate(enabled) {
  if (!enabled) return;
  try {
    if (navigator?.vibrate) navigator.vibrate(60);
  } catch { /* ignore */ }
}

function createBeep() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    return {
      ctx,
      play: () => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        g.gain.value = 0.03;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.08);
      },
      resume: async () => {
        try {
          if (ctx.state === "suspended") await ctx.resume();
        } catch { /* ignore */ }
      },
    };
  } catch {
    return null;
  }
}

function canUseNotifications() {
  try {
    return typeof Notification !== "undefined";
  } catch {
    return false;
  }
}

function clearAllStaffData() {
  try {
    localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
    localStorage.removeItem(NOTIF_PREFS_STORAGE_KEY);
    sessionStorage.removeItem(POLLING_INTERVAL_KEY);
    sessionStorage.removeItem(SORT_MODE_KEY);
    sessionStorage.removeItem(SORT_ORDER_KEY);
    // Clear all staff_my_tables_* keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('staff_my_tables_')) {
        localStorage.removeItem(key);
      }
    });
  } catch { /* ignore */ }
}

/**
 * Фильтрует этапы по каналу заказа (ORD-001, ORD-003)
 * @param {Object} order - заказ с order_type
 * @param {Array} stages - все этапы партнёра (sorted)
 * @returns {Array} - отфильтрованные этапы
 */
function getStagesForOrder(order, stages) {
  if (!order?.order_type || !stages?.length) return stages || [];
  
  const filtered = stages.filter(stage => {
    switch (order.order_type) {
      case 'hall': 
        return stage.enabled_hall !== false; // default true
      case 'pickup': 
        return stage.enabled_pickup !== false;
      case 'delivery': 
        return stage.enabled_delivery !== false;
      default: 
        return true;
    }
  });
  
  // P0-1: Normalize stage_id before comparison
  const orderStageId = getLinkId(order.stage_id);
  
  // Edge case: если текущий этап не попал в список — добавить его
  if (orderStageId) {
    const currentStage = stages.find(s => getLinkId(s.id) === orderStageId);
    if (currentStage && !filtered.find(s => getLinkId(s.id) === getLinkId(currentStage.id))) {
      filtered.push(currentStage);
      filtered.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
  }
  
  return filtered;
}

// V2-05: Compute table-level status from group orders + service requests
function computeTableStatus(group, activeRequests, getStatusConfig) {
  const orders = group.orders.filter(o => o.status !== 'cancelled');

  // 1. Bill request check (table groups only, highest priority)
  if (group.type === 'table') {
    const hasBillRequest = (activeRequests || []).some(
      r => getLinkId(r.table) === group.id && r.request_type === 'bill'
    );
    if (hasBillRequest) return 'BILL_REQUESTED';
  }

  if (orders.length === 0) return 'ALL_SERVED';

  // 2. Any order needs accepting (first stage)? — takes priority over STALE
  // v3.6.0: Moved before STALE so new orders clear ПРОСРОЧЕН label
  if (orders.some(o => getStatusConfig(o).isFirstStage)) return 'NEW';

  // 3. STALE: all orders have no assignee and oldest is >3 min (Free tab signal)
  const allFree = orders.every(o => !getLinkId(o.assignee));
  if (allFree) {
    const oldest = Math.min(...orders.map(o => safeParseDate(o.created_date).getTime()));
    if (Date.now() - oldest > 3 * 60 * 1000) return 'STALE';
  }

  // 4. All orders at finish stage → waiter should close the table
  if (orders.every(o => getStatusConfig(o).isFinishStage)) return 'ALL_SERVED';

  // 5. Some orders at finish stage (food ready, needs serving)
  if (orders.some(o => getStatusConfig(o).isFinishStage)) return 'READY';

  // 6. All in middle stages (kitchen working)
  return 'PREPARING';
}

// V2-08: Compute the primary CTA for a group card
function computeGroupCTA(group, tableStatus, getStatusConfig, guestsMap) {
  const orders = group.orders.filter(o => o.status !== 'cancelled');

  // BUG-S66-02 fix: PREPARING cards show CTA for orders that can be advanced
  if (tableStatus === 'PREPARING') {
    const advanceable = orders.filter(o => {
      const config = getStatusConfig(o);
      return !config.isFirstStage && !config.isFinishStage && (config.nextStageId || config.nextStatus);
    });
    if (!advanceable.length) return null;
    advanceable.sort(
      (a, b) => safeParseDate(a.created_date).getTime() - safeParseDate(b.created_date).getTime()
    );
    const target = advanceable[0];
    const config = getStatusConfig(target);
    const guestId = getLinkId(target.guest);
    const guest = guestId && guestsMap ? guestsMap[guestId] : null;
    const guestLabel = guest ? getGuestDisplayName(guest) : null;
    const actionText = config.actionLabel || 'Готово';
    const label = guestLabel ? `${actionText} (${guestLabel})` : actionText;
    return { type: 'advance_order', orderId: target.id, config, label };
  }

  if (tableStatus === 'ALL_SERVED' || tableStatus === 'BILL_REQUESTED') {
    return { type: 'close_table', label: 'Закрыть стол' };
  }
  // STALE: close table only for table groups (not pickup/delivery)
  if (tableStatus === 'STALE') {
    if (group.type === 'table') {
      return { type: 'close_table', label: 'Закрыть стол' };
    }
    return null;
  }

  let targetOrders;
  if (tableStatus === 'NEW') {
    targetOrders = orders.filter(o => getStatusConfig(o).isFirstStage);
  } else if (tableStatus === 'READY') {
    targetOrders = orders.filter(o => getStatusConfig(o).isFinishStage);
  } else {
    return null;
  }

  if (!targetOrders.length) return null;

  // Oldest order first (corresponds to lowest-numbered guest)
  targetOrders.sort(
    (a, b) => safeParseDate(a.created_date).getTime() - safeParseDate(b.created_date).getTime()
  );
  const targetOrder = targetOrders[0];

  const config = getStatusConfig(targetOrder);
  if (!(config.nextStageId || config.nextStatus)) return null;

  // Guest label for CTA (V2-08)
  const guestId = getLinkId(targetOrder.guest);
  const guest = guestId && guestsMap ? guestsMap[guestId] : null;
  const guestLabel = guest ? getGuestDisplayName(guest) : null;

  // BUG-S65-04: first-stage CTA opens detail view (shows content before accept)
  const actionText = tableStatus === 'NEW'
    ? 'Открыть заказ'
    : (config.actionLabel || 'Выдать');
  const label = guestLabel ? `${actionText} (${guestLabel})` : actionText;

  return { type: 'advance_order', orderId: targetOrder.id, config, label };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function RateLimitScreen({ onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <Card className="max-w-md w-full border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">Слишком много запросов</div>
          <div className="text-sm text-slate-600">
            Сервер временно ограничил доступ. Подождите минуту и попробуйте снова.
          </div>
          <Button 
            onClick={onRetry}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LockedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <Card className="max-w-md w-full border-slate-200">
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-xl font-bold text-slate-900">Ссылка занята</div>
          <div className="text-sm text-slate-600">
            Эта ссылка официанта уже используется на другом устройстве.
          </div>
          <div className="text-xs text-slate-500">
            Попроси менеджера перевыпустить ссылку в кабинете.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BindingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <Card className="max-w-md w-full border-slate-200">
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-xl font-bold text-slate-900">Активация…</div>
          <div className="text-sm text-slate-600">Привязываем ссылку к этому устройству.</div>
          <div className="flex justify-center pt-2">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IconToggle({ icon: Icon, label, count, selected, onClick, tone = "neutral", countAsIcon = false }) {
  const base = "flex flex-col items-center justify-center rounded-xl border transition-all select-none active:scale-[0.97]";
  const size = "flex-1 min-w-[52px] max-w-[120px] h-14";
  
  const isEmpty = count === 0;

  let cls = "";
  
  if (tone === "neutral") {
    if (selected) {
      cls = isEmpty 
        ? "bg-slate-600 text-slate-300 border-slate-600" 
        : "bg-slate-900 text-white border-slate-900";
    } else {
      cls = isEmpty 
        ? "bg-white text-slate-300 border-slate-200" 
        : "bg-white text-slate-600 border-slate-200";
    }
  } else if (tone === "indigo") {
    if (selected) {
      cls = isEmpty 
        ? "bg-indigo-100/50 text-indigo-300 border-indigo-200" 
        : "bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-200";
    } else {
      cls = isEmpty 
        ? "bg-white text-slate-300 border-slate-200" 
        : "bg-white text-slate-500 border-slate-200";
    }
  } else if (tone === "fuchsia") {
    if (selected) {
      cls = isEmpty 
        ? "bg-fuchsia-100/50 text-fuchsia-300 border-fuchsia-200" 
        : "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-300 ring-1 ring-fuchsia-200";
    } else {
      cls = isEmpty 
        ? "bg-white text-slate-300 border-slate-200" 
        : "bg-white text-slate-500 border-slate-200";
    }
  } else {
    if (selected) {
      cls = isEmpty 
        ? "bg-teal-100/50 text-teal-300 border-teal-200" 
        : "bg-teal-50 text-teal-700 border-teal-300 ring-1 ring-teal-200";
    } else {
      cls = isEmpty 
        ? "bg-white text-slate-300 border-slate-200" 
        : "bg-white text-slate-500 border-slate-200";
    }
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${size} ${cls}`} aria-pressed={selected}>
      {countAsIcon ? (
        <span className={`text-xl font-bold leading-none ${isEmpty && selected ? "opacity-60" : ""}`}>{count}</span>
      ) : (
        <React.Fragment>
          <Icon className="w-5 h-5" />
          <span className="text-[10px] leading-tight opacity-70 mt-0.5">{count}</span>
        </React.Fragment>
      )}
      <span className="text-[10px] leading-tight mt-1 font-medium">{label}</span>
    </button>
  );
}

function RequestCard({ request, tableData, onAction, isPending, isFavorite, onToggleFavorite }) {
  const timeAgo = formatRelativeTime(request.created_date);
  const typeLabel = REQUEST_TYPE_LABELS[request.request_type] || request.request_type;
  
  // P0-1: Normalize table link
  const reqTableId = getLinkId(request.table);
  const tableLabel = reqTableId && tableData ? `Стол ${tableData.name}` : request.table ? "Стол …" : "—";

  const statusLabel = request.status === "new" ? "Новый" : "В работе";
  const statusBadgeClass =
    request.status === "new"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-yellow-50 text-yellow-700 border-yellow-200";
  const actionLabel = request.status === "new" ? "В работу" : "Готово";

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 mb-2 shadow-sm">
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-900 text-sm">{typeLabel}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite('request', request.id);
            }}
            className="p-1 -m-1 active:scale-90"
            aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
          >
            <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
          </button>
        </div>
        <span className="text-[10px] text-slate-400">{timeAgo}</span>
      </div>
      <div className="text-xs text-slate-500 mb-2">{tableLabel}</div>
      {request.comment && (
        <div className="text-xs bg-slate-50 text-slate-600 p-2 rounded mb-2 border border-slate-100">
          {request.comment}
        </div>
      )}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`text-[10px] ${statusBadgeClass}`}>
          {statusLabel}
        </Badge>
        <Button
          size="sm"
          onClick={onAction}
          disabled={isPending}
          className="h-7 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : actionLabel}
        </Button>
      </div>
    </div>
  );
}

function OrderCard({ 
  order, 
  tableData, 
  isFavorite, 
  onToggleFavorite, 
  disableServe, 
  onMutate, 
  effectiveUserId,
  isNotified,
  onClearNotified,
  getStatusConfig,
  // D1: New props
  isKitchen,
  guestsMap,
  onCloseTable,
}) {
  const queryClient = useQueryClient();
  
  // P0-3: Lazy loading state for items
  const [itemsOpen, setItemsOpen] = useState(false);
  
  // P0-1: Normalize link fields at the start
  const tableId = getLinkId(order.table);
  const stageId = getLinkId(order.stage_id);
  const tableSessionId = getLinkId(order.table_session);
  const guestId = getLinkId(order.guest);

  // P0-3: Only load items when card is expanded
  const { data: items } = useQuery({
    queryKey: ["orderItems", order.id],
    queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
    staleTime: 30000,
    retry: shouldRetry,
    enabled: itemsOpen, // P0-3: lazy loading
  });

  // Get status configuration (from OrderStage or fallback to STATUS_FLOW)
  const statusConfig = getStatusConfig(order);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
    onMutate: async ({ id, payload }) => {
      if (onMutate) onMutate(id, payload.status || payload.stage_id);
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      const prev = queryClient.getQueriesData({ queryKey: ["orders"] });
      queryClient.setQueriesData({ queryKey: ["orders"] }, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((o) => (o.id === id ? { ...o, ...payload } : o));
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const handleAction = (e) => {
    e.stopPropagation(); // P0-3: prevent card toggle
    
    // Нет следующего статуса/этапа — ничего не делаем
    if (!statusConfig.nextStageId && !statusConfig.nextStatus) return;
    
    const payload = {};
    
    // Режим OrderStage (приоритет)
    if (statusConfig.nextStageId) {
      payload.stage_id = statusConfig.nextStageId;
    }
    // Fallback режим (старый status)
    else if (statusConfig.nextStatus) {
      payload.status = statusConfig.nextStatus;
    }
    
    // Assignee логика — для первого этапа (use getAssigneeId for proper check)
    const isFirstAction = order.status === "new" || statusConfig.isFirstStage;
    if (isFirstAction && effectiveUserId && !getAssigneeId(order)) {
      payload.assignee = effectiveUserId;
      payload.assigned_at = new Date().toISOString();
    }
    
    if (onClearNotified) {
      onClearNotified(order.id);
    }
    
    updateStatusMutation.mutate({ id: order.id, payload });
  };

  // P0-3: Handle card click to toggle items
  const handleCardClick = () => {
    setItemsOpen(v => !v);
  };

  const createdDate = safeParseDate(order.created_date);
  const timeAgo = formatRelativeTime(order.created_date);
  
  const nowMs = Date.now();
  const createdMs = createdDate.getTime();
  const minutesOld = (nowMs - createdMs) / 1000 / 60;

  const typeConfig = TYPE_THEME[order.order_type] || TYPE_THEME.hall;
  const TypeIcon = typeConfig.icon;

  const isOldReady = (order.status === "ready" || statusConfig.isFinishStage) && minutesOld > 10;
  const isStaleInProgress = order.status === "in_progress" && minutesOld > 120;

  let mainText = "";
  let secondaryText = null;
  let displayComment = order.comment;
  let isTableMissing = false;

  if (order.order_type === "hall") {
    // P0-1: Use normalized tableId
    if (tableId && tableData) {
      mainText = `Стол ${tableData.name}`;
      if (tableData.zone_name) secondaryText = tableData.zone_name;
    } else {
      mainText = "Стол не указан";
      isTableMissing = true;
      if (order.comment?.startsWith("Стол:")) {
        const lines = order.comment.split("\n");
        const note = lines[0].replace("Стол:", "").trim();
        if (note) {
          mainText = `Стол ${note}`;
          isTableMissing = false;
          displayComment = lines.slice(1).join("\n").trim() || null;
        }
      }
    }
  } else if (order.order_type === "pickup") {
    mainText = "Самовывоз";
    if (order.client_name || order.client_phone) {
      secondaryText = [order.client_name, order.client_phone].filter(Boolean).join(", ");
    }
  } else {
    mainText = "Доставка";
    secondaryText = order.delivery_address;
  }

  let cardStyle = "bg-white border-slate-200";
  if (isOldReady) {
    cardStyle = "bg-red-100 border-red-500 border-2 shadow-lg animate-pulse";
  } else if (isStaleInProgress) {
    cardStyle = "bg-orange-50 border-orange-300 shadow-sm";
  } else if (order.status === "ready" || statusConfig.isFinishStage) {
    cardStyle = "bg-amber-50 border-amber-300 shadow-sm";
  } else if (order.status === "new" || statusConfig.isFirstStage) {
    cardStyle = "bg-blue-50/60 border-blue-200";
  } else if (isTableMissing) {
    cardStyle = "bg-yellow-50 border-yellow-300";
  } else if (isFavorite && order.order_type === "hall") {
    cardStyle = "bg-yellow-50/40 border-yellow-200";
  }

  // Determine if action button should be shown
  const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus);
  const isServeStep = statusConfig.nextStatus === "served" || statusConfig.isFinishStage;
  const actionDisabled = updateStatusMutation.isPending || (disableServe && isServeStep);

  // Button styling based on status
  let ctaClass = "bg-indigo-600 hover:bg-indigo-700";
  if (order.status === "ready" || statusConfig.isFinishStage) {
    ctaClass = "bg-green-600 hover:bg-green-700 ring-2 ring-green-400 ring-offset-1";
  } else if (order.status === "new" || statusConfig.isFirstStage) {
    ctaClass = "bg-blue-600 hover:bg-blue-700";
  }

  // Badge styling — use stage color if available
  const badgeStyle = statusConfig.color ? {
    backgroundColor: `${statusConfig.color}20`, // 20 = ~12% opacity in hex
    borderColor: statusConfig.color,
    color: statusConfig.color,
  } : undefined;

  // D1: Get guest info (NOT for kitchen) - P0-1: Use normalized guestId
  const guest = guestId && guestsMap ? guestsMap[guestId] : null;

  return (
    <Card 
      className={`mb-3 overflow-hidden relative ${cardStyle} border-l-0 rounded-l-md cursor-pointer`}
      onClick={handleCardClick} // P0-3: toggle items on click
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${typeConfig.stripeClass}`} />
      <CardContent className="p-3 pl-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 mr-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isTableMissing && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
              <span className={`font-bold text-base text-slate-900 ${isTableMissing ? "text-yellow-700" : ""}`}>
                {mainText}
              </span>
              
              {/* D1-003: Order number badge (gray) - NOT for kitchen */}
              {!isKitchen && order.order_number && (
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {order.order_number}
                </span>
              )}
              
              <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 gap-0.5 ${typeConfig.badgeClass}`}>
                <TypeIcon className="w-3 h-3" />
                {typeConfig.label}
              </Badge>
              {/* v2.7.0: Updated to use new signature */}
              {order.order_type === "hall" && tableId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite('table', tableId);
                  }}
                  className="p-1.5 -m-1 active:scale-90"
                  aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
                >
                  <Star className={`w-4 h-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                </button>
              )}
            </div>
            
            {/* D1-004: Guest name badge (blue) - NOT for kitchen */}
            {!isKitchen && guest && (
              <span className="inline-block mt-1 text-sm bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                {getGuestDisplayName(guest)}
              </span>
            )}
            
            {secondaryText && <div className="text-xs text-slate-500 truncate mt-0.5">{secondaryText}</div>}
          </div>
          <div className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1 bg-white/60 px-1.5 py-0.5 rounded border border-slate-100">
            {isNotified && <Sparkles className="w-3 h-3 text-orange-500 animate-pulse" />}
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
        </div>

        {/* P0-3: Items section - only show when expanded */}
        <div className="mb-3 space-y-1">
          {itemsOpen ? (
            items ? (
              <React.Fragment>
                {items.slice(0, 5).map((item, idx) => (
                  <div key={item.id || idx} className="text-sm text-slate-800">
                    <span className="font-semibold mr-1">{item.quantity}×</span>
                    {item.dish_name}
                  </div>
                ))}
                {items.length > 5 && <div className="text-xs text-slate-400 italic">… ещё {items.length - 5}</div>}
              </React.Fragment>
            ) : (
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Загрузка
              </div>
            )
          ) : (
            <div className="text-xs text-slate-400">
              Нажмите чтобы показать позиции
            </div>
          )}
        </div>

        {displayComment && (
          <div className="mb-3 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">
            <span className="font-semibold">Комментарий:</span> {displayComment}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
          <Badge 
            variant="outline" 
            className={`text-xs px-2 py-0.5 ${statusConfig.badgeClass || ''}`}
            style={badgeStyle}
          >
            {statusConfig.label}
          </Badge>
          
          <div className="flex items-center gap-2">
            {/* D1-007: Close table button - NOT for kitchen, P0-1: use normalized tableSessionId */}
            {!isKitchen && order.order_type === "hall" && tableSessionId && onCloseTable && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation(); // P0-3: prevent card toggle
                  onCloseTable(tableSessionId, tableData?.name || 'стол');
                }}
                className="h-8 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-3 w-3 mr-1" />
                Закрыть стол
              </Button>
            )}
            
            {showActionButton && statusConfig.actionLabel && (
              <Button
                onClick={handleAction}
                disabled={actionDisabled}
                className={`text-white font-medium px-4 h-9 min-w-[100px] ${ctaClass}`}
              >
                {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : statusConfig.actionLabel}
              </Button>
            )}
          </div>
        </div>

        {disableServe && isServeStep && (
          <div className="text-[10px] text-slate-400 mt-1">Кухня не отмечает «Выдано»</div>
        )}
      </CardContent>
    </Card>
  );
}

// V2.0 Sprint A + Sprint B: Compact OrderGroupCard — color borders, status badge, one CTA
// Sprint B: card body tap opens TableDetailScreen; CTA tap executes action inline
function OrderGroupCard({
  group,
  onCardBodyTap,   // V2-03: Sprint B — tap anywhere on card body to open detail view
  isHighlighted,   // V2-09: Sprint D — brief highlight after banner navigate
  isFavorite,
  onToggleFavorite,
  getStatusConfig,
  guestsMap,
  effectiveUserId,
  onMutate,
  onCloseTable,
  notifiedOrderIds,
  onClearNotified,
  tableMap,
  overdueMinutes,
  onCloseAllOrders,
  activeRequests,
}) {
  const queryClient = useQueryClient();

  // V2-05: Compute table-level status
  const tableStatus = computeTableStatus(group, activeRequests, getStatusConfig);
  const style = TABLE_STATUS_STYLES[tableStatus] || TABLE_STATUS_STYLES.PREPARING;
  const isPreparing = tableStatus === 'PREPARING';

  // Table name + zone display (V2-01)
  const tableId = group.type === 'table' ? group.id : null;
  const tableData = tableId ? tableMap[tableId] : null;
  const zoneName = tableData?.zone_name;
  const displayTitle = zoneName
    ? `${group.displayName} \u2014 ${zoneName}`
    : group.displayName;

  // Guest count (unique guest IDs across all orders in group)
  const uniqueGuestCount = useMemo(() => {
    const ids = new Set(group.orders.map(o => getLinkId(o.guest)).filter(Boolean));
    return ids.size || group.orders.length;
  }, [group.orders]);
  const orderCount = group.orders.length;

  // Elapsed time since oldest order (V2-01)
  const elapsedLabel = useMemo(() => {
    if (!group.orders.length) return '';
    const oldest = Math.min(...group.orders.map(o => safeParseDate(o.created_date).getTime()));
    const minutes = Math.floor((Date.now() - oldest) / 60000);
    if (minutes < 60) return `${minutes}м`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}ч ${m}м` : `${h}ч`;
  }, [group.orders]);

  // V2-08: Compute primary CTA (one per card)
  const cta = useMemo(
    () => computeGroupCTA(group, tableStatus, getStatusConfig, guestsMap),
    [group, tableStatus, getStatusConfig, guestsMap]
  );

  // Mutation for advancing order status
  const advanceMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
    onMutate: async ({ id, payload }) => {
      if (onMutate) onMutate(id, payload.status || payload.stage_id);
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const prev = queryClient.getQueriesData({ queryKey: ['orders'] });
      queryClient.setQueriesData({ queryKey: ['orders'] }, old =>
        Array.isArray(old) ? old.map(o => (o.id === id ? { ...o, ...payload } : o)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const handleCTA = (e) => {
    e.stopPropagation();
    if (!cta || advanceMutation.isPending) return;

    // BUG-S65-04 fix: first-stage orders open detail view instead of blind accept
    if (cta.type === 'advance_order' && cta.config?.isFirstStage && onCardBodyTap) {
      onCardBodyTap();
      return;
    }

    if (cta.type === 'close_table') {
      // Prefer session-close (onCloseTable) over finish-stage-only (onCloseAllOrders)
      if (onCloseTable && group.type === 'table') {
        const sessionId = group.orders.length > 0 ? getLinkId(group.orders[0].table_session) : null;
        if (sessionId) {
          onCloseTable(sessionId, group.displayName);
          return;
        }
      }
      if (onCloseAllOrders) onCloseAllOrders(group.orders);
      return;
    }

    if (cta.type === 'advance_order' && cta.orderId && cta.config) {
      const payload = {};
      if (cta.config.nextStageId) payload.stage_id = cta.config.nextStageId;
      else if (cta.config.nextStatus) payload.status = cta.config.nextStatus;

      // Auto-assign waiter on first action (V2-08)
      if (cta.config.isFirstStage && effectiveUserId) {
        const targetOrder = group.orders.find(o => o.id === cta.orderId);
        if (targetOrder && !getAssigneeId(targetOrder)) {
          payload.assignee = effectiveUserId;
          payload.assigned_at = new Date().toISOString();
        }
      }

      if (onClearNotified) onClearNotified(cta.orderId);
      advanceMutation.mutate({ id: cta.orderId, payload });
    }
  };

  // Russian pluralization helpers
  const guestCountLabel = (() => {
    if (uniqueGuestCount === 1) return '1 гость';
    if (uniqueGuestCount < 5) return `${uniqueGuestCount} гостя`;
    return `${uniqueGuestCount} гостей`;
  })();
  const orderCountLabel = (() => {
    if (orderCount === 1) return '1 заказ';
    if (orderCount < 5) return `${orderCount} заказа`;
    return `${orderCount} заказов`;
  })();

  // V2-09: Highlight ring class for banner-navigate
  const highlightRing = isHighlighted ? 'ring-2 ring-indigo-400 ring-offset-1' : '';

  return (
    <div
      data-group-id={group.id}
      className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-shadow duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}
    >
      {/* V2-03: Card body area — tap opens detail view */}
      <div
        className={`px-4 pt-3 pb-3 ${onCardBodyTap ? 'cursor-pointer active:opacity-80' : ''}`}
        onClick={onCardBodyTap}
        role={onCardBodyTap ? 'button' : undefined}
        aria-label={onCardBodyTap ? `Открыть детали: ${displayTitle}` : undefined}
      >
        {/* Row 1: Table title + elapsed time + status badge (V2-01, V2-05) */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className={`font-bold text-base leading-tight flex-1 min-w-0 ${isPreparing ? 'text-slate-500' : 'text-slate-900'}`}>
            {displayTitle}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-xs font-medium ${isPreparing ? 'text-slate-400' : 'text-slate-600'}`}>
              {elapsedLabel}
            </span>
            {/* V2-05: Status badge chip */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${style.badgeClass}`}>
              {style.label}
            </span>
          </div>
        </div>

        {/* Row 2: Guest count + order count (V2-01) */}
        <p className={`text-sm ${isPreparing ? 'text-slate-400' : 'text-slate-600'}`}>
          {guestCountLabel}, {orderCountLabel}
        </p>

        {/* V2-03: Hint arrow for detail view tap */}
        {onCardBodyTap && !isPreparing && (
          <div className="flex items-center justify-end mt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              подробнее <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </div>

      {/* V2-10: Primary CTA — full width, min 52px (BUG-S66-02: show for PREPARING too) */}
      {cta && (
        <button
          type="button"
          onClick={handleCTA}
          disabled={advanceMutation.isPending}
          className={`w-full min-h-[52px] flex items-center justify-center font-semibold text-sm transition-all active:scale-[0.99] disabled:opacity-60 ${style.ctaBgClass}`}
        >
          {advanceMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : cta.label
          }
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPRINT B: Detail View sub-components
   V2-02: DetailOrderRow, GuestOrderSection, TableDetailScreen
═══════════════════════════════════════════════════════════════════════════ */

// V2-02: Single order row in detail view — auto-fetches items on mount
function DetailOrderRow({ order, getStatusConfig }) {
  const { data: items } = useQuery({
    queryKey: ['orderItems', order.id],
    queryFn: () => base44.entities.OrderItem.filter({ order: order.id }),
    staleTime: 30000,
    retry: shouldRetry,
    // No enabled guard — auto-fetch when detail view opens
  });

  const statusConfig = getStatusConfig(order);
  const badgeStyle = statusConfig.color ? {
    backgroundColor: `${statusConfig.color}20`,
    borderColor: statusConfig.color,
    color: statusConfig.color,
  } : undefined;

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500">
          Заказ {order.order_number ? `#${order.order_number}` : `…${order.id.slice(-4)}`}
        </span>
        <Badge
          variant="outline"
          className={`text-[9px] px-1.5 py-0 h-5 ${statusConfig.badgeClass || ''}`}
          style={badgeStyle}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Items list */}
      {items ? (
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="flex justify-between text-sm text-slate-800">
              <span className="flex-1 min-w-0 mr-2 truncate">{item.dish_name}</span>
              <span className="font-semibold text-slate-600 shrink-0">×{item.quantity}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-xs text-slate-400 italic">Нет позиций</div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Загрузка позиций
        </div>
      )}

      {/* Order comment */}
      {order.comment && (
        <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">
          <span className="font-semibold">Комментарий:</span> {order.comment}
        </div>
      )}
    </div>
  );
}

// V2-02: Per-guest section in detail view with orders + primary action button (48px min, full-width)
function GuestOrderSection({ guestLabel, orders, getStatusConfig, effectiveUserId, onMutate, onClearNotified }) {
  const queryClient = useQueryClient();

  // Sort: new/first-stage orders first, then oldest
  const sortedOrders = useMemo(() => {
    return [...orders].filter(o => o.status !== 'cancelled').sort((a, b) => {
      const aFirst = getStatusConfig(a).isFirstStage ? 0 : 1;
      const bFirst = getStatusConfig(b).isFirstStage ? 0 : 1;
      if (aFirst !== bFirst) return aFirst - bFirst;
      return safeParseDate(a.created_date).getTime() - safeParseDate(b.created_date).getTime();
    });
  }, [orders, getStatusConfig]);

  // Determine primary action for this guest's orders
  const primaryAction = useMemo(() => {
    // First: check for new/first-stage orders
    const newOrders = sortedOrders.filter(o => getStatusConfig(o).isFirstStage);
    if (newOrders.length > 0) {
      const target = newOrders[0];
      const config = getStatusConfig(target);
      return { order: target, config, label: config.actionLabel || 'Принять' };
    }
    // Then: check for ready/finish-stage orders
    const readyOrders = sortedOrders.filter(o => getStatusConfig(o).isFinishStage);
    if (readyOrders.length > 0) {
      const target = readyOrders[0];
      const config = getStatusConfig(target);
      return { order: target, config, label: config.actionLabel || 'Выдать' };
    }
    return null;
  }, [sortedOrders, getStatusConfig]);

  // Mutation for advancing order status
  const advanceMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.Order.update(id, payload),
    onMutate: async ({ id, payload }) => {
      if (onMutate) onMutate(id, payload.status || payload.stage_id);
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const prev = queryClient.getQueriesData({ queryKey: ['orders'] });
      queryClient.setQueriesData({ queryKey: ['orders'] }, old =>
        Array.isArray(old) ? old.map(o => (o.id === id ? { ...o, ...payload } : o)) : old
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const handleAction = () => {
    if (!primaryAction || advanceMutation.isPending) return;
    const { order, config } = primaryAction;
    const payload = {};
    if (config.nextStageId) payload.stage_id = config.nextStageId;
    else if (config.nextStatus) payload.status = config.nextStatus;
    // Auto-assign on first stage
    if (config.isFirstStage && effectiveUserId && !getAssigneeId(order)) {
      payload.assignee = effectiveUserId;
      payload.assigned_at = new Date().toISOString();
    }
    if (onClearNotified) onClearNotified(order.id);
    advanceMutation.mutate({ id: order.id, payload });
  };

  // Determine button color based on action type
  const actionBtnClass = primaryAction
    ? (getStatusConfig(primaryAction.order).isFirstStage
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-amber-600 hover:bg-amber-700 text-white')
    : '';

  if (sortedOrders.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Guest header */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-700">{guestLabel}</span>
      </div>

      {/* Orders list */}
      <div className="divide-y divide-slate-100">
        {sortedOrders.map(order => (
          <DetailOrderRow
            key={order.id}
            order={order}
            getStatusConfig={getStatusConfig}
          />
        ))}
      </div>

      {/* V2-05 Q5: Primary action button — 48px min, full-width */}
      {primaryAction && (
        <div className="p-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleAction}
            disabled={advanceMutation.isPending}
            className={`w-full min-h-[48px] flex items-center justify-center font-semibold text-sm rounded-lg transition-all active:scale-[0.99] disabled:opacity-60 ${actionBtnClass}`}
          >
            {advanceMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : primaryAction.label
            }
          </button>
        </div>
      )}
    </div>
  );
}

// V2-02: Full-screen table detail view
// V2-03: Split-tap destination — CTA stays in list, card body opens this
// BUG-S66-01 fix: removed translate-x animation (caused rendering issues in Base44 platform)
function TableDetailScreen({
  group,
  tableStatus,
  onClose,
  getStatusConfig,
  guestsMap,
  effectiveUserId,
  onMutate,
  onCloseTable,
  onClearNotified,
  tableMap,
  onCloseAllOrders,
  activeRequests,
}) {

  // Swipe-right to close (back gesture)
  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartRef.current.y);
    // Swipe right > 80px with mostly horizontal motion
    if (dx > 80 && dy < 60) onClose();
    touchStartRef.current = null;
  };

  // Table display info
  const tableId = group.type === 'table' ? group.id : null;
  const tableData = tableId ? tableMap[tableId] : null;
  const zoneName = tableData?.zone_name;
  const displayTitle = zoneName ? `${group.displayName} — ${zoneName}` : group.displayName;

  // Style based on table status
  const style = TABLE_STATUS_STYLES[tableStatus] || TABLE_STATUS_STYLES.PREPARING;

  // Elapsed time since oldest order
  const elapsedLabel = useMemo(() => {
    if (!group.orders.length) return '';
    const oldest = Math.min(...group.orders.map(o => safeParseDate(o.created_date).getTime()));
    const minutes = Math.floor((Date.now() - oldest) / 60000);
    if (minutes < 60) return `${minutes} мин`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}ч ${m}м` : `${h}ч`;
  }, [group.orders]);

  // Group orders by guest ID
  const ordersByGuest = useMemo(() => {
    const byGuest = new Map(); // guestId → orders[]
    const noGuest = [];
    group.orders.forEach(o => {
      const guestId = getLinkId(o.guest);
      if (guestId) {
        if (!byGuest.has(guestId)) byGuest.set(guestId, []);
        byGuest.get(guestId).push(o);
      } else {
        noGuest.push(o);
      }
    });
    return { byGuest, noGuest };
  }, [group.orders]);

  // Table notes: get from first order comment (if it's a table note, not an order comment)
  const tableNotes = useMemo(() => {
    // Look for a comment in any order that starts with "Стол:" or is a general note
    for (const o of group.orders) {
      if (o.comment && o.comment.startsWith('Стол:')) {
        const lines = o.comment.split('\n');
        const note = lines.slice(1).join('\n').trim();
        if (note) return note;
      }
    }
    return null;
  }, [group.orders]);

  // Close table handler — same logic as list CTA
  // Note: named isTableClosable (not canCloseTable) to distinguish from the role-check in parent component
  const isTableClosable = (tableStatus === 'ALL_SERVED' || tableStatus === 'BILL_REQUESTED') && onCloseTable;
  const handleCloseTableClick = () => {
    if (onCloseTable && group.type === 'table') {
      const sessionId = group.orders.length > 0 ? getLinkId(group.orders[0].table_session) : null;
      if (sessionId) {
        onCloseTable(sessionId, group.displayName);
        return;
      }
    }
    if (onCloseAllOrders) onCloseAllOrders(group.orders);
  };

  // Guest label helper (numbered within this table)
  const guestLabelForId = (guestId, index) => {
    const guest = guestId && guestsMap ? guestsMap[guestId] : null;
    if (guest) return getGuestDisplayName(guest);
    return `Гость ${index + 1}`;
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-slate-100 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Sticky header */}
      <div className="bg-white border-b shrink-0 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className={`px-4 pt-3 pb-3 ${style.borderClass}`}>
            <div className="flex items-center gap-2">
              {/* Back button — 44px min touch target */}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 bg-white active:scale-95 shrink-0"
                aria-label="Назад"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-lg text-slate-900 leading-tight truncate">{displayTitle}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badgeClass}`}>
                    {style.label}
                  </span>
                  {elapsedLabel && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {elapsedLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content — flex-1 fills remaining height after header */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Table notes (if any) */}
        {tableNotes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
            <span className="font-semibold">Заметка: </span>{tableNotes}
          </div>
        )}

        {/* Guest sections — each guest's orders + action button */}
        {Array.from(ordersByGuest.byGuest.entries()).map(([guestId, orders], index) => (
          <GuestOrderSection
            key={guestId}
            guestLabel={guestLabelForId(guestId, index)}
            orders={orders}
            getStatusConfig={getStatusConfig}
            effectiveUserId={effectiveUserId}
            onMutate={onMutate}
            onClearNotified={onClearNotified}
          />
        ))}

        {/* Orders without guest assignment */}
        {ordersByGuest.noGuest.length > 0 && (
          <GuestOrderSection
            key="__no_guest__"
            guestLabel="Заказ (гость не определён)"
            orders={ordersByGuest.noGuest}
            getStatusConfig={getStatusConfig}
            effectiveUserId={effectiveUserId}
            onMutate={onMutate}
            onClearNotified={onClearNotified}
          />
        )}

        {/* Empty state */}
        {group.orders.filter(o => o.status !== 'cancelled').length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">Нет активных позиций</div>
        )}

        {/* Table actions section */}
        <div className="border-t border-slate-200 pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Действия со столом</p>
          <button
            type="button"
            onClick={handleCloseTableClick}
            disabled={!isTableClosable}
            className={`w-full min-h-[48px] flex items-center justify-center gap-2 font-semibold text-sm rounded-lg border transition-all active:scale-[0.99] ${
              isTableClosable
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <X className="w-4 h-4" />
            {isTableClosable ? 'Закрыть стол' : 'Закрыть стол (не все готово)'}
          </button>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-6" />
      </div>
      </div>
    </div>
  );
}

function MyTablesModal({ open, onClose, tables, favorites, onToggleFavorite, onClearAll }) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const filteredTables = tables.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (t.name && t.name.toLowerCase().includes(q)) || (t.zone_name && t.zone_name.toLowerCase().includes(q));
  });

  const sortedTables = [...filteredTables].sort((a, b) => {
    const aId = getLinkId(a.id);
    const bId = getLinkId(b.id);
    const aFav = aId && favorites.includes(`table:${aId}`);
    const bFav = bId && favorites.includes(`table:${bId}`);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
      <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            <span className="font-bold text-slate-900">Мои столы</span>
            <span className="text-sm text-slate-500">({favorites.length})</span>
          </div>
          <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по номеру или зоне…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sortedTables.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {search ? "Ничего не найдено" : "Нет столов"}
            </div>
          ) : (
            sortedTables.map((table) => {
              const tId = getLinkId(table.id);
              const isFav = tId && favorites.includes(`table:${tId}`);
              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => tId && onToggleFavorite('table', tId)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isFav ? "bg-yellow-50 border-yellow-200" : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Star className={`w-5 h-5 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} />
                    <div className="text-left">
                      <div className="font-medium text-slate-900">Стол {table.name}</div>
                      {table.zone_name && <div className="text-xs text-slate-500">{table.zone_name}</div>}
                    </div>
                  </div>
                  {isFav && <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded">Мой</span>}
                </button>
              );
            })
          )}
        </div>

        {favorites.length > 0 && (
          <div className="p-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить мои столы ({favorites.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSheet({ 
  open, 
  onClose, 
  staffName, 
  staffRole, 
  partnerName, 
  isKitchen,
  favoritesCount,
  onOpenMyTables,
  onLogout,
}) {
  const [helpExpanded, setHelpExpanded] = useState(false);

  if (!open) return null;

  const roleLabel = ROLE_LABELS[staffRole] || staffRole || "Сотрудник";

  const waiterHelpItems = [
    "«Мои» — заказы, которые вы взяли в работу",
    "«Свободные» — новые заказы, возьмите любой",
    "«Принять» — взять заказ себе",
    "«Выдать» — когда отдали заказ гостю",
    "⭐ — отметьте свои столы для быстрого доступа",
  ];

  const kitchenHelpItems = [
    "Здесь только заказы, переданные на кухню",
    "«Готово» — блюдо готово, официант заберёт",
    "Запросы гостей (счёт, салфетки) вам не показываются",
    "Заказы со статусом «Новый» вам не видны",
  ];

  const helpItems = isKitchen ? kitchenHelpItems : waiterHelpItems;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Закрыть" />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-lg text-slate-900">{staffName || "Сотрудник"}</div>
                <div className="text-sm text-slate-500">
                  {roleLabel} · {partnerName || "Ресторан"}
                </div>
              </div>
            </div>
            <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* My Tables (only for non-kitchen) */}
          {!isKitchen && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMyTables();
              }}
              className="w-full flex items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className={`w-5 h-5 ${favoritesCount > 0 ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
                <span className="font-medium text-slate-900">Мои столы</span>
                {favoritesCount > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* Help Section */}
          <div className="border-b border-slate-100">
            <button
              type="button"
              onClick={() => setHelpExpanded(!helpExpanded)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-slate-900">Как работать</span>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${helpExpanded ? "rotate-180" : ""}`} />
            </button>
            
            {helpExpanded && (
              <div className="px-4 pb-4">
                <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                  {helpItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={onLogout}
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ 
  open, 
  onClose, 
  pollingInterval, 
  onChangePollingInterval, 
  sortMode, 
  onChangeSortMode,
  selectedTypes,
  onToggleChannel,
  channelCounts,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" className="absolute inset-0 bg-black/30" onClick={onClose} aria-label="Закрыть" />
      <div className="absolute inset-x-0 bottom-0 max-h-[80vh] bg-white rounded-t-2xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <span className="font-bold text-slate-900">Настройки</span>
          <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Channels */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Каналы заказов</div>
            <div className="flex gap-2">
              <IconToggle 
                icon={Utensils} 
                label="Зал" 
                count={channelCounts.hall} 
                selected={selectedTypes.includes("hall")} 
                onClick={() => onToggleChannel("hall")} 
                tone="indigo" 
              />
              <IconToggle 
                icon={ShoppingBag} 
                label="Самовыв" 
                count={channelCounts.pickup} 
                selected={selectedTypes.includes("pickup")} 
                onClick={() => onToggleChannel("pickup")} 
                tone="fuchsia" 
              />
              <IconToggle 
                icon={Truck} 
                label="Доставка" 
                count={channelCounts.delivery} 
                selected={selectedTypes.includes("delivery")} 
                onClick={() => onToggleChannel("delivery")} 
                tone="teal" 
              />
            </div>
          </div>

          {/* Polling */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Автообновление</div>
            <div className="grid grid-cols-5 gap-2">
              {POLLING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangePollingInterval(opt.value)}
                  className={`py-2 px-1 text-sm rounded-lg border transition-all ${
                    pollingInterval === opt.value
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Mode */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Сортировка</div>
            <div className="space-y-2">
              <label 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  sortMode === "priority" 
                    ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => onChangeSortMode("priority")}
              >
                <input 
                  type="radio" 
                  name="sortMode" 
                  checked={sortMode === "priority"} 
                  onChange={() => onChangeSortMode("priority")}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">По приоритету</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Готов → Новый → Готовится → Принят
                  </div>
                </div>
              </label>
              
              <label 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  sortMode === "time" 
                    ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200" 
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => onChangeSortMode("time")}
              >
                <input 
                  type="radio" 
                  name="sortMode" 
                  checked={sortMode === "time"} 
                  onChange={() => onChangeSortMode("time")}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900">По времени</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Используйте ↑↓ для переключения направления
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SPRINT D: V2-09 Banner Notification Component
═══════════════════════════════════════════════════════════════════════════ */

/**
 * BannerNotification — in-app overlay banner for new order events.
 * Fixed at top of viewport, z-60 (above sticky header z-20, detail view z-30, modals z-40).
 * Auto-hides after 5s. Swipe-up or tap X to dismiss. Tap body → navigate to relevant group.
 * Non-blocking: pointer-events only on the banner itself, not full-screen overlay.
 *
 * Props:
 *   banner: { id, text, groupId, count } | null
 *   onDismiss: () => void
 *   onNavigate: (groupId) => void
 */
function BannerNotification({ banner, onDismiss, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const touchStartY = useRef(null);
  const autoHideTimer = useRef(null);
  const dismissAnimTimer = useRef(null);

  // Clear all pending timers
  const clearTimers = useCallback(() => {
    if (autoHideTimer.current) { clearTimeout(autoHideTimer.current); autoHideTimer.current = null; }
    if (dismissAnimTimer.current) { clearTimeout(dismissAnimTimer.current); dismissAnimTimer.current = null; }
  }, []);

  // Animate in on mount / new banner
  useEffect(() => {
    if (!banner) {
      setVisible(false);
      setDismissing(false);
      return;
    }
    setDismissing(false);
    // Small delay to trigger CSS transition
    const raf = requestAnimationFrame(() => setVisible(true));
    // Auto-hide after 5s
    autoHideTimer.current = setTimeout(() => {
      setDismissing(true);
      dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
    }, 5000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimers();
    };
  }, [banner?.id]);

  const handleDismiss = useCallback(() => {
    clearTimers();
    setDismissing(true);
    dismissAnimTimer.current = setTimeout(() => onDismiss(), 300);
  }, [onDismiss, clearTimers]);

  const handleTap = useCallback(() => {
    clearTimers();
    if (banner?.groupId) {
      onNavigate(banner.groupId);
    }
    setDismissing(true);
    dismissAnimTimer.current = setTimeout(() => onDismiss(), 200);
  }, [banner, onNavigate, onDismiss, clearTimers]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartY.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    // Swipe up to dismiss (threshold: 30px)
    if (deltaY < -30) handleDismiss();
  }, [handleDismiss]);

  if (!banner) return null;

  const translateClass = visible && !dismissing
    ? 'translate-y-0 opacity-100'
    : '-translate-y-full opacity-0';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] flex justify-center px-3 pt-2 transition-all duration-300 ease-out ${translateClass}`}
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="w-full max-w-md bg-indigo-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
        style={{ pointerEvents: 'auto' }}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="alert"
        aria-live="assertive"
      >
        <Bell className="w-5 h-5 shrink-0" />
        <span className="flex-1 text-sm font-medium leading-tight">{banner.text}</span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export default function StaffOrdersMobile() {
  const queryClient = useQueryClient();

  const [urlParams] = useState(() => new URLSearchParams(window.location.search));
  const token = urlParams.get("token");
  const isTokenMode = !!token;

  const deviceId = useMemo(() => getOrCreateDeviceId(), []);
  const didBindRef = useRef(false);
  const didUpdateLastActiveRef = useRef(false);
  const didAutoBindRef = useRef(false);
  
  // P0-4: Ref to track loaded guest IDs (prevents re-fetching on each poll)
  const loadedGuestIdsRef = useRef(new Set());

  const [rateLimitHit, setRateLimitHit] = useState(false);

  const [toastMsg, setToastMsg] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(null), 1400);
  };
  useEffect(() => () => toastTimerRef.current && clearTimeout(toastTimerRef.current), []);

  const [selectedTypes, setSelectedTypes] = useState(() => [...ALL_CHANNELS]);
  const [assignFilters, setAssignFilters] = useState(() => [...ALL_ASSIGN_FILTERS]);
  
  const [sortMode, setSortMode] = useState(() => loadSortMode());
  const [sortOrder, setSortOrder] = useState(() => loadSortOrder());
  
  const [manualRefreshTs, setManualRefreshTs] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(() => loadPollingInterval());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // D1-005: State for batch-loaded guests
  const [guestsMap, setGuestsMap] = useState({});

  const handleChangePollingInterval = (val) => {
    setPollingInterval(val);
    savePollingInterval(val);
    showToast(val === 0 ? "Ручное обновление" : `Авто ${val / 1000}с`);
  };

  const handleChangeSortMode = (mode) => {
    setSortMode(mode);
    saveSortMode(mode);
    showToast(mode === "priority" ? "По приоритету" : "По времени");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      const next = prev === "newest" ? "oldest" : "newest";
      saveSortOrder(next);
      showToast(next === "newest" ? "Сначала новые" : "Сначала старые");
      return next;
    });
  };

  const lastFilterChangeRef = useRef(0);

  const [notifPrefs, setNotifPrefs] = useState(() => loadNotifPrefs());
  const [notifDot, setNotifDot] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const [notifiedOrderIds, setNotifiedOrderIds] = useState(() => new Set());

  // V2-09: Sprint D — Banner notification state
  const [bannerData, setBannerData] = useState(null);
  const bannerIdCounter = useRef(0);

  // v3.6.0: Close table confirmation dialog state
  const [closeTableConfirm, setCloseTableConfirm] = useState(null); // { sessionId, tableName } | null

  const updateNotifPrefs = (patch) => {
    setNotifPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveNotifPrefs(next);
      return next;
    });
  };

  const audioRef = useRef(null);
  const audioUnlockedRef = useRef(false);
  useEffect(() => {
    audioRef.current = createBeep();
  }, []);
  const unlockAudio = async () => {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    if (audioRef.current?.resume) await audioRef.current.resume();
  };
  useEffect(() => {
    const h = () => {
      unlockAudio();
      window.removeEventListener("pointerdown", h);
    };
    window.addEventListener("pointerdown", h, { passive: true });
    return () => window.removeEventListener("pointerdown", h);
  }, []);

  // SESS-016: Auto-expire stale sessions (runs every 5 min while page is open)
  useEffect(() => {
    const cleanup = async () => {
      try {
        const result = await runSessionCleanup({ dryRun: false });
        if (result.expired > 0 || result.skipped_stale > 0 || result.errors.length > 0) {
          console.log('[SessionCleanup]', result);
        }
      } catch (err) {
        console.log('[SessionCleanup] error:', err.message);
      }
    };
    cleanup();
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const ownMutationRef = useRef(null);
  const trackOwnMutation = (orderId, nextStatus) => {
    ownMutationRef.current = { orderId, nextStatus, ts: Date.now() };
  };

  const { data: links, isLoading: loadingToken, error: linkError } = useQuery({
    queryKey: ["staffLink", token],
    queryFn: () => base44.entities.StaffAccessLink.filter({ token }),
    enabled: !!token,
    retry: shouldRetry,
  });

  useEffect(() => {
    if (linkError && isRateLimitError(linkError)) {
      queryClient.cancelQueries();
      setRateLimitHit(true);
    }
  }, [linkError]);

  const link = links?.[0];

  const { data: currentUser, isLoading: loadingUser, error: userError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: shouldRetry,
    enabled: !isTokenMode || (!!link && CABINET_ACCESS_ROLES.includes(link.staff_role) && !link.invited_user && !!link.invite_email),
  });

  useEffect(() => {
    if (userError && isRateLimitError(userError)) {
      queryClient.cancelQueries();
      setRateLimitHit(true);
    }
  }, [userError]);

  // P0-5: Safe currentUserId with fallback chain
  const currentUserId = currentUser?.id ?? currentUser?._id ?? currentUser?.user_id ?? null;

  const effectiveUserId = useMemo(() => {
    if (isTokenMode && link?.id) return link.id;
    if (currentUserId) return currentUserId;
    return null;
  }, [isTokenMode, link?.id, currentUserId]);

  const userOrTokenId = useMemo(() => {
    if (isTokenMode && link?.id) return `token_${link.id}`;
    if (currentUserId) return `user_${currentUserId}`;
    // P0-5: Fallback to email for localStorage key if no id
    if (currentUser?.email) return `email_${currentUser.email}`;
    return "anon";
  }, [isTokenMode, link?.id, currentUserId, currentUser?.email]);

  const [favorites, setFavorites] = useState([]);
  const [myTablesOpen, setMyTablesOpen] = useState(false);
  const favoritesInitializedRef = useRef(false);

  // v2.7.0: Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // v2.7.1: Tabs and favorites filter state
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // V2-02: Sprint B — Table detail view state
  const [detailGroupId, setDetailGroupId] = useState(null); // ID of group open in detail view
  const listScrollRef = useRef(0); // Saved scroll position for returning from detail
  const lastDetailGroupRef = useRef(null); // Last known group — prevents flash-unmount during polling

  useEffect(() => {
    if (favoritesInitializedRef.current) return;
    if (userOrTokenId === "anon") return;
    
    // v2.7.0: Helper to normalize favorites array with prefix migration
    const normalizeFavorites = (arr) => 
      (arr || []).map(item => {
        const id = getLinkId(item);
        if (!id) return null;
        if (!id.includes(':')) return `table:${id}`; // migrate old format
        return id;
      }).filter(Boolean);
    
    if (isTokenMode && link) {
      favoritesInitializedRef.current = true;
      if (Array.isArray(link.favorite_tables) && link.favorite_tables.length > 0) {
        setFavorites(normalizeFavorites(link.favorite_tables));
      } else {
        setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
      }
    } else if (!isTokenMode && currentUser) {
      favoritesInitializedRef.current = true;
      setFavorites(normalizeFavorites(loadMyTables(userOrTokenId)));
    }
  }, [userOrTokenId, isTokenMode, link, currentUser]);

  const updateLinkMutation = useMutation({
    mutationFn: ({ id, payload }) => base44.entities.StaffAccessLink.update(id, payload),
    onSuccess: (_data, vars) => {
      const keys = Object.keys(vars?.payload || {});
      const needRefetch = keys.includes("bound_device_id") || 
                          keys.includes("is_active") ||
                          keys.includes("favorite_tables") ||
                          keys.includes("invited_user");
      if (needRefetch) {
        queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
      }
    },
    onError: (err) => {
      if (isRateLimitError(err)) {
        queryClient.cancelQueries();
        setRateLimitHit(true);
      }
    },
  });

  // v2.7.0: Updated signature to (type, id)
  const toggleFavorite = useCallback((type, id) => {
    const normalizedId = getLinkId(id);
    if (!normalizedId) return;
    const key = `${type}:${normalizedId}`;
    
    setFavorites((prev) => {
      const next = prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key];
      
      saveMyTables(userOrTokenId, next);
      
      if (isTokenMode && link?.id) {
        updateLinkMutation.mutate({
          id: link.id,
          payload: { favorite_tables: next },
        });
      }
      
      return next;
    });
  }, [userOrTokenId, isTokenMode, link?.id, updateLinkMutation]);

  // v2.7.0: Helper to check if item is favorite
  const isFavorite = useCallback((type, id) => 
    favorites.includes(`${type}:${id}`), [favorites]);

  const clearAllFavorites = () => {
    setFavorites([]);
    saveMyTables(userOrTokenId, []);
    
    if (isTokenMode && link?.id) {
      updateLinkMutation.mutate({
        id: link.id,
        payload: { favorite_tables: [] },
      });
    }
    
    showToast("Столы очищены");
  };
  
  const clearNotified = (orderId) => {
    setNotifiedOrderIds((prev) => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
  };

  const effectiveRole = isTokenMode ? link?.staff_role : currentUser?.user_role;
  const isKitchen = effectiveRole === "kitchen";
  const staffName = isTokenMode ? link?.staff_name : currentUser?.full_name;

  const tokenState = useMemo(() => {
    if (!isTokenMode) return "no_token";
    if (loadingToken) return "loading_link";
    if (!link || !link.is_active) return "inactive";
    const bound = String(link.bound_device_id || "").trim();
    if (!bound) return "bind_needed";
    if (bound !== deviceId) return "locked";
    return "ok";
  }, [isTokenMode, loadingToken, link, deviceId]);

  useEffect(() => {
    didBindRef.current = false;
  }, [token]);

  useEffect(() => {
    if (!isTokenMode || !link || tokenState !== "bind_needed" || didBindRef.current || rateLimitHit) return;
    didBindRef.current = true;
    updateLinkMutation.mutate({
      id: link.id,
      payload: { bound_device_id: deviceId, bound_at: new Date().toISOString(), last_used_at: new Date().toISOString() },
    });
  }, [isTokenMode, link?.id, tokenState, deviceId, rateLimitHit]);

  const linkIdRef = useRef(null);
  useEffect(() => {
    linkIdRef.current = link?.id || null;
  }, [link?.id]);

  useEffect(() => {
    if (!isTokenMode || tokenState !== "ok" || rateLimitHit) return;
    
    const tick = () => {
      const currentLinkId = linkIdRef.current;
      if (!currentLinkId) return;
      base44.entities.StaffAccessLink.update(currentLinkId, { 
        last_used_at: new Date().toISOString() 
      }).catch((err) => {
        if (isRateLimitError(err)) {
          queryClient.cancelQueries();
          setRateLimitHit(true);
        }
      });
    };
    
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [isTokenMode, tokenState, rateLimitHit, queryClient]);

  useEffect(() => {
    if (didUpdateLastActiveRef.current) return;
    if (!isTokenMode || !link?.id || tokenState !== "ok" || rateLimitHit) return;
    
    didUpdateLastActiveRef.current = true;
    
    base44.entities.StaffAccessLink.update(link.id, {
      last_active_at: new Date().toISOString()
    }).catch((err) => {
      if (isRateLimitError(err)) {
        queryClient.cancelQueries();
        setRateLimitHit(true);
      }
    });
  }, [isTokenMode, link?.id, tokenState, rateLimitHit, queryClient]);

  // P0: Авто-bind для директоров - P0-5: only if currentUserId exists
  useEffect(() => {
    if (!isTokenMode || !link || tokenState !== "ok" || rateLimitHit) return;
    if (!currentUserId || !currentUser?.email) return; // P0-5: check currentUserId, not currentUser?.id
    if (didAutoBindRef.current) return;
    
    if (!CABINET_ACCESS_ROLES.includes(link.staff_role)) return;
    if (link.invited_user) return;
    if (!link.invite_email) return;
    
    const userEmail = currentUser.email.toLowerCase().trim();
    const inviteEmail = link.invite_email.toLowerCase().trim();
    if (userEmail !== inviteEmail) return;
    
    didAutoBindRef.current = true;
    
    base44.entities.StaffAccessLink.update(link.id, {
      invited_user: currentUserId, // P0-5: use currentUserId, not currentUser.id
      invite_accepted_at: new Date().toISOString()
    }).then(() => {
      showToast("Доступ к кабинету активирован");
      queryClient.invalidateQueries({ queryKey: ["staffLink", token] });
    }).catch((err) => {
      if (isRateLimitError(err)) {
        queryClient.cancelQueries();
        setRateLimitHit(true);
      }
    });
  }, [isTokenMode, link, tokenState, currentUser, currentUserId, rateLimitHit, token, queryClient]);

  const handleLogout = () => {
    if (isTokenMode && link?.id) {
      updateLinkMutation.mutate({
        id: link.id,
        payload: { bound_device_id: null, bound_at: null },
      });
    }
    
    clearAllStaffData();
    showToast("Выход выполнен");
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  const gateView = useMemo(() => {
    if (rateLimitHit) {
      return (
        <RateLimitScreen 
          onRetry={() => {
            setRateLimitHit(false);
            didBindRef.current = false;
            didUpdateLastActiveRef.current = false;
            didAutoBindRef.current = false;
            loadedGuestIdsRef.current = new Set(); // P0-4: reset loaded guests on retry
            queryClient.invalidateQueries();
          }} 
        />
      );
    }
    if (loadingToken || loadingUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      );
    }
    if (isTokenMode) {
      if (tokenState === "locked") return <LockedScreen />;
      if (tokenState === "bind_needed" || updateLinkMutation.isPending) return <BindingScreen />;
      if (tokenState !== "ok") {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
            <Card className="p-6 text-center text-red-500">Ссылка недействительна.</Card>
          </div>
        );
      }
    }
    if (!token && !currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Необходимо войти</h1>
            <p className="text-slate-500 text-sm">Доступ по приглашению или ссылке ресторана.</p>
          </div>
        </div>
      );
    }
    if (!token) {
      const role = currentUser?.user_role;
      const valid = ["admin", "partner_owner", "partner_manager", "partner_staff", "kitchen", "director", "managing_director"];
      if (!role || !valid.includes(role)) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
              <p className="text-slate-500 text-sm">Роль не настроена.</p>
            </div>
          </div>
        );
      }
      if (["partner_staff", "kitchen", "partner_owner", "partner_manager", "director", "managing_director"].includes(role) && !currentUser.partner) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 text-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Нет доступа</h1>
              <p className="text-slate-500 text-sm">Ресторан не выбран.</p>
            </div>
          </div>
        );
      }
    }
    return null;
  }, [loadingToken, token, loadingUser, isTokenMode, tokenState, updateLinkMutation.isPending, currentUser, rateLimitHit]);

  const partnerId = useMemo(() => {
    if (isTokenMode) return link?.partner || null;
    return currentUser?.partner || null;
  }, [isTokenMode, link?.partner, currentUser?.partner]);

  const canFetch = useMemo(() => {
    if (isTokenMode) return tokenState === "ok";
    return !!currentUser;
  }, [isTokenMode, tokenState, currentUser]);

  const { data: partnerData } = useQuery({
    queryKey: ["partner", partnerId],
    queryFn: () => base44.entities.Partner.filter({ id: partnerId }),
    enabled: canFetch && !!partnerId,
    retry: shouldRetry,
    select: (data) => data?.[0],
  });
  const partnerName = partnerData?.name || "Ресторан";

  const shiftStartTime = useMemo(() => {
    return getShiftStartTime(partnerData?.working_hours);
  }, [partnerData?.working_hours]);

  const { data: tables } = useQuery({
    queryKey: ["tables", partnerId],
    queryFn: () => (partnerId ? base44.entities.Table.filter({ partner: partnerId }) : base44.entities.Table.list()),
    enabled: canFetch,
    retry: shouldRetry,
  });
  const tableMap = useMemo(
    () => tables?.reduce((acc, t) => ({ ...acc, [t.id]: { name: t.name, zone_name: t.zone_name } }), {}) || {},
    [tables]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // P0-2: FIXED - removed .list() to be consistent with other .filter() calls
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: orderStages = [], error: stagesError } = useQuery({
    queryKey: ["orderStages", partnerId],
    queryFn: () => base44.entities.OrderStage.filter({ 
      partner: partnerId, 
      is_active: true 
    }), // P0-2: removed .list()
    enabled: canFetch && !!partnerId && !rateLimitHit,
    staleTime: 60000, // 1 minute — stages rarely change
    retry: shouldRetry,
  });

  useEffect(() => {
    if (stagesError && isRateLimitError(stagesError)) {
      queryClient.cancelQueries();
      setRateLimitHit(true);
    }
  }, [stagesError]);

  // Sorted stages by sort_order
  const sortedStages = useMemo(() => {
    return [...orderStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [orderStages]);

  // Map for quick lookup by ID
  // Map for quick lookup by normalized ID
  const stagesMap = useMemo(() => {
    return orderStages.reduce((acc, stage) => {
      const normalizedId = getLinkId(stage.id);
      if (normalizedId) {
        acc[normalizedId] = stage;
      }
      return acc;
    }, {});
  }, [orderStages]);

  /**
   * Gets status configuration for an order (ORD-005, ORD-009)
   * Priority: stage_id → fallback to STATUS_FLOW
   * P0-1: Uses normalized stageId
   */
  const getStatusConfig = useCallback((order) => {
    // P0-1: Normalize stage_id before lookup
    const stageId = getLinkId(order.stage_id);
    
    // Priority 1: If stage_id exists and stage is found
    if (stageId && stagesMap[stageId]) {
      const stage = stagesMap[stageId];
      
      // Filter stages by order channel (ORD-001, ORD-003)
      const relevantStages = getStagesForOrder(order, sortedStages);
      
      // Find current stage index and next stage (normalize stage.id for comparison)
      const currentIndex = relevantStages.findIndex(s => getLinkId(s.id) === stageId);
      const nextStage = currentIndex >= 0 && currentIndex < relevantStages.length - 1
        ? relevantStages[currentIndex + 1]
        : null;
      
      // Determine if this is first or finish stage
      const isFirstStage = stage.internal_code === 'start' || currentIndex === 0;
      const isFinishStage = stage.internal_code === 'finish' || currentIndex === relevantStages.length - 1;
      
      return {
        label: stage.name,
        color: stage.color,
        actionLabel: nextStage ? `→ ${nextStage.name}` : null,
        nextStageId: nextStage?.id || null,
        nextStatus: null, // don't use old status
        badgeClass: '', // will use inline style with color
        isStageMode: true,
        isFirstStage,
        isFinishStage,
      };
    }
    
    // Priority 2: Fallback to STATUS_FLOW
    const flow = STATUS_FLOW[order.status];
    return {
      label: flow?.label || order.status,
      color: null,
      actionLabel: flow?.actionLabel || null,
      nextStageId: null,
      nextStatus: flow?.nextStatus || null,
      badgeClass: flow?.badgeClass || "bg-slate-100",
      isStageMode: false,
      isFirstStage: order.status === 'new',
      isFinishStage: order.status === 'ready' || order.status === 'served',
    };
  }, [stagesMap, sortedStages]);

  const effectivePollingInterval = rateLimitHit ? false : (pollingInterval === 0 ? false : pollingInterval);

  const {
    data: orders,
    isLoading: loadingOrders,
    isError: ordersError,
    error: ordersErrorObj,
    refetch: refetchOrders,
    dataUpdatedAt: ordersUpdatedAt,
  } = useQuery({
    queryKey: ["orders", partnerId],
    queryFn: () => (partnerId ? base44.entities.Order.filter({ partner: partnerId }) : base44.entities.Order.list("-created_date", 1000)),
    enabled: canFetch && !rateLimitHit,
    refetchInterval: effectivePollingInterval,
    refetchIntervalInBackground: false,
    retry: shouldRetry,
  });

  useEffect(() => {
    if (ordersErrorObj && isRateLimitError(ordersErrorObj)) {
      queryClient.cancelQueries();
      setRateLimitHit(true);
    }
  }, [ordersErrorObj]);

  const {
    data: allRequests,
    isError: requestsError,
    error: requestsErrorObj,
    refetch: refetchRequests,
    dataUpdatedAt: requestsUpdatedAt,
  } = useQuery({
    queryKey: ["serviceRequests", partnerId],
    queryFn: () => (partnerId ? base44.entities.ServiceRequest.filter({ partner: partnerId }) : base44.entities.ServiceRequest.list()),
    enabled: canFetch && !isKitchen && !rateLimitHit,
    refetchInterval: effectivePollingInterval,
    refetchIntervalInBackground: false,
    retry: shouldRetry,
  });

  useEffect(() => {
    if (requestsErrorObj && isRateLimitError(requestsErrorObj)) {
      queryClient.cancelQueries();
      setRateLimitHit(true);
    }
  }, [requestsErrorObj]);

  const lastUpdatedAt = Math.max(ordersUpdatedAt || 0, requestsUpdatedAt || 0) || null;

  const activeRequests = useMemo(() => {
    if (!allRequests || isKitchen) return [];
    
    const shiftCutoff = shiftStartTime.getTime();
    
    return allRequests.filter((r) => {
      // SHIFT FILTER
      const createdAt = safeParseDate(r.created_date).getTime();
      if (createdAt < shiftCutoff) return false;
      
      // Existing status filter
      return ["new", "in_progress"].includes(r.status);
    });
  }, [allRequests, isKitchen, shiftStartTime]);

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ServiceRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["serviceRequests"] }),
    onError: (err) => {
      if (isRateLimitError(err)) {
        queryClient.cancelQueries();
        setRateLimitHit(true);
      }
    },
  });

  // Filter orders by status (using both stage_id and status for hybrid support)
  // P0-1: Uses normalized stageId
  const activeOrders = useMemo(() => {
    if (!orders) return [];
    
    const shiftCutoff = shiftStartTime.getTime();
    
    return orders.filter((o) => {
      // P0-3: For hall orders, require table_session (filter out legacy/orphan orders)
      if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false;

      // SHIFT FILTER: only orders created after shift start
      const createdAt = safeParseDate(o.created_date).getTime();
      if (createdAt < shiftCutoff) return false;

      // Existing status filter (unchanged)
      const stageId = getLinkId(o.stage_id);
      if (stageId && stagesMap[stageId]) {
        const stage = stagesMap[stageId];
        if (stage.internal_code === 'finish') {
          return o.status !== 'served' && o.status !== 'closed' && o.status !== 'cancelled';
        }
        return true;
      }
      return ["new", "accepted", "in_progress", "ready"].includes(o.status);
    });
  }, [orders, stagesMap, shiftStartTime]);

  // Kitchen filter: only see accepted, in_progress, ready (NOT new)
  // P0-1: Uses normalized stageId
  const roleFilteredOrders = useMemo(() => {
    if (!isKitchen) return activeOrders;
    return activeOrders.filter((o) => {
      // P0-1: Normalize stage_id
      const stageId = getLinkId(o.stage_id);
      
      // For stage mode: check if it's past the start stage
      if (stageId && stagesMap[stageId]) {
        const stage = stagesMap[stageId];
        return stage.internal_code !== 'start';
      }
      // Fallback: legacy status
      return ["accepted", "in_progress", "ready"].includes(o.status);
    });
  }, [activeOrders, isKitchen, stagesMap]);

  // P0-4.1: Reset guest cache when partnerId changes (prevents stale data across restaurants)
  useEffect(() => {
    loadedGuestIdsRef.current = new Set();
    setGuestsMap({});
  }, [partnerId]);

  // P0-4: Batch load guests with loadedGuestIdsRef to prevent re-fetching
  useEffect(() => {
    // Kitchen doesn't see guest badges — don't load guests
    if (isKitchen) return;
    
    async function loadGuestsBatch() {
      // Protect from undefined (orders may be undefined before loading)
      const list = roleFilteredOrders || [];
      
      // P0-4: Use ref to filter already-attempted IDs (not just guestsMap)
      const guestIds = [...new Set(
        list
          .map(o => getLinkId(o.guest))
          .filter(Boolean)
          .filter(id => !loadedGuestIdsRef.current.has(id)) // P0-4: check ref instead of guestsMap
      )];
      
      if (guestIds.length === 0) return;
      
      // P0-4: Mark as attempted BEFORE loading (prevents parallel duplicate requests)
      guestIds.forEach(id => loadedGuestIdsRef.current.add(id));
      
      try {
        // Load in parallel
        const guestPromises = guestIds.map(id => 
          base44.entities.SessionGuest.get(id).catch(() => null)
        );
        const guests = await Promise.all(guestPromises);
        
        // Single setState
        const newMap = {};
        guests.forEach((guest, idx) => {
          if (guest) newMap[guestIds[idx]] = guest;
        });
        
        if (Object.keys(newMap).length > 0) {
          setGuestsMap(prev => ({ ...prev, ...newMap }));
        }
      } catch (err) {
        console.error("Error loading guests batch:", err);
        // P0-4: On error, we keep IDs in ref to avoid retrying failed IDs repeatedly
      }
    }
    
    loadGuestsBatch();
  }, [roleFilteredOrders, isKitchen]); // P0-4: deps are correct now (loadedGuestIdsRef is ref, doesn't need to be in deps)

  const applyChannels = (list, types) => {
    const s = new Set(types);
    return list.filter((o) => s.has(o.order_type || "hall"));
  };

  const applyAssign = (list, filters, userId) => {
    const s = new Set(filters);
    return list.filter((o) => {
      const mine = isOrderMine(o, userId);
      const free = isOrderFree(o);
      const others = !mine && !free;
      return (mine && s.has("mine")) || (free && s.has("free")) || (others && s.has("others"));
    });
  };

  const channelCounts = useMemo(() => {
    const base = applyAssign(roleFilteredOrders, assignFilters, effectiveUserId);
    const c = { hall: 0, pickup: 0, delivery: 0 };
    base.forEach((o) => {
      const t = o.order_type || "hall";
      if (c[t] !== undefined) c[t]++;
    });
    return c;
  }, [roleFilteredOrders, assignFilters, effectiveUserId]);

  const assignCounts = useMemo(() => {
    const base = applyChannels(roleFilteredOrders, selectedTypes);
    let mine = 0, free = 0, others = 0;
    base.forEach((o) => {
      if (isOrderMine(o, effectiveUserId)) mine++;
      else if (isOrderFree(o)) free++;
      else others++;
    });
    return { mine, others, free };
  }, [roleFilteredOrders, selectedTypes, effectiveUserId]);

  // Updated statusRank to support stage mode - P0-1: uses normalized stageId
  const statusRank = (order) => {
    // P0-1: Normalize stage_id
    const stageId = getLinkId(order.stage_id);
    
    // If using stage mode
    if (stageId && stagesMap[stageId]) {
      const stage = stagesMap[stageId];
      // Ready/finish = highest priority (0)
      if (stage.internal_code === 'finish') return 0;
      // Start = second priority (1)
      if (stage.internal_code === 'start') return 1;
      // Middle stages by sort_order (2+)
      return 2 + (stage.sort_order || 0);
    }
    // Fallback: legacy status
    const s = order.status;
    return s === "ready" ? 0 : s === "new" ? 1 : s === "in_progress" ? 2 : s === "accepted" ? 3 : 9;
  };

  const visibleOrders = useMemo(() => {
    let r = applyChannels(roleFilteredOrders, selectedTypes);
    r = applyAssign(r, assignFilters, effectiveUserId);
    
    r.sort((a, b) => {
      if (sortMode === "priority") {
        const ra = statusRank(a), rb = statusRank(b);
        if (ra !== rb) return ra - rb;
        const ta = safeParseDate(a.created_date).getTime();
        const tb = safeParseDate(b.created_date).getTime();
        return ta - tb;
      } else {
        const ta = safeParseDate(a.created_date).getTime();
        const tb = safeParseDate(b.created_date).getTime();
        return sortOrder === "newest" ? tb - ta : ta - tb;
      }
    });
    
    return r;
  }, [roleFilteredOrders, selectedTypes, assignFilters, sortMode, sortOrder, effectiveUserId, stagesMap]);

  // v2.7.0: Order groups model (hall by table, pickup/delivery individual)
  const orderGroups = useMemo(() => {
    if (isKitchen) return null;
    
    const groups = [];
    const tableGroups = {};
    
    visibleOrders.forEach(o => {
      if (o.order_type === 'hall') {
        const tableId = getLinkId(o.table);
        if (!tableId) return;
        if (!tableGroups[tableId]) {
          const tableName = tableMap[tableId]?.name || '?';
          tableGroups[tableId] = {
            type: 'table',
            id: tableId,
            displayName: tableName,
            orders: [],
          };
          groups.push(tableGroups[tableId]);
        }
        tableGroups[tableId].orders.push(o);
      } else {
        groups.push({
          type: o.order_type,
          id: o.id,
          displayName: o.order_type === 'pickup' 
            ? `СВ-${o.order_number || o.id.slice(-3)}` 
            : `ДОС-${o.order_number || o.id.slice(-3)}`,
          orders: [o],
        });
      }
    });
    
    return groups;
  }, [visibleOrders, tableMap, isKitchen]);

  // v2.7.0: Sorted groups by oldest unaccepted order
  const sortedGroups = useMemo(() => {
    if (!orderGroups) return [];
    
    return [...orderGroups].sort((a, b) => {
      const getPriority = (group) => {
        const unaccepted = group.orders.filter(o => getStatusConfig(o).isFirstStage);
        if (unaccepted.length === 0) return Infinity;
        return Math.min(...unaccepted.map(o => safeParseDate(o.created_date).getTime()));
      };
      return getPriority(a) - getPriority(b);
    });
  }, [orderGroups, getStatusConfig]);

  // v2.7.0: Auto-expand effect
  useEffect(() => {
    if (!sortedGroups?.length) return;
    
    setExpandedGroups(prev => {
      const next = new Set(prev);
      sortedGroups.slice(0, 5).forEach(g => next.add(g.id));
      sortedGroups.forEach(g => {
        if (isFavorite(g.type === 'table' ? 'table' : 'order', g.id)) {
          next.add(g.id);
        }
      });
      return next;
    });
  }, [sortedGroups, isFavorite]);

  // v2.7.0: Toggle group expand
  const toggleGroupExpand = useCallback((groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // v2.7.1: Tab filtering (active vs completed)
  const filteredGroups = useMemo(() => {
    if (!orderGroups) return [];
    
    return orderGroups.filter(group => {
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      
      return activeTab === 'active' ? hasActiveOrder : !hasActiveOrder;
    });
  }, [orderGroups, activeTab, getStatusConfig]);

  // v2.7.1: Tab counts
  const tabCounts = useMemo(() => {
    if (!orderGroups) return { active: 0, completed: 0 };
    
    let active = 0, completed = 0;
    orderGroups.forEach(group => {
      const hasActiveOrder = group.orders.some(o => {
        const config = getStatusConfig(o);
        return !config.isFinishStage && o.status !== 'cancelled';
      });
      if (hasActiveOrder) active++; else completed++;
    });
    
    return { active, completed };
  }, [orderGroups, getStatusConfig]);

  // v2.7.1: Favorites filter
  const finalGroups = useMemo(() => {
    if (!showOnlyFavorites) return filteredGroups;
    
    return filteredGroups.filter(group => 
      isFavorite(group.type === 'table' ? 'table' : 'order', group.id)
    );
  }, [filteredGroups, showOnlyFavorites, isFavorite]);

  const finalRequests = useMemo(() => {
    if (!showOnlyFavorites) return activeRequests;
    
    return activeRequests.filter(req => 
      favorites.includes(`request:${req.id}`)
    );
  }, [activeRequests, showOnlyFavorites, favorites]);

  // V2: Sort groups by table status priority (Mine tab sort order spec)
  const v2SortedGroups = useMemo(() => {
    if (!finalGroups.length) return finalGroups;
    return [...finalGroups].sort((a, b) => {
      const statusA = computeTableStatus(a, activeRequests, getStatusConfig);
      const statusB = computeTableStatus(b, activeRequests, getStatusConfig);
      const pa = TABLE_STATUS_SORT_PRIORITY[statusA] ?? 5;
      const pb = TABLE_STATUS_SORT_PRIORITY[statusB] ?? 5;
      if (pa !== pb) return pa - pb;
      // Within same status group: oldest order first
      const ta = Math.min(...a.orders.map(o => safeParseDate(o.created_date).getTime()));
      const tb = Math.min(...b.orders.map(o => safeParseDate(o.created_date).getTime()));
      return ta - tb;
    });
  }, [finalGroups, activeRequests, getStatusConfig]);

  // V2-02: Sprint B — Live detail group (auto-updates via polling)
  // Uses detailGroupId to find the live version from all current groups
  // lastDetailGroupRef prevents flash-unmount when group briefly disappears during polling
  const liveDetailGroup = useMemo(() => {
    if (!detailGroupId || !orderGroups) return null;
    // Search across all groups (not just filtered view) so detail stays open during filter changes
    const found = orderGroups.find(g => g.id === detailGroupId) || null;
    if (found) lastDetailGroupRef.current = found; // Keep last known version
    return found;
  }, [detailGroupId, orderGroups]);

  // The group used to render detail screen — last known version if live group disappears temporarily
  const stableDetailGroup = liveDetailGroup || (detailGroupId ? lastDetailGroupRef.current : null);

  // v2.7.0: Removed favoriteOrders/otherOrders (replaced by orderGroups)

  const prevDigestRef = useRef(null);
  const prevStatusMapRef = useRef({});

  const pushNotify = (title, newOrderIds = [], bannerInfo = null) => {
    if (!notifPrefs?.enabled) return;
    setNotifDot(true);

    if (newOrderIds.length > 0) {
      setNotifiedOrderIds((prev) => {
        const next = new Set(prev);
        newOrderIds.forEach((id) => next.add(id));
        return next;
      });
    }

    if (notifPrefs.sound && audioUnlockedRef.current && audioRef.current?.play) {
      try { audioRef.current.play(); } catch { /* ignore */ }
    }
    tryVibrate(notifPrefs.vibrate);
    // V2-09: Show banner instead of toast for richer notification
    if (bannerInfo) {
      bannerIdCounter.current += 1;
      setBannerData({
        id: bannerIdCounter.current,
        text: bannerInfo.text || title,
        groupId: bannerInfo.groupId || null,
        count: bannerInfo.count || 1,
      });
    } else {
      showToast(title);
    }
    if (notifPrefs.system && canUseNotifications() && Notification.permission === "granted") {
      try { new Notification(title); } catch { /* ignore */ }
    }
  };

  // P0-1: Notification effect uses normalized stageId
  useEffect(() => {
    if (!canFetch) return;

    const filterAge = Date.now() - lastFilterChangeRef.current;
    if (filterAge < 1500) {
      const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
      const digest = eligibleOrders.map((o) => {
        const stageId = getLinkId(o.stage_id); // P0-1
        return `${o.id}:${o.status}:${stageId || ''}`;
      }).sort().join("|");
      prevDigestRef.current = digest;
      const m = {};
      eligibleOrders.forEach((o) => {
        const stageId = getLinkId(o.stage_id); // P0-1
        m[o.id] = { status: o.status, stage_id: stageId };
      });
      prevStatusMapRef.current = m;
      return;
    }

    const eligibleOrders = applyChannels(applyAssign(roleFilteredOrders, assignFilters, effectiveUserId), selectedTypes);
    const digest = eligibleOrders.map((o) => {
      const stageId = getLinkId(o.stage_id); // P0-1
      return `${o.id}:${o.status}:${stageId || ''}`;
    }).sort().join("|");

    const prev = prevDigestRef.current;
    prevDigestRef.current = digest;

    if (!prev) {
      const m = {};
      eligibleOrders.forEach((o) => {
        const stageId = getLinkId(o.stage_id); // P0-1
        m[o.id] = { status: o.status, stage_id: stageId };
      });
      prevStatusMapRef.current = m;
      return;
    }
    if (prev === digest) return;

    const prevMap = prevStatusMapRef.current || {};
    const currMap = {};
    eligibleOrders.forEach((o) => {
      const stageId = getLinkId(o.stage_id); // P0-1
      currMap[o.id] = { status: o.status, stage_id: stageId };
    });
    prevStatusMapRef.current = currMap;

    const own = ownMutationRef.current;
    const ownRecent = own && Date.now() - own.ts < 6000;

    let becameReady = 0;
    const newOrderIds = [];
    const readyOrderIds = [];

    eligibleOrders.forEach((o) => {
      if (ownRecent && own.orderId === o.id) return;
      const pst = prevMap[o.id];
      if (!pst) {
        newOrderIds.push(o.id);
        return;
      }
      // Check if became ready (either by status or by stage) - P0-1: use normalized ids
      const pstStageId = pst.stage_id; // already normalized in prevMap
      const currStageId = getLinkId(o.stage_id);
      const wasReady = pst.status === 'ready' || (pstStageId && stagesMap[pstStageId]?.internal_code === 'finish');
      const isReady = o.status === 'ready' || (currStageId && stagesMap[currStageId]?.internal_code === 'finish');
      if (!wasReady && isReady) { becameReady++; readyOrderIds.push(o.id); }
    });

    // V2-09: Build banner info with table context
    const buildBannerInfo = (orderIds, eventType) => {
      if (!orderIds.length) return null;
      // Find which table(s) these orders belong to
      const orderMap = {};
      eligibleOrders.forEach(o => { orderMap[o.id] = o; });
      const tableIds = new Set();
      orderIds.forEach(id => {
        const o = orderMap[id];
        if (o) {
          const tId = getLinkId(o.table);
          if (tId) tableIds.add(tId);
        }
      });
      const tableNames = [...tableIds].map(tId => {
        const t = tableMap[tId];
        return t?.name ? `${t.name}` : null;
      }).filter(Boolean);

      // Single table: "Стол 5: Новый заказ"
      if (tableNames.length === 1 && orderIds.length === 1) {
        const label = eventType === 'ready' ? 'Заказ готов' : 'Новый заказ';
        return {
          text: `${tableNames[0]}: ${label}`,
          groupId: [...tableIds][0],
          count: 1,
        };
      }
      // Multiple: "3 новых заказа" or "2 заказа готовы"
      const count = orderIds.length;
      if (eventType === 'ready') {
        const word = count === 1 ? 'заказ готов' : count < 5 ? 'заказа готовы' : 'заказов готовы';
        return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
      }
      const word = count === 1 ? 'новый заказ' : count < 5 ? 'новых заказа' : 'новых заказов';
      return { text: `${count} ${word}`, groupId: tableIds.size === 1 ? [...tableIds][0] : null, count };
    };

    if (becameReady > 0) {
      const banner = buildBannerInfo(readyOrderIds, 'ready');
      pushNotify(`Готово: +${becameReady}`, [], banner);
      return;
    }
    if (newOrderIds.length > 0) {
      const banner = buildBannerInfo(newOrderIds, 'new');
      pushNotify(`Новые: +${newOrderIds.length}`, newOrderIds, banner);
      // v3.6.0: Force refetch to ensure detail view gets fresh data immediately
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  }, [roleFilteredOrders, assignFilters, selectedTypes, canFetch, notifPrefs, effectiveUserId, stagesMap, tableMap, queryClient]);

  const toggleChannel = (type) => {
    const on = selectedTypes.includes(type);
    if (on && selectedTypes.length === 1) {
      showToast("Минимум 1 канал");
      return;
    }
    if (!on && (channelCounts[type] || 0) === 0) {
      showToast("Пока 0 заказов");
    }
    lastFilterChangeRef.current = Date.now();
    setSelectedTypes((p) => (p.includes(type) ? p.filter((t) => t !== type) : [...p, type]));
  };

  const toggleAssign = (key) => {
    const on = assignFilters.includes(key);
    if (on && assignFilters.length === 1) {
      showToast("Минимум 1 фильтр");
      return;
    }
    if (!on && (assignCounts[key] || 0) === 0) {
      showToast("Пока 0 заказов");
    }
    lastFilterChangeRef.current = Date.now();
    setAssignFilters((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  };

  // V2-02/03: Sprint B — Open/close detail view, preserve scroll position
  // v3.6.0: Force refetch on open to prevent stale order list in detail view
  const handleOpenDetail = useCallback((group) => {
    listScrollRef.current = window.scrollY;
    setDetailGroupId(group.id);
    refetchOrders();
  }, [refetchOrders]);

  const handleCloseDetail = useCallback(() => {
    setDetailGroupId(null);
    // Double-rAF: first frame React re-renders list, second frame scroll is applied
    // Also scrolls document.documentElement.scrollTop as fallback for Base44 shell
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const top = listScrollRef.current;
        window.scrollTo({ top, behavior: 'instant' });
        if (document.documentElement.scrollTop !== top) {
          document.documentElement.scrollTop = top;
        }
      });
    });
  }, []);

  // V2-09: Sprint D — Highlight state for banner-navigate
  const [highlightGroupId, setHighlightGroupId] = useState(null);
  const highlightTimerRef = useRef(null);

  // V2-09: Banner tap → close detail if open, scroll to group card, highlight briefly
  const handleBannerNavigate = useCallback((groupId) => {
    if (!groupId) return;
    // Close detail view if open (return to list)
    if (detailGroupId) {
      setDetailGroupId(null);
    }
    // Wait for React to render list, then scroll to card
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-group-id="${CSS.escape(String(groupId))}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Brief highlight
          setHighlightGroupId(groupId);
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
          highlightTimerRef.current = setTimeout(() => setHighlightGroupId(null), 1500);
        }
      });
    });
  }, [detailGroupId]);

  // Cleanup highlight timer
  useEffect(() => () => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);

  // V2-09: Banner dismiss handler
  const handleBannerDismiss = useCallback(() => {
    setBannerData(null);
  }, []);

  const handleRefresh = () => {
    setManualRefreshTs(Date.now());
    refetchOrders();
    if (!isKitchen) refetchRequests();
  };

  // D1-007, D1-008, D1-009: Close table handler
  // v3.6.0: Shows confirmation dialog instead of browser confirm()
  const handleCloseTable = (tableSessionField, tableName) => {
    const sessionId = getLinkId(tableSessionField);
    if (!sessionId) return;
    setCloseTableConfirm({ sessionId, tableName: tableName || 'стол' });
  };

  // v3.6.0: Confirmation dialog — executes close after user confirms
  const confirmCloseTable = async () => {
    if (!closeTableConfirm) return;
    const { sessionId } = closeTableConfirm;
    setCloseTableConfirm(null);
    try {
      await closeSession(sessionId);
      showToast("Стол закрыт");
      setDetailGroupId(null); // Close detail view — table no longer active
      refetchOrders();
    } catch (err) {
      showToast("Ошибка при закрытии");
    }
  };

  // v2.7.1: Close all orders handler (move all to finish stage)
  const handleCloseAllOrders = useCallback(async (orders) => {
    if (!orders?.length) return;
    
    const finishStage = sortedStages.find(s => s.internal_code === 'finish');
    if (!finishStage) {
      showToast('Нет этапа "Завершён"');
      return;
    }
    
    try {
      await Promise.all(orders.map(o => 
        base44.entities.Order.update(o.id, { stage_id: finishStage.id })
      ));
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showToast('Стол закрыт');
    } catch (err) {
      if (isRateLimitError(err)) {
        queryClient.cancelQueries();
        setRateLimitHit(true);
      }
    }
  }, [sortedStages, queryClient]);

  const requestNotifPermission = async () => {
    if (!canUseNotifications()) { showToast("Не поддерживается"); return; }
    try {
      const r = await Notification.requestPermission();
      showToast(r === "granted" ? "Разрешено" : "Не разрешено");
    } catch { showToast("Ошибка"); }
  };

  if (gateView) return gateView;

  const hasErrors = (ordersError || requestsError) && !rateLimitHit;
  const hasFavorites = favorites.length > 0;
  const notifEnabled = !!notifPrefs?.enabled;
  const notifPermission = canUseNotifications() ? Notification.permission : "unsupported";

  const channelLabels = selectedTypes.map((t) => TYPE_THEME[t]?.label || t).join(", ");
  const assignLabels = assignFilters.map((f) => (f === "mine" ? "Мои" : f === "others" ? "Чужие" : "Свободные")).join(", ");

  const manualAge = manualRefreshTs ? Math.floor((Date.now() - manualRefreshTs) / 1000) : 9999;
  const refreshLabelText = manualAge <= 2 
    ? "Готово ✓" 
    : pollingInterval === 0 
      ? "Вручную" 
      : `Авто ${pollingInterval / 1000}с`;
  const refreshLabelColor = manualAge <= 2 ? "text-green-600" : "text-slate-400";

  const CABINET_USER_ROLES = ['partner_owner', 'partner_manager', 'director', 'managing_director'];
  const canAccessCabinet = isTokenMode
    ? (CABINET_ACCESS_ROLES.includes(effectiveRole) && link?.invited_user)
    : CABINET_USER_ROLES.includes(currentUser?.user_role);

  // D1-007: Determine who can close tables (NOT kitchen)
  const canCloseTable = !isKitchen && 
    ['partner_manager', 'partner_staff', 'director', 'managing_director', 'partner_owner']
      .includes(effectiveRole);

  return (
    <div className="min-h-screen bg-slate-100 pb-24 font-sans">
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-slate-900 leading-tight">Заказы</h1>
              <div className="text-[11px] text-slate-500">Активные: {visibleOrders.length}</div>
            </div>
            <div className="flex items-center gap-1.5">
              {canAccessCabinet && (
                <button
                  type="button"
                  onClick={() => window.location.href = '/partnerhome'}
                  className="w-9 h-9 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center active:scale-95"
                  aria-label="Перейти в кабинет"
                >
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
                aria-label="Профиль"
              >
                <User className="w-5 h-5 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => { setNotifOpen((v) => !v); setNotifDot(false); }}
                className="relative w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
                aria-label="Настройки уведомлений"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {notifEnabled && notifDot && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
                aria-label="Настройки"
              >
                <Settings className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-3 flex items-start justify-between gap-2">
            <div className="flex gap-2 flex-1 min-w-0">
              <IconToggle label="Мои" count={assignCounts.mine} selected={assignFilters.includes("mine")} onClick={() => toggleAssign("mine")} countAsIcon />
              <IconToggle label="Чужие" count={assignCounts.others} selected={assignFilters.includes("others")} onClick={() => toggleAssign("others")} countAsIcon />
              <IconToggle label="Свободные" count={assignCounts.free} selected={assignFilters.includes("free")} onClick={() => toggleAssign("free")} countAsIcon />
            </div>
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
                  aria-label="Обновить"
                >
                  {loadingOrders ? <Loader2 className="w-5 h-5 animate-spin text-slate-400" /> : <RefreshCcw className="w-5 h-5 text-slate-600" />}
                </button>
                <span className={`text-[10px] mt-1 min-w-[56px] text-center ${refreshLabelColor}`}>{refreshLabelText}</span>
              </div>
              {sortMode === "time" && (
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={toggleSortOrder}
                    className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center active:scale-95"
                    aria-label="Сортировка"
                  >
                    {sortOrder === "newest" ? <ArrowDown className="w-5 h-5 text-slate-600" /> : <ArrowUp className="w-5 h-5 text-slate-600" />}
                  </button>
                  <span className="text-[10px] text-slate-400 mt-1 min-w-[56px] text-center">
                    {sortOrder === "newest" ? "Новые" : "Старые"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {hasErrors && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 flex items-center justify-between gap-2">
              <span className="text-sm text-red-700">Ошибка загрузки</span>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="border-red-300 text-red-600">Повторить</Button>
            </CardContent>
          </Card>
        )}

        {!isKitchen && (
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Активные ({tabCounts.active})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Завершённые ({tabCounts.completed})
            </button>
            <button
              onClick={() => setShowOnlyFavorites(v => !v)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                showOnlyFavorites
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="Только избранные"
            >
              <Star className={`w-4 h-4 ${showOnlyFavorites ? 'fill-yellow-400' : ''}`} />
            </button>
          </div>
        )}

        {!isKitchen && finalRequests.length > 0 && (
          <div>
            <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Hand className="w-3 h-3" /> ЗАПРОСЫ ГОСТЕЙ ({finalRequests.length})
            </h2>
            {finalRequests.map((req) => {
              // P0-1: Normalize table for RequestCard
              const reqTableId = getLinkId(req.table);
              return (
                <RequestCard
                  key={req.id}
                  request={req}
                  tableData={reqTableId ? tableMap[reqTableId] : null}
                  isPending={updateRequestMutation.isPending}
                  onAction={() => updateRequestMutation.mutate({ id: req.id, status: req.status === "new" ? "in_progress" : "done" })}
                  isFavorite={favorites.includes(`request:${req.id}`)}
                  onToggleFavorite={toggleFavorite}
                />
              );
            })}
          </div>
        )}

        {(isKitchen ? visibleOrders.length === 0 : (v2SortedGroups.length === 0 && finalRequests.length === 0)) && !hasErrors ? (
          <div className="text-center py-10 text-slate-400">
            <div className="mb-2">
              {isKitchen 
                ? "Нет заказов для кухни" 
                : showOnlyFavorites 
                  ? "Нет избранных" 
                  : activeTab === 'active' 
                    ? "Нет активных заказов" 
                    : "Нет завершённых заказов"}
            </div>
            {isKitchen && <div className="text-xs mb-4">Фильтры: {channelLabels} · {assignLabels}</div>}
            <Button variant="outline" size="sm" onClick={handleRefresh}>Обновить</Button>
          </div>
        ) : (
          <React.Fragment>
            {(isKitchen ? visibleOrders.length > 0 : v2SortedGroups.length > 0) && (
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <UtensilsCrossed className="w-3 h-3" /> ЗАКАЗЫ
              </h2>
            )}
            
            {/* v2.7.0: Kitchen sees flat list, non-kitchen sees grouped cards */}
            {isKitchen ? (
              visibleOrders.map((o) => {
                const tableId = getLinkId(o.table);
                return (
                  <OrderCard 
                    key={o.id} 
                    order={o} 
                    tableData={tableId ? tableMap[tableId] : null}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                    disableServe={isKitchen} 
                    onMutate={trackOwnMutation}
                    effectiveUserId={effectiveUserId}
                    isNotified={notifiedOrderIds.has(o.id)}
                    onClearNotified={clearNotified}
                    getStatusConfig={getStatusConfig}
                    isKitchen={isKitchen}
                    guestsMap={guestsMap}
                    onCloseTable={null}
                  />
                );
              })
            ) : (
              v2SortedGroups.map(group => (
                <OrderGroupCard
                  key={group.id}
                  group={group}
                  onCardBodyTap={() => handleOpenDetail(group)}
                  isHighlighted={highlightGroupId === group.id}
                  isFavorite={isFavorite(group.type === 'table' ? 'table' : 'order', group.id)}
                  onToggleFavorite={toggleFavorite}
                  getStatusConfig={getStatusConfig}
                  guestsMap={guestsMap}
                  effectiveUserId={effectiveUserId}
                  onMutate={trackOwnMutation}
                  onCloseTable={canCloseTable ? handleCloseTable : null}
                  notifiedOrderIds={notifiedOrderIds}
                  onClearNotified={clearNotified}
                  tableMap={tableMap}
                  overdueMinutes={partnerData?.order_overdue_minutes || 10}
                  onCloseAllOrders={handleCloseAllOrders}
                  activeRequests={activeRequests}
                />
              ))
            )}
          </React.Fragment>
        )}
      </div>

      {/* V2-02: Sprint B — Table detail view overlay (full-screen, slide-in from right) */}
      {stableDetailGroup && (
        <TableDetailScreen
          group={stableDetailGroup}
          tableStatus={computeTableStatus(stableDetailGroup, activeRequests, getStatusConfig)}
          onClose={handleCloseDetail}
          getStatusConfig={getStatusConfig}
          guestsMap={guestsMap}
          effectiveUserId={effectiveUserId}
          onMutate={trackOwnMutation}
          onCloseTable={canCloseTable ? handleCloseTable : null}
          onClearNotified={clearNotified}
          tableMap={tableMap}
          onCloseAllOrders={handleCloseAllOrders}
          activeRequests={activeRequests}
        />
      )}

      {/* Modals */}
      <MyTablesModal
        open={myTablesOpen}
        onClose={() => setMyTablesOpen(false)}
        tables={tables || []}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onClearAll={clearAllFavorites}
      />
      
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        staffName={staffName}
        staffRole={effectiveRole}
        partnerName={partnerName}
        isKitchen={isKitchen}
        favoritesCount={favorites.length}
        onOpenMyTables={() => setMyTablesOpen(true)}
        onLogout={handleLogout}
      />
      
      <SettingsPanel 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        pollingInterval={pollingInterval} 
        onChangePollingInterval={handleChangePollingInterval}
        sortMode={sortMode}
        onChangeSortMode={handleChangeSortMode}
        selectedTypes={selectedTypes}
        onToggleChannel={toggleChannel}
        channelCounts={channelCounts}
      />

      {notifOpen && (
        <div className="fixed inset-0 z-40">
          <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setNotifOpen(false)} aria-label="Закрыть" />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] bg-white rounded-t-2xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-bold text-slate-900">Уведомления</span>
              <button type="button" onClick={() => setNotifOpen(false)} className="p-2 -m-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-sm font-medium text-slate-800">Уведомления</span>
                <input type="checkbox" checked={notifEnabled} onChange={(e) => updateNotifPrefs({ enabled: e.target.checked })} className="h-5 w-5" />
              </label>
              <div className={notifEnabled ? "" : "opacity-50 pointer-events-none"}>
                <div className="space-y-2">
                  <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    <span className="text-sm text-slate-700">Вибрация</span>
                    <input type="checkbox" checked={!!notifPrefs.vibrate} onChange={(e) => updateNotifPrefs({ vibrate: e.target.checked })} className="h-5 w-5" />
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    <span className="text-sm text-slate-700">Звук</span>
                    <input type="checkbox" checked={!!notifPrefs.sound} onChange={(e) => updateNotifPrefs({ sound: e.target.checked })} className="h-5 w-5" />
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-white">
                    <div className="flex-1">
                      <span className="text-sm text-slate-700">Push-уведомления</span>
                      {notifPermission !== "granted" && <div className="text-[10px] text-slate-400">Нужно разрешение браузера</div>}
                    </div>
                    {notifPermission === "granted" ? (
                      <input type="checkbox" checked={!!notifPrefs.system} onChange={(e) => updateNotifPrefs({ system: e.target.checked })} className="h-5 w-5" />
                    ) : (
                      <Button variant="outline" size="sm" onClick={requestNotifPermission} className="h-7 text-xs">Разрешить</Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">Уведомления приходят по активным фильтрам.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* v3.6.0: Close table confirmation dialog */}
      {closeTableConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {`Закрыть ${closeTableConfirm.tableName}?`}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Гости больше не смогут отправлять заказы.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCloseTableConfirm(null)}
                className="flex-1 min-h-[44px] rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 active:scale-[0.98]"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmCloseTable}
                className="flex-1 min-h-[44px] rounded-lg bg-red-600 text-white text-sm font-semibold active:scale-[0.98]"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed left-0 right-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-slate-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">{toastMsg}</div>
        </div>
      )}

      {/* V2-09: Sprint D — Banner notification overlay */}
      <BannerNotification
        banner={bannerData}
        onDismiss={handleBannerDismiss}
        onNavigate={handleBannerNavigate}
      />
    </div>
  );
}