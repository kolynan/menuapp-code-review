---
chain: staffordersmobile-260407-184630-5a5e
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

Write your findings to: pipeline/chain-state/staffordersmobile-260407-184630-5a5e-cc-findings.md

FORMAT:
# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: staffordersmobile-260407-184630-5a5e

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
You are a code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it). A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app. Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: read code files, run any commands, make any code changes.
✅ DO: analyze only the prompt text provided below.

Context: ROUND 2 review. This is a REVISED prompt incorporating fixes from Round 1 CC+Codex review (7 CRITICALs fixed). 6 UX gap fixes for StaffOrdersMobile hall-mode render path — jump chips (replace text summary with colored chips), bulk buttons repositioning (header → bottom), В РАБОТЕ wrapper removal (ПРИНЯТО/ГОТОВИТСЯ as root sections), dual metric in ВЫДАНО header, button text labels for intermediate stages, close-table hint reformatting.

Focus your review on: any REMAINING issues after the revisions, new issues introduced by the revisions, and any edge cases still uncovered. Rate each Fix 1–6 on clarity (1–5). Give an overall prompt score out of 10 (target is 8+).

Find issues with the PROMPT DESIGN:
1. Incorrect code snippets (wrong syntax, variable names, line numbers)
2. Missing edge cases
3. Ambiguous instructions
4. Safety risks (unintended file changes, legacy path breakage)
5. Validation: are post-fix checks sufficient?

Write your findings to: pipeline/chain-state/staffordersmobile-{CHAIN_ID}-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review Round 2
Chain: {CHAIN_ID}

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Fix Clarity Ratings
- Fix 1: N/5
...

## Overall prompt score: N/10

## Additional Risks
Any risks the prompt author may not have considered.

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===

# SOM Phase 2 — 6 UX Gap Fixes (BACKLOG #269–#274)

## CONTEXT

**File:** `pages/StaffOrdersMobile/staffordersmobile.jsx` (4407 lines)
**Target render path:** Hall-mode ONLY — the 3rd render path starting at ~line 2175.
The file has 3 render paths: legacy1 (~line 580), legacy2 (~line 1190), hall-mode (~line 2175).
ALL 6 fixes target the hall-mode path (lines 2175–2238).

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

**HALL_UI_TEXT dictionary** (lines 305–343) — existing keys used in this task:
- `requests` ("Запросы"), `new` ("Новые"), `ready` ("Готово к выдаче"), `inProgress` ("В работе"), `served` ("Выдано"), `bill` ("СЧЁТ")
- `acceptAll`, `serveAll`, `acceptRequest`, `serveRequest`
- `accept` ("Принять"), `serve` ("Выдать")
- `requestsShort` ("Запросы") — already exists at line 307
- `requestsBlocker`, `newBlocker`, `inProgressBlocker`, `readyBlocker`
- `collapse`, `show`, `hide`, `closeTable`

**NEW HALL_UI_TEXT keys to add** (Fix 6 adds these, Fix 1+3+4 use them — add ALL before writing JSX):
```js
inProgressShort: "В работе",
newShort: "Нов.",
readyShort: "Гот.",
guests: "гост",
dishes: "блюд",
closeHint: "Чтобы закрыть:",
closeActionRequests: "принять",
closeActionNew: "принять",
closeActionReady: "выдать",
closeActionInProgress: "дождаться",
```
Add these 10 keys after the last key in HALL_UI_TEXT (line 341, before `};`).

---

## FROZEN UX (DO NOT CHANGE)

These elements are tested and working. Do not modify their behavior, styling, or position:

1. **Urgency color strips** on dish rows (border-l-4 red/amber) — `renderHallRows` line 2094. ✅ Tested S234 (#255-SOM)
2. **Close table reasons as tappable buttons** with `›` → scroll to section — line 2224 `scrollToSection(kind)`. ✅ Tested S234 (#256-SOM)
3. **Per-dish single-tap action buttons** on each dish row — `renderHallRows` line 2108–2111. ✅ Tested S207 (#168-SOM)
4. **Inline undo toast** after serve action — lines 2083–2091 + 2114–2125. ✅ Tested S212
5. **Sub-grouping В РАБОТЕ** by partner stages (ПРИНЯТО/ГОТОВИТСЯ) — `inProgressSections` data structure. ✅ Tested S208
6. **Section order** Запросы→Новые→В работе→Готово→Выдано→Счёт→Закрыть — lines 2212–2224. ✅ Tested S208
7. **Collapsed card summary** (СЕЙЧАС/ЕЩЁ per-stage lines) — replaced by jump chips in Fix 1 (expected change). ✅ Tested S203
8. **Receipt icon** in bill section. ✅ Tested S207 (SOM-S203-01)
9. **Table label** without "Стол Стол" duplication. ✅ Tested S207 (SOM-S203-02)
10. **Verb-first bulk buttons** "Принять все (N)" / "Выдать все (N)". ✅ Tested S211
11. **Block B removed** (no large bottom CTA). ✅ Tested S207 (#168-SOM-BlockB)
12. **Split-order per-dish architecture** — each cart item = separate Order. ✅ Tested S231 (Decision #33)
13. **Duplicate card removed** after split-order. ✅ Tested S234 (SOM-S231-01)

---

## FIX EXECUTION ORDER

Apply fixes in this sequence to avoid conflicts:
1. **Fix 6** — add new HALL_UI_TEXT keys (all other fixes depend on them)
2. **Fix 5** — modify `getOrderActionMeta` line 1910 (shared helper, do early)
3. **Fix 4** — ВЫДАНО dual metric (simple isolated change)
4. **Fix 3** — remove В РАБОТЕ wrapper, render inProgressSections as root sections
5. **Fix 1** — add jumpChips computation + jump-bar JSX
6. **Fix 2** — move bulk buttons to bottom of card blocks (**SKIP inProgress subsections** — Fix 3 already handles them)

---

## Fix 1: Jump chips — replace text summary with colored tappable chips (#269, SOM-S235-01)

**Problem:** Line 2183 renders `hallSummaryItems.map(renderHallSummaryItem)` producing plain text buttons. The mockup shows a jump-bar with colored pill-shaped chips: `[Запросы 2] [Новые 9] [Готово 1] [Счёт 6 239 ₸]`.

**What the mockup shows (HTML lines 211–216):**
```html
<div class="jump-bar"> <!-- flex gap-8 -->
  <div class="jump-chip red">Запросы 2</div>
  <div class="jump-chip blue">Новые 9</div>
  <div class="jump-chip green">Готово 1</div>
  <div class="jump-chip gray">Счёт 6 239 ₸</div>
</div>
```
Each chip: `rounded-full px-3 py-1 text-xs font-semibold border` with color-coded bg/border/text.

**What to change:**

**Step 1 — Add `chipStyles` as a module-level constant** immediately after `HALL_UI_TEXT` (after line 343, before the next `const`):
```js
const HALL_CHIP_STYLES = {
  red:   "bg-red-50 border-red-300 text-red-600",
  blue:  "bg-blue-50 border-blue-300 text-blue-600",
  green: "bg-green-50 border-green-300 text-green-600",
  amber: "bg-amber-50 border-amber-300 text-amber-600",
  gray:  "bg-slate-100 border-slate-300 text-slate-500",
};
```

**Step 2 — Compute `jumpChips` BEFORE the JSX return, immediately after `hallSummaryItems` (line 1996):**
```js
// line 1996: const hallSummaryItems = [...].filter(Boolean);
// ADD RIGHT AFTER:
const jumpChips = [
  tableRequests.length > 0 && {
    label: HALL_UI_TEXT.requestsShort,
    count: tableRequests.length,
    kind: "requests",
    tone: "red",
  },
  newOrders.length > 0 && {
    label: HALL_UI_TEXT.newShort,
    count: countRows(newRows, newOrders.length),
    kind: "new",
    tone: "blue",
  },
  inProgressOrders.length > 0 && {
    label: HALL_UI_TEXT.inProgressShort,
    count: inProgressSections.reduce((s, sec) => s + sec.rowCount, 0),
    kind: "inProgress",
    tone: "amber",
  },
  readyOrders.length > 0 && {
    label: HALL_UI_TEXT.readyShort,
    count: countRows(readyRows, readyOrders.length),
    kind: "ready",
    tone: "green",
  },
  billData && billData.total > 0 && {
    label: HALL_UI_TEXT.bill,
    count: formatHallMoney(billData.total),
    kind: "bill",
    tone: "gray",
  },
].filter(Boolean);
```

**Step 3 — In collapsed card JSX (line 2183), replace the `hallSummaryItems.map(renderHallSummaryItem)` block** with the jump-bar:
```jsx
<div className="flex flex-wrap items-center gap-1.5 mt-1">
  {jumpChips.map(chip => (
    <button
      key={chip.kind}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(true);          // expand card first so sections mount
        scrollToSection(chip.kind);
      }}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border min-h-[32px] ${HALL_CHIP_STYLES[chip.tone]}`}
    >
      {`${chip.label} ${chip.count}`}
    </button>
  ))}
</div>
```

**DO NOT** remove `renderHallSummaryItem` function (line 2057–2072) — it is used by legacy paths at lines 537, 594, 1149, 1205.

**Verification:**
- `grep -n "renderHallSummaryItem" staffordersmobile.jsx` — must still appear at lines 537, 594, 1149, 1205, 2057 (5 occurrences in component, 4 in legacy)
- `grep -n "jumpChips" staffordersmobile.jsx` — must appear BEFORE the JSX return (near line 1996), not inside JSX
- `grep -n "HALL_CHIP_STYLES" staffordersmobile.jsx` — must appear at module level (near line 343) AND in JSX
- `grep -n "setIsExpanded(true)" staffordersmobile.jsx` — must appear in chip tap onClick

---

## Fix 2: Bulk buttons — move from section header to bottom of card block (#270, SOM-S235-02)

**⚠️ IMPORTANT — SEQUENCING:** Apply Fix 3 BEFORE Fix 2. For В РАБОТЕ subsections (line 2216 area) — **SKIP** bulk bar work in this Fix. Fix 3 already handles inProgress subsection bulk bars inside the new layout.

**Style note:** The bulk buttons change from outlined style (`border-blue-200 bg-blue-50 text-blue-700`) to filled solid style (`bg-blue-600 text-white`). This is intentional per mockup.

**What the mockup shows — section header (no button, chevron only):**
```html
<div class="section-header">
  <span class="section-title blue">Новые (4 гостя · 9 блюд)</span>
  <span class="section-chevron open">›</span>  <!-- chevron only, NO button -->
</div>
```
**Bulk bar AFTER cards:**
```html
<div class="section-bulk-bar">  <!-- border-top, padding 10px 14px -->
  <button class="section-bulk-btn blue">Принять всё (9)</button>
</div>
```

**What to change for each active section:**

**НОВЫЕ section (line 2214):**
1. In the section header `<div className="flex items-center justify-between ...">`, remove the `<button>` that calls `handleOrdersAction`. Replace with just `<ChevronDown className="w-4 h-4 text-slate-400" />` (or `<span>›</span>` if ChevronDown not imported — check existing imports first).
2. After `{renderHallRows(newRows, "blue")}`, add:
```jsx
<div className="border-t border-blue-100 pt-2 mt-2">
  <button
    type="button"
    onClick={() => handleOrdersAction(newOrders)}
    disabled={advanceMutation.isPending}
    className="w-full rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60"
  >
    {getOrderActionMeta(newOrders[0]).willServe
      ? `${HALL_UI_TEXT.serveAll} (${countRows(newRows, newOrders.length)})`
      : `${HALL_UI_TEXT.acceptAll} (${countRows(newRows, newOrders.length)})`}
  </button>
</div>
```

**ГОТОВО К ВЫДАЧЕ section (line 2218):**
Same pattern — remove button from header (add `<ChevronDown />`), add after `{renderHallRows(readyRows, "green")}`:
```jsx
<div className="border-t border-green-100 pt-2 mt-2">
  <button
    type="button"
    onClick={() => handleOrdersAction(readyOrders)}
    disabled={advanceMutation.isPending}
    className="w-full rounded-lg bg-green-600 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60"
  >
    {`${HALL_UI_TEXT.serveAll} (${countRows(readyOrders.length)})`}
  </button>
</div>
```

**ЗАПРОСЫ section (line 2212):**
The ЗАПРОСЫ section header currently contains an inline IIFE `(() => { const allNew = ...; if (allNew) return <button>acceptAll</button>; ... })()`. Replace with:
1. Header: remove the IIFE from header. Keep only title text + `<ChevronDown />`.
2. After the requests list rendering, add bulk bar at the bottom:
```jsx
{/* Bulk bar for ЗАПРОСЫ — only render if there are requests to act on */}
{tableRequests.length > 0 && (() => {
  const allNew = tableRequests.every(r => r.status === "new");
  const allAccepted = tableRequests.every(r => r.status === "accepted");
  if (!allNew && !allAccepted) return null;
  return (
    <div className="border-t border-red-100 pt-2 mt-2">
      <button
        type="button"
        onClick={allNew ? handleAcceptAllRequests : handleServeAllRequests}
        disabled={advanceMutation.isPending}
        className="w-full rounded-lg bg-red-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60"
      >
        {allNew ? `${HALL_UI_TEXT.acceptAll} (${tableRequests.length})` : `${HALL_UI_TEXT.serveAll} (${tableRequests.length})`}
      </button>
    </div>
  );
})()}
```

**В РАБОТЕ subsections:** SKIP — handled by Fix 3.

**Verification:**
- In hall-mode lines 2210–2225: no `<button>` inside section header `flex items-center justify-between` divs (only title + chevron)
- `grep -n "bg-blue-600 text-white\|bg-green-600 text-white\|bg-red-500 text-white" staffordersmobile.jsx` — confirms filled bulk bars in hall-mode area

---

## Fix 3: Remove "В РАБОТЕ" wrapper — ПРИНЯТО/ГОТОВИТСЯ become root sections (#271, SOM-S235-03)

**Problem:** Line 2216 wraps all `inProgressSections` inside a single "В РАБОТЕ" header with expand/collapse toggle. The mockup shows ПРИНЯТО and ГОТОВИТСЯ as independent root-level gray sections at the same level as НОВЫЕ/ГОТОВО.

**What the mockup shows (HTML lines 295–311):**
```html
<div class="gray-section">  <!-- ПРИНЯТО — root level, opacity 0.6 when collapsed -->
  <div class="gray-left">
    <span class="gray-title">Принято</span>
    <span class="gray-badge">· 2 гостя · 3 блюда</span>
  </div>
  <span class="chevron">›</span>
</div>
<div class="gray-section">  <!-- ГОТОВИТСЯ — root level -->
  ...
</div>
```

**What to change:**

1. **Remove** the outer В РАБОТЕ wrapper div at line 2216 — the `<div ref={inProgressSectionRef}>` with the toggle button and `inProgressExpanded` state.

2. **Replace** with direct rendering of each inProgressSections item as an independent section:
```jsx
{inProgressSections.map((section, idx) => {
  const isSubExpanded = !!expandedSubGroups[section.sid];
  return (
    <div
      key={section.sid}
      ref={idx === 0 ? inProgressSectionRef : undefined}
    >
      <button
        type="button"
        onClick={() =>
          setExpandedSubGroups(prev => ({
            ...prev,
            [section.sid]: !prev[section.sid],
          }))
        }
        className="mb-2 flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 opacity-60">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            {section.label}
          </span>
          <span className="text-[11px] text-slate-400">
            {`· ${section.orders.length} ${pluralRu(section.orders.length, "гость", "гостя", "гостей")} · ${section.rowCount} ${pluralRu(section.rowCount, "блюдо", "блюда", "блюд")}`}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 opacity-60 transition-transform ${
            isSubExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isSubExpanded && (
        <div className="opacity-60">
          {renderHallRows(section.rows, "amber")}
          <div className="border-t border-amber-100 pt-2 mt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOrdersAction(section.orders);
              }}
              disabled={advanceMutation.isPending}
              className="w-full rounded-lg bg-amber-500 text-white px-4 py-2.5 text-sm font-semibold min-h-[44px] active:scale-[0.99] disabled:opacity-60"
            >
              {`${section.bulkLabel} (${section.rowCount})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
})}
```

3. **Keep** `inProgressExpanded` state variable and `setInProgressExpanded` — they are still used by legacy paths (lines 640, 1251). Do NOT remove these from the component.

4. **Keep** `inProgressSectionRef` — used by `scrollToSection("inProgress")`. Now attached to the first subsection's wrapper div (idx === 0).

**Note on `pluralRu`:** The function `pluralRu(n, one, few, many)` is already used in the file. The exact forms used here: `"гость"/"гостя"/"гостей"` and `"блюдо"/"блюда"/"блюд"` — these are standard Russian plural forms passed directly to `pluralRu()`. This is an intentional exception to SCOPE LOCK for pluralRu arguments — the function requires 3 explicit forms and cannot use a single dictionary key. Do NOT construct via key concatenation (e.g. `HALL_UI_TEXT.guests + 'ь'` is WRONG).

**Verification:**
- `grep -n "HALL_UI_TEXT.inProgress" staffordersmobile.jsx` — should NOT appear in hall-mode JSX lines 2210–2225 (legacy paths lines 1229, 1251 still use it ✓)
- `grep -n "inProgressExpanded" staffordersmobile.jsx` — should NOT appear in hall-mode lines 2210–2225 (legacy paths still have it ✓)
- Each `inProgressSections` item renders independently with its own `expandedSubGroups` toggle

---

## Fix 4: Add "N гостей · N блюд" dual metric to ВЫДАНО section header (#272, SOM-S235-04)

**Problem:** ВЫДАНО (line 2220) shows only `"(count)"`. After Fix 3, all inProgress subsections already have dual metric. ВЫДАНО needs it too.

**What to change — ВЫДАНО section (line 2220):**

Replace:
```jsx
`${HALL_UI_TEXT.served} (${countRows(servedRows, servedOrders.length)})`
```
with:
```jsx
`${HALL_UI_TEXT.served} (${servedOrders.length} ${pluralRu(servedOrders.length, "гость", "гостя", "гостей")} · ${countRows(servedRows, servedOrders.length)} ${pluralRu(countRows(servedRows, servedOrders.length), "блюдо", "блюда", "блюд")})`
```

**NOTE:** `servedOrders.length` counts individual dish-orders, not unique guests (same as existing НОВЫЕ/ГОТОВО pattern). This is consistent with the split-order architecture and accepted as-is.

**Verification:**
- `grep -n "HALL_UI_TEXT.served" staffordersmobile.jsx` — hall-mode line should contain `pluralRu` and `"гость"` / `"блюдо"`

---

## Fix 5: Replace "→" arrow with text action labels on intermediate-stage dish buttons (#273, SOM-S235-05)

**Problem:** `getOrderActionMeta` line 1910 uses hardcoded `"\u2192"` (→) for intermediate stages, producing empty-looking buttons.

**⚠️ SHARED HELPER NOTE:** `getOrderActionMeta` is used across ALL 3 render paths. Changing `rowLabel` will also update button labels in legacy paths 1 and 2. This is intentional and acceptable — all render paths benefit from text labels. After the fix, run a quick smoke check that legacy1 (~line 630) and legacy2 (~line 1210) still render correctly (no syntax errors, buttons still appear).

**What to change — `getOrderActionMeta` at line 1910:**

Replace:
```js
rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : "\u2192",
```
with:
```js
rowLabel: willServe ? HALL_UI_TEXT.serve : config.isFirstStage ? HALL_UI_TEXT.accept : `\u2192 ${nextLabel}`,
```

`nextLabel` is already computed at line 1904 as `config.actionLabel` with any leading "→ " stripped. Result: "→ Готовится" or "→ Следующий этап" instead of just "→".

`bulkLabel` at line 1911 remains unchanged — it already has text labels.

**Verification:**
- `grep -n 'rowLabel:' staffordersmobile.jsx` — line 1910 must NOT contain standalone `"\u2192"` or `"→"` without `nextLabel`
- Smoke check: legacy1 section (~line 630) and legacy2 section (~line 1210) still render without errors

---

## Fix 6: Close table reasons — single action-oriented inline hint (#274, SOM-S235-06)

**Problem:** Line 2224 renders `closeDisabledReasons.map(...)` as separate vertical elements. The mockup shows a single compact inline hint line.

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

**Step 1 — Add new keys to HALL_UI_TEXT** (as listed in NEW KEYS section above at top of this prompt).

**Step 2 — Replace the `closeDisabledReasons.map(...)` block at line 2224** (the `<div className="mt-1 space-y-0.5">` with mapped buttons/paragraphs):
```jsx
{closeDisabledReasons.length > 0 && (
  <p className="mt-1.5 text-[11px] text-slate-400 text-center leading-relaxed">
    {`${HALL_UI_TEXT.closeHint} `}
    {closeDisabledReasons.map((reason, i) => {
      const kind = reasonToKind[reason];
      const countMap = {
        requests: `${tableRequests.length} запр.`,
        new: `${newOrders.length} нов.`,
        inProgress: `${inProgressOrders.length} в работе`,
        ready: `${readyOrders.length} гот.`,
      };
      const actionMap = {
        requests: HALL_UI_TEXT.closeActionRequests,
        new: HALL_UI_TEXT.closeActionNew,
        inProgress: HALL_UI_TEXT.closeActionInProgress,
        ready: HALL_UI_TEXT.closeActionReady,
      };
      const actionText = actionMap[kind]
        ? `${actionMap[kind]} ${countMap[kind] || ""}`
        : reason;
      return (
        <>
          {i > 0 && <span key={`sep-${i}`}> · </span>}
          <button
            key={kind || i}
            type="button"
            onClick={() => scrollToSection(kind)}
            className="text-red-500 font-medium active:text-red-700"
          >
            {`→ ${actionText}`}
          </button>
        </>
      );
    })}
  </p>
)}
```

**NOTE on bill blocker:** `closeDisabledReasons` (lines 2019–2027) does NOT include a bill-related reason — so a "→ оплатить" hint will never appear from this logic. The mockup example is illustrative only. This is expected and correct behavior.

**⚠️ FROZEN UX:** `scrollToSection(kind)` on each reason button MUST be preserved — this behavior was tested in S234 (#256-SOM).

**NOTE on React.Fragment:** Use the `<>...</>` shorthand fragment (no import needed). Do NOT use `React.Fragment` with explicit key — use separate `key` on the `<button>` and `<span>` elements instead (as shown above).

**Verification:**
- `grep -n "closeHint\|Чтобы закрыть" staffordersmobile.jsx` — must appear in hall-mode close area
- `grep -n "scrollToSection(kind)" staffordersmobile.jsx` — must still appear in close area (preserved behavior)
- `grep -n "space-y-0.5" staffordersmobile.jsx` — should NOT appear in hall-mode close area (old layout removed)

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

**SHARED HELPERS — INTENTIONALLY ALLOWED in this task:**
- `HALL_UI_TEXT` dictionary (lines 305–343): add 10 new keys as listed above (Fix 6 step 1)
- `getOrderActionMeta` (line 1910 ONLY): change `rowLabel` assignment — this affects all 3 render paths (intended, see Fix 5 note)

**FORBIDDEN changes:**
- Legacy render path 1 (lines 400–720) — do NOT modify existing JSX
- Legacy render path 2 (lines 1100–1330) — do NOT modify existing JSX
- `renderHallRows` function internals (lines 2075–2125) — FROZEN UX
- `renderHallSummaryItem` function (lines 2057–2072) — used by legacy paths (537, 594, 1149, 1205)
- Any other data computation functions: `buildHallRows`, `hallSummaryItems`, `inProgressSections`, `closeDisabledReasons`, `countRows`, `reasonToKind`
- Imports, exports, component signatures
- i18n: ALL new user-facing text MUST use HALL_UI_TEXT keys. No inline Russian strings outside HALL_UI_TEXT. All new keys are listed in the NEW KEYS section above.

**Line count expectation:** Source file is 4407 lines. Net change ≈ +20 to +45 lines. Expected final: 4427–4452 lines (use as rough reference only — behavior verification is the real acceptance criterion).

---

## REGRESSION CHECK

After all fixes, verify these work:

1. **Collapsed card:** jump chips appear with correct counts and colors; tap a chip → card expands AND scrolls to that section
2. **Expanded card sections in order:** ЗАПРОСЫ → НОВЫЕ → ПРИНЯТО → ГОТОВИТСЯ → ГОТОВО К ВЫДАЧЕ → ВЫДАНО → СЧЁТ → Закрыть стол
3. **Active sections (ЗАПРОСЫ, НОВЫЕ, ГОТОВО):** header = title + chevron only (no button), dish cards below, full-width filled bulk button at the very bottom
4. **Passive sections (ПРИНЯТО, ГОТОВИТСЯ, ВЫДАНО):** collapsed with "N гостей · N блюд", chevron, tap to expand; bulk bar inside expanded area
5. **Dish buttons:** "Принять" (first stage), "→ [StageName]" (intermediate), "Выдать" (last stage)
6. **Undo toast** still appears after serve action — tap Выдать → toast "Выдан ✓ | Отменить"
7. **Close table:** disabled button + single inline action hint with tappable red links → scrollToSection works
8. **Legacy paths:** render path 1 (~line 580) and path 2 (~line 1190) render without errors; `renderHallSummaryItem` still called (4 usages in legacy); `inProgressExpanded` toggle still works in legacy

---

## POST-TASK

After applying all fixes:
```bash
# Check line count (rough reference)
wc -l pages/StaffOrdersMobile/staffordersmobile.jsx
# Expected: 4427–4452

# Verify renderHallSummaryItem not removed (must have 5+ occurrences)
grep -c "renderHallSummaryItem" pages/StaffOrdersMobile/staffordersmobile.jsx

# Verify jumpChips before JSX return
grep -n "jumpChips" pages/StaffOrdersMobile/staffordersmobile.jsx

# Verify HALL_CHIP_STYLES at module level
grep -n "HALL_CHIP_STYLES" pages/StaffOrdersMobile/staffordersmobile.jsx

# Verify close hint
grep -n "closeHint\|Чтобы закрыть" pages/StaffOrdersMobile/staffordersmobile.jsx

# Verify rowLabel fix
grep -n "rowLabel:" pages/StaffOrdersMobile/staffordersmobile.jsx

git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "SOM Phase 2: 6 UX gap fixes (jump chips, bulk bar, root sections, dual metric, button labels, close hint)"
git push
```

=== END ===
=== END ===
