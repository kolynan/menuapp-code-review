---
chain: staffordersmobile-260331-225506-fac7
chain_step: 2
chain_total: 4
chain_step_name: comparator
page: StaffOrdersMobile
budget: 7.50
runner: cc
type: chain-step
---
=== CHAIN STEP: Comparator (2/4) ===
Chain: staffordersmobile-260331-225506-fac7
Page: StaffOrdersMobile

You are the Comparator in a modular consensus pipeline.
Your job: compare CC Writer and Codex Writer findings and produce a merge plan.

INSTRUCTIONS:
1. Read CC findings: pipeline/chain-state/staffordersmobile-260331-225506-fac7-cc-findings.md
   - If NOT found there, try: `git pull --rebase` then check again
   - If still not found, search for any *-cc-findings.md in pipeline/chain-state/
2. Read Codex findings: pipeline/chain-state/staffordersmobile-260331-225506-fac7-codex-findings.md
   - If NOT found there, search in pages/StaffOrdersMobile/review_*.md (Codex sometimes writes here)
   - If still not found, search for any *-codex-findings.md in pipeline/chain-state/
3. Compare both analyses and categorize:

Write comparison to: pipeline/chain-state/staffordersmobile-260331-225506-fac7-comparison.md

FORMAT:
# Comparison Report — StaffOrdersMobile
Chain: staffordersmobile-260331-225506-fac7

## Agreed (both found)
Items found by both CC and Codex — HIGH confidence, apply all.

## CC Only (Codex missed)
Items found only by CC — evaluate validity, include if solid.

## Codex Only (CC missed)
Items found only by Codex — evaluate validity, include if solid.

## Disputes (disagree)
Items where CC and Codex disagree — explain reasoning, pick best solution.

## Final Fix Plan
Ordered list of all fixes to apply, with priority and source:
1. [P0] Fix title — Source: agreed/CC/Codex — Description of change
2. ...

## Summary
- Agreed: N items
- CC only: N items (N accepted, N rejected)
- Codex only: N items (N accepted, N rejected)
- Disputes: N items
- Total fixes to apply: N

4. Do NOT apply any fixes yet — only document the comparison

=== TASK CONTEXT ===
# SOM-UX-23: Collapsed card redesign — per-stage lines with age

Reference:
- `ux-concepts/staff-orders-mobile.md` v2.2, Решение #23 (FINAL)
- `ux-concepts/StaffOrdersMobile/GPT_SOM_UX_S210.md`
- `BUGS_MASTER.md` #164-SOM (✅ Tested — existing summary, DO NOT REVERT)

Target file: `pages/StaffOrdersMobile/staffordersmobile.jsx` (~4133 lines)

---

## Fix 1 — SOM-UX-23 (P1) [MUST-FIX]: Collapsed card Row 3 — replace СЕЙЧАС/ЕЩЁ with per-stage lines

### Сейчас
Row 3 of the collapsed table card (~lines 1688-1708) shows:
```
СЕЙЧАС: 2 новых · 1 выдать · 🧾 Счёт
ЕЩЁ: 3 готовится · 232,37 ₸
```
Problems:
- «СЕЙЧАС/ЕЩЁ» labels are noise — waiter doesn't need label names
- Sum (total amount) is irrelevant to waiter action
- No per-line age — waiter can't tell urgency without opening the card
- Hardcoded «новых/готовится» stage names — breaks with custom partner stages

### Должно быть
Replace Row 3 with a list of per-stage lines. Each line:
```
[count] [stage_name]  · [age_мин]
```

Example with custom stages (Новый → Принято → Готовится → Выдан гостю):
```
2 запроса    · 2 мин   ← red (requests >3 min = red)
2 Готовится  · 7 мин   ← amber (orders 5-15 min = amber)
1 новый      · 5 мин   ← amber
```

**Line ordering (most urgent first):**
1. Requests (запросы) — always first if count > 0
2. Finish-stage orders (готово к выдаче / isFinishStage=true) — highest urgency
3. Mid-stage orders (в работе / !isFirst && !isFinish) — middle
4. First-stage orders (новые / isFirstStage=true) — last

**Color per line (age-based):**
- Requests: neutral if <3 min · `text-red-600` if ≥3 min (more aggressive, service priority)
- Orders: neutral `text-slate-700` if <5 min · `text-amber-600` if 5-15 min · `text-red-600` if >15 min

**stage_name:**
Use `config.label` from `getStatusConfig(order)` — this is the CURRENT stage label (dynamic, from OrderStage). Do NOT hardcode «новых», «готовится» etc.

**Age calculation per stage:**
Use `order.stage_entered_at || order.created_date` as timestamp — `stage_entered_at` = when order entered current stage; fallback to `created_date` if field absent.
For a stage group with multiple orders: use the OLDEST timestamp (longest wait).
Age = `Math.floor((Date.now() - oldestTimestamp) / 60000)` in minutes.

**show_in_summary (pre-#218 fallback):**
B44 field `show_in_summary` on OrderStage does not yet exist (pending task #218 PartnerOrderProcess).
For now: show ALL stages that have active orders.
When #218 is done: filter by `config.show_in_summary !== false` (undefined = show by default).
Implementation: `const showStage = (cfg) => cfg.show_in_summary !== false;` — when field is absent, undefined !== false = true → all stages shown. This is forward-compatible with #218.

### Implementation

**Step 1: Add `summaryLines` computed value** (add near existing newCount/serveCount/inProgressCount declarations, ~line 1585):

```jsx
// SOM-UX-23: per-stage lines for collapsed card
const summaryLines = useMemo(() => {
  const lines = [];

  // 1. Request line (always first, if any active requests)
  if (tableRequests.length > 0) {
    const oldestReq = Math.min(...tableRequests.map(r => safeParseDate(r.created_date).getTime()));
    const ageMin = Math.floor((Date.now() - oldestReq) / 60000);
    lines.push({ type: 'request', count: tableRequests.length, ageMin, label: null });
  }

  // 2. Group active orders by stage
  const stageMap = new Map(); // stageKey → { label, orders, isFirst, isFinish }
  activeOrders.forEach(order => {
    const cfg = getStatusConfig(order);
    // show_in_summary pre-#218: show all stages (cfg.show_in_summary !== false)
    if (cfg.show_in_summary === false) return;
    const key = order.stage_id ? getLinkId(order.stage_id) : (cfg.derivedNextStatus || '__nostage');
    if (!stageMap.has(key)) {
      stageMap.set(key, { label: cfg.label, orders: [], isFirst: cfg.isFirstStage, isFinish: cfg.isFinishStage });
    }
    stageMap.get(key).orders.push(order);
  });

  // Sort: finish > mid > first (most urgent first)
  const sorted = [...stageMap.values()].sort((a, b) => {
    if (a.isFinish && !b.isFinish) return -1;
    if (!a.isFinish && b.isFinish) return 1;
    if (!a.isFirst && b.isFirst) return -1;
    if (a.isFirst && !b.isFirst) return 1;
    return 0;
  });

  sorted.forEach(({ label, orders }) => {
    const oldestTs = Math.min(...orders.map(o => safeParseDate(o.stage_entered_at || o.created_date).getTime()));
    const ageMin = Math.floor((Date.now() - oldestTs) / 60000);
    lines.push({ type: 'stage', count: orders.length, ageMin, label });
  });

  return lines;
}, [activeOrders, tableRequests, getStatusConfig]);

// Color helper for summary lines
const getSummaryLineColor = (type, ageMin) => {
  if (type === 'request') return ageMin >= 3 ? 'text-red-600' : 'text-slate-700';
  if (ageMin >= 15) return 'text-red-600';
  if (ageMin >= 5) return 'text-amber-600';
  return 'text-slate-700';
};
```

**Step 2: Replace Row 3 JSX** (~lines 1688-1708, the entire СЕЙЧАС/ЕЩЁ block):

Replace:
```jsx
{/* Row 3: status summary (СЕЙЧАС / ЕЩЁ) */}
{(newCount > 0 || serveCount > 0 || requestBadges.length > 0) && (
  <div className="text-sm text-slate-700 leading-snug">
    <span className="font-semibold">{'\u0421\u0415\u0419\u0427\u0410\u0421: '}</span>
    {[
      newCount > 0 && `${newCount} \u043D\u043E\u0432\u044B\u0445`,
      serveCount > 0 && `${serveCount} \u0432\u044B\u0434\u0430\u0442\u044C`,
      ...requestBadges.map(b => b.type === 'bill' ? '\uD83E\uDDFE \u0421\u0447\u0451\u0442' : b.type === 'waiter' ? '\uD83D\uDCDE \u041E\u0444\u0438\u0446\u0438\u0430\u043D\u0442' : '\u2757 \u0417\u0430\u043F\u0440\u043E\u0441'),
    ].filter(Boolean).join(' \u00B7 ')}
  </div>
)}
{inProgressCount > 0 && (
  <div className="text-sm text-slate-500 leading-snug">
    <span className="font-semibold">{'\u0415\u0429\u0401: '}</span>
    {`${inProgressCount} \u0433\u043E\u0442\u043E\u0432\u0438\u0442\u0441\u044F`}
    {billData && billData.total > 0 && ` \u00B7 ${billData.total.toLocaleString()} \u20B8`}
  </div>
)}
{newCount === 0 && serveCount === 0 && requestBadges.length === 0 && inProgressCount === 0 && (
  <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
)}
```

With:
```jsx
{/* Row 3: per-stage summary lines (SOM-UX-23) */}
{summaryLines.length > 0 ? (
  <div className="space-y-0.5 mt-0.5">
    {summaryLines.map((line, idx) => {
      const colorClass = getSummaryLineColor(line.type, line.ageMin);
      const reqWord = line.count === 1 ? '\u0437\u0430\u043F\u0440\u043E\u0441' : line.count < 5 ? '\u0437\u0430\u043F\u0440\u043E\u0441\u0430' : '\u0437\u0430\u043F\u0440\u043E\u0441\u043E\u0432';
      const countLabel = line.type === 'request'
        ? `${line.count} ${reqWord}`
        : `${line.count} ${line.label}`;
      return (
        <div key={idx} className={`text-xs ${colorClass} flex items-center gap-1 leading-snug`}>
          <span className="font-medium">{countLabel}</span>
          <span className="text-slate-300">\u00B7</span>
          <span>{`${line.ageMin} \u043C\u0438\u043D`}</span>
        </div>
      );
    })}
  </div>
) : (
  <div className="text-xs text-slate-400">{'\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432'}</div>
)}
```

### НЕ должно быть
- Do NOT keep «СЕЙЧАС:» or «ЕЩЁ:» labels — remove completely
- Do NOT show sum (total_amount / billData.total) in Row 3 — remove completely
- Do NOT hardcode stage names («новых», «готовится») — use config.label
- Do NOT remove Row 1 (identifier + elapsed clock) or Row 2 (channel + status) — FROZEN
- Do NOT change requestBadges — the variable can stay (used for backward compat), but Row 3 render replaces it
- Do NOT change the existing newCount / serveCount / inProgressCount variables if they are used elsewhere in the file — check with grep before removing

### Файл и локация
File: `pages/StaffOrdersMobile/staffordersmobile.jsx`
Component: `TableCard` (~line 1300)
Add `summaryLines` useMemo: after `inProgressCount` declaration (~line 1588)
Replace Row 3: search `{/* Row 3: status summary (СЕЙЧАС / ЕЩЁ) */}` (~line 1688)

Grep before touching:
```bash
grep -n "newCount\|serveCount\|inProgressCount\|requestBadges" pages/StaffOrdersMobile/staffordersmobile.jsx
```
If any of these variables appear OUTSIDE lines 1688-1708 — keep them, only remove from Row 3 render.

### Уже пробовали
First time — new feature. No failure history.

### Проверка
1. Open /staffordersmobile → find table with active orders in НОВЫЕ → collapsed card shows:
   `1 новый · N мин` (no «СЕЙЧАС», no sum)
2. Find table with requests + in-progress orders → collapsed card shows:
   ```
   1 запрос   · N мин
   2 Готовится · N мин
   1 новый     · N мин
   ```
3. Age >15 min → `text-red-600` (red color)
4. Age 5-15 min → `text-amber-600` (amber color)
5. Age <5 min → `text-slate-700` (neutral)
6. Request line always appears FIRST (above stage lines)

---

## ⛔ SCOPE LOCK — менять ТОЛЬКО Row 3 collapsed card

- Modify ONLY: `summaryLines` computed value (new) + `getSummaryLineColor` helper (new) + Row 3 JSX (replace)
- Do NOT change Row 1 (identifier + elapsed time clock) — FROZEN
- Do NOT change Row 2 (channel + statusLabel + needsAction + contacts + favorite) — FROZEN
- Do NOT change anything in the EXPANDED section — FROZEN
- Do NOT change `handleBatchAction`, `computeTableStatus`, `getStatusConfig` — FROZEN
- Do NOT change verb-first button labels (Fix 1 SOM-S210-01, just applied) — FROZEN

## FROZEN UX (DO NOT CHANGE)

- **Row 1** — `{identifier}` + `{elapsedLabel}` with Clock icon (~line 1636-1644) — FROZEN (#164 ✅ Tested S203)
- **Row 2** — channel + statusLabel + needsAction dot + contacts + favorite star (~line 1647-1686) — FROZEN
- **Expanded section** — ALL sections (requests, НОВЫЕ, ГОТОВО К ВЫДАЧЕ, В РАБОТЕ with sub-groups) — FROZEN
- **Sub-grouping В РАБОТЕ** — expandedSubGroups, auto-expand first group — FROZEN (SOM-S208-01 ✅ Tested S210)
- **Inline action buttons** — per-row → Принято/Готовится/Выдать — FROZEN (#168 ✅ Tested S207)
- **Group header buttons** — «Принять все»/«Выдать все» — FROZEN (#5 ✅ Tested S207)
- **Verb-first per-card buttons** — «Принять всё (N)»/«Выдать всё (N)» — FROZEN (SOM-S210-01, just applied S211)
- **Close table blocking** — disabled + explanation text — FROZEN (#173 ✅ Tested S208)
- **Service requests expanded** — ЗАПРОСЫ block, «Выполнено» button — FROZEN (#167 ✅ Tested S203)

## Implementation Notes

- All new Russian strings → `\uXXXX` unicode escapes (codebase convention)
- `safeParseDate` helper already exists in file (search `function safeParseDate`)
- `getLinkId` helper already exists (search `getLinkId`)
- `getStatusConfig` is available via closure in TableCard component
- `tableRequests` already computed at ~line 1414-1418
- `activeOrders` already computed (search `const activeOrders`)

**E3 FROZEN UX grep verification — run BEFORE committing:**
```bash
# Row 1 must remain intact (identifier + elapsedLabel + Clock icon)
grep -n "elapsedLabel\|Clock.*icon\|lucide.*Clock" pages/StaffOrdersMobile/staffordersmobile.jsx | head -5

# handleBatchAction must NOT be modified
grep -n "handleBatchAction" pages/StaffOrdersMobile/staffordersmobile.jsx | wc -l
# Expected: same count as before (typically 6-8 lines)

# СЕЙЧАС / ЕЩЁ labels must be GONE from Row 3 after fix
grep -n "СЕЙЧАС\|\u0421\u0415\u0419\u0427\u0410\u0421\|ЕЩЁ\|\u0415\u0429\u0401" pages/StaffOrdersMobile/staffordersmobile.jsx
# Expected: 0 results in Row 3 area (~lines 1688-1730)
```

## MOBILE-FIRST CHECK (MANDATORY before commit)

This is a mobile-first restaurant app. Verify at 375px width:
- [ ] Each summary line fits on one row (no text overflow)
- [ ] Long stage names truncate gracefully (max 1 line)
- [ ] Color contrast: amber/red readable on white bg
- [ ] At least 1-2 lines always visible (no overflow clip)
- [ ] Touch target Row 1 (tap to expand) unchanged ≥44px

## Regression Check (MANDATORY after implementation)

- [ ] Tap collapsed card → expands correctly
- [ ] Row 1 shows table name + elapsed time (Clock icon unchanged)
- [ ] Row 2 shows channel type + status label unchanged
- [ ] Expanded sections: ЗАПРОСЫ / НОВЫЕ / ГОТОВО К ВЫДАЧЕ / В РАБОТЕ all render
- [ ] Group header «Принять все» / «Выдать все» unchanged
- [ ] Per-card «Принять всё (N)» / «Выдать всё (N)» unchanged (SOM-S210-01 not reverted)
- [ ] computeTableStatus card border colors unchanged (green=ready, amber=in-progress, etc.)

## Git

```bash
git add pages/StaffOrdersMobile/staffordersmobile.jsx
git commit -m "feat(SOM): collapsed card per-stage lines with age (SOM-UX-23)"
```

---
⚠️ DRAFT — needs prompt-checker before moving to queue/
⚠️ Dependency: `show_in_summary` field pending #218 (B44 PartnerOrderProcess). Pre-#218: all stages shown. After #218: filter via `cfg.show_in_summary !== false`.
=== END ===
