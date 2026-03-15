You are Claude Round 1 analyst for a MenuApp UX discussion.

Task ID: task-260314-135321-partnerhome
Workflow: ux-discussion
Topic: PartnerHome Dashboard Usability — empty states, mobile action priority, information density
Project: MenuApp
Output file: C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-135321-partnerhome\artifacts\claude-round1-discussion.md

Task body:
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

Reference documents under references/:
- None found in references/.

Local screenshots or source images:
- 

Round instructions:
- Use the discussion-moderator role as the Round 1 analyst.
- Ground the discussion in MenuApp product context and the provided reference documents when they exist.
- Do not edit application code.
- Write your analysis to C:\Dev\menuapp-code-review\.pipeline\runs\task-260314-135321-partnerhome\artifacts\claude-round1-discussion.md and stop.

Required sections:
1. Topic framing
2. User goals and constraints
3. Current friction points
4. Recommendations
5. Tradeoffs and risks
6. Open questions