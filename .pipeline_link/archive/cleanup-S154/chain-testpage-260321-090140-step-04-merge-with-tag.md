---
chain: testpage-260321-090140
chain_step: 4
chain_total: 4
chain_step_name: merge-with-tag
page: TestPage
budget: 1.50
runner: cc
type: code-review
---
=== CHAIN STEP: Merge with Versioning (4/4) ===
Chain: testpage-260321-090140
Page: TestPage

You are the Merge step in a modular consensus pipeline.
Your job: create a safe version tag, then apply the fix plan to the actual code.

INSTRUCTIONS:

## Phase 1 — Version tag (safety checkpoint)
1. Create a git tag BEFORE any code changes:
   - git tag "TestPage-pre-testpage-260321-090140" -m "Pre-fix checkpoint for chain testpage-260321-090140"
   - git push origin "TestPage-pre-testpage-260321-090140"
   - This allows instant rollback: `git revert --no-commit HEAD..TestPage-pre-testpage-260321-090140`

## Phase 2 — Apply fixes
2. Read the comparison: pipeline/chain-state/testpage-260321-090140-comparison.md
3. Check if discussion report exists: pipeline/chain-state/testpage-260321-090140-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
4. Read the code file: pages/TestPage/base/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
6. After applying fixes:
   a. Update BUGS.md in pages/TestPage/ with fixed items
   b. Update README.md in pages/TestPage/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(TestPage): N bugs fixed via consensus chain testpage-260321-090140"
   - git push

## Phase 3 — Merge report
8. Write merge report to: pipeline/chain-state/testpage-260321-090140-merge-report.md

FORMAT for merge report:
# Merge Report — TestPage
Chain: testpage-260321-090140

## Version Tag
- Pre-fix tag: TestPage-pre-testpage-260321-090140
- Rollback: `git revert --no-commit HEAD..TestPage-pre-testpage-260321-090140`

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Pre-fix tag: <tag>
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

=== TASK CONTEXT ===
Review TestPage code in pages/TestPage/base/.
Focus on: React best practices, UX bugs, Performance.
Update BUGS.md and README.md.
git commit and push at the end.
=== END ===
