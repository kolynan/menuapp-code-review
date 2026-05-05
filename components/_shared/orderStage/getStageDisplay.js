// ============================================================
// GET STAGE DISPLAY — canonical v1.0 (S571 R5a-2 Phase A v2)
// ============================================================
// Возвращает UI display object для заказа: `{ icon, label, color, internal_code }`.
// Used by CartView, OrdersList, OrderDetails для consistent stage rendering.
//
// Two-path resolution (same as getStageInternalCode):
//   1. Primary: stagesMap[order.stage_id] → use stage.name + stage.color.
//   2. Fallback: mapLegacyStatus(order.status) → use neutral defaults
//      (caller passes `t` для localized labels).
//   3. Both null → returns null-safe default { icon:'🔵', label:t('status.new'), color:'#3b82f6', internal_code:null }.
//
// Icon mapping:
//   - 'start'  → '🔵' (новый)
//   - 'middle' → '🟠' (в работе)
//   - 'finish' → '✅' (завершён)
//   - null/unknown → '🔵' (default)
//
// IMPORTANT: fallback path uses i18n key `status.<legacy_value>` which may
// not exist in current i18n dict. Ensure dict has at least:
//   status.new / status.served / status.delivered / status.cancelled
// OR caller passes through Phase B refactor (getOrderStatus thin wrapper).
//
// Current Phase A behavior matches improved coverage at cost of potential
// raw-English label leak — acceptable for low-traffic legacy fallback paths.
//
// Source of truth для всего проекта. Replaces:
//   - pages/PublicMenu/useTableSession.jsx:807-822 (getOrderStatus inline) —
//     refactored Phase B чтобы внутренне делегировать сюда.
//   - pages/PublicMenu/CartView.jsx:319-371 (getSafeStatus) — partial
//     consumer (CV-specific 2-group remap остаётся в CartView).
//
// B44 path: src/components/_shared/orderStage/getStageDisplay.js
// Local mirror path: components/_shared/orderStage/getStageDisplay.js
// Import alias: @/components/_shared/orderStage/getStageDisplay
//
// Cross-refs:
//   - components/_shared/orderStage/getStageInternalCode.js (dependency)
//   - outputs/permanent/RFK_R5a1_Migration_Plan.md §3 A.2
//   - references/B44_Entity_Schemas.md §OrderStage (canonical enum)
//
// BACKLOG: #648 (R5a-1 plan parent) → R5a-2 Phase A
// ============================================================

import { getStageInternalCode } from './getStageInternalCode';

const ICON_BY_CODE = Object.freeze({
  start: '🔵',
  middle: '🟠',
  finish: '✅',
});

const DEFAULT_COLOR_BY_CODE = Object.freeze({
  start: '#3b82f6',  // blue
  middle: '#f59e0b', // amber
  finish: '#10b981', // green
});

/**
 * Get UI display info for an Order based on its stage.
 *
 * @param {object|null|undefined} order - Order record (with stage_id and/or status)
 * @param {Map<string, object>|null|undefined} stagesMap - OrderStage map
 * @param {(key: string, fallback?: string) => string} [t] - i18n translator
 *        (optional; defaults to identity если не задан).
 * @returns {{icon: string, label: string, color: string, internal_code: string|null}}
 *
 * @example
 *   getStageDisplay({ stage_id: 'abc', status: 'new' }, mapWith('abc'->{name:'Принят',color:'#fff',internal_code:'start'}), t)
 *   // → { icon: '🔵', label: 'Принят', color: '#fff', internal_code: 'start' }
 *
 *   getStageDisplay({ stage_id: null, status: 'served' }, new Map(), t)
 *   // → { icon: '✅', label: t('status.served'), color: '#10b981', internal_code: 'finish' }
 *
 *   getStageDisplay({}, new Map(), t)
 *   // → { icon: '🔵', label: t('status.new'), color: '#3b82f6', internal_code: null }
 */
export function getStageDisplay(order, stagesMap, t) {
  const safeT = typeof t === 'function' ? t : (key, fallback) => fallback ?? key;
  const internal_code = getStageInternalCode(order, stagesMap);

  // Primary path: lookup full stage record для name/color
  const rawStageId = order?.stage_id;
  const stageId = rawStageId && typeof rawStageId === 'object'
    ? (rawStageId.id ?? rawStageId._id ?? null)
    : rawStageId;

  if (stageId && stagesMap && typeof stagesMap.get === 'function') {
    const stage = stagesMap.get(String(stageId));
    if (stage) {
      return {
        icon: ICON_BY_CODE[stage.internal_code] || '🔵',
        label: stage.name || safeT('status.new', 'New'),
        color: stage.color || DEFAULT_COLOR_BY_CODE[stage.internal_code] || '#3b82f6',
        internal_code: stage.internal_code || null,
      };
    }
  }

  // Fallback path: legacy status → canonical code → neutral defaults
  if (internal_code) {
    return {
      icon: ICON_BY_CODE[internal_code] || '🔵',
      label: safeT(`status.${order?.status || 'new'}`, order?.status || 'New'),
      color: DEFAULT_COLOR_BY_CODE[internal_code] || '#3b82f6',
      internal_code,
    };
  }

  // Null-safe default
  return {
    icon: '🔵',
    label: safeT('status.new', 'New'),
    color: '#3b82f6',
    internal_code: null,
  };
}

export default getStageDisplay;
