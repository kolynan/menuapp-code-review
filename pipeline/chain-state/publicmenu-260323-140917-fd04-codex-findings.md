# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-140917-fd04
## Findings
1. [P1] Fix 1 — `popOverlay()` still collapses the underlying sheet on programmatic close. In `pages/PublicMenu/x.jsx:1306-1310`, `popOverlay(name)` removes the closing sheet from `overlayStackRef` and then calls `window.history.back()` unless `isPopStateClosingRef` is already set. When the table-code sheet closes from `onOpenChange` (`pages/PublicMenu/x.jsx:3494-3498`) or after successful verification (`pages/PublicMenu/x.jsx:2144-2147`), the stack has already been mutated to `['cart']`, so the next `popstate` handler treats `cart` as the top overlay and closes it too (`pages/PublicMenu/x.jsx:2374-2394`). FIX: keep the current sheet on the stack until its matching history entry is consumed, and use a dedicated programmatic-back ref/flag so the next `popstate` is ignored for that one silent history cleanup.
2. [P2] Fix 2 — the custom add-to-cart toast still occupies the same mobile bottom region as the sticky cart bar. `MenuView.jsx` still renders the toast as a fixed element at `bottom-20` (`pages/PublicMenu/MenuView.jsx:375-378`), while the first add-to-cart also mounts `StickyCartBar` immediately afterward in `x.jsx` (`pages/PublicMenu/x.jsx:3715-3762`). On a 375px viewport this leaves the toast vulnerable to being covered by the fixed cart bar, which matches the Android "thin line" symptom instead of a fully readable 2-second toast. FIX: move the toast to a position that cannot be occluded by the sticky bar (for example top-center), or raise its bottom offset/z-index and give it a stable mobile box above the cart bar/safe area.
3. [P3] Fix 5 — the current cart-header change removes the Vaul handle/separator instead of aligning it. `DrawerContent` now applies `[&>[data-vaul-handle-hitarea]]:hidden` in `pages/PublicMenu/x.jsx:3410`, which hides the sheet handle area rather than adjusting the chevron/separator alignment. The task explicitly says not to remove the chevron or the separator, so this change sidesteps the layout issue instead of fixing it. FIX: keep the separator/handle visible and adjust the header spacing or margins in `x.jsx` so the chevron and separator line line up cleanly.

## Summary
Total: 3 findings (0 P0, 1 P1, 1 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
