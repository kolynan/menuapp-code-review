# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-180348-1407

## Issues Found

1. [CRITICAL] SOS_BUTTONS placement vs URGENCY_STYLES "module-level" contradiction — The prompt says `SOS_BUTTONS` goes "AFTER HELP_URGENCY_GROUP" (line ~1870, inside component scope) since it references `HELP_CARD_LABELS`/`HELP_CARD_SHORT_LABELS` (useMemo hooks). But URGENCY_STYLES says "Add as module-level constant (STEP 2.5) — Insert AFTER SOS_BUTTONS". If URGENCY_STYLES is module-level, it can't go "AFTER SOS_BUTTONS" which is component-scoped. CC/Codex may place URGENCY_STYLES outside the component (where it works fine as pure strings) but then it won't be "AFTER SOS_BUTTONS". Or they may place it inside the component ignoring "module-level". PROMPT FIX: Clarify that URGENCY_STYLES is a **module-level** constant (BEFORE the component function), and SOS_BUTTONS is a **component-scoped** const (inside the component, after HELP_URGENCY_GROUP). Remove "Insert AFTER SOS_BUTTONS" from URGENCY_STYLES — instead say "Insert BEFORE the component function definition" or "Insert at module level near other style constants".

2. [CRITICAL] handleSosCancel dependency array includes `getHelpUrgency` as direct reference — The prompt shows `handleSosCancel = useCallback(... , [activeRequests, getHelpUrgency, handleResolve])`. However, inside the callback body `getHelpUrgency` is called as `getHelpUrgency(type, activeRow.sentAt)`. The `activeRequests` dependency is correct (used for `.find()`). `getHelpUrgency` is a `useCallback` (line 1882) so it's a stable reference — OK. BUT: `activeRequests` changes on every state update, causing `handleSosCancel` to recreate on every request change. This isn't a bug per se, but combined with passing `handleSosCancel` to onClick handlers in the grid, it means all grid buttons re-render whenever any request changes. PROMPT FIX: Not a blocking issue — note it as intentional for simplicity, or wrap grid items in `React.memo` (out of scope). No prompt change needed, but add a comment `// Re-creates when activeRequests change — acceptable for 6 buttons`.

3. [MEDIUM] Missing DrawerHeader/DrawerTitle in new JSX — The old drawer JSX includes `<DrawerHeader>` + `<DrawerTitle>` (lines 4993-4998) which provide accessibility (screen reader) structure. The new JSX replaces them with plain `<div>` + `<span>`. Vaul (the drawer library) may show console warnings or have a11y issues without DrawerHeader/DrawerTitle. PROMPT FIX: Add `<DrawerHeader className="sr-only"><DrawerTitle>{tr('help.modal_title', 'Нужна помощь?')}</DrawerTitle></DrawerHeader>` as first child inside DrawerContent (before the drag handle pill), matching the CartView pattern at line 4764-4766.

4. [MEDIUM] URGENCY_STYLES not in SCOPE LOCK section — The SCOPE LOCK lists all allowed changes but doesn't mention URGENCY_STYLES as an ADD. It lists SOS_BUTTONS and handleSosCancel but not URGENCY_STYLES. CC/Codex scope-checkers may flag this as out-of-scope. PROMPT FIX: Add `- URGENCY_STYLES (ADD — module-level constant)` to SCOPE LOCK.

5. [MEDIUM] Fix 5e says 7 dead helpers but Step 3 handleSosCancel could mask one — The prompt says delete `getHelpFreshnessLabel` (line 2684). Its only usage at line 5021 is inside the replacement zone — SAFE. But verify: does `getHelpFreshnessLabel` appear in any interval/timer callback outside the replaced JSX? Checked: NO, only at 5021. SAFE. However, the prompt should add: "Verify each helper's ONLY call sites are within lines 4976-5281 before deleting." PROMPT FIX: Add verification instruction: `grep -n "getHelpReminderWord\|getMinutesAgo\|..." x.jsx` — confirm all matches are either definition or within 4976-5281 range.

6. [MEDIUM] `pb-safe` Tailwind class may not exist — The scroll wrapper uses `pb-safe` which is a Tailwind plugin class (safe-area-inset). The prompt acknowledges "If not available... silently ignored" but Base44 may strip unknown classes or throw build errors. PROMPT FIX: Replace `pb-safe` with `pb-4` (always works) or `pb-[env(safe-area-inset-bottom,16px)]` (arbitrary value that degrades gracefully). The current mitigation note is insufficient.

7. [LOW] Step numbering gaps — Steps go 0→1→2→2.5→3→4→5→6 but within Fix 3 description it's STEP 0→STEP 1→STEP 2→STEP 2.5→STEP 3→STEP 4→STEP 5→STEP 6. The main JSX replacement (STEP 6) is confusingly both the biggest change and named "STEP 6" within "Fix 3". Meanwhile "Fix 5" has sub-steps 5a-5h. The step numbering could confuse the executor about ordering. PROMPT FIX: Renumber clearly: Fix 3 Steps 3.0 through 3.6, Fix 5 Steps 5a-5h. Or use a flat numbering: Step 1-12.

8. [LOW] handleRetry reference in new JSX uses `activeRow` variable — In the error-state grid tile: `onClick={() => handleRetry(activeRow)}`. `activeRow` is correctly in scope (defined 3 lines above as `const activeRow = activeRequests.find(...)`). No issue, just confirming.

9. [LOW] `cancelConfirmTarget` type hint could be clearer — The prompt says `cancelConfirmTarget` is `{ type, rowId }` but `handleSosCancel` constructs it as `{ type, rowId: activeRow.id || type }`. When `activeRow.id` is falsy (unlikely but possible for non-other types), `rowId` becomes the type string. The cancel confirm handler destructures `{ type: cType, rowId: cRowId }` and uses `cRowId` only for `other` type, so this edge case is benign. No prompt fix needed.

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_REQUEST_TYPES | 1835 | 1835 | ✅ |
| HELP_PREVIEW_LIMIT | 1834 | 1834 | ✅ |
| HELP_COOLDOWN_SECONDS | 1841 | 1841 | ✅ |
| HELP_CARD_LABELS | 1846 | 1846 | ✅ |
| HELP_CARD_SHORT_LABELS | 1856 | 1856 | ✅ |
| HELP_URGENCY_THRESHOLDS | 1866 | 1866 | ✅ |
| HELP_URGENCY_GROUP | 1870 | 1870 | ✅ |
| HELP_CHIPS | 1874 | 1874 | ✅ |
| getHelpUrgency | 1882 | 1882 | ✅ |
| getHelpTimerStr | 1892 | 1892 | ✅ |
| ticketBoardRef | 1910 | 1910 | ✅ |
| nonOtherTypes | 2215 | 2215 | ✅ |
| activeRequestCount | ~2031 | 2031 | ✅ |
| openHelpDrawer | 2349 | 2349 | ✅ |
| closeHelpDrawer | 2361 | 2361 | ✅ |
| handleRemind | ~2411 | 2412 | ✅ (off by 1, comment at 2411) |
| handleResolve | 2455 | 2455 | ✅ |
| handleResolve closing | ~2493 | 2493 `}, []);` | ✅ |
| getHelpReminderWord | 2631 | 2631 | ✅ |
| getMinutesAgo | 2635 | 2635 | ✅ |
| getHelpWaitLabel | 2639 | 2639 | ✅ |
| getHelpReminderLabel | 2646 | 2646 | ✅ |
| getHelpResolvedLabel | 2657 | 2657 | ✅ |
| getHelpErrorCopy | 2668 | 2668 | ✅ |
| getHelpFreshnessLabel | 2684 | 2684 | ✅ |
| handleRetry | 2697 | 2697 | ✅ |
| focusHelpRow | 2784 | 2784 | ✅ |
| Drawer open=isHelpModalOpen | 4974 | 4974 | ✅ |
| DrawerContent | 4975 | 4975 | ✅ |
| First child div.relative | 4976 | 4976 | ✅ |
| </DrawerContent> (3rd) | 5282 | 5282 | ✅ |
| </Drawer> | 5283 | 5283 | ✅ |
| Bell icon badge | ~4965 | 4965 | ✅ |
| handleRemind call in JSX | ~5086 | 5086 | ✅ |
| focusHelpRow call in JSX | ~5147 | 5147 | ✅ |
| HELP_CHIPS.map in JSX | ~5187 | 5187 | ✅ |
| Other form block | 5222-5280 | 5222-5280 | ✅ |
| File line count | 5457 | 5457 | ✅ |

All 35 line number references verified ✅. Exceptional prompt accuracy.

## Fix-by-Fix Analysis

### Fix 3 — Rewrite drawer JSX
**RISKY (medium)** — Replaces ~305 lines with ~180 lines of new JSX. The boundary markers are correct (4976-5281). Key risks:
- Missing `<DrawerHeader>` a11y wrapper (Issue #3)
- URGENCY_STYLES placement ambiguity (Issue #1)
- `pb-safe` unknown class (Issue #6)
- Textarea "other" form logic is faithfully copied from original — business logic preserved ✅
- All referenced variables (`handleCardTap`, `handleUndo`, `handleRetry`, `handleResolve`, `activeRequests`, `getHelpUrgency`, `getHelpTimerStr`, `undoToast`, `showOtherForm`, `helpComment`, `helpSubmitError`, `currentTable`, `activeRequestCount`, `tr`, `setRequestStates`, `pendingQuickSendRef`, `handlePresetSelect`, `setPendingHelpActionTick`, `currentTableIdRef`, `currentTableId`, `setUndoToast`, `setShowOtherForm`, `setHelpComment`) — ALL verified to exist in the file ✅
- `Layers` icon import exists (line 49) ✅

### Fix 5a — Remove HELP_PREVIEW_LIMIT
**SAFE** — Single line deletion. Usages at 2786 and 5020 are within the replaced JSX zone (5020) or in focusHelpRow (2786, also deleted in 5d). ✅

### Fix 5b — Remove HELP_CHIPS
**SAFE** — Block deletion (1874-1880). Only usage at 5187 is within replaced JSX. ✅

### Fix 5c — Remove ticketBoardRef + post-send refs
**SAFE** — ticketBoardRef usages at 2568 and 2788 (inside focusHelpRow, also deleted) and 5008 (inside replaced JSX). ✅

### Fix 5d — Remove focusHelpRow
**SAFE** — Only call at 5147 is within replaced JSX. ✅

### Fix 5e — Remove 7 dead helpers
**SAFE** — All 7 helpers verified: their call sites are either within 4976-5281 (replaced) or in each other. Cross-checked each:
- `getHelpReminderWord` → called only by `getHelpReminderLabel`
- `getMinutesAgo` → called by `getHelpWaitLabel` + `getHelpReminderLabel`
- `getHelpWaitLabel` → called at 5067 (in replaced zone)
- `getHelpReminderLabel` → called at 5030 (in replaced zone)
- `getHelpResolvedLabel` → called at 5058 (in replaced zone)
- `getHelpErrorCopy` → called at 5031 (in replaced zone)
- `getHelpFreshnessLabel` → called at 5021 (in replaced zone) ✅

### Fix 5f — Remove handleRemind
**SAFE** — Only call at 5086 is within replaced JSX. Definition at 2412. ✅
Note: BUT `HELP_PREVIEW_LIMIT` is also referenced at line 2786 inside `focusHelpRow`. Since Fix 5d deletes `focusHelpRow`, this is transitively safe. Prompt should note this dependency explicitly.

### Fix 5g — Comment dead state hooks
**SAFE** — Adding comments only, preserves hook order. ✅

### Fix 5h — Import notes
**SAFE** — Correctly identifies that DrawerHeader, DrawerTitle, ArrowLeft, ChevronDown, MapPin all have usages outside the help drawer. Verified:
- ArrowLeft: line 1273 ✅
- ChevronDown: lines 4866, 5339 ✅
- MapPin: line 161 ✅
- DrawerHeader/DrawerTitle: lines 4764-4766, 4868-4876, 5320 ✅

## Summary
Total: 9 issues (2 CRITICAL, 4 MEDIUM, 3 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 4/5
- What was most clear: Line numbers are exceptionally accurate (35/35 verified). Fix ordering (Fix 3 FIRST, then Fix 5) is well-explained. SCOPE LOCK is comprehensive. Business logic in textarea is faithfully preserved. FROZEN UX section is thorough. POST-IMPLEMENTATION CHECKS with grep commands are excellent.
- What was ambiguous or could cause hesitation:
  1. URGENCY_STYLES says "module-level" but "Insert AFTER SOS_BUTTONS" (which is component-scoped) — contradictory placement.
  2. Missing DrawerHeader/DrawerTitle for a11y — the old JSX had them, new JSX drops them silently.
  3. `pb-safe` class existence not guaranteed — the "silent ignore" assumption may not hold in Base44's build.
- Missing context:
  1. Whether the old `<DrawerHeader>`/`<DrawerTitle>` at lines 4993-4998 should be preserved for a11y.
  2. Whether `HELP_PREVIEW_LIMIT` reference at line 2786 (inside focusHelpRow) is safe to leave dangling before Fix 5d runs — prompt should state Fix 5 order: 5d before 5a.
