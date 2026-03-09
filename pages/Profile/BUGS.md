# Profile — BUGS.md

Page: Profile (partner user profile editor)
File: profile.jsx
RELEASE: 260301-01 profile RELEASE.jsx

---

## S101 Session (2026-03-09) — 12 bugs applied from S100 analysis

All 6 P1 and 6 P2 bugs from S100 (cc-analysis-task-260308-114704) were verified applied.
S100 commit: `4e9c943` | BACK_ROUTE constant: `de3fc98`
RELEASE: 260309-00 (pending merge with Codex)

Fixed bugs: BUG-PF-002, BUG-PF-004, BUG-PF-005, BUG-PF-007, BUG-PF-008,
            BUG-PF-011, BUG-PF-012, BUG-PF-013, BUG-PF-014, BUG-PF-018,
            BUG-PF-021 (x2: back + save buttons)

---

## Fixed Bugs

### BUG-PF-001 (P1) — No error state when auth.me() fails
- **Commit:** `efed5bd`
- **RELEASE:** 260225-00
- **Problem:** If `base44.auth.me()` throws, user sees empty profile form with no explanation — empty email, blank role badge, editable empty name field.
- **Fix:** Added `loadError` state. On failure, shows error icon + message + back button instead of the empty form.

### BUG-PF-002 (P1) — Non-standard toast key `toast.profile_saved`
- **Commit:** `fa229c5`
- **RELEASE:** 260225-00
- **Problem:** Used `t("toast.profile_saved")` instead of project-standard `t("toast.saved")`. Key likely not in catalogue.
- **Fix:** Changed to `t("toast.saved")`.

### BUG-PF-003 (P1) — getRoleLabel exposes raw DB enum
- **Commit:** `fa229c5`
- **RELEASE:** 260225-00
- **Problem:** `t(...) || userRole` fallback could show raw values like `partner_owner` to users. Also, `undefined` role produced empty badge.
- **Fix:** Added null guard: `if (!userRole) return t("profile.role.unknown")`. Removed `|| userRole` fallback.

### BUG-PF-004 (P1) — useEffect depends on `t` causing re-fetch
- **Commit:** `fa229c5`
- **RELEASE:** 260225-00
- **Problem:** `useEffect(..., [t])` — if `t` reference changes on language switch, entire data loading runs again, potentially overwriting unsaved edits.
- **Fix:** Changed to `[]` with eslint-disable comment.

### BUG-PF-011 (P1) — Missing PartnerShell wrapper
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** Partner-area page navigates to /partnerhome but doesn't use PartnerShell wrapper pattern. Violates Base44 structural convention.
- **Fix:** Renamed component to ProfileContent(), added default export Profile() wrapping in PartnerShell. Imported PartnerShell.

### BUG-PF-012 (P1) — hasChanges comparison is asymmetric (trim on one side only)
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** `fullName.trim() !== initialFullName` — trim on one side only. If server returns name with whitespace, hasChanges is true on load.
- **Fix:** Trim initialFullName at the source: `(userData.full_name || "").trim()`.

### BUG-PF-013 (P1) — setTimeout without cleanup on unmount
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** After save, 2-second timer resets saveStatus. If user navigates away, setSaveStatus fires on unmounted component.
- **Fix:** Added `useRef` for timer ID + cleanup `useEffect` on unmount.

### BUG-PF-014 (P1) — Race condition: no unmount guard on async data loading
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** useEffect async operations have no isMounted guard. State updates fire on unmounted component.
- **Fix:** Added `let isMounted = true` guard with cleanup return.

### BUG-PF-005 (P2) — console.error in production (3 places)
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** Debug noise, potential information leak via DevTools.
- **Fix:** Removed all 3 console.error calls.

### BUG-PF-006 (P2) — initialFullName not trimmed on load
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** If API returns name with trailing spaces, `hasChanges` is falsely `true` without user edits.
- **Fix:** Trim at source (merged with BUG-PF-012 fix).

### BUG-PF-007 (P2) — `profile.fullName` key uses camelCase
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** Violates project convention of snake_case keys.
- **Fix:** Changed to `t("profile.full_name")`.

### BUG-PF-009 (P2) — Save button blocked 2s after success / setTimeout no cleanup
- **Commit:** `1307ec9`
- **RELEASE:** 260227-01
- **Problem:** setTimeout has no unmount cleanup, could fire on unmounted component.
- **Fix:** Timer cleanup via useRef (merged with BUG-PF-013 fix).

### BUG-PF-015 (P2) — Partner load failure silently swallowed
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** If partner entity fetch fails, user sees "no restaurant" instead of an error indicator.
- **Fix:** Added `isPartnerLoadFailed` state. Shows `t("profile.restaurant_load_error")` when partner fetch fails.

### BUG-PF-016 (P2) — Hardcoded route string repeated
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** "/partnerhome" string used in 2 places.
- **Fix:** Extracted `const BACK_ROUTE = "/partnerhome"`.

### BUG-PF-017 (P2) — Boolean state missing is/has prefix
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** `loadError` doesn't follow `isXxx` convention.
- **Fix:** Renamed to `isLoadError` / `setIsLoadError`.

### BUG-PF-018 (P2) — Magic string "global_admin"
- **Commit:** `fe08f38`
- **RELEASE:** 260227-01
- **Problem:** Hardcoded string in comparison, not extractable/searchable.
- **Fix:** Extracted `const GLOBAL_ADMIN_PARTNER = "global_admin"`.

### BUG-PF-019 (P1) — i18n keys displayed as raw text
- **RELEASE:** 260228-00
- **Problem:** If translation key is missing from locale, `t('profile.full_name')` shows raw key string `profile.full_name` to the user.
- **Fix:** Created `tr()` wrapper that falls back to human-readable text from last key segment (e.g., `full_name` -> `Full Name`). All `t()` calls replaced with `tr()`.

### BUG-PF-020 (P2) — Save button not visible without scrolling on mobile
- **RELEASE:** 260228-00
- **Problem:** Save button at bottom of Card content — on mobile, user must scroll past all fields to find it.
- **Fix:** Moved Save button to a sticky footer (`sticky bottom-0`) outside the Card. Uses flex column layout to push footer to bottom even on short content. Does not overlap bottom navigation.

### BUG-PF-021 (P2) — Touch targets below 44px minimum
- **RELEASE:** 260228-00
- **Problem:** Back button (`size="sm"`, ~32px height) and Save button (default ~40px) below 44px mobile minimum.
- **Fix:** Added `min-h-[44px]` to both Back button and Save button.

### BUG-PF-022 (P1) — tr() fallback crashes on non-string input
- **RELEASE:** 260301-00 (Phase 1v2, CC+Codex)
- **Problem:** If `t(key)` returns undefined, null, or object, tr() could render blank text or crash with "Objects are not valid as a React child".
- **Fix:** Added type guards: check key is string, check val is non-empty string before returning.

### BUG-PF-023 (P1) — Sticky save bar unreliable on iOS Safari
- **RELEASE:** 260301-00 (Phase 1v2, CC+Codex)
- **Problem:** `sticky bottom-0` can be hidden behind iOS Safari dynamic toolbar/keyboard. No safe-area inset.
- **Fix:** Changed to `fixed inset-x-0 bottom-0 z-20` with `pb-[max(1rem,env(safe-area-inset-bottom))]`. Added spacer div for content.

### BUG-PF-024 (P2) — Error-state Back button below 44px touch target
- **RELEASE:** 260301-00 (Phase 1v2, CC+Codex)
- **Problem:** Error screen Back button used `size="sm"` without min-height, below 44px minimum.
- **Fix:** Added `min-h-[44px] min-w-[44px]` classes.

### BUG-PF-025 (P2) — Input fields below 44px touch target
- **RELEASE:** 260301-00 (Phase 1v2, CC+Codex)
- **Problem:** Full Name and Email inputs use default shadcn height (~40px), below 44px mobile minimum.
- **Fix:** Added `min-h-[44px]` to both Input components.

### BUG-PF-026 (P0) — PartnerShell named import causes crash
- **RELEASE:** 260301-01
- **Problem:** `import { PartnerShell }` uses named import, but PartnerShell.jsx uses `export default`. Causes `SyntaxError: does not provide an export named 'PartnerShell'` at runtime. B44 had to auto-fix after deploy.
- **Fix:** Changed to `import PartnerShell from "@/components/PartnerShell"` (default import).

### BUG-PR-S83-04 (P1) — "Full Name" label shown in English
- **Line:** 175
- **RELEASE:** 260306-00
- **Problem:** `t("profile.fullName")` had no fallback. If key missing from locale, raw English "Full Name" shown instead of Russian.
- **Fix:** Added fallback: `t("profile.fullName", "Полное имя")`. Also added fallback to `t("common.loading", "Загрузка...")` on line 115. Key added to `i18n_pending.csv`.
- **Status:** FIXED

### BUG-PR-S83-04v2 (P1) — i18n keys still shown as raw text (regression)
- **RELEASE:** 260306-02
- **Problem:** Previous fix used `t("key", "fallback")` but `t()` ignores the second argument — it returns the key string when translation missing. All labels still showed raw keys like `profile.fullName`.
- **Fix:** Added `tr()` wrapper function (same pattern as CartView) that detects when `t()` returns the key itself and falls back to human-readable Russian text. All `t()` calls converted to `tr()` with fallbacks: fullName, email, role, restaurant, save/saved/saving, back, title, toast messages.
- **Status:** FIXED

---

### BUG-PF-008 (P2) — autoFocus triggers keyboard on mobile
- **RELEASE:** 260308-00 (S101, CC)
- **Problem:** Virtual keyboard opens immediately on profile page, pushing content up. Jarring on read-heavy page.
- **Fix:** Removed autoFocus from fullName Input. (Was already applied in base file from S100.)

---

## Active Bugs (not fixed)

### BUG-PF-010 (P3) — Decorative icons missing aria-hidden
- **Lines:** 150, 179, 187, 212
- **Impact:** Screen readers announce decorative SVG icons.

---

## S105 Session (2026-03-09) — 5 bugs fixed from S104 analysis

All 5 bugs found by Codex in S104 (PR-S104-01..05) applied by CC in S105.
Commit: `fix: Profile PR-S104-01..05 (unmount guard, loading states, a11y fixes)`

### PR-S104-01 (P2) — handleSave() without unmount guard
- **RELEASE:** S105
- **Problem:** If user navigates away during save, resolved promise calls `setInitialFullName`, `setSaveStatus`, `toast` on unmounted component → memory leak + React warning.
- **Fix:** Added `isMountedRef = useRef(true)` set to `false` in cleanup. Guard all state updates in `handleSave` with `if (!isMountedRef.current) return;`. Also guards `setSaveStatus("idle")` inside setTimeout.
- **Status:** FIXED

### PR-S104-02 (P2) — Partner.get() blocks full screen spinner
- **RELEASE:** S105
- **Problem:** `isLoading=true` during both user AND partner data load. Full-screen spinner shown unnecessarily while partner name loads (user data already available).
- **Fix:** Replaced `isLoading` with `isUserLoading` + `isPartnerLoading`. `setIsUserLoading(false)` called immediately after user data loads (before partner fetch). Partner section shows small inline `Loader2` spinner during `isPartnerLoading`.
- **Status:** FIXED

### PR-S104-03 (P3) — Orphaned `<Label>` for static text
- **RELEASE:** S105
- **Problem:** `<Label>` used for role and restaurant display (no `htmlFor`). Invalid markup for screen readers.
- **Fix:** Replaced with `<p className="text-sm font-medium">` for role and restaurant headings. Full Name and Email `<Label htmlFor=...>` remain unchanged.
- **Status:** FIXED

### PR-S104-04 (P3) — No `<form>` wrapper
- **RELEASE:** S105
- **Problem:** Pressing Enter in name input does not submit. Mobile IME "Go" button does not trigger save.
- **Fix:** Wrapped `CardContent` children in `<form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>`. Changed Save button to `type="submit"`, removed `onClick`.
- **Status:** FIXED

### PR-S104-05 (P3) — Loading state without aria attributes
- **RELEASE:** S105
- **Problem:** Screen readers not notified when page is loading.
- **Fix:** Added `role="status"` and `aria-live="polite"` to the full-page loading container div.
- **Status:** FIXED
