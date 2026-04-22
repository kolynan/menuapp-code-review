---
pipeline: v7
type: bugfix
page: PartnerLoyalty
budget: $10
---

Auto-approve all file edits, terminal commands, and git operations without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.

## BUG-PM-040 (P0): Loyalty points lost on Order.create failure

**Problem:** When Order.create fails (network error, validation error, etc.), loyalty points that were already deducted are NOT restored. The user loses their points without getting an order.

**Expected behavior:** If Order.create fails after loyalty points have been deducted, the points should be restored (rolled back) to the customer's balance.

**Files to review:** pages/PartnerLoyalty/base/partnerloyalty.jsx — and any related order processing logic that handles loyalty point deduction.

**What to do:**
1. Read the code in pages/PartnerLoyalty/base/ and understand the loyalty points deduction flow
2. Find where loyalty points are deducted in relation to Order.create
3. Add error handling: if Order.create fails AFTER points were deducted, restore the points
4. Use try/catch or transaction-like pattern to ensure atomicity
5. Update BUGS.md with the fix details
6. Update README.md with changes summary

IMPORTANT — git commit at the end:
git add pages/PartnerLoyalty/base/*.jsx pages/PartnerLoyalty/BUGS.md pages/PartnerLoyalty/README.md
git commit -m "fix: BUG-PM-040 restore loyalty points on Order.create failure S121"
git push
