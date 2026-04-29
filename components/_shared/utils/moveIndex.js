// ============================================================
// MOVE INDEX — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - partnertables:157  function moveIndex(list, from, to) {...}
//   - MenuManage similar (drag-drop reorder)
//
// Pure: returns a new array with the element at `from` moved to `to`.
// Does not mutate the input. Used in DnD reorder flows.
//
// B44 path: src/components/_shared/utils/moveIndex.js
// Local mirror path: components/_shared/utils/moveIndex.js
// Import alias: @/components/_shared/utils/moveIndex
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Return a new array with the item at index `from` moved to index `to`.
 * Pure (does not mutate `list`).
 *
 * @template T
 * @param {T[]} list - Source array.
 * @param {number} from - Source index.
 * @param {number} to - Destination index.
 * @returns {T[]} New array with item moved.
 */
export function moveIndex(list, from, to) {
  const next = [...(list || [])];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
