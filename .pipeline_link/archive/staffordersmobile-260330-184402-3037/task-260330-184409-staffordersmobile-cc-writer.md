---
task_id: task-260330-184409-staffordersmobile-cc-writer
status: running
started: 2026-03-30T18:44:12+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 18.00
fallback_model: sonnet
version: 5.14
launcher: python-popen
---

# Task: task-260330-184409-staffordersmobile-cc-writer

## Config
- Budget: $18.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260330-184402-3037
chain_step: 1
chain_total: 4
chain_step_name: cc-writer
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 18.00
runner: cc
type: chain-step
---
=== CHAIN STEP: CC Writer (1/4) ===
Chain: staffordersmobile-260330-184402-3037
Page: StaffOrdersMobile

You are the CC Writer in a modular consensus pipeline.
Your job: independently analyze the code and produce findings.

INSTRUCTIONS:
1. Read the file(s) specified in TASK CONTEXT below for StaffOrdersMobile
2. Also read README.md and BUGS.md in the same folder for context (read-only, do NOT modify)
3. Do your OWN independent analysis
4. Focus on: logic errors, missing error handling, i18n issues, UI/UX for mobile-first, React anti-patterns
5. For each finding: [P0/P1/P2/P3] Title - Description. FIX: description of code change needed.
6. Write your findings to: pipeline/chain-state/staffordersmobile-260330-184402-3037-cc-findings.md
7. Do NOT apply any fixes yet — only document findings

⛔ SCOPE RESTRICTION (MANDATORY):
If the TASK CONTEXT below contains a numbered Fix list (Fix 1, Fix 2, etc.):
- Do NOT report ANY issues outside the numbered Fix list.
- If you see other bugs — IGNORE them completely.
- Your output must contain ONLY findings for Fix 1, Fix 2, etc.
- Extra findings outside the Fix list = task FAILURE.
- BAD example: Task says "Fix 1: button position" → you report touch targets, aria-labels, i18n issues. This is WRONG.
- GOOD example: Task says "Fix 1: button position" → you report ONLY your analysis of Fix 1 (button position). Nothing else.

If there is NO numbered Fix list → find ALL bugs.

FORMAT for findings file:
# CC Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-184402-3037

## Findings
1. [P0/P1/P2/P3] Title — Description. FIX: ...
2. ...

## Summary
Total: N findings (X P0, Y P1, Z P2, W P3)

⛔ Prompt Clarity (MANDATORY — findings without this section are INCOMPLETE and will be REJECTED):
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous Fix descriptions (list Fix # and what was unclear): ...
- Missing context (what info would have helped): ...
- Scope questions (anything you weren't sure if it's in scope): ...
YOU MUST FILL IN ALL FIELDS ABOVE. Do NOT skip this section.

=== TASK CONTEXT ===
# SOM P2: Inline per-order action buttons + remove bottom Block B (#168 + #169-partial)

Reference: `ux-concepts/staff-orders-mobile.md` v1.0 §Решение-3, §Решение-9, ASCII-макет «Экран стола с группировкой».
Production page: `/staffordersmobile` (staffordersmobile.jsx).

**Context:** Waiter currently must (1) tap an order row to select it, (2) scroll to the bottom of the card to find Block B action button ("Принять / Выдать"). This is 2-tap + scroll, which is too slow during busy service. The approved UX (решение #3) requires a single-tap action button inline on every order row — directly in the row header, right side. Group-level "Принять все" / "Выдать все" buttons already exist in section headers and MUST NOT be changed.

TARGET FILES (modify): `pages/StaffOrdersMobile/staffordersmobile.jsx`
CONTEXT FILES (read-only): `ux-concepts/staff-orders-mobile.md`, `BUGS_MASTER.md`

---

## Fix 1 — #168 (P1) [MUST-FIX]: Add inline action button to each order row in "НОВЫЕ" section

### Сейчас
Each order row in the "НОВЫЕ" section (~lines 1761–1788, `newOrders.map(...)`) shows:
- Header: `[GuestName] [time]` (left) | `[Badge "Новый"] [(!)]` (right)
- Content: items list
- **No action button.** Waiter must tap row → row gets selected highlight → scroll to Block B at bottom → tap big "Принять" button. Two taps + scroll.

### Должно быть
In the header `div.flex.items-center.justify-between` (~line 1772), replace the right side:

**Before:**
```jsx
<div className="flex items-center gap-2">
  <Badge ...>{config.label}</Badge>
  <span className="text-red-500 text-sm font-bold">(!)</span>
</div>
```

**After:**
```jsx
<div className="flex items-center gap-2">
  <Badge ...>{config.label}</Badge>
  {config.actionLabel && (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
      disabled={advanceMutation.isPending}
      className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
    >
      {config.actionLabel}
    </button>
  )}
</div>
```

`e.stopPropagation()` is required to prevent the row click handler (`onClick={() => setSelectedOrderId(order.id)}`) from firing when the button is tapped.

Ref: `ux-concepts/staff-orders-mobile.md` §Решение-3, ASCII-макет line «Гость 1 · 22:21 ───── [Принять]».

### НЕ должно быть
- Do NOT remove the `(!)` badge — keep it. Actually per ASCII mockup it is NOT shown in the target design, but keep it for now as it's urgency signal. Focus only on adding the button.
- Do NOT change the "Принять все" group header button (line ~1745–1752) — it already works.
- Do NOT use the `OrderCard` component here — the rows in sections are lightweight inline divs, not full OrderCard.

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Component: `OrderGroupCard`, Section 1 "НОВЫЕ", inner `newOrders.map(order => ...)` (~line 1755)
Specific div: the right-side `<div className="flex items-center gap-2">` containing `<Badge>` and `<span>(!) </span>` (~line 1772)

### Проверка
Open /staffordersmobile → expand a table with new orders → each "Новый" row header shows a small blue "Принять" button on the right → tap it once → order status changes to "Принято" immediately without scrolling.

---

## Fix 2 — #168 (P1) [MUST-FIX]: Add inline action button to each order row in "ГОТОВО К ВЫДАЧЕ" section

### Сейчас
Each order row in "ГОТОВО К ВЫДАЧЕ" (~lines 1810–1840, `completedOrders.map(...)`) header shows:
- `[GuestName] [time]` (left) | `[Badge "Готово"]` (right)
- No action button.

### Должно быть
In the header div (~line 1822), right side — add the same inline button pattern as Fix 1, but green styling:

```jsx
{config.actionLabel && (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
    disabled={advanceMutation.isPending}
    className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
  >
    {config.actionLabel}
  </button>
)}
```

### НЕ должно быть
- Do NOT change the "Выдать все" group header button (~line 1800–1807).
- Same `e.stopPropagation()` required.

### Файл и локация
Component: `OrderGroupCard`, Section 2 "ГОТОВО К ВЫДАЧЕ", inner `completedOrders.map(order => ...)` (~line 1810)
Specific div: right-side div in order row header (~line 1822)

### Проверка
Table with ready orders → expand → each row in "ГОТОВО К ВЫДАЧЕ" shows a green "Выдать" button → tap → status changes to "Выдано".

---

## Fix 3 — #168 (P1) [MUST-FIX]: Add inline action button to each order row in "В РАБОТЕ" section

### Сейчас
"В РАБОТЕ" section (~lines 1858–1889) shows order rows with same pattern — Badge only, no button.

### Должно быть
Same inline button pattern as Fix 1/2, amber styling. Only show if `config.actionLabel` exists (some mid-stage orders may have no next action):

```jsx
{config.actionLabel && (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); handleBatchAction([order]); }}
    disabled={advanceMutation.isPending}
    className="text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 px-3 py-1 rounded min-h-[36px] disabled:opacity-60"
  >
    {config.actionLabel}
  </button>
)}
```

### НЕ должно быть
Do NOT add a group-level button to "В РАБОТЕ" header — it only has a collapse chevron, no group action (per spec).

### Файл и локация
Component: `OrderGroupCard`, Section 3 "В РАБОТЕ", inner `inProgressOrders.map(order => ...)` (~line 1859)

### Проверка
Expand table with in-progress orders → "В РАБОТЕ" section visible → each row shows action button matching their next step (e.g. "Готово").

---

## Fix 4 — #168 (P1) [MUST-FIX]: Remove Block B bottom action button

### Сейчас
Block B (~lines 1934–1960) renders a large bottom action button when `nextAction` is set:
```jsx
{nextAction && (
  <div>
    <button onClick={handleAdvance} ...>
      {nextAction.label}
    </button>
    <p className="...">Новый → Принято</p>
  </div>
)}
```
This button was the original tap-to-select + bottom button pattern. With per-card inline buttons (Fix 1-3), it is redundant and confusing.

### Должно быть
Remove the entire Block B section: the `{nextAction && (...)}` div (~lines 1934–1960).

Also remove the `transitionText` useMemo (~lines 1601–1613) if it is only used inside Block B (to avoid unused variable warning). Verify by searching for other usages of `transitionText` before removing.

### НЕ должно быть
- Do NOT remove `nextAction` useMemo itself (~lines 1474–1485) — it may be used elsewhere (e.g. for `isHighlighted` logic or scroll-into-view). Check before removing.
- Do NOT remove `handleAdvance` function if it is used elsewhere.
- Do NOT remove `advanceMutation` — it is used by Fix 1-3 `handleBatchAction`.

### Файл и локация
Component: `OrderGroupCard`, Block B section (~line 1934), inside expanded content `div.border-t.border-slate-200.px-4.py-3.space-y-4`

### Уже пробовали
N/A — first attempt at this fix.

### Проверка
Expand a table card with active orders → scroll to bottom → no large "Принять" / "Выдать" button visible at the bottom. Actions are only available via per-card buttons (Fix 1-3) and group header buttons.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше

- Изменяй ТОЛЬКО код описанный в Fix 1-4.
- ЗАПРЕЩЕНО трогать:
  - "Принять все" / "Выдать все" buttons in section headers (lines ~1745–1752, ~1800–1807)
  - Collapsed card header (table name, time, status summary)
  - Block C — requests section (Запросы / Выполнено)
  - Block E — bill summary (Счёт)
  - "Закрыть стол" button
  - TableGroupCard component (the outer collapsed/expanded container)
  - The `getStatusConfig` function and STATUS_FLOW
  - Any styling outside the specific elements described above

## FROZEN UX (DO NOT CHANGE — already tested ✅)
- Collapsed card: "Стол 2" identifier (guard `startsWith('Стол')`) — SOM-S203-02 ✅ Tested S207
- Bill icon: Receipt (not DollarSign) — SOM-S203-01 ✅ Tested S207
- showActionButton condition with isFinishStage fallback — SOM-S203-03 ✅ S207
- Section structure: Запросы → НОВЫЕ → ГОТОВО К ВЫДАЧЕ → В РАБОТЕ — ✅ Tested S203
- Group action buttons "Принять все" / "Выдать все" — ✅ Tested S203

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app (320-420px screens, one-handed use). Verify:
- [ ] Inline action buttons: touch target >= 36px height (`min-h-[36px]` minimum), sufficient width (min 60px)
- [ ] Buttons visible without horizontal scroll on 375px screen — guest name + time + button must fit in one row. If overflow: use shorter label or reduce font size
- [ ] `e.stopPropagation()` on every inline button to prevent double-trigger
- [ ] No duplicate visual indicators (e.g. two "Принять" buttons visible for same order)
- [ ] After Fix 4: scroll to bottom of expanded card — Block B button must NOT appear

## Regression Check (MANDATORY after implementation)
Verify these existing features still work after all fixes:
- [ ] "Принять все" button in НОВЫЕ header still accepts all new orders at once
- [ ] "Выдать все" button in ГОТОВО К ВЫДАЧЕ header still works
- [ ] "Запросы" section (Block C) still shows with "Выполнено" button per request
- [ ] "Счёт" bill section (Block E) with Receipt icon still expands correctly
- [ ] "Закрыть стол" button still appears and works
- [ ] Collapsed card header (table name guard, СЕЙЧАС/ЕЩЁ summary) unchanged

## Implementation Notes
- File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4133 lines)
- The `handleBatchAction(orders)` function already handles single-order arrays — reuse it for Fix 1-3 per-card buttons
- Color coding per section: НОВЫЕ = blue-600, ГОТОВО К ВЫДАЧЕ = green-600, В РАБОТЕ = amber-600
- `e.stopPropagation()` is REQUIRED on all inline buttons to prevent triggering row's `setSelectedOrderId`
- `min-h-[36px]` for touch target (36px is acceptable for secondary tappable inside card context)
- FROZEN UX grep verification (run before commit):
  ```bash
  grep -n "Принять все\|Принять_все\|handleBatchAction(newOrders)" pages/StaffOrdersMobile/staffordersmobile.jsx
  grep -n "Выдать все\|handleBatchAction(completedOrders)" pages/StaffOrdersMobile/staffordersmobile.jsx
  grep -n "Receipt.*w-4.*text-slate-500\|Счёт:" pages/StaffOrdersMobile/staffordersmobile.jsx
  ```
  All must return results (FROZEN elements not removed).
- git commit after all fixes
=== END ===


## Status
Running...
