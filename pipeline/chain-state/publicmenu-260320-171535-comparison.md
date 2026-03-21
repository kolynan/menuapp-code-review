# Comparison Report — PublicMenu
Chain: publicmenu-260320-171535
Task: PM-041 — Polling timer leak in useTableSession (P0)
Scope: useTableSession.jsx ONLY (per task context)

## Agreed (both found)

### 1. [P0] PM-041: Polling timer leak — `scheduleNext` missing `cancelled` check (lines 670-675)
- **CC:** Guard `scheduleNext` with `if (cancelled) return` at top AND `if (!cancelled)` before recursive call inside setTimeout callback.
- **Codex:** Guard `scheduleNext` with `if (cancelled) return` before `setTimeout`, reschedule only after poll finishes and confirms effect still active.
- **Verdict:** Both agree on the bug and the fix approach. CC's patch is more concrete — two guards (entry + callback). Codex's wording aligns but is less specific. **Use CC's patch** — it covers both the entry point and the callback re-schedule, which is the correct double-guard pattern (matches PM-S140-03 fix pattern from S148).

**Agreed patch:**
```javascript
const scheduleNext = () => {
  if (cancelled) return;
  intervalId = setTimeout(() => {
    pollSessionData();
    if (!cancelled) scheduleNext();
  }, getInterval());
};
```

## CC Only (Codex missed)

### 2. [P2] Stale closure — `partner?.id`/`currentTableId` not in polling deps (lines 493, 686)
- **Evaluation:** Valid concern. If partner or table changes mid-session, polling uses stale IDs. However, in practice partner and table rarely change after session start. Adding them to deps would restart the entire polling effect, which could cause its own issues (double polls, lost state).
- **Decision:** ACCEPT but note as P2 — include in fix plan since it's in useTableSession.jsx (in scope). Low risk addition to dependency array.

### 3. [P2] Infinite retry loop on persistent restore errors (line 480)
- **Evaluation:** Valid. Resetting `didAttemptRestoreRef.current = false` in catch creates an infinite retry on persistent API failures. Simple fix: don't reset the flag.
- **Decision:** ACCEPT — in scope (useTableSession.jsx), clear bug, simple fix.

### 4. [P3] Fire-and-forget `closeExpiredSessionInDB` without await (line 299)
- **Evaluation:** Valid edge case. Without await, localStorage clears before DB confirms close. On next visit, DB query finds the "still open" expired session. However, the next line's `isExpired` check should catch this on retry.
- **Decision:** ACCEPT — in scope, low risk, adds correctness.

### 5. [P3] `console.warn` in production code (line 188)
- **Evaluation:** Valid per project rules (no debug logs in production). Simple removal.
- **Decision:** ACCEPT — in scope, trivial fix.

## Codex Only (CC missed)

### 6. [P1] Pickup/delivery checkout regressed to fullscreen instead of drawer (x.jsx L2933, L3171, L3249)
- **Evaluation:** Potentially valid UX regression, but **OUT OF SCOPE** — task explicitly says "only useTableSession.jsx". File: x.jsx.
- **Decision:** REJECT for this fix plan. Log to BUGS_MASTER as separate item if not already tracked.

### 7. [P2] Verified-table block duplicates header (CartView.jsx L1021, L1065)
- **Evaluation:** UI duplication issue, but **OUT OF SCOPE** — file: CartView.jsx.
- **Decision:** REJECT for this fix plan. Note for future review.

### 8. [P2] Partner mobile grid setting ignored (MenuView.jsx L43, L276)
- **Evaluation:** Valid config bug, but **OUT OF SCOPE** — file: MenuView.jsx.
- **Decision:** REJECT for this fix plan. Note for future review.

### 9. [P2] Mobile icon controls too small/unlabeled (MenuView, CheckoutView, CartView)
- **Evaluation:** Accessibility issue across multiple files, all **OUT OF SCOPE**.
- **Decision:** REJECT for this fix plan. Relates to existing PM-041-header (PM-150 finding).

### 10. [P2] Submit-error fallback text misleading (CartView.jsx L1233)
- **Evaluation:** Copy/i18n issue, **OUT OF SCOPE** — file: CartView.jsx. May relate to PM-038 (already tracked).
- **Decision:** REJECT for this fix plan. Verify against BUGS_MASTER.

### 11. [P3] Reward-email microcopy bypasses i18n (CartView.jsx L518)
- **Evaluation:** i18n hardcode, **OUT OF SCOPE** — file: CartView.jsx.
- **Decision:** REJECT for this fix plan. Note for future review.

## Disputes (disagree)

None — both AIs agree on PM-041 (the primary target). CC found additional in-scope issues in useTableSession.jsx. Codex found valid issues in other files but all are out of scope per task constraints.

## Final Fix Plan

Ordered list of fixes to apply (useTableSession.jsx ONLY):

| # | Priority | Bug ID | Title | Source | Action |
|---|----------|--------|-------|--------|--------|
| 1 | P0 | PM-041 | Polling timer leak — double guard in `scheduleNext` | Agreed (CC+Codex) | Add `if (cancelled) return` at scheduleNext entry + `if (!cancelled)` before recursive call |
| 2 | P2 | NEW-01 | Stale closure — add `partner?.id`, `currentTableId` to polling deps | CC only | Add to dependency array on line 686 |
| 3 | P2 | NEW-02 | Infinite retry loop — don't reset `didAttemptRestoreRef` on error | CC only | Remove/comment `didAttemptRestoreRef.current = false` in catch block |
| 4 | P3 | NEW-03 | Fire-and-forget `closeExpiredSessionInDB` — add await | CC only | Add `await` before call on line 299 |
| 5 | P3 | NEW-04 | Remove `console.warn` in production code | CC only | Remove console.warn on line 188 |

**Out-of-scope findings (for future tasks):**
- Codex #2 [P1]: Pickup/delivery checkout regression (x.jsx)
- Codex #3 [P2]: Verified-table header duplication (CartView.jsx)
- Codex #4 [P2]: Mobile grid config ignored (MenuView.jsx)
- Codex #5 [P2]: Touch target / aria-label gaps (multiple files)
- Codex #6 [P2]: Misleading error fallback text (CartView.jsx)
- Codex #7 [P3]: Reward-email i18n bypass (CartView.jsx)

## Summary
- Agreed: 1 item (PM-041 P0 — the primary target)
- CC only: 4 items (4 accepted — all in useTableSession.jsx scope)
- Codex only: 6 items (0 accepted for this task — all out of scope, different files)
- Disputes: 0 items
- **Total fixes to apply: 5** (1 P0, 2 P2, 2 P3 — all in useTableSession.jsx)
- **Out-of-scope for future: 6** (1 P1, 4 P2, 1 P3 — other files)
