---
task_id: task-260302-052042
status: running
started: 2026-03-02T05:20:42+05:00
page: ux-waiter-screen-redesign-s64.md
work_dir: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/menuapp-code-review
budget_usd: 12.00
fallback_model: sonnet
system_rules: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/references/cc-system-rules.txt
version: "4.0"
---

# Task: task-260302-052042

## Config (v4.0)
- Budget: $12.00
- Fallback model: sonnet
- System rules: cc-system-rules.txt
- Progress: per-task TG message via progress-monitor.sh

## Prompt
IMPORTANT: Your VERY FIRST action must be: echo "started $(date -Iseconds)" > "C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/started-task-260302-052042.md" — this confirms to Cowork that you started working.


=== TASK SETUP ===
Progress file: C:/Users/ASUS/OneDrive/002 Menu/Claude AI Cowork/pipeline/progress-task-260302-052042.txt
Task ID: task-260302-052042
=== END TASK SETUP ===


---
task_id: ux-waiter-screen-redesign-s64
type: discussion
priority: high
created: 2026-03-02
session: S64
budget: 12.00
---

# UX Discussion: Waiter Screen — Speed, Clarity, One-Tap Actions

Use @discussion-moderator agent to run this CC+Codex design session.

**First:** Read `outputs/Design_StaffPage_S61.md` (existing waiter design from S61).
**Then:** Read `outputs/Design_Implementation_Backlog_S61.md` (P0/P1 waiter tasks).
**Context from Arman (owner):** The waiter interface is the most critical part of the product. If it's hard to use, the project fails. The current design groups orders by table (good) but has not solved the problem of SPEED and CLARITY — especially when one table has mixed statuses, when the waiter has their hands full, or when they need to quickly scan 5+ active tables.

---

## Core Problem to Solve

A waiter in a real restaurant:
- Has **hands full** (carrying plates) — can't scroll or search
- Thinks in **tables**, not orders — "I need to go to Table 5"
- Needs to act in **under 3 seconds** per interaction
- Manages **3-8 active tables simultaneously**
- One table can have **mixed statuses**: Guest #1 order is Preparing, Guest #3 just ordered (New)

The S61 design uses one card per table with guest sub-sections and one action button. This is the right direction, but the following open problems remain.

---

## Questions to Resolve

### Q1: One CTA vs Multiple CTAs per card

The S61 design says "one primary CTA per card." But what happens when:
- Table 5: Guest #1 order = Preparing, Guest #3 order = New

**Option A:** Show the MOST URGENT action only ("Accept" for the new order, even if another is in progress)
**Option B:** Show TWO buttons — one per guest sub-section
**Option C:** Table-level status advancement — one tap advances ALL items at the table one step

For each option: evaluate (1) cognitive load on waiter, (2) risk of error, (3) implementation complexity.

Which is best for a restaurant with 2-4 waiters and non-tech-savvy staff?

### Q2: Card vs Full-Screen detail

Should tapping a table card:
**Option A:** Open a full-screen table detail view (all guests, all items, all statuses, large action buttons)
**Option B:** Expand inline (accordion) — show full detail without leaving the list
**Option C:** Stay as compact card with all info visible (current S61 design)

Consider: waiter may need to reference what's on the table while walking to the kitchen.
Consider: waiter needs to quickly return to the main list after acting.

### Q3: Visual priority system

How should the main list (Mine tab) sort and highlight tables?
- Table with NEW items needing action (Guest just added dessert)
- Table with BILL REQUESTED (needs to bring the check — urgent)
- Table where all orders are served (can be closed)
- Table where items are Preparing (just waiting, no action needed)

**Propose a color + sort system** that lets a waiter glance at the list and instantly know what to do.

Specifically: should tables that need NO action right now be visually de-emphasized (grayed out / moved to bottom) so the waiter only sees what demands attention?

### Q4: The "Preparing" problem

When all items at a table are in "Preparing" status — there's nothing for the waiter to do (kitchen is working). But this table card still appears in "Mine" and takes up screen space.

**Option A:** Keep it in the list but visually muted (gray, no action button)
**Option B:** Collapse it to a minimal "status bar" (just table name + estimated time)
**Option C:** Move it to a separate "In Kitchen" section within Mine tab

Which approach reduces visual noise most without losing awareness?

### Q5: Tap target size and one-handed use

In a real restaurant, waiters use their phone one-handed, often while moving.
- Minimum safe tap target: 44px height (Apple HIG) — but is this enough for moving waiters?
- Should the primary action button be FULL WIDTH on the card? (easier to tap anywhere)
- Should swipe-right on a card be a shortcut for the primary action?

Evaluate full-width button vs right-side button vs swipe gesture for this context.
Consider: Base44 platform constraints — what interaction patterns are actually buildable?

### Q6: Notification + sound design

When a new order arrives while the waiter is looking at a different screen:
- Current: sound + vibration notification
- Proposed: badge counter on "Free" pill at the top updates in real-time

Should there also be a **banner notification** (like iOS) that appears on top of whatever screen the waiter is viewing? Or is the tab counter + sound sufficient?

---

## Required Output

### Deliverable 1: `outputs/Design_WaiterScreen_V2_S64.md`

Complete revised waiter screen UX spec with:
- Final answer to each of Q1-Q6 with justification
- ASCII wireframe of the main list view (Mine tab) with the new design
- ASCII wireframe of the table detail view (if recommended)
- Color system specification (what colors mean what)
- Sort order specification (what comes first and why)

### Deliverable 2: `outputs/Design_WaiterScreen_Backlog_S64.md`

Prioritized list of changes vs the S61 design:
- What changes from S61 design (and why)
- What stays the same from S61 design
- Implementation complexity for each change (S/M/L)
- Recommended implementation order

---

## Discussion Format

3 rounds:
- Round 1: Each AI independently answers Q1-Q6 with their recommendation
- Round 2: Debate the differences, challenge assumptions, consider real restaurant reality
- Round 3: Synthesis and final agreed spec

Focus on **waiter's perspective in a real KZ restaurant**. Not a tech product — a working tool for non-tech staff.

**Git:** Start with `git add . && git commit -m "S64 pre-discussion snapshot" && git push`

## Status
Running...
