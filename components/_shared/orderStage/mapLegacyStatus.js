// ============================================================
// MAP LEGACY STATUS — canonical v1.0 (S571 R5a-2 Phase A v2)
// ============================================================
// Maps legacy Order.status enum string to canonical OrderStage
// internal_code (`start | middle | finish`). Used as fallback in
// getStageInternalCode when Order.stage_id is null (pre-backfill
// records or partner-custom flows without stage_id assignment).
//
// Source of truth для всего проекта. Replaces:
//   - Inline `(o.status || '').toLowerCase() === 'new'` patterns
//     в CartView.jsx (4 sites: 470/472/1021/1106)
//   - Inline `['served','completed'].includes(...)` в CartView L470
//
// Algorithm:
//   1. Trim + lowercase input.
//   2. Lookup в LEGACY_STATUS_MAP table.
//   3. Return canonical code или null (для unknown/empty).
//
// B44 path: src/components/_shared/orderStage/mapLegacyStatus.js
// Local mirror path: components/_shared/orderStage/mapLegacyStatus.js
// Import alias: @/components/_shared/orderStage/mapLegacyStatus
//
// Cross-refs:
//   - components/_shared/orderStage/getStageInternalCode.js (consumer)
//   - components/_shared/orderStage/getStageDisplay.js (consumer)
//   - outputs/permanent/RFK_R5a1_Migration_Plan.md §3 A.2
//   - references/B44_Entity_Schemas.md §OrderStage (canonical enum)
//
// BACKLOG: #648 (R5a-1 plan parent) → R5a-2 Phase A
// ============================================================

const LEGACY_STATUS_MAP = Object.freeze({
  // Start (заказ только создан)
  new: 'start',

  // Middle (в обработке)
  accepted: 'middle',
  in_progress: 'middle',
  prepared: 'middle',
  ready: 'middle',

  // Finish (терминальное состояние)
  served: 'finish',
  delivered: 'finish',
  completed: 'finish',
  closed: 'finish',
  expired: 'finish',
  closed_by_guest: 'finish',
  cancel: 'finish',
  cancelled: 'finish',
});

/**
 * Map legacy Order.status enum string to canonical OrderStage internal_code.
 *
 * @param {string|null|undefined} legacyStatus - Value of Order.status (legacy enum)
 * @returns {'start'|'middle'|'finish'|null} Canonical internal_code, or null if input is empty/unknown
 *
 * @example
 *   mapLegacyStatus('new')        // → 'start'
 *   mapLegacyStatus('Served ')    // → 'finish' (trim+lowercase tolerant)
 *   mapLegacyStatus('cancelled')  // → 'finish' (cancellation = orthogonal axis, R5-1)
 *   mapLegacyStatus('unknown')    // → null
 *   mapLegacyStatus(null)         // → null
 */
export function mapLegacyStatus(legacyStatus) {
  if (!legacyStatus || typeof legacyStatus !== 'string') return null;
  const normalized = legacyStatus.trim().toLowerCase();
  if (!normalized) return null;
  return LEGACY_STATUS_MAP[normalized] ?? null;
}

export default mapLegacyStatus;
