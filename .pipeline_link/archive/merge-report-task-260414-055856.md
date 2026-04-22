# Merge Report: CC + Codex -- PSSK v4 SOM Batch A
# Task: task-260414-055856 | Date: 2026-04-14

## Agreed (both found)

1. **B1/B2/B3/B4 are NOT live code.** Both CC and Codex independently determined that the line ranges cited for B1 (670-708), B2 (761-769), B3 (1288-1314), B4 (1374-1398) do not correspond to active, executable code. CC identified the exact mechanism: two large `/* */` block comments (546-785 and 1148-1414). Codex arrived at the same conclusion by noting the anchors "resolve to utility code, OrderGroupCard setup, and BannerNotification, not to a В РАБОТЕ wrapper" (though Codex explored a different file variant).

2. **Fix3 is solid.** Both rate it highest. The star badge stopPropagation fix at lines 2249-2252 and 2259-2262 is minimal, correct, and well-specified.

3. **closeSession() is shared.** Both verified it's called from PartnerTables (line 1981). The v4 prompt addresses this with explicit caller documentation and semantics verification.

4. **Fix2 root cause is correct in v4.** Previous versions had the "table still open" detection issue (`group.tableSession` doesn't exist). The v4 prompt resolves this with the `served-but-not-closed` approach using `getStatusConfig` + `o.status` checks.

## CC only (Codex missed)

1. **Exact block comment boundaries** (lines 546-785 and 1148-1414) with `/*` and `*/` markers -- CC identified the precise mechanism.

2. **B6 already has correct pattern.** Line 2333 already uses `inProgressSections.map` without a wrapper, making Fix4 a no-op for live code. Codex didn't explicitly make this connection.

3. **Fix2 Patch A quality assessment.** CC verified the useMemo wrapper preservation (lines 3789-3801), confirmed the dep array note is correct, and rated Change 3 as well-specified.

4. **tabCounts dep array nit.** The prompt should mention that line 3818's dep array also needs no changes (same reasoning as line 3801).

5. **Fix1 reduced to 4 live targets.** CC precisely identified that only B6 lines 2331/2333/2335/2337 are live, reducing the fix from 10 to 4 targets.

## Codex only (CC missed) -- evaluation

1. **Codex explored 260306-05 RELEASE.jsx** (4015 lines) and found completely different line numbers for all fixes in that file. This is NOT a valid finding for the prompt review because the prompt explicitly targets `staffordersmobile.jsx` (4524 lines), not the older RELEASE file. However, it highlights a risk: if the implementer opens the wrong file, all line numbers will be wrong.

   **Verdict:** Not applicable to current prompt, but the prompt should add a note like "Do NOT edit 260306-05 RELEASE.jsx -- target file is staffordersmobile.jsx only."

2. **Codex noted Fix3 badges "do not exist" in 260306-05.** This is file confusion (see above). In the correct file (staffordersmobile.jsx), the badges DO exist at lines 2249-2262.

   **Verdict:** False finding, caused by analyzing wrong file.

## Disputes (disagree)

1. **Codex Round 2 gave ALL fixes "Rewrite needed"** including Fix2 and Fix3. CC rates Fix2 at 4.5/5 and Fix3 at 5/5.

   **Resolution:** Codex's low ratings stem from analyzing a DIFFERENT file (260306-05, 4015 lines) where line numbers don't match. When analyzed against the correct file (staffordersmobile.jsx, 4524 lines), Fix2 and Fix3 are well-specified. **CC's assessment is correct for the prompt's stated target file.**

2. **v3p Codex vs this Codex on "dead code" claim.** The v4 prompt added a warning saying Codex v3p was wrong about dead code. Both CC v4 AND Codex v4 confirm that the code IS in block comments. **The prompt's warning to Codex is itself incorrect and should be removed.**

## Final Ratings

| Fix | CC | Codex | Agreed | Notes |
|-----|-----|-------|--------|-------|
| Fix 1 | 2.5/5 | ~2/5 | YES (needs rewrite) | Both agree B1/B3 targets are dead; CC specifies 4 live B6 targets |
| Fix 2 | 4.5/5 | ~2/5 (wrong file) | DISPUTE | CC correct (verified against staffordersmobile.jsx); Codex analyzed wrong file |
| Fix 3 | 5/5 | ~2/5 (wrong file) | DISPUTE | CC correct; Codex analyzed wrong file |
| Fix 4 | 1/5 | ~1/5 | YES (needs rewrite) | Both agree all targets are dead code |

## Recommended Actions

No code changes (this is a prompt review, not implementation). The prompt draft needs:

1. **Remove the "ЖИВОЙ КОД" warning** -- it's incorrect. B1-B4 ARE in block comments.
2. **Fix1:** Reduce to 4 targets (B6 only). Update grep verifications.
3. **Fix4:** Decision needed from Arman -- remove, redirect to line 2346, or add "uncomment blocks" step.
4. **Add file disambiguation:** "Target: staffordersmobile.jsx (4524 lines), NOT 260306-05 RELEASE."
