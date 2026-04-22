---
chain_template: consensus-with-discussion
page: PublicMenu
budget_per_step: 4
---
Fix 4 P1 bugs in CartView.jsx and x.jsx (BUG-PM-027, 028, 029, 030).

## Files to review
- pages/PublicMenu/base/CartView.jsx
- pages/PublicMenu/base/x.jsx

## Bugs to fix

### BUG-PM-027 (P1): Loyalty/discount UI hidden for normal checkout
- File: CartView.jsx:859, x.jsx:1937,3295
- Symptom: Loyalty section gated on `showLoginPromptAfterRating` instead of `showLoyaltySection`. Email entry, balance display, and point redemption unavailable until after a dish rating exists (never for fresh cart).
- Fix: Use `showLoyaltySection` for checkout loyalty UI; keep `showLoginPromptAfterRating` only for the review nudge prompt.

### BUG-PM-028 (P1): Failed star-rating saves leave dishes permanently locked
- File: CartView.jsx:705,720,725; x.jsx:2039
- Symptom: Item marked read-only when draftRating > 0, but async save can fail. Nothing clears the draft on failure, so user cannot retry rating.
- Fix: Roll back draft rating on save failure (clear draftRating in catch block), or only lock from confirmed `reviewedItems`.

### BUG-PM-029 (P1): Table-code auto-verify cannot retry same code after failure
- File: CartView.jsx:174,184
- Symptom: `lastSentVerifyCodeRef` never cleared on error or after cooldown unlock. Transient API failure forces guest to change digits to retry the same code.
- Fix: Clear `lastSentVerifyCodeRef` on failed verification, on cooldown unlock, and when input becomes incomplete (< full length).

### BUG-PM-030 (P1): Review-reward banner shows before any dish is reviewable
- File: CartView.jsx:386
- Symptom: "+N за отзыв" hint shows when `myOrders.length > 0` regardless of order status. Guests see reward prompt before anything is ready/served.
- Fix: Gate banner on ready/served statuses AND `reviewableItems.length > 0`. See also BUG-PM-021 regression risk.

## Instructions
- Fix all 4 bugs with minimal, targeted changes
- Do NOT refactor unrelated code
- After fixing, update BUGS.md in pages/PublicMenu/ marking all 4 as Fixed
- Git commit with message: "fix(PublicMenu): BUG-PM-027,028,029,030 — loyalty gate, rating rollback, code retry, reward banner"
- Git push
