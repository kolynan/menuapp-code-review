// ============================================================
// EMAIL VALIDATOR — canonical v1.0 LOCKED (S443 RF-1 Bundle 6)
// ============================================================
// Лёгкая email валидация для UI-форм (frontend-side, не security boundary).
// НЕ заменяет server-side email validation — это просто UX-проверка для
// дисабла submit-кнопки и подсказки пользователю.
//
// Source of truth для всего проекта. Replaces:
//   - pages/PublicMenu/CartView.jsx:1230  inline regex check (S443 verified)
//   - Future consumers: PartnerSettings, ClientAccount (если есть email-инпуты)
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0
//   §Bundle 6 — `_shared/validators/email.js` (ССП-only S372)
//   Source: CartView:1252 (audit) → CartView:1230 (verified S443, drift -22)
//
// Algorithm:
//   Single regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   Permissive enough для real-world emails, strict enough для catch typos.
//   Не проверяет TLD validity, не делает DNS lookup, не проверяет MX records.
//   Server-side validation остаётся обязательной (B44 / Backend Functions).
//
// Trim handling:
//   Leading/trailing whitespace стрипается перед проверкой — common UX
//   pattern (paste с пробелом).
//
// B44 path: src/components/_shared/validators/email.js
// Local mirror path: components/_shared/validators/email.js
// Import alias: @/components/_shared/validators/email
//
// BACKLOG: #493 RF-1 batch (Bundle 6 — misc, FINAL)
// Cross-refs: Bundle 1-5 (см. getStartStage.js header)
// ============================================================

/**
 * Email validation regex (frontend UX layer, не security boundary).
 * Matches: at least one non-space-non-@ char, @, at least one non-space-non-@ char,
 * dot, at least one non-space-non-@ char.
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email string (UI-level check, trim-aware).
 *
 * @param {unknown} value - Input value (typically from form input)
 * @returns {boolean} true если value — non-empty string matching EMAIL_REGEX after trim
 *
 * @example
 *   isValidEmail('user@example.com')        // true
 *   isValidEmail('  user@example.com  ')    // true (trim)
 *   isValidEmail('user@')                   // false
 *   isValidEmail(null)                      // false
 *   isValidEmail(123)                       // false
 */
export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  return EMAIL_REGEX.test(value.trim());
}

export default isValidEmail;
