---
task_id: som-merge-only-260407
chain_template: none
budget: 10
agent: cc
page: StaffOrdersMobile
---
=== STANDALONE MERGE: StaffOrdersMobile ===
Chain: staffordersmobile-260407-132533-b0c8

You are the Merge step. Previous chain b0c8 completed steps 1-4 (cc-writer, codex-writer, comparator, discussion) successfully. Only merge failed (budget exceeded). Apply the fix plan now.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-comparison.md
2. Read the discussion report: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-discussion.md
   - If it has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP, note in report
3. **File integrity check (KB-121 prevention):**
   Run: `wc -l pages/StaffOrdersMobile/*.jsx`
   If result differs by 200+ lines from expected (4389) →
     run `git fetch origin && git reset --hard origin/main` then verify again.
   If still wrong → STOP and explain in merge report. Do NOT apply to truncated file.
4. Read the code file: pages/StaffOrdersMobile/staffordersmobile.jsx
5. Apply ALL fixes from the fix plan, P0 first.
   - Agreed items: always apply
   - Discussion-resolved: apply winning solution
   - Unresolved disputes: SKIP (note in report)
   - [MUST-FIX]: CANNOT be skipped. If cannot apply → explain in detail.
6. After applying:
   a. Update BUGS.md in pages/StaffOrdersMobile/
   b. Update README.md if needed
7. Git commit and push:
   - git add <specific files only>
   - git commit -m "fix(StaffOrdersMobile): 5 bugs fixed via consensus chain staffordersmobile-260407-132533-b0c8"
   - git push
8. Write merge report to: pipeline/chain-state/staffordersmobile-260407-132533-b0c8-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8

## Applied Fixes
1. [P1] Fix title — Source: agreed/discussion-resolved — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Lines before: <N>
- Lines after: <N>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N
- Skipped (other): N
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>
=== END ===
