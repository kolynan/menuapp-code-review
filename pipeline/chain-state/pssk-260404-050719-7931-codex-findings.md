# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: pssk-260404-050719-7931

## Issues Found

1. **[MEDIUM] Fix 2b: `[tr]` dependency array may cause performance issue** — The prompt changes `useCallback`'s dependency array from `[]` to `[tr]`. If `tr` is recreated on every render (common pattern: `const tr = ...` inside component body or derived from a hook), this `useCallback` will invalidate every render, defeating memoization. The prompt should add a note: "Verify that `tr` is a stable reference (e.g., from useMemo or useRef). If `tr` changes every render, wrap it in `useRef` first, or keep `[]` and access `tr` via ref." However — given that `tr` is likely from `useI18n()` which typically returns a stable function, this is likely safe. The risk is LOW in practice but the prompt should acknowledge it explicitly so the executor doesn't hesitate.
   **PROMPT FIX:** Add a one-line note after Fix 2b: "Note: `tr` comes from `useI18n()` / `makeSafeT()` and is expected to be a stable reference. Adding `[tr]` satisfies the React exhaustive-deps lint rule without re-render risk."

2. **[MEDIUM] Fix 2b: `getHelpReminderWord` now uses `tr()` but prompt doesn't verify `tr` is in scope at that line** — The function at line ~2448 switches from pure Russian strings to `tr('help.reminder', ...)`. The prompt assumes `tr` is available in the closure at that point. Since `tr` is defined earlier in the component (line ~595 area via `makeSafeT`), this should be fine — but the prompt doesn't explicitly confirm `tr` is accessible at line 2448. If the executor is cautious, they may want to verify.
   **PROMPT FIX:** Add: "Confirm `tr` is in scope at line 2448 (it is — defined near line 595 via `makeSafeT`)."

3. **[LOW] Fix 1: Duplicate semantic keys for "Preparing"** — The dictionary contains both `"status.cooking": "Cooking"` and `"order_status.status_preparing": "Preparing"`. These are different namespaces so technically fine, but the Order Status Screen has `"order_status.step_preparing": "Preparing"` AND `"order_status.status_preparing": "Preparing"` — two keys with identical values. This is intentional (step vs status), but worth flagging: the executor might wonder if one is a typo.
   **PROMPT FIX:** No change needed, but could add a comment: `// step_* = progress tracker steps, status_* = badge labels`

4. **[LOW] Fix 1: `order_status.status_new` maps to "Accepted" not "New"** — `"order_status.status_new": "Accepted"` seems semantically odd. The `status.new` key maps to `"New"`, but `order_status.status_new` maps to `"Accepted"`. This is likely intentional (the order status screen shows "Accepted" for new orders because they've been received), but an executor might hesitate and wonder if it should be "New".
   **PROMPT FIX:** Add comment: `// "Accepted" is intentional — on the order status screen, "new" orders are shown as "Accepted" to the guest`

5. **[LOW] Fix 2a: HELP_CHIPS are hardcoded English, not using `tr()`** — The prompt replaces Russian hardcoded strings with English hardcoded strings. This fixes the immediate EN-mode bug but doesn't use `tr()` for i18n. When RU mode is active, these chips will now show English. This may be intentional (the prompt says "fix EN language mode") but it breaks RU mode for these chips.
   **PROMPT FIX:** This is likely a **real bug in the prompt**. Either: (a) use `tr()` calls: `tr('help.chip_high_chair', 'High chair')` etc., and add corresponding keys to the dictionary in both EN values, OR (b) add a note explaining why hardcoded English is acceptable here (e.g., "these chips are only shown in EN mode" or "RU values come from the database/server, not from this array"). Without this clarification, the executor may correctly refuse to hardcode English strings when the app supports both languages.

6. **[MEDIUM] Fix 2c: Line numbers may have shifted** — The prompt references lines 2472, 2475, 2515 for "назад" occurrences. If Fix 1 changes the dictionary size (adding 10 keys = ~10 lines), all subsequent line numbers shift by ~10. The prompt says "Fix 1 first" in execution order. After Fix 1 adds ~10 lines, lines 2472/2475/2515 become ~2482/2485/2525. The prompt uses exact string matching (old→new), not line numbers, so this is NOT a blocker — but the stated line numbers will be wrong, which may confuse the executor.
   **PROMPT FIX:** Add note: "Line numbers for Fix 2 are from the ORIGINAL file. After Fix 1 adds ~10 lines, actual positions shift by ~10. Use the string content (not line numbers) for matching."

7. **[LOW] Validation step 3: `node --input-type=module` won't parse JSX** — The prompt already acknowledges this with "Note: JSX syntax check via node may not work". Since this validation step will always fail/warn, it adds noise without value. Better to remove it or replace with a more useful check.
   **PROMPT FIX:** Replace with: `grep -c 'function\|const.*=.*=>' pages/PublicMenu/x.jsx` (regression check — function count should not decrease). Or simply remove step 3.

8. **[LOW] Validation: No check that all 231 keys are present** — The prompt says "Total after fix: 231 keys (was 221)" but no validation step counts the keys. A simple `grep -c '".*":' pages/PublicMenu/x.jsx` within the I18N_FALLBACKS block would confirm.
   **PROMPT FIX:** Add validation step: `python3 -c "..." ` or `awk '/I18N_FALLBACKS = \{/,/^\};/' pages/PublicMenu/x.jsx | grep -c '":' ` — expected: 231.

## Summary
Total: 8 issues (0 CRITICAL, 3 MEDIUM, 5 LOW)

## Additional Risks

1. **RU mode regression from Fix 2a** — This is the biggest risk. If `HELP_CHIPS` is used in both EN and RU modes, hardcoding English breaks RU. The CC review (which gave 8/10) may have missed this. Severity depends on whether these chips are mode-dependent or universal.

2. **File encoding** — Previous sessions mention W1252 mojibake issues (Session 218). The prompt's dictionary contains only ASCII English text, so this should not be a problem. But the executor should verify the file is saved as UTF-8 after editing.

3. **Partial execution risk** — If the executor runs Fix 1 successfully but fails on Fix 2 (e.g., string not found due to line shift confusion), the dictionary will be English but 3 hardcoded "назад" strings remain. The validation in step 2 (`grep назад`) catches this, which is good.

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 4/5** (CC said 8/10 — I agree, roughly 8/10 = 4/5)
- **What was most clear:** Fix 1 is extremely well-specified — full replacement text, exact boundaries, key count. Fix 2c string replacements are exact and unambiguous. Execution order section is helpful. KB-095 warning is practical.
- **What was ambiguous or could cause hesitation:**
  - Fix 2a hardcodes English without `tr()` — executor may question whether this breaks RU mode
  - Fix 2b `[tr]` dependency — executor may worry about re-render cascade
  - Line numbers in Fix 2 will be wrong after Fix 1 executes (prompt says Fix 1 first)
- **Missing context:**
  - Whether HELP_CHIPS is used in both language modes or only EN
  - Whether `tr` is a stable reference
  - Confirmation that `tr` is in scope at line ~2448
