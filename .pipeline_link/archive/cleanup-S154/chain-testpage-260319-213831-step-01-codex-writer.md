---
chain: testpage-260319-213831
chain_step: 1
chain_total: 3
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: TestPage
budget: 2.00
runner: codex
type: chain-step
---
Review the file pages/TestPage/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/TestPage/README.md and pages/TestPage/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/TestPage/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/testpage-260319-213831-codex-findings.md

FORMAT:
# Codex Writer Findings — TestPage
Chain: testpage-260319-213831

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
Quick smoke test: review TestPage for bugs. Focus on i18n and mobile UX. Keep analysis brief.
=== END ===
