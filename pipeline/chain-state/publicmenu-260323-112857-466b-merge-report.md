# Merge Report — PublicMenu
Chain: publicmenu-260323-112857-466b

## Applied Fixes
1. [P1] PM-070 — Partner lookup error separation — Source: agreed (CC approach) — DONE
   - Removed second try/catch in partner queryFn, let fallback errors propagate to React Query
   - Destructured `error: partnerError, refetch: refetchPartner` from useQuery
   - Added `if (partnerError)` guard before `if (!partner)` with retry UI (44px touch target)
2. [P1] PM-074 — OrderStatusScreen error separation — Source: agreed — DONE
   - Split `if (orderError || !order)` into two separate blocks
   - `orderError` → retry UI with `refetchOrder()` button (44px touch target)
   - `!order` → existing "not found" UI unchanged
3. [P2] PM-075 — Auto-submit timer cleanup — Source: agreed — DONE
   - Added `autoSubmitTimerRef = useRef(null)` near other refs
   - Clear existing timer before setting new one
   - Added cleanup return to useEffect
4. [P2] PM-073 — normalizeId scope fix — Source: CC only (accepted) — DONE
   - Moved `const normalizeId = (g) => String(g?.id ?? g?._id ?? "")` before the `if (!guest)` block
   - Replaced inline `String(guest?.id ?? guest?._id ?? "")` in create-guest path with `normalizeId(guest)`
5. [P2] PM-069 Part A — BS auto-clear on wrong code — Source: agreed — DONE
   - Added useEffect watching `codeVerificationError` and `isVerifyingCode`
   - Auto-clears `tableCodeInput` after 500ms with proper cleanup

## Skipped — Unresolved Disputes (for Arman)
None. All items resolved.

## Skipped — Could Not Apply
- [P2] PM-069 Part B — Lockout countdown UI — lockout state (`codeAttempts`/`codeLockedUntil`) lives in `useHallTable` hook (out-of-scope file). Both CC and Codex agreed to skip. Recorded in BUGS.md as BUG-PM-069-B for separate task.

## Git
- Commit: 7c42b32
- Pre-task commit: 448d5b2
- Files changed: 1 (pages/PublicMenu/x.jsx)
- Lines: 3627 → 3672 (+45 net, 59 insertions / 14 deletions)

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 5/5
- Fixes where writers diverged due to unclear description:
  - PM-073: Description said "normalizeId may not behave identically" — but actual code shows identical logic. Real issue was block scope. Slightly misleading framing.
  - PM-070: Minor approach divergence (CC: remove try/catch vs Codex: manual flag) — both understood the problem correctly, just different implementation preferences.
- Fixes where description was perfect (both writers agreed immediately):
  - PM-075 (timer cleanup) — crystal clear, exact line numbers, exact pattern
  - PM-074 (order status split) — clear condition to split, clear outcome
  - PM-069 Part A (auto-clear) — well-defined behavior with LMP reference
- Recommendation for improving task descriptions:
  - For PM-073: describe the actual root cause (block scope) rather than speculating about logic differences

## Summary
- Applied: 5 fixes (2x P1, 3x P2)
- Skipped (unresolved): 0 disputes
- Skipped (other): 1 fix (PM-069 Part B — out of scope)
- MUST-FIX not applied: 0
- Commit: 7c42b32
