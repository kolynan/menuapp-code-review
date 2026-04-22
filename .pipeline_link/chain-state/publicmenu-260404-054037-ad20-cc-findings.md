# CC Writer Findings — PublicMenu
Chain: publicmenu-260404-054037-ad20

## Findings

### Fix 1 — Replace I18N_FALLBACKS dictionary (lines 327–569)

1. **[P1] I18N_FALLBACKS contains 221 Russian-language fallback values** (lines 327–569) — When the user selects English, `makeSafeT()` falls back to `I18N_FALLBACKS` when the B44 dictionary lacks a key. Current values are Russian, so EN mode shows Russian text for ~170 non-help keys (`status.*`, `cart.*`, `order_status.*`, `loyalty.*`, etc.). The `help.*` keys (lines 508–556) are already English.
   **FIX:** Replace the entire `I18N_FALLBACKS` block (lines 327–569) with the provided English dictionary (236 keys). The new dictionary:
   - Translates all ~170 Russian values to English
   - Preserves all existing `help.*` keys verbatim (already EN)
   - Adds 15 new keys: `help.ago`, `help.reminder`, `help.reminders` (needed by Fix 2b/2c), 5× `help.chip.*` (needed by Fix 2a), 7 gap-fills (`error.network_error`, `error.check_connection`, `common.retry`, `common.cancel`, `cart.confirm_table.dismissed`, `cart.verify.helper_text`, `cart.motivation_bonus_short`)
   - Adds `menu.add_to_cart` and `menu.added_to_cart` entries (existing keys moved from end to Menu section)
   - Reorders entries logically by section with proper comments
   - Total after fix: 236 keys (was 221)
   
   **Verified:** Current block starts at line 327 (`const I18N_FALLBACKS = {`) and ends at line 569 (`};`). Lines 570+ (`makeSafeT` function) are untouched. The replacement content is a verbatim approved copy — no modifications needed.
   
   **Risk note (KB-095):** File is 5184 lines. When using Edit tool, replace only lines 327–569 (the dictionary body). Do NOT rewrite the entire file. Expected line count after Fix 1: ~5199 (243 lines in old dict → ~258 lines in new dict, net +15).

### Fix 2a — HELP_CHIPS hardcoded Russian (line 1715)

2. **[P1] HELP_CHIPS array contains 5 hardcoded Russian strings** (line 1715) — `['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода']` are always Russian regardless of language setting. These are the quick-suggestion chips in the Help Drawer.
   **FIX:** Replace the single-line array with `tr()` calls using new `help.chip.*` keys:
   ```js
   const HELP_CHIPS = useMemo(() => [
     tr('help.chip.high_chair', 'High chair'),
     tr('help.chip.cutlery', 'Cutlery'),
     tr('help.chip.sauce', 'Sauce'),
     tr('help.chip.clear_table', 'Clear the table'),
     tr('help.chip.water', 'Water'),
   ], [tr]);
   ```
   **Verified:** Line 1715 matches exactly: `const HELP_CHIPS = useMemo(() => ['Детский стул', 'Приборы', 'Соус', 'Убрать со стола', 'Вода'], []);`. The `tr` function is available in scope (used on adjacent lines 1710–1714). Dependency array changes from `[]` to `[tr]` — correct, since `tr()` calls now depend on language state.
   
   **Note:** `help.chip.*` keys are added in Fix 1's new dictionary. Russian translations require corresponding entries in the B44 server-side dictionary — if absent, chips will show English fallbacks (better than always-Russian).

### Fix 2b — getHelpReminderWord hardcoded Russian (lines 2448–2454)

3. **[P1] getHelpReminderWord returns Russian plural forms** (lines 2448–2454) — Uses Slavic plural logic (mod10/mod100) returning 'напоминание'/'напоминания'/'напоминаний'. This is always Russian regardless of language.
   **FIX:** Replace with simple English singular/plural using `tr()`:
   ```js
   const getHelpReminderWord = useCallback((count) => {
     return count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders');
   }, [tr]);
   ```
   **Verified:** Lines 2448–2454 match exactly. The `tr` function is in scope. Dependency array changes from `[]` to `[tr]` — correct.
   
   **Design note:** The new English plural logic (count === 1 ? singular : plural) is correct for English. Russian plurals would need server-side dictionary support with proper plural forms. The `help.reminder` and `help.reminders` keys are added in Fix 1's new dictionary.

### Fix 2c — Three "назад" hardcoded Russian strings (lines 2472, 2475, 2515)

4. **[P1] Three occurrences of hardcoded "назад" (Russian for "ago") in template literals** (lines 2472, 2475, 2515) — These are concatenated into reminder/status labels and remain Russian regardless of language selection.

   **Line 2472** — Inside `getHelpReminderLabel`: `` `${tr('help.reminded_prefix', 'Reminded')} ${minutesAgo} ${tr('help.minutes_short', 'min')} назад` ``
   **FIX:** Replace `назад` with `${tr('help.ago', 'ago')}`.
   **Verified:** Line 2472 matches exactly.

   **Line 2475** — Inside `getHelpReminderLabel`: `` `${row.reminderCount} ${getHelpReminderWord(row.reminderCount)} · ${tr('help.last_reminder_prefix', 'Last')} ${minutesAgo} ${tr('help.minutes_short', 'min')} назад` ``
   **FIX:** Replace `назад` with `${tr('help.ago', 'ago')}`.
   **Verified:** Line 2475 matches exactly.

   **Line 2515** — Inside `getHelpSyncStatusLabel`: `` `${tr('help.updated_label', 'Updated')} ${seconds} ${tr('help.seconds_short', 'sec')} назад` ``
   **FIX:** Replace `назад` with `${tr('help.ago', 'ago')}`.
   **Verified:** Line 2515 matches exactly.

   **Note:** The `help.ago` key is added in Fix 1's new dictionary. All three replacements are mechanical — replace literal `назад` with `${tr('help.ago', 'ago')}` in the template string.

## Summary

Total: 4 findings (0 P0, 4 P1, 0 P2, 0 P3)

All 4 findings correspond exactly to the task's Fix 1, Fix 2a, Fix 2b, and Fix 2c. No out-of-scope issues reported per SCOPE RESTRICTION.

**Line count impact:**
- Fix 1: old dict 243 lines → new dict ~258 lines = +15 lines
- Fix 2a: 1 line → 7 lines = +6 lines
- Fix 2b: 7 lines → 3 lines = -4 lines  
- Fix 2c: 0 net change (in-place text replacement)
- **Expected total: 5184 + 15 + 6 - 4 = ~5201 lines** (within the 5195–5210 range stated in prompt)

**Execution order recommendation:**
1. Fix 1 first (lines 327–569) — largest change, establishes dictionary keys needed by other fixes
2. Fix 2a (line 1715) — after Fix 1 adds `help.chip.*` keys
3. Fix 2b (lines 2448–2454) — independent of Fix 2a
4. Fix 2c (lines 2472, 2475, 2515) — depends on Fix 2b for `getHelpReminderWord` context but target lines are different

**Validation checks to run after implementation:**
1. No Cyrillic in I18N_FALLBACKS (python scan)
2. No bare "назад" after line 1000 (python scan)
3. Line count in 5195–5210 range
4. `makeSafeT()` function unchanged (lines 575–595)

## Prompt Clarity

- **Overall clarity: 9/10** — Excellent. All line numbers verified correct, exact old/new code provided, validation scripts included, expected line count range specified, KB-095 risk acknowledged.
- **Ambiguous Fix descriptions:** None. All fixes have exact before/after code with verified line numbers.
- **Missing context:** Minor — the file uses both `t()` and `tr()` but the prompt correctly specifies `tr()` for Fix 2a/2b/2c. Could note that `tr` is the `makeSafeT`-wrapped version available in component scope (confirmed by reading adjacent lines).
- **Scope questions:** None — scope is clearly delimited to Fix 1 + Fix 2a/2b/2c with explicit FROZEN UX section.
