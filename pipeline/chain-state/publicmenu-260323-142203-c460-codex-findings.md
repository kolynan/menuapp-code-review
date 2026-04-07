# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-142203-c460
## Findings
1. [P1] Fix 1 — programmatic table-confirm close still collapses the cart underneath. In `pages/PublicMenu/x.jsx:1306-1310`, `popOverlay(name)` removes the sheet from `overlayStackRef` before calling `window.history.back()`. That same path is used both after successful verification (`pages/PublicMenu/x.jsx:2144-2147`) and from the table-confirm drawer close handler (`pages/PublicMenu/x.jsx:3494-3498`). With `cart -> tableConfirm` open, the next `popstate` in `pages/PublicMenu/x.jsx:2374-2397` now sees `cart` as the top overlay and closes it too. FIX: add a dedicated `isProgrammaticCloseRef`, set it before the silent history cleanup, and have the `popstate` handler short-circuit/reset that flag so only the closing sheet consumes its own history entry.
2. [P2] Fix 2 — the custom add-to-cart toast still misses the requested acceptance contract. `pages/PublicMenu/MenuView.jsx:57-63` dismisses it after 1500ms, and `pages/PublicMenu/MenuView.jsx:375-378` renders it with `z-50` and fallback copy `t('menu.added_to_cart', 'Добавлено')` instead of the requested readable 2-second toast text "Добавлено в корзину" above all overlays. FIX: keep the existing custom toast, but change it to about 2000ms, use the full fallback copy, and raise the container to a guaranteed overlay layer such as `z-[200]` with the intended fixed mobile positioning.

## Summary
Total: 2 findings (0 P0, 1 P1, 1 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 8 pointed to `x.jsx`, but the current target file only imports `ChevronDown` and does not render the cart header controls there, so the exact in-scope UI location was slightly stale.
- Missing context (what info would have helped): A precise screenshot or DOM target for the Android "thin line" toast would have made Fix 2 easier to validate from code alone.
- Scope questions (anything you weren't sure if it's in scope): The top instructions said to read only target files plus `README.md`/`BUGS.md`, while the task block also listed `CartView.jsx` and `CheckoutView.jsx` as context files. I followed the stricter top-level scope and did not read them.
