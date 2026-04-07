# Comparison Report — PublicMenu
Chain: publicmenu-260323-112857-466b

## Agreed (both found)

### 1. PM-075 (P2) — Auto-submit setTimeout without cleanup
- **CC:** Add `autoSubmitTimerRef`, store timeout ID, clear before new timeout, add cleanup return in useEffect.
- **Codex:** Identical approach — add `autoSubmitTimerRef`, clear existing timer, store new ID, return cleanup with `clearTimeout`.
- **Verdict:** FULL AGREEMENT. Both propose the same ref-based cleanup pattern. Use CC's more detailed code (includes `if (autoSubmitTimerRef.current)` guard).

### 2. PM-070 (P1) — Partner lookup masks backend errors as "not found"
- **CC:** Remove second try/catch entirely — let fallback lookup errors propagate naturally to React Query. Destructure `error: partnerError, refetch: refetchPartner` from useQuery. Split guard into `if (partnerError)` → retry UI, then `if (!partner)` → not-found UI.
- **Codex:** Preserve a separate `partnerNetworkError` flag when both lookups throw. Expose `refetch`. Split guard similarly.
- **Verdict:** AGREEMENT on the problem and outcome. **CC's approach is cleaner** — removing the second try/catch lets React Query handle errors naturally, avoiding a manual `partnerNetworkError` state. Codex's `partnerNetworkError` flag is redundant when React Query already provides `error`. Use CC's approach.

### 3. PM-074 (P1) — OrderStatusScreen masks fetch errors as "not found"
- **CC:** Split `if (orderError || !order)` into two separate blocks. `orderError` → retry UI with `refetchOrder()`. `!order` → existing not-found UI. Notes `refetchOrder` already destructured at line 895.
- **Codex:** Identical split. Same retry/not-found separation. Same `refetchOrder()` usage.
- **Verdict:** FULL AGREEMENT. Use CC's detailed JSX which includes proper Card/CardContent structure and 44px touch targets.

### 4. PM-069 (P2) — BS table code: no auto-clear after wrong code, no lockout UI
- **CC:** Part A — add `useEffect` watching `codeVerificationError` to auto-clear input after 500ms. Part B — SKIPPED, state lives in `useHallTable` hook (out-of-scope file).
- **Codex:** Part A — same 500ms clear approach. Part B — notes lockout state lives in `CartView.jsx:100-151` (not useHallTable), suggests lifting/passing lockout state into x.jsx.
- **Minor disagreement on Part B source:** CC says `codeAttempts`/`codeLockedUntil` is in useHallTable; Codex says it's in CartView.jsx. Regardless, both agree it's NOT in x.jsx scope and would require modifying an out-of-scope file.
- **Verdict:** AGREEMENT on Part A (implement). AGREEMENT on Part B (SKIP — out of scope). The task prompt itself allows skipping Part B if too complex. Part A is the deliverable fix.

## CC Only (Codex missed)

### 5. PM-073 (P2) — normalizeId block scope inconsistency
- **CC finding:** `normalizeId` is defined at line 2708 inside a `try` block (block-scoped `const`). It's used in the "restore guest" path but NOT available in the "create new guest" path at line 2798, which uses an inline `String(guest?.id ?? guest?._id ?? "")`. Logic is identical but code is duplicated with risk of future drift. Fix: move `normalizeId` before the `if (!guest)` block so both paths share it.
- **Codex:** Did not report this issue.
- **Evaluation:** VALID finding. The logic duplication is real and the scope issue means a future change to one path could miss the other. The fix is minimal (move one line, replace one expression) and directly addresses the task requirement "both places must use the same normalization". **ACCEPT.**

## Codex Only (CC missed)

None. All Codex findings were also found by CC.

## Disputes (disagree)

### PM-070 implementation approach
- **CC:** Remove second try/catch, let errors propagate naturally to React Query.
- **Codex:** Keep catches but set a manual `partnerNetworkError` flag.
- **Resolution:** CC's approach is preferred. React Query already provides `error` state when `queryFn` throws. Adding a manual flag is redundant state that must be kept in sync. Removing the second try/catch is simpler and leverages the framework correctly. **Use CC's approach.**

### PM-069 Part B — where lockout state lives
- **CC:** Says `useHallTable` hook.
- **Codex:** Says `CartView.jsx:100-151`.
- **Resolution:** Minor factual disagreement. Both agree it's out of scope for x.jsx-only modification. **Moot point — Part B is SKIPPED regardless.**

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] PM-070 — Partner lookup error separation** — Source: agreed (CC approach) — Remove second try/catch in partner queryFn, let fallback errors propagate to React Query. Destructure `error: partnerError, refetch: refetchPartner`. Split guard: `if (partnerError)` → retry UI, `if (!partner)` → not-found UI.

2. **[P1] PM-074 — OrderStatusScreen error separation** — Source: agreed — Split `if (orderError || !order)` into two blocks. `orderError` → retry UI with `refetchOrder()`. `!order` → existing not-found UI.

3. **[P2] PM-075 — Auto-submit timer cleanup** — Source: agreed — Add `autoSubmitTimerRef = useRef(null)`. Store timeout ID, clear before new timeout, add cleanup return.

4. **[P2] PM-073 — normalizeId scope fix** — Source: CC only (accepted) — Move `normalizeId` definition before the `if (!guest)` block. Replace inline `String(guest?.id ?? guest?._id ?? "")` in create-guest path with `normalizeId(guest)`.

5. **[P2] PM-069 Part A — BS auto-clear on wrong code** — Source: agreed — Add `useEffect` watching `codeVerificationError` to auto-clear input after 500ms with cleanup.

6. **[SKIPPED] PM-069 Part B — Lockout countdown UI** — Source: agreed skip — Lockout state (`codeAttempts`/`codeLockedUntil`) is not in x.jsx scope. Requires modifying out-of-scope file. Record in BUGS_MASTER.md for separate task.

## Summary
- Agreed: 4 items (PM-075, PM-070, PM-074, PM-069 Part A)
- CC only: 1 item (PM-073 — accepted)
- Codex only: 0 items
- Disputes: 1 minor (PM-070 approach — resolved in favor of CC)
- Total fixes to apply: 5
- Skipped: 1 (PM-069 Part B — out of scope)
