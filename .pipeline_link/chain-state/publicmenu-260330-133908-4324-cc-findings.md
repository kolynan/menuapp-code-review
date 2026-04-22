# CC Writer Findings — PublicMenu
Chain: publicmenu-260330-133908-4324

## Findings

1. **[P2] Fix 1 — CV-spacing-01: Bucket headers too tall** — Lines 800 and 911 use `<CardContent className="px-3 py-2">` for bucket header cards (V8 served bucket and normal status bucket loop). The vertical padding `py-2` makes collapsed headers feel tall on mobile. **FIX:** Change `py-2` → `py-1.5` on lines 800 and 911 ONLY. Leave line 1014 (cart/new order section) unchanged at `py-2`. Confirmed: 3 matches found, line 1014 is the cart section — correctly excluded.

2. **[P2] Fix 2 — CV-spacing-02: Bell header card vertical padding** — Line 599: `<div className="bg-white rounded-lg shadow-sm border p-3 mb-4 mt-2">`. The `p-3` creates uniform 12px padding which is excessive vertically for the table info card (bell + table name + guest + chevron). **FIX:** Change `p-3` → `px-3 py-2` at line 599. Margins `mb-4 mt-2` and other classes remain unchanged.

3. **[P2] Fix 3 — CV-spacing-03: renderBucketOrders items gap** — Line 543: `<div className="space-y-1 mt-2 pt-2">` inside `renderBucketOrders`. The `mt-2 pt-2` (8px + 8px = 16px total) creates excessive gap between bucket header and the dish list when expanded. **FIX:** Change `mt-2 pt-2` → `mt-1 pt-1` at line 543. The `space-y-1` between items stays unchanged.

4. **[P2] Fix 4 — CV-spacing-04: Bottom spacer too tall** — Line 1063: `<div className="h-20" />` (80px spacer). Excessive white space at the bottom of CartView, especially with few items. **FIX:** Change `h-20` → `h-14` (56px) at line 1063. Condition `(cart.length > 0 || todayMyOrders.length > 0)` unchanged. 56px is still sufficient to clear the sticky footer.

5. **[P3] Fix 5 — PM-163: Table total floating point** — Line 774: `{formatPrice(tableTotal)}` where `tableTotal` is a prop (line 66) that arrives as a raw JS float from summing order totals. Can display values like `205.76999999999998 ₸` on desktop. **FIX:** Change `{formatPrice(tableTotal)}` → `{formatPrice(parseFloat(Number(tableTotal).toFixed(2)))}` at line 774. This matches the established pattern used elsewhere in the codebase for PM-145/PM-157 float fixes. Only 1 display usage of `tableTotal` exists (line 774).

## Summary
Total: 5 findings (0 P0, 0 P1, 4 P2, 1 P3)

All 5 fixes are confirmed as safe className/expression changes. No structural, behavioral, or state changes needed. All target lines verified via grep with exact matches.

## ⛔ Prompt Clarity
- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. All 5 fixes specify exact line numbers, exact grep patterns, exact before/after values, and explicit "do NOT change" guards.
- Missing context: None. The FROZEN UX section is comprehensive.
- Scope questions: None. SCOPE LOCK is clear — only 5 CSS className/expression changes.
