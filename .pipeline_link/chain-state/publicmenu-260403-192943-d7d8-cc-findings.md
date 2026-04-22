# CC Writer Findings — PublicMenu
Chain: publicmenu-260403-192943-d7d8

## Pre-task state
- RELEASE file: `260401-04 PublicMenu x RELEASE.jsx` (5189 lines)
- Working copy restored from RELEASE (was 4423 lines, now 5189)
- Note: task expected 4503 lines but RELEASE has 5189 — used RELEASE as source of truth per Step 0 instructions

## Findings

### Fix 1 (HD-23 + HD-25): Rewrite fallback dictionary to English

1. **[P1] Dictionary block at lines 508–556 contains 49 Russian-language fallback values** — All `help.*` entries in the fallback dictionary are in Russian. When English is selected and server translations are not loaded, guests see Russian text. FIX: Replace all 49 values with English equivalents as specified in the task. Dictionary starts at line 508 (`"help.call_waiter": "Позвать официанта"`) and ends at line 556 (`"help.updated_label": "Обновлено"`). Exact replacement values provided in task context.

2. **[P1] `help.back_to_help` value contains "←" character (line 524)** — Current value `"← К помощи"` causes double-arrow display when combined with the `<ArrowLeft>` icon in Mode B header. FIX: Change to `"Back to help"` (no "←" character in the string). The icon component handles the visual arrow.

### Fix 2 (HD-23 secondary): Translate inline tr() fallback strings

3. **[P1] 31 inline `tr('help.*', '...')` calls have Russian fallback strings** — Found across multiple locations:
   - Lines 1709–1713: `helpCardLabels` object (5 entries: call_waiter, bill, napkins, menu, other_label)
   - Line 2391: `reminder_sent` toast
   - Lines 2463–2464: `getHelpWaitLabel` function (just_sent, waiting_prefix, minutes_short)
   - Lines 2471–2472: `getHelpReminderLabel` (reminded_just_now, reminded_prefix, minutes_short)
   - Line 2475: reminder count label (last_reminder_prefix, minutes_short)
   - Lines 2480–2484: `getHelpResolvedLabel` (5 resolved_* entries)
   - Lines 2493–2501: `getHelpErrorCopy` (no_connection, try_again, remind_failed, send_failed)
   - Lines 2507–2515: `getHelpFreshnessLabel` (restoring_status, offline_status, stale_status, seconds_short, updated_label)
   - Line 4786: `closed_by_guest`
   - Line 4797: `sending_now`
   - Line 4812: `retry`
   - Lines 4825–4828: `sending_now`, `retry_in`, `remind`
   
   FIX: Replace each Russian fallback with the English equivalent as specified in the task mapping. All 31 calls listed in task context.

4. **[P1] Hardcoded Russian word "назад" (meaning "ago") in template literals — lines 2472, 2475, 2515** — These three lines use `tr()` for individual words but concatenate the Russian word "назад" directly in the template string, outside any `tr()` call:
   - Line 2472: `` `${tr('help.reminded_prefix', 'Напомнили')} ${minutesAgo} ${tr('help.minutes_short', 'мин')} назад` ``
   - Line 2475: `` `...${tr('help.last_reminder_prefix', 'Последнее')} ${minutesAgo} ${tr('help.minutes_short', 'мин')} назад` ``
   - Line 2515: `` `${tr('help.updated_label', 'Обновлено')} ${seconds} ${tr('help.seconds_short', 'сек')} назад` ``
   
   FIX: Replace "назад" with `tr('help.ago', 'ago')` or restructure the template. Note: `help.ago` is NOT in the dictionary — either add it, or replace "назад" with the literal " ago" and add `"help.ago": "ago"` to the dictionary. Alternatively, restructure: `Waiting 5 min` doesn't need "ago" (English phrasing), `Reminded 3 min ago` does need it, `Updated 10 sec ago` needs it. Recommend adding `"help.ago": "ago"` to dictionary and using `tr('help.ago', 'ago')` in place of "назад".

5. **[P1] `getHelpReminderWord` function (lines 2448–2454) has hardcoded Russian pluralization** — Returns "напоминание"/"напоминания"/"напоминаний" (Russian plural forms for "reminder"). This is used at line 2475 in the reminder count label. FIX: This is technically outside the `tr()` pattern but IS Cyrillic text in help-drawer code. Replace with English: simply return "reminder" for count === 1, "reminders" for count !== 1. Or use `tr('help.reminder_word', 'reminder')` / `tr('help.reminders_word', 'reminders')` with simple count === 1 check. Note: this is NOT listed in Fix 2's explicit mapping, but it IS Cyrillic in help-related code that would show Russian to English users.

### Fix 3 (HD-24): Remove redundant counter in Mode B

6. **[P1] Redundant Mode B counter div at lines 4742–4746** — When `isTicketExpanded && activeRequestCount > 0`, a standalone centered counter div appears showing `{activeRequestCount} {t('help.active_count')}`. This duplicates the count already visible in Mode A header (line 4738) and in the request cards themselves. FIX: Remove the entire block at lines 4742–4746:
   ```jsx
   {isTicketExpanded && activeRequestCount > 0 && (
     <div className="text-sm text-slate-500 mb-2 text-center">
       {activeRequestCount} {t('help.active_count')}
     </div>
   )}
   ```
   Keep the Mode A counter at line 4738 (`<span className="text-xs text-gray-400">...`) untouched.

## Summary
Total: 6 findings (0 P0, 6 P1, 0 P2, 0 P3)

- Fix 1: 2 findings (dictionary Russian values + back_to_help arrow)
- Fix 2: 3 findings (tr() Russian fallbacks + hardcoded "назад" + getHelpReminderWord Russian plurals)
- Fix 3: 1 finding (redundant Mode B counter)

Note on findings #4 and #5: These are Cyrillic text in help-drawer code that would be visible to English-mode users, but they are NOT explicitly listed in the Fix 2 mapping table. The task author may have intentionally excluded them or missed them. Flagging for comparator/merge decision. If out of scope, ignore findings #4 and #5.

## Prompt Clarity
- Overall clarity: 5
- Ambiguous Fix descriptions: None — all three fixes are extremely well specified with exact grep patterns, line numbers, before/after values, and verification commands.
- Missing context: The expected line count (4503) does not match RELEASE file (5189 lines). This caused initial confusion but Step 0 instructions handled it. Also, findings #4 and #5 (hardcoded "назад" and `getHelpReminderWord`) are borderline scope — they ARE Cyrillic in help-drawer code but are NOT listed in Fix 2's explicit mapping.
- Scope questions: (1) Are hardcoded Russian words outside `tr()` calls (like "назад" at lines 2472/2475/2515) in scope for Fix 2? The Fix 2 description says "All inline tr() fallback strings" but "назад" is not inside a tr() call — it's concatenated outside. (2) Is `getHelpReminderWord` (Russian plurals at lines 2451–2453) in scope? It's not a tr() call at all.
