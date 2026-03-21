# Codex Writer Findings — TestPage
Chain: testpage-260321-090140

## Findings
1. [P0] List rows are not normalized before render — Lines 21-22 only check `Array.isArray(data)`, but lines 63-64 assume every entry is a non-null object with a renderable `name`. `null`, primitives, or `name: {}` can throw at `item.id` or during React child rendering. FIX: normalize/filter each row before `setItems`, requiring an object record with a stable primitive `id` and string-safe display name.
2. [P1] Invalid payloads become a false empty state — Line 22 coerces any non-array JSON to `[]`, so backend contract failures render `testpage.state.no_items` at line 61 instead of an error. In a QR-menu flow this can hide the entire menu as if it were empty. FIX: treat non-array or invalid payloads as an error path and surface a translated failure state.
3. [P1] Retry requests bypass request lifecycle control — Lines 33-35 abort only the initial effect request; the retry button at line 55 calls `loadItems()` without its own `AbortController`. Rapid taps can create overlapping fetches, stale responses can win, and a retry can still resolve after unmount. FIX: keep the active controller in a ref, abort/replace it on every load, and ignore stale completions.
4. [P2] Error handling stores raw transport text instead of stable error keys — Lines 18 and 27 generate/store `HTTP ${res.status}` and browser `err.message`, but the UI only shows `t('common.error')`. Failures are neither localized nor distinguishable for targeted recovery or logging. FIX: map fetch/network/status failures to stable i18n error keys or codes and render those via `t(...)`.
5. [P2] Retry control is weak for mobile-first use — Lines 53-57 keep retry enabled during loading and style it as `px-3 py-1 text-sm`, which is below a comfortable 44x44 touch target. On slow mobile networks this makes duplicate taps easy and amplifies duplicate requests. FIX: disable retry while a request is in flight, show a busy state, and increase the hit area to a minimum touch target.
6. [P3] Index fallback key is an unstable React identity — Line 64 uses `key={item.id ?? index}`. If rows arrive without IDs or order changes between fetches, React can reuse the wrong DOM nodes. FIX: require a stable ID during normalization and drop or reject rows that do not have one.

## Summary
Total: 6 findings (1 P0, 2 P1, 2 P2, 1 P3)
