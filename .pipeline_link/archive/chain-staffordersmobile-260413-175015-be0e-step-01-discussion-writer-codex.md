---
chain: staffordersmobile-260413-175015-be0e
chain_step: 1
chain_total: 2
chain_step_name: discussion-writer-codex
chain_group: writers
chain_group_size: 2
page: StaffOrdersMobile
budget: 5.00
runner: codex
type: chain-step
---
**MANDATORY FIRST STEP — run this before anything else:**
```
git fetch origin 2>/dev/null; git reset --hard origin/main
```
This ensures your working copy is in sync with the remote repository.

---

You are the Codex Discussion Writer in a modular discussion pipeline.
Your job: independently analyze each question from the TASK CONTEXT and write your position.
You work in PARALLEL with a CC Discussion Writer — do NOT read CC findings.

SPEED RULES — this is a time-sensitive pipeline step:
- Read ONLY the reference files mentioned in the task. Do NOT search the repo.
- Be concise but thorough in your analysis.

INSTRUCTIONS:
1. Read the TASK CONTEXT below — it contains questions for discussion.
2. If reference files are mentioned (UX docs, screenshots, code) — read them for context.
3. For EACH question: write your analysis with a recommended answer and reasoning.
4. Focus on: mobile-first UX, restaurant app context, real-world user behavior, best practices.
5. Write your position to: pipeline/chain-state/staffordersmobile-260413-175015-be0e-codex-position.md
6. Do NOT read or reference any CC output.

FORMAT for position file:
# Codex Discussion Position — StaffOrdersMobile
Chain: staffordersmobile-260413-175015-be0e
Topic: [title from task]

## Questions Analyzed

### Q1: [question title]
**Recommendation:** [your recommended option]
**Reasoning:** [why this is the best approach]
**Trade-offs:** [what you sacrifice with this choice]
**Mobile UX:** [specific mobile considerations if relevant]

### Q2: [question title]
...

## Summary Table
| # | Question | Codex Recommendation | Confidence |
|---|----------|----------------------|------------|
| 1 | ...      | ...                  | high/medium/low |

## Prompt Clarity
Rate the task description quality (1-5). For any score below 4, explain what was unclear:
- Overall clarity: [1-5]
- Ambiguous questions (list # and what was unclear): ...
- Missing context (what info would have helped): ...

Do NOT apply any code changes.

=== TASK CONTEXT ===
# ПССК: Ревью черновика КС-промпта — SOM Batch A Android Quick-Fix

Please review the draft КС prompt below. Identify:
1. Ambiguous Fix descriptions — anything that could be interpreted in 2+ ways
2. Wrong or missing line numbers / grep hints
3. Missing edge cases or anti-patterns
4. Scope creep risks — fixes that might accidentally touch other code
5. Any fixes that are underspecified (need more context) or overspecified (constrain the implementor unnecessarily)

Rate each Fix: ✅ Clear / ⚠️ Needs clarification / ❌ Rewrite needed.

---

## DRAFT КС PROMPT BELOW (do not implement — review only)

---

page: StaffOrdersMobile
code_file: pages/StaffOrdersMobile/staffordersmobile.jsx
budget: 12
agent: cc+codex
chain_template: consensus-with-discussion

---

# SOM Batch A: Android Quick-Fix (#293 + #296 + #297 + #271)

Reference: `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` v2.7, `BUGS_MASTER.md` (SOM-S256-02/03/04/05, SOM-S235-03).

RELEASE source: `260413-00 StaffOrdersMobile RELEASE.jsx` (4524 lines).

---

## Fix 1 — SOM-S256-02 / #293 (P2) [MUST-FIX]: Guest counter shows dish count instead of unique guests

### Сейчас (текущее поведение)
Section headers (НОВЫЕ, В РАБОТЕ, etc.) show `N ГОСТЕЙ · N БЛЮД`. The guest count equals the number of orders, not the number of unique guests. Example: 1 guest with 2 dishes → shows "2 ГОСТЯ · 2 БЛЮДА" instead of "1 ГОСТЬ · 2 БЛЮДА".

### Должно быть (ожидаемое поведение)
Guest count = number of unique `guest_id` values across orders in that section. Use `new Set(orders.map(o => getLinkId(o.guest))).size` (or equivalent). Dishes count stays as-is (total items).
Ref: UX decision #19 — "N гостей · N блюд: гости = охват, блюда = объём работы".

### НЕ должно быть (анти-паттерны)
- Do NOT count orders as guests.
- Do NOT count `null`/`undefined` guest_id as separate guests — group them as 1 unknown guest.

### Файл и локация
`staffordersmobile.jsx`:
- **~line 670**: `НОВЫЕ` section header — `newOrders.length` used as guest count in template literal.
- **~line 680**: `В РАБОТЕ` section header — `inProgressOrders.length` used as guest count.
- **~line 708**: Any other section header with the same pattern (grep for `HALL_UI_TEXT.guests`).
- Also check `countRows()` function — it may be involved in the count logic.

### Проверка (мини тест-кейс)
1. Create 2 dishes from Guest 1 (same table). Both appear as NEW.
2. Header should show "1 ГОСТЬ · 2 БЛЮДА", not "2 ГОСТЯ · 2 БЛЮДА".

---

## Fix 2 — SOM-S256-04 / #296 (P1) [MUST-FIX]: Table card disappears after "Выдать все (N)"

### Сейчас (текущее поведение)
After tapping "Выдать все (N)" and all orders move to `served` status, the table card vanishes from the Active tab. The waiter loses sight of the table and cannot tap "Закрыть стол".

### Должно быть (ожидаемое поведение)
When all orders reach finish stage (`isFinishStage === true`) but the table session is NOT closed, the table card MUST remain in the Active tab. It should display in the `ALL_SERVED` visual state (green border, "ОБСЛУЖЕНО" badge) with an enabled "Закрыть стол" button.

The card should move to the Completed tab ONLY after the waiter explicitly taps "Закрыть стол" (which calls close table session API).

Ref: UX decision #16 — "Закрыть стол — двойное условие: все блюда выданы + счёт оплачен".

### НЕ должно быть (анти-паттерны)
- Table card MUST NOT disappear from Active tab just because all orders are `served`.
- Do NOT change the Completed tab logic for actually-closed tables.

### Файл и локация
`staffordersmobile.jsx`, **~lines 3792-3799** — `useMemo` filter for `visibleGroups`:
```javascript
return orderGroups.filter(group => {
  const hasActiveOrder = group.orders.some(o => {
    const config = getStatusConfig(o);
    return !config.isFinishStage && o.status !== 'cancelled';
  });
  const hasActiveRequest = group.type === 'table' && activeRequests.some(r => getLinkId(r.table) === group.id);
  return activeTab === 'active' ? (hasActiveOrder || hasActiveRequest) : (!hasActiveOrder && !hasActiveRequest);
});
```

The fix: for `activeTab === 'active'`, a table group should also be visible if all orders are at finish stage but the table session is still open (not closed). Check whether `group.tableSession?.status !== 'closed'` or equivalent — the table session object should indicate if the table was explicitly closed.

**Also check ~lines 3804-3810** (`tabCounts`) — same logic must be consistent.

### Проверка (мини тест-кейс)
1. Open a table with 2 NEW dishes.
2. Accept both → Deliver both ("Выдать все").
3. Table card MUST remain in Active tab with green "ОБСЛУЖЕНО" style.
4. Tap "Закрыть стол" → card moves to Completed tab.

---

## Fix 3 — SOM-S256-05 / #297 (P2) [MUST-FIX]: Tap on ★ ownership badge expands card instead of doing nothing

### Сейчас (текущее поведение)
Tapping the ★ (star) badge on a table card in "mine" ownership state triggers the parent `onToggleExpand`, expanding/collapsing the card. The ★ badge is a plain `<div>` — no `stopPropagation`.

### Должно быть (ожидаемое поведение)
Tapping ★ badge should NOT expand/collapse the card. The ★ is a visual indicator only (shows "Мой стол"). Add `onClick` with `e.stopPropagation()` to prevent event bubbling.

Note: The 🔒 badge (~line 2255) already has `stopPropagation` correctly. Apply the same pattern to ★.

Ref: DECISIONS_INDEX — "Badge ★/☆/🔒 — только в режиме «Все»".

### НЕ должно быть (анти-паттерны)
- Do NOT add any new functionality to the ★ badge tap — it is purely visual.
- Do NOT change the 🔒 badge behavior (already correct).
- Apply same `stopPropagation` to ☆ free badge (~lines 2259-2262) for consistency.

### Файл и локация
`staffordersmobile.jsx`, **~lines 2249-2252** — ownership "mine" badge:
```javascript
<div style={{position:'absolute', top:'-7px', left:'-7px', ...}} aria-label="Мой стол">
  {'★'}
</div>
```
Change `<div>` → `<div onClick={(e) => e.stopPropagation()}>` (keep as div, just add click handler).

### Проверка (мини тест-кейс)
1. In "Все" ownership filter, find a table with ★ badge.
2. Tap directly on ★ — card must NOT expand/collapse.
3. Tap anywhere else on the card header — card expands normally.

---

## Fix 4 — SOM-S235-03 / #271 (P1) [MUST-FIX]: "В РАБОТЕ" wrapper groups ПРИНЯТО and ГОТОВИТСЯ incorrectly

### Сейчас (текущее поведение)
Inside expanded table card, ПРИНЯТО and ГОТОВИТСЯ sections are rendered as sub-sections nested under a single collapsible "В РАБОТЕ (N гостей · N блюд)" container.

### Должно быть (ожидаемое поведение)
Each partner-defined stage (Принято, Готовится, Готово к выдаче, Выдано) should be a ROOT-LEVEL section at the same hierarchy level as "Запросы" and "Новые". No "В РАБОТЕ" group wrapper.

Each section should:
- Have its own collapsible header with stage name + count
- Follow active/passive rules: Готово к выдаче = active (expanded, colored). Принято, Готовится, Выдано = passive (collapsed, grey, opacity 0.6)
- Have its own bulk action button if applicable

Ref: UX decision #10 — "Порядок секций: Запросы → Новые → Принято → Готовится → Готово к выдаче → Выдано."
Ref: UX decision #11 — "Активные = раскрыты. Пассивные = свёрнуты + серые + opacity 0.6."

### НЕ должно быть (анти-паттерны)
- No "В РАБОТЕ" wrapper/container around middle stages.
- Do NOT merge sections back into a single group.
- Do NOT change the order of sections.

### Файл и локация
`staffordersmobile.jsx`, **~lines 677-730** — the `inProgressSections` block:
- Line 677: `{inProgressSections.length > 0 && (` — start of wrapper
- Line 679: single expand toggle for all → REMOVE
- Line 680: Label "В РАБОТЕ (N гостей · N блюд)" → REMOVE
- Lines 685-730: `inProgressSections.map(section => ...)` → promote to root level

The `inProgressSections` array already contains individual stages. The fix: render each section at root level (same indentation as `newOrders` block at ~line 667).

**Deletion safety:** `inProgressExpanded` state becomes dead after removal — leave with comment `// reserved — hook order`.

### Проверка (мини тест-кейс)
1. Have orders in ПРИНЯТО and ГОТОВИТСЯ stages on the same table.
2. Expand the table card.
3. See ПРИНЯТО and ГОТОВИТСЯ as separate root sections (same level as НОВЫЕ). No "В РАБОТЕ" wrapper.
4. ПРИНЯТО section should be collapsed by default with grey/opacity styling.

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО то, что указано выше
- Изменяй ТОЛЬКО код из Fix-секций 1-4.
- Header redesign (#294, #295) — out of scope, do NOT touch.
- Drawer, settings, service requests — НЕ ТРОГАТЬ.

## FROZEN UX (НЕ менять)
- Collapsed card identity block layout (78×54px, urgency colors, badge positions) — LOCKED GPT S250
- Smart chips on collapsed card — LOCKED GPT S250
- Ownership filter bar (★ Мои / ☆ Своб / Все) — LOCKED GPT R3 S250
- Urgency 3 levels (calm/warning/danger) — LOCKED GPT R6 S250

## CONTEXT FILES (read before implementing)
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — section hierarchy reference for Fix 4.
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — UX spec.

## Implementation Notes
- File: `staffordersmobile.jsx` (single file, 4524 lines)
- i18n: uses `t()` from `useI18n()` (line 2835). No new user-facing strings.
- Fix #293: grep `HALL_UI_TEXT.guests` — may be 3+ occurrences
- Fix #296: keep `tabCounts` consistent with `visibleGroups` filter
- Fix #297: minimal — add `onClick` stopPropagation to `<div>`
- Fix #271: promote `inProgressSections.map(...)` to root level, remove wrapper
- git add staffordersmobile.jsx && git commit after all fixes

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Touch targets >= 44x44px
- [ ] No excessive whitespace on small screens
- [ ] Section headers visible and readable

## Regression Check (MANDATORY after implementation)
- [ ] Collapsed table card shows correct status chips and urgency colors
- [ ] Tap on table card header expands/collapses the detail view
- [ ] Bulk action buttons ("Принять все", "Выдать все") work
- [ ] Ownership filter bar filters correctly
- [ ] "Закрыть стол" button appears on ALL_SERVED tables

## FROZEN UX grep verification (run before commit)
```bash
grep -n "URGENCY_IDENTITY_STYLE" staffordersmobile.jsx | head -5
grep -n "scsChips\|scsUrgency" staffordersmobile.jsx | head -5
```
=== END ===
