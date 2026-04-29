// ============================================================
// SAFE STORAGE — canonical v1.0 LOCKED (S436 RF-1 Bundle 5)
// ============================================================
// Browser storage helpers (localStorage + sessionStorage) с try/catch
// guards для quota / privacy mode / disabled storage scenarios.
// Source of truth для всего проекта. Replaces:
//   - MenuDishes:143-158   safeLsGet + safeLsSet (raw string foundation)
//   - StaffOrdersMobile:945-1029  10 functions (loadNotifPrefs/saveNotifPrefs/
//     loadPollingInterval/savePollingInterval/loadSortMode/saveSortMode/
//     loadSortOrder/saveSortOrder/getOrCreateDeviceId+helpers/loadMyTables/...)
//   - partnertables / CartView / PublicMenu inline localStorage callsites
//     (verify cross-grep при extract — Bundle 5 follow-up migration)
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth
//   Bundle 5 — `_shared/storage/safeStorage.js` (P-7+P-17 mini-package)
//   Foundation primitives: safeLsGet + safeLsSet
//   Core API: getJSON(key, default) / setJSON(key, val) /
//             getString(key, default) / setString(key, val)
//   + extension: removeStored (NS S436 — completeness for migration)
//   + opts.storage: 'local' | 'session' (NS S436 — SOM uses both)
//
// Design notes:
//   * Two-layer API:
//       (1) Foundation — `safeLsGet` / `safeLsSet` (raw string, MenuDishes
//           compat alias) + `safeSsGet` / `safeSsSet` (sessionStorage twins).
//       (2) Core (preferred) — `getJSON` / `setJSON` / `getString` /
//           `setString` / `removeStored`. All accept opts={ storage, silent }.
//   * `silent` flag (default true): swallow errors silently (matches existing
//     SOM `/* ignore */` pattern). silent=false → re-throw on quota / DOM.
//   * sessionStorage support via opts.storage='session'. Default 'local'.
//   * SSR/Node safety: typeof window === 'undefined' → no-op + return fallback.
//
// B44 path: src/components/_shared/storage/safeStorage.js
// Local mirror path: components/_shared/storage/safeStorage.js
// Import alias: @/components/_shared/storage/safeStorage
//
// BACKLOG: #493 RF-1 batch (Bundle 5 — storage)
// Cross-refs: Bundle 1 (security/rateLimit), Bundle 2 (security/url +
//             escapeHtml), Bundle 3 (utils/* 16 helpers + serialExecute),
//             Bundle 4 (i18n/pluralizeRu + makeSafeT)

// ------------------------------------------------------------
// Internal: pick storage backend from opts
// ------------------------------------------------------------

function _pickStorage(opts) {
  // SSR/Node safety: window-less → null (callers must handle).
  if (typeof window === "undefined") return null;
  const which = opts?.storage === "session" ? "sessionStorage" : "localStorage";
  try {
    return window[which];
  } catch {
    // Some browsers throw on accessing storage in private mode / sandboxed iframe.
    return null;
  }
}

// ------------------------------------------------------------
// Foundation primitives — raw string (backward-compat aliases)
// ------------------------------------------------------------

/**
 * Read a raw string from localStorage (no JSON parse). Returns `fallback`
 * на любую ошибку (quota, privacy mode, DOM, missing key).
 *
 * Backward-compat alias for MenuDishes:143 — preserves exact signature.
 *
 * @param {string} key       Storage key.
 * @param {*}      fallback  Returned on missing key / error. Default `undefined`.
 * @returns {string|*}       String value, or fallback.
 *
 * @example
 *   const lang = safeLsGet("preferred_lang", "ru");
 */
export function safeLsGet(key, fallback) {
  const store = _pickStorage();
  if (!store) return fallback;
  try {
    const v = store.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

/**
 * Write a raw string to localStorage (no JSON serialize). Errors silently
 * swallowed (matches MenuDishes:151 `/* ignore */` pattern).
 *
 * Backward-compat alias for MenuDishes:151 — preserves exact signature.
 *
 * @param {string} key    Storage key.
 * @param {string} value  String value to store. Non-string is coerced via String().
 *
 * @example
 *   safeLsSet("preferred_lang", "kk");
 */
export function safeLsSet(key, value) {
  const store = _pickStorage();
  if (!store) return;
  try {
    store.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

/**
 * Read a raw string from sessionStorage. Twin of `safeLsGet` для sessionStorage.
 *
 * @param {string} key       Storage key.
 * @param {*}      fallback  Returned on missing key / error.
 * @returns {string|*}       String value, or fallback.
 */
export function safeSsGet(key, fallback) {
  const store = _pickStorage({ storage: "session" });
  if (!store) return fallback;
  try {
    const v = store.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

/**
 * Write a raw string to sessionStorage. Twin of `safeLsSet`.
 *
 * @param {string} key
 * @param {string} value
 */
export function safeSsSet(key, value) {
  const store = _pickStorage({ storage: "session" });
  if (!store) return;
  try {
    store.setItem(key, String(value));
  } catch {
    /* ignore */
  }
}

// ------------------------------------------------------------
// Core API — JSON (preferred for objects/arrays)
// ------------------------------------------------------------

/**
 * Read and JSON.parse a value from storage. Returns `fallback` если
 * key отсутствует, JSON broken, или storage недоступен (privacy / SSR).
 *
 * Replaces SOM patterns like loadNotifPrefs/loadMyTables (JSON.parse + try/catch +
 * defaults merge — keep merge logic in callsite, this helper handles raw decode).
 *
 * @param {string} key                          Storage key.
 * @param {*}      fallback                     Returned on miss / parse error / SSR.
 * @param {object} [opts]
 * @param {'local'|'session'} [opts.storage='local']
 * @returns {*}                                 Parsed value, or fallback.
 *
 * @example
 *   const prefs = getJSON("notif_prefs", { enabled: true });
 *   const interval = getJSON("polling", 5000, { storage: "session" });
 */
export function getJSON(key, fallback, opts) {
  const store = _pickStorage(opts);
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * JSON.stringify and write a value to storage. Errors silently swallowed
 * by default (matches SOM `/* ignore */` pattern). Pass `silent: false`
 * to re-throw quota / serialize failures.
 *
 * @param {string} key
 * @param {*}      value                        Anything JSON-serializable.
 * @param {object} [opts]
 * @param {'local'|'session'} [opts.storage='local']
 * @param {boolean} [opts.silent=true]          If false, re-throw on error.
 * @returns {boolean}                           true on success, false on swallowed error.
 *
 * @example
 *   setJSON("notif_prefs", { enabled: false });
 *   const ok = setJSON("big_data", obj, { silent: false });  // throws on quota
 */
export function setJSON(key, value, opts) {
  const store = _pickStorage(opts);
  if (!store) return false;
  const silent = opts?.silent !== false; // default true
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (!silent) throw err;
    return false;
  }
}

// ------------------------------------------------------------
// Core API — String (when value already serialized / primitive)
// ------------------------------------------------------------

/**
 * Read a raw string from storage. Like `safeLsGet`/`safeSsGet` but with
 * unified opts.storage selector. Preferred form when target storage is
 * decided dynamically.
 *
 * @param {string} key
 * @param {*}      fallback
 * @param {object} [opts]
 * @param {'local'|'session'} [opts.storage='local']
 * @returns {string|*}
 */
export function getString(key, fallback, opts) {
  const store = _pickStorage(opts);
  if (!store) return fallback;
  try {
    const v = store.getItem(key);
    return v == null ? fallback : v;
  } catch {
    return fallback;
  }
}

/**
 * Write a raw string to storage. Twin of `setJSON` for primitive values.
 *
 * @param {string} key
 * @param {*}      value                        Coerced via String(value).
 * @param {object} [opts]
 * @param {'local'|'session'} [opts.storage='local']
 * @param {boolean} [opts.silent=true]
 * @returns {boolean}
 */
export function setString(key, value, opts) {
  const store = _pickStorage(opts);
  if (!store) return false;
  const silent = opts?.silent !== false;
  try {
    store.setItem(key, String(value));
    return true;
  } catch (err) {
    if (!silent) throw err;
    return false;
  }
}

// ------------------------------------------------------------
// Removal
// ------------------------------------------------------------

/**
 * Remove a key from storage. Errors silently swallowed.
 *
 * @param {string} key
 * @param {object} [opts]
 * @param {'local'|'session'} [opts.storage='local']
 *
 * @example
 *   removeStored("expired_token");
 *   removeStored("temp_state", { storage: "session" });
 */
export function removeStored(key, opts) {
  const store = _pickStorage(opts);
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}
