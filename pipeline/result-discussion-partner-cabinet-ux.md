---
topic: Partner Cabinet Mobile-First UX Review
date: 2026-02-28
rounds: 3
status: completed
participants: Claude (CC), Codex (GPT)
---

# Discussion: Partner Cabinet Mobile-First UX Review

## Summary

After 3 rounds of discussion with full analysis of 10 partner cabinet screenshots, Claude and Codex reached strong convergence on all major points. The partner cabinet needs a mobile-first overhaul focused on three pillars: (1) replacing the overflowing 8-tab top navigation with a 5-item bottom nav bar, (2) fixing touch target sizes and drag-and-drop interactions across data-heavy pages, and (3) restructuring long-form pages (settings, loyalty, menu) with sticky save bars and better section navigation. Two critical bugs (i18n key exposure on partnercontacts and profile) must be fixed immediately.

## Agreed (both AI)

### P0 -- Must Fix (Breaks on Mobile)

1. **i18n key exposure** -- partnercontacts shows ALL text as raw keys (partnercontacts.page_title, etc). profile shows "profile.full_name" as label. Fix: add missing translation entries, implement fallback text rendering. *Quick win -- code fix.*

2. **Navigation inconsistency** -- partnercontacts uses a completely different nav (lab version header) vs all other pages which use the standard PartnerShell tab bar. Must be aligned to the same shell. *Phase 2 -- structural.*

3. **8-tab horizontal nav overflow** -- The current 8-tab bar (Glavnaya, Menu, Stoly, Personal, Process, Loyalnost, Klienty) overflows on mobile screens. It truncates labels and requires horizontal scrolling, which most users never discover. *Phase 2 -- PartnerShell redesign.*

4. **Touch targets below 44px** -- Affected pages: partnertables (drag handles ~16px, QR icons, 3-dot menus clustered), menumanage (up/down arrows, drag grips, edit/delete icons), partnerstaffaccess (QR/copy/kebab icons side by side), partnerorderprocess (edit/delete per row). All interactive elements must be minimum 44x44px with adequate spacing. *Quick win -- CSS adjustments.*

### P1 -- Should Fix (Bad Experience)

5. **Bottom navigation bar** -- Replace the 8-tab top bar on mobile (below md breakpoint) with a fixed bottom nav containing 5 items: Glavnaya (home), Menu, Stoly (tables), Personal (staff), Eshcho (more). The "Eshcho" tab opens a shadcn Sheet (bottom drawer) listing: Process, Loyalty, Clients, Settings, Profile, Contacts. Desktop keeps the existing top bar. *Phase 2 -- PartnerShell component.*

6. **Sticky save bar** -- On partnerloyalty, partnersettings, and profile, the Save button is at the very bottom of a long page. On mobile, users may not scroll to find it. Add a sticky bottom bar that appears when form data is modified, showing "Unsaved changes" + Save button. Must account for stacking with the bottom nav bar (save bar sits above the nav). *Quick win -- CSS + minor state logic.*

7. **Drag-and-drop on mobile** -- Both partnertables and menumanage have 6-dot drag handles for reordering. On mobile: (a) drag gestures conflict with scroll, (b) handles are ~16px and impossible to grab. Solution: hide drag handles on mobile by default, show Up/Down arrow buttons as primary reorder method (menumanage already has these), add an explicit "Edit/Reorder" mode toggle for bulk reorganization. *Phase 2 -- component changes.*

8. **Menu management single-page accordion** -- menumanage currently shows all 8 categories expanded with 20+ dishes in one long scroll. On mobile: default all categories to collapsed state, add sticky category jump chips at the top (horizontal scrollable pills acting as anchor links), keep collapsible accordion pattern. Do NOT implement drill-down navigation (too complex for Base44). *Phase 2 -- component changes.*

9. **Settings tab bar improvements** -- partnersettings already has a secondary tab bar (Profile, Hours, Channels, Hall, Wi-Fi, Languages, Currencies). On mobile: make it sticky at top, ensure horizontal scrolling with visual scroll indicator, add per-tab Save button, reduce section lengths within each tab. Do NOT split into separate routes. *Quick win (sticky/scroll) + Phase 2 (per-tab save).*

10. **Working hours grid layout** -- The 7-day time grid in partnersettings (Mon-Sun, each with open time, close time, "working day" checkbox) is extremely cramped on mobile with ~5 elements per row. Restructure to vertical stacking: day name on one line, time pickers on the next line, with a "Copy to all days" button prominently placed to reduce repetitive input. *Phase 2 -- component layout.*

11. **Staff access list grouping** -- partnerstaffaccess shows 15+ staff cards in a flat list. Group by status with sticky section headers: "Active (9)" and "Waiting (6)". Within each card on mobile, show only the kebab menu (3 dots) as the single visible action button. QR and Copy actions move into the bottom sheet that opens from the kebab. Put Copy first, then QR in the sheet (most frequent actions at top). *Phase 2 -- component changes.*

12. **Order process table to cards** -- partnerorderprocess shows a table with columns (Number, Stage, Channels, Roles, Actions). On mobile, convert each row to a stacked card. Keep the pipeline visualization (4 circles with arrows) as a horizontally scrollable stepper. *Phase 2 -- component changes.*

13. **Statistics cards responsive layout** -- partnerloyalty has 5 stat cards in a 3+2 grid that will overflow on mobile. partnerhome has 2 stat cards side by side. On mobile: use 2-column grid for stat cards (loyalty), full-width stacked for dashboard stats (home). *Quick win -- CSS grid/flex adjustments.*

14. **Actionable empty states** -- partnerhome shows a generic yellow "Poka zdes pusto" (nothing here yet) banner. Replace with specific onboarding hints: "Add your first menu item" (links to Menu), "Set up your first table" (links to Tables), "Invite your staff" (links to Staff). Each hint is a card with icon + action button. *Phase 2 -- content + component.*

### P2 -- Nice Improvement

15. **FAB for create actions** -- On long list pages (Tables, Menu, Staff, Clients), use a floating action button for the primary "create" action (+Hall, +Category, +Invite, etc). Keep inline buttons for form/settings pages. *Phase 2 -- component.*

16. **Standardized loading skeletons** -- All pages should use consistent loading skeleton patterns in the same style, with Russian text for any loading messages. *Phase 2 -- component library.*

## Claude's Unique Contributions

- Identified the drag-and-drop conflict with scrolling as a P0/P1 issue (Codex missed this in Round 1)
- Recognized that partnerorderprocess is a configuration page, not a live orders queue -- so it should not be in the primary bottom nav
- Identified the working hours grid (7-day time picker matrix) as a specific mobile pain point
- Argued for accordion + jump chips over drill-down navigation for menumanage, based on Base44 platform constraints
- Argued for improving existing settings tabs rather than splitting into separate routes, based on Base44 constraints

## Codex's Unique Contributions

- Proposed the 5-item bottom nav pattern with "Eshcho" sheet (adopted with tab modifications)
- Suggested "default all categories collapsed" rule for menumanage accordion
- Raised the importance of bottom safe-area handling (env(safe-area-inset-bottom)) for iPhone notch/gesture bar
- Noted the need for stacking order logic between sticky save bars, bottom nav, and sheets
- Suggested focus trap and accessibility requirements for the Sheet component
- Recommended i18n fixes as a rolling track (fix as you touch each screen) rather than batched at the end
- Noted that if a live orders page is ever added, it should compete for a bottom nav slot (future-proofing)

## Disagreements

None remaining after Round 3. All initial disagreements were resolved:

| Topic | Claude's Position | Codex's Position | Resolution |
|-------|------------------|------------------|------------|
| Bottom nav tabs | Glavnaya, Menu, Stoly, Personal, Eshcho | Originally had Zakazy (Process) | Codex agreed -- Process is config, not live operations |
| Menu management | Accordion + jump chips (single page) | Originally two-step drill-down | Codex agreed -- Base44 constraints make drill-down impractical |
| Settings structure | Improve existing tabs (sticky, scrollable) | Originally separate screens | Codex agreed -- tabs already exist, improve them |
| Drag-and-drop | Edit mode + Up/Down buttons | Not mentioned in Round 1 | Codex strongly agreed this is P0/P1 |

## Recommendation for Arman

The partner cabinet works on desktop but has serious usability problems on mobile phones. Restaurant owners who open the cabinet on their phone will struggle with: (a) a navigation bar that does not fit on the screen, (b) buttons and controls that are too small to tap accurately, (c) long pages where the Save button is hidden at the very bottom.

We recommend implementing changes in 3 phases:

### Phase 1: Quick Wins (CSS/layout only, no component restructuring)

These can be done within existing page code with Tailwind responsive classes:

| Change | Pages | What to do |
|--------|-------|------------|
| Sticky save bar | partnerloyalty, partnersettings, profile | Add `sticky bottom-0` bar with Save button, show when form is dirty |
| 44px touch targets | partnertables, menumanage, partnerstaffaccess, partnerorderprocess | Add `min-h-[44px] min-w-[44px]` to all icon buttons, increase gap between action icons |
| Hide drag handles on mobile | partnertables, menumanage | Add `hidden md:flex` to drag handle elements |
| Stat cards responsive | partnerloyalty, partnerhome | Use `grid-cols-2` on mobile instead of `grid-cols-3` or `grid-cols-5` |
| Scrollable settings tabs | partnersettings | Add `overflow-x-auto sticky top-0 z-10` to secondary tab bar |

### Phase 2: Component Changes (React + Tailwind)

Do in this order -- PartnerShell nav first, then page-level fixes:

| Priority | Change | Page |
|----------|--------|------|
| 2a | Bottom nav bar + Eshcho sheet | PartnerShell (affects all pages) |
| 2b | Align partnercontacts to standard shell | partnercontacts |
| 2c | Accordion categories + jump chips | menumanage |
| 2d | Working hours vertical layout | partnersettings |
| 2e | Staff grouping by status + single action button | partnerstaffaccess |
| 2f | Table-to-card responsive conversion | partnerorderprocess |
| 2g | Edit/Reorder mode for ordering | partnertables, menumanage |

### Phase 3: Content and Polish

| Change | Page |
|--------|------|
| i18n fixes (rolling -- start with touched pages) | partnercontacts, profile, all pages as touched |
| Actionable empty states | partnerhome |
| Loading skeletons | all pages |
| FAB for create actions | partnertables, menumanage, partnerstaffaccess |

### Technical Notes for Implementation

- Bottom nav must include `padding-bottom: env(safe-area-inset-bottom)` for iPhones with gesture bar
- When both sticky save bar and bottom nav are visible, save bar sits ABOVE the nav bar (z-index stacking)
- The "Eshcho" Sheet needs: focus trap, close-on-navigate, keyboard-safe positioning
- Active tab highlighting in bottom nav must work for pages opened from the "Eshcho" sheet (highlight the "Eshcho" icon when on Process/Loyalty/Clients/Settings/Profile/Contacts)
- i18n fixes should be applied as each page is touched for mobile work, not saved for a separate phase

## Mobile Bottom Nav -- Visual Layout

```
+--------------------------------------------------+
|  [ Home ]  [ Menu ]  [ Tables ]  [ Staff ]  [...]|
|    icon      icon      icon       icon      icon  |
|  Glavnaya   Menu     Stoly     Personal   Eshcho  |
+--------------------------------------------------+
   active = blue underline/fill
   Eshcho opens Sheet with remaining 6 pages
```

The "Eshcho" Sheet contents:
```
+--------------------------------------------------+
|  Eshcho                                     [X]   |
|                                                   |
|  [ icon ]  Process zakazov                        |
|  [ icon ]  Loyalnost                              |
|  [ icon ]  Klienty                                |
|  [ icon ]  Nastroyki                              |
|  [ icon ]  Profil                                 |
|  [ icon ]  Kontakty                               |
+--------------------------------------------------+
```

## Next Steps

1. **Arman reviews this document** and confirms the 3-phase approach
2. **Phase 1 implementation** starts immediately -- these are CSS-only changes, can be done page by page through the existing code review pipeline
3. **Phase 2 starts with PartnerShell** -- this is the foundation; once the bottom nav works, all subsequent page changes will be tested against the correct mobile layout
4. **Create a BACKLOG entry** for each Phase 2 and Phase 3 item with estimated effort
5. **i18n fixes for partnercontacts and profile** should be treated as a separate bug-fix task (not UX) and can be done in parallel with Phase 1
