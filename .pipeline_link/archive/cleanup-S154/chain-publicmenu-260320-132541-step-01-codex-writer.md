---
chain: publicmenu-260320-132541
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: PublicMenu
budget: 3.00
runner: codex
type: chain-step
---
Review the file pages/PublicMenu/base/*.jsx for bugs in a React restaurant QR-menu app on Base44 platform.
Also check pages/PublicMenu/README.md and pages/PublicMenu/BUGS.md for context (ONLY these 3 files, nothing else).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the 3 files above. Do NOT search the repo, do NOT read old findings, do NOT read files outside pages/PublicMenu/.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

Find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/publicmenu-260320-132541-codex-findings.md

FORMAT:
# Codex Writer Findings — PublicMenu
Chain: publicmenu-260320-132541

## Findings
1. [P0] Title — Description. FIX: ...
2. [P1] Title — Description. FIX: ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

Do NOT apply fixes — only document findings.

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
