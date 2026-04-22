---
chain: testpage-260321-153104
chain_step: 3
chain_total: 3
chain_step_name: merge
page: TestPage
budget: 1.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (3/3) ===
Chain: testpage-260321-153104
Page: TestPage

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/testpage-260321-153104-comparison.md
2. Check if discussion report exists: pipeline/chain-state/testpage-260321-153104-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/TestPage/base/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
5. After applying fixes:
   a. Update BUGS.md in pages/TestPage/ with fixed items
   b. Update README.md in pages/TestPage/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(TestPage): N bugs fixed via consensus chain testpage-260321-153104"
   - git push
7. Write merge report to: pipeline/chain-state/testpage-260321-153104-merge-report.md

FORMAT for merge report:
# Merge Report — TestPage
Chain: testpage-260321-153104

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

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

=== TASK CONTEXT ===
# Smoke Test S155B — TG Message Format Verification

This is a SMOKE TEST for Telegram message format only. Not a real code review.

**Goal:** Run all 4 chain steps (cc-writer → codex-writer → comparator → merge)
so that TG messages are generated and can be verified against TG_MESSAGE_FORMAT.md v1.0.

## Task for CC-writer and Codex-writer

Look for any file in `pages/` directory. If no TestPage files exist, create a minimal
findings file with 0 findings and note that the page was not found.

Report format (save to findings file):

```
## Summary
Total: 0 findings

No files found for TestPage — smoke test complete.
```

Then do git commit:
```bash
git add .
git commit -m "test: smoke test S155B TG format check"
git push
```

## Notes

- Budget is intentionally minimal ($2/step)
- Do not spend time on deep analysis — just produce the required files quickly
- The goal is chain completion, not code quality
=== END ===
