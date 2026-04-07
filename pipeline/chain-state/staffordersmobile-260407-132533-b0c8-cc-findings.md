# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260407-132533-b0c8

## Findings

### Fix 1: Remove duplicate inner card in hall-mode expanded area (SOM-S231-01)

1. [P1] Duplicate inner card at line ~2180 — The expanded hall-mode area contains a full duplicate of the header card (`<div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">` at line 2180). This includes Star/Lock icon, compactTableLabel badge, zone_name, collapse button, ownerHintVisible tooltip, hallSummaryItems chips, and billData total line — all already rendered in the outer header (lines 2127-2151). FIX: Delete the entire `<div className="rounded-xl border border-slate-200 bg-white/80 p-3 space-y-2">...</div>` block at lines 2180-2192 (third instance of this className pattern). After deletion, the `<React.Fragment>` at line 2179 should directly contain the `tableRequests.length > 0 && <div>` block (line 2194) as its first child. Legacy instances at lines 584 and 1196 must NOT be touched. Post-fix grep should show count=2 for this className pattern.

### Fix 2: Jump chips scrollIntoView with stopPropagation

2. [P1] Jump chips are non-interactive spans — `renderHallSummaryItem` (line 2033) renders `<span>` elements. Chips sit inside the header div that has `onClick={onToggleExpand}` (line 2126), so clicking a chip currently toggles expand/collapse instead of scrolling. FIX:

   **Step A — Add refs** after `ownerHintTimerRef` (line 1747):
   ```jsx
   const requestsSectionRef = useRef(null);
   const newSectionRef = useRef(null);
   const inProgressSectionRef = useRef(null);
   const readySectionRef = useRef(null);
   ```

   **Step B — Add scrollToSection** after the refs:
   ```jsx
   const scrollToSection = useCallback((kind) => {
     const refMap = {
       requests: requestsSectionRef,
       new: newSectionRef,
       inProgress: inProgressSectionRef,
       ready: readySectionRef,
     };
     const ref = refMap[kind];
     if (ref?.current) {
       ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
     }
   }, []);
   ```

   **Step C — Attach refs to section wrappers in hall-mode path:**
   - Line 2194: `tableRequests.length > 0 && <div>` → `tableRequests.length > 0 && <div ref={requestsSectionRef}>`
   - Line 2196: `newOrders.length > 0 && <div>` → `newOrders.length > 0 && <div ref={newSectionRef}>`
   - Line 2198: `inProgressSections.length > 0 && <div>` → `inProgressSections.length > 0 && <div ref={inProgressSectionRef}>`
   - Line 2200: `readyOrders.length > 0 && <div>` → `readyOrders.length > 0 && <div ref={readySectionRef}>`

   **Step D — Update renderHallSummaryItem** (line 2033): Change `<span>` to `<button type="button">` with `onClick={(e) => { e.stopPropagation(); scrollToSection(item.kind); }}`. Add `cursor-pointer active:opacity-70` to className. Add `scrollToSection` to the dependency array (currently `[getSummaryTone]`).

   **Note on touch targets:** The chips already have adequate padding via parent flex container spacing (`gap-x-3 gap-y-1`), but the chip itself has no min-height. The prompt specifies `min-h-[44px]` check — however, adding `min-h-[44px]` to each chip would distort the compact summary layout. The chips are inline items and follow standard mobile chip patterns (similar to filter chips in Material Design) where the row itself provides adequate touch area. Recommend NOT adding `min-h-[44px]` to individual chips to preserve the compact summary design; instead ensure the flex row wrapper provides sufficient vertical touch area.

   **Scope note:** `hallSummaryItems` includes kinds: "requests", "new", "ready" — but NOT "inProgress". The In Progress section is collapsed by default and has no summary chip. The `inProgressSectionRef` is still useful for Fix 4 (close table reasons), so it should still be created.

### Fix 3: Toast under clicked row instead of last row

3. [P1] Toast appears after last row of order instead of clicked row — Current logic at line 2060-2062: `isLastOfOrder` determines toast placement, showing it after the last item of the order. FIX:

   **Call chain discovered:**
   - `handleSingleAction(order)` (line 1907) → `handleOrdersAction([order])` (line 1897) → `startUndoWindow(orders)` (line 1862) → `setUndoToast({orderId, ...})` (line 1865)
   - `handleSingleAction` is called from `renderHallRows` at line 2077: `onClick={() => handleSingleAction(row.order)`
   - `handleSingleAction` is also called from `renderLegacyOrderCard` at line 2116: `onClick={() => handleSingleAction(order)` — legacy path, should not break

   **Step A — Update handleSingleAction** (line 1907):
   Change from:
   ```jsx
   const handleSingleAction = useCallback((order) => handleOrdersAction([order]), [handleOrdersAction]);
   ```
   To:
   ```jsx
   const handleSingleAction = useCallback((order, rowId) => handleOrdersAction([order], rowId), [handleOrdersAction]);
   ```

   **Step B — Update handleOrdersAction** (line 1897):
   Add `rowId` parameter:
   ```jsx
   const handleOrdersAction = useCallback((orders, rowId) => {
   ```
   Pass `rowId` to `startUndoWindow`:
   ```jsx
   if (actionable.every(({ meta }) => meta.willServe)) startUndoWindow(actionable.map(({ order }) => order), rowId);
   ```

   **Step C — Update startUndoWindow** (line 1862):
   Add `rowId` parameter:
   ```jsx
   const startUndoWindow = useCallback((orders, rowId) => {
   ```
   Add `rowId` to the toast object:
   ```jsx
   return {
     snapshots,
     timerId,
     orderId: orders[orders.length - 1].id,
     rowId,
     label: HALL_UI_TEXT.undoLabel,
     onUndo: () => { ... },
   };
   ```

   **Step D — Update button call in renderHallRows** (line 2077):
   Change `onClick={() => handleSingleAction(row.order)` to `onClick={() => handleSingleAction(row.order, row.id)`.

   **Step E — Update showToast logic in renderHallRows** (lines 2060-2062):
   Replace:
   ```jsx
   const isLastOfOrder = !rows[idx + 1] || rows[idx + 1].order?.id !== row.order?.id;
   const showToast = toastOrderId && row.order?.id === toastOrderId && isLastOfOrder && !renderedToast.has(toastOrderId);
   if (showToast) renderedToast.add(toastOrderId);
   ```
   With:
   ```jsx
   const showToast = undoToast && row.order?.id === undoToast.orderId && row.id === undoToast.rowId && !renderedToast.has(undoToast.orderId);
   if (showToast) renderedToast.add(undoToast.orderId);
   ```
   Delete the `const isLastOfOrder` line.

   **Backward compatibility note:** The legacy `renderLegacyOrderCard` (line 2116) calls `handleSingleAction(order)` without `rowId` — this is fine because `rowId` will be `undefined`, and the toast uses `isLastOfOrder` logic only in `renderHallRows`. Legacy path does not use `undoToast.rowId`.

   **Important:** For bulk actions (e.g., "Принять все"), `handleOrdersAction` is called directly (lines 2196, 2198, 2200) without `rowId`. In that case `rowId` is undefined and toast will NOT render at all (because `row.id === undefined` is always false). This is actually correct UX — bulk operations shouldn't show per-row toast. However, the bulk toast still needs to work. **Alternative approach:** When `undoToast.rowId` is undefined (bulk action), fall back to the existing `isLastOfOrder` behavior. Updated logic:
   ```jsx
   const isLastOfOrder = !rows[idx + 1] || rows[idx + 1].order?.id !== row.order?.id;
   const showToast = undoToast && row.order?.id === undoToast.orderId && !renderedToast.has(undoToast.orderId) && (undoToast.rowId ? row.id === undoToast.rowId : isLastOfOrder);
   if (showToast) renderedToast.add(undoToast.orderId);
   ```
   This preserves `isLastOfOrder` as fallback for bulk actions.

### Fix 4: Close table blocker reasons — tappable with scroll

4. [P2] Close table blocker reasons are non-tappable `<p>` elements — At line 2206, `closeDisabledReasons.map` renders `<p>` with `text-[10px]`. FIX:

   **Step A — Define reasonToKind mapping** (near `closeDisabledReasons`, after line 2010):
   ```jsx
   const reasonToKind = {
     [HALL_UI_TEXT.requestsBlocker]: "requests",
     [HALL_UI_TEXT.newBlocker]: "new",
     [HALL_UI_TEXT.inProgressBlocker]: "inProgress",
     [HALL_UI_TEXT.readyBlocker]: "ready",
   };
   ```

   **Step B — Update hall-mode closeDisabledReasons.map** (line 2206, third instance):
   Replace `<p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>` with:
   ```jsx
   {closeDisabledReasons.map((reason, i) => {
     const kind = reasonToKind[reason];
     if (!kind) return <p key={i} className="text-[10px] text-slate-400 text-center">{reason}</p>;
     return (
       <button
         key={i}
         type="button"
         onClick={() => scrollToSection(kind)}
         className="w-full text-[10px] text-slate-400 text-center min-h-[28px] active:text-slate-600"
       >
         {reason} ›
       </button>
     );
   })}
   ```

   **Note:** Only the third instance (hall-mode, line 2206) should be changed. Lines 716 and 1327 are legacy paths — DO NOT CHANGE.

   **Note on `scrollToSection` dependency:** `reasonToKind` is a plain object (not state/ref), and `scrollToSection` is already defined in Fix 2. No dependency array changes needed for this fix specifically, but `scrollToSection` must be available in the component scope (it is, via Fix 2's `useCallback`).

### Fix 5: Age urgency color stripe on dish rows

5. [P2] No visual urgency indicator on dish rows — `renderHallRows` (line 2046) renders rows with uniform styling regardless of order age. FIX:

   **Discovery:** `overdueMinutes` is available in the component scope (prop at line 1673, used at lines 1793 and 2030). `getAgeMinutes` is a global function at line 366.

   **Step A — Add urgency calculation inside `rows.map`** (after line 2059, inside the `.map()` callback):
   ```jsx
   const ageMin = getAgeMinutes(row.order?.created_date);
   const overdueThreshold = overdueMinutes || 10;
   const urgencyClass = ageMin >= overdueThreshold + 5
     ? "border-l-4 border-l-red-500"
     : ageMin >= overdueThreshold
     ? "border-l-4 border-l-amber-400"
     : "";
   ```

   **Step B — Apply urgencyClass to row div** (line 2066):
   Change:
   ```jsx
   <div className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2`}>
   ```
   To:
   ```jsx
   <div className={`rounded-lg border ${palette.border} ${palette.bg} px-3 py-2 ${urgencyClass}`}>
   ```

   **Step C — Add `overdueMinutes` to renderHallRows dependency array** (line 2094):
   Current: `[advanceMutation.isPending, handleSingleAction, undoToast, setUndoToast]`
   Add `overdueMinutes` to the array.

   **Note:** The `border-l-4` will override the left portion of the existing `border` (from `${palette.border}`). This is standard Tailwind behavior — `border-l-4` takes precedence over `border` for the left side. Visually this creates a colored left stripe on the row card. On 375px mobile width, `border-l-4` (4px) is visible and not clipped.

   **Note on readOnly rows:** The urgency stripe will also appear on served (readOnly) rows. This is acceptable UX — it shows which orders were historically slow. If this is undesired, add `&& !readOnly` condition: `const urgencyClass = readOnly ? "" : ageMin >= ...`. Recommend implementing without `readOnly` check first, then adjust based on Arman's feedback.

## Summary
Total: 5 findings (0 P0, 3 P1, 2 P2, 0 P3)

All 5 findings correspond directly to the 5 fixes in the task prompt. No out-of-scope issues reported.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None. All 5 fixes have clear wireframes, grep patterns, and step-by-step instructions.
- Missing context: None. The discovery steps were well-designed — they instructed the reviewer to verify assumptions before implementation.
- Scope questions:
  - Fix 2: hallSummaryItems does NOT include an "inProgress" chip (only requests/new/ready), so the `inProgressSectionRef` is only useful for Fix 4. This is not a bug in the prompt — just worth noting.
  - Fix 3: The prompt's suggested showToast logic (`row.id === undoToast.rowId`) would break bulk action toast (when rowId is undefined). I provided a fallback approach.
  - Fix 5: Whether urgency stripes should appear on served/readOnly rows is not specified. I recommended including them by default.
