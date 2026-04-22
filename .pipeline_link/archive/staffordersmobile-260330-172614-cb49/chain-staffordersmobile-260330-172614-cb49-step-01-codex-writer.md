---
chain: staffordersmobile-260330-172614-cb49
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

Write findings to: pipeline/chain-state/staffordersmobile-260330-172614-cb49-codex-findings.md

FORMAT:
# Codex Writer Findings — StaffOrdersMobile
Chain: staffordersmobile-260330-172614-cb49

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
# SOM P1: Fix $ icon + Стол дубль + inline quick action (#208)

Reference: `ux-concepts/staff-orders-mobile.md` v1.0 §Решение-3, `BUGS_MASTER.md`.
Production page: `/staffordersmobile` (staffordersmobile.jsx).

**Context:** Three issues in StaffOrdersMobile identified in S203 Android test.
Fix 1–2 are small visual bugs (L). Fix 3 implements inline quick-action button per approved UX spec (решение #3 — single-tap action directly on order card, P1).

TARGET FILES (modify): `pages/StaffOrdersMobile/staffordersmobile.jsx`
CONTEXT FILES (read-only): `ux-concepts/staff-orders-mobile.md`, `BUGS_MASTER.md`

---

## Fix 1 — SOM-S203-01 (P2) [MUST-FIX]: Replace DollarSign icon with Receipt in bill summary

### Сейчас
In the expanded table card, Block E (bill summary, ~line 1886–1910) shows a `<DollarSign>` icon next to the "Счёт: 130 ₸" label. On screen this renders as "$ Счёт: 130 ₸" — the `$` symbol looks like raw text/broken data to the waiter.
Current code at ~line 1893: `<DollarSign className="w-4 h-4 text-slate-500 shrink-0" />`

### Должно быть
Replace `DollarSign` with `Receipt` icon:
`<Receipt className="w-4 h-4 text-slate-500 shrink-0" />`
The `Receipt` component is already imported at ~line 193: `Receipt,`
Result: waiter sees "🧾 Счёт: 130 ₸" style (with receipt icon instead of dollar sign).

### НЕ должно быть
- Do NOT remove the icon entirely — the icon helps identify this as a bill row.
- Do NOT change the layout or text around the icon.
- Do NOT change the `DollarSign` import if it's used elsewhere — only change this one instance.

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Search: `grep -an "DollarSign" pages/StaffOrdersMobile/staffordersmobile.jsx`
Expected: ~line 193 (import) + ~line 1893 (usage). Change only line ~1893 usage.
`Receipt` is already imported — no new imports needed.

### Проверка
Open table card with bill data → expand if needed → see Receipt icon (🧾-like) instead of dollar sign next to "Счёт: 130 ₸".

---

## Fix 2 — SOM-S203-02 (P3) [MUST-FIX]: Remove double «Стол» prefix in table card title

### Сейчас
In the table group card header, the identifier is built at ~line 1398:
`identifier = tableData?.name ? \`Стол ${tableData.name}\` : group.displayName`
If `tableData.name` is already "Стол 2" (B44 stores full name), this produces "Стол Стол 2".
Waiter sees: **«Стол Стол 2»** — confusing duplicate.

### Должно быть
Check if `tableData.name` already starts with "Стол" before adding the prefix:
```js
identifier = tableData?.name
  ? (tableData.name.startsWith('Стол') ? tableData.name : `Стол ${tableData.name}`)
  : group.displayName;
```
Result: "Стол 2" (single prefix) regardless of what B44 stores.

### НЕ должно быть
- Do NOT remove the "Стол" prefix entirely — waiter needs to know this is a table.
- Do NOT change how pickup/delivery orders build their identifier (lines 1400–1402 — leave untouched).
- Do NOT change `group.displayName` building logic (line 3341+).

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Search: `grep -an "Стол \${tableData" pages/StaffOrdersMobile/staffordersmobile.jsx`
Expected: ~line 1398.

### Проверка
Open StaffOrdersMobile → table card shows "Стол 2" (not "Стол Стол 2") in header.

---

## Fix 3 — Решение #3 (P1) [MUST-FIX]: Inline quick-action button always visible on OrderCard

### Сейчас
`OrderCard` (function at ~line 974) has `showActionButton` variable (~line 1134):
`const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus);`
The action button renders at ~line 1270–1278 when `showActionButton && statusConfig.actionLabel`.

**Problem:** `showActionButton` may be `false` for orders using custom B44 stages where `statusConfig.nextStageId` is null and `statusConfig.nextStatus` is undefined (known issue from KB in SOM Batch P0). When button is hidden, waiter must scroll to batch buttons at bottom of page — every action requires extra scrolling.

Per UX решение #3 (`ux-concepts/staff-orders-mobile.md` §3): **80% of actions = single tap directly on the order card.** Inline action button must always show for actionable orders.

### Должно быть
**Step 1: Debug `showActionButton` condition.**
Check `statusConfig` for all order states. The statusConfig comes from position-based derivation (Batch P0 fix: first→accepted, last→served, mid→in_progress).

Ensure `showActionButton` is `true` for all non-terminal states:
- `new` / `accepted` / `in_progress` / `ready` → button should always show
- `served` / `completed` → no button needed (terminal states)

**Step 2: If `statusConfig.nextStageId` and `statusConfig.nextStatus` are both null/undefined for custom stages**, add fallback:
```js
const showActionButton = !!(statusConfig.nextStageId || statusConfig.nextStatus)
  || (statusConfig.actionLabel && !statusConfig.isTerminal);
```
Add `isTerminal: true` to the served/completed entries in the fallback config (~line 211–235).

**Step 3: Visual — ensure button is prominent.**
The button at ~line 1270–1278 uses `className={...ctaClass}`. Verify it's clearly visible (not hidden behind overflow or too small). Size should be at minimum `h-9 min-w-[80px]` (already set at line 1274).

**Expected result:** Every OrderCard for a non-served order shows its action button inline: «Принять», «В работу», «Готово», or «Выдать». Waiter can complete the action in one tap without scrolling.

### НЕ должно быть
- Do NOT show a button on served/completed orders (terminal state).
- Do NOT change the batch action buttons at the bottom — those are a separate path, keep them.
- Do NOT change `statusConfig` derivation logic if it was fixed in Batch P0 (chain e9aa) — only extend, don't replace.
- Do NOT change `OrderCard` props interface — only internal logic.

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Search showActionButton: `grep -an "showActionButton" pages/StaffOrdersMobile/staffordersmobile.jsx`
Search statusConfig: `grep -an "statusConfig\|isTerminal\|actionLabel" pages/StaffOrdersMobile/staffordersmobile.jsx`
OrderCard function: ~line 974.
Button render: ~line 1270–1278.

### Проверка
Open table card → see order with status «Новый» → card shows «Принять» button. Tap → status changes to «Принят». No scrolling needed.
Open order with status «Готово» → card shows «Выдать» button inline.

---

## FROZEN UX (DO NOT CHANGE)
These elements are approved and tested. Do NOT modify, remove, reposition, or restyle:
- **Group-by-status layout**: заказы сгруппированы по статусам — решение #2, ✅ Tested S204.
- **Summary card on table**: счётчики статусов вместо списка блюд — решение #1 / #164, ✅ Tested S204.
- **Service requests section**: «ЗАПРОСЫ ГОСТЕЙ» отдельная секция вверху — решение #6 / #167, ✅ Tested S204.
- **Batch action buttons**: «Принять все» / «Выдать все» кнопки внизу — сохранить, не удалять.
- **Bill section (Block E)**: структура и expand/collapse `billExpanded` — менять ТОЛЬКО иконку (Fix 1).
- **Pickup/delivery identifier** (lines 1400–1402): не трогать — только таблицы.
- **handleAction logic**: последовательность смены статусов — не изменять (KB-fix из Batch P0 chain e9aa).

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что описано выше
- Fix 1: ТОЛЬКО замена DollarSign → Receipt в Block E (~line 1893).
- Fix 2: ТОЛЬКО guard-проверка на дубль «Стол» в identifier (~line 1398).
- Fix 3: ТОЛЬКО showActionButton condition и isTerminal flag — минимальные изменения.
- Do NOT refactor OrderCard, do NOT add new state, do NOT change layout.
- If you see issues outside this scope — SKIP and note in findings.

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app used by waiters on the move. Verify at 375px width:
- [ ] Receipt icon visible and legible in bill row (not clipped)
- [ ] Table card title shows "Стол N" (not "Стол Стол N") in all card states
- [ ] Inline action button min-h-[36px], fully tappable without mis-taps
- [ ] Action button label fits on one line («Принять», «Выдать» — short labels)
- [ ] OrderCard layout not broken by button always showing

## Regression Check (MANDATORY after implementation)
After applying all fixes, verify:
- [ ] Bill section still expands/collapses on tap
- [ ] Table title shows correctly for ALL card types (table, pickup, delivery)
- [ ] Batch action buttons still work (not removed)
- [ ] Service requests section intact
- [ ] Order status changes correctly via inline button (handleAction not broken)

## FROZEN UX grep verification
Before commit:
```bash
grep -an "DollarSign" pages/StaffOrdersMobile/staffordersmobile.jsx
grep -an "showActionButton" pages/StaffOrdersMobile/staffordersmobile.jsx
grep -an "Стол \${tableData" pages/StaffOrdersMobile/staffordersmobile.jsx
```

## Implementation Notes
- TARGET file: `pages/StaffOrdersMobile/staffordersmobile.jsx` — 4019 lines. Use `grep -a` for all searches.
- `Receipt` is already imported (~line 193) — no new imports needed for Fix 1.
- For Fix 3: read the existing `statusConfig` fallback object (~lines 211–235) before modifying — understand current structure.
- Batch P0 (chain e9aa, S204) established position-based `derivedNextStatus` — reference it, don't break it.
- git add pages/StaffOrdersMobile/staffordersmobile.jsx && git commit -m "fix(SOM): Receipt icon for bill, remove Стол dupe, inline action always visible" && git push
=== END ===
