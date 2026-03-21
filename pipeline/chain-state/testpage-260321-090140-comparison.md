# Comparison Report — TestPage
Chain: testpage-260321-090140
Date: 2026-03-21

## Agreed (both found)

### 1. Retry fetch has no AbortController / lifecycle control
- **CC**: [P1] Retry calls `loadItems()` without signal; useEffect cleanup only aborts initial fetch. Risk: setState-after-unmount.
- **Codex**: [P1] Same issue. Adds: rapid taps create overlapping fetches, stale responses can win.
- **Verdict**: AGREED. Both propose storing controller in a ref, aborting/replacing on every load. Codex's framing is slightly more complete (covers stale-response race). **Use Codex's fix approach** (ref + abort/replace + ignore stale).
- **Priority**: P1

### 2. Retry button below 44x44px touch target
- **CC**: [P2] `px-3 py-1 text-sm` is below 44x44px minimum. Fix: add `min-h-[44px] min-w-[44px]`.
- **Codex**: [P2] Same sizing issue. Adds: disable retry while loading to prevent duplicate taps.
- **Verdict**: AGREED on touch target. Codex's addition (disable during loading) is valid and complements. **Merge both**: increase touch target + disable while loading.
- **Priority**: P2

### 3. Unvalidated item data can crash React rendering
- **CC**: [P2] `item.name` could be an object, crashing React. Fix: `String(item.name ?? '—')`.
- **Codex**: [P0] Broader: rows not normalized at all — null entries, primitives, `name: {}` all crash. Fix: normalize/filter rows in `setItems`.
- **Verdict**: AGREED on the root issue. Codex's scope is broader (validates entire row shape, not just name). CC's `String()` is a quick fix but doesn't catch null rows or missing `id`. **Use Codex's normalization approach** but P1 not P0 — this is a defensive measure against unexpected API payloads, not a guaranteed crash in normal operation.
- **Priority**: P1 (downgraded from Codex's P0 — the API is controlled and currently returns valid data)

## CC Only (Codex missed)

### 4. Loading early return replaces all content during retry
- **CC**: [P2] `setLoading(true)` triggers early return showing only spinner, hiding error and any loaded items. Jarring on slow connections.
- **Evaluation**: Valid UX issue. During retry, the user loses context. Showing inline indicator instead of full-page replacement is better UX.
- **Verdict**: ACCEPTED. Solid UX improvement.
- **Priority**: P2

### 5. Hardcoded fallback '—' bypasses i18n
- **CC**: [P3] Em-dash fallback not wrapped in `t()`.
- **Evaluation**: Borderline — a dash is language-neutral punctuation, not a word. CC itself notes "accept as-is since dash is language-neutral" as an option.
- **Verdict**: REJECTED. Em-dash is a universal symbol, not translatable text. Not worth a fix.

## Codex Only (CC missed)

### 6. Invalid payloads become false empty state
- **Codex**: [P1] Non-array JSON is coerced to `[]`, showing "no items" instead of an error. Could hide entire menu.
- **Evaluation**: Valid. Silent data contract failures masquerading as empty state is a real problem — user sees "no items" when the backend actually errored or changed format.
- **Verdict**: ACCEPTED. Treat non-array payload as error, not empty.
- **Priority**: P1

### 7. Error handling stores raw transport text
- **Codex**: [P2] Error messages like `HTTP ${res.status}` are stored but only `t('common.error')` is shown. Raw text is neither localized nor useful for recovery.
- **Evaluation**: Low impact — the raw text is stored internally but not displayed to users. The UI already shows a translated error. Mapping to stable error codes would be over-engineering for a test page.
- **Verdict**: REJECTED. The current approach (store raw for debugging, show translated to user) is adequate for this page.

### 8. Index fallback key is unstable React identity
- **Codex**: [P3] `key={item.id ?? index}` — if rows lack IDs, React can reuse wrong DOM nodes.
- **Evaluation**: Valid concern in theory, but items should always have IDs from the API. The fallback to index is a reasonable safety net. Requiring stable IDs during normalization (item #3 above) would address this implicitly.
- **Verdict**: ACCEPTED as part of item #3 normalization (not a separate fix). If rows are normalized to require `id`, this is automatically solved.
- **Priority**: P3 (absorbed into item #3)

## Disputes (disagree)

### Severity of item validation (item #3)
- **CC**: P2 — just coerce `item.name` to string.
- **Codex**: P0 — full row normalization required.
- **Resolution**: Neither extreme. The API is controlled and returns valid data, so P0 is too high. But CC's `String()` is too narrow — doesn't catch null rows. **Compromise: P1, normalize rows during fetch** (filter to objects with primitive id and string-coercible name). This implicitly fixes Codex's P3 key issue too.

## Final Fix Plan
Ordered list of all fixes to apply:

1. **[P1] AbortController lifecycle for all fetches** — Source: agreed (CC+Codex) — Store AbortController in useRef; abort/replace on every loadItems call; ignore stale completions in useEffect cleanup.
2. **[P1] Normalize/validate item rows before setItems** — Source: agreed (CC+Codex, merged) — Filter rows to objects with primitive `id` and string-safe `name`. Reject non-array payloads as errors (absorbs Codex's "false empty state" finding).
3. **[P1] Non-array API response → error, not empty state** — Source: Codex only — Treat non-array JSON payload as an error condition, show error UI instead of "no items". (Can be combined with item #2 normalization.)
4. **[P2] Increase retry button touch target + disable during loading** — Source: agreed (CC+Codex) — Add `min-h-[44px] min-w-[44px]`; add `disabled={loading}` with visual busy state.
5. **[P2] Show inline loading indicator on retry instead of full-page spinner** — Source: CC only — Only show full-page spinner on initial load (items empty + no error). On retry, show inline/overlay indicator preserving current content.

## Summary
- Agreed: 3 items
- CC only: 2 items (1 accepted, 1 rejected)
- Codex only: 3 items (1 accepted, 1 rejected, 1 absorbed into agreed item)
- Disputes: 1 item (severity — resolved as P1 compromise)
- **Total fixes to apply: 5**
