# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260416-212808-43bb
Draft reviewed: `pipeline/drafts/pssk-som-b2-1-260416-v7.md` (1103 lines)
Reviewer: CC (analysis only — no code files read, no edits applied)

## Issues Found

1. **[MEDIUM] Fix B.5 illustrative `old_string` example contains a semantic error.** The example shows `const highlightRing = highlightGroupId === group.compositeKey;` immediately above `data-group-id={group.id}`. But B.4's edits only touch the *parent's* `<OrderGroupCard ...>` JSX (`isHighlighted={highlightGroupId === group.compositeKey}`), NOT the inner `highlightRing` line. So the actual file's `highlightRing` calculation is almost certainly still `=== group.id` (or it derives from the `isHighlighted` prop, depending on whether OrderGroupCard is a separate component). Either way, the example contradicts the surrounding logic and may seed CC with the wrong mental model when constructing the real Edit. **PROMPT FIX:** Either (a) drop the `highlightRing` line from the example and use only `return (` as the prefix anchor; or (b) clarify that `highlightRing` may be either `=== group.id` (unchanged by B.4) OR `isHighlighted` (depending on file structure), and instruct CC to copy the real line verbatim from `sed` output without assuming it contains `compositeKey`.

2. **[MEDIUM] Fix C `getLinkId` deps handling is conditional but underspecified.** Preparation §2 detects whether `getLinkId` is imported, component-scoped, or "not found". Fix C's deps note says: *"если он component-scoped — обернуть в useCallback и добавить в deps; если imported — пропустить, как сейчас"*. There is no instruction for **how** or **where** to wrap a component-scoped `getLinkId` in `useCallback`, nor what its deps would be. If `getLinkId` turns out to be component-scoped, CC will hesitate or silently change unrelated code (violates F4). **PROMPT FIX:** Pre-state the expected outcome (`getLinkId` is imported from `@/components/...` based on this codebase pattern → simply omit from deps). If the pre-check returns "component-scoped" → STOP and ask Arman, do NOT add a useCallback wrapper as part of this batch.

3. **[MEDIUM] Multi-line `old_string` in B.4 Edit 1 assumes exact whitespace formatting.** The 3-line block uses 14/16/18-space indentation. If the working copy has any tab/space mismatch or trailing whitespace difference, `Edit` will fail with "string not found" and CC may try to brute-force a replacement. **PROMPT FIX:** Add an explicit fallback: "If Edit 1 fails on the multi-line `key` anchor, run `sed -n 'N-2,N+2p'` around the `v2SortedGroups.map` hit and reconstruct `old_string` using the exact bytes (spaces vs tabs) from that output. Do NOT change indentation."

4. **[LOW] Pre-flight grep for `useRef` count is ambiguous.** `grep -c "useRef" file` counts ALL textual occurrences including comments, string literals, or unrelated identifiers (e.g., `useReftesh`). The prompt says "≥1 (useRef уже импортирован) или 0 (нужно добавить)". A file may have `useRef` mentioned in a comment but not actually imported, leading to a false positive (CC skips adding the import → ReferenceError at runtime). **PROMPT FIX:** Replace with `grep -nE "^import .*useRef|^import \{[^}]*useRef[^}]*\}" file` — only counts real import declarations.

5. **[LOW] `isHighlighted` Pre-flight expectation says "STOP if hits != 1" but does not differentiate from pickup/delivery map.** Pre-flight #4 grep for `isHighlighted={highlightGroupId === group.id}` says "Если hits != 1 — STOP, проверить pickup/delivery map (не менять его prop highlightGroupId)". The pickup/delivery code path passes `highlightGroupId` differently — but the prompt does not clarify what to do if a second hit IS found in pickup map. STOP-and-ask is fine, but B.4's later note says "Если key={group.id} даёт >1 hit — это ожидаемо" — inconsistency in tolerance. **PROMPT FIX:** Add explicit guidance: "If a second `isHighlighted={highlightGroupId === group.id}` is found in `v2SortedPickupGroups.map` (or similar), do NOT change it — it tracks order ID identity for individual orders, which is already unique. STOP only if the hit appears in an unrecognized map."

6. **[LOW] `wc -l` tolerance bounds are inconsistent with the change shape.** Fix B adds ~30 lines to `orderGroups`; Fix B.6 adds ~10 lines; Fix C adds ~30 lines. Total expected delta: roughly +60 to +75 lines, ~no deletions. The prompt allows `4582 ≤ wc-l ≤ 4687` which permits 35 lines of *loss* — but no fix in this batch removes lines. A `-35` outcome would silently mask a regression (e.g., orderGroups block accidentally truncated). **PROMPT FIX:** Tighten to `4640 ≤ wc-l ≤ 4690`. Anything below 4640 → STOP and inspect.

7. **[LOW] Verification grep #1 in Fix C says "ровно 3 hits" then footnote "Допустимо: 3-4 hits".** The variable `orphanInvalidateSigRef` appears at: declaration, read (`if (... === signature)`), write (`= signature;`), and reset (`= null;`). That is 4 references in the prompt's own code block. The "3 hits" target is incorrect — only the "Допустимо: 3-4" footnote saves it. **PROMPT FIX:** Change "Ожидание: ровно 3 hits" → "Ожидание: ровно 4 hits".

8. **[LOW] `grep -n 'invalidateQueries({ queryKey: \["openSessions"\] })'` expects ≥2 hits.** This assumes a pre-existing `invalidateQueries` call in `confirmCloseTable`. The prompt does not verify this assumption in Pre-flight (only mentions it in passing in Fix C verification). If the pre-existing call uses a slightly different formatting (`invalidateQueries({queryKey:["openSessions"]})` no spaces, or with `, exact: false` argument) the grep returns 1 hit and CC will assume Fix C did not apply. **PROMPT FIX:** Add to Pre-flight: pre-pin the existing `invalidateQueries(["openSessions"])` count baseline before edits.

9. **[LOW] Fix B.6 useCallback dep guidance is incomplete.** The replacement code keeps `setExpandedGroupId`, `setHighlightGroupId`, `highlightTimerRef` out of deps (correct per React rules — setters are stable, refs don't trigger re-render). But the prompt does not explicitly say so, and CC may add them defensively, causing unnecessary re-creation. **PROMPT FIX:** Add a one-liner: "deps: only `[openSessionByTableId]`. Do NOT include setters or refs — they are stable identities."

## Line Number Verification

| Reference | Prompt says | Verifiable from prompt? | Status |
|-----------|------------|-------------------------|--------|
| File total length | 4617 lines | Stated as HEAD truth + diff-q gate | ✅ Self-consistent |
| `staleTime: 30_000` | line ~3548 | Range 3541-3552 quoted | ✅ |
| `queryKey: ["openSessions", partnerId]` | line ~3542 | Within same useQuery block | ✅ |
| `const orderGroups = useMemo` | line ~3768 | Range 3768-3819 quoted | ✅ |
| `const filteredGroups = useMemo` | line ~3862 | Range 3862-3883 | ✅ |
| `const tabCounts = useMemo` | line ~3886 | Range 3886-3908 | ✅ |
| `data-group-id={group.id}` live | line ~2292 | 3 hits total (~565, ~1173 in comments) | ✅ Documented |
| `handleBannerNavigate = useCallback` | line ~4142 | Plus prop pass @ ~4610, indirect @ ~2825 | ✅ |
| `data: orders,` | line ~3497 | Within orders useQuery ~3494-3512 | ✅ |
| `openSessionByTableId = useMemo` | line ~3554 | Used as Fix C placement anchor | ✅ |
| `confirmCloseTable` `setExpandedGroupId(null)` | line ~4190 | "не менять" | ✅ |
| `buildBannerInfo` | lines ~4079-4090 | FROZEN | ✅ |

All line refs cross-reference internally. Cannot independently verify against actual file (per task constraint), but they are mutually consistent and documented with grep anchors + sed fallbacks.

## Fix-by-Fix Analysis

- **Fix A — staleTime 30→5s:** **SAFE.** Single-line change, comprehensive Should-NOT list, queryKey shape protected. Verification thorough.
- **Fix B.1 — orderGroups useMemo:** **SAFE.** Full block replacement with structurally identical deps. Phantom-card behavior (~v7-M1) explicitly documented as intentional.
- **Fix B.2 — filteredGroups:** **SAFE.** Only `if (group.type === 'table')` block changes. Deps preserved.
- **Fix B.3 — tabCounts:** **SAFE.** Symmetrical to B.2. Deps preserved.
- **Fix B.4 — call-site props (4 edits):** **RISKY.** Multi-line `old_string` for Edit 1 depends on exact whitespace. Three other edits use single-line anchors with explicit indentation — formatter drift could break them. (See Issue #3.)
- **Fix B.5 — data-group-id live JSX:** **RISKY.** Requires CC to construct Edit from `sed` output; illustrative example may seed wrong assumption (Issue #1). Comment-only hits properly marked optional. The `[v5-L4]` loose-regex verification softens formatter-tolerance.
- **Fix B.6 — handleBannerNavigate:** **SAFE.** Defensive resolution handles both pure tableId (current upstream) and compositeKey (future-proofing). Clear note about identity churn cosmetic impact. Minor: dep guidance could be more explicit (Issue #9).
- **Fix B.7 — confirmCloseTable:** **SAFE.** No-op (explicit "не менять").
- **Fix C — orphan invalidate useEffect:** **MOSTLY SAFE.** One-shot signature guard, status filter, prefix-invalidate all reasoned. Two RISKY threads: (a) `getLinkId` deps conditional (Issue #2), (b) `useRef` import detection false-positive risk (Issue #4).

## Summary
Total: 9 issues (0 CRITICAL, 3 MEDIUM, 6 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY)
- **Overall clarity: 4/5**
- **What was most clear:** Identifier Contract table (lines 222-253) is excellent — single source of truth that prevents the most likely class of error (global find-replace `group.id → group.compositeKey`). FROZEN UX list, SCOPE LOCK, Fix Priority+Dependencies ordering, and per-Fix Should-NOT sections all leave little room for ambiguity. Wireframe (lines 347-362) communicates the UX outcome instantly. Pre-flight grep gates with counts are well-thought-out.
- **What was ambiguous or could cause hesitation:** (1) Fix B.5 example showing `compositeKey` in `highlightRing` line creates a contradictory mental model (Issue #1). (2) Fix C `getLinkId` deps branch — "wrap in useCallback" instruction lacks specifics (Issue #2). (3) wc-l lower bound permits a regression band (Issue #6).
- **Missing context:** Whether `OrderGroupCard` is defined in the same file (a closure over parent state) or imported from elsewhere — affects whether `highlightGroupId` is in scope at the `data-group-id` line. Pre-flight could add: `grep -n "function OrderGroupCard\|const OrderGroupCard" file` to disambiguate.

## Fix Ratings (MANDATORY)

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix A (staleTime 30→5s) | 5/5 | Clear | None |
| Fix B.1 (orderGroups useMemo) | 5/5 | Clear | None |
| Fix B.2 (filteredGroups) | 5/5 | Clear | None |
| Fix B.3 (tabCounts) | 5/5 | Clear | None |
| Fix B.4 (call-site 4 edits) | 4/5 | Minor issues | Multi-line whitespace fragility (Issue #3, #5) |
| Fix B.5 (data-group-id live) | 3/5 | Needs clarification | Illustrative example is internally inconsistent (Issue #1); CC must construct Edit from sed output but example may mislead |
| Fix B.6 (handleBannerNavigate) | 4/5 | Minor issues | Deps note could be explicit (Issue #9) |
| Fix B.7 (confirmCloseTable) | 5/5 | Clear (no-op) | None |
| Fix C (orphan useEffect) | 3/5 | Needs clarification | `getLinkId` deps conditional underspecified (Issue #2); useRef import detection false-positive risk (Issue #4) |

Overall prompt verdict: **NEEDS REVISION** — Fix B.5 (3/5) and Fix C (3/5) require pre-execution clarification on the issues above. Fixes A, B.1-B.3, B.7 are ready to execute as-is. Fixes B.4, B.6 have minor sharpening opportunities but are executable.
