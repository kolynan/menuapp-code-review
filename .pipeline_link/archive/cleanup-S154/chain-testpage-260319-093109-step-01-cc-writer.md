---
chain: testpage-260319-093109
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
page: TestPage
budget: 2.00
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: testpage-260319-093109
Page: TestPage

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for TestPage in pages/TestPage/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/testpage-260319-093109-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — TestPage
Chain: testpage-260319-093109

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

=== TASK CONTEXT ===
Review TestPage for bugs. The file is small (~40 lines). Find and fix all issues. Focus on: missing await, error handling, React patterns.
=== END ===
