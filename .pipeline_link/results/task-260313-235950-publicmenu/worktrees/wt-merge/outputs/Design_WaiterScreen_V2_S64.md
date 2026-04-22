---
title: Waiter Screen V2 -- UX Specification
session: S64
date: 2026-03-02
participants: Claude (CC, Opus 4.6) + Codex (GPT)
rounds: 3
status: completed
---

# Waiter Screen V2: Speed, Clarity, One-Tap Actions

## Executive Summary

Three-round UX discussion between Claude and Codex produced full consensus on 6 design questions for the waiter mobile interface. Key changes from S61: cards become compact (detail moved to full-screen view), sort order is static by urgency, Preparing tables stay muted in place rather than moving to a separate section, and banner notifications are added for new orders. The design prioritizes one-handed use, predictable card positions, and minimal cognitive load for non-tech waiters in small KZ restaurants.

---

## Final Answers (Q1-Q6)

### Q1: One CTA Per Card (Option A -- Both AI Agree)

**Decision:** Show ONE primary CTA per table card, labeled with the target guest.

**How it works:**
- Card shows the most urgent action based on status priority
- CTA button text includes guest context: "Accept (Guest #3)" not just "Accept"
- If multiple guests need action, the highest-priority one wins
- After the waiter taps the CTA, the card refreshes and shows the next most urgent action

**Justification:**
- Lowest cognitive load: waiter scans the list and sees one clear action per table
- Lowest error risk: no risk of tapping the wrong guest's button in a multi-button layout
- Simplest implementation: compute table priority from guest states, render one CTA
- Option C (advance all items) was rejected by both AI -- it would incorrectly advance unrelated items at different preparation stages

**Change from S61:** S61 already specified one CTA per card. V2 adds the guest label to the button text for clarity when multiple guests are present.

### Q2: Split-Tap -- CTA Executes, Card Opens Detail (Hybrid -- Agreed Round 3)

**Decision:** Two distinct tap zones on each card.

| Tap zone | Action | Animation |
|----------|--------|-----------|
| CTA button | Execute primary action immediately (no navigation) | Button pulse + status badge update |
| Anywhere else on card | Open full-screen table detail view | Slide-in from right |

**How it works:**
- The card itself is compact: table name, status badge, guest count, time, one CTA
- Tapping the CTA is a one-tap action -- the waiter never leaves the list
- Tapping the card body opens a full-screen detail view with all guests, all items, per-guest action buttons, notes, and order history
- Back button or swipe-right returns to the list at the same scroll position

**Justification:**
- Claude argued that accordion expansion creates cards that are effectively full-screen but with worse layout -- Codex agreed
- Codex argued that full-screen as default for every tap loses queue context -- Claude agreed
- The hybrid gives both: fast actions stay in the list, deep detail is one tap away
- No accordion complexity to build or maintain

**Change from S61:** S61 had all info visible on the card (option C). V2 moves to compact cards + full-screen detail, keeping one-tap actions on the card surface.

### Q3: Static Urgency Sort + Color System (Agreed Round 3)

**Decision:** Static sort order, no dynamic reordering.

**Sort Priority (highest to lowest):**

| Priority | Status | Color (left border + badge) | Hex | Meaning |
|----------|--------|----------------------------|-----|---------|
| 1 | BILL_REQUESTED | Purple | #8b5cf6 | Guest asked for bill -- direct personal request |
| 2 | NEW | Blue | #3b82f6 | New unaccepted order -- guest waiting, nothing started |
| 3 | READY | Amber/Orange | #f59e0b | Food ready on pass -- deliver before quality drops |
| 4 | ALL_SERVED | Green | #22c55e | All items served -- table can be closed |
| 5 | PREPARING | Gray/Slate | #94a3b8 | Kitchen working -- waiter just monitors |

**Within each status group:** sort by time ascending (oldest first).

**Visual treatment:**
- Color applied to left border (4px) and status badge chip
- NOT full-card background saturation (causes visual fatigue over 8-hour shifts)
- PREPARING cards: lighter background (#f8fafc), smaller text, no CTA button
- BILL_REQUESTED and NEW cards: slightly bolder border (4px solid vs 2px)

**Justification:**
- Both AI agreed that static order is more learnable for daily service than timer-driven reshuffling
- Claude argued: waiters learn the order in 5 minutes. They always know where to look. Dynamic reordering makes the list feel unstable.
- Codex conceded: static is more predictable for non-tech users
- BILL_REQUESTED first because it is a direct personal request (guest is looking at the door)
- NEW before READY because first response time is the strongest signal of service quality. Ready food degrades slowly (1-2 min on the pass), but an unacknowledged new guest degrades satisfaction fast.

**Change from S61:** S61 did not specify sort order explicitly. V2 defines a clear static priority system.

### Q4: Preparing Tables Stay Muted in Place (Option A -- Agreed Round 3)

**Decision:** Keep Preparing tables in their normal list position, visually muted.

**Muted styling:**
- Background: #f8fafc (very light gray)
- Left border: 2px solid #cbd5e1 (light gray, thinner than active cards)
- Text: #64748b (muted gray instead of standard #1e293b)
- No CTA button shown (nothing to do)
- Status badge: gray chip "Preparing" with small timer

**Transition animation (Preparing to Ready):**
- Left border animates from gray to amber (300ms ease)
- CTA button fades in ("Mark Served")
- Card does NOT change position in the list
- Optional: brief amber flash on the whole card (200ms) to catch peripheral vision

**Justification:**
- Claude argued: separate "In Kitchen" section creates two mental locations for "my tables," and moving cards between sections causes visual instability
- Codex conceded for MVP volume (3-8 active tables): muted-in-place is simpler and more stable
- Non-tech waiters think "I have 5 tables" not "I have 3 active + 2 in kitchen"
- The V2 backlog reserves a separate section for when larger restaurants (15+ tables) are supported

**Change from S61:** S61 did not address the Preparing noise problem. V2 explicitly defines muted styling for no-action-needed tables.

### Q5: Tap Targets -- 48px Min, 52px Primary, Full-Width, No Swipe (Agreed Rounds 1-2)

**Decision:**

| Element | Min height | Width | Justification |
|---------|-----------|-------|---------------|
| Primary CTA button | 52px | Full card width | One-handed thumb target while moving |
| Secondary buttons (in detail view) | 48px | Auto (content-width, min 120px) | Apple HIG + motion buffer |
| Status badge chips | 32px | Auto | Read-only, no tap action |
| Card tap area (non-CTA) | Entire card surface | Full card width | Large target for opening detail |

**Button placement:**
- Primary CTA at the bottom of the card, full width, clearly separated from card content by a divider or spacing (12px gap)
- In detail view: per-guest action buttons are full-width within their guest sub-section

**Swipe gestures:**
- NOT used for primary actions (rejected by both AI)
- Reason: React/Tailwind on Base44 has no native gesture API; swipe conflicts with scroll; less discoverable; error-prone while moving
- Swipe-right on full-screen detail view is acceptable as back navigation (standard mobile pattern)

**Justification:**
- 44px Apple HIG is a baseline for seated users. Moving waiters with one hand and potential wet/greasy fingers need larger targets.
- Codex recommended 52-56px; Claude recommended 48px. Agreed: 48px minimum, 52px for primary CTAs.
- Full-width buttons maximize hit area and support thumb-reach from either side of the phone.

**Change from S61:** S61 did not specify tap target sizes. V2 defines explicit minimums above Apple HIG baseline.

### Q6: Banner Notification Added (Both AI Agree)

**Decision:** Add banner notification on top of current view when new order arrives.

**Banner specification:**
- Position: top of viewport, over current content (z-index above everything)
- Content: "Table 5: New order" (table name + event type)
- Duration: auto-hide after 5 seconds
- Interaction: tap banner to navigate to the relevant table card
- De-duplication: if multiple events arrive during same poll cycle, show one banner with count ("3 new orders")
- Dismiss: swipe-up or auto-hide
- Non-blocking: does not prevent interaction with the screen below

**Full notification stack (V2):**

| Channel | When | Purpose |
|---------|------|---------|
| Sound (beep) | New order, bill request | Audio alert even when screen is off |
| Vibration | New order (short), bill request (long) | Tactile alert in noisy environments |
| Tab counter badge | Always | Persistent count of pending actions per tab |
| Banner (NEW in V2) | When waiter is on any screen | Visual context without tab-switching |

**Justification:**
- Both AI agreed: in a noisy restaurant, sound alone can be missed, and tab-counter-only requires deliberate checking
- Banner provides immediate context ("which table? what event?") without forcing the waiter to switch tabs
- Auto-hide + de-duplication prevents alert fatigue during polling bursts

**Change from S61:** S61 had sound + vibration + tab counter. V2 adds banner notification as fourth channel.

---

## ASCII Wireframe: Mine Tab (Main List)

```
+----------------------------------------------------+
| Staff Orders                        [bell] [gear]   |
|----------------------------------------------------|
| [Active]              [Completed]                   |
|----------------------------------------------------|
| Free: 2  |  *Mine: 5*  |  Others: 1               |
|====================================================|
|                                                    |
| [purple 4px border]                                |
| +------------------------------------------------+ |
| | Table 8 - VIP Room              18m    purple  | |
| | BILL REQUESTED  *  1 guest, 3 items            | |
| |                                                | |
| | [====== Close Table (Guest #1) ==============] | |
| +------------------------------------------------+ |
|                                                    |
| [blue 4px border]                                  |
| +------------------------------------------------+ |
| | Table 5 - Main Hall              2m    blue    | |
| | NEW  *  2 guests, 4 items                      | |
| |                                                | |
| | [======= Accept (Guest #3) ==================] | |
| +------------------------------------------------+ |
|                                                    |
| [amber 4px border]                                 |
| +------------------------------------------------+ |
| | Table 12 - Terrace              10m    amber   | |
| | READY  *  1 guest, 2 items                     | |
| |                                                | |
| | [====== Mark Served (Guest #1) ==============] | |
| +------------------------------------------------+ |
|                                                    |
| [green 4px border]                                 |
| +------------------------------------------------+ |
| | Table 3 - Main Hall              22m   green   | |
| | ALL SERVED  *  1 guest, 1 item                 | |
| |                                                | |
| | [========== Close Table ======================] | |
| +------------------------------------------------+ |
|                                                    |
| [gray 2px border, muted bg]                       |
| +------------------------------------------------+ |
| | Table 6 - Main Hall        7m   gray           | |
| | PREPARING  *  2 guests, 5 items                | |
| | (no button -- kitchen working)                 | |
| +------------------------------------------------+ |
|                                                    |
+----------------------------------------------------+
```

**Card anatomy (compact mode):**
```
+--------------------------------------------------+
| [color border 4px]                               |
|  Table Name - Zone              Time   [badge]   |
|  STATUS  *  N guests, M items                    |
|                                                  |
|  [============= Primary CTA (52px) ============] |
+--------------------------------------------------+
```

- Badge = colored status chip (pill shape)
- Time = elapsed since oldest unresolved action
- Guest count + item count = summary (not full item list)
- Full item list is in the detail view

## ASCII Wireframe: Table Detail (Full-Screen)

```
+----------------------------------------------------+
| [<- Back]    Table 5 - Main Hall          [...]    |
|----------------------------------------------------|
|                                                    |
| Status: MIXED (New + Preparing)        Active 25m  |
|                                                    |
| -------------------------------------------------- |
| GUEST #1  (first order 25m ago)                    |
| -------------------------------------------------- |
| Caesar Salad x1              [Preparing] orange    |
| Latte x1                    [Preparing] orange     |
|                                                    |
| (no action -- all items preparing)                 |
|                                                    |
| -------------------------------------------------- |
| GUEST #3  (first order 2m ago)          [NEW]      |
| -------------------------------------------------- |
| Burger x1                   [Preparing] orange     |
| Fries x1                    [Preparing] orange     |
| Dessert x1                       [NEW] blue        |
|                                                    |
| [============ Accept New Items ==================] |
|                            (52px, full-width)      |
|                                                    |
| -------------------------------------------------- |
| TABLE ACTIONS                                      |
| -------------------------------------------------- |
| [========== Close Table =========================] |
| (disabled until all items served)                  |
|                                                    |
+----------------------------------------------------+
```

## Color System Specification

| Status | Border Color | Badge BG | Badge Text | Card BG | Hex (border) |
|--------|-------------|----------|-----------|---------|--------------|
| BILL_REQUESTED | Purple solid 4px | #8b5cf6 | white | #faf5ff (very light purple) | #8b5cf6 |
| NEW | Blue solid 4px | #3b82f6 | white | #eff6ff (very light blue) | #3b82f6 |
| READY | Amber solid 4px | #f59e0b | white | #fffbeb (very light amber) | #f59e0b |
| ALL_SERVED | Green solid 4px | #22c55e | white | #f0fdf4 (very light green) | #22c55e |
| PREPARING | Gray solid 2px | #94a3b8 | white | #f8fafc (slate-50) | #cbd5e1 |
| STALE (>3min in Free) | Red solid 4px | #ef4444 | white | #fef2f2 (very light red) | #ef4444 |

**Design principles:**
- Left border carries the primary color signal (visible during fast scrolling)
- Badge chip is a small pill with the status color background
- Card background uses the 50-weight tint (extremely subtle -- prevents visual fatigue)
- Preparing uses thinner border (2px vs 4px) and neutral background

## Sort Order Specification

**Mine tab -- ordered list from top to bottom:**

| Position | Status Group | Sort within group | CTA shown | Card emphasis |
|----------|-------------|-------------------|-----------|---------------|
| 1 | BILL_REQUESTED | oldest first | Close Table | High (purple) |
| 2 | NEW | oldest first | Accept (Guest #N) | High (blue) |
| 3 | READY | oldest first | Mark Served (Guest #N) | High (amber) |
| 4 | ALL_SERVED | oldest first | Close Table | Medium (green) |
| 5 | PREPARING | oldest first | None | Low (muted gray) |

**Free tab:** sort by time ascending (oldest unclaimed first). Stale orders (>3 min) get red highlight.

**Others tab:** sort by waiter name, then by table number. Read-only view.

**Completed tab:** sort by closed_at descending (most recently closed first).

## Key Design Decisions vs S61

| # | Decision | S61 Approach | V2 Approach | Reason for Change |
|---|----------|-------------|-------------|-------------------|
| 1 | Card content | Full detail on card (guests, items, statuses) | Compact summary (guest count, item count, one CTA) | Reduces visual noise; detail moves to full-screen view |
| 2 | Detail access | N/A (all info on card) | Tap card body to open full-screen detail | Better space for per-guest actions, notes, history |
| 3 | CTA execution | One CTA on card | Same, but tap CTA executes without opening detail | Preserves list context for fast triage |
| 4 | Sort order | Not explicitly specified | Static 5-level urgency sort | Predictable card positions, learnable in 5 minutes |
| 5 | Preparing tables | No special treatment | Muted styling (gray, thin border, no CTA) | Reduces visual noise for no-action-needed tables |
| 6 | Notifications | Sound + vibration + tab badge | Add banner notification (4th channel) | Visual context without tab-switching in noisy venues |
| 7 | Tap targets | Not specified | 48px min, 52px primary CTA, full-width | One-handed use while moving with trays |
| 8 | CTA label | Generic ("Accept", "Mark Served") | Guest-labeled ("Accept (Guest #3)") | Clarity when table has multiple guests |
| 9 | Swipe gestures | Not mentioned | Explicitly rejected for actions | Base44 limitation + error-prone while moving |
| 10 | Status colors | Defined per-status | Same colors + card left border + muted Preparing | Faster visual scanning via border color |
