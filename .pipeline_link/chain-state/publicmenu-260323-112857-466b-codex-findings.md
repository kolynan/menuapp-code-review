# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-112857-466b

## Findings
1. [P2] Auto-submit timeout is still untracked — `x.jsx:2096-2103` schedules `setTimeout(() => handleSubmitOrder(), 100)` inside a `useEffect`, but the timeout id is never stored or cleared. If the component unmounts or the verification state changes during that 100ms window, the stale callback can still submit against outdated state. FIX: add `autoSubmitTimerRef`, clear any existing timer before scheduling, store the new timeout id, and return an effect cleanup that calls `clearTimeout(autoSubmitTimerRef.current)`.
2. [P1] Partner lookup still masks backend failures as "restaurant not found" — `x.jsx:1324-1347` catches both partner lookup failures and returns `null`, and `x.jsx:3064-3068` treats every `!partner` result as `error.partner_not_found`. A transient backend/network failure therefore sends a valid QR-code user into a dead-end not-found screen with no retry path. FIX: preserve a separate `partnerNetworkError` flag when both lookups throw, expose `refetch` from the partner query, and split the guard so backend failures render a retryable load-error card while true empty results keep the existing not-found UI.
3. [P1] OrderStatusScreen still collapses fetch errors into the not-found state — `x.jsx:1033-1042` uses `if (orderError || !order)` and always renders `order_status.not_found`. A valid order token with a transient fetch failure is therefore shown as permanently invalid, with no retry action. FIX: split this into separate `if (orderError)` and `if (!order)` branches, keep the current null-result UI for invalid/expired tokens, and add a retryable load-error UI that calls `refetchOrder()`.
4. [P2] Table-code Bottom Sheet still lacks the requested retry UX for wrong-code attempts — In `x.jsx:3440-3481`, the Bottom Sheet only mirrors `tableCodeInput` and `codeVerificationError`; there is no delayed `setTableCodeInput("")`, so a wrong 4-digit entry stays in the fields until the user deletes it manually. The same Bottom Sheet also has no access to `codeAttempts` / `codeLockedUntil`, while that lockout state still lives locally in `CartView.jsx:100-151`, so repeated failures do not show any cooldown countdown in the Bottom Sheet. FIX: add a cleanup-safe ~500ms clear of `tableCodeInput` after failed verification, and lift/pass the lockout state into `x.jsx` so the Bottom Sheet can render the remaining cooldown time.

## Summary
Total: 4 findings (0 P0, 2 P1, 2 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): None.
