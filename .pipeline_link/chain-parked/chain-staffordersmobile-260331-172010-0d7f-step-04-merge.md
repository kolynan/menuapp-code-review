---
chain: staffordersmobile-260331-172010-0d7f
chain_step: 4
chain_total: 4
chain_step_name: merge
page: StaffOrdersMobile
budget: 6.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260331-172010-0d7f
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260331-172010-0d7f-comparison.md
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260331-172010-0d7f-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/StaffOrdersMobile/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/StaffOrdersMobile/ with fixed items
   b. Update README.md in pages/StaffOrdersMobile/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260331-172010-0d7f"
   - git push
7. Write merge report to: pipeline/chain-state/staffordersmobile-260331-172010-0d7f-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260331-172010-0d7f

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# SOM Fix: Verb-first per-card buttons + Undo toast after «Выдать»

Reference:
- `ux-concepts/staff-orders-mobile.md` v2.2 (решения #19, #20 Phase 1)
- `BUGS_MASTER.md` SOM-S210-01
- `DECISIONS_INDEX.md` §8

Target file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines)

---

## Fix 1 — SOM-S210-01 (P1) [MUST-FIX]: Per-card footer button label — verb-first

### Сейчас
The per-card footer button inside each order card shows `«Все N блюд»` (e.g., «Все 2 блюда», «Все 1 блюдо») — no verb, the waiter does not understand what action will happen on tap.

Search pattern to find all 4 instances:
```
search for: `Все ${n} ${dishWord}`
```

Locations (approximate, verify with search):
- ~line 1808: НОВЫЕ section, per-card button
- ~line 1885: ГОТОВО К ВЫДАЧЕ section, per-card button
- ~line 1963: В РАБОТЕ section, single-subgroup render per-card button
- ~line 2053: В РАБОТЕ section, multi-subgroup render per-card button

All 4 instances have the identical pattern:
```jsx
n > 0
  ? `\u0412\u0441\u0435 ${n} ${dishWord}`
  : (config.actionLabel || '\u0412\u044B\u0434\u0430\u0442\u044C')
```

### Должно быть
Verb-first label using context from `config.isFinishStage` and `config.actionLabel`.

Replace all 4 instances with:
```jsx
n > 0
  ? config.isFinishStage
    ? `\u0412\u044B\u0434\u0430\u0442\u044C \u0432\u0441\u0451 (${n})`
    : `${(config.actionLabel || '').replace(/^\u2192\s*/, '')} \u0432\u0441\u0451 (${n})`
  : (config.isFinishStage
      ? '\u0412\u044B\u0434\u0430\u0442\u044C'
      : config.actionLabel || '\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435')
```

Result examples:
- НОВЫЕ (actionLabel=«Принять», isFinishStage=false) → «Принять всё (2)»
- В РАБОТЕ / В работу stage → «В работу всё (2)»
- В РАБОТЕ / Готовится stage → «Готовится всё (2)»
- ГОТОВО К ВЫДАЧЕ (isFinishStage=true) → «Выдать всё (2)»
- Edge case n=0 → keep actionLabel text (already correct)

Ref: UX решение #20 Phase 1: «кнопка подписана: явно обозначает что действие = per-order». Решение #19: «finish-stage кнопка = action verb».

### НЕ должно быть
- `Все ${n} ${dishWord}` (without verb) — REMOVE from all 4 locations
- Do NOT add dish count plural forms (`блюдо/блюда/блюд`) — replaced by `(N)` format
- Do NOT change the group-header buttons «Принять все» (line ~1758) and «Выдать все» (line ~1838) — those are FROZEN (see below)
- Do NOT change sub-group header button format `Все → ${actionName}` (line ~2005) — FROZEN

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Component: `TableCard` (search: `function TableCard` or `const TableCard`)
Pattern to grep: `\u0412\u0441\u0435 \${n} \${dishWord}`
All 4 instances in sections: НОВЫЕ (~1808), ГОТОВО К ВЫДАЧЕ (~1885), В РАБОТЕ flat (~1963), В РАБОТЕ subgroup (~2053)

NOTE: Russian strings in this file are encoded as `\uXXXX` unicode escapes. New strings must follow the same pattern.

### Уже пробовали
First time — no history of failure. New fix.

### Проверка
1. Open any table with orders in НОВЫЕ section → expand → per-card footer button shows «Принять всё (1)» or «Принять всё (2)» etc.
2. Open table with ГОТОВО К ВЫДАЧЕ orders → button shows «Выдать всё (N)»
3. Open table with В РАБОТЕ orders → button shows «[stage_name] всё (N)»

---

## Fix 2 — SOM-S210-01-UNDO (P1) [MUST-FIX]: Undo toast 5s after «Выдать всё»

### Сейчас
When the waiter taps «Выдать всё (N)» (or the group header «Выдать все», or single-order finish-stage action), the order advances to `served` immediately with no way to undo. Accidental taps cause incorrect order state.

`handleBatchAction` is at ~line 1541. For `isFinishStage` orders it sets `payload.status = 'served'` and calls `advanceMutation.mutate(...)`.

### Должно быть
After any finish-stage action fires (whether from per-card «Выдать всё (N)» button, from group header «Выдать все», or from single-order inline finish button), show an **undo toast** for 5 seconds:

```
[ Выдан гостю · Отменить ]
```

**Implementation spec:**

1. **New state** (add near other state declarations):
```jsx
const [undoToast, setUndoToast] = useState(null);
// { snapshots: [{orderId, prevStatus, prevStageId}], timerId }
```

2. **Capture snapshot before mutation** in `handleBatchAction`:
   - Before calling `advanceMutation.mutate`, snapshot each `isFinishStage` order: `{ orderId: order.id, prevStatus: order.status, prevStageId: getLinkId(order.stage_id) }`
   - If the batch contains any finish-stage orders, after all mutations: clear existing undo timer, set new undoToast state with snapshots + `setTimeout(5000, () => setUndoToast(null))`

3. **Undo handler** `handleUndo`:
```jsx
const handleUndo = () => {
  if (!undoToast) return;
  clearTimeout(undoToast.timerId);
  undoToast.snapshots.forEach(({ orderId, prevStatus, prevStageId }) => {
    const restorePayload = {};
    if (prevStageId) restorePayload.stage_id = prevStageId;
    if (prevStatus) restorePayload.status = prevStatus;
    advanceMutation.mutate({ id: orderId, payload: restorePayload });
  });
  setUndoToast(null);
};
```

4. **Toast UI** — render at the **bottom of the expanded table card** (after the sections, before closing `</div>`):
```jsx
{undoToast && (
  <div className="flex items-center justify-between bg-slate-800 text-white text-xs rounded-lg px-3 py-2 mt-2">
    <span>{'\u0412\u044B\u0434\u0430\u043D \u0433\u043E\u0441\u0442\u044E'}</span>
    <button
      onClick={handleUndo}
      className="font-semibold text-amber-300 ml-4 min-h-[36px] px-2"
    >
      {'\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C'}
    </button>
  </div>
)}
```

### НЕ должно быть
- Do NOT delay the actual API mutation (mutate fires immediately, undo = reverse mutation)
- Do NOT show undo toast for non-finish-stage actions (only for `isFinishStage=true` orders)
- Do NOT block other actions while toast is visible (toast is informational)

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Function `handleBatchAction`: search `const handleBatchAction` (~line 1541)
State declarations: add `undoToast` near `expandedSubGroups` or other state hooks
Toast render: search for end of В РАБОТЕ section, or render at bottom of the expanded table area

### Уже пробовали
First time — no history of failure. New feature.

### Проверка
1. Open table with ГОТОВО К ВЫДАЧЕ order → tap «Выдать всё (N)» → toast appears: «Выдан гостю · Отменить»
2. Wait 5 seconds → toast auto-dismisses
3. Repeat → tap «Отменить» within 5s → order reverts to previous status, toast disappears
4. Non-finish-stage actions (e.g., «Принять всё (N)») → NO toast appears

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Modify ONLY code described in Fix 1 and Fix 2 sections above.
- ALL other UI, layout, behavior, colors — DO NOT TOUCH.
- If you see a problem NOT in these fixes — SKIP, do not fix.

## FROZEN UX (DO NOT CHANGE)

These elements are approved and tested. Do NOT modify, remove, reposition, or restyle them:

- **Group header buttons**: «Принять все» (~line 1758) and «Выдать все» (~line 1838) — labels already have verb, keep as-is
- **Sub-group header button**: `Все → ${actionName}` (~line 2005) — format correct, keep as-is
- **Inline per-row action buttons**: `config.actionLabel` text (→ Принято, → Готовится, → Выдать) — FROZEN (#168-SOM ✅ Tested S207)
- **Section structure**: ЗАПРОСЫ (top) → НОВЫЕ → ГОТОВО К ВЫДАЧЕ → В РАБОТЕ — DO NOT REORDER
- **В РАБОТЕ sub-grouping**: sub-section headers, ChevronDown expand/collapse, expandedSubGroups state — FROZEN (#211 ✅ Tested S207)
- **Auto-expand first sub-group**: useEffect that sets first subGroup expanded=true — FROZEN (SOM-S208-01 ✅ Tested S210)
- **Close table blocking**: disabled button when unaccepted orders exist — FROZEN (#173-SOM ✅ Tested S208)
- **Service requests section**: «ЗАПРОСЫ» block at top, «Выполнено» button removes request — FROZEN (#167-SOM ✅ Tested S203)
- **Collapsed card summary**: «СЕЙЧАС / ЕЩЁ» format — FROZEN (#164-SOM ✅ Tested S203)
- **«Стол» guard**: `startsWith` check to prevent «Стол Стол N» — FROZEN (SOM-S203-02 ✅ Tested S207)
- **Status advancing logic** (derivedNextStatus, position-based): do NOT change handleBatchAction core logic, only ADD snapshot capture and toast trigger — FROZEN (PM-158 ✅ Tested S197)
- **Block B removed**: do NOT re-add — FROZEN (#168-SOM-BlockB ✅ Tested S207)

## Implementation Notes

- File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- All new Russian user-facing strings MUST use `\uXXXX` unicode escapes (existing code convention — see all current labels)
- `getLinkId` helper already exists in the file (search `getLinkId`) — use it to capture `prevStageId`
- `advanceMutation` already handles optimistic updates with rollback on error — undo just sends reverse mutation
- For `clearTimeout` on undo toast: store timerId in undoToast state, clear on both manual undo and auto-dismiss
- Memory leak guard: clear timerId in `useEffect` cleanup if component unmounts

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Touch targets >= 44x44px (undo toast «Отменить» button: min-h-[36px] is acceptable for small toast)
- [ ] Toast visible above bottom navigation, not obscured
- [ ] Per-card buttons with new «всё (N)» format fit within card width
- [ ] No text overflow on long stage names (use truncation if needed)
- [ ] No duplicate visual indicators

## Regression Check (MANDATORY after implementation)

These existing behaviors must continue working after this fix:
- [ ] Group header «Принять все» and «Выдать все» labels unchanged
- [ ] Inline per-row buttons (→ Принято, → Готовится) fire correct mutations unchanged
- [ ] В РАБОТЕ sub-groups expand/collapse correctly
- [ ] First sub-group of В РАБОТЕ auto-expands on table open
- [ ] Service requests «Выполнено» button removes request
- [ ] Close table button is disabled when unaccepted orders exist
- [ ] handleBatchAction still advances orders correctly (no accidental undo triggered for non-finish-stage)

## Git

```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "fix(SOM): verb-first per-card buttons + undo toast after serve"
```
=== END ===
