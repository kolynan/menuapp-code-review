// ======================================================
// pages/x.jsx — PUBLIC MENU with i18n + Channels Visibility + Gating
// UPDATED: Simplified Hall logic (TASK-260123-01b)
// FIXED: P0-1..P0-7 security and functionality fixes
// UPDATED: TASK-260127-01 - session restore, UI cleanup
// PATCHED: 2026-01-28 - P0-1, P0-2, P0-2b, P1-1..P1-4
// PATCHED: 2026-02-01 - FIX-260131-07 FINAL - guest safeguard in submit
// PATCHED: 2026-02-01 - TASK-260201-01 - Hall StickyBar always visible
// PATCHED: 2026-03-03 - GAP-01 - Order Confirmation Screen
// FIXED: 2026-03-03 - GAP-01 fix - Confirmation as full-screen overlay (z-60)
// FIXED: 2026-03-03 - GAP-02 fix - Embed OrderStatusScreen inside x.jsx (no /orderstatus route)
// FIXED: 2026-03-03 - GAP-02 fix - Remove auto-dismiss timer (race condition: ghost click on menu)
// PATCHED: 2026-03-04 - Cart Drawer v2: two-mode design (Заказ/Чеки), toast after submit
// FIXED: 2026-03-05 - BUG-S76-04: Replace persistent "invalid code" banner with auto-dismissing toast
// PATCHED: 2026-03-05 - S79: Add restaurant logo (40px circle avatar) to menu and order status headers
// PATCHED: 2026-03-05 - S79: Add "Closed" banner when partner.is_open === false
// PATCHED: 2026-03-05 - S79: Drawer UX refactor — sticky header, detents, compact table code, 2-line items
// FIXED: 2026-03-05 - S82 BUG-S81-01: setActiveSnapPoint(null) now closes drawer (swipe-to-close)
// FIXED: 2026-03-05 - S82 BUG-S81-03: drawer auto-expands to full when cart has items (CTA visible)
// FIXED: 2026-03-05 - S82 BUG-S81-17: Hall order toast extended 2s->4s + error toast visible in drawer
// FIXED: 2026-03-05 - S82 BUG-S81-14: Pickup/Delivery checkout replaced fullscreen->drawer
// NOTE: S82 BUG-S81-02 fix (tableCodeLength 5->4) is in CartView component
// FIXED: 2026-03-06 - S84 BUG-S81-07: suppress partner.name in PublicMenuHeader when logo block shows it
// FIXED: 2026-03-06 - S84 BUG-S81-03: add overflow-y-auto scroll container in drawer (sticky CTA fix)
// FIXED: 2026-03-06 - S84 BUG-S81-01: custom drag handle with touch events for reliable swipe-to-close
// ======================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/components/i18n";
import { toast } from "sonner"; // P0-6: sonner instead of custom toast

import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  ShoppingCart,
  X as XIcon,
  XCircle,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Store,
  Package,
  Truck,
  Users,
} from "lucide-react";

import {
  getOrCreateSession,
  addGuestToSession,
  findGuestByDevice,
  getSessionGuests,
  getSessionOrders,
  getDeviceId,
  getGuestDisplayName,
  getNextOrderNumber,
  isSessionExpired,
} from "@/components/sessionHelpers";

import {
  normalizeMode,
  isDishEnabledForMode,
  sortCategoriesStable,
  sortDishesStable,
  buildDishesByCategory,
  getVisibleCategoryIds,
} from "@/components/menuChannelLogic";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// TASK-260203-01: Drawer for cart
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import Rating from "@/components/Rating";
import PublicMenuHeader from "@/components/publicMenu/PublicMenuHeader";
import HelpFab from "@/components/publicMenu/HelpFab";
import HelpModal from "@/components/publicMenu/HelpModal";
import ReviewDialog from "@/components/publicMenu/ReviewDialog";
import StickyCartBar from "@/components/publicMenu/StickyCartBar";
import MenuView from "@/components/publicMenu/MenuView";
import CartView from "@/components/publicMenu/CartView";
import RedirectBanner from "@/components/publicMenu/refactor/RedirectBanner";
import DishReviewsModal from "@/components/publicMenu/DishReviewsModal";
import ModeTabs from "@/components/publicMenu/refactor/ModeTabs";
import CategoryChips from "@/components/publicMenu/refactor/CategoryChips";
import HallVerifyBlock from "@/components/publicMenu/refactor/HallVerifyBlock";
import ErrorState from "@/components/publicMenu/refactor/ErrorState";
import EmptyMenuState from "@/components/publicMenu/refactor/EmptyMenuState";
import CheckoutView from "@/components/publicMenu/views/CheckoutView";
import { useCurrency } from "@/components/publicMenu/refactor/hooks/useCurrency";
import { useHallTable } from "@/components/publicMenu/refactor/hooks/useHallTable";
import { useHelpRequests } from "@/components/publicMenu/refactor/hooks/useHelpRequests";
import { useLoyalty } from "@/components/publicMenu/refactor/hooks/useLoyalty";
import { useReviews } from "@/components/publicMenu/refactor/hooks/useReviews";
import { useTableSession } from "@/components/publicMenu/refactor/hooks/useTableSession";

// ============================================================
// CONSTANTS & HELPERS
// ============================================================

const IS_ARCHIVED_TAG = ":::archived:::";

const isDishArchived = (dish) =>
  !!dish?.description && dish.description.includes(IS_ARCHIVED_TAG);

const getCleanDescription = (desc) =>
  desc ? desc.replace(IS_ARCHIVED_TAG, "").trim() : "";

const looksLikePartnerId = (value) =>
  /^[0-9a-f]{24}$/i.test(String(value || "").trim());

// P0-5: Rate limit detection
const isRateLimitError = (err) => {
  const msg = (err?.message || "").toLowerCase();
  return msg.includes("rate limit") || msg.includes("429");
};

const shouldRetry = (count, err) => !isRateLimitError(err) && count < 2;

// P1-1: XSS protection for contact URLs
const isSafeUrl = (url) => {
  if (!url) return false;
  const allowed = ['http:', 'https:', 'tel:', 'mailto:', 'whatsapp:'];
  try {
    const parsed = new URL(url, window.location.origin);
    return allowed.includes(parsed.protocol);
  } catch {
    return false;
  }
};

function getContactIcon(type) {
  const map = {
    phone: Phone,
    whatsapp: MessageCircle,
    instagram: LinkIcon,
    facebook: LinkIcon,
    tiktok: LinkIcon,
    website: Globe,
    email: Mail,
    map: MapPin,
    custom: LinkIcon,
  };
  return map[type] || LinkIcon;
}

// Cart persistence helpers
// BUG-PM-005: Cart persistence with 4h TTL
const CART_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const saveCartToStorage = (partnerId, cartData) => {
  if (!partnerId) return;
  try {
    const key = `menuapp_cart_${partnerId}`;
    if (!cartData || cartData.length === 0) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify({ items: cartData, ts: Date.now() }));
  } catch {}
};

const getCartFromStorage = (partnerId) => {
  if (!partnerId) return null;
  try {
    const key = `menuapp_cart_${partnerId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Migrate legacy format (plain array) — accept but rewrite with timestamp
    if (Array.isArray(data)) {
      try {
        localStorage.setItem(key, JSON.stringify({ items: data, ts: Date.now() }));
      } catch {}
      return data;
    }
    if (!data || !Array.isArray(data.items)) return null;
    // TTL check — require valid ts
    if (!data.ts || typeof data.ts !== 'number' || (Date.now() - data.ts) > CART_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data.items;
  } catch {
    return null;
  }
};

const clearCartStorage = (partnerId) => {
  if (!partnerId) return;
  try {
    const key = `menuapp_cart_${partnerId}`;
    localStorage.removeItem(key);
  } catch {}
};

/* ============================================================
   CHANNELS VISIBILITY LOGIC (per LOCKED spec)
   ============================================================ */

function isDishAvailableForGuest(dish, mode, categoriesMap) {
  if (!dish) return false;
  if (isDishArchived(dish)) return false;
  if (dish[`enabled_${mode}`] === false) return false;
  if (!dish.name?.trim()) return false;
  if (dish.price == null || dish.price < 0) return false;

  const categoryId = dish.category;
  if (categoryId && categoriesMap) {
    const category = categoriesMap.get(String(categoryId));
    if (category && category.is_active === false) return false;
  }
  return true;
}

function useGuestChannels(partner, dishes, categories) {
  return useMemo(() => {
    const isConfigured = partner?.channels_configured_at != null;
    const categoriesMap = new Map((categories || []).map((c) => [String(c.id), c]));

    const hasDishesForMode = (mode) => {
      return (dishes || []).some((dish) => isDishAvailableForGuest(dish, mode, categoriesMap));
    };

    const hallPublished = partner?.channels_hall_enabled !== false;
    const pickupPublished = partner?.channels_pickup_enabled !== false;
    const deliveryPublished = partner?.channels_delivery_enabled !== false;

    const hallHasContent = hasDishesForMode("hall");
    const pickupHasContent = hasDishesForMode("pickup");
    const deliveryHasContent = hasDishesForMode("delivery");

    return {
      hall: {
        visible: hallPublished,
        available: hallPublished && hallHasContent,
        hasContent: hallHasContent,
        disabled: hallPublished && !hallHasContent,
      },
      pickup: {
        visible: pickupPublished && isConfigured,
        available: pickupPublished && isConfigured && pickupHasContent,
        hasContent: pickupHasContent,
        disabled: pickupPublished && isConfigured && !pickupHasContent,
      },
      delivery: {
        visible: deliveryPublished && isConfigured,
        available: deliveryPublished && isConfigured && deliveryHasContent,
        hasContent: deliveryHasContent,
        disabled: deliveryPublished && isConfigured && !deliveryHasContent,
      },
      isConfigured,
      hasAnyContent: hallHasContent || pickupHasContent || deliveryHasContent,
    };
  }, [partner, dishes, categories]);
}

const SCROLL_SPY_OFFSET_PX = 100;
const MANUAL_SCROLL_LOCK_MS = 800;
const BILL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// Bill request cooldown helpers
const getBillCooldownKey = (tableId) => `menuapp_bill_requested_${tableId}`;

const isBillOnCooldown = (tableId) => {
  const key = getBillCooldownKey(tableId);
  const timestamp = localStorage.getItem(key);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp, 10) < BILL_COOLDOWN_MS;
};

const setBillCooldownStorage = (tableId) => {
  const key = getBillCooldownKey(tableId);
  localStorage.setItem(key, String(Date.now()));
};

/**
 * Находит стартовый этап для заказа
 */
function getStartStage(stages, orderType) {
  if (!stages?.length) return null;
  
  const channelStages = stages.filter(stage => {
    switch (orderType) {
      case 'hall': return stage.enabled_hall !== false;
      case 'pickup': return stage.enabled_pickup !== false;
      case 'delivery': return stage.enabled_delivery !== false;
      default: return true;
    }
  });
  
  const startStage = channelStages.find(s => s.internal_code === 'start');
  if (startStage) return startStage;
  
  const sorted = [...channelStages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  return sorted[0] || null;
}

/**
 * Order Status Badge component (TASK-260126-01)
 */
function OrderStatusBadge({ status, stageId, stages, t }) {
  // Map internal_code to translated labels (don't show raw stage.name to guests)
  const STAGE_LABELS = {
    start: t('status.new'),
    middle: t('status.cooking'),
    finish: t('status.ready'),
  };
  
  // Normalize stageId (can be string, object with id, etc)
  const stageIdNorm = stageId && typeof stageId === 'object' 
    ? (stageId.id ?? stageId._id ?? null) 
    : stageId;
  
  // If has stage_id - use OrderStage config but translated label
  if (stageIdNorm && stages?.length) {
    const stage = stages.find(s => String(s.id) === String(stageIdNorm));
    if (stage) {
      const icon = stage.internal_code === 'finish' ? '✅' : 
                   stage.internal_code === 'start' ? '🔵' : '🟠';
      const label = STAGE_LABELS[stage.internal_code] || t('status.new');
      const color = stage.color || '#64748b';
      return (
        <span 
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon} {label}
        </span>
      );
    }
  }
  
  // Fallback to status
  const STATUS_CONFIG = {
    new: { icon: '🔵', label: t('status.new'), bg: 'bg-blue-100', color: 'text-blue-700' },
    accepted: { icon: '🔵', label: t('status.accepted'), bg: 'bg-blue-100', color: 'text-blue-700' },
    in_progress: { icon: '🟠', label: t('status.cooking'), bg: 'bg-orange-100', color: 'text-orange-700' },
    ready: { icon: '✅', label: t('status.ready'), bg: 'bg-green-100', color: 'text-green-700' },
    served: { icon: '✅', label: t('status.served'), bg: 'bg-green-100', color: 'text-green-700' },
  };
  
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
}

/* ============================================================
   GAP-01: ORDER CONFIRMATION SCREEN
   Shown after successful order submission. User navigates via buttons.
   (Auto-dismiss removed: caused ghost clicks on menu when timer fired)
   ============================================================ */

function OrderConfirmationScreen({
  items,
  totalAmount,
  guestLabel,
  orderMode,
  publicToken,
  clientName,
  formatPrice,
  onBackToMenu,
  onOpenOrders,
  onTrackOrder,
  t,
}) {
  // Safe translation with fallback (same pattern as CartView)
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };
  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
    <div className="px-4 py-8 max-w-md mx-auto animate-[fadeInUp_0.3s_ease-out]">
      {/* CSS-only animations — respects prefers-reduced-motion */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes confirmCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes confirmCheck {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="confirmCircle"],
          [style*="confirmCheck"],
          .animate-\\[fadeInUp_0\\.3s_ease-out\\] {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      {/* Animated checkmark */}
      <div className="flex justify-center mb-6">
        <div className="relative w-20 h-20">
          <svg
            className="w-20 h-20"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="#22c55e"
              strokeWidth="4"
              fill="#f0fdf4"
              style={{
                strokeDasharray: 226,
                strokeDashoffset: 226,
                animation: "confirmCircle 0.4s ease-out forwards",
              }}
            />
          </svg>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: 0,
              animation: "confirmCheck 0.3s ease-out 0.35s forwards",
            }}
          >
            <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Title — FIX-S74-01: "Отправлен", not "Принят" (order is not yet accepted by waiter) */}
      <h2 className="text-xl font-semibold text-center text-slate-800 mb-1">
        {orderMode === "hall"
          ? tr("confirmation.sent_to_waiter", "Заказ отправлен официанту")
          : tr("confirmation.order_sent", "Заказ отправлен")}
      </h2>
      <p className="text-sm text-center text-slate-500 mb-6">
        {orderMode === "hall"
          ? tr("confirmation.status_hint_hall", "Статус обновится, когда официант примет заказ")
          : tr("confirmation.status_hint", "Мы начнём готовить ваш заказ")}
      </p>

      {/* Order summary card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-slate-600 mb-3">
            {t("confirmation.your_order")}
          </p>

          {/* Items list */}
          <div className="space-y-2 mb-3">
            {items.map((item, idx) => (
              <div
                key={item.dishId || idx}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-slate-700">
                  {item.name}{" "}
                  <span className="text-slate-400">x{item.quantity}</span>
                </span>
                <span className="text-slate-700 font-medium tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">
                {t("confirmation.total")}
              </span>
              <span className="font-semibold text-slate-800 tabular-nums">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Guest label */}
          {guestLabel && (
            <p className="text-sm text-slate-500 mt-3">
              {t("confirmation.guest_label")}: {guestLabel}
            </p>
          )}

          {/* Client name (pickup/delivery) */}
          {clientName && orderMode !== "hall" && (
            <p className="text-sm text-slate-500 mt-1">
              {t("confirmation.client_name")}: {clientName}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button
          className="w-full h-12"
          onClick={onBackToMenu}
        >
          {t("confirmation.back_to_menu")}
        </Button>

        <Button
          variant="outline"
          className="w-full h-12"
          onClick={onOpenOrders}
        >
          {t("confirmation.my_orders")}
        </Button>

        {/* Track order — pickup/delivery only (GAP-02: navigate to embedded status view) */}
        {orderMode !== "hall" && publicToken && (
          <Button
            variant="ghost"
            className="w-full h-12 text-indigo-600"
            onClick={() => {
              onTrackOrder(publicToken);
            }}
          >
            {t("confirmation.track_order")}
          </Button>
        )}
      </div>
    </div>
    </div>
  );
}

/* ============================================================
   GAP-02: ORDER STATUS SCREEN (embedded)
   Pickup/delivery guests track their order status.
   Renders inside x.jsx as a view — no separate /orderstatus route.
   Polls every 10s for status updates.
   ============================================================ */

const OS_POLL_INTERVAL_MS = 10000;
const OS_MAX_AGE_HOURS = 24;
const OS_TERMINAL_STATUSES = ["served", "completed", "cancelled"];
const OS_TOKEN_RE = /^[a-z0-9]{2,20}$/;
const OS_SAFE_TEL_RE = /^tel:[+\d()\-. ]+$/;
const OS_STATUS_STEPS = ["new", "in_progress", "ready"];

function osGetStepIndex(status) {
  if (status === "accepted") return 1;
  const idx = OS_STATUS_STEPS.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function osGetStatusConfig(status, t) {
  const configs = {
    new: { label: t("order_status.status_new"), color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Package },
    accepted: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
    in_progress: { label: t("order_status.status_preparing"), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Clock },
    ready: { label: t("order_status.status_ready"), color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: Check },
    served: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
    completed: { label: t("order_status.status_served"), color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Check },
    cancelled: { label: t("order_status.status_cancelled"), color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  };
  return configs[status] || configs.new;
}

function OSStatusProgress({ currentStatus, t }) {
  const currentIdx = osGetStepIndex(currentStatus);
  const isCancelled = currentStatus === "cancelled";
  const isTerminal = OS_TERMINAL_STATUSES.includes(currentStatus) || currentStatus === "ready";

  const steps = [
    { key: "new", label: t("order_status.step_received") },
    { key: "in_progress", label: t("order_status.step_preparing") },
    { key: "ready", label: t("order_status.step_ready") },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 py-4">
        <XCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-600 font-medium">{t("order_status.status_cancelled")}</span>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200" />
        <div
          className="absolute top-4 left-8 h-0.5 bg-green-500 transition-all duration-500"
          style={{
            width: isTerminal
              ? "calc(100% - 4rem)"
              : `calc(${(currentIdx / (steps.length - 1)) * 100}% - ${currentIdx === 0 ? 0 : 2}rem)`,
          }}
        />
        {steps.map((step, idx) => {
          const isComplete = isTerminal || idx < currentIdx;
          const isCurrent = !isTerminal && idx === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isComplete
                    ? "bg-green-500 border-green-500"
                    : isCurrent
                      ? "bg-white border-orange-400 ring-4 ring-orange-100"
                      : "bg-white border-slate-200"
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  isComplete ? "text-green-600 font-medium" : isCurrent ? "text-orange-600 font-medium" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderStatusScreen({ token, partnerId: knownPartnerId, onBackToMenu, t }) {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [osLogoError, setOsLogoError] = useState(false);

  const {
    data: orderData,
    isLoading: loadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ["orderByToken", token],
    enabled: !!token && OS_TOKEN_RE.test(token),
    retry: 1,
    staleTime: OS_POLL_INTERVAL_MS,
    queryFn: async () => {
      const orders = await base44.entities.Order.filter({ public_token: token });
      if (!orders || orders.length === 0) return null;
      return orders[0];
    },
  });

  const order = orderData || null;
  const partnerId = order?.partner || knownPartnerId;
  const orderId = order?.id;
  const orderStatus = order?.status || "new";
  const isTerminal = OS_TERMINAL_STATUSES.includes(orderStatus);

  const isExpired = useMemo(() => {
    if (!order?.created_date) return false;
    const created = new Date(order.created_date);
    return Date.now() - created > OS_MAX_AGE_HOURS * 60 * 60 * 1000;
  }, [order?.created_date]);

  const { data: partner } = useQuery({
    queryKey: ["statusPartner", partnerId],
    enabled: !!partnerId,
    retry: 1,
    queryFn: async () => {
      const partners = await base44.entities.Partner.filter({ id: partnerId });
      return partners?.[0] || null;
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["statusOrderItems", orderId],
    enabled: !!orderId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.OrderItem.filter({ order: orderId });
    },
  });

  const { data: contactLinks = [] } = useQuery({
    queryKey: ["statusContactLinks", partnerId],
    enabled: !!partnerId,
    retry: 1,
    staleTime: Infinity,
    queryFn: async () => {
      return await base44.entities.PartnerContactLink.filter({ partner: partnerId });
    },
  });

  const phoneLink = useMemo(() => {
    return contactLinks.find(
      (link) => link.is_active !== false && typeof link.url === "string" && OS_SAFE_TEL_RE.test(link.url)
    );
  }, [contactLinks]);

  // Polling for status updates
  // Polling for status updates (closure variable instead of ref)
  useEffect(() => {
    if (!token || !order || isTerminal || isExpired) return;
    const id = setInterval(async () => {
      try {
        const result = await refetchOrder();
        if (result.data) setLastUpdated(new Date());
      } catch { /* retry on next poll */ }
    }, OS_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [token, order?.id, isTerminal, isExpired, refetchOrder]);

  // Set initial lastUpdated
  useEffect(() => {
    if (order && !lastUpdated) setLastUpdated(new Date());
  }, [order, lastUpdated]);

  // "seconds ago" counter — stops when order is terminal (P0 fix)
  useEffect(() => {
    if (!lastUpdated || isTerminal) return;
    const tick = () => setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastUpdated, isTerminal]);

  const formatPrice = (amount) => {
    if (amount == null) return "";
    const currency = partner?.currency || "";
    const symbol = partner?.currency_symbol || currency;
    const num = Number(amount);
    if (isNaN(num)) return String(amount);
    const formatted = num.toLocaleString("ru-RU");
    return symbol ? `${formatted} ${symbol}` : formatted;
  };

  const itemsTotal = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      const lineTotal = Number(item.line_total) || (Number(item.dish_price) * Number(item.quantity)) || 0;
      return sum + lineTotal;
    }, 0);
  }, [orderItems]);

  const displayTotal = order?.total_amount != null ? order.total_amount : itemsTotal;

  // Invalid token
  if (!token || !OS_TOKEN_RE.test(token)) {
    return (
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.no_token")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
              <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading
  if (loadingOrder) {
    return (
      <div className="fixed inset-0 z-[60] bg-white">
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Error / not found
  if (orderError || !order) {
    return (
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.not_found")}</h2>
              <p className="text-sm text-slate-500 mb-4">{t("order_status.check_link")}</p>
              <Button variant="outline" className="min-h-[44px]" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Expired
  if (isExpired) {
    return (
      <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{t("order_status.expired")}</h2>
              <Button variant="outline" className="min-h-[44px] mt-4" onClick={onBackToMenu}>{t("order_status.back_to_menu")}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main order status view
  const statusConfig = osGetStatusConfig(orderStatus, t);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-50 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Back button */}
        <button
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 min-h-[44px]"
          onClick={onBackToMenu}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("order_status.back_to_menu")}
        </button>

        {/* Restaurant header */}
        <div className="flex items-center gap-3 mb-6">
          {partner?.logo && !osLogoError && (
            <img
              src={partner.logo}
              alt={partner?.name ? `${partner.name} logo` : ""}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
              onError={() => setOsLogoError(true)}
            />
          )}
          {partner?.name && (
            <h1 className="text-base font-semibold text-slate-800">{partner.name}</h1>
          )}
        </div>

        {/* Order number + status badge */}
        <Card className={`mb-4 border ${statusConfig.border}`}>
          <CardContent className="p-5">
            {order.order_number != null && (
              <>
                <p className="text-sm text-slate-500 mb-1">{t("order_status.order_number")}</p>
                <p className="text-2xl font-bold text-slate-800 mb-4">#{order.order_number}</p>
              </>
            )}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </div>
            <OSStatusProgress currentStatus={orderStatus} t={t} />
            {lastUpdated && !isTerminal && (
              <p className="text-xs text-slate-400 mt-2">
                {t("order_status.last_updated")}: {secondsAgo < 5
                  ? t("order_status.just_now")
                  : t("order_status.seconds_ago", { seconds: secondsAgo })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Order items */}
        {orderItems.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-slate-600 mb-3">{t("order_status.your_order")}</p>
              <div className="space-y-2">
                {orderItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      {item.dish_name} <span className="text-slate-400">x{item.quantity}</span>
                    </span>
                    <span className="text-slate-700 font-medium tabular-nums">
                      {formatPrice(item.line_total != null ? item.line_total : item.dish_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-800">{t("order_status.total")}</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{formatPrice(displayTotal)}</span>
                </div>
              </div>
              {order.discount_amount > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  {t("order_status.discount")}: -{formatPrice(order.discount_amount)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact restaurant */}
        {phoneLink && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-3">{t("order_status.questions")}</p>
              <a
                href={phoneLink.url}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]"
              >
                <Phone className="w-5 h-5 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-600">{phoneLink.url.replace("tel:", "")}</span>
              </a>
            </CardContent>
          </Card>
        )}

        {/* Terminal / refresh info */}
        {isTerminal && (
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 mb-3">
              {orderStatus === "cancelled" ? t("order_status.order_cancelled_info") : t("order_status.order_complete_info")}
            </p>
          </div>
        )}
        {!isTerminal && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600"
              onClick={async () => {
                const result = await refetchOrder();
                if (result.data) setLastUpdated(new Date());
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {t("order_status.refresh")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   S82 BUG-S81-14: PICKUP/DELIVERY CHECKOUT DRAWER CONTENT
   Replaces fullscreen CheckoutView for pickup and delivery modes.
   Same form fields, rendered inside a bottom drawer.
   i18n keys: form.name, form.required, form.phone, form.phone_placeholder,
              form.address, form.comment, form.comment_placeholder,
              cart.your_order, cart.total, cart.send_order, cart.submitting
   ============================================================ */

function PickupDeliveryCheckoutContent({
  orderMode,
  cart,
  formatPrice,
  finalTotal,
  clientName, setClientName,
  clientPhone, handlePhoneChange, handlePhoneFocus,
  deliveryAddress, setDeliveryAddress,
  comment, setComment,
  errors,
  submitError,
  isSubmitting,
  handleSubmitOrder,
  onClose,
  t,
}) {
  const isSubmitDisabled =
    isSubmitting ||
    !clientName.trim() ||
    !clientPhone.trim() ||
    (orderMode === 'delivery' && !deliveryAddress.trim());

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sticky header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 shrink-0">
        <button
          className="flex items-center justify-center min-h-[44px] min-w-[44px] text-slate-500 hover:text-slate-700"
          onClick={onClose}
          aria-label={t('cart.back_to_menu')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-slate-800">{t('cart.your_order')}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Order items summary */}
        {cart.length > 0 && (
          <div className="space-y-2 pb-4 border-b border-slate-100">
            {cart.map((item) => (
              <div key={item.dishId} className="flex justify-between items-center text-sm">
                <span className="text-slate-700">
                  {item.name}{' '}
                  <span className="text-slate-400">x{item.quantity}</span>
                </span>
                <span className="font-medium text-slate-700 tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-3">
          {/* Name */}
          <div data-field="clientName">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.name')} <span className="text-red-500">{t('form.required')}</span>
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={t('form.name')}
              className={errors.clientName ? 'border-red-300' : ''}
            />
            {errors.clientName && (
              <p className="text-xs text-red-500 mt-1">{errors.clientName}</p>
            )}
          </div>

          {/* Phone */}
          <div data-field="clientPhone">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.phone')} <span className="text-red-500">{t('form.required')}</span>
            </label>
            <Input
              type="tel"
              inputMode="tel"
              value={clientPhone}
              onChange={handlePhoneChange}
              onFocus={handlePhoneFocus}
              placeholder={t('form.phone_placeholder')}
              className={errors.clientPhone ? 'border-red-300' : ''}
            />
            {errors.clientPhone && (
              <p className="text-xs text-red-500 mt-1">{errors.clientPhone}</p>
            )}
          </div>

          {/* Delivery address — only for delivery mode */}
          {orderMode === 'delivery' && (
            <div data-field="deliveryAddress">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {t('form.address')} <span className="text-red-500">{t('form.required')}</span>
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={t('form.address')}
                className={errors.deliveryAddress ? 'border-red-300' : ''}
              />
              {errors.deliveryAddress && (
                <p className="text-xs text-red-500 mt-1">{errors.deliveryAddress}</p>
              )}
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t('form.comment')}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('form.comment_placeholder')}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}
      </div>

      {/* Sticky footer: total + submit */}
      <div className="shrink-0 px-4 pt-3 pb-4 border-t border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-700">{t('cart.total')}:</span>
          <span className="font-bold text-indigo-600 tabular-nums text-lg">
            {formatPrice(finalTotal)}
          </span>
        </div>
        <Button
          className="w-full h-12 text-base"
          onClick={handleSubmitOrder}
          disabled={isSubmitDisabled}
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          {isSubmitting ? t('cart.submitting') : t('cart.send_order')}
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
   TABLE CODE VERIFICATION HELPERS (simplified)
   P0-3: Only use Table.code for verification
   ============================================================ */

// Extract digits only from any value
const digits = (v) => String(v || "").replace(/\D/g, "");

// Normalize link fields from Base44 (CODE-026)
function getLinkId(field) {
  if (field == null) return null;
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

// Helper: format order creation time (handles created_at or created_date)
function formatOrderTime(order) {
  const ts = order?.created_at || order?.created_date || order?.createdAt || null;
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function X() {
  const { lang, setLang, t } = useI18n();
  const location = useLocation();
  const queryClient = useQueryClient();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // partner required
  const partnerParamRaw = (searchParams.get("partner") || searchParams.get("p") || "").trim();

  // lang param from URL
  const langParam = (searchParams.get("lang") || "").trim().toUpperCase();

  // UI state
  const [orderMode, setOrderMode] = useState(() => {
    const modeParam = new URLSearchParams(location.search).get("mode");
    return normalizeMode(modeParam);
  });

  // GAP-02: Restore order status view from URL param (?track=<token>)
  const initialTrackToken = useMemo(() => {
    const p = new URLSearchParams(location.search).get("track");
    return p && /^[a-z0-9]{2,20}$/.test(p) ? p : null;
  }, []);

  const [view, setView] = useState(initialTrackToken ? "orderstatus" : "menu"); /* menu | checkout | confirmation | orderstatus */

  // GAP-01: Order Confirmation Screen state
  const [confirmationData, setConfirmationData] = useState(null);

  // GAP-02: Order Status tracking token (refresh-safe via ?track= URL param)
  const [orderStatusToken, setOrderStatusToken] = useState(initialTrackToken);
  
  // TASK-260203-01: Drawer state
  const [drawerMode, setDrawerMode] = useState(null); // 'cart' | 'checkout' | null
  // S79: Drawer snap point — mid (0.6) or full (0.9)
  const SNAP_MID = 0.6;
  const SNAP_FULL = 0.9;
  const [drawerSnapPoint, setDrawerSnapPoint] = useState(SNAP_MID);
  
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [cart, setCart] = useState([]); // { dishId, name, price, quantity }
  const cartRestoredRef = useRef(false);
  // S84 BUG-S81-01: touch Y for custom swipe-to-close drag handle
  const drawerDragStartY = useRef(0);

  // S82 BUG-S81-03: Auto-expand to SNAP_FULL when cart has items so CTA button is always visible.
  // SNAP_MID (60%) only when cart is empty (receipt mode — no CTA needed).
  // S82 BUG-S81-14: checkout drawer always uses SNAP_FULL (form needs full height).
  useEffect(() => {
    if (drawerMode === 'cart') {
      setDrawerSnapPoint(cart.length > 0 ? SNAP_FULL : SNAP_MID);
    } else if (drawerMode === 'checkout') {
      setDrawerSnapPoint(SNAP_FULL);
    }
  }, [drawerMode, cart.length]);

  // Restaurant logo error state (hide on broken URL)
  const [logoError, setLogoError] = useState(false);

  // Mobile breakpoint detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  // Mobile layout preference (tile | list) — S72: default list for mobile-first UX
  const [mobileLayout, setMobileLayout] = useState('list');

  // Redirect banner state
  const [redirectBanner, setRedirectBanner] = useState(null);

  // Dish reviews modal state
  const [selectedDishId, setSelectedDishId] = useState(null);

  // Form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Guest code (4-digit code for showing to waiter)
  const [guestCode, setGuestCode] = useState(null);

  // Hall UI state (not in session hook)
  const [splitType, setSplitType] = useState('single'); // 'single' | 'all'
  const [otherGuestsExpanded, setOtherGuestsExpanded] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  // Bill request state
  const [billRequested, setBillRequested] = useState(false);
  const [billCooldown, setBillCooldown] = useState(false);

  // Rating flow state (TASK-260130-09)
  const [hasRatedInSession, setHasRatedInSession] = useState(false);
  const [ratingSavingByItemId, setRatingSavingByItemId] = useState({});

  // Partner fetch (id or slug) - MUST BE FIRST before any partner dependencies
  const { data: partner, isLoading: loadingPartner } = useQuery({
    queryKey: ["publicPartner", partnerParamRaw],
    enabled: !!partnerParamRaw,
    retry: shouldRetry,
    queryFn: async () => {
      const p = partnerParamRaw;
      if (!p) return null;

      const byIdFirst = looksLikePartnerId(p);

      try {
        const res = await base44.entities.Partner.filter(byIdFirst ? { id: p } : { slug: p });
        if (res?.[0]) return res[0];
      } catch (e) {
        console.warn("Partner primary lookup failed", e);
      }

      try {
        const res2 = await base44.entities.Partner.filter(byIdFirst ? { slug: p } : { id: p });
        return res2?.[0] || null;
      } catch (e) {
        console.warn("Partner fallback lookup failed", e);
        return null;
      }
    },
  });

  // Derived logo values (after partner query)
  const logoUrl = typeof partner?.logo === "string" ? partner.logo.trim() : "";
  const showLogo = !!logoUrl && !logoError;

  // Breakpoint listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Load mobile layout preference from localStorage
  useEffect(() => {
    if (!partner) return;
    
    const partnerKey = partner.id || partner._id || partner.slug || partner.code;
    if (!partnerKey) return;
    
    try {
      const storageKey = `menuMobileLayout:${partnerKey}`;
      const saved = localStorage.getItem(storageKey);
      
      if (saved === 'tile' || saved === 'list') {
        setMobileLayout(saved);
      } else {
        // Default based on partner setting — S72: default list unless partner set 2-col grid
        const defaultLayout = (partner.menu_grid_mobile ?? 1) === 2 ? 'tile' : 'list';
        setMobileLayout(defaultLayout);
      }
    } catch (e) {
      console.warn('Failed to load mobile layout preference', e);
    }
  }, [partner?.id, partner?._id, partner?.slug, partner?.code]);

  // Save mobile layout preference to localStorage
  const handleSetMobileLayout = (layout) => {
    setMobileLayout(layout);
    
    if (!partner) return;
    
    const partnerKey = partner.id || partner._id || partner.slug || partner.code;
    if (!partnerKey) return;
    
    try {
      const storageKey = `menuMobileLayout:${partnerKey}`;
      localStorage.setItem(storageKey, layout);
    } catch (e) {
      console.warn('Failed to save mobile layout preference', e);
    }
  };

  // Save cart to localStorage on every change
  // BUG-PM-005: guard against saving empty cart before restore completes
  useEffect(() => {
    if (!partner?.id) return;
    if (!cartRestoredRef.current) return;
    saveCartToStorage(partner.id, cart);
  }, [cart, partner?.id]);

  // Restore cart from localStorage on page load (once)
  // BUG-PM-005: mark restored before setCart to prevent save effect from firing on stale empty cart
  useEffect(() => {
    if (cartRestoredRef.current) return;
    if (!partner?.id) return;
    cartRestoredRef.current = true;

    const savedCart = getCartFromStorage(partner.id);
    if (savedCart && savedCart.length > 0 && cart.length === 0) {
      setCart(savedCart);
    }
  }, [partner?.id]);

  // Scroll refs
  const sectionRefs = useRef({});
  const chipRefs = useRef({});
  const listTopRef = useRef(null);
  const isManualScroll = useRef(false);
  const submitLockRef = useRef(false); // CODE-024: protect from double-tap
  const viewTransitionTimerRef = useRef(null);

  // Cleanup view transition timer on unmount
  useEffect(() => {
    return () => {
      if (viewTransitionTimerRef.current) clearTimeout(viewTransitionTimerRef.current);
    };
  }, []);

  // GAP-01: Dismiss confirmation screen and return to menu
  const dismissConfirmation = useCallback(() => {
    setConfirmationData(null);
    setOrderStatusToken(null);
    setView("menu");
  }, []);

  // GAP-01: Show confirmation screen (no auto-dismiss — user navigates via buttons)
  const showConfirmation = useCallback((data) => {
    setConfirmationData(data);
    setView("confirmation");
    setDrawerMode(null);
  }, []);

  // GAP-02: Navigate from confirmation to order status tracking
  const handleTrackOrder = useCallback((token) => {
    setConfirmationData(null);
    setOrderStatusToken(token);
    setView("orderstatus");
    // Mirror token into URL for refresh resilience
    const url = new URL(window.location.href);
    url.searchParams.set("track", token);
    window.history.replaceState({}, "", url.toString());
  }, []);

  // GAP-02: Dismiss order status and return to menu
  const dismissOrderStatus = useCallback(() => {
    setOrderStatusToken(null);
    setView("menu");
    // Remove track param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("track");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Change 2a/2c: Scroll to top when switching to checkout, confirmation, or orderstatus
  useEffect(() => {
    if (view === "checkout" || view === "confirmation" || view === "orderstatus") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [view]);

  // Language change handler (updates URL)
  const handleLangChange = (newLang) => {
    setLang(newLang);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLang);
    window.history.replaceState({}, "", url.toString());
  };

  // Contact link click handler (SEC-021: XSS protection + noopener)
  const handleContactClick = (link) => {
    const url = String(link.url || "");
    if (!isSafeUrl(url)) {
      toast.error(t('error.invalid_link'), { id: 'mm1' });
      return;
    }
    if (url.startsWith("tel:") || url.startsWith("mailto:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Hall table verification hook
  const {
    tableCodeParam,
    resolvedTable,
    isHallMode,
    tableCodeInput,
    setTableCodeInput,
    isVerifyingCode,
    verifiedByCode,
    verifiedTableId,
    verifiedTable,
    codeVerificationError,
    verifyTableCode,
  } = useHallTable({ partner, location, orderMode, t });

  // BUG-S76-04: Show code verification error as auto-dismissing toast instead of persistent banner
  useEffect(() => {
    if (codeVerificationError) {
      toast.error(codeVerificationError, { duration: 4000 });
    }
  }, [codeVerificationError]);

  // Helper for saving table selection (used by help requests and other features)
  const saveTableSelection = (partnerId, tableId) => {
    if (!partnerId || !tableId) return;
    try {
      const key = `menuApp_table_${partnerId}`;
      localStorage.setItem(
        key,
        JSON.stringify({ partnerId, tableId, timestamp: Date.now() })
      );
    } catch (e) {
      console.error("Failed to save table", e);
    }
  };

  // Hall settings (simplified - only guest code)
  const hallGuestCodeEnabled = partner?.hall_guest_code_enabled === true;

  // Set language from URL param or partner default
  useEffect(() => {
    if (!partner) return;
    
    const partnerDefault = partner.default_language || "RU";
    const enabledLangs = Array.isArray(partner.enabled_languages) && partner.enabled_languages.length > 0
      ? partner.enabled_languages
      : [partnerDefault];
    
    if (langParam && enabledLangs.includes(langParam)) {
      if (lang !== langParam) setLang(langParam);
    } else if (!enabledLangs.includes(lang)) {
      setLang(partnerDefault);
    }
  }, [partner?.id, partner?.default_language, langParam]);
  // P0-7: Removed hallTableSelectEnabled - no dropdown

  // P0-1: Table verified ONLY when actually resolved or verified by code input
  // Removed hasTableInUrl from condition - URL param alone doesn't mean verified
  const isTableVerified = isHallMode && (!!resolvedTable?.id || verifiedByCode);

  // P0-7: Removed activeTables query - no dropdown needed

  // P0-2: currentTableId only from resolved table or code verification
  const currentTableId = resolvedTable?.id || verifiedTableId || null;
  
  // Current table object for display (from QR resolve or code verify)
  const currentTable = resolvedTable || verifiedTable || null;

  // Help / ServiceRequest hook
  const {
    isHelpModalOpen,
    setIsHelpModalOpen,
    selectedHelpType,
    helpComment,
    setHelpComment,
    isSendingHelp,
    helpSubmitError,
    fabSuccess,
    hasActiveRequest,
    handleOpenHelpModal,
    handlePresetSelect,
    submitHelpRequest,
  } = useHelpRequests({ partner, currentTableId, t, toast, isRateLimitError, saveTableSelection });

  // OrderStages for the partner (for stage_id assignment)
  const { data: orderStages = [] } = useQuery({
    queryKey: ["orderStages", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.OrderStage.filter({ 
      partner: partner.id, 
      is_active: true 
    }),
    staleTime: 5 * 60 * 1000,
  });

  // P0-4: Menu data - filter by partner on server side
  const { data: allDishes, isLoading: loadingDishes, error: dishesError } = useQuery({
    queryKey: ["dishes", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.Dish.filter({ partner: partner.id }),
  });

  const { data: allCategories, error: categoriesError } = useQuery({
    queryKey: ["categories", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.Category.filter({ partner: partner.id }),
  });

  // P0-4: Warning if limit reached
  useEffect(() => {
    if (allDishes?.length === 100) {
      console.warn("Dish limit reached (100), menu may be incomplete");
    }
    if (allCategories?.length === 100) {
      console.warn("Category limit reached (100), menu may be incomplete");
    }
  }, [allDishes?.length, allCategories?.length]);

  const { data: partnerContactsRaw = [] } = useQuery({
    queryKey: ["partnerContacts", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.PartnerContacts.filter({ partner: partner.id }),
    initialData: [],
  });

  const { data: contactLinksRaw = [] } = useQuery({
    queryKey: ["partnerContactLinks", partner?.id],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: () => base44.entities.PartnerContactLink.filter({ partner: partner.id }),
    initialData: [],
  });

  // Fetch translations
  const { data: categoryTranslations } = useQuery({
    queryKey: ["categoryTranslations", partner?.id, lang],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: async () => {
      try {
        return await base44.entities.CategoryTranslation.filter({
          partner: partner.id,
          lang: lang
        });
      } catch (e) {
        console.warn("Failed to fetch category translations", e);
        return [];
      }
    },
    initialData: []
  });

  const { data: dishTranslations } = useQuery({
    queryKey: ["dishTranslations", partner?.id, lang],
    enabled: !!partner?.id,
    retry: shouldRetry,
    queryFn: async () => {
      try {
        return await base44.entities.DishTranslation.filter({
          partner: partner.id,
          lang: lang
        });
      } catch (e) {
        console.warn("Failed to fetch dish translations", e);
        return [];
      }
    },
    initialData: []
  });

  // Dish ratings/reviews
  const showReviews = partner?.show_dish_reviews === true;
  const partnerId = partner?.id || partner?._id;
  
  const { data: partnerFeedbacks = [] } = useQuery({
    queryKey: ["dishFeedbacksRecent", partnerId],
    queryFn: () => base44.entities.DishFeedback.filter({ partner: partnerId }, "-created_date", 100),
    enabled: showReviews && !!partnerId,
    retry: shouldRetry,
    staleTime: 5 * 60 * 1000,
  });

  // Build translation lookup maps
  const categoryTransMap = useMemo(() => {
    const map = {};
    (categoryTranslations || []).forEach(tr => {
      map[tr.category] = tr.name;
    });
    return map;
  }, [categoryTranslations]);

  const dishTransMap = useMemo(() => {
    const map = {};
    (dishTranslations || []).forEach(tr => {
      map[tr.dish] = {
        name: tr.name,
        description: tr.description
      };
    });
    return map;
  }, [dishTranslations]);

  // Aggregate dish ratings
  const dishRatings = useMemo(() => {
    if (!showReviews || !partnerFeedbacks?.length) return {};
    const tmp = {}; // { [dishId]: { sum, count } }

    for (const f of partnerFeedbacks) {
      const dishId = typeof f.dish === "object" ? f.dish?.id : f.dish;
      const rating = Number(f.rating);
      if (!dishId || !rating) continue;

      if (!tmp[dishId]) tmp[dishId] = { sum: 0, count: 0 };
      tmp[dishId].sum += rating;
      tmp[dishId].count += 1;
    }

    const out = {};
    for (const dishId of Object.keys(tmp)) {
      out[dishId] = {
        avg: tmp[dishId].sum / tmp[dishId].count,
        count: tmp[dishId].count,
      };
    }
    return out;
  }, [showReviews, partnerFeedbacks]);

  // Load reviews for selected dish (modal)
  const { data: selectedDishReviews = [], isLoading: loadingDishReviews } = useQuery({
    queryKey: ["dishReviews", partnerId, selectedDishId],
    queryFn: () => base44.entities.DishFeedback.filter(
      { partner: partnerId, dish: selectedDishId },
      "-created_date",
      20
    ),
    enabled: showReviews && !!partnerId && !!selectedDishId,
    retry: shouldRetry,
    staleTime: 5 * 60 * 1000,
  });

  // Helper functions to get translated content with fallback
  const getCategoryName = (category) => {
    return categoryTransMap[category.id] || category.name;
  };

  const getDishName = (dish) => {
    return dishTransMap[dish.id]?.name || dish.name;
  };

  const getDishDescription = (dish) => {
    const translated = dishTransMap[dish.id]?.description;
    if (translated) return translated;
    return getCleanDescription(dish.description);
  };

  // P1-8: Sync cart names when language changes
  useEffect(() => {
    if (!cart.length || !dishTransMap || Object.keys(dishTransMap).length === 0) return;
    
    setCart(prev => prev.map(item => {
      const translated = dishTransMap[item.dishId];
      if (translated?.name && translated.name !== item.name) {
        return { ...item, name: translated.name };
      }
      return item;
    }));
  }, [lang, dishTransMap]);

  const partnerContacts = partnerContactsRaw?.[0] || null;
  const viewMode = partner?.contacts_view_mode || partnerContacts?.view_mode || "full";

  const activeContactLinks = useMemo(() => {
    return contactLinksRaw
      .filter((link) => link.is_active !== false)
      .sort((a, b) => {
        const oa = a?.sort_order;
        const ob = b?.sort_order;
        if (oa == null && ob == null) return 0;
        if (oa == null) return 1;
        if (ob == null) return -1;
        return oa - ob;
      });
  }, [contactLinksRaw]);

  // Enabled languages for switcher
  const enabledLanguages = useMemo(() => {
    const partnerDefault = partner?.default_language || "RU";
    const enabled = partner?.enabled_languages;
    if (Array.isArray(enabled) && enabled.length > 0) {
      return enabled;
    }
    return [partnerDefault];
  }, [partner?.default_language, partner?.enabled_languages]);

  // Currency hook
  const {
    activeCurrency,
    enabledCurrencies,
    defaultCurrency,
    currencyRates,
    formatPrice,
    handleCurrencyChange,
    CURRENCY_SYMBOLS,
  } = useCurrency({ partner, location });

  // P0-4: Simplified - server already filters by partner
  const dishesForPartner = useMemo(() => {
    if (!allDishes) return [];
    return allDishes.filter((d) => !isDishArchived(d));
  }, [allDishes]);

  const categoriesForPartner = useMemo(() => {
    return allCategories || [];
  }, [allCategories]);

  // Get dish name for modal (moved here after dishesForPartner is declared)
  const selectedDish = useMemo(() => {
    if (!selectedDishId) return null;
    return dishesForPartner.find(d => d.id === selectedDishId);
  }, [selectedDishId, dishesForPartner]);

  // Channel visibility
  const channels = useGuestChannels(partner, dishesForPartner, categoriesForPartner);

  // Get visible mode tabs
  const visibleModeTabs = useMemo(() => {
    const tabs = [];
    
    if (channels.hall.visible) {
      tabs.push({
        id: "hall",
        label: t('mode.hall'),
        Icon: Store,
        available: channels.hall.available,
        disabled: channels.hall.disabled,
      });
    }
    
    if (channels.pickup.visible) {
      tabs.push({
        id: "pickup",
        label: t('mode.pickup'),
        Icon: Package,
        available: channels.pickup.available,
        disabled: channels.pickup.disabled,
      });
    }
    
    if (channels.delivery.visible) {
      tabs.push({
        id: "delivery",
        label: t('mode.delivery'),
        Icon: Truck,
        available: channels.delivery.available,
        disabled: channels.delivery.disabled,
      });
    }
    
    return tabs;
  }, [channels, t]);

  // Check if current mode is valid and redirect if needed
  useEffect(() => {
    if (!partner || loadingDishes) return;

    const currentModeChannel = channels[orderMode];
    
    if (!currentModeChannel?.visible || !currentModeChannel?.available) {
      const firstAvailable = visibleModeTabs.find((tab) => tab.available);
      
      if (firstAvailable && firstAvailable.id !== orderMode) {
        const originalMode = orderMode;
        setOrderMode(firstAvailable.id);
        
        const url = new URL(window.location.href);
        url.searchParams.set("mode", firstAvailable.id);
        window.history.replaceState({}, "", url.toString());
        
        const modeLabels = {
          hall: t('mode.hall'),
          pickup: t('mode.pickup'),
          delivery: t('mode.delivery'),
        };
        setRedirectBanner({
          originalMode: modeLabels[originalMode] || originalMode,
          newMode: modeLabels[firstAvailable.id] || firstAvailable.id,
        });
        
        setTimeout(() => setRedirectBanner(null), 5000);
      }
    }
  }, [partner, loadingDishes, channels, orderMode, visibleModeTabs, t]);

  const visibleDishes = useMemo(() => {
    return dishesForPartner.filter((dish) => isDishEnabledForMode(dish, orderMode));
  }, [dishesForPartner, orderMode]);

  const sortedCategoriesAll = useMemo(() => sortCategoriesStable(categoriesForPartner), [categoriesForPartner]);

  const visibleCategoryIds = useMemo(() => {
    return getVisibleCategoryIds({
      categories: sortedCategoriesAll,
      dishes: visibleDishes,
      mode: orderMode,
      includeDisabledCategories: false,
    });
  }, [sortedCategoriesAll, visibleDishes, orderMode]);

  const sortedCategories = useMemo(() => {
    return sortedCategoriesAll.filter((c) => visibleCategoryIds.includes(c.id));
  }, [sortedCategoriesAll, visibleCategoryIds]);

  const groupedDishes = useMemo(() => {
    const dishesByCategory = buildDishesByCategory({
      categories: sortedCategoriesAll,
      dishes: visibleDishes,
      mode: orderMode,
      includeDisabledCategories: false,
    });

    const groups = {};
    for (const [catId, dishList] of dishesByCategory.entries()) {
      if (catId === "__uncat__") {
        if (dishList.length > 0) groups["no-category"] = dishList;
      } else {
        if (dishList.length > 0) groups[catId] = dishList;
      }
    }

    return groups;
  }, [sortedCategoriesAll, visibleDishes, orderMode]);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Loyalty hook
  const {
    customerEmail,
    setCustomerEmail,
    loyaltyAccount,
    setLoyaltyAccount,
    loyaltyLoading,
    redeemedPoints,
    setRedeemedPoints,
    discountAmount,
    pointsDiscountAmount,
    finalTotal,
    earnedPoints,
    maxRedeemPoints,
  } = useLoyalty({ partner, cartTotalAmount });

  // Loyalty visibility flags
  const loyaltyEnabled = partner?.loyalty_enabled === true;
  const discountEnabled = partner?.discount_enabled === true;
  const showLoyaltySection = (loyaltyEnabled || discountEnabled) && cart.length > 0;

  // TableSession hook
  const {
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
  } = useTableSession({
    partner,
    isHallMode,
    isTableVerified,
    currentTableId,
    orderStages,
    cartTotalAmount,
    getLinkId,
    isRateLimitError,
    t,
  });

  // Reviews hook
  const {
    reviewedItems,
    draftRatings,
    updateDraftRating,
    reviewableItems,
    otherGuestsReviewableItems,
    openReviewDialog,
    reviewDialogOpen,
    setReviewDialogOpen,
    reviewingItems,
    ratings,
    setRatings,
    submittingReview,
    handleSubmitReviews,
  } = useReviews({
    partner,
    currentTableId,
    currentGuest,
    myOrders,
    sessionOrders,
    itemsByOrder,
    stagesMap,
    getLinkId,
    loyaltyAccount,
    setLoyaltyAccount,
    toast,
    t,
  });

  // Rating-first flow (TASK-260130-09-FIX4): show prompt after first draft rating
  // MOVED HERE after useReviews to avoid TDZ (draftRatings, reviewableItems must exist)
  const hasAnyDraftRating = !!draftRatings && Object.keys(draftRatings).length > 0;
  const showRatingBlock = reviewableItems?.length > 0;
  const showLoginPromptAfterRating = loyaltyEnabled && !loyaltyAccount && showRatingBlock && hasAnyDraftRating;

  // Handle instant dish rating (save on star click)
  const handleRateDish = async ({ itemId, dishId, orderId, rating }) => {
    if (!dishId || !rating || ratingSavingByItemId[itemId]) return;
    
    setRatingSavingByItemId(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await base44.entities.DishFeedback.create({
        partner: partner.id,
        dish: dishId,
        order: orderId,
        rating: rating,
        reviewed_by: currentGuest?.id || 'guest',
        order_item: itemId,
        guest: currentGuest?.id,
        author_type: loyaltyAccount ? 'loyalty' : 'anonymous',
        loyalty_account: loyaltyAccount?.id || undefined,
        points_awarded: 0,
      });
      
      toast.success(t('review.thanks') || 'Спасибо за оценку!', { id: 'mm1' });
      
      // Track that user has rated in this session
      setHasRatedInSession(true);
      
      // Refresh ratings
      queryClient.invalidateQueries({ queryKey: ["dishFeedbacksRecent", partnerId] });
      
    } catch (err) {
      console.error('Failed to save rating:', err);
      toast.error(t('error.save_failed') || 'Ошибка сохранения', { id: 'mm1' });
    } finally {
      setRatingSavingByItemId(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Show cart button in hall mode: always when table verified, or when cart has items (even before verification)
  // TASK-260201-01: StickyBar виден ВСЕГДА при верифицированном столе
  // Это решает проблему F5 — не нужно ждать восстановления session/orders
  const showCartButton = isHallMode && (isTableVerified || (cart?.length || 0) > 0);

  // After F5, table is verified from localStorage but session data is still loading from server
  // Time-bounded: after 3s assume no session exists (prevents permanent "loading" for new visits)
  const [sessionCheckTimedOut, setSessionCheckTimedOut] = useState(false);
  useEffect(() => {
    if (!isTableVerified || tableSession) return;
    const timer = setTimeout(() => setSessionCheckTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [isTableVerified, tableSession]);
  const isSessionLoading = isTableVerified && !tableSession && !sessionCheckTimedOut;

  // Hall StickyBar mode: определяем что показывать
  const hallStickyMode =
    (cart?.length || 0) > 0
      ? "cart"
      : (myOrders?.length || 0) > 0
        ? "myBill"
        : (sessionOrders?.length || 0) > 0
          ? "tableOrders"
          : "cartEmpty";

  // Hall StickyBar label: текст кнопки
  const hallStickyButtonLabel =
    hallStickyMode === "cart"
      ? t("cart.checkout")
      : hallStickyMode === "myBill"
        ? (t("cart.my_bill") || "Мой счёт")
        : hallStickyMode === "tableOrders"
          ? (t("cart.table_orders") || "Заказы стола →")
          : isSessionLoading
            ? (t("common.loading") || "Загрузка...")
            : (t("cart.view") || "Открыть");

  // Hall StickyBar: заголовок (для режимов без корзины)
  const hallStickyModeLabel = 
    hallStickyMode === "myBill" 
      ? (t("cart.my_bill") || "📋 Мой счёт") 
      : hallStickyMode === "tableOrders" 
        ? (t("cart.table_orders") || "📋 Заказы стола") 
        : (t("cart.your_orders") || "Ваши заказы");

  // Hall StickyBar: сумма для показа
  const hallStickyBillTotal = 
    hallStickyMode === "myBill" 
      ? formatPrice(myBill.total) 
      : hallStickyMode === "tableOrders" 
        ? formatPrice(tableTotal) 
        : "";

  // Hall StickyBar: показывать ли сумму
  const hallStickyShowBillAmount = hallStickyMode === "myBill" || hallStickyMode === "tableOrders";

  // Hall StickyBar: loading state
  const hallStickyIsLoadingBill = 
    (hallStickyMode === "myBill" || hallStickyMode === "tableOrders") && 
    (sessionItems.length === 0 && sessionOrders.length > 0);

  // Generate guest code for Hall mode (if enabled)
  useEffect(() => {
    if (!isHallMode || !hallGuestCodeEnabled) return;
    
    try {
      // P2-2: Should be tied to partner, but keeping simple for now
      let code = localStorage.getItem("menu_guest_code");
      if (!code) {
        code = String(Math.floor(1000 + Math.random() * 9000));
        localStorage.setItem("menu_guest_code", code);
      }
      setGuestCode(code);
    } catch (e) {
      console.error("Failed to init guest code", e);
    }
  }, [isHallMode, hallGuestCodeEnabled]);

  // P0-2: Removed legacy table_id/table_slug handling
  // Only explicit table code from URL triggers hall mode verification
  useEffect(() => {
    if (tableCodeParam && orderMode !== "hall") {
      setOrderMode("hall");
    }
  }, [tableCodeParam, orderMode]);

  // Scroll spy
  useEffect(() => {
    if (view !== "menu") return;

    let rafId;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      rafId = window.requestAnimationFrame(() => {
        if (isManualScroll.current) {
          ticking = false;
          return;
        }

        if (window.scrollY < 50) {
          setActiveCategoryKey("all");
          ticking = false;
          return;
        }

        let currentActive = "all";
        for (const cat of sortedCategories) {
          const el = sectionRefs.current[cat.id];
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top < SCROLL_SPY_OFFSET_PX) currentActive = cat.id;
        }

        setActiveCategoryKey(currentActive);
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [sortedCategories, view]);

  useEffect(() => {
    if (view !== "menu") return;
    const chip = chipRefs.current[activeCategoryKey];
    if (chip) chip.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  }, [activeCategoryKey, view]);

  const handleCategoryClick = (key) => {
    isManualScroll.current = true;
    setActiveCategoryKey(key);

    if (key === "all") listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    else sectionRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      isManualScroll.current = false;
    }, MANUAL_SCROLL_LOCK_MS);
  };



  const handleModeChange = (mode) => {
    const channel = channels[mode];
    if (!channel?.available) {
      return;
    }

    const normalized = normalizeMode(mode);
    setOrderMode(normalized);

    const url = new URL(window.location.href);
    url.searchParams.set("mode", normalized);
    window.history.replaceState({}, "", url.toString());

    try {
      localStorage.setItem("menu_preview_mode", normalized);
    } catch {}

    setView("menu");
    setErrors({});
    setSubmitError(null);
    setRedirectBanner(null);
  };

  // Cart handlers - P1-8: use translated name
  const addToCart = (dish) => {
    const translatedName = getDishName(dish);
    setCart((prev) => {
      const existing = prev.find((i) => i.dishId === dish.id);
      if (existing) {
        return prev.map((i) => (i.dishId === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { 
        dishId: dish.id, 
        name: translatedName, 
        originalName: dish.name,
        price: dish.price, 
        quantity: 1 
      }];
    });
  };

  const updateQuantity = (dishId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.dishId === dishId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCustomerEmail('');
    setLoyaltyAccount(null);
    setRedeemedPoints(0);
  };

  // Check bill cooldown on mount
  useEffect(() => {
    if (currentTableId) {
      setBillCooldown(isBillOnCooldown(currentTableId));
    }
  }, [currentTableId]);

  // Debug mode - moved BEFORE early returns to maintain hook order
  const isDebugGuestItems = searchParams.get('debug') === 'guestItems';

  useEffect(() => {
    if (!isDebugGuestItems) return;
    
    console.log('=== GUEST ITEMS DEBUG ===');
    console.log('currentGuest:', currentGuest?.id, currentGuest);
    console.log('sessionGuests count:', sessionGuests.length, sessionGuests.map(g => ({ id: g.id, name: g.name, guest_number: g.guest_number })));
    console.log('sessionOrders count:', sessionOrders.length);
    console.log('sessionItems count:', sessionItems.length);
    console.log('itemsByOrder size:', itemsByOrder.size);
    
    const guestItemsMap = new Map();
    sessionItems.forEach(item => {
      const orderId = getLinkId(item.order);
      const order = sessionOrders.find(o => o.id === orderId);
      const guestId = getLinkId(order?.guest);
      if (!guestItemsMap.has(guestId)) guestItemsMap.set(guestId, []);
      guestItemsMap.get(guestId).push(item);
    });
    
    console.log('Items per guest:', Object.fromEntries(guestItemsMap));
    
    const first10 = sessionItems.slice(0, 10);
    console.log('First 10 items:', first10.map(item => {
      const orderId = getLinkId(item.order);
      const order = sessionOrders.find(o => o.id === orderId);
      const guestId = getLinkId(order?.guest);
      const stageId = typeof order?.stage_id === 'object' 
        ? (order.stage_id?.id ?? order.stage_id?._id) 
        : order?.stage_id;
      const stage = stageId ? stagesMap.get(String(stageId)) : null;
      return {
        itemId: item.id,
        dish: item.dish_name,
        orderId,
        guestId,
        orderStatus: order?.status,
        stageCode: stage?.internal_code,
        visible: guestId === currentGuest?.id ? 'YES' : 'other guest'
      };
    }));
    console.log('=========================');
  }, [isDebugGuestItems, currentGuest?.id, sessionGuests, sessionOrders, sessionItems, itemsByOrder, stagesMap]);

  // P0-7: Removed handleTableSelection - no dropdown

  // Phone input
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (!val) {
      setClientPhone("");
      return;
    }
    const hasPlus = val.startsWith("+");
    const digitsOnly = val.replace(/\D/g, "");
    setClientPhone(hasPlus ? "+" + digitsOnly : digitsOnly);
  };

  const handlePhoneFocus = () => {
    if (!clientPhone) setClientPhone("+");
  };

  const validate = () => {
    const newErrors = {};
    const raw = (clientPhone || "").trim();

    const checkPhone = () => {
      if (!/^\+?\d*$/.test(raw)) return t('error.phone_invalid');
      const digitsCount = raw.replace(/\D/g, "").length;
      if (digitsCount < 8) return t('error.phone_short');
      if (digitsCount > 15) return t('error.phone_long');
      return null;
    };

    if (orderMode === "hall") {
      // P0-1: Hall mode - table MUST be verified with real ID
      if (!currentTableId) {
        newErrors.tableSelection = t('error.table_required');
      }
      if (raw) {
        const err = checkPhone();
        if (err) newErrors.clientPhone = err;
      }
    } else {
      if (!clientName.trim()) newErrors.clientName = t('error.name_required');

      if (!raw) newErrors.clientPhone = t('error.phone_required');
      else {
        const err = checkPhone();
        if (err) newErrors.clientPhone = err;
      }

      if (orderMode === "delivery" && !deliveryAddress.trim()) {
        newErrors.deliveryAddress = t('error.address_required');
      }
    }

    setErrors(newErrors);
    // Change 2b: Scroll to first error field on validation failure
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0];
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-field="${firstKey}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
    return Object.keys(newErrors).length === 0;
  };

  // P1-4: Anti-spam with partner filter
  const checkRateLimit = async () => {
    if (!clientPhone) return true;

    try {
      const recentOrders = await base44.entities.Order.filter({
        partner: partner.id,
        client_phone: clientPhone,
      });
      
      const now = new Date();
      const thresholdMinutes = 15;
      const limitCount = 3;
      const activeStatuses = ["new", "accepted", "in_progress", "ready"]; 

      const recentUserOrders = recentOrders.filter((o) => {
        if (!activeStatuses.includes(o.status)) return false;

        const created = new Date(o.created_date);
        const diffMinutes = (now - created) / 1000 / 60;
        return diffMinutes <= thresholdMinutes;
      });

      return recentUserOrders.length < limitCount;
    } catch (e) {
      console.error("Rate limit check failed", e);
      return true;
    }
  };



  // Submit order
  // Process hall order (P0-2: accepts validatedSession to avoid stale closure)
  const processHallOrder = async (guestToUse, validatedSession) => {
    try {
      // Handle loyalty account (find or create if email provided)
      let loyaltyAccountToUse = loyaltyAccount;
      if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
        const emailLower = customerEmail.trim().toLowerCase();
        const existingAccounts = await base44.entities.LoyaltyAccount.filter({
          partner: partner.id,
          email: emailLower
        });
        
        if (existingAccounts && existingAccounts.length > 0) {
          loyaltyAccountToUse = existingAccounts[0];
        } else if (loyaltyEnabled) {
          loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
            partner: partner.id,
            email: emailLower,
            balance: 0,
            total_earned: 0,
            total_spent: 0,
            total_expired: 0,
            visit_count: 0
          });
        }
      }

      // Validate points redemption
      if (redeemedPoints > 0) {
        if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
          toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
          return false;
        }
      }

      // Process points redemption BEFORE creating order
      if (loyaltyAccountToUse && redeemedPoints > 0) {
        await base44.entities.LoyaltyTransaction.create({
          account: loyaltyAccountToUse.id,
          type: 'redeem',
          amount: -redeemedPoints,
          description: t('loyalty.transaction.redeem')
        });
        
        await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
          balance: loyaltyAccountToUse.balance - redeemedPoints,
          total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
        });
      }

      // Get start stage for this order type
      const startStage = getStartStage(orderStages, orderMode);
      
      // Generate order number (for staff, not shown to guest)
      const { orderNumber, updatedCounters } = getNextOrderNumber(partner, 'hall');

      const orderData = {
        partner: partner.id,
        order_type: 'hall',
        status: "new",
        stage_id: startStage?.id || null,
        payment_status: "unpaid",
        total_amount: finalTotal,
        comment: comment || undefined,
        client_phone: clientPhone || undefined,
        client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
        public_token: Math.random().toString(36).substring(2, 10),
        table: currentTableId,
        table_session: validatedSession?.id ?? null,
        guest: guestToUse?.id || null,
        order_number: orderNumber,
        loyalty_account: loyaltyAccountToUse?.id || null,
        points_redeemed: redeemedPoints || 0,
        discount_amount: discountAmount + pointsDiscountAmount,
      };

      if (partner?.id && orderData.table) saveTableSelection(partner.id, orderData.table);

      const order = await base44.entities.Order.create(orderData);

      // Create order items with split_type
      const newItems = cart.map((item) => ({
        order: order.id,
        dish: item.dishId,
        dish_name: item.name,
        dish_price: item.price,
        quantity: item.quantity,
        line_total: item.price * item.quantity,
        split_type: splitType,
      }));

      await base44.entities.OrderItem.bulkCreate(newItems);

      // Earn points after order creation
      if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));
        
        await base44.entities.LoyaltyTransaction.create({
          account: loyaltyAccountToUse.id,
          type: 'earn_order',
          amount: earnedPoints,
          order: order.id,
          description: t('loyalty.transaction.earn_order', { orderNumber: order.order_number }),
          expires_at: expiresAt.toISOString()
        });
        
        const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
        await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
          balance: newBalance,
          total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
          visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
          last_visit_at: new Date().toISOString()
        });
        
        await base44.entities.Order.update(order.id, {
          points_earned: earnedPoints
        });
      }

      // Update partner counters
      await base44.entities.Partner.update(partner.id, updatedCounters);
      
      // Update local partner cache
      queryClient.setQueryData(["publicPartner", partnerParamRaw], (prev) =>
        prev ? { ...prev, ...updatedCounters } : prev
      );

      // Optimistic update session data with proper guest link
      // BUG-PM-004: add _optimisticAt so polling merge preserves this until server confirms
      const optimisticAt = Date.now();
      const orderWithGuest = {
        ...order,
        guest: guestToUse?.id,
        _optimisticAt: optimisticAt,
      };
      // Dedup: skip if a poll already delivered this order
      setSessionOrders(prev => {
        if (prev.some(o => String(o.id) === String(order.id))) return prev;
        return [orderWithGuest, ...prev];
      });
      
      const tempIdBase = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      
      // BUG-PM-004: add _optimisticAt so polling merge preserves temp items
      const itemsWithLinks = newItems.map((item, i) => ({
        ...item,
        id: `temp_${tempIdBase}_${i}`,
        order: order.id,
        _optimisticAt: optimisticAt,
      }));
      
      setSessionItems(prev => [...prev, ...itemsWithLinks]);

      // Clear form — cart becomes empty, CartView auto-switches to Mode "Чеки"
      clearCart();
      clearCartStorage(partner.id);
      setSplitType('single');
      setComment("");
      setCustomerEmail('');
      setLoyaltyAccount(null);
      setRedeemedPoints(0);

      // S82 BUG-S81-17: extended duration so user sees confirmation; drawer stays open (Mode "Чеки")
      toast.success(
        tr('cart.order_sent', '\u0417\u0430\u043A\u0430\u0437 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0443'),
        { id: 'order-sent', duration: 4000 }
      );
      // Drawer stays open — drawerMode remains 'cart', cart cleared above
      return true;
    } catch (err) {
      console.error(err);
      // S82 BUG-S81-17: show error as toast (setSubmitError only visible in CheckoutView, not in drawer)
      toast.error(t('error.submit_failed'), { id: 'order-err', duration: 4000 });
      setSubmitError(t('error.submit_failed'));
      return false;
    }
  };

  const handleSubmitOrder = async () => {
    // CODE-024: protect from double-tap
    if (submitLockRef.current) return;
    
    if (!validate()) return;
    
    // Empty cart guard
    if (cart.length === 0) {
      toast.error(t('cart.empty'), { id: 'mm1' });
      return;
    }

    // P0-1: Extra safety check for hall mode
    if (orderMode === "hall" && !currentTableId) {
      setSubmitError(t('error.table_required'));
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Hall mode: handle session and guest
      if (orderMode === "hall" && isTableVerified) {
        // P0-2: Validate existing session is still valid
        let session = tableSession;
        if (session && isSessionExpired(session)) {
          // Session expired — close it in DB and force new one
          try {
            await base44.entities.TableSession.update(session.id, {
              status: 'expired',
              closed_at: new Date().toISOString(),
            });
          } catch (e) { /* best effort */ }
          session = null;
        }

        // Ensure we have a valid session
        if (!session) {
          session = await getOrCreateSession(partner.id, currentTableId);
          setTableSession(session);
          sessionIdRef.current = session?.id;
        }

        // P0-2: Hard guard — reject order if no valid session
        if (!session?.id) {
          toast.error(t('error.session_expired'), { id: 'session-err' });
          submitLockRef.current = false;
          setIsSubmitting(false);
          return;
        }

        // ============================================================
        // FIX-260131-07 FINAL: SAFEGUARD — try restore guest before creating new
        // This prevents "submit races restore" bug where guest is created
        // because currentGuest hasn't been set yet
        // ============================================================
        let guest = currentGuest;

        if (!guest) {
          try {
            const normalizeId = (g) => String(g?.id ?? g?._id ?? "");
            
            // 1) Try device-based lookup (all known device keys)
            const deviceIds = Array.from(new Set(
              [getDeviceId(), localStorage.getItem("menu_device_id"), localStorage.getItem("menuapp_device_id")]
                .filter(Boolean)
                .map(String)
            ));

            for (const dId of deviceIds) {
              if (guest) break;
              const found = await findGuestByDevice(session.id, dId);
              if (found) { guest = found; }
            }

            // 2) Try saved guestId from localStorage (ALL keys, not || )
            if (!guest) {
              const TTL_MS = 8 * 60 * 60 * 1000;
              const readGuestId = (key) => {
                try {
                  const raw = localStorage.getItem(key);
                  if (!raw) return null;
                  const data = JSON.parse(raw);
                  const ts = data?.ts ?? data?.timestamp;
                  const gid = data?.guestId;
                  if (!gid) return null;
                  if (ts && (Date.now() - ts > TTL_MS)) return null;
                  return String(gid);
                } catch { return null; }
              };

              // All possible keys
              const sessionKey = `menuApp_hall_guest_${partner.id}_${session.id}`;
              const tableKey = `menuApp_hall_guest_${partner.id}_${currentTableId}`;
              const legacyKey = `menuapp_guest_${partner.id}_${currentTableId}`;
              
              const sessionSavedId = readGuestId(sessionKey);
              const tableSavedId = readGuestId(tableKey);
              const legacySavedId = readGuestId(legacyKey);

              // Load guests ONCE (optimization)
              const guests = await getSessionGuests(session.id);

              // Try session-key first
              if (sessionSavedId) {
                guest = (guests || []).find(g => normalizeId(g) === sessionSavedId) || null;
              }
              // If not found, try table-key
              if (!guest && tableSavedId) {
                guest = (guests || []).find(g => normalizeId(g) === tableSavedId) || null;
              }
              // If not found, try legacy-key
              if (!guest && legacySavedId) {
                guest = (guests || []).find(g => normalizeId(g) === legacySavedId) || null;
              }
              
              // 3) Try guest_code lookup (using already loaded guests)
              if (!guest) {
                const guestCode = localStorage.getItem("menu_guest_code");
                if (guestCode) {
                  guest = (guests || []).find(g => {
                    const code = g?.guest_code ?? g?.guestCode ?? g?.code ?? g?.menu_guest_code;
                    return code != null && String(code) === String(guestCode);
                  }) || null;
                }
              }
            }

            // If restored → sync state + storage
            if (guest) {
              const gid = normalizeId(guest);
              setCurrentGuest(guest);
              currentGuestIdRef.current = gid || null;
              if (gid) {
                saveGuestId(partner.id, session.id, currentTableId, gid);
              }
              setSessionGuests(prev => {
                const list = Array.isArray(prev) ? prev : [];
                return (gid && list.some(x => normalizeId(x) === gid)) ? list : [...list, guest];
              });
            }
          } catch (e) {
            // Ignore errors, will create new guest below
          }
        }

        // If still no guest after safeguard — create new
        if (!guest) {
          const deviceId = getDeviceId();
          guest = await addGuestToSession(session.id, null, deviceId);
          const gid = String(guest?.id ?? guest?._id ?? "");
          setCurrentGuest(guest);
          currentGuestIdRef.current = gid || null;
          setSessionGuests(prev => [...(Array.isArray(prev) ? prev : []), guest]);
          // Save guest ID for persistence across refreshes
          if (gid) {
            saveGuestId(partner.id, session.id, currentTableId, gid);
          }
        }
        // ============================================================
        // END FIX-260131-07 FINAL
        // ============================================================

        // Process the order (pass validated session to avoid stale closure)
        const success = await processHallOrder(guest, session);
        if (!success) {
          submitLockRef.current = false;
          setIsSubmitting(false);
          return;
        }
      } else {
        // Pickup/Delivery flow (unchanged)
        if (orderMode === "pickup" || orderMode === "delivery" || clientPhone) {
          const isAllowed = await checkRateLimit();
          if (!isAllowed) {
            setSubmitError(t('error.rate_limit'));
            submitLockRef.current = false;
            setIsSubmitting(false);
            return;
          }
        }

        // Handle loyalty account (find or create if email provided)
        let loyaltyAccountToUse = loyaltyAccount;
        if (customerEmail && customerEmail.trim() && !loyaltyAccountToUse) {
          const emailLower = customerEmail.trim().toLowerCase();
          const existingAccounts = await base44.entities.LoyaltyAccount.filter({
            partner: partner.id,
            email: emailLower
          });
          
          if (existingAccounts && existingAccounts.length > 0) {
            loyaltyAccountToUse = existingAccounts[0];
          } else if (loyaltyEnabled) {
            loyaltyAccountToUse = await base44.entities.LoyaltyAccount.create({
              partner: partner.id,
              email: emailLower,
              balance: 0,
              total_earned: 0,
              total_spent: 0,
              total_expired: 0,
              visit_count: 0
            });
          }
        }

        // Validate points redemption
        if (redeemedPoints > 0) {
          if (!loyaltyAccountToUse || loyaltyAccountToUse.balance < redeemedPoints) {
            toast.error(t('loyalty.insufficient_points'), { id: 'mm1' });
            submitLockRef.current = false;
            setIsSubmitting(false);
            return;
          }
        }

        // Process points redemption BEFORE creating order
        if (loyaltyAccountToUse && redeemedPoints > 0) {
          await base44.entities.LoyaltyTransaction.create({
            account: loyaltyAccountToUse.id,
            type: 'redeem',
            amount: -redeemedPoints,
            description: t('loyalty.transaction.redeem')
          });
          
          await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
            balance: loyaltyAccountToUse.balance - redeemedPoints,
            total_spent: (loyaltyAccountToUse.total_spent || 0) + redeemedPoints
          });
        }

        // Get start stage for this order type
        const startStage = getStartStage(orderStages, orderMode);

        const orderData = {
          partner: partner.id,
          order_type: orderMode,
          status: "new",
          stage_id: startStage?.id || null,
          payment_status: "unpaid",
          total_amount: finalTotal,
          comment: comment || undefined,
          client_name: clientName || undefined,
          client_phone: clientPhone || undefined,
          client_email: customerEmail && customerEmail.trim() ? customerEmail.trim().toLowerCase() : undefined,
          delivery_address: orderMode === "delivery" ? deliveryAddress || undefined : undefined,
          public_token: Math.random().toString(36).substring(2, 10),
          loyalty_account: loyaltyAccountToUse?.id || null,
          points_redeemed: redeemedPoints || 0,
          discount_amount: discountAmount + pointsDiscountAmount,
        };

        const order = await base44.entities.Order.create(orderData);

        const orderItemsData = cart.map((item) => ({
          order: order.id,
          dish: item.dishId,
          dish_name: item.name,
          dish_price: item.price,
          quantity: item.quantity,
          line_total: item.price * item.quantity,
        }));

        await base44.entities.OrderItem.bulkCreate(orderItemsData);

        // Earn points after order creation
        if (loyaltyAccountToUse && loyaltyEnabled && earnedPoints > 0) {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + (partner.loyalty_expiry_days || 100));
          
          await base44.entities.LoyaltyTransaction.create({
            account: loyaltyAccountToUse.id,
            type: 'earn_order',
            amount: earnedPoints,
            order: order.id,
            description: t('loyalty.transaction.earn_order', { orderNumber: order.order_number || order.id }),
            expires_at: expiresAt.toISOString()
          });
          
          const newBalance = (loyaltyAccountToUse.balance - redeemedPoints) + earnedPoints;
          await base44.entities.LoyaltyAccount.update(loyaltyAccountToUse.id, {
            balance: newBalance,
            total_earned: (loyaltyAccountToUse.total_earned || 0) + earnedPoints,
            visit_count: (loyaltyAccountToUse.visit_count || 0) + 1,
            last_visit_at: new Date().toISOString()
          });
          
          await base44.entities.Order.update(order.id, {
            points_earned: earnedPoints
          });
        }

        // GAP-01: Save cart snapshot for confirmation screen BEFORE clearing
        const confirmedItems = [...cart];
        const confirmedTotal = finalTotal;
        const savedClientName = clientName;

        clearCart();
        clearCartStorage(partner.id);
        setClientName("");
        setClientPhone("");
        setDeliveryAddress("");
        setComment("");
        setCustomerEmail('');
        setLoyaltyAccount(null);
        setRedeemedPoints(0);

        // GAP-01: Show confirmation screen instead of toast + delayed transition
        showConfirmation({
          items: confirmedItems,
          totalAmount: confirmedTotal,
          guestLabel: null,
          orderMode,
          publicToken: order.public_token,
          clientName: savedClientName,
        });

        // Order created successfully
      }
    } catch (err) {
      console.error(err);
      setSubmitError(t('error.submit_failed'));
      // S82 BUG-S81-14: show error as toast so it's visible even if drawer is being closed
      toast.error(t('error.submit_failed'), { id: 'order-err', duration: 4000 });
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Update guest name (inline on cart page)
  const handleUpdateGuestName = async () => {
    if (!currentGuest?.id || !guestNameInput.trim()) return;
    
    try {
      await base44.entities.SessionGuest.update(currentGuest.id, {
        name: guestNameInput.trim()
      });
      
      setCurrentGuest(prev => ({ ...prev, name: guestNameInput.trim() }));
      setSessionGuests(prev => prev.map(g => 
        g.id === currentGuest.id ? { ...g, name: guestNameInput.trim() } : g
      ));
      setIsEditingName(false);
      setGuestNameInput('');
      
      toast.success(t('guest.name_saved'), { id: 'mm1' });
    } catch (err) {
      console.error('Failed to update guest name:', err);
      toast.error(t('error.save_failed'), { id: 'mm1' });
    }
  };

  // Request bill (ServiceRequest)
  // S82 BUG-S81-14: Open checkout as drawer (not fullscreen) for pickup/delivery
  // Clear stale errors so re-opening doesn't show previous attempt's validation state
  const handleCheckoutClick = () => {
    setErrors({});
    setSubmitError(null);
    setDrawerMode('checkout');
  };

  const handleRequestBill = async () => {
    if (billCooldown || billRequested) {
      toast.info(t('cart.bill_already_requested') || 'Счёт уже запрошен', { id: 'mm1' });
      return;
    }
    
    setBillRequested(true);
    try {
      await base44.entities.ServiceRequest.create({
        partner: partner.id,
        table: currentTableId,
        table_session: tableSession?.id,
        request_type: 'bill',
        status: 'new',
        source: 'public'
      });
      
      setBillCooldownStorage(currentTableId);
      setBillCooldown(true);
      toast.success(t('cart.bill_requested') || 'Официант скоро принесёт счёт', { id: 'mm1' });
    } catch (err) {
      console.error('Failed to request bill:', err);
      toast.error(t('toast.error') || 'Ошибка', { id: 'mm1' });
      setBillRequested(false);
    }
  };



  // Guards
  if (!partnerParamRaw) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-slate-700 font-medium">{t('error.partner_missing')}</p>
          <p className="text-slate-500 text-sm mt-2">
            {t('error.partner_hint')} <span className="font-mono">?partner=&lt;partner_id|slug&gt;</span>
          </p>
        </Card>
      </div>
    );
  }

  if (loadingPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center p-6">
          <p className="text-slate-500">{t('error.partner_not_found')}</p>
        </Card>
      </div>
    );
  }

  // P1-5: Error UI for failed requests
  if ((dishesError || categoriesError) && !isRateLimitError(dishesError) && !isRateLimitError(categoriesError)) {
    return (
      <ErrorState
        onRetry={() => window.location.reload()}
        t={t}
      />
    );
  }

  // Empty state: no content at all
  if (!loadingDishes && !channels.hasAnyContent) {
    return (
      <EmptyMenuState
        partner={partner}
        activeContactLinks={activeContactLinks}
        viewMode={viewMode}
        enabledLanguages={enabledLanguages}
        enabledCurrencies={enabledCurrencies}
        lang={lang}
        activeCurrency={activeCurrency}
        onLangChange={handleLangChange}
        onCurrencyChange={handleCurrencyChange}
        onContactClick={handleContactClick}
        isSafeUrl={isSafeUrl}
        t={t}
        CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
      />
    );
  }

  const getModeDescription = () => {
    switch (orderMode) {
      case "hall":
        return t('mode.hall.desc');
      case "pickup":
        return t('mode.pickup.desc');
      case "delivery":
        return t('mode.delivery.desc');
      default:
        return "";
    }
  };

  // ============================================================
  // HALL CHECKOUT SCREEN (TASK-260127-01: removed "Стол подтверждён" block)
  // ============================================================
  const renderHallCheckoutContent = () => {
    // Table already verified - nothing special needed here
    // (table info shown in menu header, comment field below)
    if (isTableVerified && currentTableId) {
      return null;
    }

    // Table NOT verified - show verification options (NO dropdown per P0-7)
    const showHallOnlineBenefitsHint = !!(partner?.discount_enabled || partner?.loyalty_enabled);

    return (
      <div className="space-y-3">
        <div className="text-sm text-slate-700 text-center">
          {t('hall.verify.title') || 'Чтобы официант получил заказ сразу'}
        </div>
        <div className="text-xs text-slate-500 text-center">
          {t('hall.verify.subtitle') || 'Введите код со стола или назовите его официанту'}
        </div>
        <div className="text-xs text-slate-500 text-center">
          {t('hall.verify.benefit') || 'После этого заказы будут приходить официанту напрямую'}
        </div>

        <HallVerifyBlock
          tableCodeInput={tableCodeInput}
          setTableCodeInput={setTableCodeInput}
          isVerifyingCode={isVerifyingCode}
          codeVerificationError={null}
          hallGuestCodeEnabled={hallGuestCodeEnabled}
          guestCode={guestCode}
          partner={partner}
          t={t}
        />

        {showHallOnlineBenefitsHint && (
          <div className="text-xs text-slate-500 text-center">
            {t('hall.verify.online_benefits') || '🎁 Бонусы и скидки за онлайн-заказы'}
          </div>
        )}
      </div>
    );
};

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* S84 BUG-S81-07: pass partner without name when logo block below shows name */}
      <PublicMenuHeader
        partner={showLogo ? { ...partner, name: undefined } : partner}
        activeContactLinks={activeContactLinks}
        viewMode={viewMode}
        enabledLanguages={enabledLanguages}
        enabledCurrencies={enabledCurrencies}
        lang={lang}
        activeCurrency={activeCurrency}
        onLangChange={handleLangChange}
        onCurrencyChange={handleCurrencyChange}
        onContactClick={handleContactClick}
        isSafeUrl={isSafeUrl}
        t={t}
        CURRENCY_SYMBOLS={CURRENCY_SYMBOLS}
      />

      {/* Restaurant logo + name (visible when logo is uploaded in PartnerSettings) */}
      {showLogo && (
        <div className="flex items-center gap-3 px-4 pt-3 pb-1">
          <img
            src={logoUrl}
            alt={partner?.name ? `${partner.name} logo` : ""}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
            onError={() => setLogoError(true)}
          />
          {partner?.name && (
            <span className="min-w-0 flex-1 truncate text-base font-semibold text-slate-800">{partner.name}</span>
          )}
        </div>
      )}

      {/* Closed banner — shown when partner.is_open === false */}
      {partner?.is_open === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mx-4 mt-2" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="font-semibold text-red-700 text-sm">{t("public.closed_banner.title")}</span>
          </div>
          <p className="text-xs text-red-600 mt-1 ml-5">{t("public.closed_banner.subtitle")}</p>
        </div>
      )}

      {/* Redirect banner */}
      {redirectBanner && (
        <RedirectBanner
          redirectBanner={redirectBanner}
          onClose={() => setRedirectBanner(null)}
          t={t}
        />
      )}

      {/* Mode tabs */}
      {view === "menu" && visibleModeTabs.length > 0 && (
        <ModeTabs
          visibleModeTabs={visibleModeTabs}
          orderMode={orderMode}
          onModeChange={handleModeChange}
          getModeDescription={getModeDescription}
          isHallMode={isHallMode}
          isTableVerified={isTableVerified}
          currentTableId={currentTableId}
          currentTable={currentTable}
          tableCodeParam={tableCodeParam}
          resolvedTable={resolvedTable}
          verifiedByCode={verifiedByCode}
          t={t}
        />
      )}

      {/* Category chips */}
      {view === "menu" && sortedCategories.length > 1 && (
        <CategoryChips
          sortedCategories={sortedCategories}
          activeCategoryKey={activeCategoryKey}
          onCategoryClick={handleCategoryClick}
          getCategoryName={getCategoryName}
          chipRefs={chipRefs}
          t={t}
        />
      )}

      {/* Menu list */}
      {view === "menu" && (
        <MenuView
          partner={partner}
          isMobile={isMobile}
          mobileLayout={mobileLayout}
          onSetMobileLayout={handleSetMobileLayout}
          showReviews={showReviews}
          dishRatings={dishRatings}
          onOpenReviews={(dishId) => setSelectedDishId(dishId)}
          listTopRef={listTopRef}
          loadingDishes={loadingDishes}
          sortedCategories={sortedCategories}
          groupedDishes={groupedDishes}
          getCategoryName={getCategoryName}
          sectionRefs={sectionRefs}
          cart={cart}
          getDishName={getDishName}
          getDishDescription={getDishDescription}
          formatPrice={formatPrice}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          t={t}
        />
      )}

      {/* Checkout */}
      {view === "checkout" && (
        <CheckoutView
          t={t}
          setView={setView}
          cart={cart}
          updateQuantity={updateQuantity}
          formatPrice={formatPrice}
          cartTotalItems={cartTotalItems}
          cartTotalAmount={cartTotalAmount}
          clearCart={clearCart}
          showLoyaltySection={showLoyaltySection}
          customerEmail={customerEmail}
          setCustomerEmail={setCustomerEmail}
          loyaltyLoading={loyaltyLoading}
          loyaltyAccount={loyaltyAccount}
          partner={partner}
          earnedPoints={earnedPoints}
          redeemedPoints={redeemedPoints}
          setRedeemedPoints={setRedeemedPoints}
          maxRedeemPoints={maxRedeemPoints}
          discountEnabled={discountEnabled}
          discountAmount={discountAmount}
          pointsDiscountAmount={pointsDiscountAmount}
          finalTotal={finalTotal}
          loyaltyEnabled={loyaltyEnabled}
          activeCurrency={activeCurrency}
          defaultCurrency={defaultCurrency}
          orderMode={orderMode}
          renderHallCheckoutContent={renderHallCheckoutContent}
          clientName={clientName}
          setClientName={setClientName}
          clientPhone={clientPhone}
          handlePhoneChange={handlePhoneChange}
          handlePhoneFocus={handlePhoneFocus}
          deliveryAddress={deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          comment={comment}
          setComment={setComment}
          errors={errors}
          submitError={submitError}
          isSubmitting={isSubmitting}
          handleSubmitOrder={handleSubmitOrder}
          isTableVerified={isTableVerified}
          currentTableId={currentTableId}
        />
      )}

      {/* GAP-01: Order Confirmation Screen */}
      {view === "confirmation" && confirmationData && (
        <OrderConfirmationScreen
          items={confirmationData.items}
          totalAmount={confirmationData.totalAmount}
          guestLabel={confirmationData.guestLabel}
          orderMode={confirmationData.orderMode}
          publicToken={confirmationData.publicToken}
          clientName={confirmationData.clientName}
          formatPrice={formatPrice}
          onBackToMenu={dismissConfirmation}
          onOpenOrders={() => {
            dismissConfirmation();
            setDrawerMode("cart");
          }}
          onTrackOrder={handleTrackOrder}
          t={t}
        />
      )}

      {/* GAP-02: Order Status Screen (embedded) */}
      {view === "orderstatus" && orderStatusToken && (
        <OrderStatusScreen
          token={orderStatusToken}
          partnerId={partner?.id}
          onBackToMenu={dismissOrderStatus}
          t={t}
        />
      )}

      {/* TASK-260203-01: Cart as Bottom Drawer */}
      {/* S79: Two detents (mid 60%, full 90%) */}
      {/* S82 BUG-S81-01: setActiveSnapPoint handles null (swipe-down-to-close) */}
      <Drawer
        open={drawerMode === 'cart'}
        onOpenChange={(open) => !open && setDrawerMode(null)}
        snapPoints={[SNAP_MID, SNAP_FULL]}
        activeSnapPoint={drawerSnapPoint}
        setActiveSnapPoint={(sp) => {
          if (sp === null) {
            setDrawerMode(null);
          } else {
            setDrawerSnapPoint(sp);
          }
        }}
      >
        <DrawerContent className="flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', maxHeight: '90vh' }}>
          <DrawerHeader className="sr-only">
            <DrawerTitle>Корзина</DrawerTitle>
          </DrawerHeader>
          {/* S84 BUG-S81-01: Custom drag handle — touch-based swipe-down to close (>80px triggers close) */}
          <div
            className="flex justify-center py-3 shrink-0 touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => { drawerDragStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientY - drawerDragStartY.current;
              if (delta > 80) setDrawerMode(null);
            }}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300" />
          </div>
          {/* S84 BUG-S81-03: flex-1 overflow-y-auto min-h-0 makes CartView scrollable so sticky CTA stays visible */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <CartView
              partner={partner}
              currentTable={currentTable}
              currentGuest={currentGuest}
              t={t}
              setView={setView}
              isEditingName={isEditingName}
              guestNameInput={guestNameInput}
              setGuestNameInput={setGuestNameInput}
              handleUpdateGuestName={handleUpdateGuestName}
              setIsEditingName={setIsEditingName}
              getGuestDisplayName={getGuestDisplayName}
              cart={cart}
              formatPrice={formatPrice}
              updateQuantity={updateQuantity}
              sessionGuests={sessionGuests}
              splitType={splitType}
              setSplitType={setSplitType}
              showLoyaltySection={showLoyaltySection}
              showLoginPromptAfterRating={showLoginPromptAfterRating}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              loyaltyLoading={loyaltyLoading}
              loyaltyAccount={loyaltyAccount}
              earnedPoints={earnedPoints}
              maxRedeemPoints={maxRedeemPoints}
              redeemedPoints={redeemedPoints}
              setRedeemedPoints={setRedeemedPoints}
              toast={toast}
              cartTotalAmount={cartTotalAmount}
              discountAmount={discountAmount}
              pointsDiscountAmount={pointsDiscountAmount}
              isSubmitting={isSubmitting}
              handleSubmitOrder={handleSubmitOrder}
              myOrders={myOrders}
              itemsByOrder={itemsByOrder}
              getOrderStatus={getOrderStatus}
              reviewedItems={reviewedItems}
              draftRatings={draftRatings}
              updateDraftRating={updateDraftRating}
              sessionItems={sessionItems}
              sessionOrders={sessionOrders}
              myBill={myBill}
              reviewableItems={reviewableItems}
              openReviewDialog={openReviewDialog}
              handleRequestBill={handleRequestBill}
              billRequested={billRequested}
              billCooldown={billCooldown}
              otherGuestsBills={otherGuestsBills}
              othersTotal={othersTotal}
              setOtherGuestsExpanded={setOtherGuestsExpanded}
              otherGuestsExpanded={otherGuestsExpanded}
              getLinkId={getLinkId}
              otherGuestsReviewableItems={otherGuestsReviewableItems}
              tableTotal={tableTotal}
              formatOrderTime={formatOrderTime}
              handleRateDish={handleRateDish}
              ratingSavingByItemId={ratingSavingByItemId}
              onClose={() => setDrawerMode(null)}
              onCallWaiter={handleOpenHelpModal}
              isTableVerified={isTableVerified}
              tableCodeInput={tableCodeInput}
              setTableCodeInput={setTableCodeInput}
              isVerifyingCode={isVerifyingCode}
              verifyTableCode={verifyTableCode}
              codeVerificationError={null}
              hallGuestCodeEnabled={hallGuestCodeEnabled}
              guestCode={guestCode}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* S82 BUG-S81-14: Pickup/Delivery Checkout Drawer */}
      {/* Uses same snap points as cart drawer for reliable swipe-to-close */}
      <Drawer
        open={drawerMode === 'checkout'}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            setDrawerMode(null);
            setErrors({});
            setSubmitError(null);
          }
        }}
        snapPoints={[SNAP_MID, SNAP_FULL]}
        activeSnapPoint={drawerSnapPoint}
        setActiveSnapPoint={(sp) => {
          if (sp === null && !isSubmitting) {
            setDrawerMode(null);
            setErrors({});
            setSubmitError(null);
          } else if (sp !== null) {
            setDrawerSnapPoint(sp);
          }
        }}
      >
        <DrawerContent className="flex flex-col" style={{ paddingBottom: 0, maxHeight: '90vh' }}>
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t('cart.your_order')}</DrawerTitle>
          </DrawerHeader>
          {/* S84 BUG-S81-01: Custom drag handle for checkout drawer */}
          <div
            className="flex justify-center py-3 shrink-0 touch-none cursor-grab active:cursor-grabbing"
            onTouchStart={(e) => { drawerDragStartY.current = e.touches[0].clientY; }}
            onTouchEnd={(e) => {
              const delta = e.changedTouches[0].clientY - drawerDragStartY.current;
              if (delta > 80 && !isSubmitting) setDrawerMode(null);
            }}
          >
            <div className="w-12 h-1.5 rounded-full bg-slate-300" />
          </div>
          {/* S84 BUG-S81-03: flex-1 overflow-y-auto min-h-0 for scrollable checkout content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <PickupDeliveryCheckoutContent
              orderMode={orderMode}
              cart={cart}
              formatPrice={formatPrice}
              finalTotal={finalTotal}
              clientName={clientName}
              setClientName={setClientName}
              clientPhone={clientPhone}
              handlePhoneChange={handlePhoneChange}
              handlePhoneFocus={handlePhoneFocus}
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              comment={comment}
              setComment={setComment}
              errors={errors}
              submitError={submitError}
              isSubmitting={isSubmitting}
              handleSubmitOrder={handleSubmitOrder}
              onClose={() => {
                if (!isSubmitting) {
                  setDrawerMode(null);
                  setErrors({});
                  setSubmitError(null);
                }
              }}
              t={t}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Floating Help Button - only when table verified in Hall */}
      {orderMode === "hall" && isTableVerified && currentTableId && (
        <HelpFab
          fabSuccess={fabSuccess}
          isSendingHelp={isSendingHelp}
          isHelpModalOpen={isHelpModalOpen}
          onOpen={handleOpenHelpModal}
          t={t}
        />
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <HelpModal
          onClose={() => setIsHelpModalOpen(false)}
          t={t}
          currentTableLabel={currentTable?.name || currentTable?.code || ""}
          hasActiveRequest={hasActiveRequest}
          selectedHelpType={selectedHelpType}
          onSelectHelpType={handlePresetSelect}
          helpComment={helpComment}
          onChangeHelpComment={setHelpComment}
          helpSubmitError={helpSubmitError}
          isSendingHelp={isSendingHelp}
          onSubmit={submitHelpRequest}
          disabled={!currentTableId}
        />
      )}

      {/* P0-6: Removed custom toast - using sonner */}

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        t={t}
        partner={partner}
        reviewingItems={reviewingItems}
        ratings={ratings}
        onChangeRating={(itemId, val) => setRatings(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], rating: val }
        }))}
        onChangeComment={(itemId, text) => setRatings(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], comment: text }
        }))}
        submittingReview={submittingReview}
        onSubmit={handleSubmitReviews}
        hasLoyalty={!!loyaltyAccount}
      />

      {/* Dish Reviews Modal (read-only) */}
      <DishReviewsModal
        open={!!selectedDishId}
        onOpenChange={(open) => !open && setSelectedDishId(null)}
        dishTitle={selectedDish ? getDishName(selectedDish) : undefined}
        reviews={selectedDishReviews}
        loading={loadingDishReviews}
      />

      {/* Sticky cart bar - updated for TableSession */}
      {view === "menu" && (() => {
        // Hall mode: show if cart has items OR if there are past orders OR table activity
        if (isHallMode && showCartButton) {
          return (
            <StickyCartBar
              t={t}
              isHallMode={true}
              isDrawerOpen={drawerMode === 'cart'}
              hasCart={(cart?.length || 0) > 0}
              cartTotalItems={cartTotalItems}
              formattedCartTotal={formatPrice(cartTotalAmount)}
              isLoadingBill={hallStickyIsLoadingBill}
              formattedBillTotal={hallStickyBillTotal}
              onButtonClick={() => {
                if (hallStickyMode === 'cartEmpty' && isSessionLoading) {
                  toast.info(t('common.loading'), { id: 'mm1', duration: 1500 });
                  return;
                }
                setDrawerMode(drawerMode === 'cart' ? null : 'cart');
              }}
              buttonLabel={hallStickyButtonLabel}
              hallModeLabel={hallStickyModeLabel}
              showBillAmount={hallStickyShowBillAmount}
            />
          );
        }

        // Pickup/Delivery: original behavior
        if (cart.length > 0) {
          return (
            <StickyCartBar
              t={t}
              isHallMode={false}
              isDrawerOpen={drawerMode === 'checkout'}
              hasCart={true}
              cartTotalItems={cartTotalItems}
              formattedCartTotal={formatPrice(cartTotalAmount)}
              isLoadingBill={false}
              formattedBillTotal=""
              onButtonClick={drawerMode === 'checkout' ? () => setDrawerMode(null) : handleCheckoutClick}
              buttonLabel={t('cart.checkout')}
            />
          );
        }

        return null;
      })()}
    </div>
  );
}