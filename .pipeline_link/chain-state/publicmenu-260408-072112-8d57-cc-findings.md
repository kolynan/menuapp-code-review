# CC Writer Findings — publicmenu
Chain: publicmenu-260408-072112-8d57

## Findings

### Fix 1 — Button set and config constants

1. [P0] HELP_PREVIEW_LIMIT removal will crash JSX — The task says to remove `HELP_PREVIEW_LIMIT` (line 1795), but it is actively referenced in 3 locations: line 2701 (`setIsTicketExpanded(rowIndex >= HELP_PREVIEW_LIMIT)`), line 4935 (slicing visible requests), and line 5027 (conditional rendering). Removing the constant without updating these JSX references will cause a ReferenceError crash. Since this task explicitly forbids JSX changes, `HELP_PREVIEW_LIMIT` **must NOT be removed** in this task. FIX: Keep `HELP_PREVIEW_LIMIT = 2` in place. Add a `// TODO: remove in Part B (SOS v6.0 JSX update)` comment. Do NOT delete.

2. [P0] HELP_CHIPS removal will crash JSX — The task says to remove `HELP_CHIPS` (lines 1807-1813), but it is actively referenced at line 5102 (`{HELP_CHIPS.map(chip => ...}`). Removing it causes a ReferenceError crash. Since JSX changes are FROZEN, `HELP_CHIPS` **must NOT be removed** in this task. FIX: Keep `HELP_CHIPS` in place. Add a `// TODO: remove in Part B (SOS v6.0 JSX update)` comment. Do NOT delete.

3. [P1] HELP_CARD_LABELS uses `tr('help.bill', ...)` but task specifies `tr('help.get_bill', ...)` — The existing code at line 1802 uses key `help.bill` (which exists at line 535 in EN fallbacks: `"help.bill": "Bring the bill"`). The task changes this to `help.get_bill`, but `help.get_bill` only exists in RU fallbacks (line 596: `"Принести счёт"`). Fix 4 adds `"help.get_bill": "Bill"` to EN fallbacks, so this would work — but the value changes from "Bring the bill" to just "Bill". This is intentional per the task (shorter labels for v6.0 grid). However, if the new key `help.get_bill` is meant for HELP_CARD_LABELS, then `help.bill` should be kept for backward compat in the i18n dictionaries. FIX: Proceed as specified, but ensure `help.bill` is NOT removed from I18N_FALLBACKS (line 535) — it may be used elsewhere. Only ADD `help.get_bill`, don't replace `help.bill`.

4. [P1] `tr` dependency in HELP_CARD_SHORT_LABELS memo — The task specifies `[tr]` as the dependency array for the new `HELP_CARD_SHORT_LABELS` useMemo. This matches the pattern of existing `HELP_CARD_LABELS` (line 1806: `}, [tr]`), so this is correct and consistent. No issue — noting for completeness.

5. [P1] Fix 1 nonOtherTypes update (line 2130) adds `plate`, `utensils`, `clear_table` — These are new request types that will be sent to `ServiceRequest.create()`. The task notes "ServiceRequest.create() accepts any string, backend does not validate" — this is correct per C3 analysis (S240). However, the existing sync loop at lines 2132-2139 iterates over `nonOtherTypes` and tries to match against `normalizedHelpRequests` entries. New types (`plate`, `utensils`, `clear_table`) won't have server entries until actually sent, so this is safe — `relevantEntries` will simply be empty for unused types. No issue. FIX: Proceed as specified.

6. [P2] useCallback dependency arrays for getHelpUrgency — Task specifies `[HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]` as deps. Both are `useMemo(() => ..., [])` (empty dep arrays = stable references), so they'll never change. This means the useCallback will also be stable, which is correct. However, per React conventions, stable refs in deps are harmless but technically unnecessary — this is fine as-is, no change needed. FIX: None needed.

7. [P2] Fix 4 duplicates `help.retry` in RU — Task says add `"help.retry": "Повторить"` to I18N_FALLBACKS_RU, but it already exists at line 603. The task says "add only if key does NOT already exist", so the implementer must skip this key. FIX: Do NOT add `"help.retry"` to I18N_FALLBACKS_RU — it already exists.

8. [P2] Fix 4 changes `help.get_bill` value in RU from "Принести счёт" to "Счёт" — Line 596 has `"help.get_bill": "Принести счёт"`. The task adds `"help.get_bill": "Счёт"` with explicit note "REPLACES existing". This is intentional, but implementer must REPLACE the existing line, not add a duplicate. JavaScript objects with duplicate keys use the LAST value, but it's bad practice. FIX: Replace the value at line 596, don't add a new line.

9. [P2] Fix 4 — `help.sent_suffix` already exists in EN — Line 528 has `"help.sent_suffix": "sent"`. Task lists it as new. Implementer must check and skip if exists. FIX: Do NOT add `"help.sent_suffix"` to I18N_FALLBACKS — already exists at line 528.

## Summary
Total: 9 findings (2 P0, 3 P1, 4 P2)

The two P0 findings are CRITICAL blockers: removing `HELP_PREVIEW_LIMIT` and `HELP_CHIPS` will crash the app because they're referenced in JSX code that this task explicitly freezes. These constants must be kept until Part B (JSX update task) removes both the constants and their JSX references together.

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1: Says "remove HELP_CHIPS entirely" and "remove HELP_PREVIEW_LIMIT entirely", but both are actively used in FROZEN JSX. This creates an impossible requirement — you cannot remove constants that are referenced in code you're forbidden from changing. The task should have said "mark for removal" or "keep with TODO comment".
  - Fix 4: Lists keys to add "only if key does NOT already exist", which is good, but then explicitly includes `help.retry` (already exists in RU at line 603) and `help.sent_suffix` (already exists in EN at line 528). Minor inconsistency.
- Missing context: None significant — file line numbers were accurate, grep targets were helpful.
- Scope questions: The `help.get_bill` vs `help.bill` key rename is clear enough from context but could benefit from explicit note about whether `help.bill` should be kept or removed from EN fallbacks.
