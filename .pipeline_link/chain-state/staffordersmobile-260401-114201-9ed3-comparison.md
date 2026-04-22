# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260401-114201-9ed3

## Agreed (both found)

### 1. [P1] Fix 1 — SOM-S213-01: Batch "Выдать всё" button missing setUndoToast call (~line 1905)
- **CC:** Identified exact line 1905, provided complete replacement onClick handler with snapshots array, handleBatchAction call, setTimeout, and setUndoToast with onUndo callback using advanceMutation. Referenced pattern from individual buttons at ~lines 1951–1965.
- **Codex:** Same finding — batch button calls handleBatchAction directly without snapshot/timer/setUndoToast flow. Same fix approach: wrap with snapshot capture and undo restore via advanceMutation.
- **Verdict:** AGREED. CC's patch is more detailed (full code provided), Codex confirms the approach. Use CC's patch — it's concrete and follows the existing individual-button pattern exactly.

### 2. [P2] Fix 2 — SOM-UX-24: No "ВЫДАНО" section for served orders
- **CC:** Three-part fix: (a) add `servedExpanded` state, (b) add `servedOrders` useQuery with `enabled: isExpanded && group.type === 'table'`, staleTime 30s, (c) full JSX section with slate-400 muted styling, 44px touch target header, collapsed-by-default toggle, read-only rows with guestName + time. Insertion point: after in-progress section ~line 2211, before Bill Summary ~line 2213.
- **Codex:** Same three-part fix: `servedExpanded` state, lazy `servedOrders` query enabled for expanded table cards, collapsed-by-default ВЫДАНО section between active sections and bill summary. Read-only guestName + time rows.
- **Verdict:** AGREED. Both propose identical architecture. CC's patch includes complete JSX with all styling details. Use CC's implementation.

## CC Only (Codex missed)
None. Both reviewers found the same 2 issues.

## Codex Only (CC missed)
None. Both reviewers found the same 2 issues.

## Disputes (disagree)

### Minor implementation detail: `shouldRetry` in query
- **CC:** Omits `retry: shouldRetry` from the servedOrders query, uses only `staleTime: 30000`.
- **Codex:** Does not specify retry behavior.
- **Resolution:** Not a dispute — both omit it. The task prompt suggests `shouldRetry` but CC's note that it's "optional" is reasonable. The query is non-critical (history display), so default retry is fine. No change needed.

No substantive disputes.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] Fix 1 — Batch "Выдать всё" undo toast** — Source: **agreed** (CC + Codex) — Replace onClick handler at ~line 1905 to build snapshots array from completedOrders, call handleBatchAction, then call setUndoToast with snapshots/timerId/onUndo callback. Use CC's detailed patch (follows existing individual-button pattern at ~lines 1951–1965).

2. **[P2] Fix 2 — ВЫДАНО section for served orders** — Source: **agreed** (CC + Codex) — Three changes inside OrderGroupCard:
   - 2a: Add `const [servedExpanded, setServedExpanded] = useState(false)` state
   - 2b: Add `servedOrders` useQuery with `enabled: isExpanded && group.type === 'table'`, staleTime 30s
   - 2c: Add collapsed-by-default ВЫДАНО section JSX after in-progress section, before Bill Summary. Slate-400 muted styling, 44px touch target header, toggle show/hide, read-only rows with guestName + time.

## Summary
- Agreed: 2 items
- CC only: 0 items (0 accepted, 0 rejected)
- Codex only: 0 items (0 accepted, 0 rejected)
- Disputes: 0 items
- **Total fixes to apply: 2**
