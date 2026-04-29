// ============================================================
// FORMAT RELATIVE TIME — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:934  function formatRelativeTime(dateStr) {...}
//
// Wraps date-fns `formatDistanceToNow` with Russian locale and the
// project-wide safe date parser. Used in order timestamps, last-updated
// labels, etc.
//
// Dependencies: date-fns, date-fns/locale.
//
// B44 path: src/components/_shared/utils/formatRelativeTime.js
// Local mirror path: components/_shared/utils/formatRelativeTime.js
// Import alias: @/components/_shared/utils/formatRelativeTime
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { safeParseDate } from "./safeParseDate";

/**
 * Format a date as a Russian-localized relative-time string.
 * Examples: "5 минут назад", "около 1 часа назад".
 *
 * @param {string|null|undefined} dateStr - ISO-8601 or B44 datetime string.
 * @returns {string} Localized relative-time label.
 */
export function formatRelativeTime(dateStr) {
  const date = safeParseDate(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: ru });
}
