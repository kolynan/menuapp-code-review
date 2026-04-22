# Comparison Report — publicmenu
Chain: publicmenu-260408-072128-52db

## Agreed (both found)

### A1. HELP_CHIPS and HELP_PREVIEW_LIMIT cannot be removed without JSX changes
- **CC:** #1 [P0] + #2 [P0] — HELP_CHIPS used at line 5102, HELP_PREVIEW_LIMIT used at lines 2701, 4935, 5027. Removing causes ReferenceError.
- **Codex:** #2 [P1] — Same finding. Both identifiers are live dependencies in render code; task forbids JSX changes.
- **Agreed priority: P0** — Runtime crash. CC's P0 is correct; Codex under-rated at P1.
- **Agreed fix:** Keep both constants in place. Add `// DEPRECATED v6.0 — remove in Part B` comment. Do NOT remove. Verification grep for 0 occurrences should be skipped for these two.

### A2. i18n dictionaries need new v6.0 keys added
- **CC:** #7 [P1] + #8 [P1] + #9 [P1] — Identified specific duplicates: EN `help.sent_suffix` and `help.retry` already exist; RU `help.retry` already exists; RU `help.get_bill` must be UPDATED (not duplicated).
- **Codex:** #4 [P1] — Same area but less granular: noted dictionaries are incomplete and old `help.get_bill` RU copy needs replacing.
- **Agreed priority: P1** — Duplicate keys cause silent overwrites; missing keys cause raw key display.
- **Agreed fix:** Skip already-existing keys (`help.sent_suffix`, `help.retry` in EN; `help.retry` in RU). Update existing RU `help.get_bill` value from "Принести счёт" to "Счёт" in-place (do not add second entry). Add all other new keys as listed in Fix 4.

## CC Only (Codex missed)

### C1. [P2] `help.bill` key orphaned after rename to `help.get_bill` — ACCEPTED
- CC #3: HELP_CARD_LABELS changes `tr('help.bill')` to `tr('help.get_bill')`. Old key `help.bill` stays in EN dictionary but becomes unused by this constant.
- **Verdict: ACCEPT (P2)** — Low risk, no crash. Keep old `help.bill` in EN dict for backward compat (other code or B44 translations may reference it). No code change needed.

### C2. [P2] `tr()` fallback strings changed from English to Russian — ACCEPTED
- CC #4: All HELP_CARD_LABELS fallback strings switch from English to Russian (e.g., 'Call a waiter' → 'Позвать официанта').
- **Verdict: ACCEPT (P2)** — Informational. Since Fix 4 adds both EN and RU dictionary entries, `tr()` should resolve from dictionary before hitting fallbacks. Intentional design choice per task. No code change needed, but merge writer should be aware.

### C3. [P2] useCallback deps include stable useMemo refs — REJECTED (no action)
- CC #5: `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` in useCallback deps are functionally redundant since both are `useMemo(..., [])`.
- **Verdict: REJECT (no action needed)** — CC itself says "keep as specified for ESLint compliance." Not a finding that requires any fix.

### C4. [P1] TDZ placement of urgency helpers — ACCEPTED
- CC #6: `getHelpUrgency` and `getHelpTimerStr` must be placed AFTER `HELP_URGENCY_THRESHOLDS` and `HELP_URGENCY_GROUP` to avoid TDZ (KB-107).
- **Verdict: ACCEPT (P1)** — Important implementation guidance. Merge writer must insert helpers AFTER the urgency constants.

## Codex Only (CC missed)

### X1. [P1] Config still uses old 4-button model — REJECTED (task description, not finding)
- Codex #1: Notes that current code has old constants that need updating.
- **Verdict: REJECT** — This is a restatement of what Fix 1 asks to do, not a finding about the proposed fix. The task explicitly instructs replacing these constants. No additional action.

### X2. [P2] Urgency thresholds and helpers missing — REJECTED (task description, not finding)
- Codex #3: Notes urgency constants/helpers don't exist yet.
- **Verdict: REJECT** — Again a restatement of Fix 2 requirements. The task instructs adding them. No additional action.

### X3. [INFO] Baseline file is 4905 lines vs expected 5374 — NOTED
- Codex flagged that the synced file is 4905 lines, not 5374 as the task expects.
- **Verdict: NOTE for merge writer** — The merge writer must check `wc -l` at start. If file is genuinely 4905 (not 5374), line numbers in the task may be offset. The merge writer should use grep (not line numbers) to find insertion points. This does NOT block comparison — all fixes reference greppable identifiers, not just line numbers.

## Disputes (disagree)

### D1. Severity of HELP_CHIPS/HELP_PREVIEW_LIMIT removal
- **CC:** P0 (crash)
- **Codex:** P1
- **Resolution: P0 is correct.** Removing a `const` that is referenced in JSX causes `ReferenceError` — this is a hard crash, not degraded behavior. CC's analysis is more precise (lists exact JSX lines).

### D2. Prompt Clarity rating
- **CC:** 4/5
- **Codex:** 2/5
- **Resolution:** Codex's lower score is partly due to the baseline mismatch (4905 vs 5374 lines), which is a legitimate concern but external to prompt quality. The HELP_CHIPS/HELP_PREVIEW_LIMIT contradiction is a real clarity issue both caught. **Agreed: 3/5** — well-structured task with one significant internal contradiction (remove constants vs no JSX changes).

## Final Fix Plan

Ordered list of all fixes to apply, with priority and source:

1. **[P0] Keep HELP_CHIPS — do NOT remove** — Source: Agreed (A1) — Add `// DEPRECATED v6.0 — remove in Part B` comment but leave constant intact. JSX at line ~5102 depends on it.

2. **[P0] Keep HELP_PREVIEW_LIMIT — do NOT remove** — Source: Agreed (A1) — Add `// DEPRECATED v6.0 — remove in Part B` comment but leave constant intact. Lines ~2701, ~4935, ~5027 depend on it.

3. **[P1] Update HELP_REQUEST_TYPES** — Source: Task Fix 1 — Replace with 6-button set + legacy `menu` + `other`. Use greppable identifier to find insertion point.

4. **[P1] Update HELP_CARD_LABELS** — Source: Task Fix 1 — Replace with v6.0 labels including `plate`, `utensils`, `clear_table`. Note `tr()` fallbacks are now Russian (intentional per C2).

5. **[P1] Add HELP_CARD_SHORT_LABELS** — Source: Task Fix 1 — New constant, insert after HELP_CARD_LABELS.

6. **[P1] Update HELP_COOLDOWN_SECONDS** — Source: Task Fix 1 — Add `plate`, `utensils`, `clear_table` entries.

7. **[P1] Update nonOtherTypes array at ~line 2130** — Source: Task Fix 1 — Add `plate`, `utensils`, `clear_table`; keep `menu` for backward compat.

8. **[P1] Add HELP_URGENCY_THRESHOLDS + HELP_URGENCY_GROUP** — Source: Task Fix 2 — Insert after HELP_COOLDOWN_SECONDS.

9. **[P1] Add getHelpUrgency + getHelpTimerStr** — Source: Task Fix 2 + CC-only (C4 TDZ) — Insert AFTER urgency constants (not before — TDZ risk per KB-107).

10. **[P1] Add new i18n keys to I18N_FALLBACKS (EN)** — Source: Agreed (A2) — Add all new keys EXCEPT `help.sent_suffix` and `help.retry` (already exist). Keep existing `help.bill` for backward compat (C1).

11. **[P1] Add new i18n keys to I18N_FALLBACKS_RU (RU)** — Source: Agreed (A2) — Add all new keys EXCEPT `help.retry` (already exists). UPDATE existing `help.get_bill` from "Принести счёт" to "Счёт" in-place (do not add duplicate).

12. **[INFO] Verify baseline line count** — Source: Codex (X3) — Merge writer must `wc -l` at start. Use grep for all insertion points, not hardcoded line numbers.

## Summary
- Agreed: 2 items (HELP_CHIPS/PREVIEW_LIMIT keep + i18n duplicate handling)
- CC only: 4 items (2 accepted as P2 info, 1 rejected as no-action, 1 accepted as P1 TDZ guidance)
- Codex only: 3 items (2 rejected as task restatements, 1 noted as baseline info)
- Disputes: 2 items (severity rating resolved to P0; prompt clarity resolved to 3/5)
- **Total fixes to apply: 11** (2 P0 keep-alive, 7 P1 additions/updates, 2 P2 informational)
