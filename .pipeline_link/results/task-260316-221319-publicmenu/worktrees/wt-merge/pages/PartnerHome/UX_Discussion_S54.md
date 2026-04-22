# UX Discussion S54 — PartnerHome + Partner Cabinet Navigation

**Date:** 2026-03-01
**Participants:** CC (Claude Code) + Codex (OpenAI GPT)
**Context:** Live browser testing findings from Session 54

---

## FINDING 1: PartnerSettings has hidden "Контакты" tab

### Problem
- `/partnersettings` has 8 tabs: Профиль, Часы, Каналы, Зал, Wi-Fi, Языки, Валюты, **Контакты** (hidden, requires scroll)
- A standalone `/partnercontacts` page also exists (currently broken — BUG-1: LAB shell)
- Duplicate contact management locations confuse users

### CC Recommendation: Merge into PartnerSettings (remove standalone page)

**Reasoning:**
1. **Contacts is a settings concern** — restaurant phone, email, address are configuration, not daily operations
2. **8 tabs is already borderline** — but contacts naturally belongs in settings alongside profile/hours
3. **Standalone page adds navigation complexity** — one more route to maintain, one more item in nav
4. **Mobile UX** — a single Settings page with scrollable tabs is simpler than jumping between pages
5. **The standalone page is already broken** (BUG-1) — perfect time to deprecate

**Proposed action:**
- Keep "Контакты" tab in `/partnersettings`
- Remove or redirect `/partnercontacts` to `/partnersettings` (with auto-scroll to Contacts tab)
- Do NOT fix BUG-1 in `/partnercontacts` — deprecate the page instead

### Codex Perspective
Codex confirmed that having contacts in two places is a UX anti-pattern. Settings is the canonical location. Standalone page should redirect.

### Decision needed from Arman
- [ ] Merge contacts into PartnerSettings only (recommended)
- [ ] Keep both pages (fix BUG-1 in /partnercontacts)
- [ ] Other approach

---

## FINDING 2: Hamburger menu (=) missing "Настройки"

### Problem
- Hamburger menu shows: Профиль, Language Switcher, Выйти
- "Настройки" (Settings) is not accessible from the menu
- Users must know the direct URL or find the tab by scrolling the navigation bar

### CC Recommendation: Add "Настройки" to hamburger menu

**Reasoning:**
1. **Settings is a primary action** for restaurant owners — hours, channels, contacts
2. **Discoverability** — if the only way to find Settings is scrolling the nav tab bar, many users will never find it
3. **Standard pattern** — every SaaS app puts Settings in the user/hamburger menu
4. **Low risk** — adding one menu item is a minimal code change in Layout.js

**Proposed menu structure:**
```
Профиль
Настройки       <-- ADD THIS
---
Language Switcher
Выйти
```

### Codex Perspective
Codex agreed that Settings should be in the hamburger menu. Standard UX practice for admin panels.

### Decision needed from Arman
- [ ] Add "Настройки" to hamburger menu (recommended)
- [ ] Add as visible tab in the nav bar instead
- [ ] Both (hamburger + nav bar)
- [ ] Leave as-is

---

## BUG-6: Tables banner routing (FIXED)

**Status:** Fixed in commit `c3e9b1a`

The "Нет открытых столов" banner button on `/partnerhome` was navigating to `/staffordersmobile` (mobile waiter view) instead of `/partnertables` (table management).

- **Root cause:** Wrong route string in `navigate()` call (line 181)
- **Fix:** Changed `navigate("/staffordersmobile")` to `navigate("/partnertables")`
- **Verified by:** CC + Codex (both confirmed fix is correct)
- **RELEASE:** `260301-02 partnerhome RELEASE.jsx`

---

## Summary

| Finding | Type | Status | Recommendation |
|---------|------|--------|----------------|
| BUG-6: Wrong routing on tables banner | Bug | FIXED | navigate("/partnertables") |
| Hidden "Контакты" tab in Settings | UX/Architecture | Decision needed | Merge into PartnerSettings, deprecate standalone page |
| Missing "Настройки" in hamburger menu | UX/Navigation | Decision needed | Add to hamburger menu |
