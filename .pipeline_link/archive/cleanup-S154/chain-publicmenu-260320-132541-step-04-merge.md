---
chain: publicmenu-260320-132541
chain_step: 4
chain_total: 4
chain_step_name: merge
page: PublicMenu
budget: 1.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: publicmenu-260320-132541
Page: PublicMenu

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/publicmenu-260320-132541-comparison.md
2. Check if discussion report exists: pipeline/chain-state/publicmenu-260320-132541-discussion.md
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
   - git commit -m "fix(PublicMenu): N bugs fixed via consensus chain publicmenu-260320-132541"
   - git push
7. Write merge report to: pipeline/chain-state/publicmenu-260320-132541-merge-report.md

FORMAT for merge report:
# Merge Report — PublicMenu
Chain: publicmenu-260320-132541

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
Fix 4 P2/P3 bugs in PublicMenu (PM-S140-01, PM-S87-03, AC-09, PM-S140-03).

## Files to review
- pages/PublicMenu/base/CartView.jsx
- pages/PublicMenu/base/x.jsx

## Bugs to fix

### PM-S140-01 (P2): Loyalty section crashes if customerEmail is null/undefined
- File: CartView.jsx:905
- Symptom: `.trim()` called directly on `customerEmail` without null check. If user has no email set, the loyalty section throws a runtime error and crashes.
- Fix: Add null/undefined guard before `.trim()` — e.g. `(customerEmail || '').trim()` or optional chaining `customerEmail?.trim() ?? ''`.

### PM-S87-03 (P2): "Send to waiter" button looks green/active when disabled
- File: x.jsx (submit button in cart/order flow)
- Symptom: When table code has not been entered yet, the submit button is functionally disabled but visually looks green and active — same appearance as when it's enabled.
- Fix: Apply `disabled` visual styles (opacity, cursor-not-allowed, muted color) when `disabled` prop is true. Check Tailwind classes on the button — ensure `disabled:opacity-50 disabled:cursor-not-allowed` or equivalent are present.

### AC-09 (P2): No visual feedback when dish added to cart
- File: CartView.jsx or x.jsx (addToCart handler)
- Symptom: When user taps a dish to add it to cart, the item is added successfully but there is no toast, animation, or any visual confirmation. User cannot tell if the tap registered.
- Fix: Add a brief toast notification (e.g. `toast.success(t('cart.item_added'))`) in the addToCart success path. Keep it short (1.5-2s). Do NOT add if dish has required modifiers that open a modal — only for direct-add items.

### PM-S140-03 (P3): Review-reward email setTimeout not cleared on unmount
- File: CartView.jsx:521
- Symptom: A setTimeout for reward-email logic is not cancelled in the useEffect cleanup function. If the component unmounts before the timer fires, React logs a "state update on unmounted component" warning and may cause memory leaks.
- Fix: Store the timer ref (`const timerRef = useRef()`) and clear it in the useEffect return: `return () => clearTimeout(timerRef.current)`.

## Instructions
- Fix all 4 bugs with minimal, targeted changes
- Do NOT refactor unrelated code
- After fixing, update BUGS.md in pages/PublicMenu/ marking all 4 as Fixed
- Git commit: "fix(PublicMenu): PM-S140-01, PM-S87-03, AC-09, PM-S140-03 — null guard, disabled styles, add-to-cart toast, timeout cleanup"
- Git push
=== END ===
