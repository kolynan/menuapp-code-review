# CC Writer Findings — TestPage
Chain: testpage-260319-235930

## Findings

1. **[P1] Error stores translated string instead of i18n key** (line 30) — `setError(t('test_page.error'))` stores the already-translated string. If the user switches language, the error message stays in the old language. This was reportedly fixed in chain testpage-260319-211343 but has regressed. FIX: Store the key `setError('test_page.error')` and translate in JSX: `<p>{t(error)}</p>`. Remove `t` from useCallback deps since it's no longer used inside fetchItems.

2. **[P1] Retry button calls fetchItems() without AbortController** (line 58) — Clicking retry calls `fetchItems()` with no signal argument. If the component unmounts during a retry fetch, the `.then()` callbacks will call `setItems`/`setLoading`/`setError` on an unmounted component (React warning). Unlike the initial fetch in useEffect, retry has no abort cleanup. FIX: Create an abortRef, use it in retry, and abort in useEffect cleanup. Or wrap retry in a function that creates a new AbortController tracked by a ref.

3. **[P2] Error div missing role="alert"** (line 54) — Screen readers won't announce the error. This was reportedly fixed in chain testpage-260319-225437 but has regressed. FIX: Add `role="alert"` to the error div.

4. **[P2] item.name null safety** (line 67) — No fallback for null/undefined item names. If an API item has `name: null`, it renders nothing. This was reportedly fixed in chain testpage-260319-194642 but has regressed. FIX: `{item.name || t('test_page.unnamed_item')}`.

5. **[P2] Loading early return hides content during retry** (lines 41-48) — When user clicks retry, `setLoading(true)` triggers the early return, replacing the entire page (including the item list) with a spinner. If items were already loaded, this is jarring UX. FIX: Only show the full-page loader on initial load (`items.length === 0 && loading`). When items exist, show an inline indicator instead.

6. **[P2] Delete button aria-label missing** (lines 68-73) — Delete buttons have no aria-label identifying which item they delete. Screen readers just hear the button text. This was reportedly fixed before but regressed. FIX: Add `aria-label={t('test_page.delete_item', { name: item.name || t('test_page.unnamed_item') })}`.

## Summary
Total: 6 findings (0 P0, 2 P1, 4 P2, 0 P3)
