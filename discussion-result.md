---
topic: Client Home Screen UX for MenuApp
date: 2026-02-28
rounds: 3
status: completed
participants: Claude (CC, claude-opus-4-6), Codex (GPT, gpt-5.3-codex)
---

# Discussion: Client Home Screen UX for MenuApp

## Summary

Both AI converged on a clear content hierarchy for the most important screen in MenuApp -- the screen guests see after scanning a QR code at their table. The key principles: keep the header compact (logo + name + table in one row), let guests browse the menu with zero friction before asking for any verification, use a 2-column tile grid as default with a list toggle option, and push contact/social/loyalty content below the menu. The only initial disagreement (where to place Hall table verification) was resolved with a middle-ground approach: keep verification inside the cart drawer, but add a subtle hint in the sticky cart bar so guests are not surprised at checkout.

## Agreed (both AI)

1. **Compact restaurant header** -- logo + restaurant name + table number in one compact row. No oversized hero/banner that pushes the menu below the fold.

2. **Language switch visible** -- small but accessible in the top-right corner. Not buried in settings. Important for Kazakhstan market (Russian, Kazakh, English).

3. **Mode tabs below header** -- Hall (pre-selected from QR) / Pickup / Delivery. Clear which mode is active.

4. **Sticky category chips** -- horizontal scrollable pills that stick to the top during scroll. Fastest way to navigate a restaurant menu.

5. **2-column tile grid as default** -- better for visual browsing than single-column. Guests see 4-6 items at once. List mode available via toggle for those who prefer it.

6. **Layout toggle preserved** -- the existing tile/list toggle on mobile is a competitive advantage. Keep it visible but lightweight (right-aligned, small icons).

7. **Sticky cart bar at bottom** -- item count + subtotal + CTA. Always visible when cart has items. Positioned above the phone's safe area.

8. **HelpFab (floating help button)** -- bottom-right, above cart bar. Always available during scroll, unobtrusive for experienced users.

9. **Contact/social in footer** -- phone, Instagram, links pushed to the bottom. They are important for the restaurant owner but secondary for the ordering flow.

10. **Post-checkout loyalty capture** -- ask for email/review AFTER the order is placed, never before. Do not block ordering with loyalty prompts.

11. **One-time orientation for first scan** -- a brief bottom sheet on first visit: "You are at Table 12 / Hall mode / No account needed / Start ordering." Saved in localStorage so repeat scans skip it.

12. **No search bar for now** -- for menus of 30-80 items, category chips + scroll is enough. Search adds complexity without value. Can be added later for restaurants with 120+ items.

13. **No "Popular now" section for now** -- requires analytics or manual curation. Base44 has no analytics engine, and non-technical restaurant owners will not maintain curated lists. Can be a future feature.

14. **No estimated prep time** -- creates liability. If the kitchen is backed up, the displayed time becomes a complaint. Better to not show it.

15. **Progressive disclosure** -- modifiers, allergen details, full description shown in the dish detail bottom sheet, not crammed onto the browse card.

## Claude's perspective

- **Friction-free browsing is sacred.** The guest just scanned a QR code. They want to see the menu immediately. Any barrier (verification, account creation, modal) before they can browse is a UX failure. The menu IS the landing page.

- **The layout toggle is a real differentiator.** Most QR-menu competitors force one view. Letting the guest choose between tile (visual browse) and list (detail-focused) respects different user preferences. This is already implemented and working.

- **Hall verification belongs inside the cart drawer** because it is progressive disclosure. The guest does not need to verify their table to LOOK at the menu -- only to PLACE an order. Putting verification at the top creates anxiety: "I have to do something before I can even look at food."

- **Be realistic about restaurant owner capabilities.** Features like "Popular now," "Chef's picks," or "Featured" sound great but require curation effort that non-technical owners will not sustain. Better to have a clean, auto-working menu than a half-configured one with empty "Featured" sections.

## Codex's perspective

- **Hall verification should not be completely hidden.** If the guest browses, adds items, opens cart, and only THEN discovers they need a table code, that is a frustrating surprise. A subtle hint earlier in the flow prevents this.

- **Mode-aware UI is important.** When switching between Hall / Pickup / Delivery, the UI should clearly communicate what changes -- available items, prices, fees, delivery requirements. This is about managing expectations.

- **First-scan onboarding reduces anxiety.** First-time QR scanners (especially older guests) need a brief moment of orientation: "This is a digital menu, here is how it works, you don't need to install anything."

- **Avoid floating element conflicts.** HelpFab and StickyCartBar must have clear collision rules and safe-area spacing. On small screens, multiple floating elements can overlap and cover content.

- **Conditional search for the future.** When a restaurant has 120+ items, a search icon (not a full search bar) should appear. This is a feature flag, not a default.

## Disagreements (resolved)

**Hall table verification placement:**
- Claude argued: keep it inside the cart drawer only. Browsing should be 100% friction-free.
- Codex argued: show a banner near the top of the page so guests know about it early.
- **Resolution (both agreed):** Keep the verification input inside the cart drawer (New Order section, above the submit button). BUT add two hints:
  1. A small lock icon + text ("Table code needed at checkout") in the StickyCartBar when the table is unverified.
  2. Change the cart CTA text to "Review & verify table" instead of "View cart" when unverified.
  This preserves friction-free browsing while preventing the "surprise verification" problem.

## Current State vs. Recommended (based on screenshot analysis)

The current client home screen (screenshot analyzed 2026-02-28) shows:

**What is ALREADY good (keep as-is):**
- Mode tabs (Hall/Pickup/Delivery) are present and clearly visible
- Category chips are present with horizontal scroll
- Menu items displayed in a tile grid with images, names, prices, ratings
- Clean visual hierarchy -- name at top, categories, then menu items
- The "+" add buttons on each card are clear and well-positioned

**What needs to CHANGE (gaps between current and recommended):**

| Current State | Recommended Change | Priority |
|---|---|---|
| Contact buttons (Phone, Instagram, link) are in the HEADER, right below restaurant name | Move them to the FOOTER below the menu. They push the menu down and are not the primary action. | P1 |
| No table number visible anywhere | Add "Table 12" to the header row so the guest sees the system recognized their table | P1 |
| No logo visible (just text name "Manhatten Restaurant") | Add restaurant logo if available (left of name). If no logo uploaded, name-only is fine. | P2 |
| Language selector and currency selector in the contact row | Language switch stays, but move it to the top-right corner of the header row (not mixed with contacts) | P2 |
| No lock/verification hint in the cart bar | Add lock icon + "Table code needed" text to StickyCartBar for unverified Hall sessions | P2 |
| No first-scan orientation | Add one-time bottom sheet for first-time visitors explaining how QR ordering works | P3 |
| Category chips may not be sticky on scroll | Verify and ensure they stick to top when user scrolls down | P3 |

**What to NOT change:**
- The tile grid layout is correct as default
- Mode tabs position and styling are fine
- Rating stars on cards are fine (progressive detail)
- Price display format is fine

## Recommendation for Arman

Here is the recommended content hierarchy for the client home screen, from top to bottom:

```
+--------------------------------------+
| [Logo] Restaurant Name    Table 12   |  <- 1 compact row
|                           RU EN KZ   |  <- language switch, small
+--------------------------------------+
| [  Hall  ] [ Pickup ] [ Delivery ]   |  <- mode tabs, Hall pre-selected
+--------------------------------------+
| [All] [Starters] [Mains] [Desserts]  |  <- sticky on scroll
|                       [grid] [list]  |  <- layout toggle, right side
+--------------------------------------+
|                                      |
| [img] [img]    <- 2-column tile grid |
| Name  Name                           |
| 2900  3400                           |
| [+]   [+]                            |
|                                      |
| [img] [img]                          |
| Name  Name                           |
| 1500  2200                           |
| [+]   [+]                            |
|                                      |
| ... more items ...                   |
|                                      |
+--------------------------------------+
| Phone | Instagram | WiFi info        |  <- footer
+--------------------------------------+

+--------------------------------------+
| [lock] 2 items  6,300 T  [View cart] |  <- sticky bottom bar
+--------------------------------------+
                                  [?]  <- HelpFab, above cart bar
```

**Key decisions:**
1. Logo and name in one row -- guests confirm they are at the right restaurant in 1 second.
2. Table number visible -- guests know the system recognized their table.
3. Hall pre-selected from QR -- no need to choose mode manually.
4. Category chips stick to top during scroll -- always visible navigation.
5. 2-column tile default -- visual browsing, like scanning a physical menu.
6. Cart bar with lock hint -- tells unverified guests that a table code is needed, without blocking browsing.
7. Contacts in footer, not header -- ordering actions come first.

**What NOT to add (for now):**
- Search bar (menu is small enough)
- "Popular" / "Featured" section (no data to power it)
- Estimated prep time (liability risk)
- Account/login prompt (ask after order, not before)
- Oversized branding/hero image (wastes screen space)

## Next steps

If Arman agrees with this recommendation:

1. **Implementation tasks** -- prioritized changes to apply to the current client home screen:
   - P1: Move contact buttons (Phone, Instagram, link) from header to footer
   - P1: Add table number display to the header row (e.g., "Table 12" right-aligned)
   - P2: Move language switch to top-right corner of header (separate from contacts row)
   - P2: Add lock icon + "Table code needed" hint to StickyCartBar for unverified Hall sessions
   - P2: Change cart CTA to "Review & verify table" when table is unverified
   - P3: Add one-time orientation bottom sheet for first-time visitors
   - P3: Verify that category chips are sticky on scroll

2. **How to implement** -- these changes should be written as a Base44 prompt (task for the code AI). Each change is small and self-contained. Can be batched into one prompt or split into P1 and P2 batches.

3. **Future backlog items** (not now):
   - Conditional search icon for 120+ item menus
   - Optional "Featured" section (if restaurant owner marks items)
   - A/B testing of tile vs list as default
   - Restaurant cover photo / hero image option (owner-configurable)
