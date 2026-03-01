---
topic: MenuApp UX Design -- Guest Flow, Waiter Model, Table Lifecycle (5 Topics)
date: 2026-03-01
rounds: 2
status: completed
participants: Claude (CC, claude-opus-4-6), Codex (GPT, gpt-5.3-codex)
---

# Discussion: MenuApp UX Design (5 Topics)

## Summary

Two rounds of structured discussion between Claude and Codex produced strong consensus on all 5 core UX topics for MenuApp. The main debate points were: waiter mental model (Claim vs Zone), table lifecycle complexity (4 vs 7 states), post-order experience (animated success vs plain summary), and rating timing (after Served vs after session closure). All were resolved with clear decisions grounded in Kazakhstan restaurant market reality and Base44 platform constraints.

## Agreed (both AI)

1. **Embed table ID in QR URL** (`/x?partner=123&mode=hall&table=01`). Manual code entry becomes fallback only.
2. **8-hour session TTL** in localStorage. Matches Kazakhstan dining culture.
3. **Reuse existing useTableSession.jsx** restore infrastructure (7 fallback layers). Do not redesign.
4. **Animated success screen** after order (Option D: checkmark animation + order summary + CTAs).
5. **Rating prompt after "Served" status**, once per session. Not at session closure (too late).
6. **Claim model for waiter workflow** as default. Zone model is future V2.
7. **Simplified table state machine**: IDLE -> ACTIVE -> BILL_REQUESTED -> CLOSED (4 states, not 7).
8. **Table verification triggers session creation** (not first order). Data model dependency requires this.
9. **One table card with guest sub-sections** for waiter view. Not separate cards per guest.
10. **Simple NEW badge** on table card for new orders. No complex batch markers.
11. **Validate partner+table exists** on page load (prevent spoofed table IDs).
12. **close_reason field** on TableSession (manual/timeout/eod) instead of separate EXPIRED state.
13. **Oldest-first default sort** in Free pool to prevent cherry-picking.

## Claude's perspective (key unique contributions)

- Identified that 3-hour inactivity timeout was too aggressive for Kazakhstan market (long family dinners). Pushed for 8-hour TTL.
- Argued against Zone model by citing target market reality: 2-5 waiters per shift, no formal sections, flexible "help each other" culture.
- Argued for rating after "Served" instead of session closure, citing that KZ restaurant guests leave immediately after paying.
- Proposed simplified 4-state machine instead of 7 states, arguing that open_settlement and ready_to_close are invisible to both guest and waiter.
- Identified chicken-and-egg problem: table verification must trigger session creation before order (Order links to SessionGuest which links to TableSession).
- Grounded all positions in actual codebase: useTableSession.jsx already has 8h TTL, 7 restore layers, optimistic updates, polling infrastructure.

## Codex's perspective (key unique contributions)

- Initially proposed Zone model with explicit table ownership (iiko/Toast style). Conceded this is V2 for larger restaurants.
- Proposed sig= HMAC parameter on QR URLs for anti-spoofing. Accepted this is over-engineering for MVP but valid for V2.
- Suggested telemetry for which guest restore layer succeeds -- useful for debugging edge cases.
- Proposed anti-cherry-pick guardrails for claim model: oldest-first sorting, stale unclaimed alerts.
- Suggested close_reason field instead of separate EXPIRED state -- cleaner data model for analytics.
- Proposed "Transfer my tables" feature for waiter breaks. Accepted as V2.

## Disagreements (all resolved)

| Topic | Claude Position | Codex Position | Resolution |
|---|---|---|---|
| QR URL signature | Not needed for MVP | Add sig= for anti-spoofing | Claude wins: public menu, no security concern. V2 if needed. |
| Session timeout | 8 hours (current code) | 3 hours inactivity | Claude wins: KZ dining culture. |
| Post-order screen | Option D (animation + summary) | Option B (plain summary) | Claude wins: animation is zero-cost CSS, adds emotional reward. |
| Rating timing | After "Served" status | After session closure | Claude wins: guests leave after paying, closure is too late. |
| Waiter model | Claim (current) | Zone (new) | Claude wins: target market is small restaurants. Zone = V2. |
| State machine | 4 states | 7 states | Claude wins: intermediate states invisible to users. |
| Session trigger | Table verification | First order | Claude wins: data model requires SessionGuest before Order. |
| Batch markers | Simple NEW badge | Per-guest batch markers | Claude wins: waiters care about NEW items, not batch boundaries. |
| EXPIRED state | Separate state | close_reason field | Codex wins: cleaner data model. |
| Anti-cherry-pick | Not mentioned | Oldest-first + stale alert | Codex wins: good lightweight guardrail. |
| Restore telemetry | Not mentioned | Log which layer succeeded | Codex wins: useful debugging data. |

## Recommendation for Arman

All 5 topics have clear decisions. The key changes to implement:

1. **Add table ID to QR URLs** -- this is the single biggest UX improvement. Guests will no longer need to manually enter table codes. QR generation in partnertables must include &table=NN, and PublicMenu needs to read the table param.

2. **Build a proper post-order success screen** -- animated checkmark, order summary, "Browse menu" and "My orders" buttons. This replaces the current buggy dialog that scrolls to the wrong position.

3. **Fix 3 bugs immediately** -- "Table Table 1" duplication, raw i18n keys in status badges, and rating prompt timing. All are low-complexity fixes.

4. **Keep the current waiter model** -- Free/Mine/Others claim-based workflow works well for small restaurants. No need to add zone assignment complexity now.

5. **Add Bill Request flow** -- guest taps "Request bill" in HelpModal, waiter sees purple badge. This connects the guest experience to the waiter workflow in a way that matches physical restaurant operations.

## Next steps

1. Review the 4 deliverable files (see file list below)
2. Answer the Open Questions in each file
3. Start implementation with Sprint 1 (P0 bug fixes -- low effort, high impact)
4. Sprint 2-3 will deliver the new post-order screen and QR URL enhancement

## Deliverable Files

- `outputs/Design_GuestPage_S61.md` -- guest page UX specification
- `outputs/Design_StaffPage_S61.md` -- waiter page UX specification
- `outputs/Design_Interactions_S61.md` -- guest-waiter interaction design
- `outputs/Design_Implementation_Backlog_S61.md` -- prioritized implementation tasks
