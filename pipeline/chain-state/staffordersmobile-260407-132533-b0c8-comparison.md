# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8

## Agreed (both found)

### Fix 1: Remove duplicate inner card in hall-mode expanded area (SOM-S231-01)
- **CC:** P1 — Delete block at lines 2180-2192 (third instance of `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2`). Legacy instances at 584, 1196 untouched. Post-fix grep count=2.
- **Codex:** P2 — Same diagnosis: remove third hall-mode instance, let expanded content start directly with section list.
- **Verdict:** AGREED on fix. Priority: **P1** (visual duplication is confusing for staff, impacts usability). CC's line-level detail is more actionable.

### Fix 2: Jump chips scrollIntoView with stopPropagation (#251, UX #26)
- **CC:** P1 — Add 4 refs + `scrollToSection` callback + attach refs to section wrappers + change `<span>` to `<button>` with `e.stopPropagation()` + add `scrollToSection` to dep array. Notes: hallSummaryItems does NOT include "inProgress" kind (only requests/new/ready), but `inProgressSectionRef` still useful for Fix 4. Recommends against `min-h-[44px]` on individual chips to preserve compact layout.
- **Codex:** P1 — Same fix approach: refs, scrollToSection, button with stopPropagation, 44px touch target.
- **Verdict:** AGREED on fix approach. Use CC's detailed implementation. **Accept CC's recommendation against min-h-[44px] on individual chips** — the flex row provides adequate touch area, and forcing 44px per chip would distort the compact summary layout.

### Fix 3: Toast under clicked row instead of last row (#254, UX #23)
- **CC:** P1 — Thread `rowId` through full call chain: `handleSingleAction(order, rowId)` → `handleOrdersAction([order], rowId)` → `startUndoWindow(orders, rowId)` → `setUndoToast({..., rowId})`. Update `showToast` logic. **CRITICAL insight:** Bulk actions call `handleOrdersAction` without `rowId` → toast would never render. CC proposes fallback: when `undoToast.rowId` is undefined, fall back to `isLastOfOrder`.
- **Codex:** P1 — Same approach: thread rowId, match in renderHallRows. Does NOT mention bulk action edge case.
- **Verdict:** AGREED on fix. **Use CC's fallback approach** — the `isLastOfOrder` fallback for bulk actions is critical to prevent toast from disappearing on "Принять все"/"Выдать все" operations.

### Fix 4: Close table blocker reasons — tappable with scroll (#256, UX #29)
- **CC:** P2 — Define `reasonToKind` mapping, update third instance of `closeDisabledReasons.map` (hall-mode ~line 2206). Unknown reasons stay as `<p>`.
- **Codex:** P2 — Same approach: map blocker strings to kinds, render as buttons, plain text for unknowns.
- **Verdict:** AGREED on fix. Identical approach.

### Fix 5: Age urgency color stripe on dish rows (#255, UX #13)
- **CC:** P2 — Calculate `ageMin` from `row.order?.created_date`, derive amber/red `border-l-4` classes using `overdueMinutes || 10` threshold. Add `overdueMinutes` to dep array. Notes: urgency stripe will also appear on readOnly (served) rows — recommends including by default.
- **Codex:** P2 — Same approach. No additional notes.
- **Verdict:** AGREED on fix. Use CC's implementation with the note about readOnly rows (include by default, adjust later if needed).

## CC Only (Codex missed)

### Fix 3 — Bulk action toast fallback
- CC identified that bulk actions (`handleOrdersAction` called without `rowId`) would result in toast never rendering because `row.id === undefined` is always false.
- CC proposed: `(undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder)` — retain `isLastOfOrder` as fallback.
- **Validity:** SOLID. This is a real regression risk. **ACCEPTED — include in final fix plan.**

### Fix 2 — hallSummaryItems scope note
- CC noted that hallSummaryItems does NOT include "inProgress" kind. The `inProgressSectionRef` is only useful for Fix 4 (close table reasons), not Fix 2 chips.
- **Validity:** Informational only, no code impact. Noted.

### Fix 5 — readOnly rows question
- CC noted that urgency stripes will also appear on served/readOnly rows. Recommends including by default.
- **Validity:** Good UX observation. No code change needed — implement as-is, adjust based on feedback.

## Codex Only (CC missed)

None. Both reviewers found the same 5 issues with no additional out-of-scope findings from either side.

## Disputes (disagree)

### Priority of Fix 1
- CC: P1 (visual duplication confusing for staff)
- Codex: P2 (duplicate header)
- **Resolution:** P1 — the visual duplication is immediately visible and confusing. Staff see two identical headers which wastes vertical space and creates cognitive load.

No code-level disputes. Both reviewers agree on all fix approaches.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Fix 1: Remove duplicate inner card in hall-mode** — Source: AGREED — Delete third instance of `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2` block (~lines 2180-2192). Legacy instances untouched. Post-fix grep count=2.

2. **[P1] Fix 2: Jump chips → scrollIntoView** — Source: AGREED — (A) Add 4 section refs after `ownerHintTimerRef`. (B) Add `scrollToSection` useCallback. (C) Attach refs to section wrappers in hall-mode path. (D) Change `renderHallSummaryItem` from `<span>` to `<button>` with `e.stopPropagation()` + `scrollToSection(item.kind)`. Add `scrollToSection` to dep array. Do NOT add `min-h-[44px]` to individual chips.

3. **[P1] Fix 3: Toast under clicked row** — Source: AGREED + CC enhancement — (A) Update `handleSingleAction` to accept `rowId`. (B) Thread `rowId` through `handleOrdersAction` → `startUndoWindow` → `setUndoToast`. (C) Update button call in `renderHallRows` to pass `row.id`. (D) Update `showToast` logic with fallback: `(undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder)` to preserve bulk action toast.

4. **[P2] Fix 4: Close table blocker reasons — tappable** — Source: AGREED — (A) Define `reasonToKind` mapping. (B) Update third instance of `closeDisabledReasons.map` (hall-mode) to render buttons for known reasons, `<p>` for unknown. Buttons call `scrollToSection(kind)`.

5. **[P2] Fix 5: Age urgency stripe on dish rows** — Source: AGREED — (A) Calculate `ageMin` + `urgencyClass` inside `rows.map()`. (B) Append `${urgencyClass}` to row div className. (C) Add `overdueMinutes` to `renderHallRows` dep array. Include stripes on all rows (including readOnly) by default.

## Summary
- Agreed: 5 items
- CC only: 1 item (1 accepted — bulk action toast fallback, integrated into Fix 3)
- Codex only: 0 items
- Disputes: 1 item (Fix 1 priority P1 vs P2 — resolved as P1)
- **Total fixes to apply: 5**
