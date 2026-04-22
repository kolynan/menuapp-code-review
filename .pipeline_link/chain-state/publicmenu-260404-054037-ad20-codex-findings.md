# Codex Writer Findings — PublicMenu Chain: publicmenu-260404-054037-ad20

## Findings
1. [P1] Fix 1: `I18N_FALLBACKS` is still Russian and incomplete — In `pages/PublicMenu/x.jsx` lines 327-569, the local fallback map still contains Russian UI copy for the order, cart, checkout, loyalty, and common text paths. `makeSafeT()` uses this map when Base44 translations are missing, so English mode will keep showing Russian fallback text instead of English. The current block also does not include the new fallback keys named in the task context (`help.chip.*`, `help.ago`, `help.reminder`, `help.reminders`, `error.network_error`, `error.check_connection`, `common.retry`, `common.cancel`, `cart.confirm_table.dismissed`, `cart.verify.helper_text`, `cart.motivation_bonus_short`). FIX: Replace the entire `const I18N_FALLBACKS = { ... };` block at lines 327-569 with the approved 236-key English dictionary from the prompt, verbatim.
2. [P1] Fix 2a: `HELP_CHIPS` is hardcoded in Russian — At `pages/PublicMenu/x.jsx:1715`, `HELP_CHIPS` is defined as a literal Russian array with an empty dependency list. That bypasses `tr()` completely and will not react to language changes, so the help drawer chips stay Russian in English mode. FIX: Replace the literal array with `tr('help.chip.*', '...')` calls and make the memo depend on `[tr]`.
3. [P1] Fix 2b: `getHelpReminderWord()` hardcodes Russian reminder nouns — At `pages/PublicMenu/x.jsx:2448-2454`, the callback returns `напоминание/напоминания/напоминаний` directly. That makes the reminder summary partially Russian even when the surrounding label is translated. FIX: Replace the pluralization body with `count === 1 ? tr('help.reminder', 'reminder') : tr('help.reminders', 'reminders')` and make the callback depend on `[tr]`.
4. [P1] Fix 2c: Three help status labels still append bare `назад` — At `pages/PublicMenu/x.jsx:2472`, `pages/PublicMenu/x.jsx:2475`, and `pages/PublicMenu/x.jsx:2515`, the string templates concatenate a literal Russian `назад` into otherwise translated labels. English mode therefore produces mixed strings such as `Reminded 2 min назад` and `Updated 15 sec назад`. FIX: Replace each bare suffix with `tr('help.ago', 'ago')`.

## Summary
Total: 4 findings (0 P0, 4 P1, 0 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 5
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): None.
- Scope questions (anything you weren't sure if it's in scope): None.
