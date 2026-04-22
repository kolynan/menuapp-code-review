---
chain: testpage-260319-094126
chain_step: 2
chain_total: 4
chain_step_name: codex-writer
page: TestPage
budget: 2.00
type: chain-step
---
=== CHAIN STEP: Codex Writer (2/4) ===
Chain: testpage-260319-094126
Page: TestPage

You are launching Codex to independently analyze the code.
Your ONLY job: run Codex and save its output.

INSTRUCTIONS:
1. Run Codex via PowerShell:
   powershell.exe -Command "codex exec -C 'C:/Dev/menuapp-code-review' --full-auto 'Review the file pages/TestPage/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform. Also check nearby files like README.md and BUGS.md in the same folder for context. Find ALL bugs and issues. Focus on: logic errors, missing error handling, i18n issues, UI/UX problems for mobile-first, React anti-patterns. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.'" > pipeline/chain-state/testpage-260319-094126-codex-findings.md 2>&1

2. Wait for Codex to finish (timeout: 5 minutes)
3. If Codex fails or times out, write "CODEX FAILED: <reason>" to the findings file
4. Do NOT apply any fixes — only save Codex output

=== TASK CONTEXT ===
Review TestPage for bugs. The file is small (~40 lines). Find and fix all issues. Focus on: missing await, error handling, React patterns.
=== END ===
