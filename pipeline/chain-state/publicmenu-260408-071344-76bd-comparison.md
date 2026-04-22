# Comparison Report — publicmenu
Chain: publicmenu-260408-071344-76bd

## Overview
- CC: 9 findings (4 P1, 5 P2) — focused on prompt-level issues (implementation pitfalls)
- Codex: 3 findings (3 P1) — focused on current code state confirmation + scope concerns

Both approaches are complementary: CC reviewed the proposed code blocks for bugs, Codex verified the current file state and flagged scope risks.

---

## Agreed (both found)

### A1. [P1] Fix 1 — Config constants need full v6.0 update
CC (Finding 1-3) and Codex (Finding 1) both confirm HELP_REQUEST_TYPES, HELP_CARD_LABELS, HELP_COOLDOWN_SECONDS, nonOtherTypes must be updated to include plate/utensils/clear_table. HELP_CARD_SHORT_LABELS must be added. Both agree HELP_CHIPS and HELP_PREVIEW_LIMIT should be removed.

### A2. [P1] Fix 2 — Urgency thresholds and helpers must be added
CC (Finding 4-5) and Codex (Finding 2) both confirm no urgency code exists yet. Both agree the useMemo constants and useCallback helpers should be inserted.

### A3. [P1] Fix 4 — i18n keys incomplete, help.get_bill RU must be replaced
CC (Finding 6-9) and Codex (Finding 3) both confirm new help.* keys are missing from both dictionaries. Both explicitly note RU `help.get_bill` must be REPLACED from "Принести счёт" to "Счёт" (not added as duplicate).

---

## CC Only (Codex missed)

### C1. [P1] tr() fallbacks in HELP_CARD_LABELS use Russian instead of English — ACCEPTED
**CC Finding 1.** The proposed code blocks show `tr('help.call_waiter', 'Позвать официанта')` etc. with Russian fallbacks. Since tr() bypasses makeSafeT, EN-mode users would see Russian text when B44 lacks the key. Existing pattern uses English fallbacks.
**Verdict: ACCEPT — HIGH IMPACT.** Must use English fallbacks in tr() calls. Russian handled by I18N_FALLBACKS_RU.

### C2. [P2] HELP_CARD_SHORT_LABELS missing `menu` entry — ACCEPTED
**CC Finding 2.** The new HELP_CARD_SHORT_LABELS has 7 entries but no `menu`. If any code accesses short labels for legacy `menu` type, it gets undefined.
**Verdict: ACCEPT.** Low risk since menu is legacy-only, but adding `menu: tr('help.menu_short', 'Menu')` is defensive and cheap.

### C3. [P2] help.bill key renamed to help.get_bill — NOTED
**CC Finding 3.** The i18n key changes from `help.bill` to `help.get_bill`. The old key becomes orphaned for this usage. Not a bug since Fix 4 adds `help.get_bill` to both dictionaries.
**Verdict: ACCEPT as informational.** No action needed — just awareness.

### C4. [P1] getHelpTimerStr hardcodes Russian "м" — ACCEPTED
**CC Finding 4.** The helper returns `${min}м` with Cyrillic "м". EN-mode users see Russian character for minutes.
**Verdict: ACCEPT — HIGH IMPACT.** Should use i18n: `t('help.minutes_short')` or at minimum use Latin 'm' which is universal.

### C5. [P2] getHelpUrgency unnecessary deps in useCallback — NOTED
**CC Finding 5.** Deps include stable useMemo refs. Not a bug, just unnecessary.
**Verdict: ACCEPT as informational.** No fix needed — acceptable as-is.

### C6. [P1] Fix 4 EN block includes already-existing keys — ACCEPTED
**CC Finding 6.** `help.sent_suffix` (line 528) and `help.retry` (line 551) already exist in EN dictionary. Implementer must skip these.
**Verdict: ACCEPT.** Implementation guidance — skip existing keys to avoid duplicates.

### C7. [P2] Fix 4 RU help.retry already exists — ACCEPTED
**CC Finding 8.** Line 603 already has `"help.retry": "Повторить"`. Must skip.
**Verdict: ACCEPT.** Same as C6 — skip existing.

### C8. [P2] Fix 4 EN help.call_waiter already exists — NOTED
**CC Finding 9.** Line 526 already has this key. Confirming: do not re-add.
**Verdict: ACCEPT as informational.** The task already says "only if key does NOT already exist".

---

## Codex Only (CC missed)

### X1. [P1] HELP_CHIPS and HELP_PREVIEW_LIMIT are REFERENCED in live JSX — ACCEPTED
**Codex Finding 1 (detail).** Codex identified that `HELP_CHIPS` is still referenced at lines ~2701, 4935, 5027, 5102 and `HELP_PREVIEW_LIMIT` is referenced in JSX. The task says "remove entirely" but also says "NO JSX CHANGES." Removing the constants without removing their JSX references would cause ReferenceError crashes.
**Verdict: ACCEPT — CRITICAL SCOPE CONFLICT.** The implementer must NOT remove HELP_CHIPS/HELP_PREVIEW_LIMIT if they are still referenced in JSX. Either: (a) keep the constants but mark them deprecated with a comment, or (b) remove both constants AND their JSX references (but this violates "NO JSX CHANGES" scope lock). Recommendation: KEEP both constants with `// DEPRECATED v6.0 — remove when JSX updated in Part B` comment. Do NOT delete them in this task.

### X2. [P2] Preset grid is hardcoded in JSX — NOTED
**Codex Finding 1 (detail).** The visible button grid at lines 5048-5097 is hardcoded in JSX. Updating constants alone won't change what buttons users see. This is expected — the task explicitly says "NO JSX CHANGES" and this is "Part A" (config/i18n only). Part B will handle JSX.
**Verdict: ACCEPT as informational.** By design — Part A prepares constants, Part B (future task) will use them in JSX.

---

## Disputes (disagree)

### D1. Scope of HELP_CHIPS / HELP_PREVIEW_LIMIT removal
- **CC** implicitly assumes removal is safe (no finding about JSX references).
- **Codex** explicitly warns that removing these constants will crash JSX that still references them.
- **Resolution: Codex is correct.** The constants must be KEPT (with deprecation comment) until Part B removes the JSX references. The task's instruction to "remove entirely" conflicts with "NO JSX CHANGES" — the safer interpretation wins. Add to fix plan: do NOT remove HELP_CHIPS or HELP_PREVIEW_LIMIT; add deprecation comment instead.

---

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:

1. **[P1] Update HELP_REQUEST_TYPES** — Source: agreed (A1) — Add plate, utensils, clear_table; keep menu with `// legacy` comment
2. **[P1] Update HELP_CARD_LABELS with ENGLISH tr() fallbacks** — Source: agreed (A1) + CC-only (C1) — Use English fallback strings in tr() calls, NOT Russian
3. **[P1] Add HELP_CARD_SHORT_LABELS** — Source: agreed (A1) + CC-only (C2) — Include all 7 entries + `menu` for backward safety; use English tr() fallbacks
4. **[P1] Update HELP_COOLDOWN_SECONDS** — Source: agreed (A1) — Add plate, utensils, clear_table entries
5. **[P1] DO NOT remove HELP_CHIPS / HELP_PREVIEW_LIMIT** — Source: Codex-only (X1) — Keep with `// DEPRECATED v6.0` comment instead of removing (JSX still references them)
6. **[P1] Update nonOtherTypes at line ~2130** — Source: agreed (A1) — Add plate, utensils, clear_table; keep menu
7. **[P1] Add HELP_URGENCY_THRESHOLDS and HELP_URGENCY_GROUP** — Source: agreed (A2) — Insert after HELP_COOLDOWN_SECONDS
8. **[P1] Add getHelpUrgency useCallback** — Source: agreed (A2) — Insert in component body before return
9. **[P1] Add getHelpTimerStr useCallback with i18n** — Source: agreed (A2) + CC-only (C4) — Use i18n for "м"/"m" suffix instead of hardcoded Cyrillic
10. **[P1] Add new help.* keys to I18N_FALLBACKS (EN)** — Source: agreed (A3) + CC-only (C6/C8) — Skip keys that already exist (help.call_waiter, help.sent_suffix, help.retry)
11. **[P1] Add new help.* keys to I18N_FALLBACKS_RU** — Source: agreed (A3) + CC-only (C7) — Skip help.retry (exists); REPLACE help.get_bill "Принести счёт" → "Счёт"
12. **[P2] Add help.minutes_short to both dictionaries** — Source: CC-only (C4) — Needed for Fix 9 i18n timer. EN: "m", RU: "м". (Only if this key doesn't already exist — grep first.)

## Summary
- Agreed: 3 items (A1, A2, A3)
- CC only: 8 items (5 accepted with action, 3 accepted as informational)
- Codex only: 2 items (1 accepted with action — CRITICAL, 1 informational)
- Disputes: 1 item (resolved in favor of Codex — keep HELP_CHIPS/HELP_PREVIEW_LIMIT)
- **Total fixes to apply: 12**
- **Key deviation from task spec:** HELP_CHIPS and HELP_PREVIEW_LIMIT must NOT be removed (they are still referenced in JSX). Mark deprecated instead.
