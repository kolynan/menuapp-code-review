// ============================================================
// GET LINK ID — canonical v1.5 LOCKED (S388 Final Synth)
// ============================================================
// Source of truth для всего проекта. Replaces:
//   - partnertables:110  (canonical S342, .id/_id/value, type-validates)
//   - SOM:559           (similar; nested object truncated mid-impl)
//   - x.jsx:1417        (most complete — handles nested 2-level)
//
// Canonical chosen: x.jsx version (most complete — handles nested
// `field.value.id` and `field.value._id` cases).
//
// Normalizes B44 link fields which can be:
//   - null/undefined          → null
//   - string ID               → "abc123"
//   - number                  → "42"
//   - { id: "abc" }           → "abc"
//   - { _id: "abc" }          → "abc"
//   - { value: "abc" }        → "abc"
//   - { value: { id: "abc"}}  → "abc"      (nested 2-level)
//   - { value: { _id: "abc"}} → "abc"      (nested 2-level)
//   - any other shape         → null
//
// B44 path: src/components/_shared/utils/getLinkId.js
// Local mirror path: components/_shared/utils/getLinkId.js
// Import alias: @/components/_shared/utils/getLinkId
//
// BACKLOG: #493 RF-1 batch (Bundle 3 — generic utils)
// Audit ref: outputs/permanent/Pre_Release_Refactor_Audit.md v2.0 §Final Synth Bundle 3

/**
 * Extract a string ID from a B44 link field of any common shape.
 * Returns null for null/undefined/non-id-like input (never throws).
 *
 * @param {*} field - B44 link field (string/number/object/null).
 * @returns {string|null} String ID or null if not extractable.
 */
export function getLinkId(field) {
  if (field == null) return null;

  if (typeof field === "string" || typeof field === "number") {
    return String(field);
  }

  if (typeof field === "object") {
    const v = field.id ?? field._id ?? field.value ?? null;

    if (typeof v === "string" || typeof v === "number") return String(v);

    if (v && typeof v === "object") {
      const vv = v.id ?? v._id ?? null;
      if (typeof vv === "string" || typeof vv === "number") return String(vv);
    }
  }

  return null;
}
