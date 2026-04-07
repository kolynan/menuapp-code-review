# Discussion Report — PublicMenu
Chain: publicmenu-260323-112857-466b

## Result
No real disputes found. The Comparator listed 2 disputes but resolved both inline:

1. **PM-070 implementation approach** — CC (remove try/catch, use React Query error) vs Codex (manual `partnerNetworkError` flag). Comparator resolved: CC's approach is cleaner, leverages React Query's built-in `error` state. No redundant manual flag needed.

2. **PM-069 Part B lockout state location** — CC says `useHallTable`, Codex says `CartView.jsx`. Moot point: both agree Part B is out of scope (requires modifying files outside x.jsx). Part B is SKIPPED regardless.

All 5 fixes and 1 skip were agreed or resolved by Comparator. Skipping discussion rounds.

## Resolution Summary
| # | Dispute | Rounds | Resolution | Winner |
|---|---------|--------|------------|--------|
| 1 | PM-070 approach (remove catch vs manual flag) | 0 | resolved by Comparator | CC |
| 2 | PM-069 Part B state location | 0 | moot (both skip) | N/A |

## Updated Fix Plan
No changes to Comparator's fix plan. All items carry forward as-is:

1. **[P1] PM-070 — Partner lookup error separation** — Source: agreed (CC approach) — Remove second try/catch in partner queryFn, let fallback errors propagate to React Query. Destructure `error: partnerError, refetch: refetchPartner`. Split guard: `if (partnerError)` → retry UI, `if (!partner)` → not-found UI.

2. **[P1] PM-074 — OrderStatusScreen error separation** — Source: agreed — Split `if (orderError || !order)` into two blocks. `orderError` → retry UI with `refetchOrder()`. `!order` → existing not-found UI.

3. **[P2] PM-075 — Auto-submit timer cleanup** — Source: agreed — Add `autoSubmitTimerRef = useRef(null)`. Store timeout ID, clear before new timeout, add cleanup return.

4. **[P2] PM-073 — normalizeId scope fix** — Source: CC only (accepted) — Move `normalizeId` definition before the `if (!guest)` block. Replace inline `String(guest?.id ?? guest?._id ?? "")` in create-guest path with `normalizeId(guest)`.

5. **[P2] PM-069 Part A — BS auto-clear on wrong code** — Source: agreed — Add `useEffect` watching `codeVerificationError` to auto-clear input after 500ms with cleanup.

6. **[SKIPPED] PM-069 Part B — Lockout countdown UI** — Lockout state not in x.jsx scope. Record in BUGS_MASTER.md.

## Unresolved (for Arman)
None. All items resolved.
