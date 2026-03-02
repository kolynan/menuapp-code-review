---
topic: Waiter Screen V2 -- UX Design (Q1-Q6)
date: 2026-03-02
rounds: 3
status: completed
participants: Claude (CC, Opus 4.6), Codex (GPT)
---

# Discussion: Waiter Screen V2 UX Design

## Summary

Three-round discussion on 6 UX questions for the waiter mobile interface in MenuApp. Round 1 produced independent answers from both AI with agreement on Q1 (one CTA per card), Q5 (large tap targets, no swipe), and Q6 (add banner notifications). Rounds 2-3 resolved disagreements on Q2 (card detail), Q3 (sort order), and Q4 (Preparing table treatment). Final result: full consensus on all 6 questions. Codex accepted Claude's proposals on all three disputed points after Claude presented arguments grounded in the target user profile (non-tech waiters, 3-8 tables, small KZ restaurants).

## Agreed From Round 1 (both AI independently aligned)

- **Q1:** One primary CTA per card, showing the most urgent action. Codex added the detail of including guest context in the button label ("Accept (Guest #3)"), which Claude accepted.
- **Q5:** Primary CTA buttons at 52px height, full-width. No swipe gestures (Base44 constraint + error-prone while moving). Minimum 48px for secondary elements.
- **Q6:** Banner notification should be added as a fourth notification channel (alongside sound, vibration, tab badge). Auto-hide 5s, tap to navigate, de-duplication for polling bursts.

## Claude's Perspective (unique contributions)

- **Q2:** Full-screen detail for complex table info (multiple guests, many items) provides better layout than an accordion that is effectively full-screen with worse structure. Proposed the "split-tap" hybrid: CTA executes in-list, card body opens detail.
- **Q3:** Static sort order over dynamic timer-based reordering. Argument: predictability is more important than algorithmic optimization for non-tech users who learn a fixed system in 5 minutes.
- **Q4:** Muted-in-place over separate section. Argument: spatial stability matters more than noise reduction at the 3-8 table scale. Moving cards between sections creates anxiety ("where did my table go?").
- **Project context advantage:** Claude knew the target restaurant size (2-5 waiters, 8-20 tables), which grounded arguments about list length and cognitive load.

## Codex's Perspective (unique contributions)

- **Q1:** Guest-labeled CTA text -- a practical detail Claude had not specified.
- **Q2 Round 1:** Accordion approach preserves list context during triage. Strong argument about losing queue visibility in full-screen. Led to the hybrid compromise.
- **Q3 Round 2:** Dynamic timer-based ordering (READY jumps above NEW after 90-120s). Interesting idea grounded in real kitchen dynamics (plated food degrades fast). Deferred to V2.1 for potential future use.
- **Q4 Round 1:** Separate "In Kitchen" section with compact rows. Valid for larger operations. Both AI agreed to reserve this for V2 when 15+ table restaurants are onboarded.
- **Q5:** Recommended 52-56px minimum for primary buttons (higher than Claude's 48px). The higher end pushed the final spec to 52px for primary CTAs.

## Disagreements and Resolution

### Q2: Card Detail View
| Round | Claude | Codex | Status |
|-------|--------|-------|--------|
| R1 | Full-screen detail (Option A) | Inline accordion (Option B) | Disagreed |
| R2 | Full-screen for deep content | Hybrid: list-first + capped accordion + full-screen for deep | Moved closer |
| R3 | Split-tap: CTA executes in list, card body opens full-screen | Accepted split-tap | Resolved |

**Resolution:** Both recognized the other's valid point. Claude conceded that full-screen for every tap loses queue context. Codex conceded that accordion expansion for multi-guest cards is effectively full-screen with worse layout. The split-tap hybrid satisfied both concerns.

### Q3: Priority Sort Order
| Round | Claude | Codex | Status |
|-------|--------|-------|--------|
| R1 | NEW > READY (static) | BILL > READY > NEW (dynamic timer) | Disagreed |
| R2 | BILL > NEW > READY (static) | BILL > dynamic READY/NEW > SERVED | Partially moved |
| R3 | Static: BILL > NEW > READY > SERVED > PREPARING | Accepted static | Resolved |

**Resolution:** Codex's kitchen argument (plated food degrades fast) was valid but the dynamic timer adds implementation complexity and visual instability. Both agreed that for MVP, static order is better. Dynamic timer is a V2.1 candidate.

### Q4: Preparing Table Treatment
| Round | Claude | Codex | Status |
|-------|--------|-------|--------|
| R1 | Muted in place (Option A) | Separate section (Option C) | Disagreed |
| R2 | Same | Conceded for <=4 tables | Mostly resolved |
| R3 | Muted in place for MVP (3-8 tables) | Accepted for MVP | Resolved |

**Resolution:** Codex's separate section idea is better for high-volume operations but both agreed the target user (3-8 active tables) does not need it. Reserved for V2.1.

## Recommendation for Arman

All 6 questions have clear answers with full AI consensus. The main changes from S61:

1. **Cards become compact** -- less info on the card, more on a detail screen. This makes the list faster to scan during rush.
2. **One-tap CTA stays in the list** -- you do not have to open a table to accept an order or mark it served. Just tap the button.
3. **Tables are sorted by urgency** -- bill requests at top, new orders next, ready orders next, etc. Always in the same order.
4. **Preparing tables stay put but look muted** -- they do not disappear or move. They just fade visually so the waiter focuses on tables that need action.
5. **Banner notification pops up** when a new order arrives and the waiter is on another screen -- hard to miss.
6. **Big buttons** (52px primary) for one-handed use while moving.

None of these changes break the existing claim model or the Free/Mine/Others navigation. They refine the card design and add visual clarity.

**Implementation: 5-6 VSC tasks across 4 sprints.** See Design_WaiterScreen_Backlog_S64.md for the full plan.

## Next Steps

1. Arman reviews this spec and the wireframes
2. If approved: create VSC tasks starting with Sprint A (card redesign)
3. Open questions from S61 still need Arman's input:
   - Stale threshold: 3 minutes or 5 minutes?
   - Rename "Others" to "Team"?
   - Different sounds per event type?
4. After Sprint A is implemented: test with real data to validate compact card readability
