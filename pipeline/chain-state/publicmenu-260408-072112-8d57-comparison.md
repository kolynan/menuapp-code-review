# Comparison Report — publicmenu
Chain: publicmenu-260408-072112-8d57

## Agreed (both found)

### 1. [P0] HELP_PREVIEW_LIMIT and HELP_CHIPS removal will crash JSX
- **CC (#1, #2):** Both constants are actively referenced in FROZEN JSX (HELP_PREVIEW_LIMIT at lines 2701, 4935, 5027; HELP_CHIPS at line 5102). Removing them causes ReferenceError. Keep both with TODO comments for Part B.
- **Codex (#1):** Same finding — removing while forbidding JSX changes leaves unresolved identifiers. Recommends keeping until JSX phase.
- **Resolution:** AGREED. Keep both constants. Add `// TODO: remove in Part B (SOS v6.0 JSX update)` comment. Do NOT delete.

### 2. [P1] nonOtherTypes needs plate/utensils/clear_table added
- **CC (#5):** Confirms line 2130 update is safe — new types won't have server entries until sent, so `relevantEntries` will be empty. Proceed as specified.
- **Codex (#3):** Flags that both HELP_REQUEST_TYPES and nonOtherTypes still exclude the three new types and must be extended. Same fix direction.
- **Resolution:** AGREED. Apply Fix 1's nonOtherTypes update as specified in the task. Both reviewers confirm this is needed.

### 3. [P1] Urgency helpers must be added (Fix 2)
- **CC (#6):** Notes dependency arrays are technically unnecessary but harmless. No blocker.
- **Codex (#4):** Flags that urgency code is completely absent — no code path for amber/red escalation. Must add all constants + helpers.
- **Resolution:** AGREED. Add HELP_URGENCY_THRESHOLDS, HELP_URGENCY_GROUP, getHelpUrgency, getHelpTimerStr as specified. CC's dep array note is informational — proceed as task specifies.

### 4. [P1] i18n keys need adding with duplicate-awareness (Fix 4)
- **CC (#7, #8, #9):** Identifies specific duplicates to watch: `help.retry` already in RU (line 603), `help.sent_suffix` already in EN (line 528), `help.get_bill` in RU must REPLACE existing (line 596), not add duplicate.
- **Codex (#5):** Flags that EN/RU blocks are missing v6.0 keys and need additions. Notes RU `help.get_bill` should be shortened to "Счет".
- **Resolution:** AGREED on direction. CC provides more granular guidance on existing keys to skip or replace. Merge plan should follow CC's key-by-key analysis: skip existing, replace help.get_bill RU value, add only truly new keys.

## CC Only (Codex missed)

### 5. [P1] help.bill vs help.get_bill key rename — keep help.bill in EN fallbacks
- **CC (#3):** Existing `help.bill` at line 535 should NOT be removed. Task adds `help.get_bill` as new key. Both should coexist for backward compat.
- **Validity:** SOLID. Legacy code may reference `help.bill`. Keep existing, add new.
- **Decision:** ACCEPT.

### 6. [P2] tr dependency in HELP_CARD_SHORT_LABELS memo is correct
- **CC (#4):** Informational — confirms `[tr]` dep array matches existing HELP_CARD_LABELS pattern.
- **Decision:** ACCEPT (informational, no action needed).

### 7. [P2] help.sent_suffix already exists in EN (line 528)
- **CC (#9):** Task lists it as new but it's already present. Skip to avoid duplicate.
- **Decision:** ACCEPT. Implementer must grep and skip.

### 8. [P2] help.get_bill RU value — REPLACE, don't add duplicate
- **CC (#8):** Line 596 already has `"help.get_bill": "Принести счет"`. Task intentionally shortens to "Счет". Must replace the existing line, not add a second entry.
- **Decision:** ACCEPT. Replace in-place at line 596.

## Codex Only (CC missed)

### 9. [P1] Grid hardcoded in JSX — new types won't be visible
- **Codex (#2):** The visible drawer grid at lines 5048-5054 is hardcoded to `call_waiter`, `bill`, `napkins`, `menu`. Updating constants alone won't surface `plate`, `utensils`, `clear_table`.
- **Validity:** INFORMATIONAL but correct observation. The task explicitly states "NO JSX CHANGES in this task" and "Part A of hybrid split: safe constants/i18n only". The JSX grid update is intentionally deferred to Part B (KS-B). This is a prompt design choice, not a bug.
- **Decision:** ACCEPT as informational note. No action needed — Part B will update JSX to use config-driven rendering. Note in merge report for Part B awareness.

## Disputes (disagree)

### 10. HELP_CHIPS and HELP_PREVIEW_LIMIT: remove vs keep
- **Task says:** Remove entirely (0 occurrences).
- **Both CC and Codex say:** Cannot remove — actively used in FROZEN JSX.
- **Dispute resolution:** Both reviewers AGREE with each other and DISAGREE with the task. The task contains a contradiction: "remove these constants" + "do not change JSX". Since JSX is FROZEN, constants must stay. This is not a CC-vs-Codex dispute but a prompt-vs-reality issue.
- **Decision:** KEEP both constants. Add TODO comments. Flag to task author that verification checks "HELP_CHIPS must be 0 occurrences" and "HELP_PREVIEW_LIMIT must be 0 occurrences" are invalid for Part A — they apply to Part B.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P0] Keep HELP_PREVIEW_LIMIT and HELP_CHIPS** — Source: agreed (CC+Codex) — Do NOT remove. Add `// TODO: remove in Part B` comments. Update HELP_CHIPS content if needed but keep the constant.
2. **[P1] Update HELP_REQUEST_TYPES** — Source: task + agreed — Add `plate`, `utensils`, `clear_table`. Keep `menu` with `// legacy` comment. Keep `other`.
3. **[P1] Update HELP_CARD_LABELS** — Source: task — Update to 7-entry object with new types. Use `help.get_bill` key (not `help.bill`).
4. **[P1] Add HELP_CARD_SHORT_LABELS** — Source: task — New useMemo with 7 entries, `[tr]` dep.
5. **[P1] Update HELP_COOLDOWN_SECONDS** — Source: task — Add cooldowns for `plate`, `utensils`, `clear_table`.
6. **[P1] Update nonOtherTypes (line ~2130)** — Source: agreed — Add `plate`, `utensils`, `clear_table`. Keep `menu`.
7. **[P1] Add HELP_URGENCY_THRESHOLDS + HELP_URGENCY_GROUP** — Source: agreed (task + Codex) — Two useMemo constants after HELP_COOLDOWN_SECONDS.
8. **[P1] Add getHelpUrgency + getHelpTimerStr** — Source: agreed — Two useCallback helpers in component body before return.
9. **[P1] Add new i18n keys to I18N_FALLBACKS (EN)** — Source: agreed — Add ~15 new keys. SKIP `help.sent_suffix` (already exists line 528). Keep existing `help.bill` (don't remove).
10. **[P1] Add new i18n keys to I18N_FALLBACKS_RU (RU)** — Source: agreed — Add ~16 new keys. SKIP `help.retry` (already exists line 603). REPLACE `help.get_bill` value at line 596 from "Принести счет" to "Счет".
11. **[P2] Keep help.bill in EN fallbacks** — Source: CC only — Do not remove existing key for backward compat.

## Summary
- Agreed: 4 items (P0 constant removal blocker, nonOtherTypes, urgency helpers, i18n keys)
- CC only: 4 items (3 accepted: help.bill compat, help.sent_suffix skip, help.get_bill RU replace; 1 informational: tr dep)
- Codex only: 1 item (1 accepted as informational: grid hardcoded — deferred to Part B)
- Disputes: 1 item (task vs both reviewers on HELP_CHIPS/HELP_PREVIEW_LIMIT removal — resolved: keep)
- **Total fixes to apply: 11**
- **Prompt clarity: CC 4/5, Codex 3/5** — Main issue: contradictory requirements (remove constants + freeze JSX)
