# Merge Report: CC + Codex Analysis — SOM-BUG-S270-01 PSSK Review

## Agreed (both found)
- Line numbers for all 5 documented fan-out locations are correct (639, 1254, 2333, 1960, 1933)
- `advanceMutation` onSettled at line 1894-1897 fires invalidateQueries per item
- `updateRequestMutation` at line 3513-3522 with onSuccess invalidate at 3515
- `onCloseRequest` prop at line 4399 uses `.mutate()` (needs `.mutateAsync()`)

## CC only (Codex missed)
1. **6th fan-out: `handleCloseAllOrders` line 4132** — `Promise.all(orders.map(...))` fires N concurrent Order.update calls. MUST be added as Fix F.
2. **Fix A ambiguity: `batchInFlight` useState placement** — not explicit enough in draft
3. **Fix A: `batchInFlight` in useCallback deps** — stale closure risk, consider useRef
4. **onCloseRequest mutateAsync prerequisite** should be stated BEFORE Fix C, not after
5. **Legacy block batch buttons** (lines 759, 760, 1374, 1375, 2349-2351) not in regression checklist
6. **120ms delay assessment** — sufficient for V1, consider 150-200ms if 30+ item batches fail
7. **Partial batch failure behavior** — not documented in draft
8. **advanceMutation.onMutate cancels queries** during batch (line 1886) — beneficial but undocumented

## Codex only (CC missed)
- Nothing substantive — Codex timed out during filesystem scans

## Disputes
- None (Codex didn't produce substantive analysis to disagree with)
