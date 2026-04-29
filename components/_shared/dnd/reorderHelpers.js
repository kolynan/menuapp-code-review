// ============================================================
// DND REORDER HELPERS — canonical v1.0 LOCKED (S443 RF-1 Bundle 6)
// ============================================================
// Чистые helpers для drag-and-drop переупорядочивания массивов id.
// 3 функции в 1 файле (одно семейство, малые размеры — читаемее как unit).
//
// Source of truth для всего проекта. Replaces:
//   - pages/MenuDishes/menudishes.jsx:233/241/252 (S443 verified)
//   - Future consumers: MenuManage (если/когда DnD появится), partnertables
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0
//   §Bundle 6 — `_shared/dnd/` (DnD trio)
//   Source: MenuDishes:237/245/256 (audit) →
//           menudishes.jsx:233/241/252 (verified S443, drift -4)
//   Pattern P-11 (S378-cont): Drag-drop reorder hook (RF-1.1 follow-up)
//
// Functions:
//   * syncOrderIds(prevIds, currentIds)       — Sync кэшированных ids с актуальными,
//                                                 удаляя удалённые и добавляя новые в конец.
//   * moveToIndex(ids, id, index)             — Move existing id к указанному index с
//                                                 clamp + index-shift correction.
//   * reorderInsert(ids, movingId, insertIndex) — Insert id в position (можно move existing
//                                                   или insert new), index-shift aware.
//
// Все три функции pure — возвращают новый массив, не мутируют input.
//
// B44 path: src/components/_shared/dnd/reorderHelpers.js
// Local mirror path: components/_shared/dnd/reorderHelpers.js
// Import alias: @/components/_shared/dnd/reorderHelpers
//
// BACKLOG: #493 RF-1 batch (Bundle 6 — misc, FINAL)
// Cross-refs: Bundle 1-5 (см. getStartStage.js header)
// ============================================================

/**
 * Sync кэшированных порядковых ids с актуальным набором ids.
 * Удаляет ids которых нет в currentIds, добавляет недостающие в конец.
 *
 * @param {string[]} prevIds - Предыдущий порядок
 * @param {string[]} currentIds - Текущий набор ids (правильный множество)
 * @returns {string[]} Объединённый порядок: filtered prev + appended new
 *
 * @example
 *   syncOrderIds(['a', 'b', 'c'], ['b', 'c', 'd'])  // ['b', 'c', 'd']
 *   syncOrderIds(undefined, ['x', 'y'])             // ['x', 'y']
 */
export function syncOrderIds(prevIds, currentIds) {
  const set = new Set(currentIds);
  const filtered = (Array.isArray(prevIds) ? prevIds : []).filter((id) => set.has(id));
  const filteredSet = new Set(filtered);
  const missing = currentIds.filter((id) => !filteredSet.has(id));
  return [...filtered, ...missing];
}

/**
 * Move existing id к указанному index в массиве. Clamp index в [0, length].
 * Index-shift aware: если from < to, target index уменьшается на 1 после splice.
 *
 * @param {string[]} ids - Массив ids
 * @param {string} id - Id который двигаем
 * @param {number} index - Target index (clamp в [0, length])
 * @returns {string[]} Новый массив с перемещённым id; если id не найден — копия input
 *
 * @example
 *   moveToIndex(['a', 'b', 'c'], 'a', 2)  // ['b', 'c', 'a']
 *   moveToIndex(['a', 'b', 'c'], 'c', 0)  // ['c', 'a', 'b']
 *   moveToIndex(['a', 'b'], 'z', 0)       // ['a', 'b'] (id not found)
 */
export function moveToIndex(ids, id, index) {
  const cur = Array.isArray(ids) ? [...ids] : [];
  const from = cur.indexOf(id);
  if (from === -1) return cur;
  const clamped = Math.max(0, Math.min(Number(index ?? 0), cur.length));
  cur.splice(from, 1);
  const nextIndex = from < clamped ? clamped - 1 : clamped;
  cur.splice(nextIndex, 0, id);
  return cur;
}

/**
 * Reorder/insert id в указанную position. Если id уже в массиве — переместить;
 * если новый — вставить. NaN treated as 0.
 *
 * @param {string[]} ids - Массив ids
 * @param {string} movingId - Id который двигаем/вставляем
 * @param {number} insertIndex - Target position
 * @returns {string[]} Новый массив с обновлённым порядком
 *
 * @example
 *   reorderInsert(['a', 'b', 'c'], 'a', 2)  // ['b', 'c', 'a'] (move)
 *   reorderInsert(['a', 'b'], 'z', 1)       // ['a', 'z', 'b'] (insert new)
 */
export function reorderInsert(ids, movingId, insertIndex) {
  const cur = Array.isArray(ids) ? [...ids] : [];
  const from = cur.indexOf(movingId);
  if (from !== -1) {
    cur.splice(from, 1);
  }
  let idx = Number(insertIndex ?? 0);
  if (Number.isNaN(idx)) idx = 0;
  if (from !== -1 && from < idx) idx -= 1;
  idx = Math.max(0, Math.min(idx, cur.length));
  cur.splice(idx, 0, movingId);
  return cur;
}
