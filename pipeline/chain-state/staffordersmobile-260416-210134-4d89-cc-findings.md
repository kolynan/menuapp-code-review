# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260416-210134-4d89
Date: 2026-04-16
Prompt file: `pipeline/drafts/pssk-som-b2-1-260416-v6.md`
Reviewer role: CC evaluating prompt-design quality (no code changes).

---

## Issues Found

1. **[CRITICAL] Wrong file-path prefix — `menuapp-code-review/pages/...`**
   The prompt uses `menuapp-code-review/pages/StaffOrdersMobile/staffordersmobile.jsx` (and siblings) in EVERY bash command: `cp`, `grep -n`, `sed -n`, `wc -l`, `diff`, `git diff`. In the actual worktree (cwd = `C:\Dev\worktrees\task-260416-210136-014`) the file lives at `pages/StaffOrdersMobile/staffordersmobile.jsx`. The folder `menuapp-code-review/` EXISTS at the worktree root but is **empty** (no `pages/` child). As a result, every Pre-flight / Preparation / Verification command would fail with "No such file or directory", and the executor would either mis-report a blocker or (worse) silently produce zero-hit gates that it misreads as "all clear". Occurrences: ≈30 in the prompt body.
   **PROMPT FIX:** Replace ALL `menuapp-code-review/pages/StaffOrdersMobile/...` occurrences with `pages/StaffOrdersMobile/...`. Add a single "Path convention" line at the top: "All paths are relative to repo root (`pages/...`); do NOT prefix `menuapp-code-review/`. If execution happens from a parent folder, cd into the repo root first."

2. **[MEDIUM] Fix A §Should NOT cites a non-existent `staleTime: 0`**
   The "Список staleTime значений, которые ЗАПРЕЩЕНО трогать" section states:
   > `staleTime: 0` для `["orders", partnerId]` query — нужен real-time polling, не менять.
   The actual `orders` useQuery block (RELEASE @ 3494-3512) contains **no `staleTime` key at all** (polling is driven by `refetchInterval`). All existing staleTime values in the file are `30000` or `60000`. CC may waste a cycle searching for a non-existent anchor and become uncertain whether it was accidentally removed.
   **PROMPT FIX:** Replace that bullet with: "Orders useQuery (~3494) does NOT set `staleTime` — it relies on `refetchInterval: effectivePollingInterval`. Do not add one."

3. **[MEDIUM] Fix B.5 Edit 1 (live JSX `data-group-id`) has no explicit `old_string`**
   The prompt says *"Edit pair: old_string: (3-5 строк surrounding context live JSX из ~2292)"* and asks the executor to run `sed -n '2285,2298p'` first to derive it. Verified content at line 2292 of RELEASE is:
   ```jsx
   <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
   ```
   Identical substring `data-group-id={group.id}` also appears on lines 565 (inside `/* ... */`) and 1173 (inside `/* function RateLimitScreen { ... */`). Because both comment-blocks are multi-line `/* ... */`, if the executor writes an `old_string` that is ONLY the `<div data-group-id={group.id} ...` line without surrounding context, the Edit will succeed for one of the two comment copies on the first pass (non-unique error only fires on exact duplicates; here the full line text differs from @2292 by `${highlightRing}` closing). Actually line 565 is byte-identical to 2292 — risk of ambiguous match is real.
   **PROMPT FIX:** Inline the exact Edit pair in the prompt using 2-line context unique to @2292:
   ```
   old_string:
     const highlightRing = isHighlighted ? "ring-2 ring-indigo-400 ring-offset-1" : "";

     return (
       <div data-group-id={group.id} className={`mb-3 rounded-lg border border-slate-200 overflow-hidden transition-all duration-300 ${style.bgClass} ${style.borderClass} ${highlightRing}`}>
   new_string:
     (same with group.id → group.compositeKey)
   ```
   The `return (` + preceding `highlightRing` declaration is NOT present around lines 565/1173 (those are inside comments without surrounding code), so uniqueness is guaranteed.

4. **[MEDIUM] Fix B.1 ServiceRequest branch creates a phantom card when no open session**
   New logic: if a ServiceRequest arrives for a table with no open session, it builds `compositeKey = `${tableId}__no-session`` and creates an empty group (`orders: []`). This group's `sessionId === null` ≠ `openId === null`, so `isCurrentOpenSession === false` → the group is bucketed into **«Завершённые»** (completed tab). But `hasActiveRequest` will be true for it, contradicting the "completed" classification semantically. CC should be told whether this is intended or whether the ServiceRequest-from-closed-table case should be dropped.
   **PROMPT FIX:** Add one clarifying line under B.1: "If `openSessionByTableId[tableId] == null` the ServiceRequest branch is still appended (by design — closed-table requests render in «Завершённые» as a phantom card). If you see an empty `orders: []` table group in «Активные», that's a bug." This tells the executor what to expect and what would be a regression.

5. **[LOW] Fix B.2 filter keeps `hasActiveRequest` on `group.id` — ok, but worth highlighting the invariant**
   The prompt already contains a note ("⚠️ Важно: hasActiveRequest..."), but it does not explain why `activeRequests.some(r => getLinkId(r.table) === group.id)` is not a double-count vs. B.1 (where the request creates a compositeKey-keyed group). In practice: the activeRequest flows into both the open-session group (via B.1 ServiceRequest append) AND every legacy/closed-session group for the same table (because B.2 tests only by tableId). Closed-session groups get dropped by the early-return (`isCurrentOpenSession === false`), so the double-count never manifests. Worth an explicit comment.
   **PROMPT FIX:** Append to the Важно note: "Closed-session groups for the same table are dropped by the early-return before `hasActiveRequest` is evaluated, so there is no double-bucket."

6. **[LOW] Codex Execution Mode block is irrelevant for a CC reviewer**
   Section "Codex Execution Mode (для codex-writer-v2 step)" (lines 257-272) is written for Codex, not CC. When CC runs this prompt as a reviewer (as in this task), the block is dead weight and could mislead. Not a blocker but adds ~20 lines of noise.
   **PROMPT FIX:** Move to an appendix or wrap in `<!-- CODEX-ONLY -->` markers.

7. **[LOW] `grep -c "useRef"` pre-check returns inflated count**
   Prep §4 expects `≥2` hits (import + declaration). In reality the file has 20+ useRef occurrences (verified at lines 1807, 1808, 1809, 1810, 1811, 1901, 2776, 2777, 2778, 2882, 2883, 2884, 2887, 2892, 2935, 2945, 2959, 2960, 2995, 3049, 3182, 3908, 3909, 4099 in RELEASE). Using `grep -c` for "is useRef imported?" is noisy — better: `grep -n "^import .* useRef" file` or `grep -cn "from 'react'" file` + read the line.
   **PROMPT FIX:** Replace with `grep -nE "^import.*useRef.*from 'react'|^import.*from 'react'" file | head -3` so the executor can see the import form.

8. **[LOW] Size gate formula is correct but hard to read**
   Pre-flight §1: `4617 +70/-35 (диапазон 4582-4687)`. The math is right, but mixing `+70/-35` with "диапазон" invites off-by-one reads. Also the lower bound 4582 comes from 4617 − 35, which is tight given Fix B alone adds ~30 new lines — a net shrink is unlikely, and `-35` acts as a floor against accidental deletion, not an "expected" range.
   **PROMPT FIX:** Change to "Expected final range: 4617 to 4687 (+0 to +70 new lines). Floor guard: 4582 — if below, something was deleted, STOP."

9. **[LOW] `staleTime: 5_000` verification regex too permissive**
   Post-Fix-A verification does `grep -n "staleTime:" file | grep "5_000"`. This would also match `staleTime: 15_000` or `staleTime: 50_000` if accidentally typed. Not likely to happen, but the positive check should match the exact replacement.
   **PROMPT FIX:** `grep -n "staleTime: 5_000," file` (exact, with trailing comma).

10. **[LOW] No instruction on how to handle the Preparation §0.0 gate-fail**
    Prep §0.0 exits with code 1 if working copy has uncommitted diff. But the `exit 1` is inside a heredoc/script context — if CC runs the lines individually (as is typical via Bash tool), an `exit 1` in mid-script won't actually stop the session. The executor may miss the gate.
    **PROMPT FIX:** Replace `exit 1` with an explicit "STOP — do NOT proceed. Report to Arman and wait." line, plus mark the block clearly as a gate.

---

## Line Number Verification

| Reference | Prompt says | Actual (RELEASE @ 4617 lines) | Status |
|-----------|-------------|-------------------------------|--------|
| RELEASE file total | 4617 lines | 4617 lines | OK |
| Working copy total | — (copied from RELEASE) | 4575 lines (pre-copy) | OK — Prep handles this |
| `staleTime: 30_000` | ~3548 | 3548 | OK |
| `queryKey: ["openSessions", partnerId]` | ~3542 | 3542 | OK |
| `data: orders,` | ~3497 | 3497 | OK |
| `const orderGroups = useMemo` | ~3768 | (not directly verified in RELEASE grep above — prompt's Pre-flight pins it) | Likely OK |
| `const filteredGroups = useMemo` | ~3862 | (not directly verified) | Likely OK |
| `const tabCounts = useMemo` | ~3886 | (not directly verified) | Likely OK |
| `const handleBannerNavigate = useCallback` | ~4142 | (not directly verified) | Likely OK |
| `onNavigate(banner.groupId)` | ~2825 | (not directly verified) | Likely OK |
| `data-group-id={group.id}` live JSX | ~2292 | 2292 | OK |
| `data-group-id={group.id}` in block-comment #1 | ~565 | 565 (inside `/* ... */` starting at 564) | OK |
| `data-group-id={group.id}` in block-comment #2 | ~1173 | 1173 (inside `/* function RateLimitScreen { ... */` starting at 1170) | OK |
| `v2SortedGroups.map(group => (` | ~4458 | 4457 | OK (off-by-one tolerance within prompt's `~`) |
| File path base | `menuapp-code-review/pages/...` | `pages/...` | **FAIL — path prefix wrong** |

---

## Fix-by-Fix Analysis

- **Fix A (staleTime 30s → 5s):** SAFE. Single-line Edit, well-anchored. Minor nit: fictional `staleTime: 0` in Should-NOT list (Issue #2). Otherwise clear.
- **Fix B.1 (orderGroups useMemo):** MOSTLY SAFE. Full-block replacement is well-specified and dep array noted to be unchanged. Open question: ServiceRequest orphan card (Issue #4). Should be clarified.
- **Fix B.2 (filteredGroups):** SAFE. Replacement is minimal and correct; isCurrentOpenSession check is sound.
- **Fix B.3 (tabCounts):** SAFE. Same pattern as B.2.
- **Fix B.4 (4 call-site updates):** SAFE. Each Edit is uniquely anchored and explicit. Good.
- **Fix B.5 (data-group-id live JSX + optional comment snapshots):** RISKY. Edit 1 lacks explicit `old_string` and has a byte-identical duplicate at line 565 (Issue #3). Needs to be spelled out with surrounding context for uniqueness.
- **Fix B.6 (handleBannerNavigate):** SAFE. Full useCallback replacement, dep array explicitly adds `openSessionByTableId`. Defensive resolve handles both tableId and compositeKey inputs.
- **Fix C (orphan invalidate useEffect):** MOSTLY SAFE. Signature-guard + status filter address the infinite-loop risk well. Pre-checks for `queryClient` and `useRef` import are good. The `grep -c "useRef"` gate is noisy (Issue #7) but not blocking.

---

## Summary

Total: 10 issues (1 CRITICAL, 3 MEDIUM, 6 LOW)
Prompt clarity rating: **3/5** (would be 4/5 if the path prefix were correct; the CRITICAL path bug drags it down because every single bash command fails as written)

## Prompt Clarity (MANDATORY)
- **Overall clarity:** 3/5
- **What was most clear:**
  - Identifier Contract table (lines 222-253) — clearly delineates DOM-key vs. business-key usage. Excellent.
  - Fix B.4 per-prop Edit pairs — explicit old_string/new_string, no placeholders.
  - Fix C safety reasoning (carryover vs. genuine orphan vs. stale response) — thorough.
  - Verification blocks per Fix — comprehensive, every change has a post-check.
  - FROZEN UX / SCOPE LOCK — extremely clear about what not to touch.
- **What was ambiguous or could cause hesitation:**
  - File path prefix (#1) — will block all bash work and force the executor to guess.
  - B.5 Edit 1 placeholder old_string (#3) — risk of wrong-block match.
  - Preparation §0.0 `exit 1` inside inline bash block (#10) — unclear whether it actually stops the session.
- **Missing context:**
  - What to do with the two legacy `.bak` files after successful commit (the prompt creates `.bak` in Prep §0.1 but never mentions deletion after release).
  - No `git diff --stat` hard cap (e.g., "expect ≤150 line diff total") — F5 rule in system-prompt mentions "hundreds of deleted lines", but the prompt could name a concrete expected diffstat range.
  - What to do if `diff -q RELEASE working-copy` shows trailing-newline-only diff after Prep (prompt says "пусто, если trailing newline → STOP" but trailing-newline is usually benign; clarify).

---

## Fix Ratings (MANDATORY)

| Fix | Rating (1-5) | Verdict | Key issue (if any) |
|-----|-------------|---------|-------------------|
| Fix A | 4/5 | Minor issues | Fictional `staleTime: 0` in Should-NOT; path prefix bug. |
| Fix B.1 | 4/5 | Minor issues | ServiceRequest orphan-card semantics unaddressed; path prefix bug. |
| Fix B.2 | 5/5 | Clear | Good scoped replacement with clear invariant note. |
| Fix B.3 | 5/5 | Clear | Mirrors B.2 correctly. |
| Fix B.4 | 5/5 | Clear | Four explicit Edit pairs, each uniquely anchored. |
| Fix B.5 | 3/5 | Needs clarification | Edit 1 old_string is a placeholder — must be spelled out to avoid byte-identical match at line 565. |
| Fix B.6 | 5/5 | Clear | Full useCallback replacement, deps handled, defensive helper explained. |
| Fix C | 4/5 | Minor issues | Good logic + signature guard; `useRef` pre-check uses `-c` on a common symbol (noisy), and `queryClient` rename path is sketched but not fully. |

**Overall prompt verdict: NEEDS REVISION** (Fix B.5 at 3/5 + CRITICAL path issue + MEDIUM Fix A/B.1 concerns).

Without the path prefix fix, nothing in the Pre-flight, Preparation, or Verification blocks will execute successfully. That single CRITICAL issue alone blocks adoption; the B.5 old_string explicitization is the other mandatory revision.
