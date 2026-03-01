# Admin456

Admin Hub — navigation page linking to TranslationAdmin and AdminPartners.

## Overview
- **Route:** `/admin456`
- **Type:** Admin page (internal)
- **Entities:** None
- **Access:** ADMIN_EMAILS whitelist + `base44.auth.me()`
- **Dependencies:** `useI18n` for translations

## Features
- Admin authentication with email whitelist
- Navigation cards linking to:
  - Translation Admin (`/translationadmin`)
  - AdminPartners (`/adminpartners`)
- Access denied screen for non-admin users
- Logout functionality

## RELEASE History

| Date | Version | Description |
|---|---|---|
| 2026-02-25 | 260225-00 | Initial review. Added useI18n + t() for all 12 strings (was zero i18n). 1 P1 fixed. |

## UX Changelog

| Date | Change |
|---|---|
| 2026-02-25 | All UI text now flows through i18n system (was hardcoded English/Russian mix) |
