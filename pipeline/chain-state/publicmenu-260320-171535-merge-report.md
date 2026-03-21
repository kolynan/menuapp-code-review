# Merge Report — PublicMenu
Chain: publicmenu-260320-171535
Task: PM-041 — Polling timer leak in useTableSession (P0)

## Applied Fixes
1. [P0] PM-041: Polling timer leak — double guard in `scheduleNext` — Source: agreed (CC+Codex) — DONE
2. [P2] NEW-01: Stale closure — add `partner?.id`, `currentTableId` to polling deps — Source: CC only — DONE
3. [P2] NEW-02: Infinite retry loop — don't reset `didAttemptRestoreRef` on error — Source: CC only — DONE
4. [P3] NEW-03: Fire-and-forget `closeExpiredSessionInDB` — add await — Source: CC only — DONE
5. [P3] NEW-04: Remove `console.warn` in production code — Source: CC only — DONE

## Skipped — Unresolved Disputes (for Arman)
None — all items resolved.

## Skipped — Could Not Apply
None.

## Out-of-Scope Findings (for future tasks)
- Codex [P1]: Pickup/delivery checkout regressed to fullscreen instead of drawer (x.jsx)
- Codex [P2]: Verified-table block duplicates header (CartView.jsx)
- Codex [P2]: Partner mobile grid setting ignored (MenuView.jsx)
- Codex [P2]: Mobile icon controls too small/unlabeled (multiple files)
- Codex [P2]: Submit-error fallback text misleading (CartView.jsx)
- Codex [P3]: Reward-email microcopy bypasses i18n (CartView.jsx)

## Git
- Pre-task commit: 22b34b0
- Commit: 91b5bab
- Files changed: 2 (useTableSession.jsx, BUGS.md)

## Size Check
- useTableSession.jsx: 837 → 838 lines (+1 from added guard)

## Summary
- Applied: 5 fixes (1 P0, 2 P2, 2 P3)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- Out-of-scope (future): 6 findings (1 P1, 4 P2, 1 P3)
- Commit: 91b5bab
