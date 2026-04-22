# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260331-044239-b1e5

## Findings

### Fix 2 — #19 Finish-stage button label "Выдать"

1. **[P1] Fix 2: `nextIsFinish` must be declared BEFORE the return statement, not inside the object literal** — The task description shows `nextIsFinish` as if it can be placed right before the `actionLabel:` property. In JavaScript, you cannot declare a `const` inside an object literal. The `nextIsFinish` variable must be computed BEFORE the `return {` statement at line 3029.

   **FIX:** At ~line 3028, AFTER `const isFinishStage = ...;` and BEFORE `return {`, add:
   ```javascript
   const nextIsFinish = nextStage && (
     nextStage.internal_code === 'finish' ||
     (currentIndex + 1) === relevantStages.length - 1
   );
   ```
   Then at line 3032, change:
   ```javascript
   // BEFORE:
   actionLabel: nextStage ? `→ ${getStageName(nextStage, t)}` : null,
   // AFTER:
   actionLabel: nextStage ? (nextIsFinish ? 'Выдать' : `→ ${getStageName(nextStage, t)}`) : null,
   ```
   Note: `(currentIndex + 1) === relevantStages.length - 1` is equivalent to checking if the next stage is the last in the pipeline. This is the correct double-check alongside `internal_code === 'finish'` because some B44 configurations may not set `internal_code` on the finish stage.

### Fix 1 — #18 Sub-grouping В РАБОТЕ

2. **[P1] Fix 1 Step A: Pass `orderStages` prop to `OrderGroupCard`** — The parent call site at lines 3965-3985 does not currently pass `orderStages`. The `sortedStages` variable is available at line 2987 in the parent scope. Add `orderStages={sortedStages}` to the props at the call site (~after line 3983). Accept it in `OrderGroupCard` function signature (line 1301) with default `orderStages = []`.

   **FIX:**
   - In `OrderGroupCard` signature (line 1301), add `orderStages = [],` to the destructured props.
   - In parent call site (~line 3984), add `orderStages={sortedStages}` as a new prop.

3. **[P1] Fix 1 Step B: Build sub-groups from `inProgressOrders` by normalized stage_id** — Add a `useMemo` inside `OrderGroupCard` (after `inProgressOrders` definition, ~line 1342) that groups `inProgressOrders` by `getLinkId(order.stage_id)`. Sort sub-groups by descending index in `orderStages` array (closest-to-finish first). Null/unknown stage_id → catch-all group at bottom.

   **FIX:** Add after line 1342:
   ```javascript
   const subGroups = useMemo(() => {
     const groups = {};
     for (const order of inProgressOrders) {
       const sid = getLinkId(order.stage_id) || '__null__';
       if (!groups[sid]) groups[sid] = [];
       groups[sid].push(order);
     }
     return Object.entries(groups)
       .map(([sid, orders]) => {
         const cfg = getStatusConfig(orders[0]);
         return { sid, orders, cfg };
       })
       .sort((a, b) => {
         if (a.sid === '__null__') return 1;
         if (b.sid === '__null__') return -1;
         const idxA = orderStages.length > 0 ? orderStages.findIndex(s => getLinkId(s.id) === a.sid) : -1;
         const idxB = orderStages.length > 0 ? orderStages.findIndex(s => getLinkId(s.id) === b.sid) : -1;
         return idxB - idxA;
       });
   }, [inProgressOrders, getStatusConfig, orderStages]);
   ```

4. **[P1] Fix 1 Step C: Per-sub-group expand state** — Replace the single `inProgressExpanded` boolean (line 1455) with per-sub-group expand state. Keep `inProgressExpanded` for the top-level section toggle. Add `expandedSubGroups` state for individual sub-groups within the section.

   **FIX:** After line 1455, add:
   ```javascript
   const [expandedSubGroups, setExpandedSubGroups] = useState({});
   ```
   Auto-expand first sub-group when section opens: use a `useEffect` that watches `inProgressExpanded` — when it becomes `true` and `expandedSubGroups` is empty, set the first `subGroups[0]?.sid` to `true`.

5. **[P1] Fix 1 Step D: Render sub-groups replacing flat list (~lines 1849-1894)** — Replace `inProgressOrders.map(...)` with `subGroups.map(...)` rendering sub-section headers with stage name + count + "Все → [action]" button, plus collapsible order list per sub-group.

   **FIX:** Replace lines 1849-1894 (the `{inProgressExpanded && (...)}` block) with:
   ```jsx
   {inProgressExpanded && (
     <div className="space-y-3">
       {subGroups.map(({ sid, orders: sgOrders, cfg }) => {
         const isSubExpanded = !!expandedSubGroups[sid];
         const raw = cfg.actionLabel || '';
         const actionName = raw.startsWith('→ ') ? raw.slice(2) : raw;
         const subGroupLabel = sid === '__null__' ? 'В РАБОТЕ' : cfg.label;

         // Flatten rule: if only 1 sub-group, skip sub-group header wrapper
         if (subGroups.length === 1) {
           return (
             <div key={sid} className="space-y-2">
               {/* render orders directly — same structure as Fix 3 card */}
               {sgOrders.map(order => { /* ... order card rendering ... */ })}
             </div>
           );
         }

         return (
           <div key={sid}>
             <div
               className="flex items-center justify-between mb-1.5 cursor-pointer min-h-[44px]"
               onClick={() => setExpandedSubGroups(prev => ({ ...prev, [sid]: !prev[sid] }))}
             >
               <div className="flex items-center gap-2">
                 <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
                 <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                   {subGroupLabel} ({sgOrders.length})
                 </span>
               </div>
               {actionName && (
                 <button
                   type="button"
                   onClick={(e) => { e.stopPropagation(); handleBatchAction(sgOrders); }}
                   disabled={advanceMutation.isPending}
                   className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded min-h-[36px] active:scale-95 disabled:opacity-60"
                 >
                   {`Все → ${actionName}`}
                 </button>
               )}
             </div>
             {isSubExpanded ? (
               <div className="space-y-2">
                 {sgOrders.map(order => { /* ... order card rendering (Fix 3 format) ... */ })}
               </div>
             ) : (
               <div className="text-xs text-slate-400 pl-5">
                 {sgOrders.length} {sgOrders.length === 1 ? 'заказ' : sgOrders.length < 5 ? 'заказа' : 'заказов'}
               </div>
             )}
           </div>
         );
       })}
     </div>
   )}
   ```

6. **[P2] Fix 1 Step D: Sub-group action label `slice(3)` is WRONG — should be `slice(2)`** — The task description says `raw.startsWith('→ ') ? raw.slice(3) : raw`. The prefix "→ " is exactly 2 characters: "→" (U+2192, 1 char) + " " (space, 1 char). Using `slice(3)` drops the first letter of the stage name (e.g., "→ Готовится" → "отовится" instead of "Готовится").

   **FIX:** Use `raw.slice(2)` instead of `raw.slice(3)`.

7. **[P1] Fix 1 Step E contradiction with НЕ-должно-быть** — Step E says: "Still show a single section-level 'Все → [action]' button in the «В работе» header" when only 1 sub-group exists. But the НЕ-должно-быть section says: "Do NOT add a top-level group action button to the «В работе» section header itself." These contradict. Recommendation: when `subGroups.length === 1`, render orders flat (no sub-group header) and do NOT add a button to the top-level «В работе» header (respecting the НЕ constraint). The single sub-group's batch action is already accessible via each order's footer button (Fix 3).

   **FIX:** Follow the НЕ-должно-быть constraint — do NOT add a batch button to the «В работе» header even with 1 sub-group. When `subGroups.length === 1`, just render the flat order list without sub-headers.

### Fix 3 — #20 Items per row + footer button

8. **[P1] Fix 3A: Replace comma-joined items with vertical list in all 3 locations** — Lines 1759, 1823, 1884 each have `orderItems.map(i => \`${i.dish_name}×${i.quantity}\`).join(', ')`. Replace each with a `<div className="mt-1 space-y-0.5">` vertical list using `· {item.dish_name} ×{item.quantity}` per row.

   **FIX:** At each of the 3 locations (lines 1757-1761, 1821-1825, 1882-1886), replace the `<div className="text-sm text-slate-600">` block with:
   ```jsx
   {orderItems.length > 0 ? (
     <div className="mt-1 space-y-0.5">
       {orderItems.map((item, idx) => (
         <div key={item.id || idx} className="text-xs text-slate-500">
           · {item.dish_name} ×{item.quantity}
         </div>
       ))}
     </div>
   ) : (
     <div className="text-xs text-slate-400 mt-1">Загрузка...</div>
   )}
   ```

9. **[P1] Fix 3B: Move action button from header to card footer in all 3 locations** — Remove the existing inline action buttons (~lines 1745-1754, 1809-1818, 1870-1879) from the header area. Add a footer button at the BOTTOM of each card (after items list, before order_number).

   **FIX:** Remove the existing button blocks from the header `<div className="flex items-center gap-2">` sections. Add after the items div and before the order_number div:
   ```jsx
   {(config.actionLabel || config.isFinishStage) && (
     <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-end">
       <button
         className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium min-h-[36px]"
         onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
         disabled={advanceMutation.isPending}
       >
         {advanceMutation.isPending
           ? <Loader2 className="w-3 h-3 animate-spin" />
           : orderItems.length > 0
             ? `Все ${orderItems.length} блюд`
             : (config.actionLabel || 'Выдать')
         }
       </button>
     </div>
   )}
   ```
   **Important:** The task description uses `updateStatusMutation?.isPending` but the actual variable name in `OrderGroupCard` is `advanceMutation` (line 1486). Use `advanceMutation.isPending` consistently.

10. **[P2] Fix 3B: Footer button label "блюд" — no Russian pluralization** — The label `Все ${orderItems.length} блюд` is grammatically correct only for quantities of 0 or 5+. For 1 item → "блюдо", 2-4 items → "блюда". Since this is a waiter-facing mobile app with Russian-speaking users, incorrect grammar is noticeable.

    **FIX:** Add a simple pluralization helper or inline ternary:
    ```javascript
    const n = orderItems.length;
    const dishWord = n === 1 ? 'блюдо' : (n >= 2 && n <= 4) ? 'блюда' : 'блюд';
    // Label: `Все ${n} ${dishWord}`
    ```
    However, this is a P2 since the task explicitly specifies the label format. Implementing as specified is acceptable; this is a refinement.

11. **[P3] Fix 3B: `Loader2` already imported — confirmed** — The footer button uses `<Loader2>` for the pending state spinner. Verified: `Loader2` is already imported at line 172 from `lucide-react` and used in 4 other places. No action needed.

## Summary
Total: 11 findings (0 P0, 7 P1, 3 P2, 1 P3)

- Fix 2: 1 finding (P1 — scoping of `nextIsFinish` variable)
- Fix 1: 6 findings (4× P1 implementation steps, 1× P2 slice bug in task description, 1× P1 contradiction in flatten rule)
- Fix 3: 4 findings (2× P1 implementation steps, 1× P2 pluralization, 1× P3 Loader2 confirmed)

## Key Risks
1. **slice(3) vs slice(2)** (Finding #6) — will produce garbled stage names in sub-group buttons if not corrected
2. **`updateStatusMutation` vs `advanceMutation`** (Finding #9) — task description uses wrong variable name; using the wrong name will crash at runtime
3. **Step E contradiction** (Finding #7) — implementer must choose one interpretation; recommend following the НЕ constraint

---

⛔ Prompt Clarity (MANDATORY):
- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 1 Step D: `raw.slice(3)` is incorrect — should be `raw.slice(2)`. The "→ " prefix is 2 chars, not 3.
  - Fix 1 Step E: Contradicts the НЕ-должно-быть constraint about no batch button in «В работе» header. Unclear which takes precedence.
  - Fix 3B: Uses `updateStatusMutation?.isPending` but actual variable is `advanceMutation` (line 1486).
- Missing context: None significant — line numbers, function names, and variable references were accurate.
- Scope questions: Fix 3B footer button label "Все N блюд" — was the lack of Russian pluralization intentional? Since this is a waiter-facing Russian app, it stands out. Minor scope question, not blocking.
