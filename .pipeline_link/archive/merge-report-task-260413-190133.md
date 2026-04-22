# Merge Report: PSSK CartView Batch CV-A Prompt Review
# Task: pssk-review-cartview-260413
# Date: 2026-04-13

## Codex Status
Codex was unable to complete this review. The prompt text exists only in the CC task
payload, not as a file in the repository. Codex spent its time searching for the prompt
in the repo and worktrees but could not locate it. This is a PSSK task limitation —
future PSSK reviews should either:
1. Save the prompt to a file before launching Codex, or
2. Pass the prompt text directly to Codex via the `codex exec` command body.

## CC-Only Analysis (16 findings)

Since Codex could not contribute, this is a CC-only review.

### Summary of Findings

| Priority | Count | Key Issues |
|----------|-------|------------|
| P0 | 2 | Incomplete error state machine (Fix 3), setTimeout memory leak (Fix 3) |
| P1 | 5 | 3-group data source confusion (Fix 1), getOrderStatus fate (Fix 1), auto-collapse logic gap (Fix 4), UX files missing from repo, header count ambiguity (Fix 2) |
| P2 | 6 | HTML mockup greps vs React code (Fix 2), double-tap unspecified (Fix 3), bonus data source (Fix 5), guest name format (Fix 7), empty drawer state, dead code accumulation (D12) |
| P3 | 3 | Scroll/vaul regression, submitPhase drawer reset, Batch CV-B dependency note |

### Top 3 Must-Fix Before Execution

1. **[P0] Fix 3 error path:** Add `submitPhase = 'error'` state. Without it, failed
   submissions show "Order sent" to the user. This is the highest-risk issue.

2. **[P0] Fix 3 setTimeout cleanup:** Add `return () => clearTimeout(timer)` in the
   useEffect. Standard React pattern, must be in the prompt.

3. **[P1] UX reference files:** The prompt references 3 files that don't exist in
   the repo (`ux-concepts/CartView/...`). Either add them or inline the critical info.

## Agreed (both found)
N/A — Codex did not produce findings.

## CC only (Codex missed)
All 16 findings are CC-only. See full analysis in:
`C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/cc-analysis-task-260413-190133.txt`

## Codex only (CC missed)
N/A — Codex did not produce findings.

## Disputes (disagree)
N/A — no Codex findings to compare.
