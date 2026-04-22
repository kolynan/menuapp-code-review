# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-172909-e9ba

## Issues Found

1. [CRITICAL] DrawerHeader/DrawerTitle removed from help drawer without replacement — The new JSX (Step 6) completely removes the `<DrawerHeader>` and `<DrawerTitle>` that exist at lines 4993-4995 in the current help drawer. The Vaul drawer library (shadcn/ui) may require DrawerHeader/DrawerTitle for accessibility (aria-label, screen readers). The prompt adds a custom header `<div>` with the title text, but does NOT include DrawerHeader/DrawerTitle wrapper. This could cause: (a) accessibility regression, (b) potential Vaul rendering issues if it expects these children. PROMPT FIX: Wrap the new header in `<DrawerHeader className="p-0 border-0"><DrawerTitle className="sr-only">{tr('help.modal_title', 'Нужна помощь?')}</DrawerTitle></DrawerHeader>` or keep a visually-hidden DrawerHeader. Verify the CartView drawer (line 4764) already uses `sr-only` pattern as precedent.

2. [CRITICAL] SOS_BUTTONS defined as module-level constant but uses useMemo-wrapped values — The prompt defines `SOS_BUTTONS` as a plain `const` array (Step 2, "Insert AFTER HELP_URGENCY_GROUP"). However, `HELP_CARD_LABELS` (line 1846) and `HELP_CARD_SHORT_LABELS` (line 1856) are both `useMemo` hooks. If `SOS_BUTTONS` is defined at module level (outside the component), it cannot reference component-scoped useMemo values. If defined inside the component (after the useMemo hooks), it will be recreated on every render. PROMPT FIX: Clarify that SOS_BUTTONS must be defined INSIDE the component function body, AFTER HELP_CARD_LABELS and HELP_CARD_SHORT_LABELS declarations. Alternatively, wrap it in `useMemo` with deps `[HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS]`. The prompt says "module-level constant" for URGENCY_STYLES (Step 2.5 heading) but also says "Insert AFTER HELP_URGENCY_GROUP" which is inside the component — this is contradictory.

3. [MEDIUM] URGENCY_STYLES placement contradiction — Step 2.5 heading says "Add as module-level constant" but the instruction says "Insert AFTER SOS_BUTTONS" which is inside the component body (after useMemo hooks). If truly module-level, it must be OUTSIDE the component function. Since URGENCY_STYLES uses only string literals (no hooks), it CAN be module-level. But then the "Insert AFTER SOS_BUTTONS" instruction would place it inside the component. PROMPT FIX: Choose one: either (a) make URGENCY_STYLES truly module-level (before the component, near other module constants) and remove "AFTER SOS_BUTTONS", or (b) say "component-level constant" not "module-level". Recommend (a) since URGENCY_STYLES has no dynamic deps.

4. [MEDIUM] handleSosCancel inserted after handleResolve but BEFORE handleRetry — Prompt says "Insert AFTER handleResolve definition" (line 2455, closes at ~line 2494). handleRetry is at line 2697, much later. The new JSX grid references both handleSosCancel (for ✕ buttons) and handleRetry (for error tiles). The ordering is fine (both defined before JSX), but handleSosCancel's dependency array includes `getHelpUrgency` which depends on `HELP_URGENCY_GROUP` and `HELP_URGENCY_THRESHOLDS` — both useMemo. This is correct (useCallback after useMemo), no issue. However: handleSosCancel also depends on `handleResolve` which has an EMPTY dependency array `[]` — this means handleResolve captures stale closure. This is a pre-existing issue, not caused by this prompt, but worth noting since handleSosCancel chains to it. PROMPT FIX: Add a NOTE acknowledging handleResolve's empty dep array is pre-existing and intentional (setState uses functional updater pattern).

5. [MEDIUM] showOtherForm condition change — The old code at line 5222 has `{!isTicketExpanded && showOtherForm && (` but the new JSX only checks `{showOtherForm && (`. Since isTicketExpanded is being marked as dead (Fix 5g), this is correct, but the behavior changes: previously the other form only showed when NOT in expanded view. Since the new drawer has no "expanded" concept, this is fine. But if any code path sets isTicketExpanded=true outside the drawer (e.g., post-send callback at line 2566 sets `setIsTicketExpanded(false)` — redundant now), it won't affect new JSX. No fix needed — just noting the semantic change is intentional.

6. [MEDIUM] "other" link visibility condition may be too restrictive — New JSX: `{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (`. This hides "Другой запрос?" if ANY `other` row is active. UX decision: user can only have ONE custom request at a time? The old code allowed multiple `other` rows (Array.isArray check, `other-${Date.now()}` IDs). If user sends "water" as other, then wants to send "napkins" as other — link is hidden. PROMPT FIX: If multiple `other` requests should be supported (as suggested by the array handling in send logic), change condition to always show the link when form is not open: `{!showOtherForm && (`. Or add a NOTE clarifying this is intentional UX: one custom request at a time while any is active.

7. [LOW] pb-safe class availability uncertain — Prompt uses `pb-safe` (scroll wrapper div). It's a safe-area-inset-bottom utility. The prompt notes "If not available in Base44 Tailwind config, it will be silently ignored" — this is correct for unknown utilities (they produce no CSS). But `pb-safe` is NOT a standard Tailwind class — it requires `tailwindcss-safe-area` plugin or custom config. The fallback behavior (no padding) is acceptable. PROMPT FIX: None needed, but could use `pb-4` as a more reliable alternative if safe-area is not critical.

8. [LOW] Undo toast references HELP_CARD_LABELS[undoToast.type] but old code used t('help.sent_suffix') — The new JSX undo toast line: `{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {tr('help.sent_suffix', 'Отправлено')}`. Old code (line 5212): `{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {t('help.sent_suffix')}`. The change from `t()` to `tr()` with fallback is intentional (i18n exception noted in prompt). Consistent. No issue.

9. [LOW] Line count estimate may be off — Prompt says "expected ~5350 ± 100" and replacing ~305 old lines with ~180 new + removing ~90 dead helpers. Let me verify: old JSX lines 4976-5281 = 306 lines. New JSX in prompt ≈ 175 lines. 7 dead helpers (lines 2631-2695) = ~65 lines. HELP_CHIPS (1874-1880) = 7 lines. HELP_PREVIEW_LIMIT = 1 line. ticketBoardRef = 1 line + 3 post-send lines. focusHelpRow block ≈ 8 lines. handleRemind block ≈ 40 lines. Total removed ≈ 306 + 65 + 7 + 1 + 4 + 8 + 40 = 431. Total added ≈ 175 + handleSosCancel(12) + cancelConfirmTarget(1) + SOS_BUTTONS(9) + URGENCY_STYLES(5) + activeRequestCount change(0 net) + resets(2) = ~204. Net change: 5457 - 431 + 204 = ~5230. This is BELOW the prompt's lower bound of 5250 (5350-100). PROMPT FIX: Adjust expected range to ~5230 ± 100, and set abort threshold to < 5050.

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
| showOtherForm useState | ~1903 | 1903 | ✅ |
| ticketBoardRef | 1910 | 1910 | ✅ |
| activeRequestCount | 2031 | 2031 | ✅ |
| nonOtherTypes | 2215 | 2215 | ✅ |
| openHelpDrawer | 2349 | 2349 | ✅ |
| closeHelpDrawer | 2361 | 2361 | ✅ |
| handleCardTap | 2370 | 2370 | ✅ |
| handleUndo | 2405 | 2405 | ✅ |
| handleRemind | 2412 | 2412 | ✅ |
| handleResolve | ~2493 (prompt) | 2455 | ⚠️ Prompt says "line ~2493" in FROZEN UX but actual definition is 2455. The "~2493" likely refers to the closing `}, [];` at ~2494. Minor ambiguity but Step 3 uses grep so no impact. |
| getHelpReminderWord | 2631 | 2631 | ✅ |
| getMinutesAgo | 2635 | 2635 | ✅ |
| getHelpWaitLabel | 2639 | 2639 | ✅ |
| getHelpReminderLabel | 2646 | 2646 | ✅ |
| getHelpResolvedLabel | 2657 | 2657 | ✅ |
| getHelpErrorCopy | 2668 | 2668 | ✅ |
| getHelpFreshnessLabel | 2684 | 2684 | ✅ |
| handleRetry | 2697 | 2697 | ✅ |
| Drawer open tag | 4974 | 4974 | ✅ |
| DrawerContent opening | 4975 | 4975 | ✅ |
| First child div | 4976 | 4976 | ✅ |
| </DrawerContent> (3rd) | 5282 | 5282 | ✅ |
| Bell icon badge | ~4965 | 4965 | ✅ |

## Fix-by-Fix Analysis

### Fix 3 — Rewrite drawer JSX: RISKY (high)
- Largest single edit: replacing ~306 lines with ~175 lines of new JSX
- Good: uses grep-based anchoring for boundary detection instead of hardcoded line numbers
- Good: preflight step copies RELEASE → x.jsx to ensure clean state
- Risk: DrawerHeader/DrawerTitle accessibility regression (Issue #1)
- Risk: SOS_BUTTONS placement ambiguity — could fail if treated as module-level (Issue #2)
- Risk: Line count estimate may trigger false abort (Issue #9)
- The JSX itself is well-structured: uses existing helpers correctly, tr() with fallbacks, proper event handling

### Fix 3 Step 1 (cancelConfirmTarget state): SAFE
- Simple useState addition. Object type `{type, rowId}` is clearly documented.

### Fix 3 Step 2 (SOS_BUTTONS): RISKY (medium)
- References useMemo values — cannot be truly module-level (Issue #2)

### Fix 3 Step 2.5 (URGENCY_STYLES): SAFE
- Pure string literals, no deps. Placement instruction just needs clarity (Issue #3)

### Fix 3 Step 3 (handleSosCancel): SAFE
- Correct deps array, proper useCallback pattern, guard for missing row

### Fix 3 Step 4 (activeRequestCount): SAFE
- Simple filter addition, well-justified (exclude legacy `menu`)

### Fix 3 Step 5 (state resets): SAFE
- Adding setCancelConfirmTarget(null) to open/close — standard pattern

### Fix 3 Step 6 (JSX replacement): RISKY (high)
- Main risk is the boundary detection. Prompt is clear about start (4976) and end (before 5282).
- The JSX code is well-written and references verified variables/functions.

### Fix 5 — Cleanup dead code: SAFE (with proper ordering)
- All deletions are clearly scoped and verified against actual code
- Each symbol's call sites are only within the replaced JSX block
- handleRetry preservation is explicitly called out — good
- DrawerHeader/DrawerTitle import preservation is correctly noted
- Fix 5g (comment dead hooks) correctly preserves hook order

### Fix 5e (7 dead helpers): SAFE
- All 7 helpers verified: call sites only in old JSX (lines 5021-5067) and each other
- handleRetry at 2697 correctly excluded

### Fix 5f (handleRemind): SAFE
- Only call site at line 5086 is in old JSX being replaced

## Summary
Total: 9 issues (2 CRITICAL, 4 MEDIUM, 3 LOW)
Prompt clarity rating: 4/5

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: 4/5
- What was most clear: Line numbers are extremely accurate (verified 30+ references, all correct). The grep-based approach for insertions reduces line-number brittleness. Fix ordering (Fix 3 before Fix 5) is well-explained with rationale. FROZEN UX section is comprehensive. The "other" request flow logic is faithfully preserved from original code.
- What was ambiguous or could cause hesitation:
  1. SOS_BUTTONS placement — "module-level" vs "after HELP_URGENCY_GROUP" (which is inside component) creates confusion about scope
  2. URGENCY_STYLES "module-level constant" heading vs "after SOS_BUTTONS" instruction
  3. Whether DrawerHeader/DrawerTitle should be preserved for a11y (the 2 other DrawerContent blocks both have it)
  4. The line count estimate 5350±100 appears ~120 lines too high based on arithmetic
- Missing context:
  1. No mention of what happens to DrawerHeader/DrawerTitle from old help drawer — explicit "these are intentionally removed because..." or "keep sr-only version" would help
  2. The "other" request link hiding logic (one-at-a-time vs multiple) could use an explicit UX note
