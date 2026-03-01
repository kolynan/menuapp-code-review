# ClientMessages — README

## Description
Client messages inbox for the MenuApp loyalty system. Displays messages from restaurants to the client, with expand/collapse interaction and automatic mark-as-read. Sorted by date (newest first).

## Entities Used
- `LoyaltyAccount` — to find accounts by customer email
- `ClientMessage` — messages linked to accounts (fields: title, body, is_read, partner, created_at)
- `Partner` — restaurant info for message sender display

## Key Components
- `useQuery` (×3) — accounts, messages, partners (chained queries)
- `useMutation` — mark message as read with optimistic update + rollback
- `formatMessageDate` — relative date formatting (today/yesterday/date)

## Routes
- `/clientmessages` — this page (reads email from localStorage)

## RELEASE History

| Version | Date | File | Notes |
|---|---|---|---|
| 260225-00 | 2026-02-25 | `260225-00 clientmessages RELEASE.jsx` | Initial review. 4 P1 bugs fixed (i18n, loading state, partner fallback, null guard). 8 P2/P3 documented. |
| 260228-00 | 2026-02-28 | `260228-00 clientmessages RELEASE.jsx` | All 8 remaining P2/P3 bugs fixed (CM-005..CM-012). 0 active bugs. |

## UX Changelog

### 260228-00 (P2/P3 Cleanup)
- **Исправлено:** queryKey сообщений теперь зависит от аккаунтов — обновления не теряются
- **Исправлено:** Мемоизация partnerIds — убраны лишние перезапросы партнёров
- **Исправлено:** Кнопка «назад» увеличена до 44px (Apple HIG) + добавлен aria-label
- **Исправлено:** Карточки сообщений доступны с клавиатуры (Enter/Space)
- **Исправлено:** Обработка ошибок запросов через useEffect (совместимость с React Query v5)
- **Исправлено:** Убран мёртвый код в проверке пустого списка
- **Исправлено:** Точка непрочитанного сообщения получила aria-label для незрячих пользователей

### 260225-00 (Initial Review)
- **Fixed:** Date labels "Сегодня"/"Вчера" now use i18n `t()` calls instead of hardcoded Russian
- **Fixed:** Locale changed from hardcoded `'ru-RU'` to browser default for date/time formatting
- **Fixed:** Loading spinner now shows while accounts load (previously showed "no messages" flash)
- **Fixed:** Partner name fallback changed from hardcoded `"..."` to `t('clientmessages.unknown_partner')`
- **Fixed:** Defensive null guard added in partners query to prevent potential crash
