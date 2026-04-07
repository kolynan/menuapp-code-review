# Merge Report — PublicMenu
Chain: publicmenu-260322-193959-ef26

## Applied Fixes
1. **[P2] PM-089: Price/rating text overlaps "+" FAB button horizontally** — Source: agreed (CC + Codex) — ALREADY APPLIED. The `pr-14` class was added to line 230 in the previous chain (publicmenu-260322-190827, commit 1a67b23). No additional code change needed.

## Skipped — Unresolved Disputes (for Arman)
None. No disputes in this chain.

## Skipped — Out of Scope (record in BUGS_MASTER.md)
- [P1] Hardcoded Russian fallback `|| 'Добавлено'` in add-to-cart toast (~line 369)
- [P2] Touch targets below 44px on stepper/toggle buttons (lines 163-170, 274-284, 302-323)
- [P2] No onError fallback for dish images (lines 92-97, 195-200)
- [P3] Missing aria-labels on list-mode stepper buttons (lines 150-173)

## Skipped — Could Not Apply
None.

## Git
- No new commit — fix was already applied in commit 1a67b23 (chain publicmenu-260322-190827)
- Files changed: 0

## Prompt Feedback
- CC clarity score: 5/5
- Codex clarity score: 3/5
- Fixes where writers diverged due to unclear description: None for PM-089 itself. Codex found 4 extra issues because its writer prompt said "find ALL bugs" while the task context had a SCOPE LOCK. This is a known prompt conflict.
- Fixes where description was perfect (both writers agreed immediately): PM-089 — both proposed identical `pr-14` fix with same rationale.
- Recommendation for improving task descriptions: Codex writer prompt should respect SCOPE LOCK more explicitly — add "Do NOT report issues outside the numbered Fix list" to the Codex writer template. CC writer handled scope correctly (5/5).

## Summary
- Applied: 1 fix (already present from prior chain)
- Skipped (unresolved): 0 disputes
- Skipped (out of scope): 4 findings (recorded for BUGS_MASTER.md)
- MUST-FIX not applied: 0
- Commit: N/A (fix already in 1a67b23)
