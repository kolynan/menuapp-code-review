# Codex Writer Findings — Unknown
Chain: pssk-cv-b2-b-260421-v1-260421-115645-3bb8

## Findings
1. [P1] Fix 2a still keys pending orders off `'submitted'` — `pages/PublicMenu/CartView.jsx:467`, `:887`, and `:979` still compare `(o.status || '').toLowerCase() === 'submitted'`. Base44 uses `'new'` for fresh orders, so the `pending_unconfirmed` bucket stays empty and the pending badge never appears for new orders. FIX: change all three comparisons from `'submitted'` to `'new'`.
2. [P2] Fix 2b still renders the pending bucket first — `pages/PublicMenu/CartView.jsx:1094` keeps `const bucketOrder = ['pending_unconfirmed', 'served', 'in_progress']`, which shows “Ожидает подтверждения” above “В работе” instead of below it. FIX: reorder the array so `pending_unconfirmed` renders last.
3. [P1] Fix 3 terminal screen state is not durable — the `isV8` “Ничего не ждёте” branch is still present at `pages/PublicMenu/CartView.jsx:1021-1031`, but `terminalStateShownForVersion` and `terminalVersion` have 0 hits in the file. Reloading clears the terminal-state gate because nothing is restored from or written to localStorage. FIX: add the versioned localStorage-backed state/useMemo/useEffect described in the task without changing the frozen UI copy.
4. [P1] Fix 4 flat guest cards is still unimplemented — Section 5 at `pages/PublicMenu/CartView.jsx:919-1002` still renders one wrapper card with the `otherGuestsExpanded` toggle and `tr('cart.table_orders', 'Заказы стола')`, and `guestTotal` at `:949` still sums all guest orders without `isCancelledOrder`. The UI remains grouped instead of flat, and per-guest totals stay wrong when a guest has cancelled orders. FIX: remove the wrapper accordion, render `otherGuestIdsFromOrders.map((gid) => <Card key={gid}>...)` directly, and fold `isCancelledOrder(o)` into `guestTotal`.
5. [P2] Fix 5 footer is still the old filled CTA — the no-cart footer branch at `pages/PublicMenu/CartView.jsx:1303-1310` still renders a filled button with `style={{backgroundColor: primaryColor}}`; there is no `variant="outline"`, no `cart.cta.need_help_or_bill` helper text, and no inline Bell helper row. FIX: replace this branch with the locked outline button wrapper and helper `<p>` using `tr('cart.cta.need_help_or_bill', ...)` plus `<Bell className="inline w-4 h-4 align-middle" />`.
6. [P1] Fix 6 `tableOrdersTotal` still includes cancelled orders — `pages/PublicMenu/CartView.jsx:521-530` still sums every other-guest order and never calls `isCancelledOrder`, while `renderedTableTotal` at `:533-541` already has the correct guard. The table total remains inflated by cancelled orders. FIX: add `if (isCancelledOrder(o)) return;` inside the inner loop and include `isCancelledOrder` in the memo dependency array.

## Summary
Total: 6 findings (0 P0, 4 P1, 2 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: 2
- Ambiguous Fix descriptions (list Fix # and what was unclear): None for Fixes 2-6; the ambiguity was in the workflow, not in the fix definitions.
- Missing context (what info would have helped): The prompt says the page is `Unknown` while the actual target file is `pages/PublicMenu/CartView.jsx`. It also references a 1316-line `260419-00 CartView RELEASE.jsx` baseline, but the working `pages/PublicMenu/CartView.jsx` in the repo is 1198 lines and ends with NUL bytes.
- Scope questions (anything you weren't sure if it's in scope): The prompt says “Do NOT apply fixes” but then provides a full fix-application order and acceptance checks as if this step should edit code. It also mandates `git reset --hard origin/main`, which is unsafe in the current dirty worktree.
