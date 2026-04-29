// ============================================================
// URL SAFETY HELPERS — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:141 isSafeUrl (5 protocols incl. whatsapp:)
//   - MenuDishes:201 isUrlSafe + :199 ALLOWED_PROTOCOLS (4 protocols)
//
// Canonical decision (audit "union-set protocols"):
//   - Name: `isSafeUrl` (matches x.jsx, more readable)
//   - Alias: `isUrlSafe` (backward-compat with MenuDishes callsites — no rename)
//   - Protocols UNION: http/https/tel/mailto/whatsapp (5 total)
//   - Strict `new URL(url)` — relative URLs treated as unsafe (no implicit
//     origin promotion); MenuDishes pattern preferred for security
//
// B44 path: src/components/_shared/security/url.js
// Local mirror path: components/_shared/security/url.js
// Import alias: @/components/_shared/security/url
//
// BACKLOG: #493 RF-1 batch (Bundle 2 — security helpers)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 2

/**
 * Allowed URL protocols for user-supplied contact links.
 * Union of x.jsx + MenuDishes use-cases.
 */
export const ALLOWED_PROTOCOLS = [
  'http:',
  'https:',
  'tel:',
  'mailto:',
  'whatsapp:',
];

/**
 * Validates that a URL uses an allow-listed protocol (XSS guard).
 *
 * Rejects:
 *   - null/undefined/empty/non-string
 *   - javascript:, data:, file:, vbscript: etc.
 *   - Malformed URLs (URL constructor throws)
 *   - Relative URLs (no implicit same-origin promotion — strict mode)
 *
 * Accepts:
 *   - http://, https:// (web)
 *   - tel:+1234, mailto:foo@bar.com (URI schemes)
 *   - whatsapp://send?phone=... (deep link)
 *
 * @param {*} url - Anything from user input. Tolerates non-strings.
 * @returns {boolean} true if safe, false otherwise.
 */
export function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Backward-compat alias for MenuDishes callsites (lines 1108, 2108).
 * No rename needed — callsites continue to use `isUrlSafe(url)`.
 *
 * @param {*} url - Same as isSafeUrl.
 * @returns {boolean} true if safe, false otherwise.
 */
export const isUrlSafe = isSafeUrl;

/**
 * Returns the URL if safe, or empty string otherwise.
 * Convenient for href={sanitizeUrl(url)} patterns where empty href is OK.
 *
 * @param {*} url - User-supplied URL.
 * @returns {string} Safe URL or empty string.
 */
export function sanitizeUrl(url) {
  return isSafeUrl(url) ? url : '';
}
