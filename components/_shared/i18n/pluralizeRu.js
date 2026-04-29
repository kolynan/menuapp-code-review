// ============================================================
// PLURALIZE RU — canonical v1.0 LOCKED (S434 RF-1 Bundle 4)
// ============================================================
// Russian 3-form pluralization helper. Source of truth для проекта.
// Replaces 3 divergent local copies:
//   - CartView:304-311        pluralizeRu(n, one, few, many)   (canonical — m100 check robust на 11)
//   - StaffOrdersMobile:1727  pluralRu(n, one, few, many)      (simpler impl, equivalent results)
//   - partnertables:188       pluralize(count, one, few, many) (same as SOM)
//
// Canonical chosen: CartView signature `pluralizeRu(count, one, few, many)`
// (4 individual args, NOT array). Preserves all existing callsites — zero
// signature changes для smoke imports. Algorithm uses CartView's m10/m100
// variant — explicit modulo на 100 для прозрачности правил Russian grammar.
//
// Russian grammar rules:
//   one  — 1, 21, 31, 41, ... (n%10 === 1, n%100 !== 11)
//   few  — 2-4, 22-24, ...    (n%10 ∈ [2,4], n%100 ∉ [12,14])
//   many — 0, 5-20, 25-30, ... (everything else, including 0 + teens 11-19)
//
// B44 path: src/components/_shared/i18n/pluralizeRu.js
// Local mirror path: components/_shared/i18n/pluralizeRu.js
// Import alias: @/components/_shared/i18n/pluralizeRu
//
// BACKLOG: #493 RF-1 batch (Bundle 4 — i18n)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 4
// Cross-refs: Bundle 1 (security/rateLimit), Bundle 2 (security/url),
//             Bundle 3 (utils/* — same code-style template)

/**
 * Choose the right Russian word form based on count.
 *
 * @param {number} count - The numeric count (negatives allowed; abs() applied).
 * @param {string} one   - Form for 1, 21, 31, ... (n%10 === 1, n%100 !== 11).
 * @param {string} few   - Form for 2-4, 22-24, ... (n%10 ∈ [2,4], n%100 ∉ [12,14]).
 * @param {string} many  - Form for 0, 5-20, teens, ... (everything else).
 * @returns {string} The chosen form. If `count` is non-numeric, returns `many`.
 *
 * @example
 *   pluralizeRu(1, 'блюдо', 'блюда', 'блюд')   // 'блюдо'
 *   pluralizeRu(2, 'блюдо', 'блюда', 'блюд')   // 'блюда'
 *   pluralizeRu(5, 'блюдо', 'блюда', 'блюд')   // 'блюд'
 *   pluralizeRu(11, 'блюдо', 'блюда', 'блюд')  // 'блюд'  (teens → many)
 *   pluralizeRu(21, 'блюдо', 'блюда', 'блюд')  // 'блюдо' (21 → one)
 *   pluralizeRu(22, 'блюдо', 'блюда', 'блюд')  // 'блюда' (22 → few)
 */
export function pluralizeRu(count, one, few, many) {
  const abs = Math.abs(Number(count) || 0);
  const m10 = abs % 10;
  const m100 = abs % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}
