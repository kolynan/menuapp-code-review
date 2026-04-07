# Codex Writer Findings — PublicMenu Chain: publicmenu-260324-003210-36d5

## Findings
1. [P3] Fix 1: Detail photo is still a fixed-height rectangle, not a square — In [x.jsx](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3667) the image wrapper is `w-full h-48`, so the detail image depends on dialog width and cannot stay 1:1. This does not meet the required `aspect-square object-cover` contract. FIX: replace the top image container/classes in the detail dialog with a square aspect-ratio wrapper and keep the image as `object-cover`.
2. [P2] Fix 2: Detail discount logic is wired to partner-level fields instead of item-level discount data — In [x.jsx](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3687) the dialog checks `partner?.discount_enabled` and `partner?.discount_percent`, and the file has no `original_price` usage at all. That means the required condition `detailDish.discount_enabled === true && detailDish.original_price` is not implemented, so discounted items can still render without the required discount UI. FIX: drive the detail-price branch from `detailDish.discount_enabled === true` plus `detailDish.original_price`, and compute the percent from `Math.round((1 - detailDish.price / detailDish.original_price) * 100)`.
3. [P2] Fix 2: Detail card still misses the required discount badge and requested metadata order — The discount branch in [x.jsx](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3686) renders only discounted price plus strikethrough old price; there is no `-{percent}%` badge using `partner.discount_color`. Also the description is rendered earlier inside the header at [x.jsx](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/x.jsx#L3680), before the price/reviews block, while the required order is name → price row with badge → reviews → description. FIX: add the pill badge to the price row and move the description block below reviews without changing the Add to Cart button.
4. [P3] Fix 3: List-mode stepper overlay is still anchored bottom-right instead of centered on the photo — In [MenuView.jsx](/C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/PublicMenu/MenuView.jsx#L151) the overlay wrapper remains `absolute bottom-1 right-1 z-10`. That matches the rejected partial state described in the task, not the required centered overlay. FIX: replace the positioning wrapper with `absolute inset-0 flex items-center justify-center` and keep the existing stepper/button behavior and styling.

## Summary
Total: 4 findings (0 P0, 0 P1, 2 P2, 2 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None required for this review.
- Scope questions (anything you weren't sure if it's in scope): None.
