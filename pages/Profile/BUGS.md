# Profile — BUGS.md

Page: Profile (partner user profile editor)
File: profile.jsx
RELEASE: 260301-01 profile RELEASE.jsx

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

---

## Active Bugs (not fixed)

### BUG-PF-008 (P2) — autoFocus triggers keyboard on mobile
- **Line:** 231
- **Impact:** Virtual keyboard opens immediately on profile page, pushing content up. Jarring on read-heavy page.

### BUG-PF-010 (P3) — Decorative icons missing aria-hidden
- **Lines:** 150, 179, 187, 212
- **Impact:** Screen readers announce decorative SVG icons.
