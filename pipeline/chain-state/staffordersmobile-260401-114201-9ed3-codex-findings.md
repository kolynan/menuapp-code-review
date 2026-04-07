# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260401-114201-9ed3

## Findings
1. [P1] Batch `Выдать всё` still bypasses undo toast — In `OrderGroupCard`, the Section 2 batch button still calls `handleBatchAction(completedOrders)` directly at [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1905). The per-order finish action in the same section already captures snapshots and calls `setUndoToast(...)` at [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1951). Because serving all ready orders removes the table card from the active list immediately, the waiter still gets no parent-level undo toast and cannot revert an accidental batch serve. FIX: replace the batch button handler with the same snapshot/timer/`setUndoToast` flow used by the individual finish-stage button, wrapping `handleBatchAction(completedOrders)` with snapshot capture and undo restore via `advanceMutation`.
2. [P2] `ВЫДАНО` history section is still missing from `OrderGroupCard` — The `OrderGroupCard` setup contains no `servedExpanded` state and no lazy `servedOrders` query in the state/query region at [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1368) and [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L1476); `servedOrders`/`servedExpanded` do not appear in the file at all. After the in-progress section closes, the render jumps straight to the bill summary at [staffordersmobile.jsx](C:/Users/ASUS/Dev/Menu%20AI%20Cowork/menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx#L2213), so served orders remain invisible once they drop out of `activeOrders`. FIX: add `const [servedExpanded, setServedExpanded] = useState(false)`, add the lazy `servedOrders` `useQuery` enabled only for expanded table cards, and render a collapsed-by-default `ВЫДАНО (N)` section between the active sections and the bill summary with read-only `guestName(order)` + time rows.

## Summary
Total: 2 findings (0 P0, 1 P1, 1 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None for this scoped review.
- Scope questions (anything you weren't sure if it's in scope): The task mentions `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md` and `BUGS_MASTER.md`, but the speed rules also forbid reading outside the page folder. I treated those external references as informational only and kept the review limited to `staffordersmobile.jsx` plus the page-local README/BUGS files.
