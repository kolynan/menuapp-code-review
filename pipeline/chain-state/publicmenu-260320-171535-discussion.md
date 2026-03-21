# Discussion Report — PublicMenu
Chain: publicmenu-260320-171535
Task: PM-041 — Polling timer leak in useTableSession (P0)

## Result
No disputes found. All items agreed or resolved by Comparator. Skipping discussion.

## Details
- Agreed items: 1 (PM-041 P0 — both CC and Codex agree on double-guard fix)
- CC-only accepted: 4 (all in-scope useTableSession.jsx fixes accepted by Comparator)
- Codex-only rejected: 6 (all out-of-scope, different files)
- Disputes: 0

The Comparator resolved all differences by scope analysis. No multi-round discussion needed.

## Updated Fix Plan
No changes to Comparator's fix plan — it passes through unchanged to Merge step.

| # | Priority | Bug ID | Title | Source | Action |
|---|----------|--------|-------|--------|--------|
| 1 | P0 | PM-041 | Polling timer leak — double guard in `scheduleNext` | Agreed (CC+Codex) | Add `if (cancelled) return` at scheduleNext entry + `if (!cancelled)` before recursive call |
| 2 | P2 | NEW-01 | Stale closure — add `partner?.id`, `currentTableId` to polling deps | CC only | Add to dependency array on line 686 |
| 3 | P2 | NEW-02 | Infinite retry loop — don't reset `didAttemptRestoreRef` on error | CC only | Remove/comment `didAttemptRestoreRef.current = false` in catch block |
| 4 | P3 | NEW-03 | Fire-and-forget `closeExpiredSessionInDB` — add await | CC only | Add `await` before call on line 299 |
| 5 | P3 | NEW-04 | Remove `console.warn` in production code | CC only | Remove console.warn on line 188 |

## Unresolved (for Arman)
None — all items resolved.
