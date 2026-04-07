# Comparison Report — PublicMenu
Chain: publicmenu-260403-192943-d7d8

## Agreed (both found)

### 1. [P1] Fix 1 — Dictionary block: all `help.*` fallback values are Russian (lines ~508–556)
- **CC**: Finding #1 — 49 Russian entries, replace with English equivalents per task spec.
- **Codex**: Finding #1 — Same observation, same fix.
- **Consensus**: Apply. Replace entire dictionary block with English values.

### 2. [P1] Fix 1 — `help.back_to_help` contains "←" causing double-arrow (line ~524)
- **CC**: Finding #2 — Change to `"Back to help"` (no arrow character).
- **Codex**: Finding #1 (included) — Same observation, same fix.
- **Consensus**: Apply. Value must be `"Back to help"` with no "←".

### 3. [P1] Fix 2 — Inline `tr('help.*', '...')` calls have Russian fallback strings
- **CC**: Finding #3 — 31 inline calls across multiple locations (lines 1709–1713, 2391, 2463–2515, 4786–4828).
- **Codex**: Finding #2 — 25+ calls in same locations.
- **Consensus**: Apply. Replace all Russian fallback strings with English equivalents per task mapping. Count difference (31 vs 25) is minor — CC counted more granularly. Apply all matches from the task's explicit mapping table.

### 4. [P1/P2] Fix 3 — Redundant Mode B counter div (lines ~4742–4746)
- **CC**: Finding #6 — P1. Remove `isTicketExpanded && activeRequestCount > 0` div block.
- **Codex**: Finding #3 — P2. Same block, same fix.
- **Priority disagreement**: CC says P1, Codex says P2. Since the task marks this as `[MUST-FIX]`, treating as P1.
- **Consensus**: Apply. Remove the standalone counter div. Keep Mode A header span counter intact.

## CC Only (Codex missed)

### 5. [P1] Hardcoded Russian word "назад" in template literals (lines ~2472, 2475, 2515)
- **CC**: Finding #4 — Three template literals concatenate the Russian word "назад" (meaning "ago") directly, outside any `tr()` call. English users would see mixed English/Russian like "Reminded 3 min назад".
- **Codex**: Did not flag this.
- **Evaluation**: VALID finding. This IS Cyrillic text visible to English users in help-drawer code. However, it is NOT listed in the Fix 2 explicit mapping table (Fix 2 covers only `tr()` fallback strings, and "назад" is outside `tr()`).
- **Decision**: ACCEPT — this is clearly in spirit of HD-23 (no Cyrillic for English users). CC's recommendation to add `"help.ago": "ago"` to the dictionary and use `tr('help.ago', 'ago')` is sound. The task's verification command `grep "tr('help\.[^']*', '[А-яЁё]"` would pass even without this fix (since "назад" is not inside a `tr()` call), but the task's overall goal (English users see English) requires it.

### 6. [P1] `getHelpReminderWord` function has hardcoded Russian pluralization (lines ~2448–2454)
- **CC**: Finding #5 — Returns "напоминание"/"напоминания"/"напоминаний" (Russian plural forms). English users see Russian words.
- **Codex**: Did not flag this.
- **Evaluation**: VALID finding. Same reasoning as #5 — Cyrillic text visible to English users. Not a `tr()` fallback, so not in Fix 2's explicit mapping. But clearly violates HD-23 goal.
- **Decision**: ACCEPT — replace Russian plural forms with English ("reminder"/"reminders") or wrap in `tr()`. Simple English pluralization (count === 1 ? "reminder" : "reminders") is sufficient.

## Codex Only (CC missed)

None. CC found everything Codex found, plus two additional items.

## Disputes (disagree)

### Fix 3 Priority: P1 (CC) vs P2 (Codex)
- Task marks Fix 3 as `[MUST-FIX]`, so P1 is more appropriate.
- **Resolution**: Use P1.

No other disagreements. Both reviewers agree on the core fixes and approach.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Replace `help.*` dictionary block with English values** — Source: Agreed — Replace all 49 entries at lines ~508–556 with English equivalents from task spec. Add `"help.ago": "ago"` as new entry.
2. **[P1] Fix `help.back_to_help` double-arrow** — Source: Agreed (part of #1) — Value must be `"Back to help"` (no "←" character).
3. **[P1] Replace all inline `tr('help.*', '...')` Russian fallbacks with English** — Source: Agreed — Update all ~31 `tr()` calls per task mapping table.
4. **[P1] Replace hardcoded "назад" with `tr('help.ago', 'ago')`** — Source: CC only — Three locations: lines ~2472, ~2475, ~2515. Replace literal "назад" with `tr('help.ago', 'ago')`.
5. **[P1] Replace `getHelpReminderWord` Russian plurals with English** — Source: CC only — Lines ~2448–2454. Replace Russian plural forms with simple English: count === 1 ? "reminder" : "reminders".
6. **[P1] Remove redundant Mode B counter div** — Source: Agreed — Delete the `isTicketExpanded && activeRequestCount > 0` block at lines ~4742–4746. Keep Mode A header counter.

## Summary
- Agreed: 4 items
- CC only: 2 items (2 accepted, 0 rejected)
- Codex only: 0 items (0 accepted, 0 rejected)
- Disputes: 1 (priority only — resolved as P1)
- **Total fixes to apply: 6**

## Notes for Merge Step
- Line numbers are approximate — RELEASE file has 5189 lines (not 4503 as task expected). Use grep patterns to find exact locations.
- Fixes #4 and #5 (CC-only) extend beyond the task's explicit Fix 2 mapping but are essential for the HD-23 goal of "no Cyrillic for English users". The merge step should apply them.
- Adding `"help.ago": "ago"` to the dictionary (Fix #4) requires inserting one new line in the dictionary block — do this as part of Fix #1's dictionary replacement.
