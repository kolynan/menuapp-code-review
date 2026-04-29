// ============================================================
// GET START STAGE — canonical v1.0 LOCKED (S443 RF-1 Bundle 6)
// ============================================================
// Находит стартовый этап для заказа по orderType (hall / pickup / delivery).
// Pure function — no side effects.
//
// Source of truth для всего проекта. Replaces:
//   - pages/PublicMenu/x.jsx:311  (canonical implementation, S443 verified)
//   - Future consumers: SOM (sessionHelpers.js), CartView (если потребуется)
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0
//   §Bundle 6 — `_shared/orderStage/getStartStage.js`
//   Source: x.jsx:304 (audit) → x.jsx:311 (verified S443, drift +7)
//
// Algorithm:
//   1. Filter stages by channel (orderType): enabled_hall / enabled_pickup /
//      enabled_delivery flags. Default '!== false' (treat undefined as enabled).
//   2. Look for explicit 'start' stage by internal_code → return immediately.
//   3. Fallback: sort by sort_order (ascending) → return first.
//   4. Return null if no stages match.
//
// B44 path: src/components/_shared/orderStage/getStartStage.js
// Local mirror path: components/_shared/orderStage/getStartStage.js
// Import alias: @/components/_shared/orderStage/getStartStage
//
// BACKLOG: #493 RF-1 batch (Bundle 6 — misc, FINAL)
// Cross-refs: Bundle 1 (security/rateLimit), Bundle 2 (security/url +
//             escapeHtml + generateShortCode), Bundle 3 (utils/* 16 helpers
//             + serialExecute), Bundle 4 (i18n/pluralizeRu + makeSafeT),
//             Bundle 5 (storage/safeStorage)
// ============================================================

/**
 * Find the starting stage for an order based on order type (channel).
 *
 * @param {Array<{internal_code?: string, sort_order?: number, enabled_hall?: boolean, enabled_pickup?: boolean, enabled_delivery?: boolean}>} stages - List of OrderStage entities
 * @param {'hall'|'pickup'|'delivery'|string} orderType - Channel of the order
 * @returns {object|null} Start stage object, or null if no stages match
 *
 * @example
 *   getStartStage(stages, 'hall')
 *   // → { internal_code: 'start', enabled_hall: true, sort_order: 0, ... }
 */
export function getStartStage(stages, orderType) {
  if (!stages?.length) return null;

  const channelStages = stages.filter((stage) => {
    switch (orderType) {
      case 'hall':
        return stage.enabled_hall !== false;
      case 'pickup':
        return stage.enabled_pickup !== false;
      case 'delivery':
        return stage.enabled_delivery !== false;
      default:
        return true;
    }
  });

  const startStage = channelStages.find((s) => s.internal_code === 'start');
  if (startStage) return startStage;

  const sorted = [...channelStages].sort(
    (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
  );
  return sorted[0] || null;
}

export default getStartStage;
