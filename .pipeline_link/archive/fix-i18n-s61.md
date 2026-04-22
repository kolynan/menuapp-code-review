---
task_id: fix-i18n-s61
type: bug-fix
priority: high
created: 2026-03-01
session: S61
budget: 3.00
---

# S61 Live Testing — i18n Bug Fixes

Found during interactive browser testing in Session 61.
Full test report: `outputs/Testing_S61_Results.md`

---

## Overview

Multiple i18n translation keys are rendering as raw strings instead of translated text.
The issue is most likely missing keys in the translation files (e.g., `public/locales/ru/`).
Find the i18n/locales folder and add the missing keys for RU, KZ, EN languages.

---

## BUG-S61-01: PartnerSettings — tab labels not translated

**Page:** `/partnersettings`
**File:** `menuapp-code-review/pages/PartnerSettings/`

Tab bar shows raw keys:
- `settings.pageTab.settings` → should be: RU "Настройки", KZ "Параметрлер", EN "Settings"
- `settings.pageTab.contacts` → should be: RU "Контакты", KZ "Байланыстар", EN "Contacts"

**Task:** Find where tab labels are defined, add/fix translation keys.

---

## BUG-S61-02: PartnerSettings — Contacts tab content not translated

**Page:** `/partnersettings` → Contacts tab
**File:** `menuapp-code-review/pages/PartnerSettings/`

Contacts tab content shows raw keys (this is the new Contacts tab merged from partnercontacts in S59):
- `partnercontacts.view_mode.title`
- `partnercontacts.view_mode.description`
- `partnercontacts.view_mode.icons`
- `partnercontacts.view_mode.full`
- `partnercontacts.links.title`
- `partnercontacts.links.search_pla...` (placeholder text, truncated)
- `partnercontacts.links.add`
- `partnercontacts.type.phone`

**Task:** Add all missing `partnercontacts.*` translation keys to the i18n files.
Note: The contacts data itself loads correctly — only the UI labels are missing.

---

## BUG-S61-03: staffordersmobile — order status badges not translated

**Page:** `/staffordersmobile`
**File:** `menuapp-code-review/pages/StaffOrdersMobile/`

Order status badges show raw keys:
- `orderprocess.default.new` → should be: RU "Новый", KZ "Жаңа", EN "New"
- `orderprocess.default.cooking` → should be: RU "Готовится", KZ "Дайындалуда", EN "Cooking"

**Note:** "Принято" and "Выдан гостю" are already translated correctly. Only "new" and "cooking" states are broken.

**Task:** Add/fix `orderprocess.default.new` and `orderprocess.default.cooking` in i18n files.

---

## BUG-S61-04: Guest cart — bottom sheet buttons not translated

**Pages:** Guest cart view (`/x?partner=...`)
**Files:** Look in cart-related components (CartSheet, CartBottomSheet, or similar)

Cart bottom sheet shows raw keys:
- `cart.my_bill` → should be: RU "Мой счёт", KZ "Менің шотым", EN "My Bill"
- `cart.close` → should be: RU "Закрыть", KZ "Жабу", EN "Close"

**Task:** Add/fix `cart.my_bill` and `cart.close` in i18n files.

---

## BUG-S61-05 (Minor): PartnerShell — hamburger button aria-label

**File:** `menuapp-code-review/pages/PartnerShell/` or common shell component

Hamburger button has `aria-label="partnershell.nav.open_menu"` (raw key, not displayed visually but breaks accessibility).

Should be: RU "Открыть меню", EN "Open menu"

**Task:** Fix aria-label to use translated string.

---

## Deliverables

For each bug fixed:
1. Fix the translation keys in the i18n/locales files
2. If component-level fix needed (hardcoded string instead of i18n call), fix the component too
3. Create RELEASEs for any changed JSX components:
   - `260301-03 partnersettings RELEASE.jsx` (if JSX changed)
   - `260301-03 staffordersmobile RELEASE.jsx` (if JSX changed)
   - etc.
4. Write a short summary of what was fixed: `outputs/i18n-fix-result-s61.md`

**Git:** Start with `git add . && git commit -m "S61 pre-task snapshot" && git push`
