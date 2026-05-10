import React from "react";
import { CheckCircle2, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mapLegacyStatus } from "@/components/_shared/orderStage";

export default function TableBillSummary({
  showTableOrdersSection,
  cartTab,
  myGuestId,
  ordersByGuestId,
  isCancelledOrder,
  formatPrice,
  getGuestLabelById,
  itemsByOrder,
  getSafeStatus,
  getOrderStatus,
  effectivePaidGuestIds,
  payingGuestId,
  payingAll,
  handlePayGuest,
  otherGuestIdsFromOrders,
  sessionItems,
  sessionOrders,
  tr,
  handlePayAll,
  allGuestsPaid,
  renderedTableTotal,
}) {
  if (!showTableOrdersSection || cartTab !== "table") return null;

  const myOrders = myGuestId
    ? (ordersByGuestId.get(myGuestId) || []).filter(
        (order) => !isCancelledOrder(order),
      )
    : [];

  return (
    <>
      {myGuestId &&
        myOrders.length > 0 &&
        (() => {
          const selfTotal = myOrders.reduce(
            (sum, order) => sum + (Number(order.total_amount) || 0),
            0,
          );
          return (
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-600">
                      {tr("cart.self_orders", "Вы")} (
                      {getGuestLabelById(myGuestId)})
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {formatPrice(parseFloat(selfTotal.toFixed(2)))}
                  </span>
                </div>
                <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                  {myOrders.map((order) => {
                    const items = itemsByOrder.get(order.id) || [];
                    const status = getSafeStatus(getOrderStatus(order));
                    const isOrderPending =
                      !getOrderStatus(order)?.internal_code &&
                      mapLegacyStatus(order.status) === "start";

                    if (items.length === 0) {
                      return (
                        <div
                          key={order.id}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-slate-600">
                            {tr("cart.order_total", "Сумма заказа")}:{" "}
                            {formatPrice(
                              parseFloat(Number(order.total_amount).toFixed(2)),
                            )}
                            {isOrderPending && (
                              <span className="ml-1 text-amber-600 font-medium">
                                {tr("cart.badge.pending", "⏳ Ожидает")}
                              </span>
                            )}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: status.color }}
                          >
                            {status.icon} {status.label}
                          </span>
                        </div>
                      );
                    }

                    return items.map((item, idx) => (
                      <div
                        key={`${order.id}-${idx}`}
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="text-slate-600">
                          {item.dish_name} × {item.quantity}
                          {isOrderPending && (
                            <span className="ml-1 text-amber-600 font-medium">
                              {tr("cart.badge.pending", "⏳ Ожидает")}
                            </span>
                          )}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: status.color }}
                        >
                          {status.icon} {status.label}
                        </span>
                      </div>
                    ));
                  })}
                </div>
                {effectivePaidGuestIds.has(myGuestId) ? (
                  <div className="mt-3 flex items-center justify-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />{" "}
                    {tr("cart.payment.cta.paid_badge", "✓ Оплачено")}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={payingGuestId === myGuestId || payingAll}
                    onClick={() =>
                      handlePayGuest(
                        myGuestId,
                        myOrders
                          .filter(
                            (order) =>
                              order.payment_status !== "paid" &&
                              !isCancelledOrder(order),
                          )
                          .map((order) => order.id),
                      )
                    }
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {payingGuestId === myGuestId ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                    ) : null}
                    {tr("cart.payment.cta.pay", "Оплачено")}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })()}

      {otherGuestIdsFromOrders.map((gid) => {
        const guestOrders = ordersByGuestId.get(gid) || [];
        const guestTotal = guestOrders.reduce(
          (sum, order) =>
            isCancelledOrder(order)
              ? sum
              : sum + (Number(order.total_amount) || 0),
          0,
        );

        return (
          <Card key={gid} className="mb-4">
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700">
                    {getGuestLabelById(gid)}
                  </span>
                  {sessionItems.length === 0 && sessionOrders.length > 0 ? (
                    <span className="text-slate-400">
                      {tr("common.loading", "Загрузка")}
                    </span>
                  ) : (
                    <span className="font-bold text-slate-600">
                      {formatPrice(parseFloat(Number(guestTotal).toFixed(2)))}
                    </span>
                  )}
                </div>

                {guestOrders.length > 0 ? (
                  <div className="pl-2 border-l-2 border-slate-200 space-y-1">
                    {guestOrders.map((order) => {
                      const items = itemsByOrder.get(order.id) || [];
                      const status = getSafeStatus(getOrderStatus(order));

                      if (items.length === 0) {
                        return (
                          <div
                            key={order.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-slate-600">
                              {tr("cart.order_total", "Сумма заказа")}:{" "}
                              {formatPrice(
                                parseFloat(
                                  Number(order.total_amount).toFixed(2),
                                ),
                              )}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: status.color }}
                            >
                              {status.icon} {status.label}
                            </span>
                          </div>
                        );
                      }

                      const isOrderPending =
                        !getOrderStatus(order)?.internal_code &&
                        mapLegacyStatus(order.status) === "start";
                      return items.map((item, idx) => (
                        <div
                          key={`${order.id}-${idx}`}
                          className="flex justify-between items-center text-xs"
                        >
                          <span className="text-slate-600">
                            {item.dish_name} × {item.quantity}
                            {isOrderPending && (
                              <span className="ml-1 text-amber-600 font-medium">
                                {tr("cart.badge.pending", "⏳ Ожидает")}
                              </span>
                            )}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: status.color }}
                          >
                            {status.icon} {status.label}
                          </span>
                        </div>
                      ));
                    })}
                  </div>
                ) : (
                  <div className="pl-2 text-xs text-slate-400">
                    {tr("cart.no_orders_yet", "Заказов пока нет")}
                  </div>
                )}
              </div>
              {effectivePaidGuestIds.has(gid) ? (
                <div className="mt-3 flex items-center justify-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />{" "}
                  {tr("cart.payment.cta.paid_badge", "✓ Оплачено")}
                </div>
              ) : (
                <Button
                  size="sm"
                  disabled={payingGuestId === gid || payingAll}
                  onClick={() => {
                    const unpaidIds = guestOrders
                      .filter(
                        (order) =>
                          order.payment_status !== "paid" &&
                          !isCancelledOrder(order),
                      )
                      .map((order) => order.id);
                    handlePayGuest(gid, unpaidIds);
                  }}
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {payingGuestId === gid ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  ) : null}
                  {tr("cart.payment.cta.pay", "Оплачено")}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {!allGuestsPaid && (
        <Button
          size="sm"
          disabled={payingAll}
          onClick={handlePayAll}
          className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
        >
          {payingAll ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
          ) : null}
          {tr("cart.payment.cta.all_pay", "Все оплачено")} ·{" "}
          {formatPrice(parseFloat(renderedTableTotal.toFixed(2)))}
        </Button>
      )}
      {allGuestsPaid && (
        <div className="w-full mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-center">
          <div className="flex items-center justify-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle2 className="w-5 h-5" />{" "}
            {tr("cart.payment.cta.all_pay", "Все оплачено")} ·{" "}
            {formatPrice(parseFloat(renderedTableTotal.toFixed(2)))}
          </div>
          <p className="text-xs text-green-600 mt-1">
            {tr(
              "cart.payment.cta.close_hint",
              "Можно попросить официанта закрыть стол",
            )}
          </p>
        </div>
      )}
    </>
  );
}
