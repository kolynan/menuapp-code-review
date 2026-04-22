---
chain: testpage-260319-102840
chain_step: 3
chain_total: 3
chain_step_name: merge
page: TestPage
budget: 1.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (3/3) ===
Chain: testpage-260319-102840
Page: TestPage

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan from the Comparator to the actual code.

INSTRUCTIONS:
1. Read the fix plan: pipeline/chain-state/testpage-260319-102840-comparison.md
2. Read the code file: pages/TestPage/base/*.jsx
3. Apply ALL fixes from the "Final Fix Plan" section, in priority order (P0 first)
4. After applying fixes:
   a. Update BUGS.md in pages/TestPage/ with fixed items
   b. Update README.md in pages/TestPage/ if needed
5. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(TestPage): N bugs fixed via consensus chain testpage-260319-102840"
   - git push
6. Write merge report to: pipeline/chain-state/testpage-260319-102840-merge-report.md

FORMAT for merge report:
# Merge Report — TestPage
Chain: testpage-260319-102840

## Applied Fixes
1. [P0] Fix title — DONE
2. [P1] Fix title — DONE
...

## Skipped (could not apply)
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped: N fixes
- Commit: <hash>

=== TASK CONTEXT ===
Review TestPage for bugs. This is a smoke test of the consensus pipeline v4.1 with parallel writers and direct Codex runner.
=== END ===
