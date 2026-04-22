# BUGS.md — acceptinvite

Last updated: 2026-02-27
RELEASE: 260227-00

---

## Fixed Bugs

### BUG-AI-001 | P0 | Already-accepted auth bypass
- **Description:** Already-accepted invite branch redirected any token holder to staff/cabinet page without checking auth or verifying user identity.
- **Root cause:** `already_accepted` check fired before authentication. No user identity verification.
- **Fix:** Moved auth check before already_accepted. Added `link.invited_user !== user.id` verification.
- **Commit:** `93f52e0`, `9e16446`
- **RELEASE:** 260227-00

### BUG-AI-002 | P0 | Partial state corruption on updateMe failure
- **Description:** If `updateMe()` failed, `StaffAccessLink` was already marked as accepted. Link permanently consumed, user never configured. Infinite broken redirect loop.
- **Root cause:** `StaffAccessLink.update()` ran before `updateMe()`. No rollback on failure.
- **Fix:** Reordered: `updateMe()` first, then `StaffAccessLink.update()`. If `updateMe` fails, link stays reusable. If link update fails after successful `updateMe`, treat as success.
- **Commit:** `93f52e0`, `9e16446`
- **RELEASE:** 260227-00

### BUG-AI-003 | P1 | Unknown role permissive fallback
- **Description:** Unknown/misspelled `staff_role` silently mapped to `partner_staff`, granting unintended access.
- **Root cause:** `mapping[staffRole] || 'partner_staff'` — permissive default.
- **Fix:** Changed to `|| null`, added explicit check with error state for unknown roles.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-004 | P1 | handleLogoutAndRetry broken
- **Description:** "Log out and retry" button did nothing — page didn't reload after logout.
- **Root cause:** `window.location.href = window.location.href` doesn't reliably trigger navigation.
- **Fix:** Changed to `window.location.reload()`.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-005 | P1 | Raw error message in UI (i18n violation)
- **Description:** Raw backend error text (`err.message`) shown to users, untranslated.
- **Root cause:** `setError(err.message || t('...'))` passes raw string to UI.
- **Fix:** Always use `setError(t('acceptinvite.error.generic'))`.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-006 | P1 | updateMe error swallowed for staff roles
- **Description:** Non-cabinet staff redirected even when `updateMe` failed. User landed on staff page with wrong `user_role`.
- **Root cause:** `catch` only blocked redirect for cabinet roles.
- **Fix:** All roles treat `updateMe` failure as error (no redirect).
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-007 | P2 | Race condition — concurrent processInvite calls
- **Description:** React StrictMode double-mount or rapid retry clicks caused duplicate API calls.
- **Fix:** Added `processingRef` guard. `handleRetry` also clears pending redirect timer.
- **Commit:** `93f52e0`, `9e16446`
- **RELEASE:** 260227-00

### BUG-AI-008 | P2 | Token not URL-encoded in redirect
- **Description:** Token with special characters could break redirect URL.
- **Fix:** `encodeURIComponent(token)` in `getRedirectUrl()`.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-009 | P2 | setTimeout no cleanup on unmount
- **Description:** Redirect timers fired after component unmount.
- **Fix:** `scheduleRedirect()` helper with `timeoutRef`, cleanup in `useEffect` return.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-010 | P2 | console.error in production code
- **Description:** Two `console.error` calls left in production code (lines 180, 202).
- **Fix:** Removed both.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-011 | P2 | Inline handler in rate_limit button
- **Description:** Inline anonymous arrow function as onClick with setTimeout side effect.
- **Fix:** Extracted to named `handleRetry()` function.
- **Commit:** `93f52e0`
- **RELEASE:** 260227-00

### BUG-AI-012 | P2 | already_accepted check incomplete
- **Description:** Edge case: if `invite_accepted_at` set but `invited_user` null (data corruption), link could be re-accepted by different user.
- **Fix:** Check `invite_accepted_at` alone as evidence of prior acceptance.
- **Commit:** `9e16446`
- **RELEASE:** 260227-00

---

## Active Bugs

None currently known.

---

## Notes

- New i18n key required: `acceptinvite.error.invalid_role`
- Server-side enforcement of invite logic recommended but not possible on Base44 platform (Codex P0 finding, deferred)
