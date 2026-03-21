# CC Writer Findings — TestPage
Chain: testpage-260319-213831

## Findings

1. [P1] Native fetch/network errors leak raw browser strings (lines 26, 42) — When a network error occurs (e.g., no internet, DNS failure), `err.message` contains raw browser text like "Failed to fetch" or "NetworkError". This is NOT an i18n key, so `t(error)` on line 63 renders untranslated English. Only explicitly thrown errors (lines 20, 22, 37) use i18n keys. FIX: In both catch blocks, check if the error message is one of our known i18n keys before storing it. Otherwise fall back to `'common.error'`. Example: `setError(['test_page.fetch_failed', 'test_page.invalid_response', 'test_page.delete_failed'].includes(err.message) ? err.message : 'common.error')`.

2. [P2] Retry button calls fetchItems() without AbortController (line 66) — The retry button invokes `fetchItems()` with no `signal` argument. If the user navigates away during retry, the fetch cannot be aborted and setState calls (lines 23, 26, 28) fire on an unmounted component. Unlike `deleteItem` which checks `mountedRef.current`, `fetchItems` has no such guard. FIX: Either (a) add `if (!mountedRef.current) return;` checks before each setState in fetchItems catch/finally, or (b) store AbortController in a ref and create a new one for each fetchItems call (including retry).

3. [P2] fetchItems lacks mountedRef guards on setState (lines 23, 26, 28) — `deleteItem` correctly guards all setState calls with `if (!mountedRef.current) return;`, but `fetchItems` has no such protection. After component unmount (cleanup on line 53 sets `mountedRef.current = false`), the initial fetch is aborted via AbortController, but retry fetches (finding #2) and the `finally` block's `setLoading(false)` on line 28 will still execute. FIX: Add mountedRef checks: `if (mountedRef.current) setItems(data)`, etc. in the try/catch/finally of fetchItems.

4. [P3] Retry button re-fetch has no loading indicator (line 66) — When retry is clicked, `fetchItems()` does call `setLoading(true)` (line 16), which renders the loading div (line 56) and removes the error+retry UI. This works correctly but the UX is abrupt — the error disappears instantly with no transition. Minor UX concern only.

## Summary
Total: 4 findings (0 P0, 1 P1, 2 P2, 1 P3)
