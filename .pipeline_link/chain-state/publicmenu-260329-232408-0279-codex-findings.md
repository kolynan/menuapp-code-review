# Codex Writer Findings — PublicMenu Chain: publicmenu-260329-232408-0279

## Findings
1. [P2] Fix 1 banners still render at drawer top level — `shouldShowReviewRewardHint` and `shouldShowReviewRewardNudge` are still mounted directly under the drawer header in `pages/PublicMenu/CartView.jsx:671` and `pages/PublicMenu/CartView.jsx:680`, while both served bucket render paths still jump straight from the header button to `renderBucketOrders(...)` at `pages/PublicMenu/CartView.jsx:895` and `pages/PublicMenu/CartView.jsx:942`. This leaves the banners outside the "Подано" section and independent of `expandedStatuses.served`. FIX: remove the two top-level banner blocks and render them only inside the served bucket, immediately after the header button and only when `expandedStatuses.served === true` in both served render branches.
2. [P3] Fix 2 collapsed bucket header padding is still unchanged — the bucket header wrappers still use `CardContent className="p-3"` in both served-only and normal bucket rendering at `pages/PublicMenu/CartView.jsx:868` and `pages/PublicMenu/CartView.jsx:914`, so collapsed headers keep the old 12px vertical padding. FIX: change the bucket header `CardContent` padding to `px-3 py-2` and keep expanded-body spacing separate from the header.
3. [P3] Fix 3 new-order spacing is only partially applied — the footer zone already has `border-t border-slate-200` at `pages/PublicMenu/CartView.jsx:1015`, but the "Новый заказ" card container is still `<Card className="mb-2">` at `pages/PublicMenu/CartView.jsx:951`, so the extra separation above the submit footer is still missing for short carts. FIX: change only the new-order card container margin to `mb-4`.
4. [P3] Fix 4 expanded bucket content still uses the old loose gap — `renderBucketOrders()` still returns `<div className="space-y-1 mt-3 pt-3">` at `pages/PublicMenu/CartView.jsx:543`, so expanded buckets still insert the old header-to-item spacing instead of the requested `pt-2 px-3 pb-3` body padding. FIX: move expanded bucket content into a wrapper with `pt-2 px-3 pb-3` and remove the extra `mt-3 pt-3` top spacing.
5. [P3] Fix 5 "all rated" accent chip still uses emoji — both served header code paths still render `<span className="ml-1 text-xs text-green-600">✅</span>` at `pages/PublicMenu/CartView.jsx:880` and `pages/PublicMenu/CartView.jsx:927` instead of the requested "Оценено" text chip. FIX: replace both emoji spans with a text chip such as `<span className="ml-1 text-xs text-green-600 font-medium">{tr('review.all_rated', 'Оценено')}</span>`.

## Summary
Total: 5 findings (0 P0, 0 P1, 1 P2, 4 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): None.
