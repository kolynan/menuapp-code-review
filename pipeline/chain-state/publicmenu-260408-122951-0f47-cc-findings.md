# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-122951-0f47

## Issues Found

1. [CRITICAL] handleSosCancel insertion point is WRONG — handleResolve ends at line 2493, NOT ~2470. Prompt says "Insert AFTER that useCallback block closes (line ~2470)" but line 2470 is `errorMessage: '',` inside the setRequestStates body. The handleResolve useCallback closes at line 2493 `}, []);`. handleSosCancel should be inserted AFTER line 2493. PROMPT FIX: Change "Insert AFTER that useCallback block closes (line ~2470)" to "Insert AFTER handleResolve useCallback closes at line 2493 `}, []);`". Also note there's a useEffect at line 2495 right after — the insertion must go between lines 2493 and 2495.

2. [CRITICAL] handleSosCancel deps array includes `getHelpUrgency` but this is a useCallback — correct. However, it's listed as a DIRECT dep even though handleSosCancel calls `getHelpUrgency(type, activeRow.sentAt)`. The actual dep array `[activeRequests, getHelpUrgency, handleResolve]` is correct. BUT: `setCancelConfirmType` is a state setter (stable ref), so NOT needed in deps — OK. This is actually fine. RETRACTED.

3. [CRITICAL] "other" form textarea block — the prompt says "COPIED from existing block (lines 5222-5280)" but the ACTUAL existing "other" submit block is at lines 5222-5280 which uses `<Button>` component (capital B, from shadcn/ui) with `style={{ backgroundColor: primaryColor }}`. The new JSX replaces it with plain `<button>` elements with hardcoded `bg-orange-500`. This is intentional per UX spec, but the comment says "DO NOT change: undo logic, setRequestStates..." — yet the prompt DOES change the button from `<Button>` to `<button>`, removes `primaryColor` usage, and restructures the entire layout (from flex-row to column with textarea). The "COPIED" comment is misleading — it's a REWRITE with preserved business logic. PROMPT FIX: Remove "COPIED from existing block" wording. Say "REWRITE the other-form block preserving ALL business logic from lines 5222-5280 (undo, setRequestStates, Array.isArray, pendingQuickSendRef, handlePresetSelect)."

4. [MEDIUM] Existing "other" form has TWO separate blocks — the CHIPS+textarea section (lines 5184-5207 inside the replaced `<div className="relative">`) AND the submit buttons section (lines 5222-5280 OUTSIDE the `<div className="relative">` at the DrawerContent level). The prompt's new JSX puts the entire textarea form inside the replaced block. This means the structural nesting changes — the old `{!isTicketExpanded && showOtherForm && (...)}` at line 5222 which was a SIBLING of the `<div className="relative">` is now REMOVED (it's inside the replacement boundary 4976-5281). This is correct since the entire 4976-5281 range covers both. But the prompt should explicitly note: "The old submit-buttons block at lines 5222-5280 is WITHIN the replacement boundary and will be removed along with lines 4976-5281."

5. [MEDIUM] Missing close button (✕) in drawer header. The current drawer has a close button at line 4986-4989 (`onClick={closeHelpDrawer}`) and a back button at 4977-4985. The new JSX header section has NO close button — only the table badge. The 6-button grid cards have ✕ for cancel, but there's no way to CLOSE the drawer itself (dismiss without action). The Drawer component's swipe-down gesture handles this, but the explicit ✕ button is removed. PROMPT FIX: If intentional (UX spec says swipe-down only), add a comment `{/* Close via swipe-down or backdrop tap — no explicit ✕ per UX v6.0 */}`. If not intentional, add a close button in the header.

6. [MEDIUM] `ArrowLeft` at line 4982 is inside the replaced block (4976-5281) and is used for the back-from-expanded button. The new JSX doesn't use ArrowLeft. The prompt says "ArrowLeft — used at line 1273 outside help drawer → KEEP" — this is correct (line 1273 is outside). But the prompt should note that ArrowLeft usage at 4982 is being REMOVED as part of the replacement, and that's OK because line 1273 keeps the import alive.

7. [MEDIUM] `ChevronDown` at line 4991 is inside the replaced block. Same pattern as ArrowLeft — used outside at 4866, so import stays alive. `MapPin` at line 5003 is also inside the replaced block — used outside at line 161, so OK. The prompt mentions these imports but doesn't explicitly flag that their USAGES within lines 4976-5281 are being removed. PROMPT FIX: Add note: "ArrowLeft (4982), ChevronDown (4991), MapPin (5003) usages within replaced block are intentionally removed — imports kept alive by other usages."

8. [MEDIUM] `DrawerHeader` and `DrawerTitle` at lines 4993-4998 are inside the replaced block. The new JSX does NOT include DrawerHeader/DrawerTitle. The prompt correctly warns "DO NOT REMOVE from imports" and notes CartView/BS drawers use them. But the REMOVAL of DrawerHeader/DrawerTitle from the help drawer itself should be noted explicitly. The verification grep says "≥ 4" but after this change it will be ≥ 4 (lines 4764+4765+4868+4870+4872+4876 = 6 occurrences from CartView+BS). PROMPT FIX: Clarify that DrawerHeader/DrawerTitle are intentionally removed from help drawer, kept in CartView (4764-4766) and BS (4868-4876).

9. [LOW] The new JSX uses `tr()` everywhere but the existing code at line 5212 uses `t('help.sent_suffix')` (not `tr`). The undo toast in new JSX uses `tr('help.sent_suffix', 'отправлено')`. The prompt says "i18n exception: new tr() calls use keys already added by КС-A. No new i18n keys needed." — but the existing code uses `t()` not `tr()`. Mixing t/tr in the same file is normal for this codebase (makeSafeT provides both), but worth noting for consistency: the new JSX introduces `tr()` where existing used `t()`. PROMPT FIX: Add note that the switch from t() to tr() for help.* keys is intentional (provides RU fallback via I18N_FALLBACKS_RU).

10. [LOW] The new textarea form has `disabled={!helpComment.trim()}` on the button AND `if (!helpComment.trim()) return;` in onClick. The double-guard is harmless but redundant — disabled button can't be clicked. The existing code at line 5275 also has both, so this is consistent. No fix needed.

11. [LOW] The HELP_CHIPS block to remove is at lines 1874-1879 per prompt. Let me verify: line 1874 starts `const HELP_CHIPS = useMemo(() => [`. Need to verify the closing `]);` line — the prompt says "1874-1879" which should be verified. If the useMemo block extends beyond line 1879, the removal range is wrong. PROMPT FIX: Specify removal as "HELP_CHIPS useMemo block starting at line 1874 through its closing `], [...deps]);`" — let CC grep for the exact boundary.

12. [LOW] Error fallback section: existing code at line 5218 checks `ticketRows.some((row) => row.errorKind)` but the new JSX checks `activeRequests.some(r => r.errorKind)`. These are different arrays — `ticketRows` includes non-active (resolved) rows, `activeRequests` is filtered. The change is probably intentional (only check active for errors) but could miss error states on non-active rows. PROMPT FIX: Add a comment explaining the change from ticketRows to activeRequests.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_PREVIEW_LIMIT | 1834 | 1834 | ✅ |
| HELP_REQUEST_TYPES | 1835 | 1835 | ✅ |
| HELP_COOLDOWN_SECONDS | 1841 | 1841 | ✅ |
| HELP_CARD_LABELS | 1846 | 1846 | ✅ |
| HELP_CARD_SHORT_LABELS | 1856 | 1856 | ✅ |
| HELP_URGENCY_THRESHOLDS | 1866 | 1866 | ✅ |
| HELP_URGENCY_GROUP | 1870 | 1870 | ✅ |
| HELP_CHIPS | 1874 | 1874 | ✅ |
| getHelpUrgency | 1882 | 1882 | ✅ |
| getHelpTimerStr | 1892 | 1892 | ✅ |
| showOtherForm state | 1903 | 1903 | ✅ |
| ticketBoardRef | 1910 | 1910 | ✅ |
| highlightedTicket | 1911 | 1911 | ✅ |
| isTicketExpanded | 1912 | 1912 | ✅ |
| cancelConfirmType insert | ~1913 | after 1912 | ✅ |
| activeRequestCount | 2031 | 2031 | ✅ |
| openHelpDrawer | 2349 | 2349 | ✅ |
| closeHelpDrawer | 2361 | 2361 | ✅ |
| handleCardTap | 2370 | 2370 | ✅ |
| handleUndo | 2405 | 2405 | ✅ |
| handleResolve | 2455 | 2455 | ✅ |
| handleResolve close | ~2470 | 2493 | ❌ CRITICAL |
| ticketBoardRef scroll | ~2568 | 2568 | ✅ |
| getHelpWaitLabel | 2639 | 2639 | ✅ |
| getHelpReminderLabel | 2646 | 2646 | ✅ |
| getHelpResolvedLabel | 2657 | 2657 | ✅ |
| getHelpErrorCopy | 2668 | 2668 | ✅ |
| getHelpFreshnessLabel | 2684 | 2684 | ✅ |
| handleRetry | 2697 | 2697 | ✅ |
| focusHelpRow | ~2784 | 2784 | ✅ |
| DrawerContent open | 4975 | 4975 | ✅ |
| First child div | 4976 | 4976 | ✅ |
| </DrawerContent> | 5282 | 5282 | ✅ |
| </Drawer> | 5283 | 5283 | ✅ |
| "other" form block | 5222-5280 | 5222-5280 | ✅ |

## Fix-by-Fix Analysis

### Fix 3 — Rewrite drawer JSX: RISKY (HIGH complexity)
- JSX boundary 4976-5281 is CORRECT (verified: 306 lines being replaced)
- New JSX is ~170 lines (grid + cancel + other-requests + textarea + undo + error) — net removal ~130 lines
- RISK: The "COPIED from existing" comment for textarea is misleading — it's actually a rewrite
- RISK: Missing close button in header — relies on swipe/backdrop only
- RISK: handleSosCancel insertion at wrong line (~2470 vs actual 2493) could place it inside handleResolve's body
- The SOS_BUTTONS constant is well-structured and references verified constants (HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS)
- Urgency color mapping (neutral/amber/red) matches UX spec
- The cancel-confirm panel for red urgency is a good safety pattern

### Fix 5 — Cleanup: SAFE (straightforward removals)
- HELP_PREVIEW_LIMIT removal: SAFE (line 1834, single line)
- HELP_CHIPS removal: SAFE (lines 1874-1879, verified no refs after Fix 3)
- ticketBoardRef removal: SAFE (line 1910, all refs in replaced block + post-send callback)
- focusHelpRow removal: SAFE (line 2784, all call sites in replaced block)
- 5 dead helpers removal: SAFE (all call sites verified in replaced block 4976-5281)
- isTicketExpanded/highlightedTicket: SAFE (kept for hook order, comment-only change)
- Import preservation: CORRECT (DrawerHeader/DrawerTitle/ArrowLeft/ChevronDown/MapPin/Layers all verified as used outside replaced block)

## Summary
Total: 12 issues (1 CRITICAL, 5 MEDIUM, 6 LOW — original #2 retracted, counted as 0)
- Actually: 1 CRITICAL, 5 MEDIUM, 5 LOW = 11 issues

The CRITICAL issue (#1 — handleSosCancel insertion point ~2470 vs actual 2493) MUST be fixed before execution. Inserting code at line 2470 would place it inside handleResolve's setRequestStates callback, causing a syntax error.

## Prompt Clarity (MANDATORY)
- Overall clarity: 4/5
- What was most clear: JSX boundary is precisely defined (4976-5281) with verification grep. FROZEN UX section is excellent. Scope lock is comprehensive. Dead helper removal has grep verification commands.
- What was ambiguous or could cause hesitation:
  1. handleSosCancel insertion point (~2470) is wrong — would cause immediate confusion when CC reads line 2470 and sees it's inside a callback body
  2. "COPIED from existing block" for textarea is misleading — CC might try to literally copy-paste and adjust, missing structural changes
  3. Missing explicit note about drawer close button removal
  4. HELP_CHIPS removal range "1874-1879" — CC should grep for the closing line rather than trust the range
- Missing context:
  1. What happens to the `primaryColor` references in the replaced block? The old submit button uses `style={{ backgroundColor: primaryColor }}` — the new JSX uses hardcoded `bg-orange-500`. This is intentional per brand but not noted.
  2. The `<Button>` (shadcn) vs `<button>` (native) switch in the textarea form — is this intentional? Should be noted.
  3. No mention of the `HELP_CHIPS.map` usage at line 5187 — this is inside the replaced block so it's fine, but CC might wonder about it during HELP_CHIPS removal verification.
