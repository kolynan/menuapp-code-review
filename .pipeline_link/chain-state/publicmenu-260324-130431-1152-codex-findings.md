# Codex Writer Findings — PublicMenu Chain: publicmenu-260324-130431-1152
## Findings
1. [P3] Custom CartView drag handle is still present — `pages/PublicMenu/CartView.jsx:428` still renders a custom gray handle (`<div className="w-12 h-1.5 bg-gray-300 rounded-full" />`) in the sticky header, while `pages/PublicMenu/x.jsx:3422` still uses the normal `DrawerContent`, so the native B44 handle remains too. That leaves PM-121 unfixed and the drawer can still show two gray strips. FIX: Remove only the custom handle div from `CartView.jsx` and keep the native B44 handle.
2. [P2] Floating-point math is still raw in cart subtotal and total paths — `pages/PublicMenu/CartView.jsx:800` still renders `formatPrice(item.price * item.quantity)`, and `pages/PublicMenu/x.jsx:2001` still computes `cartTotalAmount` from unrounded `item.price * item.quantity`. `pages/PublicMenu/x.jsx:2588` and `pages/PublicMenu/x.jsx:2967` also persist raw `line_total` values, so binary float noise is still preserved in the underlying numbers. FIX: Introduce a shared rounded line-total helper, for example `Math.round(Number(price) * Number(quantity) * 100) / 100`, and use it for the CartView line subtotal, the `cartTotalAmount` reduce, and the `line_total` payloads before formatting/display.

## Summary
Total: 2 findings (0 P0, 0 P1, 1 P2, 1 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 2 is internally inconsistent with the frozen UX: the frozen block says chevron size must stay `w-7 h-7`, but Fix 2 says do not change it from `w-9 h-9`. Fix 2 also asks for native-handle-only after Fix 1, while still describing a same-row centered handle + right chevron layout that normally depends on a custom header handle.
- Missing context (what info would have helped): The task references `BUGS_MASTER.md` and `ux-concepts/ACCEPTANCE_CRITERIA_PublicMenu.md`, but the speed rule also says not to read outside the page folder, so it was unclear whether those references were mandatory or informational only.
- Scope questions (anything you weren't sure if it's in scope): For Fix 3, it was unclear whether review should cover only the cart display math or also the raw `line_total` writes in `x.jsx`; I treated the raw `line_total` writes as in scope because the task explicitly says to fix the underlying number, not only the rendered string.
