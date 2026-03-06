# PartnerClients

**Route:** `/partnerclients`
**Type:** Partner admin page (inside PartnerShell)
**Lines:** ~404

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
| 260306-04 | 2026-03-06 | pluralPoints() v3 — ROOT CAUSE: previous fixes edited wrong file (base/ vs root). Fixed the actual production file. |
| 260306-03 | 2026-03-06 | pluralPoints() v2 — hardcoded Russian (wrong file — base/ not production). |
| 260306-02 | 2026-03-06 | pluralPoints() v1 — added but bug persisted (B44 translations wrong). |
| 260306-01 | 2026-03-06 | translateDescription() — raw i18n keys in transaction history now show human-readable text with fallback mapping. CC+Codex reviewed. |
| 260224-00 | 2026-02-24 | Initial review. Fixed BUG-PC-001 thru PC-005: dual-modal crash, Russian locale, null safety, form reset, id safety. |

## UX Changelog
- **260306-04:** КОРНЕВАЯ ПРИЧИНА НАЙДЕНА: предыдущие фиксы редактировали `base/partnerclients.jsx`, а в B44 был задеплоен другой файл (корневой `partnerclients.jsx`), который использовал `t("clients.detail.points")` — всегда возвращал "Баллы". Теперь `pluralPoints()` добавлен в правильный файл.
- **260306-03:** Повторный фикс склонения "Баллы" — применён к неправильному файлу (base/).
- **260306-02:** Исправлено склонение "Баллы" (v1, не сработало — t() возвращал неправильные переводы).
- **260306:** Исправлено отображение типов транзакций: "loyalty.transaction.earn_order" теперь показывается как "Начислено за заказ" (и другие типы).
- **260224:** Fixed mail button on client card that opened both detail sheet and message dialog simultaneously. Dates now display in locale-neutral dd.MM.yyyy format. Message form clears when dialog is cancelled.
