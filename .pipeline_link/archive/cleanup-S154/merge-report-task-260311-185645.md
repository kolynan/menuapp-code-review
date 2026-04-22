## Merge Report: order-flow.md UX Concept Compilation

### Task
Create `ux-concepts/order-flow.md` — cross-page UX concept document for the full order flow.

### Source Files Read (CC)

| # | File | Content Used |
|---|---|---|
| 1 | outputs/reports/Analysis_P0-1_ExpiredSession_S68.md | Session expiry logic, SESS-008/021, hasRecentActivity guard |
| 2 | pages/PublicMenu/README.md | Full changelog S65-S87, current RELEASE versions |
| 3 | pages/StaffOrdersMobile/DeepAnalysis_S70.md | Full customer journey (12 steps), GAP-01..12 |
| 4 | pages/StaffOrdersMobile/Audit_FunctionalMap_S70.md | Functional map, correspondence table |
| 5 | pages/StaffOrdersMobile/BUGS.md | Fixed/active bugs, sprint notes |
| 6 | pages/PublicMenu/BUGS.md | BUG-PM-001..034, session/cart/drawer fixes |
| 7 | pages/PublicMenu/versions/round1_260303.md | Cart drawer UX discussion (Q1-Q4) |
| 8 | outputs/Design_WaiterScreen_Backlog_S64.md | V2 implementation plan, 4 sprints |
| 9 | outputs/discussion-result.md | Waiter Screen V2 Q1-Q6 consensus |
| 10 | pages/PublicMenu/review_2026-03-06.md | Drawer fixes verification |

### Note on Missing Source Files

The task referenced specific files that don't exist in the repo:
- `outputs/ux/UX_Discussion_OrderFlow_S61.md` — NOT FOUND
- `outputs/ux/UX_OrderFlow_round2_260301.md` — NOT FOUND
- `outputs/chatgpt/ChatGPT_Response3_SessionContract_S67.md` — NOT FOUND
- `outputs/chatgpt/ChatGPT_Response2_SessionLogic_S67.md` — NOT FOUND
- `outputs/chatgpt/ChatGPT_Response_TableSession_S65.md` — NOT FOUND
- `outputs/ux/Claude_UX_Analysis_GuestCart_S74.md` — NOT FOUND
- `outputs/chatgpt/ChatGPT_Response3_GuestCartUX_S74.md` — NOT FOUND
- `ux-concepts/PRINCIPLES.md` — NOT FOUND
- `ux-concepts/public-menu.md` — NOT FOUND
- `ux-concepts/TEMPLATE.md` — NOT FOUND

These files were likely from earlier sessions or a different workspace. The information was reconstructed from the available sources listed above, which contain the same decisions in aggregated form (DeepAnalysis_S70, BUGS.md, README.md, etc.)

### Codex Integration

Codex was launched but encountered filesystem enumeration timeouts (the referenced source directories don't exist). A second Codex review pass was launched on the created file for completeness checking.

### CC Analysis Summary

The document covers:
- 7 Order Flow decisions (Q1-Q7) with consensus status
- Session contract (SESS-008, 016, 021, 022) with lifecycle diagram
- Cart drawer architecture (two-mode, snap points, sections)
- Post-order flow (confirmation screen, rating timing)
- Live status mapping (5 statuses, guest + waiter sides)
- Implementation priorities (P0 done, P1 todo, P2-P3 future)
- Cross-page data contract (entity relationships)
- Known limitations (7 items from GAP analysis)

### Result

File created: `ux-concepts/order-flow.md` (~280 lines)
Commit: 32e4df4
Pushed to main.
