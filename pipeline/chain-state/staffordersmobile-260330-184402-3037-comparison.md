# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260330-184402-3037

## Agreed (both found)

### 1. Fix 1 — [P1] Add inline action button to "НОВЫЕ" order rows (~line 1772)
Both CC and Codex agree: the right-side header in `newOrders.map(...)` has only Badge + `(!)` with no inline button. Both propose adding a blue `config.actionLabel`-guarded button with `e.stopPropagation()` calling `handleBatchAction([order])`.

**Use CC's patch** — it is more detailed and explicitly preserves the `(!)` span per task instruction ("keep it for now"). Codex's description is consistent but lacks the corrected code that retains `(!)`.

### 2. Fix 2 — [P1] Add inline action button to "ГОТОВО К ВЫДАЧЕ" order rows (~line 1827)
Both agree: `completedOrders.map(...)` renders only a Badge, needs an inline green button. Both propose wrapping in a `flex items-center gap-2` div.

**Use CC's ENHANCED patch** — CC identified a critical edge case: in stage mode, finish-stage orders have `config.actionLabel = null`, so the `{config.actionLabel && ...}` guard won't render the button. CC proposes `(config.actionLabel || config.isFinishStage)` with a fallback label ("Подано"/"Выдать") matching the group button's logic. Codex missed this edge case entirely. See "CC Only" section below for details.

### 3. Fix 3 — [P1] Add inline action button to "В РАБОТЕ" order rows (~line 1876)
Both agree: same pattern, amber-600 styling, `config.actionLabel` guard works correctly here (in-progress orders always have actionLabel). Both propose same structure.

**Use CC's patch** — complete code provided, consistent with Fix 1/2 pattern.

### 4. Fix 4 — [P1] Remove Block B bottom action button (~lines 1934–1957)
Both agree: remove the entire `{nextAction && (...)}` Block B JSX. Both note that `transitionText` useMemo should be checked for other usages and removed if Block B-only. Both agree `advanceMutation` must NOT be removed (used by inline buttons).

**Use CC's approach** — CC did the full grep analysis and confirmed:
- `transitionText` (lines 1601–1613): SAFE to remove — only used in Block B
- `handleAdvance` (lines 1503–1518): SAFE to remove — only called in Block B
- `nextAction` (lines 1474–1483): KEEP per task instruction, even though after cleanup it's only self-referential

Codex was more cautious ("re-check before deleting") but reached the same conclusion directionally.

## CC Only (Codex missed)

### CC-A. Stage-mode `actionLabel: null` edge case in Fix 2
CC discovered that `getStatusConfig` returns `actionLabel: null` for finish-stage orders in stage mode (line ~3052: `nextStage ? ... : null`). These orders appear in `completedOrders` (the "ГОТОВО К ВЫДАЧЕ" section). The group "Выдать все" button works via `handleBatchAction`'s `isFinishStage` fallback, but a simple `{config.actionLabel && ...}` guard would NOT render the per-order inline button.

**Verdict: ACCEPTED** — This is a real edge case. CC's enhanced condition `(config.actionLabel || config.isFinishStage)` with fallback label mirrors existing logic from `nextAction` useMemo (line 1480). Apply CC's enhanced version.

### CC-B. Explicit cleanup of `handleAdvance` function (lines 1503–1518)
CC identified `handleAdvance` as safe to remove (only caller is Block B line 1939). Codex mentioned "re-check" but didn't explicitly list it as a removal target.

**Verdict: ACCEPTED** — Removing dead code is correct. The merger should remove `handleAdvance` along with Block B and `transitionText`.

## Codex Only (CC missed)

None. Codex findings are a strict subset of CC findings (same 4 fixes, less detail).

## Disputes (disagree)

None. Both reviewers agree on all 4 fixes. The only difference is depth of analysis — CC provided complete code patches and found the stage-mode edge case; Codex confirmed the same issues at a higher level.

## Final Fix Plan

Ordered list of all fixes to apply:

1. **[P1] Fix 1 — Inline button in НОВЫЕ rows** — Source: AGREED (CC patch) — Add blue `config.actionLabel`-guarded button after Badge + `(!)` span in `newOrders.map(...)` right-side header (~line 1772). `e.stopPropagation()`, `handleBatchAction([order])`, `min-h-[36px]`, `bg-blue-600`.

2. **[P1] Fix 2 — Inline button in ГОТОВО К ВЫДАЧЕ rows** — Source: AGREED + CC ENHANCED — Wrap Badge in flex div, add green button in `completedOrders.map(...)` (~line 1827). Use enhanced condition: `(config.actionLabel || config.isFinishStage)` with fallback label `config.actionLabel || (group.type === 'table' ? 'Подано' : 'Выдать')`. `bg-green-600`.

3. **[P1] Fix 3 — Inline button in В РАБОТЕ rows** — Source: AGREED (CC patch) — Same pattern in `inProgressOrders.map(...)` (~line 1876). `config.actionLabel` guard (always set for in-progress). `bg-amber-600`.

4. **[P1] Fix 4 — Remove Block B + dead code cleanup** — Source: AGREED (CC analysis) — Remove three code sections:
   - (a) `transitionText` useMemo (lines 1601–1613)
   - (b) `handleAdvance` function (lines 1503–1518)
   - (c) Block B JSX (lines 1934–1957)
   - Keep: `nextAction` useMemo (per task instruction), `advanceMutation` (used by inline buttons)

## Summary
- Agreed: 4 items
- CC only: 2 items (2 accepted, 0 rejected) — stage-mode edge case + handleAdvance cleanup
- Codex only: 0 items
- Disputes: 0 items
- **Total fixes to apply: 4** (with CC enhancements incorporated into Fix 2 and Fix 4)
