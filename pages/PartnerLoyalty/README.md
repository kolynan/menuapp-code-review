# PartnerLoyalty

**Route:** `/partnerloyalty`
**Type:** Partner settings page (inside PartnerShell)
**Lines:** ~397

## Description
Loyalty program configuration: bonus point earn rates, review rewards, redemption rules, expiry settings, instant discount toggle. Also shows loyalty statistics. useEffect syncs form with Partner data, batch save via single useMutation.

## Entities Used
- `Partner` — stores all loyalty configuration fields
- `LoyaltyAccount` — for statistics
- `DishFeedback` — for review count statistics

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260301-00 | 2026-03-01 | Phase 1v2: sticky save bar visual active state (shadow when unsaved changes), horizontal padding, all 6 Input fields raised to 44px. CC+Codex verified. |
| 260228-00 | 2026-02-28 | Phase 1 UX: sticky save button, checkbox/button touch targets 44px minimum. |
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PL-001 thru PL-003: form reset on refetch, hasChanges detection, NaN validation. |

## UX Changelog
- **260301:** Панель сохранения теперь визуально выделяется тенью когда есть несохраненные изменения. Добавлены боковые отступы для мобильных. Все 6 полей ввода чисел увеличены до 44px.
- **260228:** Кнопка "Сохранить" теперь всегда видна внизу экрана на мобильных (sticky). Чекбоксы и кнопка увеличены до 44px для удобного нажатия на телефоне. Кнопка на мобильных — во всю ширину.
- **260224:** Fixed form that silently lost unsaved edits when browser tab regained focus. Save button now correctly enables for all field changes. Invalid numeric values are now blocked before save.
