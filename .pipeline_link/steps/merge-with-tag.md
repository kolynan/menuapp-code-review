=== CHAIN STEP: Merge with Versioning ({{STEP_NUM}}/{{TOTAL_STEPS}}) ===
Chain: {{CHAIN_ID}}
Page: {{PAGE}}

You are the Merge step in a modular consensus pipeline.
Your job: create a safe version tag, then apply the fix plan to the actual code.

INSTRUCTIONS:

## Phase 1 — Version tag (safety checkpoint)
1. Create a git tag BEFORE any code changes:
   - git tag "{{PAGE}}-pre-{{CHAIN_ID}}" -m "Pre-fix checkpoint for chain {{CHAIN_ID}}"
   - git push origin "{{PAGE}}-pre-{{CHAIN_ID}}"
   - This allows instant rollback: `git revert --no-commit HEAD..{{PAGE}}-pre-{{CHAIN_ID}}`

## Phase 2 — Apply fixes
2. Read the comparison: pipeline/chain-state/{{CHAIN_ID}}-comparison.md
3. Check if discussion report exists: pipeline/chain-state/{{CHAIN_ID}}-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
4. Read the code file: pages/{{PAGE}}/*.jsx
5. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
6. After applying fixes:
   a. Update BUGS.md in pages/{{PAGE}}/ with fixed items
   b. Update README.md in pages/{{PAGE}}/ if needed
7. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix({{PAGE}}): N bugs fixed via consensus chain {{CHAIN_ID}}"
   - git push

## Phase 3 — Merge report
8. Write merge report to: pipeline/chain-state/{{CHAIN_ID}}-merge-report.md

FORMAT for merge report:
# Merge Report — {{PAGE}}
Chain: {{CHAIN_ID}}

## Version Tag
- Pre-fix tag: {{PAGE}}-pre-{{CHAIN_ID}}
- Rollback: `git revert --no-commit HEAD..{{PAGE}}-pre-{{CHAIN_ID}}`

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
{{TASK_BODY}}
=== END ===
