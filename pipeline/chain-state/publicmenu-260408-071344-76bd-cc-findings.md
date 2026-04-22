# CC Writer Findings — publicmenu
Chain: publicmenu-260408-071344-76bd

## Findings

### Fix 1 — Update button set and config constants

1. [P1] HELP_CARD_LABELS tr() fallbacks use Russian text instead of English — The proposed HELP_CARD_LABELS uses Russian fallback strings in `tr()` calls (e.g., `tr('help.call_waiter', 'Позвать официанта')` instead of current `tr('help.call_waiter', 'Call a waiter')`). Since `tr()` bypasses `makeSafeT` and goes directly to B44, when B44 lacks a key (likely for all new keys like `help.plate`, `help.utensils`, etc.), EN-mode users will see Russian fallback text. This is a regression from the existing pattern where `tr()` fallbacks are always English. FIX: Use English fallbacks in tr() calls: `tr('help.call_waiter', 'Call a waiter')`, `tr('help.get_bill', 'Bill')`, `tr('help.plate', 'Extra plate')`, `tr('help.napkins', 'Napkins')`, `tr('help.utensils', 'Utensils')`, `tr('help.clear_table', 'Clear the table')`, `tr('help.other_label', 'Other')`. Same fix for HELP_CARD_SHORT_LABELS: `tr('help.call_waiter_short', 'Call')`, `tr('help.get_bill_short', 'Bill')`, `tr('help.plate_short', 'Plate')`, etc. Russian translations are properly handled by I18N_FALLBACKS_RU (Fix 4).

2. [P2] HELP_CARD_SHORT_LABELS missing `menu` entry — The new HELP_CARD_SHORT_LABELS object has 7 entries but no `menu` key. While `menu` is legacy-only and not in the grid, any code that accesses `HELP_CARD_SHORT_LABELS['menu']` (e.g., the undo toast on line 5127 uses `HELP_CARD_LABELS[undoToast.type]` — similar pattern may be used with short labels) would get `undefined`. FIX: Add `menu: tr('help.menu_short', 'Menu'),` for backward safety, or document that `menu` is intentionally omitted and callers must fallback.

3. [P2] HELP_CARD_LABELS changes `help.bill` key to `help.get_bill` — Existing code (line 1802) uses `tr('help.bill', ...)`. The proposed code switches to `tr('help.get_bill', ...)`. This is a key rename. Any existing code referencing `HELP_CARD_LABELS` by the `bill` JS key is fine (the JS key stays `bill`), but the i18n key change means B44 translations for `help.bill` won't apply to the new `help.get_bill` key. Not a bug per se, but the old `help.bill` key at line 535 in I18N_FALLBACKS becomes orphaned for this usage. FIX: Acceptable as-is since Fix 4 adds `help.get_bill` to both dictionaries. Just noting for awareness.

### Fix 2 — Urgency thresholds and helper functions

4. [P1] `getHelpTimerStr` hardcodes Russian suffix "м" — The function returns `` `${min}м` `` and `'<1м'` with Cyrillic "м" (Russian for minutes). For EN-mode users this should be `m` or use the existing i18n key `help.minutes_short` ("min" in EN, "мин" in RU). FIX: Use the existing i18n key: replace `` `${min}м` `` with `` `${min}${t('help.minutes_short')}` `` and `'<1м'` with `` `<1${t('help.minutes_short')}` ``. The `t` function is available in the component scope via closure.

5. [P2] `getHelpUrgency` and `getHelpTimerStr` dependency arrays include stable refs — `getHelpUrgency` lists `[HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]` as deps, both are `useMemo(() => ..., [])` (stable). Not a bug — just unnecessary deps. Acceptable as-is.

### Fix 4 — Add new i18n keys to BOTH dictionaries

6. [P1] Fix 4 EN block lists keys that already exist in I18N_FALLBACKS — `help.sent_suffix` (line 528), `help.retry` (line 551) already exist in EN dictionary. The task says "only if key does NOT already exist" but includes these in the code block. Implementer MUST skip these to avoid duplicates. FIX: Do NOT add `help.sent_suffix` and `help.retry` to I18N_FALLBACKS — they already exist with correct values.

7. [P1] Fix 4 RU `help.get_bill` must REPLACE existing entry, not be added as duplicate — Line 596 already has `"help.get_bill": "Принести счёт"`. The task notes this is intentional replacement with shorter "Счёт". Implementer must UPDATE the existing line, not add a second entry. FIX: Edit line 596 in-place: `"help.get_bill": "Принести счёт"` → `"help.get_bill": "Счёт"`.

8. [P2] Fix 4 RU block lists `help.retry` which already exists — Line 603 has `"help.retry": "Повторить"`. The task's RU additions include `"help.retry": "Повторить"` with the same value. FIX: Skip adding `help.retry` to I18N_FALLBACKS_RU — it already exists with the correct value.

9. [P2] Fix 4 EN block includes `help.call_waiter` — Line 526 already has `"help.call_waiter": "Call a waiter"`. The proposed code doesn't list this explicitly in the "add" block, but the task says to grep first. Just confirming: `help.call_waiter` already exists and should NOT be re-added.

## Summary
Total: 9 findings (0 P0, 4 P1, 5 P2, 0 P3)

- Fix 1: 3 findings (1 P1, 2 P2) — tr() fallback language, missing menu in short labels, key rename
- Fix 2: 2 findings (1 P1, 1 P2) — hardcoded Russian in timer helper, unnecessary deps
- Fix 4: 4 findings (2 P1, 2 P2) — duplicate keys risk, replace vs add for help.get_bill

## Key Risks
- **Finding 1 (P1)** is the most impactful: Russian tr() fallbacks will show to EN users for all new button types until B44 translations are added. This breaks EN mode.
- **Finding 4 (P1)** is the second most impactful: hardcoded "м" in timer string breaks EN mode display.
- **Findings 6-8** are implementation guidance: the code blocks in the task include already-existing keys that must be skipped to avoid duplicates.

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: The tr() fallback strings are in Russian while existing code uses English fallbacks — unclear if this was intentional. The HELP_CARD_LABELS code block explicitly shows Russian strings, but this contradicts the established pattern and breaks EN mode.
  - Fix 4: Code blocks include keys that already exist (help.sent_suffix, help.retry in EN; help.retry in RU). The text says "only if key does NOT already exist" which is correct, but the code blocks are misleading — an implementer copying verbatim would create duplicates.
- Missing context: Whether `HELP_CARD_SHORT_LABELS` will be accessed with `menu` type (determines if missing entry is P1 or P2).
- Scope questions: The `help.get_bill` RU replacement (line 596) — task notes it clearly but it's an update to an EXISTING key inside I18N_FALLBACKS_RU, which is technically inside "FROZEN" territory. The FROZEN exception is only stated for line 2130 `nonOtherTypes`. Clarification would help.
