# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260405-182147-7fb7

## Issues Found
1. [CRITICAL] Embedded Python steps are not reliably executable — Step 2 and Step 3 are fenced as `python` snippets but are not wrapped in an executable invocation, and the snippets themselves are malformed: statements run together after the triple-quoted string, and the inline `if ... else` form is invalid Python. Step 4 also contains an invalid f-string (`print(f'{'OK' ...`) that will raise a syntax error before any validation runs. PROMPT FIX: Replace every pseudo-code block with a tested, copy-pasteable command format for the actual shell in use, or provide a temporary script file with valid Python syntax.

2. [CRITICAL] The command set assumes Unix tools in a Windows/PowerShell flow — `wc -l`, `cp`, and `grep -n` with GNU-style regex assumptions are not portable to PowerShell and can fail or behave differently. This prompt is likely to stall before reaching the actual fix. PROMPT FIX: Use PowerShell-native commands (`Get-Content`, `Copy-Item`, `Select-String`) or do all file checks and edits in Python so the executor does not have to translate tool syntax.

3. [CRITICAL] The restore rule can overwrite valid work for the wrong reason — “If `wc -l` is less than 5200, restore from RELEASE” is a destructive heuristic, not a correctness check. A legitimate version of `x.jsx` may be shorter, and auto-restoring will silently discard unrelated edits. PROMPT FIX: Remove the automatic restore. If integrity must be checked, compare exact anchors, file hash, or diff against the intended baseline and abort for manual review instead of overwriting.

4. [CRITICAL] Commit/push happen before the RELEASE copy is created — Step 6 stages and commits only `pages/PublicMenu/x.jsx`, pushes it, and only then copies the file to `260404-03 PublicMenu x RELEASE.jsx`. If the RELEASE file is meant to be part of the result, it will be missing from the commit and remote. PROMPT FIX: Create/update the RELEASE file before `git add`, stage both files explicitly, and only then commit and push. If the RELEASE copy is intentionally local-only, say that explicitly.

5. [CRITICAL] Blanket auto-approval plus `git push` is an unsafe default — The prompt authorizes all file edits, terminal commands, git operations, and network access without any repo-state check. In a dirty worktree, this can push unrelated local history or leave the executor trying to force a network action the environment does not allow. PROMPT FIX: Restrict the allowed write set to the target file(s), require a clean diff review before commit, and make push conditional on explicit user authorization or repository policy.

6. [MEDIUM] The insertion anchors are too brittle and not uniqueness-safe — Step 1 only checks that patterns exist somewhere, but Step 2 and Step 3 perform first-match string replacement against generic markers such as `};\n\n/**\n * Wraps raw t()` and `// Try the real translation first`. If those markers appear more than once or formatting shifts, the patch can land in the wrong place. PROMPT FIX: Provide the exact surrounding code to replace, require exactly one match, and abort on both zero matches and multiple matches.

7. [MEDIUM] The prompt is not idempotent — There is no pre-check for an existing `I18N_FALLBACKS_RU` declaration or an already-added RU branch inside `makeSafeT`. A retry or partial rerun can produce duplicate declarations or duplicate logic and break the file. PROMPT FIX: Add explicit “already applied” guards and update-in-place behavior instead of unconditional insertion.

8. [MEDIUM] The proposed placeholder replacement code is over-escaped and unverified — The RU block’s interpolation logic uses `new RegExp(\`\\\\\\\\{${k}\\\\\\\\}\`, "g")`, which is difficult to reason about and likely to produce the wrong runtime regex after Python and JavaScript escaping are both applied. It also does not say whether parameter names need regex escaping. PROMPT FIX: Use a simpler, known-good replacement strategy such as `replaceAll(\`{${k}}\`, ...)` if supported, or specify a small tested helper like `escapeRegExp` and show the exact final JS code expected in the file.

9. [MEDIUM] The prompt omits the exact `makeSafeT` context needed to place the RU logic safely — It assumes `lang`, `key`, and `params` are already in scope and that the RU block must go immediately before “Try the real translation first,” but it does not show the real function body. If there are early returns or existing guards, the requested insertion point may be semantically wrong. PROMPT FIX: Paste the exact current `makeSafeT` excerpt and specify where the new RU branch belongs relative to null checks, EN fallback logic, and the raw translation call.

10. [MEDIUM] Locale handling is under-specified — The prompt hardcodes `lang === 'ru'`, but does not say whether the app uses simple language codes or locale strings such as `ru-RU`. If the runtime value is normalized differently, the new branch will never run. PROMPT FIX: Require the executor to confirm the actual language format in the existing code or define the intended match rule explicitly, for example `lang?.startsWith('ru')` if that matches the app’s conventions.

11. [MEDIUM] Validation is too shallow to catch a broken patch — Step 4 only checks whether certain substrings exist, and Step 5 only compares line counts. Neither step verifies JavaScript syntax, duplicate declarations, correct branch ordering, or actual RU/EN behavior. PROMPT FIX: Add validation that the file still parses, that only one RU object and one RU branch exist, and that representative translations behave as intended: RU `help.remind` and `cart.my_bill` resolve to Russian while EN behavior remains unchanged.

12. [LOW] The KB-095 check is not a real correctness signal — Comparing working-tree line count to `HEAD` can fail for unrelated reasons, and a valid fix could decrease line count. It also assumes `HEAD:pages/PublicMenu/x.jsx` exists at that exact path. PROMPT FIX: Replace the line-count comparison with a deterministic diff check against the intended inserted code blocks.

13. [LOW] Reporting requirements are internally contradictory — The executor is told to auto-approve everything and never ask for confirmation, but also to output a `## Permissions Requested` section and list ambiguities before execution. That creates noise and can make the agent hesitate about whether it should stop or proceed. PROMPT FIX: Remove the permissions section for autonomous runs, and if a preflight note is required, specify that it is informational only and must not block execution.

14. [LOW] Unicode/encoding guidance is only partially specified — The prompt correctly mentions UTF-8 and uses `\u` escapes for many strings, but it does not explicitly forbid shell redirection or other write paths that may alter encoding, BOM, or line endings in a 5k-line JSX file. PROMPT FIX: State that file writes must use Python with `encoding='utf-8'`, preserve original line endings, and avoid shell-based redirection for this file.

## Summary
Total: 14 issues (5 CRITICAL, 6 MEDIUM, 3 LOW)

## Additional Risks
- The prompt rewrites the entire file through full-string replacement for a tiny change. If an anchor matches the wrong location, the result can be syntactically valid but semantically wrong and hard to notice.
- Because retries are not handled, a partial run can leave the file modified and the next run can compound the damage instead of converging on the intended state.
- The final workflow does not verify that only the allowed file set changed. In a dirty repo, the executor may believe the task is complete while unrelated changes remain staged or pushed.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 2/5
- What was most clear: The intended product bug and the high-level fix idea are clear: add a Russian fallback map and consult it before accepting English values in RU mode.
- What was ambiguous or could cause hesitation: The exact executable form of Steps 2-4, the safe insertion point inside `makeSafeT`, whether locale values are exactly `ru`, and whether the RELEASE copy is supposed to be committed.
- Missing context: The actual current `makeSafeT` excerpt, confirmation of the shell/environment, the allowed write set, whether retries must be safe, and the exact post-fix verification expected beyond substring checks.
