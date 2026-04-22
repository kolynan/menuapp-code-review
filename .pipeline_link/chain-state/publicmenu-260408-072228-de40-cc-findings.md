# CC Writer Findings — publicmenu
Chain: publicmenu-260408-072228-de40

## Findings

### Fix 1 — Update button set and config constants

1. [P1] HELP_CARD_LABELS uses wrong i18n keys for existing types — The prompt specifies `tr('help.call_waiter', 'Позвать официанта')` for call_waiter and `tr('help.get_bill', 'Счёт')` for bill. However, the current code (line 1801) uses `tr('help.call_waiter', 'Call a waiter')` and `tr('help.bill', 'Bring the bill')`. The prompt changes `bill` key from `help.bill` to `help.get_bill` — this is intentional (shorter label for v6.0 button grid). Similarly, `napkins` key changes from `tr('help.napkins', 'Napkins')` to `tr('help.napkins', 'Салфетки')` — the fallback changes from English to Russian, which is INCORRECT for a `tr()` call where the 2nd arg should be English fallback. **FIX:** For HELP_CARD_LABELS, follow the prompt exactly for keys (`help.get_bill` instead of `help.bill`), but ensure all `tr()` fallbacks are English (since `tr()` 2nd arg is the EN fallback). The prompt gives Russian fallbacks like `'Позвать официанта'` — implementer should use the English fallbacks from I18N_FALLBACKS instead: `tr('help.call_waiter', 'Call a waiter')`, `tr('help.get_bill', 'Bill')`, `tr('help.plate', 'Extra plate')`, `tr('help.napkins', 'Napkins')`, `tr('help.utensils', 'Utensils')`, `tr('help.clear_table', 'Clear the table')`, `tr('help.other_label', 'Other')`.

2. [P1] HELP_CARD_SHORT_LABELS also has Russian fallbacks in tr() — Same issue as finding #1. The prompt provides `tr('help.call_waiter_short', 'Позвать')` etc. with Russian 2nd args. The `tr()` function's 2nd argument is the fallback string (typically English). Using Russian here means English users would see Russian text if the key is missing. **FIX:** Use English fallbacks: `tr('help.call_waiter_short', 'Call')`, `tr('help.get_bill_short', 'Bill')`, `tr('help.plate_short', 'Plate')`, `tr('help.napkins_short', 'Napkins')`, `tr('help.utensils_short', 'Utensils')`, `tr('help.clear_table_short', 'Clear')`, `tr('help.other_label', 'Other')`.

3. [P0] HELP_CHIPS and HELP_PREVIEW_LIMIT are referenced in JSX — CANNOT remove — The prompt says to remove HELP_CHIPS (lines 1807-1813) and HELP_PREVIEW_LIMIT (line 1795). However, grep confirms BOTH are actively used in JSX:
   - `HELP_PREVIEW_LIMIT` at line 2701: `setIsTicketExpanded(rowIndex >= HELP_PREVIEW_LIMIT);`
   - `HELP_PREVIEW_LIMIT` at line 4935: `activeRequests.slice(0, HELP_PREVIEW_LIMIT)` and `ticketRows.slice(0, HELP_PREVIEW_LIMIT)`
   - `HELP_PREVIEW_LIMIT` at line 5027: `activeRequestCount > HELP_PREVIEW_LIMIT`
   - `HELP_CHIPS` at line 5102: `HELP_CHIPS.map(chip => ...)`
   Removing these constants WITHOUT updating the JSX references would cause a **runtime crash** (ReferenceError). The SCOPE LOCK says "DO NOT change any JSX" — so we have a contradiction: the prompt asks to remove constants that are used in frozen JSX.
   **FIX:** Do NOT remove HELP_CHIPS or HELP_PREVIEW_LIMIT in this task. Keep them as-is. They should be removed in КС-B (Part B) when JSX is also updated. Alternatively, add `// TODO: remove in v6.0 Part B` comments.

4. [P2] `menu` type missing from HELP_CARD_LABELS — The prompt's new HELP_CARD_LABELS does NOT include a `menu` entry, but HELP_REQUEST_TYPES still has `menu` as legacy. If any code path tries to look up `HELP_CARD_LABELS['menu']` it will get `undefined`. The old code (line 1804) had `menu: tr('help.menu', 'Paper menu')`. **FIX:** Add `menu: tr('help.menu', 'Paper menu'),` to HELP_CARD_LABELS (with `// legacy` comment) for backward safety, OR verify that no code path reads `HELP_CARD_LABELS[type]` for type='menu'. Since nonOtherTypes keeps `menu`, server sync could encounter `menu` type requests.

5. [P2] `menu` missing from HELP_COOLDOWN_SECONDS — The prompt's new HELP_COOLDOWN_SECONDS omits `menu`. Current code (line 1799) has `menu: 240`. If an old `menu` request exists and code checks cooldown, it will get `undefined`. **FIX:** Add `menu: 240` to HELP_COOLDOWN_SECONDS with `// legacy` comment for backward compat, matching the pattern used in HELP_REQUEST_TYPES.

### Fix 2 — Urgency threshold constants and helper functions

6. [P1] useCallback dependency arrays reference useMemo values unnecessarily — `getHelpUrgency` lists `[HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]` in its dependency array. Both are `useMemo(() => ..., [])` with empty deps, so they are stable references. Including them is not harmful but is unnecessary. More importantly, React ESLint will not flag this. No real bug here, but noting for correctness. **FIX:** No change needed — the deps are technically correct (referencing outer scope useMemo values). Keep as-is per prompt.

7. [P2] getHelpTimerStr missing plural forms — The helper returns `${min}м` which is fine for Russian (м = minutes abbreviation). For English, the prompt doesn't specify an EN variant, but `help.minutes_short` already exists as "min". The timer string is hardcoded to use `м` (Cyrillic). **FIX:** Consider using `tr('help.minutes_short', 'min')` instead of hardcoded `м`, e.g.: `` return `${min}${tr('help.minutes_short', 'min')}`; ``. However, this changes the function signature (needs `tr` dependency). Since the prompt provides exact code, follow the prompt as-is — but flag this as a potential i18n gap for future iteration.

8. [P2] `getHelpUrgency` and `getHelpTimerStr` are unused in this task — These are helper functions added for future JSX integration (Part B). In this task (Part A), no code calls them. React/linter may show "unused variable" warnings. **FIX:** No change needed — these are intentionally added ahead of Part B (КС-B). Just noting for awareness.

### Fix 4 — Add new i18n keys

9. [P1] Existing key `"help.get_bill"` in I18N_FALLBACKS_RU already has value "Принести счёт" (line 596) — prompt says to REPLACE with shorter "Счёт". This is intentional per prompt note: `⚠️ Note: this REPLACES existing "Принести счёт" with shorter "Счёт" — intentional for button label`. Implementer must update the existing line, not add a duplicate. **FIX:** Change line 596 from `"help.get_bill": "Принести счёт",` to `"help.get_bill": "Счёт",`.

10. [P2] `"help.napkins"` key collision in EN — The prompt says to add `"help.napkins": "Napkins"` to I18N_FALLBACKS but line 536 already has it: `"help.napkins": "Napkins"`. Adding it again would be a duplicate. The prompt says "add only if key does NOT already exist". **FIX:** Do NOT add `"help.napkins"` to I18N_FALLBACKS — it already exists.

11. [P2] `"help.sent_suffix"` already exists in EN (line 528) and is NOT in RU — The prompt adds `"help.sent_suffix": "sent"` to EN. Already exists. For RU, prompt adds `"help.sent_suffix": "отправлено"` — this is NEW and should be added. **FIX:** Skip `"help.sent_suffix"` in EN block, add to RU block.

12. [P2] `"help.retry"` already exists in BOTH dictionaries — EN line 551: `"help.retry": "Retry"`. RU line 603: `"help.retry": "Повторить"`. Prompt asks to add both — these are duplicates. **FIX:** Skip `"help.retry"` in both EN and RU blocks — already present.

13. [P2] `"help.undo"` already exists in EN (line 529) as "Undo" — Prompt doesn't add it to EN but adds `"help.undo": "Отменить"` to RU. This is NEW for RU and should be added. **FIX:** Add `"help.undo": "Отменить"` to I18N_FALLBACKS_RU only.

14. [P2] Several new EN keys overlap with existing — Checking prompt's EN additions against existing:
   - `"help.call_waiter"` — exists (line 526) ✅ SKIP
   - `"help.get_bill"` — NOT in EN I18N_FALLBACKS (current has `"help.bill"` at line 535, not `"help.get_bill"`) → ADD
   - `"help.plate"` — not in EN → ADD
   - `"help.utensils"` — not in EN → ADD
   - `"help.clear_table"` — not in EN → ADD
   - `"help.napkins"` — exists (line 536) ✅ SKIP
   **FIX:** Add only genuinely new keys. Implementer must grep each key before adding.

## Summary
Total: 14 findings (1 P0, 3 P1, 10 P2, 0 P3)

Key risks:
- **Fix 1 P0: HELP_CHIPS and HELP_PREVIEW_LIMIT are used in JSX (lines 2701, 4935, 5027, 5102) — removing them crashes the app. SCOPE LOCK prevents fixing JSX. Do NOT remove these constants.**
- Fix 1: Russian fallbacks in tr() calls (P1) — English users would see Russian text
- Fix 1: `menu` type missing from HELP_CARD_LABELS and HELP_COOLDOWN_SECONDS (P2) — backward compat risk
- Fix 4: Several keys already exist — must grep before adding to avoid duplicates

## ⛔ Prompt Clarity

- **Overall clarity: 4/5** — Well-structured with clear Now/Should be/Verification sections. The explicit SCOPE LOCK and FROZEN UX sections are excellent.
- **Ambiguous Fix descriptions:**
  - Fix 1: The `tr()` fallback strings in HELP_CARD_LABELS and HELP_CARD_SHORT_LABELS are Russian (`'Позвать официанта'`, `'Счёт'`, etc.). The `tr(key, fallback)` convention in this codebase uses English fallbacks (the 2nd arg). The prompt should have used English fallbacks to match the existing pattern. This creates ambiguity — does the prompt intentionally change to Russian fallbacks, or is this an oversight? (Based on codebase convention, it's likely an oversight.)
  - Fix 1: No mention of whether to keep `menu` in HELP_CARD_LABELS for backward compat (it's in HELP_REQUEST_TYPES and nonOtherTypes but omitted from HELP_CARD_LABELS).
- **Missing context:**
  - HELP_CHIPS and HELP_PREVIEW_LIMIT ARE referenced in JSX (confirmed: lines 2701, 4935, 5027, 5102). Prompt asks to remove them but SCOPE LOCK forbids JSX changes — this is a contradiction that should have been noted in the prompt.
  - Whether `menu` type can still appear in server responses (affects backward compat decisions).
- **Scope questions:**
  - The getHelpTimerStr hardcoded `м` (Cyrillic) — is this intentionally RU-only, or should it use tr()?
  - Fix 4 note says to REPLACE `"help.get_bill": "Принести счёт"` with `"Счёт"` in RU — is this a label change or a separate decision?
