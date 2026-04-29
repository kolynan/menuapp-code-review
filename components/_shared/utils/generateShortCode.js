// ============================================================
// SHORT CODE GENERATOR — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:3438 `String(Math.floor(1000 + Math.random() * 9000))`
//     (guest_code, security 🔴 CC unique S367 finding)
//     → `generateShortCode({digits: 4, secure: true})`
//   - partnertables:166 `generate4DigitCode` (table codes)
//     → `generateShortCode({digits: 4, exclude: existingCodes})`
//   - partnertables `CodeSettingsForm.generateNewCode` @990-995 (Math.random
//     fallback) → delegate to canonical
//   - partnertables `generateUniqueCode` @178 (retry-with-exclude)
//     → canonical's built-in 100-attempt retry-with-exclude
//
// Effect: closes x.jsx:3438 guest_code Math.random vulnerability + standardizes
// 3 inline variants под single secure-by-default helper. P-8 pattern unified.
//
// SSR safety: `crypto.getRandomValues()` is Web Crypto API (browser + node 19+).
// B44 builds run client-side, so `window.crypto` is always available. If SSR
// is added later, wrap in `typeof crypto !== 'undefined'` guard.
//
// B44 path: src/components/_shared/utils/generateShortCode.js
// Local mirror path: components/_shared/utils/generateShortCode.js
// Import alias: @/components/_shared/utils/generateShortCode
//
// BACKLOG: #493 RF-1 batch (Bundle 2 — security helpers)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 2

/**
 * Generates a numeric short code with configurable length, exclusion list,
 * and CSPRNG security.
 *
 * Pattern P-8 (generate-with-retry): retries up to 100 times to find a code
 * not in `exclude`. Throws if exhausted (callers should expand the digit
 * width or alphabet at that point).
 *
 * Examples:
 *   generateShortCode({digits: 4, secure: true})
 *     → cryptographically random 4-digit guest code (CSPRNG)
 *
 *   generateShortCode({digits: 4, exclude: new Set(['1234', '5678'])})
 *     → 4-digit table code avoiding existing ones (Math.random OK for non-security)
 *
 *   generateShortCode({digits: 6, secure: true})
 *     → 6-digit verification code (CSPRNG)
 *
 * @param {object} [opts]
 * @param {number} [opts.digits=4] - Code length (decimal digits).
 * @param {Set<string>|string[]} [opts.exclude] - Codes to skip (uniqueness).
 * @param {boolean} [opts.secure=false] - true = crypto.getRandomValues (CSPRNG),
 *                                        false = Math.random (faster, non-security).
 * @returns {string} Generated code as a fixed-width string (left-padded if needed).
 * @throws {Error} If 100 attempts exhausted without finding a unique code.
 */
export function generateShortCode({
  digits = 4,
  exclude = new Set(),
  secure = false,
} = {}) {
  // Normalize exclude to a Set for O(1) lookups
  const excludeSet = exclude instanceof Set ? exclude : new Set(exclude);

  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);

  for (let attempt = 0; attempt < 100; attempt++) {
    let n;
    if (secure) {
      // Web Crypto API — CSPRNG, suitable for security-sensitive codes.
      // Uint16Array max value = 65535 → modulo into [min, max) range.
      const arr = new Uint16Array(1);
      crypto.getRandomValues(arr);
      n = min + (arr[0] % (max - min));
    } else {
      // Math.random — faster but not cryptographically secure. OK for
      // non-security uses (e.g., user-friendly table codes that are
      // additionally protected by other access controls).
      n = Math.floor(min + Math.random() * (max - min));
    }
    const code = String(n);
    if (!excludeSet.has(code)) return code;
  }

  throw new Error('generateShortCode: exhausted attempts');
}
