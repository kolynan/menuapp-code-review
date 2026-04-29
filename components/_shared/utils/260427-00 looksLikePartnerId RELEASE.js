// ============================================================
// LOOKS LIKE PARTNER ID — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:136   const looksLikePartnerId = (value) =>
//                   /^[0-9a-f]{24}$/i.test(String(value || "").trim());
//
// Detects whether a string looks like a B44 ObjectId (24-char hex).
// Used in partner slug routing, fallback ID detection, etc.
//
// B44 path: src/components/_shared/utils/looksLikePartnerId.js
// Local mirror path: components/_shared/utils/looksLikePartnerId.js
// Import alias: @/components/_shared/utils/looksLikePartnerId
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Returns true if the value is a 24-character hexadecimal string (B44 ObjectId
 * pattern). Case-insensitive. Trims whitespace before testing. Null/undefined → false.
 *
 * @param {*} value - Anything to test.
 * @returns {boolean} true if matches /^[0-9a-f]{24}$/i.
 */
export function looksLikePartnerId(value) {
  return /^[0-9a-f]{24}$/i.test(String(value || "").trim());
}
