import React from "react";
import { Loader2 } from "lucide-react";
import Rating from "@/components/Rating";

export default function RatingSection({
  orders,
  showRating,
  itemsByOrder,
  formatPrice,
  tr,
  reviewsEnabled,
  isRatingMode,
  safeReviewedItems,
  safeDraftRatings,
  ratingSavingByItemId,
  updateDraftRating,
  handleRateDish,
}) {
  const allItems = [];
  orders.forEach((order) => {
    const orderItems = itemsByOrder.get(order.id) || [];
    orderItems.forEach((item, idx) => {
      allItems.push({
        ...item,
        itemId: item.id || `${order.id}_${idx}`,
        orderId: order.id,
      });
    });
  });

  const grouped = new Map();
  allItems.forEach((item) => {
    const name = item.dish_name || "Unknown";
    if (!grouped.has(name)) {
      grouped.set(name, { name, totalQty: 0, totalPrice: 0, items: [] });
    }
    const group = grouped.get(name);
    group.totalQty += item.quantity || 1;
    group.totalPrice +=
      item.line_total ?? item.dish_price * (item.quantity || 1);
    group.items.push(item);
  });

  const groups = Array.from(grouped.values());

  return (
    <div className="space-y-1 mt-1">
      {groups.map((group) => (
        <div key={group.name}>
          <div className="flex justify-between items-center text-sm py-1">
            <span className="text-slate-700">
              {group.name}
              {group.totalQty > 1 ? ` ×${group.totalQty}` : ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">
                {formatPrice(parseFloat(group.totalPrice.toFixed(2)))}
              </span>
              {showRating &&
                reviewsEnabled &&
                !isRatingMode &&
                (() => {
                  const anyRated = group.items.some(
                    (item) =>
                      safeReviewedItems.has(item.itemId) ||
                      (safeDraftRatings[item.itemId] || 0) > 0,
                  );
                  if (anyRated) {
                    const bestRating = Math.max(
                      ...group.items.map(
                        (item) => safeDraftRatings[item.itemId] || 0,
                      ),
                    );
                    return (
                      <span className="text-xs text-amber-500">
                        ⭐{bestRating}
                      </span>
                    );
                  }
                  return (
                    <span className="text-xs text-slate-400">
                      {tr("review.rate_action", "Оценить")}
                    </span>
                  );
                })()}
            </div>
          </div>
          {showRating &&
            reviewsEnabled &&
            group.items.map((item, itemIdx) => {
              const hasReview = safeReviewedItems.has(item.itemId);
              const draftRating = safeDraftRatings[item.itemId] || 0;
              const isRated = hasReview || draftRating > 0;
              const isFirstUnrated =
                !isRated &&
                itemIdx ===
                  group.items.findIndex((candidate) => {
                    const candidateDraftRating =
                      safeDraftRatings[candidate.itemId] || 0;
                    return (
                      !safeReviewedItems.has(candidate.itemId) &&
                      !(candidateDraftRating > 0)
                    );
                  });

              if (!isRatingMode) {
                return null;
              }

              return (
                <div
                  key={item.itemId}
                  className="flex items-center gap-2 pl-2 min-h-[44px]"
                  {...(isFirstUnrated ? { "data-first-unrated": true } : {})}
                >
                  <Rating
                    value={draftRating}
                    onChange={(val) => {
                      if (ratingSavingByItemId?.[item.itemId] === true) return;
                      updateDraftRating(item.itemId, val);
                      if (val > 0 && handleRateDish) {
                        const dishId =
                          typeof item.dish === "object"
                            ? item.dish?.id
                            : item.dish;
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
                      {tr("review.saving", "Сохраняем...")}
                    </span>
                  )}
                  {isRated && ratingSavingByItemId?.[item.itemId] !== true && (
                    <span className="text-xs text-green-600">
                      ✓ {tr("review.saved", "Сохранено")}
                    </span>
                  )}
                  {ratingSavingByItemId?.[item.itemId] === "error" && (
                    <span className="text-xs text-red-500">
                      {tr("review.save_error", "Ошибка. Повторить")}
                    </span>
                  )}
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
