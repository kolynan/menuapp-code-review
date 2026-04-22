// ======================================================
// components/publicMenu/StickyCartBar.jsx
// UPDATED: TASK-260203-01 - Toggle for Bottom Drawer
// ======================================================

import { ShoppingCart, ClipboardList, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  hallModeLabel,      // "📋 Мой счёт" или "📋 Заказы стола"
  showBillAmount,     // показывать ли сумму в Hall без корзины
  // TASK-260203-01: New props for drawer toggle
  isDrawerOpen,       // is cart drawer currently open
}) {
  // В Hall без корзины показываем другую иконку
  const IconComponent = isHallMode && !hasCart ? ClipboardList : ShoppingCart;
  
  // TASK-260203-01: When drawer is open, show "close" state
  const isCloseMode = isDrawerOpen === true;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-30">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isCloseMode ? 'bg-slate-200' : 'bg-indigo-100'}`}>
            {isCloseMode ? (
              <ChevronDown className="w-5 h-5 text-slate-600" />
            ) : (
              <IconComponent className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div>
            {isCloseMode ? (
              // Drawer open - show info with cart/bill amount
              isHallMode ? (
                hasCart ? (
                  <>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {t('cart.cart')}: {cartTotalItems} {t('cart.items_short')}
                    </div>
                    <div className="text-lg font-bold text-slate-900">{formattedCartTotal}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                      {hallModeLabel || t('cart.your_orders')}
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      {isLoadingBill ? t('common.loading') : (showBillAmount ? formattedBillTotal : null)}
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {cartTotalItems} {t('cart.items')}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {t('cart.total')} {formattedCartTotal}
                  </div>
                </>
              )
            ) : isHallMode ? (
              hasCart ? (
                // Hall с корзиной — показываем корзину
                <>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {t('cart.cart')}: {cartTotalItems} {t('cart.items_short')}
                  </div>
                  <div className="text-lg font-bold text-slate-900">{formattedCartTotal}</div>
                </>
              ) : (
                // Hall без корзины — показываем заголовок и опционально сумму
                <>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    {hallModeLabel || t('cart.your_orders')}
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {isLoadingBill 
                      ? t('common.loading') 
                      : (showBillAmount ? formattedBillTotal : null)}
                  </div>
                </>
              )
            ) : (
              // Pickup/Delivery — стандартное отображение корзины
              <>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                  {cartTotalItems} {t('cart.items')}
                </div>
                <div className="text-lg font-bold text-slate-900">
                  {t('cart.total')} {formattedCartTotal}
                </div>
              </>
            )}
          </div>
        </div>
        <Button 
          onClick={onButtonClick} 
          className="px-8"
          variant={isCloseMode ? "outline" : "default"}
        >
          {isCloseMode ? (t('cart.close') || 'Закрыть') : buttonLabel}
        </Button>
      </div>
    </div>
  );
}
