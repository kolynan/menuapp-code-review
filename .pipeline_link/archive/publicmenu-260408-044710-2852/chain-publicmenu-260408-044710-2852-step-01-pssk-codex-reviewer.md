---
chain: publicmenu-260408-044710-2852
chain_step: 1
chain_total: 1
chain_step_name: pssk-codex-reviewer
chain_group: reviewers
chain_group_size: 2
page: PublicMenu
budget: 5.00
runner: codex
type: chain-step
---
You are a Codex code reviewer evaluating the QUALITY of a КС implementation prompt (NOT executing it).

A КС prompt is an instruction document for Claude Code + Codex pipeline to fix code in a React/Base44 app.
Your role: find issues with the PROMPT DESIGN that could cause the execution to fail, produce wrong results, or require clarification.

⛔ DO NOT: run any commands, make any code changes, modify files.
✅ DO: analyze the prompt text AND read the target source file to verify code snippets, line numbers, function signatures, and field names.

To verify the prompt's code references:
1. Read the RELEASE file named in the prompt (e.g. `pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx`)
2. Grep for specific function names, variable names, and line numbers mentioned in the prompt
3. Check that code snippets in the prompt match actual code (correct field names, function signatures, etc.)

For each issue: [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: what to change in the prompt.

Focus on:
- Incorrect code snippets in the prompt (wrong syntax, wrong function calls, wrong variable names) — verify against actual code
- Missing edge cases the prompt doesn't cover
- Ambiguous instructions Codex might misinterpret
- Safety risks: will this cause unintended file changes?
- Missing context: what info would help Codex execute without hesitation?
- Fix order: are there dependencies between fixes that need explicit sequencing?
- Validation: are the post-fix verification steps sufficient?
- Line numbers: verify all ~line N references against the actual file

Write your findings to: pipeline/chain-state/publicmenu-260408-044710-2852-codex-findings.md

FORMAT:
# Codex Reviewer Findings — ПССК Prompt Quality Review
Chain: publicmenu-260408-044710-2852

## Issues Found
1. [CRITICAL/MEDIUM/LOW] Title — Description. PROMPT FIX: ...
2. ...

## Summary
Total: N issues (X CRITICAL, Y MEDIUM, Z LOW)

## Additional Risks
Any risks the prompt author may not have considered.

## Prompt Clarity (MANDATORY — do NOT skip)
- Overall clarity: [1-5]
- What was most clear:
- What was ambiguous or could cause hesitation:
- Missing context:

Do NOT apply any fixes to code files. Analysis only.

=== TASK CONTEXT ===
# ПССК R4 — SOS v6.0 In-Place — R3 Codex 3/5 (4C fixed). Read code: pages/PublicMenu/260407-00 PublicMenu x RELEASE.jsx
# ПССК R1: CC 3/5 + Codex 3/5 | R2: CC FAIL + Codex 3/5 (4C) | R3: CC FAIL + Codex 3/5 (4C) — All fixed

## Context
File: pages/PublicMenu/x.jsx (TARGET — edit this file ONLY)
Task: Complete redesign of Help Drawer UI — replace ticket-board + card-grid architecture with in-place state-change model. All 6 buttons always visible in a 2-column grid (3 rows × 2 columns). Each button changes state in-place (idle → active with timer → urgency colors). No separate "Мои запросы" section.
Weight: H (architectural UI redesign) | Budget: $20 | Chain: С5v2

## Precedence Rule
FROZEN behavior and server/persistence logic > this prompt's specifications > mockup visuals.
The HTML mockup wins ONLY for layout/styling inside the allowed DrawerContent area.
FROZEN areas (see below) win over everything, including mockup.

## UX Reference (inline — no external files needed)
**Target UI**: 2-column grid (3 rows × 2 columns) with 6 preset buttons always visible. Each changes state in-place: idle (gray border, emoji+label) → active (colored border, short label + timer + ✕) → urgency escalation (neutral→amber→red by elapsed time). No separate "Мои запросы" section. Undo toast 5s after send. Cancel confirm only for red-urgency ✕.
**6 buttons**: call_waiter (🙋), bill (🧾), plate (🍽️), napkins (Layers icon), utensils (🍴), clear_table (🗑️). "Другой запрос?" = secondary text link below grid.
**Urgency thresholds**: standard 8m amber / 15m red; bill 5m amber / 10m red. Colors: neutral=orange-50/500, amber=amber-50/500, red=red-50/500.
**Error state**: active tile with errorKind → red border, "⚠" icon, tap = retry. Generic helpSubmitError block preserved below grid.

## FROZEN UX (DO NOT CHANGE)
These elements are tested and working — DO NOT modify:
- HelpFab button rendering and badge logic (~line 4872) — keep as-is
- `useHelpRequests` hook integration (~lines 1772-1786) — keep as-is
- ServiceRequest polling and server sync (~lines 2044-2260) — keep ALL server sync logic
  **EXCEPTION**: line 2130 — `const nonOtherTypes = ['call_waiter', 'bill', 'napkins', 'menu']` — MUST update to: `const nonOtherTypes = ['call_waiter', 'bill', 'plate', 'napkins', 'utensils', 'clear_table', 'menu'];` (add plate/utensils/clear_table; KEEP menu for backward compat — legacy server requests must still reconcile into requestStates)
- localStorage persistence logic — keep key format `helpdrawer_${currentTableId}`
- pushOverlay/popOverlay integration for Android Back — keep as-is
- Undo core logic (5s delay, pendingQuickSendRef, handlePresetSelect call) — keep; only adapt UI rendering
- `handleCardTap` existing duplicate-tap guard: `if (undoToast?.type === type && undoToast?.tableId === currentTableId) return;` — DO NOT remove this guard
- All code OUTSIDE the Help Drawer section (MenuView, CartView, StickyCartBar, checkout, hall mode, etc.)

## Known-correct fields (verified)
- `activeRequests` = `ticketRows.filter(row => row.isActive)`, `.sentAt` in ms. `activeRequestCount` at ~1947.
- timerTick drives re-renders via ticketRows useMemo deps → urgency/timer auto-update ✅

---

## Fix 1 — Update button set and config constants [MUST-FIX]

### Now
4 preset buttons: `call_waiter`, `bill`, `napkins`, `menu` + separate `other` (full-width).
Grep: `HELP_REQUEST_TYPES = useMemo` (~line 1796)
Grep: `HELP_CARD_LABELS = useMemo` (~line 1800)
Grep: `HELP_COOLDOWN_SECONDS = useMemo` (~line 1799)
Grep: `HELP_CHIPS = useMemo` (~line 1807)

### Should be
6 preset buttons: `call_waiter`, `bill`, `plate`, `napkins`, `utensils`, `clear_table`. Remove `menu` from presets. Keep `other` for "Другой запрос?" secondary link only.

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
Grep `HELP_REQUEST_TYPES` — should contain `plate`, `utensils`, `clear_table`, AND `menu` (with `// legacy` comment).
Grep `nonOtherTypes` at line 2130 — should contain `plate`, `utensils`, `clear_table`, AND `menu`.
Grep `SOS_BUTTONS` — should NOT contain `menu` (not in the grid, only in type sets).
Grep `HELP_CHIPS` in pages/PublicMenu/x.jsx — should be 0 occurrences.

---

## Fix 2 — Add urgency threshold config and helpers [MUST-FIX]

### Now
No urgency thresholds exist.

### Should be
Add constants AFTER `HELP_COOLDOWN_SECONDS` (~line 1799).
Note: useMemo with [] is fine here for consistency with existing HELP_* pattern.

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

### Verification
Grep `HELP_URGENCY_THRESHOLDS` — should exist.

---

## Fix 3 — Rewrite drawer JSX: header + grid + cancel confirm [MUST-FIX]

### JSX Replacement Boundary
Keep: `<Drawer open={isHelpModalOpen}` tag and all its props (~line 4889).
Keep: `<DrawerContent>` opening tag and its className/props (~line 4891-ish).
REPLACE: ALL children INSIDE `<DrawerContent>` — from the first child element after `<DrawerContent>` opening to the last child before `</DrawerContent>` closing tag.
Keep: `</DrawerContent>` and `</Drawer>` closing tags.
**D7 rule**: DrawerContent must NOT have `className="...relative..."` — `relative` on DrawerContent breaks Vaul (drawer won't open). Current className at ~line 4890: `"max-h-[85vh] rounded-t-2xl flex flex-col"` — keep this, do NOT add `relative`.

Grep anchors for replacement block (verified in code):
- Start of children to replace: `<div className="relative">` — this is the actual first child after `<DrawerContent ...>` at line 4891 (confirmed in RELEASE file)
- End of children to replace: just before `</DrawerContent>` (~line 5175)
- Strategy: replace the single `<div className="relative">` element and ALL its children up to `</DrawerContent>` with the new JSX below

### New DrawerContent children (complete, in order):

**STEP 1**: Define `SOS_BUTTONS` array and `handleSosCancel` function in the component body.
**Exact insertion points** (to avoid TDZ errors):
- `SOS_BUTTONS` depends on `HELP_CARD_LABELS` and `HELP_CARD_SHORT_LABELS` → insert AFTER `HELP_CARD_SHORT_LABELS` (new constant from Fix 1, ~line 1813)
- `handleSosCancel` depends on `activeRequests`, `getHelpUrgency`, `handleResolve` → insert AFTER `getHelpTimerStr` (from Fix 2) and AFTER `handleResolve` definition (~line 2300+). Search for `handleResolve = useCallback` to find exact position.

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

{/* SOS v6.0 Button Grid — 3×2, in-place state */}
<div className="grid grid-cols-2 gap-[9px] px-3.5 pt-2.5 pb-2">
  {SOS_BUTTONS.map(btn => {
    const activeRow = activeRequests.find(r => r.type === btn.id);
    const isActive = Boolean(activeRow);
    const sentAt = activeRow?.sentAt;
    const urgency = isActive ? getHelpUrgency(btn.id, sentAt) : 'neutral';
    const timerText = isActive ? getHelpTimerStr(sentAt) : '';

    if (isActive) {
      const hasError = Boolean(activeRow.errorKind);
      // Error state: red border, ⚠ icon, tap = retry via handleRetry(activeRow)
      if (hasError) {
        return (
          <button key={btn.id} onClick={() => handleRetry(activeRow)}
            className="rounded-xl border-2 border-red-400 bg-red-50 p-[11px] min-h-[70px] flex flex-col justify-between select-none active:bg-red-100">
            <span className="text-[13px] font-extrabold text-red-800">{btn.shortLabel}</span>
            <div className="text-[12px] font-bold text-red-600 flex items-center gap-[3px] mt-1">
              <span className="text-[11px]">⚠</span>{tr('help.retry', 'Повторить')}
            </div>
          </button>
        );
      }
      // Normal active state — use static class strings (avoids Tailwind purge)
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

{/* "Другой запрос?" link */}
{!activeRequests.some(r => r.type === 'other') && !showOtherForm && (
  <div className="px-3.5 pb-3">
    <button
      onClick={() => setShowOtherForm(true)}
      className="text-sm text-gray-400 underline underline-offset-2 bg-transparent border-none cursor-pointer"
    >{tr('help.other_request_link', 'Другой запрос?')}</button>
  </div>
)}

{/* Textarea form for custom "other" request — COPY existing send logic from current showOtherForm block (~line 5137-5195) with these changes:
   - Outer wrapper: className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2"
   - textarea: autoFocus, maxLength=120, placeholder=tr('help.other_placeholder', 'Напишите, что нужно…'), className with focus:border-orange-500
   - Send button: className="flex-1 py-[7px] rounded-lg bg-orange-500 text-white text-[13px] font-bold", text=tr('help.send_btn', 'Отправить')
   - Cancel button: className with bg-white border-gray-200, text=tr('common.cancel', 'Отмена')
   - onClick send: KEEP entire existing send logic (undo 5s, setRequestStates with Array.isArray, pendingQuickSendRef, handlePresetSelect). The object fields are: id, status:'sending', sentAt, lastReminderAt:null, reminderCount:0, remindCooldownUntil:null, message:msg, pendingAction:'send', errorKind:null, errorMessage:'', terminalHideAt:null, syncSource:'local'
   - After send: setShowOtherForm(false); setHelpComment('');
*/}
{showOtherForm && (
  /* Render textarea + Отправить/Отмена buttons — adapt existing block (~5137-5195) */
  <div className="mx-3.5 mb-3.5 p-2.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl flex flex-col gap-2">
    {/* textarea + send/cancel buttons — use existing send flow from lines ~5137-5195 */}
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

{/* Error display — generic fallback (per-tile errors handled above; remove old ticketRows gate) */}
{helpSubmitError && (
  <div className="mx-3.5 mb-3 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
    {helpSubmitError}
  </div>
)}
```

### State resets — MANDATORY updates to open/close functions
In `openHelpDrawer` (~line 2264-2274):
- KEEP `setIsTicketExpanded(false)` — harmless dead code, preserves hook safety
- Add `setCancelConfirmType(null);` to reset confirm state on open

In `closeHelpDrawer` (~line 2276-2282):
- KEEP `setIsTicketExpanded(false)` — harmless dead code, preserves hook safety
- Add `setCancelConfirmType(null);` to reset confirm state on close
- Add `setShowOtherForm(false); setHelpComment('');` if not already present

### Should NOT be
No DrawerHeader/DrawerTitle components, no centered title, no MapPin line, no "Мои запросы" / ticket board, no isTicketExpanded/ArrowLeft/ChevronDown, no HELP_CHIPS rendering. Drawer closes via pull-down (Vaul).

### Verification
Open drawer → 6 idle buttons (2-col grid). Tap button → in-place active state (short label + timer + ✕). Neutral/amber ✕ → immediate cancel. Red ✕ → confirm panel. Error tile → tap retries. "Другой запрос?" → textarea. Undo toast 5s.

---

## Fix 4 — Add new i18n keys to BOTH dictionaries [MUST-FIX]

### Now
I18N_FALLBACKS (~line 327) and I18N_FALLBACKS_RU (~line 588) contain old help.* keys.
(Note: I18N_FALLBACKS is at ~line 327, NOT ~476 — actual grep result.)

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

Note: `help.undo` and `help.title` and `help.call_waiter` etc. likely already exist — grep first, add only if absent.

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

### Dead helpers — grep and remove if ALL call sites are in replaced JSX:
Check each: `getHelpWaitLabel`, `getHelpReminderLabel`, `getHelpResolvedLabel`, `getHelpErrorCopy`, `getHelpFreshnessLabel`. For each, grep call sites. If ALL are inside the replaced DrawerContent block (~4891-5175) → remove function definition. If any call site exists outside → keep.
`handleRetry` — KEEP (still used in error-state tiles in the new grid).

### focusHelpRow function — grep first:
Before removing: `grep -n "focusHelpRow" pages/PublicMenu/x.jsx`
- If ALL call sites are in the old ticket board JSX being replaced → remove function definition too
- If any call site remains outside the JSX block → keep function, remove only JSX call sites

### Import cleanup:
Grep each: `ChevronDown`, `ArrowLeft`, `MapPin`, `DrawerHeader`, `DrawerTitle`. If only used in old help drawer JSX → remove from import. `Layers` must remain (napkins button).

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
  7. openHelpDrawer (~line 2264-2274): KEEP setIsTicketExpanded(false), add setCancelConfirmType(null)
  8. closeHelpDrawer (~line 2276-2282): KEEP setIsTicketExpanded(false), add setCancelConfirmType(null), add setShowOtherForm(false)/setHelpComment('')
  9. Post-send callback (~line 2481): remove ticketBoardRef.scrollIntoView, setHighlightedTicket, setTimeout highlight
  10. **Server sync line 2130**: update nonOtherTypes — add plate/utensils/clear_table, KEEP menu (FROZEN exception)
  11. Component body before return: add SOS_BUTTONS array and handleSosCancel function
  12. Import cleanup: check and remove ChevronDown/ArrowLeft/MapPin if unused elsewhere; keep Layers
  13. focusHelpRow: grep call sites; remove function if ALL sites are in replaced JSX block
- DO NOT change: anything outside listed regions. Especially: MenuView, CartView, StickyCartBar, CheckoutView, orders, cart, hall mode, ServiceRequest polling (~2044-2260 except line 2130), HelpFab, useHelpRequests hook

## POST-IMPLEMENTATION CHECKS (all MANDATORY before commit)
**Mobile (375px):** drawer pull-down works, 6-button grid fits without scroll, ✕ target ≥44px, undo toast visible.
**Regression:** FAB opens drawer ✅, badge count ✅, ServiceRequest created after 5s ✅, undo cancels ✅, Android Back closes ✅, localStorage restore ✅, "Другой запрос?" sends with message ✅, urgency auto-updates ✅, red ✕ → confirm ✅, neutral/amber ✕ → immediate ✅, error tile tap → retry ✅.
**FROZEN grep:** `grep -n "HelpFab\|pushOverlay\|helpdrawer_\|ServiceRequest.create\|handlePresetSelect" pages/PublicMenu/x.jsx` — all must exist.

## Implementation Notes
- File: `pages/PublicMenu/x.jsx` (5374 lines as of RELEASE 260407-00)
- **Precondition**: before applying, verify `wc -l pages/PublicMenu/x.jsx` = 5374 (±2). If different, line anchors may have drifted — STOP and report.
- Expected line count after changes: ~5374 ± 150 (removing ticket board ~200 lines, adding new grid ~180 lines, new constants ~35 lines)
- `wc -l` check BEFORE commit: if result < 5200 → ABORT, file likely truncated (KB-095)
- `tr()` for new help.* keys. `t()` for existing undo toast keys (`help.sent_suffix`, `help.undo`).
- Reuse existing: `handleResolve`, `handleCardTap`, `handleRetry`, `Layers` import, `activeRequests`/`activeRequestCount`. DO NOT redefine.
- git add pages/PublicMenu/x.jsx && git commit -m "SOS v6.0: in-place help drawer redesign — 6 buttons, urgency thresholds, cancel confirm"
=== END ===
