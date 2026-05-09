import React from "react";
import { Button } from "@/components/ui/button";

/**
 * R6-2a T1 fix v2 (Codex App): sticky footer CTA.
 */
export default function StickyFooterCTAT1CodexApp02({
  show,
  cartLength,
  isSubmitting,
  submitPhase,
  submitError,
  setSubmitError,
  handleSubmitOrder,
  cartTotalAmount,
  discountAmount,
  pointsDiscountAmount,
  isSessionClosed,
  primaryColor,
  tr,
  onClose,
  setView,
}) {
  if (!show) return null;

  const cartGrandTotal = Math.max(
    0,
    (Number(cartTotalAmount) || 0) - (Number(discountAmount) || 0) - (Number(pointsDiscountAmount) || 0)
  );
  const disabled = isSubmitting || submitPhase === "submitting" || submitPhase === "success" || cartLength === 0 || isSessionClosed;

  return (
    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 -mx-4">
      {cartLength > 0 ? (
        <Button
          size="lg"
          className={`w-full min-h-[44px] text-white ${
            submitPhase === "submitting" || submitPhase === "success"
              ? "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100"
              : submitPhase === "error"
                ? "bg-red-600 hover:bg-red-700"
                : ""
          }`}
          style={submitPhase === "idle" ? { backgroundColor: primaryColor } : submitPhase === "success" ? { backgroundColor: "#16a34a" } : undefined}
          aria-label={tr("cart.send_to_waiter", "Отправить официанту")}
          onClick={() => {
            // Intentionally allow retry in the error phase: the label switches
            // to "Повторить отправку", so the button must remain clickable.
            if (disabled) return;
            if (submitError && setSubmitError) setSubmitError(null);
            handleSubmitOrder();
          }}
          disabled={disabled}
          data-cart-grand-total={cartGrandTotal}
        >
          {submitPhase === "submitting"
            ? tr("cart.submit.sending", "Отправляем...")
            : submitPhase === "success"
              ? tr("cart.submit.success", "Заказ отправлен")
              : submitPhase === "error"
                ? tr("cart.submit.retry", "Повторить отправку")
                : tr("cart.send_to_waiter", "Отправить официанту")}
        </Button>
      ) : (
        <Button
          size="lg"
          className="w-full min-h-[44px] text-white"
          style={{ backgroundColor: primaryColor }}
          onClick={() => { onClose ? onClose() : setView("menu"); }}
        >
          {tr("cart.cta.back_to_menu", "Вернуться в меню")}
        </Button>
      )}
    </div>
  );
}
