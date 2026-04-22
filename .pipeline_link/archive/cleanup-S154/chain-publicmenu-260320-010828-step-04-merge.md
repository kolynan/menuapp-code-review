---
chain: publicmenu-260320-010828
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 2.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260320-010828
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260320-010828-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260320-010828-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/PublicMenu/base/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
5. After applying fixes:
   a. Update BUGS.md in pages/PublicMenu/ with fixed items
   b. Update README.md in pages/PublicMenu/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260320-010828"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260320-010828-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260320-010828

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- Commit: <hash>

=== TASK CONTEXT ===
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
=== END ===
