// ============================================================
// COMPUTE MID ORDER — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Unifies (per audit v2.0):
//   - partnertables:178  computeMidOrder(prev, next)            (integer steps)
//   - MenuManage:165     computeMidOrder(prev, next, isFloat)   (extra float arg)
//
// Canonical signature accepts `isFloat` as optional 3rd argument; default
// `false` preserves partnertables behavior. MenuManage callers pass `true`
// explicitly. Step constant is configurable via 4th argument (default 1024).
//
// Returns the order value to insert between `prev` and `next` order indices,
// or null if no room (caller should trigger reindex). When one side is null,
// returns prev+step or next-step. Both null → step.
//
// B44 path: src/components/_shared/utils/computeMidOrder.js
// Local mirror path: components/_shared/utils/computeMidOrder.js
// Import alias: @/components/_shared/utils/computeMidOrder
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

const DEFAULT_ORDER_STEP = 1024;

/**
 * Compute a sort_order value to insert between two existing values.
 * Returns null when integer space exhausted (caller should reindex).
 *
 * @param {number|null} prev - Order value before insertion point.
 * @param {number|null} next - Order value after insertion point.
 * @param {boolean} [isFloat=false] - true → use float midpoint without
 *                                    minimum-gap requirement (MenuManage mode).
 * @param {number} [step=1024] - Step size when one neighbor is null.
 * @returns {number|null} New order value or null if no room.
 */
export function computeMidOrder(prev, next, isFloat = false, step = DEFAULT_ORDER_STEP) {
  const p = typeof prev === "number" ? prev : null;
  const n = typeof next === "number" ? next : null;

  if (p !== null && n !== null) {
    if (isFloat) {
      // Float mode: any midpoint is fine
      return (p + n) / 2;
    }
    // Integer mode: require gap >2 to avoid collisions on next insertion
    const mid = Math.floor((p + n) / 2);
    if (mid > p + 2 && mid < n - 2) return mid;
    return null;
  }
  if (p !== null) return p + step;
  if (n !== null) return n - step;
  return step;
}
