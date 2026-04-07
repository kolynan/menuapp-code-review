# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7

## CC Findings
- Finding 1 [P1]: Add `summaryLines` useMemo + `getSummaryLineColor` helper, replace Row 3 СЕЙЧАС/ЕЩЁ with per-stage lines
- Finding 2 [P2]: `show_in_summary` forward-compat check — informational, include in code

## Codex Findings
- Finding 1 [P1]: Same — summaryLines computation missing, need useMemo + helper
- Finding 2 [P1]: Same — Row 3 JSX still renders old СЕЙЧАС/ЕЩЁ block, needs replacement

## Agreed
1. [P1] Add `summaryLines` useMemo grouping activeOrders by stage + request line — Both CC and Codex agree this is needed (CC Finding 1 Part A, Codex Finding 1)
2. [P1] Replace Row 3 JSX with `summaryLines.map()` render — Both agree (CC Finding 1 Part B, Codex Finding 2)
3. [P2] Include `cfg.show_in_summary === false` forward-compat check — CC explicitly noted, Codex mentioned `cfg.show_in_summary !== false` filter

## Disputes
None. Both reviewers identified the same issues with the same fix approach.

## Final Fix Plan
1. [P1] Add `summaryLines` useMemo + `getSummaryLineColor` helper after existing count declarations (~line 1601) — Source: CC+Codex agreed
2. [P1] Replace Row 3 JSX (lines 1701-1721) with per-stage summary lines render — Source: CC+Codex agreed
3. [P2] Include `show_in_summary` forward-compat filter in stageMap loop — Source: CC analysis (informational, harmless now)
