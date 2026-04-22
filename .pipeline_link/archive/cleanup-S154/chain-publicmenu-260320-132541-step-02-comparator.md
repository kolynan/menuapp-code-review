---
chain: publicmenu-260320-132541
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: PublicMenu
budget: 1.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: publicmenu-260320-132541
Page: PublicMenu

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/publicmenu-260320-132541-cc-findings.md
2. Read Codex findings: pipeline/chain-state/publicmenu-260320-132541-codex-findings.md
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/publicmenu-260320-132541-comparison.md

FORMAT:
# Comparison Report — PublicMenu
Chain: publicmenu-260320-132541

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

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
