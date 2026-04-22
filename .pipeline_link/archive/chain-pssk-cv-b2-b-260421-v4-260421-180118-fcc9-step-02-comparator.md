---
chain: pssk-cv-b2-b-260421-v4-260421-180118-fcc9
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: Unknown
budget: 5.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: pssk-cv-b2-b-260421-v4-260421-180118-fcc9
Page: Unknown

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
   - **KB-158 fallback (worktree isolation):** if writers could not write outside worktree, CC findings may be in `pages/**/*cc-findings.md` or `pages/**/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-*.md`. Search there too. Also look at `pages/**/cc-analysis-*.txt` for summary.
2. Read Codex findings: pipeline/chain-state/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-codex-findings.md
   - If NOT found there, search in pages/Unknown/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
   - **KB-158 fallback:** also check `pages/**/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-codex-findings.md` (Codex in worktree sandbox writes here when pipeline/ is read-only).
3. **Abort-on-empty check:** if BOTH CC and Codex findings are missing/empty after all fallbacks → write comparison file with `## CRITICAL: No findings found\n- Searched: pipeline/chain-state/, pages/**/*.md\n- Action: chain aborted, see KB-158` and EXIT step. Do NOT produce an empty "Final Fix Plan" — that causes silent merge failure.
4. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/pssk-cv-b2-b-260421-v4-260421-180118-fcc9-comparison.md

FORMAT:
# Comparison Report — Unknown
Chain: pssk-cv-b2-b-260421-v4-260421-180118-fcc9

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

5. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
PC-VERDICT: GO
=== END ===
