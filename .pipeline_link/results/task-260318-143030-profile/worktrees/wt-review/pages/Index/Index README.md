# Index — Page README

## Description
Public landing page for MenuApp. Shows hero section with main CTA, 3 feature cards (QR menu, realtime orders, table management), bottom CTA section, and shared Footer component.

## Entities
None. This page has no data dependencies.

## Auth
Public page (no `PartnerShell`, no `usePartnerAccess`). Login button redirects via `base44.auth.redirectToLogin("/partnerhome")`.

## Key Components
- Hero section with 2 CTA buttons (create restaurant / login)
- 3 feature cards with icons from lucide-react
- CTA section with "start" button
- Header with login button
- Shared `<Footer />` component

## i18n Keys Used
- `index.header.login`
- `index.hero.title`, `index.hero.subtitle`, `index.hero.create_restaurant`, `index.hero.login`
- `index.features.qr_menu.title`, `index.features.qr_menu.description`
- `index.features.realtime_orders.title`, `index.features.realtime_orders.description`
- `index.features.table_management.title`, `index.features.table_management.description`
- `index.cta.title`, `index.cta.subtitle`, `index.cta.start`
- `toast.error`

---

## RELEASE History

| Version | Date | File | Notes |
|---------|------|------|-------|
| 260225-00 | 2026-02-25 | `260225-00 index RELEASE.jsx` | Initial review. Fixed: i18n (all 13 strings), error handling, unused import, double-click guard. |

## UX Changelog

### 260225-00 (Initial Review)
- All user-facing text now uses `t()` for i18n support
- Login buttons show toast error if auth service fails
- Login buttons disabled during redirect (prevents double-click)
