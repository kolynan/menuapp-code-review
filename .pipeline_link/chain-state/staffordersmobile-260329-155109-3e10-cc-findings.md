# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260329-155109-3e10

## Findings

### Fix 1 — PM-158 (P1): Sync `status` field when updating `stage_id` in StaffOrdersMobile

**Confirmed.** The bug is real and the proposed fix is correct. Analysis of all three locations:

**Part A — `getStatusConfig` return object (line 2934–2944)**

Current return at line 2934 does NOT include `nextStageInternalCode`. The `nextStage` variable (line 2926–2928) is a stage object from `relevantStages` which comes from `orderStages` — these objects DO have `internal_code` (confirmed by grep: `stage.internal_code` is used at lines 2931, 2932, 3056, 3076, 3181, 3183). Adding `nextStageInternalCode: nextStage?.internal_code || null` to the return object is safe and correct.

FIX: Add `nextStageInternalCode: nextStage?.internal_code || null,` after `nextStageId: nextStage?.id || null,` at line 2938. The fallback return (line 2947–2959, STATUS_FLOW path) does NOT need this field — it already sets `nextStatus` directly and `nextStageId` is null.

**Part B — `handleAction` payload (line 1036–1045)**

Current code at line 1039–1041: when `statusConfig.nextStageId` is truthy, ONLY `payload.stage_id` is set. `payload.status` is never written. This means the DB record keeps `status = "new"` while `stage_id` advances. CartView reads `order.status` for bucket sorting → order stays in wrong bucket.

FIX: After line 1040 (`payload.stage_id = statusConfig.nextStageId;`), add CODE_TO_STATUS mapping and derive `payload.status` from `statusConfig.nextStageInternalCode`. Only set if mapping exists (safe fallback — unknown codes are silently skipped).

```javascript
if (statusConfig.nextStageId) {
  payload.stage_id = statusConfig.nextStageId;
  // Sync status for CartView polling (PM-158)
  const CODE_TO_STATUS = {
    start: 'accepted',
    cook: 'in_progress',
    cooking: 'in_progress',
    finish: 'served',
    done: 'served',
    cancel: 'cancelled',
  };
  const derivedStatus = CODE_TO_STATUS[statusConfig.nextStageInternalCode];
  if (derivedStatus !== undefined) payload.status = derivedStatus;
}
```

**Part C — `handleAdvance` payload (line 1485–1487)**

Same issue. Line 1486: `if (config.nextStageId) payload.stage_id = config.nextStageId;` — status not set.

FIX: Replace the single-line `if` with a block that also derives status:

```javascript
if (config.nextStageId) {
  payload.stage_id = config.nextStageId;
  // Sync status for CartView polling (PM-158)
  const CODE_TO_STATUS = {
    start: 'accepted',
    cook: 'in_progress',
    cooking: 'in_progress',
    finish: 'served',
    done: 'served',
    cancel: 'cancelled',
  };
  const derivedStatus = CODE_TO_STATUS[config.nextStageInternalCode];
  if (derivedStatus !== undefined) payload.status = derivedStatus;
}
```

**Risk assessment:**
- LOW risk. Adding a new field to the return object is backward-compatible (no existing code reads `nextStageInternalCode`).
- Setting `status` alongside `stage_id` is additive — if CartView reads `status`, it now gets the correct value. StaffOrdersMobile's own rendering uses `getStatusConfig` (which reads `stage_id` first), so staff view is unaffected.
- The `else if (config.nextStatus)` branch is untouched — STATUS_FLOW fallback works as before.
- Unknown `internal_code` values are safely skipped (no `else` clause, no default).

**One observation:** The `CODE_TO_STATUS` mapping is duplicated in Parts B and C. The task explicitly says "Do NOT extract CODE_TO_STATUS as a top-level const if it's only used in these two places — inline is fine." This is acceptable for scope safety but could be a future cleanup item (P3, not in scope).

## Summary
Total: 1 finding (0 P0, 1 P1, 0 P2, 0 P3)

All three parts of Fix 1 are verified correct. The root cause is confirmed: `handleAction` and `handleAdvance` write only `stage_id` to DB, never `status`, when in stage mode. CartView polls `order.status` for bucket sorting. The fix adds `nextStageInternalCode` to `getStatusConfig` output and uses it to derive and set `status` alongside `stage_id`.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. Fix 1 Parts A/B/C are extremely detailed with exact line numbers, current code, expected code, and grep commands. The scope lock and "Must NOT be" sections are clear.
- Missing context: None. The task provides full root cause analysis, exact locations, code snippets, and verification steps.
- Scope questions: None. The scope lock is unambiguous — only three locations in one file.
