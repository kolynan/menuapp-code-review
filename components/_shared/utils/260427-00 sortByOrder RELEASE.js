// ============================================================
// SORT BY ORDER — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Generic version (per audit):
//   - MenuManage:111   sortByOrder (generic — sort_order field + name fallback)
//   - partnertables:127 sortByOrder OVERRIDE (page-specific: adds getTableNumber)
//
// This is the GENERIC version. partnertables keeps its file-local override
// as a wrapper that calls this and then layers the table-number tiebreaker.
//
// Sorts by:
//   1. `sort_order` (numeric, finite — entries with no order pushed to end)
//   2. `name` field (Russian-locale natural compare) as tiebreaker
//
// Pure (does not mutate input).
//
// B44 path: src/components/_shared/utils/sortByOrder.js
// Local mirror path: components/_shared/utils/sortByOrder.js
// Import alias: @/components/_shared/utils/sortByOrder
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

const NO_ORDER = 1e9;

function _readNum(x) {
  return Number.isFinite(+x) ? +x : NO_ORDER;
}

function _readName(x) {
  return (x ?? "").toString().trim();
}

/**
 * Generic stable-ish sort by `sort_order` field with name tiebreaker.
 * Returns a new array (does not mutate input).
 *
 * @template T
 * @param {T[]} arr - Items with `sort_order` and `name` fields.
 * @returns {T[]} New sorted array.
 */
export function sortByOrder(arr) {
  return [...(arr || [])].sort((a, b) => {
    const ao = _readNum(a?.sort_order);
    const bo = _readNum(b?.sort_order);
    if (ao !== bo) return ao - bo;
    return _readName(a?.name).localeCompare(_readName(b?.name), "ru");
  });
}
