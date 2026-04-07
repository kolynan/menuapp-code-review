# Comparison Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

## Agreed (both found)

### 1. [P3] PM-117: Detail card photo not square
- **CC:** Change container from `w-full h-48` to `w-full aspect-square bg-slate-100`. Image already has `object-cover`.
- **Codex:** Same — replace `w-full h-48` with `aspect-square object-cover` wrapper.
- **Verdict:** ✅ Full agreement. Change `h-48` → `aspect-square` on container at ~line 3667 in x.jsx.

### 2. [P2] PM-118: Detail card missing discount badge
- **CC:** Found missing `-X%` badge. Proposes adding badge with `partner.discount_color` background.
- **Codex:** Same finding (item 3) — no badge rendered, need pill badge with `partner.discount_color`.
- **Verdict:** ✅ Full agreement on missing badge. Both propose same badge markup.

### 3. [P2] PM-118: Detail card layout order wrong
- **CC:** Current order: Name → Description → Price → Reviews. Spec requires: Name → Price+discount → Reviews → Description.
- **Codex:** Same finding — description at line ~3680 comes before price/reviews, needs reorder.
- **Verdict:** ✅ Full agreement. Move description below reviews.

### 4. [P3] PM-115: List-mode stepper position bottom-right → center
- **CC:** Change `absolute bottom-1 right-1 z-10` → `absolute inset-0 flex items-center justify-center z-10` at MenuView.jsx line 151.
- **Codex:** Same fix — identical classes proposed.
- **Verdict:** ✅ Full agreement. Exact same CSS change.

## CC Only (Codex missed)

None — both found all 3 bug areas.

## Codex Only (CC missed)

### 5. [P2] PM-118: Discount data source — item-level vs partner-level
- **Codex (item 2):** Points out the code currently uses `partner?.discount_enabled` and `partner?.discount_percent` but the task spec requires item-level `detailDish.discount_enabled === true` + `detailDish.original_price`. Codex says the condition should be driven from item-level fields, with percent computed as `Math.round((1 - detailDish.price / detailDish.original_price) * 100)`.
- **CC noted this ambiguity** but chose to follow existing codebase pattern (partner-level), with fallback to `partner.discount_percent` for badge text.
- **Evaluation:** The task spec is explicit: check `discount_enabled === true` on the item, use `item.original_price`. The task context says _"Check how discount_color is accessed in MenuView.jsx for reference"_ — this refers only to the color, not the discount logic source. The task clearly states per-item fields. **Codex is correct.**
- **Verdict:** ✅ ACCEPTED. Use item-level `detailDish.discount_enabled === true` and `detailDish.original_price` for the condition and percent calculation. Use `partner.discount_color` only for the badge background color (as specified).

## Disputes (disagree)

### Dispute 1: Discount guard condition
- **CC:** Keep `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` for consistency with existing codebase.
- **Codex:** Use `detailDish.discount_enabled === true && detailDish.original_price` per task spec.
- **Resolution:** Task spec is the authority for this fix. The spec explicitly says:
  - Condition: `discount_enabled === true` (on item)
  - Percent: `Math.round((1 - item.price / item.original_price) * 100)`
  - When `discount_enabled !== true` OR no `original_price`: show only regular price
  - The existing partner-level pattern in the codebase is a separate concern
- **Winner: Codex.** Use item-level fields as specified.

## Final Fix Plan

1. **[P3] PM-117 — Square photo** — Source: AGREED — In x.jsx ~line 3667, change image container class from `w-full h-48 bg-slate-100` to `w-full aspect-square bg-slate-100`. Image `<img>` keeps `object-cover`.

2. **[P2] PM-118a — Discount badge** — Source: AGREED — In x.jsx detail card price section (~lines 3686-3700), add a discount badge pill: `<span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: partner?.discount_color || '#C92A2A' }}>-{Math.round((1 - detailDish.price / detailDish.original_price) * 100)}%</span>` after the price spans.

3. **[P2] PM-118b — Discount guard (item-level)** — Source: CODEX — Change the discount condition from `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` to `detailDish.discount_enabled === true && detailDish.original_price`. Use `detailDish.original_price` for the strikethrough price and percent calculation. Keep `partner?.discount_color` for badge background color.

4. **[P2] PM-118c — Layout reorder** — Source: AGREED — Reorder detail card content: Name → Price+discount+badge → Reviews → Description. Move description (currently inside DialogHeader before price) to after reviews section.

5. **[P3] PM-115 — Stepper center** — Source: AGREED — In MenuView.jsx line 151, change stepper container from `absolute bottom-1 right-1 z-10` to `absolute inset-0 flex items-center justify-center z-10`. Keep `onClick={(e) => e.stopPropagation()}`.

## Summary
- Agreed: 4 items (PM-117 photo, PM-118 badge, PM-118 layout order, PM-115 stepper)
- CC only: 0 items
- Codex only: 1 item (item-level discount guard) — 1 accepted, 0 rejected
- Disputes: 1 item (discount guard condition) — resolved in favor of Codex/task spec
- **Total fixes to apply: 5** (across 3 bug IDs, 2 files)
