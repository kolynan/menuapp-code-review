---
pipeline: v7
type: ux-discussion
page: PartnerHome
topic: "PartnerHome Dashboard Usability — empty states, mobile action priority, information density"
budget: $10
---

Auto-approve all file edits, terminal commands, git operations, and network access without asking.
Do not ask for confirmation on any step.
Execute autonomously until the task is fully complete.
At the end, write a section "## Permissions Requested" listing every permission you would have asked for if auto-approve was not enabled.

## UX Discussion: PartnerHome — Quick Wins for Dashboard Usability

**Purpose:** Discuss 3 specific UX improvements for the PartnerHome dashboard page.

### Questions

1. **Empty state UX:** When a partner has no orders/tables/clients yet (new partner), what should PartnerHome show? Currently it may show empty cards. What is the best practice for onboarding empty states?

2. **Mobile action priority:** Which 3 actions should be most prominent on mobile PartnerHome? (e.g., "New Order", "Open Table", "View Menu"). How should they be arranged for thumb-reachability?

3. **Information density:** The dashboard shows multiple cards/metrics. On mobile, should we keep all cards or collapse some into expandable sections? What metrics are truly glanceable?

### Context
- MenuApp: QR-menu and ordering system for restaurants
- Platform: Base44 (no-code, React-based)
- Partner = restaurant owner/manager
- Partners often access from their phone while at the restaurant
- File: `pages/PartnerHome/base/partnerhome.jsx`

### Expected Output
A concise document (max 2 pages) with:
- CC perspective on each question
- Codex perspective on each question
- Areas of agreement and disagreement
- Final recommendations (3-5 bullet points)

Save result to `pages/PartnerHome/UX_Discussion_S125.md`

IMPORTANT — git commit at the end:
git add pages/PartnerHome/UX_Discussion_S125.md
git commit -m "docs: UX discussion PartnerHome dashboard S125"
git push
