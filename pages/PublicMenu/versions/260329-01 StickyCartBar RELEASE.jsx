// ======================================================
// components/publicMenu/StickyCartBar.jsx
// UPDATED: Batch 4 — Uber Eats style single-row tappable bar
// ======================================================

import React from "react";

export default function StickyCartBar({
  t,
  isHallMode,
  hasCart,
  cartTotalItems,
  formattedCartTotal,
  isLoadingBill,
  formattedBillTotal,
  onButtonClick,
  buttonLabel,
  hallModeLabel,
  showBillAmount,
  isDrawerOpen,
  primaryColor = '#1A1A1A',
}) {
  // Determine display values based on mode
  const isCloseMode = isDrawerOpen === true;
  const displayLabel = isCloseMode
    ? (t('cart.close') || 'Закрыть')
    : isHallMode && !hasCart
      ? hallModeLabel
      : buttonLabel || (t('cart.place_order') || 'Оформить заказ');
  const displayTotal = showBillAmount ? formattedBillTotal : formattedCartTotal;
  const displayCount = cartTotalItems || 0;

  // In close mode, show a muted bar
  const bgColor = isCloseMode ? '#6B7280' : primaryColor;

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-pb z-30">
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <button
          onClick={onButtonClick}
          className="w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-white shadow-lg active:brightness-90 transition-all min-h-[52px]"
          style={{ backgroundColor: bgColor }}
        >
          {/* Left: item count badge */}
          {!isCloseMode && displayCount > 0 && (
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {displayCount}
            </span>
          )}

          {/* Center: label */}
          <span className="flex-1 text-center font-semibold text-base truncate mx-2">
            {isLoadingBill ? (t('common.loading') || '...') : displayLabel}
          </span>

          {/* Right: price + chevron */}
          {!isCloseMode && displayTotal && !isLoadingBill && (
            <span className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
              {displayTotal}
              <span className="text-white/70">&rsaquo;</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
