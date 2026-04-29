// ============================================================
// EXTRACT GUEST MARKER — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:412  function extractGuestMarker(label) {...}
//
// Extracts the first numeric run from a guest-tag label like "Гость 3" /
// "Стол 12 · Гость 5" / "[👤 7]". Used for the CartView §8 LOCKED [👤 N] chip
// rendering and SOM guest marker display.
//
// B44 path: src/components/_shared/utils/extractGuestMarker.js
// Local mirror path: components/_shared/utils/extractGuestMarker.js
// Import alias: @/components/_shared/utils/extractGuestMarker
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Extract the first sequence of digits from a guest-tag label.
 * Returns null if no digits found or label is empty.
 *
 * @param {string|null|undefined} label - Guest tag string.
 * @returns {string|null} First digit run as string, or null.
 */
export function extractGuestMarker(label) {
  if (!label) return null;
  const match = String(label).match(/(\d+)/);
  return match ? match[1] : null;
}
