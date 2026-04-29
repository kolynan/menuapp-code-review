// ============================================================
// DEVICE ID — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - SOM:939  function genDeviceId() {...}
//   - SOM:946  function getOrCreateDeviceId() {...}
//
// Two named exports:
//   - genDeviceId()                       — generate fresh UUID-like ID
//   - getOrCreateDeviceId(storageKey?)    — read or create-and-store
//
// `getOrCreateDeviceId` accepts an optional storage key parameter so different
// pages can isolate their device IDs (SOM uses "menuapp_staff_device_id",
// PublicMenu may use a different key).
//
// B44 path: src/components/_shared/utils/deviceId.js
// Local mirror path: components/_shared/utils/deviceId.js
// Import alias: @/components/_shared/utils/deviceId
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

const DEFAULT_DEVICE_ID_KEY = "menuapp_device_id";

/**
 * Generate a fresh device ID. Prefers `crypto.randomUUID()` when available,
 * falls back to a Math.random + timestamp string. Never throws.
 *
 * @returns {string} Unique device ID.
 */
export function genDeviceId() {
  try {
    if (typeof crypto !== "undefined" && crypto?.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Read a device ID from localStorage; create and persist one if missing.
 * Falls back to ephemeral `genDeviceId()` if localStorage is unavailable.
 *
 * @param {string} [storageKey="menuapp_device_id"] - localStorage key.
 *                 Pass page-specific key to isolate (e.g. "menuapp_staff_device_id").
 * @returns {string} Stable (or ephemeral on storage failure) device ID.
 */
export function getOrCreateDeviceId(storageKey = DEFAULT_DEVICE_ID_KEY) {
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing) return existing;
    const id = genDeviceId();
    localStorage.setItem(storageKey, id);
    return id;
  } catch {
    return genDeviceId();
  }
}
