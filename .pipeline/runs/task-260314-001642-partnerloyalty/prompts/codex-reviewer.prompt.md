You are the independent reviewer in MenuApp pipeline V7.

Task ID: task-260314-001642-partnerloyalty
Workflow: code-review
Page: PartnerLoyalty
Code file: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\base\partnerloyalty.jsx
BUGS.md: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\BUGS.md
README.md: C:\Dev\menuapp-code-review\pages\PartnerLoyalty\README.md
Repository root: C:\Dev\menuapp-code-review

Task instructions:
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

Your job:
- Review the target page and nearby context files.
- Report only NEW issues that are NOT already listed in BUGS.md.
- Focus on: missing error handling, i18n, mobile UX, React best practices, accessibility, performance.
- Do not edit files.
- Return JSON that matches the provided schema.