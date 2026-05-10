import React from "react";
import { Bell, ChevronDown } from "lucide-react";
// R6-1 Phase B.1 (S615): removed dead Input import (only consumer was extracted to PostRatingEmailSheet)
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pluralizeRu } from "@/components/_shared/i18n/pluralizeRu";
import { makeSafeT } from "@/components/_shared/i18n/makeSafeT";
import { makeIsCancelledOrder } from "@/components/_shared/orders/makeIsCancelledOrder";
import { mapLegacyStatus } from "@/components/_shared/orderStage";
// R6-1 Phase B.1 (S615): removed dead isValidEmail import (only consumer was extracted to PostRatingEmailSheet)
import { isFeatureEnabled } from "@/components/_shared/featureFlags";
// RF-4 Sub-4 Variant A (S490): payment helper
import { markOrdersPaid } from "@/components/sessionHelpers";
// R6-1 Phase B.1 (S615): post-rating email capture sheet — extracted sub-component
import { PostRatingEmailSheet } from "@/components/publicMenu/refactor/PostRatingEmailSheet";
import TableCodeGateT1CodexApp03 from "@/components/publicMenu/refactor/TableCodeGateT1CodexApp03";
import StickyFooterCTAT1CodexApp02 from "@/components/publicMenu/refactor/StickyFooterCTAT1CodexApp02";
import GuestNameEdit from "@/components/publicMenu/refactor/GuestNameEdit";
import LoyaltyPanel from "@/components/publicMenu/refactor/LoyaltyPanel";
import MyOrdersSection from "@/components/publicMenu/refactor/MyOrdersSection";
import RatingSection from "@/components/publicMenu/refactor/RatingSection";
import TableBillSummary from "@/components/publicMenu/refactor/TableBillSummary";

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export default function CartView({ shell, cart, orders, ratings, loyalty, flow, toast }) {
  const {
    partner,
    currentTable,
    currentGuest,
    t,
    setView,
    onClose,
    onCallWaiter,
    isTableVerified,
    tableCodeInput,
    setTableCodeInput,
    isVerifyingCode,
    verifyTableCode,
    codeVerificationError,
    hallGuestCodeEnabled,
    guestCode,
    isEditingName,
    guestNameInput,
    setGuestNameInput,
    handleUpdateGuestName,
    setIsEditingName,
    getGuestDisplayName,
    customerEmail,
    setCustomerEmail,
    showLoginPromptAfterRating,
  } = shell;

  const {
    cart: cartItems,
    cartTotalAmount,
    formatPrice,
    updateQuantity,
    sessionGuests,
    splitType,
    setSplitType,
  } = cart;

  const {
    myOrders,
    itemsByOrder,
    getOrderStatus,
    sessionItems,
    sessionOrders,
    myBill,
    tableTotal,
    formatOrderTime,
  } = orders;

  const {
    reviewedItems,
    draftRatings,
    updateDraftRating,
    reviewableItems,
    openReviewDialog,
    otherGuestsReviewableItems,
    handleRateDish,
    ratingSavingByItemId,
  } = ratings;

  const {
    loyaltyLoading,
    loyaltyAccount,
    earnedPoints,
    maxRedeemPoints,
    redeemedPoints,
    setRedeemedPoints,
    showLoyaltySection,
  } = loyalty;

  const {
    isSubmitting,
    submitError,
    setSubmitError,
    handleSubmitOrder,
    cartTotalAmount: flowCartTotalAmount,
    discountAmount,
    pointsDiscountAmount,
  } = flow;

  // BUG-CV-S491 #582: session closed by host (reactive, from useTableSession polling)
  const isSessionClosed = flow?.isSessionClosed ?? false;

  const primaryColor = partner?.primary_color || '#1A1A1A';
  const getLinkedId = React.useCallback((field) => {
    if (field == null) return null;
    if (typeof field === "string" || typeof field === "number") return String(field);
    if (typeof field === "object") {
      const value = field.id ?? field._id ?? field.value ?? null;
      if (typeof value === "string" || typeof value === "number") return String(value);
      if (value && typeof value === "object") {
        const nested = value.id ?? value._id ?? null;
        if (typeof nested === "string" || typeof nested === "number") return String(nested);
      }
    }
    return null;
  }, []);

  // ===== P0: Safe prop defaults (BUG-PM-023, BUG-PM-025) =====
  const safeReviewedItems = reviewedItems || new Set();
  const safeDraftRatings = draftRatings || {};

  // ===== P1 Expandable States =====
  // CV-33: splitExpanded removed — split-order section removed
  // loyaltyExpanded removed — loyalty section simplified to motivation text (#87 KS-1)
  // CV-14/CV-56: Tab state (Мои / Стол)
  const [cartTab, setCartTab] = React.useState('my');

  // CV-01/CV-48/CV-52: 2-group expand states (Выдано / В работе)
  const [expandedStatuses, setExpandedStatuses] = React.useState({
    served: false, // Выдано — collapsed by default (CV-10)
    in_progress: true, // В работе — expanded by default
    pending_unconfirmed: true, // Ожидает — expanded by default
  });
  // CV-28: expandedOrders removed — flat dish list replaces per-order collapse

  // CV-46: Track manual overrides so polling doesn't reset user's toggle
  const manualOverrideRef = React.useRef({});
  // CV-46: Track previous group keys for structural change detection
  const prevGroupKeysRef = React.useRef('');

  // ===== RF-4 Sub-4: Payment state (S490 Variant A) =====
  // guestIdsPaid: Set of guestIds whose orders have been marked paid (optimistic)
  const [guestIdsPaid, setGuestIdsPaid] = React.useState(new Set());
  // payingGuestId: guestId currently in-flight (null = none)
  const [payingGuestId, setPayingGuestId] = React.useState(null);
  // payingAll: true while «Все оплачено» batch is in-flight
  const [payingAll, setPayingAll] = React.useState(false);

  // RF-4 Sub-4: payment handlers defined below after tr + ordersByGuestId (see "PAYMENT HANDLERS" marker)

  const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  // R6-1 Phase B.1 (S615): rewardEmail / rewardEmailSubmitting moved into PostRatingEmailSheet sub-component (lift state)
  const [emailError, setEmailError] = React.useState('');
  // CV-05 v2: Rating mode state (view mode vs rating mode)
  const [isRatingMode, setIsRatingMode] = React.useState(false);
  // CV-38: Post-rating email bottom sheet
  const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);

  // CV-48/Fix 3: Submit feedback phase (idle → submitting → success → idle, or error)
  const [submitPhase, setSubmitPhase] = React.useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  // Fix 3: R4 Terminal Screen — durable state persist (DECISIONS_INDEX §2 R4 LOCKED)
  const [terminalStateShownForVersion, setTerminalStateShownForVersion] = React.useState(() => {
    try { return localStorage.getItem('terminalStateShownForVersion') || ''; } catch { return ''; }
  });
  // R6-1 Phase B.1 (S615): rewardTimerRef + its cleanup useEffect (PM-S140-03)
  // moved into PostRatingEmailSheet sub-component (lift state).

  // CV-48/Fix 3: Track isSubmitting → submitPhase transitions
  React.useEffect(() => {
    if (isSubmitting) {
      setSubmitPhase('submitting');
    } else if (submitPhase === 'submitting') {
      // isSubmitting went false — check for error
      if (submitError) {
        setSubmitPhase('error');
      } else {
        setSubmitPhase('success');
      }
    }
  }, [isSubmitting, submitError, submitPhase]);

  // CV-48/Fix 3: Auto-transition success → idle after 1.5s
  React.useEffect(() => {
    if (submitPhase === 'success') {
      const timer = setTimeout(() => setSubmitPhase('idle'), 1500);
      return () => clearTimeout(timer);
    }
  }, [submitPhase]);

  // CV-48/Fix 3: Reset submitPhase on drawer close
  React.useEffect(() => {
    // When cart becomes empty after successful submit, reset phase
    if (cartItems.length === 0 && submitPhase === 'success') {
      // Will auto-transition via the success timer above
    }
  }, [cartItems.length, submitPhase]);


  // ===== P0 UX helpers =====
  // tr/trFormat moved to @/components/_shared/i18n/makeSafeT (RF-1 Bundle 4, S434)
  // pluralizeRu moved to @/components/_shared/i18n/pluralizeRu (RF-1 Bundle 4, S434)
  const { tr, trFormat } = React.useMemo(() => makeSafeT(t), [t]);

  // Safe status label - guest-facing (CV-52: only 2 statuses)
  const getSafeStatus = (status) => {
    if (!status) {
      return { icon: '⏳', label: tr('cart.group.in_progress', 'В работе'), color: '#64748b' };
    }

    const code = status.internal_code;
    // R5a-2 Phase A: добавлены canonical codes 'start' / 'middle'
    // (post-S343 OrderStage schema enforces start|middle|finish);
    // legacy codes ('ready'/'prepared'/'in_progress'/'accepted'/'new'/'served'/'delivered')
    // оставлены для backward compat с pre-S343 partner records.
    if (code === 'start' || code === 'middle' || code === 'ready' || code === 'prepared' || code === 'in_progress' || code === 'accepted' || code === 'new') {
      return { label: tr('cart.group.in_progress', 'В работе'), icon: '⏳', color: '#64748b' };
    }
    if (code === 'finish' || code === 'served' || code === 'delivered') {
      return { label: tr('cart.group.served', 'Выдано'), icon: '✓', color: '#059669' };
    }
    if (code === 'cancel' || code === 'cancelled') {
      return { label: tr('status.cancelled', 'Отменён'), icon: '✕', color: '#dc2626' };
    }

    let label = status.label || '';

    // Check if label is a raw translation key (contains dots and looks like a key)
    if (label.includes('.') && (label.startsWith('orderprocess') || label.startsWith('status'))) {
      const parts = label.split('.');
      const code = parts[parts.length - 1];

      // CV-52: Map all statuses to 2 guest-facing labels
      const servedCodes = ['done', 'served', 'completed'];
      const cancelledCodes = ['cancel', 'cancelled'];

      if (servedCodes.includes(code)) {
        label = tr('cart.group.served', 'Выдано');
      } else if (cancelledCodes.includes(code)) {
        label = tr('status.cancelled', 'Отменён');
      } else {
        label = tr('cart.group.in_progress', 'В работе');
      }
    } else if (label) {
      // CV-52: Map old Russian status labels to 2 guest-facing groups
      const oldServedLabels = ['\u041f\u043e\u0434\u0430\u043d\u043e']; // Подано
      const oldInProgressLabels = ['\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e', '\u041f\u0440\u0438\u043d\u044f\u0442', '\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f', '\u0413\u043e\u0442\u043e\u0432', '\u0413\u043e\u0442\u043e\u0432\u043e']; // old non-served labels
      if (oldServedLabels.includes(label)) {
        label = tr('cart.group.served', 'Выдано');
      } else if (oldInProgressLabels.includes(label)) {
        label = tr('cart.group.in_progress', 'В работе');
      }
    }

    return {
      icon: status.icon || '🔵',
      label: label || tr('cart.group.in_progress', 'В работе'),
      color: status.color || '#6B7280'
    };
  };

  // Guest display: "Имя #6475" or "Гость #6475"
  // PM-153: Use guestNameInput (from localStorage) as fallback when DB name is empty
  const guestBaseName = currentGuest
    ? (currentGuest.name || guestNameInput || getGuestDisplayName(currentGuest))
    : (guestNameInput || tr("cart.guest", "Гость"));

  const guestDisplay = guestBaseName;

  // Table label: avoid "Стол Стол 3"
  const tablePrefix = tr("form.table", "Стол");
  const rawTableLabel = currentTable?.name || currentTable?.code || "—";
  const tableLabel = React.useMemo(() => {
    if (typeof rawTableLabel !== "string" || typeof tablePrefix !== "string") {
      return `${tablePrefix} ${rawTableLabel}`;
    }
    if (rawTableLabel.trim().toLowerCase().startsWith(tablePrefix.trim().toLowerCase())) {
      return rawTableLabel;
    }
    return `${tablePrefix} ${rawTableLabel}`;
  }, [rawTableLabel, tablePrefix]);

  // Cart grand total (after discounts)
  const cartGrandTotal = Math.max(
    0,
    (Number(cartTotalAmount) || 0) - (Number(discountAmount) || 0) - (Number(pointsDiscountAmount) || 0)
  );

  // ===== Guest count (stable, from orders OR guests) =====
  const guestCountFromOrders = React.useMemo(() => {
    try {
      const ids = new Set(
        (sessionOrders || [])
          .map(o => getLinkedId(o.guest))
          .filter(Boolean)
          .map(x => String(x))
      );
      return ids.size;
    } catch {
      return 0;
    }
  }, [sessionOrders, getLinkedId]);

  const guestCount = Math.max(
    Array.isArray(sessionGuests) ? sessionGuests.length : 0,
    guestCountFromOrders,
    1
  );
  const canSplit = guestCount > 1;

  // ===== CV-B2 Fix 1.0: Shared cancelled-order helper (S443 RF-1 Bundle 6 — migrated to canonical factory) =====
  const isCancelledOrder = makeIsCancelledOrder(getOrderStatus);

  // ===== PM-142/143/154: Filter myOrders to 06:00 business-day + sort by datetime =====
  const todayMyOrders = React.useMemo(() => {
    const now = new Date();
    const isBeforeSixAM = now.getHours() < 6;
    // Business-day cutoff: before 06:00 → yesterday's shift still active
    const cutoffDate = new Date(now);
    if (isBeforeSixAM) cutoffDate.setDate(cutoffDate.getDate() - 1);
    const cutoffDay = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());

    return (myOrders || [])
      .filter(o => {
        const d = o.created_at || o.created_date || o.createdAt;
        if (!d) return true;
        const orderDate = new Date(d);
        // Compare calendar dates in LOCAL timezone (avoids UTC-offset bugs with date-only strings)
        const orderDay = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
        return orderDay >= cutoffDay;
      })
      .filter(o => !isCancelledOrder(o))
      .sort((a, b) => {
        const da = new Date(a.created_at || a.created_date || a.createdAt || 0);
        const db = new Date(b.created_at || b.created_date || b.createdAt || 0);
        return db - da;
      });
  }, [myOrders, getOrderStatus]);

  // ===== CV-01/CV-48/CV-52: 3-group model (Ожидает / В работе / Выдано) =====
  const statusBuckets = React.useMemo(() => {
    const groups = { pending_unconfirmed: [], served: [], in_progress: [] };
    todayMyOrders.forEach(o => {
      if (isCancelledOrder(o)) return;
      const stageInfo = getOrderStatus(o);
      const isServed = stageInfo?.internal_code === 'finish'
        || (!stageInfo?.internal_code && mapLegacyStatus(o.status) === 'finish');
      // CV-BUG-16: B44 pending status string is 'new' → canonical 'start' code
      const isPending = !stageInfo?.internal_code && mapLegacyStatus(o.status) === 'start';
      if (isServed) groups.served.push(o);
      else if (isPending) groups.pending_unconfirmed.push(o);
      else groups.in_progress.push(o);
    });
    return groups;
  }, [todayMyOrders, getOrderStatus]);

  // Fix 3: R4 — compute terminal version key from current served orders
  const terminalVersion = React.useMemo(() => {
    if (
      statusBuckets.served.length > 0 &&
      statusBuckets.in_progress.length === 0 &&
      statusBuckets.pending_unconfirmed.length === 0 &&
      cartItems.length === 0
    ) {
      return statusBuckets.served.map(o => String(o.id)).sort().join('-');
    }
    return '';
  }, [statusBuckets, cartItems]);

  // Fix 3: R4 — persist terminal version to localStorage when terminal state is active
  React.useEffect(() => {
    if (terminalVersion && terminalVersion !== terminalStateShownForVersion) {
      setTerminalStateShownForVersion(terminalVersion);
      try { localStorage.setItem('terminalStateShownForVersion', terminalVersion); } catch {}
    }
  }, [terminalVersion]);

  // CV-46/Fix 4: Auto-collapse Выдано based on structural changes
  const currentGroupKeys = [
    statusBuckets.served.length > 0 ? 'S' : '',
    statusBuckets.in_progress.length > 0 ? 'I' : '',
    statusBuckets.pending_unconfirmed.length > 0 ? 'P' : '',
    cartItems.length > 0 ? 'C' : ''
  ].join('');

  React.useEffect(() => {
    const structuralChange = currentGroupKeys !== prevGroupKeysRef.current;
    prevGroupKeysRef.current = currentGroupKeys;

    if (structuralChange && !manualOverrideRef.current.served) {
      const otherGroupsExist = statusBuckets.in_progress.length > 0 || statusBuckets.pending_unconfirmed.length > 0 || cartItems.length > 0;
      setExpandedStatuses(prev => ({
        ...prev,
        served: !otherGroupsExist
      }));
    }
  }, [currentGroupKeys]);

  // ===== CV-02: Orders sum for drawer header (replaces ИТОГО ЗА ВИЗИТ) =====
  const ordersSum = React.useMemo(() => {
    const sum = todayMyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [todayMyOrders]);

  // ===== Table Orders from sessionOrders =====
  const ordersByGuestId = React.useMemo(() => {
    const map = new Map();
    (sessionOrders || []).forEach((o) => {
      const gid = getLinkedId(o.guest);
      if (!gid) return;
      const k = String(gid);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(o);
    });
    return map;
  }, [sessionOrders, getLinkedId]);

  const myGuestId = currentGuest?.id ? String(currentGuest.id) : null;

  const otherGuestIdsFromOrders = React.useMemo(() => {
    return Array.from(ordersByGuestId.keys()).filter((gid) => !myGuestId || gid !== myGuestId);
  }, [ordersByGuestId, myGuestId]);

  // CV-BUG-06: exclude cancelled orders from tableOrdersTotal (mirrors renderedTableTotal)
  const tableOrdersTotal = React.useMemo(() => {
    let sum = 0;
    otherGuestIdsFromOrders.forEach((gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      orders.forEach((o) => {
        if (isCancelledOrder(o)) return;
        sum += Number(o.total_amount) || 0;
      });
    });
    return parseFloat(sum.toFixed(2));
  }, [ordersByGuestId, otherGuestIdsFromOrders, isCancelledOrder]);

  // CV-B2 Fix 1.1: Rendered-data aggregates from ordersByGuestId (all guests)
  const renderedTableTotal = React.useMemo(() => {
    let sum = 0;
    ordersByGuestId.forEach((orders) => {
      orders.forEach((o) => {
        if (!isCancelledOrder(o)) sum += Number(o.total_amount) || 0;
      });
    });
    return parseFloat(sum.toFixed(2));
  }, [ordersByGuestId]);

  const renderedTableDishCount = React.useMemo(() => {
    let count = 0;
    ordersByGuestId.forEach((orders) => {
      orders.forEach((o) => {
        if (!isCancelledOrder(o)) {
          const items = itemsByOrder.get(o.id) || [];
          count += items.reduce((s, it) => s + (it.quantity || 1), 0);
        }
      });
    });
    return count;
  }, [ordersByGuestId, itemsByOrder]);

  const renderedTableGuestCount = React.useMemo(() => {
    let count = 0;
    const hasNonCancelled = (gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      return orders.some(o => !isCancelledOrder(o));
    };
    ordersByGuestId.forEach((_orders, gid) => {
      if (hasNonCancelled(gid)) count++;
    });
    return count;
  }, [ordersByGuestId]);

  const getGuestLabelById = (guestId) => {
    const gid = String(guestId);
    const found = (sessionGuests || []).find((g) => String(g.id) === gid);
    if (found) return getGuestDisplayName(found);
    const idx = (otherGuestIdsFromOrders || []).indexOf(gid);
    const guestNum = idx >= 0 ? idx + 2 : '?';
    return `${tr("cart.guest", "Гость")} ${guestNum}`;
  };

  const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

  // RF-4 Sub-4 hotfix (S492): derive paid state from server orders.payment_status
  // Placed BEFORE payment handlers so effectivePaidGuestIds is in scope for useCallback deps.
  // Page reload safe: guestIdsPaid (optimistic) ∪ persistedPaidGuestIds (server-confirmed)
  const persistedPaidGuestIds = React.useMemo(() => {
    const s = new Set();
    if (!ordersByGuestId) return s;
    ordersByGuestId.forEach((orders, gid) => {
      if (orders.length === 0) return;
      // Guest is "paid" only if ALL non-cancelled orders are payment_status='paid'
      const payable = orders.filter(o => !isCancelledOrder(o));
      if (payable.length === 0) return; // cancelled-only — handled by allGuestsPaid payableGids fix
      if (payable.every(o => o.payment_status === 'paid')) {
        s.add(gid);
      }
    });
    return s;
  }, [ordersByGuestId, isCancelledOrder]);

  // Union: optimistic (in-flight) ∪ persisted (server-confirmed) = effective paid state
  const effectivePaidGuestIds = React.useMemo(() => {
    const s = new Set(persistedPaidGuestIds);
    guestIdsPaid.forEach(g => s.add(g));
    return s;
  }, [persistedPaidGuestIds, guestIdsPaid]);

  // ===== PAYMENT HANDLERS (RF-4 Sub-4 Variant A, S490) =====
  // Defined here so tr + ordersByGuestId are in scope.

  const handlePayGuest = React.useCallback(async (guestId, orderIds) => {
    if (!orderIds || orderIds.length === 0) return;
    // Optimistic: mark paid immediately
    setPayingGuestId(guestId);
    setGuestIdsPaid(prev => { const s = new Set(prev); s.add(guestId); return s; });
    try {
      const { failed } = await markOrdersPaid(orderIds);
      if (failed.length > 0) {
        // Partial failure → rollback + notify
        setGuestIdsPaid(prev => { const s = new Set(prev); s.delete(guestId); return s; });
        if (toast) toast({ title: tr('cart.payment.toast.partialFail', 'Не все заказы отмечены, повторите'), variant: 'destructive' });
      }
    } catch {
      setGuestIdsPaid(prev => { const s = new Set(prev); s.delete(guestId); return s; });
      if (toast) toast({ title: tr('cart.payment.toast.error', 'Ошибка оплаты, повторите'), variant: 'destructive' });
    } finally {
      setPayingGuestId(null);
    }
  }, [toast]);

  const handlePayAll = React.useCallback(async () => {
    const allUnpaidIds = [];
    const allGuestIds = [];
    ordersByGuestId.forEach((orders, gid) => {
      const unpaid = orders.filter(o =>
        o.payment_status !== 'paid' &&
        !isCancelledOrder(o) &&
        !effectivePaidGuestIds.has(gid) // P1#2 chain — effectivePaidGuestIds
      );
      if (unpaid.length > 0) {
        allUnpaidIds.push(...unpaid.map(o => o.id));
        allGuestIds.push(gid);
      }
    });
    if (allUnpaidIds.length === 0) return;
    setPayingAll(true);
    // Optimistic: mark all guests paid immediately
    setGuestIdsPaid(prev => { const s = new Set(prev); allGuestIds.forEach(g => s.add(g)); return s; });
    try {
      const { failed } = await markOrdersPaid(allUnpaidIds);
      if (failed.length > 0) {
        setGuestIdsPaid(prev => { const s = new Set(prev); allGuestIds.forEach(g => s.delete(g)); return s; });
        if (toast) toast({ title: tr('cart.payment.toast.partialFail', 'Не все заказы отмечены, повторите'), variant: 'destructive' });
      }
    } catch {
      setGuestIdsPaid(prev => { const s = new Set(prev); allGuestIds.forEach(g => s.delete(g)); return s; });
      if (toast) toast({ title: tr('cart.payment.toast.error', 'Ошибка оплаты, повторите'), variant: 'destructive' });
    } finally {
      setPayingAll(false);
    }
  }, [ordersByGuestId, effectivePaidGuestIds, isCancelledOrder, toast]);

  // All guests paid? (for «Все оплачено» state display)
  // RF-4 Sub-4 hotfix (S492): only consider guests with at least 1 payable order
  const allGuestsPaid = React.useMemo(() => {
    if (!showTableOrdersSection) return false;
    const payableGids = Array.from(ordersByGuestId.entries())
      .filter(([_, orders]) => orders.some(o => !isCancelledOrder(o)))
      .map(([gid]) => gid);
    if (payableGids.length === 0) return false;
    return payableGids.every(gid => effectivePaidGuestIds.has(gid));
  }, [ordersByGuestId, effectivePaidGuestIds, isCancelledOrder, showTableOrdersSection]);

  // ===== Review Reward Flow (P1) =====
  const reviewRewardPoints = Number(partner?.loyalty_review_points || 0);
  const isReviewRewardActive = Number.isFinite(reviewRewardPoints) && reviewRewardPoints > 0;

  // Звёзды показываем если: show_dish_reviews ИЛИ есть награда за отзыв
  const reviewsEnabled = Boolean(partner?.show_dish_reviews || isReviewRewardActive);

  // Есть ли хоть одна оценка (draft или сохранённая)
  const hasAnyRating = React.useMemo(() => {
    const reviewedCount = safeReviewedItems.size ? Number(safeReviewedItems.size) : 0;
    const draftCount = safeDraftRatings ? Object.values(safeDraftRatings).filter(v => Number(v) > 0).length : 0;
    return reviewedCount > 0 || draftCount > 0;
  }, [reviewedItems, draftRatings]);

  // Гость идентифицирован?
  const isCustomerIdentified = Boolean(
    loyaltyAccount?.id || loyaltyAccount?._id || loyaltyAccount?.email || (customerEmail && String(customerEmail).trim())
  );

  // Показывать hint "За отзыв +N бонусов" только если есть блюда для оценки (BUG-PM-030)
  const shouldShowReviewRewardHint = isReviewRewardActive && (reviewableItems?.length > 0);

  // Показывать nudge "Введите email" после первой оценки
  const shouldShowReviewRewardNudge = isReviewRewardActive && hasAnyRating && !isCustomerIdentified;

  // CV-33: splitSummary removed — split-order section removed

  // loyaltySummary + reviewRewardLabel removed — loyalty section simplified (#87 KS-1)

  // ===== CV-01/CV-52: 2-group display names =====
  const bucketDisplayNames = {
    pending_unconfirmed: tr('cart.group.pending', 'Ожидает'),
    served: tr('cart.group.served', 'Выдано'),
    in_progress: tr('cart.group.in_progress', 'В работе'),
  };


  // CV-04: Check if all items in served bucket are rated
  const allServedRated = React.useMemo(() => {
    if (statusBuckets.served.length === 0) return false;
    return statusBuckets.served.every(order => {
      const orderItems = itemsByOrder.get(order.id) || [];
      if (orderItems.length === 0) return true;
      return orderItems.every((item, idx) => {
        const itemId = item.id || `${order.id}_${idx}`;
        return safeReviewedItems.has(itemId) || (safeDraftRatings[itemId] || 0) > 0;
      });
    });
  }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);

  // CV-05 v2: Auto-exit rating mode when all served items are rated
  React.useEffect(() => {
    if (allServedRated) setIsRatingMode(false);
  }, [allServedRated]);

  // CV-36: Count of unrated served items (for chip counter)
  const unratedServedCount = React.useMemo(() => {
    let count = 0;
    statusBuckets.served.forEach(order => {
      const orderItems = itemsByOrder.get(order.id) || [];
      orderItems.forEach((item, idx) => {
        const itemId = item.id || `${order.id}_${idx}`;
        if (!safeReviewedItems.has(itemId) && !(safeDraftRatings[itemId] > 0)) count++;
      });
    });
    return count;
  }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);

  // CV-38: Count of rated served items (for email sheet)
  const ratedServedCount = React.useMemo(() => {
    let count = 0;
    statusBuckets.served.forEach(order => {
      const orderItems = itemsByOrder.get(order.id) || [];
      orderItems.forEach((item, idx) => {
        const itemId = item.id || `${order.id}_${idx}`;
        if (safeReviewedItems.has(itemId) || (safeDraftRatings[itemId] > 0)) count++;
      });
    });
    return count;
  }, [statusBuckets.served, itemsByOrder, safeReviewedItems, safeDraftRatings]);

  // CV-28: getOrderSummary/getOrderTime removed — flat dish list replaces per-order collapse

  // ===== CV-28: Render flat dish list for a status bucket (grouped by dish name) =====
  const renderBucketOrders = (orders, showRating) => (
    <RatingSection
      orders={orders}
      showRating={showRating}
      itemsByOrder={itemsByOrder}
      formatPrice={formatPrice}
      tr={tr}
      reviewsEnabled={reviewsEnabled}
      isRatingMode={isRatingMode}
      safeReviewedItems={safeReviewedItems}
      safeDraftRatings={safeDraftRatings}
      ratingSavingByItemId={ratingSavingByItemId}
      updateDraftRating={updateDraftRating}
      handleRateDish={handleRateDish}
    />
  );

  return (
    <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
      {/* R6-2a T1 Codex App: extracted table-code side effects; visible input remains in PublicMenu caller */}
      <TableCodeGateT1CodexApp03
        isTableVerified={isTableVerified}
        tableCodeInput={tableCodeInput}
        isVerifyingCode={isVerifyingCode}
        verifyTableCode={verifyTableCode}
        codeVerificationError={codeVerificationError}
        hallGuestCodeEnabled={hallGuestCodeEnabled}
        guestCode={guestCode}
        t={t}
        partner={partner}
        currentTable={currentTable}
        setSubmitError={setSubmitError}
        setSubmitPhase={setSubmitPhase}
      />
      {/* BUG-CV-S491 #582: Session closed banner — shown when host closes table in SOM */}
      {isSessionClosed && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 mb-3 flex items-start gap-3">
          <span className="text-amber-500 text-xl mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">
              {tr('cart.session_closed.title', 'Стол закрыт')}
            </p>
            <p className="text-amber-700 text-xs mt-0.5">
              {tr('cart.session_closed.body', 'Официант завершил сессию. Пожалуйста, отсканируйте QR-код ещё раз чтобы сделать новый заказ.')}
            </p>
          </div>
        </div>
      )}
      {/* P0 Header: [🔔] Стол · Гость · [˅] — #140: chevron moved into table card, not sticky */}
      <div className="bg-white rounded-lg shadow-sm border px-3 py-2 mb-4 mt-2">
        <div className="flex items-center justify-between">
          {/* Left: Call waiter */}
          {onCallWaiter && (
            <button
              onClick={onCallWaiter}
              className="min-w-[44px] min-h-[44px] p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center"
              aria-label={tr('help.call_waiter', 'Позвать официанта')}
            >
              <Bell className="w-5 h-5" />
            </button>
          )}

          {/* Center: Table & Guest on one line (CV-31) + orders sum */}
          <div className="text-center flex-1 mx-2">
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="font-medium text-slate-700">{tableLabel}</span>
              <span className="text-slate-400">·</span>
              <GuestNameEdit
                isEditingName={isEditingName}
                guestNameInput={guestNameInput}
                setGuestNameInput={setGuestNameInput}
                handleUpdateGuestName={handleUpdateGuestName}
                setIsEditingName={setIsEditingName}
                currentGuest={currentGuest}
                guestDisplay={guestDisplay}
                primaryColor={primaryColor}
                tr={tr}
              />
            </div>
            {/* CV-B2 Fix 1.3: Attributed header — Стол / Вы */}
            {cartTab === 'table' && renderedTableTotal > 0 ? (
              <div className="text-xs text-slate-500 mt-0.5">
                {tr('cart.header.table_label', 'Стол')}: {renderedTableGuestCount} {pluralizeRu(renderedTableGuestCount, tr('cart.header.guest_one', 'гость'), tr('cart.header.guest_few', 'гостя'), tr('cart.header.guest_many', 'гостей'))} · {renderedTableDishCount} {pluralizeRu(renderedTableDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(renderedTableTotal)}
              </div>
            ) : (() => {
              const ordersItemCount = todayMyOrders.reduce((sum, o) => {
                const items = itemsByOrder.get(o.id) || [];
                return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
              }, 0);
              const cartItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
              const totalDishCount = ordersItemCount + cartItemCount;
              const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
              return totalDishCount > 0 ? (
                <div className="text-xs text-slate-500 mt-0.5">
                  {tr('cart.header.you_label', 'Вы')}: {totalDishCount} {pluralizeRu(totalDishCount, tr('cart.header.dish_one', 'блюдо'), tr('cart.header.dish_few', 'блюда'), tr('cart.header.dish_many', 'блюд'))} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
                </div>
              ) : null;
            })()}
          </div>

          {/* Right: Chevron close — #140 moved from sticky row into table card */}
          <button
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
            aria-label="Close cart"
          >
            <ChevronDown
              className={`w-7 h-7 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500'}`}
            />
          </button>
        </div>
      </div>

      {/* CV-14/CV-56/CV-15: Tabs header — only when multiple guests */}
      {showTableOrdersSection && (
        <Tabs value={cartTab} onValueChange={setCartTab} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="my" className="flex-1">{tr('cart.tab.my', 'Мои')}</TabsTrigger>
            <TabsTrigger value="table" className="flex-1">{tr('cart.tab.table', 'Стол')}</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <TableBillSummary
        showTableOrdersSection={showTableOrdersSection}
        cartTab={cartTab}
        myGuestId={myGuestId}
        ordersByGuestId={ordersByGuestId}
        isCancelledOrder={isCancelledOrder}
        formatPrice={formatPrice}
        getGuestLabelById={getGuestLabelById}
        itemsByOrder={itemsByOrder}
        getSafeStatus={getSafeStatus}
        getOrderStatus={getOrderStatus}
        effectivePaidGuestIds={effectivePaidGuestIds}
        payingGuestId={payingGuestId}
        payingAll={payingAll}
        handlePayGuest={handlePayGuest}
        otherGuestIdsFromOrders={otherGuestIdsFromOrders}
        sessionItems={sessionItems}
        sessionOrders={sessionOrders}
        tr={tr}
        handlePayAll={handlePayAll}
        allGuestsPaid={allGuestsPaid}
        renderedTableTotal={renderedTableTotal}
      />


      <MyOrdersSection
        showTableOrdersSection={showTableOrdersSection}
        cartTab={cartTab}
        statusBuckets={statusBuckets}
        cart={cartItems}
        todayMyOrders={todayMyOrders}
        tr={tr}
        bucketDisplayNames={bucketDisplayNames}
        reviewsEnabled={reviewsEnabled}
        allServedRated={allServedRated}
        isRatingMode={isRatingMode}
        shouldShowReviewRewardNudge={shouldShowReviewRewardNudge}
        setShowPostRatingEmailSheet={setShowPostRatingEmailSheet}
        setIsRatingMode={setIsRatingMode}
        setExpandedStatuses={setExpandedStatuses}
        manualOverrideRef={manualOverrideRef}
        expandedStatuses={expandedStatuses}
        shouldShowReviewRewardHint={shouldShowReviewRewardHint}
        reviewRewardPoints={reviewRewardPoints}
        unratedServedCount={unratedServedCount}
        renderBucketOrders={renderBucketOrders}
        formatPrice={formatPrice}
        updateQuantity={updateQuantity}
        loyaltyPanel={
          <LoyaltyPanel
            show={isFeatureEnabled(partner, 'loyalty') && earnedPoints > 0}
            earnedPoints={earnedPoints}
            tr={tr}
          />
        }
      />


      {/* Spacer so sticky footer doesn't overlap last content */}
      {(cartItems.length > 0 || todayMyOrders.length > 0) && <div className="h-14" />}

      {/* AC-08: Error state with retry */}
      {submitError && cartItems.length > 0 && (
        <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">{submitError}</p>
          <p className="text-xs text-red-500 mt-1">
            {tr('error.send.subtitle', 'Не удалось отправить. Попробуйте снова')}
          </p>
        </div>
      )}

      {/* CV-38: Post-rating email bottom sheet — extracted to refactor/PostRatingEmailSheet (R6-1 Phase B.1, S615) */}
      <PostRatingEmailSheet
        open={showPostRatingEmailSheet}
        onClose={() => setShowPostRatingEmailSheet(false)}
        ratedServedCount={ratedServedCount}
        reviewRewardPoints={reviewRewardPoints}
        primaryColor={primaryColor}
        tr={tr}
        toast={toast}
        setCustomerEmail={setCustomerEmail}
      />

      {/* CV-51: Sticky footer - extracted to StickyFooterCTAT1CodexApp02 (R6-2a T1 fix v2 by Codex App) */}
      <StickyFooterCTAT1CodexApp02
        show={cartItems.length > 0 || todayMyOrders.length > 0}
        cartLength={cartItems.length}
        isSubmitting={isSubmitting}
        submitPhase={submitPhase}
        submitError={submitError}
        setSubmitError={setSubmitError}
        handleSubmitOrder={handleSubmitOrder}
        cartTotalAmount={flowCartTotalAmount}
        discountAmount={discountAmount}
        pointsDiscountAmount={pointsDiscountAmount}
        isSessionClosed={isSessionClosed}
        primaryColor={primaryColor}
        tr={tr}
        onClose={onClose}
        setView={setView}
      />
    </div>
  );
}
