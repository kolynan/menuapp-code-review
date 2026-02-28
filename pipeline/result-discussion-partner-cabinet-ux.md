---
topic: Partner Cabinet UX -- Mobile-First Review
date: 2026-02-28
rounds: 3
status: completed
participants: Claude Opus 4.6 (CC), Codex GPT-5.3 (GPT)
---

# Discussion: Partner Cabinet UX -- Mobile-First Review

## Summary

Both AI reviewed all 10 partner cabinet screenshots and reached full consensus after 3 rounds. The partner cabinet currently works on desktop but has significant mobile usability issues: the 8-tab horizontal navigation will not fit on a phone, data-heavy pages (tables, staff, menu) use wide layouts that break on small screens, touch targets for action icons are too small, and two pages (partnercontacts, profile) show raw i18n keys instead of translated text. The recommended approach: redesign navigation as a 5-item bottom bar, convert all list pages to card-based mobile layouts, establish consistent shared patterns (sticky CTAs, collapsible sections, overflow menus), and fix i18n immediately as a P0 blocker.

---

## Agreed (both AI)

### P0 -- Fix Immediately

1. **i18n key rendering bug is a release blocker.** Pages partnercontacts and profile show raw keys like "partnercontacts.page_title" and "profile.full_name" instead of real text. This makes pages completely unusable. Fix: add all missing translation strings to the locale files. Add a fallback that shows the last part of the key as human-readable text (e.g., "page_title" becomes "Page Title") rather than the full dot-path key.

### P1 -- Redesign for Mobile

2. **Bottom navigation with 5 items: Home | Menu | Tables | Staff | More.** The current horizontal tab bar with 8 items does not fit on a 375px phone screen. The bottom nav should contain only pages used multiple times per day. "More" opens a full-screen list with: Process, Loyalty, Clients, Settings, Profile, and Contacts. Badges on "More" for pending items (unaccepted invites, incomplete setup).

3. **Phase-aware Staff tab.** Staff stays in the primary bottom nav while the restaurant is onboarding (pending invites > 0 or setup incomplete). Can be reevaluated later based on usage data.

4. **No "Orders" tab without a live orders page.** The current "Process" page is for configuring workflow stages, not viewing live orders. If a partner-side live order view is built later, it gets the bottom nav slot.

5. **Unify contacts.** Deprecate the separate partnercontacts page (marked as lab/experimental). Keep contacts management only within partnersettings > Contacts tab. Add redirect from old URL to settings.

### P1 -- Page-by-Page Mobile Layouts

6. **PartnerHome (dashboard):**
   - First block: live operational status (new orders, delayed, needs attention) -- if no orders, show onboarding checklist
   - Second block: today KPIs (orders count, revenue in tenge)
   - Third block: channel breakdown (in-hall, pickup, delivery) as tappable rows
   - Fourth block: quick actions (edit menu, manage tables, invite staff)
   - Empty state: replace "nothing here yet" banner with actionable onboarding checklist with progress bar

7. **Onboarding Checklist (for new partners):**
   - "Add your restaurant info" -- opens Settings > Profile (completed when name + address filled)
   - "Set up your menu" -- opens Menu Management (completed when at least 1 category + 1 dish exist)
   - "Create halls and tables" -- opens Tables (completed when at least 1 hall + 1 table exist)
   - "Invite your staff" -- opens Staff Access (conditionally required; completed when at least 1 staff accepted)
   - "Configure order workflow" -- opens Process (completed when valid stages with channels and roles exist)
   - "Run first test order" -- verify the full flow works end-to-end (required)
   - "Set up loyalty program" -- opens Loyalty (optional bonus, not counted in progress)
   - Progress bar: "3/5 setup steps complete" (denominator = required steps only)

8. **PartnerTables mobile:**
   - Zones as collapsible cards (tap zone name to expand/collapse, default: collapsed)
   - Zone header: zone name + table count + "+ Table" button (visible, not in overflow) + overflow menu (QR batch, edit zone, delete zone)
   - Each table row: table number + code + status dot + QR icon + overflow (three-dot) menu
   - "+ Hall" button: sticky at bottom or FAB (must not overlap bottom nav safe area)
   - Reorder: up/down arrow buttons (48px touch targets), no drag handles on mobile

9. **PartnerStaffAccess mobile:**
   - Sticky top: search + filter dropdowns (role, status)
   - Pending invites grouped at top with yellow/orange background
   - Each staff card: name + role as title, status badge (Accepted/Waiting), date, visible QR + copy buttons + overflow menu
   - No swipe-to-reveal gestures (poor discoverability on web, accessibility issues)
   - Primary CTA: sticky bottom button "Invite Staff" (preferred over FAB for label clarity)
   - "Send invitation" button: should appear consistently on all pending cards, not just some

10. **MenuManage mobile:**
    - Categories as collapsible accordion (default: collapsed except first)
    - Each dish: image thumbnail (left) + name + price (right) + edit button + archive button (not hard delete)
    - Reorder: up/down arrow buttons (48px), no drag handles on mobile
    - For long jumps: add "Move to top" / "Move to bottom" in overflow menu
    - "+ Category" as FAB or top button (choose one pattern globally)
    - Per-category "+ Dish" button in each category header
    - Sticky search at top

11. **PartnerOrderProcess mobile:**
    - Pipeline visualization: horizontal scrollable strip with numbered circles (same as desktop but scrollable)
    - Stage rows become cards: stage name + color dot, channel icons row below, role badges row below, edit/delete in overflow
    - No table header on mobile (desktop-only)
    - Reorder via up/down buttons, not drag

12. **PartnerLoyalty mobile:**
    - Form sections in collapsible cards (already close to correct)
    - Sticky "Save" button at bottom of screen (not at bottom of the page content)
    - Save button should look active/enabled when changes are made (current gray/disabled look is confusing)

13. **PartnerSettings mobile:**
    - Keep existing horizontal sub-tabs (Profile, Hours, Channels, Hall, Wi-Fi, Languages, Currencies) -- this is a good pattern
    - Each tab shows only its section content (no infinite scroll)
    - Within dense tabs, use small collapsible groups
    - Sticky Save/Discard bar per tab with unsaved-changes indicator
    - Working hours: switch from grid to per-day cards -- each day shows "Open/Closed" toggle + time summary, tap to edit in bottom sheet, add "Copy Monday to all" and "Weekdays/Weekend" presets

14. **Profile page:**
    - Simple form, works on mobile already
    - Fix i18n key for "profile.full_name" label
    - Save button should be sticky at bottom

### P2 -- Shared Mobile Patterns

15. **Touch targets:** minimum 44x44px, prefer 48x48px for primary actions. At least 8px spacing between adjacent targets. Max 1-2 visible action buttons per list row + overflow menu for rest.

16. **Consistent app shell:** top title bar (page name + primary action) + bottom nav (5 items) + consistent layout. All pages follow same visual hierarchy.

17. **List item anatomy (all list pages):** primary info (name/number) + status chip + 1-2 primary action buttons + overflow (three-dot) menu. Consistent across tables, staff, menu, clients.

18. **Sticky action bars:** all forms (loyalty, settings, profile) have sticky Save at bottom of viewport. Never make user scroll to find Save.

19. **Empty states:** every page should have a clear empty state with an actionable next step. Example: "No tables yet. Create your first hall to get started." with a prominent button.

20. **Destructive actions:** always require confirmation (bottom sheet or dialog). For dishes, prefer "Archive" over immediate hard delete.

21. **Status indication:** always use label + color, not color-only (accessibility). Example: green dot + "Free" text for tables, not just green dot.

22. **Dish editing on mobile:** full-screen editor for complete edits (name, description, price, image, categories). Quick-edit bottom sheet for 1-2 fields (price, availability) directly from the list.

---

## Claude's Unique Contributions

- Identified the PartnerContacts vs PartnerSettings Contacts duplication and proposed unification
- Pointed out that "Orders" in the bottom nav had no corresponding page (Process is configuration, not live orders)
- Noted that partnersettings already has good sub-navigation tabs and should keep them
- Flagged working hours grid as a specific mobile pain point (14 time inputs)
- Proposed the specific onboarding checklist items
- Called out Base44 platform constraints that made some suggestions impractical

## Codex's Unique Contributions

- "Phase-aware" navigation: adjust bottom tabs based on onboarding state
- "Run first test order" as a required onboarding step (prevents untested launches)
- Strict completion rules for checklist (not just page visit, but real data creation)
- Rejected swipe-to-reveal gestures on web (discoverability + accessibility arguments)
- Suggested Archive instead of hard delete for menu dishes
- "Move to top / Move to bottom" for menu reorder long jumps
- Proposed "Copy Monday to all" preset for working hours
- Recommended explicit Refresh button + timestamp instead of pull-to-refresh (Base44 constraint)

---

## Disagreements

Only one minor disagreement arose and was resolved:

| Topic | Claude's Position | Codex's Position | Resolution |
|-------|------------------|-----------------|------------|
| Swipe gestures on staff cards | Swipe left to reveal QR/copy/delete actions | No swipe -- keep visible buttons + overflow menu | Codex wins. Web swipe gestures have poor discoverability and accessibility. Visible buttons are safer. |

---

## Recommendation for Arman

The partner cabinet needs mobile optimization in this priority order:

**Phase 1 (do first, small effort):**
- Fix i18n keys on partnercontacts and profile pages -- add missing translation strings
- Make Save buttons sticky at bottom on all form pages (loyalty, settings, profile)
- Increase all icon button touch targets to 44px minimum

**Phase 2 (medium effort, high impact):**
- Replace the 8-tab horizontal bar with a 5-item bottom navigation: Home | Menu | Tables | Staff | More
- Add "More" screen listing: Process, Loyalty, Clients, Settings
- Deprecate separate partnercontacts page, redirect to Settings > Contacts

**Phase 3 (larger effort, per-page redesign):**
- PartnerHome: add onboarding checklist for new restaurants, improve dashboard for active ones
- PartnerTables: collapsible zones, mobile-friendly table rows, bigger touch targets
- PartnerStaffAccess: consistent card layout, pending group at top, sticky Invite button
- MenuManage: collapsible categories, archive instead of delete, bigger reorder arrows
- PartnerOrderProcess: cards instead of table rows, scrollable pipeline strip
- PartnerSettings Working Hours: per-day cards with presets

Each phase can be implemented independently. Phase 1 is pure bug fixing and can ship immediately. Phase 2 is the single highest-impact change (navigation affects every page). Phase 3 improves individual pages one by one.

---

## Next Steps

If Arman agrees with this plan:

1. Create implementation tickets for each phase
2. Phase 1: assign to next code review cycle (fix i18n, sticky save, touch targets)
3. Phase 2: design the bottom nav in PartnerShell.jsx -- this is the central component that wraps all partner pages (the code already has `getTabs(t)` with all 8 tabs defined at lines 86-93)
4. Phase 3: tackle pages one at a time in order of most-used (Menu and Tables first)
5. Test each change on a real phone (Chrome DevTools mobile simulation is not enough for touch targets)

---

## ASCII Wireframes

### Proposed Mobile Bottom Nav

```
+------------------------------------------+
|  Manhatten Restaurant            [=]     |  <- top bar (name + hamburger for profile/logout)
+------------------------------------------+
|                                          |
|  [Page Content Area]                     |
|                                          |
|                                          |
+------------------------------------------+
|  [Sticky Save / Action Bar]             |  <- appears on form pages only
+------------------------------------------+
| [Home] [Menu] [Tables] [Staff] [More]   |  <- fixed bottom nav, icons + labels
+------------------------------------------+
```

### "More" Screen

```
+------------------------------------------+
|  <- Back                                 |
+------------------------------------------+
|                                          |
|  [Process]     Configure order workflow  |
|  [Loyalty]     Loyalty program setup     |
|  [Clients]     Client database      [1] |  <- badge if new clients
|  [Settings]    Restaurant settings       |
|                                          |
+------------------------------------------+
| [Home] [Menu] [Tables] [Staff] [More]   |
+------------------------------------------+
```

### PartnerHome with Onboarding

```
+------------------------------------------+
|  Manhatten Restaurant            [=]     |
+------------------------------------------+
|                                          |
|  Setup your restaurant     3/5 complete  |
|  [===============-------]                |
|                                          |
|  [x] Add restaurant info                 |
|  [x] Set up your menu                    |
|  [x] Create halls and tables             |
|  [ ] Invite your staff          ->       |
|  [ ] Run first test order       ->       |
|  ....................................    |
|  [*] Set up loyalty (bonus)     ->       |
|                                          |
+------------------------------------------+
| [Home] [Menu] [Tables] [Staff] [More]   |
+------------------------------------------+
```

### PartnerTables Mobile

```
+------------------------------------------+
|  Tables         3 Halls, 11 Tables  [i] |
+------------------------------------------+
|  [Search...]           [QR] [Settings]  |
+------------------------------------------+
|                                          |
|  v Veranda VIP (5)   [+ Table]  [...]   |
|    #1  753-01  Free  [green]  [QR] [..] |
|    #4  753-04  Free  [green]  [QR] [..] |
|    #11 753-11  Free  [green]  [QR] [..] |
|                                          |
|  > Winter Garden (4)                     |  <- collapsed
|  > Terrace (2)                           |  <- collapsed
|                                          |
+------------------------------------------+
|           [+ Hall]                       |  <- sticky button
+------------------------------------------+
| [Home] [Menu] [Tables] [Staff] [More]   |
+------------------------------------------+
```

### Staff Access Mobile

```
+------------------------------------------+
|  Staff Access        Active 9  Wait 6   |
+------------------------------------------+
|  [Search...]    [Filter v]  [Role v]    |
+------------------------------------------+
|                                          |
|  -- Pending Invitations --     [yellow] |
|  [person] Anton                          |
|     Staff  |  Link  |  14 Jan  | Wait   |
|     [QR] [Copy] [...]                    |
|                                          |
|  [person] Lena                           |
|     Staff  |  Link  |  19 Jan  | Wait   |
|     [QR] [Copy] [...]                    |
|                                          |
|  -- Active Staff --                      |
|  [person] Mishel                         |
|     Staff  |  Email  |  15 Jan  | OK    |
|     [QR] [Copy] [...]                    |
|                                          |
+------------------------------------------+
|        [+ Invite Staff]                  |  <- sticky bottom
+------------------------------------------+
| [Home] [Menu] [Tables] [Staff] [More]   |
+------------------------------------------+
```
