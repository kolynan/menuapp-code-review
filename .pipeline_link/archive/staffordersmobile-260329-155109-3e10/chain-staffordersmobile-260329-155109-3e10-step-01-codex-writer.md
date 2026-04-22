---
chain: staffordersmobile-260329-155109-3e10
chain_step: 1
chain_total: 4
chain_step_name: codex-writer
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 12.00
runner: codex
type: chain-step
---
Review the file(s) specified in TASK CONTEXT below for a React restaurant QR-menu app on Base44 platform.
Also check README.md and BUGS.md in the same page folder for context (read-only, do NOT modify).

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the TARGET files + README/BUGS for context. Do NOT search the repo, do NOT read old findings, do NOT read files outside the page folder.
- Do NOT run rg/grep across the whole repo. Do NOT cross-reference with other pages.
- Limit analysis to the target page code. Be concise.

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns.

For each finding: [P0/P1/P2/P3] Title - Description. FIX: code change needed.

Write findings to: pipeline/chain-state/staffordersmobile-260329-155109-3e10-codex-findings.md

FORMAT:
# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260329-155109-3e10

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

## Prompt Clarity (MANDATORY — do NOT skip this section)
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Findings without Prompt Clarity are incomplete.

Do NOT apply fixes — only document findings.

=== TASK CONTEXT ===
# Fix PM-158: Order statuses don't update in CartView after StaffOrdersMobile change

Reference: `BUGS_MASTER.md #PM-158`, `pages/PublicMenu/CartView.jsx`, `pages/PublicMenu/useTableSession.jsx`.
Production page.

**Context:** MenuApp table ordering system. When staff changes order status in StaffOrdersMobile, the guest's CartView does NOT reflect the update. Root cause found in S193 (code analysis):

- `useTableSession.jsx` polls every 10s and fetches orders via `getSessionOrders(sessionId)` → returns correct data including `order.status` and `order.stage_id`
- CartView's `statusBuckets` uses `order.status` to sort orders into buckets (new_order / accepted / in_progress / ready / served)
- StaffOrdersMobile's `handleAction` (line ~1030) AND `handleAdvance` (line ~1482) update **only `order.stage_id`** (never `order.status`) when OrderStages are configured
- Result: after staff changes status → `order.status` stays as `"new"` → CartView shows the order in wrong bucket forever

**Fix requires TWO changes:**

1. **Enrich `getStatusConfig` return object** — add `nextStageInternalCode` field (line ~2913)
2. **Update payload in `handleAction` AND `handleAdvance`** — use `nextStageInternalCode` to derive and set `status`

TARGET FILES (modify):
- `pages/StaffOrdersMobile/staffordersmobile.jsx`

CONTEXT FILES (read-only, for understanding):
- `pages/PublicMenu/useTableSession.jsx` (lines 577-591: polling merge logic, line 778-782: myOrders derivation)
- `pages/PublicMenu/CartView.jsx` (search "statusBuckets": bucket logic using `o.status`)

---

## Fix 1 — PM-158 (P1) [MUST-FIX]: Sync `status` field when updating `stage_id` in StaffOrdersMobile

### Current behavior
When staff taps the action button, two functions build a DB payload:

1. `handleAction` (~line 1030, in `OrderCard` component):
```javascript
const payload = {};
if (statusConfig.nextStageId) {
  payload.stage_id = statusConfig.nextStageId;  // updates stage_id ONLY
}
else if (statusConfig.nextStatus) {
  payload.status = statusConfig.nextStatus;  // OR status ONLY — never both
}
```

2. `handleAdvance` (~line 1482, in `TableGroup` component):
```javascript
const payload = {};
if (config.nextStageId) payload.stage_id = config.nextStageId;   // same issue
else if (config.nextStatus) payload.status = config.nextStatus;
```

When OrderStages are in use (`nextStageId` is set), `status` field is NOT written to DB. Guest's CartView polls correctly but sees `order.status = "new"` for all orders → all orders stay in the "Новый заказ" bucket regardless of actual stage.

### Expected behavior

**Part A — Enrich `getStatusConfig` return value (~line 2913)**

In the `getStatusConfig = useCallback((order) => {...}, ...)` function, in the branch that returns stage-mode config (when `stageId && stagesMap[stageId]`), add `nextStageInternalCode` to the returned object:

```javascript
// Current return (line ~2934):
return {
  label: getStageName(stage, t),
  color: stage.color,
  actionLabel: nextStage ? `→ ${getStageName(nextStage, t)}` : null,
  nextStageId: nextStage?.id || null,
  nextStatus: null,
  badgeClass: '',
  isStageMode: true,
  isFirstStage,
  isFinishStage,
};

// After fix — add one field:
return {
  label: getStageName(stage, t),
  color: stage.color,
  actionLabel: nextStage ? `→ ${getStageName(nextStage, t)}` : null,
  nextStageId: nextStage?.id || null,
  nextStageInternalCode: nextStage?.internal_code || null,  // NEW
  nextStatus: null,
  badgeClass: '',
  isStageMode: true,
  isFirstStage,
  isFinishStage,
};
```

The fallback return (line ~2948, STATUS_FLOW path) does NOT need `nextStageInternalCode` — it sets `nextStatus` directly and `nextStageId` is null there.

**Part B — Update `handleAction` payload (~line 1030)**

After `payload.stage_id = statusConfig.nextStageId;`, derive and add `status`:

```javascript
if (statusConfig.nextStageId) {
  payload.stage_id = statusConfig.nextStageId;
  // Derive status from next stage internal_code
  const CODE_TO_STATUS = {
    start: 'accepted',
    cook: 'in_progress',
    cooking: 'in_progress',
    finish: 'served',
    done: 'served',
    cancel: 'cancelled',
  };
  const derivedStatus = CODE_TO_STATUS[statusConfig.nextStageInternalCode];
  if (derivedStatus !== undefined) payload.status = derivedStatus;
}
```

**Part C — Update `handleAdvance` payload (~line 1482)**

Same mapping, using `config.nextStageInternalCode`:

```javascript
if (config.nextStageId) {
  payload.stage_id = config.nextStageId;
  const CODE_TO_STATUS = {
    start: 'accepted',
    cook: 'in_progress',
    cooking: 'in_progress',
    finish: 'served',
    done: 'served',
    cancel: 'cancelled',
  };
  const derivedStatus = CODE_TO_STATUS[config.nextStageInternalCode];
  if (derivedStatus !== undefined) payload.status = derivedStatus;
}
```

### Must NOT be
- Do NOT change visibility, layout, or any UI elements of StaffOrdersMobile.
- Do NOT change polling or data fetching logic.
- Do NOT change the fallback STATUS_FLOW branch (when `nextStageId` is null and only `nextStatus` is used — leave that branch unchanged).
- Do NOT change CartView or useTableSession — the fix is ONLY in StaffOrdersMobile.
- Do NOT set `status` if `internal_code` is not in the known list — skip if unknown (safe fallback, no `else` clause needed).
- Do NOT extract CODE_TO_STATUS as a top-level const if it's only used in these two places — inline is fine.

### File and location
File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4014 lines)

- **Part A:** `getStatusConfig = useCallback` at ~line 2913. Search: `grep -n "nextStageId: nextStage" pages/StaffOrdersMobile/staffordersmobile.jsx` → find the return object → add `nextStageInternalCode: nextStage?.internal_code || null`
- **Part B:** `handleAction` function at ~line 1030. Search: `grep -n "payload.stage_id = statusConfig.nextStageId" pages/StaffOrdersMobile/staffordersmobile.jsx` → add status derivation after that line
- **Part C:** `handleAdvance` function at ~line 1482. Search: `grep -n "if (config.nextStageId) payload.stage_id" pages/StaffOrdersMobile/staffordersmobile.jsx` → add status derivation after that line

### Already tried
No previous fix attempts. First fix for this bug.

### Verification
1. As a guest: open menu, add items, submit an order.
2. As staff: open StaffOrdersMobile, find the order, tap the action button to change status (e.g., "Принять").
3. Wait ≤ 15 seconds (polling interval).
4. As guest: open CartView drawer — the order must appear in the correct bucket ("Принят" section), NOT in "Новый заказ".
5. Tap again in StaffOrdersMobile to advance to "Готов". Wait 15s. Guest CartView shows order in "Готов" bucket.

---

## ⛔ SCOPE LOCK — change ONLY what is described in Fix 1 above

- Modify ONLY:
  - `getStatusConfig` return object in `staffordersmobile.jsx` (add `nextStageInternalCode`)
  - `handleAction` payload construction in `staffordersmobile.jsx` (add status derivation)
  - `handleAdvance` payload construction in `staffordersmobile.jsx` (add status derivation)
- Do NOT change CartView, useTableSession, or any other file.
- Do NOT change StaffOrdersMobile UI, layout, polling, rendering, or any logic except the three locations above.
- Do NOT rename or restructure `handleAction`, `handleAdvance`, or `getStatusConfig`.

## FROZEN UX — DO NOT CHANGE (tested and confirmed working)
These elements are confirmed working in production. Do NOT modify:
- i18n badge translation (SO-S76-01, RELEASE 260305-00): order status badge shows translated text (e.g., «НОВЫЙ»), NOT raw key `orderprocess.default.new`
- i18n action button (SO-S76-02, RELEASE 260305-00): action button label is translated
- Guest name display (SO-S76-03, RELEASE 260305-00): guest name shows correctly, NOT «гость не определён»
- "Стол 1" prefix (SO-S61-07, RELEASE 260306-01): table name shows once, NOT "Стол Стол 1"
- i18n badge regression (SO-S89-01, RELEASE 260306-05): new orders get translated status badge, confirmed ✅ Android

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Primary usage: waiter's phone at the restaurant.
Before committing, verify ALL changes at 375px viewport width:
- [ ] No UI changes visible (this is a data-only fix)
- [ ] Action button still works correctly (tapping changes order status)
- [ ] No regression in status display in StaffOrdersMobile cards

## Regression Check (MANDATORY after implementation)
- [ ] StaffOrdersMobile action buttons still function (tap → order status updates visually in staff view)
- [ ] Cancelled orders still show as cancelled in StaffOrdersMobile
- [ ] Fallback path (no stages, status-only update via STATUS_FLOW) still works: `nextStageId` is null, `nextStatus` is set, payload only gets `status`
- [ ] `handleAdvance` (batch advance in TableGroup) still works correctly

## Implementation Notes
- TARGET FILES: `pages/StaffOrdersMobile/staffordersmobile.jsx`
- CONTEXT FILES (read-only): `pages/PublicMenu/useTableSession.jsx`, `pages/PublicMenu/CartView.jsx`
- FROZEN UX grep verification before commit:
  ```
  grep -n "payload.stage_id\|payload.status\|nextStageInternalCode" pages/StaffOrdersMobile/staffordersmobile.jsx
  ```
- git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "fix(PM-158): sync order.status when updating stage_id in StaffOrdersMobile" && git push
=== END ===
