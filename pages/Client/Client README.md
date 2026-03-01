# Client (ClientLogin) — README

## Description
Client login page for the MenuApp loyalty system. A simple email login form that allows customers to access their loyalty bonuses and account.

## Entities Used
- None directly (delegates to `useClientAuth` hook)

## Key Components
- `useClientAuth` — handles email input state, loading, error, and form submission
- `useI18n` — internationalization

## Routes
- `/client` — this page (public)

## RELEASE History

| Version | Date | File | Notes |
|---|---|---|---|
| 260225-00 | 2026-02-25 | `260225-00 client RELEASE.jsx` | Initial review. No P0/P1 issues found. Clean page. |

## UX Changelog

### 260225-00 (Initial Review)
- No changes applied — page passed review with no P0/P1 issues
- 2 minor issues documented (P2: error key validation, P3: spinner accessibility)
