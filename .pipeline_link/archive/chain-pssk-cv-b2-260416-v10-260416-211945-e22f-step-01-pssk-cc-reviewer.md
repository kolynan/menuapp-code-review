---
chain: pssk-cv-b2-260416-v10-260416-211945-e22f
chain_step: 1
chain_total: 1
chain_step_name: pssk-cc-reviewer
chain_group: reviewers
chain_group_size: 2
page: Unknown
budget: 10.00
runner: cc
type: ПССК
---
You are a CC code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
⛔ DO NOT: submit raw grep output or file dumps as your final answer — this will be treated as a failed review.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.
✅ MANDATORY: Your response MUST end with a "Fix Ratings" table rating each Fix N/5. No table = incomplete review.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect line numbers (check against current file if specified)
- Incorrect code snippets (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions that could be misinterpreted
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help CC execute without hesitation?
- Fix dependencies: are there ordering requirements between fixes?
- Validation steps: are they sufficient to catch regressions?
- New dictionary entries: are all additions justified and explained?

Write your findings to: pipeline/chain-state/pssk-cv-b2-260416-v10-260416-211945-e22f-cc-findings.md

FORMAT:
# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-cv-b2-260416-v10-260416-211945-e22f

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ... | ... | ... | ✅/❌ |

## Fix-by-Fix Analysis
For each fix: SAFE / RISKY — brief reason.

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)
Prompt clarity rating: [1-5]

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

## Fix Ratings (MANDATORY — ALWAYS include this section, even if no issues found)
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | X/5 | Clear / Needs clarification / Rewrite needed | ... |
| Fix2 | X/5 | ... | ... |
| Fix3 | X/5 | ... | ... |

Overall prompt verdict: APPROVED (all ≥4/5) / NEEDS REVISION (any <4/5)

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
# Task: pssk-review for pssk-cv-b2-v10
origin_prompt: pssk-cv-b2-v10.md
=== END ===
