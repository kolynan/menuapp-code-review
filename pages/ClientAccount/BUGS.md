# ClientAccount — BUGS

Page: `clientaccount.jsx` (165 lines) — Client account/balance page
Last review: 2026-02-25 (initial review)
Reviewed by: Claude (correctness + style)

## Fixed Bugs

_(none — no P0/P1 issues found in this file)_

## Active Bugs

### BUG-CA-001 (P2) — Email source inconsistency with ClientMessages
- **File:** clientaccount.jsx:20-23
- **What:** This page reads email from URL params (`window.location.search`), while ClientMessages reads from `localStorage`. If the login hook stores in localStorage but this page reads from URL, the back button from ClientMessages → ClientAccount navigates to `/clientaccount` without `?email=`, causing redirect to login.
- **Impact:** Broken back navigation from messages to account page (if user navigates directly).
- **Fix:** Standardize to use `localStorage.getItem('loyalty_client_email')` like ClientMessages does, or use React Router's `useSearchParams`.

### BUG-CA-002 (P2) — handleLogout doesn't clear stored email
- **File:** clientaccount.jsx:98-100
- **What:** `handleLogout` only calls `navigate('/client')` without clearing localStorage. On shared devices, the next user could see the previous user's data.
- **Impact:** Privacy issue on shared/public devices.
- **Fix:** Add `localStorage.removeItem('loyalty_client_email')` before navigate.

### BUG-CA-003 (P2) — Magic number 365 for default expiry days
- **File:** clientaccount.jsx:54
- **What:** `|| 365` is a hardcoded business rule constant.
- **Impact:** If default expiry changes, requires finding all occurrences.
- **Fix:** Extract to `const DEFAULT_EXPIRY_DAYS = 365;` at top of file.

### BUG-CA-004 (P2) — handleLogout defined after early returns
- **File:** clientaccount.jsx:98
- **What:** `const handleLogout` is declared after three early `return` blocks (lines 60-95). While not a bug (it's a plain function, not a hook), it invites hook-after-return errors on future edits.
- **Impact:** Maintenance risk — future developer might add a hook after the early returns.
- **Fix:** Move `handleLogout` above the first early return (before line 60).

### BUG-CA-005 (P3) — useMemo for email with empty deps
- **File:** clientaccount.jsx:20-23
- **What:** `useMemo(() => new URLSearchParams(window.location.search).get('email'), [])` reads `window.location` as a side effect inside memo. Should use React Router's `useSearchParams`.
- **Impact:** Won't update if URL changes without remount.
- **Fix:** Use `useSearchParams` from react-router-dom.
