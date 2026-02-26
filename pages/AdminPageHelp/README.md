# AdminPageHelp

Admin page for contextual help article management (CRUD).

## Overview
- **Route:** `/adminpagehelp`
- **Type:** Admin page (internal)
- **Entities:** PageHelp
- **Access:** ADMIN_EMAILS whitelist + `base44.auth.me()`
- **Dependencies:** `useI18n` for translations, `sonner` for toasts

## Features
- Full CRUD for PageHelp articles (create, read, update, delete)
- Search by pageKey (immediate, no debounce)
- Create/edit dialog with:
  - pageKey input with normalization (auto-prefix `/`)
  - Quick template buttons for common routes
  - Title, markdown content (with syntax hint), isActive toggle
- Table view sorted by pageKey
- Soft confirmation on delete (`confirm()`)
- Duplicate pageKey detection via server error message

## Data Model
- **PageHelp:** `{ id, pageKey, title, markdown, isActive, updatedAt }`

## RELEASE History

| Date | Version | Description |
|---|---|---|
| 2026-02-25 | 260225-00 | Initial review. Fixed: email case sensitivity (P1), null guard on create (P1), removed console.error (P2). 3 bugs fixed, 6 active. |
| 2026-02-26 | S35 Codex round | Codex review fixes: removed `t` from useEffect deps preventing infinite refetches (P1), documented updatedAt client-side timestamp limitation (P2). 2 bugs fixed, 2 platform limitations documented. |

## UX Changelog

| Date | Change |
|---|---|
| 2026-02-25 | Admin access now case-insensitive for email matching |
| 2026-02-26 | Fixed: page data no longer refetches infinitely on every render (Codex-found bug) |
