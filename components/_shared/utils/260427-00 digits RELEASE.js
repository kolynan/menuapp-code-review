// ============================================================
// DIGITS — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:1414  const digits = (v) => String(v || "").replace(/\D/g, "");
//
// Trivial helper extracted for cross-page reuse and consistency.
// Used in table code verification, phone normalization, etc.
//
// B44 path: src/components/_shared/utils/digits.js
// Local mirror path: components/_shared/utils/digits.js
// Import alias: @/components/_shared/utils/digits
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Extract decimal digits only from any input. Strips all non-digit chars.
 * Null/undefined/empty → "".
 *
 * @param {*} v - Any value (commonly string with mixed chars).
 * @returns {string} Digits-only string (may be empty).
 */
export function digits(v) {
  return String(v || "").replace(/\D/g, "");
}
