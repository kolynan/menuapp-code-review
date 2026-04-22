<!-- Auto-extracted from task.log by watcher post-step (KB-165 fix, S296).
     Codex sandbox blocked direct write to pipeline/chain-state/; findings recovered from stdout.
     Source task: task-260416-132441-004  Chain: pssk-som-b2-1-260416-v4-260416-132441-f39a -->

# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-som-b2-1-260416-v4-260416-132441-f39a

## Issues Found
1. [CRITICAL] Fix A pins the wrong `openSessions` query key — Prompt lines 259-267 say the source query key is exactly `["openSessions"]`, but the real source at `staffordersmobile.jsx:3542` is `["openSessions", partnerId]`. A literal implementation can either stop on a “missing anchor” or wrongly rewrite the cache key and change partner scoping. PROMPT FIX: change all source-anchor references to `["openSessions", partnerId]`, and explicitly note that `invalidateQueries({ queryKey: ["openSessions"] })` is a prefix invalidate that may stay unchanged.

2. [CRITICAL] Fix C pre-check targets the wrong `orders` symbol — Prompt lines 753-758 tell Codex to grep `^  const orders ` at ~3529, but that pattern matches an inner helper variable at `staffordersmobile.jsx:1130`, not the query data alias. The actual query alias is `data: orders,` at `staffordersmobile.jsx:3497`. This can anchor Fix C to the wrong scope or create a false “file drift” blocker. PROMPT FIX: replace the pre-check with `grep -n "data: orders,"` or anchor on the `useQuery({ queryKey: ["orders", partnerId] ... })` block, with expected lines ~3496-3510.

3. [CRITICAL] `handleBannerNavigate` validation will false-stop on the correct file — Prompt lines 160-161 and 645-648 expect 4-5 hits for `handleBannerNavigate`, but the real file has only 2 direct hits: the callback at `staffordersmobile.jsx:4142` and the prop pass at `staffordersmobile.jsx:4610`. The actual navigation path is indirect via `onNavigate(banner.groupId)` at `staffordersmobile.jsx:2825`, with `banner.groupId` produced in `buildBannerInfo` around `staffordersmobile.jsx:4079-4090`. A literal pre-flight will STOP on valid source. PROMPT FIX: replace the hit-count gate with an explicit call-chain check: 2 direct `handleBannerNavigate` hits, 1 `onNavigate(banner.groupId)` call, and `banner.groupId` sourced from table ids.

4. [CRITICAL] Fix C verification contradicts the provided patch — The Fix C code block at prompt lines 780-829 never defines `hasOrphanedHallOrder`, but verification lines 861-871 require exactly 2 hits of that identifier and 0 hits of `hasOrphanedOrder`. That guarantees a false verification failure or pressures the implementer to invent extra code not present in the approved patch. PROMPT FIX: either add `const hasOrphanedHallOrder = orphanPairs.length > 0;` to the patch and verify it, or rewrite verification to check the actual identifiers in the proposed code (`orphanPairs`, `orphanInvalidateSigRef`, and the new `invalidateQueries` call).

5. [MEDIUM] Fix B.5 mixes live DOM edits with commented legacy snippets — Prompt lines 609-624 require replacing exactly 3 `data-group-id={group.id}` hits, but source lines `564` and `1166` start block-comment regions; only `staffordersmobile.jsx:2292` is live JSX. Requiring all 3 edits adds noise, weakens the “minimal diff” goal, and makes the verification count a poor proxy for real behavior. PROMPT FIX: distinguish live code from commented snapshots; require the live `OrderGroupCard` node change at ~2292 and mark comment-only replacements as optional/non-blocking.

6. [MEDIUM] Codex execution guidance is internally inconsistent for this runner — Prompt lines 216-223 tell Codex to use `Read / cat` directly, lines 225-228 then forbid full-file `cat`, and the section assumes Unix `grep/sed` while also describing Windows timeout behavior. It also suggests fallback outputs like `result-codex.md` or a task-log if pipeline paths are blocked, which risks side files outside the chain contract. PROMPT FIX: state one supported self-read path per runner: `Read` if available; otherwise bounded line-range reads supported by the actual shell; do not assume `grep/sed/cat`; and remove alternate output-path advice that can create side artifacts.

## Summary
Total: 6 issues (4 CRITICAL, 2 MEDIUM, 0 LOW)

Checklist A-H: A ✅ PASS, B ✅ PASS, C ❌ FAIL (2/5), D ❌ FAIL (2/5), E ✅ PASS, F ✅ PASS, G ✅ PASS (4/5), H ❌ FAIL (2/5)

## Additional Risks
- Several STOP conditions are tied to incorrect anchors, so the executor can halt on a correct source file before making any code change.
- If the prompt is followed literally, Fix A can accidentally normalize the source query key to `["openSessions"]`, changing cache partitioning rather than just reducing `staleTime`.
- Count-based verification against commented code makes it harder to tell whether the live DOM path was actually fixed.

## Prompt Clarity
- Overall clarity: 3/5
- What was most clear: The root-cause narrative, the A→B→C fix order, and the Identifier Contract are strong and reduce design ambiguity.
- What was ambiguous or could cause hesitation: The real `openSessions` key, the actual `orders` anchor for Fix C, whether commented `data-group-id` hits must be edited, the `handleBannerNavigate` call chain, and the supported self-read/write workflow for Codex on Windows.
- Missing context: The prompt should cite the real `banner.groupId` producer, the true `orders` alias anchor, the fact that `getLinkId` is module-scoped and stable, and the exact runner/tool assumptions for self-read mode.

## Fix Ratings
Rate each Fix mentioned in the prompt. Scale: 1=Rewrite needed, 2=Major issues, 3=Needs clarification, 4=Minor issues, 5=Clear.

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix1 | 2/5 | Rewrite needed | Wrong source query-key contract for `openSessions` can cause false anchor failures or unintended cache-key edits. |
| Fix2 | 3/5 | Needs clarification | Core logic is mostly sound, but `handleBannerNavigate` validation and `data-group-id` count rely on incorrect/live-vs-comment-blind anchors. |
| Fix3 | 2/5 | Rewrite needed | Fix C has a wrong pre-check anchor and a self-contradictory verification section (`hasOrphanedHallOrder` is never defined in the patch). |

Overall prompt verdict: NEEDS REVISION (any <4/5)
