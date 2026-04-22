=== CHAIN STEP: Standalone Discussion ({{STEP_NUM}}/{{TOTAL_STEPS}}) ===
Chain: {{CHAIN_ID}}
Page: {{PAGE}}

You are the Discussion moderator for a standalone UX/architecture discussion.
Your job: facilitate a multi-round discussion between CC (you) and Codex on the questions in the task.
There is NO prior Comparator step — this is a fresh discussion from the task body.

INSTRUCTIONS:

1. Read the task questions from the TASK CONTEXT section below.

2. Run 2 rounds of discussion:

   ROUND 1:

   a) CC Position (you write):
      For EACH question in the task, write your analysis:
      - Your recommended answer with reasoning
      - Key trade-offs
      - Mobile UX considerations where relevant

   b) Codex Position (run codex):
      Create a temp prompt file at /tmp/{{CHAIN_ID}}-codex-r1.txt with:
      - The original questions from the task
      - CC's Round 1 answers
      - Instruction: "Review CC's answers to each question. For each: agree or provide a better alternative with reasoning."
      Run: codex.cmd exec --model codex-mini --prompt-file /tmp/{{CHAIN_ID}}-codex-r1.txt --quiet
      Save Codex response.

   ROUND 2 (only if CC and Codex disagree on 1+ questions):

   a) CC reviews Codex's response:
      - For each disagreement: revise position or explain why CC's original answer stands
      - Note any points where CC updates its recommendation

   b) Codex final response (run codex again):
      Create /tmp/{{CHAIN_ID}}-codex-r2.txt with:
      - The questions, CC R1, Codex R1, CC R2 positions
      - Instruction: "Final round — confirm your position or reach compromise."
      Run: codex.cmd exec --model codex-mini --prompt-file /tmp/{{CHAIN_ID}}-codex-r2.txt --quiet

3. Write final discussion report to: pipeline/chain-state/{{CHAIN_ID}}-discussion.md

FORMAT:
# Standalone Discussion Report — {{PAGE}}
Chain: {{CHAIN_ID}}
Topic: [title from task]

## Questions Discussed
[List the N questions from the task]

## Round 1

### Q1: [question title]
**CC:** [CC answer + reasoning]
**Codex:** [Codex answer + reasoning]
**Status:** agreed / disagreement → Round 2

### Q2: [question title]
...

## Round 2 (if needed)
### Q1: [only questions with disagreement]
**CC R2:** [updated or maintained position]
**Codex R2:** [final position]
**Resolution:** agreed on [X] / unresolved → Arman

## Decision Summary
| # | Question | CC | Codex | Resolution | Confidence |
|---|----------|----|-------|------------|------------|
| 1 | Title    | option A | option A | ✅ agreed | high |
| 2 | Title    | option B | option C | ⚠️ Arman decides | — |

## Recommendations
For each question: the agreed recommendation (or both options if unresolved).
Format as actionable decisions ready for DECISIONS_INDEX.

## Unresolved (for Arman)
Questions where CC and Codex could not agree. Each shows both positions.

4. Do NOT write or modify any code files.

=== TASK CONTEXT ===
{{TASK_BODY}}
=== END ===
