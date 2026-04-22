# Comparison Report — publicmenu
Chain: publicmenu-260408-072228-de40

## Agreed (both found)

### A1. [P0] HELP_CHIPS and HELP_PREVIEW_LIMIT cannot be removed — JSX references exist
- **CC Finding #3 (P0):** Identified 4 active JSX references (lines 2701, 4935, 5027, 5102). Removing these constants without updating JSX = ReferenceError crash. SCOPE LOCK forbids JSX changes → contradiction in prompt.
- **Codex Finding #2 (P2):** Same observation — "deprecated v5 constants were not removed... still referenced at lines 2701, 4935, 5027, 5102."
- **Verdict:** AGREED. Do NOT remove HELP_CHIPS or HELP_PREVIEW_LIMIT. Keep as-is, add `// TODO: remove in v6.0 Part B` comment. This is the single most critical finding.

### A2. [P1] nonOtherTypes array at ~line 2130 needs plate/utensils/clear_table
- **CC:** Implicit in Fix 1 analysis — supports prompt's change.
- **Codex Finding #1 (P1):** Explicitly flags that current nonOtherTypes at line 2130 excludes new types → requests would be filtered out.
- **Verdict:** AGREED. Update nonOtherTypes to include `plate`, `utensils`, `clear_table`, keep `menu` for backward compat. Direct from prompt.

### A3. [P1] i18n dictionaries need new help.* keys + replace "help.get_bill" RU value
- **CC Findings #9-14 (P1-P2):** Detailed per-key analysis identifying which keys already exist (skip) vs genuinely new (add). Flags `help.get_bill` RU replacement from "Принести счёт" → "Счёт" as intentional.
- **Codex Finding #4 (P1):** Lists all missing keys in both EN/RU blocks. Flags same RU `help.get_bill` update.
- **Verdict:** AGREED. Add only NEW keys (grep before adding), update existing `help.get_bill` in RU. CC's granular per-key analysis is more actionable.

### A4. [P2] Config constants (HELP_CARD_LABELS, HELP_COOLDOWN_SECONDS, HELP_CARD_SHORT_LABELS) need v6.0 update
- **CC Findings #1-2, #4-5:** Detailed analysis of what to add/change in each constant.
- **Codex Finding #2 (P2):** Confirms legacy config needs replacement with v6.0 six-button set.
- **Verdict:** AGREED. Follow prompt specs for constant updates.

## CC Only (Codex missed)

### C1. [P1] Russian fallbacks in tr() calls — HELP_CARD_LABELS and HELP_CARD_SHORT_LABELS
- **CC Findings #1, #2:** Prompt provides Russian strings as 2nd arg to `tr()`, e.g., `tr('help.call_waiter', 'Позвать официанта')`. Codebase convention: `tr(key, englishFallback)`. Russian fallbacks = English users see Russian if key missing.
- **Evaluation:** VALID and important. The `tr()` pattern in this codebase consistently uses English as the fallback. Implementer should use English fallbacks from I18N_FALLBACKS dictionary.
- **Accept:** YES — P1 fix. Use English fallbacks in all tr() calls.

### C2. [P2] `menu` type missing from HELP_CARD_LABELS and HELP_COOLDOWN_SECONDS
- **CC Findings #4, #5:** Prompt's new constants omit `menu` entry. But `menu` stays in HELP_REQUEST_TYPES and nonOtherTypes → code paths could look up `HELP_CARD_LABELS['menu']` and get undefined.
- **Evaluation:** VALID. Backward compat risk. If legacy `menu` requests exist in DB, label lookup fails silently.
- **Accept:** YES — P2 fix. Add `menu: tr('help.menu', 'Paper menu')` to HELP_CARD_LABELS and `menu: 240` to HELP_COOLDOWN_SECONDS, both with `// legacy` comment.

### C3. [P1] useCallback dependency arrays include stable useMemo refs
- **CC Finding #6:** Notes that `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` in getHelpUrgency deps are stable (empty deps useMemo). Not harmful but unnecessary.
- **Evaluation:** Valid observation but CC itself says "No change needed — keep as-is per prompt." Not a real bug.
- **Accept:** NO — informational only, no action needed.

### C4. [P2] getHelpTimerStr hardcoded Cyrillic `м` — potential i18n gap
- **CC Finding #7:** Timer returns `${min}м` with hardcoded Russian abbreviation. Could use `tr('help.minutes_short', 'min')` for i18n.
- **Evaluation:** Valid observation but prompt provides exact code. This is a future improvement, not a bug in this task.
- **Accept:** NO for this task — note for Part B / future iteration.

### C5. [P2] getHelpUrgency and getHelpTimerStr are unused in Part A
- **CC Finding #8:** These helpers have no call sites in this task — intentionally added ahead of Part B.
- **Evaluation:** Correct and expected. Not a bug — infrastructure for Part B.
- **Accept:** NO — informational only, by design.

### C6. [P2] Detailed duplicate-key analysis for i18n (help.napkins, help.retry, help.sent_suffix EN, help.undo EN)
- **CC Findings #10-14:** Per-key mapping of which keys exist in which dictionary block, which to skip, which to add.
- **Evaluation:** VALID and highly useful for implementer. Prevents duplicate entries.
- **Accept:** YES — include as implementation guidance.

## Codex Only (CC missed)

### X1. [P2] Urgency plumbing entirely missing (stated as standalone finding)
- **Codex Finding #3:** File-wide search confirms no urgency constants or helpers exist yet.
- **Evaluation:** This is essentially stating the task requirement (Fix 2) as a finding. CC covered this implicitly through Fix 2 analysis (findings #6-8 discuss the to-be-added code). Not a "missed" issue — just different framing.
- **Accept:** YES as confirmation that Fix 2 is needed, but no additional action beyond what prompt specifies.

## Disputes (disagree)

### D1. Severity of HELP_CHIPS/HELP_PREVIEW_LIMIT removal issue
- **CC:** Rates as P0 (crash) — correct, since removing used constants = ReferenceError.
- **Codex:** Rates as P2 — seems to underweight the crash risk, framing it as "deprecated constants not removed" rather than "removing them crashes the app."
- **Resolution:** CC is correct — this is P0. A ReferenceError would crash the entire page. The fix (keep the constants) is the same regardless of severity rating.

### D2. Prompt clarity score
- **CC:** 4/5
- **Codex:** 3/5
- **Resolution:** Both identify the same contradiction (remove constants vs no JSX changes). The prompt is well-structured but has this one significant gap. 3.5/5 seems fair — round to 4/5 since the prompt explicitly says "add only if key does NOT already exist" and provides verification steps.

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P0] Do NOT remove HELP_CHIPS or HELP_PREVIEW_LIMIT** — Source: agreed (CC+Codex) — Keep both constants as-is. Add `// TODO: remove in v6.0 Part B` comment to each. Prompt's verification "0 occurrences" is OVERRIDDEN by crash risk.

2. **[P1] Update HELP_REQUEST_TYPES** — Source: prompt + agreed — Add `plate`, `utensils`, `clear_table`. Keep `menu` with `// legacy` comment. Keep `other`.

3. **[P1] Update HELP_CARD_LABELS with v6.0 types** — Source: prompt + CC — Add all 6 preset types + `other` + `menu` (legacy). Use ENGLISH fallbacks in tr() calls (not Russian as prompt shows). Keys: `help.call_waiter`, `help.get_bill` (renamed from help.bill), `help.plate`, `help.napkins`, `help.utensils`, `help.clear_table`, `help.other_label`, `menu: tr('help.menu', 'Paper menu') // legacy`.

4. **[P1] Add HELP_CARD_SHORT_LABELS (new constant)** — Source: prompt + CC — 7 entries with ENGLISH fallbacks: `Call`, `Bill`, `Plate`, `Napkins`, `Utensils`, `Clear`, `Other`.

5. **[P1] Update HELP_COOLDOWN_SECONDS** — Source: prompt + CC — Add all 6 types + `other` + `menu: 240 // legacy`.

6. **[P1] Update nonOtherTypes at ~line 2130** — Source: agreed (CC+Codex) — Add `plate`, `utensils`, `clear_table`. Keep `menu`.

7. **[P2] Add HELP_URGENCY_THRESHOLDS and HELP_URGENCY_GROUP** — Source: prompt + Codex confirmation — Insert after HELP_COOLDOWN_SECONDS. Two useMemo constants: std (8m/15m) and bill (5m/10m) groups.

8. **[P2] Add getHelpUrgency and getHelpTimerStr useCallbacks** — Source: prompt — Insert after urgency constants, before component return. Follow prompt's exact implementation.

9. **[P1] Add new i18n keys to I18N_FALLBACKS (EN)** — Source: agreed — Add ONLY genuinely new keys (grep first). New keys to add: `help.get_bill`, `help.plate`, `help.utensils`, `help.clear_table`, all 6 `*_short` keys, `help.subtitle_choose`, `help.table_default`, `help.cancel_confirm_q`, `help.cancel_keep`, `help.cancel_do`, `help.other_request_link`, `help.other_placeholder`, `help.send_btn`. SKIP existing: `help.call_waiter`, `help.napkins`, `help.sent_suffix`, `help.retry`, `help.undo`.

10. **[P1] Add new i18n keys to I18N_FALLBACKS_RU (RU)** — Source: agreed — Add only new keys. UPDATE existing `help.get_bill` from "Принести счёт" → "Счёт" (intentional). Add: `help.plate`, `help.utensils`, `help.clear_table`, all 6 `*_short` keys, `help.subtitle_choose`, `help.table_default`, `help.cancel_confirm_q`, `help.cancel_keep`, `help.cancel_do`, `help.other_request_link`, `help.other_placeholder`, `help.send_btn`, `help.sent_suffix`, `help.undo`. SKIP existing: `help.call_waiter`, `help.napkins`, `help.retry`.

## Summary
- Agreed: 4 items (A1-A4)
- CC only: 6 items (3 accepted: C1, C2, C6; 3 rejected: C3, C4, C5 — informational/future)
- Codex only: 1 item (1 accepted as confirmation: X1)
- Disputes: 2 items (D1 severity, D2 clarity score — both resolved)
- **Total fixes to apply: 10** (1 P0, 5 P1, 4 P2, but P0 is "don't do something" rather than a code change)
- **Prompt Clarity consensus: 4/5** — well-structured, one significant contradiction (remove constants vs frozen JSX)
