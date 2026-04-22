# Review Bundle

## Target Code: CartView.jsx
```
import React from "react";
import { XIcon, Loader2, ChevronDown, ChevronUp, Users, Gift, ShoppingBag, Bell, X } from "lucide-react";
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
}) {
  // ===== P0: Safe prop defaults (BUG-PM-023, BUG-PM-025) =====
  const safeReviewedItems = reviewedItems || new Set();
  const safeDraftRatings = draftRatings || {};

  // ===== P1 Expandable States =====
  const [splitExpanded, setSplitExpanded] = React.useState(false);
  const [loyaltyExpanded, setLoyaltyExpanded] = React.useState(false);
  const [myOrdersExpanded, setMyOrdersExpanded] = React.useState(true); // default open
  const [showRewardEmailForm, setShowRewardEmailForm] = React.useState(false);
  const [rewardEmail, setRewardEmail] = React.useState('');
  const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);

  // ===== P0: Table-code verification UX (mask + auto-verify + cooldown) =====
  const [infoModal, setInfoModal] = React.useState(null); // 'online' | 'tableCode' | null
  const [codeAttempts, setCodeAttempts] = React.useState(0);
  const [codeLockedUntil, setCodeLockedUntil] = React.useState(null); // timestamp ms
  const [nowTs, setNowTs] = React.useState(() => Date.now());

  const codeInputRef = React.useRef(null);
  const lastVerifyCodeRef = React.useRef(null);
  const countedErrorForCodeRef = React.useRef(null);
  const lastSentVerifyCodeRef = React.useRef(null);

  // Partner-configurable settings (fallbacks until Base44 adds real fields)
  const tableCodeLength = React.useMemo(() => {
    const n = Number(partner?.table_code_length);
    if (Number.isFinite(n) && n > 0) return Math.max(3, Math.min(8, Math.round(n)));
    return 5;
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

  // Count failed attempts (UI-level), and apply cooldown after max attempts.
  React.useEffect(() => {
    if (!codeVerificationError) return;
    if (isVerifyingCode) return;
    const lastCode = lastVerifyCodeRef.current;
    if (!lastCode) return;

    // Count once per verified code
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

  // Effective guest code: prop takes priority, fallback to localStorage
  const effectiveGuestCode = guestCode || guestCodeFromStorage;

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

  // Показывать hint "За отзыв +N бонусов" сразу
  const shouldShowReviewRewardHint = isReviewRewardActive && (myOrders?.length > 0);

  // Показывать nudge "Введите email" после первой оценки
  const shouldShowReviewRewardNudge = isReviewRewardActive && hasAnyRating && !isCustomerIdentified;

  // Split summary text
  const splitSummary = splitType === "all" 
    ? `${tr('cart.for_all', 'На всех')} (÷${guestCount})`
    : tr('cart.only_me', 'Только я');

  // Loyalty summary
  const loyaltySummary = React.useMemo(() => {
    if (Number(loyaltyAccount?.balance || 0) > 0) {
      return `${Number(loyaltyAccount.balance || 0).toLocaleString('ru-RU')} ${tr('loyalty.points_short', 'баллов')}`;
    }
    if (earnedPoints > 0) {
      return `+${earnedPoints}`;
    }
    return null;
  }, [loyaltyAccount, earnedPoints]);

  // Reward for review (shown in Loyalty header if partner configured)
  const reviewRewardLabel = React.useMemo(() => {
    const pts = Number(partner?.loyalty_review_points);
    if (Number.isFinite(pts) && pts > 0) return `+${pts}`;
    return null;
  }, [partner?.loyalty_review_points]);

  return (
    <div className="max-w-2xl mx-auto px-4 mt-2 pb-4">
      {/* P0 Header: [🔔] Стол · Гость [✕] */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
        <div className="flex items-center justify-between">
          {/* Left: Call waiter */}
          {onCallWaiter && (
            <button
              onClick={onCallWaiter}
              className="p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100"
              title={tr('help.call_waiter', 'Позвать официанта')}
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
                  <button onClick={handleUpdateGuestName} disabled={!guestNameInput.trim()} className="text-green-600">✓</button>
                  <button onClick={() => { setIsEditingName(false); setGuestNameInput(''); }} className="text-slate-400">✕</button>
                </span>
              ) : (
                <button 
                  onClick={() => { setGuestNameInput(currentGuest?.name || ''); setIsEditingName(true); }}
                  className="text-indigo-600 hover:underline"
                >
                  {guestDisplay} {(!currentGuest?.name) && <span className="text-xs">✏️</span>}
                </button>
              )}
            </div>
          </div>

          {/* Right: Close */}
          <button
            onClick={() => onClose ? onClose() : setView("menu")}
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
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
                className="text-indigo-600 hover:underline font-medium text-sm"
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
                    setRewardEmailSubmitting(true);
                    // Используем существующий setCustomerEmail для синхронизации
                    if (setCustomerEmail) setCustomerEmail(rewardEmail);
                    // Показываем toast
                    if (toast) toast.success(tr('loyalty.email_saved', 'Email сохранён! Бонусы будут начислены.'));
                    setTimeout(() => {
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
                                  <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
                                </div>
                              );
                            }

                            return items.map((item, idx) => (
                              <div key={`${order.id}-${idx}`} className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">{item.dish_name} × {item.quantity}</span>
                                <span className="text-xs" style={{ color: status.color }}>{status.label}</span>
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
                    {loyaltyAccount && ` (+${otherGuestsReviewableItems.length * (partner?.loyalty_review_points || 10)} ${tr('review.points', 'баллов')})`}
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
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">{formatPrice(item.price * item.quantity)}</span>
                    <button 
                      onClick={() => updateQuantity(item.dishId, -item.quantity)}
                      className="p-1.5 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
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
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="text-sm text-slate-700">{tr('cart.only_me', 'Только я')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="splitType"
                      checked={splitType === 'all'}
                      onChange={() => setSplitType('all')}
                      className="w-4 h-4 text-indigo-600"
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

            {/* P1: Loyalty section - COLLAPSIBLE */}
            {showLoginPromptAfterRating && (
              <div className="mt-4 pt-4 border-t">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left"
                  onClick={() => setLoyaltyExpanded(!loyaltyExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-slate-700">
                      {tr('loyalty.title', 'Бонусы')}
                      {reviewRewardLabel && (
                        <span className="ml-2 text-xs text-slate-500 font-normal">
                          • {tr('loyalty.review_reward_prefix', 'за отзыв')} {reviewRewardLabel}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {loyaltySummary && (
                      <span className="text-sm font-semibold text-green-600">
                        {loyaltySummary}
                      </span>
                    )}
                    {loyaltyExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {loyaltyExpanded && (
                  <div className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        {tr('loyalty.email_label', 'Email для бонусов')}
                      </label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder={tr('loyalty.email_placeholder', 'email@example.com')}
                      />
                    </div>

                    {!customerEmail.trim() ? (
                      <p className="text-xs text-slate-500">{tr('loyalty.enter_email_hint', 'Введите email для начисления бонусов')}</p>
                    ) : loyaltyLoading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {tr('common.loading', 'Загрузка')}
                      </div>
                    ) : !loyaltyAccount ? (
                      partner?.loyalty_enabled && (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                          {trFormat('loyalty.new_customer', { points: earnedPoints }, `Вы получите ${earnedPoints} бонусов за первый заказ`)}
                        </div>
                      )
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-indigo-50 p-2 rounded-lg text-xs">
                          <div className="text-slate-600">
                            {trFormat('loyalty.your_balance', { points: Number(loyaltyAccount.balance || 0).toLocaleString('ru-RU') }, `Ваш баланс: ${Number(loyaltyAccount.balance || 0).toLocaleString('ru-RU')} баллов`)}
                          </div>
                          <div className="text-slate-500">
                            = {(Number(loyaltyAccount.balance || 0) * (partner?.loyalty_redeem_rate || 1)).toLocaleString('ru-RU')}₸
                          </div>
                        </div>

                        {loyaltyAccount.balance > 0 && maxRedeemPoints > 0 && (
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              {tr('loyalty.redeem_points', 'Списать баллы')}
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
                                  toast.success(tr('loyalty.points_applied', 'Баллы применены'), { id: 'mm1' });
                                }}
                              >
                                {tr('loyalty.apply', 'Применить')}
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                              {trFormat('loyalty.max_redeem', { 
                                max: maxRedeemPoints.toLocaleString('ru-RU'), 
                                percent: partner?.loyalty_max_redeem_percent || 0 
                              }, `Максимум ${maxRedeemPoints} баллов (${partner?.loyalty_max_redeem_percent || 0}% от заказа)`) }
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {partner?.discount_enabled && (
                      partner.discount_allow_anonymous === true || customerEmail.trim() ? (
                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg border border-green-200">
                          {trFormat('loyalty.instant_discount', { percent: partner.discount_percent || 0 }, `Скидка ${partner.discount_percent || 0}% применена`)}
                        </div>
                      ) : (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          {trFormat('loyalty.enter_email_for_discount', { percent: partner.discount_percent || 0 }, `Введите email для скидки ${partner.discount_percent || 0}%`)}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Subtotal and submit */}
            <div className="mt-4 pt-4 border-t space-y-3">
              {partner?.loyalty_enabled && earnedPoints > 0 && !loyaltyExpanded && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{tr('loyalty.online_bonus_label', 'Бонусы за онлайн-заказ')}</span>
                  <span>+{Number(earnedPoints || 0).toLocaleString('ru-RU')}Б</span>
                </div>
              )}

              {/* ИТОГО - bold total */}
              <div className="flex justify-between items-end pt-2 border-t">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {tr('cart.total', 'ИТОГО')}:
                </span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(Number(cartTotalAmount) || 0)}</span>
              </div>

              {/* Online order to waiter (verification + benefits) */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-amber-900 font-semibold text-sm">
                    {tr('cart.verify.online_order_title', 'Онлайн-заказ официанту')}
                  </p>
                  <button
                    type="button"
                    className="text-amber-700 hover:text-amber-900 text-sm px-2"
                    onClick={() => setInfoModal('online')}
                    title={tr('common.info', 'Информация')}
                  >
                    ⓘ
                  </button>
                </div>

                {/* AC-03: Expected savings — separate from total, not subtracted */}
                {(discountAmount > 0 || (partner?.loyalty_enabled && earnedPoints > 0) || pointsDiscountAmount > 0) && (
                  <p className="text-xs text-amber-700 font-medium mb-1">
                    {tr('cart.expected_savings', 'Ожидаемая выгода')}:
                  </p>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-amber-900">
                    <span>{tr('cart.verify.discount_label', 'Скидка за онлайн-заказ')}</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}

                {partner?.loyalty_enabled && earnedPoints > 0 && (
                  <div className="flex justify-between text-sm text-amber-900">
                    <span>{tr('cart.verify.bonus_label', 'Бонусы за онлайн-заказ')}</span>
                    <span>+{Number(earnedPoints || 0).toLocaleString('ru-RU')}Б</span>
                  </div>
                )}

                {/* Redeem points (if user applied) */}
                {pointsDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-amber-900">
                    <span>{tr('cart.verify.points_discount_label', 'Списание баллов')}</span>
                    <span>−{formatPrice(pointsDiscountAmount)}</span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-amber-200">
                  {isTableVerified === true ? (
                    <div className="text-sm text-green-700 text-center">
                      ✅ {tr('cart.verify.table_verified', 'Стол подтверждён')}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-amber-900 font-medium text-sm">
                          {tr('cart.verify.enter_table_code', 'Введите код стола')}
                        </p>
                        <button
                          type="button"
                          className="text-amber-700 hover:text-amber-900 text-sm px-2"
                          onClick={() => setInfoModal('tableCode')}
                          title={tr('common.info', 'Информация')}
                        >
                          ⓘ
                        </button>
                      </div>

                      {/* Slots UI + invisible input (auto-verify when fully entered) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3">
                          <div className={`relative ${isCodeLocked ? 'opacity-60' : ''}`}>
                            <div
                              className="flex items-center gap-2"
                              onClick={() => !isCodeLocked && codeInputRef.current && codeInputRef.current.focus()}
                            >
                              <div className="flex gap-2">
                                {Array.from({ length: tableCodeLength }).map((_, idx) => {
                                  const safe = String(tableCodeInput || '').replace(/\D/g, '').slice(0, tableCodeLength);
                                  const ch = safe[idx] || '_';
                                  return (
                                    <div
                                      key={idx}
                                      className="w-9 h-11 rounded-lg border border-amber-200 bg-white flex items-center justify-center text-xl font-mono text-amber-900"
                                    >
                                      {ch}
                                    </div>
                                  );
                                })}
                              </div>
                              {isVerifyingCode && (
                                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                              )}
                            </div>

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
                              aria-label={tr('cart.verify.enter_table_code', 'Введите код стола')}
                              placeholder={tr('cart.verify.enter_code_placeholder', 'Введите код')}
                            />
                          </div>
                        </div>

                        {!String(tableCodeInput || '').trim() && (
                          <div className="text-center text-xs text-amber-700">
                            {tr('cart.verify.enter_code_placeholder', 'Введите код')}
                          </div>
                        )}

                        {isCodeLocked ? (
                          <div className="text-center text-xs text-amber-800">
                            ⏳ {tr('cart.verify.locked', 'Слишком много попыток. Повторите через')}{' '}
                            {String(Math.floor(codeSecondsLeft / 60)).padStart(2, '0')}:{String(codeSecondsLeft % 60).padStart(2, '0')}
                          </div>
                        ) : (
                          <>
                            {codeVerificationError && !isVerifyingCode && (
                              <div className="text-center text-xs text-red-700">
                                {codeVerificationError}
                                {maxCodeAttempts > 0 && (
                                  <div className="mt-1 text-red-600">
                                    {tr('cart.verify.attempts', 'Попытки')}: {Math.min(codeAttempts, maxCodeAttempts)} {tr('common.of', 'из')} {maxCodeAttempts}
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Option 2: Tell code to waiter (same effect) */}
                        {hallGuestCodeEnabled && effectiveGuestCode && (
                          <div className="mt-3 pt-3 border-t border-amber-200 text-center">
                            <div className="flex items-center justify-center gap-2 text-xs text-amber-600 mb-2">
                              <span className="flex-1 border-t border-amber-300"></span>
                              <span>{tr('common.or', 'или')}</span>
                              <span className="flex-1 border-t border-amber-300"></span>
                            </div>
                            <p className="text-xs text-amber-800 mb-1">
                              {tr('cart.tell_code_to_waiter', 'Назовите официанту этот код')}:
                            </p>
                            <p className="text-2xl font-bold text-amber-900 font-mono">
                              {String(effectiveGuestCode)}
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Info modal */}
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
                          ? tr('cart.verify.info_online_title', 'Онлайн-заказ официанту')
                          : tr('cart.verify.info_table_code_title', 'Код стола')}
                      </div>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        onClick={() => setInfoModal(null)}
                        aria-label={tr('common.close', 'Закрыть')}
                      >
                        ✕
                      </button>
                    </div>

                    {infoModal === 'online' ? (
                      <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
                        <li>{tr('cart.verify.info_online_point1', 'Заказ сразу попадает официанту')}</li>
                        <li>{tr('cart.verify.info_online_point2', 'Обычно быстрее')}</li>
                        <li>{tr('cart.verify.info_online_point3', 'Скидка и бонусы (если есть) применяются автоматически')}</li>
                      </ul>
                    ) : (
                      <ul className="text-sm text-slate-700 list-disc pl-5 space-y-2">
                        <li>{tr('cart.verify.info_table_code_point1', 'Код обычно указан на столе')}</li>
                        <li>{tr('cart.verify.info_table_code_point2', 'Если не видно — спросите у официанта')}</li>
                      </ul>
                    )}
                  </div>
                </div>
              )}


            </div>
          </CardContent>
        </Card>
      )}

      {/* Add more link - removed, use ✕ to close */}

      {/* Spacer so sticky button doesn't overlap last content */}
      {cart.length > 0 && <div className="h-20" />}

      {/* AC-08: Error state with retry */}
      {submitError && cart.length > 0 && (
        <div className="mx-0 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm font-medium text-red-700">{submitError}</p>
          <p className="text-xs text-red-500 mt-1">
            {tr('error.send.subtitle', 'Ваш заказ сохранён. Попробуйте снова')}
          </p>
        </div>
      )}

      {/* Submit button - sticky at bottom of drawer scroll area */}
      {cart.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
          <Button
            size="lg"
            className={`w-full ${
              isSubmitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100'
                : isTableVerified === false
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                  : submitError
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={() => {
              if (submitError && setSubmitError) setSubmitError(null);
              handleSubmitOrder();
            }}
            disabled={isSubmitting || isTableVerified === false}
          >
            {isSubmitting
              ? tr('cta.sending', 'Отправляем...')
              : submitError
                ? tr('cta.retry', 'Повторить отправку')
                : tr('cart.send_to_waiter', 'Отправить заказ официанту')}
          </Button>
          {isTableVerified === false && (
            <p className="text-xs text-gray-400 text-center mt-1">
              {tr('cart.enter_table_code_hint', 'Введите код стола чтобы отправить заказ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Known Bugs (BUGS.md)
---
version: "22.0"
updated: "2026-03-13"
session: 119
---

# PublicMenu — Bug Registry

Регистр всех известных багов страницы публичного меню (x.jsx + useTableSession.jsx).
Цель: не терять контекст, быстро чинить повторные баги, не допускать регрессий.

---

## Active Bugs (не исправлены)

*14 active bugs from S116 + 8 new bugs found in S119 CC review (2x P0, 1x P1, 4x P2, 1x P3).*

### BUG-PM-026: tableCodeLength default regressed to 5 (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:101
- **Симптом:** Default table code length is 5, but BUG-PM-S81-02 fixed it to 4. With partner config unset, guests enter wrong number of digits.
- **Фикс:** Change fallback from `return 5` to `return 4`.
- **Регрессия:** BUG-PM-S81-02

### BUG-PM-027: Loyalty/discount UI hidden for normal checkout (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:859, x.jsx:1937,3295
- **Симптом:** Loyalty section gated on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Email entry, balance display, and point redemption unavailable until after a dish rating exists (never for fresh cart).
- **Фикс:** Use `showLoyaltySection` for checkout loyalty; keep `showLoginPromptAfterRating` only for review nudge.

### BUG-PM-028: Failed star-rating saves leave dishes permanently locked (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:705,720,725; x.jsx:2039
- **Симптом:** Item marked read-only when draftRating > 0, but async save can fail. Nothing clears the draft on failure, so user cannot retry.
- **Фикс:** Roll back draft rating on failure, or only lock from confirmed `reviewedItems`.

### BUG-PM-029: Table-code auto-verify cannot retry same code after failure (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:174,184
- **Симптом:** `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Transient API failure forces guest to change digits to retry.
- **Фикс:** Clear `lastSentVerifyCodeRef` on failed verification, on unlock, and when input becomes incomplete.

### BUG-PM-030: Review-reward banner shows before any dish is reviewable (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:386
- **Симптом:** "За отзыв +N" hint shows when `myOrders.length > 0` regardless of order status. Guests see reward prompt before anything is ready/served.
- **Фикс:** Gate banner on ready/served statuses + `reviewableItems.length > 0`.
- **Регрессия:** BUG-PM-021

### BUG-PM-031: Cart can still be closed during order submission (P1)
- **Приоритет:** P1
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:464, x.jsx:3269
- **Симптом:** Close button active while `isSubmitting`. Drawer also closes unconditionally. Can hide in-flight errors.
- **Фикс:** Disable close button and block drawer close while `isSubmitting`.
- **Регрессия:** BUG-PM-034 (S85)

### BUG-PM-032: Order-status differentiation regressed (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:240
- **Симптом:** `getSafeStatus()` missing `accepted` fallback. Render paths ignore `status.icon`. Sent/accepted/cooking/ready collapse into near-identical text.
- **Фикс:** Add `accepted` to fallback map. Render `{icon} {label}` in all badge locations.
- **Регрессия:** BUG-PM-019

### BUG-PM-033: Scroll position not reset after table verification (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:136
- **Симптом:** `isTableVerified` effect only resets attempt counters, scroll-to-top fix is gone. Drawer stays stranded at bottom after code entry.
- **Фикс:** Restore scroll reset using `prevTableVerifiedRef` and nearest scrollable ancestor.
- **Регрессия:** BUG-PM-S81-03

### BUG-PM-034-R: Guest code leaked back into drawer header (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:274,281
- **Симптом:** `#guestCode` appended to "Вы:" label, exposing internal identifier even when `hallGuestCodeEnabled` is off.
- **Фикс:** Show code only in dedicated waiter-code block.
- **Регрессия:** BUG-PM-020

### BUG-PM-035: Verified-table block regresses mobile UX (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:1046,1007,1056
- **Симптом:** Duplicate "Стол подтвержден" header after verification. Info buttons are tiny icon-only touch targets (< 44px).
- **Фикс:** Restore `shouldShowOnlineOrderBlock` logic. Replace icon-only info controls with 44px labeled buttons.
- **Регрессия:** BUG-PM-008, BUG-PM-S81-07

### BUG-PM-036: Loyalty amounts bypass app localization (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:398,922,925
- **Симптом:** Hard-coded `toLocaleString('ru-RU')` and `₸` instead of `formatPrice`. Wrong currency/locale for non-Russian/non-tenge partners.
- **Фикс:** Use same formatter/locale as rest of page.

### BUG-PM-037: Reward email flow reports success without validation (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:514,520
- **Симптом:** Accepts any non-empty string, toasts "Email saved!" immediately. Invalid email or failed loyalty lookup still shows success.
- **Фикс:** Validate email format, await persistence result, show error if failed.

### BUG-PM-038: Submit-error copy says "order saved" when it may not be (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:1216, x.jsx:2591,2919
- **Симптом:** Error subtitle always says "Ваш заказ сохранен. Попробуйте снова" but submit may have failed completely. Misleads guest.
- **Фикс:** Use neutral retry text, or pass explicit error type.

### BUG-PM-039: 8-digit table codes overflow narrow phones (P2)
- **Приоритет:** P2
- **Когда:** S116 (Codex review)
- **Файл:** CartView.jsx:100,1074
- **Симптом:** Config allows up to 8 slots, but fixed `w-9` boxes + `gap-2` exceeds 320px viewport.
- **Фикс:** Make slot width/gap responsive, or switch to single-input layout for longer codes.

### BUG-PM-040: Loyalty points debited before order creation — no rollback on failure (P0)
- **Приоритет:** P0
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:2443-2455, x.jsx:2817-2829
- **Симптом:** In both `processHallOrder` and pickup/delivery flow, `LoyaltyTransaction` (redeem) and `LoyaltyAccount.update` (balance decrement) execute BEFORE `Order.create`. If order creation throws, points are permanently lost — catch block only sets `submitError`, never re-credits.
- **Фикс:** Move points deduction to after `Order.create` succeeds, or add compensating re-credit in catch block.

### BUG-PM-041: Polling timer leak in useTableSession after cleanup (P0)
- **Приоритет:** P0
- **Когда:** S119 (CC review)
- **Файл:** useTableSession.jsx:670-685
- **Симптом:** `scheduleNext()` creates recursive `setTimeout` chain. Cleanup sets `cancelled=true` and `clearTimeout(intervalId)`, but if `pollSessionData()` is mid-execution during cleanup, `scheduleNext` inside the callback fires, registering a new timeout the cleanup can't clear. Orphaned polling causes spurious state updates on stale components.
- **Фикс:** Guard `scheduleNext` with `if (cancelled) return` before scheduling next poll.

### BUG-PM-042: isBillOnCooldown crashes in restricted environments (P1)
- **Приоритет:** P1
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:283-288
- **Симптом:** `isBillOnCooldown()` calls `localStorage.getItem()` without try/catch. In private/incognito mode or strict security policies, `localStorage` access can throw. Called inside `useEffect` at x.jsx:2256 — unhandled exception crashes the component.
- **Фикс:** Add try/catch with `return false` fallback inside `isBillOnCooldown`.

### BUG-PM-043: formatOrderTime and OrderStatusScreen.formatPrice hardcode ru-RU locale (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:973, x.jsx:1206
- **Симптом:** `formatOrderTime` uses `d.toLocaleTimeString("ru-RU", ...)` and `OrderStatusScreen.formatPrice` uses `num.toLocaleString("ru-RU")`, ignoring active `lang` state. Wrong locale for non-Russian partners.
- **Фикс:** Pass `lang` or the parent's `formatPrice` as prop to `OrderStatusScreen`. Make `formatOrderTime` locale-aware.
- **Связано:** BUG-PM-036 (same pattern in CartView)

### BUG-PM-044: loyalty_redeem_rate falsy-coalescing shows wrong monetary value (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** CartView.jsx:925
- **Симптом:** `(partner?.loyalty_redeem_rate || 1)` treats rate of `0` as falsy, falls back to `1`. Partner with explicit `loyalty_redeem_rate = 0` shows inflated value to guests.
- **Фикс:** Use `??` (nullish coalescing) instead of `||`: `(partner?.loyalty_redeem_rate ?? 1)`.

### BUG-PM-045: console.log left in production order submission paths (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:2589, x.jsx:2917
- **Симптом:** Two `console.log("Order created", order?.id)` calls remain in successful order submission paths (hall and pickup/delivery). Minor information leak, violates no-debug-log rule.
- **Фикс:** Remove both `console.log` calls.

### BUG-PM-046: Redirect banner setTimeout not cleaned up on unmount (P2)
- **Приоритет:** P2
- **Когда:** S119 (CC review)
- **Файл:** x.jsx:1871
- **Симптом:** `setTimeout(() => setRedirectBanner(null), 5000)` inside `useEffect` with no cleanup. If component unmounts or deps change within 5s, the stale timer fires `setRedirectBanner(null)` on an unmounted component — React dev warning.
- **Фикс:** Store timer ID and return cleanup function, same pattern as `viewTransitionTimerRef`.

### BUG-PM-047: Multiple interactive elements missing aria-label (P3)
- **Приоритет:** P3
- **Когда:** S119 (CC review)
- **Файл:** CartView.jsx:424,449-450,1011,1060; MenuView.jsx:104,111,117
- **Симптом:** Icon-only buttons (call-waiter bell, name editor ✓/✕, info ⓘ buttons, list-mode add/stepper buttons) use `title` instead of `aria-label` or have no accessible label at all. Screen readers and mobile VoiceOver can't announce button purpose.
- **Фикс:** Add `aria-label` to all icon-only interactive elements. List-mode buttons should match tile-mode which already has proper labels.

---

## Fixed Bugs (исправлены)

### BUG-PM-023: reviewedItems.has() without null guard (P0) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `reviewedItems` prop is undefined, calling `.has()` crashes the render
- **Фикс:** Added `safeReviewedItems = reviewedItems || new Set()` in safe prop defaults block. All `.has()` calls use safeReviewedItems.

### BUG-PM-024: loyaltyAccount.balance without null guard (P0) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, loyalty section
- **Симптом:** If `loyaltyAccount.balance` is undefined/null, `.toLocaleString()` crashes
- **Фикс:** Wrapped all `loyaltyAccount.balance` usages with `Number(loyaltyAccount.balance || 0)`.

### BUG-PM-025: draftRatings prop without null guard (P1) — FIXED S116
- **Когда:** S79 review (pre-existing from S74), fixed S116
- **Файл:** CartView.jsx, Mode 2 order render
- **Симптом:** If `draftRatings` is undefined, accessing `draftRatings[itemId]` crashes
- **Фикс:** Added `safeDraftRatings = draftRatings || {}` in safe prop defaults block. All `draftRatings[itemId]` uses safeDraftRatings.

### BUG-PM-S87-03: CTA button "Send to waiter" looks active when disabled (P2) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `CartView.jsx` — submit button at bottom of cart drawer
- **Симптом:** Button always shows `bg-green-600` regardless of disabled state. When `isTableVerified === false`, button looks clickable (green) but does nothing. Confusing UX.
- **Root cause:** `className="w-full bg-green-600 hover:bg-green-700"` was unconditional — no visual change for disabled state.
- **Фикс:** Conditional className: `isTableVerified === false` → `bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300`. Added hint text `tr('cart.enter_table_code_hint', 'Введите код стола чтобы отправить заказ')` below button when disabled.
- **RELEASE:** pending (parallel mode, pre-merge)

### BUG-PM-028: Table code input shows 5 boxes for 4-digit codes (S81-02, P0) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `CartView.jsx` — tableCodeLength useMemo
- **Симптом:** OTP input renders 5 boxes but real codes are 4 digits → auto-verify never fires → order blocked.
- **Фикс:** tableCodeLength default 5→4 (reads from partner.table_code_length if set).
- **RELEASE:** `260305-03 CartView RELEASE.jsx` | **Коммит:** `e9050d3`

### BUG-PM-029: No visible feedback after Hall order sent (S81-17, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — processHallOrder()
- **Симптом:** Toast appeared for 2s (too short); on failure `setSubmitError` invisible in drawer.
- **Фикс:** Toast duration 2s→4s; added `toast.error` in catch; cart cleared on success.
- **RELEASE:** `260305-05 x RELEASE.jsx` | **Коммит:** `02ae5e5`

### BUG-PM-030: Pickup/Delivery checkout used fullscreen instead of drawer (S81-14, P0) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — handleCheckoutClick, StickyCartBar for pickup/delivery
- **Симптом:** Нажатие «Оформить» в режимах Самовывоз/Доставка открывало fullscreen checkout (отдельный экран) вместо bottom drawer. Несогласованный UX с режимом «В зале».
- **Фикс:** Добавлен `PickupDeliveryCheckoutContent` — drawer-контент с полями: Имя + Телефон (обязательные) + Адрес (только Доставка) + Комментарий + Total + CTA. `handleCheckoutClick` теперь устанавливает `drawerMode = 'checkout'` вместо `setView("checkout")`. Drawer использует `SNAP_FULL` (90% высоты) для отображения формы. Drawer нельзя закрыть во время submit (`isSubmitting` guard). Ошибки очищаются при закрытии (`onOpenChange`).
- **RELEASE:** `260305-05 x RELEASE.jsx` | **Коммит:** `02ae5e5`

### BUG-PM-031: Duplicate restaurant name in header (S81-07, P1) — FIXED S84
- **Когда:** S84 Quick Test — regression from S79 (logo addition)
- **Файл:** `x.jsx` — PublicMenuHeader + logo+name block
- **Симптом:** Restaurant name shown twice: (1) in PublicMenuHeader h1, (2) in logo+name block below.
- **Root cause:** S79 patch added logo+name block but didn't suppress the name already shown by PublicMenuHeader.
- **Фикс:** Pass `partner={showLogo ? { ...partner, name: undefined } : partner}` to PublicMenuHeader. When logo block shows the name, PublicMenuHeader gets partner without name field.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `a89ce7c`, `03b2eb9`

### BUG-PM-032: CTA button «Отправить официанту» below viewport (S81-03, P0) — FIXED S84
- **Когда:** S84 Quick Test — regression: S82 fix (SNAP_FULL) was not enough
- **Файл:** `x.jsx` — cart drawer structure
- **Симптом:** "Send to Waiter" button at y≈729 (viewport 736px), not visible without manual scroll.
- **Root cause:** RELEASE removed the `overflow-y-auto` wrapper around CartView (flex-col DrawerContent without scroll container). `sticky bottom-0` in CartView requires a scroll container parent.
- **Фикс:** Added `<div className="flex-1 overflow-y-auto min-h-0">` wrapper around CartView (and PickupDeliveryCheckoutContent) inside DrawerContent. Also added `isSubmitting` guard to `onOpenChange`.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `32d7e8a`, `03b2eb9`

### BUG-PM-033: Drawer drag handle swipe-to-close not working (S81-01, P0) — FIXED S84
- **Когда:** S84 Quick Test — regression: S82 `setActiveSnapPoint(null)` approach didn't work
- **Файл:** `x.jsx` — Drawer component
- **Симптом:** Swipe down on drag handle (gray bar at top of drawer) did not close drawer.
- **Root cause:** `setActiveSnapPoint(null)` relied on vaul snap point API that may not fire consistently. No fallback touch handler.
- **Фикс:** Added custom drag handle div with `onTouchStart`/`onTouchEnd` handlers. Swipe >80px triggers close. Added `isSubmitting` guard. Applied to both cart and checkout drawers.
- **RELEASE:** `260306-00 x RELEASE.jsx` | **Коммиты:** `270ad06`, `03b2eb9`

### BUG-PM-034: Cart drawer setActiveSnapPoint missing !isSubmitting guard (P1) — FIXED S85
- **Когда:** S85 — found during task-260306-003505 verification
- **Файл:** `x.jsx` — cart Drawer setActiveSnapPoint handler
- **Симптом:** Cart drawer could be closed via vaul snap API swipe even during order submission (vaul internal swipe). Inconsistency with checkout drawer which already had the guard.
- **Root cause:** Cart drawer `setActiveSnapPoint` used `if (sp === null)` without `!isSubmitting`, unlike checkout drawer which used `if (sp === null && !isSubmitting)`.
- **Фикс:** Added `&& !isSubmitting` to cart drawer `setActiveSnapPoint` condition + changed `else` to `else if (sp !== null)` for symmetry with checkout drawer.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-S87-01: :::ARCHIVED::: marker visible to guests in dish descriptions (P1) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `x.jsx` — isDishArchived(), getCleanDescription(), getDishDescription()
- **Симптом:** Guests see raw `:::ARCHIVED:::` text in dish descriptions (e.g., "пропрол :::ARCHIVED:::").
- **Root cause:** IS_ARCHIVED_TAG was lowercase `:::archived:::` but actual data has uppercase `:::ARCHIVED:::`. String.includes() and String.replace() are case-sensitive.
- **Фикс:** isDishArchived() now uses `.toLowerCase().includes()`. getCleanDescription() now uses `/:::archived:::/gi` regex. getDishDescription() now also cleans translated descriptions.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-S87-02: Raw i18n keys visible after order submission (P1) — FIXED S87
- **Когда:** S87 testing
- **Файл:** `x.jsx` — OrderConfirmationScreen, StickyCartBar labels
- **Симптом:** After submitting order, confirmation screen shows raw keys like `confirmation.title`, `CART.MY_BILL` instead of Russian text.
- **Root cause:** `t()` returns the key string when translation is missing. `|| "fallback"` pattern doesn't catch it because the key string is truthy. OrderConfirmationScreen used bare `t()` without fallbacks.
- **Фикс:** Added `tr()` helper to both x.jsx main component and OrderConfirmationScreen (same pattern as CartView). All confirmation.* keys and cart.* button labels now use `tr("key", "Russian fallback")`. 28 i18n keys added to `i18n_pending.csv`.
- **RELEASE:** `260306-01 x RELEASE.jsx`

### BUG-PM-026: Drawer pull-down swipe doesn't close drawer (S81-01, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — Drawer setActiveSnapPoint
- **Симптом:** Swipe down on drag handle did not close the drawer.
- **Фикс:** `setActiveSnapPoint` handler: `if (sp === null) setDrawerMode(null); else setDrawerSnapPoint(sp);`
- **RELEASE:** `260305-05 x RELEASE.jsx`

### BUG-PM-027: CTA button hidden at default drawer height (S81-03, P1) — FIXED S82
- **Когда:** S81 testing
- **Файл:** `x.jsx` — drawer snap point auto-grow
- **Симптом:** Drawer at SNAP_MID (60%); CTA outside visible area with 1-4 items.
- **Фикс:** Auto-expand to SNAP_FULL when `cart.length > 0` (was `> 4`).
- **RELEASE:** `260305-05 x RELEASE.jsx`

### BUG-PM-018: Confirmation screen shows "Заказ принят!" before waiter accepts (P0)
- **Приоритет:** P0 (wrong semantics breaks user trust)
- **Когда:** Session 74 (CC+GPT UX analysis)
- **Симптом:** After tapping "Отправить официанту", guest sees "Заказ принят!" — implies the waiter already accepted, which is false. The order was only sent.
- **Фикс:** Confirmation title now uses mode-dependent text: hall → "Заказ отправлен официанту", pickup/delivery → "Заказ отправлен". Added subtext: "Статус обновится, когда официант примет заказ". New `tr()` helper added to `OrderConfirmationScreen` for safe fallbacks.
- **Файл:** `x.jsx` (OrderConfirmationScreen)
- **RELEASE:** `260304-00 x RELEASE.jsx`

### BUG-PM-019: No visual status differentiation in guest "Мои заказы" (P1)
- **Приоритет:** P1
- **Когда:** Session 74
- **Симптом:** All orders showed generic blue badge without icon. Guest couldn't distinguish sent/accepted/cooking/ready status.
- **Фикс:** Enhanced `getSafeStatus()` with full STATUS_MAP: 🟡 Отправлен (new), 🟢 Принят (accepted), 🔵 Готовится (cooking), ✅ Готов (ready). Badge now shows `{icon} {label}` instead of just `{label}`.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-020: Session ID "#1313" shown to guest in drawer header (P2)
- **Приоритет:** P2
- **Когда:** Session 74
- **Симптом:** Guest sees "Вы: Гость 2 #1313" — the `#1313` is a meaningless session code from localStorage.
- **Фикс:** `guestDisplay` now uses only `guestBaseName` (name or "Гость N"). Session code logged to `console.debug` for debugging only.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-021: Rating banner shows before any order is ready (P1)
- **Приоритет:** P1
- **Когда:** Session 74
- **Симптом:** "За отзыв +10 баллов" banner appears immediately when drawer opens, even if no order has been delivered. Premature and confusing.
- **Фикс:** `shouldShowReviewRewardHint` now checks `hasReadyOrders` (at least one order with finish/ready/done/served status) AND `reviewableItems.length > 0`. Inline confirmation "Спасибо! +NБ" next to stars replaces generic "✓" checkmark when loyalty is active.
- **Файл:** `CartView.jsx`
- **RELEASE:** `260304-00 CartView RELEASE.jsx`

### BUG-PM-022: Drawer opens at wrong height — header not visible (P0)
- **Приоритет:** P0
- **Когда:** Session 74
- **Симптом:** Cart drawer opens at wrong snap position — only bottom portion visible, header "Стол / Гость / ✕" is offscreen.
- **Фикс:** Added `snapPoints={[0.85]}` to Drawer component to force 85% viewport height. Added `paddingBottom: env(safe-area-inset-bottom)` for mobile safe area support.
- **Файл:** `x.jsx`
- **RELEASE:** `260304-00 x RELEASE.jsx`

### BUG-PM-013: track_order button shows dish popup instead of OrderStatusScreen (GAP-02) (P1)
- **Приоритет:** P1
- **Когда:** Session 71 (найден Arman при тестировании 260303-03)
- **Симптом:** Clicking "Track Order" on OrderConfirmationScreen briefly shows a "Стейк" product popup, then returns to menu. OrderStatusScreen never appears.
- **Root cause:** `CONFIRMATION_AUTO_DISMISS_MS = 10000` (10s timer). The auto-dismiss fires `setView("menu")` + `setConfirmationData(null)`, removing the full-screen confirmation overlay. A pending touch/click event from the user then falls through to the menu grid underneath, hitting a dish card (Стейк) which opens `DishReviewsModal`. This is a ghost-click race condition on mobile.
- **Фикс:** Removed auto-dismiss timer entirely. The confirmation screen has 3 explicit navigation buttons (back to menu, my orders, track order) — auto-dismiss is unnecessary and harmful. Removed `CONFIRMATION_AUTO_DISMISS_MS` constant, `confirmationTimerRef` ref, all timer setup/cleanup code.
- **Файл:** `x.jsx` (PublicMenu main page)
- **RELEASE:** `260303-04 x RELEASE.jsx`

### BUG-PM-012: /orderstatus returns 404 — B44 routing doesn't register page (GAP-02) (P1)
- **Приоритет:** P1
- **Когда:** Session 71 (найден при деплое GAP-02)
- **Root cause:** B44 platform routing is managed internally — simply adding a `pages/orderstatus.jsx` file and updating `PUBLIC_ROUTES` in Layout.js does not register a route. The SPA route `/orderstatus` returned "Page Not Found". The `track_order` button in `OrderConfirmationScreen` used `window.location.href = '/orderstatus?token=...'` which triggered a full page navigation to a non-existent route.
- **Фикс:** Embedded `OrderStatusScreen` as a view state inside `x.jsx` (like `OrderConfirmationScreen`). View state expanded to `menu|checkout|confirmation|orderstatus`. Button now sets `setView("orderstatus")` instead of navigating. Sub-reviewer fixes: P0 timer leak after terminal, P1 token regex widened, P1 token generator fixed (substring(2,10)), P1 staleTime added, P1 pollTimerRef→closure, P1 orderStatusToken cleared in dismissConfirmation.
- **Файл:** `x.jsx` (PublicMenu main page)
- **Коммит:** `f080b62`
- **RELEASE:** `260303-03 x RELEASE.jsx`

### BUG-PM-011: Active tables expired based on opened_at alone — activity guard missing (P0)
- **Приоритет:** P0
- **Когда:** Session 68 (найден при анализе P0-1 перед деплоем)
- **Root cause:** `isSessionExpired()` in `sessionHelpers.js` checks only `opened_at`. A table open 8+ hours with recent orders (e.g., `last_activity_at` updated 1 hour ago) would be incorrectly expired. The cleanup logic in STEP 1 and STEP 2 of `restoreSession()` would close an active table and cancel orders.
- **Фикс:** Added `hasRecentActivity(session)` helper that checks `last_activity_at || updated_at || opened_at`. Both `isSessionExpired` call sites now use combined condition: `isSessionExpired(s) && !hasRecentActivity(s)` — session is expired only if BOTH old `opened_at` AND no recent activity.
- **Файл:** `useTableSession.jsx` (lines 11-18, 293, 332)
- **RELEASE:** `260302-06 useTableSession RELEASE.jsx`

### BUG-PM-009: Expired sessions reused — old orders leak into new visits (P0-1)
- **Приоритет:** P0
- **Когда:** Session 65 (найден Arman), Session 66 (исправлен)
- **Root cause:** `useTableSession.restoreSession()` called `isSessionExpired()` to skip expired sessions, but never closed them in DB. Old sessions stayed `status: 'open'` forever. When a new guest scanned QR, `getOrCreateSession` found the old open session and reused it — new guest saw all historical orders.
- **Фикс:** Added `closeExpiredSessionInDB()` helper: closes session (`status: expired`) + cancels unprocessed orders (`new` → `cancelled`). Called in STEP 1 (saved session) and STEP 2 (DB query) of `restoreSession()`.
- **Файл:** `useTableSession.jsx`
- **RELEASE:** `260302-00 useTableSession RELEASE.jsx`

### BUG-PM-010: Order created without valid table_session (P0-2)
- **Приоритет:** P0
- **Когда:** Session 65 (диагноз), Session 66 (исправлен)
- **Root cause:** `processHallOrder()` used `tableSession?.id || null` for `table_session` field. If session was expired or missing, order was created with `table_session: null`. This broke session-based filtering — the order was invisible to the current session or leaked into all views.
- **Фикс:** `handleSubmitOrder` now validates session before proceeding: if expired → close in DB + create new. Hard guard rejects if no valid session. `processHallOrder` receives `validatedSession` parameter (no stale closure).
- **Файл:** `x.jsx` (PublicMenu main page)
- **RELEASE:** `260302-00 x RELEASE.txt`

### BUG-PM-006: Drawer после подтверждения стола открывается проскроллленным вниз
- **Приоритет:** P1
- **Когда:** Session 29 (найден Arman)
- **Root cause:** При вводе кода стола в нижней части CartView и успешном подтверждении, drawer оставался проскроллленным вниз. Scroll position не сбрасывался.
- **Фикс:** `prevTableVerifiedRef` отслеживает переход `false→true`. При переходе — находим ближайший scrollable ancestor и scrollTo({ top: 0 }).
- **Файл:** `CartView.jsx`
- **Коммиты:** `d7db09b`, `6c7e21c` (review fix: scrollable ancestor вместо scrollIntoView)
- **RELEASE:** `260224-01 CartView RELEASE.jsx`
- **Ревью:** Correctness ✅ (scroll target issue → fixed), Style ✅

### BUG-PM-007: UX — «✅ Стол подтверждён» дублирует шапку
- **Приоритет:** P2
- **Когда:** Session 29 (найден Arman)
- **Root cause:** Жёлтый блок показывал «✅ Стол подтверждён» после подтверждения, но номер стола уже в шапке drawer.
- **Фикс:** `hasOnlineBenefits` + `shouldShowOnlineOrderBlock` — жёлтый блок скрыт если стол подтверждён И нет бенефитов. Если есть бенефиты — показываются только они. Текст «✅ Стол подтверждён» и код ввода полностью убраны при isTableVerified.
- **Файл:** `CartView.jsx`
- **Коммит:** `7e546f8`
- **RELEASE:** `260224-01 CartView RELEASE.jsx`

### BUG-PM-008: UX — ⓘ иконка в заголовке жёлтого блока слишком мала для мобильного
- **Приоритет:** P2
- **Когда:** Session 29 (анализ GPT по Apple HIG / Material Design)
- **Root cause:** Кнопка ⓘ (text-sm px-2) не соответствовала Apple HIG 44×44px. Две маленькие интерактивные иконки рядом в мобильном заголовке.
- **Фикс:** Заменены обе ⓘ кнопки на full-width Button + Info icon (lucide-react) с h-11 (44px). Две отдельные кнопки: «Как работает онлайн-заказ» (всегда в блоке) и «Где найти код стола» (только до подтверждения).
- **Файл:** `CartView.jsx`
- **Коммит:** `7e546f8`
- **RELEASE:** `260224-01 CartView RELEASE.jsx`

### BUG-PM-001: Белый экран после заказа в зале
- **Приоритет:** P0
- **Когда:** Session 27
- **Root cause:** `processHallOrder()` вызывал `setView("cart")`, но view="cart" не имеет JSX-рендера — только "menu" и "checkout" отрисовываются → белый экран.
- **Фикс:** `setView("cart")` → `setView("menu")`
- **Файл:** `PublicMenu_BASE.txt` (processHallOrder)
- **Коммит:** `2872bbf`
- **RELEASE:** `260223-00 x RELEASE.txt`
- **Ревью-заметка:** Correctness-reviewer нашёл что `setDrawerMode(null)` не вызывается → drawer остаётся открытым. Решение: это by design (показать "Ваши заказы").
- **Возможная регрессия:** → BUG-PM-004

### BUG-PM-002: Резкий переход экрана после заказа (Pickup/Delivery)
- **Приоритет:** P1
- **Когда:** Session 27
- **Root cause:** `handleSubmitOrder()` сразу вызывал `setView("menu")` + `setDrawerMode(null)` — экран менялся до того как пользователь увидел toast "Заказ отправлен".
- **Фикс:** Toast показывается сразу, `setView("menu")` + `setDrawerMode(null)` отложены на 300мс через `setTimeout` с cleanup через `viewTransitionTimerRef`.
- **Файл:** `PublicMenu_BASE.txt` (handleSubmitOrder)
- **Коммит:** `dbf1785` + `8c03690`
- **RELEASE:** `260223-00 x RELEASE.txt`

### BUG-PM-004: Polling стирает optimistic updates (Hall mode)
- **Приоритет:** P0
- **Когда:** Session 29
- **Root cause:** Polling в `useTableSession.jsx` (строки 540-542) полностью заменял `sessionOrders` через `setSessionOrders(orders || [])`. Optimistic order из `processHallOrder()` стирался через ~10 сек.
- **Фикс:** Merge-стратегия: polling теперь сравнивает серверные данные с локальными. Optimistic записи (с `_optimisticAt`) сохраняются до 30 сек (OPTIMISTIC_TTL_MS) или пока сервер не подтвердит. Dedup по ID предотвращает дубли.
- **Файлы:** `useTableSession.jsx` (polling merge), `PublicMenu_BASE.txt` (`_optimisticAt` в processHallOrder)
- **Коммиты:** `f5eb015` + `1c4aac5` (reviewer fixes)
- **RELEASE:** `260224-00 x RELEASE.txt`, `260224-00 useTableSession RELEASE.jsx`
- **Ревью:** Correctness ✅, Style ✅, Codex (partial) ✅

### BUG-PM-005: Корзина пропадает после F5
- **Приоритет:** P1
- **Когда:** Session 29
- **Root cause:** `cart` хранился как `useState([])` без персистенции. F5 сбрасывал React state.
- **Фикс:** localStorage с форматом `{items, ts}` и TTL 4ч. Guard через `cartRestoredRef` предотвращает race condition (save до restore). Legacy формат (plain array) мигрируется на чтении.
- **Файл:** `PublicMenu_BASE.txt`
- **Коммиты:** `f5eb015` + `1c4aac5`
- **RELEASE:** `260224-00 x RELEASE.txt`
- **Ревью:** Correctness ✅, Style ✅

### BUG-PM-003: Пустой drawer после F5 в зале
- **Приоритет:** P1
- **Когда:** Session 27
- **Root cause:** После F5 `isTableVerified` = true (из localStorage), но `myOrders`/`sessionOrders` грузятся асинхронно. Кнопка открывала пустой CartView до загрузки данных.
- **Фикс:** Флаг `isSessionLoading` (isTableVerified && !tableSession) + 3с таймаут `sessionCheckTimedOut`. Кнопка показывает "Загрузка..." и блокирует drawer.
- **Файл:** `PublicMenu_BASE.txt`
- **Коммит:** `c096ccb` + `8c03690`
- **RELEASE:** `260223-00 x RELEASE.txt`
- **Связано с:** BUG-PM-005 (корзина тоже пропадает при F5, но другая проблема — cart vs session)

---

## Notes

- **Формат ID:** BUG-PM-NNN (PM = PublicMenu)
- **Приоритеты:** P0 = блокирует использование, P1 = серьёзный, P2 = косметический
- **Review issues** (стиль, i18n, console.log) хранятся в `review_*.md`, не здесь
- При создании RELEASE — проверять что все Active Bugs закрыты или задокументированы
- **Для каждого бага обязательно:** root cause (код, строки), фикс (что изменили), коммит, RELEASE


## Page Context (README.md)
---
version: "7.0"
updated: "2026-03-13"
session: 119
---

# PublicMenu — README

Страница публичного меню ресторана (`/x`). Гость сканирует QR-код, видит меню,
добавляет блюда, оформляет заказ. Работает в трёх режимах: зал, самовывоз, доставка.

## Текущий RELEASE

| Файл | RELEASE | Дата | Сессия |
|---|---|---|---|
| x.jsx | `260306-01 x RELEASE.jsx` | 06 мар 2026 | S87 |
| CartView.jsx | `260305-03 CartView RELEASE.jsx` | 05 мар 2026 | S82 |
| MenuView.jsx | `260305-02 MenuView RELEASE.jsx` | 05 мар 2026 | S79 |
| useTableSession.jsx | `260302-06 useTableSession RELEASE.jsx` | 02 мар 2026 | S68 |

## Активные баги

14 багов из S116 (BUG-PM-026 -- BUG-PM-039) подтверждены, все ещё активны.
8 новых багов найдено в S119 CC review (BUG-PM-040 -- BUG-PM-047): 2x P0 + 1x P1 + 4x P2 + 1x P3.
Итого активных: 22. Подробности в BUGS.md.

---

## Changelog (UX/UI решения)

### Session 119 — 13 мар 2026

- Full CC code review всех 6 base файлов (CartView, CheckoutView, MenuView, ModeTabs, useTableSession, x.jsx)
- 14 багов из S116 подтверждены как всё ещё активные
- BUG-PM-040 (P0): Loyalty points debited before order creation — no rollback on failure
- BUG-PM-041 (P0): Polling timer leak in useTableSession after cleanup
- BUG-PM-042 (P1): isBillOnCooldown crashes without try/catch in restricted environments
- BUG-PM-043 (P2): formatOrderTime + OrderStatusScreen hardcode ru-RU locale
- BUG-PM-044 (P2): loyalty_redeem_rate falsy-coalescing shows wrong value for rate=0
- BUG-PM-045 (P2): console.log left in production order submission
- BUG-PM-046 (P2): Redirect banner setTimeout not cleaned up on unmount
- BUG-PM-047 (P3): Multiple interactive elements missing aria-label

### Session 116 — 12 мар 2026

- BUG-PM-023: Исправлен краш при undefined `reviewedItems` — добавлен `safeReviewedItems` default
- BUG-PM-024: Исправлен краш при undefined `loyaltyAccount.balance` — обёрнуто в `Number(... || 0)`
- BUG-PM-025: Исправлен краш при undefined `draftRatings` — добавлен `safeDraftRatings` default
- V7 smoke test: полный code review всех base файлов PublicMenu
- Codex review (253k tokens): +14 багов найдено (6x P1 рег., 8x P2), добавлены в BUGS.md

### Session 87 — 07 мар 2026

- BUG-PM-S87-03: Кнопка «Отправить официанту» теперь серая когда disabled (код стола не введён) — добавлена подсказка «Введите код стола»
- BUG-PM-S87-01: Маркер :::ARCHIVED::: больше не виден гостям — регистронезависимая очистка описаний блюд
- BUG-PM-S87-02: Экран подтверждения заказа и кнопки корзины теперь показывают русский текст вместо сырых i18n ключей (добавлен tr() с фоллбэками)

### Session 85 — 06 мар 2026

- BUG-PM-034: Cart drawer setActiveSnapPoint теперь блокирует закрытие во время отправки заказа (добавлен !isSubmitting guard, симметрично с checkout drawer)

### Session 84 — 06 мар 2026

- BUG-S81-07: Убрано дублирование названия ресторана в шапке (теперь только в блоке логотип+название)
- BUG-S81-03: Кнопка «Отправить официанту» всегда видна — добавлен scroll контейнер внутри drawer
- BUG-S81-01: Свайп вниз по drag handle закрывает drawer — кастомный обработчик touch событий (порог 80px)
- Исправление: drawer не закрывается во время отправки заказа (isSubmitting guard)

### Session 82 — 05 мар 2026

- BUG-S81-02: Поле кода стола теперь показывает 4 ячейки вместо 5 — код принимается, стол привязывается
- BUG-S81-17: Уведомление «Заказ отправлен официанту» теперь показывается 4 секунды вместо 2
- BUG-S81-17: При ошибке отправки заказа в режиме «Зал» теперь виден toast с текстом ошибки
- BUG-S81-17: Корзина очищается после успешной отправки заказа (в зале и во всех режимах)
- BUG-S81-01: Свайп вниз закрывает drawer корзины (починен обработчик setActiveSnapPoint)
- BUG-S81-03: Drawer автоматически разворачивается до полного размера при добавлении блюд
- BUG-S81-14: Checkout для самовывоза/доставки перенесён в drawer (вместо fullscreen)

### Session 79 — 05 мар 2026

- Добавлен логотип ресторана (40px аватар) в шапке меню
- Баннер «Ресторан закрыт» при partner.is_open === false
- Drawer: sticky header, два размера (mid 60% / full 90%), компактный блок кода стола
- Блюда в корзине в две строки, подпись бонуса за онлайн-заказ

### Session 75 — 04 мар 2026

- Карточки блюд: квадратные фото, бейдж скидки -X% зелёный, зачёркнутая старая цена
- Inline stepper «— 1 +» прямо на карточке

### Session 74 — 04 мар 2026

- Drawer v2: два режима — «Заказ» (корзина) и «Чеки» (история заказов)
- Статусы заказов с иконками (🟡 Отправлен / 🟢 Принят / 🔵 Готовится / ✅ Готов)
- Защита от двойного сабмита (submitLockRef + safeguard restore guest)

### Session 71–73 — 03 мар 2026

- GAP-01: Экран подтверждения заказа для самовывоза/доставки
- GAP-02: Экран статуса заказа (?track=TOKEN) встроен в x.jsx
- Inline stepper на карточках блюд

### Session 65–68 — 02–03 мар 2026

- Session logic: 8h hard-expire, guard hasRecentActivity, SESS-022 контракт
- Оптимистичные обновления заказа не перезаписываются при polling
- Корзина сохраняется после обновления страницы (F5)
