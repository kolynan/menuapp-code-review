---
chain_template: discussion-cc-codex
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 10
type: Д3
ws: WS-SOM
title: SOM Б2.2 Discovery — BUG-SM-015 / BUG-SM-019 / completed card UX
---

# SOM Б2.2 Discovery

You are a senior React developer analyzing `pages/StaffOrdersMobile/staffordersmobile.jsx` (4660 lines).

## Context

StaffOrdersMobile shows table order groups («СКС», свёрнутая карта стола) in two tabs: «Активные» and «Завершённые».

Each table group has a `compositeKey = "${tableId}__${orderSessionId}"` where:
- `orderSessionId` = `getLinkId(o.table_session)` if not null, else `'no-session'`
- The group's `sessionId` = that value (or null if 'no-session')

`openSessionByTableId` (line ~3554-3561) maps `tableId → current open TableSession` from query `["openSessions", partnerId]` with `staleTime: 5_000`.

`filteredGroups` (line ~3883-3906) decides active vs completed:
```js
const openId = openSessionByTableId[group.id]?.id || null;
const isCurrentOpenSession = !!openId && group.sessionId === openId;
if (!isCurrentOpenSession) return activeTab === 'completed';
// ...else fall through to order-status based logic
```

## Bug 1: BUG-SM-015 (P0) — New order on new session → appears in «Завершённые»

**Reproduction:** Guest scans QR at a table whose previous session was closed. They place a new order (new TableSession created). On the waiter's SOM screen, the new group appears in «Завершённые» instead of «Активные».

**What we know:**
- The new order arrives via `orders` query refetch
- `order.table_session` is set to the new session ID
- BUT `openSessions` cache has `staleTime: 5_000` — it may not refetch immediately
- When `orderGroups` recomputes with the new order: `openSessionByTableId[tableId]` is still null (old session was closed, new session not yet in cache)
- `openId = null` → `isCurrentOpenSession = false` → group goes to `completed`
- We tried `queryClient.invalidateQueries({ queryKey: ['openSessions'] })` inside the new-orders notification useEffect — did NOT fix it (race condition: `filteredGroups` recomputes with `orders` data BEFORE `openSessions` refetch completes)

**Question 1:** What is the correct fix for `filteredGroups` to handle the case where `openId = null`?

Specifically:
- Option A: When `openId = null`, fall through to order-status-based logic (check `hasActiveOrder || hasServedButNotClosed`) instead of auto-sending to `completed`. This would correctly show new orders in «Активные».
- Option B: Add a separate query for recently-created sessions (by order's `table_session`), use it as a fallback.
- Option C: Another approach?

Analyze the code at lines ~3883-3906 and propose the most correct fix. Consider: will Option A cause regressions? What about a table that truly has no open session and no active orders — would it stay in «Завершённые» correctly?

Also check `tabCounts` (line ~3908-3936) — it has the same `openId` logic and needs the same fix if you change `filteredGroups`.

## Bug 2: BUG-SM-019 (P1) — Two СКС for same table merge into one

**Reproduction:** Table had two separate sessions (opened, closed, opened again, closed). Both sessions are now in «Завершённые». They appear as ONE merged card showing combined guest count and dish count.

**Root cause (suspected):** When B44 closes a TableSession, it may nullify `order.table_session` on closed orders. Then:
- `getLinkId(o.table_session)` returns null
- `orderSessionId = 'no-session'` (line 3781)
- Both sessions get `compositeKey = "${tableId}__no-session"`
- React renders them as one group with all orders merged

**Verify:** Check line ~3781 — `const orderSessionId = getLinkId(o.table_session) || 'no-session';`

**Question 2:** What is the best fix to keep separate СКС for closed sessions?

Consider:
- Option A: Query closed TableSessions (`{ status: 'closed' }`) for the relevant tables and use their IDs as compositeKey instead of `'no-session'`
- Option B: Store `table_session` snapshot on the order object before it's nullified (B44 side — may not be possible)
- Option C: Generate compositeKey from first-order timestamp or order IDs as a fallback when `table_session` is null — e.g., group by first order's `created_date` (truncated to minute)
- Option D: Add a `closedSessions` query (`TableSession.filter({ partner, status: 'closed' })`) and match orders by session overlap

Recommend the most practical fix that works within the current B44 / React Query constraints.

## Feature: UX for completed table cards

**Context:** Currently a completed СКС shows: table name, guest count, dish count, order statuses. Waiters need more info to understand WHICH table was closed and when.

**Question 3:** What information to show on a completed table card (group.type === 'table' && !isCurrentOpenSession)?

Consider:
- Close time: when was the session closed? (from `TableSession.closed_date` or similar field)
- Total amount: sum of order totals for that session
- What B44 `TableSession` entity fields are available? (common fields: `id`, `table`, `partner`, `status`, `created_date`, `closed_date`, `total_amount` or derived)

Propose:
1. What fields to display (and from which entity)
2. How to retrieve them efficiently (from existing data or minimal additional query)
3. What the card should look like: e.g., «Стол 5 · закрыт 14:32 · 12 400 ₸»

## What to return

For each of the 3 questions above:
1. Your recommended fix/approach with reasoning
2. Code snippet (relevant section, ~10-20 lines) showing proposed change
3. Potential risks or edge cases

Focus on correctness and minimal blast radius. Do NOT rewrite large sections — targeted fixes only.

Read the file (`pages/StaffOrdersMobile/staffordersmobile.jsx`) and analyze the relevant sections before answering. Key line ranges:
- `getLinkId` helper: ~line 546
- `openSessions` query: ~lines 3541-3552
- `openSessionByTableId` memo: ~lines 3554-3561
- `orderGroups` memo (compositeKey logic): ~lines 3770-3840
- `filteredGroups` memo: ~lines 3883-3906
- `tabCounts` memo: ~lines 3908-3936
