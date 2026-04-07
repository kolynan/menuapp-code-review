# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260329-155109-3e10

## Findings
1. [P1] `getStatusConfig` still omits `nextStageInternalCode` — In the stage-mode return object at `pages/StaffOrdersMobile/staffordersmobile.jsx:2934`, the file still returns `nextStageId` and `nextStatus: null` but does not expose `nextStage?.internal_code`. That means the two mutation paths have no stage metadata available to derive the canonical `status`, so Part A of Fix 1 is not implemented. FIX: add `nextStageInternalCode: nextStage?.internal_code || null` to the stage-mode object only, leaving the fallback `STATUS_FLOW` branch unchanged.
2. [P1] Stage-mode updates still write only `stage_id`, leaving `status` stale — `handleAction` at `pages/StaffOrdersMobile/staffordersmobile.jsx:1039` and `handleAdvance` at `pages/StaffOrdersMobile/staffordersmobile.jsx:1486` still set `payload.stage_id` when `nextStageId` exists and never derive/set `payload.status` in that branch. With OrderStages enabled, this preserves the old DB status (`"new"` in the reported case), so CartView keeps the order in the wrong bucket after staff advances it. FIX: in both functions, after writing `stage_id`, derive `status` from `nextStageInternalCode` using the requested inline mapping (`start -> accepted`, `cook/cooking -> in_progress`, `finish/done -> served`, `cancel -> cancelled`) and set `payload.status` only when the code is recognized; keep the `nextStatus` fallback path as-is.

## Summary
Total: 2 findings (0 P0, 2 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None needed for this review-only scope.
- Scope questions (anything you weren't sure if it's in scope): None.
