# Merge Report — publicmenu
Chain: publicmenu-260408-072228-de40

## Applied Fixes
1. [P0] Do NOT remove HELP_CHIPS or HELP_PREVIEW_LIMIT — Source: agreed (A1) — DONE. Kept both constants with `// TODO: remove in v6.0 Part B` comments. JSX references at lines 2701, 4935, 5027, 5102 remain safe.
2. [P1] Update HELP_REQUEST_TYPES — Source: prompt + agreed (A2) — DONE. Added `plate`, `utensils`, `clear_table`. Kept `menu` with `// legacy` comment.
3. [P1] Update HELP_CARD_LABELS with v6.0 types — Source: prompt + CC (C1, C2) — DONE. 8 entries (6 preset + other + menu legacy). Used English fallbacks in tr() calls per codebase convention.
4. [P1] Add HELP_CARD_SHORT_LABELS (new constant) — Source: prompt + CC (C1) — DONE. 7 entries with English fallbacks.
5. [P1] Update HELP_COOLDOWN_SECONDS — Source: prompt + CC (C2) — DONE. 8 entries including `menu: 240 // legacy`.
6. [P1] Update nonOtherTypes at line ~2130 — Source: agreed (A2) — DONE. Added `plate`, `utensils`, `clear_table`. Kept `menu`.
7. [P2] Add HELP_URGENCY_THRESHOLDS and HELP_URGENCY_GROUP — Source: prompt + Codex (X1) — DONE. Two useMemo constants with std/bill groups.
8. [P2] Add getHelpUrgency and getHelpTimerStr useCallbacks — Source: prompt — DONE. Inserted after urgency constants, before state declarations.
9. [P1] Add new i18n keys to I18N_FALLBACKS (EN) — Source: agreed (A3) — DONE. Added 18 new keys: help.get_bill, help.plate, help.utensils, help.clear_table, 6 *_short keys, help.subtitle_choose, help.table_default, help.cancel_confirm_q, help.cancel_keep, help.cancel_do, help.other_request_link, help.other_placeholder, help.send_btn. Skipped existing: help.call_waiter, help.napkins, help.sent_suffix, help.retry, help.undo.
10. [P1] Add new i18n keys to I18N_FALLBACKS_RU (RU) — Source: agreed (A3) — DONE. Updated help.get_bill from "Принести счёт" → "Счёт". Added 20 new keys: help.plate, help.utensils, help.clear_table, 6 *_short keys, help.subtitle_choose, help.table_default, help.cancel_confirm_q, help.cancel_keep, help.cancel_do, help.other_request_link, help.other_placeholder, help.send_btn, help.sent_suffix, help.undo.

## Skipped — Unresolved Disputes (for Arman)
None. All disputes resolved in discussion.

## Skipped — Could Not Apply
None.

## Git
- Commit: 0012e3f
- Lines before: 5374
- Lines after: 5459 (+85 lines — new constants, helpers, i18n keys)
- Files changed: 1 (pages/PublicMenu/x.jsx)

## Verification Results
- `HELP_CHIPS`: 2 occurrences (kept with TODO) ✅
- `HELP_PREVIEW_LIMIT`: 4 occurrences (kept with TODO) ✅
- `HELP_CARD_SHORT_LABELS`: exists ✅
- `getHelpUrgency`: exists ✅
- `getHelpTimerStr`: exists ✅
- `HELP_URGENCY_THRESHOLDS`: exists ✅
- `nonOtherTypes`: includes plate/utensils/clear_table/menu ✅
- `help.undo` in RU: "Отменить" ✅
- `help.plate`: in both EN and RU dicts ✅
- `help.sent_suffix`: in both EN and RU dicts ✅
- Function count: 175 (no decrease) ✅
- Key functions spot-check: makeSafeT, useHelpRequests, openHelpDrawer all present ✅

## Prompt Feedback
- CC clarity score: 4/5
- Codex clarity score: 3/5
- Discussion consensus: 4/5
- Fixes where writers diverged due to unclear description: Fix 1 — prompt said "remove HELP_CHIPS and HELP_PREVIEW_LIMIT" but SCOPE LOCK forbids JSX changes, creating a contradiction since both constants have active JSX references. Both writers caught this independently.
- Fixes where description was perfect (both writers agreed immediately): Fix 2 (urgency helpers), Fix 4 (i18n keys), Fix 6 (nonOtherTypes update).
- Recommendation for improving task descriptions: When instructing removal of constants, verify no JSX references exist first, or explicitly note which JSX lines to update. The contradiction between "remove X" and "no JSX changes" was the single source of confusion.
- CC-only finding accepted (C1): tr() fallback language convention — prompt provided Russian fallbacks but codebase convention uses English. Good catch that prevented a real user-facing bug (English users seeing Russian).
- CC-only finding accepted (C2): `menu` type missing from new constants — backward compat risk for legacy DB records.

## Summary
- Applied: 10 fixes
- Skipped (unresolved): 0 disputes
- Skipped (other): 0 fixes
- MUST-FIX not applied: 0
- Commit: 0012e3f
