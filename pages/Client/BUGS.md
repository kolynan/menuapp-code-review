# Client (ClientLogin) — BUGS

Page: `client.jsx` (65 lines) — Client login form
Last review: 2026-02-25 (initial review)
Reviewed by: Claude (correctness + style)

## Fixed Bugs

_(none — no P0/P1 issues found in this file)_

## Active Bugs

### BUG-CL-001 (P2) — Error key passed directly to t() as i18n key
- **File:** client.jsx:42
- **What:** `{t(error, 'Ошибка')}` passes the raw `error` string from `useClientAuth` as an i18n key. If `error` contains an arbitrary error message (not an i18n key), `t()` won't find a translation and the Russian fallback appears.
- **Impact:** Technical error strings may leak to UI if `useClientAuth` returns raw messages instead of i18n keys.
- **Fix:** Validate that `useClientAuth` always returns i18n-compatible keys, or wrap: `t(error?.startsWith('client.') ? error : 'client.error_generic')`.

### BUG-CL-002 (P3) — Loading spinner lacks aria-label
- **File:** client.jsx:54
- **What:** `<Loader2>` icon has no accessible label. Screen readers announce nothing.
- **Impact:** Accessibility gap for screen reader users.
- **Fix:** Add `aria-label={t('common.loading')} role="status"`.
