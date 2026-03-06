# PartnerClients

**Route:** `/partnerclients`
**Type:** Partner admin page (inside PartnerShell)
**Lines:** ~386

## Description
Loyalty client management page. Lists all loyalty accounts with search, shows client detail in a side sheet (transactions + reviews), and allows sending messages via dialog. 4 useQuery with dependencies, 1 useMutation for messaging.

## Entities Used
- `LoyaltyAccount` — client loyalty records
- `LoyaltyTransaction` — point earning/spending history
- `DishFeedback` — dish reviews by clients
- `Dish` — for dish name resolution
- `ClientMessage` — messages to clients

## RELEASE History

| Version | Date | Changes |
|---------|------|---------|
| 260306-02 | 2026-03-06 | pluralPoints() — "1 Баллы" исправлено на правильное склонение (1 Балл, 2 Балла, 5 Баллов). CC+Codex reviewed. |
| 260306-01 | 2026-03-06 | translateDescription() — raw i18n keys in transaction history now show human-readable text with fallback mapping. CC+Codex reviewed. |
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PC-001 thru PC-005: dual-modal crash, Russian locale, null safety, form reset, id safety. |

## UX Changelog
- **260306-02:** Исправлено склонение "Баллы" — теперь показывает "1 Балл", "2 Балла", "5 Баллов" в детальном модале клиента.
- **260306:** Исправлено отображение типов транзакций: "loyalty.transaction.earn_order" теперь показывается как "Начислено за заказ" (и другие типы).
- **260224:** Fixed mail button on client card that opened both detail sheet and message dialog simultaneously. Dates now display in locale-neutral dd.MM.yyyy format. Message form clears when dialog is cancelled.
