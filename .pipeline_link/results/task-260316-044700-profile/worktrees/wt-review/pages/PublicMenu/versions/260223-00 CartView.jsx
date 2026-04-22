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
  // ===== P1 Expandable States =====
  const [splitExpanded, setSplitExpanded] = React.useState(false);
  const [loyaltyExpanded, setLoyaltyExpanded] = React.useState(false);
  const [myOrdersExpanded, setMyOrdersExpanded] = React.useState(true); // default open
  const [onlineBlockExpanded, setOnlineBlockExpanded] = React.useState(!isTableVerified);
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
    const reviewedCount = reviewedItems?.size ? Number(reviewedItems.size) : 0;
    const draftCount = draftRatings ? Object.values(draftRatings).filter(v => Number(v) > 0).length : 0;
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
    if (loyaltyAccount?.balance > 0) {
      return `${loyaltyAccount.balance.toLocaleString('ru-RU')} ${tr('loyalty.points_short', 'баллов')}`;
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
                            const hasReview = reviewedItems.has(itemId);
                            const draftRating = draftRatings[itemId] || 0;

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
                            {trFormat('loyalty.your_balance', { points: loyaltyAccount.balance.toLocaleString('ru-RU') }, `Ваш баланс: ${loyaltyAccount.balance.toLocaleString('ru-RU')} баллов`)}
                          </div>
                          <div className="text-slate-500">
                            = {(loyaltyAccount.balance * (partner?.loyalty_redeem_rate || 1)).toLocaleString('ru-RU')}₸
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
              {/* ИТОГО - bold total */}
              <div className="flex justify-between items-end pt-2 border-t">
                <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  {tr('cart.total', 'ИТОГО')}:
                </span>
                <span className="text-lg font-bold text-slate-900">{formatPrice(Number(cartTotalAmount) || 0)}</span>
              </div>

              {/* Online order to waiter (verification + benefits) — collapsible */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                {/* Clickable header — toggles expand/collapse */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between"
                  onClick={() => setOnlineBlockExpanded(!onlineBlockExpanded)}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-amber-900 font-semibold text-sm">
                      {tr('cart.verify.online_order_title', 'Онлайн-заказ официанту')}
                    </p>
                    {isTableVerified === true && !onlineBlockExpanded && (
                      <span className="text-xs text-green-700">✅ {tr('cart.verify.table_verified', 'Стол подтверждён')}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="text-amber-700 hover:text-amber-900 text-sm px-1"
                      onClick={(e) => { e.stopPropagation(); setInfoModal('online'); }}
                      title={tr('common.info', 'Информация')}
                    >
                      ⓘ
                    </button>
                    {onlineBlockExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </button>

                {/* Collapsible content */}
                {onlineBlockExpanded && (
                  <>
                    {/* Benefits are shown only when partner enabled them; no "if enabled" text */}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-amber-900 mt-2">
                        <span>{tr('cart.verify.discount_label', 'Скидка за онлайн-заказ')}</span>
                        <span>−{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    {partner?.loyalty_enabled && earnedPoints > 0 && (
                      <div className="flex justify-between text-sm text-amber-900 mt-1">
                        <span>{tr('cart.verify.bonus_label', 'Бонусы за онлайн-заказ')}</span>
                        <span>+{Number(earnedPoints || 0).toLocaleString('ru-RU')}Б</span>
                      </div>
                    )}

                    {/* Redeem points (if user applied) */}
                    {pointsDiscountAmount > 0 && (
                      <div className="flex justify-between text-sm text-amber-900 mt-1">
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
                  </>
                )}
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


              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 mt-3"
                onClick={handleSubmitOrder}
                disabled={isSubmitting || isTableVerified === false}
              >
                {isSubmitting ? tr('cart.submitting', 'Отправка...') : tr('cart.send_to_waiter', 'Отправить заказ официанту')}
              </Button>
              {isTableVerified === false && (
                <p className="text-xs text-amber-600 text-center mt-1">
                  {tr('cart.verify_table_hint', 'Подтвердите стол для отправки заказа')}
                  {/* TODO: add translation key */}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add more link - removed, use ✕ to close */}
    </div>
  );
}