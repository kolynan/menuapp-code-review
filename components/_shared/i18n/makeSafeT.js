// ============================================================
// MAKE SAFE T — canonical v1.0 LOCKED (S434 RF-1 Bundle 4)
// ============================================================
// Factory that wraps a useI18n() `t()` function with raw-key protection
// and inline-fallback support. Replaces inline closure pattern from:
//   - CartView:287-302  tr(key, fallback) + trFormat(key, params, fallback)
//
// Bundle 4 scope = CartView-style factory (audit P-13 NEW S372).
// NOT to be confused with x.jsx-style `makeSafeT(rawT, lang)` which uses
// internal I18N_FALLBACKS dictionaries — that's RF-12 / P-3 territory
// (separate post-RF-1 task per audit v2.0 row P-3).
//
// Why this wrapper:
//   When B44 i18n module has no translation for a key, `t(key)` may return
//   the raw key itself, an empty string, or a value prefixed with `key:`.
//   Showing raw keys in production = jarring partner-facing bug
//   (e.g. "settings.tabs.appearance" instead of "Внешний вид"). Inline
//   fallbacks per call provide page-local safety net.
//
//   See also #524 (B44 platform Q-004 — `t(key, fallback)` parameter
//   ignored at platform level): factory's explicit fallback chain
//   defends client-side regardless of B44 fix timeline.
//
// API:
//   const { tr, trFormat } = makeSafeT(t);
//   tr('cart.header.guest_one', 'гость')             // → 'гость' OR translated
//   trFormat('cart.line', { count: 3 }, 'шт')        // → 'шт' OR translated
//
// Recommended usage in components:
//   const { t } = useI18n();
//   const { tr, trFormat } = useMemo(() => makeSafeT(t), [t]);
//
// B44 path: src/components/_shared/i18n/makeSafeT.js
// Local mirror path: components/_shared/i18n/makeSafeT.js
// Import alias: @/components/_shared/i18n/makeSafeT
//
// BACKLOG: #493 RF-1 batch (Bundle 4 — i18n)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 4
// Related: #524 (B44 platform i18n module bug — Q-004 fallback ignored)
// Cross-refs: Bundle 3 utils template style, Bundle 4 sibling pluralizeRu.js

/**
 * Build a pair of safe i18n helpers around a raw `t()` function.
 *
 * @param {Function} t - Raw translation function from useI18n() — `(key, params?) => string`.
 * @returns {{ tr: Function, trFormat: Function }} - Bound helpers with fallback handling.
 *
 *   tr(key, fallback)
 *     - Calls `t(key)`. If result is empty / non-string / equals raw key /
 *       starts with `key:` prefix → returns `fallback`. Otherwise returns
 *       trimmed translation.
 *
 *   trFormat(key, params, fallback)
 *     - Same protection as `tr`, but passes `params` object through to `t()`
 *       for {variable} interpolation. Used when translation strings contain
 *       placeholders like `{count}` or `{guest}`.
 *
 * @example
 *   const t = (key) => key === 'cart.title' ? 'Корзина' : '';
 *   const { tr } = makeSafeT(t);
 *   tr('cart.title', 'Cart')         // → 'Корзина'
 *   tr('cart.unknown_key', 'Fallback') // → 'Fallback'  (empty result)
 *
 * @example
 *   const t = (key, params) => key === 'order.line' ? `${params.n} dishes` : '';
 *   const { trFormat } = makeSafeT(t);
 *   trFormat('order.line', { n: 5 }, 'N dishes')  // → '5 dishes'
 */
export function makeSafeT(t) {
  const tr = (key, fallback) => {
    const val = typeof t === "function" ? t(key) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key + ":")) return fallback;
    return norm;
  };

  const trFormat = (key, params, fallback) => {
    const val = typeof t === "function" ? t(key, params) : "";
    if (!val || typeof val !== "string") return fallback;
    const norm = val.trim();
    if (norm === key || norm.startsWith(key)) return fallback;
    return norm;
  };

  return { tr, trFormat };
}
