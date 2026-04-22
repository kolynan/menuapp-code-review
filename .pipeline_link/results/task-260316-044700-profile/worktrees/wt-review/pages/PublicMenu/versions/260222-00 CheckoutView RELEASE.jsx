import React from "react";
import { Plus, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutView({
  t,
  setView,
  cart,
  updateQuantity,
  formatPrice,
  finalTotal,
  cartTotalAmount,
  discountAmount,
  pointsDiscountAmount,
  earnedPoints,
  activeCurrency,
  defaultCurrency,
  orderMode,
  renderHallCheckoutContent,
  clientName,
  setClientName,
  clientPhone,
  handlePhoneChange,
  handlePhoneFocus,
  deliveryAddress,
  setDeliveryAddress,
  comment,
  setComment,
  errors,
  submitError,
  isSubmitting,
  handleSubmitOrder,
  isTableVerified,
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">{t('cart.your_order')}</h2>
        <button type="button" onClick={() => setView("menu")} className="text-sm text-indigo-600 hover:underline">
          {t('cart.back_to_menu')}
        </button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {cart.map((item) => (
            <div
              key={item.dishId}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="font-medium text-slate-900">{item.name}</div>
                <div className="text-sm text-slate-500">
                  {formatPrice(item.price)} x {item.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 mb-1">{formatPrice(item.price * item.quantity)}</div>
                <div className="flex items-center justify-end bg-slate-100 rounded-lg p-1 w-fit ml-auto">
                  <button type="button" onClick={() => updateQuantity(item.dishId, -1)} className="p-1 hover:bg-white rounded-md">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="mx-2 text-xs font-medium">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.dishId, 1)} className="p-1 hover:bg-white rounded-md">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          {cartTotalAmount != null && cartTotalAmount !== finalTotal && (
            <>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('checkout.subtotal')}</span>
                {/* TODO: add translation key — "Подытог" */}
                <span>{formatPrice(cartTotalAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('checkout.qr_discount')}</span>
                  {/* TODO: add translation key — "Скидка за QR-заказ" */}
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {pointsDiscountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('checkout.points_discount')}</span>
                  {/* TODO: add translation key — "Списание баллов" */}
                  <span>-{formatPrice(pointsDiscountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2" />
            </>
          )}
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900">{t('cart.total')}:</span>
            <span className="text-xl font-bold text-indigo-600">{formatPrice(finalTotal)}</span>
          </div>
          {earnedPoints > 0 && (
            <div className="flex justify-between text-sm text-amber-600">
              <span>{t('checkout.earned_bonus')}</span>
              {/* TODO: add translation key — "Бонусы за заказ" */}
              <span>+{earnedPoints}{t('loyalty.points_symbol')}</span>
              {/* TODO: add translation key for points_symbol — "Б" */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* P1-7: Currency disclaimer */}
      {activeCurrency && activeCurrency !== defaultCurrency && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          {t('checkout.currency_note')} ({defaultCurrency})
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          {orderMode === "hall" ? (
            /* Hall mode checkout - simplified */
            renderHallCheckoutContent()
          ) : (
            /* Pickup/Delivery form */
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('form.name')} <span className="text-red-500">{t('form.required')}</span>
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={t('form.name')}
                  className={errors.clientName ? "border-red-300" : ""}
                />
                {errors.clientName && <p className="text-xs text-red-500">{errors.clientName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('form.phone')} <span className="text-red-500">{t('form.required')}</span>
                </label>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={clientPhone}
                  onChange={handlePhoneChange}
                  onFocus={handlePhoneFocus}
                  placeholder={t('form.phone_placeholder')}
                  className={errors.clientPhone ? "border-red-300" : ""}
                />
                {errors.clientPhone && <p className="text-xs text-red-500">{errors.clientPhone}</p>}
              </div>
            </>
          )}

          {orderMode === "delivery" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t('form.address')} <span className="text-red-500">{t('form.required')}</span>
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={t('form.address')}
                className={errors.deliveryAddress ? "border-red-300" : ""}
              />
              {errors.deliveryAddress && <p className="text-xs text-red-500">{errors.deliveryAddress}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t('form.comment')}</label>
            <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('form.comment_placeholder')} />
          </div>
        </CardContent>
      </Card>

      {submitError && <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">{submitError}</div>}

      {/* Submit button - TASK-260127-01: renamed to "Отправить заказ" */}
      {(orderMode !== "hall" || isTableVerified) && (
        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-lg h-12"
          onClick={handleSubmitOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (t('cart.submitting')) : (orderMode === 'hall' ? t('cart.send_to_waiter') : t('cart.send_order'))}
        </Button>
      )}
    </div>
  );
}
