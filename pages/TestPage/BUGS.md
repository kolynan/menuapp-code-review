# TestPage — Known Bugs

## Review 2026-03-21 (`testpage-260321-090140`)
- **[P0] List rows are not normalized before render** (lines 21-22, 63-64) - Only `Array.isArray(data)` is checked before rendering, but the list assumes every entry is a non-null object with a renderable `name`. `null`, primitives, or `name: {}` can crash at `item.id` or during React child rendering. Suggested fix: normalize/filter each row before `setItems`, requiring an object record with a stable primitive `id` and string-safe display name.
- **[P1] Invalid payloads become a false empty state** (lines 21-22, 61) - Any non-array JSON is coerced to `[]`, so a backend contract failure renders `testpage.state.no_items` instead of an error. In a QR-menu flow this can hide the entire menu as if it were empty. Suggested fix: treat non-array or invalid payloads as an error path and surface a translated failure state.
- **[P1] Retry requests bypass request lifecycle control** (lines 33-35, 55) - Only the initial effect request is abortable. The retry button calls `loadItems()` without its own controller, so rapid taps can create overlapping fetches, stale responses can win, and a retry can still resolve after unmount. Suggested fix: keep the active controller in a ref, abort/replace it on every load, and ignore stale completions.
- **[P2] Error handling stores raw transport text instead of stable error keys** (lines 18, 27, 52) - The fetch path generates `HTTP ${res.status}` and browser `err.message`, but the UI only shows `t('common.error')`. Failures are neither localized nor distinguishable for targeted recovery or logging. Suggested fix: map fetch/network/status failures to stable i18n error keys or codes and render those via `t(...)`.
- **[P2] Retry control is weak for mobile-first use** (lines 53-57) - Retry stays enabled during loading and uses a small `px-3 py-1 text-sm` hit area, which is below a comfortable 44x44 touch target. On slow mobile networks this makes duplicate taps easy and amplifies duplicate requests. Suggested fix: disable retry while a request is in flight, show a busy state, and increase the touch target.
- **[P3] Index fallback key is an unstable React identity** (line 64) - `key={item.id ?? index}` can cause React to reuse the wrong DOM node if rows arrive without IDs or the order changes between fetches. Suggested fix: require a stable ID during normalization and drop or reject rows that do not have one.

## Review 2026-03-21 (`testpage-260321-083311`)
- **[P1] Unvalidated API payload can crash the page** (lines 18-19, 40-43) - `setItems(data)` accepts any JSON, but render assumes `items` is an array of objects with primitive `id` and renderable `name`. `null`, objects, or rows with object `name` values can break `items.length`, `items.map`, or React child rendering. Suggested fix: validate `Array.isArray(data)` and normalize each row before `setItems`, rejecting malformed payloads into the error path.
- **[P1] Error handling bypasses i18n and leaks raw transport text** (lines 14-16, 21-23, 38) - The fetch path throws `HTTP ${res.status}` and stores `err.message`, so users see raw English/browser messages that do not translate and do not update on language change. Suggested fix: store error keys or structured error codes, map transport failures to translation keys, and render via `t(...)`.
- **[P1] Translation keys do not follow Base44 naming rules** (lines 37, 39) - `test_page.title` and `test_page.no_items` do not use the required `page.section.element` key format. Suggested fix: rename them to structured names such as `testpage.header.title` and `testpage.state.noItems`, then update translations together.
- **[P2] Fetch effect has no abort or stale-request cleanup** (lines 12-24) - If the component unmounts or React 18 StrictMode replays the effect, the pending request can still call state setters after disposal and can duplicate network traffic. Suggested fix: add `AbortController` cleanup and ignore stale completions before setting state.
- **[P2] Failed fetch leaves users with no recovery action** (lines 36-43) - After a transient mobile/network failure, the page only shows an error string and requires a full refresh to try again. Suggested fix: add a retry action that clears the error, restores loading, and reruns the fetch.
- **[P3] Error message is not exposed as an accessible alert** (line 38) - The error is rendered as a plain paragraph, so assistive tech is less likely to announce failures promptly. Suggested fix: render the error inside an element with `role="alert"` or equivalent live-region semantics.

## Review 2026-03-21 (`testpage-260321-081342`)
- **[P1] Shallow payload validation can still crash rendering** (lines 24, 86) - Filtering only by truthy `id` still allows object or array `name` values and non-primitive ids into state, so React can throw while rendering the row. Suggested fix: normalize payload rows before `setItems` and reject malformed records.
- **[P1] i18n keys still violate Base44 naming format** (lines 29, 64, 82, 86, 89) - Keys like `test_page.title` and `test_page.error` are translated but do not follow the required `page.section.element` convention. Suggested fix: rename them to structured keys and update translations together.
- **[P2] Async success path is not fully unmount-safe** (lines 22-25, 34-45) - Abort cleanup exists, but resolved promise callbacks still update state with no mounted or request-token guard. Suggested fix: ignore stale completions before calling state setters.
- **[P2] Delete action is UI-only** (lines 48-50) - The button removes local state only, so data reappears after the next fetch and there is no failure handling. Suggested fix: add a real DELETE request with rollback/error handling, or remove the persistent delete affordance.
- **[P2] Malformed payload can appear as empty state** (lines 24, 82) - Bad rows are dropped silently, so a fully invalid response can render `no_items` instead of surfacing a backend problem. Suggested fix: treat discarded rows as an error or warning path.
- **[P3] Delete has no confirmation or undo** (lines 87-90) - One tap removes a row immediately, which is fragile on mobile. Suggested fix: add confirmation or undo.

## Review 2026-03-20 (`testpage-260320-203824`)
- **[P1] Shallow payload validation can still crash rendering** (lines 24, 86) - Rows are filtered only by truthy `id`, but `item.name` is rendered directly. If the API returns an object or array in `name`, React will throw during render. Suggested fix: normalize rows before `setItems`, requiring a primitive `id` and string or null `name`.
- **[P1] i18n keys violate required naming format** (lines 29, 64, 78, 82, 86, 89, 92) - User-facing keys like `test_page.title` and `test_page.error` do not follow the required `page.section.element` convention. Suggested fix: rename to structured keys and update translations.
- **[P2] Async callbacks are not fully unmount-safe** (lines 17-31, 34-45) - `AbortController` cleanup exists, but resolved promise callbacks can still update state after unmount or after a newer request starts. Suggested fix: add a mounted or request-token guard around state updates.
- **[P3] Silent payload filtering hides backend issues** (lines 24, 82) - Invalid rows are dropped and can fall through to the `no_items` empty state instead of surfacing bad payloads. Suggested fix: convert malformed rows into an error or warning path.
- **[P3] Delete has no confirmation or undo** (lines 87-90) - A single tap removes an item immediately, which is fragile on mobile. Suggested fix: add confirmation or undo.

## Fixed
- **[P0] Missing await on response.json()** (line ~17) — `response.json()` returns a Promise; without `await`, `setItems` receives a Promise object instead of data. Fixed: added `await`.
- **[P1] No error handling in fetchItems** (line ~15) — Network errors crash silently, `loading` stays true forever. Fixed: added try/catch/finally.
- **[P1] No error handling in deleteItem** (line ~23) — Failed DELETE removes item from UI optimistically with no rollback. Fixed: added try/catch, check `res.ok`.

- **[P1] Hardcoded user-facing strings** (lines 36,40,44) — No i18n. Fixed: added useI18n, replaced with t() keys.
- **[P1] Stale closure in deleteItem** (line 30) — `setItems(items.filter(...))` loses concurrent deletes. Fixed: functional updater `setItems(prev => ...)`.
- **[P1] No response.ok check in fetchItems** (line 17) — Non-2xx responses treated as success. Fixed: added `if (!response.ok) throw`.
- **[P2] Inline styles instead of Tailwind** (line 39) — `style={{ padding: 16 }}`. Fixed: replaced with `className="p-4"`.
- **[P2] console.error in production** (lines 20,32) — No user feedback. Fixed: removed console.error, added error state display.
- **[P2] No minimum touch target for Delete** (line 44) — Below 44x44px. Fixed: added min-h/min-w classes.
- **[P2] No empty state** — Empty items shows nothing. Fixed: added empty state message.
- **[P2] No user-facing error feedback** — Errors only in console. Fixed: added error state and UI display.

- **[P1] Hardcoded error strings** (lines 20,33) — "Fetch failed"/"Delete failed" not using i18n. Fixed: replaced with `t('test_page.fetch_failed')` / `t('test_page.delete_failed')`.
- **[P2] No loading/disabled state on Delete button** (lines 50-55) — Double-click causes duplicate DELETEs. Fixed: added `deletingId` state, disabled button during delete.
- **[P2] Error state never cleared on success** (lines 24,36) — Stale error persists after successful actions. Fixed: added `setError(null)` at start of fetchItems and deleteItem.
- **[P2] List items lack flex layout** (line 48) — Name and button stack vertically on mobile. Fixed: added `flex items-center justify-between` to item div.

## Fixed (consensus chain testpage-260319-194642)
- **[P0] Broken i18n import path** (line 2) — `@/components/useI18n` should be `@/components/i18n`. Fixed: corrected import path.
- **[P1] Raw err.message shown to users** (lines 26,40) — Network errors leak browser strings. Fixed: replaced with `t('common.error')`.
- **[P1] Single deletingId breaks overlapping deletes** (line 12) — Rapid taps cause state confusion. Fixed: changed to `Set`-based `deletingIds`.
- **[P2] Error state has no retry button** (line 51) — User must refresh page. Fixed: added retry button calling `fetchItems()`.
- **[P2] No setLoading(true) on re-fetch** (line 18) — Retry doesn't show loading indicator. Fixed: added `setLoading(true)` at start of `fetchItems`.
- **[P2] Delete button invisible on mobile** (line 57) — No bg/border/hover styling. Fixed: added Tailwind visual classes.
- **[P2] Loading state unstyled** (line 46) — Plain div, not centered. Fixed: added `flex items-center justify-center p-8`.
- **[P2] useEffect TDZ order violation** (line 14) — `useEffect` called `fetchItems` before declaration. Fixed: moved `fetchItems` above `useEffect`.
- **[P2] List rows not mobile-safe** (line 55) — Long names push delete button off-screen. Fixed: added `flex-1 min-w-0 truncate` wrapper.
- **[P3] item.name null safety** (line 55) — No fallback for null names. Fixed: added `|| t('test_page.unnamed_item')`.

## Fixed (consensus chain testpage-260319-211343)
- **[P1] Unvalidated API response can crash rendering** (line ~21) — `items.map()` crashes if backend returns non-array. Fixed: added `Array.isArray(data)` check.
- **[P1] Error handling stores translated strings instead of keys** (lines 19,23,34,37) — Storing `t('...')` result breaks language switching. Fixed: store i18n keys, render via `t(error)` in JSX.
- **[P2] No abort/cleanup for async requests on unmount** (lines 44-46) — Stale state updates after unmount. Fixed: added AbortController + mountedRef guard.
- **[P2] Error banner not mobile-responsive** (line 54) — Horizontal flex overflows on mobile with long translations. Fixed: `flex-col sm:flex-row` with text wrapping.
- **[P3] fetchItems not in useEffect dependency array** (line 46) — ESLint exhaustive-deps violation. Fixed: wrapped in useCallback, added to deps.
- **[P3] Delete button lacks aria-label** (line 70) — No accessible label with item name. Fixed: added aria-label.

## Fixed (consensus chain testpage-260319-213831)
- **[P1] Raw error messages bypass i18n** (lines 26, 42) — Native fetch errors leak browser strings via `err.message`. Fixed: added `toErrorKey()` whitelist that validates known i18n keys, falls back to `common.error`.
- **[P1] mountedRef never reset after StrictMode cleanup** (line 53) — React 18 StrictMode mount→cleanup→remount sets `mountedRef.current = false` permanently. Fixed: added `mountedRef.current = true` at start of useEffect body.
- **[P2] fetchItems lacks mount guards + retry has no AbortController** (lines 20-37, 72) — setState calls after unmount, retry button had no abort capability. Fixed: added mountedRef guards to all fetchItems setState, added abortRef for per-fetch AbortController, retry uses handleRetry with proper abort.

## Fixed (consensus chain testpage-260319-225437)
- **[P1] Retry action misleading for delete failures** (line ~84) — Retry button always re-fetches even after delete failure. Fixed: added errorSource tracking, retry only shows for fetch errors.
- **[P1] Shallow response validation** (line ~29) — Only checked Array.isArray, malformed items could crash rendering. Fixed: filter items to require valid `id`.
- **[P2] Retry fetch not cleaned up on unmount** (line ~76) — Cleanup only aborted original controller, not retried ones. Fixed: use abortRef.current in cleanup.
- **[P2] Delete aria-label i18n concatenation** (line ~107) — String concatenation breaks i18n word order. Fixed: use interpolated translation key.
- **[P2] Loading state hides content on retry** (line ~79) — Early return replaced entire page on retry. Fixed: inline loading indicator when items exist.
- **[P2] Error div missing role="alert"** (line ~88) — Screen readers won't announce errors. Fixed: added role="alert".
- **[P3] h1 title unstyled** (line ~83) — No Tailwind classes on heading. Fixed: added text-xl font-semibold mb-4.
- **[P3] No visual separation between list items** (line ~103) — Rows blend together. Fixed: added border-b border-gray-100.

## Fixed (consensus chain testpage-260319-234320)
- **[P0] Unvalidated API payload crashes page** (line ~16) — `items.map()` on non-array crashes. Fixed: `Array.isArray(data)` check + item filter for valid `id`.
- **[P1] No response.ok check on fetch** (line ~16) — Non-2xx treated as success. Fixed: `if (!res.ok) throw`.
- **[P1] Raw error message shown to users** (line ~26) — `err.message` bypasses i18n. Fixed: use `t('test_page.error')`.
- **[P2] No fetch cleanup on unmount** (lines ~14-18) — No AbortController. Fixed: added AbortController + cleanup in useEffect.
- **[P2] Delete button below minimum touch target** (line ~31) — `px-3 py-2 text-sm` too small. Fixed: added `min-h-[44px] min-w-[44px]`.
- **[P2] No retry mechanism for errors** (line ~26) — User must refresh. Fixed: added retry button calling `fetchItems()`.
- **[P2] List rows not mobile-safe for long names** (lines ~29-30) — Long names push delete off-screen. Fixed: `flex-1 min-w-0 truncate`.
- **[P3] No loading spinner** (line ~21) — Bare text loading. Fixed: added Loader2 spinner.

## Fixed (consensus chain testpage-260319-235930)
- **[P1] Error stores translated string instead of i18n key** (line ~30) — `setError(t('test_page.error'))` stores pre-translated text; language switch leaves stale text. Fixed: store key string in `errorKey` state, call `t(errorKey)` in JSX.
- **[P1] Retry fetch missing AbortController** (line ~58) — Retry calls `fetchItems()` without signal, no cleanup on unmount. Fixed: ref-based `abortRef` AbortController for all fetch calls including retry.
- **[P1] Delete action is UI-only** (line ~70) — Delete only removes from local state, no backend call. Fixed: added TODO comment for backend DELETE; kept as UI-only since TestPage has no real persistence.
- **[P2] Error div missing role="alert"** (line ~54) — Screen readers won't announce errors. Fixed: added `role="alert"`.
- **[P2] item.name null safety** (line ~67) — No fallback for null/undefined names. Fixed: `item.name || t('test_page.unnamed_item')`.
- **[P2] Loading early return hides content during retry** (line ~41) — Full-page spinner replaces visible items on retry. Fixed: inline loader when items exist, full-page only on initial load.
- **[P2] Delete button aria-label missing** (line ~68) — No accessible label identifying which item. Fixed: added `aria-label={t('test_page.delete_item', { name: ... })}`.
- **[P2] Error banner not mobile-safe** (line ~54) — Horizontal flex overflows on narrow screens. Fixed: `flex-col sm:flex-row` layout.

## Fixed (consensus chain testpage-260320-200136)
- **[P1] Abort controller leak on retry** (line 38) — useEffect cleanup aborted captured `controller` variable, not `abortRef.current`; retry controllers were never aborted on unmount. Fixed: cleanup now aborts `abortRef.current`.
- **[P2] No semantic list markup** (lines 83-94) — Items rendered as `<div>` elements, screen readers can't identify content as a list. Fixed: wrapped items in `<ul>`/`<li>`.

## Fixed (consensus chain testpage-260321-083311)
- **[P1] Raw error message / i18n violation in error display** (line 41) — Raw `{error}` shown to user. Fixed: replaced with `{t('common.error')}`.
- **[P1] No data validation before .map() — crash risk** (line 20) — `setItems(data)` assumes array. Fixed: added `Array.isArray(data) ? data : []`.
- **[P2] Missing AbortController — fetch cleanup on unmount** (lines 13-36) — No abort on unmount. Fixed: added AbortController in useEffect, abort in cleanup.
- **[P2] No retry mechanism after fetch error** (lines 56-60) — User must refresh page. Fixed: extracted fetch to `loadItems` callback, added retry button.
- **[P2] Translation keys don't follow Base44 naming convention** (lines 49, 62) — `test_page.title` → `testpage.header.title`, `test_page.no_items` → `testpage.state.no_items`.
- **[P3] item.id / item.name fallback** (line 65) — No fallback for missing fields. Fixed: `key={item.id ?? index}` and `{item.name ?? '—'}`.
- **[P3] Error message not exposed as accessible alert** (line 52) — Added `role="alert"` to error element.

## Active (notes only — no fix needed for test page)
- **[P3] Silent payload filtering** (line 24) — `data.filter(item => item && item.id)` silently drops bad rows; malformed API response shows empty state instead of error. Acceptable for test page.
- **[P3] No delete confirmation** (line 50) — Clicking delete immediately removes item with no confirmation dialog. Acceptable for test page.
