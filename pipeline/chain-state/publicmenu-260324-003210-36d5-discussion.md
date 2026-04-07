# Discussion Report — PublicMenu
Chain: publicmenu-260324-003210-36d5

## Disputes Discussed
Total: 1 dispute from Comparator

## Round 1

### Dispute 1: Discount guard condition — partner-level vs item-level fields

**CC Position:**
CC originally proposed using partner-level fields (`partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`) for consistency with the existing codebase, which uses partner-level discount logic everywhere (MenuView tiles, list cards, etc.).

However, upon re-examination in this discussion step, CC **accepts the Comparator's resolution** in favor of item-level fields. The reasoning:

1. **Task spec is explicit and unambiguous** — it states `discount_enabled === true` on the item, `item.original_price` for strikethrough, and `Math.round((1 - item.price / item.original_price) * 100)` for the badge percent. The spec says to reference MenuView only for `partner.discount_color` (badge background color), not for discount logic.

2. **Item-level discount is more correct architecturally** — per-item discount fields allow different items to have different discounts, which is more flexible than a single partner-wide percent. The detail card should show the actual item's discount data.

3. **Edge case handling** — the condition `detailDish.discount_enabled === true && detailDish.original_price` naturally handles cases where `original_price` is missing (falsy → no discount UI shown), which matches the spec's fallback behavior.

**Codex Position:**
Codex was unavailable for discussion (exec timeout after 3 minutes). However, the original Codex writer findings (step 1) already argued for item-level fields, and the Comparator resolved the dispute in Codex's favor.

**Status:** RESOLVED (Round 1) — CC accepts Comparator resolution, no counter-argument.

## Resolution Summary

| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | Discount guard: partner-level vs item-level | 1 | resolved | Codex (task spec) |

## Updated Fix Plan

Based on discussion results, the disputed item is now resolved. The Merge step should use the following for the disputed fix:

1. **[P2] PM-118b — Discount guard (item-level)** — Source: CODEX (discussion-confirmed) — Change the discount condition from `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0` to `detailDish.discount_enabled === true && detailDish.original_price`. Use `detailDish.original_price` for the strikethrough price. Compute badge percent as `Math.round((1 - detailDish.price / detailDish.original_price) * 100)`. Keep `partner?.discount_color` for badge background color only.

All other items from Comparator's "Agreed" section remain unchanged:
- [P3] PM-117 — Square photo (`aspect-square` on container)
- [P2] PM-118a — Discount badge markup
- [P2] PM-118c — Layout reorder (Name → Price+discount → Reviews → Description)
- [P3] PM-115 — Stepper center (`inset-0 flex items-center justify-center`)

## Unresolved (for Arman)

None — all disputes resolved.

## Notes
- Codex CLI timed out during discussion (gpt-5.4 model, >3 min). The dispute was straightforward enough that CC accepted the Comparator's resolution unilaterally based on the clear task spec language.
