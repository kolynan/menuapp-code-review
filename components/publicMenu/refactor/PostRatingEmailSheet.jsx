import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidEmail } from "@/components/_shared/validators/email";

/**
 * Post-rating email capture bottom sheet (CV-38).
 *
 * Extracted from CartView R6-1 v2 Phase B.1 (per RFK_R6_CartView_Props_Plan.md
 * Option D, S615 Opus). Source: pages/PublicMenu/CartView.jsx lines 1407-1448
 * (~42 lines JSX) + lifted local state.
 *
 * State management:
 * - Visibility (`open` / `onClose`) — owned by parent (CartView). The sheet is
 *   triggered from the rating block within the cart, not from inside this sheet,
 *   so visibility flag must remain in parent and pass through.
 * - Local state — `rewardEmail`, `rewardEmailSubmitting`, `rewardTimerRef` —
 *   lifted into this component. Parent no longer owns them.
 *
 * Props (8):
 *   open                  — boolean, render gate (parent's showPostRatingEmailSheet).
 *   onClose               — callback, parent dismiss handler (setShowPostRatingEmailSheet(false)).
 *   ratedServedCount      — number, count of dishes rated (display + bonus calc).
 *   reviewRewardPoints    — number, points per rated dish (loyalty.review_bonus_hint).
 *   primaryColor          — string, hex color for primary CTA button.
 *   tr                    — function, translator from makeSafeT(t) (i18n).
 *   toast                 — object, toast notifier {success, error} (optional).
 *   setCustomerEmail      — function, parent's email setter (threads through).
 */
export function PostRatingEmailSheet({
  open,
  onClose,
  ratedServedCount,
  reviewRewardPoints,
  primaryColor,
  tr,
  toast,
  setCustomerEmail,
}) {
  const [rewardEmail, setRewardEmail] = React.useState("");
  const [rewardEmailSubmitting, setRewardEmailSubmitting] = React.useState(false);
  const rewardTimerRef = React.useRef(null);

  React.useEffect(() => () => clearTimeout(rewardTimerRef.current), []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30"
      onClick={() => onClose && onClose()}
    >
      <div
        className="bg-white rounded-t-xl w-full max-w-lg p-4 pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-slate-800 mb-2">
          {tr("review.get_bonus_title", "Получить баллы за отзыв")}
        </h3>
        <p className="text-sm text-slate-600 mb-1">
          {tr("review.rated_count", "Вы оценили")} {ratedServedCount}{" "}
          {tr("review.dishes_word", "блюд")}.
        </p>
        <p className="text-sm text-slate-600 mb-3">
          {tr("review.enter_email_for_points", "Введите email, чтобы получить")}{" "}
          {ratedServedCount * reviewRewardPoints}{" "}
          {tr("loyalty.points_short", "баллов")}.
        </p>
        <Input
          type="email"
          value={rewardEmail}
          onChange={(e) => setRewardEmail(e.target.value)}
          placeholder="email@example.com"
          className="mb-3 h-10"
        />
        <Button
          className="w-full h-11 mb-2 text-white"
          style={{ backgroundColor: primaryColor }}
          disabled={!rewardEmail.trim() || rewardEmailSubmitting}
          onClick={() => {
            if (!rewardEmail.trim()) return;
            if (!isValidEmail(rewardEmail)) {
              if (toast) toast.error(tr("loyalty.invalid_email", "Введите корректный email"));
              return;
            }
            setRewardEmailSubmitting(true);
            if (setCustomerEmail) setCustomerEmail(rewardEmail);
            if (toast) toast.success(tr("loyalty.email_saved", "Email сохранён! Бонусы будут начислены."));
            rewardTimerRef.current = setTimeout(() => {
              setRewardEmailSubmitting(false);
              if (onClose) onClose();
            }, 1000);
          }}
        >
          {rewardEmailSubmitting ? "..." : tr("review.get_bonus_btn", "Получить баллы")}
        </Button>
        <button
          type="button"
          className="w-full text-center text-sm text-slate-500 py-2"
          onClick={() => onClose && onClose()}
        >
          {tr("review.skip", "Пропустить")}
        </button>
        <p className="text-xs text-slate-400 text-center mt-1">
          {tr("review.ratings_saved_note", "Оценки уже сохранены")}
        </p>
      </div>
    </div>
  );
}

export default PostRatingEmailSheet;
