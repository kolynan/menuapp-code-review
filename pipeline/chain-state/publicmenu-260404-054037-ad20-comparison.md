# Comparison Report — PublicMenu
Chain: publicmenu-260404-054037-ad20

## Agreed (both found)

### 1. [P1] Fix 1 — Replace I18N_FALLBACKS dictionary (lines 327–569)
- **CC:** Replace entire 221-key Russian dictionary with 236-key English dictionary. Verified line boundaries (327–569). Notes +15 new keys, expected line count ~5201.
- **Codex:** Same finding — Russian fallback map causes EN mode to show Russian. Replace with approved 236-key English dictionary verbatim.
- **Verdict:** AGREED. Both confirm the same fix, same line range, same replacement content.

### 2. [P1] Fix 2a — HELP_CHIPS hardcoded Russian (line 1715)
- **CC:** Replace literal Russian array with `tr('help.chip.*')` calls, change dependency from `[]` to `[tr]`. Verified line 1715 matches exactly.
- **Codex:** Same finding — literal Russian array bypasses `tr()`, stays Russian in EN mode. Same fix with `tr()` calls and `[tr]` dependency.
- **Verdict:** AGREED. Identical fix proposed by both.

### 3. [P1] Fix 2b — getHelpReminderWord hardcoded Russian (lines 2448–2454)
- **CC:** Replace Slavic plural logic with `count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders')`, dependency `[tr]`. Verified exact line match.
- **Codex:** Same finding — Russian nouns hardcoded, same replacement with `tr()` calls and `[tr]` dependency.
- **Verdict:** AGREED. Identical fix proposed by both.

### 4. [P1] Fix 2c — Three "назад" hardcoded strings (lines 2472, 2475, 2515)
- **CC:** Replace bare `назад` with `${tr('help.ago', 'ago')}` at all three locations. Verified each line matches exactly.
- **Codex:** Same finding — three template literals with literal Russian `назад` producing mixed-language strings. Same `tr('help.ago', 'ago')` replacement.
- **Verdict:** AGREED. Identical fix proposed by both.

## CC Only (Codex missed)

None. Both reviewers found the same 4 issues with identical fixes.

## Codex Only (CC missed)

None. Both reviewers found the same 4 issues with identical fixes.

## Disputes (disagree)

None. Full agreement on all 4 findings — same priorities, same line numbers, same replacement code.

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P1] Fix 1 — Replace I18N_FALLBACKS dictionary** — Source: AGREED — Replace lines 327–569 with approved 236-key English dictionary. Net +15 lines.
2. **[P1] Fix 2a — HELP_CHIPS i18n** — Source: AGREED — Replace hardcoded Russian array at line 1715 with `tr()` calls. Net +6 lines.
3. **[P1] Fix 2b — getHelpReminderWord i18n** — Source: AGREED — Replace Russian plural logic at lines 2448–2454 with English singular/plural via `tr()`. Net -4 lines.
4. **[P1] Fix 2c — Remove "назад" x3** — Source: AGREED — Replace bare `назад` with `${tr('help.ago', 'ago')}` at lines 2472, 2475, 2515. Net 0 lines.

**Expected final line count:** ~5201 (5184 + 15 + 6 - 4 = 5201), within acceptable range 5195–5210.

**Execution order:** Fix 1 first (establishes dictionary keys), then Fix 2a/2b/2c in any order.

**Validation after all fixes:**
1. No Cyrillic in I18N_FALLBACKS (python scan)
2. No bare "назад" after line 1000 (python scan)
3. Line count in 5195–5210 range
4. `makeSafeT()` function unchanged (lines 575–595)

## Summary

- Agreed: 4 items
- CC only: 0 items (0 accepted, 0 rejected)
- Codex only: 0 items (0 accepted, 0 rejected)
- Disputes: 0 items
- **Total fixes to apply: 4**

## Notes

- Both reviewers gave identical fixes with matching line numbers and replacement code
- CC provided more detailed analysis (line count math, execution order, design notes) — clarity 9/10
- Codex was concise but accurate — clarity 5/10 (self-assessed)
- No disputes means the Discussion step (step 3) can be fast — pure rubber-stamp
- KB-095 risk acknowledged by both: verify line count before commit
