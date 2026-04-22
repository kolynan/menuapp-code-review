---
type: discussion
budget: "$12"
session: S70
priority: high
created: "2026-03-02"
---

# Functional Audit: StaffOrdersMobile + PublicMenu

## Goal

Comprehensive functional audit of the waiter interface (StaffOrdersMobile) and client menu (PublicMenu) — map ALL user flows from both perspectives (client + waiter), identify gaps, and assess whether refactoring is needed.

## Files to Analyze

### StaffOrdersMobile (~3940 lines)
- `pages/StaffOrdersMobile/base/staffordersmobile.jsx` — main file, 14 components

### PublicMenu (~2460 + ~758 lines)
- `pages/PublicMenu/base/x.jsx` — main file, 22 components
- `pages/PublicMenu/base/useTableSession.jsx` — table session hook
- `pages/PublicMenu/base/CartView.jsx` — cart drawer
- `pages/PublicMenu/base/CheckoutView.jsx` — checkout
- `pages/PublicMenu/base/MenuView.jsx` — menu items display
- `pages/PublicMenu/base/ModeTabs.jsx` — hall/pickup/delivery tabs
- `pages/PublicMenu/base/StickyCartBar.jsx` — floating cart button
- `pages/PublicMenu/base/HelpModal.jsx` + `base/helpFab.jsx` — help UI

### Shared
- `components/sessionHelpers.js` — session utility functions

## Deliverable 1: User Flow Map

For EACH flow, document:
- **What the user does** (step by step)
- **What code handles it** (component/function name)
- **Status**: ✅ works, ⚠️ partial, ❌ missing, ❓ unclear

### Client (Guest) Flows to Check:
1. Scan QR → land on menu → see restaurant info
2. Select mode: hall / pickup / delivery
3. **Hall mode:** choose table → enter table number/code
4. **Enter phone number** — where? when? is it required?
5. Browse menu → view dish details → add to cart
6. View cart → modify quantities → remove items
7. Checkout → confirm order → see confirmation
8. Track order status (waiting → preparing → ready → served)
9. Call waiter / request help
10. Place additional order at same table
11. View order history for current session
12. What happens if session expires while browsing?

### Waiter (Staff) Flows to Check:
1. Login / access → how does waiter get to the screen?
2. **Select/assign table** — how does waiter choose which tables to watch?
3. **Enter client phone number** — is there a field for this? Where?
4. See new order notification → review order details
5. Accept/confirm order
6. Change order status: new → preparing → ready → served
7. View all orders grouped by table
8. View detail of specific table → see all guests + orders
9. Handle service requests (help button from client)
10. Close table / end session
11. Multi-device lock — how it works for waiter
12. Shift management — start/end shift
13. Sound/vibration notifications
14. Favorites (my tables) — how to set up
15. Handle pickup/delivery orders (no table)
16. Create order on behalf of client (waiter-initiated order)

### Cross-Flow (Client ↔ Waiter):
1. Client orders → waiter sees it — what's the full chain?
2. Waiter marks "served" → client sees what?
3. Table session lifecycle: open → active → close — who controls what?
4. Guest identification — how does waiter know which guest ordered what?
5. Multiple guests at same table — how is this handled?

## Deliverable 2: Correspondence Table

Create a markdown table:

| # | Feature / Flow | Client Code | Waiter Code | Status | Notes |
|---|---|---|---|---|---|
| 1 | Enter phone number | ? | ? | ? | Where is this? |
| 2 | Select table | ? | ? | ? | ... |
| ... | | | | | |

## Deliverable 3: Refactoring Assessment

StaffOrdersMobile is ~3940 lines in ONE file. PublicMenu x.jsx is ~2460 lines.

Answer these questions:
1. **Can StaffOrdersMobile be split?** Into what logical modules? What components are independent enough to extract?
2. **Risk assessment:** What's the risk of refactoring now vs later? Will it break existing functionality?
3. **Is refactoring blocking new features?** Are there features that can't be added because of the monolith structure?
4. **Recommendation:** Refactor now, refactor later, or leave as-is? With clear reasoning.
5. **If refactoring — proposed file structure.** What files, what goes where, estimated effort.

## Output

Save results to: `pages/StaffOrdersMobile/Audit_FunctionalMap_S70.md`

## Instructions

- git add -A && git commit -m "S70: start functional audit" && git push
- Read ALL files listed above before starting analysis
- Be thorough — check every component, every handler, every entity interaction
- Don't guess — if something is unclear in the code, mark it as ❓
- Focus on WHAT EXISTS vs WHAT'S MISSING, not on code style
- git add -A && git commit -m "S70: functional audit complete" && git push
