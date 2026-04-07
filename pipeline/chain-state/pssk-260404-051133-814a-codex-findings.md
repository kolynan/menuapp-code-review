# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-260404-051133-814a

## Issues Found
1. [CRITICAL] Broken truncation safeguard — The KB-095 recovery logic is internally wrong. It says to verify against `git HEAD` after commit, but after commit `HEAD` already contains the edited file, so a truncated file can still "match". The fallback restore path can also discard valid edits or restore the already-bad committed version. The prompt also contradicts itself by using both "match HEAD" and "5184 ± 20" as separate rules.  
PROMPT FIX: Capture a baseline before any edits, run the truncation check before commit, and compare against that baseline plus an expected delta. Use a temp backup or `git restore --source=HEAD -- pages/PublicMenu/x.jsx` only before commit, and explicitly say what to do after recovery.

2. [CRITICAL] Fix 2a hardcodes English instead of localizing the chips — Replacing `HELP_CHIPS` Russian literals with English literals fixes one language by hardcoding another. Unlike Fix 2b/2c, this bypasses `tr()` and can regress RU or any other locale by making these chips always English.  
PROMPT FIX: Convert `HELP_CHIPS` to localized keys or a helper like `getHelpChips(tr)`, add the needed keys to the dictionary, and explicitly require preserving behavior in non-EN modes.

3. [CRITICAL] No acceptance check for the actual user-visible bug — The prompt only runs static text checks, line counts, and a weak syntax check. It never verifies that selecting English shows English UI, or that Russian mode still behaves correctly after the changes. The task can "pass" while the real bug remains.  
PROMPT FIX: Add a runtime smoke test for both EN and RU mode with exact surfaces to inspect, for example help drawer chips, reminder labels, and the three `ago` strings.

4. [MEDIUM] Shell assumptions are not specified, but the commands are bash/GNU-specific — The prompt uses `python3`, `grep`, `wc`, `head`, and UNIX-style redirection/pipes. In Claude Code Desktop on Windows or PowerShell, these commands may fail or behave differently.  
PROMPT FIX: Either state that the task must run under bash, or provide PowerShell-safe equivalents for every validation command.

5. [MEDIUM] Later line-number targets can drift after Fix 1 — The prompt explicitly says to do Fix 1 first, but later fixes are still referenced by the original line numbers. A large block replacement can shift those locations and make "read only these lines" unreliable.  
PROMPT FIX: Use exact old-code anchors for Fix 2a/2b/2c, or instruct the executor to inspect all later target ranges before applying Fix 1.

6. [MEDIUM] Fix 2b assumes `[tr]` is safe without requiring the missing context — Changing `useCallback(..., [])` to `useCallback(..., [tr])` is better for stale-closure correctness, but the prompt does not allow enough context to verify whether `tr` is stable or whether `getHelpReminderWord` is used as a prop/dependency elsewhere. That can introduce avoidable re-render churn or hesitation.  
PROMPT FIX: Tell the executor to inspect the `tr` declaration and all usages of `getHelpReminderWord`; if the helper is local-only, prefer a plain function. If it must stay memoized, explain why `[tr]` is the intended dependency.

7. [MEDIUM] Validation step 2 does not implement what the prompt claims — The text says "after line 1000", but the command searches the entire file. `grep -v '^\s*//'` also runs on `grep -n` output, so comment lines start with `123:` and will not be filtered as intended. On top of that, `\s` is not portable in basic `grep`.  
PROMPT FIX: Replace this with a single Python/Node script that filters by line number, ignores comments correctly, and prints any remaining literal `назад` matches.

8. [MEDIUM] The syntax check is not a real JSX validation step — `node --input-type=module < pages/PublicMenu/x.jsx` is not a reliable JSX parser, and the prompt already anticipates failure with "may not work". That means broken JSX can slip through while validation appears complete.  
PROMPT FIX: Use the repo's real lint/build/test command or a JSX-capable parser such as `esbuild`/`babel-parser`, and make parse success a required gate before commit.

9. [MEDIUM] Full dictionary replacement is brittle and lacks structural validation — Replacing the whole `I18N_FALLBACKS` object can silently drop upstream keys if the file changed after the prompt was authored. The prompt also does not validate duplicate keys or placeholder-token integrity for values like `{seconds}`, `{orderNumber}`, `{points}`, and `{percent}`.  
PROMPT FIX: Either patch only the changed values plus the 10 new keys, or add a post-edit script that checks key count, duplicate keys, and placeholder-token parity before commit.

10. [MEDIUM] The replacement copy includes product-wording decisions without marking them as approved — Some values are not obvious literal translations and may cause hesitation, for example `status.new` = `New` while `order_status.status_new` = `Accepted`, or `cart.view` = `Open`. An executor cannot tell whether these are deliberate product-copy choices or items they should question.  
PROMPT FIX: State explicitly that the provided dictionary block is approved copy and must be inserted verbatim, or link the source of truth for English wording.

11. [LOW] The counting language is inconsistent — The goal says "fix 3 hardcoded Russian string locations", Fix 2 says "4 surgical changes", and the actual instructions cover 2a, 2b, and three separate 2c sites. That mismatch is small but creates unnecessary hesitation during self-check.  
PROMPT FIX: Normalize the wording to something exact, such as "5 edit sites across 4 change groups".

12. [LOW] Auto-approve scope is broader than the task requires — The prompt auto-approves all file edits, terminal commands, git operations, and network access for a one-file local i18n fix. That increases the blast radius if the agent misinterprets the task.  
PROMPT FIX: Limit permissions to `pages/PublicMenu/x.jsx`, local git status/diff/commit, and the specific validation commands. Explicitly forbid network access and unrelated file changes.

## Summary
Total: 12 issues (3 CRITICAL, 7 MEDIUM, 2 LOW)

## Additional Risks
- There is no explicit final diff review step before commit, which is risky for a 5k-line file with a known truncation failure mode.
- The prompt searches only for bare `назад`, not for other unexpected Cyrillic literals outside the replacement block. A broader whole-file Cyrillic scan would be safer.
- If line-ending normalization changes the file, the current line-count heuristics can create false positives or false confidence.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 3/5
- What was most clear: The target file, the intended replacement dictionary content, and the high-level order of operations.
- What was ambiguous or could cause hesitation: Whether Fix 2a must preserve RU mode, whether `[tr]` is definitely safe, whether the provided English copy is already approved, and whether later line numbers are pre-edit or post-edit anchors.
- Missing context: The execution shell, the source of truth for English copy, the expected runtime smoke test for EN mode, and a safe pre-commit truncation-recovery procedure.
