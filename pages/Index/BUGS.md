# Index — BUGS.md

Page: Index (public landing page)
File: index.jsx
RELEASE: 260225-00 index RELEASE.jsx

---

## Fixed Bugs

### BUG-IX-001 (P1) — No i18n: all text hardcoded Russian
- **Commit:** `2fe776a`
- **RELEASE:** 260225-00
- **Problem:** All 13 user-facing strings were hardcoded Russian — no `useI18n` import, no `t()` calls. Non-Russian users see untranslated landing page.
- **Fix:** Added `useI18n` import, replaced all 13 strings with `t()` calls. Key format: `index.section.element`.

### BUG-IX-002 (P1) — handleLogin no error handling
- **Commit:** `c2bbed0`
- **RELEASE:** 260225-00
- **Problem:** `base44.auth.redirectToLogin()` called without try/catch. If auth service is down, user gets no feedback.
- **Fix:** Wrapped in try/catch with `toast.error(t("toast.error"))`.

### BUG-IX-003 (P1) — Unused useNavigate import
- **Commit:** `6c55471`
- **RELEASE:** 260225-00
- **Problem:** `useNavigate` imported and called but `navigate` never used anywhere in the component. Dead code.
- **Fix:** Removed import and call.

### BUG-IX-004 (P1) — No double-click protection on login buttons
- **Commit:** `6c55471`
- **RELEASE:** 260225-00
- **Problem:** 4 login buttons all call `handleLogin` async with no in-flight guard. Multiple concurrent `redirectToLogin` calls possible.
- **Fix:** Added `isLoggingIn` state, guard in handler, `disabled={isLoggingIn}` on all 4 buttons.

---

## Active Bugs (P2/P3 — not fixed)

### BUG-IX-005 (P2) — Feature card `key={idx}` uses array index
- **Lines:** 81
- **Impact:** Static array so no bug today, but index keys are fragile if array ever changes.

### BUG-IX-006 (P2) — Features array not memoized
- **Lines:** 22-38
- **Impact:** Array re-created every render with 6 `t()` calls. Minor performance on a simple page.

### BUG-IX-007 (P3) — Decorative icons missing aria-hidden
- **Lines:** 66, 85
- **Impact:** Screen readers announce decorative SVG icons.

### BUG-IX-008 (P3) — Sections missing aria-label
- **Lines:** 76, 98
- **Impact:** Landmark sections unnamed for screen readers.
