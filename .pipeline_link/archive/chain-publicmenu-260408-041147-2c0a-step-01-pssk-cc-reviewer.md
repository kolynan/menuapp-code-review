---
chain: publicmenu-260408-041147-2c0a
chain_step: 1
chain_total: 1
chain_step_name: pssk-cc-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
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

Write your findings to: pipeline/chain-state/publicmenu-260408-041147-2c0a-cc-findings.md

FORMAT:
# CC Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-041147-2c0a

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
# ПССК R3 — SOS Help Drawer v6.0 In-Place Redesign

## Context for reviewers

This is Round 3 of the ПССК review cycle.

**R1 results**: CC 3/5 + Codex 3/5
**R2 results**: CC FAIL (tokens), Codex 3/5 (4 CRITICAL, 5 MEDIUM, 2 LOW)

**Changes applied in this reviewed draft vs. R2 draft**:
1. ✅ CRITICAL #1 — FROZEN exception added: line 2130 `nonOtherTypes` MUST be updated to include plate/utensils/clear_table (PQ-077)
2. ✅ CRITICAL #2 — Legacy `menu` migration: kept in HELP_REQUEST_TYPES (backward compat) but NOT in SOS_BUTTONS grid (PQ-078)
3. ✅ CRITICAL #3 — JSX anchor corrected: actual first child is `<div className="relative">` at line 4891, NOT `flex justify-center` (PQ-079)
4. ✅ CRITICAL #4 — Multi-other display: changed from `activeRequests.find(r => r.type === 'other')` to `.filter(r => r.type === 'other').map(row => ...)` for full array support (PQ-080)
5. ✅ MEDIUM #5 — i18n key: changed `tr('help.title'...)` to `tr('help.modal_title'...)` (EN map has modal_title, not title)
6. ✅ MEDIUM #7 — isTicketExpanded verification: clarified grep expectation (keep in hook+call-sites, must NOT appear in JSX return)
7. ✅ MEDIUM #8 — Scope lock: expanded to list ALL 13 required edit regions explicitly
8. ✅ MEDIUM #9 — Grid orientation: "2-column grid (3 rows × 2 columns)" throughout
9. ✅ DrawerHeader/DrawerTitle: added to import cleanup check list

## TARGET FILE
`pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx` (5374 lines as of RELEASE 260407-00)
Note: actual wc -l may return 5375 — treat counts as approximate ±5.

## TASK BODY — Implementation Prompt to Review

=== TASK CONTEXT ===
# SOS Help Drawer v6.0 — In-Place Redesign — КС Prompt (Reviewed R3)
# ПССК R1: CC 3/5 + Codex 3/5 | R2: CC FAIL + Codex 3/5 (4C/5M/2L) — Applied all CRITICAL, key MEDIUM

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
Task: Complete redesign of Help Drawer UI — replace ticket-board + card-grid architecture with in-place state-change model. All 6 buttons always visible in a 2-column grid (3 rows × 2 columns). Each button changes state in-place (idle → active with timer → urgency colors). No separate "Мои запросы" section.
Weight: H (architectural UI redesign) | Budget: $20 | Chain: С5v2

## Precedence Rule
FROZEN behavior and server/persistence logic > this prompt's specifications > mockup visuals.
The HTML mockup wins ONLY for layout/styling inside the allowed DrawerContent area.
FROZEN areas (see below) win over everything, including mockup.

## UX Reference
UX document: `ux-concepts/HelpDrawer/260407-00 HelpDrawer UX S234 FINAL.md` (v6.0)
HTML mockup: `ux-concepts/HelpDrawer/260407-01 SOS HelpDrawer Mockup S235.html` (CONTEXT — exact target UI: classes, section order, component hierarchy, button labels, urgency colors)
DECISIONS_INDEX: §12 (Help Drawer decisions)

## FROZEN UX (DO NOT CHANGE)
These elements are tested and working — DO NOT modify:
- HelpFab button rendering and badge logic (~line 4872) — keep as-is
- `useHelpRequests` hook integration (~lines 1772-1786) — keep as-is
- ServiceRequest polling and server sync (~lines 2044-2260) — keep ALL server sync logic
  **EXCEPTION**: line 2130 — `const nonOtherTypes = ['call_waiter', 'bill', 'napkins', 'menu']` — MUST update to: `const nonOtherTypes = ['call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table'];` (add plate/utensils/clear_table, remove menu)
- localStorage persistence logic — keep key format `helpdrawer_${currentTableId}`
- pushOverlay/popOverlay integration for Android Back — keep as-is
- Undo core logic (5s delay, pendingQuickSendRef, handlePresetSelect call) — keep; only adapt UI rendering
- `handleCardTap` existing duplicate-tap guard: `if (undoToast?.type === type && undoToast?.tableId === currentTableId) return;` — DO NOT remove this guard
- All code OUTSIDE the Help Drawer section (MenuView, CartView, StickyCartBar, checkout, hall mode, etc.)

## Known-correct field names (verified in code)
- `ticketRows` objects have `.type` (added at construction: `{ ...normalized, type, id }`) — correct
- `activeRequests` = `ticketRows.filter(row => row.isActive)` — `.sentAt` is already in ms (Number(state.sentAt))
- `activeRequestCount` is already defined at ~line 1947: `useMemo(() => activeRequests.length, [activeRequests])`
- timerTick: `ticketRows` useMemo already depends on `timerTick` (~line 1944 deps) → urgency/timer auto-re-render ✅
- `requestStates.other` is an array — the data model supports multiple concurrent custom requests

---

## Fix 1 — Update button set and config constants [MUST-FIX]

### Now
4 preset buttons: `call_waiter`, `bill`, `napkins`, `menu` + separate `other` (full-width).
Grep: `HELP_REQUEST_TYPES = useMemo` (~line 1796)
Grep: `HELP_CARD_LABELS = useMemo` (~line 1800)
Grep: `HELP_COOLDOWN_SECONDS = useMemo` (~line 1799)
Grep: `HELP_CHIPS = useMemo` (~line 1807)

### Should be
6 preset buttons in grid: `call_waiter`, `bill`, `plate`, `napkins`, `utensils`, `clear_table`. Keep `menu` in HELP_REQUEST_TYPES for backward compat only (NOT in SOS_BUTTONS grid). Keep `other` for "Другой запрос?" secondary link only.

Update these constants:

```js
const HELP_REQUEST_TYPES = useMemo(() => new Set([
  'call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'other',
  'menu', // legacy — keep readable for backward compat with existing server requests; NOT shown in SOS_BUTTONS grid
]), []);

const HELP_CARD_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter', 'Позвать официанта'),
  bill: tr('help.get_bill', 'Счёт'),
  plate: tr('help.plate', 'Тарелку'),
  napkins: tr('help.napkins', 'Салфетки'),
  utensils: tr('help.utensils', 'Приборы'),
  clear_table: tr('help.clear_table', 'Убрать со стола'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

// SHORT labels for active state (no "официанта" / "со стола" — save space in active button)
const HELP_CARD_SHORT_LABELS = useMemo(() => ({
  call_waiter: tr('help.call_waiter_short', 'Позвать'),
  bill: tr('help.get_bill_short', 'Счёт'),
  plate: tr('help.plate_short', 'Тарелку'),
  napkins: tr('help.napkins_short', 'Салфетки'),
  utensils: tr('help.utensils_short', 'Приборы'),
  clear_table: tr('help.clear_table_short', 'Убрать'),
  other: tr('help.other_label', 'Другое'),
}), [tr]);

const HELP_COOLDOWN_SECONDS = useMemo(() => ({
  call_waiter: 90, bill: 150, plate: 120, napkins: 120, utensils: 120, clear_table: 120, other: 120
}), []);
```

Also update any render references that use `t('help.bill')` or `t('help.call_waiter')` directly — they should now use `HELP_CARD_LABELS.bill` etc.

Remove `HELP_CHIPS` entirely (no longer used — the chips quick-suggestion UI is removed in v6.0).

### Should NOT be
- Do NOT put `menu` in SOS_BUTTONS grid (it is kept in HELP_REQUEST_TYPES only for backward compat — legacy server requests resolve silently)
- Do NOT leave old HELP_CHIPS array

### Verification
Grep `HELP_REQUEST_TYPES` — should contain `plate`, `utensils`, `clear_table`, and `menu` (legacy).
Grep `HELP_CHIPS` in pages/PublicMenu/x.jsx — should be 0 occurrences.

---

## Fix 2 — Add urgency threshold config and helpers [MUST-FIX]

### Now
No urgency thresholds exist.

### Should be
Add constants AFTER `HELP_COOLDOWN_SECONDS` (~line 1799).

```js
// SOS v6.0: Urgency thresholds (seconds)
const HELP_URGENCY_THRESHOLDS = useMemo(() => ({
  std:  { amber: 480,  red: 900  },   // 8m / 15m
  bill: { amber: 300,  red: 600  },   // 5m / 10m
}), []);

const HELP_URGENCY_GROUP = useMemo(() => ({
  call_waiter: 'std', bill: 'bill', plate: 'std', napkins: 'std',
  utensils: 'std', clear_table: 'std', other: 'std',
}), []);
```

Add helper functions:
```js
const getHelpUrgency = useCallback((type, sentAt) => {
  if (!sentAt) return 'neutral';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  const group = HELP_URGENCY_GROUP[type] || 'std';
  const thr = HELP_URGENCY_THRESHOLDS[group];
  if (elapsedSec >= thr.red) return 'red';
  if (elapsedSec >= thr.amber) return 'amber';
  return 'neutral';
}, [HELP_URGENCY_GROUP, HELP_URGENCY_THRESHOLDS]);

const getHelpTimerStr = useCallback((sentAt) => {
  if (!sentAt) return '';
  const elapsedSec = Math.floor((Date.now() - sentAt) / 1000);
  if (elapsedSec < 60) return '<1м';
  const min = Math.floor(elapsedSec / 60);
  return `${min}м`;
}, []);
```

Note: timerTick already drives re-renders via ticketRows useMemo deps — urgency/timer text will auto-update.

### Verification
Grep `HELP_URGENCY_THRESHOLDS` in pages/PublicMenu/x.jsx — should exist.

---

## Fix 3 — Rewrite drawer JSX: header + grid + cancel confirm [MUST-FIX]

### JSX Replacement Boundary
Keep: `<Drawer open={isHelpModalOpen}` tag and all its props (~line 4889).
Keep: `<DrawerContent>` opening tag and its className/props (~line 4890: `"max-h-[85vh] rounded-t-2xl flex flex-col"`).
REPLACE: the `<div className="relative">` element at line 4891 (first child inside DrawerContent) AND ALL its children, up to (not including) `</DrawerContent>`.
Keep: `</DrawerContent>` and `</Drawer>` closing tags.
**D7 rule**: DrawerContent must NOT have `className="...relative..."` — `relative` on DrawerContent breaks Vaul. Current className is `"max-h-[85vh] rounded-t-2xl flex flex-col"` — keep this exactly, do NOT add `relative`.

Grep anchors for replacement block (verified in code):
- Start of children to replace: `<div className="relative">` — actual first child after `<DrawerContent ...>` at line 4891 (confirmed in RELEASE file)
- End of children to replace: just before `</DrawerContent>` (~line 5175)
- Strategy: replace the single `<div className="relative">` element and ALL its children up to `</DrawerContent>` with the new JSX below

### New DrawerContent children (complete, in order):

**STEP 1**: Define `SOS_BUTTONS` array and `handleSosCancel` function in the component body BEFORE the `return` statement (NOT inside JSX):

```js
// SOS v6.0: Define button config before return
const SOS_BUTTONS = [
  { id: 'call_waiter', emoji: '🙋', label: HELP_CARD_LABELS.call_waiter, shortLabel: HELP_CARD_SHORT_LABELS.call_waiter },
  { id: 'bill', emoji: '🧾', label: HELP_CARD_LABELS.bill, shortLabel: HELP_CARD_SHORT_LABELS.bill },
  { id: 'plate', emoji: '🍽️', label: HELP_CARD_LABELS.plate, shortLabel: HELP_CARD_SHORT_LABELS.plate },
  { id: 'napkins', icon: 'layers', label: HELP_CARD_LABELS.napkins, shortLabel: HELP_CARD_SHORT_LABELS.napkins },
  { id: 'utensils', emoji: '🍴', label: HELP_CARD_LABELS.utensils, shortLabel: HELP_CARD_SHORT_LABELS.utensils },
  { id: 'clear_table', emoji: '🗑️', label: HELP_CARD_LABELS.clear_table, shortLabel: HELP_CARD_SHORT_LABELS.clear_table },
];

const handleSosCancel = useCallback((type) => {
  const activeRow = activeRequests.find(r => r.type === type);
  if (!activeRow) return;
  const urgency = getHelpUrgency(type, activeRow.sentAt);
  if (urgency === 'red') {
    setCancelConfirmType(type);
  } else {
    // Immediate cancel — neutral/amber
    handleResolve(type, type === 'other' ? activeRow.id : undefined);
  }
}, [activeRequests, getHelpUrgency, handleResolve]);
```

**STEP 2**: Replace DrawerContent children with:

```jsx
{/* SOS v6.0 Drag handle pill */}
<div className="flex justify-center pt-2 pb-1">
  <div className="w-10 h-1 rounded-full bg-gray-300" />
</div>

{/* SOS v6.0 Header — one line */}
<div className="px-4 pt-2 pb-2 border-b border-slate-100">
  <div className="flex items-center justify-between">
    <span className="text-[17px] font-extrabold text-gray-900">
      {tr('help.modal_title', 'Нужна помощь?')}
    </span>
    <span className="bg-orange-500 text-white rounded-xl px-3 py-0.5 text-[13px] font-bold">
      {currentTable?.name || currentTable?.code || tr('help.table_default', 'Стол')}
    </span>
  </div>
  {activeRequestCount === 0 && (
    <p className="text-[13px] text-gray-400 mt-0.5">
      {tr('help.subtitle_choose', 'Выберите, что нужно')}
    </p>
  )}
</div>

{/* SOS v6.0 Button Grid — 2 columns, 3 rows, in-place state */}
<div className="grid grid-cols-2 gap-[9px] px-3.5 pt-2.5 pb-2">
  {SOS_BUTTONS.map(btn => {
    const activeRow = activeRequests.find(r => r.type === btn.id);
    const isActive = Boolean(activeRow);
    const sentAt = activeRow?.sentAt;
    const urgency = isActive ? getHelpUrgency(btn.id, sentAt) : 'neutral';
    const timerText = isActive ? getHelpTimerStr(sentAt) : '';

    if (isActive) {
      // Static string values in ternaries — Tailwind JIT can scan these as literal strings
      const activeBg = urgency === 'red' ? 'bg-red-50' : urgency === 'amber' ? 'bg-amber-50' : 'bg-orange-50';
      const activeBorder = urgency === 'red' ? 'border-red-500' : urgency === 'amber' ? 'border-amber-500' : 'border-orange-500';
      const labelColor = urgency === 'red' ? 'text-red-900' : urgency === 'amber' ? 'text-amber-900' : 'text-orange-800';
      const timerColor = urgency === 'red' ? 'text-red-600' : urgency === 'amber' ? 'text-amber-600' : 'text-orange-500';
      const xBg = urgency === 'red' ? 'bg-red-500/20' : urgency === 'amber' ? 'bg-amber-500/20' : 'bg-orange-500/15';
      const xColor = urgency === 'red' ? 'text-red-800' : urgency === 'amber' ? 'text-amber-800' : 'text-orange-800';
      return (
        <div key={btn.id} className={`rounded-xl border-2 ${activeBorder} ${activeBg} p-[11px] min-h-[70px] flex flex-col justify-between select-none`}>
          <div className="flex items-start justify-between">
            <span className={`text-[13px] font-extrabold ${labelColor}`}>{btn.shortLabel}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleSosCancel(btn.id); }}
              className={`w-[22px] h-[22px] rounded-full ${xBg} ${xColor} flex items-center justify-center text-[11px] font-extrabold -mt-0.5 flex-shrink-0`}
            >✕</button>
          </div>
          <div className={`text-[12px] font-bold ${timerColor} flex items-center gap-[3px] mt-1`}>
            <span className="text-[11px]">⏱</span>{timerText}
          </div>
        </div>
      );
    }

    // Idle state
    return (
      <button
        key={btn.id}
        onClick={() => handleCardTap(btn.id)}
        className="rounded-xl border-2 border-gray-200 bg-gray-50 p-[11px] min-h-[70px] flex flex-row items-center gap-[9px] select-none active:bg-gray-100 active:scale-[0.97] transition-transform"
      >
        {btn.icon === 'layers' ? (
          <Layers className="w-[22px] h-[22px] text-gray-500 flex-shrink-0" />
        ) : (
          <span className="text-xl leading-none flex-shrink-0">{btn.emoji}</span>
        )}
        <span className="text-[13px] font-bold text-gray-900 text-left leading-tight">{btn.label}</span>
      </button>
    );
  })}
</div>

{/* Cancel confirm panel — shown when red ✕ tapped */}
{cancelConfirmType && (
  <div className="mx-3.5 mb-1.5 p-3 bg-red-50 border-[1.5px] border-red-200 rounded-xl">
    <div className="text-sm font-extrabold text-red-900 mb-2.5">
      {tr('help.cancel_confirm_q', 'Отменить запрос?')}
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setCancelConfirmType(null)}
        className="flex-1 py-2 rounded-lg border-2 border-gray-200 bg-white text-sm font-bold text-gray-700"
      >{tr('help.cancel_keep', 'Оставить')}</button>
      <button
        onClick={() => {
          const row = activeRequests.find(r => r.type === cancelConfirmType);
          handleResolve(cancelConfirmType, cancelConfirmType === 'other' ? row?.id : undefined);
          setCancelConfirmType(null);
        }}
        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-bold"
      >{tr('help.cancel_do', 'Отменить')}</button>
    </div>
  </div>
)}

{/* Active custom "other" requests — iterate all (data model supports multiple) */}
{activeRequests.filter(r => r.type === 'other').map(row => (
  <div key={row.id} className="mx-3.5 mb-2 px-3 py-2 bg-orange-50 border-[1.5px] border-orange-500 rounded-[10px] flex items-center justify-between gap-2">
    <span className="text-[13px] text-orange-800 font-semibold flex-1 truncate">
      «{row.message || tr('help.other_label', 'Другое')}»
    </span>
    <span className="text-[12px] font-bold text-orange-500 whitespace-nowrap">
      ⏱ {getHelpTimerStr(row.sentAt)}
    </span>
    <button
      onClick={(e) => { e.stopPropagation(); handleResolve('other', row.id); }}
      className="w-[22px] h-[22px] rounded-full bg-orange-500/15 text-orange-800 flex items-center justify-center text-[11px] font-extrabold flex-shrink-0"
    >✕</button>
  </div>
))}

{/* "Другой запрос?" link — hide while any other request is active or form is open */}
{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
  <div className="px-3.5 pb-3">
    <button
      onClick={() => setShowOtherForm(true)}
      className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer"
    >{tr('help.other_request_link', 'Другой запрос?')}</button>
  </div>
)}

{/* Textarea form for custom "other" request */}
{showOtherForm && (
  <div className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2">
    <textarea
      autoFocus
      value={helpComment}
      onChange={(e) => setHelpComment(e.target.value.slice(0, 120))}
      maxLength={120}
      placeholder={tr('help.other_placeholder', 'Напишите, что нужно…')}
      className="w-full rounded-lg border-[1.5px] border-gray-200 p-2 text-sm min-h-[60px] resize-none focus:outline-none focus:border-orange-500 bg-white text-gray-900"
    />
    <div className="flex gap-[7px]">
      <button
        onClick={() => {
          if (!helpComment.trim()) return;
          const msg = helpComment.trim();
          if (undoToast?.timeoutId) clearTimeout(undoToast.timeoutId);
          const entryId = `other-${Date.now()}`;
          const timeoutId = setTimeout(() => {
            if (currentTableIdRef.current !== currentTableId) return;
            const now = Date.now();
            setRequestStates(prev => {
              const otherArr = Array.isArray(prev.other) ? prev.other : (prev.other ? [prev.other] : []);
              return {
                ...prev,
                other: [...otherArr, {
                  id: entryId, status: 'sending', sentAt: now,
                  lastReminderAt: null, reminderCount: 0, remindCooldownUntil: null,
                  message: msg, pendingAction: 'send', errorKind: null, errorMessage: '',
                  terminalHideAt: null, syncSource: 'local',
                }],
              };
            });
            setHelpComment(msg);
            pendingQuickSendRef.current = { type: 'other', action: 'send', rowId: entryId, message: msg };
            handlePresetSelect('other');
            setPendingHelpActionTick(v => v + 1);
            setUndoToast(prev => (prev?.timeoutId === timeoutId ? null : prev));
          }, 5000);
          setUndoToast({ type: 'other', rowId: entryId, tableId: currentTableId, message: msg, expiresAt: Date.now() + 5000, timeoutId });
          setShowOtherForm(false);
          setHelpComment('');
        }}
        className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold"
        disabled={!helpComment.trim()}
      >{tr('help.send_btn', 'Отправить')}</button>
      <button
        onClick={() => { setShowOtherForm(false); setHelpComment(''); }}
        className="py-[7px] px-3.5 rounded-lg bg-white text-gray-500 border-[1.5px] border-gray-200 text-[13px] font-semibold"
      >{tr('common.cancel', 'Отмена')}</button>
    </div>
  </div>
)}

{/* Undo toast */}
{undoToast && (
  <div className="mx-3.5 mb-3 rounded-lg bg-slate-800 text-white px-4 py-3 flex items-center justify-between text-sm">
    <span>{HELP_CARD_LABELS[undoToast.type] || undoToast.type} {t('help.sent_suffix')}</span>
    <button onClick={handleUndo} className="text-amber-300 font-medium ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
      {t('help.undo')} ({Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))})
    </button>
  </div>
)}

{/* Error display */}
{helpSubmitError && !ticketRows.some(row => row.errorKind) && (
  <div className="mx-3.5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
    {helpSubmitError}
  </div>
)}
```

### State resets — MANDATORY updates to open/close functions
In `openHelpDrawer` (~line 2264-2274):
- Remove `setIsTicketExpanded(false)` call
- Add `setCancelConfirmType(null);` to reset confirm state on open

In `closeHelpDrawer` (~line 2276-2282):
- Remove `setIsTicketExpanded(false)` call
- Add `setCancelConfirmType(null);` to reset confirm state on close
- Add `setShowOtherForm(false); setHelpComment('');` if not already present

### Should NOT be
- No DrawerHeader component (replace with custom header div)
- No centered title
- No MapPin icon line
- No "Мои запросы" / ticket board section
- No isTicketExpanded / back button (ArrowLeft) / ChevronDown close button
- No HELP_CHIPS rendering
- No "Ещё запрос" label
- Drawer closes via overlay tap or pull-down (Vaul behavior) — no explicit close button needed

### Verification
1. Open drawer → see 6 buttons in 2-column grid (3 rows × 2 columns), all idle
2. Tap "Позвать" → button changes state in-place: short label + timer row + ✕ button (orange border)
3. Tap ✕ on neutral/amber button → immediate cancel → back to idle
4. Tap ✕ on red button → inline confirm panel appears under grid
5. Tap "Другой запрос?" → textarea appears → type text → tap Отправить → row appears with timer
6. Undo toast appears for 5 seconds after any send → tap undo → request cancelled

---

## Fix 4 — Add new i18n keys to BOTH dictionaries [MUST-FIX]

### Now
I18N_FALLBACKS (~line 327) and I18N_FALLBACKS_RU (~line 588) contain old help.* keys.
(Note: I18N_FALLBACKS is at ~line 327 — always grep to confirm before editing.)

### Should be
Grep existing keys first, then add only NEW keys (don't duplicate existing).

**Add to I18N_FALLBACKS (English):**
```js
"help.get_bill": "Bill",
"help.plate": "Extra plate",
"help.utensils": "Utensils",
"help.clear_table": "Clear the table",
"help.call_waiter_short": "Call",
"help.get_bill_short": "Bill",
"help.plate_short": "Plate",
"help.napkins_short": "Napkins",
"help.utensils_short": "Utensils",
"help.clear_table_short": "Clear",
"help.subtitle_choose": "Choose what you need",
"help.table_default": "Table",
"help.cancel_confirm_q": "Cancel request?",
"help.cancel_keep": "Keep",
"help.cancel_do": "Cancel",
"help.other_request_link": "Something else?",
"help.other_placeholder": "Describe what you need…",
"help.send_btn": "Send",
"help.sent_suffix": "sent",
```

**Add to I18N_FALLBACKS_RU (Russian):**
```js
"help.get_bill": "Счёт",
"help.plate": "Тарелку",
"help.utensils": "Приборы",
"help.clear_table": "Убрать со стола",
"help.call_waiter_short": "Позвать",
"help.get_bill_short": "Счёт",
"help.plate_short": "Тарелку",
"help.napkins_short": "Салфетки",
"help.utensils_short": "Приборы",
"help.clear_table_short": "Убрать",
"help.subtitle_choose": "Выберите, что нужно",
"help.table_default": "Стол",
"help.cancel_confirm_q": "Отменить запрос?",
"help.cancel_keep": "Оставить",
"help.cancel_do": "Отменить",
"help.other_request_link": "Другой запрос?",
"help.other_placeholder": "Напишите, что нужно…",
"help.send_btn": "Отправить",
"help.sent_suffix": "отправлено",
```

Note: `help.undo`, `help.modal_title`, `help.call_waiter` etc. likely already exist — grep first, add only if absent.

### Verification
Grep `help.plate` in pages/PublicMenu/x.jsx — should exist in both dictionary blocks.
Grep `help.sent_suffix` — should exist in both blocks.

---

## Fix 5 — Clean up removed state and imports [MUST-FIX]

### CRITICAL — Hook order and call-site safety
React requires hooks to be called in the same order every render.
**PRIMARY RULE**: Do NOT simply delete useState declarations — this removes the setter from scope and breaks all call-sites.
Instead: keep the hook declaration with its original name, just add a comment:

Grep: `isTicketExpanded` (~line 1827) → `const [isTicketExpanded, setIsTicketExpanded] = useState(false);`
→ Change to: `const [isTicketExpanded, setIsTicketExpanded] = useState(false); // SOS v6.0 — no longer used in JSX`

Grep: `highlightedTicket` (~line 1826) → `const [highlightedTicket, setHighlightedTicket] = useState(null);`
→ Change to: `const [highlightedTicket, setHighlightedTicket] = useState(null); // SOS v6.0 — no longer used in JSX`

This keeps all existing call-sites (openHelpDrawer, closeHelpDrawer, ~line 2481) valid without breaking React hook order.

### New state to ADD (~line 1828-1829, after isTicketExpanded):
`const [cancelConfirmType, setCancelConfirmType] = useState(null); // SOS v6.0 cancel confirm`

### Refs to remove:
Grep: `ticketBoardRef` (~line 1825) — remove `const ticketBoardRef = useRef(null);`
**⚠️ ALSO clean up call-site at ~line 2481** (post-send server callback, inside `if (action.action === 'send')` block):
- Remove: `ticketBoardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });`
- Remove: `setHighlightedTicket(action.rowId || action.type);`
- Remove: the `setTimeout(() => setHighlightedTicket(...), 1500);` line
- Keep: `setIsTicketExpanded(false);` and `setShowOtherForm(false);` in that block

### Constants to remove:
- `HELP_CHIPS = useMemo` (~line 1807) — remove entirely
- `HELP_PREVIEW_LIMIT` (~line 1795) — remove entirely

### focusHelpRow function — grep first:
Before removing: `grep -n "focusHelpRow" pages/PublicMenu/x.jsx`
- If ALL call sites are in the old ticket board JSX being replaced → remove function definition too
- If any call site remains outside the JSX block → keep function, remove only JSX call sites

### Import cleanup:
- Check if `ChevronDown` is used elsewhere besides old help drawer close button. If only there → remove from import.
- Check if `ArrowLeft` is used elsewhere. If only in help drawer → remove.
- Check if `MapPin` is used elsewhere. If only in help drawer table info line → remove.
- Check if `DrawerHeader` and `DrawerTitle` are used elsewhere. If only in old help drawer → remove from destructured import.
- `Layers` must remain (used for napkins button in new grid).

### Should NOT be removed:
- `requestStates`, `undoToast`, `showOtherForm`, `timerTick`, `pendingQuickSendRef` — still used
- `helpComment`, `setHelpComment`, `setShowOtherForm` — still used in "other" textarea form
- `helpSubmitError` — still used in error display

### Verification
Grep `isTicketExpanded` in pages/PublicMenu/x.jsx — should appear ONLY in: (1) the placeholder `useState` declaration line with `// SOS v6.0` comment, (2) `setIsTicketExpanded(false)` in openHelpDrawer/closeHelpDrawer/post-send block. Must NOT appear in any JSX return statement.
Grep `HELP_CHIPS` — should be 0 occurrences.
Grep `cancelConfirmType` — should exist (~1 useState + usage in JSX).

---

## ⛔ SCOPE LOCK — change ONLY what is described above
- Edit ONLY `pages/PublicMenu/x.jsx`
- **Allowed edit regions** (complete list):
  1. Drawer JSX: replace `<div className="relative">` + children inside `<DrawerContent>` (~lines 4891-5174)
  2. Config constants: HELP_REQUEST_TYPES, HELP_CARD_LABELS, HELP_CARD_SHORT_LABELS (new), HELP_COOLDOWN_SECONDS (~lines 1795-1813). Remove HELP_CHIPS, HELP_PREVIEW_LIMIT.
  3. New constants: HELP_URGENCY_THRESHOLDS, HELP_URGENCY_GROUP (after HELP_COOLDOWN_SECONDS)
  4. New helpers: getHelpUrgency, getHelpTimerStr (after new constants)
  5. State declarations: add cancelConfirmType (~line 1828-1829); keep isTicketExpanded/highlightedTicket with comment; remove ticketBoardRef ref
  6. i18n dictionaries: I18N_FALLBACKS (~line 327) and I18N_FALLBACKS_RU (~line 588) — add new keys only
  7. openHelpDrawer (~line 2264-2274): remove setIsTicketExpanded(false), add setCancelConfirmType(null)
  8. closeHelpDrawer (~line 2276-2282): remove setIsTicketExpanded(false), add setCancelConfirmType(null), add setShowOtherForm(false)/setHelpComment('')
  9. Post-send callback (~line 2481): remove ticketBoardRef.scrollIntoView, setHighlightedTicket, setTimeout highlight
  10. **Server sync line 2130**: update nonOtherTypes (FROZEN exception — see FROZEN section)
  11. Component body before return: add SOS_BUTTONS array and handleSosCancel function
  12. Import cleanup: check and remove ChevronDown/ArrowLeft/MapPin/DrawerHeader/DrawerTitle if unused elsewhere; keep Layers
  13. focusHelpRow: grep call sites; remove function if ALL sites are in replaced JSX block
- DO NOT change: MenuView, CartView, StickyCartBar, CheckoutView, ModeTabs, hall mode rendering, order processing, cart logic, split-order logic
- DO NOT change: ServiceRequest polling logic (~2044-2260) EXCEPT line 2130 (see FROZEN exception)
- DO NOT change: HelpFab component (imported, separate file)
- DO NOT change: useHelpRequests hook integration
- DO NOT change: Any code related to orders, menu items, categories, DishDetail, checkout, payment

## MOBILE-FIRST CHECK (MANDATORY before commit)
Verify at 375px width:
- [ ] Drawer closes via pull-down (Vaul behavior) — no explicit close button needed
- [ ] 6-button grid fits in viewport without scroll (header ~60px + grid ~280px + footer ~120px < 85vh)
- [ ] Active button ✕ target: button tile is 70px+ tall (full tile is tappable area context)
- [ ] No duplicate visual indicators
- [ ] Undo toast visible above keyboard if textarea open

## Regression Check (MANDATORY after implementation)
- [ ] Help FAB (bell) button opens drawer correctly
- [ ] Active request count badge on FAB shows correct number
- [ ] ServiceRequest created on server after 5s undo timeout
- [ ] Undo cancels request before server send
- [ ] Android Back closes drawer (pushOverlay/popOverlay)
- [ ] Drawer reopens with correct state (localStorage restore)
- [ ] "Другой запрос?" textarea sends custom request WITH message text (not blank)
- [ ] Urgency timer and colors update without reopening drawer
- [ ] Cancel confirm appears only for red-urgency buttons
- [ ] Neutral/amber ✕ → immediate cancel (no confirm)

## FROZEN UX grep verification (run before commit)
```
grep -n "HelpFab" pages/PublicMenu/x.jsx          # must exist at ~line 4872
grep -n "pushOverlay" pages/PublicMenu/x.jsx       # must have 'help' overlay registration
grep -n "helpdrawer_" pages/PublicMenu/x.jsx       # localStorage key pattern preserved
grep -n "ServiceRequest.create" pages/PublicMenu/x.jsx  # server send preserved
grep -n "handlePresetSelect" pages/PublicMenu/x.jsx     # called in other send logic
grep -n "nonOtherTypes" pages/PublicMenu/x.jsx          # must contain plate/utensils/clear_table
```

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (~5374 lines as of RELEASE 260407-00; treat count as approximate ±5)
- Expected line count after changes: ~5374 ± 150 (removing ticket board ~200 lines, adding new grid ~180 lines, new constants ~35 lines)
- `wc -l` check BEFORE commit: if result < 5200 → ABORT, file likely truncated (KB-095)
- `tr()` for ALL new help.* i18n keys (has fallback). `t()` for existing keys used in undo toast (`help.sent_suffix`, `help.undo`) — do NOT change these to tr()
- `handleResolve` already exists — reuse for cancel. `handleCardTap` already exists — reuse for preset buttons (NOT for 'other' send — use full inline logic from Fix 3D)
- `Layers` icon import already exists (from lucide-react)
- `activeRequests`, `activeRequestCount` already defined — DO NOT redefine
- git add pages/PublicMenu/x.jsx && git commit -m "SOS v6.0: in-place help drawer redesign — 6 buttons, urgency thresholds, cancel confirm"
=== END ===
=== END ===
