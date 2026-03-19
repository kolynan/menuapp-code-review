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

## Active
No active bugs.
