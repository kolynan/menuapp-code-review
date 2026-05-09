import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * R6-2a T1 fix (Codex App): full terminal served-state block.
 */
export default function TerminalScreenT1CodexApp01({
  tr,
  statusBuckets,
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
}) {
  return (
    <>
      <div className="text-center py-6 mb-4">
        <p className="text-base font-medium text-slate-700">
          ✅ {tr("cart.nothing_waiting", "Ничего не ждёте.")}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {tr("cart.can_order_or_rate", "Можно заказать ещё или оценить.")}
        </p>
      </div>

      <Card className="mb-4">
        <CardContent className="px-3 py-1.5">
          <button
            type="button"
            className="w-full flex items-center justify-between text-left min-h-[44px]"
            onClick={() => {
              manualOverrideRef.current.served = true;
              setExpandedStatuses((prev) => ({ ...prev, served: !prev.served }));
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-slate-800">
                {bucketDisplayNames.served} ({statusBuckets.served.length})
              </span>
              {reviewsEnabled && (
                allServedRated
                  ? <span className="ml-1 text-xs text-green-600 font-medium">✓ {tr("review.all_rated_chip", "Оценено")}</span>
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
                      >{tr("review.done", "Готово")}</span>
                    : <span
                        role="button"
                        tabIndex={0}
                        className="ml-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedStatuses((prev) => ({ ...prev, served: true }));
                          setIsRatingMode(true);
                          setTimeout(() => {
                            document.querySelector("[data-first-unrated]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          }, 100);
                        }}
                      >{tr("review.rate", "Оценить")} ({unratedServedCount})</span>
              )}
            </div>
            <div className="min-w-[44px] min-h-[44px] flex items-center justify-end">
              {expandedStatuses.served
                ? <ChevronUp className="w-5 h-5 text-slate-400" />
                : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </button>

          {isRatingMode && !allServedRated && (
            <p className="text-xs text-slate-500 mt-0.5">{tr("review.rating_mode", "Режим оценки")}</p>
          )}

          {shouldShowReviewRewardHint && (
            <p className="text-xs text-slate-500 mt-0.5 pb-1">
              {tr("loyalty.review_bonus_hint", "За отзыв можно получить")} +{reviewRewardPoints} {tr("loyalty.points_short", "баллов")}
            </p>
          )}

          {expandedStatuses.served && renderBucketOrders(statusBuckets.served, true)}
        </CardContent>
      </Card>
    </>
  );
}
