# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260409-125104-6b36

## Issues Found

1. [CRITICAL] POST-IMPLEMENTATION CHECK uses wrong variable name `cancelConfirmTarget` — The checklist says: `cancelConfirmTarget exists in state + handleSosCancel + JSX confirm panel`. But the code everywhere in the prompt uses `cancelConfirmType` (state, handleSosCancel, JSX). If the executor checks for `cancelConfirmTarget` via grep, it will return 0 matches and they may think something is broken. PROMPT FIX: Change `cancelConfirmTarget` → `cancelConfirmType` in the POST-IMPLEMENTATION CHECKS section.

2. [CRITICAL] handleSosCancel missing dependency `setCancelConfirmType` — The useCallback for `handleSosCancel` calls `setCancelConfirmType(type)` but the dependency array is `[activeRequests, getHelpUrgency, handleResolve]`. React setState setters from `useState` are stable and don't technically need to be in deps, BUT `getHelpUrgency` is listed (it's a useCallback). For consistency and ESLint compliance in this codebase, `setCancelConfirmType` should NOT be needed. However, the bigger issue is: the `handleResolve` call inside `handleSosCancel` uses `handleResolve(type, type === 'other' ? activeRow.id : undefined)` — but for the 6 fixed-type buttons, `type !== 'other'` always, so `otherId` is always `undefined`. This is correct. BUT — the NOTE at the bottom says: "`other` requests cancel immediately (no red-confirm panel)." Yet the `handleSosCancel` function is used via `handleSosCancel(btn.id)` which only runs for the 6 SOS_BUTTONS — `other` rows have a direct `handleResolve('other', row.id)` call. This is consistent. No actual bug here — false alarm on this sub-point. The deps array is technically correct (React guarantees useState setters are stable). PROMPT FIX: None needed for deps — but add a brief note that `setCancelConfirmType` is omitted from deps because useState setters are identity-stable.

3. [MEDIUM] STEP 1 says insert cancelConfirmType "~line 1913, after showOtherForm" — But showOtherForm is at line 1903. Line 1913 is a blank line after isTicketExpanded (1912). The instruction says "after showOtherForm" which is misleading — it's actually after the whole block of help-drawer state vars. The line number (~1913) is correct for placement, but the text reference is wrong. PROMPT FIX: Change "after showOtherForm" to "after isTicketExpanded state block" or "at line ~1913, in the blank line after the help-drawer state declarations".

4. [MEDIUM] STEP 2 says "AFTER HELP_URGENCY_GROUP (from Fix 1, ends ~line 1879)" — HELP_URGENCY_GROUP ends at line 1873. Line 1874-1880 is HELP_CHIPS. SOS_BUTTONS should go AFTER HELP_CHIPS (which will be removed in Fix 5), or more precisely after getHelpTimerStr (line ~1898). Inserting at line 1879 puts it INSIDE HELP_CHIPS block. The prompt should specify: insert AFTER the HELP_CHIPS block (line 1880) or after getHelpTimerStr. In practice, since Fix 5 removes HELP_CHIPS, the executor should insert SOS_BUTTONS after line 1873 (end of HELP_URGENCY_GROUP). But wait — Fix 5 says to apply AFTER Fix 3. So at Fix 3 time, HELP_CHIPS still exists. PROMPT FIX: Clarify: "Insert AFTER the `], [tr]);` closing of HELP_CHIPS (line 1880), before getHelpUrgency (line 1882). When Fix 5 later removes HELP_CHIPS, SOS_BUTTONS will naturally sit after HELP_URGENCY_GROUP."

5. [MEDIUM] STEP 2.5 URGENCY_STYLES placement conflict — STEP 2 says insert SOS_BUTTONS after HELP_URGENCY_GROUP (~line 1879). STEP 2.5 says insert URGENCY_STYLES "AFTER SOS_BUTTONS". But STEP 2.5 also says "inside the component body BEFORE `return (`". Both SOS_BUTTONS and URGENCY_STYLES are being placed in the hooks/constants region (~lines 1870-1900), which is far before the return statement. The instruction "BEFORE return" is technically correct but misleadingly broad — it could make the executor think they need to put URGENCY_STYLES just above the return. PROMPT FIX: Change to "Insert immediately AFTER SOS_BUTTONS definition (the line after its closing `]);`)." Remove the vague "BEFORE return" phrasing.

6. [MEDIUM] JSX replacement boundary says "line 5281 inclusive" but line 5281 has a comment — Line 5281 is `{/* cardActionModal removed — replaced by ticket board + smart redirect (Fix 1B) */}`. This comment is part of the old code being removed — that's fine. But the prompt says "</DrawerContent> at line 5282" which is confirmed correct. The replacement should DELETE lines 4976-5281 inclusive and insert the new JSX. This is correct. No fix needed.

7. [MEDIUM] `t()` vs `tr()` inconsistency in new JSX — The existing file uses BOTH `t()` (115 uses) and `tr()` (72 uses). The new JSX uses `tr()` throughout for help.* keys, which matches the existing help drawer pattern. However, the undo toast label uses `HELP_CARD_LABELS[undoToast.type]` — these labels are defined using `tr()` in the HELP_CARD_LABELS useMemo. This is consistent. No fix needed — just noting the analysis.

8. [LOW] wc -l RELEASE says 5459 but actual file has 5457 lines — The prompt says "5459 lines" in Prerequisites. Actual `wc -l` returns 5457. STEP 0 says verify `wc -l x.jsx` → "must be 5458 (±1 for newline normalization)". The ±1 tolerance would allow 5457-5459, so 5457 is within range. But the stated base (5458) doesn't match either the prompt header (5459) or actual (5457). PROMPT FIX: Correct to "must be 5457 (±1 for newline normalization)" for precision, or keep as-is given the tolerance covers it.

9. [LOW] Expected post-fix line count ~5260 ± 100 — The prompt replaces ~306 lines (4976-5281) with ~195 lines of new JSX (net -111), removes HELP_PREVIEW_LIMIT (1 line), HELP_CHIPS (7 lines), ticketBoardRef (1 line), 3 lines from post-send callback, focusHelpRow (~8 lines), 5 dead helpers (~50 lines). Adds: cancelConfirmType state (1 line), SOS_BUTTONS useMemo (~9 lines), URGENCY_STYLES (~5 lines), handleSosCancel (~10 lines), auto-clear useEffect (~5 lines), 2 comment lines for kept state, setCancelConfirmType resets (2 lines). Net: 5457 - 111 - 1 - 7 - 1 - 3 - 8 - 50 + 1 + 9 + 5 + 10 + 5 + 2 + 2 = ~5310. The estimate of ~5260 ± 100 covers 5160-5360, which includes 5310. This is reasonable. No fix needed.

10. [LOW] Confirm panel onClick handler calls `handleResolve(cancelConfirmType)` without otherId — For the 6 SOS button types (non-other), this is correct — handleResolve uses the type directly. The `other` type never reaches the cancel-confirm panel (it cancels immediately per the NOTE). So this is safe. No fix needed.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_REQUEST_TYPES | line 1835 | 1835 | ✅ |
| HELP_CARD_LABELS | line 1846 | 1846 | ✅ |
| HELP_CARD_SHORT_LABELS | line 1856 | 1856 | ✅ |
| HELP_COOLDOWN_SECONDS | line 1841 | 1841 | ✅ |
| HELP_URGENCY_THRESHOLDS | line 1866 | 1866 | ✅ |
| HELP_URGENCY_GROUP | line 1870 | 1870 | ✅ |
| HELP_CHIPS | line 1874 | 1874 | ✅ |
| HELP_PREVIEW_LIMIT | line 1834 | 1834 | ✅ |
| getHelpUrgency | line 1882 | 1882 | ✅ |
| getHelpTimerStr | line 1892 | 1892 | ✅ |
| showOtherForm state | "after showOtherForm" | 1903 | ⚠️ Misleading (see #3) |
| cancelConfirmType insertion | ~line 1913 | 1913 (blank) | ✅ |
| ticketBoardRef | line 1910 | 1910 | ✅ |
| highlightedTicket | line 1911 | 1911 | ✅ |
| isTicketExpanded | line 1912 | 1912 | ✅ |
| nonOtherTypes | line 2216 | 2215 | ⚠️ Off by 1 (non-blocking) |
| activeRequestCount | line 2031 | 2031 | ✅ |
| openHelpDrawer | line ~2349 | 2349 | ✅ |
| closeHelpDrawer | line ~2361 | 2361 | ✅ |
| handleResolve = useCallback | line ~2455 | 2455 | ✅ |
| handleResolve closing | ~line 2493 | 2493 | ✅ |
| post-send ticketBoardRef | ~line 2568 | 2568 | ✅ |
| setHighlightedTicket post-send | ~line 2569 | 2569 | ✅ |
| setTimeout highlightedTicket | ~line 2570 | 2570 | ✅ |
| focusHelpRow | ~line 2784 | 2784 | ✅ |
| DrawerContent (Help) | line 4975 | 4975 | ✅ |
| First child after DrawerContent | line 4976 | 4976 | ✅ |
| </DrawerContent> (Help) | line 5282 | 5282 | ✅ |
| Drawer open tag | line 4974 | 4974 | ✅ |
| DrawerContent occurrences | 4 total | 4763, 4858, 4975, 5319 | ✅ |
| File line count | 5459 | 5457 | ⚠️ Off by 2 (within tolerance) |

## Fix-by-Fix Analysis

**Fix 3 — STEP 0 (Preflight normalize):** SAFE — cp from RELEASE + diff check first. Good safety net.

**Fix 3 — STEP 1 (cancelConfirmType state):** SAFE — simple useState addition at a blank line. No ordering issues.

**Fix 3 — STEP 2 (SOS_BUTTONS):** SAFE with caveat — insertion point description is slightly off (says "after HELP_URGENCY_GROUP" but HELP_CHIPS is between them). useMemo is correct approach. The array structure is clean.

**Fix 3 — STEP 2.5 (URGENCY_STYLES):** SAFE — static object, no deps. Placement instructions could be clearer.

**Fix 3 — STEP 3 (handleSosCancel):** SAFE — clean useCallback. Deps array is correct. Logic for red-urgency confirm is sound.

**Fix 3 — STEP 3.5 (auto-clear useEffect):** SAFE — defensive cleanup. Correct dependency array.

**Fix 3 — STEP 4 (activeRequestCount filter):** SAFE — filters out legacy `menu` type. Simple and correct.

**Fix 3 — STEP 5 (state resets):** SAFE — adding one line to existing callbacks. No risk.

**Fix 3 — STEP 6 (JSX replacement):** RISKY — This is the largest change (~306 lines replaced with ~195). The boundary is well-defined (4976-5281). Key risk: the executor must ensure the exact boundary is used, not accidentally deleting </DrawerContent> or </Drawer>. The prompt has good verification greps. The `other` form textarea block is complex — it's copied from existing code with style changes + maxLength change. Risk of copy errors in the undo/send logic.

**Fix 5 — HELP_CHIPS/HELP_PREVIEW_LIMIT removal:** SAFE — all usage sites verified as being inside removed code.

**Fix 5 — State comments (keep for hook order):** SAFE — minimal change, important for React hook ordering.

**Fix 5 — ticketBoardRef removal:** SAFE — 3 specific lines identified correctly at 2568-2570. Keep lines at 2566-2567 clearly stated.

**Fix 5 — focusHelpRow removal:** SAFE — definition at 2784, single function with no external callers after JSX replacement.

**Fix 5 — Dead helpers removal:** RISKY (mild) — 5 helpers to remove by name. The prompt says "do NOT touch handleRetry" which is critical since handleRetry is used. Risk: executor might accidentally remove too much. The grep verification at the end catches this.

## Summary
Total: 10 issues (1 CRITICAL, 4 MEDIUM, 5 LOW — 2 of the LOW are informational/no-fix-needed)
Actionable issues: 1 CRITICAL, 3 MEDIUM requiring prompt text changes

## Prompt Clarity (MANDATORY)
- Overall clarity: 4/5
- What was most clear: JSX replacement boundary is excellently defined with exact line numbers, grep verification commands, and clear keep/replace markers. FROZEN UX section is comprehensive. Fix ordering (3 before 5) is explicitly stated. Dead code removal is well-justified with call-site analysis.
- What was ambiguous or could cause hesitation: (1) The `cancelConfirmTarget` typo in POST-IMPLEMENTATION CHECKS will confuse the executor. (2) SOS_BUTTONS insertion point says "after HELP_URGENCY_GROUP" but HELP_CHIPS sits between them — executor may hesitate about where exactly to insert. (3) URGENCY_STYLES placement has conflicting guidance ("after SOS_BUTTONS" vs "before return").
- Missing context: None significant — the prompt is thorough. Minor: could explicitly state that `Layers` import already exists (line 49) so no new import is needed for the napkins button.
