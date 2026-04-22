# Codex Writer Findings — PublicMenu
Chain: publicmenu-260321-173134

## Findings
1. [P3] PM-062 is outside `x.jsx` page code — `x.jsx` already passes `activeColor="#B5543A"` into `<CategoryChips />` at `x.jsx:3181-3188`, and `BUGS.md:64-68` already documents that the imported `CategoryChips` component ignores that prop. Another page-only patch here will be a no-op, so the active chip will stay indigo. FIX: change the active-state styling inside `@/components/publicMenu/refactor/CategoryChips` (B44/component prompt), not in `x.jsx`.
2. [P1] Partner lookup hides real backend failures as “restaurant not found” — the partner query in `x.jsx:1322-1345` catches both lookup attempts and returns `null`, then the page renders `t('error.partner_not_found')` at `x.jsx:3035-3040`. Network/API failures are therefore misreported as a bad QR link. FIX: let transport/backend errors reach React Query, keep “not found” only for an empty successful lookup, and render retryable error UI for query errors.
3. [P1] Order-status screen collapses fetch failures into “check the link” — `OrderStatusScreen` exposes `orderError` from React Query at `x.jsx:892-905`, but the render path merges `orderError || !order` into the same not-found state at `x.jsx:1030-1040`. A temporary backend failure tells the guest the token/link is invalid. FIX: split `orderError` from `!order`; show a retryable fetch-error state for query failures and reserve `order_status.not_found` for a successful empty lookup.
4. [P2] Production `console.error` calls remain in guest flows — `x.jsx` still logs directly to the console in multiple runtime paths (`x.jsx:1530, 2066, 2159, 2408, 2512, 2543, 2547, 2887, 2918, 2948, 2974, 3005`). This leaves internal failure detail in production and repeats a class of issue already called out in `README.md:40`. FIX: remove direct console logging from page code or replace it with a centralized telemetry/logger path that is safe for production.
5. [P3] No-op hook left in production as a hook-order placeholder — `useEffect(() => {}, [])` at `x.jsx:2313-2314` has no behavior and encodes a React anti-pattern instead of fixing structure. It adds noise and makes future hook-order regressions easier to hide. FIX: delete the placeholder effect; if hook ordering was previously conditional, move the branching into child components or unconditional hooks with real logic.

## Summary
Total: 5 findings (0 P0, 2 P1, 1 P2, 2 P3)

## Prompt Clarity
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): Fix 1 — `pages/PublicMenu/base/*.jsx` matches multiple files, but the prompt also says “ONLY these 3 files” and the task context points specifically to `x.jsx`.
- Missing context (what info would have helped): It would help to say explicitly whether already-tracked bugs from `BUGS.md` should be re-reported when still present in `x.jsx`, or whether only newly observed issues should be listed.
- Scope questions (anything you weren't sure if it's in scope): The prompt says “Find ALL bugs” but the embedded task context is a single-fix PM-062 scope lock. It was also unclear whether an out-of-file root cause (`CategoryChips`) should be reported when the page file already passes the prop correctly.
