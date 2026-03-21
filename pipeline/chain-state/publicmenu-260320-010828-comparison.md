# Comparison Report — PublicMenu
Chain: publicmenu-260320-010828

## Agreed (both found)

### 1. [P1] BUG-PM-027: Loyalty/discount UI hidden for normal checkout
- **CC**: CartView.jsx gates loyalty section on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Fix: add `showLoyaltySection` to CartView props, change gate condition.
- **Codex**: Same finding. `x.jsx` computes `showLoyaltySection` at line 1937 but CartView uses `showLoginPromptAfterRating` at line 861. Fix: render from `showLoyaltySection`; keep `showLoginPromptAfterRating` only for post-rating nudge.
- **Consensus**: Full agreement. Both identify the same root cause and same fix approach.

### 2. [P1] BUG-PM-028: Failed star-rating saves leave dishes permanently locked
- **CC**: `handleRateDish` catch block in x.jsx only shows error toast, never clears draftRating. Fix: add `updateDraftRating(itemId, 0)` in catch block.
- **Codex**: Same finding. `draftRating > 0` makes control readonly at line 722, but catch at lines 2039-2042 never clears it. Fix: clear draft rating on failure, or only lock from confirmed `reviewedItems`.
- **Consensus**: Full agreement. CC's fix (clear draftRating to 0 in catch) is concrete and correct. Codex also suggests alternative (lock from reviewedItems only) but clearing draft is the minimal fix.

### 3. [P1] BUG-PM-029: Table-code auto-verify cannot retry same code after failure
- **CC**: `lastSentVerifyCodeRef` never cleared on error or cooldown unlock. Fix: clear ref in error-counting effect and cooldown-unlock effect.
- **Codex**: Same finding. Lines 175, 185, 187 — ref set before `verifyTableCode` but never cleared on failure/cooldown/incomplete input. Fix: reset ref on failure, cooldown unlock, and when code is shorter than required length.
- **Consensus**: Full agreement. Codex additionally suggests clearing when input becomes incomplete (< full length), which is a useful extra safeguard. Both approaches compatible.

### 4. [P1] BUG-PM-030: Review-reward banner shows before any dish is reviewable
- **CC**: `shouldShowReviewRewardHint` checks `myOrders?.length > 0` regardless of status. Fix: change to `reviewableItems?.length > 0`.
- **Codex**: Same finding. Line 387 — banner appears with any order, even if nothing ready/served. Fix: gate on ready/served statuses plus `reviewableItems.length > 0`.
- **Consensus**: Full agreement. CC's fix (`reviewableItems?.length > 0`) is cleaner since `reviewableItems` already filters by ready/served status.

## CC Only (Codex missed)
None.

## Codex Only (CC missed)
None.

## Disputes (disagree)
None. Both AI produced identical findings with compatible fix approaches.

## Final Fix Plan
All fixes to apply (all from agreed findings):

1. [P1] BUG-PM-027 — Source: agreed — Change CartView.jsx loyalty section gate from `showLoginPromptAfterRating` to `showLoyaltySection`. Pass `showLoyaltySection` as prop if not already passed.
2. [P1] BUG-PM-028 — Source: agreed — Add `updateDraftRating(itemId, 0)` in `handleRateDish` catch block in x.jsx to roll back draft rating on save failure.
3. [P1] BUG-PM-029 — Source: agreed — Clear `lastSentVerifyCodeRef.current = null` in CartView.jsx: (a) on verification error, (b) on cooldown unlock, (c) when input becomes incomplete.
4. [P1] BUG-PM-030 — Source: agreed — Change `shouldShowReviewRewardHint` condition from `myOrders?.length > 0` to `reviewableItems?.length > 0` in CartView.jsx.

## Summary
- Agreed: 4 items
- CC only: 0 items
- Codex only: 0 items
- Disputes: 0 items
- Total fixes to apply: 4
