# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260401-114201-9ed3

## Findings

### Fix 1 — SOM-S213-01: Batch "Выдать всё" button does not trigger undo toast

1. **[P1] Batch "Выдать всё" onClick missing setUndoToast call** (~line 1905) — The Section 2 batch button `onClick={() => handleBatchAction(completedOrders)}` only calls `handleBatchAction` but never calls `setUndoToast`. Individual per-order buttons at ~line 1951–1965 correctly build snapshots and call `setUndoToast`, but the batch button at the section header does not. This is the confirmed root cause: all previous fixes (lifting state to parent S212, moving toast JSX outside ternary S213) were correct infrastructure, but the batch button itself never triggers the toast.

   **FIX:** Replace the `onClick` handler at line 1905 from:
   ```jsx
   onClick={() => handleBatchAction(completedOrders)}
   ```
   to:
   ```jsx
   onClick={() => {
     const snapshots = completedOrders.map(o => ({ orderId: o.id, prevStatus: o.status, prevStageId: getLinkId(o.stage_id) }));
     handleBatchAction(completedOrders);
     const timerId = setTimeout(() => setUndoToast(null), 5000);
     setUndoToast({
       snapshots,
       timerId,
       onUndo: () => {
         snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
           const payload = { status: prevStatus };
           if (prevStageId) payload.stage_id = prevStageId;
           advanceMutation.mutate({ id: orderId, payload });
         });
       }
     });
   }}
   ```
   This follows the exact same pattern used in individual order buttons at ~lines 1951–1965 (same component, same section), but applies to all `completedOrders` at once. All required identifiers (`getLinkId`, `setUndoToast`, `advanceMutation`, `handleBatchAction`) are already in scope within `OrderGroupCard`.

   **Note on button label:** The button text at line 1909 says `'\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0435'` ("Выдать все") but the toast text should say `'\u0412\u044B\u0434\u0430\u043D \u0433\u043E\u0441\u0442\u044E'` ("Выдан гостю") — the toast text is rendered in the parent component's toast JSX (already correct per commit c27604a), not in this onClick handler.

### Fix 2 — SOM-UX-24: No "ВЫДАНО" section for served orders

2. **[P2] No way to see served orders in expanded table card** — Once orders reach `served` status, they are excluded from `activeOrders` filter (line 3486: `o.status !== 'served'`), and the table card disappears entirely when all orders are served. Inside `OrderGroupCard`, there is no query or section for served orders. Waiter has no visibility into what was already delivered during the current visit.

   **FIX:** Three changes needed inside `OrderGroupCard`:

   **2a. Add state for collapse toggle** — Add inside `OrderGroupCard` (after existing state declarations, e.g., after `const [billExpanded, setBillExpanded]` or similar):
   ```jsx
   const [servedExpanded, setServedExpanded] = useState(false);
   ```

   **2b. Add query for served orders** — Add after the existing `itemResults` query (~line 1368), inside `OrderGroupCard`:
   ```jsx
   const { data: servedOrders = [] } = useQuery({
     queryKey: ['servedOrders', group.id],
     queryFn: () => base44.entities.Order.filter({ table: group.id, status: 'served' }),
     enabled: isExpanded && group.type === 'table',
     staleTime: 30000,
   });
   ```
   `base44`, `useQuery` are already imported/available. The `shouldRetry` helper is also available but optional — `staleTime: 30000` prevents excessive refetching.

   **2c. Add ВЫДАНО section in JSX** — Insert AFTER the in-progress section closing `</div>` (~line 2211) and BEFORE the Bill Summary block (`{/* ═══ Block E — Bill Summary */}` at line 2213):
   ```jsx
   {/* ═══ Section 4 — ВЫДАНО (collapsed by default, read-only history) ═══ */}
   {group.type === 'table' && servedOrders.length > 0 && (
     <div>
       <div
         className="flex items-center justify-between mb-2 cursor-pointer min-h-[44px]"
         onClick={() => setServedExpanded(!servedExpanded)}
       >
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
           {`\u0412\u042B\u0414\u0410\u041D\u041E (${servedOrders.length})`}
         </p>
         <span className="text-xs text-slate-400">
           {servedExpanded ? '\u0421\u043A\u0440\u044B\u0442\u044C \u25B4' : '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u25B8'}
         </span>
       </div>
       {servedExpanded && (
         <div className="space-y-1">
           {servedOrders.map(order => {
             const orderTime = new Date(safeParseDate(order.created_date)).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
             return (
               <div key={order.id} className="flex items-center justify-between px-2 py-1.5 text-sm text-slate-500">
                 <span>{guestName(order)}</span>
                 <span className="text-xs text-slate-400">{orderTime}</span>
               </div>
             );
           })}
         </div>
       )}
     </div>
   )}
   ```
   All helpers (`guestName`, `safeParseDate`) are already in scope. The section uses slate-400 for muted appearance (history, not actionable). No action buttons. Touch target 44px on the header. Only renders for `group.type === 'table'` (not pickup/delivery). Only loaded when `isExpanded` (query `enabled: isExpanded`).

## Summary
Total: 2 findings (0 P0, 1 P1, 1 P2, 0 P3)

## Prompt Clarity

- **Overall clarity: 5/5** — Excellent. Both fixes have clear "Сейчас / Должно быть / НЕ должно быть" sections, exact line numbers, reference patterns, and ASCII mockups.
- **Ambiguous Fix descriptions:** None. Fix 1 pinpoints the exact line (1905) and provides the reference pattern (lines 1951–1965). Fix 2 provides insertion point, query pattern, and complete JSX mockup.
- **Missing context:** None. All helper functions (`getLinkId`, `guestName`, `safeParseDate`), props (`setUndoToast`, `advanceMutation`), and imports (`useQuery`, `base44`) were confirmed available. The "Уже пробовали" section for Fix 1 was especially helpful.
- **Scope questions:** None. FROZEN UX and SCOPE LOCK sections are clear. Fix 1 is localized to one onClick handler. Fix 2 adds new state + query + JSX section with clear insertion point.
