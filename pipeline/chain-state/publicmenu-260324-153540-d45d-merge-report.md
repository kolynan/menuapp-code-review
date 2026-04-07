# Merge Report — PublicMenu
Chain: publicmenu-260324-153540-d45d

## Applied Fixes
1. [P2] PM-122: Detail card Dialog → Drawer (bottom sheet) — Source: agreed (CC+Codex) — DONE
   - Replaced `<Dialog>` with `<Drawer>`, `<DialogContent>` with `<DrawerContent className="max-h-[88vh] rounded-t-2xl overflow-hidden p-0">`
   - Added sr-only `<DrawerTitle>` for accessibility (CartView pattern)
   - Added close chevron button (ChevronDown, absolute top-right on photo, 44×44px touch target, bg-black/40)
   - Added `ChevronDown` to lucide-react imports
   - Wrapped content in scrollable `overflow-y-auto flex-1` container
   - Made bottom add-to-cart bar sticky (`sticky bottom-0 bg-white p-4 border-t`)

2. [P2] PM-123: Reorder content blocks — Source: agreed (CC+Codex) — DONE
   - Reordered JSX: Photo → Title → Description → Price+Discount → Rating → Sticky bottom bar
   - Previously: Title → Price → Rating → Description → Button (inline)

3. [P2] PM-118: Discount display aligned to partner-level — Source: discussion-resolved (CC wins) — DONE
   - Guard: `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`
   - Discounted price: `Math.round(detailDish.price * (1 - partner.discount_percent / 100))`
   - Strikethrough: `detailDish.price` (the base/original price)
   - Badge: `-{partner.discount_percent}%` with `partner?.discount_color || '#C92A2A'`
   - Replaced per-dish outlier pattern (`detailDish.discount_enabled && detailDish.original_price`)

## Skipped — Unresolved Disputes (for Arman)
None — the single dispute (Fix 3 data source) was resolved in discussion.

## Skipped — Could Not Apply
None.

## Git
- Pre-task commit: e174c7c
- Commit: 98f67d0
- Files changed: 1 (pages/PublicMenu/x.jsx)
- Lines: 3788 → 3803 (+15 lines)
- Pushed to remote: yes

## BUGS.md
- Updated: PM-122, PM-123, PM-118 added to Fixed section as FIX-CHAIN-d45d

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 3/5
- Fixes where writers diverged due to unclear description:
  - Fix 3 (PM-118): Task spec listed per-dish field names (`item.discount_enabled`, `item.discount_percent`, `item.original_price`) but also said "use SAME pattern as MenuView.jsx" which uses partner-level fields. Both writers caught this contradiction; CC resolved correctly by following MenuView.jsx.
  - Fix 2 (PM-123): Task mentions "stepper + Add button" in sticky bar, but current code only has a single Add button (no stepper). Codex flagged this ambiguity.
- Fixes where description was perfect (both writers agreed immediately):
  - Fix 1 (PM-122): Dialog → Drawer conversion was unambiguous. Both writers identified the same component swap, same lines, same CartView reference pattern.
- Recommendation for improving task descriptions:
  - For discount-related fixes: always specify the exact field prefix (`partner?.` vs `item.`/`detailDish.`) — don't mix them in the same description.
  - When referencing UI elements (stepper, bottom bar), confirm whether they currently exist or need to be created.

## Summary
- Applied: 3 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: 98f67d0
