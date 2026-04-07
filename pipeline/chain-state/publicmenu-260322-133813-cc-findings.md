# CC Writer Findings — PublicMenu
Chain: publicmenu-260322-133813
Task: #87 KS-2 — Replace ✕ with chevron ˅ in all bottom sheets

## Findings

1. [P2] CartView close button uses X icon instead of ChevronDown (line ~494) — The cart drawer header has `<X className="w-5 h-5" />` as the close/collapse button. Per UX decision #87-KS2, all bottom sheet close buttons should use ChevronDown (˅) instead of X (✕) for softer emotional tone. FIX: Replace `<X className="w-5 h-5" />` with `<ChevronDown className="w-6 h-6" />` at CartView.jsx line 494. The `ChevronDown` import already exists at line 2.

2. [P2] CartView close button tap zone too small (line ~492) — Current close button has `p-2 rounded-full` which gives ~36px total (20px icon + 8px padding each side). Minimum required tap zone is 44×44px per mobile UX spec. FIX: Change the button className to use `w-11 h-11 flex items-center justify-center rounded-full` (44×44px wrapper). Replace `p-2` with explicit 44px dimensions.

3. [P2] CartView header not sticky during scroll (line ~441) — The task specifies: "for the cart drawer (long content, scrollable): the header row with 🔔 notification + ˅ chevron should be sticky at the top during scroll." Currently the header div at line 441 (`<div className="bg-white rounded-lg shadow-sm border p-3 mb-4">`) is not sticky. The drawer content scrolls inside `<div className="overflow-y-auto max-h-[calc(85vh-2rem)]">` (x.jsx line 3315), so the header scrolls away with content. FIX: Make the cart header sticky by adding `sticky top-0 z-10` to the header div className at CartView.jsx line 441. Change from `"bg-white rounded-lg shadow-sm border p-3 mb-4"` to `"sticky top-0 z-10 bg-white rounded-lg shadow-sm border p-3 mb-4"`.

4. [P3] CartView header comment outdated (line ~440) — Comment says `{/* P0 Header: [🔔] Стол · Гость [✕] */}` but after this fix the icon will be ˅ not ✕. FIX: Update comment to `{/* P0 Header: [🔔] Стол · Гость [˅] */}`.

5. [P3] CartView comment referencing ✕ outdated (line ~1050) — Comment says `{/* Add more link - removed, use ✕ to close */}`. After this fix the close icon is ˅. FIX: Update comment to `{/* Add more link - removed, use ˅ to close */}`.

6. [P2] CartView.jsx imports unused XIcon (line ~2) — After replacing X→ChevronDown, the `X` import is still needed (used at line 494), but `XIcon` (also imported at line 2) is not used anywhere in CartView.jsx — grep confirms no `XIcon` usage in the file. FIX: Remove `XIcon` from the import statement at line 2. (Note: this was pre-existing, not introduced by this task — flagging as info only, P3 downgrade appropriate).

### Out-of-scope observations (NOT findings, just notes):

- **CartView.jsx line 474**: The `✕` text character used as cancel button for inline guest name editing is NOT a bottom sheet close button — it's a form cancel action. Per scope lock, do not change.
- **x.jsx Table Confirmation BS (lines 3391-3493)**: This bottom sheet does NOT have a ✕/X close button. It has a drag handle bar (line 3407), a primary CTA "Подтвердить и отправить", and a secondary "Не тот стол? Изменить" link. The Drawer's `onOpenChange` handles closing via swipe/overlay tap. No chevron needed here since there's no explicit close button to replace. However, per the task "Apply to ALL bottom sheet instances" — consider whether a ˅ chevron should be ADDED. My assessment: the table confirmation BS is a short, focused BS with a clear CTA flow, and adding a chevron would clutter it. The drag handle provides sufficient close affordance. No change recommended.
- **x.jsx HelpModal (line 3507-3519)**: This is a modal, not a bottom sheet. Out of scope.
- **x.jsx XCircle icons (lines 833, 1011, 1040)**: These are status indicators (cancelled order icon), not close buttons. Out of scope.

## Summary
Total: 6 findings (0 P0, 0 P1, 3 P2, 3 P3)

The core change is straightforward: replace the X icon with ChevronDown in CartView.jsx's header close button (finding 1), ensure 44px tap zone (finding 2), and make the header sticky for scrollable cart content (finding 3). The table confirmation BS in x.jsx has no close button to replace.

**x.jsx changes needed: NONE** — The cart drawer in x.jsx delegates its UI to CartView.jsx. The table confirmation BS has no X button. No changes to x.jsx are required for this task.

**CartView.jsx changes needed: YES** — Findings 1-5 all apply to CartView.jsx.

## Prompt Clarity
- Overall clarity: 4/5
- Ambiguous Fix descriptions: Fix 1 says "Apply to ALL bottom sheet instances in x.jsx and CartView.jsx" but x.jsx's table confirmation BS has no close button to replace. Task could have noted this explicitly to avoid reviewer spending time investigating.
- Missing context: Would have been helpful to know that the table confirmation BS intentionally has no close button (only drag handle + CTA).
- Scope questions: The ✕ text character at CartView.jsx line 474 (name editing cancel) could be ambiguous — it's a ✕ character but not a BS close button. Correctly excluded per scope lock ("ТОЛЬКО иконки закрытия/сворачивания bottom sheet").
