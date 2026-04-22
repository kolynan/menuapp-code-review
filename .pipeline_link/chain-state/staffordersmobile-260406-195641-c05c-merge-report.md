# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260406-195641-c05c

## Applied Fixes

1. **[P0] #5: activeRequests filter must include 'accepted'** — DONE. Changed `["new", "in_progress"].includes(r.status)` to `!["done", "cancelled"].includes(r.status)` at line ~3370. Accepted requests now stay visible.

2. **[P0] #6: updateRequestMutation must pass full payload** — DONE. Changed destructured `{id, status}` to spread all payload fields to `ServiceRequest.update()`. Now passes assignee + assigned_at.

3. **[P0] #7: onCloseRequest stop hardcoding 'done'** — DONE. Changed from `status: 'done'` to `status: newStatus, ...extraFields`. Child component's status parameter is now respected.

4. **[P1] #1: Section reorder in all blocks** — DONE. Swapped InProgress before Ready in: Block 1 (compact), Block 2 (expanded), Block 3 (compact-table), Legacy (non-table). Lifecycle order: Requests → New → InProgress → Ready → Served.

5. **[P1] #2: Active/passive visual weight** — DONE. Active headers (Requests, New, Ready) wrapped in `bg-[color]-50 rounded-md px-2 py-0.5`. Passive headers (InProgress) changed to `text-amber-400 opacity-60`. Served changed to `opacity-60`. InProgress content area wrapped in `opacity-60` div. Applied in all 3+1 blocks.

6. **[P1] #3: Dual metric headers** — DONE. Added `pluralRu(n, one, few, many)` helper. Headers now show `N гость · M блюд` format with correct Russian pluralization. Applied to New, InProgress, Ready sections in all 3 blocks. Served keeps simple count per spec.

7. **[P2] #4: Legacy block inline metric** — DONE. Legacy block headers updated with bg pill styling (same as table blocks).

8. **[P1] #8: Conditional request buttons (two-step)** — DONE. Request buttons now branch on `request.status`: new/open → blue "Принять" (sends `accepted` + assignee fields); accepted → green "Выдать" (sends `done`). Applied in all 3 render blocks.

9. **[P1] #9: staffName prop to OrderGroupCard** — DONE. Added `staffName` prop. Staff pill (`bg-blue-100 text-blue-700`) shown next to request label when accepted + assigned to current user.

10. **[P1] #10: Array-based closeDisabledReasons** — DONE. Replaced single ternary with `useMemo` returning array. Backward-compat `closeDisabledReason = closeDisabledReasons[0] || null` preserved for button disabled state.

11. **[P2] #11: Close button shows all blockers** — DONE. Replaced single `<p>` with mapped list of all reasons in all 3 blocks.

12. **[P1] #12: Bulk request buttons** — DONE. Added "Принять все (N)" and "Выдать все (N)" buttons. Visibility based on homogeneity: all-new → accept bulk, all-accepted → serve bulk. Sequential `onCloseRequest` calls for each request. Applied in all 3 blocks.

13. **[P2] #13: isRequestPending prop** — DONE. Added `isRequestPending={updateRequestMutation.isPending}` prop from parent. Bulk and individual request buttons use it for disabled state.

14. **[P1] #14: Inline toast in renderHallRows** — DONE. Toast renders after last row of matching order using `renderedToast` Set to prevent duplicates. Uses `React.Fragment` wrapper per row.

15. **[P1] #15: orderId in toast object** — DONE. Added `orderId: orders[orders.length - 1].id` to toast object in `startUndoWindow`. Last order in batch is used for inline placement.

16. **[P1] #16: undoToast as prop to OrderGroupCard** — DONE. Added `undoToast` prop (alongside existing `setUndoToast`). `renderHallRows` accesses it via closure.

17. **[P1] #17: Remove global toast** — DONE. Removed `{undoToast && (` fixed-position block at ~line 4264. `handleUndoGlobal` kept as safety net.

18. **[P1] #18: Timeout 5000→3000** — DONE. Changed in `startUndoWindow`.

19. **[P2] #19: handleUndoGlobal safety net** — DONE. Kept `handleUndoGlobal` function intact (not removed). Inline toast onClick handles undo + clearTimeout + setUndoToast(null).

20. **[P2] #20: Label field in toast** — DONE. Added `label: HALL_UI_TEXT.undoLabel` to toast object. Inline toast displays `undoToast.label || HALL_UI_TEXT.undoLabel`.

## Skipped — Could Not Apply

None. All 20 fixes applied successfully.

## Git
- Commit: bd3486f
- Lines before: 4333
- Lines after: 4389
- Functions before: 198, after: 202 (added pluralRu + closeDisabledReasons memo + other)

## Summary
- Applied: 20 fixes (3 P0, 12 P1, 5 P2)
- Skipped: 0 fixes
- Commit: bd3486f
