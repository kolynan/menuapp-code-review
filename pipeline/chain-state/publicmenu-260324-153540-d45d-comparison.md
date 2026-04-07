# Comparison Report — PublicMenu
Chain: publicmenu-260324-153540-d45d

## Agreed (both found)

### 1. [P2] PM-122: Detail card Dialog → Drawer (bottom sheet)
- **CC:** Replace `<Dialog>`/`<DialogContent>` with `<Drawer>`/`<DrawerContent>`, use `max-h-[88vh]`, add close chevron on photo, add drag handle (default from Drawer component). Detailed line-by-line changes (lines 3665-3729).
- **Codex:** Same diagnosis — replace Dialog with Drawer/DrawerContent using cart-style pattern, `max-h-[85vh]` to `88vh`.
- **Consensus:** Both agree on the approach. CC's patch is more detailed (includes close button JSX, sr-only DrawerTitle, sticky bottom bar, scrollable content). Use CC's implementation with `max-h-[88vh]`.
- **Confidence:** HIGH — both identify the same component swap, same lines, same pattern (CartView reference).

### 2. [P2] PM-123: Content order wrong (Price before Description)
- **CC:** Move description block (lines 3712-3716) to after title, before price. Final order: Title → Description → Price → Rating → Add button.
- **Codex:** Same diagnosis and same fix — move description to immediately after title, price/discount below description, reviews/options after price.
- **Consensus:** Identical fix. Reorder JSX: Title → Description → Price+Discount → Rating → Sticky bottom bar.
- **Confidence:** HIGH — both agree on same line references and target order.

### 3. [P2] PM-118: Discount display in detail card
- **CC:** Switch to **partner-level** discount fields (`partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`), calculate discounted price from `detailDish.price * (1 - partner.discount_percent / 100)`. Aligns with MenuView.jsx pattern (lines 100, 142, 219, 278).
- **Codex:** Rebuild with "this page's dish cards" guard pattern (`discount_enabled === true && (discount_percent ?? 0) > 0`) + `original_price` for strikethrough + `discount_percent` for badge. Wording is ambiguous on whether partner-level or per-dish fields.
- **Consensus — see Disputes below.** Both agree the current code (`detailDish.discount_enabled === true && detailDish.original_price`) is wrong and needs the standardized guard. They differ on the data source.

## CC Only (Codex missed)

### Close chevron button on photo
- **CC:** Adds a close `<button>` with `ChevronDown` (or `XIcon`) positioned absolute top-right on the photo, matching Wolt reference spec.
- **Codex:** Does not mention the close button explicitly.
- **Verdict: ACCEPTED** — the task spec requires "Chevron ˅: top-right of photo (close button)" and 44×44px touch target. This is part of the Drawer conversion (Fix 1). Include CC's close button implementation.

### Sticky bottom bar + scrollable content
- **CC:** Explicitly details: wrap content in `overflow-y-auto flex-1`, wrap add-to-cart button in `sticky bottom-0 bg-white p-4 border-t`.
- **Codex:** Mentions "action area kept at the bottom" but no specific sticky implementation.
- **Verdict: ACCEPTED** — essential for drawer UX. The add-to-cart button must be sticky at bottom.

### sr-only DrawerTitle
- **CC:** Suggests sr-only DrawerTitle (same pattern as CartView line 3423) for accessibility.
- **Codex:** Does not mention.
- **Verdict: ACCEPTED** — accessibility requirement, matches existing CartView pattern.

## Codex Only (CC missed)

### None
Codex did not identify any issues that CC missed.

## Disputes (disagree)

### Fix 3 data source: Partner-level vs Per-dish discount fields
- **CC position:** Use partner-level fields: `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`, with price calculated as `detailDish.price * (1 - partner.discount_percent / 100)`. This aligns exactly with MenuView.jsx (all 4 discount blocks use partner-level).
- **Codex position:** Use the page's guard pattern `discount_enabled === true && (discount_percent ?? 0) > 0` with per-dish `original_price` for strikethrough and `discount_percent` for badge text. References BUGS.md PM-109 fix.

**Resolution: CC's approach wins.**

Reasoning:
1. **MenuView.jsx is authoritative.** All 4 discount display blocks in MenuView.jsx (lines 100, 142, 219, 278) use `partner?.discount_enabled` and `partner?.discount_percent`. The task explicitly says "use SAME pattern as MenuView.jsx."
2. **Consistency.** If the detail card uses per-dish fields but list/tile views use partner-level fields, the same dish could show different prices in the list vs detail card — a direct UX contradiction.
3. **BUGS.md PM-109:** The fix description says it standardized to `=== true && (discount_percent ?? 0) > 0` across 5 guards (4 in MenuView, 1 in x.jsx). The x.jsx guard at line 3685 currently uses `detailDish.discount_enabled === true && detailDish.original_price` — this appears to have been overwritten or not fully aligned. The correct alignment is with MenuView's partner-level pattern.
4. **x.jsx line 2021** already defines `const discountEnabled = partner?.discount_enabled === true;` — confirming partner-level is the intended pattern in this file too.

**Final approach for Fix 3:** Use CC's partner-level implementation with the guard `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`.

## Final Fix Plan

Ordered list of all fixes to apply (all in `pages/PublicMenu/x.jsx`):

1. **[P2] PM-122: Dialog → Drawer conversion** — Source: AGREED (CC+Codex)
   - Replace `<Dialog>` with `<Drawer>`, `<DialogContent>` with `<DrawerContent className="max-h-[88vh] rounded-t-2xl overflow-hidden p-0">`
   - Replace `<DialogHeader>`/`<DialogTitle>` with sr-only `<DrawerTitle>` (CartView pattern)
   - Add close chevron button (absolute top-right on photo, ≥44×44px touch target)
   - Wrap content in scrollable container (`overflow-y-auto flex-1`)
   - Make bottom add-to-cart bar sticky (`sticky bottom-0 bg-white p-4 border-t`)
   - Close tags: `</DrawerContent></Drawer>`

2. **[P2] PM-123: Reorder content blocks** — Source: AGREED (CC+Codex)
   - Move Description block (currently after Rating, ~line 3712-3716) to immediately after Title
   - Final order: Photo → Title → Description → Price+Discount → Rating → Sticky bottom bar

3. **[P2] PM-118: Discount display alignment** — Source: CC (dispute resolved in CC's favor)
   - Replace current per-dish discount logic (line 3685-3704) with partner-level pattern
   - Guard: `partner?.discount_enabled === true && (partner?.discount_percent ?? 0) > 0`
   - Discounted price: `Math.round(detailDish.price * (1 - partner.discount_percent / 100))`
   - Show: discounted price (bold) + ~~original price~~ (strikethrough) + `-X%` badge
   - Use `partner?.discount_color || '#C92A2A'` for badge background
   - Use `partner?.primary_color || '#1A1A1A'` for price text

## Summary
- Agreed: 2 items (PM-122 Dialog→Drawer, PM-123 content reorder)
- CC only: 3 items (close button, sticky bar, sr-only title) — all 3 accepted (implementation details of Fix 1)
- Codex only: 0 items
- Disputes: 1 item (Fix 3 data source) — resolved in CC's favor (partner-level fields)
- **Total fixes to apply: 3**
