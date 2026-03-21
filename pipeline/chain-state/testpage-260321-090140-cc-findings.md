# CC Writer Findings — TestPage
Chain: testpage-260321-090140
Date: 2026-03-21
File: pages/TestPage/base/testpage.jsx (69 lines)

## Findings

1. [P1] Retry fetch has no AbortController — (line 55) `onClick={() => loadItems()}` calls `loadItems()` without a signal argument. The fetch triggered by retry cannot be aborted on unmount, risking setState-after-unmount warnings and potential memory leaks. The useEffect cleanup (line 35) only aborts the initial fetch's controller — retries are uncontrolled. FIX: Store AbortController in a `useRef`. Create a new controller inside `loadItems` (or at each call site) and assign it to the ref. In useEffect cleanup, abort `abortRef.current` instead of a local variable.

2. [P2] Retry button below minimum 44x44px touch target — (line 53-57) The retry button uses `px-3 py-1 text-sm` which produces a target well below the 44x44px minimum for mobile. FIX: Add `min-h-[44px] min-w-[44px]` to the button's className.

3. [P2] Loading early return replaces all content during retry — (lines 38-45) When the user taps Retry, `setLoading(true)` triggers the early return that shows only a spinner, hiding the error message and any previously-loaded items. On slow connections this is jarring — the user loses context. FIX: Show the full-page loading spinner only on initial load (`items.length === 0 && !error`). When items already exist, show an inline/overlay indicator instead.

4. [P2] Unvalidated item.name can crash React rendering — (line 64) `item.name ?? '—'` handles null/undefined but not object or array values. If the API returns `{ id: 1, name: { en: "Salad" } }`, React will throw "Objects are not valid as a React child". The `Array.isArray` check on line 22 validates the top-level array but not individual item shapes. FIX: Coerce to string: `String(item.name ?? '—')` or validate item shape during fetch (e.g., filter items to those with primitive `name`).

5. [P3] Hardcoded fallback '—' bypasses i18n — (line 64) The em-dash fallback string is not wrapped in `t()`. While it's a symbol rather than a word, it still constitutes a hardcoded user-visible string. FIX: Replace with `t('common.unnamed')` or `t('testpage.item.unnamed')`, or accept as-is since dash is language-neutral.

## Summary
Total: 5 findings (0 P0, 1 P1, 3 P2, 1 P3)

## Notes
- The code is in good shape after 7+ rounds of consensus review. Most historical bugs from BUGS.md have been fixed.
- The P1 (retry abort) is the most actionable finding — it's a real unmount-safety issue.
- P2 findings are UX and robustness improvements, not crashes.
- No i18n key format violations remain (keys follow `page.section.element` pattern).
- No console.log, no inline styles, no conditional hooks — clean code.
