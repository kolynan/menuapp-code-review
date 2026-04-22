---
title: Waiter Screen V2 -- Implementation Backlog
session: S64
date: 2026-03-02
participants: Claude (CC, Opus 4.6) + Codex (GPT)
rounds: 3
status: completed
---

# Implementation Backlog: Waiter Screen V2

## Changes from S61 Design (sorted by priority)

| # | Change | What changes | Why | Size | Builds on |
|---|--------|-------------|-----|------|-----------|
| V2-01 | Compact card layout | Replace full-detail cards with compact summary cards (table name, status badge, guest count, item count, time, one CTA) | Reduce visual noise; enable fast list scanning during rush | M | Current OrderGroupCard component |
| V2-02 | Full-screen table detail view | New screen: tap card body opens slide-in detail with all guests, all items, per-guest action buttons | Provide space for detailed info + large per-guest buttons without cluttering the list | M | V2-01 (needs compact cards first) |
| V2-03 | Split-tap behavior | CTA button tap executes action immediately; card body tap opens detail view | One-tap actions stay in list context; detail is one tap away | S | V2-01 + V2-02 |
| V2-04 | Static urgency sort | Sort Mine tab: BILL > NEW > READY > SERVED > PREPARING, oldest first within group | Predictable card positions, learnable in 5 minutes | S | Current Mine tab filter logic |
| V2-05 | Color-coded left borders | Add 4px colored left border to each card based on status (purple/blue/amber/green/gray) | Instant status recognition during fast scrolling | S | V2-01 |
| V2-06 | Muted Preparing cards | Preparing cards: lighter bg (#f8fafc), 2px gray border, no CTA, smaller text | Reduce noise from no-action-needed tables | S | V2-01 + V2-05 |
| V2-07 | Preparing-to-Ready animation | When table transitions from Preparing to Ready: border animates gray-to-amber (300ms), CTA button fades in, card stays in same position | Catch waiter attention without moving the card | S | V2-06 |
| V2-08 | Guest-labeled CTA | CTA text includes guest context: "Accept (Guest #3)" instead of just "Accept" | Clarity when table has multiple guests with different statuses | S | V2-01 |
| V2-09 | Banner notifications | Top-of-screen banner when new order arrives: "Table 5: New order", auto-hide 5s, tap to navigate, de-duplication | Visual alert when waiter is on different screen; sound alone can be missed in noise | M | Current notification system |
| V2-10 | Tap target sizing | Primary CTA: 52px height, full-width. Secondary buttons: 48px min. All interactive elements have 8px+ spacing. | One-handed use while moving with trays; wet/greasy fingers | S | V2-01 |

## What Stays from S61

These S61 design decisions are carried forward unchanged into V2:

| Feature | S61 Spec Reference | Why it stays |
|---------|-------------------|--------------|
| Claim model (Free / Mine / Others) | Design_StaffPage_S61.md, Mental Model section | Both AI confirmed correct for small KZ restaurants (2-5 waiters) |
| Three tabs: Free, Mine, Others | Same | Core navigation model works |
| Active / Completed top-level tabs | Same | Separates current work from history |
| One card per table (not per guest or per order) | Design_Interactions_S61.md, Scenario D | Matches physical reality, reduces card count |
| Guest sub-sections inside table cards | Same | Groups orders by guest within a table |
| Sound + vibration for new orders | Same, Notification Design section | Working, tested, effective |
| Polling-based updates (no WebSockets) | Same, Real-Time Update Strategy | Base44 constraint; working and acceptable |
| Stale unclaimed alert (>3 min in Free) | Design_StaffPage_S61.md, Guardrails | Prevents cherry-picking of easy tables |
| Status badge colors (blue/orange/green/gray/red/purple) | Same, Status Display table | Established color language |
| Table lifecycle (IDLE > ACTIVE > BILL_REQUESTED > CLOSED) | Same, State Machine section | Core business logic |
| close_reason field (manual/timeout/eod) | Same | Analytics and debugging |
| Undo rules (30s for unclaim, forward-only after) | Same, Undo Rules section | Prevents accidental status changes |
| Close Table confirmation dialog | Same, Scenario E | Safety net for irreversible action |
| Shift-based filtering | StaffOrdersMobile v2.7.3 | Already implemented and working |
| Kitchen role: flat list, no grouping | StaffOrdersMobile v2.2 changelog | Kitchen staff has different needs |

## Implementation Order

### Sprint A: Card Redesign (V2-01 + V2-05 + V2-06 + V2-08 + V2-10)

**Goal:** Transform existing OrderGroupCard into compact card with color system.

**Tasks:**
1. Redesign OrderGroupCard layout: remove item details, keep summary line
2. Add left border color based on computed table status
3. Apply muted styling for Preparing status
4. Update CTA button text to include guest label
5. Set button heights to 52px (primary) and 48px (secondary)

**Estimated effort:** 1-2 VSC tasks
**Dependencies:** None (refactors existing component)

### Sprint B: Detail View + Split Tap (V2-02 + V2-03)

**Goal:** Build full-screen table detail and wire up split-tap behavior.

**Tasks:**
1. Create TableDetailScreen component (all guests, all items, per-guest action buttons)
2. Implement slide-in navigation (or page push)
3. Wire card body tap to open detail; CTA tap to execute action
4. Preserve list scroll position when returning from detail
5. Add back button / swipe-right navigation

**Estimated effort:** 2 VSC tasks
**Dependencies:** Sprint A (compact cards must exist first)

### Sprint C: Sort + Animation (V2-04 + V2-07)

**Goal:** Implement urgency-based sorting and transition animations.

**Tasks:**
1. Implement 5-level priority sort function for Mine tab
2. Add secondary sort by time within each group
3. Implement border color transition animation (Preparing to Ready)
4. Implement CTA button fade-in animation
5. Ensure card position stability (no reordering within same status group)

**Estimated effort:** 1 VSC task
**Dependencies:** Sprint A (needs color system)

### Sprint D: Banner Notifications (V2-09)

**Goal:** Add in-app banner notification layer.

**Tasks:**
1. Create BannerNotification component (fixed position, z-index overlay)
2. Wire to polling cycle: detect new orders since last poll
3. Implement auto-hide (5s), tap-to-navigate, de-duplication
4. Ensure banner works on all screens (Mine, Free, Others, Detail view)
5. Add dismiss gesture (swipe-up)

**Estimated effort:** 1 VSC task
**Dependencies:** None (standalone overlay component)

### Recommended Execution Sequence

```
Sprint A (card redesign) -----> Sprint B (detail view)
                          \
                           ---> Sprint C (sort + animation)

Sprint D (banner) can run in parallel with any sprint
```

**Total estimated effort:** 5-6 VSC tasks across 4 sprints.

## V2 Future Items (Not for MVP V2, for V2.1+)

| # | Item | Trigger | Source |
|---|------|---------|--------|
| V2.1-01 | Separate "In Kitchen" section | When restaurants with 15+ tables are onboarded | Codex R1 proposal, accepted as V2 future |
| V2.1-02 | Dynamic timer-based priority | If static sort proves insufficient for large volumes | Codex R2 proposal, deferred |
| V2.1-03 | Swipe-right shortcut for primary action | If Base44 adds gesture support or we move to native | Rejected for MVP due to platform constraints |
| V2.1-04 | Per-event distinct notification sounds | When bill request and help request are implemented | S61 backlog P2-9 |

## Size Legend

- **S** = less than 1 day of implementation work (single component change, styling only, or small logic)
- **M** = 1-3 days (new component, multiple file changes, or significant refactor)
- **L** = 3-7 days (new screen, architectural change, or cross-page coordination)
