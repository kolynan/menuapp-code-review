# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-184402-3037

## Findings

### Fix 1 — [P1] Add inline action button to each order row in "НОВЫЕ" section

**Current code (lines 1772–1775):**
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  <span className="text-red-500 text-sm font-bold">(!)</span>
</div>
```

**FIX:** Replace lines 1772–1775 with:
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  {config.actionLabel && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel}
    </button>
  )}
</div>
```

**Notes:**
- `config.actionLabel` is always set for "new" status orders (value: "Принять" from STATUS_FLOW, or "→ StageName" in stage mode). The conditional guard is still good practice.
- `e.stopPropagation()` prevents the parent div's `onClick={() => setSelectedOrderId(order.id)}` from firing.
- `handleBatchAction([order])` correctly handles single-order arrays — builds payload from `getStatusConfig(order)` and calls `advanceMutation.mutate`.
- The `(!)` span is removed per the replacement, but per task instructions we should keep it. **Correction:** Re-reading the task — it says "keep it for now as it's urgency signal". So we should keep the `(!)` span. Updated fix below:

**CORRECTED FIX:** Replace lines 1772–1775 with:
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  <span className="text-red-500 text-sm font-bold">(!)</span>
  {config.actionLabel && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel}
    </button>
  )}
</div>
```

**Mobile-first check:**
- `min-h-[36px]` meets the 36px touch target requirement for secondary tappable.
- `px-3` gives ~48px+ width for short labels like "Принять" — fits on 375px screen alongside guest name + time + badge + (!).
- However, in stage mode `actionLabel` = "→ StageName" which could be long. The `text-xs` + `px-3` should still fit, but worth noting. No truncation needed for typical stage names.

---

### Fix 2 — [P1] Add inline action button to each order row in "ГОТОВО К ВЫДАЧЕ" section

**Current code (line 1827):**
```jsx
<Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
```

Note: Section 2 right side (line 1827) has only a `<Badge>` — no wrapping `<div>`. This is different from Section 1. The Badge is a direct child of `<div className="flex items-center justify-between mb-1">` (line 1822).

**FIX:** Replace line 1827:
```jsx
<Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
```
with:
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  {config.actionLabel && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel}
    </button>
  )}
</div>
```

**Notes:**
- Need to wrap in a `<div>` to maintain flex layout since currently Badge is a standalone element.
- Green-600 color for "ГОТОВО К ВЫДАЧЕ" section per spec.
- For "ready" status, `actionLabel` = "Выдать" from STATUS_FLOW (or stage-mode equivalent). For `isFinishStage` in stage mode, `actionLabel` = null (line 3052: `nextStage ? ... : null`). This means finish-stage orders in "ГОТОВО К ВЫДАЧЕ" won't show a button. This is actually correct behavior: `completedOrders` are orders where `config.isFinishStage === true`, and in stage mode, finish-stage orders have `actionLabel: null` and `nextStageId: null`. However, `handleBatchAction` has a special case (line 1531-1533): `if (config.isFinishStage) { payload.status = 'served'; }`. So the group "Выдать все" button works because it iterates all completedOrders regardless. But the per-order button won't show because `config.actionLabel` is null for finish-stage in stage mode!

**ISSUE:** In stage mode, `completedOrders` (finish-stage orders) have `config.actionLabel = null`, so `{config.actionLabel && ...}` will NOT render the inline button. The "Выдать все" group button works via the `isFinishStage` fallback in `handleBatchAction`, but individual buttons need an explicit label.

**ENHANCED FIX:** Use a computed label that falls back for finish-stage:
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  {(config.actionLabel || config.isFinishStage) && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel || (group.type === 'table' ? '\u041F\u043E\u0434\u0430\u043D\u043E' : '\u0412\u044B\u0434\u0430\u0442\u044C')}
    </button>
  )}
</div>
```
This mirrors the logic from `nextAction` useMemo (line 1480): `if (config.nextStatus === 'served') label = group.type === 'table' ? 'Подано' : 'Выдать'`. For finish-stage in stage mode, we use the same fallback label.

---

### Fix 3 — [P1] Add inline action button to each order row in "В РАБОТЕ" section

**Current code (line 1876):**
```jsx
<Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
```

Same structure as Section 2 — Badge is standalone, no wrapping div.

**FIX:** Replace line 1876:
```jsx
<Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
```
with:
```jsx
<div className="flex items-center gap-2">
  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${config.badgeClass || ''}`} style={badgeStyle}>{config.label}</Badge>
  {config.actionLabel && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel}
    </button>
  )}
</div>
```

**Notes:**
- Amber-600 for "В РАБОТЕ" section per spec.
- In-progress orders always have `actionLabel` (either from STATUS_FLOW or stage mode `→ NextStage`), so `config.actionLabel &&` guard works correctly here.
- No group-level button exists for this section (only collapse chevron), which is correct per spec.

---

### Fix 4 — [P1] Remove Block B bottom action button

**Current code (lines 1934–1957):**
```jsx
{/* ═══ Block B — Action Button ═══ */}
{nextAction && (
  <div>
    <button ... onClick={handleAdvance} ...>{...}</button>
    {transitionText && (<p ...>{transitionText}</p>)}
    {advanceMutation.isPending && (<p ...>Сохраняем...</p>)}
  </div>
)}
```

**FIX:** Remove the entire Block B section (lines 1934–1957). Also remove `transitionText` useMemo (lines 1601–1613) since it is only used inside Block B (confirmed by grep: only defined at 1602 and used at 1950–1951).

**Can safely remove:**
- `transitionText` useMemo (lines 1601–1613) — only used in Block B (lines 1950–1951)
- `handleAdvance` function (lines 1503–1518) — only used in Block B (line 1939)
- Block B JSX (lines 1934–1957)

**Must NOT remove:**
- `nextAction` useMemo (lines 1474–1483) — used by `handleAdvance` AND by `transitionText`, but also potentially useful for `isHighlighted` logic. Grep shows `nextAction` referenced at lines 1474, 1504, 1505, 1603, 1604, 1613, 1935, 1942, 1947. After removing Block B (1935, 1942, 1947), `transitionText` (1603, 1604, 1613), and `handleAdvance` (1504, 1505), the only remaining reference is the definition itself (1474). So `nextAction` could technically be removed too. **However**, the task says "Do NOT remove nextAction useMemo — it may be used elsewhere." Follow the task instruction: keep `nextAction`.
- `advanceMutation` — used by Fix 1-3 inline buttons via `handleBatchAction`.

**Cleanup summary:**
1. Remove lines 1601–1613 (`transitionText` useMemo)
2. Remove lines 1503–1518 (`handleAdvance` function)
3. Remove lines 1934–1957 (Block B JSX section including comment)

---

## Summary
Total: 4 findings (0 P0, 4 P1, 0 P2, 0 P3)

**Key insight for Fix 2:** In stage mode, finish-stage orders have `config.actionLabel = null`. The per-order inline button needs a fallback label (`config.isFinishStage` check with "Подано"/"Выдать" label) to match the "Выдать все" group button behavior. Without this, the inline button won't render for stage-mode finish-stage orders in the "ГОТОВО К ВЫДАЧЕ" section.

## Prompt Clarity
- Overall clarity: 5/5
- Ambiguous Fix descriptions: None — all 4 fixes are clearly specified with exact line numbers, before/after code, and file locations.
- Missing context: None significant. The `getStatusConfig` return shape was discoverable from code. The stage-mode `actionLabel: null` for finish-stage was the only non-obvious interaction, found by reading getStatusConfig.
- Scope questions: Fix 4 says "remove transitionText if only used in Block B" and "do NOT remove nextAction" — both are clear. The task correctly flags that handleAdvance/transitionText should be checked for other usages before removal.
