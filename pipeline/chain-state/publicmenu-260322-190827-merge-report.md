# Merge Report — PublicMenu
Chain: publicmenu-260322-190827

## Applied Fixes
1. [P2] PM-089: Add `pr-14` to tile card price container (line 230) — Source: CC (confirmed by Comparator, no disputes) — DONE

## Skipped — PM-062 (requires B44 prompt)
- PM-062: CategoryChips uses indigo instead of primaryColor — Both CC and Codex confirmed `indigo` is NOT in MenuView.jsx. CategoryChips is an imported B44 component. Already tracked as BUG-PM-062 in BUGS.md (Active).

## Skipped — Out of Scope (valid findings, recorded for future)
- PM-091: Hardcoded toast fallback `|| 'Добавлено'` (P1, i18n) — Codex finding, out of scope per SCOPE LOCK
- PM-092: Stepper touch targets below 44px (P2, mobile UX) — Codex finding, out of scope
- PM-093: Toggle button touch targets below 44px (P2, mobile UX) — Codex finding, out of scope
- PM-094: List-mode buttons missing aria-labels (P3, a11y) — Codex finding, out of scope
- PM-095: No onError fallback for broken images (P3, resilience) — Codex finding, out of scope

## Skipped — Unresolved Disputes (for Arman)
None. All disputes resolved by Comparator.

## Skipped — Could Not Apply
None.

## MUST-FIX Status
- PM-062 [MUST-FIX]: CANNOT apply — indigo classes are in the imported CategoryChips component, not in MenuView.jsx. Both CC and Codex independently confirmed this. Requires a B44 prompt to fix the component itself. Already documented in BUGS.md as BUG-PM-062.
- PM-089 [MUST-FIX]: APPLIED — `pr-14` added to prevent horizontal overlap.

## Git
- Commit: 1a67b23
- Files changed: 2 (MenuView.jsx, BUGS.md)

## Prompt Feedback
- CC clarity score: 2/5
- Codex clarity score: 3/5
- Fixes where writers diverged due to unclear description:
  - Fix 1 (PM-062): Both writers agreed the task misdirected them to MenuView.jsx. The `indigo` classes are in the imported CategoryChips component, not in the page file. Task description should have specified the correct file or noted it's a B44 component issue.
  - Fix 2 (PM-089): Codex thought the issue was already fixed (pb-14 exists) while CC identified the remaining horizontal overlap. The task description said "overlaps" but didn't specify vertical vs horizontal — CC's deeper analysis caught the real gap.
- Fixes where description was perfect: None — both fixes had clarity issues.
- Recommendation for improving task descriptions:
  1. Before writing a fix task, grep the target file for the symptom (e.g., `grep indigo MenuView.jsx`) to confirm the issue is actually in that file.
  2. For overlap/spacing bugs, specify the axis (horizontal vs vertical) and include a screenshot or exact CSS classes involved.

## Summary
- Applied: 1 fix
- Skipped (PM-062 — B44 prompt needed): 1
- Skipped (out of scope): 5 findings (recorded for BUGS_MASTER.md)
- Skipped (unresolved disputes): 0
- MUST-FIX not applied: 1 (PM-062 — not in target file, requires B44 prompt)
- Commit: 1a67b23
