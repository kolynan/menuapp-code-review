# CC Writer Findings — PublicMenu
Chain: publicmenu-260320-010828

## Findings

1. [P1] BUG-PM-027: Loyalty/discount UI hidden for normal checkout — Loyalty section in CartView.jsx gated on `showLoginPromptAfterRating` (requires loyalty_enabled + no account + rating block + draft rating) instead of `showLoyaltySection` (requires loyalty_enabled || discount_enabled + cart items). Email entry, balance display, and point redemption unavailable for fresh cart. FIX: Added `showLoyaltySection` to CartView props, changed gate from `showLoginPromptAfterRating` to `showLoyaltySection`.

2. [P1] BUG-PM-028: Failed star-rating saves leave dishes permanently locked — In x.jsx handleRateDish, item marked read-only when draftRating > 0, but async DishFeedback.create can fail. Catch block only shows error toast, never clears draftRating, so user cannot retry. FIX: Added `updateDraftRating(itemId, 0)` in catch block to roll back draft rating on save failure.

3. [P1] BUG-PM-029: Table-code auto-verify cannot retry same code after failure — `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Auto-verify effect skips code if `safe === lastSentVerifyCodeRef.current`, so transient API failure permanently blocks that code. FIX: Clear `lastSentVerifyCodeRef.current = null` in error-counting effect and in cooldown-unlock effect.

4. [P1] BUG-PM-030: Review-reward banner shows before any dish is reviewable — `shouldShowReviewRewardHint` checked `myOrders?.length > 0` regardless of order status. Guests see "+N за отзыв" prompt before anything is ready/served. FIX: Changed condition to `reviewableItems?.length > 0` which already filters for ready/served status orders.

## Summary
Total: 4 findings (0 P0, 4 P1, 0 P2, 0 P3)
All 4 bugs fixed and committed: 4d68d88
