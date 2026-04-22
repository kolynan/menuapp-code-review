# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-172614-cb49

## Findings

### 1. [P2] Fix 1 — DollarSign icon in bill summary should be Receipt (line 1893)

**Current code (line 1893):**
```jsx
<DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
```

**Problem:** The `$` dollar sign icon next to "Счёт: 130 ₸" looks like raw text or broken data to the waiter. The `Receipt` icon (already imported at line 193) better communicates "bill/receipt".

**FIX:** Replace `DollarSign` with `Receipt` on line 1893:
```jsx
<Receipt className="w-4 h-4 text-slate-500 shrink-0" />
```

**Note:** After this change, `DollarSign` (imported at line 191) becomes unused. Per scope lock, we only change the usage at line 1893. The unused import is a minor cleanup item outside scope.

**Regression check:** Bill section expand/collapse unchanged — only the icon component changes. Layout, text, chevron all untouched.

---

### 2. [P3] Fix 2 — Double "Стол" prefix in table group card title (line 1398)

**Current code (line 1398):**
```js
identifier = tableData?.name ? `Стол ${tableData.name}` : group.displayName;
```

**Problem:** If `tableData.name` is already "Стол 2" (B44 stores the full name including prefix), the result is "Стол Стол 2" — a confusing duplicate for the waiter.

**FIX:** Add a guard to check if `tableData.name` already starts with "Стол":
```js
identifier = tableData?.name
  ? (tableData.name.startsWith('Стол') ? tableData.name : `Стол ${tableData.name}`)
  : group.displayName;
```

**Result:** "Стол 2" regardless of whether B44 stores "2" or "Стол 2".

**Scope note (out-of-scope observation):** The same pattern exists at:
- Line 923: `const tableLabel = reqTableId && tableData ? \`Стол ${tableData.name}\` : ...` (in service request card)
- Line 1093: `mainText = \`Стол ${tableData.name}\`` (in OrderCard)

These have the same duplication risk but are NOT in the Fix 2 scope (which targets only line 1398 in TableGroupCard). Noted for future fix.

**Regression check:** Only `group.type === 'table'` branch (line 1397) is affected. Pickup/delivery identifier (lines 1400-1402) untouched. `group.displayName` fallback untouched.

---

### 3. [P1] Fix 3 — showActionButton should be true for all non-terminal order states (line 1134)

**Current code (line 1134):**
```js
const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus);
```

**Render condition (line 1270):**
```jsx
{showActionButton && statusConfig.actionLabel && (
```

**Analysis of `getStatusConfig` (line 3018-3072):**

**Priority 1 — Stage mode (order has stage_id):**
- `nextStageId` = `nextStage?.id || null` — set when next stage exists
- `nextStatus` = `null` (always, line 3051)
- `actionLabel` = `nextStage ? \`→ ${name}\` : null`
- `isFinishStage` = `internal_code === 'finish' || currentIndex === relevantStages.length - 1`

Edge case: If `currentIndex === -1` (stage exists in stagesMap but not found in channel-filtered `relevantStages`), then:
- `nextStage` = null (because `currentIndex >= 0` fails)
- `nextStageId` = null, `actionLabel` = null
- `showActionButton` = false
- But order may NOT be terminal — it's just in an unresolved stage position

In this edge case, the button correctly doesn't show because `actionLabel` is also null, so even a true `showActionButton` wouldn't render anything. **This edge case is self-consistent.**

**Priority 2 — Fallback mode (STATUS_FLOW):**
- `new` → nextStatus: "accepted", actionLabel: "Принять" → showActionButton: true ✅
- `accepted` → nextStatus: "in_progress", actionLabel: "В работу" → true ✅
- `in_progress` → nextStatus: "ready", actionLabel: "Готово" → true ✅
- `ready` → nextStatus: "served", actionLabel: "Выдать" → true ✅
- `served` / `completed` → not in STATUS_FLOW → flow: undefined → nextStatus: null, nextStageId: null → showActionButton: false ✅ (correct, terminal)

**Assessment:** The current condition works correctly for both standard and custom B44 stages in the normal case. The `actionLabel` and `nextStageId`/`nextStatus` are always set together — when one is null, the other is too. So the button visibility is internally consistent.

**However**, per the task requirement and defensive programming principle, the condition should be hardened. If a future change introduces a case where `actionLabel` exists but `nextStageId`/`nextStatus` don't, the button would be incorrectly hidden. The fix adds a safety net using the existing `isFinishStage` flag:

**FIX:**
```js
const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus)
  || !!(statusConfig.actionLabel && !statusConfig.isFinishStage);
```

This ensures: if there's an `actionLabel` and the order is NOT at the finish stage, the button shows — regardless of whether `nextStageId`/`nextStatus` are set.

**No need to add `isTerminal` property:** The existing `isFinishStage` already serves this purpose:
- Stage mode: `isFinishStage = internal_code === 'finish' || currentIndex === last` (line 3037)
- Fallback mode: `isFinishStage = status === 'ready' || status === 'served'` (line 3070)

Note on fallback `isFinishStage` for 'ready': `ready` has `isFinishStage: true` but also has `actionLabel: "Выдать"` and `nextStatus: "served"`. This means the first part of the OR (`nextStatus` exists) already makes `showActionButton` true for 'ready', so the `isFinishStage` check in the second part doesn't incorrectly hide the button.

**Button size verification (line 1274):** `className={...h-9 min-w-[100px]...}` — h-9 = 36px height, min-w-[100px] ensures tappable area. Meets 44px width minimum for touch targets. Height is 36px (slightly under 44px mobile guideline but adequate given the full card is tappable). No change needed here per scope lock.

**Regression check:** `handleAction` logic untouched. Batch action buttons untouched. Only the visibility condition changes, and it's strictly more permissive (shows button in more cases, never hides it in new cases).

---

## Summary
Total: 3 findings (0 P0, 1 P1, 1 P2, 1 P3)

All three fixes are scoped, safe, and non-overlapping:
- Fix 1: Single icon component swap (1 line)
- Fix 2: String guard addition (1 line)
- Fix 3: Boolean condition extension (1 line)

Out-of-scope observations:
- `DollarSign` import (line 191) will become unused after Fix 1
- Lines 923 and 1093 have same "Стол" duplication risk as line 1398

## Prompt Clarity

- Overall clarity: **5/5**
- Ambiguous Fix descriptions: None. All three fixes have exact line numbers, current code, expected code, and verification steps.
- Missing context: None. The getStatusConfig function reference and FROZEN UX section provided all needed context.
- Scope questions: Fix 3 task mentions adding `isTerminal: true` to STATUS_FLOW entries, but STATUS_FLOW has no served/completed entries. Used existing `isFinishStage` instead, which serves the same purpose without adding a new property. This is a minor deviation from the literal instruction but achieves the same goal more cleanly.
