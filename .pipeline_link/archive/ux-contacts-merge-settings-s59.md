---
page: PartnerSettings + PartnerContacts
type: UX refactor
budget: 4.00
session: 59
decision: Arman approved 2026-03-01
---

# Task: Merge PartnerContacts into PartnerSettings

## Context

Arman's decision (S59): remove standalone `/partnercontacts` page, merge its content
into `/partnersettings` as a new tab. This reduces navigation complexity.

Currently:
- `/partnercontacts` — separate page with restaurant contact info (phone, address, etc.)
- `/partnersettings` — separate page with restaurant settings

Target:
- `/partnersettings` — single page with tabs (e.g. "Настройки" | "Контакты")
- `/partnercontacts` — deprecated, should redirect to `/partnersettings`

## Instructions

git add . && git commit -m "pre-task: contacts merge into settings" && git push

### Step 1: Review current state
- Read `pages/PartnerSettings/partnersettings.jsx`
- Read `pages/PartnerContacts/partnercontacts.jsx`
- Identify all fields/sections in PartnerContacts that need to move

### Step 2: Implement
- Add a tab switcher to PartnerSettings (e.g. "Настройки" / "Контакты")
- Move all PartnerContacts content into the Contacts tab of PartnerSettings
- Add redirect from `/partnercontacts` → `/partnersettings` (or show deprecation notice)
- Update navigation references to remove `/partnercontacts` from menus

### Step 3: Verify
- All contact fields are accessible from PartnerSettings
- No data loss
- i18n: all visible text uses t() or tr()
- Mobile UX at 375px: tabs readable, no horizontal scroll
- Touch targets >= 44x44px

### Step 4: Commit
git add . && git commit -m "feat: merge PartnerContacts into PartnerSettings tabs" && git push

## Notes
- Keep PartnerContacts file in repo for now (just add redirect), don't delete
- CC + Codex: discuss approach before implementing if there are multiple valid options
