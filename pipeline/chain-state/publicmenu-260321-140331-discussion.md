# Discussion Report — PublicMenu
Chain: publicmenu-260321-140331

## Disputes Discussed
Total: 2 disputes from Comparator

Both disputes were **pre-resolved by the Comparator** with clear reasoning and no ambiguity. No multi-round CC↔Codex discussion is needed.

## Dispute Analysis

### Dispute 1: PM-062 root cause — "needs B44 prompt" (CC) vs "fix the base files" (Codex)
**CC Position:** Page-side code is correct — `activeColor="#B5543A"` is already passed to `CategoryChips` in x.jsx:3182. The issue is inside the imported `@/components/publicMenu/refactor/CategoryChips` component which ignores the prop and hardcodes indigo. This cannot be fixed in page code; it needs a B44 prompt to fix the component.
**Codex Position:** Codex didn't produce a PM-062-specific finding. It focused on other issues and didn't address the chips color at all.
**Status:** resolved — CC's analysis is the only substantive analysis. CC grep'd all page files and confirmed zero indigo remnants. The fix is outside page scope.
**Resolution:** Document in BUGS_MASTER as "needs B44 prompt". No page-side code fix in this chain.

### Dispute 2: Codex P0 severity for hall submit bypass (X1)
**CC Position:** CC found the related issue (C8 — order dropped on Bottom Sheet close, rated P1) but didn't identify the deeper `currentTableId` vs `isTableVerified` logic gap in `handleSubmitOrder`.
**Codex Position:** `handleSubmitOrder` gates on `!currentTableId` (x.jsx:2622), but the verified hall path gates on `isTableVerified` (x.jsx:2635). If a QR provides `currentTableId` without verification, the code falls through to the generic branch and creates a hall order without table/session/guest data. P0 — data integrity issue.
**Status:** resolved — Codex's P0 is justified. An unverified hall order reaching the backend without proper table data is a data integrity issue that could create orphan orders.
**Resolution:** Accept P0 severity. Fix: gate on `!isTableVerified` instead of (or in addition to) `!currentTableId`.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | PM-062 root cause (B44 prompt vs page fix) | 0 | resolved | CC — no page-side fix possible |
| 2 | Hall submit bypass severity (P0 vs P1) | 0 | resolved | Codex — P0 justified |

## Updated Fix Plan
No changes to the Comparator's Final Fix Plan. Both disputes were already correctly resolved:

1. **[P0] Gate hall submit on `isTableVerified`** — Source: Codex (X1), confirmed P0 — Change intercept condition from `!currentTableId` to `!isTableVerified`. Add guard in generic branch.
2. **[P3] Document PM-062 as B44 prompt needed** — Source: CC (C1), confirmed — CategoryChips component ignores activeColor prop. No page-side fix possible. Document in BUGS_MASTER.

All other items from the Comparator's Final Fix Plan (A1, A2, A3, C3–C8, X4, X5) remain unchanged.

## Unresolved (for Arman)
None. All disputes resolved.
