# PartnerHome

**Route:** `/partnerhome`
**Type:** Partner dashboard (inside PartnerShell)
**Lines:** ~609

## Description
Dashboard page showing today's KPIs: open tables, order count, revenue by channel (hall/pickup/delivery). Includes onboarding checklist block (4 steps: menu, tables, channels, staff) with progress bar and completion state. 6 useQuery calls + useMemo for stats.

## Entities Used
- `Partner` — restaurant config + channel flags
- `TableSession` — active table sessions
- `Order` — orders (filtered client-side for today)
- `Dish` — menu items (onboarding step 1)
- `Table` — dining tables (onboarding step 2)
- `StaffAccessLink` — staff members (onboarding step 4)

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PH-001 (usePartnerAccess pattern) + BUG-PH-002 (session double-count). |
| 260301-02 | 2026-03-01 | BUG-6: Fixed tables banner routing (/staffordersmobile -> /partnertables). |
| 260305-00 | 2026-03-05 | Onboarding checklist block: 4-step progress, completion state, "open guest menu" button. |

## UX Changelog
- **260305:** Онбординг-чеклист "4 шага запуска" вверху дашборда: меню, столы, каналы, персонал. Прогресс-бар, кнопки CTA, состояние "все готово" с ссылкой на QR. Кнопка "Открыть гостевое меню" внизу блока.
- **260301:** Кнопка "Нет открытых столов" теперь ведёт на управление столами, а не на мобильный вид официанта.
- **260224:** Fixed "open tables" counter that was inflated by counting expired sessions as open.
