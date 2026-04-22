# Codex Writer Findings - PublicMenu Chain: publicmenu-260323-103002-0c33

## Findings
1. [P1] Android back never closes the cart or table-confirm bottom sheet - `x.jsx` still manages overlays only through React state (`drawerMode` at `x.jsx:1271`, `showTableConfirmSheet` at `x.jsx:1274`) and opens them via `setDrawerMode("cart")` / cart toggle (`x.jsx:3288`, `x.jsx:3572`) plus `setShowTableConfirmSheet(true)` (`x.jsx:2630`), but the file has no `history.pushState` or `popstate` handling. The only history mutations are URL `replaceState` calls (`x.jsx:1468`, `x.jsx:1478`, `x.jsx:1493`, `x.jsx:1889`, `x.jsx:2250`), so Android hardware Back falls through to browser navigation instead of closing the top overlay. FIX: add a top-level `useEffect` `popstate` listener in `PublicMenu`, push a history entry whenever the cart drawer or table-confirm sheet opens, and in the handler close the topmost open overlay before allowing normal navigation when no overlay is open.
2. [P3] Production error logging cleanup is still incomplete in `x.jsx` - the file still contains 11 unguarded `console.error` calls at `x.jsx:2071`, `x.jsx:2164`, `x.jsx:2413`, `x.jsx:2517`, `x.jsx:2548`, `x.jsx:2552`, `x.jsx:2894`, `x.jsx:2925`, `x.jsx:2955`, `x.jsx:2981`, and `x.jsx:3012`. None are wrapped in a development-only guard, so rating, guest-code init, rate-limit checks, loyalty side effects, submit failures, guest-name updates, and bill requests still leak internal error objects in production DevTools. `CartView.jsx` has no `console.error` occurrences, so the remaining work is all in `x.jsx`. FIX: remove each `console.error(...)` line or replace it with a silent comment inside the existing `catch` blocks without changing the surrounding control flow.

## Summary
Total: 2 findings (0 P0, 1 P1, 0 P2, 1 P3)

## Prompt Clarity (MANDATORY - do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
