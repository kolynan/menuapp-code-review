---
task_id: fix-s54-findings
type: bug-fix
priority: high
created: 2026-03-01
session: S54
---

# S54 Live Testing — New Findings

Found during interactive browser testing in Session 54.

---

## BUG-6: PartnerHome — wrong routing on "Нет открытых столов →" banner

**Confirmed by click test:** clicking the banner navigates to `/staffordersmobile` (mobile staff view for waiters), not `/partnertables`.

- File: `partnerhome.jsx`
- Fix: change the onClick/navigation target from `/staffordersmobile` to `/partnertables`
- Create RELEASE: `260301-02 partnerhome RELEASE.jsx`

---

## FINDING: PartnerSettings has 8 tabs, "Контакты" is hidden

During testing, scrolling the tab bar in /partnersettings reveals an 8th tab: **"Контакты"**.

Tabs visible by default: Профиль, Часы, Каналы, Зал, Wi-Fi, Языки, Валюты
8th tab (hidden, requires scroll): **Контакты**

**Architecture question for CC+Codex:**
- There is a standalone `/partnercontacts` page (currently broken with LAB shell — BUG-1)
- AND a "Контакты" tab inside `/partnersettings`
- Which is the canonical location for contact management?
- If PartnerSettings already has a Contacts tab, should `/partnercontacts` be removed or redirected to `/partnersettings`?
- Include your recommendation in the UX Discussion document (`outputs/UX_Discussion_S53_Results.md`)

---

## FINDING: Hamburger menu (≡) does not link to Настройки

The ≡ menu only contains: Профиль, language switcher, Выйти.
"Настройки" is not accessible from the menu — only via direct URL or scrolling the tab bar.

**Question:** Should Настройки be added to the hamburger menu? Or added as a visible tab in the nav bar?
Include in UX Discussion document.
