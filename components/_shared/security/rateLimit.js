// ============================================================
// RATE LIMIT HELPERS — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - x.jsx:133 isRateLimitError + :138 shouldRetry
//   - SOM:516 isRateLimitError + :522 shouldRetry
//   - MenuDishes:157 isRateLimitError + :163 shouldRetry
//   - partnertables:406-407 inline isRateLimitError
//
// Evolution: v1.0 audit S342 → v1.2 S367 (status fast-path, 'too many requests',
// typeof string, error.detail/error.error fallbacks) → v1.3 S372 (Number(status)
// для stringified) → v1.4 S378 ('429' substring) → v1.5 S378-cont ('too many'
// substring NOT 'too many requests' full phrase) → LOCKED S388.
//
// B44 path: src/components/_shared/security/rateLimit.js
// Local mirror path: components/_shared/security/rateLimit.js
// Import alias: @/components/_shared/security/rateLimit
//
// BACKLOG: #493 RF-1 batch start (Bundle 1 PRIMARY)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 1

/**
 * Detects whether an error represents a rate-limit (HTTP 429) condition.
 *
 * Handles all error shapes seen across MenuApp:
 *   - Status fast-path: { status: 429 } or { status: "429" } (B44 stringified)
 *   - String error: throw "rate limit hit"
 *   - Standard Error: { message, ... }
 *   - B44 fallbacks: { detail, ... } or { error, ... }
 *
 * Substring matching is case-insensitive and accepts:
 *   - "rate limit"
 *   - "too many" (NOT 'too many requests' full phrase — partnertables compat)
 *   - "429" (preserves MenuDishes pre-S378 behavior for { message: "429" })
 *
 * @param {*} error - Anything thrown / rejected. Tolerates null, undefined,
 *                    plain strings, Error instances, B44 response objects.
 * @returns {boolean} true if rate-limit, false otherwise.
 */
export function isRateLimitError(error) {
  if (!error) return false;

  // Status fast-path: numeric or stringified (B44 sometimes wraps in String)
  if (Number(error?.status) === 429) return true;

  // Extract raw message: handle string-thrown, standard Error, and B44 shapes
  const raw =
    typeof error === "string"
      ? error
      : error?.message || error?.detail || error?.error || String(error);

  const msg = String(raw || "").toLowerCase();

  return (
    msg.includes("rate limit") ||
    msg.includes("too many") ||
    msg.includes("429")
  );
}

/**
 * React Query retry policy: don't retry 429s (would amplify rate-limit storm),
 * cap retries at 2 for other transient errors.
 *
 * Use as `retry: shouldRetry` in useQuery / useMutation configs.
 *
 * @param {number} failureCount - Count of prior failures (provided by React Query).
 * @param {*} error - The error from last attempt.
 * @returns {boolean} true to retry, false to give up.
 */
export function shouldRetry(failureCount, error) {
  if (isRateLimitError(error)) return false;
  return failureCount < 2;
}
