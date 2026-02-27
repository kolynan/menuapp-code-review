# AdminPartners — BUGS.md

## Fixed Bugs

### BUG-AP-001 (P1) — Non-429 errors show "Нет ресторанов" instead of error state
- **Source:** Codex round (S35)
- **Problem:** When the partners query fails with a non-429 error (500, network failure), `react-query` stops retrying and the component falls through to the empty state "Нет ресторанов" instead of showing an error. User thinks there are no restaurants when the API actually failed.
- **Fix:** Added `isError: isPartnersError` to the partners query destructuring. Inserted an error state card (red border, AlertTriangle icon, retry button) between the loading spinner and the empty state in the render ternary. When `isPartnersError && partners.length === 0`, the error card is shown.
- **Status:** FIXED (S35)

### BUG-AP-002 (P1) — Secondary query errors silently zero out statistics
- **Source:** Codex round (S35)
- **Problem:** Secondary queries (dishes, orders, tables, staff) fail silently. If they error out, the arrays default to `[]`, so `getPartnerStats` computes 0 for all stats. User sees fake zeros and thinks business has no revenue/dishes/etc.
- **Fix:** Added `isError` destructuring to all 4 secondary queries. Stats display shows "—" instead of 0 when the corresponding query has an error AND no cached data. Uses `*Unavailable` pattern (`isError && data.length === 0`) to preserve valid stale data during background refetch failures — improved per Codex review feedback.
- **Codex collab:** Codex IMPROVED — pointed out that bare `isError` hides valid cached stats on transient background refetch failures. Adopted `isError && data.length === 0` pattern. Both AI agree.
- **Status:** FIXED (S35)

### BUG-AP-003 (P2) — cancelQueries/invalidateQueries without scope
- **Source:** Codex round (S35)
- **Problem:** `queryClient.cancelQueries()` and `queryClient.invalidateQueries()` were called without query key filters, cancelling/invalidating ALL queries in the cache — not just the ones for this page. Other pages sharing the queryClient would have their data wiped.
- **Fix:** Added explicit query key filters for all 5 admin query keys: `["admin-partners"]`, `["admin-all-dishes"]`, `["admin-all-orders"]`, `["admin-all-tables"]`, `["admin-all-staff"]`.
- **Status:** FIXED (S35)

## Active Bugs (found by reviewers, not yet fixed)

### BUG-AP-004 (P1) — Secondary query rate-limits undetectable
- **Source:** Correctness reviewer (S35)
- **Problem:** Rate-limit detection effect (line ~114) only watches `partnersError`. If a 429 is returned by the dishes/orders/tables/staff queries, the rate-limit banner is never shown. The secondary query `error` objects are not destructured (only `isError` booleans are). User sees "—" in stats with no recovery UI.
- **Fix needed:** Destructure `error` from each secondary query, add them to the rate-limit useEffect dependencies.
- **Status:** ACTIVE

### BUG-AP-005 (P1) — `partner.created_at` likely wrong field name
- **Source:** Correctness reviewer (S35)
- **Problem:** Line ~439 uses `partner.created_at` but Base44 entities typically use `created_date`. If the Partner entity follows this convention, the "Создан" column always shows "—".
- **Fix needed:** Verify Partner schema field name. If `created_date`, update the reference.
- **Status:** ACTIVE

### BUG-AP-006 (P1) — i18n violations: hardcoded Russian strings throughout
- **Source:** Style reviewer (S35)
- **Problem:** ~25+ user-facing strings are hardcoded without `t()` wrapping (page header, column headers, labels, access denied card, rate-limit card, footer, plan badge labels). Also, 7 `t()` calls pass hardcoded Russian fallback strings as second argument.
- **Fix needed:** Wrap all user-facing strings with `t('key')`. Remove fallback arguments from existing `t()` calls.
- **Status:** ACTIVE

### BUG-AP-007 (P1) — Sub-components lack i18n access
- **Source:** Style reviewer (S35)
- **Problem:** `ReadinessBadge`, `StatusToggle`, and `PlanBadge` are defined outside the main component and don't call `useI18n()`. `PlanBadge` renders "Free"/"Paid" without translation.
- **Fix needed:** Add `useI18n()` to sub-components or pass `t` as prop.
- **Status:** ACTIVE

### BUG-AP-008 (P1) — isLoading blocks full page during secondary queries
- **Source:** Correctness reviewer (S35)
- **Problem:** `isLoading` ORs all 5 query loading states. When partners load first, user still sees spinner until all dishes/orders/tables/staff finish loading. Partner list could be shown immediately.
- **Fix needed:** Only block on `partnersLoading`. Show per-column loading indicators for secondary data.
- **Status:** ACTIVE

### BUG-AP-009 (P2) — Duplicate inline handlers in map loop
- **Source:** Style reviewer (S35)
- **Problem:** Plan toggle and status toggle onClick handlers are duplicated between mobile and desktop views.
- **Fix needed:** Extract named handlers inside the map callback.
- **Status:** ACTIVE

### BUG-AP-010 (P2) — Magic numbers in readiness calculation
- **Source:** Style reviewer (S35)
- **Problem:** Values 33, 33, 34 used inline without named constants.
- **Fix needed:** Use `READINESS_MENU_WEIGHT`, `READINESS_TABLES_WEIGHT`, `READINESS_STAFF_WEIGHT` constants.
- **Status:** ACTIVE

### BUG-AP-011 (P2) — Hardcoded "ru-RU" locale in formatDate
- **Source:** Style reviewer (S35)
- **Problem:** `formatDate` always uses Russian locale regardless of user's language setting.
- **Fix needed:** Accept locale parameter or derive from i18n context.
- **Status:** ACTIVE

### BUG-AP-012 (P3) — Missing aria-labels on icon-only buttons
- **Source:** Style reviewer (S35)
- **Problem:** Back button, ExternalLink buttons, and StatusToggle Switch lack aria-labels.
- **Fix needed:** Add `aria-label` with i18n keys.
- **Status:** ACTIVE

### BUG-AP-013 (P3) — *Unavailable check edge case with cached empty arrays
- **Source:** Codex collab Round 2 (S35)
- **Problem:** `isError && data.length === 0` misclassifies valid cached empty arrays as unavailable. If a partner genuinely has 0 dishes and a background refetch errors, the UI shows "—" instead of 0. Requires raw `data === undefined` check (no destructuring defaults) to fix properly.
- **Fix needed:** Remove `= []` destructuring defaults, use `?? []` in getPartnerStats, check `data === undefined` for unavailable state. Significant refactor.
- **Status:** ACTIVE (accepted as known limitation — edge case is very unlikely on this admin page)
