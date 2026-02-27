# Code Review Report: PartnerLoyalty

**File:** `pages/PartnerLoyalty/partnerloyalty.jsx` (397 lines after fix)
**Date:** 2026-02-24
**Reviewed by:** Claude (correctness + style) + Codex (independent review)
**Rounds:** 1 analysis + 1 post-fix verification

---

## Summary

Loyalty program settings page with 5 configuration cards + statistics. Three P1 bugs found and fixed: useEffect form reset on refetch (data loss), hasChanges false-negative for null fields, and NaN/invalid values passing validation. Clean PartnerShell pattern, good i18n.

---

## Fixed Issues

### BUG-PL-001 (P1) — useEffect resets form on every React Query refetch
- **Lines:** 63-78 (original)
- **Impact:** Background refetch (window focus, stale-time) triggers `useEffect([partner])`, overwriting unsaved user edits with server values. Silent data loss during editing.
- **Fix:** Added `useRef` guard (`formSeeded`). Form is only seeded once on initial load. After successful save, `formSeeded.current = false` allows re-seeding with server-normalized values.
- **Consensus:** All 3 reviewers agreed (Claude P1, Codex P1).

### BUG-PL-002 (P1) — hasChanges false-negative for null/undefined fields
- **Lines:** 101-104 (original)
- **Impact:** `partner[key] ?? formData[key]` compares `formData[key]` against itself when server field is null/undefined → always returns false. Save button stays disabled even after valid edits to new/null fields.
- **Fix:** Changed to `String(partner[key] ?? null) !== String(formData[key] ?? null)` — correctly detects changes regardless of server field presence.
- **Consensus:** Claude P1, Style P2, Codex P2. Fixed as P1 due to broken save button.

### BUG-PL-003 (P1) — NaN/invalid values can be saved to backend
- **Lines:** 150, 178, 201, 218, 241, 280 (inputs)
- **Impact:** `Number("")` = 0 (harmless), `Number("abc")` = NaN (corrupts loyalty calculations). No validation before `saveMutation.mutate(formData)`.
- **Fix:** Added `NUMERIC_FIELDS` validation in `handleSave`. Checks for NaN, negative, empty. Also: `loyalty_expiry_days` requires >= 1 (0 days = instant expiry).
- **Consensus:** Claude P1, Codex P1.

Also removed `console.error(err)` from onError handler (P2 cleanup).

---

## Active Issues (P2-P3, not fixed)

### P2: saveStatus duplicates saveMutation.isPending
- **Lines:** 32, 96-98
- Manual `"idle"/"saving"/"success"` state machine parallels mutation's built-in pending state. Could drift.
- **Recommendation:** Use `saveMutation.isPending` for save guard, keep only `isSaved` boolean for 2-second green check.

### P2: NUMERIC_FIELDS declared inside function body
- **Lines:** 101-104 (after fix)
- Static constant recreated on every `handleSave` call. Should be module-scope.

### P2: String() coercion in hasChanges is fragile
- **Lines:** 122-129
- Works for current types but could surprise future maintainers. Direct `!==` comparison would suffice for booleans/numbers/null.

### P2: saveStatus magic strings ("idle", "saving", "success")
- **Lines:** various
- Should be named constants.

---

## Statistics
- Total issues found: 7 (P0: 0, P1: 3, P2: 4, P3: 0)
- Issues fixed: 3 (all P1) + 1 P2 cleanup
- Lines of code: 397
