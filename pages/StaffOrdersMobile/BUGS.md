# StaffOrdersMobile Bug Tracker

**Page:** `pages/StaffOrdersMobile/staffordersmobile.jsx`
**Last updated:** 2026-04-06 (Chain c05c — SOM Section Rework: lifecycle order, active/passive, dual metric, 2-step requests, staff pill, inline toast, close-blocker, bulk requests)

---

## Fixed Bugs

### SOM-KS1-P0-01 (P0) -- activeRequests filter excludes 'accepted' status
- **Function:** activeRequests useMemo filter (line ~3310)
- **Root cause:** Filter only included `["new", "in_progress"]` — accepted requests vanished from UI, making two-step flow impossible.
- **Fix:** Changed to `!["done", "cancelled"].includes(r.status)` — now includes accepted requests.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-P0-02 (P0) -- updateRequestMutation only passes status, loses assignee
- **Function:** updateRequestMutation mutationFn (line ~3315)
- **Root cause:** Destructured only `{id, status}` — Accept step needed `assignee` + `assigned_at` fields.
- **Fix:** Changed to spread all payload fields to update call.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-P0-03 (P0) -- onCloseRequest hardcodes 'done', ignores status parameter
- **Function:** onCloseRequest prop (line ~4190)
- **Root cause:** Status param from child was ignored — always sent 'done'. Accept button would incorrectly close request instead of accepting.
- **Fix:** Changed to pass `newStatus` and `extraFields` from child component.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-01 (P1) -- Sections in wrong lifecycle order (Ready before InProgress)
- **Root cause:** Ready rendered before InProgress in all 3+1 blocks. Lifecycle should be: New → InProgress → Ready → Served.
- **Fix:** Swapped InProgress before Ready in compact, expanded, compact-table, and legacy blocks.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-02 (P1) -- No visual distinction between active/passive sections
- **Fix:** Active headers (Requests, New, Ready) get bg pill; passive (InProgress, Served) get opacity-60.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-03 (P1) -- Section headers show single count, need dual metric
- **Fix:** Added `pluralRu` helper. Headers now show "N гость · M блюд" format in all blocks.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-04 (P1) -- Request buttons: single "Выполнено" instead of two-step flow
- **Fix:** Conditional render: new requests → blue "Принять" (sets accepted + assignee), accepted → green "Выдать" (sets done) + staff pill. All 3 render blocks updated.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-05 (P1) -- Close-table shows only first blocker, not all
- **Fix:** Replaced single ternary with array-based closeDisabledReasons. All blockers shown as list.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-06 (P1) -- No bulk request buttons
- **Fix:** Added "Принять все (N)" / "Выдать все (N)" buttons based on request status homogeneity.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-KS1-07 (P1) -- Undo toast: global fixed position instead of inline
- **Fix:** Toast now renders inline under acted order row in renderHallRows. Timeout changed 5s→3s. Added orderId + label to toast object. Global toast removed.
- **Chain:** staffordersmobile-260406-195641-c05c
- **Status:** 🟡 Fixed (pending test)

### SOM-S213-01 (P1) -- Batch "Выдать всё" button does not trigger undo toast
- **Function:** OrderGroupCard, Section 2 batch button onClick handler
- **Root cause:** The batch "Выдать всё" button called `handleBatchAction(completedOrders)` directly without building snapshots or calling `setUndoToast`. Individual per-order buttons had the correct undo pattern, but the batch button was missing it.
- **Fix:** Replaced onClick handler to build snapshots array from completedOrders, call handleBatchAction, then call setUndoToast with snapshots/timerId/onUndo callback (same pattern as individual order buttons ~line 1951-1965).
- **Chain:** staffordersmobile-260401-114201-9ed3
- **Status:** 🟡 Fixed (pending test)

### SOM-UX-24 (P2) -- No "ВЫДАНО" section for served orders
- **Function:** OrderGroupCard, new Section 4
- **Root cause:** Once orders reach `served` status, they are excluded from `activeOrders` filter. The table card disappears entirely when all orders are served. No way for waiter to see what was already delivered.
- **Fix:** Added `servedExpanded` state, `servedOrders` useQuery (lazy, enabled when expanded + table type), and collapsed-by-default ВЫДАНО section with slate-400 muted styling, 44px touch target header, toggle show/hide, read-only rows with guestName + time.
- **Chain:** staffordersmobile-260401-114201-9ed3
- **Status:** 🟡 Fixed (pending test)

### SOM-UX-23 (P1) -- Collapsed card Row 3: replace СЕЙЧАС/ЕЩЁ with per-stage lines
- **Function:** TableCard collapsed view, Row 3
- **Root cause:** Old Row 3 showed hardcoded «СЕЙЧАС/ЕЩЁ» labels with static stage names and total sum — noise for waiter, no urgency info
- **Fix:** Added `summaryLines` useMemo grouping activeOrders by stage via `getStatusConfig`, with per-line age from `stage_entered_at || created_date`. Color coding: red >15min / amber 5-15min / neutral <5min (requests: red ≥3min). Forward-compatible `show_in_summary` filter for #218.
- **Chain:** staffordersmobile-260331-225506-fac7
- **Status:** ✅ TESTED S212 (collapsed card shows per-stage lines with urgency color)

### BUG-S66-01 (P1) -- Detail view doesn't open on card tap (Sprint B broken)
- **Function:** TableDetailScreen render / CSS animation
- **Root cause:** CSS `translate-x-full` → `translate-x-0` transition with `requestAnimationFrame` timing was unreliable in Base44 platform container. Detail screen mounted but stayed off-screen.
- **Fix:** Removed slide-in animation entirely. Detail view now shows instantly with `z-50` (above all other content). Swipe-right to close gesture retained.
- **Commit:** `9b27dfd`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S66-02 (P1) -- No CTA button on PREPARING card
- **Function:** computeGroupCTA
- **Root cause:** `computeGroupCTA` returned `null` for all PREPARING status cards (by Sprint A design V2-06). Orders in middle stages (kitchen working) had no action button, preventing waiter from advancing them.
- **Fix:** For PREPARING status, find orders with `nextStageId`/`nextStatus` that are advanceable (not first-stage, not finish-stage). Show CTA with appropriate action label. Added `ctaBgClass` for PREPARING style.
- **Commit:** `aba6513`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S65-04 (P1) -- Waiter accepts order blind (no content visible)
- **Function:** computeGroupCTA / handleCTA
- **Root cause:** CTA on collapsed card for NEW orders directly advanced the order status (accepting it) without showing the order content (dishes, quantities). Waiter had no idea what they were accepting.
- **Fix:** First-stage CTA now opens the detail view (calls `onCardBodyTap`) instead of advancing directly. Label changed from "Принять" to "Открыть заказ". Accept button remains in the detail view (GuestOrderSection) where order content is visible.
- **Commit:** `4f2fa26`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-S65-05 (P2) -- Double "Стол" prefix ("Стол Стол 22")
- **Function:** orderGroups computation / banner text
- **Root cause:** `displayName` was constructed as `` `Стол ${tableName}` `` where `tableName` comes from `tableMap[tableId].name` which already contains "Стол" prefix (DB stores "Стол 22"). Same issue in banner notification text.
- **Fix:** Removed hardcoded "Стол " prefix from `displayName` in orderGroups computation and from single-table banner text. Table name used as-is from DB.
- **Commit:** `5200dc7`
- **RELEASE:** `260302-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-011 (P0) -- Hall orders without table_session shown in active view
- **Function:** activeOrders (useMemo filter)
- **Root cause:** Hall orders with `table_session: null` (legacy/orphan data from before session logic was implemented, or orders created when session expired) passed through the filter and appeared in the waiter's active orders list. Combined with BUG-PM-009 (sessions never expired), this caused historical orders to appear mixed with current ones.
- **Fix:** Added filter: `if (o.order_type === 'hall' && !getLinkId(o.table_session)) return false` in `activeOrders` computation. Hall orders without a valid `table_session` link are now excluded from the active view.
- **Commit:** `9dae0cc`
- **RELEASE:** `260302-04 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-002 (P1) -- handleCloseAllOrders silent error swallowing
- **Function:** handleCloseAllOrders
- **Fix:** Added error toast for non-rate-limit failures
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-003 (P1) -- AudioContext resource leak on unmount
- **Function:** createBeep / audioRef usage
- **Fix:** Added cleanup useEffect that calls `beep.ctx.close()` on unmount
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-004 (P1) -- Logout race condition with device unbinding
- **Function:** handleLogout
- **Fix:** Changed to async with await on StaffAccessLink.update; wrapped in try/catch
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-005 (P2) -- parseTime NaN propagation
- **Function:** parseTime
- **Fix:** Added `if (isNaN(h) || isNaN(m)) return null;` guard
- **Commit:** `f0f9159`
- **Status:** FIXED

### BUG-SM-006 (P1) -- filteredGroups uses unsorted orderGroups
- **Line:** ~2479-2490
- **Fix:** Changed input from `orderGroups` to `sortedGroups`; updated dependency array
- **Commit:** `1b20f90`
- **Status:** FIXED

---

### BUG-SM-014 (P0) -- Detail view shows stale orders (new orders not visible)
- **Function:** handleOpenDetail / notification effect / computeTableStatus
- **Root cause:** Detail view relied solely on polling for updates. When opened, it showed cached data without forcing a fresh fetch. Additionally, computeTableStatus checked STALE before NEW, so tables with new first-stage orders could show "ПРОСРОЧЕН" instead of "НОВЫЙ".
- **Fix:** (1) `handleOpenDetail` now calls `refetchOrders()` on open. (2) Notification effect invalidates orders query when new orders detected. (3) Reordered `computeTableStatus` — NEW check before STALE, so new orders clear ПРОСРОЧЕН. (4) Detail view closes after table close to prevent zombie view.
- **RELEASE:** `260304-00 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-007 (P0 — upgraded from P2) -- Close table without confirmation dialog
- **Function:** handleCloseTable
- **Root cause:** Used browser `confirm()` — ugly, not mobile-friendly, easy to accidentally confirm. Single tap closes table, guests lose ability to order.
- **Fix:** Replaced with React state-driven confirmation dialog: title with table name ("Закрыть Стол 5?"), descriptive text, destructive red button, 44px touch targets, mobile 320px safe. Callers now pass table name as second argument.
- **RELEASE:** `260304-00 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SM-012 (P0) -- No scheduled session cleanup (SESS-016)
- **Function:** (missing — no cleanup job existed)
- **Root cause:** Base44 has no built-in scheduler. Expired sessions (>8h) with no problem orders stayed `open` forever, causing stale data accumulation and historical orders appearing to new guests.
- **Fix:** Created `components/sessionCleanupJob.js` — `runSessionCleanup()` function that: (1) queries all open sessions, (2) checks 8h hard-expire via `isSessionExpired()`, (3) skips sessions with problem orders (non-finish or unpaid), (4) expires safe sessions. Includes `dryRun` mode for testing.
- **Integration:** Wired into StaffOrdersMobile via `useEffect + setInterval(5min)` — runs on mount then every 300s.
- **RELEASE:** `260303-02 sessionCleanupJob RELEASE.js` + `260303-06 StaffOrdersMobile RELEASE.jsx`
- **Commit:** `c30f1a9` (P1 fix) + `f2d6f41` (integration)
- **Status:** FIXED

### BUG-SM-013 (P1) -- payment_status always undefined for hall orders
- **Function:** isProblemOrder in sessionCleanupJob.js
- **Root cause:** Hall orders are created without `payment_status` field (undefined), while pickup/delivery orders set it to `"unpaid"`. The check `order.payment_status === 'unpaid'` missed undefined values, treating hall orders as "paid" — a false negative that would wrongly allow sessions to close when payment tracking is enabled.
- **Fix:** Changed check from `=== 'unpaid'` to `!== 'paid'`. Now undefined/null/unpaid all correctly flag as problem orders.
- **RELEASE:** `260303-02 sessionCleanupJob RELEASE.js`
- **Commit:** `c30f1a9`
- **Status:** FIXED

### BUG-SO-S61-07 (P2) -- "Стол Стол 1" double prefix REGRESSION
- **Function:** RequestCard / OrderCard / table picker / orderGroups
- **Root cause:** 5 locations added hardcoded `"Стол "` prefix to table names that already contain the prefix from DB. Previous fix in v2.7.2 only addressed the group header.
- **Fix:** Added `withTablePrefix()` helper that checks `name.startsWith("Стол ")` before adding prefix. Applied to all 5 locations: RequestCard (line 714), OrderCard (line 883, 892), table picker (line 1283), orderGroups (line 2404).
- **Commit:** `ece5c64`
- **RELEASE:** `260306-01 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED

### BUG-SO-S89-01 (P1) -- Raw i18n key `orderprocess.default.new` in status badge — REGRESSION
- **Function:** getStatusConfig / getStageName
- **Root cause:** OrderStage entity stores i18n keys (like `orderprocess.default.new`) in the `name` field instead of display names. `getStatusConfig` returned `stage.name` directly as label, showing raw keys.
- **Fix v1 (S89-S90):** Added `STAGE_NAME_FALLBACKS` map + `getStageName()` helper. Deployed as 260306-04 but bug persisted.
- **Fix v2 (S91):** Made `getStageName` more robust: (1) tries `t()` first for proper B44 i18n, (2) added short name mappings ("new" → "Новый"), (3) added dotted-key last-segment extraction, (4) added fallback protection to STATUS_FLOW path too.
- **Commit:** `a3727f4` (v1 S89), `03bab9e` (v1 restored S90), `8be58c6` (v2 S91)
- **RELEASE:** `260306-05 StaffOrdersMobile RELEASE.jsx`
- **Status:** FIXED (v2)

### PM-158 (P1) -- Order statuses don't update in CartView after StaffOrdersMobile status change
- **Function:** handleAction, handleAdvance, getStatusConfig
- **Root cause:** When OrderStages are configured, `handleAction` and `handleAdvance` update only `stage_id` in DB payload, never `status`. CartView polls `order.status` for bucket sorting → orders stay in "Новый заказ" bucket forever.
- **Fix:** (1) Added `nextStageInternalCode` to `getStatusConfig` stage-mode return object. (2) In `handleAction` and `handleAdvance`, added CODE_TO_STATUS mapping to derive and set `payload.status` alongside `stage_id` when internal_code is recognized.
- **Commit:** `b91919d`
- **Chain:** staffordersmobile-260329-155109-3e10
- **Status:** FIXED

### #164 (P0) -- Collapsed card shows dish text instead of actionable status summary
- **Function:** OrderGroupCard collapsed render (Row 3 + Row 4)
- **Root cause:** Row 3 showed `itemsPreview` (dish names), Row 4 showed request badges separately — waiter couldn't see at a glance what needs action.
- **Fix:** Replaced Row 3+4 with two-line summary: "СЕЙЧАС: N новых · N выдать · 🧾 Счёт" + "ЕЩЁ: N готовится · NNN ₸". Empty state fallback added.
- **Chain:** staffordersmobile-260330-120021-e9aa
- **Status:** FIXED

### PM-142 (P0) -- Shift filter fallback shows orders from previous day
- **Function:** getShiftStartTime fallback returns
- **Root cause:** `FALLBACK_HOURS = 12` meant at 8am the filter showed orders from 8pm yesterday. Both fallback returns used `now - 12h`.
- **Fix:** Changed both fallback returns to use start of current calendar day (`setHours(0,0,0,0)`). `FALLBACK_HOURS` constant kept but unused in returns.
- **Chain:** staffordersmobile-260330-120021-e9aa
- **Status:** FIXED

### #166 (P0) -- Expanded card shows flat order list instead of status sections
- **Function:** OrderGroupCard expanded content (Block A + Block F)
- **Root cause:** All `activeOrders` shown as flat list under "ЗАКАЗЫ" header. `completedOrders` (isFinishStage = ready to serve) hidden in collapsed "Завершённые" at bottom.
- **Fix:** Replaced with 3 sections: "Новые (N)" [open] + "Готово к выдаче (N)" [open] + "В работе (N)" [collapsed]. Added "Принять все" / "Выдать все" batch action buttons. Removed Block F.
- **Chain:** staffordersmobile-260330-120021-e9aa
- **Status:** FIXED

### #167 (P0) -- Service requests hidden below orders + wrong icon + extra tap
- **Function:** Block C position, request button text, bill icon
- **Root cause:** (a) Block C below Block A — easy to miss. (b) Button showed "В работе" → "Готово" (2-tap flow). (c) Bill requests used Bell icon instead of Receipt.
- **Fix:** (a) Moved Block C to top of expanded content. (b) Single "Выполнено" button, callback always sets `done`. (c) Replaced Bell with Receipt for bill type in both collapsed and expanded views. Touch target increased to 44px.
- **Chain:** staffordersmobile-260330-120021-e9aa
- **Status:** FIXED

### SOM-S203-01 (P2) -- DollarSign icon in bill summary shows "$" text
- **Function:** Bill section (Block E), line ~1893
- **Root cause:** `<DollarSign>` icon rendered as "$" glyph — looks like raw text to waiter.
- **Fix:** Replaced with `<Receipt>` icon (already imported). One-line change.
- **Commit:** `008189b`
- **Chain:** staffordersmobile-260330-172614-cb49
- **Status:** FIXED

### SOM-S203-02 (P3) -- Double "Стол" prefix in table card title
- **Function:** TableGroupCard identifier, line ~1406
- **Root cause:** `tableData.name` from B44 already contains "Стол 2", code prepends another "Стол " → "Стол Стол 2".
- **Fix:** Added `startsWith('Стол')` guard before prepending prefix.
- **Commit:** `008189b`
- **Chain:** staffordersmobile-260330-172614-cb49
- **Status:** FIXED

### SOM-S208-01 (P1) -- Inline action button missing for custom-stage orders + handleAction no-op fallback
- **Function:** OrderCard showActionButton (line ~1141), handleAction (line ~1039)
- **Root cause:** `showActionButton` was false when `nextStageId` and `nextStatus` were both null (custom B44 stages). `handleAction` also early-returned in the same case.
- **Fix:** (1) Extended `showActionButton` with `|| !!(statusConfig.actionLabel && !statusConfig.isFinishStage)`. (2) Added finish-stage fallback in `handleAction`: sets `status='served'` mirroring batch path.
- **Commit:** `008189b`
- **Chain:** staffordersmobile-260330-172614-cb49
- **Status:** FIXED

### #168 Fix 1-3 (P1) -- No inline per-order action buttons in expanded card sections
- **Function:** OrderGroupCard sections НОВЫЕ / ГОТОВО К ВЫДАЧЕ / В РАБОТЕ
- **Root cause:** Each order row only showed Badge + optional (!) indicator. Waiter had to tap row → scroll to bottom Block B → tap action. Two taps + scroll.
- **Fix:** Added inline action buttons (blue/green/amber) to each order row header, calling `handleBatchAction([order])` with `e.stopPropagation()`. Fix 2 enhanced with `config.isFinishStage` fallback for stage-mode orders where `actionLabel` is null.
- **Commit:** `064e8d3`
- **Chain:** staffordersmobile-260330-184402-3037
- **Status:** FIXED

### #168 Fix 4 (P1) -- Block B bottom action button redundant after inline buttons
- **Function:** OrderGroupCard Block B (`nextAction && (...)` section)
- **Root cause:** Block B was the original 2-tap pattern. With per-order inline buttons, it became redundant and confusing.
- **Fix:** Removed Block B JSX, `handleAdvance` function, and `transitionText` useMemo. Kept `nextAction` and `advanceMutation` (used by inline buttons and group buttons).
- **Commit:** `064e8d3`
- **Chain:** staffordersmobile-260330-184402-3037
- **Status:** FIXED

### #18 (P1) -- В РАБОТЕ section has no sub-grouping by stage
- **Function:** OrderGroupCard «В работе» section
- **Root cause:** All intermediate-stage orders rendered as one flat list, mixing orders at different stages (e.g., ПРИНЯТО and ГОТОВИТСЯ together).
- **Fix:** Added `subGroups` useMemo that groups by `stage_id`, sorts closest-to-finish first. Per-sub-group expand/collapse state. Sub-group headers with «Все → [action]» batch buttons. Flatten rule: single sub-group renders without sub-headers.
- **Commit:** `b9b6cd2`
- **Chain:** staffordersmobile-260331-044239-b1e5
- **Status:** FIXED

### #19 (P1) -- Finish-stage button label shows «→ [FinishStageName]» instead of «Выдать»
- **Function:** getStatusConfig stage-mode branch, `actionLabel` line
- **Root cause:** `actionLabel` always used `→ ${getStageName(nextStage, t)}` even when next stage is finish. Shows «→ Выдан гостю» (completed state) instead of action verb.
- **Fix:** Added `nextIsFinish` check (internal_code === 'finish' || last-index). Action label now shows «Выдать» for finish-adjacent stage.
- **Commit:** `b9b6cd2`
- **Chain:** staffordersmobile-260331-044239-b1e5
- **Status:** FIXED

### #20-Phase1 (P1) -- Dish items comma-joined + action button in card header
- **Function:** OrderGroupCard sections (НОВЫЕ, ГОТОВО К ВЫДАЧЕ, В РАБОТЕ)
- **Root cause:** Items rendered as `dish_name×qty` joined with commas on single line. Action button sat in card header adjacent to badge.
- **Fix:** Items now render as vertical list (`· dish_name ×qty` per row). Action button moved to card footer with border separator. Includes Russian pluralization for dish count. Applied in all 3 sections.
- **Commit:** `b9b6cd2`
- **Chain:** staffordersmobile-260331-044239-b1e5
- **Status:** FIXED

---

### SOM-S210-01a (P1) -- Per-card footer buttons show generic "Все N блюд" instead of verb-first labels
- **Function:** Per-card footer button label (4 sites in OrderGroupCard expanded sections)
- **Root cause:** Button labels used `Все ${n} ${dishWord}` pattern — tells the waiter how many dishes but not WHAT action. Unclear UX.
- **Fix:** Replaced with verb-first labels: `Выдать всё (N)` for finish-stage, `[ActionVerb] всё (N)` for other stages. Removed unused `dishWord` variable from all 4 sites.
- **Chain:** staffordersmobile-260331-204431-401b
- **Status:** FIXED

### SOM-S210-01b (P1) -- No undo mechanism after "Выдать" batch action on per-card button
- **Function:** OrderGroupCard finish-stage per-card button click
- **Root cause:** When waiter taps finish-stage button, orders are immediately marked as served with no way to revert accidental tap.
- **Fix:** Added `undoToast` state, `handleUndo` function, and 5-second undo toast with "Отменить" button. Snapshots captured before action, restored on undo via `advanceMutation.mutate`. Touch target on "Отменить" button set to min-h-[44px].
- **Chain:** staffordersmobile-260331-204431-401b
- **Status:** FIXED

### SOM-S231-01 (P1) -- Duplicate inner card in hall-mode expanded area
- **Function:** OrderGroupCard hall-mode expanded content (~line 2180)
- **Root cause:** Third instance of `rounded-xl border border-slate-200 bg-white/80` block duplicated the header (star/lock icon, table badge, zone, collapse button, summary chips, bill total) inside the expanded area.
- **Fix:** Removed the duplicate block entirely. Legacy instances (lines 584, 1196) preserved.
- **Chain:** staffordersmobile-260407-132533-b0c8
- **Status:** 🟡 Fixed (pending test)

### SOM-S233-02 (P1) -- Jump chips not tappable (#251, UX #26)
- **Function:** renderHallSummaryItem, OrderGroupCard
- **Root cause:** Summary chips (Новые 3, Готово 2) were `<span>` elements — no click handler, no scroll behavior.
- **Fix:** Changed to `<button>` with `e.stopPropagation()` + `scrollToSection(kind)`. Added 4 section refs + `scrollToSection` useCallback.
- **Chain:** staffordersmobile-260407-132533-b0c8
- **Status:** 🟡 Fixed (pending test)

### SOM-S233-03 (P1) -- Undo toast appears under last row, not clicked row (#254, UX #23)
- **Function:** renderHallRows, handleSingleAction, handleOrdersAction, startUndoWindow
- **Root cause:** Toast placement used `isLastOfOrder` — always under last row of order regardless of which row was clicked.
- **Fix:** Threaded `rowId` through full call chain. Toast now appears under the clicked row. Bulk actions (no rowId) fall back to `isLastOfOrder`.
- **Chain:** staffordersmobile-260407-132533-b0c8
- **Status:** 🟡 Fixed (pending test)

### SOM-S233-04 (P2) -- Close table blocker reasons not tappable (#256, UX #29)
- **Function:** closeDisabledReasons.map in hall-mode
- **Root cause:** Blocker reasons were `<p>` elements — user had to manually scroll to find the blocking section.
- **Fix:** Added `reasonToKind` mapping. Known reasons render as `<button>` with `scrollToSection(kind)` + ` ›` suffix. Unknown reasons stay as `<p>`.
- **Chain:** staffordersmobile-260407-132533-b0c8
- **Status:** 🟡 Fixed (pending test)

### SOM-S233-05 (P2) -- No age urgency indicator on dish rows (#255, UX #13)
- **Function:** renderHallRows
- **Root cause:** Dish rows had no visual urgency cue — waiter couldn't see which orders were waiting longest.
- **Fix:** Added `urgencyClass` calculation: amber `border-l-4` at overdueMinutes threshold, red at threshold+5. Applied to all rows including served.
- **Chain:** staffordersmobile-260407-132533-b0c8
- **Status:** 🟡 Fixed (pending test)

### SOM-S254-01 (P1) -- Collapsed table card: identity block + status chips (#288)
- **Function:** OrderGroupCard collapsed card header (~line 2248)
- **Root cause:** Old collapsed card used flat row with ownership icon + small table badge + jump chips inline. Didn't match v13 UX spec (identity block + status chips + urgency colors).
- **Fix:** (1) Added `getUrgencyLevel`, `URGENCY_IDENTITY_STYLE`, `SCS_CHIP_STYLES`, `SCS_SOLID_CHIP` helpers near line 383. (2) Added `scsChips`, `scsOldestActionable`, `scsUrgency`, `scsHighlightKey` computed values inside OrderGroupCard. (3) Replaced collapsed header with: 84px identity wrapper (ownership badge outside, 78×54px identity block with pastel urgency bg, 26px dark table number) + flex-wrap chips zone (Готово/Запросы/Новые with age + longest-chip solid highlight). (4) Moved jump chips from collapsed header to expanded content (top of sections). (5) Ownership badge as overlay circle (★ mine, 🔒 other as button with stopPropagation, ☆ free). (6) 3 urgency levels: calm/warning/danger (no "normal"). (7) Free table green outline affordance.
- **Chain:** staffordersmobile-260412-123531-7231
- **Status:** 🟡 Fixed (pending test)

## Active Bugs

### BUG-SM-001 (P1 -- deferred) -- Complete absence of i18n
- **Scope:** Entire file (~3040 lines)
- **Impact:** 100+ hardcoded Russian strings: buttons, toasts, status text, help text, errors
- **Recommendation:** Dedicated i18n pass; estimated 100-120 translation keys needed
- **Status:** Deferred — too large for this review cycle

### BUG-SM-008 (P2) -- No error toast in handleAction
- **Function:** handleAction
- **Impact:** Order status update failure gives no user feedback
- **Recommendation:** Add error toast in catch block

### BUG-SM-009 (P2) -- Magic numbers throughout polling/timing logic
- **Impact:** Numbers like 5000, 60000, 300000 scattered without named constants
- **Recommendation:** Extract to named constants

### BUG-SM-010 (P3) -- Version header block is 87 lines long
- **Lines:** 1-87
- **Impact:** Changelog in code header; better suited for CHANGELOG.md
- **Recommendation:** Move to separate file

---

## Sprint D Notes (v3.2.0, 2026-03-02)

**Changes implemented:**
- V2-09: BannerNotification — in-app banner overlay for new order events
- Fixed position at top of viewport, z-60 (above header z-20, detail z-30, modals z-40)
- Content: "Стол N: Новый заказ" with table name + event type
- Auto-hide after 5 seconds, swipe-up to dismiss early
- Tap banner → scroll to relevant table card with brief highlight (indigo ring, 1.5s)
- De-duplication: multiple events in same poll cycle → "3 новых заказа"
- Works on all screens (Mine, Free, Others, Detail view — closes detail on navigate)
- Non-blocking: pointer-events only on banner itself

**Review findings fixed:**
- P0: Nested setTimeout cleanup in BannerNotification — tracked via separate refs
- P1: CSS.escape() for querySelector to prevent selector injection
- P1: Proper timer cleanup in all dismiss/tap paths

**Known limitations:**
- i18n still fully deferred (BUG-SM-001)

---

## Sprint C Notes (v3.2.0, 2026-03-02)

**Changes implemented:**
- V2-04: Mine tab static urgency sort with position stability during transitions
- V2-07: Preparing→Ready transition animation:
  - Left border animates gray→amber (300ms ease via CSS transition-colors)
  - CTA button fades in with max-h/opacity wrapper transition (300ms)
  - Card position locked during transition (stays at PREPARING sort position for 600ms)
  - Brief amber ring flash (200ms) for peripheral attention
- CSS transition-colors on all card elements (borders, badges, text) for smooth status changes
- Timer cleanup on unmount for position lock timeouts

**Known limitations:**
- Side effects inside useMemo (setTimeout for position locks) — pragmatic trade-off for synchronous detection
- i18n still fully deferred (BUG-SM-001)

---

## Sprint B Notes (v3.1.0, 2026-03-02)

**Changes implemented:**
- V2-02: TableDetailScreen — full-screen detail view, slide-in from right (300ms ease-out)
- V2-03: Split-tap — CTA executes action inline; card body opens TableDetailScreen
- DetailOrderRow — auto-fetches items in detail view (no lazy loading guard)
- GuestOrderSection — per-guest sections with 48px full-width action buttons
- Scroll position preserved via `listScrollRef` + `requestAnimationFrame`
- Swipe-right back gesture on TableDetailScreen (dx>80, dy<60)
- liveDetailGroup: detail view auto-updates via polling using `detailGroupId`

**Known limitations:**
- i18n still fully deferred (BUG-SM-001)
- Preparing-to-Re