# Merge Report — PublicMenu
Chain: publicmenu-260321-200456

## Applied Fixes
_None — no page-code fixes possible for this chain._

## Skipped — Could Not Apply

### 1. [P3] PM-062: CategoryChips active chip indigo → terracotta [MUST-FIX]

**Status:** CANNOT APPLY — requires B44 prompt, not page-code edit.

**Detailed explanation (MUST-FIX justification):**

Both CC and Codex independently confirmed (HIGH confidence):
1. `x.jsx` contains **zero** `indigo` references — grep verified.
2. `CategoryChips` is imported from `@/components/publicMenu/refactor/CategoryChips` (line 105) — a Base44 platform component outside page-code scope.
3. The prop `activeColor="#B5543A"` is **already passed** at x.jsx line 3190 — added in a prior fix attempt (Batch A+5, chain 260321-110752).
4. The `CategoryChips` component **ignores** the `activeColor` prop — the `bg-indigo-600` class is hardcoded inside the component itself.
5. This matches KB-077 and 3 prior consensus chain conclusions (chains 260321-093745, 260321-110752, 260321-195108).

**Why this MUST-FIX cannot be applied from page code:**
The indigo color class exists inside an imported B44 platform component, not in `x.jsx`. Page-level code cannot override styles of imported components without either:
- (a) A B44 prompt to modify the `CategoryChips` component to respect `activeColor` prop, OR
- (b) Inlining the entire chip renderer into `x.jsx` (high risk, breaks platform component contract)

**Recommended escalation:** Create a B44 prompt for CategoryChips to use `activeColor` prop.

## Skipped — Unresolved Disputes (for Arman)
_None — no disputes between CC and Codex._

## Skipped — Out of Scope (Codex findings, per SCOPE LOCK)
These 7 Codex findings were rejected by the Comparator as out of scope per the task's SCOPE LOCK directive. They may be valid bugs worth tracking separately:

1. [P1] Partner lookup swallows backend failures as "not found"
2. [P1] Hall StickyCartBar ignores visit lifecycle state
3. [P2] Translation fallback chain mismatch
4. [P2] Number/time formatting ignores selected language
5. [P2] Table-code sheet overflow on narrow phones
6. [P2] Table-code sheet hides retry/lockout feedback
7. [P2] StickyCartBar animation hooks missing

Recommendation: Add items #1-2 (P1) to BUGS_MASTER.md / BACKLOG.md for future chains.

## Git
- Commit: none (no code changes)
- Files changed: 0
- Pre-task HEAD: 87d289a

## Prompt Clarity
- CC clarity score: 4/5
- Codex clarity score: 2/5
- Fixes where writers diverged due to unclear description: PM-062 — task framed as a page-code fix in x.jsx, but the indigo class is in an imported platform component. This caused Codex to also search broadly and report 7 out-of-scope findings.
- Fixes where description was perfect: N/A (only 1 fix, and it was misdirected)
- Recommendation for improving task descriptions: PM-062 should be re-classified as a **B44 prompt task**, not a page-code review task. The task description says "find indigo in x.jsx and replace" but indigo does not exist in x.jsx. Future tasks should state upfront: "This requires a B44 prompt to modify the CategoryChips component." Including the 3 prior failed attempts in the description was helpful context but didn't prevent another failed attempt.

## Summary
- Applied: 0 fixes
- Skipped (unresolved): 0 disputes
- Skipped (MUST-FIX not applied): 1 — PM-062 (requires B44 prompt, detailed justification above)
- Skipped (out of scope): 7 Codex findings
- Commit: none
