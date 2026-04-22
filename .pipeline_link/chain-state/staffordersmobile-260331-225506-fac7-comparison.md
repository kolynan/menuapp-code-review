# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7

## Agreed (both found)

### 1. [P1] Add `summaryLines` useMemo + `getSummaryLineColor` helper
- **CC (Finding 1, Part A):** Detailed analysis confirming the spec's implementation. Key observations: `stage_entered_at` fallback to `created_date` is safe (undefined is falsy); `activeOrders` correctly excludes finish-stage orders (served = no waiter action needed); simplified pluralization is acceptable (>10 requests rare); `show_in_summary === false` check is forward-compatible and harmless now.
- **Codex (Finding 1):** Confirms no `summaryLines` grouping exists, no per-stage ordering, no age calculation, no `show_in_summary` filter. Agrees on the same fix: add `summaryLines` useMemo + `getSummaryLineColor`.
- **Verdict:** AGREE. Both identify the same missing computation. CC provides deeper analysis of edge cases. Implementation per task spec.

### 2. [P1] Replace Row 3 JSX — remove СЕЙЧАС/ЕЩЁ, add per-stage lines
- **CC (Finding 1, Part B):** Replace entire СЕЙЧАС/ЕЩЁ block (lines 1701-1721) with `summaryLines.map()`. Keep `newCount`/`serveCount`/`inProgressCount`/`requestBadges` declarations (cheap, risk-free dead code). All new Russian text in `\uXXXX` escapes.
- **Codex (Finding 2):** Confirms Row 3 still renders old hardcoded strings and `billData.total`. Same fix: replace with `summaryLines.map(...)` + empty-state fallback.
- **Verdict:** AGREE. Both identify the same JSX replacement needed. CC adds practical advice about keeping old variable declarations.

## CC Only (Codex missed)

### 3. [P2] `show_in_summary` forward-compatibility note (informational)
- **CC (Finding 2):** Notes that `getStatusConfig` does NOT currently return `show_in_summary` field, so `cfg.show_in_summary === false` always evaluates to `undefined === false` → `false` → no filtering. This is by design (pre-#218). The check is harmless and forward-compatible.
- **Verdict:** ACCEPT as informational. No code change needed beyond what's already in the spec. Useful context for the merger to understand why the check exists.

## Codex Only (CC missed)

None. Codex findings are a subset of CC's analysis (CC covered both parts in one finding).

## Disputes (disagree)

None. Both writers fully agree on the implementation approach. No conflicting recommendations.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Add `summaryLines` useMemo** — Source: AGREED (CC+Codex) — Add computed value after existing count declarations (~line 1601). Groups `activeOrders` by stage via `getStatusConfig`, collects request line from `tableRequests`, sorts finish→mid→first, calculates age from oldest `stage_entered_at || created_date`. Include `show_in_summary === false` guard for #218 forward-compat.

2. **[P1] Add `getSummaryLineColor` helper** — Source: AGREED (CC+Codex) — Color function: requests (≥3 min = red, else neutral), orders (<5 min neutral, 5-15 amber, >15 red).

3. **[P1] Replace Row 3 JSX** — Source: AGREED (CC+Codex) — Remove entire СЕЙЧАС/ЕЩЁ block (lines 1701-1721). Replace with `summaryLines.map()` rendering per-stage lines. Keep empty-state fallback. All Russian text in `\uXXXX` unicode escapes. Keep `newCount`/`serveCount`/`inProgressCount`/`requestBadges` declarations (may be used elsewhere or in future merges).

**Implementation notes from CC analysis (for merger):**
- `stage_entered_at` field doesn't exist yet in data — fallback `|| order.created_date` handles this safely
- `activeOrders` excludes finish-stage orders by design — correct per UX (served orders don't need action)
- Simplified pluralization (1/2-4/5+) is acceptable — >10 requests is extremely rare
- Unicode escapes mandatory for all new Russian strings

## Summary
- Agreed: 2 items (computation + JSX replacement — CC treated as 1 finding with 2 parts, Codex as 2 separate findings)
- CC only: 1 item (1 accepted as informational — no code change)
- Codex only: 0 items
- Disputes: 0 items
- **Total fixes to apply: 3** (summaryLines useMemo + color helper + Row 3 JSX replacement — all part of single SOM-UX-23 feature)

Prompt Clarity: CC rated 5/5, Codex rated 4/5. Both found the spec well-specified with no ambiguity.
