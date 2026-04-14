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
  // CV-01/CV-48/CV-52: 2-group expand states (Выдано / В работе)
  const [expandedStatuses, setExpandedStatuses] = React.useState({
    served: false, // Выдано — collapsed by default (CV-10)
    in_progress: true, // В работе — expanded by default
  });
  // CV-28: expandedOrders removed — flat dish list replaces per-order collapse

  // CV-46: Track manual overrides so polling doesn't reset user's toggle
  const manualOverrideRef = React.useRef({});
  // CV-46: Track previous group keys for structural change detection
  const prevGroupKeysRef = React.useRef('');
  const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  const [rewardEmail, setRewardEmail] = React.useState('');
  const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  // CV-05 v2: Rating mode state (view mode vs rating mode)
  const [isRatingMode, setIsRatingMode] = React.useState(false);
  // CV-38: Post-rating email bottom sheet
  const [showPostRatingEmailSheet, setShowPostRatingEmailSheet] = React.useState(false);

  // ===== P0: Table-code verification UX (mask + auto-verify + cooldown) =====
  const [infoModal, setInfoModal] = React.useState(null); // 'online' | 'tableCode' | null
  // CV-48/Fix 3: Submit feedback phase (idle → submitting → success → idle, or error)
  const [submitPhase, setSubmitPhase] = React.useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
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
  }, [isSubmitting, submitError]);

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
    if (cart.length === 0 && submitPhase === 'success') {
      // Will auto-transition via the success timer above
    }
  }, [cart.length, submitPhase]);

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

  // Safe status label - guest-facing (CV-52: only 2 statuses)
  const getSafeStatus = (status) => {
    if (!status) {
      return { icon: '🔵', label: tr('cart.group.in_progress', 'В работе'), color: '#6B7280' };
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
      const oldInProgressLabels = ['\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e', '\u041f\u0440\u0438\u043d\u044f\u0442', '\u0413\u043e\u0442\u043e\u0432\u0438\u0442\u0441\u044f', '\u0413\u043e\u0442\u043e\u0432']; // old non-served labels
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

  // ===== CV-01/CV-48/CV-52: 2-group model (В работе / Выдано) =====
  const statusBuckets = React.useMemo(() => {
    const groups = { served: [], in_progress: [] };
    todayMyOrders.forEach(o => {
      const s = (o.status || 'new').toLowerCase();
      if (s === 'served' || s === 'completed') groups.served.push(o);
      else if (s !== 'cancelled') groups.in_progress.push(o);
    });
    return groups;
  }, [todayMyOrders]);

  // CV-46/Fix 4: Auto-collapse Выдано based on structural changes
  const currentGroupKeys = [
    statusBuckets.served.length > 0 ? 'S' : '',
    statusBuckets.in_progress.length > 0 ? 'I' : '',
    cart.length > 0 ? 'C' : ''
  ].join('');

  React.useEffect(() => {
    const structuralChange = currentGroupKeys !== prevGroupKeysRef.current;
    prevGroupKeysRef.current = currentGroupKeys;

    if (structuralChange && !manualOverrideRef.current.served) {
      const otherGroupsExist = statusBuckets.in_progress.length > 0 || cart.length > 0;
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

  // ===== CV-01/CV-52: 2-group display names =====
  const bucketDisplayNames = {
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
      <div className="space-y-1 mt-1">
        {groups.map(g => (
          <div key={g.name}>
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-slate-700">
                {g.name}{g.totalQty > 1 ? ` ×${g.totalQty}` : ''}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{formatPrice(parseFloat(g.totalPrice.toFixed(2)))}</span>
                {/* CV-05 v2 view mode: rating text indicators (no star widgets) */}
                {showRating && reviewsEnabled && !isRatingMode && (() => {
                  const anyRated = g.items.some(i => safeReviewedItems.has(i.itemId) || (safeDraftRatings[i.itemId] || 0) > 0);
                  if (anyRated) {
                    const bestRating = Math.max(...g.items.map(i => safeDraftRatings[i.itemId] || 0));
                    return <span className="text-xs text-amber-500">⭐{bestRating}</span>;
                  }
                  return <span className="text-xs text-slate-400">{tr('review.rate_action', 'Оценить')}</span>;
                })()}
              </div>
            </div>
            {/* CV-04/CV-05 v2: Per-item ratings — view mode vs rating mode */}
            {showRating && reviewsEnabled && g.items.map((item, itemIdx) => {
              const hasReview = safeReviewedItems.has(item.itemId);
              const draftRating = safeDraftRatings[item.itemId] || 0;
              const isRated = hasReview || draftRating > 0;
              const isFirstUnrated = !isRated && itemIdx === g.items.findIndex(i => {
                const dr = safeDraftRatings[i.itemId] || 0;
                return !safeReviewedItems.has(i.itemId) && !(dr > 0);
              });

              if (!isRatingMode) {
                // View mode: show text indicators inline, no star widgets
                return null; // Rating text is shown inline in the dish row above
              }

              // Rating mode: show star widgets
              return (
                <div
                  key={item.itemId}
                  className="flex items-center gap-2 pl-2 min-h-[44px]"
                  {...(isFirstUnrated ? {'data-first-unrated': true} : {})}
                >
                  <Rating
                    value={draftRating}
                    onChange={(val) => {
                      if (ratingSavingByItemId?.[item.itemId] === true) return;
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
                    readonly={ratingSavingByItemId?.[item.itemId] === true}
                  />
                  {ratingSavingByItemId?.[item.itemId] === true && (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {tr('review.saving', 'Сохраняем...')}
                    </span>
                  )}
                  {isRated && ratingSavingByItemId?.[item.itemId] !== true && (
                    <span className="text-xs text-green-600">✓ {tr('review.saved', 'Сохранено')}</span>
                  )}
                  {ratingSavingByItemId?.[item.itemId] === 'error' && (
                    <span className="text-xs text-red-500">{tr('review.save_error', 'Ошибка. Повторить')}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* CV-50: Inline subtotal removed — money only in drawer header */}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
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
                  className="min-h-[32px] flex items-center hover:underline"
                  style={{color: primaryColor}}
                >
                  {guestDisplay} <span className="text-xs ml-0.5">›</span>
                </button>
              )}
            </div>
            {/* CV-50: Dish count + total sum in drawer header (orders + cart) */}
            {(ordersSum > 0 || cart.length > 0) && (() => {
              const ordersItemCount = todayMyOrders.reduce((sum, o) => {
                const items = itemsByOrder.get(o.id) || [];
                return sum + items.reduce((s, it) => s + (it.quantity || 1), 0);
              }, 0);
              const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
              const totalDishCount = ordersItemCount + cartItemCount;
              const headerTotal = ordersSum + (Number(cartTotalAmount) || 0);
              return totalDishCount > 0 ? (
                <div className="text-xs text-slate-500 mt-0.5">
                  {totalDishCount} {tr('cart.header.dishes', 'блюда')} · {formatPrice(parseFloat(headerTotal.toFixed(2)))}
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
              <span className="text-xl font-bold text-slate-900">{formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV-01: Empty state — no orders and no cart */}
      {statusBuckets.served.length === 0 && statusBuckets.in_progress.length === 0 && cart.length === 0 && todayMyOrders.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">{tr('cart.empty', 'Корзина пуста')}</p>
        </div>
      )}

      {/* Fix 9 — D3: All served + cart empty → «Ничего не ждёте» screen */}
      {(() => {
        const isV8 = statusBuckets.in_progress.length === 0
          && statusBuckets.served.length > 0
          && cart.length === 0;

        if (isV8) {
          return (
            <>
              <div className="text-center py-6 mb-4">
                <p className="text-base font-medium text-slate-700">✅ {tr('cart.nothing_waiting', 'Ничего не ждёте.')}</p>
                <p className="text-sm text-slate-500 mt-1">{tr('cart.can_order_or_rate', 'Можно заказать ещё или оценить.')}</p>
              </div>

              {/* Подано bucket — collapsed with accent chip */}
              <Card className="mb-4">
                <CardContent className="px-3 py-1.5">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between text-left min-h-[44px]"
                    onClick={() => { manualOverrideRef.current.served = true; setExpandedStatuses(prev => ({ ...prev, served: !prev.served })); }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-slate-800">
                        {bucketDisplayNames.served} ({statusBuckets.served.length})
                      </span>
                      {reviewsEnabled && (
                        allServedRated
                          ? <span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>
                          : isRatingMode
                            ? <span
                                role="button"
                                tabIndex={0}
                                className="ml-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsRatingMode(false);
                                  if (shouldShowReviewRewardNudge) setShowPostRatingEmailSheet(true);
                                }}
                              >{tr('review.done', 'Готово')}</span>
                            : <span
                                role="button"
                                tabIndex={0}
                                className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedStatuses(prev => ({ ...prev, served: true }));
                                  setIsRatingMode(true);
                                  setTimeout(() => { document.querySelector('[data-first-unrated]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
                                }}
                              >{tr('review.rate', 'Оценить')} ({unratedServedCount})</span>
                      )}
                    </div>
                    <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
                      {expandedStatuses.served ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </button>
                  {/* CV-05 v2: Rating mode micro-label */}
                  {isRatingMode && !allServedRated && (
                    <p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>
                  )}
                  {/* CV-37: Bonus subline below header (visible collapsed or expanded) */}
                  {shouldShowReviewRewardHint && (
                    <p className="text-xs text-slate-500 mt-0.5 pb-1">
                      {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
                    </p>
                  )}
                  {expandedStatuses.served && (
                    <>
                      {renderBucketOrders(statusBuckets.served, true)}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          );
        }

        // Normal rendering: 2-group model (CV-52)
        const bucketOrder = ['served', 'in_progress'];
        return bucketOrder.map(key => {
          const orders = statusBuckets[key];
          if (orders.length === 0) return null;
          const isExpanded = !!expandedStatuses[key];
          const isServed = key === 'served';
          const showRating = isServed;

          return (
            <Card key={key} className="mb-4">
              <CardContent className="px-3 py-1.5">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left min-h-[44px]"
                  onClick={() => { if (key === 'served') manualOverrideRef.current.served = true; setExpandedStatuses(prev => ({ ...prev, [key]: !prev[key] })); }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-800">
                      {bucketDisplayNames[key]} ({orders.length})
                    </span>
                    {/* CV-05 v2: Accent chip on Подано only */}
                    {isServed && reviewsEnabled && (
                      allServedRated
                        ? <span className="ml-1 text-xs text-green-600 font-medium">✓ {tr('review.all_rated_chip', 'Оценено')}</span>
                        : isRatingMode
                          ? <span
                              role="button"
                              tabIndex={0}
                              className="ml-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsRatingMode(false);
                                if (shouldShowReviewRewardNudge) setShowPostRatingEmailSheet(true);
                              }}
                            >{tr('review.done', 'Готово')}</span>
                          : <span
                              role="button"
                              tabIndex={0}
                              className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedStatuses(prev => ({ ...prev, served: true }));
                                setIsRatingMode(true);
                                setTimeout(() => { document.querySelector('[data-first-unrated]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 100);
                              }}
                            >{tr('review.rate', 'Оценить')} ({unratedServedCount})</span>
                    )}
                  </div>
                  <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>
                {/* CV-05 v2: Rating mode micro-label */}
                {isServed && isRatingMode && !allServedRated && (
                  <p className="text-xs text-slate-500 mt-0.5">{tr('review.rating_mode', 'Режим оценки')}</p>
                )}
                {/* CV-37: Bonus subline below header (visible collapsed or expanded) */}
                {isServed && shouldShowReviewRewardHint && (
                  <p className="text-xs text-slate-500 mt-0.5 pb-1">
                    {tr('loyalty.review_bonus_hint', 'За отзыв можно получить')} +{reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}
                  </p>
                )}
                {isExpanded && renderBucketOrders(orders, showRating)}
              </CardContent>
            </Card>
          );
        });
      })()}

      {/* SECTION 2: NEW ORDER */}
      {cart.length > 0 && (
        <Card className="mb-4">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                {tr('cart.group.in_cart', 'В корзине')} ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
              </h2>
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

            {/* CV-33/Fix 5: Bonus line in cart group */}
            {partner?.loyalty_enabled && earnedPoints > 0 && (
              <div className="text-xs text-green-600 mt-1">+{earnedPoints} {tr('loyalty.points_short', 'баллов')}</div>
            )}

            {/* PM-086: Pre-checkout loyalty email removed — motivation text near submit button is sufficient */}

          </CardContent>
        </Card>
      )}

      {/* Spacer so sticky footer doesn't overlap last content */}
      {(cart.length > 0 || todayMyOrders.length > 0) && <div className="h-14" />}

      {/* AC-08: Error state with retry */}
      {submitError && cart.length > 0 && (
        <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">{submitError}</p>
          <p className="text-xs text-red-500 mt-1">
            {tr('error.send.subtitle', 'Не удалось отправить. Попробуйте снова')}
          </p>
        </div>
      )}

      {/* CV-38: Post-rating email bottom sheet */}
      {showPostRatingEmailSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={() => setShowPostRatingEmailSheet(false)}>
          <div className="bg-white rounded-t-xl w-full max-w-lg p-4 pb-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-slate-800 mb-2">{tr('review.get_bonus_title', 'Получить баллы за отзыв')}</h3>
            <p className="text-sm text-slate-600 mb-1">{tr('review.rated_count', 'Вы оценили')} {ratedServedCount} {tr('review.dishes_word', 'блюд')}.</p>
            <p className="text-sm text-slate-600 mb-3">{tr('review.enter_email_for_points', 'Введите email, чтобы получить')} {ratedServedCount * reviewRewardPoints} {tr('loyalty.points_short', 'баллов')}.</p>
            <Input
              type="email"
              value={rewardEmail}
              onChange={e => setRewardEmail(e.target.value)}
              placeholder="email@example.com"
              className="mb-3 h-10"
            />
            <Button
              className="w-full h-11 mb-2 text-white"
              style={{backgroundColor: primaryColor}}
              disabled={!rewardEmail.trim() || rewardEmailSubmitting}
              onClick={() => {
                if (!rewardEmail.trim()) return;
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rewardEmail.trim())) {
                  if (toast) toast.error(tr('loyalty.invalid_email', 'Введите корректный email'));
                  return;
                }
                setRewardEmailSubmitting(true);
                if (setCustomerEmail) setCustomerEmail(rewardEmail);
                if (toast) toast.success(tr('loyalty.email_saved', 'Email сохранён! Бонусы будут начислены.'));
                rewardTimerRef.current = setTimeout(() => {
                  setRewardEmailSubmitting(false);
                  setShowPostRatingEmailSheet(false);
                }, 1000);
              }}
            >
              {rewardEmailSubmitting ? '...' : tr('review.get_bonus_btn', 'Получить баллы')}
            </Button>
            <button type="button" className="w-full text-center text-sm text-slate-500 py-2" onClick={() => setShowPostRatingEmailSheet(false)}>
              {tr('review.skip', 'Пропустить')}
            </button>
            <p className="text-xs text-slate-400 text-center mt-1">{tr('review.ratings_saved_note', 'Оценки уже сохранены')}</p>
          </div>
        </div>
      )}

      {/* CV-51: Sticky footer — CTA only (no summary/totals) */}
      {(cart.length > 0 || todayMyOrders.length > 0) && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
          {cart.length > 0 ? (
            <Button
              size="lg"
              className={`w-full min-h-[44px] text-white ${
                submitPhase === 'submitting' || submitPhase === 'success'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                  : submitPhase === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : ''
              }`}
              style={submitPhase === 'idle' ? {backgroundColor: primaryColor} : submitPhase === 'success' ? {backgroundColor: '#16a34a'} : undefined}
              onClick={() => {
                if (submitPhase !== 'idle') return;
                if (submitError && setSubmitError) setSubmitError(null);
                handleSubmitOrder();
              }}
              disabled={submitPhase !== 'idle' || cart.length === 0}
            >
              {submitPhase === 'submitting'
                ? tr('cart.submit.sending', 'Отправляем...')
                : submitPhase === 'success'
                  ? tr('cart.submit.success', 'Заказ отправлен')
                  : submitPhase === 'error'
                    ? tr('cart.submit.retry', 'Повторить отправку')
                    : tr('cart.send_to_waiter', 'Отправить официанту')}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full min-h-[44px]"
              style={{borderColor: primaryColor, color: primaryColor}}
              onClick={() => { onClose ? onClose() : setView("menu"); }}
            >
              {tr('cart.cta.order_more', 'Заказать ещё')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}                                                                           