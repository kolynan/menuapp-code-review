# Codex Writer Findings — PublicMenu Chain: publicmenu-260329-210938-5306

## Findings
1. [P2] Fix 1 not implemented — `pages/PublicMenu/CartView.jsx:103-107` still auto-collapses only `served` when `cart.length > 0`, so `ready`, `in_progress`, and `accepted` can stay expanded and keep the `Новый заказ` section pushed below the fold. FIX: update the existing cart-driven `useEffect` to also set `ready: false`, `in_progress: false`, and `accepted: false`, while leaving `new_order` and the initial `useState` defaults unchanged.
2. [P3] Fix 2 not implemented — the two status-bucket wrappers in `pages/PublicMenu/CartView.jsx:865` and `pages/PublicMenu/CartView.jsx:912` still use `className="p-4"`, so the section headers keep the extra vertical padding the task asked to remove. FIX: change only those two status-bucket `CardContent` wrappers from `p-4` to `p-3`; do not touch the table total card or the `Новый заказ` section.
3. [P3] Fix 3 not implemented — bucket label emojis are still rendered in the scoped locations called out by the task: `pages/PublicMenu/CartView.jsx:872` still prepends `✅`, `pages/PublicMenu/CartView.jsx:919` still renders `bucketIcons[key]`, and `pages/PublicMenu/CartView.jsx:954` still prepends `🛒` to `Новый заказ`. FIX: remove those three render sites and delete `bucketIcons` only if it becomes unused; keep the review/status chips and `bucketDisplayNames` unchanged.
4. [P3] Fix 4 not implemented — the duplicate top-level `ЗАПРОСЫ ГОСТЕЙ` heading is still rendered in `pages/StaffOrdersMobile/staffordersmobile.jsx:3807-3811`, so the request list repeats information already shown by each `RequestCard`. FIX: remove only the `<h2>` block, keep the surrounding condition/container and `finalRequests.map(...)` intact, and keep the `Hand` import because it is still used elsewhere in the file.

## Summary
Total: 4 findings (0 P0, 0 P1, 1 P2, 3 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none
- Missing context (what info would have helped): none
- Scope questions (anything you weren't sure if it's in scope): none
