// ============================================================
// FORMAT ORDER TIME — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:1432  function formatOrderTime(order) {...}
//                 (prop-drilled to CartView for order line "13:42" labels)
//
// Pure formatter: extracts created_at|created_date|createdAt and renders
// "HH:MM" using the user's locale. Returns "" on missing or invalid date.
//
// B44 path: src/components/_shared/utils/formatOrderTime.js
// Local mirror path: components/_shared/utils/formatOrderTime.js
// Import alias: @/components/_shared/utils/formatOrderTime
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Format an order's creation time as "HH:MM" using user locale.
 * Tries `created_at`, `created_date`, `createdAt` fields in order. Empty → "".
 *
 * @param {object|null} order - Order object with timestamp field.
 * @returns {string} "HH:MM" or "".
 */
export function formatOrderTime(order) {
  const ts = order?.created_at || order?.created_date || order?.createdAt || null;
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}
