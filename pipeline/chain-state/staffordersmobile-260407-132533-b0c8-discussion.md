# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8
Mode: CC-Only (v2)

## Result
No unresolved disputes found. The Comparator identified 1 minor dispute (Fix 1 priority: CC=P1 vs Codex=P2) and resolved it as P1 with clear reasoning. All 5 fix approaches are fully agreed between CC and Codex. No code-level disagreements exist.

## Disputes Analyzed
Total: 0 actionable disputes from Comparator (1 priority dispute was already resolved inline)

### Priority Dispute: Fix 1 (P1 vs P2) — Already Resolved
**CC Position:** P1 — visual duplication confusing for staff, wastes vertical space
**Codex Position:** P2 — duplicate header
**Comparator Resolution:** P1 — agreed with CC reasoning (cognitive load, wasted space)
**CC-Only Verification:** Comparator's resolution is correct. A duplicate header inside an expanded card is immediately visible to every waiter on every table interaction — this is a usability issue (P1), not merely cosmetic (P2).

## Updated Fix Plan
No changes needed — the Comparator's Final Fix Plan stands as-is. All 5 fixes proceed with agreed approaches:

1. **[P1] Fix 1: Remove duplicate inner card in hall-mode** — Source: AGREED — Delete third instance of `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2` block (~lines 2180-2192). Legacy instances untouched. Post-fix grep count=2.

2. **[P1] Fix 2: Jump chips → scrollIntoView** — Source: AGREED — (A) Add 4 section refs after `ownerHintTimerRef`. (B) Add `scrollToSection` useCallback. (C) Attach refs to section wrappers in hall-mode path. (D) Change `renderHallSummaryItem` from `<span>` to `<button>` with `e.stopPropagation()` + `scrollToSection(item.kind)`. Add `scrollToSection` to dep array. Do NOT add `min-h-[44px]` to individual chips.

3. **[P1] Fix 3: Toast under clicked row** — Source: AGREED + CC enhancement — (A) Update `handleSingleAction` to accept `rowId`. (B) Thread `rowId` through `handleOrdersAction` → `startUndoWindow` → `setUndoToast`. (C) Update button call in `renderHallRows` to pass `row.id`. (D) Update `showToast` logic with fallback: `(undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder)` to preserve bulk action toast.

4. **[P2] Fix 4: Close table blocker reasons — tappable** — Source: AGREED — (A) Define `reasonToKind` mapping. (B) Update third instance of `closeDisabledReasons.map` (hall-mode) to render buttons for known reasons, `<p>` for unknown. Buttons call `scrollToSection(kind)`.

5. **[P2] Fix 5: Age urgency stripe on dish rows** — Source: AGREED — (A) Calculate `ageMin` + `urgencyClass` inside `rows.map()`. (B) Append `${urgencyClass}` to row div className. (C) Add `overdueMinutes` to `renderHallRows` dep array. Include stripes on all rows (including readOnly) by default.

## Skipped (for Arman)
None. All fixes are safe to proceed.
