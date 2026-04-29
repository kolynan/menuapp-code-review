// ============================================================
// HTML ESCAPE — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - partnertables:149 escapeHtml (UNIQUE in current code, audit confirmed
//     via grep — no x.jsx duplicate as initial speculation suggested)
//
// Canonical: 5-entity replacement (& < > " '), null/undefined-safe via
// `String(input ?? "")`. Sufficient for HTML attribute and text-content
// contexts. Not sufficient for `javascript:` URL contexts (use isSafeUrl
// from ./url.js).
//
// B44 path: src/components/_shared/security/escapeHtml.js
// Local mirror path: components/_shared/security/escapeHtml.js
// Import alias: @/components/_shared/security/escapeHtml
//
// BACKLOG: #493 RF-1 batch (Bundle 2 — security helpers)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 2

/**
 * Escapes HTML special characters to prevent XSS in HTML attribute and
 * text-content contexts.
 *
 * Replaces:
 *   - &  → &amp;  (must be first to avoid double-escape)
 *   - <  → &lt;
 *   - >  → &gt;
 *   - "  → &quot;
 *   - '  → &#39;
 *
 * Tolerates null/undefined/non-string input (returns empty string).
 *
 * @param {*} input - Anything (number, string, null, etc.).
 * @returns {string} HTML-escaped string.
 */
export function escapeHtml(input) {
  const s = String(input ?? '');
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
