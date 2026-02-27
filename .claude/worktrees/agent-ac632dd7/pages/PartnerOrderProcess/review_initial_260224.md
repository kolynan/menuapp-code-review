# Code Review Report: PartnerOrderProcess

**File:** `pages/PartnerOrderProcess/partnerorderprocess.jsx` (1199 lines after fix)
**Date:** 2026-02-24
**Reviewed by:** Claude (correctness + style) + Codex (independent review)
**Rounds:** 1 analysis + 1 post-fix verification

---

## Summary

Most complex page in this batch. Order stage pipeline with CRUD, drag-and-drop, rate limiting, sort_order rebalancing, and 7 sub-components. Two P0 and four P1 bugs found and fixed: unhandled rejections in rebalance, orphaned orders on stage delete, double query invalidation, and double-click race condition. Plus one P1 found in post-review (silent error swallow).

---

## Fixed Issues

### BUG-OP-001 (P0) — No try/catch around rebalanceSortOrder
- **Lines:** 843-858 (handleSaveStage), 865-873 (handleConfirmDelete)
- **Impact:** If rebalanceSortOrder throws (network error, rate limit) after successful create/delete, unhandled rejection propagates. Stage exists but sort_order is inconsistent. Could crash component tree depending on error boundary setup.
- **Fix:** Wrapped rebalance in inner try/catch (non-critical failure). Outer try/catch handles create/delete failures. Single `invalidateQueries` after everything completes.
- **Consensus:** Claude P0, Codex P2. Fixed as P0 — unhandled rejection is a crash path.

### BUG-OP-002 (P1) — Deleting stage orphans orders referencing it
- **Lines:** 865-873 (handleConfirmDelete)
- **Impact:** Orders with `current_stage: <deleted_id>` become invisible in the pipeline. Staff cannot process them. Data integrity loss.
- **Fix:** Added `Order.filter({ current_stage: stage.id })` check before delete. If orders exist, shows error toast and aborts.
- **Consensus:** Claude P1, Codex P0.

### BUG-OP-003 (P1) — Double query invalidation on create/delete
- **Lines:** 793, 803 (mutation onSuccess) + 855, 871 (manual calls)
- **Impact:** Two rapid refetches of stages list increase rate-limit risk on the already rate-sensitive endpoint. May briefly show stale data between fetches.
- **Fix:** Removed `invalidateQueries` from `createMutation.onSuccess` and `deleteMutation.onSuccess`. Single invalidation now happens after rebalance completes.
- **Consensus:** Claude P1, Codex P3.

### BUG-OP-004 (P1) — handleCreateDefaults double-click race condition
- **Lines:** 692-757 (handleCreateDefaults)
- **Impact:** React state `isCreatingDefaults` is async — double-click can enter function twice before state updates. Two concurrent calls can both pass `existingCheck` and create duplicate default stages.
- **Fix:** Added `useRef` guard (`creatingRef.current`) for synchronous double-click prevention. Also removed `console.error` from production code.
- **Consensus:** Claude P1, Codex P1.

### BUG-OP-005 (P1) — Silent error swallow in handleConfirmDelete
- **Found during:** Post-fix review
- **Impact:** If `Order.filter()` pre-check throws, the outer catch block showed no toast (comment said "deleteMutation.onError handles it" but it doesn't for Order.filter errors). User sees no feedback.
- **Fix:** Added `toast.error` in catch when `!deleteMutation.isPending`.

---

## Active Issues (P2-P3, not fixed)

### P2: Fractional sort_order values if backend uses INTEGER column
- **Lines:** 817 (ORDER_STEP/2), 944 (targetStage.sort_order - 0.5)
- Intermediate fractional values exist between create/move and rebalance. If rebalance fails (now handled by catch), these persist.
- **Recommendation:** Verify Base44 schema. Use integer offsets (-1/+1) instead of fractions.

### P2: handleCreateDefaults is non-atomic — partial creates on failure
- **Lines:** 741-747
- Sequential `OrderStage.create` calls in a loop. If one fails mid-way, partial default stages exist. `existingCheck` on retry prevents completion.
- **Recommendation:** Consider all-or-nothing pattern or cleanup on error.

### P2: Move buttons show misleading state under channel filter
- **Lines:** 1128-1130
- `canMoveUp/Down` computed from full `middleStages`, not filtered view. Moving stages hidden by filter produces unexpected visual results.

### P2: ROLE_OPTIONS recreated on every render in EditStageDialog
- **Lines:** 452-456
- Should be wrapped in `useMemo([t])`.

### P2: useCallback on getRoleLabel in non-memoized StageRow
- **Lines:** 227-234
- No benefit without React.memo on the parent. Remove useCallback or add memo.

### P2: Magic number 15 in handleAddStage
- **Line:** 813
- Should be named constant.

### P1 (style): Color swatch aria-label uses raw English string, not t()
- **Lines:** 512 + STAGE_COLORS constant
- Hardcoded `aria-label={c.name}` ("blue", "orange") bypasses i18n.

### P1 (style): .replace("{name}") bypasses i18n interpolation
- **Line:** 609
- Should use `t("orderprocess.delete_confirm", { name: stageName })`.

### P3: Russian comments in production code
- **Lines:** 22, 72, 77, 83, 89, 97, 107-108
- Comments should be in English for consistency.

---

## Statistics
- Total issues found: 14 (P0: 2, P1: 5, P2: 7+2 style P1)
- Issues fixed: 5 (2 P0 + 3 P1)
- Lines of code: 1199
