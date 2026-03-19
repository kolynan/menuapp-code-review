# Merge Report — PublicMenu
Chain: publicmenu-260320-004325

## Applied Fixes
1. [P0] Guard Drawer onOpenChange — block close during isSubmitting — Source: CC only — x.jsx:3270 — DONE
2. [P0] Add `dismissible={!isSubmitting}` to Drawer — Source: CC only — x.jsx:3268 — DONE
3. [P0] Guard CartView close button with isSubmitting check + disabled attr — Source: agreed (CC+Codex) — CartView.jsx:464-466 — DONE
4. [P1] Guard StickyCartBar toggle — prevent close during submission — Source: CC only — x.jsx:3432 — DONE
5. [P2] Visual disabled state on close button (greyed out, cursor-not-allowed) — Source: CC only — CartView.jsx:464-466 — DONE

## Skipped — Unresolved Disputes (for Arman)
None — no unresolved disputes.

## Skipped — Could Not Apply
None — all 5 fixes applied successfully.

## Skipped — Out of Scope (Codex-only findings)
16 additional bugs found by Codex (loyalty panel, failed rating, table code retry, review reward, status UI, formatting, accessibility, etc.) were excluded per Rule F4 (fix only what is asked). These are already tracked in BUGS.md (BUG-PM-026 through BUG-PM-040+).

## Git
- Pre-task commit: 82c81f9
- Fix commit: 9aae02e
- Files changed: 2 (CartView.jsx, x.jsx)
- Lines changed: +8 / -5

## Summary
- Applied: 5 fixes (3x P0, 1x P1, 1x P2)
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- Skipped (out of scope): 16 Codex findings
- Commit: 9aae02e
