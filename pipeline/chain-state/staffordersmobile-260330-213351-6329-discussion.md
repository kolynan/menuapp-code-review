# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260330-213351-6329

## Context
This is a UX architecture discussion for task #211: sub-grouping the flat "В РАБОТЕ" section by partner-defined stages. No Comparator disputes — this is a design discussion step.

## Analysis of Current Code

**Current state** (lines 1340-1342 in StaffOrdersMobile.jsx):
```js
const newOrders = activeOrders.filter(o => getStatusConfig(o).isFirstStage);
const inProgressOrders = activeOrders.filter(o => !getStatusConfig(o).isFirstStage);
```

`inProgressOrders` is everything that is NOT first-stage and NOT finish-stage (finish = `completedOrders`). This flat list renders as a single collapsible "В работе (N)" section (lines 1837-1897).

**Stage system**: `getStatusConfig(order)` (line 3008) resolves stage via `stage_id → stagesMap` lookup. Each stage has: `label`, `color`, `actionLabel`, `nextStageId`, `isFirstStage`, `isFinishStage`, `isStageMode`. Stages are sorted by `sort_order`. `getStagesForOrder()` filters by channel (hall/pickup/delivery).

**Key data available per order in stage mode**: `stage_id`, stage index in `relevantStages`, `stage.sort_order`, `stage.color`, `stage.name`, `stage.internal_code`.

---

## Q1 — Grouping Logic

### Recommendation: Option (C) — Iterate `relevantStages` in order, create a section for each that has matching orders

**Rationale:**
- **(A) Group by `stage_id`** — Works but doesn't give ordering. You'd need a secondary sort anyway, and `stage_id` can be null for fallback-mode orders (SOM-S203-03 edge case).
- **(B) Group by display label** — Fragile. Two stages could theoretically have the same label. Labels are i18n-translated so grouping by label creates locale dependency.
- **(C) Iterate `relevantStages`** — Best approach because:
  1. `sortedStages` already gives canonical ordering by `sort_order`
  2. `getStagesForOrder()` already filters by channel
  3. Skips empty stages naturally (only render if orders exist)
  4. Handles the `stage_id === null` edge case by creating a "Прочее" fallback group

**Null stage_id handling:** Orders with `stage_id === null` but `status !== 'new'` (and not finish) fall into `inProgressOrders` today. For sub-grouping, create a catch-all bucket at the end: `"В обработке"` — these are legacy/edge-case orders.

**Implementation sketch:**
```js
const inProgressByStage = useMemo(() => {
  // Get stages relevant to this group's orders (channel-filtered)
  const sampleOrder = inProgressOrders[0];
  if (!sampleOrder) return [];
  const stages = getStagesForOrder(sampleOrder, sortedStages);

  // Build ordered sub-groups: skip first (=new) and last (=finish)
  const midStages = stages.slice(1, -1); // only in-progress stages
  const groups = [];
  const claimed = new Set();

  for (const stage of midStages) {
    const stageId = getLinkId(stage.id);
    const matching = inProgressOrders.filter(o => getLinkId(o.stage_id) === stageId);
    if (matching.length > 0) {
      groups.push({ stage, orders: matching, stageId });
      matching.forEach(o => claimed.add(o.id));
    }
  }

  // Catch-all for null stage_id or unmatched
  const unclaimed = inProgressOrders.filter(o => !claimed.has(o.id));
  if (unclaimed.length > 0) {
    groups.push({ stage: null, orders: unclaimed, stageId: null });
  }

  return groups;
}, [inProgressOrders, sortedStages, getStagesForOrder]);
```

---

## Q2 — Section Ordering

### Recommendation: Reverse STATUS_FLOW order (closest to finish = shown first)

**Rationale:** Matches Решение #10 — urgency-based ordering. An order in "Готовится" is closer to delivery than one in "Принято", so "ГОТОВИТСЯ" should appear above "ПРИНЯТО" in the expanded card.

Since `sortedStages` is sorted by `sort_order` (ascending: first→last), we iterate `midStages` in **reverse** order:

```js
const midStages = stages.slice(1, -1).reverse(); // closest-to-done first
```

This means the section order inside the expanded card becomes:
1. Запросы (service requests)
2. НОВЫЕ (first stage)
3. ГОТОВО К ВЫДАЧЕ (finish stage)
4. **ГОТОВИТСЯ** (closest to finish → highest urgency in-progress)
5. **ПРИНЯТО** (furthest from finish → lowest urgency in-progress)
6. Счёт / Закрыть стол

This aligns with the ASCII mockup in `staff-orders-mobile.md` line 100-106.

---

## Q3 — Group Header + Button

### Recommendation: Always show the "Все → [next stage]" button, regardless of count

**Format:** `ПРИНЯТО (2)  [Все → Готовится]`

**Rationale:**
- When count = 1, the button is equivalent to the per-row action button — but the group header button is a larger, more discoverable tap target. Hiding it when count=1 introduces inconsistency.
- The button label already contains the stage name, which serves as documentation ("what happens when I tap").
- Per UX Решение #5: "mass action in 2 taps" — the button should be persistent, and for 1 order it's "1 tap" (no confirmation needed per Решение #9: Принято → Готовится doesn't need confirm).

**Button color:** Use `stage.color` from the current stage (matching the badge), with 10% opacity background + full color text — same pattern as НОВЫЕ section's "Принять все" (blue-50/blue-600).

**Header collapsed state (when sub-section is collapsed):** Show `ПРИНЯТО (2) · Все → Готовится` as a single-line collapsed row with the button still accessible. This allows the waiter to advance all orders in a stage without expanding.

---

## Q4 — Collapsed/Expanded Default

### Recommendation: Expand only the sub-section closest to finish; collapse all others

**Rule:** Within the in-progress sub-groups, only the **first** group (after reverse ordering = closest to finish) is expanded by default. All others collapsed.

**Implementation:**
```js
// State: track expanded sub-groups
const [expandedStages, setExpandedStages] = useState(new Set());

// On first render / when inProgressByStage changes:
// Auto-expand the first (closest-to-finish) group
useEffect(() => {
  if (inProgressByStage.length > 0) {
    setExpandedStages(new Set([inProgressByStage[0].stageId]));
  }
}, [inProgressByStage.length]); // only on count change, not every poll
```

This generalizes Решение #11 naturally:
- If partner has 2 mid-stages (Принято, Готовится): Готовится expanded, Принято collapsed ✓
- If partner has 3 mid-stages (Принято, В работе, На раздаче): На раздаче expanded, others collapsed ✓
- If partner has only 1 mid-stage: it's expanded (same as current behavior) ✓

---

## Q5 — Single-Stage В РАБОТЕ

### Recommendation: Flatten to current behavior (no sub-group wrapper)

**Rule:** If `inProgressByStage.length === 1`, render exactly as today — single "В РАБОТЕ (N)" header with the stage's group action button. No nested sub-group header.

**If `inProgressByStage.length >= 2`**, render sub-groups each with their own header.

**Rationale:** For restaurants with simple 4-stage flows (Новый → Принят → Готово → Выдано), there's only 1 in-progress stage. Adding a sub-group wrapper with a single child is visual noise and a regression from the current clean layout.

**Implementation:**
```jsx
{inProgressOrders.length > 0 && inProgressByStage.length === 1 && (
  // Current render: single "В работе" section
  <CurrentInProgressSection ... />
)}
{inProgressOrders.length > 0 && inProgressByStage.length >= 2 && (
  // New render: sub-grouped sections
  <SubGroupedInProgressSections ... />
)}
```

---

## Q6 — Implementation Risk & Regression Analysis

### Estimated complexity: **M (Medium)**

**Lines affected:**
- Replace: lines 1837-1897 (60 lines of flat "В работе" render)
- Add: ~80-100 lines for sub-group render logic + state
- Add: ~15 lines for `inProgressByStage` memo
- Total delta: +35-55 lines net

**FROZEN UX items — no risk:**
- ✅ "Принять все" button (Section 1, НОВЫЕ) — untouched, separate section
- ✅ "Выдать все" button (Section 2, ГОТОВО К ВЫДАЧЕ) — untouched, separate section
- ✅ Service Requests section — rendered before order sections, untouched
- ✅ Bill Summary / Close Table — rendered after order sections, untouched
- ✅ Collapsed card layout — changes only affect expanded card content

**Potential regression risks:**
1. **`selectedOrder` state** — currently selects within flat `inProgressOrders`. With sub-groups, selection logic is the same (order.id match), no risk.
2. **`handleBatchAction`** — currently called on individual orders. Group-level "Все →" button would call `handleBatchAction(subGroup.orders)` — same signature, no risk.
3. **`inProgressExpanded` state** — currently single boolean. Must be replaced with `expandedStages: Set<stageId>`. This is the main refactor point.
4. **Polling updates** — new orders might shift between sub-groups on re-render. The `useEffect` for auto-expand should depend on `inProgressByStage.length`, not the array itself, to avoid flickering.
5. **Fallback mode** (`isStageMode: false`) — orders using `STATUS_FLOW` (no `stage_id`) will all land in the catch-all bucket. This is correct — they can't be sub-grouped.

### Recommended КС budget: **$12-15 (С5v2)**

The task involves:
- New `inProgressByStage` useMemo (~15 lines)
- Replace Section 3 render with conditional (single vs multi) (~80 lines)
- Add per-sub-group expand/collapse state
- Add "Все → [next]" button per sub-group header
- Frozen UX verification
- 1 file only (StaffOrdersMobile.jsx)

---

## Draft ASCII Mockup — Expanded Card with 2 In-Progress Stages

```
← Назад         Стол 22          2ч 10м

┌ Запросы (1) ─────────────── [Выполнено]
│ 🧾 Счёт · Гость 1 · 1м    [Выполнено]
└────────────────────────────────────────

┌ НОВЫЕ (2) ───────────── [Принять все]
│ ┌ Гость 1 · 22:21 ──────── [Принять]
│ │ New York Steak ×1
│ └──────────────────────────────────
│ ┌ Гость 2 · 22:24 ──────── [Принять]
│ │ Суп ×1
│ └──────────────────────────────────
└────────────────────────────────────────

┌ ГОТОВО К ВЫДАЧЕ (1) ──── [Выдать все]
│ ┌ Гость 1 · 20:48 ──────── [Подано]
│ │ Карбонара ×1
│ └──────────────────────────────────
└────────────────────────────────────────

┌ ГОТОВИТСЯ (3) ──── [Все → Готово к выд.]
│ ┌ Гость 2 · 21:15 ──── [→ Готово к выд.]
│ │ Пицца ×1, Салат ×1
│ └──────────────────────────────────
│ ┌ Гость 1 · 21:30 ──── [→ Готово к выд.]
│ │ Стейк ×1
│ └──────────────────────────────────
│ ┌ Гость 3 · 21:45 ──── [→ Готово к выд.]
│ │ Суши ×2
│ └──────────────────────────────────
└────────────────────────────────────────

├ ПРИНЯТО (2) ────── [Все → Готовится] [v]
│   2 заказа — свёрнуто
└────────────────────────────────────────

┌ Счёт: 12 450 ₸ ──────────────────────
│ Гость 1: 8 200 ₸  Гость 2: 4 250 ₸
└────────────────────────────────────────
[Закрыть стол]
```

**Key design points:**
- ГОТОВИТСЯ is expanded (closest to finish) — amber color scheme
- ПРИНЯТО is collapsed (furthest from finish) — slate color scheme
- Both have "Все → [next]" group buttons in header
- Per-row inline action buttons match the group action
- Section order: Запросы → Новые → Готово к выдаче → Готовится → Принято (urgency descending)

---

## Summary Table

| Q | Recommendation | Rationale |
|---|---------------|-----------|
| Q1 | Option C: iterate `relevantStages`, section per stage with orders | Gives canonical ordering, handles null stage_id via catch-all |
| Q2 | Reverse order (closest-to-finish first) | Matches Решение #10, urgency-based |
| Q3 | Always show "Все →" button (even count=1) | Consistency, larger tap target, discoverable |
| Q4 | Expand only closest-to-finish sub-group | Generalizes Решение #11 for any number of stages |
| Q5 | Flatten if only 1 sub-group (no wrapper) | Avoids visual noise for simple flows |
| Q6 | Medium complexity, $12-15 С5v2, low regression risk | Only Section 3 changes, FROZEN UX untouched |

## Estimated Fix Complexity: M (Medium)
## Recommended КС Budget: $12-15 (С5v2)
## Files: 1 (StaffOrdersMobile.jsx)
