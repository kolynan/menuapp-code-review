// ============================================================
// FORMAT COMPACT MINUTES — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:359  function formatCompactMinutes(totalMinutes) {...}
//
// Compact elapsed-time renderer для UI badges/chips. Formats:
//   - 0..59 minutes  → "5м"        (Russian short form)
//   - 60..119        → "1ч"  / "1ч 30м"
//   - 120+           → "2ч 5м"
//   - <=0 / NaN      → "0м"
//
// B44 path: src/components/_shared/utils/formatCompactMinutes.js
// Local mirror path: components/_shared/utils/formatCompactMinutes.js
// Import alias: @/components/_shared/utils/formatCompactMinutes
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Format minutes as compact Russian "Nм" or "Nч Mм" / "Nч".
 * Negative or NaN input returns "0м".
 *
 * @param {number} totalMinutes - Total elapsed minutes (integer).
 * @returns {string} Formatted compact label.
 */
export function formatCompactMinutes(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0м";
  if (totalMinutes < 60) return `${totalMinutes}м`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours}ч ${minutes}м` : `${hours}ч`;
}
