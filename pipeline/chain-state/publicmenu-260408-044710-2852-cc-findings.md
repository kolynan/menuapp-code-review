# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-044710-2852

## Issues Found

1. [CRITICAL] Replacement boundary end line is wrong — Prompt says "End of children to replace: just before `</DrawerContent>` (~line 5175)". Actual `</DrawerContent>` is at line 5197. Line 5175 is mid-way through the "other" send logic JSX. The replacement block is lines 4891-5196 (305 lines), not ending at ~5175. This could cause CC to leave orphan JSX or cut the replacement short. PROMPT FIX: Change "just before `</DrawerContent>` (~line 5175)" to "just before `</DrawerContent>` (~line 5197)".

2. [CRITICAL] "showOtherForm" textarea block is left as a skeleton — Fix 3 JSX for the "other" form block says `{/* Render textarea + Отправить/Отмена buttons — adapt existing block (~5137-5195) */}` with an empty `<div>`. This is ambiguous — CC may literally output an empty div. The existing code (lines 5137-5195) contains complex undo+timer+state logic that must be precisely copied. PROMPT FIX: Either provide the complete JSX for the textarea form (including the 5s undo timeout, setRequestStates with Array.isArray, setUndoToast, pendingQuickSendRef, handlePresetSelect calls) or provide explicit "COPY lines 5140-5195 verbatim, changing only the outer wrapper className and button styles".

3. [MEDIUM] Missing `help.undo` from i18n additions — Fix 4 adds `help.sent_suffix` to both dictionaries but does NOT add `help.undo` to I18N_FALLBACKS_RU. Currently `help.undo` exists only in EN dict (line 529: `"help.undo": "Undo"`). The undo toast JSX uses `t('help.undo')` — this will show English "Undo" in RU mode. PROMPT FIX: Add `"help.undo": "Отменить"` to I18N_FALLBACKS_RU additions.

4. [MEDIUM] `focusHelpRow` removal analysis is incomplete — Fix 5 says "grep call sites; remove function if ALL sites are in replaced JSX block". But `focusHelpRow` (line 2699) uses `ticketBoardRef` and `setHighlightedTicket` which are being neutered/removed. If `focusHelpRow` is kept, it will reference a removed ref and a commented-out setter — it will be dead code that silently fails. Additionally, line 2701 references `HELP_PREVIEW_LIMIT` which is being removed in Fix 5 (causing a ReferenceError!). PROMPT FIX: Add explicit instruction: "focusHelpRow references HELP_PREVIEW_LIMIT (being removed) — if kept, this causes ReferenceError. Must remove focusHelpRow entirely or replace HELP_PREVIEW_LIMIT with a literal value."

5. [MEDIUM] `handleSosCancel` depends on `handleResolve` — placement says "insert AFTER `getHelpTimerStr` (from Fix 2) and AFTER `handleResolve` definition (~line 2300+)". But `SOS_BUTTONS` is specified to go "AFTER `HELP_CARD_SHORT_LABELS`" (~line 1813), while `handleSosCancel` goes after `handleResolve` (~2370+). This split placement is clear but the `SOS_BUTTONS` + `handleSosCancel` are presented together in one code block. CC might insert both at line ~1813. PROMPT FIX: Separate the two code blocks with explicit headings: "Insert SOS_BUTTONS at ~line 1813" and "Insert handleSosCancel at ~line 2400 (after handleResolve)".

6. [MEDIUM] Undo toast uses mixed `t()` and `tr()` — The new undo toast JSX uses `t('help.sent_suffix')` and `t('help.undo')` — but most of the new help.* keys use `tr('help.xxx', 'fallback')`. The file has a custom `makeSafeT` wrapper. Using `t()` without fallback means if the key isn't in the B44 translation system, it shows the raw key. The existing code at line 5127-5129 already uses `t()` for these, so this is consistent — but the prompt's Implementation Notes say "tr() for new help.* keys. t() for existing undo toast keys" which is correct but could benefit from a reminder in the JSX block itself. PROMPT FIX: Add a comment in the undo toast JSX: `{/* t() here — these keys exist in I18N_FALLBACKS */}`.

7. [LOW] `help.get_bill` key already exists in RU dict — Line 596 has `"help.get_bill": "Принести счёт"`. Fix 4 adds `"help.get_bill": "Счёт"` to RU. This will overwrite the existing value changing "Принести счёт" → "Счёт". This is intentional (matching the short button label) but should be explicit. PROMPT FIX: Add note: "This REPLACES existing 'Принести счёт' with shorter 'Счёт' — intentional for button label."

8. [LOW] `help.call_waiter` value change not flagged — EN dict line 524 likely has "Call waiter" or similar. RU dict line 595 has "Вызвать официанта". Fix 1 changes HELP_CARD_LABELS to use `tr('help.call_waiter', 'Позвать официанта')`. This changes the Russian fallback from "Вызвать" to "Позвать" (different verb). Intentional per UX but not flagged as a change. PROMPT FIX: Note this as intentional label change.

9. [LOW] Import cleanup for `DrawerHeader`/`DrawerTitle` — these are imported at line 93 and used only at line 4909 (inside the replaced block). Prompt says "check and remove ChevronDown/ArrowLeft/MapPin if unused elsewhere." ArrowLeft is also used at line 1234 (outside help drawer — in back navigation). ChevronDown at line 4781 (outside help drawer — in CartView drawer). MapPin at line 161 (icon mapping). So only `DrawerHeader` and `DrawerTitle` can be removed from imports. PROMPT FIX: Be explicit: "Remove `DrawerHeader`, `DrawerTitle` from imports. KEEP `ArrowLeft` (line 1234), `ChevronDown` (line 4781), `MapPin` (line 161)."

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_PREVIEW_LIMIT | ~1795 | 1795 | ✅ |
| HELP_REQUEST_TYPES | ~1796 | 1796 | ✅ |
| HELP_COOLDOWN_SECONDS | ~1799 | 1799 | ✅ |
| HELP_CARD_LABELS | ~1800 | 1800 | ✅ |
| HELP_CHIPS | ~1807 | 1807 | ✅ |
| isTicketExpanded | ~1827 | 1827 | ✅ |
| highlightedTicket | ~1826 | 1826 | ✅ |
| ticketBoardRef | ~1825 | 1825 | ✅ |
| activeRequestCount | ~1947 | 1946 | ✅ (off by 1) |
| nonOtherTypes | line 2130 | 2130 | ✅ |
| openHelpDrawer | ~2264-2274 | 2264-2274 | ✅ |
| closeHelpDrawer | ~2276-2282 | 2276-2282 | ✅ |
| handleResolve | ~2370 | 2370 | ✅ |
| post-send callback | ~2481 | 2480-2485 | ✅ |
| focusHelpRow | ~2699 | 2699 | ✅ |
| I18N_FALLBACKS | ~line 327 | 327 | ✅ |
| I18N_FALLBACKS_RU | ~line 588 | 588 | ✅ |
| DrawerContent children start | ~4891 | 4891 | ✅ |
| DrawerContent end | ~5175 | 5197 | ❌ (off by 22 lines) |
| showOtherForm block | ~5137-5195 | 5137-5195 | ✅ |

## Fix-by-Fix Analysis

**Fix 1 (Button set + config constants)** — SAFE. All line numbers verified. Clear instructions for what to add/remove. `menu` backward compat handling is well-documented. One note: `HELP_CARD_SHORT_LABELS` is new — insertion point is clear ("after HELP_CARD_LABELS").

**Fix 2 (Urgency thresholds + helpers)** — SAFE. New constants, no conflicts. `useCallback` deps include useMemo constants — React will warn these are stable but it's harmless. Clean.

**Fix 3 (Drawer JSX rewrite)** — RISKY. Three concerns: (a) replacement boundary end line wrong (Issue #1), (b) textarea form is a skeleton (Issue #2), (c) the JSX is ~180 lines which is substantial but well-structured. The D7 rule (no `relative` on DrawerContent) is correctly stated. The `handleSosCancel` placement split (Issue #5) could cause confusion.

**Fix 4 (i18n keys)** — SAFE with minor gap. Missing `help.undo` in RU (Issue #3). Existing key overwrite for `help.get_bill` should be noted (Issue #7). Otherwise well-structured with both EN and RU blocks.

**Fix 5 (Cleanup)** — RISKY. The "keep useState with comment" approach is correct for hook order safety. However: (a) `focusHelpRow` references `HELP_PREVIEW_LIMIT` which is being deleted — this is a ReferenceError waiting to happen (Issue #4), (b) the dead helper grep instructions are good but could miss edge cases. The import cleanup needs more specificity (Issue #9).

## Summary
Total: 9 issues (2 CRITICAL, 4 MEDIUM, 3 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 4/5
- What was most clear: Line numbers are highly accurate (17/18 verified). FROZEN UX section is comprehensive. SCOPE LOCK with numbered regions is excellent. The precedence rule and known-correct fields are valuable context. Fix order and dependencies are well-thought-out.
- What was ambiguous or could cause hesitation: (1) The textarea "other" form is left as skeleton — CC will hesitate or produce empty UI. (2) Replacement end boundary (5175 vs 5197) could cause CC to leave orphan JSX. (3) `SOS_BUTTONS` and `handleSosCancel` are in one code block but need different insertion points.
- Missing context: (1) `help.undo` RU fallback. (2) Explicit import removal list (which to keep vs remove). (3) `focusHelpRow` → `HELP_PREVIEW_LIMIT` dependency chain.
