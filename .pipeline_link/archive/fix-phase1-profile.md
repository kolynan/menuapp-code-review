---
page: profile
budget: 5.00
type: fix
phase: 1
created: 2026-02-28
session: 52
---

# Phase 1 Fix: Profile Page — Mobile Quick Fixes

## Context
UX discussion (CC+Codex) identified Phase 1 mobile fixes for the partner cabinet.
Full discussion result: pipeline/result-discussion-partner-cabinet-ux.md

## Problems to Fix

### 1. i18n keys showing as raw text
Profile page shows raw i18n keys like "profile.full_name" instead of translated text.
**Fix:** Add all missing translation strings to the locale/translation setup.
Add a fallback that shows the last part of the key as human-readable text (e.g., "full_name" → "Full Name") rather than the full dot-path key.

### 2. Sticky Save button
The Save button is at the bottom of the page content — on mobile you have to scroll down to find it.
**Fix:** Make the Save button sticky at the bottom of the viewport (position: sticky or fixed), so it's always visible regardless of scroll position. Must not overlap with potential bottom navigation.

### 3. Touch targets
Any icon buttons or small interactive elements should be at least 44x44px with 8px spacing between adjacent targets.

## Instructions
1. git add -A && git commit -m "before phase1 profile fixes" && git push
2. Read the current profile page code in pages/Profile/
3. Fix all three issues
4. Test mentally that fixes don't break desktop layout
5. Create RELEASE
6. Update BUGS.md and Profile README.md
7. git add -A && git commit -m "Phase1 profile: i18n fix, sticky save, touch targets" && git push
