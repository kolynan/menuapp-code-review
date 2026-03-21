# Merge Report — PublicMenu
Chain: publicmenu-260321-140331

## Version Tag
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-140331
- Rollback: `git revert --no-commit HEAD..PublicMenu-pre-publicmenu-260321-140331`

## Applied Fixes
1. [P0] Gate hall submit on `isTableVerified` instead of `!currentTableId` — Source: Codex (X1), confirmed P0 by Discussion — DONE
2. [P1] Remove inline table verification from CartView (201 lines removed) — Source: agreed (A1) — DONE
3. [P1] Add primary CTA "Подтвердить и отправить" button to Bottom Sheet — Source: agreed (A3) — DONE
4. [P1] Use dynamic `tableCodeLength` from `partner?.table_code_length` in Bottom Sheet — Source: agreed (A2) — DONE
5. [P1] Toast on Bottom Sheet close without verification — Source: CC (C8) — DONE
6. [P2] Fix misleading "order saved" error fallback to "Не удалось отправить" — Source: Codex (X4) — DONE

## Skipped — Auto-resolved (no code change needed)
- C5 (auto-verify on full code entry): Already works via CartView's useEffect on shared `tableCodeInput` state. No duplicate useEffect needed.
- C7 (CartView table code state duplication): Resolved by A1 — inline input removed, Bottom Sheet is sole surface.
- C1 (PM-062 CategoryChips indigo): Documented in BUGS.md as B44 prompt needed. No page-side fix possible.
- C2 (clean confirmations): Informational, no fix needed.

## Skipped — Documented as New Bugs
- C3+C6 (cooldown/lockout display in Bottom Sheet): CartView cooldown logic still active via shared state, but Bottom Sheet UI doesn't show countdown. Documented as BUG-PM-069 (P2).
- C4 (Change button reset): Current behavior (clear input) is correct for Bottom Sheet context — table isn't verified yet. No state to reset.
- X5 (i18n/a11y regressions): Documented as BUG-PM-068 (P3). Out of scope.

## Skipped — Rejected
- X2 (partner lookup error handling): Out of scope, already tracked as BUG-PM-064.
- X3 (import paths): Platform architecture misunderstanding by Codex.

## Skipped — Unresolved Disputes (for Arman)
None. All disputes resolved in Discussion step.

## Skipped — Could Not Apply
None.

## Git
- Pre-fix tag: PublicMenu-pre-publicmenu-260321-140331
- Commit: b744f9a
- Files changed: 3 (x.jsx, CartView.jsx, BUGS.md)
- Insertions: 74, Deletions: 225

## Summary
- Applied: 6 fixes (1x P0, 4x P1, 1x P2)
- Skipped (auto-resolved): 4 items
- Skipped (documented as new bugs): 3 items
- Skipped (rejected): 2 items
- Skipped (unresolved): 0 disputes
- Commit: b744f9a
