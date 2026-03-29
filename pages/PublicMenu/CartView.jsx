import React from "react";
import { Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Rating from "@/components/Rating";

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

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
  submitError,
  setSubmitError,
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
  showLoyaltySection,
}) {
  const primaryColor = partner?.primary_color || '#1A1A1A';

  // ===== P0: Safe prop defaults (BUG-PM-023, BUG-PM-025) =====
  const safeReviewedItems = reviewedItems || new Set();
  const safeDraftRatings = draftRatings || {};

  // ===== P1 Expandable States =====
  // CV-33: splitExpanded removed — split-order section removed
  // loyaltyExpanded removed — loyalty section simplified to motivation text (#87 KS-1)
  // CV-01/CV-09: Status-based bucket expand states (replaces old binary split)
  const [expandedStatuses, setExpandedStatuses] = React.useState({
    served: false, // Подано — collapsed by default (CV-10)
    ready: true,
    in_progress: true,
    accepted: true,
    new_order: true, // Отправлено
  });
  // CV-28: expandedOrders removed — flat dish list replaces per-order collapse

  // CV-32: Auto-collapse "Подано" when cart is non-empty (D1 state)
  React.useEffect(() => {
    if (cart.length > 0) {
      setExpandedStatuses(prev => ({
        ...prev,
        served: false,
        ready: false,
        in_progress: false,
        accepted: false,
      }));
    }
  }, [cart.length > 0]);
  const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  const [rewardEmail, setRewardEmail] = React.useState('');
  const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');

  // ===== P0: Table-code verification UX (mask + auto-verify + cooldown) =====
  const [infoModal, setInfoModal] = React.useState(null); // 'online' | 'tableCode' | null
  const [codeAttempts, setCodeAttempts] = React.useState(0);
  const [codeLockedUntil, setCodeLockedUntil] = React.useState(null); // timestamp ms
  const [nowTs, setNowTs] = React.useState(() => Date.now());

  const codeInputRef = React.useRef(null);
  const lastVerifyCodeRef = React.useRef(null);
  const countedErrorForCodeRef = React.useRef(null);
  const lastSentVerifyCodeRef = React.useRef(null);
  const rewardTimerRef = React.useRef(null);

  // Cleanup reward-email timer on unmount (PM-S140-03)
  React.useEffect(() => () => clearTimeout(rewardTimerRef.current), []);

  // Partner-configurable settings (fallbacks until Base44 adds real fields)
  const tableCodeLength = React.useMemo(() => {
    const n = Number(partner?.table_code_length);
    if (Number.isFinite(n) && n > 0) return Math.max(3, Math.min(8, Math.round(n)));
    return 4;
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
    // BUG-PM-029: Allow retrying same code after cooldown expires
    lastSentVerifyCodeRef.current = null;
  }, [nowTs, codeLockedUntil]);

  // Reset attempts on successful verification + scroll to top
  React.useEffect(() => {
    if (isTableVerified === true) {
      setCodeAttempts(0);
      setCodeLockedUntil(null);
      // Scroll drawer back to top after successful verification
      const scrollable = document.querySelector('[data-radix-scroll-area-viewport], [role="dialog"]');
      if (scrollable) scrollable.scrollTop = 0;
    }
  }, [isTableVerified]);

  // Count failed attempts (UI-level), and apply cooldown after max attempts.
  React.useEffect(() => {
    if (!codeVerificationError) return;
    if (isVerifyingCode) return;
    const lastCode = lastVerifyCodeRef.current;
    if (!lastCode) return;

    // Count once per verified code
    if (countedErrorForCodeRef.current === lastCode) return;
    countedErrorForCodeRef.current = lastCode;

    // BUG-PM-029: Clear lastSentVerifyCodeRef so same code can be retried after failure
    lastSentVerifyCodeRef.current = null;

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

  // Auto-verify when code is fully entered (debounced)
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


  // ===== P0 UX helpers =====

  // Safe translation with fallback
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };

  // Translation with params
  const trFormat = (key, params, fallback) => {
    const val = typeof t === "function" ? t(key, params) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key)) return fallback;
    return norm;
  };

  // Safe status label - guest-facing (CV-08: 5 statuses)
  const getSafeStatus = (status) => {
    if (!status) {
      return { icon: '🔵', label: tr('status.sent', 'Отправлено'), color: '#6B7280' };
    }

    let label = status.label || '';

    // Check if label is a raw translation key (contains dots and looks like a key)
    if (label.includes('.') && (label.startsWith('orderprocess') || label.startsWith('status'))) {
      const parts = label.split('.');
      const code = parts[parts.length - 1];

      const fallbacks = {
        'new': tr('status.sent', 'Отправлено'),
        'start': tr('status.cooking', 'Готовится'),
        'cook': tr('status.cooking', 'Готовится'),
        'cooking': tr('status.cooking', 'Готовится'),
        'finish': tr('status.ready', 'Готов'),
        'ready': tr('status.ready', 'Готов'),
        'done': tr('status.served', 'Подано'),
        'accepted': tr('status.accepted', 'Принят'),
        'served': tr('status.served', 'Подано'),
        'completed': tr('status.served', 'Подано'),
        'cancel': tr('status.cancelled', 'Отменён'),
        'cancelled': tr('status.cancelled', 'Отменён'),
      };

      label = fallbacks[code] || tr('status.sent', 'Отправлено');
    }

    return {
      icon: status.icon || '🔵',
      label: label,
      color: status.color || '#6B7280'
    };
  };

  // Guest code from localStorage (e.g., "#6475")
  const guestCodeFromStorage = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem("menu_guest_code");
      return raw ? String(raw).trim() : null;
    } catch {
      return null;
    }
  }, []);

  // Effective guest code: prop takes priority, fallback to localStorage (only if hall guest codes enabled)
  const effectiveGuestCode = guestCode || (hallGuestCodeEnabled ? guestCodeFromStorage : null);

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
          .map(o => (getLinkId ? getLinkId(o.guest) : o.guest))
          .filter(Boolean)
          .map(x => String(x))
      );
      return ids.size;
    } catch {
      return 0;
    }
  }, [sessionOrders, getLinkId]);

  const guestCount = Math.max(
    Array.isArray(sessionGuests) ? sessionGuests.length : 0,
    guestCountFromOrders,
    1
  );
  const canSplit = guestCount > 1;

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
      .filter(o => o.status !== 'cancelled')
      .sort((a, b) => {
        const da = new Date(a.created_at || a.created_date || a.createdAt || 0);
        const db = new Date(b.created_at || b.created_date || b.createdAt || 0);
        return db - da;
      });
  }, [myOrders]);

  // ===== CV-01/CV-09: Status-based buckets (replaces binary Выдано/Заказано split) =====
  const statusBuckets = React.useMemo(() => {
    const buckets = { served: [], ready: [], in_progress: [], accepted: [], new_order: [] };
    todayMyOrders.forEach(o => {
      const s = o.status;
      if (s === 'served' || s === 'completed') buckets.served.push(o);
      else if (s === 'ready') buckets.ready.push(o);
      else if (s === 'in_progress') buckets.in_progress.push(o);
      else if (s === 'accepted') buckets.accepted.push(o);
      else if (s === 'new') buckets.new_order.push(o);
      // cancelled: already filtered out
    });
    return buckets;
  }, [todayMyOrders]);

  // ===== CV-02: Orders sum for drawer header (replaces ИТОГО ЗА ВИЗИТ) =====
  const ordersSum = React.useMemo(() => {
    const sum = todayMyOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    return parseFloat(sum.toFixed(2));
  }, [todayMyOrders]);

  // ===== Table Orders from sessionOrders =====
  const ordersByGuestId = React.useMemo(() => {
    const map = new Map();
    (sessionOrders || []).forEach((o) => {
      const gid = getLinkId ? getLinkId(o.guest) : o.guest;
      if (!gid) return;
      const k = String(gid);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(o);
    });
    return map;
  }, [sessionOrders, getLinkId]);

  const myGuestId = currentGuest?.id ? String(currentGuest.id) : null;

  const otherGuestIdsFromOrders = React.useMemo(() => {
    return Array.from(ordersByGuestId.keys()).filter((gid) => !myGuestId || gid !== myGuestId);
  }, [ordersByGuestId, myGuestId]);

  const tableOrdersTotal = React.useMemo(() => {
    let sum = 0;
    otherGuestIdsFromOrders.forEach((gid) => {
      const orders = ordersByGuestId.get(gid) || [];
      orders.forEach((o) => {
        sum += Number(o.total_amount) || 0;
      });
    });
    return sum;
  }, [ordersByGuestId, otherGuestIdsFromOrders]);

  const getGuestLabelById = (guestId) => {
    const gid = String(guestId);
    const found = (sessionGuests || []).find((g) => String(g.id) === gid);
    if (found) return getGuestDisplayName(found);
    const suffix = gid.length >= 4 ? gid.slice(-4) : gid;
    return `${tr("cart.guest", "Гость")} ${suffix}`;
  };

  const showTableOrdersSection = otherGuestIdsFromOrders.length > 0;

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

  // ===== CV-01: Bucket display names =====
  const bucketDisplayNames = {
    served: 'Подано',
    ready: 'Готов',
    in_progress: 'Готовится',
    accepted: 'Принят',
    new_order: 'Отправлено',
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

  // CV-28: getOrderSummary/getOrderTime removed — flat dish list replaces per-order collapse

  // ===== CV-28: Render flat dish list for a status bucket (grouped by dish name) =====
  const renderBucketOrders = (orders, showRating) => {
    // Collect ALL items from ALL orders in this bucket
    const allItems = [];
    orders.forEach(order => {
      const orderItems = itemsByOrder.get(order.id) || [];
      orderItems.forEach((item, idx) => {
        allItems.push({
          ...item,
          itemId: item.id || `${order.id}_${idx}`,
          orderId: order.id,
        });
      });
    });

    // Group by dish_name for display
    const grouped = new Map();
    allItems.forEach(item => {
      const name = item.dish_name || 'Unknown';
      if (!grouped.has(name)) {
        grouped.set(name, { name, totalQty: 0, totalPrice: 0, items: [] });
      }
      const g = grouped.get(name);
      g.totalQty += (item.quantity || 1);
      g.totalPrice += (item.line_total ?? (item.dish_price * (item.quantity || 1)));
      g.items.push(item);
    });

    const groups = Array.from(grouped.values());

    return (
      <div className="space-y-1 mt-3 pt-3">
        {groups.map(g => (
          <div key={g.name}>
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-slate-700">
                {g.name}{g.totalQty > 1 ? ` ×${g.totalQty}` : ''}
              </span>
              <span className="text-slate-600">{formatPrice(parseFloat(g.totalPrice.toFixed(2)))}</span>
            </div>
            {/* CV-04/CV-05: Per-item ratings in served bucket */}
            {showRating && reviewsEnabled && g.items.map(item => {
              const hasReview = safeReviewedItems.has(item.itemId);
              const draftRating = safeDraftRatings[item.itemId] || 0;
              return (
                <div key={item.itemId} className="flex items-center gap-2 pl-2 py-1">
                  <Rating
                    value={draftRating}
                    onChange={(val) => {
                      if (draftRating > 0 || hasReview) return;
                      updateDraftRating(item.itemId, val);
                      if (val > 0 && handleRateDish) {
                        const dishId = typeof item.dish === 'object' ? item.dish?.id : item.dish;
                        handleRateDish({
                          itemId: item.itemId,
                          dishId,
                          orderId: item.orderId,
                          rating: val,
                        });
                      }
                    }}
                    size="md"
                    readonly={draftRating > 0 || hasReview || ratingSavingByItemId?.[item.itemId]}
                  />
                  {ratingSavingByItemId?.[item.itemId] && (
                    <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                  )}
                  {(draftRating > 0 || hasReview) && !ratingSavingByItemId?.[item.itemId] && (
                    <span className="text-xs text-green-600">✓</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {groups.length === 0 && orders.length > 0 && (
          <div className="text-sm text-slate-500 py-1">
            {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(parseFloat(orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2)))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
      {/* P0 Header: [🔔] Стол · Гость · [˅] — #140: chevron moved into table card, not sticky */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4 mt-2">
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
              {isEditingName ? (
                <span className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder={tr('guest.name_placeholder', 'Имя')}
                    className="w-20 px-1 py-0.5 text-xs border rounded"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && guestNameInput.trim()) handleUpdateGuestName();
                      if (e.key === 'Escape') { setIsEditingName(false); setGuestNameInput(''); }
                    }}
                  />
                  <button onClick={handleUpdateGuestName} disabled={!guestNameInput.trim()} className="text-green-600 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={tr('common.save', 'Сохранить')}>✓</button>
                  <button onClick={() => { setIsEditingName(false); setGuestNameInput(''); }} className="text-slate-400 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label={tr('common.cancel', 'Отмена')}>✕</button>
                </span>
              ) : (
                <button
                  onClick={() => { setGuestNameInput(currentGuest?.name || ''); setIsEditingName(true); }}
                  className="min-h-[44px] flex items-center hover:underline"
                  style={{color: primaryColor}}
                >
                  {guestDisplay} <span className="text-xs ml-0.5">›</span>
                </button>
              )}
            </div>
            {/* CV-30: Order count + sum in drawer header */}
            {ordersSum > 0 && (() => {
              const cnt = todayMyOrders.length;
              const plural = cnt === 1 ? tr('cart.order_one', 'заказ')
                : (cnt >= 2 && cnt <= 4) ? tr('cart.order_few', 'заказа')
                : tr('cart.order_many', 'заказов');
              return (
                <div className="text-xs text-slate-500 mt-0.5">
                  {cnt} {plural} · {formatPrice(ordersSum)}
                </div>
              );
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

      {/* Review reward hint */}
      {shouldShowReviewRewardHint && (
        <div className="mb-4 text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 flex items-center gap-2">
          <span>⭐</span>
          <span>{tr('loyalty.review_reward_hint', 'За отзыв')} +{reviewRewardPoints} {tr('loyalty.points_short', 'бонусов')}</span>
        </div>
      )}

      {/* Review reward nudge - показываем после первой оценки с формой email */}
      {shouldShowReviewRewardNudge && (
        <div className="mb-4 text-sm bg-green-50 border border-green-200 rounded-md p-3">
          {!showRewardEmailForm ? (
            <div className="flex items-center justify-between">
              <span className="text-slate-700">
                ✅ {tr('loyalty.thanks_for_rating', 'Спасибо за оценку!')}
              </span>
              <button
                type="button"
                className="hover:underline font-medium text-sm"
                style={{color: primaryColor}}
                onClick={() => setShowRewardEmailForm(true)}
              >
                {tr('loyalty.get_bonus', 'Получить бонусы')} →
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-700 text-xs">
                {tr('loyalty.enter_email_for_bonus', 'Введите email для начисления бонусов:')}
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
                    // BUG-PM-034: Validate email format before saving
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rewardEmail.trim())) {
                      if (toast) toast.error(tr('loyalty.invalid_email', 'Введите корректный email'));
                      return;
                    }
                    setRewardEmailSubmitting(true);
                    // Используем существующий setCustomerEmail для синхронизации
                    if (setCustomerEmail) setCustomerEmail(rewardEmail);
                    // Показываем toast
                    if (toast) toast.success(tr('loyalty.email_saved', 'Email сохранён! Бонусы будут начислены.'));
                    rewardTimerRef.current = setTimeout(() => {
                      setRewardEmailSubmitting(false);
                      setShowRewardEmailForm(false);
                    }, 1000);
                  }}
                >
                  {rewardEmailSubmitting ? '...' : tr('common.save', 'Сохранить')}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: TABLE ORDERS (other guests) - STABLE based on sessionOrders */}
      {showTableOrdersSection && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <button
              onClick={() => setOtherGuestsExpanded(!otherGuestsExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600">
                  {tr('cart.table_orders', 'Заказы стола')} ({otherGuestIdsFromOrders.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                  <span className="text-sm text-slate-400">{tr('common.loading', 'Загрузка')}</span>
                ) : (
                  <span className="font-bold text-slate-700">{formatPrice(tableOrdersTotal)}</span>
                )}
                {otherGuestsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {otherGuestsExpanded && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {otherGuestIdsFromOrders.map((gid) => {
                  const guestOrders = ordersByGuestId.get(gid) || [];
                  const guestTotal = guestOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

                  return (
                    <div key={gid} className="text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{getGuestLabelById(gid)}</span>
                        {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                          <span className="text-slate-400">{tr('common.loading', 'Загрузка')}</span>
                        ) : (
                          <span className="font-bold text-slate-600">{formatPrice(guestTotal)}</span>
                        )}
                      </div>

                      {guestOrders.length > 0 ? (
                        <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                          {guestOrders.map((order) => {
                            const items = itemsByOrder.get(order.id) || [];
                            const status = getSafeStatus(getOrderStatus(order));

                            if (items.length === 0) {
                              return (
                                <div key={order.id} className="flex justify-between items-center text-xs">
                                  <span className="text-slate-600">
                                    {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(order.total_amount)}
                                  </span>
                                  <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                                </div>
                              );
                            }

                            return items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">{item.dish_name} × {item.quantity}</span>
                                <span className="text-xs" style={{ color: status.color }}>{status.icon} {status.label}</span>
                              </div>
                            ));
                          })}
                        </div>
                      ) : (
                        <div className="pl-2 text-xs text-slate-400">
                          {tr('cart.no_orders_yet', 'Заказов пока нет')}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Review button for other guests' dishes */}
                {otherGuestsReviewableItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openReviewDialog(otherGuestsReviewableItems)}
                  >
                    ⭐ {tr('review.rate_others', 'Оценить блюда гостей')}
                    {loyaltyAccount && (partner?.loyalty_review_points ?? 0) > 0 && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points ?? 0)} ${tr('review.points', 'баллов')})`}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 6: TABLE TOTAL */}
      {(sessionGuests.length > 1 || showTableOrdersSection) && (
        <Card className="mb-4 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700">{tr('cart.table_total', 'Счёт стола')}:</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(tableTotal)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fix 9 — D3: All served + cart empty → «Ничего не ждёте» screen */}
      {(() => {
        const isV8 = statusBuckets.accepted.length === 0
          && statusBuckets.in_progress.length === 0
          && statusBuckets.ready.length === 0
          && statusBuckets.new_order.length === 0
          && statusBuckets.served.length > 0
          && cart.length === 0;

        if (isV8) {
          const servedSubtotal = parseFloat(statusBuckets.served.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2));
          return (
            <>
              <div className="text-center py-6 mb-4">
                <p className="text-base font-medium text-slate-700">✅ {tr('cart.nothing_waiting', 'Ничего не ждёте.')}</p>
                <p className="text-sm text-slate-500 mt-1">{tr('cart.can_order_or_rate', 'Можно заказать ещё или оценить.')}</p>
              </div>

              {/* Подано bucket — collapsed with accent chip */}
              <Card className="mb-4">
                <CardContent className="p-3">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left min-h-[44px]"
                    onClick={() => setExpandedStatuses(prev => ({ ...prev, served: !prev.served }))}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-800">
                        {bucketDisplayNames.served} ({statusBuckets.served.length})
                      </span>
                      {reviewsEnabled && (
                        allServedRated
                          ? <span className="ml-1 text-xs text-green-600">✅</span>
                          : <button
                              type="button"
                              className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full"
                              onClick={(e) => { e.stopPropagation(); setExpandedStatuses(prev => ({ ...prev, served: true })); }}
                            >{tr('review.rate', 'Оценить')}</button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600">{formatPrice(servedSubtotal)}</span>
                      <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
                        {expandedStatuses.served ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </div>
                    </div>
                  </button>
                  {expandedStatuses.served && renderBucketOrders(statusBuckets.served, true)}
                </CardContent>
              </Card>
            </>
          );
        }

        // Normal rendering: status buckets in order
        const bucketOrder = ['served', 'ready', 'in_progress', 'accepted', 'new_order'];
        return bucketOrder.map(key => {
          const orders = statusBuckets[key];
          if (orders.length === 0) return null;
          const isExpanded = !!expandedStatuses[key];
          const subtotal = parseFloat(orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0).toFixed(2));
          const isServed = key === 'served';
          const showRating = isServed;

          return (
            <Card key={key} className="mb-4">
              <CardContent className="p-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left min-h-[44px]"
                  onClick={() => setExpandedStatuses(prev => ({ ...prev, [key]: !prev[key] }))}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-800">
                      {bucketDisplayNames[key]} ({orders.length})
                    </span>
                    {/* CV-05: Accent chip on Подано only */}
                    {isServed && reviewsEnabled && (
                      allServedRated
                        ? <span className="ml-1 text-xs text-green-600">✅</span>
                        : <button
                            type="button"
                            className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full"
                            onClick={(e) => { e.stopPropagation(); setExpandedStatuses(prev => ({ ...prev, served: true })); }}
                          >{tr('review.rate', 'Оценить')}</button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600">{formatPrice(subtotal)}</span>
                    <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>
                </button>
                {isExpanded && renderBucketOrders(orders, showRating)}
              </CardContent>
            </Card>
          );
        });
      })()}

      {/* SECTION 2: NEW ORDER */}
      {cart.length > 0 && (
        <Card className="mb-2">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                {tr('cart.new_order', 'Новый заказ')}
              </h2>
              <span className="text-sm font-medium text-slate-600">{formatPrice(parseFloat((Number(cartTotalAmount) || 0).toFixed(2)))}</span>
            </div>

            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.dishId} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    {item.quantity > 1 && <div className="text-xs text-slate-500">{formatPrice(item.price)} × {item.quantity}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatPrice(parseFloat((item.price * item.quantity).toFixed(2)))}</span>
                    {/* FIX P2: Stepper (-/count/+) instead of just remove-all */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.dishId, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                        aria-label={tr('menu.remove', 'Убрать')}
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="mx-1.5 text-sm font-semibold text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.dishId, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                        aria-label={tr('menu.add', 'Добавить')}
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CV-33: Split-order section removed — each guest orders for themselves */}

            {/* PM-086: Pre-checkout loyalty email removed — motivation text near submit button is sufficient */}

          </CardContent>
        </Card>
      )}

      {/* Spacer so sticky footer doesn't overlap last content */}
      {(cart.length > 0 || todayMyOrders.length > 0) && <div className="h-20" />}

      {/* AC-08: Error state with retry */}
      {submitError && cart.length > 0 && (
        <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">{submitError}</p>
          <p className="text-xs text-red-500 mt-1">
            {tr('error.send.subtitle', 'Не удалось отправить. Попробуйте снова')}
          </p>
        </div>
      )}

      {/* CV-02: Sticky footer — always visible when cart or orders exist */}
      {(cart.length > 0 || todayMyOrders.length > 0) && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
          {cart.length > 0 ? (
            <>
              {/* Motivation text — only if loyalty enabled (#87 KS-1 Fix 1) */}
              {partner?.loyalty_enabled && (() => {
                const motivationPoints = Math.round((Number(cartTotalAmount) || 0) * (Number(partner?.loyalty_points_per_currency) || 1));
                return motivationPoints > 0 ? (
                  <p className="text-sm text-gray-500 text-center mt-1 mb-1">
                    {trFormat('cart.motivation_bonus', { points: motivationPoints }, `Отправьте заказ официанту и получите +${motivationPoints} бонусов`)}
                  </p>
                ) : null;
              })()}
              <Button
                size="lg"
                className={`w-full text-white ${
                  isSubmitting || emailError
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                    : submitError
                      ? 'bg-red-600 hover:bg-red-700'
                      : ''
                }`}
                style={!isSubmitting && !submitError && !emailError ? {backgroundColor: primaryColor} : undefined}
                onClick={() => {
                  if (submitError && setSubmitError) setSubmitError(null);
                  handleSubmitOrder();
                }}
                disabled={isSubmitting || !!emailError}
              >
                {isSubmitting
                  ? tr('cta.sending', 'Отправляем...')
                  : submitError
                    ? tr('cta.retry', 'Повторить отправку')
                    : tr('cart.send_to_waiter', 'Отправить заказ официанту')}
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full min-h-[44px]"
              style={{borderColor: primaryColor, color: primaryColor}}
              onClick={() => { onClose ? onClose() : setView("menu"); }}
            >
              {tr('cart.order_more', 'Заказать ещё')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}                                                                           