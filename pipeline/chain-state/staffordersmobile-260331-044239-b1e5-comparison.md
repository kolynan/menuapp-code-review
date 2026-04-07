# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-044239-b1e5

## Agreed (both found)

### 1. Fix 2 — `actionLabel` for finish-adjacent stage must be "Выдать"
- **CC (#1):** Identified exact line (~3032), noted `nextIsFinish` must be declared BEFORE the return statement (not inside object literal), provided concrete code with `getStageName(nextStage, t)` (actual function used, not raw `nextStage.name`).
- **Codex (#2):** Same finding — `actionLabel` still uses `→ ${getStageName(nextStage, t)}`, needs `nextIsFinish` guard. Same fix approach.
- **Verdict:** Full agreement. Use CC's detailed implementation (variable declared before return, dual check: `internal_code === 'finish'` OR last-index).

### 2. Fix 1 — Sub-grouping В РАБОТЕ by stage_id
- **CC (#2–#5):** Broke down into 4 implementation steps (A: prop passing, B: subGroups useMemo, C: per-sub-group expand state, D: render sub-sections). Provided complete code snippets for each step.
- **Codex (#1):** Single finding covering the same scope — `orderStages` prop missing, flat list needs sub-groups, expand state needs per-sub-group, flatten rule needed. Same locations cited.
- **Verdict:** Full agreement on what needs to change. CC provides more granular implementation detail.

### 3. Fix 3A — Dish items on separate rows (3 locations)
- **CC (#8):** Identified all 3 locations (lines 1757-1761, 1821-1825, 1882-1886), provided replacement JSX with `space-y-0.5` vertical list.
- **Codex (#3):** Same 3 locations (lines 1757-1760, 1821-1824, 1882-1885), same fix approach.
- **Verdict:** Full agreement. Identical fix.

### 4. Fix 3B — Action button moved from header to footer (3 locations)
- **CC (#9):** Identified header button locations (~1745-1754, 1809-1818, 1870-1879), provided footer button JSX. **Critically noted:** task description uses `updateStatusMutation?.isPending` but actual variable in `OrderGroupCard` is `advanceMutation` (line 1486).
- **Codex (#4):** Same locations (1745-1753, 1809-1817, 1870-1877), same approach — remove header buttons, add footer block.
- **Verdict:** Full agreement. CC's variable name correction (`advanceMutation` not `updateStatusMutation`) is critical for avoiding runtime crash.

## CC Only (Codex missed)

### 5. [P2] `slice(3)` bug in task description — should be `slice(2)` (CC #6)
- **Issue:** Task says `raw.startsWith('→ ') ? raw.slice(3) : raw`. The "→ " prefix is 2 characters (U+2192 + space), not 3. Using `slice(3)` would produce "отовится" instead of "Готовится".
- **Assessment:** VALID and important. Implementing the task description literally would produce garbled Russian text in sub-group buttons. **ACCEPTED.**

### 6. [P1] Step E contradiction with НЕ-должно-быть (CC #7)
- **Issue:** Step E says "show a section-level batch button in «В работе» header when 1 sub-group" but НЕ-должно-быть says "Do NOT add a top-level group action button to the «В работе» section header."
- **Assessment:** VALID contradiction. CC recommends following the НЕ constraint (no batch button in header) — when only 1 sub-group, render flat list without sub-headers and without header batch button. Each order's footer button (Fix 3) provides the action. **ACCEPTED — follow НЕ constraint.**

### 7. [P2] Russian pluralization for "блюд" (CC #10)
- **Issue:** Footer button label `Все ${n} блюд` — grammatically incorrect for 1 item (блюдо) and 2-4 items (блюда). Only correct for 0 or 5+.
- **Assessment:** Valid observation but P2 — task explicitly specifies the label format. Implementing pluralization is a refinement. **ACCEPTED as P2 — include if scope allows, not blocking.**

### 8. [P3] `Loader2` import confirmed (CC #11)
- **Assessment:** Informational only — confirms no import needed. Not a fix item.

## Codex Only (CC missed)

None. All Codex findings are covered by CC findings with more detail.

## Disputes (disagree)

None. Both reviewers agree on all fix locations, approaches, and priorities. No conflicting recommendations.

## Final Fix Plan

Ordered list of all fixes to apply (implementation order per task: Fix 2 first, then Fix 1, then Fix 3):

1. **[P1] Fix 2: Finish-stage actionLabel "Выдать"** — Source: agreed — Compute `nextIsFinish` before `return {}` in stage-mode branch of `getStatusConfig`. Change `actionLabel` to use ternary: `nextIsFinish ? 'Выдать' : '→ ${getStageName(nextStage, t)}'`. Location: ~line 3028-3032.

2. **[P1] Fix 1A: Pass `orderStages` prop** — Source: agreed — Add `orderStages={sortedStages}` at parent call site (~line 3984). Accept `orderStages = []` in `OrderGroupCard` signature (line 1301).

3. **[P1] Fix 1B: Build subGroups useMemo** — Source: agreed — After `inProgressOrders` definition (~line 1342), add `subGroups` memo that groups by `getLinkId(order.stage_id)`, sorts by descending stage index (closest-to-finish first), null → last.

4. **[P1] Fix 1C: Per-sub-group expand state** — Source: agreed — Add `expandedSubGroups` state object. Keep top-level `inProgressExpanded`. Auto-expand first sub-group when section opens.

5. **[P1] Fix 1D: Render sub-groups** — Source: agreed + CC-only — Replace flat `inProgressOrders.map(...)` (~lines 1849-1894) with `subGroups.map(...)`. Sub-group headers with stage name + count + "Все → [action]" button. **Use `slice(2)` not `slice(3)` for stripping "→ " prefix** (CC finding #6).

6. **[P1] Fix 1E: Flatten rule** — Source: agreed + CC-only — When `subGroups.length === 1`, render flat list without sub-group headers. Do NOT add batch button to top-level «В работе» header (following НЕ constraint per CC finding #7).

7. **[P1] Fix 3A: Vertical dish items (3 locations)** — Source: agreed — Replace `orderItems.map(...).join(', ')` at lines ~1757, ~1821, ~1882 with vertical `space-y-0.5` list.

8. **[P1] Fix 3B: Footer action button (3 locations)** — Source: agreed — Remove inline action buttons from card headers (~lines 1745, 1809, 1870). Add footer button after items list. **Use `advanceMutation.isPending` (not `updateStatusMutation`)** per CC finding #9.

9. **[P2] Russian pluralization for footer button** — Source: CC-only — Add inline ternary for "блюдо/блюда/блюд" based on count. Nice-to-have, not blocking.

## Summary
- Agreed: 4 items (Fix 2, Fix 1 full, Fix 3A, Fix 3B)
- CC only: 4 items (3 accepted: slice bug, Step E contradiction, pluralization; 1 informational: Loader2)
- Codex only: 0 items
- Disputes: 0 items
- **Total fixes to apply: 9** (7 P1 mandatory + 1 P2 accepted + 1 P2 nice-to-have)

## Key Implementation Risks
1. **`slice(2)` not `slice(3)`** — Using `slice(3)` from task description literally will garble Russian stage names
2. **`advanceMutation` not `updateStatusMutation`** — Wrong variable name causes runtime crash
3. **Step E: no header batch button** — Follow НЕ constraint, not Step E text
