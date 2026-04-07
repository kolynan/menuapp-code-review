# Codex Writer Findings — PublicMenu Chain: publicmenu-260323-103001-4112

## Findings
1. [P1] Fix 1 / PM-070: Partner lookup still collapses backend failures into "restaurant not found" — `publicPartner` swallows both lookup exceptions and returns `null` from both catch blocks (`pages/PublicMenu/x.jsx:1324-1347`), while the render path only checks `!partner` and always shows `t('error.partner_not_found')` (`pages/PublicMenu/x.jsx:3042-3046`). A transient backend/network failure therefore lands on the permanent dead-end not-found card instead of a retryable state. FIX: Preserve whether both lookup attempts threw, expose that as `partnerNetworkError` plus `refetch`, and split the `!partner && !loadingPartner` UI into retryable network-error vs true not-found paths.
2. [P1] Fix 2 / PM-074: OrderStatusScreen still treats fetch errors as invalid tokens — the order query returns `null` for a real not-found order (`pages/PublicMenu/x.jsx:897-905`), but the render logic combines `orderError` and `!order` in one branch (`pages/PublicMenu/x.jsx:1032-1043`). When the backend request fails, users with a valid tracking token still see the permanent `order_status.not_found` UI with no retry path. FIX: Split `if (orderError || !order)` into separate error and not-found branches; the error branch should show a retryable message/button wired to `refetchOrder()`, while the `!order` branch keeps the existing not-found UI.
3. [P2] Fix 4 / PM-069: Bottom sheet still keeps the wrong code visible and exposes no lockout countdown — the sheet only renders `codeVerificationError` after a failed verify (`pages/PublicMenu/x.jsx:3450-3458`), and the hall-verification hook data pulled into `x.jsx` does not include `codeAttempts`, `codeLockedUntil`, or any countdown state (`pages/PublicMenu/x.jsx:1510-1523`). As a result, the wrong digits stay in the 4-cell input until the user deletes them manually, and repeated failures still give no "try again in N sec" feedback in the bottom sheet. FIX: Add a short failure-driven clear of `tableCodeInput` after a wrong code (~500ms), and surface `codeLockedUntil`/countdown state into `x.jsx` so the sheet can render the existing locked/cooldown message with remaining seconds.
4. [P2] Fix 5 / PM-075: Auto-submit timeout is still untracked and never cleaned up — the verification effect schedules `setTimeout(() => handleSubmitOrder(), 100)` directly (`pages/PublicMenu/x.jsx:2096-2103`) and does not store or clear the timer on re-render/unmount. If the component unmounts or the verification state changes inside that 100ms window, the stale callback can still submit against outdated state or double-submit. FIX: Introduce `autoSubmitTimerRef`, clear any existing timer before scheduling, store the new timeout ID, and return a cleanup that clears it.

## Summary
Total: 4 findings (0 P0, 2 P1, 2 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): none.
- Missing context (what info would have helped): none.
- Scope questions (anything you weren't sure if it's in scope): none.
