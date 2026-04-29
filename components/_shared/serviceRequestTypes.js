// ============================================================
// SERVICE REQUEST TYPES — canonical LOCKED (S450 RF-3)
// ============================================================
// Source of truth для типов запросов гостей через SOS (Help Drawer).
//
// E-02 Fix: PublicMenu x.jsx отправлял 7 types; SOM знал только 5.
// Официанты видели raw enum «plate»/«utensils»/«clear_table»
// вместо RU labels — live production bug (audit §E-02).
//
// Replaces:
//   - pages/PublicMenu/x.jsx HELP_REQUEST_TYPES (Set construction)
//   - pages/StaffOrdersMobile/staffordersmobile.jsx REQUEST_TYPE_LABELS (lines 311-317)
//
// B44 path: src/components/_shared/serviceRequestTypes.js
// Local mirror path: components/_shared/serviceRequestTypes.js
// Import alias: @/components/_shared/serviceRequestTypes
//
// BACKLOG: #539 RF-3 ServiceRequest vocabulary unification
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §E-02
// Session: S450

/**
 * Canonical list of active service request types.
 * These are the types a guest can submit via the SOS / Help Drawer.
 * 'menu' (legacy) is intentionally excluded — it is NOT shown in SOS grid
 * and is kept only for backward compat in display (see REQUEST_LABELS_RU).
 *
 * @type {string[]}
 */
export const REQUEST_TYPES = [
  'call_waiter',
  'bill',
  'plate',
  'napkins',
  'utensils',
  'clear_table',
  'other',
];

/**
 * Russian display labels for each request type.
 * Used by SOM (staff-facing) where i18n is not yet wired to these labels.
 * Includes legacy 'menu' type for backward compat (old requests in DB).
 *
 * @type {Object.<string, string>}
 */
export const REQUEST_LABELS_RU = {
  call_waiter: 'Позвать официанта',
  bill: 'Принести счёт',
  plate: 'Тарелки',
  napkins: 'Принести салфетки',
  utensils: 'Приборы',
  clear_table: 'Убрать стол',
  other: 'Другой запрос',
  menu: 'Принести меню', // legacy — backward compat for old DB records
};

/**
 * English display labels for each request type.
 * Used by PublicMenu (guest-facing) as i18n fallback when tr() unavailable.
 *
 * @type {Object.<string, string>}
 */
export const REQUEST_LABELS_EN = {
  call_waiter: 'Call a waiter',
  bill: 'Bill',
  plate: 'Extra plate',
  napkins: 'Napkins',
  utensils: 'Utensils',
  clear_table: 'Clear the table',
  other: 'Other',
  menu: 'Paper menu', // legacy
};

/**
 * Returns the display label for a service request type.
 * Falls back to the raw type string if not found in the labels map.
 *
 * @param {string} type - The request_type value from B44 ServiceRequest entity.
 * @param {'ru'|'en'} [lang='ru'] - Language for the label.
 * @returns {string} Human-readable label, or raw type if unknown.
 */
export function getRequestLabel(type, lang = 'ru') {
  const map = lang === 'en' ? REQUEST_LABELS_EN : REQUEST_LABELS_RU;
  return map[type] ?? type;
}
