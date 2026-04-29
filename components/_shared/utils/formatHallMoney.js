// ============================================================
// FORMAT MONEY — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Combines:
//   - SOM:367         formatHallMoney(amount)         (KZT-only, ru-RU locale)
//   - MenuDishes:215  formatPriceDisplay(price, ccy)  (multi-currency)
//
// Both behaviors preserved as named exports for backward-compat:
//   - formatHallMoney(amount)              — KZT, ru-RU, optional 2 decimals
//   - formatPriceDisplay(price, ccy='KZT') — full currency support
//
// `formatHallMoney` is a thin wrapper around `formatPriceDisplay` with
// hardcoded KZT and slightly different formatting (ru-RU locale, ₸ symbol,
// optional decimals only when fractional). Kept separate to avoid behavior
// drift in SOM hall-view chips.
//
// B44 path: src/components/_shared/utils/formatHallMoney.js
// Local mirror path: components/_shared/utils/formatHallMoney.js
// Import alias: @/components/_shared/utils/formatHallMoney
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

const ZERO_DECIMAL_CURRENCIES = ["KZT", "RUB", "JPY", "KRW"];

/**
 * Format money for SOM hall view (KZT, ru-RU locale, ₸ symbol).
 * Shows 2 decimals only if amount has a fractional part.
 *
 * @param {number|string|null} amount - Numeric value.
 * @returns {string} "1 234 ₸" or "1 234.50 ₸".
 */
export function formatHallMoney(amount) {
  const value = Number(amount || 0);
  const hasFraction = Math.abs(value % 1) > 0;
  return `${value.toLocaleString("ru-RU", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })} ₸`;
}

/**
 * Format price with currency symbol and locale-aware thousand separators.
 * Zero-decimal currencies (KZT/RUB/JPY/KRW) round to integer; others use 2 decimals.
 *
 * Note: callers must pass a list of available currencies via the `currencies`
 * argument (or use default formatting). This decouples the helper from
 * page-specific currency lists. If `currencies` is omitted, falls back to
 * using `currencyCode` as the symbol directly.
 *
 * @param {number|string|null} price - Numeric value.
 * @param {string} [currencyCode="KZT"] - ISO currency code.
 * @param {Array<{code:string,symbol:string}>} [currencies] - Optional currency list with symbols.
 * @returns {string} "1 234 ₸" / "12.34 USD" etc.
 */
export function formatPriceDisplay(price, currencyCode = "KZT", currencies) {
  const n = Number(price || 0);
  let symbol = currencyCode;
  if (Array.isArray(currencies)) {
    const curr = currencies.find((c) => c.code === currencyCode);
    if (curr?.symbol) symbol = curr.symbol;
  }
  const decimals = ZERO_DECIMAL_CURRENCIES.includes(currencyCode) ? 0 : 2;
  const formatted = n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} ${symbol}`;
}
