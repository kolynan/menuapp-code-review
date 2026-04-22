# CC Writer Findings — PublicMenu
Chain: publicmenu-260325-131945-c028

## Findings

### Fix 1 — #150: Redesign help drawer — one-tap quick action cards

1. **[P2] Help drawer uses multi-step select→textarea→submit flow instead of one-tap cards** (lines 3687–3737) — The entire help drawer content (lines 3687–3737) needs to be replaced with a new one-tap card layout. Currently: 4 preset buttons in a 2×2 grid that only SELECT a type, a textarea always visible, and two action buttons (Отмена + Отправить). This must become: 4 quick-action cards with emoji + label in a 2×2 grid that IMMEDIATELY submit on tap (no textarea, no confirm), plus a 5th "Другое" card (col-span-2) that expands a textarea+submit inline.

   **FIX:** Replace lines 3687–3737 with:
   - New state: `const [helpQuickSent, setHelpQuickSent] = useState(false)` — add near other help-related state declarations (~line 1648 area, inside the main component).
   - 4 quick-action card definitions array:
     ```jsx
     const helpQuickActions = [
       { id: 'call_waiter', emoji: '🙋', label: t('help.call_waiter', 'Позвать официанта') },
       { id: 'bill', emoji: '🧾', label: t('help.bill', 'Принести счёт') },
       { id: 'napkins', emoji: '🗒️', label: t('help.napkins', 'Салфетки') },
       { id: 'menu', emoji: '📄', label: t('help.menu', 'Бумажное меню') },
     ];
     ```
   - Success state rendering when `helpQuickSent` is true:
     ```jsx
     {helpQuickSent ? (
       <div className="flex flex-col items-center justify-center py-8 gap-2">
         <span className="text-4xl">✅</span>
         <p className="text-lg font-semibold text-slate-900">{t('help.quick_sent_title', 'Запрос отправлен!')}</p>
         <p className="text-sm text-slate-500">{t('help.quick_sent_desc', 'Официант скоро подойдёт')}</p>
       </div>
     ) : ( /* cards grid */ )}
     ```
   - 2×2 grid of quick-action cards: each card calls `submitHelpRequest(opt.id)` immediately on tap; while `isSendingHelp`, show `Loader2` spinner on the tapped card and `disabled` + `opacity-50` on all others.
   - "Другое" card (col-span-2, flex-row with emoji left): on tap sets `selectedHelpType` to `'other'` (does NOT send). Below the grid, conditionally render textarea + "Отправить" button when `selectedHelpType === 'other'`.
   - Card styling per spec: `rounded-xl border border-slate-200 bg-white min-h-[80px] flex flex-col items-center justify-center gap-1`, emoji `text-2xl`, label `text-sm font-medium text-slate-700 text-center`.
   - Remove the standalone "Отмена" button (line 3724) and the always-visible textarea section (lines 3709–3718).
   - Auto-close after success: `setTimeout(() => { closeHelpDrawer(); setHelpQuickSent(false); }, 2000)`.

2. **[P1] `submitHelpRequest` needs `typeOverride` parameter support** (line 1645, hook call) — Currently `submitHelpRequest` uses `selectedHelpType` state internally. For quick-action cards to send immediately without modifying state first, `submitHelpRequest` needs to accept an optional `typeOverride` parameter. Since `useHelpRequests` is an external hook (imported from `@/components/publicMenu/refactor/hooks/useHelpRequests`), the hook must be modified to support `submitHelpRequest(typeOverride?)`.

   **FIX:** Modify `submitHelpRequest` in the `useHelpRequests` hook to accept optional `typeOverride`:
   ```jsx
   const submitHelpRequest = async (typeOverride) => {
     const type = typeOverride || selectedHelpType;
     // ... use `type` instead of `selectedHelpType` in the request
   };
   ```
   If the hook source is not available locally, an alternative approach: before calling `submitHelpRequest()`, set the state synchronously via `handlePresetSelect(opt.id)` and then call `submitHelpRequest()` in a `useEffect` or `setTimeout(submitHelpRequest, 0)`. However, the `typeOverride` approach is cleaner and avoids race conditions with React state batching.

3. **[P2] `closeHelpDrawer` does not reset new `helpQuickSent` state** (line 1654) — The `closeHelpDrawer` callback only calls `popOverlay` and `setIsHelpModalOpen(false)`. It does not reset `helpQuickSent`, `selectedHelpType`, or `helpComment`. After adding `helpQuickSent`, `closeHelpDrawer` must also reset it.

   **FIX:** Update `closeHelpDrawer`:
   ```jsx
   const closeHelpDrawer = useCallback(() => {
     popOverlay('help');
     setIsHelpModalOpen(false);
     setHelpQuickSent(false);
     // Also reset selectedHelpType + helpComment if not already done by the hook
   }, [popOverlay]);
   ```
   Note: `selectedHelpType` and `helpComment` may already reset in `handleOpenHelpModal` or elsewhere in the hook. Verify that reopening the drawer shows a clean state.

4. **[P2] Need tracking state for which quick-action card is sending** — When a quick card is tapped and `isSendingHelp` becomes true, the spec says "show spinner on the tapped card, disable all other cards". Currently there's no state tracking WHICH card was tapped. A new state like `sendingCardId` is needed.

   **FIX:** Add state:
   ```jsx
   const [sendingCardId, setSendingCardId] = useState(null);
   ```
   On quick card tap: `setSendingCardId(opt.id)` before calling `submitHelpRequest(opt.id)`. After success/failure: `setSendingCardId(null)`. Use `sendingCardId === opt.id` to show spinner, and `isSendingHelp && sendingCardId !== opt.id` to disable+dim other cards.

### Fix 2 — PM-131: «Отправить» button not clickable

5. **[P2] `disabled` condition on submit button includes `!currentTableId`** (line 3731) — `disabled={isSendingHelp || !currentTableId}` blocks the button when `currentTableId` is falsy. Since the help FAB only renders when `currentTableId` is truthy (line 3648), this check is redundant for the FAB path. However, if the drawer opens via another path where `currentTableId` might be null, this would block the button permanently. Per the task spec, the «Отправить» button in the «Другое» form should only check `isSendingHelp || !helpComment.trim()`.

   **FIX:** In the redesigned «Другое» expanded form, the submit button's disabled condition should be:
   ```jsx
   disabled={isSendingHelp || !helpComment.trim()}
   ```
   Remove `!currentTableId` from the disabled check entirely. The drawer is only reachable when the table is already verified (guarded by the FAB's render condition at line 3648).

6. **[P1] Potential z-index or pointer-events conflict with ChevronDown button** (line 3662–3668) — The close button uses `z-10` and is absolutely positioned `top-3 right-3`. If the «Отправить» button or its parent has a conflicting z-index or a parent with `pointer-events-none`, taps could be intercepted. In the current code, I don't see an explicit `pointer-events-none` on the button's parents, but the `relative` wrapper (line 3661) + `z-10` on the close button could theoretically overlap. After redesign, ensure no layering conflict exists between the absolute close button and the inline submit button below the grid.

   **FIX:** Verify after implementation: the «Отправить» button in the «Другое» section sits below the grid in normal flow, well separated from the `top-3 right-3` close button. No additional fix needed if the layout is correct. Just ensure no `pointer-events-none` or `overflow-hidden` is added to any parent `div`.

## Summary
Total: 6 findings (0 P0, 2 P1, 4 P2, 0 P3)

- Fix 1 (#150): 4 findings — full drawer redesign from multi-step to one-tap cards, submitHelpRequest typeOverride, closeHelpDrawer state reset, sendingCardId tracking state
- Fix 2 (PM-131): 2 findings — remove `!currentTableId` from disabled condition, verify no z-index/pointer-events conflicts

## ⛔ Prompt Clarity

- **Overall clarity: 5/5** — The task description is exceptionally detailed with wireframe, behavioral specs, i18n keys, state management, and verification steps.
- **Ambiguous Fix descriptions:** None. Both Fix 1 and Fix 2 are clear with exact line references and expected behavior.
- **Missing context:** The `useHelpRequests` hook source code is not available locally (imported from `@/components/publicMenu/refactor/hooks/useHelpRequests`). Knowing the exact `submitHelpRequest` implementation would help determine the best approach for the `typeOverride` parameter. However, the task description anticipates this and suggests the approach.
- **Scope questions:** None — the FROZEN UX section and SCOPE LOCK are clear.
