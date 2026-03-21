# Merge Report — PublicMenu
Chain: publicmenu-260320-141634

## Applied Fixes
1. [P0] Loyalty points deducted before order creation — Source: CC (prior commit af40d5f) — DONE
2. [P1] localStorage crash in private browsers — Source: CC (prior commit af40d5f) — DONE
3. [P2] Partial order post-create failure handling — Source: Codex — DONE (wrapped loyalty/earn/partner in try/catch)
4. [P2] Reward-email invalid format — Source: Agreed (CC+Codex) (prior commit af40d5f) — DONE
5. [P2] Submit-error subtitle misleading — Source: CC (prior commit af40d5f) — DONE
6. [P2] Hardcoded locale and currency — Source: Agreed (CC+Codex) (prior commit af40d5f) — DONE
7. [P2] loyalty_redeem_rate || vs ?? — Source: CC (prior commit af40d5f) — DONE
8. [P2] Review-reward CTA || 10 bug — Source: Codex — DONE (changed to ?? 0, gated behind active rewards)
9. [P2] Redirect-banner setTimeout leak — Source: CC (prior commit af40d5f) — DONE
10. [P2] Table-code UI overflow — Source: Agreed (CC+Codex) (prior commit af40d5f) — DONE
11. [P2] Production debug logging — Source: Agreed (CC+Codex) (prior commit af40d5f) — DONE
12. [P2] Accepted statuses / badge icons — Source: Codex — DONE (added 'accepted' fallback + icon in badges)
13. [P2] Drawer scroll reset after verification — Source: Codex — DONE (scroll-to-top on verification)
14. [P2] Guest code leaked into header — Source: Codex — DONE (gated behind hallGuestCodeEnabled)
15. [P3] Icon-only controls aria-label + touch targets — Source: Agreed (CC+Codex) (prior commit af40d5f) — DONE

## Skipped — Unresolved Disputes (for Arman)
None. All 15 items agreed.

## Skipped — Could Not Apply
None.

## Rejected by Comparator
- Codex#8: Verified-state online-order panel wastes mobile space — Rejected (intentional UX). Added to BACKLOG.

## Git
- CC writer commit (10 fixes): af40d5f
- Merge commit (5 Codex-only fixes): 22b34b0
- Files changed: 3 (CartView.jsx, x.jsx, BUGS.md)

## Summary
- Applied: 15 fixes (1 P0, 1 P1, 12 P2, 1 P3)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- Rejected: 1 item (Codex#8, intentional UX)
- Commits: af40d5f (CC writer, 10 fixes) + 22b34b0 (merge, 5 Codex fixes)
