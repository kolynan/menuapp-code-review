# CC Writer Findings — TestPage
Chain: testpage-260319-094126

## Findings

1. [P1] Missing `await` on `response.json()` (line 17) — `response.json()` returns a Promise, not parsed data. Without `await`, `setItems(data)` receives a Promise object, causing the `.map()` on line 33 to fail silently (no items rendered) or crash. FIX: Change `const data = response.json();` to `const data = await response.json();`

2. [P1] No error handling in `fetchItems` (lines 15-20) — If `fetch("/api/items")` fails (network error, 4xx/5xx), the function will throw and `setLoading(false)` will never execute, leaving the UI stuck on "Loading..." forever. Also no check for `response.ok`. FIX: Wrap in try/catch, check `response.ok`, call `setLoading(false)` in a `finally` block.

3. [P1] No error handling in `deleteItem` (lines 23-26) — If the DELETE request fails, the item is still removed from local state (line 25), causing UI/server data mismatch. FIX: Check `response.ok` before updating state, wrap in try/catch.

4. [P2] Stale closure in `deleteItem` (line 25) — `items.filter(...)` captures the `items` value from the render when `deleteItem` was created. If called rapidly for multiple items, later calls use stale state. FIX: Use functional state update: `setItems(prev => prev.filter((i) => i.id !== id));`

5. [P2] Inline style instead of Tailwind (line 31) — `style={{ padding: 16 }}` violates project rule: "Use Tailwind CSS utility classes ONLY (no custom CSS, no inline styles)". FIX: Replace `style={{ padding: 16 }}` with `className="p-4"`.

6. [P2] Hardcoded user-facing strings — no i18n (lines 28, 32, 36) — "Loading...", "Test Page", and "Delete" are hardcoded English strings. Project rules require all user-facing text to use `t('key')`. FIX: Import `useI18n`, use `t('test_page.loading')`, `t('test_page.title')`, `t('test_page.delete')`.

7. [P2] `fetchItems` as arrow function called from useEffect without proper dependency (lines 11-13, 15-20) — `fetchItems` is a const arrow function that gets recreated every render but is not in the useEffect dependency array. While it works because useEffect only runs once (empty deps), it's a React anti-pattern that ESLint `exhaustive-deps` would flag. FIX: Move `fetchItems` inside the useEffect callback, or wrap in `useCallback` and add to deps array.

## Summary
Total: 7 findings (0 P0, 3 P1, 4 P2, 0 P3)
