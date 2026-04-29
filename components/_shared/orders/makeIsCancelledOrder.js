// ============================================================
// MAKE IS-CANCELLED-ORDER — canonical v1.0 LOCKED (S443 RF-1 Bundle 6)
// ============================================================
// Factory для создания cancellation-предиката заказа. Принимает
// `getOrderStatus` resolver (так как order может быть в разных
// нормализациях — stage_id / status legacy) и возвращает чистую
// функцию-предикат для использования в .filter() / .reduce() / etc.
//
// Source of truth для всего проекта. Replaces:
//   - pages/PublicMenu/CartView.jsx:408  (closure pattern, S443 verified)
//   - Future consumers: SOM, x.jsx (если потребуется)
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0
//   §Bundle 6 — `_shared/orders/makeIsCancelledOrder.js`
//   Source: CartView:430-435 (audit) → CartView:408-413 (verified S443, drift -22)
//
// Why factory pattern (vs function with arg):
//   * `getOrderStatus` зависит от UI-context (active stages, order_type) —
//     resolver обычно captured в useMemo/closure внутри страницы.
//   * Factory создаёт closure-based predicate, удобно для .filter(o => isCancelledOrder(o))
//     без передачи getOrderStatus каждый раз.
//   * Audit S388 LOCKED это решение: `makeIsCancelledOrder(getOrderStatus)`.
//
// Cancellation detection rules:
//   1. stage_id stage → internal_code === 'cancel' OR === 'cancelled' → cancelled.
//   2. Legacy fallback: no stage_id stage AND order.status (lowercased) === 'cancelled'.
//   3. Otherwise → not cancelled.
//
// B44 path: src/components/_shared/orders/makeIsCancelledOrder.js
// Local mirror path: components/_shared/orders/makeIsCancelledOrder.js
// Import alias: @/components/_shared/orders/makeIsCancelledOrder
//
// BACKLOG: #493 RF-1 batch (Bundle 6 — misc, FINAL)
// Cross-refs: Bundle 1-5 (см. getStartStage.js header)
// ============================================================

/**
 * Factory: создаёт isCancelledOrder predicate, captured over getOrderStatus.
 *
 * @param {(order: object) => {internal_code?: string} | null | undefined} getOrderStatus - Resolver, возвращающий stage info для заказа
 * @returns {(order: object) => boolean} Predicate, возвращающий true если order cancelled
 *
 * @example
 *   const isCancelledOrder = makeIsCancelledOrder(getOrderStatus);
 *   const liveOrders = orders.filter(o => !isCancelledOrder(o));
 */
export function makeIsCancelledOrder(getOrderStatus) {
  return function isCancelledOrder(o) {
    const stageInfo = getOrderStatus(o);
    return (
      stageInfo?.internal_code === 'cancel'
      || stageInfo?.internal_code === 'cancelled'
      || (!stageInfo?.internal_code && (o?.status || '').toLowerCase() === 'cancelled')
    );
  };
}

export default makeIsCancelledOrder;
