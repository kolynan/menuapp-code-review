# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-195008-3a21

## Issues Found

1. **[CRITICAL] SOS_BUTTONS is a plain const that recreates every render — should be useMemo**

   `SOS_BUTTONS` references `HELP_CARD_LABELS` and `HELP_CARD_SHORT_LABELS` (both `useMemo` hooks). As a plain `const`, it creates a new array on every render, defeating the memoization. Any component or callback that uses `SOS_BUTTONS` in a dependency array will see a new reference each time. More importantly: `SOS_BUTTONS.map()` in JSX will recreate all button elements unnecessarily every render.

   PROMPT FIX: Wrap SOS_BUTTONS in `useMemo` with deps on HELP_CARD_LABELS and HELP_CARD_SHORT_LABELS.

   REWRITTEN SECTION (Step 2):
   ```js
   const SOS_BUTTONS = useMemo(() => [
     { id: 'call_waiter', emoji: '🙋', label: HELP_CARD_LABELS.call_waiter, shortLabel: HELP_CARD_SHORT_LABELS.call_waiter },
     { id: 'bill', emoji: '🧾', label: HELP_CARD_LABELS.bill, shortLabel: HELP_CARD_SHORT_LABELS.bill },
     { id: 'plate', emoji: '🍽️', label: HELP_CARD_LABELS.plate, shortLabel: HELP_CARD_SHORT_LABELS.plate },
     { id: 'napkins', icon: 'layers', label: HELP_CARD_LABELS.napkins, shortLabel: HELP_CARD_SHORT_LABELS.napkins },
     { id: 'utensils', emoji: '🍴', label: HELP_CARD_LABELS.utensils, shortLabel: HELP_CARD_SHORT_LABELS.utensils },
     { id: 'clear_table', emoji: '🗑️', label: HELP_CARD_LABELS.clear_table, shortLabel: HELP_CARD_SHORT_LABELS.clear_table },
   ], [HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS]);
   ```

2. **[CRITICAL] HELP_PREVIEW_LIMIT has 3 additional usages beyond line 1834 — Fix 5a deletion will break code**

   The prompt says "DELETE entire line" at 1834, but `HELP_PREVIEW_LIMIT` is used at:
   - Line 2786: `setIsTicketExpanded(rowIndex >= HELP_PREVIEW_LIMIT);`
   - Line 5020: `activeRequests.slice(0, HELP_PREVIEW_LIMIT)` / `ticketRows.slice(0, HELP_PREVIEW_LIMIT)`
   - Line 5112: `activeRequestCount > HELP_PREVIEW_LIMIT`

   Lines 5020 and 5112 are INSIDE the old JSX being replaced by Fix 3 — so they will be gone. But **line 2786 is in `focusHelpRow`** which Fix 5d deletes. So the deletion IS safe IF Fix 3 and Fix 5d happen first. However, the prompt doesn't explicitly call this out — an executor might delete line 1834 first (Fix 5a) before Fix 3 replaces the JSX, causing a temporary broken state. The prompt should note: "Safe to delete ONLY because all 3 remaining references are inside code also being deleted (JSX replacement + focusHelpRow)."

   PROMPT FIX: Add verification note to Fix 5a.

   REWRITTEN SECTION (Fix 5a):
   ```
   ### 5a. Remove HELP_PREVIEW_LIMIT
   `const HELP_PREVIEW_LIMIT = 2;` at line 1834. DELETE entire line.
   ⚠️ Verification: remaining 3 usages (line 2786 in focusHelpRow, lines 5020+5112 in old JSX) are all inside code being deleted by Fix 3 (JSX) and Fix 5d (focusHelpRow). Safe to delete.
   ```

3. **[MEDIUM] ticketBoardRef cleanup (5c) — prompt says "DELETE 3 lines" but the post-send callback has more context**

   At lines 2568-2570, the prompt says delete 3 lines (scrollIntoView, setHighlightedTicket, setTimeout) and KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)`. Looking at the actual code (lines 2566-2571):
   ```
   setIsTicketExpanded(false);
   setShowOtherForm(false);
   ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   setHighlightedTicket(action.rowId || action.type);
   setTimeout(() => setHighlightedTicket((prev) => (prev === (action.rowId || action.type) ? null : prev)), 1500);
   ```
   The instructions are correct — delete lines 2568-2570, keep 2566-2567. But `setHighlightedTicket` is being kept as "dead state" in 5g. After deletion, `setHighlightedTicket` at line 2569 won't exist — but since `highlightedTicket` state hook is kept (5g), the setter still exists. This is fine.

   However, there's also `ticketBoardRef` at line 2788 inside `focusHelpRow`, and at line 5008 in old JSX. Both are covered by other deletions (5d and Fix 3). **No issue** — just noting for completeness.

   PROMPT FIX: Clarify exact line numbers for the 3 lines to delete.

   REWRITTEN SECTION (Fix 5c, second bullet):
   ```
   - In post-send callback (grep `ticketBoardRef.current`): DELETE exactly these 3 lines (~2568-2570):
     - `ticketBoardRef.current?.scrollIntoView(...)` (line 2568)
     - `setHighlightedTicket(action.rowId || action.type);` (line 2569)
     - `setTimeout(() => setHighlightedTicket(...), 1500);` (line 2570)
     KEEP the 2 lines above them: `setIsTicketExpanded(false)` and `setShowOtherForm(false)`.
   ```

4. **[MEDIUM] JSX replacement boundary description has confusing "Lines 5000+ are siblings" note**

   The prompt says: "Lines 5000+ are siblings inside DrawerContent, not children of the first div." This is technically describing the DOM structure but could confuse the executor about WHAT to replace. The actual instruction is clear: replace everything from line 4976 through line 5281 (before `</DrawerContent>` at 5282). The sibling note is unnecessary and potentially confusing.

   PROMPT FIX: Remove the confusing sibling note, keep the clear boundary.

   REWRITTEN SECTION (JSX Replacement Boundary):
   ```
   ### JSX Replacement Boundary (VERIFIED with RELEASE 260408-01)
   Keep: `<Drawer open={isHelpModalOpen}` tag (line 4974).
   Keep: `<DrawerContent>` opening tag (line 4975): className="max-h-[85vh] rounded-t-2xl flex flex-col". **D7 rule: do NOT add `relative` to DrawerContent**.
   REPLACE: ALL children INSIDE `<DrawerContent>`:
   - **Start**: line 4976 (first child `<div className="relative">`)
   - **End**: line 5281 inclusive (comment line, just before `</DrawerContent>`)
   - This is approximately 306 lines of old JSX → replaced with ~195 lines of new grid.
   Keep: `</DrawerContent>` at line 5282 and `</Drawer>` at line 5283 — do NOT replace these.
   ```

5. **[MEDIUM] `URGENCY_STYLES` note says "NOT module-level — it must be near SOS_BUTTONS which depends on component-scope HELP_CARD_LABELS" — but URGENCY_STYLES itself does NOT depend on HELP_CARD_LABELS**

   `URGENCY_STYLES` is a plain object of static Tailwind class strings. It has zero dependencies on any hooks, props, or component state. It COULD be module-level. The prompt's reasoning is wrong: SOS_BUTTONS depends on HELP_CARD_LABELS, but URGENCY_STYLES does not. Placing it component-scope means it recreates every render (unless wrapped in useMemo).

   This is LOW risk since it's a small static object, but the stated reason is misleading. If the executor questions it, they might waste time.

   PROMPT FIX: Either (a) move URGENCY_STYLES to module-level (ideal — static object, no deps), or (b) keep component-scope but fix the reasoning: "component-scope for code locality near SOS_BUTTONS, not because of dependencies."

   REWRITTEN SECTION (URGENCY_STYLES note):
   ```
   ## URGENCY_STYLES — Add as component-scope constant (STEP 2.5)
   Insert AFTER SOS_BUTTONS (from Step 2), inside the component body BEFORE `return (`.
   Component-scope for code locality (grouped with SOS_BUTTONS), though it has no hook dependencies:
   ```

6. **[MEDIUM] `handleSosCancel` dep array includes `getHelpUrgency` — this is a useCallback, so it's valid, but the prompt should note this is a callback ref**

   `handleSosCancel` has `[activeRequests, getHelpUrgency, handleResolve]` in its deps. `getHelpUrgency` is `useCallback` (line 1882) with deps `[HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]` — both are stable useMemo. `handleResolve` has `[], []` deps (empty). `activeRequests` is derived state that changes on every request update. This is correct — no issue with stale closures. **No change needed.**

7. **[MEDIUM] Textarea "other" form — business logic comment claims "ALL business logic preserved" but there's a subtle change: `maxLength 100→120`**

   The prompt explicitly notes this change (`maxLength 100→120`) but doesn't explain WHY. If the original had 100 as a deliberate limit (matching backend validation), increasing to 120 could cause backend rejections. 

   PROMPT FIX: Add rationale for maxLength change, or verify backend accepts 120.

   REWRITTEN SECTION (textarea form comment):
   ```
   {/* Textarea form for "other" request — REWRITE of existing block (lines 5222-5280) with new styling.
       ALL business logic preserved from original: undo logic, setRequestStates, Array.isArray check,
       pendingQuickSendRef, handlePresetSelect call, cancel button logic.
       Changes: <Button> (shadcn) → <button> (native), primaryColor → bg-orange-500,
       maxLength 100→120 (ServiceRequest.create message field has no backend length limit — 120 is UX preference),
       add autoFocus, new placeholder/counter. */}
   ```

8. **[LOW] File line count expected "~5370 ± 100" — let me verify the math**

   Old JSX: lines 4976-5281 = 306 lines removed.
   New JSX: ~195 lines added (grid + other rows + textarea + undo + error).
   Dead code removed (Fix 5): HELP_PREVIEW_LIMIT (1), HELP_CHIPS (7), ticketBoardRef (1+3=4), focusHelpRow (~5), 7 helpers (~60 lines est.), handleRemind (~40 lines est.) ≈ 117 lines removed.
   New code added: cancelConfirmTarget state (1), SOS_BUTTONS (~8), URGENCY_STYLES (~5), handleSosCancel (~12), activeRequestCount change (net 0) ≈ 26 lines added.
   
   Net: 5457 - 306 + 195 - 117 + 26 = 5255. The prompt says "~5370 ± 100" which gives range 5270-5470. My estimate of 5255 is slightly below the lower bound. The "< 5150 → ABORT" threshold seems safe.

   PROMPT FIX: Adjust expected line count to "~5270 ± 100" to be more accurate, or keep as-is since the ABORT threshold at 5150 is safe.

9. **[LOW] "Другой запрос?" link visibility — condition checks `!activeRequests.some(r => r.type === 'other')` — hides link when ANY other request exists**

   This means once a user sends one "other" request, they can never send another via the link. The textarea only appears for new requests. But the prompt's `showOtherForm` state is separate, so: tap link → form appears → submit → form closes → link reappears? No: the submitted request makes `activeRequests.some(r => r.type === 'other')` true, hiding the link. The user can't submit a SECOND "other" request while one is active. This seems intentional per UX design but is worth calling out.

   PROMPT FIX: None needed if this is intentional. Add a brief comment: "Link hidden while any 'other' request is active — user must cancel/resolve existing before submitting new."

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_PREVIEW_LIMIT | 1834 | 1834 | ✅ |
| HELP_CARD_LABELS | 1846 | 1846 | ✅ |
| HELP_CARD_SHORT_LABELS | 1856 | 1856 | ✅ |
| HELP_COOLDOWN_SECONDS | 1841 | 1841 | ✅ |
| HELP_URGENCY_THRESHOLDS | 1866 | 1866 | ✅ |
| HELP_URGENCY_GROUP | 1870 | 1870 | ✅ |
| HELP_CHIPS | 1874-1880 | 1874-1880 | ✅ |
| getHelpUrgency | 1882 | 1882 | ✅ |
| getHelpTimerStr | 1892 | 1892 | ✅ |
| ticketBoardRef | 1910 | 1910 | ✅ |
| highlightedTicket | — | 1911 | ✅ |
| isTicketExpanded | — | 1912 | ✅ |
| showOtherForm | — | 1903 | ✅ |
| activeRequestCount | ~2031 | 2031 | ✅ |
| nonOtherTypes | 2215 | 2215 | ✅ |
| openHelpDrawer | 2349 | 2349 | ✅ |
| closeHelpDrawer | 2361 | 2361 | ✅ |
| handleCardTap | 2370 | — (not verified, FROZEN) | — |
| handleRemind | — | 2412 | ✅ |
| handleResolve | — | 2455 | ✅ |
| handleResolve closing | — | 2493 `}, []);` | ✅ |
| getHelpReminderWord | 2631 | 2631 | ✅ |
| getMinutesAgo | 2635 | 2635 | ✅ |
| getHelpWaitLabel | 2639 | 2639 | ✅ |
| getHelpReminderLabel | 2646 | 2646 | ✅ |
| getHelpResolvedLabel | 2657 | 2657 | ✅ |
| getHelpErrorCopy | 2668 | 2668 | ✅ |
| getHelpFreshnessLabel | 2684 | 2684 | ✅ |
| handleRetry | 2697 | 2697 | ✅ |
| focusHelpRow | — | 2784 | ✅ |
| Drawer open tag | 4974 | 4974 | ✅ |
| DrawerContent open | 4975 | 4975 | ✅ |
| JSX start (relative div) | 4976 | 4976 | ✅ |
| JSX end / </DrawerContent> | 5282 | 5282 | ✅ |
| Bell icon badge | ~4965 | 4965 | ✅ |
| DrawerContent count | 4 | 4 | ✅ |
| Total file lines | 5458 | 5457 | ✅ (off by 1, trailing newline) |

## Fix-by-Fix Analysis

| Fix | Verdict | Reason |
|-----|---------|--------|
| Fix 3 Step 0 (preflight) | SAFE | diff check + cp + wc verification. Solid. |
| Fix 3 Step 1 (cancelConfirmTarget state) | SAFE | Simple useState addition after showOtherForm. Object type noted. |
| Fix 3 Step 2 (SOS_BUTTONS) | RISKY | Plain const recreates every render. Should be useMemo. See issue #1. |
| Fix 3 Step 2.5 (URGENCY_STYLES) | SAFE | Static object, correct placement. Minor: misleading reasoning about deps. |
| Fix 3 Step 3 (handleSosCancel) | SAFE | Correct insertion point, valid deps, proper urgency check logic. |
| Fix 3 Step 4 (activeRequestCount filter) | SAFE | Minimal change, correct `.filter()` to exclude legacy `menu`. |
| Fix 3 Step 5 (state resets) | SAFE | Adding one `setCancelConfirmTarget(null)` to existing reset blocks. |
| Fix 3 Step 6 (JSX replacement) | SAFE | Well-defined boundaries (4976-5281), verified. New JSX is comprehensive. |
| Fix 5a (HELP_PREVIEW_LIMIT) | SAFE | All usages covered by Fix 3 + Fix 5d. But needs clarification note. |
| Fix 5b (HELP_CHIPS) | SAFE | Block 1874-1880 verified. Only used in old JSX (5187). |
| Fix 5c (ticketBoardRef) | SAFE | 3 deletion sites all covered by Fix 3/5d. |
| Fix 5d (focusHelpRow) | SAFE | Only call site at 5147 is in old JSX. |
| Fix 5e (7 dead helpers) | SAFE | Grep-verify instruction included. All call sites in old JSX or mutual. |
| Fix 5f (handleRemind) | SAFE | Only call site at 5086 is in old JSX. |
| Fix 5g (comment dead hooks) | SAFE | Preserves hook order. Correct approach. |
| Fix 5h (import notes) | SAFE | Correct — all imports used elsewhere. |

## Summary
Total: 9 issues (2 CRITICAL, 5 MEDIUM, 2 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY — do NOT skip)
- **Overall clarity: 4/5** — Excellent structure, verified line numbers, clear boundaries, comprehensive verification steps. The order dependency (Fix 3 → Fix 5) is well-communicated. The SCOPE LOCK and FROZEN UX sections are thorough.
- **What was most clear:** JSX replacement boundaries (exact lines, grep verification), dead code identification with grep-verify safety nets, cancelConfirmTarget as object type callout, the Step 0 preflight process.
- **What was ambiguous or could cause hesitation:** (1) SOS_BUTTONS as plain const vs useMemo — executor may question if this is intentional or oversight. (2) "Lines 5000+ are siblings inside DrawerContent" adds confusion. (3) URGENCY_STYLES reasoning about "depends on component-scope HELP_CARD_LABELS" is factually wrong.
- **Missing context:** (1) No rationale for maxLength 100→120 change. (2) No explicit note that HELP_PREVIEW_LIMIT's 3 remaining usages are all covered by other deletions. (3) Expected line count ~5370 may be slightly optimistic — ~5260-5280 more likely.
