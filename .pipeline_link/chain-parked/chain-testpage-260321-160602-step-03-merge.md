---
chain: testpage-260321-160602
chain_step: 3
chain_total: 3
chain_step_name: merge
page: TestPage
budget: 1.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (3/3) ===
Chain: testpage-260321-160602
Page: TestPage

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/testpage-260321-160602-comparison.md
2. Check if discussion report exists: pipeline/chain-state/testpage-260321-160602-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/TestPage/base/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/TestPage/ with fixed items
   b. Update README.md in pages/TestPage/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(TestPage): N bugs fixed via consensus chain testpage-260321-160602"
   - git push
7. Write merge report to: pipeline/chain-state/testpage-260321-160602-merge-report.md

FORMAT for merge report:
# Merge Report — TestPage
Chain: testpage-260321-160602

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# Smoke Test S155B v3 — Final verification after restart

Verifying 3 fixes after КС restart:
1. `→` instead of `>` in DONE header (fixed in v1, confirmed ✅)
2. No `N files` in step lines (fix applied, needs restart)
3. `Nk tok` instead of `0k tok` for Codex (fix applied, needs restart)

## Task

Quick review of `pages/TestPage/base/testpage.jsx`. Produce findings and commit.

```bash
git add .
git commit -m "test: smoke S155B v3 final TG format check"
git push
```

Budget: $2/step. Goal: TG format only.
=== END ===
