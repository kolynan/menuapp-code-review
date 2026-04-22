---
type: discussion
budget: "$12"
session: S70
priority: high
created: "2026-03-02"
depends_on: "Audit_FunctionalMap_S70.md (already completed)"
---

# Deep Functional Analysis: StaffOrdersMobile + PublicMenu

## Context

The first audit (Audit_FunctionalMap_S70.md) mapped existing features as a checklist. This task goes DEEPER — analyze from the perspective of real restaurant operations, find gaps in user journeys, and propose what's actually needed vs what's unnecessary.

Read `pages/StaffOrdersMobile/Audit_FunctionalMap_S70.md` first to avoid repeating what's already documented.

## Files to Analyze

Same as first audit:
- `pages/StaffOrdersMobile/base/staffordersmobile.jsx` (~3040 lines)
- `pages/PublicMenu/base/x.jsx` (~2504 lines) + all PublicMenu base/ files
- `pages/PublicMenu/base/useTableSession.jsx` (~838 lines)
- `components/sessionHelpers.js` (~206 lines)

## Part 1: Full Customer Journey (Guest Perspective)

Walk through the COMPLETE journey of a restaurant guest, step by step. For EACH step, document what happens in the app and where the journey breaks or is awkward.

**Scenario A: Hall guest (dine-in)**
Guest enters restaurant → sits down → scans QR → sees menu → browses → adds items → submits order → waits → food arrives → wants more → orders again → wants dessert → orders → asks for bill → pays (outside app) → payment confirmed → leaves

Key questions:
- After guest submits order — what does the guest SEE? Just a toast and back to menu? Is there an "order status" screen?
- Guest wants to see ALL their orders for this visit — where? Is it clear and easy to find?
- Guest wants the bill (total) — how do they see it? Is there a "my bill" screen?
- Guest is done eating, wants to leave — what's the exit flow? Does anything happen in the app?
- What if guest closes browser and opens QR again — does session restore? What do they see?
- What if a second person at the same table scans the QR — how does multi-guest actually work from UX perspective?
- What if guest wants to CANCEL an order they just placed — can they?

**Scenario B: Pickup guest**
Guest opens link → sees menu → selects pickup → browses → adds items → enters phone + name → submits → waits for notification → comes to pick up → gets food

Key questions:
- After order submitted — does guest get any confirmation with order number?
- How does guest know when order is ready? Push notification? SMS? Just check the app?
- What if guest wants to cancel pickup order?

**Scenario C: Delivery guest**
Same as pickup but with address entry. Document the full flow and gaps.

## Part 2: Full Waiter Workday

Walk through a COMPLETE working day of a waiter:

**Morning:**
- Waiter arrives, opens app → what does he see first?
- How does he know which tables are his responsibility?
- Are there any orders from yesterday still showing? (shift filtering)

**During service:**
- New order comes in → notification → waiter looks at phone → sees which table → goes to table → confirms order
- Multiple tables ordering simultaneously — how does waiter prioritize?
- Guest asks waiter verbally to order something (no QR) → can waiter create order? (We know: NO — document the gap)
- Food is ready (kitchen marks "ready") → how does waiter know? Banner? Sound? What if phone is in pocket?
- Waiter brings food → marks "served" → what happens on guest's screen?
- Guest wants to change order (add item, remove item) → can waiter do this?
- Guest wants bill → presses help button → waiter sees request → brings bill → guest pays cash/card (outside app) → waiter marks payment received → HOW? Is there a "mark as paid" button?
- Table is done → waiter closes table → what exactly happens? Session closed? Orders archived?

**End of day:**
- Last guests leave → waiter closes remaining tables → anything else needed?
- Is there a summary of the day? (orders served, tables handled, tips?)

## Part 3: Kitchen Perspective

- Cook opens staffordersmobile → sees orders → how are they displayed for kitchen?
- Can cook filter by "new" orders only?
- Cook finishes dish → marks ready → notification goes to waiter?
- Multiple orders from same table — shown together or separately?
- Is there an "order queue" concept (FIFO)?

## Part 4: Edge Cases & Real-World Situations

Analyze how the app handles these REAL situations:
1. Guest sits down but doesn't order for 20 minutes — then orders
2. Guest orders, then moves to different table
3. Two waiters accidentally accept the same order
4. Internet drops for 30 seconds during order submission
5. Guest scans QR of wrong table (sits at table 5, scans table 3)
6. Restaurant is closing in 30 minutes — can they stop accepting orders?
7. Dish runs out mid-service — how to mark it unavailable?
8. Guest complains about food — is there any complaint/feedback mechanism besides reviews?
9. Large party (10+ people) at one table — does the UI scale?

## Part 5: Gap Analysis — What's ACTUALLY Needed

Based on Parts 1-4, create a prioritized list:

**Format for each item:**
```
### GAP-XX: [Name]
- **What's missing:** clear description
- **Who needs it:** guest / waiter / kitchen / manager
- **Impact:** HIGH (blocks core flow) / MEDIUM (workaround exists) / LOW (nice to have)
- **Recommendation:** implement now / later / never (with reasoning)
```

Important notes:
- Payment processing is OUT OF SCOPE — app does not handle payments. Only "mark as paid" confirmation is relevant.
- Phone number entry by waiter — decided NOT NEEDED
- Explicit shift start/end — likely NOT NEEDED (auto-filtering works)
- Focus on what a REAL restaurant needs to operate, not theoretical features
- Be honest about what's "nice to have" vs "actually needed"

## Part 6: Bug — Session Status Mismatch

The first audit found: `sessionHelpers.js:getOrCreateSession()` creates sessions with `status: "active"`, but `useTableSession.jsx` searches for `status: "open"`.

Investigate thoroughly:
1. Trace EVERY code path that creates a session — what status does each use?
2. Trace EVERY code path that reads/filters sessions — what status does each expect?
3. Is this actually a bug or is it handled elsewhere?
4. If it's a bug — what's the real-world impact? Can it cause data loss?

## Output

Save results to: `pages/StaffOrdersMobile/DeepAnalysis_S70.md`

## Instructions

- git add -A && git commit -m "S70: start deep functional analysis" && git push
- Read the first audit (Audit_FunctionalMap_S70.md) before starting
- Read ALL source files thoroughly — don't skim
- Think like a restaurant owner, not a developer
- For each gap, be practical: does a small restaurant with 10 tables ACTUALLY need this?
- Don't pad the report with obvious things — focus on insights
- git add -A && git commit -m "S70: deep functional analysis complete" && git push
