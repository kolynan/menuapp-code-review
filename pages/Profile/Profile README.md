# Profile — Page README

## Description
Partner user profile editor. Shows user's full name (editable), email (readonly), role (badge), and restaurant name. Save button with idle/saving/success states. Wrapped in PartnerShell.

## Entities
- **Partner** — read only (`base44.entities.Partner.get(id)`) to display restaurant name
- **Auth** — `base44.auth.me()` for user data, `base44.auth.updateMe()` for name changes

## Auth
Accessed by logged-in users. Wrapped in `PartnerShell` (uses `base44.auth.me()` directly, not `usePartnerAccess()`). Navigates back to `/partnerhome`.

## Key Components
- Card with name input (editable), email input (readonly), role badge, restaurant label
- Save button with 3 states: idle -> saving (spinner) -> success (checkmark, 2s) -> idle
- Error state screen with icon + message if auth.me() fails
- Loading state with spinner
- Partner load failure: distinct message when restaurant data fails to load

## i18n Keys Used
- `profile.title`, `profile.full_name`, `profile.email`, `profile.role`, `profile.restaurant`
- `profile.no_restaurant`, `profile.load_error`, `profile.restaurant_load_error`
- `profile.role.admin`, `profile.role.partner_owner`, `profile.role.partner_manager`, `profile.role.partner_staff`, `profile.role.kitchen`, `profile.role.unknown`
- `common.loading`, `common.saving`, `common.saved`, `common.save`, `common.back`
- `toast.saved`, `toast.error`

---

## RELEASE History

| Version | Date | File | Notes |
|---------|------|------|-------|
| 260225-00 | 2026-02-25 | `260225-00 profile RELEASE.jsx` | Initial review. Fixed: error state for auth failure, toast key, role label fallback, useEffect deps. |
| 260227-01 | 2026-02-27 | `260227-01 profile RELEASE.jsx` | P1+P2 review. Fixed: PartnerShell wrapper, trim comparison, timer cleanup, unmount guard, console removal, partner error state, i18n key, constants, naming. |
| 260228-00 | 2026-02-28 | `260228-00 profile RELEASE.jsx` | Phase 1 mobile UX. Fixed: i18n raw key fallback, sticky save button, touch targets 44px. |
| 260301-00 | 2026-03-01 | `260301-00 profile RELEASE.jsx` | Phase 1v2 CC+Codex. Fixed: tr() type safety, sticky->fixed for iOS, error-state button 44px, input fields 44px. |
| 260301-01 | 2026-03-01 | `260301-01 profile RELEASE.jsx` | Hotfix: PartnerShell named import -> default import (P0 crash fix). |

## UX Changelog

### 260301-01 (Hotfix)
- Исправлен краш при загрузке страницы: PartnerShell импортировался как named export вместо default export

### 260301-00 (Phase 1v2 — CC+Codex Verification)
- Функция tr() теперь безопасно обрабатывает любые входные данные (не падает на undefined/null)
- Кнопка Сохранить теперь надёжно видна на iOS Safari (fixed вместо sticky, safe-area отступы)
- Кнопка Назад на экране ошибки увеличена до 44px минимума
- Поля ввода (Имя, Email) увеличены до 44px для удобства на мобильных

### 260228-00 (Phase 1 Mobile UX)
- Ключи i18n больше не показываются как сырой текст — если перевод отсутствует, показывается читаемое название (например, "Full Name" вместо "profile.full_name")
- Кнопка Сохранить теперь всегда видна внизу экрана (sticky footer), не нужно прокручивать
- Кнопка Назад и Сохранить увеличены до 44px минимума для удобства нажатия на мобильных

### 260227-01 (Code Review P1+P2)
- Page now wrapped in PartnerShell (structural pattern compliance)
- hasChanges no longer falsely true when server returns name with whitespace
- Save timer properly cleaned up on page navigation (prevents memory leak)
- Async data loading safely guarded against unmount race conditions
- Partner load failure now shows distinct error message instead of "no restaurant"
- i18n key `profile.fullName` corrected to `profile.full_name`
- Route string and magic strings extracted to named constants

### 260225-00 (Initial Review)
- Error screen shown when auth.me() fails (previously: empty form)
- Role badge no longer shows raw DB enum values
- Save success toast uses standard `toast.saved` key
- Data loading no longer re-triggers on language switch
