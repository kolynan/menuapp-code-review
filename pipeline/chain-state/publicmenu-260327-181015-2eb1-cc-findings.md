# CC Writer Findings — PublicMenu
Chain: publicmenu-260327-181015-2eb1

## Findings

1. **[P2] Fix 1 — PM-119: Discounted price uses Math.round, wrong formatter (MenuView.jsx line 103)**
   In `renderListCard`, discounted price is calculated as `formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100)`. The `Math.round` causes the result to display as integer (e.g. `30 ₸`) while original price shows decimals (e.g. `32.01 ₸`). FIX: Remove `Math.round` wrapping — replace with `formatPrice(dish.price * (1 - partner.discount_percent / 100))`. Let `formatPrice` (which uses toFixed(2) + thousands separator) handle formatting.

2. **[P2] Fix 1 — PM-119: Same Math.round issue in tile card (MenuView.jsx line 281)**
   In `renderTileCard`, identical pattern: `formatPrice(Math.round(dish.price * (1 - partner.discount_percent / 100) * 100) / 100)`. Same mismatch with original price format. FIX: Same as finding #1 — replace with `formatPrice(dish.price * (1 - partner.discount_percent / 100))`.

3. **[P2] Fix 1 — PM-119: Same Math.round issue in detail card drawer (x.jsx line 3893)**
   In the detail card drawer, `formatPrice(Math.round(detailDish.price * (1 - partner.discount_percent / 100) * 100) / 100)`. Same format mismatch. FIX: Replace with `formatPrice(detailDish.price * (1 - partner.discount_percent / 100))`.

4. **[P2] Fix 2 — PM-132: List mode stepper buttons 36px, below 44px minimum (MenuView.jsx lines 156-178)**
   In `renderListCard`, 4 elements use `w-9 h-9` (36px) instead of required 44px minimum touch target:
   - Line 156: main "+" button → `w-9 h-9`
   - Line 164: stepper pill container → `h-9 px-1`
   - Line 168: "−" button → `w-9 h-9`
   - Line 178: "+" button → `w-9 h-9`
   FIX: Change `w-9 h-9` to `w-11 h-11` on lines 156, 168, 178. Change `h-9 px-1` to `h-11 px-1.5` on line 164. This matches tile mode stepper (which already uses `w-11 h-11`).

5. **[P3] Fix 3 — PM-147: List mode description truncated to 1 line (MenuView.jsx line 96)**
   In `renderListCard`, dish description uses `line-clamp-1` — too restrictive for RU/KK text. FIX: Change `line-clamp-1` to `line-clamp-2` on line 96. One-character change.

6. **[P3] Fix 4 — PM-124: Detail card missing star icon next to rating (x.jsx lines 3911-3915)**
   The rating block in detail card uses raw spans (`avg.toFixed(1)` + count) without any star icon, while list/tile mode uses `<DishRating>` component which includes a star. `DishRating` is NOT currently imported in x.jsx. FIX: (a) Add `import DishRating from "@/components/publicMenu/DishRating";` near line 100 (after existing imports). (b) Replace lines 3911-3915 raw rating block with `<DishRating avgRating={dishRatings[detailDish.id]?.avg} reviewCount={dishRatings[detailDish.id]?.count} />`. Note: the existing `import Rating from "@/components/Rating"` (line 94) is a DIFFERENT component — must NOT be touched.

## Summary
Total: 6 findings (0 P0, 0 P1, 3 P2, 2 P3 — noting Fix 1 spans 3 locations)

All findings correspond strictly to Fix 1–4 from the task. No out-of-scope issues reported.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. All 4 fixes had exact line numbers, code patterns, and expected behavior.
- Missing context: None. File paths, variable names, and FROZEN elements all clearly specified.
- Scope questions: None. SCOPE LOCK and FROZEN UX sections were comprehensive. The separation of `Rating` vs `DishRating` imports was explicitly called out, preventing a common confusion.
