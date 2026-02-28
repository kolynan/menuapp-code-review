# PartnerContacts

Partner contacts management page (LAB version). Allows restaurant owners to configure contact links (phone, WhatsApp, Instagram, etc.) shown in the guest menu header.

## Features
- View mode selector: icons-only or icon+text
- CRUD for contact links (PartnerContactLink entity)
- Link type badges with color coding
- Live preview of how contacts appear in menu header
- Sort order control for link positioning

## File Structure
- `partnercontacts1.jsx` — working copy (LAB, dev version with "1" suffix)
- `partnercontacts1_v1.2_RELEASE.jsx` — patched, ready for Base44
- `review_initial_260225.md` — initial code review report

## RELEASE History

| RELEASE | Date | Changes |
|---------|------|---------|
| 260228-00 | 2026-02-28 | Phase 1: i18n fallback wrapper + touch targets |
| 260225 | 2026-02-25 | Initial review: 7 bugs fixed (P0: 1, P1: 6) |

## UX Changelog

| Date | Change |
|------|--------|
| 2026-02-28 | i18n: все ключи теперь показывают читаемый текст вместо "partnercontacts.page_title". Кнопки действий увеличены до 44px для мобильных. |
| 2026-02-25 | Начальный ревью: починена ошибка error boundary, добавлен i18n во все строки, валидация sort_order, защита viewMode от сброса. |

## Note
UX discussion (Session 52) recommended eventually deprecating this page and redirecting to PartnerSettings > Contacts tab. For now, the page is functional with proper i18n fallbacks.
