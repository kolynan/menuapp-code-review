# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-184402-3037

## Findings
1. [P1] Fix 1 not implemented in "НОВЫЕ" rows — `newOrders.map(...)` still renders only the status badge and `(!)` indicator in the right header slot at `staffordersmobile.jsx:1772-1775`; there is no inline "Принять" button, no `handleBatchAction([order])` call, and no `e.stopPropagation()` guard. The waiter still has to tap the row and use the bottom action area, so the required one-tap flow is missing. FIX: replace the right-side header block with the badge plus a blue `config.actionLabel`-guarded button that calls `handleBatchAction([order])` and stops propagation.
2. [P1] Fix 2 not implemented in "ГОТОВО К ВЫДАЧЕ" rows — `completedOrders.map(...)` still renders only `<Badge ...>{config.label}</Badge>` on the right side at `staffordersmobile.jsx:1827`, with no inline green "Выдать" button and no propagation guard. This keeps the old bottom-action flow instead of the required per-row single tap. FIX: wrap the right-side header in a `flex items-center gap-2` container and add the green `config.actionLabel` button that calls `handleBatchAction([order])` with `e.stopPropagation()`.
3. [P1] Fix 3 not implemented in "В РАБОТЕ" rows — `inProgressOrders.map(...)` still renders only the status badge on the right at `staffordersmobile.jsx:1876`; there is no amber inline action button for orders that have `config.actionLabel`. Mid-stage orders therefore still cannot be advanced from the row header as specified. FIX: add the amber inline button next to the badge in the section-3 row header, guarded by `config.actionLabel`, and stop row-click propagation before calling `handleBatchAction([order])`.
4. [P1] Fix 4 not implemented: Block B bottom action is still rendered — the `{nextAction && (...)}` block at `staffordersmobile.jsx:1935-1957` is unchanged, so the large bottom "Принять / Выдать / Далее" button is still present. That contradicts the required UX where actions must exist only inline per order and in the existing group headers. `transitionText` at `staffordersmobile.jsx:1602-1613` is also still kept solely for this block. FIX: remove the entire Block B render section; after that, drop `transitionText` and re-check whether `nextAction` / `handleAdvance` still have any remaining callers before deleting or retaining them.

## Summary
Total: 4 findings (0 P0, 4 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 3
- Ambiguous Fix descriptions (list Fix # and what was unclear): None. Fix 1-4 themselves were specific.
- Missing context (what info would have helped): `README.md` was requested as page-local context but does not exist in `pages/StaffOrdersMobile`. The task context also named `ux-concepts/staff-orders-mobile.md` and `BUGS_MASTER.md`, but the speed rule said not to read outside the page folder.
- Scope questions (anything you weren't sure if it's in scope): It was unclear whether to read the two external context files despite the page-folder-only restriction, and whether the mobile-first/regression checklist should be reported separately when the requested inline-button changes are absent entirely.
