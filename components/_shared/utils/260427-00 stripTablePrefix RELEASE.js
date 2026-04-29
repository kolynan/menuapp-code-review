// ============================================================
// STRIP TABLE PREFIX — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:407  function stripTablePrefix(label) {...}
//
// Strips the leading "Стол " (Russian, case-insensitive) from a label, e.g.
// "Стол 12" → "12". Used for compact table chip labels in SOM hall view and
// CartView guest-table chips. Whitespace-tolerant.
//
// B44 path: src/components/_shared/utils/stripTablePrefix.js
// Local mirror path: components/_shared/utils/stripTablePrefix.js
// Import alias: @/components/_shared/utils/stripTablePrefix
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Remove leading "Стол " prefix from a label. Returns "" for empty input.
 *
 * @param {string|null|undefined} label - Table label (e.g. "Стол 12").
 * @returns {string} Label without "Стол " prefix.
 */
export function stripTablePrefix(label) {
  if (!label) return "";
  return String(label).replace(/^\s*Стол\s*/i, "").trim();
}
