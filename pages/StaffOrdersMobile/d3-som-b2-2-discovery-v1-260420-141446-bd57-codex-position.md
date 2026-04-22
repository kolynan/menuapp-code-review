# Codex Discussion Position — Unknown
Chain: d3-som-b2-2-discovery-v1-260420-141446-bd57
Topic: SOM B2.2 Discovery

Repo-local mirror of the blocked pipeline output path `C:/Users/ASUS/Dev/Menu AI Cowork/pipeline/chain-state/d3-som-b2-2-discovery-v1-260420-141446-bd57-codex-position.md`.

## Questions Analyzed

### Q1: What should `filteredGroups` / `tabCounts` do when `openId = null`?
**Recommendation:** Use Option A narrowly: only send a table group to `completed` when `openId` exists and does not match `group.sessionId`. If `openId` is `null`, fall through to the existing order/request status logic.
**Reasoning:** `openId = null` in this file means “session cache is stale or there is no open session right now”, not “this group is definitely historical”. Hall orders without `table_session` are already filtered out before grouping at `activeOrders`, so a newly arrived hall order that reaches `orderGroups` already has a real `group.sessionId`. The only trustworthy historical signal is a positive mismatch between current open session and group session. That fixes the race without adding another query.
**Trade-offs:** For a brief poll window, the card is classified by order state rather than session state. That is preferable to a guaranteed false negative.
**Mobile UX:** Waiters see the fresh QR session in `Активные` immediately instead of hunting through `Завершённые`.

### Q2: How should completed sessions stay separate when `order.table_session` is missing?
**Recommendation:** Add a closed `TableSession` query and match missing historical orders back to a real session using the table plus session time window. Keep a synthetic key only if no closed session matches.
**Reasoning:** The merge happens at `getLinkId(o.table_session) || 'no-session'`. Timestamp buckets alone are too weak for restaurant reopen cycles. `TableSession` is the only source that can reconstruct historical boundaries and also supplies the metadata needed for the completed-card UX.
**Trade-offs:** One extra query plus interval matching logic.
**Mobile UX:** Accurate one-card-per-session history is worth the small background cost on the completed tab.

### Q3: What should a completed table card show?
**Recommendation:** Show a compact meta line like `Стол 5 · закрыт 14:32 · 12 400 ₸` on the collapsed card, with close time from the matched `TableSession` and money derived from `group.orders`.
**Reasoning:** Waiters need to recognize which session ended and when. The current codebase writes `opened_at` / `closed_at` on sessions and already derives totals from orders elsewhere, so those are the safest data sources.
**Trade-offs:** One extra muted metadata line on the card.
**Mobile UX:** Keep it to one line, use time-only for same-day sessions, and avoid expensive item-loading just to compute dish counts in the collapsed state.

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | `openId = null` race | Auto-complete only on positive mismatch; otherwise use status logic | high |
| 2 | Historical-card merge | Match missing links back to closed `TableSession` records | medium |
| 3 | Completed-card UX | Show close time plus order-derived total on the collapsed card | high |

## Prompt Clarity
- Overall clarity: 4
- Ambiguous questions: Q2 remains slightly ambiguous because the suspected `null table_session` cause conflicts with the current hall-order filter before grouping.
- Missing context: One real affected order payload plus one closed `TableSession` payload would remove the remaining uncertainty around the exact missing-link shape and field names.
