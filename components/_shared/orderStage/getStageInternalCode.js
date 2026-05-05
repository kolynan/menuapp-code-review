// ============================================================
// GET STAGE INTERNAL CODE — canonical v1.0 (S571 R5a-2 Phase A v2)
// ============================================================
// Возвращает canonical internal_code (`start | middle | finish`) для заказа.
// Two-path resolution:
//   1. Primary: lookup order.stage_id в stagesMap → stage.internal_code.
//   2. Fallback: mapLegacyStatus(order.status) для pre-backfill records.
//   3. Returns null если оба пути failed (caller decides UI fallback).
//
// Source of truth для всего проекта. Replaces:
//   - Inline `getOrderStatus(order)?.internal_code` checks в CartView (uses
//     local helper from useTableSession.jsx). After R5a Phase A — getOrderStatus
//     refactored в Phase B чтобы внутренне использовать этот helper.
//
// Algorithm:
//   1. Normalize stage_id (string или {id} object).
//   2. Lookup в stagesMap (Map<string, OrderStage>).
//   3. Return stage.internal_code если найден.
//   4. Fallback: mapLegacyStatus(order.status).
//   5. Return null если оба null.
//
// B44 path: src/components/_shared/orderStage/getStageInternalCode.js
// Local mirror path: components/_shared/orderStage/getStageInternalCode.js
// Import alias: @/components/_shared/orderStage/getStageInternalCode
//
// Cross-refs:
//   - components/_shared/orderStage/mapLegacyStatus.js (dependency)
//   - pages/PublicMenu/useTableSession.jsx:807-822 (legacy getOrderStatus,
//     refactored Phase B)
//   - outputs/permanent/RFK_R5a1_Migration_Plan.md §3 A.2
//
// BACKLOG: #648 (R5a-1 plan parent) → R5a-2 Phase A
// ============================================================

import { mapLegacyStatus } from './mapLegacyStatus';

/**
 * Get canonical OrderStage internal_code for an Order.
 *
 * @param {object|null|undefined} order - Order record (with stage_id and/or status)
 * @param {Map<string, {id: string, internal_code?: string}>|null|undefined} stagesMap
 *        - Map of OrderStage records keyed by stage.id (string)
 * @returns {'start'|'middle'|'finish'|null} Canonical internal_code, or null
 *
 * @example
 *   getStageInternalCode({ stage_id: 'abc', status: 'new' }, mapWith('abc'->'start'))
 *   // → 'start' (primary path)
 *
 *   getStageInternalCode({ stage_id: null, status: 'served' }, new Map())
 *   // → 'finish' (fallback path)
 *
 *   getStageInternalCode({ stage_id: null, status: null }, new Map())
 *   // → null (both paths empty)
 */
export function getStageInternalCode(order, stagesMap) {
  if (!order || typeof order !== 'object') return null;

  // Primary path: stage_id lookup
  const rawStageId = order.stage_id;
  const stageId = rawStageId && typeof rawStageId === 'object'
    ? (rawStageId.id ?? rawStageId._id ?? null)
    : rawStageId;

  if (stageId && stagesMap && typeof stagesMap.get === 'function') {
    const stage = stagesMap.get(String(stageId));
    if (stage?.internal_code) {
      return stage.internal_code;
    }
  }

  // Fallback path: legacy status enum
  return mapLegacyStatus(order.status);
}

export default getStageInternalCode;
