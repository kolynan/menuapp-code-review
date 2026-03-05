// CartView v3 — Drawer UX Refactor
// RELEASE: 260305-03
// Session: S79 + S82
// Changes: sticky header, auto-grow detents, compact table code block,
// 2-line dish layout, "Ваш заказ"/"Выгода" labels, simplified bill
// Base: CartView v2 (260304-01) — two modes preserved
// FIXED: 2026-03-05 - S82 BUG-S81-02: tableCodeLength default 5->4 (real codes are 4 digits)

import React from "react";
import { XIcon, Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, X, Minus, Plus, Star, Receipt, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Rating from "@/components/Rating";

export default function CartView({
  partner,
  currentTable,
  currentGuest,
  t,
  setView,
  isEditingName,
  guestNameInput,
  setGuestNameInput,
  handleUpdateGuestName,
  setIsEditingName,
  getGuestDisplayName,
  cart,
  formatPrice,
  updateQuantity,
  sessionGuests,
  splitType,
  setSplitType,
  showLoginPromptAfterRating,
  customerEmail,
  setCustomerEmail,
  loyaltyLoading,
  loyaltyAccount,
  earnedPoints,
  maxRedeemPoints,
  redeemedPoints,
  setRedeemedPoints,
  toast,
  cartTotalAmount,
  discountAmount,
  pointsDiscountAmount,
  isSubmitting,
  handleSubmitOrder,
  myOrders,
  itemsByOrder,
  getOrderStatus,
  reviewedItems,
  draftRatings,
  updateDraftRating,
  sessionItems,
  sessionOrders,
  myBill,
  reviewableItems,
  openReviewDialog,
  setOtherGuestsExpanded,
  otherGuestsExpanded,
  getLinkId,
  otherGuestsReviewableItems,
  tableTotal,
  formatOrderTime,
  handleRateDish,
  ratingSavingByItemId,
  // TASK-260203-01 P0: Drawer props
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
}) {
  // ===== SAFE PROP DEFAULTS =====
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeMyOrders = Array.isArray(myOrders) ? myOrders : [];
  const safeSessionOrders = Array.isArray(sessionOrders) ? sessionOrders : [];
  const safeSessionGuests = Array.isArray(sessionGuests) ? sessionGuests : [];
  const safeSessionItems = Array.isArray(sessionItems) ? sessionItems : [];
  const safeItemsByOrder = itemsByOrder instanceof Map ? itemsByOrder : new Map();
  const safeReviewableItems = Array.isArray(reviewableItems) ? reviewableItems : [];
  const safeOtherGuestsReviewableItems = Array.isArray(otherGuestsReviewableItems) ? otherGuestsReviewableItems : [];

  // ===== MODE LOGIC =====
  const mode = safeCart.length > 0 ? 'order' : 'history';

  // Crossfade transition state (with cleanup for rapid mode switches)
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const prevModeRef = React.useRef(mode);
  const transitionTimerRef = React.useRef(null);

  React.useEffect(() => {
    if (prevModeRef.current !== mode) {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      setIsTransitioning(true);
      transitionTimerRef.current = setTimeout(() => setIsTransitioning(false), 150);
      prevModeRef.current = mode;
    }
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [mode]);

  // ===== Expandable States =====
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);
  const [myOrdersExpandedInOrder, setMyOrdersExpandedInOrder] = React.useState(false);
  const [billExpandedInOrder, setBillExpandedInOrder] = React.useState(false);
  const [billExpandedInHistory, setBillExpandedInHistory] = React.useState(true);
  const [showAllOrders, setShowAllOrders] = React.useState(false);
  const [splitExpanded, setSplitExpanded] = React.useState(false);
  const [loyaltyExpanded, setLoyaltyExpanded] = React.useState(false);
  const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  const [rewardEmail, setRewardEmail] = React.useState('');
  const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);

  // ===== Table-code verification UX =====
  const [infoModal, setInfoModal] = React.useState(null);
  const [codeAttempts, setCodeAttempts] = React.useState(0);
  const [codeLockedUntil, setCodeLockedUntil] = React.useState(null);
  const [nowTs, setNowTs] = React.useState(() => Date.now());

  const codeInputRef = React.useRef(null);
  const lastVerifyCodeRef = React.useRef(null);
  const countedErrorForCodeRef = React.useRef(null);
  const lastSentVerifyCodeRef = React.useRef(null);

  // Partner-configurable settings
  const tableCodeLength = React.useMemo(() => {
    const n = Number(partner?.table_code_length);
    if (Number.isFinite(n) && n > 0) return Math.max(3, Math.min(8, Math.round(n)));
    return 4; // S82 BUG-S81-02: real codes are 4 digits; was 5 which prevented auto-verify
  }, [partner?.table_code_length]);

  const maxCodeAttempts = React.useMemo(() => {
    const n = Number(partner?.table_code_max_attempts);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.min(10, Math.round(n)));
    return 3;
  }, [partner?.table_code_max_attempts]);

  const codeCooldownSeconds = React.useMemo(() => {
    const n = Number(partner?.table_code_cooldown_seconds);
    if (Number.isFinite(n) && n >= 0) return Math.max(0, Math.min(600, Math.round(n)));
    return 60;
  }, [partner?.table_code_cooldown_seconds]);

  const isCodeLocked = Boolean(codeLockedUntil && nowTs < codeLockedUntil);
  const codeSecondsLeft = isCodeLocked ? Math.max(0, Math.ceil((codeLockedUntil - nowTs) / 1000)) : 0;

  // Tick timer only while locked
  React.useEffect(() => {
    if (!isCodeLocked) return;
    if (typeof window === "undefined") return;
    const id = window.setInterval(() => setNowTs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [isCodeLocked]);

  // Auto-unlock when time passes
  React.useEffect(() => {
    if (!codeLockedUntil) return;
    if (nowTs < codeLockedUntil) return;
    setCodeLockedUntil(null);
    setCodeAttempts(0);
  }, [nowTs, codeLockedUntil]);

  // Reset attempts on successful verification
  React.useEffect(() => {
    if (isTableVerified === true) {
      setCodeAttempts(0);
      setCodeLockedUntil(null);
    }
  }, [isTableVerified]);

  // Count failed attempts
  React.useEffect(() => {
    if (!codeVerificationError) return;
    if (isVerifyingCode) return;
    const lastCode = lastVerifyCodeRef.current;
    if (!lastCode) return;
    if (countedErrorForCodeRef.current === lastCode) return;
    countedErrorForCodeRef.current = lastCode;

    setCodeAttempts((prev) => {
      const next = prev + 1;
      if (maxCodeAttempts > 0 && next >= maxCodeAttempts) {
        if (codeCooldownSeconds > 0) {
          setCodeLockedUntil(Date.now() + codeCooldownSeconds * 1000);
        }
        return maxCodeAttempts;
      }
      return next;
    });
  }, [codeVerificationError, isVerifyingCode, maxCodeAttempts, codeCooldownSeconds]);

  // Auto-verify when code is fully entered
  React.useEffect(() => {
    if (typeof verifyTableCode !== "function") return;
    if (isTableVerified === true) return;
    if (isCodeLocked) return;

    const safe = String(tableCodeInput || "").replace(/\D/g, "").slice(0, tableCodeLength);
    if (safe.length !== tableCodeLength) return;
    if (safe === String(lastSentVerifyCodeRef.current || "")) return;

    const id = setTimeout(() => {
      if (typeof verifyTableCode !== "function") return;
      if (isTableVerified === true) return;
      if (isVerifyingCode) return;
      if (codeLockedUntil && Date.now() < codeLockedUntil) return;

      const codeToVerify = String(safe);
      if (codeToVerify.length !== tableCodeLength) return;
      if (codeToVerify === String(lastSentVerifyCodeRef.current || "")) return;

      lastSentVerifyCodeRef.current = codeToVerify;
      lastVerifyCodeRef.current = codeToVerify;
      countedErrorForCodeRef.current = null;

      verifyTableCode(codeToVerify);
    }, 250);

    return () => clearTimeout(id);
  }, [
    tableCodeInput,
    tableCodeLength,
    verifyTableCode,
    isTableVerified,
    isVerifyingCode,
    isCodeLocked,
    codeLockedUntil,
  ]);

  // ===== Helpers =====

  // Safe translation with fallback
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };

  const trFormat = (key, params, fallback) => {
    const val = typeof t === "function" ? t(key, params) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key)) return fallback;
    return norm;
  };

  // Status label with color/icon per status
  const getSafeStatus = (status) => {
    const STATUS_MAP = {
      'new':       { icon: '\uD83D\uDFE1', label: tr('status.sent', '\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D'),   color: '#EAB308' },
      'start':     { icon: '\uD83D\uDFE1', label: tr('status.sent', '\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D'),   color: '#EAB308' },
      'accepted':  { icon: '\uD83D\uDFE2', label: tr('status.accepted', '\u041F\u0440\u0438\u043D\u044F\u0442'),   color: '#22C55E' },
      'cook':      { icon: '\uD83D\uDD35', label: tr('status.cooking', '\u0413\u043E\u0442\u043E\u0432\u0438\u0442\u0441\u044F'), color: '#3B82F6' },
      'cooking':   { icon: '\uD83D\uDD35', label: tr('status.cooking', '\u0413\u043E\u0442\u043E\u0432\u0438\u0442\u0441\u044F'), color: '#3B82F6' },
      'middle':    { icon: '\uD83D\uDD35', label: tr('status.cooking', '\u0413\u043E\u0442\u043E\u0432\u0438\u0442\u0441\u044F'), color: '#3B82F6' },
      'finish':    { icon: '\u2705', label: tr('status.ready', '\u0413\u043E\u0442\u043E\u0432'),     color: '#16A34A' },
      'ready':     { icon: '\u2705', label: tr('status.ready', '\u0413\u043E\u0442\u043E\u0432'),     color: '#16A34A' },
      'done':      { icon: '\u2705', label: tr('status.ready', '\u0413\u043E\u0442\u043E\u0432'),     color: '#16A34A' },
      'served':    { icon: '\u2705', label: tr('status.served', '\u0412\u044B\u0434\u0430\u043D'),    color: '#16A34A' },
      'cancel':    { icon: '\u274C', label: tr('status.cancelled', '\u041E\u0442\u043C\u0435\u043D\u0451\u043D'), color: '#EF4444' },
      'cancelled': { icon: '\u274C', label: tr('status.cancelled', '\u041E\u0442\u043C\u0435\u043D\u0451\u043D'), color: '#EF4444' },
    };
    const defaultStatus = STATUS_MAP['new'];
    if (!status) return defaultStatus;
    let label = status.label || '';
    let resolvedCode = null;
    if (label.includes('.') && (label.startsWith('orderprocess') || label.startsWith('status'))) {
      const parts = label.split('.');
      resolvedCode = parts[parts.length - 1];
    }
    if (resolvedCode && STATUS_MAP[resolvedCode]) return STATUS_MAP[resolvedCode];
    if (status.internal_code && STATUS_MAP[status.internal_code]) {
      const mapped = STATUS_MAP[status.internal_code];
      return {
        icon: status.icon || mapped.icon,
        label: label || mapped.label,
        color: status.color || mapped.color,
      };
    }
    return {
      icon: status.icon || defaultStatus.icon,
      label: label || defaultStatus.label,
      color: status.color || defaultStatus.color,
    };
  };

  // Guest code from localStorage
  const guestCodeFromStorage = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("menu_guest_code");
      return raw ? String(raw).trim() : null;
    } catch { return null; }
  }, []);

  const effectiveGuestCode = guestCode || guestCodeFromStorage;

  // Guest display (no session ID shown)
  const guestBaseName = currentGuest
    ? (currentGuest.name || getGuestDisplayName(currentGuest))
    : tr("cart.guest", "\u0413\u043E\u0441\u0442\u044C");
  const guestDisplay = guestBaseName;

  // Table label: avoid "Стол Стол 3"
  const tablePrefix = tr("form.table", "\u0421\u0442\u043E\u043B");
  const rawTableLabel = currentTable?.name || currentTable?.code || "\u2014";
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

  // ===== Guest count =====
  const guestCountFromOrders = React.useMemo(() => {
    try {
      const ids = new Set(
        safeSessionOrders
          .map(o => (getLinkId ? getLinkId(o.guest) : o.guest))
          .filter(Boolean)
          .map(x => String(x))
      );
      return ids.size;
    } catch { return 0; }
  }, [safeSessionOrders, getLinkId]);

  const guestCount = Math.max(
    safeSessionGuests.length,
    guestCountFromOrders,
    1
  );
  const canSplit = guestCount > 1;

  // ===== Orders by guest =====
  const ordersByGuestId = React.useMemo(() => {
    const map = new Map();
    safeSessionOrders.forEach((o) => {
      const gid = getLinkId ? getLinkId(o.guest) : o.guest;
      if (!gid) return;
      const k = String(gid);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(o);
    });
    return map;
  }, [safeSessionOrders, getLinkId]);

  const myGuestId = currentGuest?.id ? String(currentGuest.id) : null;

  const otherGuestIdsFromOrders = React.useMemo(() => {
    return Array.from(ordersByGuestId.keys()).filter((gid) => !myGuestId || gid !== myGuestId);
  }, [ordersByGuestId, myGuestId]);

  const tableOrdersTotal = React.useMemo(() => {
    let sum = 0;
    otherGuestIdsFromOrders.forEach((gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      orders.forEach((o) => { sum += Number(o.total_amount) || 0; });
    });
    return sum;
  }, [ordersByGuestId, otherGuestIdsFromOrders]);

  const getGuestLabelById = (guestId) => {
    const gid = String(guestId);
    const found = safeSessionGuests.find((g) => String(g.id) === gid);
    if (found) return getGuestDisplayName(found);
    const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
    return `${tr("cart.guest", "\u0413\u043E\u0441\u0442\u044C")} ${suffix}`;
  };

  const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

  // ===== Review Reward Flow =====
  const reviewRewardPoints = Number(partner?.loyalty_review_points || 0);
  const isReviewRewardActive = Number.isFinite(reviewRewardPoints) && reviewRewardPoints > 0;
  const reviewsEnabled = Boolean(partner?.show_dish_reviews || isReviewRewardActive);

  const hasAnyRating = React.useMemo(() => {
    const reviewedCount = reviewedItems?.size ? Number(reviewedItems.size) : 0;
    const draftCount = draftRatings ? Object.values(draftRatings).filter(v => Number(v) > 0).length : 0;
    return reviewedCount > 0 || draftCount > 0;
  }, [reviewedItems, draftRatings]);

  const isCustomerIdentified = Boolean(
    loyaltyAccount?.id || loyaltyAccount?._id || loyaltyAccount?.email || (customerEmail && String(customerEmail).trim())
  );

  const READY_CODES = ['finish', 'ready', 'done', 'served'];

  const hasReadyOrders = React.useMemo(() => {
    if (!safeMyOrders.length || !getOrderStatus) return false;
    return safeMyOrders.some((order) => {
      const raw = getOrderStatus(order);
      if (!raw) return false;
      if (raw.internal_code && READY_CODES.includes(raw.internal_code)) return true;
      const label = raw.label || '';
      if (label.includes('.')) {
        const code = label.split('.').pop();
        return READY_CODES.includes(code);
      }
      return false;
    });
  }, [safeMyOrders, getOrderStatus]);

  const shouldShowReviewRewardHint = isReviewRewardActive && hasReadyOrders && safeReviewableItems.length > 0;
  const shouldShowReviewRewardNudge = isReviewRewardActive && hasAnyRating && !isCustomerIdentified;

  // Split summary
  const splitSummary = splitType === "all"
    ? `${tr('cart.for_all', '\u041D\u0430 \u0432\u0441\u0435\u0445')} (\u00F7${guestCount})`
    : tr('cart.only_me', '\u0422\u043E\u043B\u044C\u043A\u043E \u044F');

  // My bill amount
  const myBillTotal = myBill?.total || 0;

  // Check if an order is "ready" (for rating prompt)
  const isOrderReady = (order) => {
    const raw = getOrderStatus(order);
    if (!raw) return false;
    if (raw.internal_code && READY_CODES.includes(raw.internal_code)) return true;
    const label = raw.label || '';
    if (label.includes('.')) {
      const code = label.split('.').pop();
      return READY_CODES.includes(code);
    }
    return false;
  };

  // Sorted orders (newest first)
  const sortedOrders = React.useMemo(() => {
    if (!safeMyOrders.length) return [];
    return [...safeMyOrders].sort((a, b) => {
      const ta = new Date(a.created_date || a.created_at || 0).getTime();
      const tb = new Date(b.created_date || b.created_at || 0).getTime();
      return tb - ta;
    });
  }, [safeMyOrders]);

  // Orders to display in Mode 2
  const MAX_VISIBLE_ORDERS = 3;
  const visibleOrders = showAllOrders ? sortedOrders : sortedOrders.slice(0, MAX_VISIBLE_ORDERS);
  const hasMoreOrders = sortedOrders.length > MAX_VISIBLE_ORDERS;

  // ===== RENDER =====
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full relative">
      {/* ===== STICKY HEADER: [Bell] Table · Guest [X] ===== */}
      <div className="shrink-0 bg-white px-4 pb-2 pt-1 border-b border-slate-100">
        <div className="flex items-center justify-between">
          {onCallWaiter && (
            <button
              onClick={onCallWaiter}
              className="p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={tr('help.call_waiter', '\u041F\u043E\u0437\u0432\u0430\u0442\u044C \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0430')}
            >
              <Bell className="w-5 h-5" />
            </button>
          )}

          <div className="text-center flex-1 mx-2">
            <div className="text-sm font-medium text-slate-700">{tableLabel}</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              <span className="text-slate-500">{tr('cart.you', '\u0412\u044B')}:</span>
              {isEditingName ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder={tr('guest.name_placeholder', '\u0418\u043C\u044F')}
                    className="w-20 px-1 py-0.5 text-xs border rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && guestNameInput.trim()) handleUpdateGuestName();
                      if (e.key === 'Escape') { setIsEditingName(false); setGuestNameInput(''); }
                    }}
                  />
                  <button onClick={handleUpdateGuestName} disabled={!guestNameInput.trim()} className="text-green-600">&#x2713;</button>
                  <button onClick={() => { setIsEditingName(false); setGuestNameInput(''); }} className="text-slate-400">&#x2715;</button>
                </span>
              ) : (
                <button
                  onClick={() => { setGuestNameInput(currentGuest?.name || ''); setIsEditingName(true); }}
                  className="text-indigo-600 hover:underline"
                >
                  {guestDisplay} {(!currentGuest?.name) && <span className="text-xs">&#x270F;&#xFE0F;</span>}
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => onClose ? onClose() : setView("menu")}
            aria-label={tr('common.close', '\u0417\u0430\u043A\u0440\u044B\u0442\u044C')}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-3 pb-2">
      <div
        className="transition-opacity duration-150 ease-in-out"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {mode === 'order' ? (
          /* ============================================================ */
          /* MODE 1: "Заказ" (cart > 0)                                  */
          /* ============================================================ */
          <>
            {/* SECTION 1: "Ваш заказ" — items with 2-line layout */}
            <Card className="mb-3">
              <CardContent className="p-4">
                <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  {tr('cart.your_order', '\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437')}
                </h2>

                <div className="space-y-3">
                  {safeCart.map((item) => (
                    <div key={item.dishId} className="py-2 border-b last:border-0">
                      {/* Line 1: name + price */}
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-slate-900 line-clamp-2 flex-1 mr-2">{item.name}</span>
                        <span className="font-semibold text-slate-900 text-sm shrink-0 min-w-[60px] text-right">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                      {/* Line 2: stepper */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.dishId, -1)}
                          className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold text-slate-900 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.dishId, 1)}
                          className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SECTION 2: Table code — compact standalone block */}
            {isTableVerified === false && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-amber-900 shrink-0">
                    {tr('cart.verify.enter_table_code', '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0441\u0442\u043E\u043B\u0430')}
                  </span>
                  <div className={`relative flex items-center gap-1 ${isCodeLocked ? 'opacity-60' : ''}`}>
                    <div
                      className="flex gap-1"
                      onClick={() => !isCodeLocked && codeInputRef.current && codeInputRef.current.focus()}
                    >
                      {Array.from({ length: tableCodeLength }).map((_, idx) => {
                        const safe = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
                        const ch = safe[idx] || '_';
                        return (
                          <div
                            key={idx}
                            className="w-7 h-9 rounded border border-amber-200 bg-white flex items-center justify-center text-lg font-mono text-amber-900"
                          >
                            {ch}
                          </div>
                        );
                      })}
                    </div>
                    {isVerifyingCode && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700 ml-1" />
                    )}
                    <Input
                      ref={codeInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={tableCodeLength}
                      value={String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength)}
                      disabled={isCodeLocked}
                      onChange={(e) => {
                        const next = String(e.target.value || '').replace(/\D/g, '').slice(0, tableCodeLength);
                        if (typeof setTableCodeInput === 'function') setTableCodeInput(next);
                      }}
                      className="absolute inset-0 opacity-0 cursor-text"
                      aria-label={tr('cart.verify.enter_table_code', '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u0441\u0442\u043E\u043B\u0430')}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-amber-700 hover:text-amber-900 text-sm shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    onClick={() => setInfoModal('tableCode')}
                  >
                    &#x24D8;
                  </button>
                </div>
                {/* Status line: locked / error / hint */}
                {isCodeLocked ? (
                  <p className="text-xs text-amber-800 mt-1">
                    &#x23F3; {tr('cart.verify.locked', '\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u043F\u043E\u043F\u044B\u0442\u043E\u043A. \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u0447\u0435\u0440\u0435\u0437')}{' '}
                    {String(Math.floor(codeSecondsLeft / 60)).padStart(2, '0')}:{String(codeSecondsLeft % 60).padStart(2, '0')}
                  </p>
                ) : codeVerificationError && !isVerifyingCode ? (
                  <p className="text-xs text-red-700 mt-1">
                    {codeVerificationError}
                    {maxCodeAttempts > 0 && (
                      <span className="ml-1 text-red-600">
                        ({tr('cart.verify.attempts', '\u041F\u043E\u043F\u044B\u0442\u043A\u0438')}: {Math.min(codeAttempts, maxCodeAttempts)} {tr('common.of', '\u0438\u0437')} {maxCodeAttempts})
                      </span>
                    )}
                  </p>
                ) : hallGuestCodeEnabled && effectiveGuestCode ? (
                  <p className="text-xs text-gray-400 mt-1">
                    {tr('cart.or_tell_waiter', '\u0438\u043B\u0438: \u0441\u043A\u0430\u0436\u0438\u0442\u0435 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0443')} {String(effectiveGuestCode)}
                  </p>
                ) : null}
              </div>
            )}

            {/* SECTION 3: "Выгода" — collapsible discounts/bonuses (no table code) */}
            {(discountAmount > 0 || earnedPoints > 0 || pointsDiscountAmount > 0 || showLoginPromptAfterRating) && (
              <Card className="mb-3">
                <CardContent className="p-4">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setDetailsExpanded(!detailsExpanded)}
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {tr('cart.savings', '\u0412\u044B\u0433\u043E\u0434\u0430')}
                    </span>
                    <div className="flex items-center gap-2">
                      {discountAmount > 0 && (
                        <span className="text-xs text-green-600">-{formatPrice(discountAmount)}</span>
                      )}
                      {earnedPoints > 0 && (
                        <span className="text-xs text-amber-600">+{earnedPoints} {tr('loyalty.points_symbol', '\u0411')}</span>
                      )}
                      {detailsExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </button>

                  {detailsExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-3">
                      {/* Discount info */}
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">{tr('cart.verify.discount_label', '\u0421\u043A\u0438\u0434\u043A\u0430 \u0437\u0430 \u043E\u043D\u043B\u0430\u0439\u043D-\u0437\u0430\u043A\u0430\u0437')}</span>
                          <span className="text-green-700 font-medium">-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      {/* Points discount */}
                      {pointsDiscountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-700">{tr('cart.verify.points_discount_label', '\u0421\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0431\u0430\u043B\u043B\u043E\u0432')}</span>
                          <span className="text-amber-700 font-medium">-{formatPrice(pointsDiscountAmount)}</span>
                        </div>
                      )}

                      {/* Bonus earned */}
                      {partner?.loyalty_enabled && earnedPoints > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-700">{tr('cart.verify.bonus_label', '\u0411\u043E\u043D\u0443\u0441\u044B \u0437\u0430 \u043E\u043D\u043B\u0430\u0439\u043D-\u0437\u0430\u043A\u0430\u0437')}</span>
                          <span className="text-amber-700 font-medium">+{Number(earnedPoints || 0).toLocaleString('ru-RU')}{tr('loyalty.points_symbol', '\u0411')}</span>
                        </div>
                      )}

                      {/* Loyalty section */}
                      {showLoginPromptAfterRating && (
                        <div className="pt-2 border-t">
                          <button
                            type="button"
                            className="w-full flex items-center justify-between text-left"
                            onClick={() => setLoyaltyExpanded(!loyaltyExpanded)}
                          >
                            <div className="flex items-center gap-2">
                              <Gift className="w-4 h-4 text-amber-500" />
                              <span className="text-sm font-medium text-slate-700">{tr('loyalty.title', '\u0411\u043E\u043D\u0443\u0441\u044B')}</span>
                            </div>
                            {loyaltyExpanded
                              ? <ChevronUp className="w-4 h-4 text-slate-400" />
                              : <ChevronDown className="w-4 h-4 text-slate-400" />
                            }
                          </button>

                          {loyaltyExpanded && (
                            <div className="mt-3 space-y-3">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                  {tr('loyalty.email_label', 'Email \u0434\u043B\u044F \u0431\u043E\u043D\u0443\u0441\u043E\u0432')}
                                </label>
                                <Input
                                  type="email"
                                  value={customerEmail}
                                  onChange={(e) => setCustomerEmail(e.target.value)}
                                  placeholder={tr('loyalty.email_placeholder', 'email@example.com')}
                                />
                              </div>

                              {!customerEmail.trim() ? (
                                <p className="text-xs text-slate-500">{tr('loyalty.enter_email_hint', '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email \u0434\u043B\u044F \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F \u0431\u043E\u043D\u0443\u0441\u043E\u0432')}</p>
                              ) : loyaltyLoading ? (
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  {tr('common.loading', '\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430')}
                                </div>
                              ) : !loyaltyAccount ? (
                                partner?.loyalty_enabled && (
                                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                                    {trFormat('loyalty.new_customer', { points: earnedPoints }, `\u0412\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u0435 ${earnedPoints} \u0431\u043E\u043D\u0443\u0441\u043E\u0432 \u0437\u0430 \u043F\u0435\u0440\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437`)}
                                  </div>
                                )
                              ) : (
                                <div className="space-y-2">
                                  <div className="bg-indigo-50 p-2 rounded-lg text-xs">
                                    <div className="text-slate-600">
                                      {trFormat('loyalty.your_balance', { points: loyaltyAccount.balance.toLocaleString('ru-RU') }, `\u0412\u0430\u0448 \u0431\u0430\u043B\u0430\u043D\u0441: ${loyaltyAccount.balance.toLocaleString('ru-RU')} \u0431\u0430\u043B\u043B\u043E\u0432`)}
                                    </div>
                                    <div className="text-slate-500">
                                      = {(loyaltyAccount.balance * (partner?.loyalty_redeem_rate || 1)).toLocaleString('ru-RU')}\u20B8
                                    </div>
                                  </div>

                                  {loyaltyAccount.balance > 0 && maxRedeemPoints > 0 && (
                                    <div className="space-y-1">
                                      <label className="text-xs font-medium text-slate-700">
                                        {tr('loyalty.redeem_points', '\u0421\u043F\u0438\u0441\u0430\u0442\u044C \u0431\u0430\u043B\u043B\u044B')}
                                      </label>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          type="number"
                                          min={0}
                                          max={maxRedeemPoints}
                                          value={redeemedPoints}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            setRedeemedPoints(Math.min(Math.max(0, val), maxRedeemPoints));
                                          }}
                                          className="w-24 h-8 text-sm"
                                        />
                                        <Button
                                          size="sm"
                                          className="h-8 text-xs"
                                          onClick={() => {
                                            setRedeemedPoints(maxRedeemPoints);
                                            toast.success(tr('loyalty.points_applied', '\u0411\u0430\u043B\u043B\u044B \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u044B'), { id: 'mm1' });
                                          }}
                                        >
                                          {tr('loyalty.apply', '\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C')}
                                        </Button>
                                      </div>
                                      <p className="text-xs text-slate-500">
                                        {trFormat('loyalty.max_redeem', {
                                          max: maxRedeemPoints.toLocaleString('ru-RU'),
                                          percent: partner?.loyalty_max_redeem_percent || 0
                                        }, `\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${maxRedeemPoints} \u0431\u0430\u043B\u043B\u043E\u0432 (${partner?.loyalty_max_redeem_percent || 0}% \u043E\u0442 \u0437\u0430\u043A\u0430\u0437\u0430)`)}
                                      </p>
                                    </div>
                                  )}

                                  {partner?.discount_enabled && (
                                    partner.discount_allow_anonymous === true || customerEmail.trim() ? (
                                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                                        {trFormat('loyalty.instant_discount', { percent: partner.discount_percent || 0 }, `\u0421\u043A\u0438\u0434\u043A\u0430 ${partner.discount_percent || 0}% \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0430`)}
                                      </div>
                                    ) : (
                                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                        {trFormat('loyalty.enter_email_for_discount', { percent: partner.discount_percent || 0 }, `\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email \u0434\u043B\u044F \u0441\u043A\u0438\u0434\u043A\u0438 ${partner.discount_percent || 0}%`)}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SECTION 4: "Мои заказы (N) · сумма" — collapsed, expands inline */}
            {safeMyOrders.length > 0 && (
              <Card className="mb-3">
                <CardContent className="p-4">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setMyOrdersExpandedInOrder(!myOrdersExpandedInOrder)}
                  >
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {tr('cart.my_orders_row', '\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B')} ({safeMyOrders.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{formatPrice(myBillTotal)}</span>
                      {myOrdersExpandedInOrder
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </button>

                  {myOrdersExpandedInOrder && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {sortedOrders.slice(0, 2).map((order) => {
                        const status = getSafeStatus(getOrderStatus(order));
                        const orderItems = safeItemsByOrder.get(order.id) || [];
                        const itemsSummary = orderItems.length > 0
                          ? orderItems.map(i => `${i.dish_name} \u00D7${i.quantity}`).join(', ')
                          : formatPrice(order.total_amount);

                        return (
                          <div key={order.id} className="text-xs text-slate-600 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <span className="text-slate-400 mr-2">{formatOrderTime(order)}</span>
                              <span className="truncate">{itemsSummary}</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs ml-2 shrink-0" style={{ color: status.color }}>
                              {status.icon} {status.label}
                            </span>
                          </div>
                        );
                      })}
                      {sortedOrders.length > 2 && (
                        <button
                          type="button"
                          className="text-xs text-indigo-600 hover:underline"
                          onClick={() => setShowAllOrders(true)}
                        >
                          {tr('cart.show_all_orders', '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435')} ({sortedOrders.length})
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SECTION 5: "Счёт" — simplified for single guest */}
            <Card className="mb-3">
              <CardContent className="p-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setBillExpandedInOrder(!billExpandedInOrder)}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {tr('cart.bill_row', '\u0421\u0447\u0451\u0442')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      {canSplit && <>{splitSummary}: </>}{formatPrice(splitType === 'all' && canSplit ? Math.ceil((myBillTotal + (Number(cartTotalAmount) || 0)) / guestCount) : myBillTotal + (Number(cartTotalAmount) || 0))}
                    </span>
                    {billExpandedInOrder
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />
                    }
                  </div>
                </button>

                {billExpandedInOrder && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {/* Split toggle */}
                    {isTableVerified === true && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            splitType === 'single'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                          onClick={() => setSplitType('single')}
                        >
                          {tr('cart.only_me', '\u0422\u043E\u043B\u044C\u043A\u043E \u044F')}: {formatPrice(myBillTotal + (Number(cartTotalAmount) || 0))}
                        </button>
                        <button
                          type="button"
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            splitType === 'all'
                              ? 'bg-indigo-100 text-indigo-700'
                              : canSplit ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                          }`}
                          onClick={() => canSplit && setSplitType('all')}
                          disabled={!canSplit}
                        >
                          {tr('cart.for_all', '\u041D\u0430 \u0432\u0441\u0435\u0445')}: {formatPrice(tableTotal || (myBillTotal + (Number(cartTotalAmount) || 0)))}
                        </button>
                      </div>
                    )}

                    {/* Other guests — only visible in "На всех" mode */}
                    {splitType === 'all' && showTableOrdersSection && (
                      <div className="pt-2 border-t">
                        <button
                          type="button"
                          className="w-full flex items-center justify-between text-left text-sm"
                          onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}
                        >
                          <span className="text-slate-600">
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            {tr('cart.other_guests', '\u0414\u0440\u0443\u0433\u0438\u0435 \u0433\u043E\u0441\u0442\u0438')} ({otherGuestIdsFromOrders.length})
                          </span>
                          {otherGuestsExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          }
                        </button>

                        {otherGuestsExpanded && (
                          <div className="mt-2 space-y-2">
                            {otherGuestIdsFromOrders.map((gid) => {
                              const guestOrders = ordersByGuestId.get(gid) || [];
                              const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                              return (
                                <div key={gid} className="flex justify-between text-xs text-slate-600">
                                  <span>{getGuestLabelById(gid)}</span>
                                  <span className="font-medium">{formatPrice(guestTotal)}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </>
        ) : (
          /* ============================================================ */
          /* MODE 2: "Чеки" (cart === 0)                                 */
          /* ============================================================ */
          <>
            {/* SECTION: МОИ ЗАКАЗЫ */}
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2 px-1">
                <Receipt className="w-5 h-5 text-indigo-600" />
                {tr('cart.my_orders_title', '\u041C\u041E\u0418 \u0417\u0410\u041A\u0410\u0417\u042B')}
              </h2>

              {sortedOrders.length === 0 ? (
                /* Empty state */
                <Card className="mb-4">
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 mb-4">
                      {tr('cart.no_orders_yet', '\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432')}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => onClose ? onClose() : setView("menu")}
                      className="min-h-[44px]"
                    >
                      {tr('cart.choose_dishes', '\u0412\u044B\u0431\u0440\u0430\u0442\u044C \u0431\u043B\u044E\u0434\u0430')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {visibleOrders.map((order, orderIdx) => {
                    const orderItems = safeItemsByOrder.get(order.id) || [];
                    const rawStatus = getOrderStatus(order);
                    const status = getSafeStatus(rawStatus);
                    const isReady = isOrderReady(order);
                    const isNewest = orderIdx === 0;

                    return (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          {/* Order header: time + number + status badge */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-slate-400">
                              {formatOrderTime(order)}
                              {order.order_number && (
                                <span className="ml-2 text-slate-500">
                                  {tr('cart.order_label', '\u0417\u0430\u043A\u0430\u0437')} #{order.order_number}
                                </span>
                              )}
                            </div>
                            <span
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                              style={{ backgroundColor: `${status.color}15`, color: status.color }}
                            >
                              {status.icon} {status.label}
                            </span>
                          </div>

                          {/* Order items summary */}
                          {orderItems.length > 0 ? (
                            <div className={isNewest ? "space-y-2" : ""}>
                              {isNewest ? (
                                /* Newest order: expanded with details */
                                orderItems.map((item, idx) => {
                                  const itemId = item.id || `${order.id}_${idx}`;
                                  const hasReview = reviewedItems.has(itemId);
                                  const draftRating = draftRatings[itemId] || 0;

                                  return (
                                    <div key={itemId} className="space-y-1">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-700">{item.dish_name} &times; {item.quantity}</span>
                                        <span className="text-slate-600">{formatPrice(item.line_total ?? (item.dish_price * item.quantity))}</span>
                                      </div>

                                      {/* Rating stars for ready orders */}
                                      {reviewsEnabled && isReady && (
                                        <div className="flex items-center gap-2 pl-2">
                                          <Rating
                                            value={draftRating}
                                            onChange={(val) => {
                                              if (draftRating > 0 || hasReview) return;
                                              updateDraftRating(itemId, val);
                                              if (val > 0 && handleRateDish) {
                                                const dishId = typeof item.dish === 'object' ? item.dish?.id : item.dish;
                                                handleRateDish({
                                                  itemId,
                                                  dishId,
                                                  orderId: order.id,
                                                  rating: val,
                                                });
                                              }
                                            }}
                                            size="sm"
                                            readonly={draftRating > 0 || hasReview || ratingSavingByItemId?.[itemId]}
                                          />
                                          {ratingSavingByItemId?.[itemId] && (
                                            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                                          )}
                                          {(draftRating > 0 || hasReview) && !ratingSavingByItemId?.[itemId] && (
                                            <span className="text-xs text-green-600">
                                              {isReviewRewardActive
                                                ? `${tr('loyalty.thanks_short', '\u0421\u043F\u0430\u0441\u0438\u0431\u043E!')} +${reviewRewardPoints}${tr('loyalty.points_symbol', '\u0411')}`
                                                : '\u2713'}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                /* Older orders: compact summary line */
                                <div className="text-sm text-slate-600">
                                  {orderItems.map(i => `${i.dish_name} \u00D7${i.quantity}`).join(', ')}
                                  <span className="ml-2 font-medium">{formatPrice(order.total_amount)}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">
                              {tr('cart.order_total', '\u0421\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430')}: {formatPrice(order.total_amount)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {/* "Показать все (N)" button */}
                  {hasMoreOrders && !showAllOrders && (
                    <button
                      type="button"
                      className="w-full text-sm text-indigo-600 hover:underline py-2 text-center"
                      onClick={() => setShowAllOrders(true)}
                    >
                      {tr('cart.show_all_orders', '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0432\u0441\u0435')} ({sortedOrders.length})
                    </button>
                  )}
                </div>
              )}

              {/* "Заказать ещё" button */}
              {sortedOrders.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-4 min-h-[48px] text-base"
                  onClick={() => onClose ? onClose() : setView("menu")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {tr('cart.order_more', '\u0417\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451')}
                </Button>
              )}
            </div>

            {/* Review reward nudge (after first rating, ask for email) */}
            {shouldShowReviewRewardNudge && (
              <div className="mb-4 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                {!showRewardEmailForm ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">
                      {tr('loyalty.thanks_for_rating', '\u0421\u043F\u0430\u0441\u0438\u0431\u043E \u0437\u0430 \u043E\u0446\u0435\u043D\u043A\u0443!')}
                    </span>
                    <button
                      type="button"
                      className="text-indigo-600 hover:underline font-medium text-sm"
                      onClick={() => setShowRewardEmailForm(true)}
                    >
                      {tr('loyalty.get_bonus', '\u041F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0431\u043E\u043D\u0443\u0441\u044B')} &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-700 text-xs">
                      {tr('loyalty.enter_email_for_bonus', '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email \u0434\u043B\u044F \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u0438\u044F \u0431\u043E\u043D\u0443\u0441\u043E\u0432:')}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={rewardEmail}
                        onChange={(e) => setRewardEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="flex-1 h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        className="h-9"
                        disabled={!rewardEmail.trim() || rewardEmailSubmitting}
                        onClick={() => {
                          if (!rewardEmail.trim()) return;
                          setRewardEmailSubmitting(true);
                          if (setCustomerEmail) setCustomerEmail(rewardEmail);
                          if (toast) toast.success(tr('loyalty.email_saved', 'Email \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D! \u0411\u043E\u043D\u0443\u0441\u044B \u0431\u0443\u0434\u0443\u0442 \u043D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u044B.'));
                          setTimeout(() => {
                            setRewardEmailSubmitting(false);
                            setShowRewardEmailForm(false);
                          }, 1000);
                        }}
                      >
                        {rewardEmailSubmitting ? '...' : tr('common.save', '\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: СЧЁТ */}
            {(safeMyOrders.length > 0 || showTableOrdersSection) && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    {tr('cart.bill_title', '\u0421\u0427\u0401\u0422')}
                  </h2>

                  {/* Toggle buttons: Только я / На всех */}
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      type="button"
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        splitType === 'single'
                          ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      onClick={() => setSplitType('single')}
                    >
                      {tr('cart.only_me', '\u0422\u043E\u043B\u044C\u043A\u043E \u044F')}: {formatPrice(myBillTotal)}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        splitType === 'all'
                          ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                          : canSplit ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      }`}
                      onClick={() => canSplit && setSplitType('all')}
                      disabled={!canSplit}
                    >
                      {tr('cart.for_all', '\u041D\u0430 \u0432\u0441\u0435\u0445')}: {formatPrice(tableTotal || myBillTotal)}
                    </button>
                  </div>

                  {/* Other guests (only visible in "На всех" mode) */}
                  {splitType === 'all' && showTableOrdersSection && (
                    <div className="pt-3 border-t">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between text-left text-sm"
                        onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}
                      >
                        <span className="text-slate-600">
                          <Users className="w-3.5 h-3.5 inline mr-1" />
                          {tr('cart.other_guests', '\u0414\u0440\u0443\u0433\u0438\u0435 \u0433\u043E\u0441\u0442\u0438')} ({otherGuestIdsFromOrders.length})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">{formatPrice(tableOrdersTotal)}</span>
                          {otherGuestsExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          }
                        </div>
                      </button>

                      {otherGuestsExpanded && (
                        <div className="mt-2 pt-2 border-t space-y-2">
                          {otherGuestIdsFromOrders.map((gid) => {
                            const guestOrders = ordersByGuestId.get(gid) || [];
                            const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                            return (
                              <div key={gid} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">{getGuestLabelById(gid)}</span>
                                <span className="font-medium text-slate-700">{formatPrice(guestTotal)}</span>
                              </div>
                            );
                          })}

                          {safeOtherGuestsReviewableItems.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => openReviewDialog(safeOtherGuestsReviewableItems)}
                            >
                              {tr('review.rate_others', '\u041E\u0446\u0435\u043D\u0438\u0442\u044C \u0431\u043B\u044E\u0434\u0430 \u0433\u043E\u0441\u0442\u0435\u0439')}
                              {loyaltyAccount && ` (+${safeOtherGuestsReviewableItems.length * (partner?.loyalty_review_points || 10)} ${tr('review.points', '\u0431\u0430\u043B\u043B\u043E\u0432')})`}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      </div>{/* end SCROLLABLE CONTENT */}

      {/* ===== STICKY FOOTER (mode 1 only) ===== */}
      {mode === 'order' && (
        <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              {tr('cart.total', '\u0418\u0422\u041E\u0413\u041E')}:
            </span>
            <span className="text-lg font-bold text-slate-900">{formatPrice(cartGrandTotal)}</span>
          </div>
          <Button
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 min-h-[48px]"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || isTableVerified === false}
          >
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{tr('cart.submitting', '\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430...')}</>
              : tr('cart.send_to_waiter', '\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0443')
            }
          </Button>
          {isTableVerified === false && (
            <p className="text-xs text-amber-600 text-center mt-1">
              {tr('cart.verify_to_submit', '\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0441\u0442\u043E\u043B \u0434\u043B\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438')}
            </p>
          )}
        </div>
      )}

      {/* Info modal (table code / online order) */}
      {infoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={() => setInfoModal(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-xl shadow-lg border p-4"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-slate-900">
                {infoModal === 'online'
                  ? tr('cart.verify.info_online_title', '\u041E\u043D\u043B\u0430\u0439\u043D-\u0437\u0430\u043A\u0430\u0437 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0443')
                  : tr('cart.verify.info_table_code_title', '\u041A\u043E\u0434 \u0441\u0442\u043E\u043B\u0430')}
              </div>
              <button
                type="button"
                className="p-1 rounded hover:bg-slate-100 text-slate-500"
                onClick={() => setInfoModal(null)}
                aria-label={tr('common.close', '\u0417\u0430\u043A\u0440\u044B\u0442\u044C')}
              >
                &#x2715;
              </button>
            </div>

            {infoModal === 'online' ? (
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
                <li>{tr('cart.verify.info_online_point1', '\u0417\u0430\u043A\u0430\u0437 \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0443')}</li>
                <li>{tr('cart.verify.info_online_point2', '\u041E\u0431\u044B\u0447\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435')}</li>
                <li>{tr('cart.verify.info_online_point3', '\u0421\u043A\u0438\u0434\u043A\u0430 \u0438 \u0431\u043E\u043D\u0443\u0441\u044B (\u0435\u0441\u043B\u0438 \u0435\u0441\u0442\u044C) \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438')}</li>
              </ul>
            ) : (
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
                <li>{tr('cart.verify.info_table_code_point1', '\u041A\u043E\u0434 \u043E\u0431\u044B\u0447\u043D\u043E \u0443\u043A\u0430\u0437\u0430\u043D \u043D\u0430 \u0441\u0442\u043E\u043B\u0435')}</li>
                <li>{tr('cart.verify.info_table_code_point2', '\u0415\u0441\u043B\u0438 \u043D\u0435 \u0432\u0438\u0434\u043D\u043E \u2014 \u0441\u043F\u0440\u043E\u0441\u0438\u0442\u0435 \u0443 \u043E\u0444\u0438\u0446\u0438\u0430\u043D\u0442\u0430')}</li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
