# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8

## Findings
1. [P2] Duplicate expanded table header remains in hall-mode render path — `staffordersmobile.jsx:2180` still renders the extra `rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2` wrapper inside the expanded area, so an expanded table shows a second badge/zone/chips/collapse block before the real sections. FIX: Remove the third hall-mode instance of that wrapper block and let the expanded content start directly with the section list.
2. [P1] Jump chips still collapse/expand the card instead of scrolling to sections — `renderHallSummaryItem` at `staffordersmobile.jsx:2033` still returns a passive `<span>`, there are 0 `scrollToSection` helpers/refs in the file, and the chips sit inside the clickable header at `staffordersmobile.jsx:2126`. Tapping a chip therefore bubbles into `onToggleExpand` instead of navigating, and the chip still lacks a button-sized touch target. FIX: Add the section refs plus shared `scrollToSection`, render each chip as a button with `e.stopPropagation()`, and give it a 44px tappable target.
3. [P1] Undo toast is still anchored to the last row of an order — `startUndoWindow` at `staffordersmobile.jsx:1862` stores only `orderId`, `handleSingleAction` at `staffordersmobile.jsx:1907` accepts only `order`, and `renderHallRows` at `staffordersmobile.jsx:2059` still uses `isLastOfOrder` to decide where the toast appears. Serving from the first or middle dish row still places the undo toast under the last dish row of that order instead of the row that was tapped. FIX: Thread `rowId` through the action chain, save it in `setUndoToast`, and match `undoToast.rowId` in `renderHallRows` instead of using `isLastOfOrder`.
4. [P2] Close-table blocker reasons are still dead text in hall mode — `closeDisabledReasons.map` at `staffordersmobile.jsx:2206` still renders plain `<p>` elements, and there is 0 `reasonToKind` mapping in the file. Staff can see the blocker messages but cannot tap them to jump to the blocking section. FIX: Map known blocker strings to section kinds and render those items as buttons that call `scrollToSection(kind)`, leaving plain text only for unknown reasons.
5. [P2] Age urgency strip is still missing from hall dish rows — `renderHallRows` at `staffordersmobile.jsx:2059` still uses `className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2`}` with no age-based modifier, and there is 0 `urgencyClass` usage in the file. Older dishes in New, In Progress, and Ready therefore render exactly like fresh ones, so the urgency cue from Fix 5 is absent. FIX: Compute `ageMin` from `row.order?.created_date`, derive amber/red `border-l-4` classes using `overdueMinutes || 10`, and append that class to the row wrapper.

## Summary
Total: 5 findings (0 P0, 2 P1, 3 P2, 0 P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
- Overall clarity: 4
- Ambiguous Fix descriptions (list Fix # and what was unclear): None.
- Missing context (what info would have helped): The page folder contains `StaffOrdersMobile README.md`, not `README.md`; naming the exact file would remove that small lookup ambiguity.
- Scope questions (anything you weren't sure if it's in scope): None.
