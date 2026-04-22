---
version: "1.0"
updated: "2026-02-25"
session: 33
---

# PartnerShell — BUGS

## Active Bugs

*Нет активных багов.*

## Fixed Bugs (260222-00 RELEASE)

### BUG-PS-001 | P1 | Race condition in rate-limit handling
**Строки:** ~305-312
**Описание:** `cancelQueries()` async, но `setRateLimitHit(true)` вызывается после — лишние запросы могут пройти.
**Фикс:** Переставлен порядок: сначала `setRateLimitHit(true)`, потом `cancelQueries()`.
**RELEASE:** 260222-00

### BUG-PS-002 | P1 | Unauthenticated users see AccessDenied instead of login
**Строки:** ~345-354
**Описание:** Когда `currentUser` null (401/нет сессии), показывается AccessDenied с нерабочей кнопкой Logout вместо редиректа на логин.
**Фикс:** Добавлен `<Navigate to="/" replace />` для unauthorized users.
**RELEASE:** 260222-00

### BUG-PS-003 | P1 | Flash of AccessDenied for non-owner staff
**Строки:** ~345
**Описание:** `isLoading` может стать false преждевременно между resolve `currentUser` и стартом `cabinetAccess` query — мелькает AccessDenied.
**Фикс:** Переход на `isPending` (TanStack Query v5) вместо `isLoading`.
**RELEASE:** 260222-00

### BUG-PS-004 | P1 | Failed queries show misleading AccessDenied
**Строки:** ~345-354
**Описание:** Non-rate-limit ошибки API (500, timeout) проваливаются в AccessDenied вместо показа ошибки.
**Фикс:** Добавлен `GenericErrorScreen` для non-rate-limit ошибок.
**RELEASE:** 260222-00

### BUG-PS-005 | P1 | handleLogout swallows all errors
**Строки:** ~323-328
**Описание:** Bare `catch {}` — серверная сессия может остаться, query cache не чистится.
**Фикс:** `try/finally` + `queryClient.clear()`.
**RELEASE:** 260222-00

### BUG-PS-006 | P2 | Wrong i18n namespace keys in RateLimitScreen
**Строки:** ~121, 124
**Описание:** Используются ключи из чужих namespace (`error.rate_limit`, `acceptinvite.rate_limit.message`).
**Фикс:** Переименованы в `partnershell.error.rate_limit_title` / `rate_limit_message`.
**RELEASE:** 260222-00

### BUG-PS-007 | P2 | Dynamic Tailwind class interpolation
**Строки:** 372, 403-407
**Описание:** Template literal ternaries рискуют быть удалены JIT purge в production.
**Фикс:** Переход на `cn()` utility.
**RELEASE:** 260222-00

### BUG-PS-008 | P2 | usePartnerAccess outside PartnerShell returns defaults silently
**Строки:** 97-108
**Описание:** Контекст возвращал default values вместо throw при использовании вне `<PartnerShell>`.
**Фикс:** `createContext(undefined)` + throw в `usePartnerAccess()`.
**RELEASE:** 260222-00

### BUG-PS-009 | P2 | Language selection accessibility
**Строки:** 368-377
**Описание:** `aria-pressed` на `DropdownMenuItem` семантически некорректен.
**Фикс:** Переход на `DropdownMenuRadioGroup` / `DropdownMenuRadioItem`.
**RELEASE:** 260222-00

### BUG-PS-010–015 | P2-P3 | Accessibility + style
Missing aria-labels (hamburger, nav tabs), decorative icons not aria-hidden, TABS casing, inline trivial wrapper.
**RELEASE:** 260222-00
