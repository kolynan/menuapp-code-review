// ============================================================
// DISH ENTITY HELPERS — canonical v1.0 LOCKED (S443 RF-1 Bundle 6)
// ============================================================
// Чистые helpers для работы с сущностью Dish (B44 entity).
// Currently exports: getDishCategoryIds (multi-category normalizer).
// Future: extract more dish-related helpers как они появятся в страницах.
//
// Source of truth для всего проекта. Replaces:
//   - pages/MenuDishes/menudishes.jsx:224  getDishCategoryIds (S443 verified)
//   - Future consumers: MenuManage, x.jsx (любой код, читающий dish.categories)
//
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0
//   §Bundle 6 — `_shared/entities/dish.js` (multi-cat normalizer)
//   Source: MenuDishes:228 (audit) → menudishes.jsx:224 (verified S443, drift -4)
//   Pattern P-21 (S378 NEW КП): Multi-cat dish normalization
//
// Why this helper:
//   B44 Dish entity has 3 possible representations of category membership:
//     1. dish.categories []    — primary (preferred, multi-cat support)
//     2. dish.category_ids []  — legacy (early B44 schema)
//     3. dish.category         — single category (oldest schema)
//   getDishCategoryIds normalizes к unified array. Falsy filtering предотвращает
//   undefined/null членов в результате.
//
// B44 path: src/components/_shared/entities/dish.js
// Local mirror path: components/_shared/entities/dish.js
// Import alias: @/components/_shared/entities/dish
//
// BACKLOG: #493 RF-1 batch (Bundle 6 — misc, FINAL)
// Cross-refs: Bundle 1-5 (см. getStartStage.js header)
// ============================================================

/**
 * Get ALL category IDs for a dish (handles 3 schema variations).
 *
 * Priority order:
 *   1. `dish.categories` array (primary, multi-cat) — return filtered.
 *   2. `dish.category_ids` array (legacy) — return filtered.
 *   3. `dish.category` single string — wrap in array.
 *   4. Falsy/missing — return empty array.
 *
 * @param {object|null|undefined} dish - Dish entity
 * @returns {string[]} Array of category IDs (always array, never null/undefined)
 *
 * @example
 *   getDishCategoryIds({ categories: ['cat-1', 'cat-2'] })  // ['cat-1', 'cat-2']
 *   getDishCategoryIds({ category_ids: ['cat-3'] })          // ['cat-3']
 *   getDishCategoryIds({ category: 'cat-4' })                // ['cat-4']
 *   getDishCategoryIds(null)                                  // []
 */
export function getDishCategoryIds(dish) {
  const a = dish?.categories;
  const b = dish?.category_ids;
  if (Array.isArray(a) && a.length) return a.filter(Boolean);
  if (Array.isArray(b) && b.length) return b.filter(Boolean);
  const single = dish?.category;
  return single ? [single] : [];
}

export default getDishCategoryIds;
