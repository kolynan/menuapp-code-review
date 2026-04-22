---
chain: staffordersmobile-260330-120021-e9aa
chain_step: 4
chain_total: 4
chain_step_name: merge
page: StaffOrdersMobile
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Merge (4/4) ===
Chain: staffordersmobile-260330-120021-e9aa
Page: StaffOrdersMobile

You are the Merge step in a modular consensus pipeline.
Your job: apply the fix plan to the actual code.

INSTRUCTIONS:
1. Read the comparison: pipeline/chain-state/staffordersmobile-260330-120021-e9aa-comparison.md
2. Check if discussion report exists: pipeline/chain-state/staffordersmobile-260330-120021-e9aa-discussion.md
   - If it exists AND has an "Updated Fix Plan" section → use THAT for disputed items
   - If it says "No disputes" or doesn't exist → use Comparator's "Final Fix Plan" as-is
   - Items marked "Unresolved (for Arman)" → SKIP these, do NOT apply
3. Read the code file: pages/StaffOrdersMobile/*.jsx
4. Apply ALL fixes from the fix plan, in priority order (P0 first)
   - Agreed items from Comparator: always apply
   - Discussion-resolved items: apply the winning solution
   - Unresolved disputes: SKIP (note in merge report)
   - [MUST-FIX] items: CANNOT be skipped. If you cannot apply a MUST-FIX, explain WHY in detail in merge report — do NOT silently skip.
5. After applying fixes:
   a. Update BUGS.md in pages/StaffOrdersMobile/ with fixed items
   b. Update README.md in pages/StaffOrdersMobile/ if needed
6. Git commit and push:
   - git add <specific files only> (NEVER git add . or git add -A)
   - git commit -m "fix(StaffOrdersMobile): N bugs fixed via consensus chain staffordersmobile-260330-120021-e9aa"
   - git push
7. Write merge report to: pipeline/chain-state/staffordersmobile-260330-120021-e9aa-merge-report.md

FORMAT for merge report:
# Merge Report — StaffOrdersMobile
Chain: staffordersmobile-260330-120021-e9aa

## Applied Fixes
1. [P0] Fix title — Source: agreed/discussion-resolved — DONE
2. [P1] Fix title — Source: comparator — DONE
...

## Skipped — Unresolved Disputes (for Arman)
- Dispute: [title] — CC says X, Codex says Y — NEEDS DECISION

## Skipped — Could Not Apply
- Reason...

## Git
- Commit: <hash>
- Files changed: N

## Prompt Feedback
Collect Prompt Clarity sections from CC and Codex findings files (if present), then add your own observations:
- CC clarity score: [N/5]
- Codex clarity score: [N/5]
- Fixes where writers diverged due to unclear description: ...
- Fixes where description was perfect (both writers agreed immediately): ...
- Recommendation for improving task descriptions: ...

## Summary
- Applied: N fixes
- Skipped (unresolved): N disputes
- Skipped (other): N fixes
- MUST-FIX not applied: N (with reasons)
- Commit: <hash>

=== TASK CONTEXT ===
# SOM Batch P0: Implement UX Redesign — Card Summary + Shift Filter + Status Sections + Service Requests

Reference: `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md` v1.0, `BUGS_MASTER.md`, `DECISIONS_INDEX.md §8`.

TARGET file (modify): `pages/StaffOrdersMobile/staffordersmobile.jsx` (4022 lines)
CONTEXT files (read only): `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md`

---

## FROZEN UX (DO NOT CHANGE)

The following items have been tested and confirmed working. Do NOT modify under any circumstances:

- **Status translation**: `getStatusConfig().label` uses `getStageName()` + `t()` for i18n — SO-S76-01, SO-S89-01 ✅ Tested
- **Action button text**: translated via `getStatusConfig().actionLabel` — do NOT hardcode button labels — SO-S76-02 ✅
- **Client name in Pickup/Delivery orders**: `o.client_name` in `contactInfo` — SO-S76-03 ✅
- **No double "Стол" prefix**: `identifier = \`Стол ${tableData.name}\`` already includes prefix — do NOT add "Стол" anywhere else — SO-S61-07 ✅
- **handleAction — derivedNextStatus**: position-based logic (first→accepted, last→served, mid→in_progress). Do NOT rewrite. — PM-158 ✅ Tested S197
- **BannerNotification**: auto-hide + scroll-to-table on tap (lines ~3369+) — do NOT touch
- **Expand/collapse animation**: `duration-200 ease-out` class on expanded content div (~line 1654) — do NOT change
- **Polling**: `refetchInterval: effectivePollingInterval` — do NOT change
- **Session cleanup**: `runSessionCleanup()` useEffect — do NOT remove
- **Request section header**: header text for service requests section has no duplicates — Batch 6 S198 ✅

---

## Fix 1 — #164 (P0) [MUST-FIX]: Replace dish-text in collapsed card with actionable status summary

### Current behavior
Collapsed card Row 3 (~line 1630) shows a dish text list: "Стейк×2, New York Steak×1, +5" (built from `itemsPreview` useMemo at ~line 1355). This tells the waiter WHAT is in the table, but NOT where action is needed.

Row 4 (~line 1639) shows request badges separately as violet chips.

### Expected behavior
Replace Row 3 + Row 4 with a **two-line status summary**:

**Line 1 — urgent (СЕЙЧАС):** counts requiring immediate action + request badges merged inline
- Format: `СЕЙЧАС: 2 новых · 1 выдать · 🧾 Счёт`
- "новых" count = `activeOrders.filter(o => getStatusConfig(o).isFirstStage).length`
- "выдать" count = `completedOrders.length` (these are isFinishStage = "ready to serve" orders)
- Request badges inline: bill → "🧾 Счёт", call_waiter → "📞 Официант", other → "❗ Запрос"
- Show this line ONLY if any of the counts > 0

**Line 2 — non-urgent (ЕЩЁ):** background work + total
- Format: `ЕЩЁ: 3 готовится · 150 ₸`
- "готовится" count = `activeOrders.filter(o => !getStatusConfig(o).isFirstStage).length`
- Total ₸: use `billData.total` if > 0, else omit
- Show this line ONLY if count > 0

**Important variable context** (all already computed in OrderGroupCard):
- `activeOrders` = !isFinishStage orders (~line 1317)
- `completedOrders` = isFinishStage orders (~line 1322) — NOTE: "completed" here means "ready to serve", NOT served
- `requestBadges` = array of {type, count} (~line 1409)
- `billData` = {total, guests} (~line 1501)

Ref: `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md` §ASCII макеты, decisions #1, #15.

### Must NOT
- Do NOT show dish text list in collapsed card (remove `itemsPreview` from row 3 render)
- Do NOT keep Row 4 request badges as separate chips — they are now merged into Line 1 inline
- Do NOT remove `itemsPreview` useMemo itself (may be used in test/debug) — only remove its render
- Do NOT change `requestBadges` useMemo logic — only change how they render

### File and location
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `search for "Row 3: items preview"` → ~line 1630 (collapsed card render, REPLACE this section)
- `search for "Row 4: request badges"` → ~line 1639 (collapsed card badges, REPLACE/MERGE)
- `search for "const itemsPreview = useMemo"` → ~line 1355 (keep useMemo, remove render)
- `search for "const completedOrders = useMemo"` → ~line 1322 (used for "выдать" count)

### Verification
Open staff page → each table card shows "СЕЙЧАС: N новых · N выдать" and "ЕЩЁ: N готовится · NNN ₸" instead of dish text.

---

## Fix 2 — PM-142 (P0) [MUST-FIX]: Fix shift filter fallback — use start of today, not 12 hours ago

### Current behavior
`FALLBACK_HOURS = 12` at ~line 469. When `partner.working_hours` is not configured (or invalid), `getShiftStartTime()` returns `now - 12 hours`. At 8:00am this means "from 8:00pm yesterday" → orders from previous day appear in the active list.

### Expected behavior
Change BOTH fallback returns in `getShiftStartTime()` to use **start of current calendar day** (midnight local):

```javascript
// OLD (both occurrences):
return new Date(now.getTime() - FALLBACK_HOURS * 60 * 60 * 1000);

// NEW:
const startOfToday = new Date(now);
startOfToday.setHours(0, 0, 0, 0);
return startOfToday;
```

Two occurrences:
1. Early return when `workingHours` is null/invalid (~line 474)
2. Final fallback return at end of function (~line 537)

### Must NOT
- Do NOT remove `FALLBACK_HOURS` constant — just don't use it in the returns
- Do NOT change the overnight shift logic (when working_hours IS configured) — only change the fallback returns
- Do NOT modify the shift filter application in `activeOrders` or `activeRequests` useMemo

### File and location
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `search for "const FALLBACK_HOURS"` → ~line 469
- `search for "FALLBACK_HOURS \* 60"` → ~lines 474 and 537 (both must be changed)

### Previously tried
None. PM-142 was previously fixed in CartView.jsx but NOT in StaffOrdersMobile.jsx.

### Verification
Open staff page at 8:00am → active table list shows NO tables/orders from previous days.

---

## Fix 3 — #166 (P0) [MUST-FIX]: Expanded card — restructure orders into status sections (not flat list)

### Current behavior
Inside expanded card, Block A (~line 1657) shows ALL `activeOrders` as a flat list under one "ЗАКАЗЫ" header. Block F (~line 1808) shows `completedOrders` (= isFinishStage = "ready to serve" orders) under "Завершённые заказы" header, collapsed by default.

This causes the waiter to manually scan all orders to find what needs action.

### Expected behavior
Replace flat Block A + Block F with **3 status-based sections** in this order (after Block C which Fix 4 moves to top):

**Section 1 — Новые** (OPEN by default):
- Orders: `activeOrders.filter(o => getStatusConfig(o).isFirstStage)`
- Header: `Новые (N) [Принять все]`
- "Принять все" button: iterate each order in this section, call the same action mechanism used by the single-order action button (CTA button / Block B equivalent) for each
- If empty: hide entire section

**Section 2 — Готово к выдаче** (OPEN by default):
- Orders: `completedOrders` (these ARE the isFinishStage orders — currently misnamed as "completedOrders")
- Header: `Готово к выдаче (N) [Выдать все]`
- "Выдать все" button: iterate each order, call action mechanism for each
- Move from Block F's current position to HERE (between Новые and В работе)
- Default state: OPEN (no collapse required)
- If empty: hide entire section

**Section 3 — В работе** (COLLAPSED by default):
- Orders: `activeOrders.filter(o => !getStatusConfig(o).isFirstStage)`
- Header: `В работе (N) ▼` (tap to expand/collapse)
- Default state: COLLAPSED
- If empty: hide entire section

Add state: `const [inProgressExpanded, setInProgressExpanded] = useState(false)` near existing `const [completedExpanded, setCompletedExpanded]` (~line 1438 area).

Ref: `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md` §decisions #10, #11, §ASCII "Экран стола с группировкой".

### Must NOT
- Do NOT change order card layout inside sections (same guest name, time badge, action button)
- Do NOT change `activeOrders` or `completedOrders` useMemo definitions
- Do NOT change `getStatusConfig()` or `computeTableStatus()` functions
- Do NOT change Block B (single-order CTA button), Block E (bill summary), Block D (close table)
- "Принять все" / "Выдать все" buttons: NO confirmation dialog (per UX spec decision #9)
- Do NOT remove Block E and Block D — keep them after sections

### File and location
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `search for "Block A — Active Orders"` → ~line 1657 (REPLACE with 3 sections)
- `search for "Block F — Completed Orders"` → ~line 1808 (MOVE to Section 2 position, repurpose as "Готово к выдаче")
- `search for "const completedOrders = useMemo"` → ~line 1322 (use for Section 2)
- `search for "completedExpanded"` → ~line 1438 area (add new `inProgressExpanded` state nearby)

### Verification
Open expanded table card with mixed orders → see separate sections "Новые (N)", "Готово к выдаче (N)", "В работе (N)" with correct order counts in each.

---

## Fix 4 — #167 (P0) [MUST-FIX]: Service requests — move section to top + fix button + fix bill icon

### Current behavior
(a) Block C ("Guest Requests") is positioned BELOW Block A in expanded card (~line 1739), making it easy to miss urgent requests.

(b) Request action button (~line 1758) shows `"В работе"` when `req.status === 'new'` and `"Готово"` otherwise. This creates an unnecessary intermediate state.

(c) Request badge on collapsed card (~line 1644): shows `Bell` icon for `badge.type === 'bill'` — wrong icon. Bill request should use a receipt-style icon.

### Expected behavior

**(a) Move Block C to TOP of expanded content** — first thing visible after expanding, before all order sections (before Fix 3 sections).

New order in expanded content:
1. Block C (Requests) ← **MOVED HERE**
2. Section "Новые" (Fix 3)
3. Section "Готово к выдаче" (Fix 3)
4. Section "В работе" (Fix 3)
5. Block E (Bill summary) ← unchanged
6. Block B (single CTA) ← unchanged
7. Block D (Close table) ← unchanged

**(b) Fix button text**: Replace the conditional `req.status === 'new' ? 'В работе' : 'Готово'` with a single **"Выполнено"** button that marks the request as done (calls existing `onCloseRequest(req.id, req.status)`). No intermediate "in_progress" state needed per UX spec decision #6.

**(c) Fix bill icon on collapsed card**: Replace `Bell` with `Receipt` icon for `badge.type === 'bill'` in `requestBadges` render (~line 1644).
- Import `Receipt` from `lucide-react`. If `Receipt` is not available in installed version, use `FileText` as fallback.
- Also update Block C expanded view (~line 1749): use same `Receipt`/`FileText` icon for `req.request_type === 'bill'` instead of `Bell`.

Ref: `ux-concepts/StaffOrdersMobile/staff-orders-mobile.md` §decisions #6, #7, §ASCII "Сервисные запросы".

### Must NOT
- Do NOT change the `activeRequests` shift filter (keep existing `new`/`in_progress` filter)
- Do NOT change `onCloseRequest` function signature
- Do NOT remove Block C — MOVE it (cut from current ~line 1739 position, paste to top of expanded content)
- Keep the violet color scheme for request cards (bg-violet-50, border-violet-200)

### File and location
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- `search for "Block C — Guest Requests"` → ~line 1739 (CUT and MOVE to top of expanded content)
- `search for "Block A — Active Orders"` → ~line 1657 (Block C goes BEFORE this, after expanding div opens)
- `search for "badge.type === 'bill' \? <Bell"` → ~line 1644 (collapsed card icon fix)
- `search for "import.*from.*lucide-react"` → ~line 159 (add Receipt import here)
- Button fix: `search for "В работе"` in context of service requests → ~line 1758

### Previously tried
None. Block C and request icons not previously modified.

### Verification
1. Table with service request: expand card → requests section appears FIRST (above "Новые" orders).
2. Tap "Выполнено" → request dismissed (no "В работе" intermediate step).
3. Collapsed card with Bill request → shows Receipt/FileText icon, not Bell.

---

## ⛔ SCOPE LOCK — Change ONLY what is described in Fix 1–4 above

- Modify ONLY `pages/StaffOrdersMobile/staffordersmobile.jsx`
- Do NOT modify any other files (CartView.jsx, MenuView.jsx, x.jsx, etc.)
- Do NOT change: `computeTableStatus()`, `getStatusConfig()`, `handleAction()`, polling logic, authentication flow, BannerNotification, `runSessionCleanup()`
- Do NOT add new API entities or new backend calls
- If you find a bug outside Fix 1-4 scope: document it in findings, do NOT fix it

---

## Implementation Notes
- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4022 lines)
- Git: `git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "SOM P0: card summary, shift filter, status sections, service requests"`
- Key architecture: `activeOrders` = !isFinishStage (new/accepted/in_progress); `completedOrders` = isFinishStage (ready to serve, NOT truly served — served orders are excluded at outer query level)
- All 4 fixes are in same single-component file — no cross-file dependencies

## FROZEN UX grep verification (run before commit)
```bash
grep -n "derivedNextStatus" pages/StaffOrdersMobile/staffordersmobile.jsx | head -5
grep -n "FALLBACK_HOURS" pages/StaffOrdersMobile/staffordersmobile.jsx
grep -n "duration-200 ease-out" pages/StaffOrdersMobile/staffordersmobile.jsx
```
Expected: derivedNextStatus logic unchanged, FALLBACK_HOURS constant present (but fallback returns changed), animation class present.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Status summary (СЕЙЧАС / ЕЩЁ) fits in 2 lines without overflow on 375px
- [ ] Section headers (Новые, Готово к выдаче, В работе) are tappable: min 44×44px touch target
- [ ] "Принять все" / "Выдать все" buttons: min 44px height
- [ ] "Выполнено" button on service request: min 44px height, easily tappable
- [ ] Collapsed card summary does not overflow card width
- [ ] No duplicate indicators between collapsed summary and expanded sections

## Regression Check (MANDATORY after implementation)
Existing features that must continue to work after changes:
- [ ] New order banner notification (BannerNotification) appears and auto-dismisses
- [ ] Tap card to expand/collapse — animation works
- [ ] Single-order action button (Block B CTA: "Принять" / "Выдать") still works
- [ ] Bill summary (Block E) shows and expands per-guest breakdown
- [ ] Close table button (Block D) appears and opens confirmation dialog
- [ ] Tab switch "Активные" / "Завершённые" at page level still filters correctly
- [ ] Shift filter (shiftStartTime) still applied — orders from yesterday do NOT appear
=== END ===
