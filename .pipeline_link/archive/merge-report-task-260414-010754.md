# Merge Report: CC vs Codex — PSSK v2 SOM Batch A
# Session: S266 | Date: 2026-04-14

## Codex Status

Codex completed full analysis (262K tokens, gpt-5.4). It initially targeted `260306-05`
(4015 lines) but ultimately anchored findings to `staffordersmobile.jsx` (4524 lines).
Codex produced substantive independent findings including the PartnerTables discovery.

**IMPORTANT FILE DISCREPANCY:** Codex (working in main repo `C:/Dev/menuapp-code-review`)
claims lines 670-720 and 1281-1320 are "commented out" in `staffordersmobile.jsx`.
CC (working in worktree `C:/Dev/worktrees/task-260414-010754`) verified these lines as
LIVE code. The two directories may have different versions of `staffordersmobile.jsx`.
**Resolution:** The worktree was created for this task and represents the current state.
CC's verification is authoritative. If the main repo differs, it should be synced.

## Agreed (both found)

| # | Finding | CC | Codex |
|---|---------|-----|-------|
| 1 | Fix3 is clear and correct | Yes (5/5) | Yes ("Clear") |
| 2 | closeSession used in PartnerTables — unsafe | P0 | Yes (independently found partnertables:1981) |
| 3 | File name mismatch (260306-05 is 4015 lines, not 4524) | P2 | Yes (explicit) |
| 4 | Fix2 needs activeOrders + filteredGroups + tabCounts consistency | P1 | Yes ("root cause starts in activeOrders") |
| 5 | Fix3 lock badge already safe, only patch ★/☆ | Verified | Yes (explicitly noted) |

## CC only (Codex missed)

| # | Finding | Priority |
|---|---------|----------|
| 1 | Fix1 grep verification misses B6 (hardcoded strings vs HALL_UI_TEXT) | P1 |
| 2 | Fix1 location count says "6" but lists 10 | P1 |
| 3 | Fix2 Change 3 is self-contradictory ("no edit needed" then "this is a bug") | P1 |
| 4 | Fix2 Change 3 gives 2 options without choosing | P1 |
| 5 | Fix2 tabCounts update has no code example | P1 |
| 6 | Fix4 active/passive styling detection method unspecified | P1 |
| 7 | Fix4 B2/B4 single-subgroup edge case | P2 |
| 8 | Implementation order not specified (Fix4 removes Fix1 targets) | P2 |

## Codex only (CC missed) — evaluated

| # | Finding | CC Evaluation |
|---|---------|---------------|
| 1 | Fix1 needs explicit rule for orders with no `order.guest` (null guest_id) | VALID P2 — prompt mentions `new Set` handles null but should add explicit test case |
| 2 | Fix3: warn not to confuse ownership badges (2249/2259) with favorite star button (1641) | VALID P2 — good clarification to add |
| 3 | Fix2: "group has no session-status field, servedOrders only loaded per expanded card" | VALID observation — but the prompt's approach (filter by order status) avoids needing session status |

## Disputes (disagree)

| # | Issue | Codex says | CC says | Resolution |
|---|-------|-----------|---------|------------|
| 1 | Lines 670-720, 1281-1320 are "commented-out dead code" | Yes | No — verified LIVE in worktree | **NEEDS INVESTIGATION**: Main repo vs worktree may differ. If main repo has these commented out, the prompt is targeting already-fixed code in main but still-broken code in worktree. Arman should verify which version is authoritative. |
| 2 | Fix4 "already resolved in live table path at 2333" | B6 is already correct, so Fix4 is moot | B6 is the REFERENCE MODEL; B1/B2/B3/B4 still need fixing (if live) | Depends on Dispute #1. If B1-B4 are live, CC is correct. If commented out, Codex is correct. |
| 3 | Fix2: "Do not change shared helper semantics" | Codex recommends local-only approach | CC accepts prompt's approach (modify closeSession) given PartnerTables is compatible | CC agrees the risk exists but the prompt's approach is workable with PartnerTables acknowledgment. Arman decides. |

## Conclusion

Both reviewers agree: Fix3=CLEAR, Fix1/2/4=need work.
**Key unresolved question:** Are B1/B2/B3/B4 branches (lines 670-769, 1288-1398) live or
commented out in the authoritative source? The answer determines whether Fix1 and Fix4
are correctly scoped or need major rewrites.

Total unique issues: 13 (5 agreed + 8 CC-only + 3 Codex-only, minus overlaps).
1 critical (PartnerTables uses closeSession — agreed by both).
Recommend prompt revision before implementation round.
