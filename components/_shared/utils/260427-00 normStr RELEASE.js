// ============================================================
// NORMALIZE STRING — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. HIGHEST DEDUP — replaces:
//   - MenuDishes:153  String(v == null ? "" : v)        (no trim)
//   - DishAvailability:37
//   - MenuManage:109
//   - PartnerContacts:47
//   - partnertables:123  (s ?? "").toString().trim()    (canonical — trims)
//
// Canonical chosen: partnertables version (trims + null/undefined safety).
// Migration note: callers that relied on whitespace preservation must adjust;
// in practice all 5 callers use normStr for comparison/display where trim is safe.
//
// B44 path: src/components/_shared/utils/normStr.js
// Local mirror path: components/_shared/utils/normStr.js
// Import alias: @/components/_shared/utils/normStr
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Normalize a value to a trimmed string. Null/undefined become "".
 *
 * @param {*} s - Anything (null/undefined/string/number/object).
 * @returns {string} Trimmed string representation; "" for null/undefined.
 */
export function normStr(s) {
  return (s ?? "").toString().trim();
}
