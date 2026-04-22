# CC Writer Findings — TestPage
Chain: testpage-260319-102840

## Findings

1. [P1] Missing `await` on `response.json()` (line 17) — `response.json()` returns a Promise, not the parsed data. Without `await`, `setItems(data)` receives a pending Promise instead of the actual array. This causes `items.map()` on line 33 to crash since a Promise has no `.map()` method. FIX: Change `const data = response.json();` to `const data = await response.json();`.

2. [P1] No error handling on `fetchItems` (lines 15-20) — If the fetch fails (network error, 4xx/5xx response), the function will throw an unhandled error. `setLoading(false)` will never be called, leaving the UI stuck on "Loading..." forever. Also, `response.ok` is never checked, so non-200 responses silently produce bad data. FIX: Wrap in try/catch, check `response.ok`, call `setLoading(false)` in a finally block, and show an error state.

3. [P1] No error handling on `deleteItem` (lines 23-26) — If the DELETE request fails, the item is still removed from local state on line 25, causing a UI/data mismatch. The user sees the item disappear but it still exists on the server. FIX: Wrap in try/catch; only update local state after confirming the delete succeeded (check `response.ok`).

4. [P2] Stale closure in `deleteItem` — `items` on line 25 captures the state value at render time. If multiple deletes happen quickly, each closure references the same stale `items` array, potentially "un-deleting" items. FIX: Use functional update: `setItems(prev => prev.filter(i => i.id !== id))`.

5. [P2] Hardcoded user-facing strings (lines 28, 32, 36) — "Loading...", "Test Page", and "Delete" are hardcoded English strings. Per project rules, all user-facing text must use `t('key')` from `useI18n`. FIX: Import `useI18n`, call `const { t } = useI18n()`, replace strings with `t('test_page.loading')`, `t('test_page.title')`, `t('test_page.delete')`.

6. [P2] Inline style instead of Tailwind (line 31) — `style={{ padding: 16 }}` uses inline styles. Per project rules, Tailwind utility classes are required. FIX: Replace `style={{ padding: 16 }}` with `className="p-4"`.

7. [P2] `useEffect` dependency — `fetchItems` is defined after the `useEffect` that calls it (lines 11-13 vs 15-20). While this works due to hoisting of `const` within the function scope (actually it doesn't hoist — `fetchItems` is in TDZ at line 12), this is technically a TDZ issue at runtime in strict mode. More practically, ESLint would flag the missing `fetchItems` dependency in the `[]` array. FIX: Move `fetchItems` definition before `useEffect`, or define the async function inline inside `useEffect`.

8. [P3] No loading/empty state distinction — If the API returns an empty array, the page shows nothing (blank). There's no "No items found" message. FIX: Add an empty state check after the loading check: `if (items.length === 0) return <div>{t('test_page.no_items')}</div>`.

## Summary
Total: 8 findings (0 P0, 3 P1, 4 P2, 1 P3)
