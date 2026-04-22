# CC Writer Findings — TestPage
Chain: testpage-260319-173206

## Findings

1. [P1] Hardcoded error strings displayed to user (lines 20, 33, 45) — `throw new Error("Fetch failed")` and `throw new Error("Delete failed")` produce English-only error messages that get stored in `error` state and rendered directly on line 45 via `{error}`. This violates the i18n rule: ALL user-facing strings must use `t('key')`. FIX: Replace thrown error messages with i18n keys. On line 45, display `t('test_page.error_fetch')` or `t('test_page.error_delete')` instead of raw `error`. Alternatively, set error state to a key and render `t(error)`, or use a separate `errorKey` state.

2. [P2] No loading/disabled state on Delete button (lines 50-55) — When a delete request is in-flight, the button remains active. Users can click it multiple times, firing duplicate DELETE requests and causing race conditions in the filter logic. FIX: Add a `deletingId` state. Set it before the fetch, clear in finally. On the button: `disabled={deletingId === item.id}`. Add visual feedback (opacity or spinner).

3. [P2] Error state never cleared on success (lines 24, 36) — Once `error` is set (e.g., a failed fetch), it persists forever. A subsequent successful `deleteItem` call does not clear it, so the red error banner stays visible even when operations succeed. FIX: Add `setError(null)` at the start of both `fetchItems` (before try) and `deleteItem` (before try) to clear stale errors.

4. [P2] List items lack flex layout — name and button stack vertically (line 48) — The `<div key={item.id}>` has no flex/grid styling, so `item.name` and the Delete button render stacked vertically instead of side-by-side. On mobile this wastes vertical space and looks broken. FIX: Change line 48 to `<div key={item.id} className="flex items-center justify-between py-2">` to align name and button horizontally.

5. [P3] fetchItems not in useEffect dependency array (line 13-15) — ESLint react-hooks/exhaustive-deps will warn that `fetchItems` is not listed in the dependency array of `useEffect`. While functionally it works (callback runs post-render when `fetchItems` is defined), it's a React anti-pattern. FIX: Either wrap `fetchItems` in `useCallback` and add to deps, or move the fetch logic inline into the `useEffect`.

## Summary
Total: 5 findings (0 P0, 1 P1, 3 P2, 1 P3)
