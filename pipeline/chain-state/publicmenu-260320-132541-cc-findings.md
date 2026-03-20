# CC Writer Findings — PublicMenu
Chain: publicmenu-260320-132541

## Findings

1. [P2] PM-S140-01: customerEmail.trim() crashes if customerEmail is null/undefined — In CartView.jsx, `customerEmail` is used with `.trim()` at lines 912 and 976 without null/undefined guards. If the prop is not provided or is null, calling `.trim()` throws a TypeError, crashing the loyalty section rendering. Line 388 already uses `String(customerEmail).trim()` safely, but lines 912 and 976 do not. FIX: Replace `customerEmail.trim()` with `(customerEmail || '').trim()` on both lines 912 and 976. Alternatively use `String(customerEmail || '').trim()`.

2. [P2] PM-S87-03: Submit button appears green when isTableVerified is undefined (not yet verified) — In CartView.jsx lines 1232-1247, both the `disabled` prop and the className ternary use strict `isTableVerified === false`. When `isTableVerified` is `undefined` (initial state, before any verification attempt), the check `isTableVerified === false` evaluates to `false`, so the button appears green (enabled styling) and is NOT disabled. The button should be disabled and gray when the table code has not been entered yet. FIX: Change `isTableVerified === false` to `!isTableVerified` (or `isTableVerified !== true`) in BOTH the disabled prop (line 1247) and the className ternary (line 1237). This ensures the button is disabled and gray-styled until verification succeeds.

3. [P2] AC-09: No visual feedback when dish added to cart — ALREADY FIXED. In x.jsx line 2237-2238, a toast notification is already present: `toast.success(t('cart.item_added'), { id: 'cart-add', duration: 2000 })`. This bug appears to have been resolved in a prior session. FIX: None needed — already implemented.

4. [P3] PM-S140-03: setTimeout in reward-email onClick not cleared on unmount — In CartView.jsx line 528, a `setTimeout(() => { setRewardEmailSubmitting(false); setShowRewardEmailForm(false); }, 1000)` is used inside an onClick handler. If the component unmounts before the 1000ms timer fires, React will attempt state updates on an unmounted component (warning + potential memory leak). FIX: Use a ref to store the timeout ID and clear it on unmount. Add `const rewardTimerRef = React.useRef(null)` near other refs, store the timeout: `rewardTimerRef.current = setTimeout(...)`, and add a cleanup useEffect: `React.useEffect(() => () => clearTimeout(rewardTimerRef.current), [])`.

5. [P3] CC-NEW-01: rewardEmail.trim() on line 520 could crash if rewardEmail is somehow set to non-string — In CartView.jsx line 520, `rewardEmail.trim()` is used in the disabled prop and line 522. Since `rewardEmail` is initialized as `''` (line 84) and only set via `setRewardEmail(e.target.value)`, this is low risk. However, for consistency with the PM-S140-01 fix pattern, it would be safer to use `(rewardEmail || '').trim()`. FIX: Optional — change `rewardEmail.trim()` to `(rewardEmail || '').trim()` on lines 520 and 522 for defensive consistency.

## Summary
Total: 5 findings (0 P0, 0 P1, 3 P2, 2 P3)
- 1 finding (AC-09) already fixed in prior session — no action needed
- 4 findings require fixes: PM-S140-01 (2 locations), PM-S87-03 (2 locations), PM-S140-03, CC-NEW-01 (optional)
