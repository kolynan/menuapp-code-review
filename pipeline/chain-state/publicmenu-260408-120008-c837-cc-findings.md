# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-120008-c837

## Issues Found

1. [CRITICAL] handleSosCancel insertion point line number is wrong — Prompt says "Insert AFTER handleResolve ~line 2470" but handleResolve actually ends at line 2493 (`}, []);`). A `useEffect` starts at line 2495. Inserting handleSosCancel at the wrong place could split a useCallback or land inside a useEffect. **PROMPT FIX:** Change "Insert AFTER that useCallback block closes (line ~2470)" → "Insert AFTER handleResolve closes at line 2493 (`}, []);`), BEFORE the `useEffect` at line 2495."

2. [CRITICAL] SOS_BUTTONS insertion line conflict with HELP_CHIPS — Prompt says "Insert SOS_BUTTONS AFTER HELP_URGENCY_GROUP (ends ~line 1879)". HELP_URGENCY_GROUP actually ends at line 1873. HELP_CHIPS starts at line 1874. Fix 5 removes HELP_CHIPS (lines 1874-1880). If cc-writer applies Fix 3 Step 2 BEFORE Fix 5, SOS_BUTTONS would be inserted between HELP_URGENCY_GROUP (1873) and HELP_CHIPS (1874), creating duplication until Fix 5 removes HELP_CHIPS. If Fix 5 runs first, HELP_CHIPS is gone and insertion is clean. **PROMPT FIX:** Explicitly state execution order: "Apply Fix 5 HELP_CHIPS removal FIRST, then insert SOS_BUTTONS after HELP_URGENCY_GROUP (line 1873)." Or change to: "REPLACE the HELP_CHIPS block (lines 1874-1880) with SOS_BUTTONS."

3. [CRITICAL] handleSosCancel dependency array includes `getHelpUrgency` but getHelpUrgency is defined at line 1882 — far before handleSosCancel would be at ~2493. This is fine positionally (both are hooks in same scope), BUT the dependency `getHelpUrgency` is a useCallback that only depends on HELP_URGENCY_GROUP and HELP_URGENCY_THRESHOLDS (both stable useMemo). This is correct. However, `handleResolve` in the deps is `useCallback(... , [])` (empty deps) — so it's stable. The real issue: `activeRequests` is in deps but `activeRequests` changes every render cycle (from useMemo). This will cause handleSosCancel to re-create frequently. Not a crash, but may cause stale closures if other callbacks capture it. **PROMPT FIX:** Consider wrapping with `useCallback` that uses a ref for activeRequests, OR document that frequent re-creation is acceptable here.

4. [MEDIUM] SOS_BUTTONS defined as `const` (not useMemo) references HELP_CARD_LABELS and HELP_CARD_SHORT_LABELS — Both are `useMemo` hooks. A plain `const SOS_BUTTONS = [...]` at module level would capture stale refs. The prompt places it after HELP_URGENCY_GROUP (inside component body), so it recalculates each render, which is correct but wasteful. **PROMPT FIX:** Either wrap in `useMemo` with `[HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS]` deps, or add a comment confirming intentional re-creation each render. A `useMemo` would be more idiomatic alongside existing patterns.

5. [MEDIUM] Textarea "other" form JSX uses `helpComment` for undo logic — The prompt's STEP 6 textarea onClick handler does `setHelpComment(msg)` inside the setTimeout (line: `setHelpComment(msg);`). This is the SAME `helpComment` state used by the textarea `value={helpComment}`. After the form closes (`setShowOtherForm(false)`), 5s later `setHelpComment(msg)` fires — setting helpComment to the message again. If user reopens the "other" form before 5s, they'll see the old text briefly overwritten. Current code (lines 5222-5280) likely has the same pattern, but worth noting as a potential UX glitch. **PROMPT FIX:** Add comment acknowledging this is inherited behavior from existing code, so cc-writer doesn't try to "fix" it.

6. [MEDIUM] `</DrawerContent>` boundary verification grep will show only 2 results — The prompt says "grep `</DrawerContent>` → must show line ~5282 (third occurrence)". But grep treats this file as binary (UTF-8 mojibake bytes remain). `grep -n "</DrawerContent>" x.jsx` only shows lines 4840 and 4951 + "Binary file matches". The third occurrence at 5282 is hidden. **PROMPT FIX:** Use `grep -na "</DrawerContent>" pages/PublicMenu/x.jsx` (force text mode with `-a`) to guarantee all 3 occurrences are shown. Or use `sed -n '5282p'` for direct check.

7. [MEDIUM] HELP_URGENCY_GROUP end line claimed as ~1879, actually 1873 — The prompt says "HELP_URGENCY_GROUP (from Fix 1, ends ~line 1879)". In reality, HELP_URGENCY_GROUP is lines 1870-1873 (4 lines). Line 1874 is HELP_CHIPS. This ~6 line discrepancy could confuse cc-writer's insertion point. **PROMPT FIX:** Change "ends ~line 1879" → "ends line 1873".

8. [LOW] `napkins` button uses `icon: 'layers'` but rendered as `<Layers>` component — The SOS_BUTTONS array has `{ id: 'napkins', icon: 'layers', ... }`. The JSX checks `btn.icon === 'layers'` to render `<Layers>`. This works, but the pattern is inconsistent — 5 buttons use `emoji` property, 1 uses `icon`. Minor: if any future button needs a different icon, the check would need expansion. Not a bug. **PROMPT FIX:** None needed, just noting the pattern.

9. [LOW] Post-send callback cleanup (Step in Fix 5) — Prompt says "remove `ticketBoardRef.current?.scrollIntoView(...)`, `setHighlightedTicket(...)`, `setTimeout(() => setHighlightedTicket(...))`. KEEP `setIsTicketExpanded(false)` and `setShowOtherForm(false)`." Lines 2568-2571 show exactly these calls. Clear and correct. But the prompt doesn't mention KEEPING the `setHelpComment('')` at line 2563. **PROMPT FIX:** Explicitly add "KEEP `setHelpComment('')`" to the list of preserved statements to prevent accidental removal.

## Line Number Verification

| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| HELP_PREVIEW_LIMIT | line 1834 | 1834 | ✅ |
| HELP_CARD_LABELS | line 1846 | 1846 | ✅ |
| HELP_CARD_SHORT_LABELS | line 1856 | 1856 | ✅ |
| HELP_COOLDOWN_SECONDS | line 1841 | 1841 | ✅ |
| HELP_URGENCY_THRESHOLDS | line 1866 | 1866 | ✅ |
| HELP_URGENCY_GROUP | line 1870 | 1870 | ✅ |
| HELP_URGENCY_GROUP end | ~1879 | 1873 | ❌ off by 6 |
| HELP_CHIPS | line 1874-1879 | 1874-1880 | ⚠️ close (ends 1880 not 1879) |
| getHelpUrgency | line 1882 | 1882 | ✅ |
| getHelpTimerStr | line 1892 | 1892 | ✅ |
| showOtherForm state | line 1903 (implicit) | 1903 | ✅ |
| ticketBoardRef | line 1910 | 1910 | ✅ |
| highlightedTicket | line 1911 | 1911 | ✅ |
| isTicketExpanded | line 1912 | 1912 | ✅ |
| cancelConfirmType insertion | ~line 1913 | after 1912 ✅ | ✅ |
| activeRequestCount | line 2031 | 2031 | ✅ |
| nonOtherTypes | line 2216 | 2215 | ⚠️ off by 1 |
| openHelpDrawer | line ~2349 | 2349 | ✅ |
| closeHelpDrawer | line ~2361 | 2361 | ✅ |
| handleCardTap | line 2370 | 2370 | ✅ |
| handleResolve | line ~2455 | 2455 | ✅ |
| handleResolve end (insertion) | ~2470 | 2493 | ❌ off by 23 |
| post-send callback | ~line 2568 | 2568 | ✅ |
| getHelpWaitLabel | line 2639 | 2639 | ✅ |
| getHelpReminderLabel | line 2646 | 2646 | ✅ |
| getHelpResolvedLabel | line 2657 | 2657 | ✅ |
| getHelpErrorCopy | line 2668 | 2668 | ✅ |
| getHelpFreshnessLabel | line 2684 | 2684 | ✅ |
| handleRetry | line 2697 (implicit keep) | 2697 | ✅ |
| focusHelpRow | line ~2784 | 2784 | ✅ |
| Drawer open tag | line 4974 | 4974 | ✅ |
| DrawerContent open | line 4975 | 4975 | ✅ |
| First child div.relative | line 4976 | 4976 | ✅ |
| "other" form block | lines 5222-5280 | 5222-5279 | ⚠️ end off by 1 |
| </DrawerContent> | line 5282 | 5282 | ✅ |
| </Drawer> | line 5283 | 5283 | ✅ |
| CartView DrawerHeader | line 4764-4766 | 4764-4766 | ✅ |
| BS DrawerHeader | line 4868-4876 | 4868-4876 | ✅ |
| ArrowLeft outside help | line 1273 | 1273 | ✅ |
| ChevronDown outside help | line 4866 | 4866 | ✅ |
| MapPin outside help | line 161 | 161 | ✅ |
| Layers import | line 49 | 49 | ✅ |

## Fix-by-Fix Analysis

### Fix 3 — Rewrite drawer JSX
- **STEP 1** (cancelConfirmType state): **SAFE** — simple useState addition after existing state.
- **STEP 2** (SOS_BUTTONS): **RISKY** — insertion point line number ~1879 is wrong (actual: 1873). Overlaps with HELP_CHIPS removal in Fix 5. Execution order matters.
- **STEP 3** (handleSosCancel): **RISKY** — insertion point ~2470 is wrong (actual: 2493). Could land inside wrong block. The dependency array is correct but line guidance is misleading.
- **STEP 4** (activeRequestCount fix): **SAFE** — clear target, correct line, simple filter addition.
- **STEP 5** (state resets): **SAFE** — adding one line to two clear locations.
- **STEP 6** (JSX replacement): **SAFE** — boundaries verified (4976-5281). Large replacement but well-defined. The JSX is complete and self-contained. Uses `tr()` consistently (matching file pattern). All referenced variables exist.

### Fix 5 — Cleanup
- **HELP_CHIPS/HELP_PREVIEW_LIMIT removal**: **SAFE** — verified no remaining refs after Fix 3.
- **State comments**: **SAFE** — hook order preserved.
- **ticketBoardRef removal**: **SAFE** — only used in replaced JSX + post-send callback.
- **focusHelpRow removal**: **SAFE** — all call sites in replaced block.
- **5 dead helpers removal**: **SAFE** — all call sites verified in replaced block.
- **Import safety**: **SAFE** — prompt correctly identifies imports used elsewhere.

## Summary
Total: 9 issues (3 CRITICAL, 3 MEDIUM, 3 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY)
- Overall clarity: 4/5
- What was most clear: JSX replacement boundary (4976-5281) is precisely defined with verification greps. The FROZEN UX section is comprehensive. The import safety analysis is thorough. Fix 5 cleanup targets are well-documented with verification commands. The "other" textarea form explicitly marks what to copy vs change.
- What was ambiguous or could cause hesitation:
  - handleResolve end line (~2470 vs actual 2493) — cc-writer may search wrong area
  - HELP_URGENCY_GROUP end (~1879 vs actual 1873) — SOS_BUTTONS insertion point unclear
  - Execution order between Fix 3 Step 2 (add SOS_BUTTONS) and Fix 5 (remove HELP_CHIPS) not specified — they occupy adjacent lines
  - SOS_BUTTONS as plain `const` vs `useMemo` inconsistent with surrounding patterns
- Missing context:
  - Explicit execution order: "Apply Fix 5 removals first, then Fix 3 additions" or vice versa
  - `helpComment` state behavior during undo timeout (inherited quirk, should note)
  - `setHelpComment('')` in post-send callback should be listed in KEEP items (Fix 5)
  - Binary file grep issue — recommend `-a` flag for all verification greps
