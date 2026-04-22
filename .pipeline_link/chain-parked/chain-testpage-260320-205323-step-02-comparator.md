---
chain: testpage-260320-205323
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: TestPage
budget: 1.50
runner: cc
type: code-review
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: testpage-260320-205323
Page: TestPage

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/testpage-260320-205323-cc-findings.md
2. Read Codex findings: pipeline/chain-state/testpage-260320-205323-codex-findings.md
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/testpage-260320-205323-comparison.md

FORMAT:
# Comparison Report — TestPage
Chain: testpage-260320-205323

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

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
Review TestPage code in pages/TestPage/base/.
Focus on: React best practices, UX bugs, Performance.
Update BUGS.md and README.md.
git commit and push at the end.
=== END ===
