---
page: PartnerShell (navigation)
type: UX improvement
budget: 2.00
session: 59
decision: Arman approved 2026-03-01
---

# Task: Add Settings to Hamburger Menu

## Context

Arman's decision (S59): add "Настройки" (Settings) as a navigation item in the
hamburger menu (≡ side menu) of the partner cabinet. Settings is a frequently
used destination and should be quickly accessible.

Currently: Settings only reachable via bottom navigation or direct URL.
Target: Settings also accessible from hamburger/side menu.

## Instructions

git add . && git commit -m "pre-task: settings in hamburger menu" && git push

### Step 1: Review current state
- Read `pages/PartnerShell/PartnerShell.jsx` (or wherever hamburger menu is defined)
- Identify current hamburger menu items and their structure
- Confirm route for Settings (`/partnersettings`)

### Step 2: Implement
- Add "Настройки" item to hamburger menu navigation list
- Link to `/partnersettings`
- Use appropriate icon (gear/settings icon, consistent with existing style)
- Use i18n key for the label (t('navigation.settings') or equivalent)

### Step 3: Verify
- Settings item appears in hamburger menu
- Clicking navigates to `/partnersettings`
- Mobile UX at 375px: item visible, touch target >= 44x44px
- Consistent with other hamburger menu items in style

### Step 4: Commit
git add . && git commit -m "feat: add Settings to hamburger menu navigation" && git push

## Notes
- Small focused change — should not affect other navigation items
- If hamburger menu is in a shared shell component, change affects all partner pages (intended)
