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
| 260228-00 | 2026-02-28 | Phase 1 mobile UX: touch targets fix (BUG-OP-015). Action buttons 44px, reorder area 48px, overflow menu on mobile, channel filter/color picker enlarged. |
| 260228-01 | 2026-03-01 | Phase 1v2 CC+Codex: mobile reorder buttons moved to overflow menu (BUG-OP-016). All dropdown items min-h-[44px]. Codex verified. |

## UX Changelog
- **260228-01:** Мобильные кнопки перемещения (вверх/вниз) перенесены в overflow-меню (три точки) вместо отдельных маленьких кнопок. Все пункты меню увеличены до 44px. Проверено CC+Codex.
- **260228:** Кнопки редактирования/удаления этапов увеличены до 44px. Элементы перетаскивания расширены до 48px. На мобильном кнопка удаления скрыта в overflow-меню (три точки). Кнопки фильтра каналов и палитра цветов увеличены до 44px.
- **260224:** Deleting a stage now checks for active orders first and shows error if any exist. Fixed rare crash when stage create/delete was followed by rebalance failure. Prevented duplicate default stages from double-click.
