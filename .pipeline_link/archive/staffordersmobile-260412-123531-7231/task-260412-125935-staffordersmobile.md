---
task_id: task-260412-125935-staffordersmobile
status: running
started: 2026-04-12T12:59:36+05:00
type: chain-step
page: StaffOrdersMobile
work_dir: C:/Dev/menuapp-code-review
budget_usd: 9.00
fallback_model: sonnet
version: 5.17
launcher: python-popen
---

# Task: task-260412-125935-staffordersmobile

## Config
- Budget: $9.00
- Mode: task-watcher.py launches Claude Code directly via Popen
- Fallback model: sonnet

## Prompt
---
chain: staffordersmobile-260412-123531-7231
chain_step: 3
chain_total: 4
chain_step_name: discussion-cc-only
page: StaffOrdersMobile
budget: 9.00
runner: cc
type: chain-step
---
=== CHAIN STEP: Discussion CC-Only (3/4) ===
Chain: staffordersmobile-260412-123531-7231
Page: StaffOrdersMobile

You are the Discussion moderator in a modular consensus pipeline.
Your job: resolve disputes from the Comparator step using CC analysis ONLY (no Codex calls).

WHY CC-ONLY: Codex CLI calls in discussion cause 40+ minute delays due to sandbox FS timeouts
and slow model inference. CC resolves disputes equally well based on both sets of findings.
Fallback: if this approach proves insufficient, switch chain to `consensus-with-discussion`
which uses the original `discussion.md` step with Codex participation.

INSTRUCTIONS:

1. Read the comparison report: pipeline/chain-state/staffordersmobile-260412-123531-7231-comparison.md
2. Read BOTH findings files referenced in the comparison report to understand full context.
3. Look at the "Disputes" section.

IF there are 0 disputes:
   - Write to pipeline/chain-state/staffordersmobile-260412-123531-7231-discussion.md:
     # Discussion Report — StaffOrdersMobile
     Chain: staffordersmobile-260412-123531-7231
     ## Result
     No disputes found. All items agreed or resolved by Comparator. Skipping discussion.
   - DONE. Exit immediately. Do NOT run any rounds.

IF there are 1+ disputes:
   For each dispute, write your analysis considering BOTH CC and Codex findings:

   a) Read the original code in the repository to understand the current implementation.
   b) Evaluate CC's proposed solution:
      - Correctness, edge cases, risks
   c) Evaluate Codex's proposed solution:
      - Correctness, edge cases, risks
   d) Pick the better solution OR propose a compromise, with clear reasoning.
   e) If neither solution is safe → mark as SKIP with explanation.

   IMPORTANT: Be fair. Do not automatically prefer CC's solution.
   Judge each dispute on technical merits only.

4. Write final discussion report to: pipeline/chain-state/staffordersmobile-260412-123531-7231-discussion.md

FORMAT:
# Discussion Report — StaffOrdersMobile
Chain: staffordersmobile-260412-123531-7231
Mode: CC-Only (v2)

## Disputes Analyzed
Total: N disputes from Comparator

### Dispute 1: [title]
**CC Solution:** ...
**Codex Solution:** ...
**CC Analysis:** [technical reasoning comparing both]
**Verdict:** CC / Codex / Compromise / SKIP
**Reasoning:** [1-2 sentences why]

### Dispute 2: [title]
...

## Resolution Summary
| # | Dispute | Verdict | Reasoning |
|---|---------|---------|-----------|
| 1 | Title   | CC/Codex/Compromise/SKIP | Brief reason |

## Updated Fix Plan
Based on discussion results, provide the UPDATED fix plan that the Merge step should use.
Include ONLY the disputed items — agreed items from Comparator remain unchanged.
Format same as Comparator's "Final Fix Plan":
1. [P0] Fix title — Source: discussion-resolved — Description
2. ...

## Skipped (for Arman)
Items where neither solution is safe or where the dispute cannot be resolved technically.
Each item shows both positions and why neither is sufficient.

5. Do NOT apply any fixes — only document the discussion results

=== TASK CONTEXT ===
# Feature: Implement collapsed table card (скс) — identity block + status chips (#288)

Reference: `ux-concepts/StaffOrdersMobile/GPT_SOM_CollapsedCard_S250.md`, `ux-concepts/StaffOrdersMobile/GPT_SOM_UXSpec_S250.md`, `BUGS_MASTER.md`.
Production page: https://menu-app-mvp-49a4f5b2.base44.app/staffordersmobile

**Context:** `staffordersmobile.jsx` is 4429 lines. The active `OrderGroupCard` component starts at line 1675. ⚠️ IMPORTANT: Lines 523-620 and lines 1121-~1390 are COMMENTED-OUT legacy code (inside `/* */` blocks) — do NOT modify these. Target ONLY the ACTIVE code inside `OrderGroupCard` (line 1675+).

The collapsed card header is inside `OrderGroupCard`, approximately lines 2178-2210, inside the `onClick={onToggleExpand}` div. Currently for `group.type === "table"` it shows: ownership icon (★/🔒) + compact table badge + jump chips (Запросы N, Новые N, Готово N). This layout must be replaced with a new identity block + status chips design. Jump chips move to expanded view only.

---

## HTML Mockup Reference (inline, authoritative — v13, GPT R6, S250)

**When this spec and the Fix description conflict — values below WIN.**

```css
/* ── Collapsed Card layout ── */
.card {
  min-height: 72px;
  padding: 10px 12px 10px 16px;
  border-radius: 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #fff;
}

/* ── Identity Wrapper (v11: ownership badge outside — GPT R5) ── */
/* 84px wide to accommodate badge overlap at top-left corner */
.identity-wrapper {
  position: relative;
  flex: 0 0 84px;
  width: 84px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Identity block: 78×54px (GPT R3) */
.identity {
  width: 78px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* v12 (GPT R6): 3 urgency levels — "normal/мятный" REMOVED */
.identity.danger  { background: #FFE8E5; }
.identity.warning { background: #FFF1DD; }
.identity.calm    { background: #F2F2F7; border: 1.5px solid #D9D9E0; }
/* Tappable free table: green ring = "tap to claim" affordance */
.identity.tappable { outline: 2.5px solid #34c75980; outline-offset: 3px; cursor: pointer; }

/* GPT R3: table number 26px, centered, ALWAYS dark */
.identity__table {
  font-size: 26px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #1c1c1e;  /* ALWAYS #1c1c1e — GPT R3: do NOT color by urgency */
}

/* ── Ownership badge: OUTSIDE identity block (GPT R5) ── */
/* Overlap-badge at top-left corner of wrapper — doesn't compete with number or urgency color */
.ownership-badge {
  position: absolute;
  top: -7px;
  left: -7px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid rgba(0,0,0,0.08);
  box-shadow: 0 1px 4px rgba(0,0,0,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  z-index: 2;
}
.ownership-badge.mine   { background: #FFF8E7; border-color: #FFD60A50; }
.ownership-badge.free   { background: #EAF7EE; border-color: #34c75940; }
.ownership-badge.locked { background: #f2f2f7; border-color: #d1d1d6; }

/* ── Right zone ── */
.rightZone {
  min-height: 54px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  justify-content: center;
}

/* Chips: GPT R3: height 26px, font 13px */
.chip {
  height: 26px;
  padding: 0 9px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
.chip.serve   { background: #34c75920; color: #30a14e; }
.chip.request { background: #ff3b3020; color: #ff3b30; }
.chip.new     { background: #007aff20; color: #007aff; }
.chip.work    { background: #f2f2f7;   color: #8e8e93; }
/* Longest-chip highlight */
.chip.longest.serve   { background: #34c759; color: #fff; }
.chip.longest.request { background: #ff3b30; color: #fff; }
.chip.longest.new     { background: #007aff; color: #fff; }
```

**Card HTML example** (Стол 5, danger, ownershipState='mine'):
```html
<div class="card">
  <div class="identity-wrapper">
    <div class="ownership-badge mine">★</div>
    <div class="identity danger">
      <span class="identity__table">5</span>
    </div>
  </div>
  <div class="rightZone">
    <div class="chips">
      <span class="chip serve">Готово 1 · 4м</span>
      <span class="chip request">Запросы 1 · 2м</span>
      <span class="chip longest new">Новые 2 · 23м</span>
    </div>
  </div>
</div>
```

**Card HTML example** (Стол 8, danger, фильтр «Все», чужой — badge 🔒 виден):
```html
<div class="card">
  <div class="identity-wrapper">
    <div class="ownership-badge locked">🔒</div>
    <div class="identity danger">
      <span class="identity__table">8</span>
    </div>
  </div>
  <div class="rightZone"><div class="chips">
    <span class="chip longest serve">Готово 2 · 9м</span>
    <span class="chip work">Принято 1</span>
  </div></div>
</div>
```

---

## Fix 1 — #288 (P1) [MUST-FIX]: Replace collapsed table card with identity block + status chips

### Сейчас (current behavior)
In `OrderGroupCard` (~lines 2181-2206), the `group.type === "table"` branch shows:
- Row 1: ownership icon (★/🔒) + compact badge with table number + optional zone name chip
- Row 2: `jumpChips` (computed at line 2018) rendered as colored border chips. These appear in BOTH collapsed and expanded states because the header is always visible.

### Должно быть (expected behavior)

**A. New collapsed card layout** — replace the `group.type === "table"` header branch:

```
┌──────────────────────────────────────────────────────┐
│ ★┐  ┌────────┐  [Готово 1 · 4м]  [Запросы 2 · 2м]   │
│  └─►│   22   │  [Новые 3 · 23м●]  [Принято 2]        │
│     └────────┘                                        │
│  badge  identity  chips zone (flex-wrap, right side)  │
└──────────────────────────────────────────────────────┘
● = longest-chip highlight (solid fill + white text)
★ badge = outside identity block, top-left overlap
```

**Card outer layout:** `flex items-center gap-[10px] min-h-[72px]` (replaces `space-y-2`)

**Left — identity wrapper** (`flex-shrink-0`, 84px wide, `position: relative`):

1. **Ownership badge** — rendered OUTSIDE the identity block, absolute positioned in wrapper. **ALWAYS show** based on `ownershipState` alone — do NOT add a filter check (NOTE: `assignFilters` is NOT a prop of `OrderGroupCard`, verified call-site lines 4271-4296; do NOT add new props). Filter-based badge hiding is a separate BACKLOG item:
   - `ownershipState === 'mine'`: round 26×26px badge `top-[-7px] left-[-7px]`, bg `#FFF8E7`, border `#FFD60A50`, shows ★
   - `ownershipState === 'other'`: same position, bg `#f2f2f7`, border `#d1d1d6`, shows 🔒. Render as `<button>` with `onClick={(e) => { e.stopPropagation(); showOtherTableHint(e); }}` + `aria-label={HALL_UI_TEXT.otherTableTitle}`
   - `ownershipState === 'free'`: bg `#EAF7EE`, border `#34c75940`, shows ☆

2. **Identity block** — 78×54px, `border-radius: 12px`, centered number:
   - Urgency background via inline style (see C below) — NOT Tailwind color classes (pastels not in Tailwind)
   - **Table number**: centered (`display: flex; align-items: center; justify-content: center`), `font-size: 26px`, `font-weight: 700`, `tabular-nums`, **ALWAYS `color: #1c1c1e`** — NEVER white, never colored by urgency
   - Value: `compactTableLabel` (confirmed at line 2194 in active OrderGroupCard)
   - Free table tappable: add `style={{outline: '2.5px solid #34c75980', outlineOffset: '3px'}}` when `ownershipState === 'free'`

**Right — chips zone** (`flex-1`, `display: flex; flex-wrap: wrap; gap: 6px; min-width: 0; align-content: center`):
- Show `scsChips` (see computation below) — non-zero only, fixed order
- **Chip base**: `height: 26px; padding: 0 9px; border-radius: 13px; font-size: 13px; font-weight: 600; white-space: nowrap`
- **Default style** (outline): use HALL_CHIP_STYLES-equivalent colors per tone (see HTML mockup CSS — serve/request/new/work)
  - Alternatively: reuse `HALL_CHIP_STYLES[chip.tone]` from line 351 if existing classes are close enough — CC judgment call
- **Highlighted chip** (longest actionable): `SCS_SOLID_CHIP[chip.tone]` — solid fill + white text
- **Format**:
  - Actionable (Готово/Запросы/Новые): `` `${chip.label} ${chip.count} · ${formatCompactMinutes(chip.ageMin)}` ``
  - Non-actionable (Принято/Готовится/В работе): `` `${chip.label} ${chip.count}` ``
- Chips are `<span>` (not interactive — card tap expands)
- Empty (no chips): show `{HALL_UI_TEXT.noActions}` (line 328)

**Keep unchanged:**
- `ownerHintVisible` tooltip block (lines 2199-2204) — keep it below the new layout, same as before

**B. Jump chips → expanded view only:**
- REMOVE jump chips rendering from the always-visible header area (line 2205 currently)
- ADD jump chips rendering INSIDE the expanded content block (when `isExpanded`, ABOVE the sections):
```jsx
{jumpChips.length > 0 && (
  <div className="flex flex-wrap items-center gap-1.5 pb-3">
    {jumpChips.map(chip => (
      <button key={chip.kind} type="button"
        onClick={(e) => { e.stopPropagation(); scrollToSection(chip.kind); }}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border min-h-[32px] ${HALL_CHIP_STYLES[chip.tone]}`}>
        {`${chip.label} ${chip.count}`}
      </button>
    ))}
  </div>
)}
```
Note: `setIsExpanded(true)` is dropped from onClick (already expanded). Rest unchanged (SOM-S235-01 ✅ FROZEN).

**C. Urgency color model** (identity block background — inline styles, pastels):

| Level | Condition | Inline style |
|-------|-----------|-------------|
| calm | no actionable chips | `{{background:'#F2F2F7', border:'1.5px solid #D9D9E0'}}` |
| warning | oldest actionable 3–5м | `{{background:'#FFF1DD'}}` |
| danger | oldest actionable ≥6м | `{{background:'#FFE8E5'}}` |

⚠️ "normal" level does NOT exist — removed in v12 (GPT R6). 3 levels only: calm/warning/danger.
"Oldest actionable" = max `ageMin` among Готово/Запросы/Новые chips (if any). 0–2м → calm (no urgency yet).

### НЕ должно быть
- ❌ Do NOT show jump chips in collapsed header (move to expanded only)
- ❌ Do NOT show max-wait badge (replaced by longest-chip highlight in S250)
- ❌ Do NOT show zone name chip in new collapsed header
- ❌ Do NOT use solid-color urgency backgrounds (green-500/amber-400/red-500) — pastels only
- ❌ Do NOT color table number white or by urgency — always `color: #1c1c1e`
- ❌ Do NOT put ownership icon inside identity block — badge goes OUTSIDE (in wrapper)
- ❌ Do NOT modify commented-out code blocks (lines 523-620, lines 1121-~1390)
- ❌ Do NOT change expanded card content (sections, bulk bars, inline toast)
- ❌ Do NOT change the OrderGroupCard component props or call-site

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4429 lines)
Component: `OrderGroupCard` (line 1675) — ONLY target ACTIVE code here

**Step 1 — Add helpers near line 376** (after `formatClockTime` function, line 376):
```js
function getUrgencyLevel(ageMin) {
  // v12: 3 levels only — calm/warning/danger (no "normal")
  if (!Number.isFinite(ageMin) || ageMin <= 0) return 'calm';
  if (ageMin >= 6) return 'danger';
  if (ageMin >= 3) return 'warning';
  return 'calm'; // 0–2м = calm (no urgency action needed yet)
}
const URGENCY_IDENTITY_STYLE = {
  calm:    { background: '#F2F2F7', border: '1.5px solid #D9D9E0' },
  warning: { background: '#FFF1DD' },
  danger:  { background: '#FFE8E5' },
};
const SCS_SOLID_CHIP = {
  green: 'bg-green-500 text-white border-green-500',
  red:   'bg-red-500 text-white border-red-500',
  blue:  'bg-blue-500 text-white border-blue-500',
};
```

**Step 2 — Add scsChips computation inside OrderGroupCard** (after `jumpChips` const, ~line 2025):
```js
const scsChips = useMemo(() => {
  const chips = [];
  if (readyOrders.length > 0) {
    const ageMin = getOldestAgeMinutes(readyOrders, o => o.stage_entered_at || o.created_date) || 0;
    chips.push({ key: 'ready', label: 'Готово', count: readyOrders.length, ageMin, isActionable: true, tone: 'green' });
  }
  if (tableRequests.length > 0) {
    const ageMin = getOldestAgeMinutes(tableRequests, r => r.created_date) || 0;
    chips.push({ key: 'requests', label: 'Запросы', count: tableRequests.length, ageMin, isActionable: true, tone: 'red' });
  }
  if (newOrders.length > 0) {
    const ageMin = getOldestAgeMinutes(newOrders, o => o.created_date) || 0;
    chips.push({ key: 'new', label: 'Новые', count: newOrders.length, ageMin, isActionable: true, tone: 'blue' });
  }
  inProgressSections.forEach(section => {
    if (section.rowCount > 0) {
      const label = section.sid === '__null__' ? 'В работе' : section.label;
      chips.push({ key: section.sid, label, count: section.rowCount, ageMin: 0, isActionable: false, tone: 'gray' });
    }
  });
  return chips;
}, [readyOrders, tableRequests, newOrders, inProgressSections, getOldestAgeMinutes]);

const scsOldestActionable = useMemo(() => {
  const ages = scsChips.filter(c => c.isActionable && c.ageMin > 0).map(c => c.ageMin);
  return ages.length > 0 ? Math.max(...ages) : 0;
}, [scsChips]);

const scsUrgency = getUrgencyLevel(scsOldestActionable);

const scsHighlightKey = useMemo(() => {
  const actionable = scsChips.filter(c => c.isActionable && c.ageMin > 0);
  if (actionable.length === 0) return null;
  const maxAge = Math.max(...actionable.map(c => c.ageMin));
  // Tie rule: Готово > Запросы > Новые
  for (const key of ['ready', 'requests', 'new']) {
    const chip = actionable.find(c => c.key === key && c.ageMin === maxAge);
    if (chip) return chip.key;
  }
  return actionable.find(c => c.ageMin === maxAge)?.key || null;
}, [scsChips]);
```

**Step 3 — Replace collapsed card JSX** inside OrderGroupCard (lines ~2181-2206):
- Search for: `{group.type === "table" ? (` (inside the onClick div, ~line 2181)
- Replace the `<div className="space-y-2">` block with the new layout:
  - Outer: `<div style={{display:'flex', alignItems:'center', gap:'10px', minHeight:'72px'}}>` (or Tailwind equivalent)
  - Identity wrapper: `<div style={{position:'relative', flexShrink:0, width:'84px', display:'flex', alignItems:'center', justifyContent:'flex-end'}}>` 
  - Ownership badge (absolute, top-left of wrapper, shown only when filter==='all' or equivalent)
  - Identity block: `<div style={{width:'78px', height:'54px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', ...URGENCY_IDENTITY_STYLE[scsUrgency], ...(ownershipState==='free' ? {outline:'2.5px solid #34c75980', outlineOffset:'3px'} : {})}}>`
  - Table number: `<span style={{fontSize:'26px', fontWeight:700, color:'#1c1c1e', fontVariantNumeric:'tabular-nums'}}>{compactTableLabel}</span>`
  - Right zone: chips list from `scsChips`

**Step 4 — Move jump chips** to expanded content block inside OrderGroupCard:
- Search: `{isExpanded &&` or the expanded content conditional (after line 2225)
- Add jump chips div at the TOP of the expanded content, before section renders

### Уже пробовали
First implementation — no prior attempts.

### Проверка (мини тест-кейс)
1. Open /staffordersmobile, find a table with active orders
2. **Collapsed**: Left = 84px wrapper containing 78×54px identity block. Right = status chips «Готово 1 · 4м» / «Запросы 2 · 2м» / «Новые 3 · 23м». No jump chips visible when collapsed.
3. **Urgency colors**: Table with Готово 1 · 7м → identity background #FFE8E5 (pastel pink). Table with Новые 2 · 1м → #F2F2F7 (calm, 0–2м = no urgency). Table with Новые 2 · 4м → #FFF1DD (warning).
4. **Table number**: always dark `#1c1c1e` regardless of urgency — NEVER white.
5. **Longest-chip highlight**: «Новые 3 · 23м» = solid blue fill + white text (longest actionable).
6. **Expand**: jump chips appear at top of expanded content. Sections unchanged.
7. **Lock icon**: tap on 🔒 badge (outside identity block, top-left) → shows owner hint tooltip. Card does NOT expand on this tap.

---

## FROZEN UX (DO NOT CHANGE)

The following are implemented and tested in RELEASE 260408-00. Do NOT modify:

- **Jump chips style** (SOM-S235-01 ✅): `HALL_CHIP_STYLES` line 351. Classes `bg-red-50 border-red-300 text-red-600` etc. — keep exactly. Only move render location from header → expanded view.
- **Bulk bar position** (SOM-S235-02 ✅): bulk action bar renders BELOW section cards, NOT in section header
- **Dual metric** (SOM-S235-04 ✅): collapsed sections show `«N гостей · N блюд»` format
- **Verb-first labels** (SOM-S235-05 ✅): «Принять», «В работу», «Готово», «Выдать» in OrderCard
- **Close table text** (SOM-S235-06 ✅): action-oriented format in closeDisabledReason
- **Inline toast** (SOM-S211-01 ✅): lifted to StaffOrdersMobile parent (line 2814: `// lifted from OrderGroupCard`). Do NOT move or refactor this.
- **Auto-expand В РАБОТЕ** (SOM-S208-01 ✅): `expandedSubGroups` state logic — do NOT change
- **No nested card duplicate** (SOM-S231-01 ✅): do NOT add any nested wrapper around expanded content

---

## ⛔ SCOPE LOCK — change ONLY what is described in Fix 1

- Edit ONLY `pages/StaffOrdersMobile/staffordersmobile.jsx`
- Change ONLY: (1) collapsed card header JSX in active OrderGroupCard (~2181-2206), (2) jump chips location (header → expanded), (3) add scsChips computed values (~line 2025), (4) add urgency helpers (~line 376)
- Do NOT modify: expanded card sections, bulk bars, OrderCard component, StaffOrdersMobile main component (line 2738+), any other file
- Do NOT introduce new imports (Star, Lock, useMemo already used; `formatCompactMinutes` already defined)
- Do NOT touch commented-out code blocks (lines 523-620, lines 1121-~1390)
- If you see another issue outside this scope — SKIP IT

## Implementation Notes

Files: `pages/StaffOrdersMobile/staffordersmobile.jsx` (4429 lines)

Do not read the full file. Targeted excerpts only:
- Lines 370–390: formatClockTime area (add urgency helpers here)
- Lines 2018–2045: jumpChips + ownershipState (add scsChips after jumpChips)
- Lines 2175–2230: collapsed card header + start of expanded content (main replacement)
- Find expanded content: `grep -n "isExpanded" staffordersmobile.jsx` → look for the expanded content block after line 2225

Grep verification (run before commit to confirm FROZEN UX unchanged):
- `grep -n "HALL_CHIP_STYLES" staffordersmobile.jsx` → confirm line 351 definition unchanged
- `grep -n "bulk.*bar\|section-bulk" staffordersmobile.jsx` → confirm bulk bar still below sections
- `grep -n "lifted from OrderGroupCard" staffordersmobile.jsx` → confirm comment still at line ~2814
- `grep -n "space-y-2" staffordersmobile.jsx` → should be 0 results inside active OrderGroupCard (we replaced it)
- `grep -n "bg-green-500\|bg-amber-400\|bg-red-500" staffordersmobile.jsx` → should NOT appear in identity block (pastels use inline style, not Tailwind)

## MOBILE-FIRST CHECK (MANDATORY before commit)
This is a staff mobile app, used one-handed on the go.
At 375px viewport width:
- [ ] Identity block is exactly 78×54px, wrapper 84px `flex-shrink-0` — does not compress
- [ ] Table number (26px, dark #1c1c1e) readable on ALL urgency background colors (calm/warning/danger — all pastel, all readable)
- [ ] Ownership badge (26×26px circle) does not overlap card content — badge is above/outside
- [ ] Chips wrap correctly, max 2 rows on small screens
- [ ] Overall card min-height ≥72px
- [ ] Card tap area covers full card width (unchanged)
- [ ] Lock badge tap shows hint without expanding card (`e.stopPropagation()` on badge onClick)
- [ ] No jump chips visible in collapsed state

## Regression Check (MANDATORY after implementation)
Verify these existing features still work after changes:

- [ ] **Table expansion**: tap card → expands, jump chips appear at top, sections visible
- [ ] **Jump chip navigation**: tap «Готово N» chip (in expanded) → scrolls to Готово section
- [ ] **Bulk action**: «Принять все (N)» button appears below section cards (not in header)
- [ ] **Inline toast**: after bulk serve, undo toast appears (lifted state — survives unmount)
- [ ] **Close table**: «Закрыть стол» disabled with action-oriented hint when orders pending
- [ ] **Owner hint**: tap 🔒 badge → shows tooltip, does NOT expand card

## Git
```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "feat(SOM): implement collapsed table card (скс) — identity block + status chips (#288)"
git push
```

## Self-check
Before executing, briefly list:
1. Any ambiguities in this prompt
2. Any risks that might cause you to stall (e.g. can't find the right lines, wrong comment block)
3. Your execution plan (grep first, then which steps in order)
If you see a problem, say so and propose a fix before proceeding.

## Post-task review
After completing the task, answer:
1. Rate this prompt 1-10 for clarity and executability
2. What was unclear or caused hesitation?
3. What would you change to make it faster to execute?
4. Token efficiency: Where did you spend the most tokens? Suggest specific prompt changes.
5. Speed: What information would help complete this faster?
=== END ===


## Status
Running...
