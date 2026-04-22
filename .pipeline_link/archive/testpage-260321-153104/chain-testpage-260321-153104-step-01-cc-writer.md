---
chain: testpage-260321-153104
chain_step: 1
chain_total: 3
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: TestPage
budget: 2.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/3) ===
Chain: testpage-260321-153104
Page: TestPage

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and find ALL bugs.

INSTRUCTIONS:
1. Read the code file for TestPage in pages/TestPage/base/*.jsx
2. Also read README.md and BUGS.md in the same folder for context
3. Do your OWN independent analysis — find ALL bugs and issues
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/testpage-260321-153104-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

FORMAT for findings file:
# CC Writer Findings — TestPage
Chain: testpage-260321-153104

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...
...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

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
