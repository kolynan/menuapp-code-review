# Codex Writer Findings - PublicMenu Chain: publicmenu-260324-003211-6767

## Findings
1. [P1] Fix 1 / PM-070: Primary partner lookup errors can still collapse into the not-found path - In `x.jsx:1377-1385`, the primary `Partner.filter(...)` call catches every exception and immediately falls through to the alternate lookup. If the primary lookup fails because of a transient backend problem but the fallback lookup simply returns no rows, the query resolves `null`, which drives the not-found UI in `x.jsx:3148-3152` instead of the retryable `partnerError` state. FIX: only treat explicit 404/not-found failures as not-found; rethrow network/5xx/timeout/unknown errors so the retry UI is shown.
2. [P2] Fix 3 / PM-069: The table-code bottom sheet still has no lockout countdown state or lockout disablement - `useHallTable(...)` is destructured in `x.jsx:1554-1564`, but `codeAttempts`, `codeLockedUntil`, and `nowTs` are not available in this scope. As rendered in `x.jsx:3550-3584`, the bottom sheet can only show `codeVerificationError`, and the input/button are disabled only while `isVerifyingCode` or when the code is too short. Locked-out users still do not get the required `MM:SS` countdown, and the controls are not disabled for the cooldown window. FIX: expose `codeAttempts`, `codeLockedUntil`, and `nowTs` to this render path and use them to show `Please wait MM:SS` plus disable the code input and submit action while `codeLockedUntil > nowTs`.
3. [P3] Fix 5 / PM-112: The redundant Send button is still present in the table-code bottom sheet - The bottom sheet still renders a primary CTA with `tr('cart.confirm_table.submit', ...)` in `x.jsx:3580-3595`. That keeps the manual submit affordance the task explicitly says to remove. FIX: remove this button block entirely and keep the existing auto-submit-on-last-digit behavior unchanged.

## Summary
Total: 3 findings (0 P0, 1 P1, 1 P2, 1 P3)

## Prompt Clarity (MANDATORY - do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None required for this review.
- Scope questions (anything you weren't sure if it's in scope): None.
