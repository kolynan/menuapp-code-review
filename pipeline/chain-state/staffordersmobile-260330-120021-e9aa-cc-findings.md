# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-120021-e9aa

## Findings

### Fix 1 — #164 (P0): Replace dish-text in collapsed card with actionable status summary

1. [P0] Fix 1A — Replace Row 3 (items preview) with two-line status summary (СЕЙЧАС / ЕЩЁ)

Current code at lines 1630-1637: renders `itemsPreview` (dish text list) in Row 3. This must be replaced with a two-line summary.

**Line 1 — СЕЙЧАС:** Count of `activeOrders.filter(o => getStatusConfig(o).isFirstStage)` as "N новых", count of `completedOrders.length` as "N выдать", plus inline request badges (bill → "🧾 Счёт", call_waiter → "📞 Официант", other → "❗ Запрос"). Only show if any count > 0.

**Line 2 — ЕЩЁ:** Count of `activeOrders.filter(o => !getStatusConfig(o).isFirstStage)` as "N готовится", plus `billData.total` formatted as "NNN ₸" if > 0. Only show if count > 0.

FIX: Replace lines 1630-1637 (Row 3 div) with computed summary. Add two new useMemo hooks (or inline computations) before the render:
```javascript
const newCount = activeOrders.filter(o => getStatusConfig(o).isFirstStage).length;
const serveCount = completedOrders.length;
const inProgressCount = activeOrders.filter(o => !getStatusConfig(o).isFirstStage).length;
```
Then render:
```jsx
{/* Row 3: Status summary */}
<div className="text-sm space-y-0.5">
  {(newCount > 0 || serveCount > 0 || requestBadges.length > 0) && (
    <div className="text-slate-700 truncate">
      <span className="font-semibold text-xs text-slate-500">СЕЙЧАС: </span>
      {[
        newCount > 0 && `${newCount} новых`,
        serveCount > 0 && `${serveCount} выдать`,
        ...requestBadges.map(b => b.type === 'bill' ? '🧾 Счёт' : b.type === 'waiter' ? '📞 Официант' : '❗ Запрос')
      ].filter(Boolean).join(' · ')}
    </div>
  )}
  {inProgressCount > 0 && (
    <div className="text-slate-500 truncate">
      <span className="font-semibold text-xs text-slate-400">ЕЩЁ: </span>
      {[
        `${inProgressCount} готовится`,
        billData && billData.total > 0 && `${billData.total.toLocaleString()} ₸`
      ].filter(Boolean).join(' · ')}
    </div>
  )}
</div>
```

**Important:** `newCount`, `serveCount`, `inProgressCount` should be computed inside the component using useMemo to avoid recalculating on each render, or inline since `activeOrders`/`completedOrders` are already memoized. Since `getStatusConfig` is called per order, best to compute these counts inside the existing component body (after `activeOrders` and `completedOrders` are defined, around line 1370).

**Note on billData dependency:** `billData` is computed at line 1501 — after the proposed count location (~1370). Either move the count computation to after billData, or compute billData.total inline for Line 2 only. Recommend placing all summary computations together after billData (around line 1515).

2. [P0] Fix 1B — Remove Row 4 request badges (merge into Line 1)

Current code at lines 1639-1650: renders request badges as separate violet chips. Since badges are now merged inline into the СЕЙЧАС line (Fix 1A), this Row 4 section must be removed entirely.

FIX: Remove the entire block from `{/* Row 4: request badges (Hall only) */}` (line 1639) through the closing `)}` and `</div>` (line 1650). Do NOT remove the `requestBadges` useMemo itself (line 1410) — it's still used in the summary line.

3. [P1] Fix 1C — Edge case: empty state when no orders AND no requests

When `newCount === 0 && serveCount === 0 && inProgressCount === 0 && requestBadges.length === 0`, neither СЕЙЧАС nor ЕЩЁ line would render, leaving Row 3 empty. The original code showed "Нет позиций" as fallback.

FIX: Add a fallback when both lines are empty — show a muted "Нет активных заказов" text. Or keep the loading spinner from original code for when items are loading.

```jsx
{newCount === 0 && serveCount === 0 && inProgressCount === 0 && requestBadges.length === 0 && (
  <div className="text-xs text-slate-400">{'Нет активных заказов'}</div>
)}
```

---

### Fix 2 — PM-142 (P0): Fix shift filter fallback — use start of today

4. [P0] Fix 2A — Change fallback at line 474

Current code (line 474):
```javascript
return new Date(now.getTime() - FALLBACK_HOURS * 60 * 60 * 1000);
```

FIX: Replace with:
```javascript
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);
return startOfToday;
```

5. [P0] Fix 2B — Change fallback at line 537

Current code (line 537):
```javascript
return new Date(now.getTime() - FALLBACK_HOURS * 60 * 60 * 1000);
```

FIX: Replace with:
```javascript
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);
return startOfToday;
```

Both changes preserve `FALLBACK_HOURS` constant declaration (line 469) but stop using it in the return values.

---

### Fix 3 — #166 (P0): Expanded card — restructure orders into status sections

6. [P0] Fix 3A — Replace Block A flat list with 3 status-based sections

Current Block A (lines 1657-1712) renders ALL `activeOrders` under one "ЗАКАЗЫ" header. Replace with 3 sections:

**Section 1 — Новые** (OPEN by default): `activeOrders.filter(o => getStatusConfig(o).isFirstStage)`
**Section 2 — Готово к выдаче** (OPEN by default): `completedOrders` (from Block F, moved here)
**Section 3 — В работе** (COLLAPSED by default): `activeOrders.filter(o => !getStatusConfig(o).isFirstStage)`

FIX: Compute section arrays (after `activeOrders`/`completedOrders` useMemo, around line 1326):
```javascript
const newOrders = useMemo(() => activeOrders.filter(o => getStatusConfig(o).isFirstStage), [activeOrders, getStatusConfig]);
const inProgressOrders = useMemo(() => activeOrders.filter(o => !getStatusConfig(o).isFirstStage), [activeOrders, getStatusConfig]);
```
Note: `completedOrders` is already defined at line 1322.

Add state near line 1435:
```javascript
const [inProgressExpanded, setInProgressExpanded] = useState(false);
```

Replace Block A render with 3 sections. Each section has header with count + optional batch action button. Order cards inside each section use the same render pattern as current Block A (lines 1673-1709).

7. [P0] Fix 3B — "Принять все" batch action for Новые section

Header: `Новые (N) [Принять все]`

FIX: "Принять все" button iterates `newOrders` and calls `advanceMutation.mutate()` for each order, using the same payload computation as `handleAdvance()` (lines 1483-1497). Extract the payload logic into a helper or inline it:

```javascript
const handleBatchAction = (orders) => {
  orders.forEach(order => {
    const config = getStatusConfig(order);
    const payload = {};
    if (config.nextStageId) {
      payload.stage_id = config.nextStageId;
      if (config.derivedNextStatus) payload.status = config.derivedNextStatus;
    } else if (config.nextStatus) payload.status = config.nextStatus;
    if (config.isFirstStage && effectiveUserId && !getAssigneeId(order)) {
      payload.assignee = effectiveUserId;
      payload.assigned_at = new Date().toISOString();
    }
    if (onClearNotified) onClearNotified(order.id);
    advanceMutation.mutate({ id: order.id, payload });
  });
};
```

**Potential concern:** Calling `advanceMutation.mutate()` multiple times in a loop — since mutations are not queued by default in React Query, rapid-fire mutations could cause race conditions with the `onMutate` optimistic updates (each one cancels queries and snapshots). However, the existing code uses `setQueriesData` which should handle concurrent optimistic updates. Still, this is a risk worth noting — may need sequential mutation or `Promise.all` with `mutateAsync`.

Recommendation: Use `advanceMutation.mutateAsync` with sequential await in an async handler, or accept the parallel mutation approach since each mutation updates a different order ID.

8. [P0] Fix 3C — "Выдать все" batch action for Готово к выдаче section

Same pattern as "Принять все" — iterate `completedOrders` and advance each. Note: `completedOrders` are `isFinishStage` orders. The action for these is the "served" transition. Verify that `getStatusConfig(completedOrder).nextStageId || nextStatus` returns the correct "served" target — since `isFinishStage` means the order is AT the finish stage, there may not be a next stage.

**Critical concern:** `completedOrders` are orders where `c.isFinishStage === true`. If isFinishStage means this IS the final stage, then `getStatusConfig` would return `nextStageId: null, nextStatus: null` — meaning there's no next action available. The `nextAction` computation (line 1454-1462) already checks `if (!config.nextStageId && !config.nextStatus) return null` — so these orders would have NO action.

This is a semantic confusion in the task description: "completedOrders" in the code = `isFinishStage` orders = orders at the LAST pipeline stage. The term "ready to serve" in the task description implies these orders SHOULD be served, but the code says they're already AT the finish stage. The "Выдать все" button may have no valid action for these orders.

FIX: The implementation must verify what `getStatusConfig()` returns for `isFinishStage` orders. If `nextStageId`/`nextStatus` are null, the "Выдать все" button should either: (a) not render, or (b) call a different action (like setting `status: 'served'` directly). This needs clarification from the task author.

**Recommendation for writer:** Check `getStatusConfig` for isFinishStage orders — if they have no next action, skip the "Выдать все" button or use a direct `status: 'served'` payload.

9. [P0] Fix 3D — Remove/repurpose Block F

Current Block F (lines 1808-1846) renders `completedOrders` as a collapsible section titled "Выполнено". This section must be removed from its current position since `completedOrders` are now rendered in Section 2 ("Готово к выдаче").

FIX: Remove Block F entirely (lines 1808-1846). The `completedExpanded` state (line 1435) is no longer needed for Block F's original purpose but may be repurposed if Section 2 needs collapse behavior (per spec, Section 2 is OPEN by default with no collapse mentioned, so `completedExpanded` state can be removed or kept for future use).

---

### Fix 4 — #167 (P0): Service requests — move to top + fix button + fix bill icon

10. [P0] Fix 4A — Move Block C to top of expanded content

Current Block C is at lines 1739-1767, positioned AFTER Block B (action button). It should be the FIRST block inside expanded content, before any order sections.

FIX: Cut the Block C JSX (lines 1739-1767) from its current position and paste it immediately after the expanded content container opens (after line 1655 `<div className="border-t border-slate-200 px-4 py-3 space-y-4">`). This ensures service requests are the first thing the waiter sees when expanding a card.

11. [P1] Fix 4B — Replace "В работе" / "Готово" button text with "Выполнено"

Current code at line 1758-1759:
```jsx
{req.status === 'new' ? 'В работе' : 'Готово'}
```

This creates an intermediate "В работе" state before "Готово". Per UX spec decision #6, the button should be a single "Выполнено" that marks the request as done.

FIX: Replace the conditional text with a single label:
```jsx
{'Выполнено'}
```

**Also update the callback:** At line 3893, the `onCloseRequest` callback currently sets `status: status === 'new' ? 'in_progress' : 'done'`. For the "Выполнено" behavior, it should always set `status: 'done'`:
```javascript
onCloseRequest={(reqId, status) => updateRequestMutation.mutate({ id: reqId, status: 'done' })}
```

**Wait — this is at the parent component level (line 3893), not inside OrderGroupCard.** The `onCloseRequest` prop is passed to OrderGroupCard, and the card calls `onCloseRequest(req.id, req.status)`. Since the task says "calls existing `onCloseRequest(req.id, req.status)`" — the implementation should change the callback at line 3893 to always use `'done'`, OR change the call site to pass `'done'` directly instead of `req.status`. The callback change at 3893 is simpler and more correct.

**Scope concern:** Modifying line 3893 is still within the same file (staffordersmobile.jsx), so it's in scope.

12. [P1] Fix 4C — Fix button touch target size

Current button (line 1757): `min-h-[28px]` — below the 44px mobile minimum.

FIX: Change `min-h-[28px]` to `min-h-[44px]` for proper mobile touch target. Also add horizontal padding: `px-3` instead of `px-2`.

13. [P1] Fix 4D — Fix bill icon on collapsed card (Row 4 / summary)

Current code at line 1644: uses `<Bell>` icon for `badge.type === 'bill'`. Bill requests should use `Receipt` or `FileText` icon.

FIX: Import `FileText` from `lucide-react` (add to existing import block at line 162-193). `Receipt` is NOT in the current lucide-react import and may not be available in the installed version — `FileText` is a safer choice as it's commonly available.

Then replace in the render (line 1644 or Fix 1A equivalent):
```jsx
badge.type === 'bill' ? <FileText className="w-3 h-3" /> : ...
```

**Note:** Since Fix 1B removes Row 4 entirely and merges badges into the СЕЙЧАС text line, this icon fix applies to the emoji approach used in Fix 1A (🧾 for bill). If emoji is used instead of icons, the icon fix is not needed in collapsed card. However, the task also says to fix the icon in Block C expanded view (line 1749), which is NOT removed — so the fix is still needed there.

14. [P1] Fix 4E — Fix bill icon in Block C expanded view

Current code at line 1749:
```jsx
{req.request_type === 'bill' ? <Bell className="w-4 h-4 text-violet-600" /> : <Hand className="w-4 h-4 text-violet-600" />}
```

FIX: Replace `Bell` with `FileText` for bill requests:
```jsx
{req.request_type === 'bill' ? <FileText className="w-4 h-4 text-violet-600" /> : <Hand className="w-4 h-4 text-violet-600" />}
```

---

## Summary
Total: 14 findings (10 P0, 4 P1, 0 P2, 0 P3)

Key implementation risks:
1. **Fix 3C — "Выдать все" semantic confusion:** `completedOrders` = `isFinishStage` orders. If these have no `nextStageId`/`nextStatus`, the batch button has no valid action. Writer must verify `getStatusConfig()` output for these orders.
2. **Fix 3B — Batch mutations:** Calling `mutate()` in a loop may cause race conditions with optimistic updates. Consider using `mutateAsync` sequentially.
3. **Fix 1A — billData dependency ordering:** Summary counts must be computed AFTER `billData` useMemo (line 1501) to access `billData.total` for the ЕЩЁ line.
4. **Fix 4B — onCloseRequest callback change:** Must update BOTH the button text in OrderGroupCard AND the callback at line 3893 in parent to always set `status: 'done'`.

## Prompt Clarity

- Overall clarity: 4/5
- Ambiguous Fix descriptions:
  - Fix 3: "completedOrders" terminology is confusing — described as "ready to serve, NOT truly served" but code `isFinishStage` implies these are at the LAST stage with no next action. The "Выдать все" button behavior is unclear for orders that have no `nextStageId`/`nextStatus`. Does isFinishStage mean "ready to serve" (penultimate) or "served" (final)? The variable naming and task description say "ready to serve" but the code flag name says "finish stage".
  - Fix 1: It's unclear whether the collapsed card should still show the loading spinner from the original Row 3 when items haven't loaded yet (needed to compute counts), since `activeOrders` and `completedOrders` don't depend on item loading — they depend on order status. The counts should be available immediately without waiting for items.
- Missing context:
  - Confirmation on whether `isFinishStage` orders have a valid `nextStageId`/`nextStatus` — critical for "Выдать все" implementation.
  - Whether `FileText` icon is available in the installed lucide-react version (likely yes, but not confirmed).
- Scope questions:
  - Fix 4B: Modifying the `onCloseRequest` callback at line 3893 (parent component level) — this is in the same file, assumed in scope.
  - Fix 1A: Should the emoji characters (🧾, 📞, ❗) be used in collapsed summary, or should icon components be used? Task says emoji, which is simpler and doesn't require icon rendering in a text line.
