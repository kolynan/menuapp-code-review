import React from "react";
import { ChevronDown, ChevronUp, Minus, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import TerminalScreenT1CodexApp01 from "@/components/publicMenu/refactor/TerminalScreenT1CodexApp01";

export default function MyOrdersSection({
  showTableOrdersSection,
  cartTab,
  statusBuckets,
  cart,
  todayMyOrders,
  tr,
  bucketDisplayNames,
  reviewsEnabled,
  allServedRated,
  isRatingMode,
  shouldShowReviewRewardNudge,
  setShowPostRatingEmailSheet,
  setIsRatingMode,
  setExpandedStatuses,
  manualOverrideRef,
  expandedStatuses,
  shouldShowReviewRewardHint,
  reviewRewardPoints,
  unratedServedCount,
  renderBucketOrders,
  formatPrice,
  updateQuantity,
  loyaltyPanel,
}) {
  if (showTableOrdersSection && cartTab !== "my") return null;

  const servedCount = statusBuckets.served.length;
  const inProgressCount = statusBuckets.in_progress.length;
  const pendingCount = statusBuckets.pending_unconfirmed.length;
  const isEmpty =
    servedCount === 0 &&
    inProgressCount === 0 &&
    pendingCount === 0 &&
    cart.length === 0 &&
    todayMyOrders.length === 0;
  const isTerminal =
    inProgressCount === 0 &&
    pendingCount === 0 &&
    servedCount > 0 &&
    cart.length === 0;

  return (
    <>
      {isEmpty && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">
            {tr("cart.empty", "Корзина пуста")}
          </p>
        </div>
      )}

      {isTerminal ? (
        <TerminalScreenT1CodexApp01
          tr={tr}
          statusBuckets={statusBuckets}
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
        />
      ) : (
        ["served", "in_progress", "pending_unconfirmed"].map((key) => {
          const orders = statusBuckets[key];
          if (orders.length === 0) return null;
          const isExpanded = !!expandedStatuses[key];
          const isServed = key === "served";
          const showRating = isServed;

          return (
            <Card key={key} className="mb-4">
              <CardContent className="px-3 py-1.5">
                <button
                  type="button"
                  className="w-full flex items-center justify-between text-left min-h-[44px]"
                  onClick={() => {
                    if (key === "served")
                      manualOverrideRef.current.served = true;
                    setExpandedStatuses((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }));
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-semibold ${key === "pending_unconfirmed" ? "text-amber-600" : "text-slate-800"}`}
                    >
                      {bucketDisplayNames[key]} ({orders.length})
                    </span>
                    {isServed &&
                      reviewsEnabled &&
                      (allServedRated ? (
                        <span className="ml-1 text-xs text-green-600 font-medium">
                          ✓ {tr("review.all_rated_chip", "Оценено")}
                        </span>
                      ) : isRatingMode ? (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsRatingMode(false);
                            if (shouldShowReviewRewardNudge)
                              setShowPostRatingEmailSheet(true);
                          }}
                        >
                          {tr("review.done", "Готово")}
                        </span>
                      ) : (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedStatuses((prev) => ({
                              ...prev,
                              served: true,
                            }));
                            setIsRatingMode(true);
                            setTimeout(() => {
                              document
                                .querySelector("[data-first-unrated]")
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "nearest",
                                });
                            }, 100);
                          }}
                        >
                          {tr("review.rate", "Оценить")} ({unratedServedCount})
                        </span>
                      ))}
                  </div>
                  <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                {isServed && isRatingMode && !allServedRated && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tr("review.rating_mode", "Режим оценки")}
                  </p>
                )}
                {isServed && shouldShowReviewRewardHint && (
                  <p className="text-xs text-slate-500 mt-0.5 pb-1">
                    {tr("loyalty.review_bonus_hint", "За отзыв можно получить")}{" "}
                    +{reviewRewardPoints} {tr("loyalty.points_short", "баллов")}
                  </p>
                )}
                {key === "pending_unconfirmed" && (
                  <p className="text-xs text-slate-500 italic mt-0.5 pb-1">
                    ⓘ {tr("cart.pending.hint", "Ждём подтверждения ресторана")}
                  </p>
                )}
                {isExpanded && renderBucketOrders(orders, showRating)}
              </CardContent>
            </Card>
          );
        })
      )}

      {cart.length > 0 && (
        <Card className="mb-4">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                {tr("cart.group.in_cart", "В корзине")} (
                {cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})
              </h2>
            </div>

            <div className="space-y-2">
              {cart.map((item) => (
                <div
                  key={item.dishId}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">
                      {item.name}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-xs text-slate-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {formatPrice(
                        parseFloat((item.price * item.quantity).toFixed(2)),
                      )}
                    </span>
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.dishId, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                        aria-label={tr("menu.remove", "Убрать")}
                      >
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                      <span className="mx-1.5 text-sm font-semibold text-slate-900 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.dishId, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-colors"
                        aria-label={tr("menu.add", "Добавить")}
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {loyaltyPanel}
          </CardContent>
        </Card>
      )}
    </>
  );
}
