---
topic: Contacts Architecture
date: 2026-03-09
rounds: 1
status: completed
participants: Claude CC, Codex GPT (gpt-5.4)
---

# Discussion: Contacts Architecture — Separate page or Settings tab?

## Summary

Both CC and Codex independently recommend **Option 2: merge contacts into Settings as a tab**.
The decision is already partially implemented in code (partnercontacts.jsx redirects to /partnersettings,
ContactsSection is present in Settings). The discussion confirms this direction is correct and adds
three actionable refinements.

## Agreed Points

1. **Option 2 is the right architecture** — contacts belong inside Settings, not as a separate page
2. **Fewer hamburger items is better on mobile** — 8+ items is already a lot; removing /partnercontacts helps
3. **Working hours duplication is a product smell** — single source of truth is essential
4. **The redirect from /partnercontacts → /partnersettings should stay** — backward compatibility for bookmarks
5. **Contacts should be a first-class tab, not buried** — easy to find on mobile

## Claude's Perspective

The merge is already implemented correctly. The main value:
- Eliminates the confusing "which page has my real hours?" problem
- Reduces navigation cognitive load for non-technical owners
- Settings at 2423 lines is large but well-structured with tabs

Risk flagged: The tab label "Contacts" alone may not signal that working hours live there.
Restaurant owner might look for "Hours" in a different place.

## Codex's Perspective

Codex agreed strongly with Option 2, with additional UX framing:
- Non-technical restaurant owners have ONE mental model for their business info:
  address + phone + social + hours = "my restaurant info"
- Option 3 (merge settings into contacts) is weaker because owners expect system/app
  settings to be under "Settings", not under "Contacts"
- Suggested renaming the tab to **"Contacts & Hours"** — makes it obvious both live there
- Suggested renaming the hamburger item from "Settings" to **"Restaurant Info"** or **"Business Info"**
- Warned: if Settings is too long/technical, contacts should be a prominent section near the top

Codex could not read the codebase (PowerShell shell timeouts in sandbox), so recommendations
were based on the product context provided.

## Disagreements

None. Both CC and Codex converged on the same recommendation in Round 1.

## Recommendation for Arman

**CONFIRMED: Option 2 is correct. The merge is done. Keep it.**

Three refinements to consider:

### Refinement 1 (P2): Rename tab from "Contacts" to "Contacts & Hours"
Currently the tab is labeled `t("settings.tabs.contacts")`. This label should communicate
that working hours also live here to prevent owner confusion.
- i18n key update: `settings.tabs.contacts` → value "Contacts & Hours" (or localized equivalent)
- Needs B44 prompt for i18n string updates, or direct file edit in RELEASE

### Refinement 2 (P3): Rename hamburger menu item "Settings" → "Restaurant Info"
Codex raised a valid UX concern: "Settings" implies system/app config to most users.
"Restaurant Info" or "Business Info" better reflects what the page actually contains
(profile, contacts, hours, etc.). This is a navigation-level change — needs B44 prompt.

### Refinement 3 (P1): Remove duplicate working hours from /partnercontacts RELEASE
The old RELEASE file `260301-01 partnercontacts RELEASE.jsx` still contains the full
contacts page with its own working hours management UI. This should either:
a) Be archived (the current partnercontacts.jsx redirect-only version is correct), OR
b) Explicitly noted as deprecated so it's never accidentally put back into Base44
Recommendation: archive the old RELEASE file, keep only the redirect version.

## Next Steps

1. [ ] (P1) Archive `pages/PartnerContacts/260301-01 partnercontacts RELEASE.jsx` → versions/
2. [ ] (P2) Update i18n string for contacts tab: "Contacts" → "Contacts & Hours"
3. [ ] (P3) Evaluate renaming Settings hamburger item to "Restaurant Info" (separate B44 prompt)
4. [ ] (done) Keep /partnercontacts redirect — no action needed
5. [ ] (done) ContactsSection in Settings — working as intended
