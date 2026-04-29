// ============================================================
// SAFE PARSE DATE — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:840  function safeParseDate(dateStr) {...}
//
// Defensive Date parser that protects against B44's naive datetime strings
// (without trailing 'Z') being interpreted as local time. Always treats input
// as UTC if no timezone marker. Returns Date(now) on any failure.
//
// Used as a foundation for `formatRelativeTime`, `formatClockTime`,
// `getAgeMinutes`, etc. Not exported alone in SOM, but cross-page usage in
// CartView and PartnerHome justifies promotion to shared.
//
// B44 path: src/components/_shared/utils/safeParseDate.js
// Local mirror path: components/_shared/utils/safeParseDate.js
// Import alias: @/components/_shared/utils/safeParseDate
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Parse a date string defensively. Appends 'Z' if missing (forces UTC
 * interpretation against B44's naive datetimes). Falls back to Date(now)
 * for null/undefined/invalid input.
 *
 * @param {string|null|undefined} dateStr - ISO-8601 or B44 datetime string.
 * @returns {Date} Always a valid Date instance (never NaN).
 */
export function safeParseDate(dateStr) {
  if (!dateStr) return new Date();
  try {
    const safe = !String(dateStr).endsWith("Z") ? `${dateStr}Z` : dateStr;
    const d = new Date(safe);
    if (isNaN(d.getTime())) return new Date();
    return d;
  } catch {
    return new Date();
  }
}
