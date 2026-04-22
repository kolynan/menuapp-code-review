---
task_id: waiter-sprint-a-card-redesign-s64
type: implementation
page: StaffOrdersMobile
budget: 12.00
session: S64
date: 2026-03-02
use_codex: true
---

# Sprint A: Waiter Screen Card Redesign

## Context

Design spec approved in S64 discussion (CC + Codex, 3 rounds, $1.81, full consensus).

Spec files (read these first):
- `outputs/Design_WaiterScreen_V2_S64.md` — full UX spec with wireframes and color system
- `outputs/Design_WaiterScreen_Backlog_S64.md` — implementation backlog with Sprint A details

Source code:
- `pages/StaffOrdersMobile/base/staffordersmobile.jsx` — current production code (read this to understand existing structure)

## Goal: Sprint A changes only

Implement exactly these 5 changes from the spec. No other changes.

### V2-01: Compact card layout

Replace the current full-detail OrderGroupCard with a compact summary card.

Current card shows: table name, status, ALL guests, ALL items per guest, ALL action buttons.

New compact card shows:
- Table name + zone (e.g., "Table 5 - Main Hall")
- Status badge chip (colored pill with status text)
- Guest count + item count (e.g., "2 guests, 4 items") — no item names
- Elapsed time (since oldest unresolved action)
- ONE primary CTA button (see V2-08 for label format)

Remove item-level detail from the card. Item detail moves to full-screen view (Sprint B — not this task).

### V2-05: Color-coded left borders

Add a 4px colored left border to each card based on table status:

| Status | Border color | Card background tint |
|--------|-------------|---------------------|
| BILL_REQUESTED | #8b5cf6 (purple), 4px solid | #faf5ff |
| NEW | #3b82f6 (blue), 4px solid | #eff6ff |
| READY | #f59e0b (amber), 4px solid | #fffbeb |
| ALL_SERVED | #22c55e (green), 4px solid | #f0fdf4 |
| PREPARING | #cbd5e1 (light gray), 2px solid | #f8fafc |
| STALE (>3min in Free tab) | #ef4444 (red), 4px solid | #fef2f2 |

Status badge chip uses the same color as border background (e.g., purple chip for BILL_REQUESTED).

### V2-06: Muted Preparing cards

For tables in PREPARING status:
- Background: #f8fafc (slate-50, very light gray)
- Left border: 2px solid #cbd5e1 (light gray, thinner than active cards)
- Text color: #64748b (muted gray instead of standard dark)
- NO CTA button shown (nothing for the waiter to do — kitchen is working)
- Status badge: gray chip "Preparing" with elapsed time

### V2-08: Guest-labeled CTA

CTA button text must include guest context:
- "Accept (Guest #3)" instead of "Accept"
- "Mark Served (Guest #1)" instead of "Mark Served"
- "Close Table (Guest #1)" when closing for a specific guest
- "Close Table" (no guest label) for the table-level close action

If multiple guests have the same priority action, pick the lowest-numbered guest. After action is taken, recompute and show next priority action.

### V2-10: Tap target sizing

- Primary CTA button: min-height 52px, full card width
- Any secondary buttons (if present): min-height 48px
- Minimum 8px vertical spacing between interactive elements

## Sort Order (Mine tab)

While you're modifying the card rendering, also implement the static sort order for the Mine tab:

Priority (highest to lowest, top of list = highest priority):
1. BILL_REQUESTED (oldest first within group)
2. NEW (oldest first)
3. READY (oldest first)
4. ALL_SERVED (oldest first)
5. PREPARING (oldest first)

This replaces any existing sort logic in the Mine tab.

## What NOT to change

- Do NOT build the full-screen detail view (Sprint B)
- Do NOT implement split-tap navigation (Sprint B)
- Do NOT implement the Preparing-to-Ready animation (Sprint C)
- Do NOT implement banner notifications (Sprint D)
- Do NOT change the claim model (Free/Mine/Others tabs)
- Do NOT change the polling logic or data fetching
- Do NOT change the kitchen staff view (if separate)
- Do NOT change any routing or navigation

## Deliverable

Follow the code-workflow skill for RELEASE naming.

Create RELEASE file: `pages/StaffOrdersMobile/260302-00 StaffOrdersMobile RELEASE.jsx`

After completing, update `pages/StaffOrdersMobile/BUGS.md` with any bugs found.
Update `pages/StaffOrdersMobile/README.md` with V2 Sprint A in the UX changelog.

## Git

Start with: git add -A && git commit -m "chore: pre-task checkpoint before Sprint A card redesign" && git push

End with: git add -A && git commit -m "feat: waiter screen Sprint A - compact cards, color borders, sort order" && git push
