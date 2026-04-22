---
task_id: dish-card-ux-upgrade-s75
type: implementation
priority: P1
created: 2026-03-04
session: S75
budget: 12.00
tools: cc+codex
---

# Task: Dish Card UX Upgrade — Large Images + Discount Badge

## Git first
```
git add . && git commit -m "S75 pre-dish-card-upgrade snapshot" && git push
```

## Context

Two P1 improvements from competitor analysis (S73). Competitors Yandex Eda KZ and Wolt KZ show:
1. **Large square images** dominating the tile card (~60% of card height)
2. **Discount badge** (-X%) on the card image itself, not just in checkout

Reference: `outputs/competitor-ux-research/UX_Competitor_Analysis_S73.md`
Current dish card design: `outputs/Design_DishCards_S72.md` (already implemented in S72)

---

## Files to change

| File | Action |
|------|--------|
| `menuapp-code-review/pages/PublicMenu/260303-00 MenuView RELEASE.jsx` | Edit — main dish card file |
| `menuapp-code-review/pages/PublicMenu/PublicMenu README.md` | Update changelog |
| `menuapp-code-review/pages/PublicMenu/BUGS.md` | Update if bugs found |

> Note: x.jsx should NOT need changes (these are visual-only card changes).

---

## Change 1: Larger Images in Tile (Grid) View

### Problem
Current tile images: `h-36 sm:h-48` (144px mobile, 192px desktop). Competitors use large square images that fill ~60% of card height — "the food IS the card."

### What to do
In `renderTileCard` function in MenuView.jsx:
- **CC + Codex: first check the current image container className** — find the exact div wrapping the image
- Change image container to use `aspect-square` (1:1 ratio) instead of fixed `h-36 sm:h-48`
- This makes the image square and responsive — always fills the card width
- The `object-cover` class should remain to fill the square without distortion
- The absolute-positioned "+" button (bottom-2 right-2) should still work correctly — verify

### Expected result
Image fills the full card width as a square. On a 2-col mobile grid with ~160px card width → ~160px image height. This is ~60% of a typical card height. Comparable to Yandex Eda grid.

### What NOT to do
- Do NOT change list view (renderListCard) — only tile view
- Do NOT remove the existing "+" button overlay (from S72 design)
- Do NOT change image loading / LazyLoad logic

---

## Change 2: Discount Badge on Dish Card

### Problem
When a restaurant has QR discount enabled, the card shows no indication of a deal. Customer only discovers the discount at checkout. Competitors show "-20%" green pill prominently on the card image.

### What to do

**CC + Codex: first investigate the following before coding:**
1. What fields does the `dish` object have? Is there a `price`, `original_price`, or `discount_percent` field? Check what data is passed into `renderTileCard`.
2. Does the partner/restaurant object have a `qr_discount` percent? How is it currently used in CheckoutView? (Reference: `260303-05 CheckoutView RELEASE.jsx`)
3. How is the discounted price currently calculated? Is it `price * (1 - qr_discount/100)`?

**Based on findings, implement:**
- If dish has a discount (partner qr_discount > 0):
  - Show a green pill badge at **top-left of image**: e.g., `"-10%"` or `"QR -10%"`
  - Show **original price crossed out** in muted text + **discounted price in bold** below dish name
  - Badge style: `bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full`
  - Position: `absolute top-2 left-2` on image container (same container as "+" button)
- If no discount → show only regular price, no badge

### Important
- The discount logic must match what CheckoutView already does — use the same calculation, not a new one
- Do NOT invent a new field — use whatever discount data already flows through props/context
- If the partner qr_discount is not available in MenuView's scope → note this in RELEASE notes and suggest how to pass it down (don't block, implement what's possible)

### Expected result
On a discounted restaurant: each dish card shows a green "-X%" badge on the image (top-left) + crossed-out original price. Visually matches Yandex Eda pattern.

---

## i18n
- If a new label is needed (e.g. "QR скидка"), add to list in RELEASE notes — Arman will add via translationadmin
- Prefer using existing keys if they exist
- Likely new key: `menu.discount_badge` = "QR -{{percent}}%" / "QR -{{percent}}%" / "QR -{{percent}}%"

---

## Acceptance criteria
- [ ] Tile view: dish images are square (aspect-ratio 1:1), fill card width
- [ ] Tile view: "+" button still visible and clickable on image
- [ ] No layout break on 320px mobile
- [ ] List view: UNCHANGED
- [ ] If partner has qr_discount > 0: green badge on image (top-left) + crossed-out price visible
- [ ] Discount price matches what CheckoutView shows
- [ ] If no discount: no badge shown, regular price only
- [ ] No console errors
- [ ] CC + Codex both review before RELEASE

## Output
- RELEASE: `260304-NN MenuView RELEASE.jsx` (increment from 260303-00)
- Updated `PublicMenu README.md` with changelog entry
- List of any NEW i18n keys needed
- CC + Codex both review before RELEASE
