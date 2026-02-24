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
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PC-001 thru PC-005: dual-modal crash, Russian locale, null safety, form reset, id safety. |

## UX Changelog
- **260224:** Fixed mail button on client card that opened both detail sheet and message dialog simultaneously. Dates now display in locale-neutral dd.MM.yyyy format. Message form clears when dialog is cancelled.
