---
task_id: task-260407-180730-staffordersmobile-pssk-cc-reviewer
status: running
started: 2026-04-07T18:07:31+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 5.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260407-180730-staffordersmobile-pssk-cc-reviewer

## Config
- Budget: $5.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260407-180725-135c
chain_step: 1
chain_total: 1
chain_step_name: pssk-cc-reviewer
chain_group: reviewers
chain_group_size: 2
page: StaffOrdersMobile
budget: 5.00
runner: cc
type: chain-step
---
You are a CC code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below in TASK CONTEXT.

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect line numbers (check against current file if specified)
- Incorrect code snippets (wrong syntax, wrong function calls, wrong variable names)
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions that could be misinterpreted
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help CC execute without hesitation?
- Fix dependencies: are there ordering requirements between fixes?
- Validation steps: are they sufficient to catch regressions?
- New dictionary entries: are all additions justified and explained?

Write your findings to: pipeline/chain-state/staffordersmobile-260407-180725-135c-cc-findings.md

FORMAT:
# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-180725-135c

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Line Number Verification
| Reference | Prompt says | Actual | Status |
|-----------|------------|--------|--------|
| ... | ... | ... | ✅/❌ |

## Fix-by-Fix Analysis
For each fix: SAFE / RISKY — brief reason.

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)
Prompt clarity rating: [1-5]

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
You are reviewing the quality of a КС implementation prompt for a React/Base44 app.
DO NOT execute the changes. DO NOT read code files. Only review the prompt quality.

Context: 6 UX gap fixes for StaffOrdersMobile hall-mode render path — jump chips, bulk buttons repositioning, В РАБОТЕ wrapper removal, dual metric in section headers, button text labels, close-table hint reformatting.

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases
3. Ambiguous instructions
4. Safety risks (unintended file changes, legacy path breakage)
5. Validation: are post-fix checks sufficient?

Rate each Fix 1–6 on clarity (1–5). Give an overall prompt score out of 10.

---

# SOM Phase 2 — 6 UX Gap Fixes (BACKLOG #269–#274)

## CONTEXT

**File:** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4407 lines)
**Target render path:** Hall-mode ONLY — the 3rd render path starting at ~line 2175.
The file has 3 render paths: legacy1 (~line 580), legacy2 (~line 1190), hall-mode (~line 2175).
ALL 6 fixes target ONLY the hall-mode path (lines 2175–2238). DO NOT touch legacy1 or legacy2.

**UX Reference files (READ BEFORE coding):**
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile UX S225 FINAL.md` — 33 agreed UX decisions
- `ux-concepts/StaffOrdersMobile/260406-00 StaffOrdersMobile Mockup S225 FINAL.html` — **Read this HTML mockup as code. It contains the exact target UI: Tailwind-equivalent classes, section order, component hierarchy, button labels, colors. Your implementation MUST match this mockup. When Fix description and mockup conflict — mockup wins.**

**Key data structures (DO NOT modify these):**
- `hallSummaryItems` (line 1996): `[requestSummary, newSummary, readySummary].filter(Boolean)` — each item has `{key, kind, icon, label, count, ageMin}`
- `inProgressSections` (line 1998): `subGroups.map(...)` → `{sid, orders, rows, rowCount, label, bulkLabel}`
- `closeDisabledReasons` (line 2019–2027): array of HALL_UI_TEXT blocker strings
- `reasonToKind` (line 2029–2034): maps reason strings to section kinds
- `getOrderActionMeta` (line 1902–1913): returns `{config, nextLabel, willServe, rowLabel, bulkLabel}`
- `renderHallRows` (line 2075–2114): renders dish rows with action buttons
- `scrollToSection` (line 1753): scrolls to section by kind string
- `countRows` (line 1967–1970): counts non-loading rows

**HALL_UI_TEXT dictionary** (lines 305–343) — keys used in this task:
- `requests`, `new`, `ready`, `inProgress`, `served`, `bill`
- `acceptAll`, `serveAll`, `acceptRequest`, `serveRequest`
- `accept` ("Принять"), `serve` ("Выдать")
- `requestsBlocker`, `newBlocker`, `inProgressBlocker`, `readyBlocker`
- `collapse`, `show`, `hide`, `closeTable`

---

## FROZEN UX (DO NOT CHANGE)

These elements are tested and working. Do not modify their behavior, styling, or position:

1. **Urgency color strips** on dish rows (border-l-4 red/amber) — `renderHallRows` line 2094. ✅ Tested S234 (#255-SOM)
2. **Close table reasons as tappable buttons** with `›` → scroll to section — line 2224 `scrollToSection(kind)`. ✅ Tested S234 (#256-SOM)
3. **Per-dish single-tap action buttons** on each dish row — `renderHallRows` line 2108–2111. ✅ Tested S207 (#168-SOM)
4. **Inline undo toast** after serve action — lines 2083–2091 + 2114–2125. ✅ Tested S212
5. **Sub-grouping В РАБОТЕ** by partner stages (ПРИНЯТО/ГОТОВИТСЯ) — line 2216 `inProgressSections.map`. ✅ Tested S208
6. **Section order** Запросы→Новые→В работе→Готово→Выдано→Счёт→Закрыть — lines 2212–2224. ✅ Tested S208
7. **Collapsed card summary** format (СЕЙЧАС/ЕЩЁ per-stage lines) — line 2183 `hallSummaryItems`. ✅ Tested S203 (#164-SOM)
8. **Receipt icon** in bill section (was DollarSign→Receipt). ✅ Tested S207 (SOM-S203-01)
9. **Table label** without "Стол Стол" duplication. ✅ Tested S207 (SOM-S203-02)
10. **Verb-first bulk buttons** "Принять все (N)" / "Выдать все (N)". ✅ Tested S211
11. **Block B removed** (no large bottom CTA). ✅ Tested S207 (#168-SOM-BlockB)
12. **Split-order per-dish architecture** — each cart item = separate Order. ✅ Tested S231 (Decision #33)
13. **Duplicate card removed** after split-order. ✅ Tested S234 (SOM-S231-01)

---

## Fix 1: Jump chips — replace text summary with colored tappable chips (#269, SOM-S235-01)

**Problem:** Line 2183 renders `hallSummaryItems.map(renderHallSummaryItem)` which produces plain text buttons like `"🔔 2 · 5м  Новые 9 · 12м"`. The mockup shows a jump-bar with colored pill-shaped chips: `[Запросы 2] [Новые 9] [Готово 1] [Счёт 6 239 ₸]`.

**What the mockup shows (HTML lines 211–216):**
```html
<div class="jump-bar"> <!-- horizontal row below app-header, flex gap-8 -->
  <div class="jump-chip red">Запросы 2</div>
  <div class="jump-chip blue">Новые 9</div>
  <div class="jump-chip green">Готово 1</div>
  <div class="jump-chip gray">Счёт 6 239 ₸</div>
</div>
```
Each chip: `rounded-full px-3 py-1 text-xs font-semibold border` with color-coded bg/border/text. Tap → `scrollToSection(kind)`.

**What to change:**

1. Replace `renderHallSummaryItem` usage at line 2183 with a new jump-bar component. The existing `hallSummaryItems` array provides data for requests/new/ready chips. You also need a bill chip (from `billData`) and optionally in-progress chips.

2. Build a `jumpChips` array in the hall-mode card (near line 2183), constructed from existing data:
   - If `tableRequests.length > 0`: `{label: "Запросы", count: tableRequests.length, kind: "requests", tone: "red"}`
   - If `newOrders.length > 0`: `{label: HALL_UI_TEXT.newShort, count: countRows(newRows, newOrders.length), kind: "new", tone: "blue"}`
   - If `inProgressOrders.length > 0`: `{label: "В работе", count: inProgressSections.reduce((s, sec) => s + sec.rowCount, 0), kind: "inProgress", tone: "amber"}`
   - If `readyOrders.length > 0`: `{label: HALL_UI_TEXT.readyShort, count: countRows(readyRows, readyOrders.length), kind: "ready", tone: "green"}`
   - If `billData && billData.total > 0`: `{label: HALL_UI_TEXT.bill, count: formatHallMoney(billData.total), kind: "bill", tone: "gray"}`

3. Render jump-bar ONLY when `isExpanded` is FALSE (collapsed card view) — replace the current `hallSummaryItems.map(renderHallSummaryItem)` at line 2183 with:
   ```jsx
   <div className="flex flex-wrap items-center gap-1.5">
     {jumpChips.map(chip => (
       <button key={chip.kind} type="button"
         onClick={(e) => { e.stopPropagation(); scrollToSection(chip.kind); }}
         className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${chipStyles[chip.tone]}`}>
         {`${chip.label} ${chip.count}`}
       </button>
     ))}
   </div>
   ```

4. Define `chipStyles` object near line 2075 (before `renderHallRows`):
   ```js
   const chipStyles = {
     red: "bg-red-50 border-red-300 text-red-600",
     blue: "bg-blue-50 border-blue-300 text-blue-600",
     green: "bg-green-50 border-green-300 text-green-600",
     amber: "bg-amber-50 border-amber-300 text-amber-600",
     gray: "bg-slate-100 border-slate-300 text-slate-500",
   };
   ```

5. **DO NOT** remove `renderHallSummaryItem` function (line 2057–2072) — it is used by legacy1 and legacy2 paths (lines 537, 594, 1149, 1205).

**Verification:**
- `grep -n "renderHallSummaryItem" staffordersmobile.jsx` — must still exist at lines 537, 594, 1149, 1205, 2057
- `grep -n "jumpChips" staffordersmobile.jsx` — must appear in hall-mode section
- `grep -n "chipStyles" staffordersmobile.jsx` — must exist
- `grep -n "jump-chip\|rounded-full.*border.*text-red\|rounded-full.*border.*text-blue" staffordersmobile.jsx` — confirms chip styling

---

## Fix 2: Bulk buttons — move from section header to bottom of card block (#270, SOM-S235-02)

**Problem:** Currently bulk buttons ("Принять все (N)", "Выдать все") are INSIDE the section header `<div className="flex items-center justify-between">` at lines 2212 (requests), 2214 (new), 2216 (inProgress subsections), 2218 (ready). The mockup puts bulk buttons at the BOTTOM of the cards-block as a full-width bar, and the header only has title + chevron.

**What the mockup shows (HTML lines 289–291):**
```html
<!-- Bulk button at BOTTOM after all cards -->
<div class="section-bulk-bar"> <!-- border-top, padding 10px 14px -->
  <button class="section-bulk-btn blue">Принять всё (9)</button>
</div>
```
Section header (lines 222–225):
```html
<div class="section-header">
  <span class="section-title blue">Новые (4 гостя · 9 блюд)</span>
  <span class="section-chevron open">›</span> <!-- chevron only, no button -->
</div>
```

**What to change for each active section:**

For **НОВЫЕ** section (line 2214):
- Header: remove the `<button>` with `acceptAll`/`serveAll`. Replace with a chevron `<ChevronDown>` or `›` text.
- After `{renderHallRows(newRows, "blue")}`, add a bulk-bar div:
  ```jsx
  <div className="border-t border-blue-100 pt-2 mt-2">
    <button type="button" onClick={() => handleOrdersAction(newOrders)}
      disabled={advanceMutation.isPending}
      className="w-full rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">
      {getOrderActionMeta(newOrders[0]).willServe ? `${HALL_UI_TEXT.serveAll} (${countRows(newRows, newOrders.length)})` : `${HALL_UI_TEXT.acceptAll} (${countRows(newRows, newOrders.length)})`}
    </button>
  </div>
  ```

For **ГОТОВО К ВЫДАЧЕ** section (line 2218): same pattern — move `serveAll` button to bulk-bar below `renderHallRows(readyRows, "green")`. Use `bg-green-600 text-white`.

For **ЗАПРОСЫ** section (line 2212): move `acceptAllRequests`/`serveAllRequests` button to bottom of requests list. Keep request cards as-is.

For **В РАБОТЕ subsections** (line 2216, inside `inProgressSections.map`): the per-subsection bulk buttons (e.g. "Все → Готовится") — move below the `renderHallRows(section.rows, "amber")` block. Use `bg-amber-500 text-white`.

**Verification:**
- In hall-mode expanded area (lines 2210–2225): no `<button>` inside section header divs — only title + chevron
- `grep -n "section-bulk\|w-full rounded-lg bg-blue-600\|w-full rounded-lg bg-green-600" staffordersmobile.jsx` — confirms bulk bars exist

---

## Fix 3: Remove "В РАБОТЕ" wrapper — ПРИНЯТО/ГОТОВИТСЯ become root sections (#271, SOM-S235-03)

**Problem:** Line 2216 wraps all `inProgressSections` inside a single `<div>` with a "В РАБОТЕ" header and expand/collapse toggle. This creates a hierarchy: В РАБОТЕ → ПРИНЯТО / ГОТОВИТСЯ. The mockup shows ПРИНЯТО and ГОТОВИТСЯ as independent root-level `gray-section` elements (collapsed by default, same level as НОВЫЕ, ГОТОВО).

**What the mockup shows (HTML lines 295–311):**
```html
<!-- ПРИНЯТО — root gray section, same level as НОВЫЕ/ГОТОВО -->
<div class="gray-section"> <!-- collapsed, opacity:0.6 -->
  <div class="gray-left">
    <span class="gray-title">Принято</span>
    <span class="gray-badge">· 2 гостя · 3 блюда</span>
  </div>
  <span class="chevron">›</span>
</div>
<!-- ГОТОВИТСЯ — root gray section -->
<div class="gray-section">
  <div class="gray-left">
    <span class="gray-title">Готовится</span>
    <span class="gray-badge">· 1 гость · 2 блюда</span>
  </div>
  <span class="chevron">›</span>
</div>
```

**What to change:**

1. **Remove** the outer `<div ref={inProgressSectionRef}>` wrapper with the "В РАБОТЕ" button and `inProgressExpanded` toggle (line 2216).

2. **Replace** with direct rendering of each `inProgressSections` item as an independent section:
   ```jsx
   {inProgressSections.map((section) => {
     const isSubExpanded = !!expandedSubGroups[section.sid];
     return (
       <div key={section.sid} ref={section.sid === inProgressSections[0]?.sid ? inProgressSectionRef : undefined}>
         <button type="button"
           onClick={() => setExpandedSubGroups((prev) => ({ ...prev, [section.sid]: !prev[section.sid] }))}
           className="mb-2 flex w-full items-center justify-between text-left">
           <div className="flex items-center gap-2">
             <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 opacity-60">
               {section.label}
             </span>
             <span className="text-[11px] text-slate-400 opacity-60">
               {`· ${section.orders.length} ${pluralRu(section.orders.length, HALL_UI_TEXT.guests + 'ь', HALL_UI_TEXT.guests + 'я', HALL_UI_TEXT.guests + 'ей')} · ${section.rowCount} ${pluralRu(section.rowCount, HALL_UI_TEXT.dishes + 'о', HALL_UI_TEXT.dishes + 'а', HALL_UI_TEXT.dishes)}`}
             </span>
           </div>
           <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSubExpanded ? "rotate-180" : ""}`} />
         </button>
         {isSubExpanded && (
           <div className="opacity-60">
             {renderHallRows(section.rows, "amber")}
             <div className="border-t border-amber-100 pt-2 mt-2">
               <button type="button"
                 onClick={(e) => { e.stopPropagation(); handleOrdersAction(section.orders); }}
                 disabled={advanceMutation.isPending}
                 className="w-full rounded-lg bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60">
                 {section.bulkLabel} ({section.rowCount})
               </button>
             </div>
           </div>
         )}
       </div>
     );
   })}
   ```

3. **Remove** `setInProgressExpanded` / `inProgressExpanded` state usage from hall-mode path (but keep state variable — it is used by legacy paths at lines 640, 1251).

**Important:** `inProgressSectionRef` must still work for `scrollToSection("inProgress")`. Attach it to the first section's wrapper div.

**Verification:**
- `grep -n "HALL_UI_TEXT.inProgress" staffordersmobile.jsx` — should NOT appear in hall-mode expanded JSX (lines 2210-2225). Legacy paths (lines 640, 1251, 1229) still use it.
- `grep -n "inProgressExpanded" staffordersmobile.jsx` — should NOT appear in hall-mode lines 2210-2225 (but still in legacy paths)
- Each `inProgressSections` item renders independently with its own expand/collapse

---

## Fix 4: Add "N гостей · N блюд" dual metric to all collapsed sections (#272, SOM-S235-04)

**Problem:** Currently only НОВЫЕ section (line 2214) shows `"(N гостей · N блюд)"` in its header. ГОТОВО (line 2218) also shows it. But ВЫДАНО (line 2220) shows only `"(count)"` — no guest/dish breakdown. After Fix 3, the inProgress subsections already have it. But ВЫДАНО needs it.

**What the mockup shows for collapsed gray sections (HTML lines 296–310):**
```html
<span class="gray-badge">· 2 гостя · 3 блюда</span>
```
Every section label includes `· N гостей · N блюд`.

**What to change:**

For **ВЫДАНО** section (line 2220): replace
```jsx
`${HALL_UI_TEXT.served} (${countRows(servedRows, servedOrders.length)})`
```
with:
```jsx
`${HALL_UI_TEXT.served} (${servedOrders.length} ${pluralRu(servedOrders.length, HALL_UI_TEXT.guests + 'ь', HALL_UI_TEXT.guests + 'я', HALL_UI_TEXT.guests + 'ей')} · ${countRows(servedRows, servedOrders.length)} ${pluralRu(countRows(servedRows, servedOrders.length), HALL_UI_TEXT.dishes + 'о', HALL_UI_TEXT.dishes + 'а', HALL_UI_TEXT.dishes)})`
```

**Verification:**
- `grep -n "HALL_UI_TEXT.served" staffordersmobile.jsx` — hall-mode line should contain `pluralRu` and `guests`/`dishes`
- All section headers in hall-mode expanded area (lines 2212–2220) show `N гостей · N блюд`

---

## Fix 5: Replace "→" arrow with text action labels on intermediate-stage dish buttons (#273, SOM-S235-05)

**Problem:** In `getOrderActionMeta` (line 1910), the `rowLabel` for intermediate stages (not first, not last) is hardcoded `"→"`. This means dish buttons in ГОТОВИТСЯ sections show just an arrow instead of a descriptive label like "Готовится" or the next stage name.

**What the mockup shows (HTML lines 105–108):**
```html
<button class="dish-btn blue">Принять</button>  <!-- first stage -->
<button class="dish-btn green">Выдать</button>   <!-- last stage -->
<button class="dish-btn done">Выдано ✓</button>  <!-- served, read-only -->
```
All buttons have text labels, never just arrows.

**What to change:**

In `getOrderActionMeta` at line 1910, replace:
```js
rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : "\u2192",
```
with:
```js
rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : `→ ${nextLabel}`,
```

This uses the `nextLabel` already computed on line 1904 (`config.actionLabel` with leading "→ " stripped). The result: button shows `"→ Готовится"` or `"→ Выдать"` instead of just `"→"`.

Also note `bulkLabel` at line 1911 — currently:
```js
bulkLabel: willServe ? HALL_UI_TEXT.serveAll : config.isFirstStage ? HALL_UI_TEXT.acceptAll : `Все → ${nextLabel}`,
```
This is already correct — no change needed for `bulkLabel`.

**Verification:**
- `grep -n 'rowLabel:' staffordersmobile.jsx` — line 1910 should NOT contain standalone `"\u2192"` or `"→"` without `nextLabel`
- In renderHallRows (line 2108–2111), `row.actionLabel` will now show text like `"→ Готовится"` instead of `"→"`

---

## Fix 6: Close table reasons — single action-oriented line instead of 3 separate buttons (#274, SOM-S235-06)

**Problem:** Line 2224 renders `closeDisabledReasons.map(...)` as separate `<button>` or `<p>` elements, each on its own line:
```
Есть невыполненные запросы ›
Есть новые блюда ›
Есть блюда в работе ›
```
The mockup (line 373–376) shows a single compact hint line:
```
Чтобы закрыть стол: → выдать 1 блюдо · → оплатить 6 239 ₸
```

**What the mockup shows (HTML lines 371–378):**
```html
<div class="close-wrap">
  <button class="close-btn-disabled">Закрыть стол</button>
  <div class="close-hint">
    Чтобы закрыть стол:
    <span style="color:#ff3b30; font-weight:500;">→ выдать 1 блюдо</span> ·
    <span style="color:#ff3b30; font-weight:500;">→ оплатить 6 239 ₸</span>
  </div>
</div>
```
One line, action-oriented hints (what to DO, not what IS).

**What to change:**

First, add new keys to `HALL_UI_TEXT` dictionary (after line 341, before the closing `};`):
```js
closeHint: "Чтобы закрыть:",
closeActionRequests: "принять",
closeActionNew: "принять",
closeActionReady: "выдать",
closeActionInProgress: "дождаться",
```

Then replace the `closeDisabledReasons.map(...)` block at line 2224 (the `<div className="mt-1 space-y-0.5">` with mapped buttons/paragraphs):
```jsx
{closeDisabledReasons.length > 0 && (
  <p className="mt-1.5 text-[11px] text-slate-400 text-center leading-relaxed">
    {`${HALL_UI_TEXT.closeHint} `}
    {closeDisabledReasons.map((reason, i) => {
      const kind = reasonToKind[reason];
      const actionHint = {
        requests: `${HALL_UI_TEXT.closeActionRequests} ${tableRequests.length} запр.`,
        new: `${HALL_UI_TEXT.closeActionNew} ${newOrders.length} нов.`,
        inProgress: `${HALL_UI_TEXT.closeActionInProgress} ${inProgressOrders.length} в работе`,
        ready: `${HALL_UI_TEXT.closeActionReady} ${readyOrders.length} гот.`,
      }[kind] || reason;
      return (
        <React.Fragment key={i}>
          {i > 0 && <span> · </span>}
          <button type="button" onClick={() => scrollToSection(kind)}
            className="text-red-500 font-medium active:text-red-700">
            {`→ ${actionHint}`}
          </button>
        </React.Fragment>
      );
    })}
  </p>
)}
```

**⚠️ FROZEN UX warning:** The `closeDisabledReasons` tappable `scrollToSection` behavior MUST be preserved (tested S234, #256-SOM). Only the visual format changes from vertical list to inline.

**Verification:**
- `grep -n "Чтобы закрыть" staffordersmobile.jsx` — should appear in hall-mode close-table area
- `grep -n "scrollToSection(kind)" staffordersmobile.jsx` — must still exist in close-table area (preserved behavior)
- `grep -n "space-y-0.5" staffordersmobile.jsx` — should NOT appear in hall-mode close-table area (old vertical layout removed)

---

## MOBILE-FIRST CHECK

All UI changes target a mobile phone screen (375px width). Ensure:
- Touch targets ≥ 44px height on all tappable elements (buttons, chips, section headers)
- No horizontal overflow on 375px viewport
- Jump chips: `flex-wrap` to handle overflow on narrow screens
- Bulk buttons: `w-full` (full width) for easy thumb tap
- Text sizes: chips 11px, section headers 11px, buttons 14px

---

## SCOPE LOCK

**ALLOWED changes:**
- Hall-mode expanded area: lines 2210–2225 (section rendering)
- `getOrderActionMeta`: line 1910 (rowLabel fix)
- New `chipStyles` object near line 2075
- New jump-chip rendering in collapsed card at line 2183
- `HALL_UI_TEXT` dictionary (lines 305–343): add 5 new keys for close-hint text (Fix 6)

**FORBIDDEN changes:**
- Legacy render path 1 (lines 400–720)
- Legacy render path 2 (lines 1100–1330)
- `renderHallRows` function internals (lines 2075–2125) — FROZEN UX
- `renderHallSummaryItem` function (lines 2057–2072) — used by legacy paths
- Any data computation functions: `buildHallRows`, `getOrderActionMeta` (except line 1910 rowLabel), `hallSummaryItems`, `inProgressSections`, `closeDisabledReasons`, `countRows`
- Imports, exports, component signatures
- i18n: all new user-facing text MUST use HALL_UI_TEXT keys. New keys listed in Fix 6. Do NOT use inline Russian strings outside HALL_UI_TEXT.

**Line count expectation:** Source file is 4407 lines. Net change ≈ +20 to +40 lines. Expected final: 4427–4447 lines.

---

## REGRESSION CHECK

After all fixes, verify these still work:
1. Collapsed card: jump chips appear with correct counts and colors; tap a chip → card expands + scrolls to section
2. Expanded card sections in order: ЗАПРОСЫ → НОВЫЕ → ПРИНЯТО → ГОТОВИТСЯ → ГОТОВО К ВЫДАЧЕ → ВЫДАНО → СЧЁТ → Закрыть стол
3. Each active section: header with title + chevron, cards below, bulk button at bottom
4. Each passive section (ПРИНЯТО, ГОТОВИТСЯ, ВЫДАНО): collapsed with "N гостей · N блюд", chevron, tap to expand
5. Dish buttons: "Принять" (first stage), "→ [StageName]" (intermediate), "Выдать" (last stage)
6. Undo toast still appears after serve action
7. Close table: disabled button + single action-oriented hint line with tappable red links
8. Legacy paths (render path 1 and 2): unchanged, `renderHallSummaryItem` still called
9. `KB-095 check`: final file line count = confirmed by `wc -l`

---

## POST-TASK

After applying all fixes:
```bash
wc -l pages/StaffOrdersMobile/staffordersmobile.jsx
# Expected: 4427–4447 lines
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "SOM Phase 2: 6 UX gap fixes (jump chips, bulk bar, root sections, dual metric, button labels, close hint)"
git push
```
=== END ===


## Status
Running...
