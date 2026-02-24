# PartnerSettings Bug Tracker

**Page:** `pages/PartnerSettings/partnersettings.jsx`
**Last updated:** 2026-02-24

---

## Fixed Bugs

### BUG-PS-001 / BUG-PS-002 (P1) -- Shared saving boolean race condition
- **Line:** 1623
- **Fix:** Replaced `useState(false)` with `useState(0)` counter pattern
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-003 (P1) -- deleteContact missing optimistic rollback
- **Line:** 1925-1934
- **Fix:** Snapshot before optimistic delete, restore on error, plus saving guard
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-004 (P1) -- saveContactViewMode missing pid guard
- **Line:** 1839-1855
- **Fix:** Added `if (!pid) return;` at top of function
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-005 (P1) -- Stale rates closure in CurrenciesSection
- **Line:** 1237
- **Fix:** Added `ratesRef` to track latest value, `saveRate` reads from ref
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-006 (P1) -- Hardcoded Russian i18n fallback strings
- **Lines:** 771,774,788,792,806,810,824,932
- **Fix:** Removed all 8 `|| "Russian text"` fallbacks
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-007 (P2) -- console.error in production API helpers
- **Lines:** 252,266,279,291
- **Fix:** Removed all 4 `console.error` calls
- **Commit:** `91520dd`
- **Status:** FIXED

### BUG-PS-008 (P1) -- toggleLang/toggleCurrency stale closure
- **Lines:** 1094-1108, 1206-1220
- **Fix:** Compute new set outside state setter, call debouncedSave directly
- **Commit:** `a6828f6`
- **Status:** FIXED

---

## Active Bugs

### BUG-PS-009 (P2) -- address_map_url accepts arbitrary URLs
- **Line:** 429-436
- **Impact:** Potential XSS if downstream page renders as href without sanitization
- **Recommendation:** Add `isUrlSafe()` validation in `saveProfile()`

### BUG-PS-010 (P2) -- window.confirm for delete not accessible
- **Line:** 1926
- **Impact:** Blocked in iframes (Base44 preview), no-ops silently
- **Recommendation:** Replace with custom Dialog confirmation pattern

### BUG-PS-011 (P2) -- Shared saving counter blocks all sections during Profile save
- **Line:** 1729+
- **Impact:** User cannot interact with other sections while Profile is saving (1-3s)
- **Recommendation:** Add localSaving to Profile section

### BUG-PS-012 (P2) -- WiFi/Hall checkbox label double-fire risk
- **Lines:** 852-871, 959-984
- **Impact:** Checkbox toggle may fire twice on certain Shadcn versions
- **Recommendation:** Use `e.preventDefault()` on label, rely solely on `onCheckedChange`

### BUG-PS-013 (P2) -- PartnerShell wrapper pattern deviation
- **Line:** 1618
- **Impact:** Export default contains all logic instead of thin shell wrapper
- **Recommendation:** Extract `PartnerSettingsContent()` component

### BUG-PS-014 (P3) -- Password toggle and other buttons missing aria-label
- **Lines:** 1014, 1306, 1338, 1463-1468
- **Impact:** Screen readers cannot identify icon-only buttons
- **Recommendation:** Add `aria-label` with `t()` keys

### BUG-PS-015 (P3) -- Section nav relies on `title` only on mobile
- **Lines:** 1571-1585
- **Impact:** Screen readers don't reliably announce `title` attributes
- **Recommendation:** Add `aria-label={label}` to nav buttons
