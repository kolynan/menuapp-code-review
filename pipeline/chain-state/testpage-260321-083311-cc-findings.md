# CC Writer Findings — TestPage
Chain: testpage-260321-083311

## Findings

1. [P1] Raw error message shown to user (line 41) — `{error}` displays the raw JS error string (e.g. "HTTP 500") directly in the UI. User-facing text must use i18n. FIX: Show `t('common.error')` as the label, optionally keep the raw message in a `title` attribute or dev console. Replace `{error}` with `{t('common.error')}` or `{t('test_page.error_loading')}`.

2. [P1] No data validation before .map() (line 44) — `setItems(data)` on line 20 assumes the API response is an array. If the API returns an object (e.g. `{results: [...]}`) or null, `items.map()` on line 44 will throw a runtime crash. FIX: Add validation: `setItems(Array.isArray(data) ? data : [])`.

3. [P2] Missing AbortController — fetch cleanup on unmount (lines 13-27) — The `useEffect` fetch has no `AbortController`. If the component unmounts while the request is in flight, `setItems`/`setError`/`setLoading` will be called on an unmounted component. In React 18 StrictMode this fires twice. FIX: Add `const controller = new AbortController()` in the effect, pass `{ signal: controller.signal }` to `fetch()`, and return `() => controller.abort()` as the cleanup function. In the catch, skip setState if `err.name === 'AbortError'`.

4. [P2] No retry mechanism after error — When the fetch fails, the user sees an error message with no way to retry other than refreshing the entire page. FIX: Add a retry button: `<button onClick={() => { setError(null); setLoading(true); /* re-trigger fetch */ }}>{t('common.retry')}</button>` — or extract the fetch into a `loadItems` callback and call it from both useEffect and the retry button.

5. [P3] item.id / item.name assumed to always exist (line 45) — `key={item.id}` and `{item.name}` will produce `undefined` key or render nothing if the API returns items without these fields. Low risk for a test page, but a defensive check or fallback index key would be safer. FIX: Use `key={item.id ?? index}` (add index param to map callback) and `{item.name ?? '—'}`.

## Summary
Total: 5 findings (0 P0, 2 P1, 2 P2, 1 P3)
