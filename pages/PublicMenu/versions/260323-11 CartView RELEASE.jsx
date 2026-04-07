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
  const [splitExpanded, setSplitExpanded] = React.useState(false);
  // loyaltyExpanded removed — loyalty section simplified to motivation text (#87 KS-1)
  const [myOrdersExpanded, setMyOrdersExpanded] = React.useState(true); // default open
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

  // Safe status label - prevents showing raw translation keys like "orderprocess.default.new"
  const getSafeStatus = (status) => {
    if (!status) {
      return { icon: '🔵', label: tr('status.new', 'Заказано'), color: '#3B82F6' };
    }

    let label = status.label || '';

    // Check if label is a raw translation key (contains dots and looks like a key)
    if (label.includes('.') && (label.startsWith('orderprocess') || label.startsWith('status'))) {
      // Extract code from key like "orderprocess.default.new" → "new"
      const parts = label.split('.');
      const code = parts[parts.length - 1];

      // Use human-readable fallbacks based on code
      const fallbacks = {
        'new': tr('status.new', 'Заказано'),
        'start': tr('status.cooking', 'Готовится'),
        'cook': tr('status.cooking', 'Готовится'),
        'cooking': tr('status.cooking', 'Готовится'),
        'finish': tr('status.ready', 'Готово'),
        'ready': tr('status.ready', 'Готово'),
        'done': tr('status.ready', 'Готово'),
        'accepted': tr('status.accepted', 'Принят'),
        'cancel': tr('status.cancelled', 'Отменён'),
        'cancelled': tr('status.cancelled', 'Отменён'),
      };

      label = fallbacks[code] || tr('status.new', 'Заказано');
    }

    return {
      icon: status.icon || '🔵',
      label: label,
      color: status.color || '#3B82F6'
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
  const guestBaseName = currentGuest
    ? (currentGuest.name || getGuestDisplayName(currentGuest))
    : tr("cart.guest", "Гость");

  const guestDisplay = effectiveGuestCode 
    ? `${guestBaseName} #${effectiveGuestCode}` 
    : guestBaseName;

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

  // Split summary text
  const splitSummary = splitType === "all" 
    ? `${tr('cart.for_all', 'На всех')} (÷${guestCount})`
    : tr('cart.only_me', 'Только я');

  // loyaltySummary + reviewRewardLabel removed — loyalty section simplified (#87 KS-1)

  return (
    <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
      {/* Drag handle + chevron close — sticky top (#87 KS-2, PM-083/084/085) */}
      <div className="sticky top-0 z-10 bg-white pt-2 pb-1 flex items-center justify-center gap-3">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
        <button
          className="min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => { if (isSubmitting) return; onClose ? onClose() : setView("menu"); }}
          aria-label="Close cart"
        >
          <ChevronDown
            className={`w-9 h-9 ${isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 cursor-pointer'}`}
          />
        </button>
      </div>
      {/* P0 Header: [🔔] Стол · Гость */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
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

          {/* Center: Table & Guest */}
          <div className="text-center flex-1 mx-2">
            <div className="text-sm font-medium text-slate-700">{tableLabel}</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              <span className="text-slate-500">{tr('cart.you', 'Вы')}:</span>
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
                  className="hover:underline"
                  style={{color: primaryColor}}
                >
                  {guestDisplay} {(!currentGuest?.name) && <span className="text-xs">✏️</span>}
                </button>
              )}
            </div>
          </div>

          {/* Right: Close button removed — replaced by chevron-down above (#87 KS-2) */}
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

      {/* SECTION 3: YOUR ORDERS (submitted) - COLLAPSIBLE */}
      {myOrders.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <button
              type="button"
              className="w-full flex items-center justify-between text-left"
              onClick={() => setMyOrdersExpanded(!myOrdersExpanded)}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-600" />
                <span className="text-base font-semibold text-slate-800">
                  {tr('cart.your_orders', 'Ваши заказы')} ({myOrders.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{formatPrice(myBill.total)}</span>
                {myOrdersExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {myOrdersExpanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {myOrders.map((order) => {
                  const orderItems = itemsByOrder.get(order.id) || [];
                  const rawStatus = getOrderStatus(order);
                  const status = getSafeStatus(rawStatus);

                  return (
                    <div key={order.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">
                          {formatOrderTime(order)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      {/* Order items with draft rating stars */}
                      {orderItems.length > 0 ? (
                        <div className="space-y-2">
                          {orderItems.map((item, idx) => {
                            const itemId = item.id || `${order.id}_${idx}`;
                            const hasReview = safeReviewedItems.has(itemId);
                            const draftRating = safeDraftRatings[itemId] || 0;

                            return (
                              <div key={itemId} className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-slate-700">{item.dish_name} × {item.quantity}</span>
                                  <span className="text-slate-600">{formatPrice(item.line_total ?? (item.dish_price * item.quantity))}</span>
                                </div>

                                {/* Draft rating stars - show always if reviews enabled */}
                                {reviewsEnabled && (
                                  <div className="flex items-center gap-2 pl-2">
                                    <Rating
                                      value={draftRating}
                                      onChange={(val) => {
                                        if (draftRating > 0 || hasReview) return; // уже оценено
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
                                      <span className="text-xs text-green-600">✓</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          {tr('cart.order_total', 'Сумма заказа')}: {formatPrice(order.total_amount)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Review button */}
                {reviewableItems.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => openReviewDialog(reviewableItems)}
                  >
                    💬 {tr('review.add_comments', 'Добавить комментарии')}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2: NEW ORDER */}
      {cart.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
              🛒 {tr('cart.new_order', 'Новый заказ')}
            </h2>

            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.dishId} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{formatPrice(item.price)} × {item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
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

            {/* P1: Split toggle - STABLE (always visible, disabled if < 2 guests) */}
            {isTableVerified === true && (
            <div className="mt-4 pt-4 border-t">
              <button
                type="button"
                className={`w-full flex items-center justify-between text-left ${
                  canSplit ? "cursor-pointer" : "cursor-not-allowed"
                }`}
                onClick={() => canSplit && setSplitExpanded(!splitExpanded)}
                disabled={!canSplit}
              >
                <span className="text-sm font-medium text-slate-700">
                  {tr('cart.split_title', 'Для кого заказ')}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${canSplit ? 'text-slate-600' : 'text-slate-400'}`}>
                    {splitSummary}
                  </span>
                  {canSplit ? (
                    splitExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )
                  ) : (
                    <span className="text-xs text-slate-400">
                      {tr('cart.split_disabled_hint', '(2+ гостей)')}
                    </span>
                  )}
                </div>
              </button>

              {splitExpanded && canSplit && (
                <div className="mt-3 flex items-center justify-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="splitType"
                      checked={splitType === 'single'}
                      onChange={() => setSplitType('single')}
                      className="w-4 h-4" style={{accentColor: primaryColor}}
                    />
                    <span className="text-sm text-slate-700">{tr('cart.only_me', 'Только я')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="splitType"
                      checked={splitType === 'all'}
                      onChange={() => setSplitType('all')}
                      className="w-4 h-4" style={{accentColor: primaryColor}}
                    />
                    <span className="text-sm text-slate-700">{tr('cart.for_all', 'На всех')} (÷{guestCount})</span>
                  </label>
                  {/* P2 placeholder - disabled until data model supports custom split */}
                  <label className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                    <input
                      type="radio"
                      disabled
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-slate-400">
                      {tr('cart.split_pick_guests_soon', 'Выбрать гостей (скоро)')}
                    </span>
                  </label>
                </div>
              )}
            </div>
            )}

            {/* PM-086: Pre-checkout loyalty email removed — motivation text near submit button is sufficient */}

            {/* Subtotal and submit */}
            <div className="mt-3 pt-3 space-y-3">
              {/* ИТОГО - bold total */}
              <div className="flex justify-between items-end pt-2 border-t">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {tr('cart.total', 'ИТОГО')}:
                </span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(Number(cartTotalAmount) || 0)}</span>
              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Add more link - removed, use chevron ˅ to close (#87 KS-2) */}

      {/* Spacer so sticky button doesn't overlap last content */}
      {cart.length > 0 && <div className="h-16" />}

      {/* AC-08: Error state with retry */}
      {submitError && cart.length > 0 && (
        <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">{submitError}</p>
          <p className="text-xs text-red-500 mt-1">
            {tr('error.send.subtitle', 'Не удалось отправить. Попробуйте снова')}
          </p>
        </div>
      )}

      {/* Submit button - sticky at bottom of drawer scroll area */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
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
        </div>
      )}
    </div>
  );
}