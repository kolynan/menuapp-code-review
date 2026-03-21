# Codex Writer Findings — TestPage
Chain: testpage-260319-213831

## Findings
1. [P1] Raw exception messages bypass i18n — `setError(err.message || 'common.error')` at `testpage.jsx:26` and `testpage.jsx:42` stores browser/parser error text, but the UI renders it with `t(error)` at `testpage.jsx:63`. Network failures and JSON parse errors therefore surface as missing translation keys or raw technical text instead of localized copy. FIX: store only stable i18n keys in error state and map unknown exceptions to a generic translated key such as `common.error`.
2. [P1] `mountedRef` is never reset after cleanup — the effect cleanup at `testpage.jsx:53` sets `mountedRef.current = false`, but nothing sets it back to `true`. In React 18 StrictMode's mount/cleanup/remount cycle, later deletes hit the guards at `testpage.jsx:38`, `testpage.jsx:41`, and `testpage.jsx:44`, so rows can stay disabled and never be removed. FIX: reinitialize the ref on effect setup or replace the ref-based guard with request-scoped abort/ignore logic.
3. [P2] Fetch lifecycle is still unsafe after unmount/retry — `fetchItems` still commits state at `testpage.jsx:23` and `testpage.jsx:28` without checking mount/request freshness, and the retry button at `testpage.jsx:66` starts a fetch without its own `AbortController`. Navigating away during retry can leave stale `items`/`loading` updates landing after unmount. FIX: give each fetch its own controller/request id and guard `setItems`, `setError`, and `setLoading` against stale or unmounted requests.

## Summary
Total: 3 findings (0 P0, 2 P1, 1 P2, 0 P3)
