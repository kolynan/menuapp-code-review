# UX Discussion — PartnerHome Dashboard Usability

**Session:** S260314-135321-partnerhome
**Date:** 2026-03-14
**Participants:** Claude (Round 1 analyst) · Codex (Round 2 reviewer) · Claude (Round 3 synthesizer)
**Page:** `pages/PartnerHome/base/partnerhome.jsx`
**Topic:** Empty states, mobile action priority, information density

---

## Executive Summary

Both AI reviewers agree that the PartnerHome dashboard needs to serve two very different users — brand-new partners (onboarding) and active partners (daily operations) — and that the current page doesn't do either job well enough on mobile.

The core consensus: **separate the onboarding experience from the operations dashboard**, add quick-action buttons so the page is not read-only, and keep headline metrics prominent while collapsing secondary details.

One meaningful disagreement emerged on mobile action layout: Claude proposed three equal-weight buttons; Codex argued for a clear 1-primary + 2-secondary hierarchy. The synthesis recommends Codex's approach — it better matches one-thumb mobile use.

A second disagreement: Claude prioritized a "vs yesterday" comparison metric (R4); Codex argued that **operational attention states** (e.g., "3 orders waiting," "1 expired table") should come first because they are actionable. The synthesis agrees with Codex — attention alerts have more urgency than trend analytics.

**Bottom line:** Five concrete recommendations follow. The first three are quick wins (days, not weeks). The last two can ship later.

---

## Key Agreements

Both reviewers converge on these points:

### 1. Separate onboarding from operations (Claude R1, Codex R2 — both)

**What:** When the onboarding checklist is incomplete AND the partner has zero orders, hide the Today statistics card. Show only the checklist and a "Preview your menu" link.

**Why they agree:** Showing `0 orders / 0 ₸` to a partner who hasn't even created their menu is discouraging. The RELEASE version (260305-00) already has the onboarding checklist; the base code does not. Either way, the stats card adds noise for a new partner.

**Trigger to switch modes:** `totalOrders > 0 OR allDone` (checklist complete). This prevents edge cases where a partner with demo-imported data would see no stats.

### 2. The dashboard needs actionable buttons, not just statistics

**What:** Add quick-action buttons so partners can navigate to key workflows directly from the dashboard.

**Why they agree:** The current page is passive — the only interactive element is the "Active Tables" button (which in the base code actually navigates to `/staffordersmobile`, not `/partnertables` as some analysis assumed). Partners who want to check orders, manage tables, or preview their menu must hunt through the tab bar.

### 3. Channel breakdown should be secondary to headline metrics

**What:** Total orders and total revenue are the two numbers partners glance at. Per-channel breakdown (hall/pickup/delivery) is secondary and should take less vertical space.

**Why they agree:** The base code already conditionally shows pickup/delivery only when `hasChannels` is true, but even one channel row (hall) is always visible. On mobile, headline numbers should dominate; channel detail is an end-of-day concern.

### 4. Empty-state hints should be more helpful

**What:** Replace the static `partnerhome.empty_hint` with guidance that's either time-aware or context-aware (e.g., "Make sure QR codes are visible on tables").

**Why they agree:** A single blue hint box reading a generic i18n string doesn't help the partner take action.

---

## Key Disagreements and Tradeoffs

### Disagreement 1: Mobile action layout — equal buttons vs. primary/secondary hierarchy

| | Claude (R1) | Codex (R2) |
|---|---|---|
| **Proposal** | 3 equal-width buttons in a horizontal row: View Orders, Manage Tables, Guest Menu | 1 large primary button (View Orders) + 2 smaller secondary buttons (Tables, Menu) |
| **Rationale** | Simplicity — 3 equal buttons are easy to build and scan | The most common mid-service action (check incoming orders) deserves visual priority. Equal buttons force a choice when there shouldn't be one. |

**Synthesis decision: adopt Codex's 1 + 2 hierarchy.**

Reasoning: Restaurant managers check incoming orders far more often than they manage tables or preview their menu. A primary "View Orders" button (full-width, prominent color) plus two smaller secondary buttons underneath matches the actual frequency of use. This also improves thumb-reachability — the primary button is a large, easy target.

### Disagreement 2: "vs yesterday" comparison vs. operational attention alerts

| | Claude (R1) | Codex (R2) |
|---|---|---|
| **Proposal** | R4: Show `↑3 vs yesterday` next to today's metrics | Show **attention states** first: "3 orders waiting," "1 table expired" — before any historical analytics |
| **Rationale** | Numbers without context are meaningless; a trend helps decision-making | Alerts about things that need action RIGHT NOW are more valuable than analytics. A partner mid-service needs to know "what requires my attention?" not "how am I doing vs yesterday?" |

**Synthesis decision: attention alerts first; defer "vs yesterday" to Phase 2.**

Reasoning: Codex correctly identifies that the dashboard's primary mid-service job is **operational awareness**. The base code already computes `expiredTables` and shows a warning — but it's buried inside the tables button. Pulling attention states up to a top-level alert banner is higher-impact and lower-effort than computing yesterday's comparison (which needs an extra query or expanded date range).

### Tradeoff: Screen real estate budget

The phone viewport is roughly 600-700px tall. Adding quick-action buttons (~80px) means something else must shrink.

- **Option A:** Collapse channel breakdown into a single expandable line → saves ~80-100px. (Both reviewers support this.)
- **Option B:** Remove the checklist after completion → frees ~300px for the operations view. (Both agree the checklist should auto-hide when `allDone`.)
- **Option C:** Use a sticky bottom bar for actions. (Claude proposed; Codex didn't weigh in. Risk: conflicts with browser navigation bars on iOS Safari.)

**Recommendation:** Use Option A + B together. Avoid sticky bottom bars (Option C) until tested on real devices — iOS Safari's dynamic toolbar makes sticky elements unreliable.

---

## Final Recommendations

Listed in priority order. Items 1-3 are quick wins; items 4-5 are Phase 2.

### 1. Conditional layout: onboarding vs. operations mode (P1 — Low effort, High impact)

- When `!allDone && totalOrders === 0`: show only the onboarding checklist + "Preview your menu" link. Hide the stats card entirely.
- When `allDone || totalOrders > 0`: show the full operations dashboard. Hide the checklist (link to "Review setup" in settings if needed).
- **Code note:** The base code currently has no checklist (only the RELEASE does). This recommendation applies to whichever version ships.

### 2. Quick-actions bar with 1 primary + 2 secondary buttons (P1 — Medium effort, High impact)

- **Primary (full-width):** "View Orders" → `/staffordersmobile` — this is the most frequent action.
- **Secondary (half-width each):** "Manage Tables" → `/partnertables` · "Guest Menu" → `/x?partner={id}`
- Place below the tables-status display. Each button: icon + label, min-height 48px, clear active/tap state.
- Note: The existing tables button in the base code already navigates to `/staffordersmobile`. If we add a dedicated "View Orders" action, consider making the tables status card non-navigating (status display only) to avoid confusion.

### 3. Attention alerts banner (P1 — Low effort, High impact)

- When there are operational items needing attention (expired tables, pending orders), show a top-level colored banner before the stats card.
- Example: `⚠️ 2 tables expired · 3 orders waiting` — tappable, navigates to the relevant page.
- The base code already computes `expiredTables`. Extend with pending-order count if the data model supports a "pending" status.
- This replaces Codex's suggestion AND is more immediately useful than Claude's "vs yesterday" metric.

### 4. Collapse channel breakdown (P2 — Low effort, Medium impact)

- Show headline metrics (orders + revenue) as two large numbers.
- Below, show a single summary line: `Hall: 8 · Pickup: 3 · Delivery: 1`. Tap to expand per-channel revenue.
- If only hall is active (i.e., `!hasChannels`), show just the hall row inline — no collapse needed.

### 5. Time-aware or context-aware empty hints (P2 — Low effort, Medium impact)

- Replace static `partnerhome.empty_hint` with contextual messages:
  - Morning + 0 orders: "Orders will appear here as guests scan your QR codes."
  - Afternoon + 0 orders: "No orders yet. Check that QR codes are visible on tables."
  - All tables closed: "No open tables. Open a table session to start receiving orders."
- Requires 3-4 new i18n keys. Timezone: use `new Date()` (browser local time), which is correct when the partner is physically at the restaurant.

### Deferred to Phase 2+

- **"vs yesterday" comparison (R4):** Valuable, but lower urgency than attention alerts. Needs either an expanded query date range or a separate yesterday query. Implement after the quick wins ship and we have usage data.
- **Sticky bottom action bar:** Don't build until tested on iOS Safari and Android Chrome with real devices. Dynamic browser toolbars make sticky positioning unreliable.

---

## Suggested Experiments and Next Steps

1. **Validate action frequency.** Add lightweight analytics (page-view counts or click tracking on the new action buttons) to confirm that "View Orders" is indeed the #1 action. Adjust button prominence based on real data after 2 weeks.

2. **A/B test the conditional layout.** If possible, run the onboarding-vs-operations split for new partners. Measure: (a) checklist completion rate, (b) time to first real order. Compare against the current "everything visible at once" layout.

3. **Check channel adoption.** Before investing in the channel-collapse UI (Recommendation 4), check what percentage of partners have `channels_configured_at` set. If <10%, consider hiding pickup/delivery entirely until configured — saves even more space.

4. **Partner timezone.** Several features (time-aware hints, future "vs yesterday" metric) assume accurate local time. Confirm whether `new Date()` in the partner's browser is sufficient, or whether we need a timezone field on the Partner entity for server-side logic.

5. **Conduct a quick thumb-zone test.** Mock up the 1-primary + 2-secondary button layout on a real phone. Verify the primary button falls in the natural thumb zone (bottom 40% of screen). Adjust placement if it doesn't.

6. **Route audit.** Codex flagged a base/live mismatch: the tables button in the base code goes to `/staffordersmobile`, not `/partnertables`. Clarify the intended navigation target before adding new action buttons that might duplicate or conflict with this route.

---

## Limitations

- **Codex Round 2 output was abbreviated.** The Codex process completed successfully but produced a summary rather than a full-length analysis. This synthesis extracts Codex's key positions (1-primary + 2-secondary layout, attention states over analytics, route mismatch callout) from the summary and the prompt context. A richer Codex output would have enabled deeper patch-level comparison.
- **No screenshots inspected.** A screenshot exists at `pages/PartnerHome/ux/screenshot.png`, but I cannot visually inspect images in this tool context. Visual layout recommendations are based on code analysis only.
- **No reference documents found.** The `references/` directory contained no PRD, architecture, or glossary files for this task. Recommendations are grounded in the codebase and prior session S111.

---

## Permissions Requested

If auto-approve were not enabled, the following permissions would have been requested:
- **File read:** `base/partnerhome.jsx`, Codex round-2 artifacts, S111 discussion, prior UX discussions
- **File write:** This synthesis document
- No terminal commands, git operations, or network access were needed for this synthesis round.
