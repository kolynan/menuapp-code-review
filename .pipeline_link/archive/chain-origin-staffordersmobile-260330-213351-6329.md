---
page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 3
agent: cc
chain_template: discussion-only
topic: UX sub-grouping of В РАБОТЕ section by partner stage (#211)
---

# UX Discussion: Sub-grouping «В РАБОТЕ» by partner stage (#211)

## Context

StaffOrdersMobile currently groups orders inside an expanded table card into 3 sections:
- **НОВЫЕ** — orders in `new` status → [Принять] per row + [Принять все] group button ✅ implemented
- **ГОТОВО К ВЫДАЧЕ** — orders in finish stage → [Выдать] per row + [Выдать все] group button ✅ implemented
- **В РАБОТЕ** — all remaining in-progress orders as a **flat list** ← this is the problem

The issue: partners can define custom stages (e.g. "Принято" → "Готовится" → "Готово к выдаче"). When a table has orders across multiple in-progress stages, «В РАБОТЕ» becomes a mixed, hard-to-scan list with no group-level actions.

## UX Spec (already agreed, ref: `ux-concepts/staff-orders-mobile.md`)

- **Решение #2**: Group orders by status inside table → natural workflow
- **Решение #5**: «Все → [next stage]» button per group header → mass action in 2 taps
- **Решение #10**: Section order by urgency: Запросы → Новые → Готово к выдаче → [per-stage, closest-to-done first] → Принято
- **Решение #11**: Collapsed by default: Готовится, Принято. Expanded: Запросы, Новые, Готово к выдаче.

## Current code structure (for reference)

In `OrderGroupCard` component (`staffordersmobile.jsx`):
- `newOrders` → Section «НОВЫЕ» (status = 'new')
- `completedOrders` → Section «ГОТОВО К ВЫДАЧЕ» (isFinishStage = true)
- `inProgressOrders` → Section «В РАБОТЕ» (everything else = flat list)

Partners define stages via `STATUS_FLOW` / `getStatusConfig`. Each order has a `stage_id` (or falls back to `status` string). The set of possible stages is dynamic — it depends on what the partner configured in B44.

## Discussion questions

Please analyze and provide recommendations for each:

**Q1 — Grouping logic**: How should `inProgressOrders` be split into sub-groups? Options:
  - (A) Group by `order.stage_id` — dynamically, one section per unique stage_id present
  - (B) Group by `getStatusConfig(order).label` — group by the display label
  - (C) Iterate `STATUS_FLOW` in order and create a section for each stage that has matching orders

Which approach is most robust given that stage_ids can be null (stage-mode edge case seen in SOM-S203-03)?

**Q2 — Section ordering**: How to sort the sub-sections within the expanded В РАБОТЕ area, so the most "urgent" (closest to delivery) appears first? Given that STATUS_FLOW is an ordered array from first stage to last:
  - Closest to final stage = highest priority = shown first (reverse STATUS_FLOW order)?
  - Or show in natural flow order (first accepted = shown first)?

**Q3 — Group header + button**: Each sub-section header should show:
  - Stage name (e.g. "ПРИНЯТО") + count
  - «Все → [next stage label]» button (ref: Решение #5)
  - Should this button be always visible or only appear when count > 1?

**Q4 — Collapsed/expanded default**: Per Решение #11, «Готовится» and «Принято» are collapsed by default, but «Готово к выдаче» is expanded. How to generalize this rule for dynamic stages? Suggested rule: expand only the stage closest to finish (1 sub-section), collapse all others?

**Q5 — Empty В РАБОТЕ**: If all in-progress orders happen to be in only 1 stage, should the section still be labeled «В РАБОТЕ» with 1 sub-group inside, or should we flatten it back to the current behavior?

**Q6 — Implementation risk**: The current `inProgressOrders` flat render is ~30 lines. Replacing it with dynamic sub-group rendering will likely be 60–80 lines. What are the regression risks relative to FROZEN UX items (Принять все / Выдать все / Request section / Bill section)? Any ordering concerns?

## Output format

For each question: short recommendation + 1-sentence rationale. Then provide a draft ASCII mockup of the expanded table card with 2 in-progress stages (e.g. ПРИНЯТО×2 and ГОТОВИТСЯ×3), showing the sub-group headers and buttons. Finally: estimated fix complexity (S/M/L) and recommended КС budget.

Context files (read-only): `ux-concepts/staff-orders-mobile.md`, `BUGS_MASTER.md`
