# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7
Mode: CC-Only (v2)

## Result
No disputes found. All items agreed by both CC and Codex reviewers. Skipping discussion.

Both reviewers identified the same 2 core issues:
1. **[P1] summaryLines computation missing** — need useMemo grouping activeOrders by stage + request line with age calculation
2. **[P1] Row 3 JSX not replaced** — old СЕЙЧАС/ЕЩЁ block with hardcoded strings must be replaced with summaryLines.map() render

CC additionally noted:
- [P2] `show_in_summary` forward-compat check is harmless now, correct to include
- `stage_entered_at` fallback to `created_date` is safe (undefined is falsy)
- `activeOrders` excludes finish-stage by design — correct for collapsed summary
- Simplified pluralization (1/2-4/5+) is acceptable for waiter dashboard
- `newCount`/`serveCount`/`inProgressCount`/`requestBadges` variables should be kept (may be used elsewhere or in future merges)

## Updated Fix Plan
No changes needed — Comparator's agreed fix plan stands as-is:

1. [P1] Add `summaryLines` useMemo + `getSummaryLineColor` helper after existing count declarations (~line 1601) — Source: CC+Codex agreed
2. [P1] Replace Row 3 JSX (lines 1701-1721) with per-stage summary lines render — Source: CC+Codex agreed
3. [P2] Include `show_in_summary` forward-compat filter in stageMap loop — Source: CC analysis (informational, harmless now)

## Skipped (for Arman)
None.
