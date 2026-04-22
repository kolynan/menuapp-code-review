---
chain: testpage-260320-203824
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: TestPage
budget: 3.00
runner: cc
type: code-review
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: testpage-260320-203824
Page: TestPage

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for TestPage in pages/TestPage/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/testpage-260320-203824-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — TestPage
Chain: testpage-260320-203824

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

=== TASK CONTEXT ===
Review the TestPage page code — all files in pages/TestPage/base/.

Focus on:
1. React best practices
2. UX bugs
3. Performance

Update BUGS.md and README.md.

IMPORTANT — git commit at the end:
git add pages/TestPage/base/*.jsx pages/TestPage/BUGS.md pages/TestPage/README.md
git commit -m "fix: TestPage S6 smoke test S152"
git push
=== END ===
