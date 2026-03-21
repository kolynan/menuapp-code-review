# Codex Writer Findings — TestPage Chain: testpage-260321-153104

## Findings

1. [P1] Malformed rows can be misreported as an empty menu — `normalizeItems()` only fails when the payload is not an array. If `/api/items` returns an array of malformed rows, the filter silently drops them and the page falls through to `testpage.state.no_items`, which hides a backend/data-shape failure as a valid empty state. FIX: make row validation fail the request when any row is invalid, or track discarded rows and surface `testpage.error.invalid_response` instead of the empty-state message.
2. [P2] Language changes can trigger unnecessary re-fetches — `loadItems()` closes over `t`, so the callback depends on `t` and the `useEffect` re-runs when the i18n function identity changes. In a mobile QR-menu flow, switching language should update copy locally, not hit `/api/items` again and risk extra loading/flicker. FIX: store stable error keys/codes in state, translate only during render, and remove `t` from `loadItems()` dependencies.
3. [P2] Error handling collapses distinct failures into one generic state — the fetch path stores either `t("testpage.error.invalid_response")` or `err.message`, but the UI always renders `t("common.error")`. That makes the specific invalid-response message dead state and prevents users from seeing whether the failure is transport, HTTP, or payload-related. FIX: replace `error` with an `errorKey` or structured error type, set it consistently in each failure path, and render the matching translated message instead of a hardcoded generic fallback.

## Summary
Total: 3 findings (0 P0, 1 P1, 2 P2, 0 P3)
