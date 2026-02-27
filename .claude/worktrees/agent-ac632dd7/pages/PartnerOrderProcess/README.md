# PartnerOrderProcess

**Route:** `/partnerorderprocess`
**Type:** Partner settings page (inside PartnerShell)
**Lines:** ~1199

## Description
Order processing pipeline configuration. CRUD for OrderStage entities with drag-and-drop (desktop) and move buttons (mobile). Stage lifecycle: start (locked) → middle stages (editable, reorderable) → finish (locked). Features rate-limit handling, sort_order rebalancing (ORDER_STEP=10), channel filtering, and role-based access per stage.

## Entities Used
- `OrderStage` — pipeline stages (CRUD)
- `Order` — checked before stage deletion to prevent orphans

## Sub-components (7)
- `PipelinePreview` — visual pipeline with colored circles
- `ChannelFilter` — hall/pickup/delivery filter tabs
- `StageRow` — single stage row with drag/move/edit/delete
- `EditStageDialog` — create/edit stage form
- `DeleteConfirmDialog` — delete confirmation with warning
- `EmptyState` — initial setup prompt
- `OrderProcessContent` — main logic container

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-OP-001 thru OP-005: rebalance error handling (P0), orphan check, double invalidation, double-click race, silent error swallow. |

## UX Changelog
- **260224:** Deleting a stage now checks for active orders first and shows error if any exist. Fixed rare crash when stage create/delete was followed by rebalance failure. Prevented duplicate default stages from double-click.
