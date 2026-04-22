# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260406-195641-c05c

## Status
Codex writer aborted at file integrity check (reported 4011 lines, threshold 4300). Actual file is 4333 lines — KB-095 stale working copy pattern. CC writer produced full 20-finding analysis.

## Agreed (both found)
None — Codex produced no substantive findings.

## CC Only (Codex missed)
All 20 CC findings are CC-only since Codex did not perform analysis:

### Fix 1 — Section reorder
1. [P1] Section order swap in 3+1 blocks — ACCEPT (clear spec, pure JSX reorder)

### Fix 2 — Active/passive visual weight
2. [P1] Add bg pill to active headers, opacity-60 to passive — ACCEPT (CSS-only, clear spec)

### Fix 3 — Dual metric headers
3. [P1] Add pluralRu + dual metric in 3 blocks — ACCEPT
4. [P2] Legacy block inline metric strings — ACCEPT

### Fix 4 — Two-step request flow
5. [P0] activeRequests filter must include 'accepted' — ACCEPT (critical blocker)
6. [P0] updateRequestMutation must pass assignee/assigned_at — ACCEPT (critical)
7. [P0] onCloseRequest hardcodes 'done' — ACCEPT (critical bug)
8. [P1] Conditional request buttons in 3 blocks — ACCEPT
9. [P1] staffName not a prop of OrderGroupCard — ACCEPT (needs new prop)

### Fix 5 — Close-blocker array
10. [P1] Array-based closeDisabledReasons + backward compat — ACCEPT
11. [P2] Ref attachment on expanded sections only — ACCEPT

### Fix 6 — Bulk request buttons
12. [P1] Add bulk buttons with status homogeneity check — ACCEPT
13. [P2] isPending prop gap for mutation state — ACCEPT

### Fix 7 — Inline toast
14. [P1] Inline toast after last row of matching order — ACCEPT
15. [P1] Add orderId to toast object — ACCEPT
16. [P1] Pass undoToast as prop to OrderGroupCard — ACCEPT
17. [P1] Remove global toast render — ACCEPT
18. [P1] Change timeout 5000→3000 — ACCEPT
19. [P2] handleUndoGlobal kept as safety net — ACCEPT
20. [P2] Add label field to toast object — ACCEPT

## Codex Only (CC missed)
None.

## Disputes (disagree)
0 disputes — Codex produced no findings to contradict CC.

## Final Fix Plan
1. [P0] #5: activeRequests filter must include 'accepted' — Source: CC — line 3310
2. [P0] #6: updateRequestMutation expand to full payload — Source: CC — line 3315
3. [P0] #7: onCloseRequest stop hardcoding 'done' — Source: CC — line 4190
4. [P1] #1: Reorder sections in 3+1 blocks — Source: CC
5. [P1] #2: Active/passive visual weight in 3 blocks — Source: CC
6. [P1] #3: pluralRu + dual metric headers — Source: CC
7. [P1] #8: Conditional request buttons (2-step) in 3 blocks — Source: CC
8. [P1] #9: Pass staffName as prop to OrderGroupCard — Source: CC
9. [P1] #10: Array-based closeDisabledReasons — Source: CC
10. [P1] #12: Bulk request buttons — Source: CC
11. [P1] #14: Inline toast in renderHallRows — Source: CC
12. [P1] #15: orderId in toast object — Source: CC
13. [P1] #16: undoToast as prop to OrderGroupCard — Source: CC
14. [P1] #17: Remove global toast — Source: CC
15. [P1] #18: Timeout 5000→3000 — Source: CC
16. [P2] #4: Legacy block inline metric — Source: CC
17. [P2] #11: Refs on expanded sections — Source: CC
18. [P2] #13: isPending prop for bulk button — Source: CC
19. [P2] #19: handleUndoGlobal safety net — Source: CC
20. [P2] #20: label field in toast — Source: CC

## Summary
- Agreed: 0 items
- CC only: 20 items (20 accepted, 0 rejected)
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 20
