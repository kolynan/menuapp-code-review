# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260329-155109-3e10

## Agreed (both found)

### 1. [P1] PM-158 Part A — `getStatusConfig` missing `nextStageInternalCode`
- **CC:** Confirmed at line 2934–2944. `nextStage` objects have `internal_code` (verified via grep at lines 2931, 2932, 3056, 3076, 3181, 3183). Fix: add `nextStageInternalCode: nextStage?.internal_code || null` after `nextStageId`. Fallback STATUS_FLOW return does NOT need it.
- **Codex:** Same finding at line 2934. Same fix. Agrees fallback branch unchanged.
- **Verdict:** AGREED. Both propose identical fix.

### 2. [P1] PM-158 Part B — `handleAction` writes only `stage_id`, never `status`
- **CC:** Confirmed at line 1039–1041. Fix: add CODE_TO_STATUS inline mapping after `payload.stage_id = statusConfig.nextStageId;`, derive status from `statusConfig.nextStageInternalCode`, set only if mapping exists.
- **Codex:** Same finding at line 1039. Same fix approach with same mapping (`start→accepted`, `cook/cooking→in_progress`, `finish/done→served`, `cancel→cancelled`). Keep `nextStatus` fallback as-is.
- **Verdict:** AGREED. Identical fix proposed by both.

### 3. [P1] PM-158 Part C — `handleAdvance` writes only `stage_id`, never `status`
- **CC:** Confirmed at line 1485–1487. Same CODE_TO_STATUS inline mapping, derive from `config.nextStageInternalCode`.
- **Codex:** Same finding at line 1486. Same fix.
- **Verdict:** AGREED. Identical fix proposed by both.

## CC Only (Codex missed)
None. CC and Codex found the same issues.

## Codex Only (CC missed)
None. Codex structured findings as 2 items (Part A separate, Parts B+C combined) vs CC's 1 item with 3 sub-parts, but the content is identical.

## Disputes (disagree)
None. Both AI fully agree on:
- Root cause: `handleAction` and `handleAdvance` write only `stage_id` to DB when in stage mode, leaving `status` stale
- Fix approach: enrich `getStatusConfig` return → use new field to derive `status` in both mutation paths
- Code mapping: identical `CODE_TO_STATUS` object
- Scope: only 3 locations in `staffordersmobile.jsx`, no other files
- Safety: unknown `internal_code` values silently skipped, fallback STATUS_FLOW path untouched

## Final Fix Plan
Ordered list of all fixes to apply:

1. **[P1] PM-158 Part A** — Source: AGREED — Add `nextStageInternalCode: nextStage?.internal_code || null` to the stage-mode return object in `getStatusConfig` (~line 2938). Leave fallback STATUS_FLOW return unchanged.

2. **[P1] PM-158 Part B** — Source: AGREED — In `handleAction` (~line 1040), after `payload.stage_id = statusConfig.nextStageId;`, add inline CODE_TO_STATUS mapping and set `payload.status` from `statusConfig.nextStageInternalCode` when recognized.

3. **[P1] PM-158 Part C** — Source: AGREED — In `handleAdvance` (~line 1486), after `payload.stage_id = config.nextStageId;`, add same inline CODE_TO_STATUS mapping and set `payload.status` from `config.nextStageInternalCode` when recognized.

## Summary
- Agreed: 3 items (Parts A, B, C of PM-158)
- CC only: 0 items
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 3 (all P1, one logical fix in 3 locations)

## Notes
- Both reviewers rated prompt clarity 5/5
- Risk: LOW — additive changes only, no existing behavior modified
- CODE_TO_STATUS duplication in Parts B and C is explicitly allowed by task spec ("inline is fine")
- CC noted this duplication as a potential P3 future cleanup — not in scope
