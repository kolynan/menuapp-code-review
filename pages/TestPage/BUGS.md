# TestPage — Known Bugs

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

## Active
- **[P1] Delete action is UI-only** (line ~70) — Delete only removes from local state, no backend call. Refresh restores item. KNOWN LIMITATION: TestPage has no real backend mutation — skipped by design.
